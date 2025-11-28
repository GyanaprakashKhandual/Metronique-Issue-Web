import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        title: {
            type: String,
        },
        slug: {
            type: String,
        },
        description: {
            type: String,
        },
        contextType: {
            type: String,
            enum: [
                'organization',
                'department',
                'sub_department',
                'team',
                'sub_team',
                'project',
                'sub_project',
                'phase',
                'sub_phase',
                'sprint',
                'sub_sprint',
                'folder',
                'sub_folder'
            ],
            index: true
        },
        contextId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true
        },
        contextHierarchyPath: {
            type: String,
            default: null
        },
        parentContextType: {
            type: String,
            enum: [
                'organization',
                'department',
                'team',
                'project',
                'phase',
                'sprint',
                'folder'
            ],
            default: null
        },
        parentContextId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
            index: true
        },
        folderPath: {
            type: String,
            default: null
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
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
        content: {
            type: String,
            default: null
        },
        plainTextContent: {
            type: String,
            default: null
        },
        htmlContent: {
            type: String,
            default: null
        },
        documentType: {
            type: String,
            enum: [
                'text',
                'markdown',
                'rich_text',
                'template',
                'wiki',
                'guide',
                'specification',
                'requirements',
                'design',
                'architecture',
                'api_docs',
                'user_manual',
                'release_notes',
                'other'
            ],
            default: 'rich_text',
            index: true
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived', 'deleted'],
            default: 'draft',
            index: true
        },
        visibility: {
            type: String,
            enum: ['private', 'internal', 'shared', 'public'],
            default: 'private',
            index: true
        },
        isShared: {
            type: Boolean,
            default: false
        },
        sharedWith: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
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
            }
        ],
        sharedGroups: [
            {
                groupType: {
                    type: String,
                    enum: ['organization', 'department', 'team', 'project', 'custom'],
                    required: true
                },
                groupId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                groupName: String,
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
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
            }
        ],
        accessControl: {
            defaultPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            inheritedFromOrganization: {
                type: Boolean,
                default: true
            },
            inheritedFromParent: {
                type: Boolean,
                default: true
            },
            isInherited: {
                type: Boolean,
                default: false
            },
            allowedUserIds: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
            blockedUserIds: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        collaborators: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                userEmail: String,
                permission: {
                    type: String,
                    enum: ['view', 'comment', 'edit', 'admin'],
                    default: 'view'
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                },
                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        versions: [
            {
                versionNumber: Number,
                title: String,
                content: String,
                htmlContent: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                changeSummary: String,
                changeType: {
                    type: String,
                    enum: ['created', 'updated', 'published', 'archived'],
                    default: 'updated'
                }
            }
        ],
        currentVersion: {
            type: Number,
            default: 1
        },
        isVersioned: {
            type: Boolean,
            default: true
        },
        tags: [String],
        labels: [
            {
                labelId: String,
                labelName: String,
                color: String
            }
        ],
        customFields: [
            {
                fieldId: String,
                fieldName: String,
                fieldType: {
                    type: String,
                    enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox']
                },
                fieldValue: mongoose.Schema.Types.Mixed
            }
        ],
        attachments: [
            {
                fileId: String,
                fileName: String,
                fileSize: Number,
                fileType: String,
                fileUrl: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                },
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        comments: [
            {
                commentId: String,
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                content: String,
                mentions: [
                    {
                        userId: mongoose.Schema.Types.ObjectId,
                        userName: String
                    }
                ],
                createdAt: {
                    type: Date,
                    default: Date.now
                },
                updatedAt: Date,
                isEdited: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        linkedResources: [
            {
                resourceType: {
                    type: String,
                    enum: ['bug', 'requirement', 'task', 'story', 'page', 'sheet', 'slide']
                },
                resourceId: mongoose.Schema.Types.ObjectId,
                resourceName: String,
                linkType: {
                    type: String,
                    enum: ['related', 'dependency', 'reference', 'implementation']
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        metadata: {
            department: {
                departmentId: mongoose.Schema.Types.ObjectId,
                departmentName: String
            },
            team: {
                teamId: mongoose.Schema.Types.ObjectId,
                teamName: String
            },
            project: {
                projectId: mongoose.Schema.Types.ObjectId,
                projectName: String
            },
            phase: {
                phaseId: mongoose.Schema.Types.ObjectId,
                phaseName: String
            },
            sprint: {
                sprintId: mongoose.Schema.Types.ObjectId,
                sprintName: String
            },
            folder: {
                folderId: mongoose.Schema.Types.ObjectId,
                folderName: String
            }
        },
        statistics: {
            viewCount: {
                type: Number,
                default: 0
            },
            editCount: {
                type: Number,
                default: 0
            },
            commentCount: {
                type: Number,
                default: 0
            },
            shareCount: {
                type: Number,
                default: 0
            },
            collaboratorCount: {
                type: Number,
                default: 0
            }
        },
        searchableContent: {
            type: String,
            default: null
        },
        isFavorite: {
            type: Boolean,
            default: false
        },
        favoritedBy: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                favoritedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        isTemplate: {
            type: Boolean,
            default: false
        },
        templateMetadata: {
            templateName: String,
            templateDescription: String,
            templateCategory: String,
            isPublicTemplate: Boolean
        },
        publishSettings: {
            isPublished: {
                type: Boolean,
                default: false
            },
            publishedAt: Date,
            publishedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            publishedUrl: String,
            viewsAfterPublish: {
                type: Number,
                default: 0
            }
        },
        lockSettings: {
            isLocked: {
                type: Boolean,
                default: false
            },
            lockedAt: Date,
            lockedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            lockReason: String
        },
        expirySettings: {
            hasExpiry: {
                type: Boolean,
                default: false
            },
            expiresAt: Date,
            expiryNotificationSent: {
                type: Boolean,
                default: false
            }
        },
        auditLog: [
            {
                action: String,
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                details: mongoose.Schema.Types.Mixed
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: Date,
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastAccessedAt: Date,
        lastAccessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        collection: 'documents',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

documentSchema.virtual('isExpired').get(function () {
    if (!this.expirySettings.hasExpiry || !this.expirySettings.expiresAt) return false;
    return this.expirySettings.expiresAt < new Date();
});

documentSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expirySettings.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expirySettings.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

documentSchema.virtual('isSharedCount').get(function () {
    return this.sharedWith.length + this.sharedGroups.length;
});

documentSchema.virtual('versionCount').get(function () {
    return this.versions.length;
});

documentSchema.virtual('collaboratorCount').get(function () {
    return this.collaborators.length;
});

documentSchema.index({ organizationId: 1, contextType: 1, contextId: 1, isDeleted: 0 });
documentSchema.index({ organizationId: 1, createdBy: 1, isDeleted: 0 });
documentSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
documentSchema.index({ organizationId: 1, visibility: 1, isDeleted: 0 });
documentSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
documentSchema.index({ folderId: 1, isDeleted: 0 });
documentSchema.index({ departmentId: 1, isDeleted: 0 });
documentSchema.index({ teamId: 1, isDeleted: 0 });
documentSchema.index({ projectId: 1, isDeleted: 0 });
documentSchema.index({ phaseId: 1, isDeleted: 0 });
documentSchema.index({ sprintId: 1, isDeleted: 0 });
documentSchema.index({ 'sharedWith.userId': 1 });
documentSchema.index({ 'collaborators.userId': 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ lastAccessedAt: -1 });
documentSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
documentSchema.index({ tags: 1 });
documentSchema.index({ isFavorite: 1, organizationId: 1 });
documentSchema.index({ isTemplate: 1 });

documentSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    this.searchableContent = `${this.title} ${this.description || ''} ${this.plainTextContent || ''}`.toLowerCase();

    if (!this.contextHierarchyPath) {
        this.contextHierarchyPath = `${this.contextType}:${this.contextId.toString()}`;
    }

    next();
});

documentSchema.methods.canBeViewedBy = function (userId) {
    if (this.createdBy.toString() === userId.toString()) return true;
    if (this.status === 'archived' || this.isDeleted) return false;

    if (this.accessControl.blockedUserIds.some(id => id.toString() === userId.toString())) {
        return false;
    }

    if (this.visibility === 'public') return true;

    if (this.sharedWith.some(sw => sw.userId.toString() === userId.toString())) return true;

    if (this.sharedGroups.length > 0) return true;

    if (this.visibility === 'private') {
        return this.createdBy.toString() === userId.toString();
    }

    return false;
};

documentSchema.methods.canBeEditedBy = function (userId) {
    if (this.lockSettings.isLocked && this.lockSettings.lockedBy.toString() !== userId.toString()) {
        return false;
    }

    if (this.createdBy.toString() === userId.toString()) return true;

    const collaboration = this.collaborators.find(c => c.userId.toString() === userId.toString());
    return collaboration && (collaboration.permission === 'edit' || collaboration.permission === 'admin');
};

documentSchema.methods.canBeDeletedBy = function (userId) {
    return this.createdBy.toString() === userId.toString();
};

documentSchema.methods.addCollaborator = function (userId, userName, userEmail, permission = 'view', addedBy) {
    const existing = this.collaborators.find(c => c.userId.toString() === userId.toString());

    if (!existing) {
        this.collaborators.push({
            userId,
            userName,
            userEmail,
            permission,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.collaboratorCount = this.collaborators.length;
    }
};

documentSchema.methods.removeCollaborator = function (userId) {
    this.collaborators = this.collaborators.filter(c => c.userId.toString() !== userId.toString());
    this.statistics.collaboratorCount = this.collaborators.length;
};

documentSchema.methods.updateCollaboratorPermission = function (userId, newPermission) {
    const collaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());
    if (collaborator) {
        collaborator.permission = newPermission;
    }
};

documentSchema.methods.addVersion = function (content, htmlContent, createdBy, changeSummary = '', changeType = 'updated') {
    const newVersion = {
        versionNumber: this.currentVersion + 1,
        title: this.title,
        content,
        htmlContent,
        createdAt: new Date(),
        createdBy,
        changeSummary,
        changeType
    };

    this.versions.push(newVersion);
    this.currentVersion += 1;

    return newVersion;
};

documentSchema.methods.restoreVersion = function (versionNumber, restoredBy) {
    const version = this.versions.find(v => v.versionNumber === versionNumber);

    if (version) {
        this.addVersion(version.content, version.htmlContent, restoredBy, `Restored from version ${versionNumber}`, 'updated');
        return true;
    }

    return false;
};

documentSchema.methods.shareWithUser = function (userId, permission = 'view', sharedBy) {
    const existing = this.sharedWith.find(sw => sw.userId.toString() === userId.toString());

    if (!existing) {
        this.sharedWith.push({
            userId,
            permission,
            sharedAt: new Date(),
            sharedBy
        });

        this.isShared = true;
        this.statistics.shareCount = this.sharedWith.length;
    }
};

documentSchema.methods.unshareWithUser = function (userId) {
    this.sharedWith = this.sharedWith.filter(sw => sw.userId.toString() !== userId.toString());
    this.statistics.shareCount = this.sharedWith.length;

    if (this.sharedWith.length === 0 && this.sharedGroups.length === 0) {
        this.isShared = false;
    }
};

documentSchema.methods.shareWithGroup = function (groupType, groupId, groupName, permission = 'view', sharedBy) {
    const existing = this.sharedGroups.find(
        sg => sg.groupId.toString() === groupId.toString() && sg.groupType === groupType
    );

    if (!existing) {
        this.sharedGroups.push({
            groupType,
            groupId,
            groupName,
            permission,
            sharedAt: new Date(),
            sharedBy
        });

        this.isShared = true;
    }
};

documentSchema.methods.unshareWithGroup = function (groupId, groupType) {
    this.sharedGroups = this.sharedGroups.filter(
        sg => !(sg.groupId.toString() === groupId.toString() && sg.groupType === groupType)
    );

    if (this.sharedWith.length === 0 && this.sharedGroups.length === 0) {
        this.isShared = false;
    }
};

documentSchema.methods.addComment = function (commentId, userId, userName, content, mentions = []) {
    this.comments.push({
        commentId,
        userId,
        userName,
        content,
        mentions,
        createdAt: new Date(),
        isEdited: false
    });

    this.statistics.commentCount = this.comments.length;
};

documentSchema.methods.updateComment = function (commentId, newContent) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = newContent;
        comment.updatedAt = new Date();
        comment.isEdited = true;
        return true;
    }

    return false;
};

documentSchema.methods.removeComment = function (commentId) {
    this.comments = this.comments.filter(c => c.commentId !== commentId);
    this.statistics.commentCount = this.comments.length;
};

documentSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, fileUrl, uploadedBy) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        fileType,
        fileUrl,
        uploadedAt: new Date(),
        uploadedBy
    });
};

documentSchema.methods.removeAttachment = function (fileId) {
    this.attachments = this.attachments.filter(a => a.fileId !== fileId);
};

documentSchema.methods.linkResource = function (resourceType, resourceId, resourceName, linkType = 'related') {
    const existing = this.linkedResources.find(
        lr => lr.resourceId.toString() === resourceId.toString() && lr.resourceType === resourceType
    );

    if (!existing) {
        this.linkedResources.push({
            resourceType,
            resourceId,
            resourceName,
            linkType,
            linkedAt: new Date()
        });
    }
};

documentSchema.methods.unlinkResource = function (resourceId) {
    this.linkedResources = this.linkedResources.filter(lr => lr.resourceId.toString() !== resourceId.toString());
};

documentSchema.methods.addToFavorites = function (userId) {
    const existing = this.favoritedBy.find(f => f.userId.toString() === userId.toString());

    if (!existing) {
        this.favoritedBy.push({
            userId,
            favoritedAt: new Date()
        });

        this.isFavorite = true;
    }
};

documentSchema.methods.removeFromFavorites = function (userId) {
    this.favoritedBy = this.favoritedBy.filter(f => f.userId.toString() !== userId.toString());

    if (this.favoritedBy.length === 0) {
        this.isFavorite = false;
    }
};

documentSchema.methods.publishDocument = function (publishedBy) {
    this.publishSettings.isPublished = true;
    this.publishSettings.publishedAt = new Date();
    this.publishSettings.publishedBy = publishedBy;
    this.status = 'published';
};

documentSchema.methods.unpublishDocument = function () {
    this.publishSettings.isPublished = false;
    this.status = 'draft';
};

documentSchema.methods.lockDocument = function (lockedBy, reason = '') {
    this.lockSettings.isLocked = true;
    this.lockSettings.lockedAt = new Date();
    this.lockSettings.lockedBy = lockedBy;
    this.lockSettings.lockReason = reason;
};

documentSchema.methods.unlockDocument = function () {
    this.lockSettings.isLocked = false;
    this.lockSettings.lockedAt = null;
    this.lockSettings.lockedBy = null;
    this.lockSettings.lockReason = null;
};

documentSchema.methods.setExpiry = function (expiresAt) {
    this.expirySettings.hasExpiry = true;
    this.expirySettings.expiresAt = expiresAt;
};

documentSchema.methods.removeExpiry = function () {
    this.expirySettings.hasExpiry = false;
    this.expirySettings.expiresAt = null;
    this.expirySettings.expiryNotificationSent = false;
};

documentSchema.methods.recordExpiryNotification = function () {
    this.expirySettings.expiryNotificationSent = true;
};

documentSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

documentSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

documentSchema.methods.incrementViewCount = function () {
    this.statistics.viewCount += 1;
    this.lastAccessedAt = new Date();
};

documentSchema.methods.recordAccess = function (userId) {
    this.statistics.viewCount += 1;
    this.lastAccessedAt = new Date();
    this.lastAccessedBy = userId;
};

documentSchema.methods.incrementEditCount = function () {
    this.statistics.editCount += 1;
};

documentSchema.methods.incrementShareCount = function () {
    this.statistics.shareCount += 1;
};

documentSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.status = 'deleted';
};

documentSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = 'draft';
};

documentSchema.methods.archiveDocument = function () {
    this.status = 'archived';
};

documentSchema.methods.unarchiveDocument = function () {
    this.status = 'published';
};

documentSchema.methods.addAuditLog = function (action, performedBy, details = {}) {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        details
    });

    if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-10000);
    }
};

documentSchema.statics.getContextDocuments = function (organizationId, contextType, contextId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        contextType,
        contextId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email profileImage')
        .lean();
};

documentSchema.statics.getFolderDocuments = function (folderId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        folderId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email profileImage')
        .lean();
};

documentSchema.statics.getUserDocuments = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        createdBy: userId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

documentSchema.statics.getSharedDocuments = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        'sharedWith.userId': userId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

documentSchema.statics.searchDocuments = function (organizationId, searchTerm, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        $text: { $search: searchTerm },
        isDeleted: false
    })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .lean();
};

documentSchema.statics.getTemplates = function (organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        isTemplate: true,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

documentSchema.statics.getFavorites = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        'favoritedBy.userId': userId,
        isDeleted: false
    })
        .sort({ 'favoritedBy.favoritedAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

const Document = mongoose.model('Document', documentSchema);

export default Document;