import Project from '../models/project.model.js';
import AccessControl from '../models/accessControl.model.js';
import ActivityLog from '../models/activityLog.model.js';
import Phase from '../models/phase.model.js';
import Sprint from '../models/sprint.model.js';
import Folder from '../models/folder.model.js';
import mongoose from 'mongoose';

export const createProject = async (req, res) => {
    try {
        console.log('Creating project with user:', req.user._id);
        const { name, description, key, teamId, departmentId, parentProjectId, visibility, projectType, color, icon } = req.body;

        const existingProject = await Project.findOne({
            organizationId: req.user.organizationId,
            key: key,
            isDeleted: false
        });

        if (existingProject) {
            console.log('Project key already exists:', key);
            return res.status(400).json({ message: 'Project key already exists' });
        }

        const projectCount = await Project.countDocuments({ organizationId: req.user.organizationId });
        const projectSerialNumber = `PRJ-${String(projectCount + 1).padStart(6, '0')}`;

        const project = new Project({
            name,
            description,
            key,
            projectSerialNumber,
            organizationId: req.user.organizationId,
            teamId,
            departmentId,
            parentProjectId,
            visibility: visibility || 'private',
            projectType: projectType || 'software',
            color: color || '#3498db',
            icon,
            owner: req.user._id
        });

        project.members.push({
            userId: req.user._id,
            role: 'owner',
            status: 'active',
            invitedBy: req.user._id
        });

        await project.save();
        console.log('Project created successfully:', project._id);

        const accessControl = new AccessControl({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: 'project',
            resourceId: project._id,
            permission: 'admin',
            grantedBy: req.user._id,
            accessType: 'direct',
            isInherited: false,
            metadata: {
                resourceName: project.name
            }
        });

        await accessControl.save();
        console.log('Access control created for project owner');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_created',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Project ${project.name} created`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        if (parentProjectId) {
            const parentProject = await Project.findById(parentProjectId);
            if (parentProject) {
                parentProject.addSubProject(project._id);
                await parentProject.save();
                console.log('Added project to parent:', parentProjectId);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
        });
    } catch (error) {
        console.log('Error creating project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        console.log('Fetching projects for user:', req.user._id);
        const { parentProjectId, status, visibility } = req.query;

        const userRole = req.user.role;
        let query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                isActive: true
            }).select('resourceId');

            const accessibleProjectIds = accessControls.map(ac => ac.resourceId);
            query.$or = [
                { owner: req.user._id },
                { 'members.userId': req.user._id },
                { 'admins.userId': req.user._id },
                { _id: { $in: accessibleProjectIds } }
            ];
        }

        if (parentProjectId) {
            query.parentProjectId = parentProjectId === 'null' ? null : parentProjectId;
        }

        if (status) {
            query['projectSettings.status'] = status;
        }

        if (visibility) {
            query.visibility = visibility;
        }

        const projects = await Project.find(query)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('teamId', 'name')
            .populate('departmentId', 'name')
            .populate('parentProjectId', 'name')
            .sort({ createdAt: -1 });

        console.log('Projects fetched successfully, count:', projects.length);

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.log('Error fetching projects:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        console.log('Fetching project by ID:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email profileImage')
            .populate('members.userId', 'firstName lastName email profileImage')
            .populate('admins.userId', 'firstName lastName email profileImage')
            .populate('teamId', 'name')
            .populate('departmentId', 'name')
            .populate('parentProjectId', 'name');

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isMember(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access to project:', req.params.id);
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        console.log('Project fetched successfully');

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.log('Error fetching project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        console.log('Updating project:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const isOwnerOrAdmin = project.isOwner(req.user._id) || project.isAdmin(req.user._id);
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || isOwnerOrAdmin;

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have edit access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const allowedUpdates = ['name', 'description', 'visibility', 'color', 'icon', 'projectSettings', 'notes', 'tags'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (req.body.projectSettings) {
            updates['projectSettings'] = { ...project.projectSettings, ...req.body.projectSettings };
        }

        Object.assign(project, updates);
        project.lastUpdatedBy = req.user._id;
        await project.save();

        console.log('Project updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_updated',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Project ${project.name} updated`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        console.log('Error updating project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        console.log('Deleting project:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasDeleteAccess = userRole === 'superadmin' || userRole === 'admin' || project.isOwner(req.user._id);

        if (!hasDeleteAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('admin')) {
                console.log('User does not have delete access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        project.softDelete(req.user._id);
        await project.save();

        console.log('Project soft deleted successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_deleted',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Project ${project.name} deleted`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.log('Error deleting project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const grantProjectAccess = async (req, res) => {
    try {
        console.log('Granting project access:', req.params.id);
        const { userId, permission } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || project.isOwner(req.user._id) || project.isAdmin(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const existingAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'project',
            resourceId: project._id
        });

        if (existingAccess) {
            existingAccess.updatePermission(permission, req.user._id, 'Permission updated');
            await existingAccess.save();
            console.log('Access updated for user:', userId);
        } else {
            const accessControl = new AccessControl({
                organizationId: req.user.organizationId,
                userId: userId,
                resourceType: 'project',
                resourceId: project._id,
                permission: permission,
                grantedBy: req.user._id,
                accessType: 'direct',
                isInherited: false,
                metadata: {
                    resourceName: project.name
                }
            });

            await accessControl.save();
            console.log('Access granted to user:', userId);
        }

        project.addMember(userId, req.user._id, 'member');
        await project.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_granted',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'access',
            severity: 'info',
            details: `Access granted to user with ${permission} permission`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
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

export const bulkGrantProjectAccess = async (req, res) => {
    try {
        console.log('Bulk granting project access:', req.params.id);
        const { userIds, permission } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin';

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const grantedUsers = [];

            for (const userId of userIds) {
                const existingAccess = await AccessControl.findOne({
                    organizationId: req.user.organizationId,
                    userId: userId,
                    resourceType: 'project',
                    resourceId: project._id
                }).session(session);

                if (existingAccess) {
                    existingAccess.updatePermission(permission, req.user._id);
                    await existingAccess.save({ session });
                } else {
                    const accessControl = new AccessControl({
                        organizationId: req.user.organizationId,
                        userId: userId,
                        resourceType: 'project',
                        resourceId: project._id,
                        permission: permission,
                        grantedBy: req.user._id,
                        accessType: 'direct',
                        isInherited: false,
                        metadata: {
                            resourceName: project.name
                        }
                    });
                    await accessControl.save({ session });
                }

                project.addMember(userId, req.user._id, 'member');

                const phases = await Phase.find({ projectId: project._id, isDeleted: false }).session(session);
                for (const phase of phases) {
                    const phaseAccess = new AccessControl({
                        organizationId: req.user.organizationId,
                        userId: userId,
                        resourceType: 'phase',
                        resourceId: phase._id,
                        permission: permission,
                        grantedBy: req.user._id,
                        accessType: 'inherited',
                        inheritedFrom: 'project',
                        inheritedFromId: project._id,
                        isInherited: true,
                        metadata: {
                            resourceName: phase.name
                        }
                    });
                    await phaseAccess.save({ session });
                }

                const sprints = await Sprint.find({ projectId: project._id, isDeleted: false }).session(session);
                for (const sprint of sprints) {
                    const sprintAccess = new AccessControl({
                        organizationId: req.user.organizationId,
                        userId: userId,
                        resourceType: 'sprint',
                        resourceId: sprint._id,
                        permission: permission,
                        grantedBy: req.user._id,
                        accessType: 'inherited',
                        inheritedFrom: 'project',
                        inheritedFromId: project._id,
                        isInherited: true,
                        metadata: {
                            resourceName: sprint.name
                        }
                    });
                    await sprintAccess.save({ session });
                }

                const folders = await Folder.find({ projectId: project._id, isDeleted: false }).session(session);
                for (const folder of folders) {
                    const folderAccess = new AccessControl({
                        organizationId: req.user.organizationId,
                        userId: userId,
                        resourceType: 'folder',
                        resourceId: folder._id,
                        permission: permission,
                        grantedBy: req.user._id,
                        accessType: 'inherited',
                        inheritedFrom: 'project',
                        inheritedFromId: project._id,
                        isInherited: true,
                        metadata: {
                            resourceName: folder.name
                        }
                    });
                    await folderAccess.save({ session });
                }

                grantedUsers.push(userId);
            }

            await project.save({ session });

            await ActivityLog.createLog({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                action: 'access_granted',
                resourceType: 'project',
                resourceId: project._id,
                resourceName: project.name,
                actionCategory: 'access',
                severity: 'info',
                details: `Bulk access granted to ${userIds.length} users with ${permission} permission`,
                metadata: {
                    project: {
                        projectId: project._id,
                        projectName: project.name
                    }
                }
            });

            await session.commitTransaction();
            console.log('Bulk access granted successfully');

            res.status(200).json({
                success: true,
                message: 'Bulk access granted successfully',
                grantedCount: grantedUsers.length
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.log('Error bulk granting access:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const revokeProjectAccess = async (req, res) => {
    try {
        console.log('Revoking project access:', req.params.id);
        const { userId } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || project.isOwner(req.user._id) || project.isAdmin(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const accessControl = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'project',
            resourceId: project._id
        });

        if (accessControl) {
            accessControl.revoke(req.user._id, 'Access revoked by admin');
            await accessControl.save();
            console.log('Access revoked for user:', userId);
        }

        project.removeMember(userId);
        await project.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_revoked',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'access',
            severity: 'medium',
            details: `Access revoked for user`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
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

export const getProjectTree = async (req, res) => {
    try {
        console.log('Fetching project tree:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        }).populate('owner', 'firstName lastName email');

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const phases = await Phase.find({
            projectId: project._id,
            isDeleted: false,
            parentPhaseId: null
        }).select('_id name slug phaseNumber status priority startDate endDate progress hierarchyLevel');

        const sprints = await Sprint.find({
            projectId: project._id,
            isDeleted: false,
            parentSprintId: null,
            phaseId: null
        }).select('_id name slug sprintNumber status priority startDate endDate progress hierarchyLevel');

        const folders = await Folder.find({
            projectId: project._id,
            isDeleted: false,
            parentFolderId: null
        }).select('_id name slug folderType visibility status hierarchyLevel statistics');

        const tree = {
            project: {
                id: project._id,
                name: project.name,
                key: project.key,
                status: project.projectSettings.status,
                visibility: project.visibility,
                owner: project.owner
            },
            phases: phases,
            sprints: sprints,
            folders: folders,
            statistics: project.statistics
        };

        console.log('Project tree fetched successfully');

        res.status(200).json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.log('Error fetching project tree:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProjectHierarchy = async (req, res) => {
    try {
        console.log('Fetching project hierarchy:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const buildHierarchy = async (projectId, level = 0) => {
            const currentProject = await Project.findById(projectId).select('_id name key status visibility hierarchyLevel childProjects');

            if (!currentProject) return null;

            const children = [];
            for (const childId of currentProject.childProjects) {
                const child = await buildHierarchy(childId, level + 1);
                if (child) children.push(child);
            }

            return {
                id: currentProject._id,
                name: currentProject.name,
                key: currentProject.key,
                level: level,
                hierarchyLevel: currentProject.hierarchyLevel,
                children: children
            };
        };

        const hierarchy = await buildHierarchy(project._id);

        console.log('Project hierarchy fetched successfully');

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.log('Error fetching project hierarchy:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search and Filter Projects
export const searchProjects = async (req, res) => {
    try {
        console.log('Searching projects for user:', req.user._id);
        const {
            query,
            status,
            visibility,
            projectType,
            teamId,
            departmentId,
            startDate,
            endDate,
            priority,
            tags,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const userRole = req.user.role;
        let baseQuery = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        // Apply access control
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                isActive: true
            }).select('resourceId');

            const accessibleProjectIds = accessControls.map(ac => ac.resourceId);
            baseQuery.$or = [
                { owner: req.user._id },
                { 'members.userId': req.user._id },
                { 'admins.userId': req.user._id },
                { _id: { $in: accessibleProjectIds } }
            ];
        }

        // Text search
        if (query) {
            baseQuery.$text = { $search: query };
        }

        // Filter by status
        if (status) {
            baseQuery['projectSettings.status'] = status;
        }

        // Filter by visibility
        if (visibility) {
            baseQuery.visibility = visibility;
        }

        // Filter by project type
        if (projectType) {
            baseQuery.projectType = projectType;
        }

        // Filter by team
        if (teamId) {
            baseQuery.teamId = teamId;
        }

        // Filter by department
        if (departmentId) {
            baseQuery.departmentId = departmentId;
        }

        // Filter by priority
        if (priority) {
            baseQuery['projectSettings.priority'] = priority;
        }

        // Filter by date range
        if (startDate || endDate) {
            baseQuery['projectSettings.startDate'] = {};
            if (startDate) baseQuery['projectSettings.startDate'].$gte = new Date(startDate);
            if (endDate) baseQuery['projectSettings.startDate'].$lte = new Date(endDate);
        }

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            baseQuery.tags = { $in: tagArray };
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [projects, totalCount] = await Promise.all([
            Project.find(baseQuery)
                .populate('owner', 'firstName lastName email profileImage')
                .populate('teamId', 'name')
                .populate('departmentId', 'name')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            Project.countDocuments(baseQuery)
        ]);

        console.log('Projects search completed, count:', projects.length);

        res.status(200).json({
            success: true,
            count: projects.length,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page),
            data: projects
        });
    } catch (error) {
        console.log('Error searching projects:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Project Statistics
export const getProjectStatistics = async (req, res) => {
    try {
        console.log('Fetching project statistics:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access
        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isMember(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access to project');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // Calculate additional statistics
        const phases = await Phase.find({ projectId: project._id, isDeleted: false });
        const sprints = await Sprint.find({ projectId: project._id, isDeleted: false });
        const folders = await Folder.find({ projectId: project._id, isDeleted: false });

        const completedPhases = phases.filter(p => p.status === 'completed').length;
        const activeSprints = sprints.filter(s => s.status === 'active').length;
        const totalStorage = folders.reduce((sum, f) => sum + f.statistics.totalSize, 0);

        const statistics = {
            overview: {
                totalMembers: project.statistics.totalMembers,
                activeMembers: project.activeMembers,
                totalPhases: project.statistics.totalPhases,
                completedPhases,
                totalSprints: project.statistics.totalSprints,
                activeSprints,
                totalFolders: project.statistics.totalFolders,
                totalDocuments: project.statistics.totalDocuments,
                totalSheets: project.statistics.totalSheets,
                totalSlides: project.statistics.totalSlides
            },
            bugs: {
                total: project.statistics.totalBugs,
                open: project.statistics.openBugs,
                closed: project.statistics.closedBugs,
                completionRate: project.bugCompletionRate
            },
            requirements: {
                total: project.statistics.totalRequirements,
                completed: project.statistics.completedRequirements,
                completionRate: project.requirementCompletionRate
            },
            storage: {
                totalSize: totalStorage,
                sizeInMB: (totalStorage / (1024 * 1024)).toFixed(2),
                sizeInGB: (totalStorage / (1024 * 1024 * 1024)).toFixed(2)
            },
            projectInfo: {
                status: project.projectSettings.status,
                visibility: project.visibility,
                projectType: project.projectType,
                startDate: project.projectSettings.startDate,
                endDate: project.projectSettings.endDate,
                createdAt: project.createdAt,
                lastUpdated: project.statistics.lastUpdated
            }
        };

        console.log('Project statistics fetched successfully');

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.log('Error fetching project statistics:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Archive Project
export const archiveProject = async (req, res) => {
    try {
        console.log('Archiving project:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasArchiveAccess = userRole === 'superadmin' || userRole === 'admin' || project.isOwner(req.user._id);

        if (!hasArchiveAccess) {
            console.log('User does not have archive access');
            return res.status(403).json({ message: 'Access denied' });
        }

        project.archiveProject(req.user._id);
        await project.save();

        console.log('Project archived successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_archived',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Project ${project.name} archived`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project archived successfully',
            data: project
        });
    } catch (error) {
        console.log('Error archiving project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unarchive Project
export const unarchiveProject = async (req, res) => {
    try {
        console.log('Unarchiving project:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasUnarchiveAccess = userRole === 'superadmin' || userRole === 'admin' || project.isOwner(req.user._id);

        if (!hasUnarchiveAccess) {
            console.log('User does not have unarchive access');
            return res.status(403).json({ message: 'Access denied' });
        }

        project.unarchiveProject();
        await project.save();

        console.log('Project unarchived successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_restored',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Project ${project.name} unarchived`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project unarchived successfully',
            data: project
        });
    } catch (error) {
        console.log('Error unarchiving project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Restore Deleted Project
export const restoreProject = async (req, res) => {
    try {
        console.log('Restoring project:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: true
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasRestoreAccess = userRole === 'superadmin' || userRole === 'admin';

        if (!hasRestoreAccess) {
            console.log('User does not have restore access');
            return res.status(403).json({ message: 'Access denied' });
        }

        project.restore();
        await project.save();

        console.log('Project restored successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_restored',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Project ${project.name} restored`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project restored successfully',
            data: project
        });
    } catch (error) {
        console.log('Error restoring project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Duplicate Project
export const duplicateProject = async (req, res) => {
    try {
        console.log('Duplicating project:', req.params.id);
        const { name, key, includePhasesAndSprints = false, includeFolders = false } = req.body;

        const sourceProject = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!sourceProject) {
            console.log('Source project not found:', req.params.id);
            return res.status(404).json({ message: 'Source project not found' });
        }

        // Check if user has access
        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            sourceProject.isOwner(req.user._id) ||
            sourceProject.isMember(req.user._id);

        if (!hasAccess) {
            console.log('User does not have access to duplicate project');
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if key already exists
        const existingProject = await Project.findOne({
            organizationId: req.user.organizationId,
            key: key,
            isDeleted: false
        });

        if (existingProject) {
            console.log('Project key already exists:', key);
            return res.status(400).json({ message: 'Project key already exists' });
        }

        const projectCount = await Project.countDocuments({ organizationId: req.user.organizationId });
        const projectSerialNumber = `PRJ-${String(projectCount + 1).padStart(6, '0')}`;

        // Create duplicate project
        const duplicateProject = new Project({
            name: name || `${sourceProject.name} (Copy)`,
            description: sourceProject.description,
            key,
            projectSerialNumber,
            organizationId: req.user.organizationId,
            teamId: sourceProject.teamId,
            departmentId: sourceProject.departmentId,
            visibility: sourceProject.visibility,
            projectType: sourceProject.projectType,
            color: sourceProject.color,
            icon: sourceProject.icon,
            owner: req.user._id,
            projectSettings: sourceProject.projectSettings,
            customFields: sourceProject.customFields,
            labels: sourceProject.labels,
            tags: sourceProject.tags
        });

        duplicateProject.members.push({
            userId: req.user._id,
            role: 'owner',
            status: 'active',
            invitedBy: req.user._id
        });

        await duplicateProject.save();
        console.log('Duplicate project created:', duplicateProject._id);

        // Create access control for owner
        const accessControl = new AccessControl({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: 'project',
            resourceId: duplicateProject._id,
            permission: 'admin',
            grantedBy: req.user._id,
            accessType: 'direct',
            isInherited: false,
            metadata: {
                resourceName: duplicateProject.name
            }
        });

        await accessControl.save();

        // Optionally duplicate phases and sprints
        if (includePhasesAndSprints) {
            const phases = await Phase.find({
                projectId: sourceProject._id,
                isDeleted: false,
                parentPhaseId: null
            });

            for (const phase of phases) {
                // Create phase duplication logic here if needed
            }

            const sprints = await Sprint.find({
                projectId: sourceProject._id,
                isDeleted: false,
                parentSprintId: null
            });

            for (const sprint of sprints) {
                // Create sprint duplication logic here if needed
            }
        }

        // Optionally duplicate folders
        if (includeFolders) {
            const folders = await Folder.find({
                projectId: sourceProject._id,
                isDeleted: false,
                parentFolderId: null
            });

            for (const folder of folders) {
                // Create folder duplication logic here if needed
            }
        }

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_created',
            resourceType: 'project',
            resourceId: duplicateProject._id,
            resourceName: duplicateProject.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Project ${duplicateProject.name} created as duplicate of ${sourceProject.name}`,
            metadata: {
                project: {
                    projectId: duplicateProject._id,
                    projectName: duplicateProject.name
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Project duplicated successfully',
            data: duplicateProject
        });
    } catch (error) {
        console.log('Error duplicating project:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add Project Member
export const addProjectMember = async (req, res) => {
    try {
        console.log('Adding member to project:', req.params.id);
        const { userId, role } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isAdmin(req.user._id);

        if (!hasAdminAccess) {
            const adminPermissions = project.getAdminPermissions(req.user._id);
            if (!adminPermissions || !adminPermissions.canManageMembers) {
                console.log('User does not have permission to add members');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        if (project.isMember(userId)) {
            console.log('User is already a member');
            return res.status(400).json({ message: 'User is already a member' });
        }

        project.addMember(userId, req.user._id, role || 'member');
        await project.save();

        console.log('Member added successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_member_added',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'collaboration',
            severity: 'info',
            details: `User added as ${role || 'member'} to project`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Member added successfully',
            data: project
        });
    } catch (error) {
        console.log('Error adding member:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove Project Member
export const removeProjectMember = async (req, res) => {
    try {
        console.log('Removing member from project:', req.params.id);
        const { userId } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.isOwner(userId)) {
            console.log('Cannot remove project owner');
            return res.status(400).json({ message: 'Cannot remove project owner' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isAdmin(req.user._id);

        if (!hasAdminAccess) {
            const adminPermissions = project.getAdminPermissions(req.user._id);
            if (!adminPermissions || !adminPermissions.canManageMembers) {
                console.log('User does not have permission to remove members');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        project.removeMember(userId);
        await project.save();

        console.log('Member removed successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_member_removed',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'collaboration',
            severity: 'medium',
            details: `User removed from project`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.log('Error removing member:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Member Role
export const updateMemberRole = async (req, res) => {
    try {
        console.log('Updating member role in project:', req.params.id);
        const { userId, role } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.isOwner(userId)) {
            console.log('Cannot change owner role');
            return res.status(400).json({ message: 'Cannot change owner role' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isAdmin(req.user._id);

        if (!hasAdminAccess) {
            const adminPermissions = project.getAdminPermissions(req.user._id);
            if (!adminPermissions || !adminPermissions.canManageMembers) {
                console.log('User does not have permission to update member roles');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        project.updateMemberRole(userId, role);
        project.lastUpdatedBy = req.user._id;
        await project.save();

        console.log('Member role updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_member_updated',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'collaboration',
            severity: 'info',
            details: `User role updated to ${role}`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            data: project
        });
    } catch (error) {
        console.log('Error updating member role:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Project Members
export const getProjectMembers = async (req, res) => {
    try {
        console.log('Fetching project members:', req.params.id);
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email profileImage')
            .populate('members.userId', 'firstName lastName email profileImage')
            .populate('admins.userId', 'firstName lastName email profileImage');

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access
        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isMember(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const members = {
            owner: project.owner,
            admins: project.admins,
            members: project.members,
            totalMembers: project.memberCount,
            activeMembers: project.activeMembers
        };

        console.log('Project members fetched successfully');

        res.status(200).json({
            success: true,
            data: members
        });
    } catch (error) {
        console.log('Error fetching project members:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Project Activity Log
export const getProjectActivity = async (req, res) => {
    try {
        console.log('Fetching project activity:', req.params.id);
        const { page = 1, limit = 50, actionCategory, startDate, endDate } = req.query;

        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access
        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isMember(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'project',
                resourceId: project._id,
                isActive: true
            });

            if (!accessControl) {
                console.log('User does not have access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const query = {
            organizationId: req.user.organizationId,
            'metadata.project.projectId': project._id,
            isArchived: false
        };

        if (actionCategory) {
            query.actionCategory = actionCategory;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [activities, totalCount] = await Promise.all([
            ActivityLog.find(query)
                .populate('userId', 'firstName lastName email profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ActivityLog.countDocuments(query)
        ]);

        console.log('Project activity fetched successfully, count:', activities.length);

        res.status(200).json({
            success: true,
            count: activities.length,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page),
            data: activities
        });
    } catch (error) {
        console.log('Error fetching project activity:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get User's Projects Dashboard
export const getMyProjects = async (req, res) => {
    try {
        console.log('Fetching user projects dashboard for:', req.user._id);
        const { status } = req.query;

        let query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            query.$or = [
                { owner: req.user._id },
                { 'members.userId': req.user._id },
                { 'admins.userId': req.user._id }
            ];
        }

        if (status) {
            query['projectSettings.status'] = status;
        }

        const projects = await Project.find(query)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('teamId', 'name')
            .populate('departmentId', 'name')
            .sort({ 'members.lastActivityAt': -1, createdAt: -1 });

        const projectsWithRole = projects.map(project => {
            const role = project.getMemberRole(req.user._id);
            return {
                ...project.toJSON(),
                myRole: role,
                isOwner: project.isOwner(req.user._i),
                isAdmin: project.isAdmin(req.user._id)
            };
        });
        console.log('User projects fetched successfully, count:', projects.length);

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projectsWithRole
        });
    } catch (error) {
        console.log('Error fetching user projects:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Export Project Data
export const exportProjectData = async (req, res) => {
    try {
        console.log('Exporting project data:', req.params.id);
        const { format = 'json', includePhases = true, includeSprints = true, includeFolders = true } = req.query;
        const project = await Project.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email')
            .populate('members.userId', 'firstName lastName email')
            .populate('teamId', 'name')
            .populate('departmentId', 'name');

        if (!project) {
            console.log('Project not found:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access
        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            project.isOwner(req.user._id) ||
            project.isAdmin(req.user._id);

        if (!hasAccess) {
            console.log('User does not have export access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const exportData = {
            project: project.toJSON(),
            exportedAt: new Date(),
            exportedBy: req.user._id
        };

        if (includePhases === 'true') {
            exportData.phases = await Phase.find({
                projectId: project._id,
                isDeleted: false
            }).lean();
        }

        if (includeSprints === 'true') {
            exportData.sprints = await Sprint.find({
                projectId: project._id,
                isDeleted: false
            }).lean();
        }

        if (includeFolders === 'true') {
            exportData.folders = await Folder.find({
                projectId: project._id,
                isDeleted: false
            }).lean();
        }

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'project_exported',
            resourceType: 'project',
            resourceId: project._id,
            resourceName: project.name,
            actionCategory: 'read',
            severity: 'info',
            details: `Project ${project.name} data exported in ${format} format`,
            metadata: {
                project: {
                    projectId: project._id,
                    projectName: project.name
                }
            }
        });

        console.log('Project data exported successfully');

        res.status(200).json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.log('Error exporting project data:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};