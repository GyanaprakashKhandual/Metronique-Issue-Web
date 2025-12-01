import Sprint from '../models/sprint.model.js';
import Project from '../models/project.model.js';
import Phase from '../models/phase.model.js';
import AccessControl from '../models/accessControl.model.js';
import ActivityLog from '../models/activityLog.model.js';
import Folder from '../models/folder.model.js';

export const createSprint = async (req, res) => {
    try {
        console.log('Creating sprint with user:', req.user._id);
        const { name, description, projectId, phaseId, parentSprintId, sprintNumber, status, priority, sprintType, startDate, endDate } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', projectId);
            return res.status(404).json({ message: 'Project not found' });
        }

        if (phaseId) {
            const phase = await Phase.findOne({
                _id: phaseId,
                organizationId: req.user.organizationId,
                isDeleted: false
            });

            if (!phase) {
                console.log('Phase not found:', phaseId);
                return res.status(404).json({ message: 'Phase not found' });
            }
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
                console.log('User does not have permission to create sprint');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const sprintCount = await Sprint.countDocuments({ projectId, organizationId: req.user.organizationId });
        const sprintSerialNumber = `SPR-${String(sprintCount + 1).padStart(6, '0')}`;

        const sprint = new Sprint({
            name,
            description,
            sprintSerialNumber,
            organizationId: req.user.organizationId,
            projectId,
            phaseId: phaseId || null,
            parentSprintId: parentSprintId || null,
            sprintNumber,
            status: status || 'planning',
            priority: priority || 'medium',
            sprintType: sprintType || 'standard',
            startDate,
            endDate,
            owner: req.user._id,
            metadata: {
                projectName: project.name
            }
        });

        sprint.assignedTo.push({
            userId: req.user._id,
            assignedBy: req.user._id,
            role: 'owner'
        });

        await sprint.save();
        console.log('Sprint created successfully:', sprint._id);

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
            resourceType: 'sprint',
            resourceId: sprint._id,
            permission: 'admin',
            grantedBy: req.user._id,
            accessType: projectAccess ? 'inherited' : 'direct',
            inheritedFrom: projectAccess ? 'project' : null,
            inheritedFromId: projectAccess ? projectId : null,
            isInherited: projectAccess ? true : false,
            metadata: {
                resourceName: sprint.name,
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        await accessControl.save();
        console.log('Access control created for sprint owner');

        project.addSprint(sprint._id);
        await project.save();

        if (phaseId) {
            const phase = await Phase.findById(phaseId);
            if (phase) {
                phase.addSprint(sprint._id);
                await phase.save();
                console.log('Added sprint to phase:', phaseId);
            }
        }

        if (parentSprintId) {
            const parentSprint = await Sprint.findById(parentSprintId);
            if (parentSprint) {
                parentSprint.addSubSprint(sprint._id);
                await parentSprint.save();
                console.log('Added sprint to parent sprint:', parentSprintId);
            }
        }

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'sprint_created',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Sprint ${sprint.name} created`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Sprint created successfully',
            data: sprint
        });
    } catch (error) {
        console.log('Error creating sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSprints = async (req, res) => {
    try {
        console.log('Fetching sprints for user:', req.user._id);
        const { projectId, phaseId, parentSprintId, status } = req.query;

        let query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (projectId) {
            query.projectId = projectId;
        }

        if (phaseId) {
            query.phaseId = phaseId === 'null' ? null : phaseId;
        }

        if (parentSprintId) {
            query.parentSprintId = parentSprintId === 'null' ? null : parentSprintId;
        }

        if (status) {
            query.status = status;
        }

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'sprint',
                isActive: true
            }).select('resourceId');

            const accessibleSprintIds = accessControls.map(ac => ac.resourceId);
            query.$or = [
                { owner: req.user._id },
                { 'assignedTo.userId': req.user._id },
                { _id: { $in: accessibleSprintIds } }
            ];
        }

        const sprints = await Sprint.find(query)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('phaseId', 'name phaseNumber')
            .populate('parentSprintId', 'name sprintNumber')
            .sort({ sprintNumber: 1, createdAt: -1 });

        console.log('Sprints fetched successfully, count:', sprints.length);

        res.status(200).json({
            success: true,
            count: sprints.length,
            data: sprints
        });
    } catch (error) {
        console.log('Error fetching sprints:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSprintById = async (req, res) => {
    try {
        console.log('Fetching sprint by ID:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email profileImage')
            .populate('assignedTo.userId', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('phaseId', 'name phaseNumber')
            .populate('parentSprintId', 'name sprintNumber');

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            sprint.isOwner(req.user._id) ||
            sprint.isAssigned(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'sprint',
                resourceId: sprint._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access to sprint:', req.params.id);
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        console.log('Sprint fetched successfully');

        res.status(200).json({
            success: true,
            data: sprint
        });
    } catch (error) {
        console.log('Error fetching sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateSprint = async (req, res) => {
    try {
        console.log('Updating sprint:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'sprint',
                resourceId: sprint._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const allowedUpdates = ['name', 'description', 'status', 'priority', 'sprintType', 'startDate', 'endDate', 'progress', 'notes', 'tags'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        Object.assign(sprint, updates);
        sprint.lastUpdatedBy = req.user._id;
        await sprint.save();

        console.log('Sprint updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'sprint_updated',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Sprint ${sprint.name} updated`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Sprint updated successfully',
            data: sprint
        });
    } catch (error) {
        console.log('Error updating sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteSprint = async (req, res) => {
    try {
        console.log('Deleting sprint:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasDeleteAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasDeleteAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'sprint',
                resourceId: sprint._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('admin')) {
                console.log('User does not have delete access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        sprint.softDelete(req.user._id);
        await sprint.save();

        const project = await Project.findById(sprint.projectId);
        if (project) {
            project.removeSprint(sprint._id);
            await project.save();
        }

        if (sprint.phaseId) {
            const phase = await Phase.findById(sprint.phaseId);
            if (phase) {
                phase.removeSprint(sprint._id);
                await phase.save();
            }
        }

        console.log('Sprint soft deleted successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'sprint_deleted',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Sprint ${sprint.name} deleted`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Sprint deleted successfully'
        });
    } catch (error) {
        console.log('Error deleting sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const grantSprintAccess = async (req, res) => {
    try {
        console.log('Granting sprint access:', req.params.id);
        const { userId, permission } = req.body;

        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const existingAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'sprint',
            resourceId: sprint._id
        });

        if (existingAccess) {
            existingAccess.updatePermission(permission, req.user._id);
            await existingAccess.save();
            console.log('Access updated for user:', userId);
        } else {
            const accessControl = new AccessControl({
                organizationId: req.user.organizationId,
                userId: userId,
                resourceType: 'sprint',
                resourceId: sprint._id,
                permission: permission,
                grantedBy: req.user._id,
                accessType: 'direct',
                isInherited: false,
                metadata: {
                    resourceName: sprint.name
                }
            });

            await accessControl.save();
            console.log('Access granted to user:', userId);
        }

        sprint.addAssignedUser(userId, req.user._id, 'contributor');
        await sprint.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_granted',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'access',
            severity: 'info',
            details: `Access granted to user with ${permission} permission`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
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

export const revokeSprintAccess = async (req, res) => {
    try {
        console.log('Revoking sprint access:', req.params.id);
        const { userId } = req.body;

        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const accessControl = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'sprint',
            resourceId: sprint._id
        });

        if (accessControl) {
            accessControl.revoke(req.user._id, 'Access revoked by admin');
            await accessControl.save();
            console.log('Access revoked for user:', userId);
        }

        sprint.removeAssignedUser(userId);
        await sprint.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_revoked',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'access',
            severity: 'medium',
            details: `Access revoked for user`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
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

export const getSprintTree = async (req, res) => {
    try {
        console.log('Fetching sprint tree:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        }).populate('owner', 'firstName lastName email');

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const folders = await Folder.find({
            sprintId: sprint._id,
            isDeleted: false,
            parentFolderId: null
        }).select('_id name slug folderType visibility status hierarchyLevel statistics');

        const subSprints = await Sprint.find({
            parentSprintId: sprint._id,
            isDeleted: false
        }).select('_id name slug sprintNumber status priority startDate endDate progress hierarchyLevel');

        const tree = {
            sprint: {
                id: sprint._id,
                name: sprint.name,
                sprintNumber: sprint.sprintNumber,
                status: sprint.status,
                priority: sprint.priority,
                progress: sprint.progress,
                owner: sprint.owner,
                velocity: sprint.velocity
            },
            subSprints: subSprints,
            folders: folders,
            metrics: sprint.metrics,
            statistics: sprint.statistics
        };

        console.log('Sprint tree fetched successfully');

        res.status(200).json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.log('Error fetching sprint tree:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSprintHierarchy = async (req, res) => {
    try {
        console.log('Fetching sprint hierarchy:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const buildHierarchy = async (sprintId, level = 0) => {
            const currentSprint = await Sprint.findById(sprintId).select('_id name sprintNumber status priority hierarchyLevel childSprints');

            if (!currentSprint) return null;

            const children = [];
            for (const childId of currentSprint.childSprints) {
                const child = await buildHierarchy(childId, level + 1);
                if (child) children.push(child);
            }

            return {
                id: currentSprint._id,
                name: currentSprint.name,
                sprintNumber: currentSprint.sprintNumber,
                level: level,
                hierarchyLevel: currentSprint.hierarchyLevel,
                children: children
            };
        };

        const hierarchy = await buildHierarchy(sprint._id);

        console.log('Sprint hierarchy fetched successfully');

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.log('Error fetching sprint hierarchy:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const startSprint = async (req, res) => {
    try {
        console.log('Starting sprint:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasAccess) {
            console.log('User does not have permission to start sprint');
            return res.status(403).json({ message: 'Access denied' });
        }

        sprint.startSprint();
        await sprint.save();

        console.log('Sprint started successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'sprint_started',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'status',
            severity: 'info',
            details: `Sprint ${sprint.name} started`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Sprint started successfully',
            data: sprint
        });
    } catch (error) {
        console.log('Error starting sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const completeSprint = async (req, res) => {
    try {
        console.log('Completing sprint:', req.params.id);
        const sprint = await Sprint.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sprint) {
            console.log('Sprint not found:', req.params.id);
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin' || sprint.isOwner(req.user._id);

        if (!hasAccess) {
            console.log('User does not have permission to complete sprint');
            return res.status(403).json({ message: 'Access denied' });
        }

        sprint.completeSprint();
        await sprint.save();

        console.log('Sprint completed successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'sprint_completed',
            resourceType: 'sprint',
            resourceId: sprint._id,
            resourceName: sprint.name,
            actionCategory: 'status',
            severity: 'info',
            details: `Sprint ${sprint.name} completed`,
            metadata: {
                project: {
                    projectId: sprint.projectId,
                    projectName: sprint.metadata.projectName
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Sprint completed successfully',
            data: sprint
        });
    } catch (error) {
        console.log('Error completing sprint:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};