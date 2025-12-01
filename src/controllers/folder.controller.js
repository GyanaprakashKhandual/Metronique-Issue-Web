import Folder from '../models/folder.model.js';
import Project from '../models/project.model.js';
import Phase from '../models/phase.model.js';
import Sprint from '../models/sprint.model.js';
import AccessControl from '../models/accessControl.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const createFolder = async (req, res) => {
    try {
        console.log('Creating folder with user:', req.user._id);
        const { name, description, projectId, phaseId, sprintId, parentFolderId, folderType, visibility, color, icon } = req.body;

        if (!projectId && !phaseId && !sprintId) {
            console.log('At least one of projectId, phaseId, or sprintId is required');
            return res.status(400).json({ message: 'At least one of projectId, phaseId, or sprintId is required' });
        }

        let parentResource = null;
        let parentResourceType = null;

        if (projectId) {
            parentResource = await Project.findOne({
                _id: projectId,
                organizationId: req.user.organizationId,
                isDeleted: false
            });
            parentResourceType = 'project';
        } else if (phaseId) {
            parentResource = await Phase.findOne({
                _id: phaseId,
                organizationId: req.user.organizationId,
                isDeleted: false
            });
            parentResourceType = 'phase';
        } else if (sprintId) {
            parentResource = await Sprint.findOne({
                _id: sprintId,
                organizationId: req.user.organizationId,
                isDeleted: false
            });
            parentResourceType = 'sprint';
        }

        if (!parentResource) {
            console.log('Parent resource not found');
            return res.status(404).json({ message: 'Parent resource not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin';

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: parentResourceType,
                resourceId: parentResource._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                console.log('User does not have permission to create folder');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const folderCount = await Folder.countDocuments({ organizationId: req.user.organizationId });
        const folderSerialNumber = `FLD-${String(folderCount + 1).padStart(6, '0')}`;

        const folder = new Folder({
            name,
            description,
            folderSerialNumber,
            organizationId: req.user.organizationId,
            projectId: projectId || null,
            phaseId: phaseId || null,
            sprintId: sprintId || null,
            parentFolderId: parentFolderId || null,
            folderType: folderType || 'general',
            visibility: visibility || 'private',
            color: color || '#CCCCCC',
            icon,
            owner: req.user._id,
            metadata: {
                projectName: projectId ? parentResource.name : null,
                phaseName: phaseId ? parentResource.name : null,
                sprintName: sprintId ? parentResource.name : null
            }
        });

        await folder.save();
        console.log('Folder created successfully:', folder._id);

        const parentAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: parentResourceType,
            resourceId: parentResource._id,
            isActive: true
        });

        const accessControl = new AccessControl({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            resourceType: 'folder',
            resourceId: folder._id,
            permission: 'admin',
            grantedBy: req.user._id,
            accessType: parentAccess ? 'inherited' : 'direct',
            inheritedFrom: parentAccess ? parentResourceType : null,
            inheritedFromId: parentAccess ? parentResource._id : null,
            isInherited: parentAccess ? true : false,
            metadata: {
                resourceName: folder.name
            }
        });

        await accessControl.save();
        console.log('Access control created for folder owner');

        if (projectId) {
            const project = await Project.findById(projectId);
            if (project) {
                project.addFolder(folder._id);
                await project.save();
            }
        }

        if (phaseId) {
            const phase = await Phase.findById(phaseId);
            if (phase) {
                phase.addFolder(folder._id);
                await phase.save();
            }
        }

        if (sprintId) {
            const sprint = await Sprint.findById(sprintId);
            if (sprint) {
                sprint.addFolder(folder._id);
                await sprint.save();
            }
        }

        if (parentFolderId) {
            const parentFolder = await Folder.findById(parentFolderId);
            if (parentFolder) {
                parentFolder.addSubFolder(folder._id);
                await parentFolder.save();
                console.log('Added folder to parent folder:', parentFolderId);
            }
        }

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_created',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'create',
            severity: 'info',
            details: `Folder ${folder.name} created`
        });

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            data: folder
        });
    } catch (error) {
        console.log('Error creating folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFolders = async (req, res) => {
    try {
        console.log('Fetching folders for user:', req.user._id);
        const { projectId, phaseId, sprintId, parentFolderId, visibility, status } = req.query;

        let query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (projectId) {
            query.projectId = projectId;
        }

        if (phaseId) {
            query.phaseId = phaseId;
        }

        if (sprintId) {
            query.sprintId = sprintId;
        }

        if (parentFolderId) {
            query.parentFolderId = parentFolderId === 'null' ? null : parentFolderId;
        }

        if (visibility) {
            query.visibility = visibility;
        }

        if (status) {
            query.status = status;
        }

        const userRole = req.user.role;
        if (userRole !== 'superadmin' && userRole !== 'admin') {
            const accessControls = await AccessControl.find({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'folder',
                isActive: true
            }).select('resourceId');

            const accessibleFolderIds = accessControls.map(ac => ac.resourceId);
            query.$or = [
                { owner: req.user._id },
                { 'collaborators.userId': req.user._id },
                { _id: { $in: accessibleFolderIds } }
            ];
        }

        const folders = await Folder.find(query)
            .populate('owner', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('phaseId', 'name phaseNumber')
            .populate('sprintId', 'name sprintNumber')
            .populate('parentFolderId', 'name')
            .sort({ createdAt: -1 });

        console.log('Folders fetched successfully, count:', folders.length);

        res.status(200).json({
            success: true,
            count: folders.length,
            data: folders
        });
    } catch (error) {
        console.log('Error fetching folders:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFolderById = async (req, res) => {
    try {
        console.log('Fetching folder by ID:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('owner', 'firstName lastName email profileImage')
            .populate('collaborators.userId', 'firstName lastName email profileImage')
            .populate('projectId', 'name key')
            .populate('phaseId', 'name phaseNumber')
            .populate('sprintId', 'name sprintNumber')
            .populate('parentFolderId', 'name');

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' ||
            userRole === 'admin' ||
            folder.isOwner(req.user._id);

        if (!hasAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'folder',
                resourceId: folder._id,
                isActive: true
            });

            if (!accessControl && !folder.hasAccess(req.user._id, 'view')) {
                console.log('User does not have access to folder:', req.params.id);
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        console.log('Folder fetched successfully');

        res.status(200).json({
            success: true,
            data: folder
        });
    } catch (error) {
        console.log('Error fetching folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateFolder = async (req, res) => {
    try {
        console.log('Updating folder:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasEditAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasEditAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'folder',
                resourceId: folder._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('edit')) {
                if (!folder.hasAccess(req.user._id, 'edit')) {
                    console.log('User does not have edit access');
                    return res.status(403).json({ message: 'Access denied' });
                }
            }
        }

        const allowedUpdates = ['name', 'description', 'visibility', 'color', 'icon', 'folderType', 'notes', 'tags', 'settings'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (req.body.settings) {
            updates['settings'] = { ...folder.settings, ...req.body.settings };
        }

        Object.assign(folder, updates);
        folder.lastUpdatedBy = req.user._id;
        await folder.save();

        console.log('Folder updated successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_updated',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Folder ${folder.name} updated`
        });

        res.status(200).json({
            success: true,
            message: 'Folder updated successfully',
            data: folder
        });
    } catch (error) {
        console.log('Error updating folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteFolder = async (req, res) => {
    try {
        console.log('Deleting folder:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasDeleteAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasDeleteAccess) {
            const accessControl = await AccessControl.findOne({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                resourceType: 'folder',
                resourceId: folder._id,
                isActive: true
            });

            if (!accessControl || !accessControl.hasPermission('admin')) {
                console.log('User does not have delete access');
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        folder.softDelete(req.user._id);
        await folder.save();

        if (folder.projectId) {
            const project = await Project.findById(folder.projectId);
            if (project) {
                project.removeFolder(folder._id);
                await project.save();
            }
        }

        if (folder.phaseId) {
            const phase = await Phase.findById(folder.phaseId);
            if (phase) {
                phase.removeFolder(folder._id);
                await phase.save();
            }
        }

        if (folder.sprintId) {
            const sprint = await Sprint.findById(folder.sprintId);
            if (sprint) {
                sprint.removeFolder(folder._id);
                await sprint.save();
            }
        }

        console.log('Folder soft deleted successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_deleted',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Folder ${folder.name} deleted`
        });

        res.status(200).json({
            success: true,
            message: 'Folder deleted successfully'
        });
    } catch (error) {
        console.log('Error deleting folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const grantFolderAccess = async (req, res) => {
    try {
        console.log('Granting folder access:', req.params.id);
        const { userId, permission } = req.body;

        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const existingAccess = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'folder',
            resourceId: folder._id
        });

        if (existingAccess) {
            existingAccess.updatePermission(permission, req.user._id);
            await existingAccess.save();
            console.log('Access updated for user:', userId);
        } else {
            const accessControl = new AccessControl({
                organizationId: req.user.organizationId,
                userId: userId,
                resourceType: 'folder',
                resourceId: folder._id,
                permission: permission,
                grantedBy: req.user._id,
                accessType: 'direct',
                isInherited: false,
                metadata: {
                    resourceName: folder.name
                }
            });

            await accessControl.save();
            console.log('Access granted to user:', userId);
        }

        const roleMap = {
            view: 'viewer',
            edit: 'editor',
            admin: 'owner'
        };

        folder.addCollaborator(userId, roleMap[permission] || 'viewer');
        await folder.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_granted',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'access',
            severity: 'info',
            details: `Access granted to user with ${permission} permission`
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

export const revokeFolderAccess = async (req, res) => {
    try {
        console.log('Revoking folder access:', req.params.id);
        const { userId } = req.body;

        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasAdminAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasAdminAccess) {
            console.log('User does not have admin access');
            return res.status(403).json({ message: 'Access denied' });
        }

        const accessControl = await AccessControl.findOne({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'folder',
            resourceId: folder._id
        });

        if (accessControl) {
            accessControl.revoke(req.user._id, 'Access revoked by admin');
            await accessControl.save();
            console.log('Access revoked for user:', userId);
        }

        folder.removeCollaborator(userId);
        await folder.save();

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'access_revoked',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'access',
            severity: 'medium',
            details: `Access revoked for user`
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

export const shareFolderWith = async (req, res) => {
    try {
        console.log('Sharing folder:', req.params.id);
        const { userId, permission } = req.body;

        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasShareAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasShareAccess) {
            console.log('User does not have share access');
            return res.status(403).json({ message: 'Access denied' });
        }

        folder.shareWith(userId, permission, req.user._id);
        await folder.save();

        const accessControl = new AccessControl({
            organizationId: req.user.organizationId,
            userId: userId,
            resourceType: 'folder',
            resourceId: folder._id,
            permission: permission,
            grantedBy: req.user._id,
            accessType: 'direct',
            isInherited: false,
            metadata: {
                resourceName: folder.name
            }
        });

        await accessControl.save();
        console.log('Folder shared with user:', userId);

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_shared',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'share',
            severity: 'info',
            details: `Folder ${folder.name} shared with user`
        });

        res.status(200).json({
            success: true,
            message: 'Folder shared successfully'
        });
    } catch (error) {
        console.log('Error sharing folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFolderTree = async (req, res) => {
    try {
        console.log('Fetching folder tree:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        }).populate('owner', 'firstName lastName email');

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const subFolders = await Folder.find({
            parentFolderId: folder._id,
            isDeleted: false
        }).select('_id name slug folderType visibility status hierarchyLevel statistics');

        const tree = {
            folder: {
                id: folder._id,
                name: folder.name,
                folderType: folder.folderType,
                visibility: folder.visibility,
                status: folder.status,
                owner: folder.owner,
                hierarchyLevel: folder.hierarchyLevel
            },
            subFolders: subFolders,
            statistics: folder.statistics
        };

        console.log('Folder tree fetched successfully');

        res.status(200).json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.log('Error fetching folder tree:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFolderHierarchy = async (req, res) => {
    try {
        console.log('Fetching folder hierarchy:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const buildHierarchy = async (folderId, level = 0) => {
            const currentFolder = await Folder.findById(folderId).select('_id name folderType visibility status hierarchyLevel childFolders');

            if (!currentFolder) return null;

            const children = [];
            for (const childId of currentFolder.childFolders) {
                const child = await buildHierarchy(childId, level + 1);
                if (child) children.push(child);
            }

            return {
                id: currentFolder._id,
                name: currentFolder.name,
                folderType: currentFolder.folderType,
                level: level,
                hierarchyLevel: currentFolder.hierarchyLevel,
                children: children
            };
        };

        const hierarchy = await buildHierarchy(folder._id);

        console.log('Folder hierarchy fetched successfully');

        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.log('Error fetching folder hierarchy:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFolderStructure = async (req, res) => {
    try {
        console.log('Fetching folder structure:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const structure = await folder.getFolderStructure();

        console.log('Folder structure fetched successfully');

        res.status(200).json({
            success: true,
            data: structure
        });
    } catch (error) {
        console.log('Error fetching folder structure:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const archiveFolder = async (req, res) => {
    try {
        console.log('Archiving folder:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasAccess) {
            console.log('User does not have permission to archive folder');
            return res.status(403).json({ message: 'Access denied' });
        }

        folder.archiveFolder(req.user._id);
        await folder.save();

        console.log('Folder archived successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_archived',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Folder ${folder.name} archived`
        });

        res.status(200).json({
            success: true,
            message: 'Folder archived successfully',
            data: folder
        });
    } catch (error) {
        console.log('Error archiving folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const unarchiveFolder = async (req, res) => {
    try {
        console.log('Unarchiving folder:', req.params.id);
        const folder = await Folder.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!folder) {
            console.log('Folder not found:', req.params.id);
            return res.status(404).json({ message: 'Folder not found' });
        }

        const userRole = req.user.role;
        const hasAccess = userRole === 'superadmin' || userRole === 'admin' || folder.isOwner(req.user._id);

        if (!hasAccess) {
            console.log('User does not have permission to unarchive folder');
            return res.status(403).json({ message: 'Access denied' });
        }

        folder.unarchiveFolder();
        await folder.save();

        console.log('Folder unarchived successfully');

        await ActivityLog.createLog({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'folder_restored',
            resourceType: 'folder',
            resourceId: folder._id,
            resourceName: folder.name,
            actionCategory: 'update',
            severity: 'info',
            details: `Folder ${folder.name} unarchived`
        });

        res.status(200).json({
            success: true,
            message: 'Folder unarchived successfully',
            data: folder
        });
    } catch (error) {
        console.log('Error unarchiving folder:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};