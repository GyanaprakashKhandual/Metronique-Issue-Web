import mongoose from 'mongoose';

const mailLogSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true
        },
        notificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification',
            default: null
        },
        messageId: {
            type: String,

            unique: true,
            index: true
        },
        subject: {
            type: String,

            maxlength: 255
        },
        recipientEmail: {
            type: String,

            lowercase: true,
            index: true
        },
        recipientName: {
            type: String,
            default: null
        },
        senderEmail: {
            type: String,

            lowercase: true,
            default: 'noreply@projectmanagement.com'
        },
        senderName: {
            type: String,
            default: 'Project Management System'
        },
        ccEmails: [
            {
                email: String,
                name: String
            }
        ],
        bccEmails: [
            {
                email: String,
                name: String
            }
        ],
        replyToEmail: {
            type: String,
            default: null
        },
        mailType: {
            type: String,
            enum: [
                'notification',
                'invite',
                'welcome',
                'password_reset',
                'mfa_verification',
                'bug_assignment',
                'bug_status_change',
                'requirement_assignment',
                'requirement_status_change',
                'project_summary',
                'sprint_summary',
                'phase_summary',
                'daily_digest',
                'weekly_report',
                'mention',
                'access_granted',
                'access_revoked',
                'team_invitation',
                'department_invitation',
                'project_invitation',
                'document_shared',
                'system_alert',
                'error_report',
                'security_alert',
                'billing_notification',
                'custom'
            ],

            index: true
        },
        category: {
            type: String,
            enum: [
                'transactional',
                'notification',
                'digest',
                'report',
                'marketing',
                'security',
                'system',
                'billing'
            ],

            index: true
        },
        priority: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal',
            index: true
        },
        template: {
            templateId: String,
            templateName: String,
            templateVersion: Number
        },
        content: {
            htmlBody: String,
            plainTextBody: String,
            headers: mongoose.Schema.Types.Mixed
        },
        variables: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        attachments: [
            {
                fileId: String,
                fileName: String,
                fileSize: Number,
                mimeType: String,
                downloadUrl: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        embeddings: [
            {
                contentId: String,
                fileName: String,
                mimeType: String,
                content: Buffer
            }
        ],
        deliveryStatus: {
            status: {
                type: String,
                enum: ['pending', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'complained', 'suppressed'],
                default: 'pending',
                index: true
            },
            provider: {
                type: String,
                enum: ['smtp', 'sendgrid', 'aws_ses', 'mailgun', 'mailchimp', 'custom'],
                default: 'smtp'
            },
            providerMessageId: String,
            providerStatus: String,
            attemptCount: {
                type: Number,
                default: 0
            },
            maxRetries: {
                type: Number,
                default: 5
            },
            lastAttemptAt: Date,
            nextRetryAt: Date,
            sentAt: Date,
            deliveredAt: Date,
            failedAt: Date,
            failureReason: {
                code: String,
                message: String,
                details: String
            },
            bounceType: {
                type: String,
                enum: ['permanent', 'temporary', 'transient', null],
                default: null
            },
            bounceSubType: String,
            bouncedAt: Date,
            suppressionReason: {
                type: String,
                enum: [
                    'bounce',
                    'complaint',
                    'unsubscribe',
                    'suppression_list',
                    'manual',
                    null
                ],
                default: null
            },
            suppressedAt: Date
        },
        engagement: {
            isOpened: {
                type: Boolean,
                default: false,
                index: true
            },
            openCount: {
                type: Number,
                default: 0
            },
            openedAt: [Date],
            firstOpenedAt: Date,
            lastOpenedAt: Date,
            openUserAgent: String,
            openIpAddress: String,
            openLocation: {
                country: String,
                city: String,
                timezone: String
            },
            isClicked: {
                type: Boolean,
                default: false,
                index: true
            },
            clickCount: {
                type: Number,
                default: 0
            },
            clickedAt: [Date],
            firstClickedAt: Date,
            lastClickedAt: Date,
            clickedLinks: [
                {
                    url: String,
                    text: String,
                    clickCount: Number,
                    firstClickedAt: Date,
                    lastClickedAt: Date
                }
            ],
            isComplained: {
                type: Boolean,
                default: false,
                index: true
            },
            complaintAt: Date,
            complaintType: {
                type: String,
                enum: ['abuse', 'fraud', 'not_interested', 'other'],
                default: null
            },
            isUnsubscribed: {
                type: Boolean,
                default: false
            },
            unsubscribedAt: Date,
            unsubscribeReason: String
        },
        metadata: {
            resourceType: String,
            resourceId: mongoose.Schema.Types.ObjectId,
            resourceName: String,
            projectId: mongoose.Schema.Types.ObjectId,
            projectName: String,
            phaseId: mongoose.Schema.Types.ObjectId,
            phaseName: String,
            sprintId: mongoose.Schema.Types.ObjectId,
            sprintName: String,
            departmentId: mongoose.Schema.Types.ObjectId,
            departmentName: String,
            teamId: mongoose.Schema.Types.ObjectId,
            teamName: String,
            bugId: mongoose.Schema.Types.ObjectId,
            bugTitle: String,
            bugSeverity: String,
            requirementId: mongoose.Schema.Types.ObjectId,
            requirementTitle: String,
            actionUrl: String,
            actionLabel: String,
            campaignId: String,
            campaignName: String,
            batchId: String,
            triggerEvent: String,
            additionalInfo: mongoose.Schema.Types.Mixed
        },
        ipInformation: {
            senderIpAddress: String,
            senderHostname: String,
            senderIsp: String,
            recipientIpAddress: String,
            recipientHostname: String,
            recipientIsp: String
        },
        authentication: {
            dkim: {
                verified: {
                    type: Boolean,
                    default: false
                },
                signature: String
            },
            spf: {
                verified: {
                    type: Boolean,
                    default: false
                },
                result: String
            },
            dmarc: {
                verified: {
                    type: Boolean,
                    default: false
                },
                result: String
            }
        },
        scheduling: {
            scheduledTime: Date,
            timezone: String,
            sendDelay: Number,
            delayReason: String,
            sendAfterEvent: {
                eventType: String,
                eventId: mongoose.Schema.Types.ObjectId
            }
        },
        performance: {
            renderingTime: Number,
            queueWaitTime: Number,
            smtpConnectTime: Number,
            smtpSendTime: Number,
            totalSendTime: Number,
            fileSize: Number,
            recipientServerResponseTime: Number
        },
        abTest: {
            isAbTest: {
                type: Boolean,
                default: false
            },
            variant: {
                type: String,
                enum: ['control', 'variant_a', 'variant_b', 'variant_c'],
                default: null
            },
            testId: String,
            testName: String,
            abTestMetrics: {
                openRate: Number,
                clickRate: Number,
                conversionRate: Number,
                bounceRate: Number
            }
        },
        personalization: {
            isPersonalized: {
                type: Boolean,
                default: false
            },
            personalizationLevel: {
                type: String,
                enum: ['none', 'basic', 'advanced', 'dynamic'],
                default: 'none'
            },
            dynamicContent: [
                {
                    blockId: String,
                    content: String,
                    condition: String
                }
            ]
        },
        compliance: {
            consentType: {
                type: String,
                enum: ['explicit', 'implicit', 'pre_checked', 'legacy'],
                default: 'explicit'
            },
            consentObtainedAt: Date,
            unsubscribeHeaderIncluded: {
                type: Boolean,
                default: true
            },
            gdprCompliant: {
                type: Boolean,
                default: true
            },
            ccpaCompliant: {
                type: Boolean,
                default: true
            },
            caslCompliant: {
                type: Boolean,
                default: true
            },
            listUnsubscribeUrl: String,
            privacyPolicyUrl: String
        },
        webhooks: [
            {
                event: {
                    type: String,
                    enum: [
                        'sent',
                        'delivered',
                        'open',
                        'click',
                        'bounce',
                        'complaint',
                        'reject',
                        'unsubscribe'
                    ]
                },
                webhookUrl: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                payload: mongoose.Schema.Types.Mixed,
                responseStatus: Number,
                responseBody: String,
                processingStatus: {
                    type: String,
                    enum: ['pending', 'processed', 'failed'],
                    default: 'pending'
                }
            }
        ],
        tags: [String],
        customData: mongoose.Schema.Types.Mixed,
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
                changes: mongoose.Schema.Types.Mixed,
                details: String
            }
        ],
        notes: String
    },
    {
        timestamps: true,
        collection: 'maillogs',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.content.htmlBody;
                delete ret.content.plainTextBody;
                delete ret.embeddings;
                return ret;
            }
        }
    }
);

mailLogSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
});

mailLogSchema.virtual('deliveryRate').get(function () {
    if (this.deliveryStatus.status === 'delivered') return 100;
    if (this.deliveryStatus.status === 'sent') return 95;
    if (this.deliveryStatus.status === 'failed') return 0;
    if (this.deliveryStatus.status === 'bounced') return 0;
    return 50;
});

mailLogSchema.virtual('engagementScore').get(function () {
    let score = 0;

    if (this.engagement.isOpened) score += 30;
    if (this.engagement.isClicked) score += 40;
    if (this.engagement.openCount > 1) score += 10;
    if (this.engagement.clickCount > 1) score += 10;

    if (this.engagement.isComplained) score -= 50;
    if (this.engagement.isUnsubscribed) score -= 30;

    return Math.max(0, score);
});

mailLogSchema.virtual('isDelivered').get(function () {
    return ['sent', 'delivered'].includes(this.deliveryStatus.status);
});

mailLogSchema.virtual('isFailed').get(function () {
    return ['failed', 'bounced', 'complained', 'suppressed'].includes(this.deliveryStatus.status);
});

mailLogSchema.index({ organizationId: 1, createdAt: -1 });
mailLogSchema.index({ organizationId: 1, recipientEmail: 1, createdAt: -1 });
mailLogSchema.index({ messageId: 1 });
mailLogSchema.index({ organizationId: 1, 'deliveryStatus.status': 1 });
mailLogSchema.index({ organizationId: 1, mailType: 1, createdAt: -1 });
mailLogSchema.index({ organizationId: 1, category: 1, createdAt: -1 });
mailLogSchema.index({ userId: 1, createdAt: -1 });
mailLogSchema.index({ notificationId: 1 });
mailLogSchema.index({ recipientEmail: 1, 'deliveryStatus.status': 1 });
mailLogSchema.index({ 'deliveryStatus.status': 1, createdAt: -1 });
mailLogSchema.index({ 'engagement.isOpened': 1, createdAt: -1 });
mailLogSchema.index({ 'engagement.isClicked': 1, createdAt: -1 });
mailLogSchema.index({ 'metadata.projectId': 1, createdAt: -1 });
mailLogSchema.index({ 'metadata.campaignId': 1, createdAt: -1 });
mailLogSchema.index({ 'scheduling.scheduledTime': 1, 'deliveryStatus.status': 1 });
mailLogSchema.index({ tags: 1 });
mailLogSchema.index({ organizationId: 1, priority: 1 });
mailLogSchema.index({ recipientEmail: 1, 'engagement.isUnsubscribed': 1 });
mailLogSchema.index({ 'abTest.testId': 1, createdAt: -1 });
mailLogSchema.index({ organizationId: 1, 'engagement.isOpened': 1, createdAt: -1 });

mailLogSchema.pre('save', function (next) {
    if (!this.messageId) {
        this.messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    next();
});

mailLogSchema.methods.markAsSent = function (sentAt = new Date(), providerMessageId = null) {
    this.deliveryStatus.status = 'sent';
    this.deliveryStatus.sentAt = sentAt;
    this.deliveryStatus.attemptCount += 1;

    if (providerMessageId) {
        this.deliveryStatus.providerMessageId = providerMessageId;
    }
};

mailLogSchema.methods.markAsDelivered = function (deliveredAt = new Date()) {
    this.deliveryStatus.status = 'delivered';
    this.deliveryStatus.deliveredAt = deliveredAt;
};

mailLogSchema.methods.markAsFailed = function (failureReason, failedAt = new Date()) {
    this.deliveryStatus.status = 'failed';
    this.deliveryStatus.failedAt = failedAt;
    this.deliveryStatus.failureReason = {
        message: failureReason,
        code: 'SEND_FAILED',
        details: null
    };
};

mailLogSchema.methods.markAsQueued = function () {
    this.deliveryStatus.status = 'queued';
};

mailLogSchema.methods.markAsSending = function () {
    this.deliveryStatus.status = 'sending';
};

mailLogSchema.methods.recordBounce = function (bounceType, bounceSubType, bouncedAt = new Date()) {
    this.deliveryStatus.status = 'bounced';
    this.deliveryStatus.bounceType = bounceType;
    this.deliveryStatus.bounceSubType = bounceSubType;
    this.deliveryStatus.bouncedAt = bouncedAt;
};

mailLogSchema.methods.recordComplaint = function (complaintType, complainedAt = new Date()) {
    this.deliveryStatus.status = 'complained';
    this.engagement.isComplained = true;
    this.engagement.complaintAt = complainedAt;
    this.engagement.complaintType = complaintType;
};

mailLogSchema.methods.recordSuppression = function (suppressionReason, suppressedAt = new Date()) {
    this.deliveryStatus.status = 'suppressed';
    this.deliveryStatus.suppressionReason = suppressionReason;
    this.deliveryStatus.suppressedAt = suppressedAt;
};

mailLogSchema.methods.recordOpen = function (openedAt = new Date(), userAgent = null, ipAddress = null) {
    if (!this.engagement.isOpened) {
        this.engagement.isOpened = true;
        this.engagement.firstOpenedAt = openedAt;
    }

    this.engagement.openCount += 1;
    this.engagement.openedAt.push(openedAt);
    this.engagement.lastOpenedAt = openedAt;

    if (userAgent) {
        this.engagement.openUserAgent = userAgent;
    }

    if (ipAddress) {
        this.engagement.openIpAddress = ipAddress;
    }
};

mailLogSchema.methods.recordClick = function (url, text = null, clickedAt = new Date()) {
    if (!this.engagement.isClicked) {
        this.engagement.isClicked = true;
        this.engagement.firstClickedAt = clickedAt;
    }

    this.engagement.clickCount += 1;
    this.engagement.clickedAt.push(clickedAt);
    this.engagement.lastClickedAt = clickedAt;

    const existingLink = this.engagement.clickedLinks.find(l => l.url === url);

    if (existingLink) {
        existingLink.clickCount += 1;
        existingLink.lastClickedAt = clickedAt;
    } else {
        this.engagement.clickedLinks.push({
            url,
            text,
            clickCount: 1,
            firstClickedAt: clickedAt,
            lastClickedAt: clickedAt
        });
    }
};

mailLogSchema.methods.recordUnsubscribe = function (unsubscribeReason = null, unsubscribedAt = new Date()) {
    this.engagement.isUnsubscribed = true;
    this.engagement.unsubscribedAt = unsubscribedAt;
    this.engagement.unsubscribeReason = unsubscribeReason;
};

mailLogSchema.methods.scheduleRetry = function (delayMinutes = 30) {
    const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    this.deliveryStatus.nextRetryAt = nextRetryAt;
    this.deliveryStatus.status = 'pending';
};

mailLogSchema.methods.recordAttempt = function () {
    this.deliveryStatus.attemptCount += 1;
    this.deliveryStatus.lastAttemptAt = new Date();
};

mailLogSchema.methods.recordWebhook = function (event, payload, responseStatus, responseBody) {
    this.webhooks.push({
        event,
        timestamp: new Date(),
        payload,
        responseStatus,
        responseBody,
        processingStatus: 'pending'
    });

    if (this.webhooks.length > 100) {
        this.webhooks = this.webhooks.slice(-100);
    }
};

mailLogSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

mailLogSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

mailLogSchema.methods.addAuditLog = function (action, performedBy = null, changes = {}, details = '') {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        changes,
        details
    });

    if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-10000);
    }
};

mailLogSchema.methods.addCCEmail = function (email, name = null) {
    if (!this.ccEmails.find(e => e.email === email)) {
        this.ccEmails.push({ email, name });
    }
};

mailLogSchema.methods.addBCCEmail = function (email, name = null) {
    if (!this.bccEmails.find(e => e.email === email)) {
        this.bccEmails.push({ email, name });
    }
};

mailLogSchema.methods.addAttachment = function (fileId, fileName, fileSize, mimeType, downloadUrl = null) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        mimeType,
        downloadUrl,
        uploadedAt: new Date()
    });
};

mailLogSchema.methods.addEmbedding = function (contentId, fileName, mimeType, content) {
    this.embeddings.push({
        contentId,
        fileName,
        mimeType,
        content
    });
};

mailLogSchema.methods.canRetry = function () {
    return (
        this.deliveryStatus.attemptCount < this.deliveryStatus.maxRetries &&
        ['failed', 'pending'].includes(this.deliveryStatus.status)
    );
};

mailLogSchema.methods.updateMetadata = function (metadataUpdate) {
    this.metadata = {
        ...this.metadata,
        ...metadataUpdate
    };
};

mailLogSchema.methods.recordPerformance = function (performanceMetrics) {
    this.performance = {
        ...this.performance,
        ...performanceMetrics
    };
};

mailLogSchema.statics.findPendingMails = function (organizationId, limit = 100) {
    return this.find({
        organizationId,
        'deliveryStatus.status': 'pending'
    })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
};

mailLogSchema.statics.findScheduledMails = function (beforeTime = new Date(), limit = 100) {
    return this.find({
        'scheduling.scheduledTime': { $lte: beforeTime },
        'deliveryStatus.status': 'pending'
    })
        .limit(limit)
        .lean();
};

mailLogSchema.statics.findFailedMails = function (organizationId, limit = 50) {
    return this.find({
        organizationId,
        'deliveryStatus.status': 'failed',
        'deliveryStatus.attemptCount': { $lt: 5 }
    })
        .sort({ 'deliveryStatus.lastAttemptAt': 1 })
        .limit(limit)
        .lean();
};

mailLogSchema.statics.findBouncedEmails = function (organizationId, bounceType = null) {
    const query = {
        organizationId,
        'deliveryStatus.status': 'bounced'
    };

    if (bounceType) {
        query['deliveryStatus.bounceType'] = bounceType;
    }

    return this.find(query).sort({ createdAt: -1 }).lean();
};

mailLogSchema.statics.findUserMailHistory = function (recipientEmail, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    return this.find({
        recipientEmail,
        organizationId
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

mailLogSchema.statics.getMailStats = async function (organizationId, startDate, endDate) {
    const query = {
        organizationId,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    const stats = await this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalMails: { $sum: 1 },
                sentMails: {
                    $sum: {
                        $cond: [
                            { $in: ['$deliveryStatus.status', ['sent', 'delivered']] },
                            1,
                            0
                        ]
                    }
                },
                failedMails: {
                    $sum: {
                        $cond: [
                            { $in: ['$deliveryStatus.status', ['failed', 'bounced']] },
                            1,
                            0
                        ]
                    }
                },
                openedMails: {
                    $sum: { $cond: ['$engagement.isOpened', 1, 0] }
                },
                clickedMails: {
                    $sum: { $cond: ['$engagement.isClicked', 1, 0] }
                },
                complaintMails: {
                    $sum: { $cond: ['$engagement.isComplained', 1, 0] }
                },
                unsubscribedMails: {
                    $sum: { $cond: ['$engagement.isUnsubscribed', 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalMails: 0,
        sentMails: 0,
        failedMails: 0,
        openedMails: 0,
        clickedMails: 0,
        complaintMails: 0,
        unsubscribedMails: 0
    };
};

mailLogSchema.statics.getMailTypeBreakdown = async function (organizationId, startDate, endDate) {
    const query = {
        organizationId,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$mailType',
                count: { $sum: 1 },
                sent: {
                    $sum: {
                        $cond: [
                            { $in: ['$deliveryStatus.status', ['sent', 'delivered']] },
                            1,
                            0
                        ]
                    }
                },
                failed: {
                    $sum: {
                        $cond: [
                            { $in: ['$deliveryStatus.status', ['failed', 'bounced']] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

mailLogSchema.statics.getEngagementMetrics = async function (organizationId, startDate, endDate) {
    const query = {
        organizationId,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    const stats = await this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalMails: { $sum: 1 },
                openRate: {
                    $avg: { $cond: ['$engagement.isOpened', 1, 0] }
                },
                clickRate: {
                    $avg: { $cond: ['$engagement.isClicked', 1, 0] }
                },
                complaintRate: {
                    $avg: { $cond: ['$engagement.isComplained', 1, 0] }
                },
                unsubscribeRate: {
                    $avg: { $cond: ['$engagement.isUnsubscribed', 1, 0] }
                },
                avgOpenCount: { $avg: '$engagement.openCount' },
                avgClickCount: { $avg: '$engagement.clickCount' }
            }
        }
    ]);

    const result = stats[0] || {};
    return {
        totalMails: result.totalMails || 0,
        openRate: (result.openRate || 0) * 100,
        clickRate: (result.clickRate || 0) * 100,
        complaintRate: (result.complaintRate || 0) * 100,
        unsubscribeRate: (result.unsubscribeRate || 0) * 100,
        avgOpenCount: result.avgOpenCount || 0,
        avgClickCount: result.avgClickCount || 0
    };
};

mailLogSchema.statics.getMostClickedLinks = async function (organizationId, limit = 10) {
    return this.aggregate([
        { $match: { organizationId, 'engagement.clickedLinks': { $exists: true, $ne: [] } } },
        { $unwind: '$engagement.clickedLinks' },
        {
            $group: {
                _id: '$engagement.clickedLinks.url',
                text: { $first: '$engagement.clickedLinks.text' },
                totalClicks: { $sum: '$engagement.clickedLinks.clickCount' }
            }
        },
        { $sort: { totalClicks: -1 } },
        { $limit: limit }
    ]);
};

const MailLog = mongoose.model('MailLog', mailLogSchema);

export default MailLog;