import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
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
                'direct_message'
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
                'sprint'
            ],
            default: null
        },
        parentContextId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

            index: true
        },
        senderName: {
            type: String,
            default: null
        },
        senderEmail: {
            type: String,
            lowercase: true,
            default: null
        },
        senderProfileImage: {
            type: String,
            default: null
        },
        recipientIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        messageType: {
            type: String,
            enum: ['text', 'file', 'mention', 'system', 'thread_reply', 'edited', 'deleted'],
            default: 'text',
            index: true
        },
        content: {
            type: String,

            maxlength: 5000
        },
        plainTextContent: {
            type: String,
            default: null
        },
        mentions: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                userEmail: String,
                mentionedAt: {
                    type: Date,
                    default: Date.now
                }
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
        emoji: [
            {
                emoji: String,
                count: Number,
                reactedBy: [
                    {
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        },
                        reactedAt: {
                            type: Date,
                            default: Date.now
                        }
                    }
                ]
            }
        ],
        threadSettings: {
            isThreadReply: {
                type: Boolean,
                default: false,
                index: true
            },
            parentMessageId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message',
                default: null,
                index: true
            },
            threadCount: {
                type: Number,
                default: 0
            },
            lastReplyAt: {
                type: Date,
                default: null
            },
            lastReplyBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        editHistory: [
            {
                editedAt: {
                    type: Date,
                    default: Date.now
                },
                editedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                previousContent: String,
                editReason: String
            }
        ],
        visibility: {
            type: String,
            enum: ['public', 'private', 'restricted'],
            default: 'public'
        },
        readBy: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                readAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        deliveryStatus: {
            status: {
                type: String,
                enum: ['pending', 'sent', 'delivered', 'failed'],
                default: 'pending',
                index: true
            },
            sentAt: Date,
            deliveredAt: Date,
            failureReason: String,
            failedAt: Date,
            retryCount: {
                type: Number,
                default: 0
            }
        },
        isImportant: {
            type: Boolean,
            default: false
        },
        isPinned: {
            type: Boolean,
            default: false,
            index: true
        },
        pinnedAt: Date,
        pinnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isMuted: {
            type: Boolean,
            default: false
        },
        mutedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
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
        deletionReason: String,
        isSoftDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        softDeletedAt: Date,
        softDeletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        linkedResource: {
            resourceType: {
                type: String,
                enum: [
                    'bug',
                    'requirement',
                    'task',
                    'story',
                    'document',
                    'sheet',
                    'slide',
                    'attachment'
                ],
                default: null
            },
            resourceId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            resourceName: String,
            resourceUrl: String
        },
        systemMessage: {
            type: Boolean,
            default: false
        },
        systemMessageType: {
            type: String,
            enum: [
                'member_joined',
                'member_left',
                'member_added',
                'member_removed',
                'name_changed',
                'description_changed',
                'context_created',
                'context_archived',
                'context_restored',
                'access_granted',
                'access_revoked'
            ],
            default: null
        },
        systemData: {
            affectedUserId: mongoose.Schema.Types.ObjectId,
            affectedUserName: String,
            affectedUserEmail: String,
            changeDetails: mongoose.Schema.Types.Mixed
        },
        metadata: {
            ipAddress: String,
            userAgent: String,
            deviceInfo: {
                deviceName: String,
                osInfo: String,
                browserInfo: String
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
            }
        },
        searchableContent: {
            type: String,
            default: null
        },
        tags: [String],
        customData: mongoose.Schema.Types.Mixed,
        accessControl: {
            isPublic: {
                type: Boolean,
                default: true
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
        reactions: {
            totalReactions: {
                type: Number,
                default: 0
            },
            reactionSummary: mongoose.Schema.Types.Mixed
        },
        stats: {
            viewCount: {
                type: Number,
                default: 0
            },
            readCount: {
                type: Number,
                default: 0
            },
            replyCount: {
                type: Number,
                default: 0
            },
            shareCount: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true,
        collection: 'messages',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

messageSchema.virtual('isUnread').get(function () {
    return this.readBy.length === 0;
});

messageSchema.virtual('readCount').get(function () {
    return this.readBy.length;
});

messageSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
});

messageSchema.virtual('isEdited').get(function () {
    return this.editHistory.length > 0;
});

messageSchema.virtual('lastEditTime').get(function () {
    if (this.editHistory.length === 0) return null;
    return this.editHistory[this.editHistory.length - 1].editedAt;
});

messageSchema.virtual('canBeEdited').get(function () {
    const now = new Date();
    const messageAge = now - this.createdAt;
    const fifteenMinutes = 15 * 60 * 1000;
    return messageAge < fifteenMinutes && !this.isDeleted;
});

messageSchema.virtual('mentionedUserCount').get(function () {
    return this.mentions.length;
});

messageSchema.virtual('hasAttachments').get(function () {
    return this.attachments.length > 0;
});

messageSchema.virtual('attachmentCount').get(function () {
    return this.attachments.length;
});

messageSchema.virtual('isSystemNotification').get(function () {
    return this.systemMessage === true;
});

messageSchema.index({ organizationId: 1, contextType: 1, contextId: 1, createdAt: -1 });
messageSchema.index({ organizationId: 1, contextId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ organizationId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
messageSchema.index({ 'threadSettings.parentMessageId': 1 });
messageSchema.index({ 'threadSettings.isThreadReply': 1 });
messageSchema.index({ recipientIds: 1 });
messageSchema.index({ 'readBy.userId': 1 });
messageSchema.index({ isPinned: 1, contextId: 1, createdAt: -1 });
messageSchema.index({ organizationId: 1, createdAt: -1 });
messageSchema.index({ messageType: 1, createdAt: -1 });
messageSchema.index({ 'deliveryStatus.status': 1 });
messageSchema.index({ searchableContent: 'text', content: 'text', subject: 'text' });
messageSchema.index({ parentContextId: 1, contextType: 1 });
messageSchema.index({ tags: 1 });
messageSchema.index({ isDeleted: 1, isSoftDeleted: 1 });
messageSchema.index({ organizationId: 1, contextType: 1, isPinned: 1, createdAt: -1 });

messageSchema.pre('save', function (next) {
    this.searchableContent = `${this.content} ${this.senderName || ''} ${this.plainTextContent || ''}`.toLowerCase();

    if (!this.contextHierarchyPath) {
        this.contextHierarchyPath = `${this.contextType}:${this.contextId.toString()}`;
    }

    if (this.emoji && this.emoji.length > 0) {
        this.reactions.totalReactions = this.emoji.reduce((sum, e) => sum + (e.count || 0), 0);
        this.reactions.reactionSummary = this.emoji.reduce((acc, e) => {
            acc[e.emoji] = e.count || 0;
            return acc;
        }, {});
    }

    next();
});

messageSchema.methods.canBeViewedBy = function (userId) {
    if (this.senderId.toString() === userId.toString()) return true;

    if (this.accessControl.blockedUserIds.some(id => id.toString() === userId.toString())) {
        return false;
    }

    if (!this.accessControl.isPublic) {
        return this.accessControl.allowedUserIds.some(id => id.toString() === userId.toString());
    }

    return true;
};

messageSchema.methods.canBeEditedBy = function (userId) {
    if (this.isDeleted || this.isSoftDeleted) return false;
    if (this.senderId.toString() !== userId.toString()) return false;
    return this.canBeEdited;
};

messageSchema.methods.canBeDeletedBy = function (userId) {
    return this.senderId.toString() === userId.toString() || true;
};

messageSchema.methods.markAsRead = function (userId, readAt = new Date()) {
    const existingRead = this.readBy.find(r => r.userId.toString() === userId.toString());

    if (!existingRead) {
        this.readBy.push({
            userId,
            readAt
        });
        this.stats.readCount = this.readBy.length;
    }
};

messageSchema.methods.markAsUnread = function (userId) {
    this.readBy = this.readBy.filter(r => r.userId.toString() !== userId.toString());
    this.stats.readCount = this.readBy.length;
};

messageSchema.methods.editMessage = function (newContent, editedBy, editReason = '') {
    if (!this.canBeEditedBy(editedBy)) {
        return false;
    }

    this.editHistory.push({
        editedAt: new Date(),
        editedBy,
        previousContent: this.content,
        editReason
    });

    this.content = newContent;
    this.plainTextContent = newContent.replace(/<[^>]*>/g, '');
    this.messageType = 'edited';

    return true;
};

messageSchema.methods.softDelete = function (deletedBy, reason = '') {
    this.isSoftDeleted = true;
    this.softDeletedAt = new Date();
    this.softDeletedBy = deletedBy;
    this.deletionReason = reason;
    this.content = '[Message deleted]';
};

messageSchema.methods.hardDelete = function (deletedBy, reason = '') {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.deletionReason = reason;
};

messageSchema.methods.restoreSoftDelete = function () {
    if (!this.isSoftDeleted) return false;

    this.isSoftDeleted = false;
    this.softDeletedAt = null;
    this.softDeletedBy = null;
    this.deletionReason = null;

    return true;
};

messageSchema.methods.addMention = function (userId, userName, userEmail) {
    const existingMention = this.mentions.find(m => m.userId.toString() === userId.toString());

    if (!existingMention) {
        this.mentions.push({
            userId,
            userName,
            userEmail,
            mentionedAt: new Date()
        });
    }
};

messageSchema.methods.removeMention = function (userId) {
    this.mentions = this.mentions.filter(m => m.userId.toString() !== userId.toString());
};

messageSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, fileUrl, uploadedBy) {
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

messageSchema.methods.removeAttachment = function (fileId) {
    this.attachments = this.attachments.filter(a => a.fileId !== fileId);
};

messageSchema.methods.addReaction = function (emoji, userId) {
    let emojiRecord = this.emoji.find(e => e.emoji === emoji);

    if (!emojiRecord) {
        emojiRecord = {
            emoji,
            count: 0,
            reactedBy: []
        };
        this.emoji.push(emojiRecord);
    }

    const alreadyReacted = emojiRecord.reactedBy.some(r => r.userId.toString() === userId.toString());

    if (!alreadyReacted) {
        emojiRecord.reactedBy.push({
            userId,
            reactedAt: new Date()
        });
        emojiRecord.count = emojiRecord.reactedBy.length;
    }
};

messageSchema.methods.removeReaction = function (emoji, userId) {
    const emojiRecord = this.emoji.find(e => e.emoji === emoji);

    if (emojiRecord) {
        emojiRecord.reactedBy = emojiRecord.reactedBy.filter(
            r => r.userId.toString() !== userId.toString()
        );
        emojiRecord.count = emojiRecord.reactedBy.length;

        if (emojiRecord.count === 0) {
            this.emoji = this.emoji.filter(e => e.emoji !== emoji);
        }
    }
};

messageSchema.methods.pinMessage = function (pinnedBy) {
    this.isPinned = true;
    this.pinnedAt = new Date();
    this.pinnedBy = pinnedBy;
};

messageSchema.methods.unpinMessage = function () {
    this.isPinned = false;
    this.pinnedAt = null;
    this.pinnedBy = null;
};

messageSchema.methods.muteForUser = function (userId) {
    if (!this.mutedBy.includes(userId)) {
        this.mutedBy.push(userId);
    }
};

messageSchema.methods.unmuteForUser = function (userId) {
    this.mutedBy = this.mutedBy.filter(id => id.toString() !== userId.toString());
};

messageSchema.methods.addThreadReply = function () {
    this.threadSettings.threadCount += 1;
    this.threadSettings.lastReplyAt = new Date();
};

messageSchema.methods.updateLastThreadReply = function (userId) {
    this.threadSettings.lastReplyAt = new Date();
    this.threadSettings.lastReplyBy = userId;
};

messageSchema.methods.incrementViewCount = function () {
    this.stats.viewCount += 1;
};

messageSchema.methods.incrementShareCount = function () {
    this.stats.shareCount += 1;
};

messageSchema.methods.linkResource = function (resourceType, resourceId, resourceName, resourceUrl) {
    this.linkedResource.resourceType = resourceType;
    this.linkedResource.resourceId = resourceId;
    this.linkedResource.resourceName = resourceName;
    this.linkedResource.resourceUrl = resourceUrl;
};

messageSchema.methods.unlinkResource = function () {
    this.linkedResource = {
        resourceType: null,
        resourceId: null,
        resourceName: null,
        resourceUrl: null
    };
};

messageSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

messageSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

messageSchema.methods.recordDelivery = function (deliveredAt = new Date()) {
    this.deliveryStatus.status = 'delivered';
    this.deliveryStatus.deliveredAt = deliveredAt;
};

messageSchema.methods.recordSent = function (sentAt = new Date()) {
    this.deliveryStatus.status = 'sent';
    this.deliveryStatus.sentAt = sentAt;
};

messageSchema.methods.recordFailure = function (reason = '', failedAt = new Date()) {
    this.deliveryStatus.status = 'failed';
    this.deliveryStatus.failedAt = failedAt;
    this.deliveryStatus.failureReason = reason;
    this.deliveryStatus.retryCount += 1;
};

messageSchema.methods.resetDeliveryStatus = function () {
    this.deliveryStatus.status = 'pending';
    this.deliveryStatus.sentAt = null;
    this.deliveryStatus.deliveredAt = null;
    this.deliveryStatus.failedAt = null;
    this.deliveryStatus.failureReason = null;
};

messageSchema.statics.getContextMessages = function (organizationId, contextType, contextId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;
    const excludeDeleted = options.excludeDeleted !== false;

    const query = {
        organizationId,
        contextType,
        contextId
    };

    if (excludeDeleted) {
        query.isDeleted = false;
        query.isSoftDeleted = false;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName email profileImage')
        .populate('mentions.userId', 'firstName lastName email')
        .lean();
};

messageSchema.statics.getThreadMessages = function (parentMessageId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        'threadSettings.parentMessageId': parentMessageId,
        'threadSettings.isThreadReply': true,
        isDeleted: false,
        isSoftDeleted: false
    })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName email profileImage')
        .lean();
};

messageSchema.statics.searchMessages = function (organizationId, contextType, searchTerm, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const query = {
        organizationId,
        contextType,
        $text: { $search: searchTerm },
        isDeleted: false,
        isSoftDeleted: false
    };

    return this.find(query)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName email profileImage')
        .lean();
};

messageSchema.statics.getPinnedMessages = function (contextType, contextId, limit = 20) {
    return this.find({
        contextType,
        contextId,
        isPinned: true,
        isDeleted: false,
        isSoftDeleted: false
    })
        .sort({ pinnedAt: -1 })
        .limit(limit)
        .populate('senderId', 'firstName lastName email profileImage')
        .lean();
};

messageSchema.statics.getUserMessages = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        senderId: userId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

messageSchema.statics.getUnreadMessagesCount = function (userId, contextType, contextId) {
    return this.countDocuments({
        contextType,
        contextId,
        'readBy.userId': { $ne: userId },
        isDeleted: false,
        isSoftDeleted: false
    });
};

messageSchema.statics.getFailedDeliveryMessages = function (organizationId, limit = 100) {
    return this.find({
        organizationId,
        'deliveryStatus.status': 'failed',
        'deliveryStatus.retryCount': { $lt: 3 }
    })
        .limit(limit)
        .lean();
};

messageSchema.statics.getMentionedMessages = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        organizationId,
        'mentions.userId': userId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName email profileImage')
        .lean();
};

messageSchema.statics.getContextStats = async function (contextType, contextId) {
    const stats = await this.aggregate([
        {
            $match: {
                contextType,
                contextId,
                isDeleted: false,
                isSoftDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                uniqueSenders: { $addToSet: '$senderId' },
                totalReactions: { $sum: { $size: '$emoji' } },
                totalAttachments: { $sum: { $size: '$attachments' } },
                lastMessageAt: { $max: '$createdAt' }
            }
        },
        {
            $project: {
                totalMessages: 1,
                uniqueSenders: { $size: '$uniqueSenders' },
                totalReactions: 1,
                totalAttachments: 1,
                lastMessageAt: 1
            }
        }
    ]);

    return stats[0] || {
        totalMessages: 0,
        uniqueSenders: 0,
        totalReactions: 0,
        totalAttachments: 0
    };
};

messageSchema.statics.deleteOldMessages = async function (organizationId, daysOld = 365) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    return this.deleteMany({
        organizationId,
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
    });
};

messageSchema.statics.archiveMessagesBeforeDate = async function (organizationId, beforeDate) {
    return this.updateMany(
        {
            organizationId,
            createdAt: { $lt: beforeDate },
            isDeleted: false
        },
        {
            archived: true,
            archivedAt: new Date()
        }
    );
};

messageSchema.statics.getActiveContexts = async function (organizationId, days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.aggregate([
        {
            $match: {
                organizationId,
                createdAt: { $gte: startDate },
                isDeleted: false
            }
        },
        {
            $group: {
                _id: {
                    contextType: '$contextType',
                    contextId: '$contextId'
                },
                messageCount: { $sum: 1 },
                lastActivity: { $max: '$createdAt' },
                uniqueUsers: { $addToSet: '$senderId' }
            }
        },
        {
            $sort: { lastActivity: -1 }
        },
        {
            $project: {
                contextType: '$_id.contextType',
                contextId: '$_id.contextId',
                messageCount: 1,
                lastActivity: 1,
                uniqueUserCount: { $size: '$uniqueUsers' }
            }
        }
    ]);
};

const Message = mongoose.model('Message', messageSchema);

export default Message;