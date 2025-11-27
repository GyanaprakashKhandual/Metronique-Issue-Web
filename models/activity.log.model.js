import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
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
        action: {
            type: String,

            enum: [
                // User Actions
                'user_created', 'user_updated', 'user_deleted', 'user_login', 'user_logout',
                'user_password_changed', 'user_mfa_enabled', 'user_mfa_disabled', 'user_session_created',
                'user_session_terminated', 'user_profile_updated', 'user_preferences_updated',

                // Organization Actions
                'organization_created', 'organization_updated', 'organization_deleted',
                'organization_member_added', 'organization_member_removed', 'organization_admin_added',
                'organization_admin_removed', 'organization_settings_updated',

                // Department Actions
                'department_created', 'department_updated', 'department_deleted',
                'department_member_added', 'department_member_removed', 'department_admin_added',
                'department_admin_removed',

                // Team Actions
                'team_created', 'team_updated', 'team_deleted', 'team_member_added',
                'team_member_removed', 'team_admin_added', 'team_admin_removed',
                'team_archived', 'team_restored',

                // Project Actions
                'project_created', 'project_updated', 'project_deleted', 'project_archived',
                'project_restored', 'project_member_added', 'project_member_removed',
                'project_admin_added', 'project_admin_removed', 'project_status_changed',
                'project_settings_updated',

                // Phase Actions
                'phase_created', 'phase_updated', 'phase_deleted', 'phase_started',
                'phase_completed', 'phase_cancelled', 'phase_on_hold', 'phase_milestone_added',
                'phase_milestone_completed', 'phase_deliverable_added', 'phase_deliverable_submitted',
                'phase_dependency_added', 'phase_dependency_removed',

                // Sprint Actions
                'sprint_created', 'sprint_updated', 'sprint_deleted', 'sprint_started',
                'sprint_completed', 'sprint_paused', 'sprint_resumed', 'sprint_cancelled',
                'sprint_story_added', 'sprint_story_updated', 'sprint_story_completed',
                'sprint_task_added', 'sprint_task_updated', 'sprint_task_completed',
                'sprint_retrospective_completed', 'sprint_standup_recorded',

                // Folder Actions
                'folder_created', 'folder_updated', 'folder_deleted', 'folder_moved',
                'folder_archived', 'folder_restored', 'folder_shared', 'folder_unshared',
                'folder_permission_changed', 'folder_locked', 'folder_unlocked',

                // Document Actions
                'document_created', 'document_updated', 'document_deleted', 'document_viewed',
                'document_shared', 'document_unshared', 'document_version_created',
                'document_restored', 'document_moved', 'document_exported', 'document_imported',
                'document_permission_changed', 'document_comment_added', 'document_comment_deleted',

                // Sheet Actions
                'sheet_created', 'sheet_updated', 'sheet_deleted', 'sheet_viewed',
                'sheet_shared', 'sheet_unshared', 'sheet_version_created', 'sheet_restored',
                'sheet_moved', 'sheet_exported', 'sheet_imported', 'sheet_cell_updated',
                'sheet_row_added', 'sheet_row_deleted', 'sheet_column_added', 'sheet_column_deleted',

                // Slide Actions
                'slide_created', 'slide_updated', 'slide_deleted', 'slide_viewed',
                'slide_shared', 'slide_unshared', 'slide_version_created', 'slide_restored',
                'slide_moved', 'slide_exported', 'slide_presentation_started',
                'slide_page_added', 'slide_page_deleted', 'slide_page_reordered',

                // Bug Actions
                'bug_created', 'bug_updated', 'bug_deleted', 'bug_assigned',
                'bug_status_changed', 'bug_priority_changed', 'bug_severity_changed',
                'bug_resolved', 'bug_closed', 'bug_reopened', 'bug_comment_added',
                'bug_attachment_added', 'bug_attachment_removed',

                // Requirement Actions
                'requirement_created', 'requirement_updated', 'requirement_deleted',
                'requirement_assigned', 'requirement_status_changed', 'requirement_priority_changed',
                'requirement_completed', 'requirement_reopened', 'requirement_comment_added',

                // Access Control Actions
                'access_granted', 'access_revoked', 'access_updated', 'access_delegated',
                'access_delegation_revoked', 'permission_upgraded', 'permission_downgraded',
                'access_expired', 'access_restored',

                // Invitation Actions
                'invitation_created', 'invitation_sent', 'invitation_accepted',
                'invitation_declined', 'invitation_expired', 'invitation_cancelled',
                'invitation_resent',

                // Integration Actions
                'integration_connected', 'integration_disconnected', 'integration_synced',
                'integration_error',

                // System Actions
                'system_backup_created', 'system_maintenance_started', 'system_maintenance_completed',
                'system_error', 'system_warning'
            ],
            index: true
        },
        resourceType: {
            type: String,

            enum: [
                'user', 'organization', 'department', 'team', 'project', 'phase', 'sprint',
                'folder', 'document', 'sheet', 'slide', 'bug', 'requirement',
                'accesscontrol', 'invitation', 'integration', 'system'
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
                'organization', 'department', 'team', 'project', 'phase', 'sprint', 'folder'
            ],
            default: null
        },
        parentResourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true
        },
        actionCategory: {
            type: String,
            enum: [
                'create', 'read', 'update', 'delete', 'share', 'access',
                'permission', 'status', 'assignment', 'collaboration', 'system'
            ],

            index: true
        },
        severity: {
            type: String,
            enum: ['info', 'low', 'medium', 'high', 'critical'],
            default: 'info',
            index: true
        },
        ipAddress: {
            type: String,
            default: null
        },
        userAgent: {
            type: String,
            default: null
        },
        deviceInfo: {
            deviceName: String,
            osInfo: String,
            browserInfo: String,
            isMobile: {
                type: Boolean,
                default: false
            },
            location: {
                country: String,
                city: String,
                timezone: String
            }
        },
        changes: {
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed,
            fields: [String],
            summary: String
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
            additionalInfo: mongoose.Schema.Types.Mixed
        },
        details: {
            type: String,
            maxlength: 2000,
            default: null
        },
        tags: [String],
        isSuccessful: {
            type: Boolean,
            default: true
        },
        errorMessage: {
            type: String,
            default: null
        },
        errorCode: {
            type: String,
            default: null
        },
        executionTime: {
            type: Number,
            default: null
        },
        affectedUsers: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            userName: String,
            affectedAt: {
                type: Date,
                default: Date.now
            }
        }],
        relatedActivities: [{
            activityId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ActivityLog'
            },
            relationType: {
                type: String,
                enum: ['parent', 'child', 'related', 'triggered_by', 'triggered']
            }
        }],
        isSystemGenerated: {
            type: Boolean,
            default: false
        },
        isVisible: {
            type: Boolean,
            default: true
        },
        visibilityScope: {
            type: String,
            enum: ['public', 'organization', 'department', 'team', 'project', 'private'],
            default: 'organization'
        },
        notificationSent: {
            type: Boolean,
            default: false
        },
        notifiedUsers: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            notifiedAt: Date,
            notificationMethod: {
                type: String,
                enum: ['email', 'in_app', 'both']
            }
        }],
        retentionPeriod: {
            type: Number,
            default: 365
        },
        expiresAt: {
            type: Date,
            default: null,
            index: true
        },
        archivedAt: {
            type: Date,
            default: null
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'activitylogs',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Virtual: Check if activity is expired
activityLogSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
});

// Virtual: Get time since activity
activityLogSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
});

// Virtual: Get days until expiry
activityLogSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
activityLogSchema.index({ organizationId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, resourceType: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ actionCategory: 1, createdAt: -1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });
activityLogSchema.index({ parentResourceId: 1, createdAt: -1 });
activityLogSchema.index({ isArchived: 1, expiresAt: 1 });
activityLogSchema.index({ organizationId: 1, isArchived: 1, createdAt: -1 });
activityLogSchema.index({ 'metadata.project.projectId': 1, createdAt: -1 });
activityLogSchema.index({ 'metadata.team.teamId': 1, createdAt: -1 });
activityLogSchema.index({ 'metadata.department.departmentId': 1, createdAt: -1 });
activityLogSchema.index({ tags: 1 });
activityLogSchema.index({ isSuccessful: 1, severity: 1 });
activityLogSchema.index({ visibilityScope: 1, createdAt: -1 });

// Pre-save middleware
activityLogSchema.pre('save', function (next) {
    // Set expiry date based on retention period
    if (!this.expiresAt && this.retentionPeriod) {
        this.expiresAt = new Date(Date.now() + this.retentionPeriod * 24 * 60 * 60 * 1000);
    }

    // Determine action category if not set
    if (!this.actionCategory) {
        if (this.action.includes('created')) this.actionCategory = 'create';
        else if (this.action.includes('viewed') || this.action.includes('login')) this.actionCategory = 'read';
        else if (this.action.includes('updated') || this.action.includes('changed')) this.actionCategory = 'update';
        else if (this.action.includes('deleted') || this.action.includes('removed')) this.actionCategory = 'delete';
        else if (this.action.includes('shared') || this.action.includes('unshared')) this.actionCategory = 'share';
        else if (this.action.includes('access') || this.action.includes('permission')) this.actionCategory = 'permission';
        else if (this.action.includes('assigned')) this.actionCategory = 'assignment';
        else this.actionCategory = 'system';
    }

    // Set severity based on action
    if (!this.severity || this.severity === 'info') {
        if (this.action.includes('error') || this.action === 'system_error') {
            this.severity = 'critical';
        } else if (this.action.includes('deleted') || this.action.includes('revoked')) {
            this.severity = 'high';
        } else if (this.action.includes('warning') || this.action.includes('failed')) {
            this.severity = 'medium';
        }
    }

    next();
});

// Instance Methods

// Check if user can view this activity
activityLogSchema.methods.canView = function (userId, userOrgRole) {
    if (!this.isVisible) return false;

    // Activity owner can always view
    if (this.userId.toString() === userId.toString()) return true;

    // Organization admins can view all org activities
    if (userOrgRole === 'superadmin' || userOrgRole === 'admin') return true;

    // Check visibility scope
    switch (this.visibilityScope) {
        case 'public':
            return true;
        case 'private':
            return this.userId.toString() === userId.toString();
        default:
            return true; // For org, department, team, project - handled by access control
    }
};

// Archive this activity
activityLogSchema.methods.archive = function () {
    this.isArchived = true;
    this.archivedAt = new Date();
    this.isVisible = false;
};

// Restore archived activity
activityLogSchema.methods.restore = function () {
    this.isArchived = false;
    this.archivedAt = null;
    this.isVisible = true;
};

// Add related activity
activityLogSchema.methods.addRelatedActivity = function (activityId, relationType = 'related') {
    const existingRelation = this.relatedActivities.find(
        r => r.activityId.toString() === activityId.toString()
    );

    if (!existingRelation) {
        this.relatedActivities.push({
            activityId,
            relationType
        });
    }
};

// Add affected user
activityLogSchema.methods.addAffectedUser = function (userId, userName) {
    const existingUser = this.affectedUsers.find(
        u => u.userId.toString() === userId.toString()
    );

    if (!existingUser) {
        this.affectedUsers.push({
            userId,
            userName,
            affectedAt: new Date()
        });
    }
};

// Record notification sent
activityLogSchema.methods.recordNotification = function (userId, notificationMethod = 'in_app') {
    this.notificationSent = true;

    const existingNotification = this.notifiedUsers.find(
        n => n.userId.toString() === userId.toString()
    );

    if (!existingNotification) {
        this.notifiedUsers.push({
            userId,
            notifiedAt: new Date(),
            notificationMethod
        });
    }
};

// Add tag
activityLogSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

// Remove tag
activityLogSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

// Update metadata
activityLogSchema.methods.updateMetadata = function (metadataUpdate) {
    this.metadata = {
        ...this.metadata,
        ...metadataUpdate
    };
};

// Get formatted activity description
activityLogSchema.methods.getDescription = function () {
    const actionDescriptions = {
        user_created: 'created a new user',
        user_updated: 'updated user profile',
        user_deleted: 'deleted a user',
        project_created: 'created a new project',
        project_updated: 'updated project',
        bug_created: 'reported a new bug',
        bug_assigned: 'assigned a bug',
        bug_resolved: 'resolved a bug',
        document_created: 'created a new document',
        document_shared: 'shared a document',
        // Add more as needed
    };

    return actionDescriptions[this.action] || this.action.replace(/_/g, ' ');
};

// Static Methods

// Create activity log entry
activityLogSchema.statics.createLog = async function (logData) {
    const activity = new this({
        organizationId: logData.organizationId,
        userId: logData.userId,
        action: logData.action,
        resourceType: logData.resourceType,
        resourceId: logData.resourceId,
        resourceName: logData.resourceName,
        parentResourceType: logData.parentResourceType,
        parentResourceId: logData.parentResourceId,
        actionCategory: logData.actionCategory,
        severity: logData.severity || 'info',
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        deviceInfo: logData.deviceInfo,
        changes: logData.changes,
        metadata: logData.metadata,
        details: logData.details,
        tags: logData.tags || [],
        isSuccessful: logData.isSuccessful !== false,
        errorMessage: logData.errorMessage,
        errorCode: logData.errorCode,
        executionTime: logData.executionTime,
        isSystemGenerated: logData.isSystemGenerated || false,
        visibilityScope: logData.visibilityScope || 'organization',
        retentionPeriod: logData.retentionPeriod || 365
    });

    await activity.save();
    return activity;
};

// Get user activity timeline
activityLogSchema.statics.getUserTimeline = function (userId, organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;
    const startDate = options.startDate;
    const endDate = options.endDate;

    const query = { userId, organizationId, isArchived: false };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'firstName lastName email profileImage')
        .lean();
};

// Get resource activity history
activityLogSchema.statics.getResourceHistory = function (resourceId, resourceType, options = {}) {
    const limit = options.limit || 100;
    const skip = options.skip || 0;

    return this.find({
        resourceId,
        resourceType,
        isArchived: false
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'firstName lastName email profileImage')
        .lean();
};

// Get organization activity feed
activityLogSchema.statics.getOrgActivityFeed = function (organizationId, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;
    const actionCategory = options.actionCategory;
    const resourceType = options.resourceType;
    const severity = options.severity;

    const query = { organizationId, isArchived: false, isVisible: true };

    if (actionCategory) query.actionCategory = actionCategory;
    if (resourceType) query.resourceType = resourceType;
    if (severity) query.severity = severity;

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'firstName lastName email profileImage')
        .lean();
};

// Get project activity dashboard
activityLogSchema.statics.getProjectActivity = function (projectId, options = {}) {
    const limit = options.limit || 100;
    const startDate = options.startDate;
    const endDate = options.endDate;

    const query = {
        'metadata.project.projectId': projectId,
        isArchived: false
    };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email profileImage')
        .lean();
};

// Archive expired activities
activityLogSchema.statics.archiveExpired = async function (organizationId) {
    const now = new Date();

    const result = await this.updateMany(
        {
            organizationId,
            expiresAt: { $lt: now },
            isArchived: false
        },
        {
            isArchived: true,
            archivedAt: now,
            isVisible: false
        }
    );

    return result;
};

// Delete archived activities older than specified days
activityLogSchema.statics.purgeOldArchived = async function (organizationId, daysOld = 730) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await this.deleteMany({
        organizationId,
        isArchived: true,
        archivedAt: { $lt: cutoffDate }
    });

    return result;
};

// Get activity statistics
activityLogSchema.statics.getActivityStats = async function (organizationId, startDate, endDate) {
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
                totalActivities: { $sum: 1 },
                successfulActivities: {
                    $sum: { $cond: ['$isSuccessful', 1, 0] }
                },
                failedActivities: {
                    $sum: { $cond: ['$isSuccessful', 0, 1] }
                },
                criticalActivities: {
                    $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
                },
                highSeverityActivities: {
                    $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalActivities: 0,
        successfulActivities: 0,
        failedActivities: 0,
        criticalActivities: 0,
        highSeverityActivities: 0
    };
};

// Get activity breakdown by category
activityLogSchema.statics.getActivityBreakdown = async function (organizationId, startDate, endDate) {
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
                _id: '$actionCategory',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Get most active users
activityLogSchema.statics.getMostActiveUsers = async function (organizationId, startDate, endDate, limit = 10) {
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
                _id: '$userId',
                activityCount: { $sum: 1 }
            }
        },
        { $sort: { activityCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                userId: '$_id',
                activityCount: 1,
                userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                userEmail: '$user.email',
                userImage: '$user.profileImage'
            }
        }
    ]);
};

// Get recent failed activities
activityLogSchema.statics.getRecentFailures = function (organizationId, limit = 50) {
    return this.find({
        organizationId,
        isSuccessful: false,
        isArchived: false
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .lean();
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;