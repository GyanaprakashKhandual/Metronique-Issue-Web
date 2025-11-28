import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        notificationType: {
            type: String,
            enum: [
                'bug_assigned',
                'bug_status_changed',
                'bug_priority_changed',
                'bug_severity_changed',
                'bug_commented',
                'bug_mentioned',
                'requirement_assigned',
                'requirement_status_changed',
                'requirement_priority_changed',
                'requirement_completed',
                'requirement_commented',
                'requirement_mentioned',
                'sprint_started',
                'sprint_completed',
                'sprint_story_assigned',
                'sprint_task_assigned',
                'sprint_retrospective_scheduled',
                'sprint_standup_scheduled',
                'phase_started',
                'phase_completed',
                'phase_milestone_due',
                'phase_deliverable_due',
                'project_member_added',
                'project_member_removed',
                'project_shared',
                'project_archived',
                'document_shared',
                'document_commented',
                'document_mentioned',
                'document_permission_changed',
                'sheet_shared',
                'sheet_commented',
                'sheet_mentioned',
                'sheet_permission_changed',
                'slide_shared',
                'slide_commented',
                'slide_mentioned',
                'slide_permission_changed',
                'folder_shared',
                'folder_permission_changed',
                'organization_member_added',
                'organization_member_removed',
                'organization_announcement',
                'department_announcement',
                'team_announcement',
                'team_member_added',
                'team_member_removed',
                'access_granted',
                'access_revoked',
                'access_expired',
                'invitation_sent',
                'invitation_accepted',
                'mention_in_comment',
                'mention_in_description',
                'daily_digest',
                'weekly_digest',
                'sprint_summary',
                'project_summary',
                'custom_notification',
                'system_notification'
            ],

            index: true
        },
        notificationCategory: {
            type: String,
            enum: [
                'assignment',
                'status_change',
                'collaboration',
                'sharing',
                'mention',
                'access',
                'system',
                'report',
                'reminder',
                'announcement'
            ],

            index: true
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
            index: true
        },
        resourceType: {
            type: String,
            enum: [
                'bug',
                'requirement',
                'project',
                'phase',
                'sprint',
                'document',
                'sheet',
                'slide',
                'folder',
                'organization',
                'department',
                'team',
                'user',
                'access',
                'comment',
                'invitation',
                'system'
            ],

            index: true
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,

            index: true
        },
        resourceName: {
            type: String,
            default: null
        },
        parentResourceType: {
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
        parentResourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        title: {
            type: String
        },
        message: {
            type: substring
        },
        shortMessage: {
            type: String,
            default: null
        },
        actionUrl: {
            type: String,
            default: null
        },
        actionLabel: {
            type: String,
            default: null
        },
        metadata: {
            bugSeverity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: null
            },
            bugStatus: {
                type: String,
                default: null
            },
            bugPriority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: null
            },
            requirementStatus: {
                type: String,
                default: null
            },
            requirementPriority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: null
            },
            sprintStatus: {
                type: String,
                default: null
            },
            phaseStatus: {
                type: String,
                default: null
            },
            projectStatus: {
                type: String,
                default: null
            },
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
            },
            relatedUsers: [{
                userId: mongoose.Schema.Types.ObjectId,
                userName: String,
                userEmail: String
            }],
            tags: [String],
            additionalData: mongoose.Schema.Types.Mixed
        },
        readStatus: {
            isRead: {
                type: Boolean,
                default: false,
                index: true
            },
            readAt: {
                type: Date,
                default: null
            }
        },
        deliveryStatus: {
            inApp: {
                delivered: {
                    type: Boolean,
                    default: false
                },
                deliveredAt: {
                    type: Date,
                    default: null
                },
                viewed: {
                    type: Boolean,
                    default: false
                },
                viewedAt: {
                    type: Date,
                    default: null
                }
            },
            email: {
                delivered: {
                    type: Boolean,
                    default: false
                },
                deliveredAt: {
                    type: Date,
                    default: null
                },
                opened: {
                    type: Boolean,
                    default: false
                },
                openedAt: {
                    type: Date,
                    default: null
                },
                clicked: {
                    type: Boolean,
                    default: false
                },
                clickedAt: {
                    type: Date,
                    default: null
                },
                bounced: {
                    type: Boolean,
                    default: false
                },
                bouncedAt: {
                    type: Date,
                    default: null
                },
                complained: {
                    type: Boolean,
                    default: false
                },
                complaintAt: {
                    type: Date,
                    default: null
                },
                failureReason: {
                    type: String,
                    default: null
                },
                retryCount: {
                    type: Number,
                    default: 0
                }
            },
            push: {
                delivered: {
                    type: Boolean,
                    default: false
                },
                deliveredAt: {
                    type: Date,
                    default: null
                },
                clicked: {
                    type: Boolean,
                    default: false
                },
                clickedAt: {
                    type: Date,
                    default: null
                },
                failureReason: {
                    type: String,
                    default: null
                }
            },
            sms: {
                delivered: {
                    type: Boolean,
                    default: false
                },
                deliveredAt: {
                    type: Date,
                    default: null
                },
                failureReason: {
                    type: String,
                    default: null
                },
                retryCount: {
                    type: Number,
                    default: 0
                }
            }
        },
        userPreferences: {
            channels: {
                inApp: {
                    type: Boolean,
                    default: true
                },
                email: {
                    type: Boolean,
                    default: true
                },
                push: {
                    type: Boolean,
                    default: false
                },
                sms: {
                    type: Boolean,
                    default: false
                }
            },
            muteUntil: {
                type: Date,
                default: null
            },
            isMuted: {
                type: Boolean,
                default: false
            }
        },
        relatedNotifications: [{
            notificationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Notification'
            },
            relationType: {
                type: String,
                enum: ['parent', 'child', 'related', 'grouped']
            }
        }],
        tags: [String],
        actionItems: [{
            action: {
                type: String,
                enum: ['acknowledge', 'assign', 'resolve', 'comment', 'share', 'custom']
            },
            label: String,
            value: mongoose.Schema.Types.Mixed,
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: Date,
            completedBy: mongoose.Schema.Types.ObjectId
        }],
        attachments: [{
            fileId: String,
            fileName: String,
            fileSize: Number,
            fileType: String,
            fileUrl: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        scheduledFor: {
            type: Date,
            default: null,
            index: true
        },
        sentAt: {
            type: Date,
            default: null
        },
        failureReason: {
            type: String,
            default: null
        },
        failureCode: {
            type: String,
            default: null
        },
        retryCount: {
            type: Number,
            default: 0
        },
        maxRetries: {
            type: Number,
            default: 3
        },
        nextRetryAt: {
            type: Date,
            default: null
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        archivedAt: {
            type: Date,
            default: null
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
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'notifications',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

notificationSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
});

notificationSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
});

notificationSchema.virtual('deliveryStatus').get(function () {
    const channels = this.userPreferences.channels;
    const status = [];

    if (channels.inApp && this.deliveryStatus.inApp.delivered) status.push('in-app');
    if (channels.email && this.deliveryStatus.email.delivered) status.push('email');
    if (channels.push && this.deliveryStatus.push.delivered) status.push('push');
    if (channels.sms && this.deliveryStatus.sms.delivered) status.push('sms');

    return status;
});

notificationSchema.index({ organizationId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, recipientId: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, 'readStatus.isRead': 1, createdAt: -1 });
notificationSchema.index({ notificationType: 1, createdAt: -1 });
notificationSchema.index({ notificationCategory: 1, createdAt: -1 });
notificationSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, resourceType: 1, resourceId: 1 });
notificationSchema.index({ senderId: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isDeleted: 1 });
notificationSchema.index({ 'metadata.project.projectId': 1, createdAt: -1 });
notificationSchema.index({ 'metadata.sprint.sprintId': 1, createdAt: -1 });
notificationSchema.index({ tags: 1 });
notificationSchema.index({ 'userPreferences.isMuted': 1, recipientId: 1 });
notificationSchema.index({ expiresAt: 1, isDeleted: 1 });
notificationSchema.index({ organizationId: 1, recipientId: 1, 'readStatus.isRead': 1 });

notificationSchema.pre('save', function (next) {
    if (!this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    if (!this.shortMessage && this.message) {
        this.shortMessage = this.message.substring(0, 150);
    }

    next();
});

notificationSchema.methods.markAsRead = function () {
    this.readStatus.isRead = true;
    this.readStatus.readAt = new Date();
};

notificationSchema.methods.markAsUnread = function () {
    this.readStatus.isRead = false;
    this.readStatus.readAt = null;
};

notificationSchema.methods.markInAppDelivered = function () {
    this.deliveryStatus.inApp.delivered = true;
    this.deliveryStatus.inApp.deliveredAt = new Date();
    this.sentAt = new Date();
};

notificationSchema.methods.markInAppViewed = function () {
    this.deliveryStatus.inApp.viewed = true;
    this.deliveryStatus.inApp.viewedAt = new Date();
    this.readStatus.isRead = true;
    this.readStatus.readAt = new Date();
};

notificationSchema.methods.markEmailDelivered = function () {
    this.deliveryStatus.email.delivered = true;
    this.deliveryStatus.email.deliveredAt = new Date();
};

notificationSchema.methods.markEmailOpened = function () {
    this.deliveryStatus.email.opened = true;
    this.deliveryStatus.email.openedAt = new Date();
};

notificationSchema.methods.markEmailClicked = function () {
    this.deliveryStatus.email.clicked = true;
    this.deliveryStatus.email.clickedAt = new Date();
};

notificationSchema.methods.markEmailBounced = function (reason = null) {
    this.deliveryStatus.email.bounced = true;
    this.deliveryStatus.email.bouncedAt = new Date();
    this.deliveryStatus.email.failureReason = reason;
};

notificationSchema.methods.markEmailComplaint = function () {
    this.deliveryStatus.email.complained = true;
    this.deliveryStatus.email.complaintAt = new Date();
};

notificationSchema.methods.recordEmailFailure = function (reason = null) {
    this.deliveryStatus.email.failureReason = reason;
    this.deliveryStatus.email.retryCount += 1;
    this.retryCount += 1;

    if (this.retryCount < this.maxRetries) {
        const backoffMs = Math.pow(2, this.retryCount) * 1000;
        this.nextRetryAt = new Date(Date.now() + backoffMs);
    }
};

notificationSchema.methods.markPushDelivered = function () {
    this.deliveryStatus.push.delivered = true;
    this.deliveryStatus.push.deliveredAt = new Date();
};

notificationSchema.methods.markPushClicked = function () {
    this.deliveryStatus.push.clicked = true;
    this.deliveryStatus.push.clickedAt = new Date();
    this.readStatus.isRead = true;
    this.readStatus.readAt = new Date();
};

notificationSchema.methods.recordPushFailure = function (reason = null) {
    this.deliveryStatus.push.failureReason = reason;
    this.failureReason = reason;
};

notificationSchema.methods.markSmsDelivered = function () {
    this.deliveryStatus.sms.delivered = true;
    this.deliveryStatus.sms.deliveredAt = new Date();
};

notificationSchema.methods.recordSmsFailure = function (reason = null) {
    this.deliveryStatus.sms.failureReason = reason;
    this.deliveryStatus.sms.retryCount += 1;
    this.retryCount += 1;

    if (this.retryCount < this.maxRetries) {
        const backoffMs = Math.pow(2, this.retryCount) * 1000;
        this.nextRetryAt = new Date(Date.now() + backoffMs);
    }
};

notificationSchema.methods.mute = function (duration = null) {
    this.userPreferences.isMuted = true;

    if (duration) {
        this.userPreferences.muteUntil = new Date(Date.now() + duration);
    }
};

notificationSchema.methods.unmute = function () {
    this.userPreferences.isMuted = false;
    this.userPreferences.muteUntil = null;
};

notificationSchema.methods.enableChannel = function (channel) {
    if (this.userPreferences.channels.hasOwnProperty(channel)) {
        this.userPreferences.channels[channel] = true;
    }
};

notificationSchema.methods.disableChannel = function (channel) {
    if (this.userPreferences.channels.hasOwnProperty(channel)) {
        this.userPreferences.channels[channel] = false;
    }
};

notificationSchema.methods.addRelatedNotification = function (notificationId, relationType = 'related') {
    const existingRelation = this.relatedNotifications.find(
        r => r.notificationId.toString() === notificationId.toString()
    );

    if (!existingRelation) {
        this.relatedNotifications.push({
            notificationId,
            relationType
        });
    }
};

notificationSchema.methods.addActionItem = function (action, label, value) {
    this.actionItems.push({
        action,
        label,
        value,
        completed: false
    });
};

notificationSchema.methods.completeActionItem = function (itemIndex, completedBy) {
    if (this.actionItems[itemIndex]) {
        this.actionItems[itemIndex].completed = true;
        this.actionItems[itemIndex].completedAt = new Date();
        this.actionItems[itemIndex].completedBy = completedBy;
    }
};

notificationSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, fileUrl) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        fileType,
        fileUrl,
        uploadedAt: new Date()
    });
};

notificationSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

notificationSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

notificationSchema.methods.archive = function () {
    this.isArchived = true;
    this.archivedAt = new Date();
};

notificationSchema.methods.unarchive = function () {
    this.isArchived = false;
    this.archivedAt = null;
};

notificationSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

notificationSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
};

notificationSchema.methods.schedule = function (scheduledFor) {
    this.scheduledFor = scheduledFor;
};

notificationSchema.methods.cancelSchedule = function () {
    this.scheduledFor = null;
};

notificationSchema.methods.retry = function () {
    if (this.retryCount < this.maxRetries) {
        this.retryCount += 1;
        const backoffMs = Math.pow(2, this.retryCount) * 1000;
        this.nextRetryAt = new Date(Date.now() + backoffMs);
        return true;
    }
    return false;
};

notificationSchema.methods.recordFailure = function (reason, code) {
    this.failureReason = reason;
    this.failureCode = code;
    this.retry();
};

notificationSchema.methods.getDeliveryChannels = function () {
    const channels = [];

    if (this.userPreferences.channels.inApp && this.deliveryStatus.inApp.delivered) {
        channels.push('in-app');
    }
    if (this.userPreferences.channels.email && this.deliveryStatus.email.delivered) {
        channels.push('email');
    }
    if (this.userPreferences.channels.push && this.deliveryStatus.push.delivered) {
        channels.push('push');
    }
    if (this.userPreferences.channels.sms && this.deliveryStatus.sms.delivered) {
        channels.push('sms');
    }

    return channels;
};

notificationSchema.methods.getOverallDeliveryStatus = function () {
    const channels = this.userPreferences.channels;
    let totalChannels = 0;
    let deliveredChannels = 0;

    if (channels.inApp) {
        totalChannels++;
        if (this.deliveryStatus.inApp.delivered) deliveredChannels++;
    }
    if (channels.email) {
        totalChannels++;
        if (this.deliveryStatus.email.delivered) deliveredChannels++;
    }
    if (channels.push) {
        totalChannels++;
        if (this.deliveryStatus.push.delivered) deliveredChannels++;
    }
    if (channels.sms) {
        totalChannels++;
        if (this.deliveryStatus.sms.delivered) deliveredChannels++;
    }

    if (totalChannels === 0) return 'pending';
    if (deliveredChannels === totalChannels) return 'delivered';
    if (deliveredChannels === 0) return 'failed';
    return 'partial';
};

notificationSchema.methods.updateMetadata = function (metadataUpdate) {
    this.metadata = {
        ...this.metadata,
        ...metadataUpdate
    };
};

notificationSchema.statics.createBugNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: data.notificationType,
        notificationCategory: 'assignment',
        priority: data.priority || 'medium',
        resourceType: 'bug',
        resourceId: data.bugId,
        resourceName: data.bugTitle,
        parentResourceType: 'project',
        parentResourceId: data.projectId,
        title: data.title,
        message: data.message,
        actionUrl: `/projects/${data.projectId}/bugs/${data.bugId}`,
        metadata: {
            bugSeverity: data.severity,
            bugStatus: data.status,
            bugPriority: data.priority,
            project: {
                projectId: data.projectId,
                projectName: data.projectName
            }
        }
    });
};

notificationSchema.statics.createRequirementNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: data.notificationType,
        notificationCategory: 'assignment',
        priority: data.priority || 'medium',
        resourceType: 'requirement',
        resourceId: data.requirementId,
        resourceName: data.requirementTitle,
        parentResourceType: 'project',
        parentResourceId: data.projectId,
        title: data.title,
        message: data.message,
        actionUrl: `/projects/${data.projectId}/requirements/${data.requirementId}`,
        metadata: {
            requirementStatus: data.status,
            requirementPriority: data.priority,
            project: {
                projectId: data.projectId,
                projectName: data.projectName
            }
        }
    });
};

notificationSchema.statics.createSprintNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: data.notificationType,
        notificationCategory: 'announcement',
        priority: data.priority || 'medium',
        resourceType: 'sprint',
        resourceId: data.sprintId,
        resourceName: data.sprintName,
        parentResourceType: 'project',
        parentResourceId: data.projectId,
        title: data.title,
        message: data.message,
        actionUrl: `/projects/${data.projectId}/sprints/${data.sprintId}`,
        metadata: {
            sprintStatus: data.status,
            project: {
                projectId: data.projectId,
                projectName: data.projectName
            },
            sprint: {
                sprintId: data.sprintId,
                sprintName: data.sprintName
            }
        }
    });
};

notificationSchema.statics.createPhaseNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: data.notificationType,
        notificationCategory: 'announcement',
        priority: data.priority || 'medium',
        resourceType: 'phase',
        resourceId: data.phaseId,
        resourceName: data.phaseName,
        parentResourceType: 'project',
        parentResourceId: data.projectId,
        title: data.title,
        message: data.message,
        actionUrl: `/projects/${data.projectId}/phases/${data.phaseId}`,
        metadata: {
            phaseStatus: data.status,
            project: {
                projectId: data.projectId,
                projectName: data.projectName
            },
            phase: {
                phaseId: data.phaseId,
                phaseName: data.phaseName
            }
        }
    });
};

notificationSchema.statics.createDocumentNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: data.notificationType,
        notificationCategory: 'collaboration',
        priority: data.priority || 'medium',
        resourceType: 'document',
        resourceId: data.documentId,
        resourceName: data.documentName,
        parentResourceType: data.parentResourceType || 'folder',
        parentResourceId: data.parentResourceId,
        title: data.title,
        message: data.message,
        actionUrl: `/documents/${data.documentId}`,
        metadata: {
            project: data.projectId ? {
                projectId: data.projectId,
                projectName: data.projectName
            } : undefined,
            folder: data.folderId ? {
                folderId: data.folderId,
                folderName: data.folderName
            } : undefined
        }
    });
};

notificationSchema.statics.createMentionNotification = function (data) {
    return new this({
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        senderId: data.senderId,
        notificationType: 'mention_in_comment',
        notificationCategory: 'mention',
        priority: 'high',
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceName: data.resourceName,
        parentResourceType: data.parentResourceType,
        parentResourceId: data.parentResourceId,
        title: `${data.senderName} mentioned you`,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata
    });
};

notificationSchema.statics.getPendingNotifications = function (recipientId, organizationId, limit = 50) {
    return this.find({
        recipientId,
        organizationId,
        isDeleted: false,
        scheduledFor: { $lte: new Date() }
    })
        .sort({ createdAt: -1 })
        .limit(limit);
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;