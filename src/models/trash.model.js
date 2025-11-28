import mongoose from 'mongoose';

const trashSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        resourceType: {
            type: String,
            enum: [
                'user',
                'organization',
                'department',
                'team',
                'project',
                'phase',
                'sprint',
                'folder',
                'document',
                'sheet',
                'slide',
                'bug',
                'requirement',
                'issue',
                'message',
                'comment',
                'attachment',
                'notification',
                'invite',
                'task',
                'custom'
            ],

            index: true
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,

            index: true
        },
        resourceName: {
            type: String,
            maxlength: 500
        },
        resourceData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        resourceMetadata: {
            title: String,
            description: String,
            createdAt: Date,
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            size: Number,
            mimeType: String,
            fileCount: Number,
            parentResourceType: String,
            parentResourceId: mongoose.Schema.Types.ObjectId,
            parentResourceName: String,
            customMetadata: mongoose.Schema.Types.Mixed
        },
        deletionType: {
            type: String,
            enum: ['soft_delete', 'hard_delete', 'auto_delete', 'archive', 'purge'],
            default: 'soft_delete',
            index: true
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

            index: true
        },
        deletedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        deletionReason: {
            type: String,
            maxlength: 1000,
            default: null
        },
        permanentDeletionScheduledAt: {
            type: Date,
            default: null,
            index: true
        },
        retentionPeriodDays: {
            type: Number,
            default: 30
        },
        canBeRestored: {
            type: Boolean,
            default: true,
            index: true
        },
        restoredAt: {
            type: Date,
            default: null
        },
        restoredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        restoreAttempts: {
            type: Number,
            default: 0
        },
        lastRestoreAttemptAt: {
            type: Date,
            default: null
        },
        relatedResources: [
            {
                resourceType: String,
                resourceId: mongoose.Schema.Types.ObjectId,
                resourceName: String,
                relationshipType: {
                    type: String,
                    enum: ['parent', 'child', 'reference', 'linked', 'attached', 'custom']
                },
                deletedWith: {
                    type: Boolean,
                    default: false
                }
            }
        ],
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
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
            index: true
        },
        tags: [String],
        labels: [
            {
                labelId: String,
                labelName: String,
                labelColor: String
            }
        ],
        searchableContent: {
            type: String,
            default: null
        },
        attachmentInfo: {
            fileCount: {
                type: Number,
                default: 0
            },
            totalSize: {
                type: Number,
                default: 0
            },
            attachmentTypes: [String],
            attachments: [
                {
                    attachmentId: String,
                    attachmentName: String,
                    attachmentSize: Number,
                    mimeType: String
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
                role: String,
                accessLevel: {
                    type: String,
                    enum: ['view', 'edit', 'admin']
                }
            }
        ],
        statistics: {
            viewCount: {
                type: Number,
                default: 0
            },
            commentCount: {
                type: Number,
                default: 0
            },
            attachmentCount: {
                type: Number,
                default: 0
            },
            likeCount: {
                type: Number,
                default: 0
            },
            shareCount: {
                type: Number,
                default: 0
            }
        },
        deletionContext: {
            ipAddress: String,
            userAgent: String,
            deviceInfo: {
                deviceName: String,
                osInfo: String,
                browserInfo: String
            },
            location: {
                country: String,
                city: String,
                timezone: String
            }
        },
        recoveryInfo: {
            backupLocation: String,
            backupCreatedAt: Date,
            backupSize: Number,
            canRecoverFromBackup: {
                type: Boolean,
                default: false
            },
            backupExpiresAt: Date
        },
        notificationsSent: [
            {
                notificationType: {
                    type: String,
                    enum: ['deletion_notice', 'restoration_notice', 'permanent_deletion_warning', 'custom']
                },
                sentTo: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                sentAt: {
                    type: Date,
                    default: Date.now
                },
                notificationMessage: String
            }
        ],
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
                details: String,
                changes: mongoose.Schema.Types.Mixed
            }
        ],
        complianceInfo: {
            gdprCompliant: {
                type: Boolean,
                default: true
            },
            ccpaCompliant: {
                type: Boolean,
                default: true
            },
            hipaaCompliant: {
                type: Boolean,
                default: false
            },
            dataClassification: {
                type: String,
                enum: ['public', 'internal', 'confidential', 'restricted'],
                default: 'internal'
            },
            requiresComplianceReview: {
                type: Boolean,
                default: false
            },
            complianceReviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            complianceReviewedAt: Date
        },
        retentionPolicy: {
            policyType: {
                type: String,
                enum: ['default', 'extended', 'permanent', 'custom'],
                default: 'default'
            },
            policyName: String,
            retentionDays: Number,
            autoDeleteAfterRetention: {
                type: Boolean,
                default: true
            },
            requiresApprovalForDeletion: {
                type: Boolean,
                default: false
            },
            approvalRequired: Boolean,
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            approvedAt: Date
        },
        permanentDeletionStatus: {
            type: String,
            enum: ['pending', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'],
            default: 'pending',
            index: true
        },
        permanentDeletionError: {
            errorCode: String,
            errorMessage: String,
            errorDetails: String,
            failedAt: Date,
            retryCount: {
                type: Number,
                default: 0
            },
            maxRetries: {
                type: Number,
                default: 3
            }
        },
        bulkDeletionBatchId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true
        },
        isEmpty: {
            type: Boolean,
            default: false
        },
        isExpired: {
            type: Boolean,
            default: false,
            index: true
        },
        expiresAt: {
            type: Date,
            default: null,
            index: true
        },
        status: {
            type: String,
            enum: ['in_trash', 'scheduled_for_deletion', 'deleted', 'restored', 'error'],
            default: 'in_trash',
            index: true
        },
        notes: {
            type: String,
            maxlength: 2000,
            default: null
        },
        sourceSystem: {
            type: String,
            enum: ['web', 'mobile', 'api', 'admin_panel', 'scheduled_task', 'system'],
            default: 'web'
        },
        isLocked: {
            type: Boolean,
            default: false
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lockedAt: Date,
        lockReason: String
    },
    {
        timestamps: true,
        collection: 'trash',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        },
        toObject: {
            virtuals: true
        }
    }
);

trashSchema.virtual('daysInTrash').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.deletedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

trashSchema.virtual('daysUntilPermanentDeletion').get(function () {
    const expiryDate = new Date(this.deletedAt.getTime() + this.retentionPeriodDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

trashSchema.virtual('canBeRestorednow').get(function () {
    return this.canBeRestored && this.status === 'in_trash' && !this.isExpired;
});

trashSchema.virtual('relatedResourceCount').get(function () {
    return this.relatedResources ? this.relatedResources.length : 0;
});

trashSchema.virtual('totalRelatedResourcesDeleted').get(function () {
    return this.relatedResources ? this.relatedResources.filter(r => r.deletedWith).length : 0;
});

trashSchema.virtual('hasBackup').get(function () {
    return this.recoveryInfo && this.recoveryInfo.canRecoverFromBackup;
});

trashSchema.virtual('requiresComplianceCheck').get(function () {
    return this.complianceInfo && this.complianceInfo.requiresComplianceReview;
});

trashSchema.index({ organizationId: 1, userId: 1, deletedAt: -1 });
trashSchema.index({ organizationId: 1, resourceType: 1, status: 1 });
trashSchema.index({ organizationId: 1, status: 1, isExpired: 0 });
trashSchema.index({ deletedAt: -1, permanentDeletionScheduledAt: 1 });
trashSchema.index({ organizationId: 1, canBeRestored: 1, status: 1 });
trashSchema.index({ resourceType: 1, resourceId: 1 });
trashSchema.index({ organizationId: 1, departmentId: 1, deletedAt: -1 });
trashSchema.index({ organizationId: 1, teamId: 1, deletedAt: -1 });
trashSchema.index({ organizationId: 1, projectId: 1, deletedAt: -1 });
trashSchema.index({ deletionType: 1, status: 1 });
trashSchema.index({ permanentDeletionStatus: 1, permanentDeletionScheduledAt: 1 });
trashSchema.index({ userId: 1, deletedAt: -1 });
trashSchema.index({ bulkDeletionBatchId: 1 });
trashSchema.index({ expiresAt: 1, isExpired: 1 });
trashSchema.index({ 'complianceInfo.requiresComplianceReview': 1 });
trashSchema.index({ searchableContent: 'text', resourceName: 'text' });
trashSchema.index({ createdAt: -1 });

trashSchema.pre('save', function (next) {
    this.searchableContent = `${this.resourceName || ''} ${this.deletionReason || ''}`.toLowerCase().trim();

    if (!this.permanentDeletionScheduledAt && this.retentionPeriodDays > 0) {
        this.permanentDeletionScheduledAt = new Date(
            this.deletedAt.getTime() + this.retentionPeriodDays * 24 * 60 * 60 * 1000
        );
    }

    if (this.permanentDeletionScheduledAt && this.permanentDeletionScheduledAt < new Date()) {
        this.isExpired = true;
    }

    next();
});

trashSchema.methods.restore = function (restoredBy, restoreReason = '') {
    if (!this.canBeRestored) {
        return false;
    }

    this.restoredAt = new Date();
    this.restoredBy = restoredBy;
    this.status = 'restored';
    this.canBeRestored = false;
    this.restoreAttempts += 1;
    this.lastRestoreAttemptAt = new Date();

    this.auditLog.push({
        action: 'restore',
        performedBy: restoredBy,
        timestamp: new Date(),
        details: restoreReason
    });

    return true;
};

trashSchema.methods.scheduleForPermanentDeletion = function (scheduledBy, reason = '') {
    this.permanentDeletionStatus = 'scheduled';
    this.permanentDeletionScheduledAt = new Date();

    this.auditLog.push({
        action: 'scheduled_for_permanent_deletion',
        performedBy: scheduledBy,
        timestamp: new Date(),
        details: reason
    });
};

trashSchema.methods.markAsPermanentlyDeleted = function (deletedBy, deletionDetails = '') {
    this.permanentDeletionStatus = 'completed';
    this.status = 'deleted';
    this.canBeRestored = false;

    this.auditLog.push({
        action: 'permanently_deleted',
        performedBy: deletedBy,
        timestamp: new Date(),
        details: deletionDetails
    });
};

trashSchema.methods.recordPermanentDeletionError = function (errorCode, errorMessage, errorDetails = '') {
    this.permanentDeletionStatus = 'failed';
    this.permanentDeletionError.errorCode = errorCode;
    this.permanentDeletionError.errorMessage = errorMessage;
    this.permanentDeletionError.errorDetails = errorDetails;
    this.permanentDeletionError.failedAt = new Date();
    this.permanentDeletionError.retryCount += 1;

    this.auditLog.push({
        action: 'permanent_deletion_error',
        timestamp: new Date(),
        details: `${errorCode}: ${errorMessage}`
    });
};

trashSchema.methods.retryPermanentDeletion = function () {
    if (this.permanentDeletionError.retryCount < this.permanentDeletionError.maxRetries) {
        this.permanentDeletionStatus = 'pending';
        this.permanentDeletionError.failedAt = null;
        return true;
    }
    return false;
};

trashSchema.methods.cancelPermanentDeletion = function (cancelledBy, reason = '') {
    this.permanentDeletionStatus = 'cancelled';
    this.permanentDeletionScheduledAt = null;

    this.auditLog.push({
        action: 'permanent_deletion_cancelled',
        performedBy: cancelledBy,
        timestamp: new Date(),
        details: reason
    });
};

trashSchema.methods.addRelatedResource = function (resourceType, resourceId, resourceName, relationshipType, deletedWith = false) {
    const existingRelation = this.relatedResources.find(
        r => r.resourceId.toString() === resourceId.toString()
    );

    if (!existingRelation) {
        this.relatedResources.push({
            resourceType,
            resourceId,
            resourceName,
            relationshipType,
            deletedWith
        });
    }
};

trashSchema.methods.removeRelatedResource = function (resourceId) {
    this.relatedResources = this.relatedResources.filter(
        r => r.resourceId.toString() !== resourceId.toString()
    );
};

trashSchema.methods.addAttachmentInfo = function (attachmentId, attachmentName, attachmentSize, mimeType) {
    this.attachmentInfo.attachments.push({
        attachmentId,
        attachmentName,
        attachmentSize,
        mimeType
    });

    this.attachmentInfo.fileCount += 1;
    this.attachmentInfo.totalSize += attachmentSize;

    if (!this.attachmentInfo.attachmentTypes.includes(mimeType)) {
        this.attachmentInfo.attachmentTypes.push(mimeType);
    }
};

trashSchema.methods.sendDeletionNotice = function (notifyTo, notificationMessage = '') {
    this.notificationsSent.push({
        notificationType: 'deletion_notice',
        sentTo: notifyTo,
        sentAt: new Date(),
        notificationMessage
    });
};

trashSchema.methods.sendRestorationNotice = function (notifyTo, notificationMessage = '') {
    this.notificationsSent.push({
        notificationType: 'restoration_notice',
        sentTo: notifyTo,
        sentAt: new Date(),
        notificationMessage
    });
};

trashSchema.methods.sendPermanentDeletionWarning = function (notifyTo, notificationMessage = '') {
    this.notificationsSent.push({
        notificationType: 'permanent_deletion_warning',
        sentTo: notifyTo,
        sentAt: new Date(),
        notificationMessage
    });
};

trashSchema.methods.addComplianceReview = function (reviewedBy) {
    this.complianceInfo.requiresComplianceReview = false;
    this.complianceInfo.complianceReviewedBy = reviewedBy;
    this.complianceInfo.complianceReviewedAt = new Date();

    this.auditLog.push({
        action: 'compliance_review_completed',
        performedBy: reviewedBy,
        timestamp: new Date(),
        details: 'Compliance review completed'
    });
};

trashSchema.methods.lockForReview = function (lockedBy, reason = '') {
    this.isLocked = true;
    this.lockedBy = lockedBy;
    this.lockedAt = new Date();
    this.lockReason = reason;

    this.auditLog.push({
        action: 'locked_for_review',
        performedBy: lockedBy,
        timestamp: new Date(),
        details: reason
    });
};

trashSchema.methods.unlockFromReview = function (unlockedBy) {
    this.isLocked = false;
    this.lockedBy = null;
    this.lockedAt = null;
    this.lockReason = null;

    this.auditLog.push({
        action: 'unlocked_from_review',
        performedBy: unlockedBy,
        timestamp: new Date()
    });
};

trashSchema.methods.addCollaborator = function (userId, userName, userEmail, role, accessLevel) {
    const existingCollaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());

    if (!existingCollaborator) {
        this.collaborators.push({
            userId,
            userName,
            userEmail,
            role,
            accessLevel
        });
    }
};

trashSchema.methods.removeCollaborator = function (userId) {
    this.collaborators = this.collaborators.filter(c => c.userId.toString() !== userId.toString());
};

trashSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

trashSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

trashSchema.methods.addAuditLog = function (action, performedBy, details = '', changes = {}) {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        details,
        changes
    });

    if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-10000);
    }
};

trashSchema.methods.getAuditHistory = function (limit = 50) {
    return this.auditLog.slice(-limit).reverse();
};

trashSchema.methods.setRetentionPolicy = function (policyType, policyName, retentionDays, autoDelete) {
    this.retentionPolicy.policyType = policyType;
    this.retentionPolicy.policyName = policyName;
    this.retentionPolicy.retentionDays = retentionDays;
    this.retentionPolicy.autoDeleteAfterRetention = autoDelete;
    this.retentionPeriodDays = retentionDays;
};

trashSchema.methods.approveForDeletion = function (approvedBy) {
    this.retentionPolicy.approvalRequired = false;
    this.retentionPolicy.approvedBy = approvedBy;
    this.retentionPolicy.approvedAt = new Date();

    this.auditLog.push({
        action: 'deletion_approved',
        performedBy: approvedBy,
        timestamp: new Date(),
        details: 'Permanent deletion approved'
    });
};

trashSchema.methods.rejectDeletion = function (rejectedBy, reason = '') {
    this.permanentDeletionStatus = 'cancelled';
    this.canBeRestored = true;

    this.auditLog.push({
        action: 'deletion_rejected',
        performedBy: rejectedBy,
        timestamp: new Date(),
        details: reason
    });
};

trashSchema.statics.findExpiredTrash = function (organizationId) {
    return this.find({
        organizationId,
        status: 'in_trash',
        isExpired: true,
        permanentDeletionStatus: 'pending'
    });
};

trashSchema.statics.findDueForDeletion = function (organizationId) {
    const now = new Date();

    return this.find({
        organizationId,
        permanentDeletionScheduledAt: { $lte: now },
        permanentDeletionStatus: 'scheduled'
    });
};

trashSchema.statics.findByUser = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        userId,
        organizationId,
        status: 'in_trash'
    })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

trashSchema.statics.findByResourceType = function (organizationId, resourceType, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        resourceType,
        status: 'in_trash'
    })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

trashSchema.statics.getTrashStats = async function (organizationId) {
    const stats = await this.aggregate([
        { $match: { organizationId, status: 'in_trash' } },
        {
            $group: {
                _id: null,
                totalItems: { $sum: 1 },
                byResourceType: { $push: '$resourceType' },
                totalSize: { $sum: '$attachmentInfo.totalSize' },
                expiredItems: {
                    $sum: { $cond: ['$isExpired', 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalItems: 0,
        byResourceType: [],
        totalSize: 0,
        expiredItems: 0
    };
};

trashSchema.statics.searchTrash = function (organizationId, searchTerm, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        $text: { $search: searchTerm },
        status: 'in_trash'
    })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean();
};

trashSchema.statics.emptyTrashForOrganization = async function (organizationId, olderThanDays = 90) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    return this.deleteMany({
        organizationId,
        status: 'deleted',
        deletedAt: { $lt: cutoffDate }
    });
};

trashSchema.statics.permanentlyDeleteBatch = async function (trashIds, deletedBy) {
    return this.updateMany(
        { _id: { $in: trashIds } },
        {
            permanentDeletionStatus: 'completed',
            status: 'deleted',
            canBeRestored: false,
            'auditLog.action': 'permanently_deleted',
            'auditLog.performedBy': deletedBy,
            'auditLog.timestamp': new Date()
        }
    );
};

const Trash = mongoose.model('Trash', trashSchema);

export default Trash;