import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        slug: {
            type: String
        },
        folderSerialNumber: {
            type: String
        },
        description: {
            type: String,
            default: null
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
            index: true
        },
        phaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
            default: null,
            index: true
        },
        sprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
            default: null,
            index: true
        },
        parentFolderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
            index: true
        },
        hierarchyPath: {
            type: String,
            default: null
        },
        hierarchyLevel: {
            type: Number,
            default: 0
        },
        childFolders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder'
        }],
        folderType: {
            type: String,
            enum: ['general', 'archive', 'shared', 'template', 'custom'],
            default: 'general'
        },
        icon: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: '#CCCCCC'
        },
        visibility: {
            type: String,
            enum: ['private', 'internal', 'shared'],
            default: 'private'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sharedWith: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            },
            sharedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        documents: [{
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Document'
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        sheets: [{
            sheetId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sheet'
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        slides: [{
            slideId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Slide'
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        accessControl: {
            defaultPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            inheritedFromProject: {
                type: Boolean,
                default: true
            },
            inheritedFromPhase: {
                type: Boolean,
                default: true
            },
            inheritedFromSprint: {
                type: Boolean,
                default: true
            },
            inheritedFromParent: {
                type: Boolean,
                default: true
            },
            allowPublicAccess: {
                type: Boolean,
                default: false
            }
        },
        metadata: {
            department: {
                departmentId: mongoose.Schema.Types.ObjectId,
                departmentName: String
            },
            team: {
                teamId: mongoose.Schema.Types.ObjectId,
                teamName: String
            },
            projectName: String,
            phaseName: String,
            sprintName: String,
            parentFolderName: String
        },
        statistics: {
            totalSubFolders: {
                type: Number,
                default: 0
            },
            totalDocuments: {
                type: Number,
                default: 0
            },
            totalSheets: {
                type: Number,
                default: 0
            },
            totalSlides: {
                type: Number,
                default: 0
            },
            totalSize: {
                type: Number,
                default: 0
            },
            totalItems: {
                type: Number,
                default: 0
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        permissions: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            grantedAt: {
                type: Date,
                default: Date.now
            },
            grantedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            expiresAt: {
                type: Date,
                default: null
            }
        }],
        tags: [String],
        labels: [{
            labelId: String,
            labelName: String,
            color: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        collaborators: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'editor', 'viewer'],
                default: 'viewer'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
        activityLog: [{
            action: String,
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            resourceType: String,
            resourceId: mongoose.Schema.Types.ObjectId,
            timestamp: {
                type: Date,
                default: Date.now
            },
            details: mongoose.Schema.Types.Mixed
        }],
        settings: {
            allowDownload: {
                type: Boolean,
                default: true
            },
            allowDelete: {
                type: Boolean,
                default: true
            },
            allowUpload: {
                type: Boolean,
                default: true
            },
            requiresApprovalForChanges: {
                type: Boolean,
                default: false
            },
            notifyOnChanges: {
                type: Boolean,
                default: true
            }
        },
        notes: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['active', 'archived', 'locked'],
            default: 'active'
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        archivedAt: {
            type: Date,
            default: null
        },
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        collection: 'folders',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

folderSchema.virtual('isRootFolder').get(function () {
    return !this.parentFolderId;
});

folderSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

folderSchema.virtual('itemCount').get(function () {
    return this.statistics.totalItems;
});

folderSchema.virtual('isEmpty').get(function () {
    return this.statistics.totalItems === 0;
});

folderSchema.virtual('collaboratorCount').get(function () {
    return this.collaborators.length + 1;
});

folderSchema.virtual('sizeInMB').get(function () {
    return (this.statistics.totalSize / (1024 * 1024)).toFixed(2);
});

folderSchema.index({ organizationId: 1, isDeleted: 1 });
folderSchema.index({ projectId: 1, isDeleted: 1 });
folderSchema.index({ phaseId: 1, isDeleted: 1 });
folderSchema.index({ sprintId: 1, isDeleted: 1 });
folderSchema.index({ parentFolderId: 1, isDeleted: 1 });
folderSchema.index({ organizationId: 1, projectId: 1, isDeleted: 1 });
folderSchema.index({ hierarchyPath: 1 });
folderSchema.index({ owner: 1 });
folderSchema.index({ 'collaborators.userId': 1 });
folderSchema.index({ 'permissions.userId': 1 });
folderSchema.index({ visibility: 1, isDeleted: 1 });
folderSchema.index({ status: 1, isDeleted: 1 });
folderSchema.index({ createdAt: -1 });
folderSchema.index({ name: 'text', description: 'text' });

folderSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentFolderId') || this.isNew) {
        if (this.parentFolderId) {
            const parentFolder = await mongoose.model('Folder').findById(this.parentFolderId);
            if (parentFolder) {
                this.hierarchyLevel = parentFolder.hierarchyLevel + 1;
                this.hierarchyPath = parentFolder.hierarchyPath
                    ? `${parentFolder.hierarchyPath}/${this._id.toString()}`
                    : this._id.toString();
            }
        } else {
            this.hierarchyLevel = 0;
            this.hierarchyPath = this._id.toString();
        }
    }

    this.statistics.lastUpdated = new Date();
    next();
});

folderSchema.methods.isOwner = function (userId) {
    return this.owner.toString() === userId.toString();
};

folderSchema.methods.hasAccess = function (userId, requiredPermission = 'view') {
    if (this.isOwner(userId)) return true;

    const permission = this.permissions.find(p => p.userId.toString() === userId.toString());
    if (permission && (!permission.expiresAt || permission.expiresAt > new Date())) {
        const permissionHierarchy = { view: 0, edit: 1, admin: 2 };
        return permissionHierarchy[permission.permission] >= permissionHierarchy[requiredPermission];
    }

    const collaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());
    if (collaborator) {
        const roleHierarchy = { viewer: 0, editor: 1, owner: 2 };
        const requiredLevel = { view: 0, edit: 1, admin: 2 };
        return roleHierarchy[collaborator.role] >= requiredLevel[requiredPermission];
    }

    return false;
};

folderSchema.methods.grantPermission = function (userId, permission, grantedBy, expiresAt = null) {
    const existingPermission = this.permissions.find(p => p.userId.toString() === userId.toString());

    if (existingPermission) {
        existingPermission.permission = permission;
        existingPermission.expiresAt = expiresAt;
    } else {
        this.permissions.push({
            userId,
            permission,
            grantedAt: new Date(),
            grantedBy,
            expiresAt
        });
    }
};

folderSchema.methods.revokePermission = function (userId) {
    this.permissions = this.permissions.filter(p => p.userId.toString() !== userId.toString());
};

folderSchema.methods.addCollaborator = function (userId, role = 'viewer') {
    const existingCollaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());

    if (!existingCollaborator) {
        this.collaborators.push({
            userId,
            role,
            joinedAt: new Date()
        });
    }
};

folderSchema.methods.removeCollaborator = function (userId) {
    this.collaborators = this.collaborators.filter(c => c.userId.toString() !== userId.toString());
};

folderSchema.methods.updateCollaboratorRole = function (userId, newRole) {
    const collaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());
    if (collaborator) {
        collaborator.role = newRole;
    }
};

folderSchema.methods.shareWith = function (userId, permission, sharedBy) {
    const existingShare = this.sharedWith.find(s => s.userId.toString() === userId.toString());

    if (existingShare) {
        existingShare.permission = permission;
    } else {
        this.sharedWith.push({
            userId,
            permission,
            sharedAt: new Date(),
            sharedBy
        });
    }
};

folderSchema.methods.unshareWith = function (userId) {
    this.sharedWith = this.sharedWith.filter(s => s.userId.toString() !== userId.toString());
};

folderSchema.methods.addSubFolder = function (subFolderId) {
    if (!this.childFolders.includes(subFolderId)) {
        this.childFolders.push(subFolderId);
        this.statistics.totalSubFolders += 1;
        this.statistics.totalItems += 1;
    }
};

folderSchema.methods.removeSubFolder = function (subFolderId) {
    this.childFolders = this.childFolders.filter(f => f.toString() !== subFolderId.toString());
    this.statistics.totalSubFolders = Math.max(0, this.statistics.totalSubFolders - 1);
    this.statistics.totalItems = Math.max(0, this.statistics.totalItems - 1);
};

folderSchema.methods.addDocument = function (documentId, addedBy, size = 0) {
    const existingDoc = this.documents.find(d => d.documentId.toString() === documentId.toString());

    if (!existingDoc) {
        this.documents.push({
            documentId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalDocuments += 1;
        this.statistics.totalItems += 1;
        this.statistics.totalSize += size;
    }
};

folderSchema.methods.removeDocument = function (documentId, size = 0) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
    this.statistics.totalItems = Math.max(0, this.statistics.totalItems - 1);
    this.statistics.totalSize = Math.max(0, this.statistics.totalSize - size);
};

folderSchema.methods.addSheet = function (sheetId, addedBy, size = 0) {
    const existingSheet = this.sheets.find(s => s.sheetId.toString() === sheetId.toString());

    if (!existingSheet) {
        this.sheets.push({
            sheetId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalSheets += 1;
        this.statistics.totalItems += 1;
        this.statistics.totalSize += size;
    }
};

folderSchema.methods.removeSheet = function (sheetId, size = 0) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
    this.statistics.totalItems = Math.max(0, this.statistics.totalItems - 1);
    this.statistics.totalSize = Math.max(0, this.statistics.totalSize - size);
};

folderSchema.methods.addSlide = function (slideId, addedBy, size = 0) {
    const existingSlide = this.slides.find(s => s.slideId.toString() === slideId.toString());

    if (!existingSlide) {
        this.slides.push({
            slideId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalSlides += 1;
        this.statistics.totalItems += 1;
        this.statistics.totalSize += size;
    }
};

folderSchema.methods.removeSlide = function (slideId, size = 0) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
    this.statistics.totalItems = Math.max(0, this.statistics.totalItems - 1);
    this.statistics.totalSize = Math.max(0, this.statistics.totalSize - size);
};

folderSchema.methods.addLabel = function (labelId, labelName, color) {
    const existingLabel = this.labels.find(l => l.labelId === labelId);

    if (!existingLabel) {
        this.labels.push({
            labelId,
            labelName,
            color,
            createdAt: new Date()
        });
    }
};

folderSchema.methods.removeLabel = function (labelId) {
    this.labels = this.labels.filter(l => l.labelId !== labelId);
};

folderSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

folderSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

folderSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
    this.activityLog.push({
        action,
        performedBy,
        resourceType,
        resourceId,
        timestamp: new Date(),
        details
    });

    if (this.activityLog.length > 5000) {
        this.activityLog = this.activityLog.slice(-5000);
    }
};

folderSchema.methods.canCreateSubFolder = function () {
    return this.hierarchyLevel < 50;
};

folderSchema.methods.archiveFolder = function (archivedBy) {
    this.status = 'archived';
    this.archivedAt = new Date();
    this.archivedBy = archivedBy;
};

folderSchema.methods.unarchiveFolder = function () {
    this.status = 'active';
    this.archivedAt = null;
    this.archivedBy = null;
};

folderSchema.methods.lockFolder = function (lockedBy) {
    this.status = 'locked';
};

folderSchema.methods.unlockFolder = function () {
    this.status = 'active';
};

folderSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

folderSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
};

folderSchema.methods.getHierarchyPath = function () {
    return this.hierarchyPath.split('/');
};

folderSchema.methods.getAllAncestors = async function () {
    if (!this.parentFolderId) {
        return [];
    }

    const ancestors = [];
    let currentId = this.parentFolderId;

    while (currentId) {
        const parent = await mongoose.model('Folder').findById(currentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.parentFolderId;
        } else {
            break;
        }
    }

    return ancestors;
};

folderSchema.methods.getAllDescendants = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await mongoose.model('Folder').find({ parentFolderId: currentId });

        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

folderSchema.methods.calculateTotalSize = async function () {
    let totalSize = 0;

    for (const doc of this.documents) {
        totalSize += doc.fileSize || 0;
    }

    for (const sheet of this.sheets) {
        totalSize += sheet.fileSize || 0;
    }

    for (const slide of this.slides) {
        totalSize += slide.fileSize || 0;
    }

    const descendants = await this.getAllDescendants();
    for (const descendant of descendants) {
        totalSize += descendant.statistics.totalSize;
    }

    this.statistics.totalSize = totalSize;
};

folderSchema.methods.getFolderStructure = async function () {
    const structure = {
        id: this._id,
        name: this.name,
        type: 'folder',
        children: []
    };

    const childFolders = await mongoose.model('Folder').find({ parentFolderId: this._id });
    for (const child of childFolders) {
        structure.children.push(await child.getFolderStructure());
    }

    const documents = await mongoose.model('Document').find({ _id: { $in: this.documents.map(d => d.documentId) } });
    for (const doc of documents) {
        structure.children.push({
            id: doc._id,
            name: doc.name,
            type: 'document'
        });
    }

    const sheets = await mongoose.model('Sheet').find({ _id: { $in: this.sheets.map(s => s.sheetId) } });
    for (const sheet of sheets) {
        structure.children.push({
            id: sheet._id,
            name: sheet.name,
            type: 'sheet'
        });
    }

    const slides = await mongoose.model('Slide').find({ _id: { $in: this.slides.map(s => s.slideId) } });
    for (const slide of slides) {
        structure.children.push({
            id: slide._id,
            name: slide.name,
            type: 'slide'
        });
    }

    return structure;
};

folderSchema.methods.getFolderStats = function () {
    return {
        id: this._id,
        name: this.name,
        totalItems: this.statistics.totalItems,
        subFolders: this.statistics.totalSubFolders,
        documents: this.statistics.totalDocuments,
        sheets: this.statistics.totalSheets,
        slides: this.statistics.totalSlides,
        size: this.statistics.totalSize,
        sizeInMB: this.sizeInMB,
        isEmpty: this.isEmpty,
        collaborators: this.collaboratorCount,
        status: this.status
    };
};

folderSchema.methods.updateMetadata = function (metadata) {
    this.metadata = {
        ...this.metadata,
        ...metadata
    };
};

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;