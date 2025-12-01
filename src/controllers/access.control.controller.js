import AccessControl from '../models/accesscontrol.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Department from '../models/department.model.js';
import Team from '../models/team.model.js';
import Project from '../models/project.model.js';
import ActivityLog from '../models/activitylog.model.js';
import mongoose from 'mongoose';

const createAccessControl = async (req, res) => {
    console.log('=== CREATE ACCESS CONTROL START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const {
            organizationId,
            userId,
            resourceType,
            resourceId,
            permission,
            accessType,
            inheritedFrom,
            inheritedFromId,
            canDelegate,
            expiresAt,
            notes,
            tags,
            autoGrantRelatedResources
        } = req.body;

        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!organizationId || !userId || !resourceType || !resourceId || !permission) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'organizationId, userId, resourceType, resourceId, and permission are required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        console.log('Organization found:', organization.name);

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Requester is not admin or super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can grant access'
            });
        }
        console.log('Requester has admin privileges');

        console.log('Fetching target user...');
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            console.log('Target user not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }
        console.log('Target user found:', targetUser.email);

        console.log('Verifying target user is organization member...');
        if (!organization.isMember(userId)) {
            console.log('Target user is not a member of organization');
            return res.status(403).json({
                success: false,
                message: 'User is not a member of this organization'
            });
        }

        console.log('Fetching resource metadata...');
        let resourceName = '';
        let resourcePath = '';
        let metadata = {};

        const ResourceModel = mongoose.model(resourceType.charAt(0).toUpperCase() + resourceType.slice(1));
        const resource = await ResourceModel.findById(resourceId);

        if (!resource) {
            console.log('Resource not found:', resourceType, resourceId);
            return res.status(404).json({
                success: false,
                message: `${resourceType} not found`
            });
        }

        resourceName = resource.name || resource.title || resourceType;
        console.log('Resource name:', resourceName);

        if (resource.organizationId) {
            metadata.resourcePath = `/${organization.name}`;
        }
        if (resource.departmentId) {
            const dept = await Department.findById(resource.departmentId);
            if (dept) {
                metadata.department = {
                    departmentId: dept._id,
                    departmentName: dept.name
                };
                resourcePath += `/${dept.name}`;
            }
        }
        if (resource.teamId) {
            const team = await Team.findById(resource.teamId);
            if (team) {
                metadata.team = {
                    teamId: team._id,
                    teamName: team.name
                };
                resourcePath += `/${team.name}`;
            }
        }
        if (resource.projectId || resourceType === 'project') {
            const projectId = resourceType === 'project' ? resourceId : resource.projectId;
            const project = await Project.findById(projectId);
            if (project) {
                metadata.project = {
                    projectId: project._id,
                    projectName: project.name
                };
                resourcePath += `/${project.name}`;
            }
        }

        metadata.resourceName = resourceName;
        metadata.resourcePath = resourcePath || `/${resourceName}`;

        console.log('Checking for existing access control...');
        const existingAccess = await AccessControl.findOne({
            organizationId,
            userId,
            resourceType,
            resourceId,
            isActive: true
        });

        if (existingAccess) {
            console.log('Existing access found, updating permission...');
            existingAccess.updatePermission(permission, requesterId, 'Permission updated by admin');
            existingAccess.metadata = { ...existingAccess.metadata, ...metadata };
            existingAccess.canDelegate = canDelegate || existingAccess.canDelegate;
            existingAccess.expiresAt = expiresAt || existingAccess.expiresAt;
            existingAccess.notes = notes || existingAccess.notes;
            if (tags && tags.length > 0) {
                tags.forEach(tag => existingAccess.addTag(tag));
            }

            await existingAccess.save();
            console.log('Access control updated successfully');

            await ActivityLog.createLog({
                organizationId,
                userId: requesterId,
                action: 'access_updated',
                resourceType: 'accesscontrol',
                resourceId: existingAccess._id,
                resourceName: `Access to ${resourceName}`,
                actionCategory: 'permission',
                severity: 'medium',
                details: `Updated access permission for ${targetUser.email} to ${permission}`,
                metadata
            });

            return res.status(200).json({
                success: true,
                message: 'Access control updated successfully',
                data: existingAccess
            });
        }

        console.log('Creating new access control...');
        const newAccessControl = new AccessControl({
            organizationId,
            userId,
            resourceType,
            resourceId,
            permission,
            grantedBy: requesterId,
            accessType: accessType || 'direct',
            inheritedFrom,
            inheritedFromId,
            canDelegate: canDelegate || false,
            expiresAt,
            notes,
            tags: tags || [],
            metadata
        });

        await newAccessControl.save();
        console.log('Access control created successfully:', newAccessControl._id);

        await ActivityLog.createLog({
            organizationId,
            userId: requesterId,
            action: 'access_granted',
            resourceType: 'accesscontrol',
            resourceId: newAccessControl._id,
            resourceName: `Access to ${resourceName}`,
            actionCategory: 'permission',
            severity: 'medium',
            details: `Granted ${permission} access to ${targetUser.email} for ${resourceType}`,
            metadata
        });

        if (autoGrantRelatedResources && resourceType === 'project') {
            console.log('Auto-granting access to related project resources...');
            await grantProjectRelatedAccess(newAccessControl, requesterId);
        }

        console.log('=== CREATE ACCESS CONTROL SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Access control created successfully',
            data: newAccessControl
        });

    } catch (error) {
        console.error('=== CREATE ACCESS CONTROL ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to create access control',
            error: error.message
        });
    }
};

const grantProjectRelatedAccess = async (projectAccessControl, grantedBy) => {
    console.log('=== GRANT PROJECT RELATED ACCESS START ===');
    console.log('Project Access Control ID:', projectAccessControl._id);

    try {
        const { organizationId, userId, resourceId: projectId, permission } = projectAccessControl;

        console.log('Fetching project details...');
        const Project = mongoose.model('Project');
        const project = await Project.findById(projectId);

        if (!project) {
            console.log('Project not found:', projectId);
            return;
        }

        console.log('Project found:', project.name);
        const relatedResources = [];

        if (project.phases && project.phases.length > 0) {
            console.log('Adding phases:', project.phases.length);
            project.phases.forEach(phaseId => {
                relatedResources.push({
                    resourceType: 'phase',
                    resourceId: phaseId
                });
            });
        }

        if (project.sprints && project.sprints.length > 0) {
            console.log('Adding sprints:', project.sprints.length);
            project.sprints.forEach(sprintId => {
                relatedResources.push({
                    resourceType: 'sprint',
                    resourceId: sprintId
                });
            });
        }

        if (project.folders && project.folders.length > 0) {
            console.log('Adding folders:', project.folders.length);
            project.folders.forEach(folder => {
                relatedResources.push({
                    resourceType: 'folder',
                    resourceId: folder.folderId || folder
                });
            });
        }

        console.log('Total related resources to grant access:', relatedResources.length);

        for (const relatedResource of relatedResources) {
            console.log(`Granting access to ${relatedResource.resourceType}:`, relatedResource.resourceId);

            const existingAccess = await AccessControl.findOne({
                organizationId,
                userId,
                resourceType: relatedResource.resourceType,
                resourceId: relatedResource.resourceId,
                isActive: true
            });

            if (existingAccess) {
                console.log('Access already exists for:', relatedResource.resourceType);
                continue;
            }

            const ResourceModel = mongoose.model(
                relatedResource.resourceType.charAt(0).toUpperCase() + relatedResource.resourceType.slice(1)
            );
            const resource = await ResourceModel.findById(relatedResource.resourceId);

            if (!resource) {
                console.log('Related resource not found:', relatedResource.resourceType, relatedResource.resourceId);
                continue;
            }

            const relatedAccessControl = new AccessControl({
                organizationId,
                userId,
                resourceType: relatedResource.resourceType,
                resourceId: relatedResource.resourceId,
                permission,
                grantedBy,
                accessType: 'inherited',
                inheritedFrom: 'project',
                inheritedFromId: projectId,
                isInherited: true,
                metadata: {
                    project: {
                        projectId: projectId,
                        projectName: project.name
                    },
                    resourceName: resource.name || resource.title || relatedResource.resourceType
                }
            });

            await relatedAccessControl.save();
            console.log(`Access granted to ${relatedResource.resourceType}:`, relatedAccessControl._id);
        }

        console.log('=== GRANT PROJECT RELATED ACCESS SUCCESS ===');

    } catch (error) {
        console.error('=== GRANT PROJECT RELATED ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    }
};

const getUserAccessList = async (req, res) => {
    console.log('=== GET USER ACCESS LIST START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Query Params:', req.query);

    try {
        const { userId, organizationId } = req.query;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!userId || !organizationId) {
            console.log('Validation failed: Missing userId or organizationId');
            return res.status(400).json({
                success: false,
                message: 'userId and organizationId are required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);
        const isSelf = requesterId.toString() === userId.toString();

        if (!isSuperAdmin && !isAdmin && !isSelf) {
            console.log('Permission denied: Not authorized to view this user access');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this user access list'
            });
        }

        console.log('Fetching user access controls...');
        const accessControls = await AccessControl.find({
            userId,
            organizationId,
            isActive: true
        })
            .populate('grantedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        console.log('Access controls found:', accessControls.length);

        const groupedAccess = {
            projects: [],
            departments: [],
            teams: [],
            phases: [],
            sprints: [],
            folders: [],
            documents: [],
            sheets: [],
            slides: [],
            bugs: [],
            requirements: [],
            other: []
        };

        console.log('Grouping access controls by resource type...');
        accessControls.forEach(access => {
            const accessData = {
                _id: access._id,
                resourceType: access.resourceType,
                resourceId: access.resourceId,
                permission: access.permission,
                accessType: access.accessType,
                isInherited: access.isInherited,
                inheritedFrom: access.inheritedFrom,
                canDelegate: access.canDelegate,
                grantedAt: access.grantedAt,
                grantedBy: access.grantedBy,
                expiresAt: access.expiresAt,
                metadata: access.metadata,
                tags: access.tags
            };

            if (groupedAccess[access.resourceType + 's']) {
                groupedAccess[access.resourceType + 's'].push(accessData);
            } else if (groupedAccess[access.resourceType]) {
                groupedAccess[access.resourceType].push(accessData);
            } else {
                groupedAccess.other.push(accessData);
            }
        });

        console.log('=== GET USER ACCESS LIST SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'User access list retrieved successfully',
            data: {
                total: accessControls.length,
                groupedAccess
            }
        });

    } catch (error) {
        console.error('=== GET USER ACCESS LIST ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve user access list',
            error: error.message
        });
    }
};

const getResourceAccessList = async (req, res) => {
    console.log('=== GET RESOURCE ACCESS LIST START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Query Params:', req.query);

    try {
        const { resourceId, resourceType, organizationId } = req.query;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!resourceId || !resourceType || !organizationId) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'resourceId, resourceType, and organizationId are required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can view resource access list');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can view resource access list'
            });
        }

        console.log('Fetching resource access controls...');
        const accessControls = await AccessControl.find({
            resourceId,
            resourceType,
            organizationId,
            isActive: true
        })
            .populate('userId', 'firstName lastName email profileImage')
            .populate('grantedBy', 'firstName lastName email')
            .sort({ permission: -1, createdAt: -1 });

        console.log('Access controls found:', accessControls.length);

        const groupedByPermission = {
            admin: [],
            edit: [],
            view: []
        };

        console.log('Grouping access controls by permission level...');
        accessControls.forEach(access => {
            const accessData = {
                _id: access._id,
                user: access.userId,
                permission: access.permission,
                accessType: access.accessType,
                isInherited: access.isInherited,
                inheritedFrom: access.inheritedFrom,
                canDelegate: access.canDelegate,
                grantedAt: access.grantedAt,
                grantedBy: access.grantedBy,
                expiresAt: access.expiresAt,
                lastAccessedAt: access.lastAccessedAt,
                accessCount: access.accessCount,
                tags: access.tags
            };

            groupedByPermission[access.permission].push(accessData);
        });

        console.log('=== GET RESOURCE ACCESS LIST SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Resource access list retrieved successfully',
            data: {
                total: accessControls.length,
                groupedByPermission,
                allAccess: accessControls
            }
        });

    } catch (error) {
        console.error('=== GET RESOURCE ACCESS LIST ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve resource access list',
            error: error.message
        });
    }
};

const updateAccessPermission = async (req, res) => {
    console.log('=== UPDATE ACCESS PERMISSION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { accessId } = req.params;
        const { permission, reason, expiresAt, canDelegate, notes, tags } = req.body;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!permission) {
            console.log('Validation failed: Missing permission');
            return res.status(400).json({
                success: false,
                message: 'Permission is required'
            });
        }

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(accessControl.organizationId);
        if (!organization) {
            console.log('Organization not found:', accessControl.organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can update access permissions');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can update access permissions'
            });
        }

        console.log('Updating access permission...');
        accessControl.updatePermission(permission, requesterId, reason || 'Permission updated');

        if (expiresAt !== undefined) {
            accessControl.expiresAt = expiresAt;
        }
        if (canDelegate !== undefined) {
            accessControl.canDelegate = canDelegate;
        }
        if (notes) {
            accessControl.notes = notes;
        }
        if (tags && tags.length > 0) {
            accessControl.tags = [...new Set([...accessControl.tags, ...tags])];
        }

        await accessControl.save();
        console.log('Access permission updated successfully');

        await ActivityLog.createLog({
            organizationId: accessControl.organizationId,
            userId: requesterId,
            action: 'permission_updated',
            resourceType: 'accesscontrol',
            resourceId: accessControl._id,
            actionCategory: 'permission',
            severity: 'medium',
            details: `Updated permission to ${permission}`,
            metadata: accessControl.metadata
        });

        console.log('=== UPDATE ACCESS PERMISSION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Access permission updated successfully',
            data: accessControl
        });

    } catch (error) {
        console.error('=== UPDATE ACCESS PERMISSION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to update access permission',
            error: error.message
        });
    }
};

const revokeAccess = async (req, res) => {
    console.log('=== REVOKE ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { accessId } = req.params;
        const { reason, revokeRelatedAccess } = req.body;
        const requesterId = req.user._id;

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(accessControl.organizationId);
        if (!organization) {
            console.log('Organization not found:', accessControl.organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can revoke access');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can revoke access'
            });
        }

        console.log('Revoking access...');
        const revoked = accessControl.revoke(requesterId, reason || 'Access revoked by admin');

        if (!revoked) {
            console.log('Access already revoked');
            return res.status(400).json({
                success: false,
                message: 'Access is already revoked'
            });
        }

        await accessControl.save();
        console.log('Access revoked successfully');

        await ActivityLog.createLog({
            organizationId: accessControl.organizationId,
            userId: requesterId,
            action: 'access_revoked',
            resourceType: 'accesscontrol',
            resourceId: accessControl._id,
            actionCategory: 'permission',
            severity: 'high',
            details: reason || 'Access revoked',
            metadata: accessControl.metadata
        });

        if (revokeRelatedAccess && accessControl.resourceType === 'project') {
            console.log('Revoking related project access...');
            await revokeProjectRelatedAccess(accessControl, requesterId, reason);
        }

        console.log('=== REVOKE ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Access revoked successfully',
            data: accessControl
        });

    } catch (error) {
        console.error('=== REVOKE ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to revoke access',
            error: error.message
        });
    }
};

const revokeProjectRelatedAccess = async (projectAccessControl, revokedBy, reason) => {
    console.log('=== REVOKE PROJECT RELATED ACCESS START ===');
    console.log('Project Access Control ID:', projectAccessControl._id);

    try {
        const { organizationId, userId, resourceId: projectId } = projectAccessControl;

        console.log('Finding related inherited access...');
        const relatedAccess = await AccessControl.find({
            organizationId,
            userId,
            inheritedFrom: 'project',
            inheritedFromId: projectId,
            isActive: true
        });

        console.log('Related access found:', relatedAccess.length);

        for (const access of relatedAccess) {
            console.log(`Revoking ${access.resourceType} access:`, access._id);
            access.revoke(revokedBy, reason || 'Parent project access revoked');
            await access.save();
        }

        console.log('=== REVOKE PROJECT RELATED ACCESS SUCCESS ===');

    } catch (error) {
        console.error('=== REVOKE PROJECT RELATED ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    }
};

const restoreAccess = async (req, res) => {
    console.log('=== RESTORE ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { accessId } = req.params;
        const { reason } = req.body;
        const requesterId = req.user._id;

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(accessControl.organizationId);
        if (!organization) {
            console.log('Organization not found:', accessControl.organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can restore access');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can restore access'
            });
        }

        console.log('Restoring access...');
        const restored = accessControl.restore(requesterId, reason || 'Access restored by admin');

        if (!restored) {
            console.log('Access cannot be restored');
            return res.status(400).json({
                success: false,
                message: 'Access cannot be restored (either not revoked or expired)'
            });
        }

        await accessControl.save();
        console.log('Access restored successfully');

        await ActivityLog.createLog({
            organizationId: accessControl.organizationId,
            userId: requesterId,
            action: 'access_restored',
            resourceType: 'accesscontrol',
            resourceId: accessControl._id,
            actionCategory: 'permission',
            severity: 'medium',
            details: reason || 'Access restored',
            metadata: accessControl.metadata
        });

        console.log('=== RESTORE ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Access restored successfully',
            data: accessControl
        });

    } catch (error) {
        console.error('=== RESTORE ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to restore access',
            error: error.message
        });
    }
};

const delegateAccess = async (req, res) => {
    console.log('=== DELEGATE ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { accessId } = req.params;
        const { targetUserId, permission, expiresAt } = req.body;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!targetUserId || !permission) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'targetUserId and permission are required'
            });
        }

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Verifying delegation permission...');
        if (!accessControl.canDelegate) {
            console.log('Delegation not allowed for this access control');
            return res.status(403).json({
                success: false,
                message: 'This access cannot be delegated'
            });
        }

        if (accessControl.userId.toString() !== requesterId.toString()) {
            console.log('Permission denied: Only access owner can delegate');
            return res.status(403).json({
                success: false,
                message: 'Only the access owner can delegate access'
            });
        }
        console.log('Fetching target user...');
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            console.log('Target user not found:', targetUserId);
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(accessControl.organizationId);
        if (!organization || !organization.isMember(targetUserId)) {
            console.log('Target user is not organization member');
            return res.status(403).json({
                success: false,
                message: 'Target user is not a member of the organization'
            });
        }

        console.log('Delegating access...');
        const delegated = accessControl.delegateAccess(
            targetUserId,
            permission,
            requesterId,
            expiresAt || null
        );

        if (!delegated) {
            console.log('Delegation failed: Permission level too high');
            return res.status(400).json({
                success: false,
                message: 'Cannot delegate permission higher than your own'
            });
        }

        await accessControl.save();
        console.log('Access delegated successfully');

        await ActivityLog.createLog({
            organizationId: accessControl.organizationId,
            userId: requesterId,
            action: 'access_delegated',
            resourceType: 'accesscontrol',
            resourceId: accessControl._id,
            actionCategory: 'permission',
            severity: 'medium',
            details: `Delegated ${permission} access to ${targetUser.email}`,
            metadata: accessControl.metadata
        });

        console.log('=== DELEGATE ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Access delegated successfully',
            data: accessControl
        });

    } catch (error) {
        console.error('=== DELEGATE ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to delegate access',
            error: error.message
        });
    }
};
const revokeDelegation = async (req, res) => {
    console.log('=== REVOKE DELEGATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    try {
        const { accessId } = req.params;
        const { targetUserId } = req.body;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!targetUserId) {
            console.log('Validation failed: Missing targetUserId');
            return res.status(400).json({
                success: false,
                message: 'targetUserId is required'
            });
        }

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Verifying revocation permission...');
        if (accessControl.userId.toString() !== requesterId.toString()) {
            const organization = await Organization.findById(accessControl.organizationId);
            const isSuperAdmin = organization.isSuperAdmin(requesterId);
            const isAdmin = organization.isAdmin(requesterId);

            if (!isSuperAdmin && !isAdmin) {
                console.log('Permission denied: Not authorized to revoke delegation');
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to revoke this delegation'
                });
            }
        }

        console.log('Revoking delegation...');
        const revoked = accessControl.revokeDelegation(targetUserId, requesterId);

        if (!revoked) {
            console.log('Delegation not found');
            return res.status(404).json({
                success: false,
                message: 'Delegation not found for this user'
            });
        }

        await accessControl.save();
        console.log('Delegation revoked successfully');

        await ActivityLog.createLog({
            organizationId: accessControl.organizationId,
            userId: requesterId,
            action: 'delegation_revoked',
            resourceType: 'accesscontrol',
            resourceId: accessControl._id,
            actionCategory: 'permission',
            severity: 'medium',
            details: `Revoked delegation for user ${targetUserId}`,
            metadata: accessControl.metadata
        });

        console.log('=== REVOKE DELEGATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Delegation revoked successfully',
            data: accessControl
        });

    } catch (error) {
        console.error('=== REVOKE DELEGATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to revoke delegation',
            error: error.message
        });
    }
};
const checkUserAccess = async (req, res) => {
    console.log('=== CHECK USER ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Query Params:', req.query);
    try {
        const { userId, resourceId, resourceType, requiredPermission } = req.query;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!userId || !resourceId || !resourceType) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'userId, resourceId, and resourceType are required'
            });
        }

        console.log('Fetching user access...');
        const accessControl = await AccessControl.findOne({
            userId,
            resourceId,
            resourceType,
            isActive: true
        });

        if (!accessControl) {
            console.log('No access found for user');
            return res.status(200).json({
                success: true,
                message: 'No access found',
                data: {
                    hasAccess: false,
                    permission: null
                }
            });
        }

        console.log('Checking permission level...');
        const hasPermission = requiredPermission
            ? accessControl.hasPermission(requiredPermission)
            : true;

        console.log('Permission check result:', hasPermission);

        console.log('=== CHECK USER ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Access check completed',
            data: {
                hasAccess: true,
                hasRequiredPermission: hasPermission,
                permission: accessControl.permission,
                accessType: accessControl.accessType,
                isInherited: accessControl.isInherited,
                canDelegate: accessControl.canDelegate,
                expiresAt: accessControl.expiresAt,
                isExpired: accessControl.isExpired
            }
        });

    } catch (error) {
        console.error('=== CHECK USER ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to check user access',
            error: error.message
        });
    }
};
const bulkGrantAccess = async (req, res) => {
    console.log('=== BULK GRANT ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    try {
        const { organizationId, userIds, resourceType, resourceId, permission, expiresAt } = req.body;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!organizationId || !userIds || !Array.isArray(userIds) || !resourceType || !resourceId || !permission) {
            console.log('Validation failed: Missing required fields or invalid userIds');
            return res.status(400).json({
                success: false,
                message: 'organizationId, userIds (array), resourceType, resourceId, and permission are required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can bulk grant access');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can bulk grant access'
            });
        }

        console.log('Processing bulk access grant for', userIds.length, 'users...');
        const results = {
            success: [],
            failed: [],
            updated: []
        };

        for (const userId of userIds) {
            try {
                console.log('Processing user:', userId);

                const user = await User.findById(userId);
                if (!user || !organization.isMember(userId)) {
                    console.log('User not found or not member:', userId);
                    results.failed.push({
                        userId,
                        reason: 'User not found or not a member of organization'
                    });
                    continue;
                }

                const existingAccess = await AccessControl.findOne({
                    organizationId,
                    userId,
                    resourceType,
                    resourceId,
                    isActive: true
                });

                if (existingAccess) {
                    console.log('Updating existing access for user:', userId);
                    existingAccess.updatePermission(permission, requesterId, 'Bulk access update');
                    if (expiresAt) existingAccess.expiresAt = expiresAt;
                    await existingAccess.save();
                    results.updated.push({ userId, accessId: existingAccess._id });
                } else {
                    console.log('Creating new access for user:', userId);
                    const newAccess = new AccessControl({
                        organizationId,
                        userId,
                        resourceType,
                        resourceId,
                        permission,
                        grantedBy: requesterId,
                        accessType: 'direct',
                        expiresAt: expiresAt || null
                    });
                    await newAccess.save();
                    results.success.push({ userId, accessId: newAccess._id });
                }

            } catch (userError) {
                console.error('Error processing user:', userId, userError.message);
                results.failed.push({
                    userId,
                    reason: userError.message
                });
            }
        }

        console.log('Bulk grant results:', results);

        await ActivityLog.createLog({
            organizationId,
            userId: requesterId,
            action: 'access_granted',
            resourceType: 'accesscontrol',
            resourceId: null,
            actionCategory: 'permission',
            severity: 'medium',
            details: `Bulk granted ${permission} access to ${results.success.length + results.updated.length} users`
        });

        console.log('=== BULK GRANT ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Bulk access grant completed',
            data: results
        });

    } catch (error) {
        console.error('=== BULK GRANT ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to bulk grant access',
            error: error.message
        });
    }
};
const bulkRevokeAccess = async (req, res) => {
    console.log('=== BULK REVOKE ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    try {
        const { organizationId, accessIds, reason } = req.body;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!organizationId || !accessIds || !Array.isArray(accessIds)) {
            console.log('Validation failed: Missing required fields or invalid accessIds');
            return res.status(400).json({
                success: false,
                message: 'organizationId and accessIds (array) are required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can bulk revoke access');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can bulk revoke access'
            });
        }

        console.log('Processing bulk access revocation for', accessIds.length, 'access controls...');
        const results = {
            success: [],
            failed: []
        };

        for (const accessId of accessIds) {
            try {
                console.log('Processing access control:', accessId);

                const accessControl = await AccessControl.findById(accessId);
                if (!accessControl || accessControl.organizationId.toString() !== organizationId.toString()) {
                    console.log('Access control not found or belongs to different organization:', accessId);
                    results.failed.push({
                        accessId,
                        reason: 'Access control not found or invalid'
                    });
                    continue;
                }

                const revoked = accessControl.revoke(requesterId, reason || 'Bulk access revocation');
                if (revoked) {
                    await accessControl.save();
                    results.success.push({ accessId });
                    console.log('Access revoked successfully:', accessId);
                } else {
                    results.failed.push({
                        accessId,
                        reason: 'Already revoked'
                    });
                }

            } catch (accessError) {
                console.error('Error processing access control:', accessId, accessError.message);
                results.failed.push({
                    accessId,
                    reason: accessError.message
                });
            }
        }

        console.log('Bulk revoke results:', results);

        await ActivityLog.createLog({
            organizationId,
            userId: requesterId,
            action: 'access_revoked',
            resourceType: 'accesscontrol',
            resourceId: null,
            actionCategory: 'permission',
            severity: 'high',
            details: `Bulk revoked ${results.success.length} access controls`
        });

        console.log('=== BULK REVOKE ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Bulk access revocation completed',
            data: results
        });

    } catch (error) {
        console.error('=== BULK REVOKE ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to bulk revoke access',
            error: error.message
        });
    }
};
const cleanupExpiredAccess = async (req, res) => {
    console.log('=== CLEANUP EXPIRED ACCESS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Query Params:', req.query);
    try {
        const { organizationId } = req.query;
        const requesterId = req.user._id;

        console.log('Validating required fields...');
        if (!organizationId) {
            console.log('Validation failed: Missing organizationId');
            return res.status(400).json({
                success: false,
                message: 'organizationId is required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            console.log('Organization not found:', organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);

        if (!isSuperAdmin && !isAdmin) {
            console.log('Permission denied: Only admins can cleanup expired access');
            return res.status(403).json({
                success: false,
                message: 'Only super admins and admins can cleanup expired access'
            });
        }

        console.log('Cleaning up expired access...');
        const result = await AccessControl.revokeExpiredAccess(organizationId);

        console.log('Cleanup result:', result);

        await ActivityLog.createLog({
            organizationId,
            userId: requesterId,
            action: 'access_expired',
            resourceType: 'system',
            resourceId: null,
            actionCategory: 'system',
            severity: 'low',
            details: `Cleaned up ${result.modifiedCount} expired access controls`
        });

        console.log('=== CLEANUP EXPIRED ACCESS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Expired access cleaned up successfully',
            data: {
                cleanedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('=== CLEANUP EXPIRED ACCESS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to cleanup expired access',
            error: error.message
        });
    }
};
const getAccessAuditLog = async (req, res) => {
    console.log('=== GET ACCESS AUDIT LOG START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Access Control ID:', req.params.accessId);
    console.log('Query Params:', req.query);
    try {
        const { accessId } = req.params;
        const { limit } = req.query;
        const requesterId = req.user._id;

        console.log('Fetching access control...');
        const accessControl = await AccessControl.findById(accessId);
        if (!accessControl) {
            console.log('Access control not found:', accessId);
            return res.status(404).json({
                success: false,
                message: 'Access control not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(accessControl.organizationId);
        if (!organization) {
            console.log('Organization not found:', accessControl.organizationId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking requester permissions...');
        const isSuperAdmin = organization.isSuperAdmin(requesterId);
        const isAdmin = organization.isAdmin(requesterId);
        const isOwner = accessControl.userId.toString() === requesterId.toString();

        if (!isSuperAdmin && !isAdmin && !isOwner) {
            console.log('Permission denied: Not authorized to view audit log');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this audit log'
            });
        }

        console.log('Retrieving audit history...');
        const auditHistory = accessControl.getAuditHistory(limit ? parseInt(limit) : 50);

        console.log('Audit log entries:', auditHistory.length);

        console.log('=== GET ACCESS AUDIT LOG SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Audit log retrieved successfully',
            data: {
                accessId: accessControl._id,
                auditLog: auditHistory,
                total: auditHistory.length
            }
        });

    } catch (error) {
        console.error('=== GET ACCESS AUDIT LOG ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit log',
            error: error.message
        });
    }
};
export {
    createAccessControl,
    getUserAccessList,
    getResourceAccessList,
    updateAccessPermission,
    revokeAccess,
    restoreAccess,
    delegateAccess,
    revokeDelegation,
    checkUserAccess,
    bulkGrantAccess,
    bulkRevokeAccess,
    cleanupExpiredAccess,
    getAccessAuditLog
};