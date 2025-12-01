import Phase from '../models/phase.model.js';
import Project from '../models/project.model.js';
import AccessControl from '../models/accessControl.model.js';
import ActivityLog from '../models/activityLog.model.js';
import Sprint from '../models/sprint.model.js';
import Folder from '../models/folder.model.js';
import mongoose from 'mongoose';

export const createPhase = async (req, res) => {
    try {
        console.log('Creating phase with user:', req.user._id);
        const { name, description, projectId, parentPhaseId, phaseNumber, status, priority, startDate, endDate } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', projectId);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin' || project.isAdmin(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: projectId,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have permission to create phase');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const phaseCount = await Phase.countDocuments({ projectId, organizationId: req.user.organizationId });
        const phaseSerialNumber = `PHS-${String(phaseCount + 1).padStart(6, '0')}`;

        const phase = new Phase({
            name,
            description,
            phaseSerialNumber,
            organizationId: req.user.organizationId,
            projectId,
            parentPhaseId: parentPhaseId || null,
            phaseNumber,
            status: status || 'planned',
            priority: priority || 'medium',
            startDate,
            endDate,
            owner: req.user._id,
            metadata: {
                projectName: project.name
            }
        });

        phase.assignedTo.push({
            userId: req.user._id,
            assignedBy: req.user._id,
            role: 'owner'
        });

        await phase.save();
        console.log('Phase created successfully:', phase._id);

        const projectAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: 'project',
            resourceId: projectId,
            isActive: true
        });

        const accessControl = new AccessControl({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: 'phase',
            resourceId: phase._id,
            permission: 'admin',
            grantedBy: req.user._id,
            accessType: projectAccess ? 'inherited' : 'direct',
            inheritedFrom: projectAccess ? 'project' : null,
            inheritedFromId: projectAccess ? projectId : null,
            isInherited: projectAccess ? true : false,
            metadata: {
                resourceName: phase.name,
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        await accessControl.save();
        console.log('Access control created for phase owner');

        project.addPhase(phase._id);
        await project.save();

        if (parentPhaseId) {
            const parentPhase = await Phase.findById(parentPhaseId);
            if (parentPhase) {
                parentPhase.addSubPhase(phase._id);
                await parentPhase.save();
                console.log('Added phase to parent phase:', parentPhaseId);
            }
        }

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_created',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Phase ${phase.name} created`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Phase created successfully',
            data: phase
        });
    } catch (error) {
        console.log('Error creating phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhases = async (req, res) => {
    try {
        console.log('Fetching phases for user:', req.user._id);
        const { projectId, parentPhaseId, status } = req.query;

        let query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (projectId) {
            query.projectId = projectId;
        }

        if (parentPhaseId) {
            query.parentPhaseId = parentPhaseId === 'null' ? null : parentPhaseId;
        }

        if (status) {
            query.status = status;
        }

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                isActive: true
            }).select('resourceId');

            const accessiblePhaseIds = accessControls.map(ac => ac.resourceId);
            query.$or = [
                { owner: req.user._id },
                { 'assignedTo.userId': req.user._id },
                { _id: { $in: accessiblePhaseIds } }
            ];
        }

        const phases = await Phase.find(query)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('parentPhaseId', 'name phaseNumber')
            .sort({ phaseNumber: 1, createdAt: -1 });

        console.log('Phases fetched successfully, count:', phases.length);

        res.status(200).json({
            success: true,
            count: phases.length,
            data: phases
        });
    } catch (error) {
        console.log('Error fetching phases:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhaseById = async (req, res) => {
    try {
        console.log('Fetching phase by ID:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email profileImage')
            .populate('assignedTo.userId', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('parentPhaseId', 'name phaseNumber');

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            phase.isOwner(req.user._id) ||
            phase.isAssigned(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access to phase:', req.params.id);
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        console.log('Phase fetched successfully');

        res.status(200).json({
            success: true,
            data: phase
        });
    } catch (error) {
        console.log('Error fetching phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePhase = async (req, res) => {
    try {
        console.log('Updating phase:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const allowedUpdates = ['name', 'description', 'status', 'priority', 'startDate', 'endDate', 'progress', 'notes', 'tags'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        Object.assign(phase, updates);
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Phase updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_updated',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Phase ${phase.name} updated`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phase updated successfully',
            data: phase
        });
    } catch (error) {
        console.log('Error updating phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePhase = async (req, res) => {
    try {
        console.log('Deleting phase:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasDeleteAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasDeleteAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('admin')) {
                console.log('User does not have delete access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        phase.softDelete(req.user._id);
        await phase.save();

        const project = await Project.findById(phase.projectId);
        if (project) {
            project.removePhase(phase._id);
            await project.save();
        }

        console.log('Phase soft deleted successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_deleted',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Phase ${phase.name} deleted`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phase deleted successfully'
        });
    } catch (error) {
        console.log('Error deleting phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const grantPhaseAccess = async (req, res) => {
    try {
        console.log('Granting phase access:', req.params.id);
        const { userId, permission } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const existingAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'phase',
            resourceId: phase._id
        });

        if (existingAccess) {
            existingAccess.updatePermission(permission, req.user._id);
            await existingAccess.save();
            console.log('Access updated for user:', userId);
        } else {
            const accessControl = new AccessControl({
                organizationId: req.user.organizationId,
                userId: userId,
                resourceType: 'phase',
                resourceId: phase._id,
                permission: permission,
                grantedBy: req.user._id,
                accessType: 'direct',
                isInherited: false,
                metadata: {
                    resourceName: phase.name
                }
            });

            await accessControl.save();
            console.log('Access granted to user:', userId);
        }

        phase.addAssignedUser(userId, req.user._id, 'contributor');
        await phase.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_granted',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'access',
            severity: 'info',
            details: `Access granted to user with ${permission} permission`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Access granted successfully'
        });
    } catch (error) {
        console.log('Error granting access:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const revokePhaseAccess = async (req, res) => {
    try {
        console.log('Revoking phase access:', req.params.id);
        const { userId } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const accessControl = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'phase',
            resourceId: phase._id
        });

        if (accessControl) {
            accessControl.revoke(req.user._id, 'Access revoked by admin');
            await accessControl.save();
            console.log('Access revoked for user:', userId);
        }

        phase.removeAssignedUser(userId);
        await phase.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_revoked',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'access',
            severity: 'medium',
            details: `Access revoked for user`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Access revoked successfully'
        });
    } catch (error) {
        console.log('Error revoking access:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhaseTree = async (req, res) => {
    try {
        console.log('Fetching phase tree:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        }).populate('owner', 'firstName lastName email');

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const sprints = await Sprint.find({
            phaseId: phase._id,
            isDeleted: false,
            parentSprintId: null
        }).select('_id name slug sprintNumber status priority startDate endDate progress hierarchyLevel');

        const folders = await Folder.find({
            phaseId: phase._id,
            isDeleted: false,
            parentFolderId: null
        }).select('_id name slug folderType visibility status hierarchyLevel statistics');

        const subPhases = await Phase.find({
            parentPhaseId: phase._id,
            isDeleted: false
        }).select('_id name slug phaseNumber status priority startDate endDate progress hierarchyLevel');

        const tree = {
            phase: {
                id: phase._id,
                name: phase.name,
                phaseNumber: phase.phaseNumber,
                status: phase.status,
                priority: phase.priority,
                progress: phase.progress,
                owner: phase.owner
            },
            subPhases: subPhases,
            sprints: sprints,
            folders: folders,
            statistics: phase.statistics
        };

        console.log('Phase tree fetched successfully');

        res.status(200).json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.log('Error fetching phase tree:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhaseHierarchy = async (req, res) => {
    try {
        console.log('Fetching phase hierarchy:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const buildHierarchy = async (phaseId, level = 0) => {
            const currentPhase = await Phase.findById(phaseId).select('_id name phaseNumber status priority hierarchyLevel childPhases');

            if (!currentPhase) return null;

            const children = [];
            for (const childId of currentPhase.childPhases) {
                const child = await buildHierarchy(childId, level + 1);
                if (child) children.push(child);
            }

            return {
                id: currentPhase._id,
                name: currentPhase.name,
                phaseNumber: currentPhase.phaseNumber,
                level: level,
                hierarchyLevel: currentPhase.hierarchyLevel,
                children: children
            };
        };

        const hierarchy = await buildHierarchy(phase._id);

        console.log('Phase hierarchy fetched successfully');

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.log('Error fetching phase hierarchy:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const searchPhases = async (req, res) => {
    try {
        console.log('Searching phases for user:', req.user._id);
        const { query, projectId, status, priority, startDate, endDate, tags, limit = 20, skip = 0 } = req.query;

        let searchQuery = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (query) {
            searchQuery.$text = { $search: query };
        }

        if (projectId) {
            searchQuery.projectId = projectId;
        }

        if (status) {
            searchQuery.status = status;
        }

        if (priority) {
            searchQuery.priority = priority;
        }

        if (startDate || endDate) {
            searchQuery.startDate = {};
            if (startDate) searchQuery.startDate.$gte = new Date(startDate);
            if (endDate) searchQuery.startDate.$lte = new Date(endDate);
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            searchQuery.tags = { $in: tagArray };
        }

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                isActive: true
            }).select('resourceId');

            const accessiblePhaseIds = accessControls.map(ac => ac.resourceId);
            searchQuery.$or = [
                { owner: req.user._id },
                { 'assignedTo.userId': req.user._id },
                { _id: { $in: accessiblePhaseIds } }
            ];
        }

        const phases = await Phase.find(searchQuery)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('parentPhaseId', 'name phaseNumber')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await Phase.countDocuments(searchQuery);

        console.log('Phases searched successfully, count:', phases.length);

        res.status(200).json({
            success: true,
            count: phases.length,
            total: total,
            data: phases
        });
    } catch (error) {
        console.log('Error searching phases:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const filterPhases = async (req, res) => {
    try {
        console.log('Filtering phases for user:', req.user._id);
        const {
            projectId,
            status,
            priority,
            owner,
            isOverdue,
            progressMin,
            progressMax,
            hierarchyLevel,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limit = 50,
            skip = 0
        } = req.query;

        let filterQuery = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (projectId) {
            filterQuery.projectId = projectId;
        }

        if (status) {
            const statusArray = Array.isArray(status) ? status : status.split(',');
            filterQuery.status = { $in: statusArray };
        }

        if (priority) {
            const priorityArray = Array.isArray(priority) ? priority : priority.split(',');
            filterQuery.priority = { $in: priorityArray };
        }

        if (owner) {
            filterQuery.owner = owner;
        }

        if (progressMin !== undefined || progressMax !== undefined) {
            filterQuery.progress = {};
            if (progressMin !== undefined) filterQuery.progress.$gte = parseInt(progressMin);
            if (progressMax !== undefined) filterQuery.progress.$lte = parseInt(progressMax);
        }

        if (hierarchyLevel !== undefined) {
            filterQuery.hierarchyLevel = parseInt(hierarchyLevel);
        }

        if (isOverdue === 'true') {
            filterQuery.endDate = { $lt: new Date() };
            filterQuery.status = { $nin: ['completed', 'cancelled'] };
        }

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                isActive: true
            }).select('resourceId');

            const accessiblePhaseIds = accessControls.map(ac => ac.resourceId);
            filterQuery.$or = [
                { owner: req.user._id },
                { 'assignedTo.userId': req.user._id },
                { _id: { $in: accessiblePhaseIds } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const phases = await Phase.find(filterQuery)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('parentPhaseId', 'name phaseNumber')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Phase.countDocuments(filterQuery);

        console.log('Phases filtered successfully, count:', phases.length);

        res.status(200).json({
            success: true,
            count: phases.length,
            total: total,
            data: phases
        });
    } catch (error) {
        console.log('Error filtering phases:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const archivePhase = async (req, res) => {
    try {
        console.log('Archiving phase:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasAdminAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('admin')) {
                console.log('User does not have admin access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        phase.status = 'cancelled';
        phase.isActive = false;
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Phase archived successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_archived',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Phase ${phase.name} archived`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phase archived successfully',
            data: phase
        });
    } catch (error) {
        console.log('Error archiving phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const restorePhase = async (req, res) => {
    try {
        console.log('Restoring phase:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: true
        });

        if (!phase) {
            console.log('Deleted phase not found:', req.params.id);
            return res.status(404).json({ message: 'Deleted phase not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin';

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        phase.restore();
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        const project = await Project.findById(phase.projectId);
        if (project) {
            project.addPhase(phase._id);
            await project.save();
        }

        console.log('Phase restored successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_restored',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Phase ${phase.name} restored`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phase restored successfully',
            data: phase
        });
    } catch (error) {
        console.log('Error restoring phase:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePhaseStatus = async (req, res) => {
    try {
        console.log('Updating phase status:', req.params.id);
        const { status } = req.body;

        if (!['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const oldStatus = phase.status;

        switch (status) {
            case 'in_progress':
                phase.startPhase();
                break;
            case 'completed':
                phase.completePhase();
                break;
            case 'on_hold':
                phase.holdPhase();
                break;
            case 'cancelled':
                phase.cancelPhase();
                break;
            default:
                phase.status = status;
        }

        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Phase status updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_status_changed',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'status',
            severity: 'info',
            details: `Phase status changed from ${oldStatus} to ${status}`,
            changes: {
                before: { status: oldStatus },
                after: { status: status }
            },
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phase status updated successfully',
            data: phase
        });
    } catch (error) {
        console.log('Error updating phase status:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const bulkUpdatePhases = async (req, res) => {
    try {
        console.log('Bulk updating phases');
        const { phaseIds, updates } = req.body;

        if (!Array.isArray(phaseIds) || phaseIds.length === 0) {
            return res.status(400).json({ message: 'Phase IDs array is required' });
        }

        const userRole = req.user.role;
        const allowedUpdates = ['status', 'priority', 'tags'];
        const updateData = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = updates[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid updates provided' });
        }

        let query = {
            _id: { $in: phaseIds },
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: { $in: phaseIds },
                isActive: true
            }).select('resourceId');

            const accessiblePhaseIds = accessControls
                .filter(ac => ac.hasPermission('edit'))
                .map(ac => ac.resourceId);

            query.$or = [
                { owner: req.user._id },
                { _id: { $in: accessiblePhaseIds } }
            ];
        }

        updateData.lastUpdatedBy = req.user._id;

        const result = await Phase.updateMany(query, { $set: updateData });

        console.log('Phases bulk updated successfully:', result.modifiedCount);

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_bulk_updated',
            resourceType: 'phase',
            actionCategory: 'update',
            severity: 'info',
            details: `${result.modifiedCount} phases updated`,
            changes: {
                after: updateData
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phases updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.log('Error bulk updating phases:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhaseStatistics = async (req, res) => {
    try {
        console.log('Fetching phase statistics:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        }).populate('bugs requirements sprints');

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            phase.isOwner(req.user._id) ||
            phase.isAssigned(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const statistics = {
            basic: {
                name: phase.name,
                status: phase.status,
                priority: phase.priority,
                progress: phase.progress,
                isOverdue: phase.isOverdue,
                daysRemaining: phase.daysRemaining
            },
            resources: {
                totalSubPhases: phase.statistics.totalSubPhases,
                totalFolders: phase.statistics.totalFolders,
                totalDocuments: phase.statistics.totalDocuments,
                totalSheets: phase.statistics.totalSheets,
                totalSlides: phase.statistics.totalSlides,
                totalSprints: phase.statistics.totalSprints
            },
            bugs: {
                total: phase.statistics.totalBugs,
                open: phase.statistics.openBugs,
                closed: phase.statistics.closedBugs,
                closeRate: phase.statistics.totalBugs > 0
                    ? Math.round((phase.statistics.closedBugs / phase.statistics.totalBugs) * 100)
                    : 0
            },
            requirements: {
                total: phase.statistics.totalRequirements,
                completed: phase.statistics.completedRequirements,
                completionRate: phase.statistics.totalRequirements > 0
                    ? Math.round((phase.statistics.completedRequirements / phase.statistics.totalRequirements) * 100)
                    : 0
            },
            milestones: {
                total: phase.milestones.length,
                completed: phase.statistics.completedMilestones,
                pending: phase.milestones.filter(m => m.status === 'pending').length,
                missed: phase.milestones.filter(m => m.status === 'missed').length
            },
            deliverables: {
                total: phase.statistics.totalDeliverables,
                pending: phase.deliverables.filter(d => d.status === 'pending').length,
                inProgress: phase.deliverables.filter(d => d.status === 'in_progress').length,
                completed: phase.deliverables.filter(d => d.status === 'completed').length,
                rejected: phase.deliverables.filter(d => d.status === 'rejected').length
            },
            team: {
                assignedUsers: phase.assignedUserCount,
                owner: phase.owner
            },
            timeline: {
                startDate: phase.startDate,
                endDate: phase.endDate,
                actualStartDate: phase.actualStartDate,
                actualEndDate: phase.actualEndDate,
                estimatedDays: phase.duration.estimatedDays,
                actualDays: phase.duration.actualDays
            }
        };

        console.log('Phase statistics fetched successfully');

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.log('Error fetching phase statistics:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPhaseAccessList = async (req, res) => {
    try {
        console.log('Fetching phase access list:', req.params.id);
        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const accessControls = await AccessControl.find({
            organizationId: req.user.organizationId,
            resourceType: 'phase',
            resourceId: phase._id,
            isActive: true
        }).populate('userId', 'firstName lastName email profileImage')
            .populate('grantedBy', 'firstName lastName');

        const accessList = accessControls.map(ac => ({
            userId: ac.userId._id,
            user: {
                firstName: ac.userId.firstName,
                lastName: ac.userId.lastName,
                email: ac.userId.email,
                profileImage: ac.userId.profileImage
            },
            permission: ac.permission,
            accessType: ac.accessType,
            isInherited: ac.isInherited,
            inheritedFrom: ac.inheritedFrom,
            grantedAt: ac.grantedAt,
            grantedBy: ac.grantedBy,
            expiresAt: ac.expiresAt,
            isExpired: ac.isExpired
        }));

        console.log('Phase access list fetched successfully');

        res.status(200).json({
            success: true,
            count: accessList.length,
            data: accessList
        });
    } catch (error) {
        console.log('Error fetching phase access list:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addPhaseMilestone = async (req, res) => {
    try {
        console.log('Adding milestone to phase:', req.params.id);
        const { name, description, dueDate } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const milestoneId = new mongoose.Types.ObjectId().toString();
        phase.addMilestone(milestoneId, name, description, new Date(dueDate));
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Milestone added successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_milestone_added',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Milestone ${name} added to phase`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Milestone added successfully',
            data: phase.milestones
        });
    } catch (error) {
        console.log('Error adding milestone:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const completePhaseMilestone = async (req, res) => {
    try {
        console.log('Completing milestone:', req.params.id);
        const { milestoneId } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        phase.completeMilestone(milestoneId, req.user._id);
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Milestone completed successfully');

        const milestone = phase.milestones.find(m => m.milestoneId === milestoneId);

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_milestone_completed',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Milestone ${milestone?.name} completed`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Milestone completed successfully',
            data: phase.milestones
        });
    } catch (error) {
        console.log('Error completing milestone:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addPhaseDeliverable = async (req, res) => {
    try {
        console.log('Adding deliverable to phase:', req.params.id);
        const { name, description, dueDate } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const deliverableId = new mongoose.Types.ObjectId().toString();
        phase.addDeliverable(deliverableId, name, description, new Date(dueDate));
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Deliverable added successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_deliverable_added',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Deliverable ${name} added to phase`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Deliverable added successfully',
            data: phase.deliverables
        });
    } catch (error) {
        console.log('Error adding deliverable:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addPhaseDependency = async (req, res) => {
    try {
        console.log('Adding dependency to phase:', req.params.id);
        const { dependsOnPhaseId, dependencyType, lagDays } = req.body;

        const phase = await Phase.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!phase) {
            console.log('Phase not found:', req.params.id);
            return res.status(404).json({ message: 'Phase not found' });
        }

        const dependsOnPhase = await Phase.findOne({
            _id: dependsOnPhaseId,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!dependsOnPhase) {
            console.log('Dependent phase not found:', dependsOnPhaseId);
            return res.status(404).json({ message: 'Dependent phase not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || phase.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'phase',
                resourceId: phase._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        phase.addDependency(dependsOnPhaseId, dependencyType || 'finish_to_start', lagDays || 0);
        phase.lastUpdatedBy = req.user._id;
        await phase.save();

        console.log('Dependency added successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'phase_dependency_added',
            resourceType: 'phase',
            resourceId: phase._id,
            resourceName: phase.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Dependency on phase ${dependsOnPhase.name} added`,
            metadata: {
                project: {
                    projectId: phase.projectId,
                    projectName: phase.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Dependency added successfully',
            data: phase.dependencies
        });
    } catch (error) {
        console.log('Error adding dependency:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};