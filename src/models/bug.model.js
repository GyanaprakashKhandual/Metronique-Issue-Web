import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema(
    {
        serialNumber: {
            type: String,
            unique: true,
            index: true
        },
        bugNumber: {
            type: String,
            unique: true,
            index: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        title: {
            type: String,

            maxlength: 500
        },
        description: {
            type: String,
            maxlength: 10000
        },
        stepsToReproduce: [
            {
                stepNumber: Number,
                stepDescription: String,
                expectedResult: String,
                actualResult: String
            }
        ],
        bugType: {
            type: String,
            default: 'functional'
        },
        customBugTypes: [
            {
                typeName: String,
                typeColor: String,
                typeIcon: String,
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        severity: {
            type: String,
            default: 'medium'
        },
        customSeverities: [
            {
                severityName: String,
                severityLevel: Number,
                severityColor: String,
                severityIcon: String,
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        priority: {
            type: String,
            default: 'medium'
        },
        customPriorities: [
            {
                priorityName: String,
                priorityLevel: Number,
                priorityColor: String,
                priorityIcon: String,
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        status: {
            type: String,
            default: 'open',
            index: true
        },
        customStatuses: [
            {
                statusName: String,
                statusColor: String,
                statusIcon: String,
                statusOrder: Number,
                isClosed: {
                    type: Boolean,
                    default: false
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        assignedTo: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                assignedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                assignedAt: {
                    type: Date,
                    default: Date.now
                },
                role: String
            }
        ],
        watchers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            index: true
        },
        subDepartmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            index: true
        },
        subTeamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            index: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            index: true
        },
        subProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            index: true
        },
        phaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
            index: true
        },
        subPhaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
            index: true
        },
        sprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
            index: true
        },
        subSprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
            index: true
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            index: true
        },
        subFolderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
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
            type: String
        },
        environment: {
            operatingSystem: String,
            browser: String,
            browserVersion: String,
            deviceType: String,
            deviceModel: String,
            screenResolution: String,
            appVersion: String,
            buildNumber: String,
            customEnvironment: mongoose.Schema.Types.Mixed
        },
        affectedVersions: [
            {
                versionNumber: String,
                versionName: String,
                releaseDate: Date
            }
        ],
        fixedInVersions: [
            {
                versionNumber: String,
                versionName: String,
                releaseDate: Date
            }
        ],
        images: [
            {
                imageId: String,
                imageUrl: String,
                imageType: String,
                imageName: String,
                imageSize: Number,
                thumbnailUrl: String,
                caption: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        videos: [
            {
                videoId: String,
                videoUrl: String,
                videoType: String,
                videoName: String,
                videoSize: Number,
                duration: Number,
                thumbnailUrl: String,
                caption: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        attachments: [
            {
                attachmentId: String,
                attachmentUrl: String,
                attachmentType: String,
                attachmentName: String,
                attachmentSize: Number,
                mimeType: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        references: [
            {
                referenceType: {
                    type: String,
                    enum: ['bug', 'requirement', 'document', 'sheet', 'slide', 'url', 'custom']
                },
                referenceId: mongoose.Schema.Types.ObjectId,
                referenceUrl: String,
                referenceTitle: String,
                referenceDescription: String,
                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        relatedBugs: [
            {
                bugId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Bug'
                },
                relationType: {
                    type: String,
                    enum: ['duplicate', 'related', 'blocks', 'blocked_by', 'caused_by', 'causes', 'parent', 'child']
                },
                linkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        relatedRequirements: [
            {
                requirementId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Requirement'
                },
                requirementTitle: String,
                linkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        relatedDocuments: [
            {
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Document'
                },
                documentTitle: String,
                linkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        relatedSheets: [
            {
                sheetId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Sheet'
                },
                sheetTitle: String,
                linkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        relatedSlides: [
            {
                slideId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Slide'
                },
                slideTitle: String,
                linkedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                linkedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        tags: [
            {
                tagName: String,
                tagColor: String,
                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        labels: [
            {
                labelId: String,
                labelName: String,
                labelColor: String,
                labelIcon: String
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
                userAvatar: String,
                content: String,
                mentions: [
                    {
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        },
                        userName: String
                    }
                ],
                attachments: [
                    {
                        attachmentUrl: String,
                        attachmentType: String,
                        attachmentName: String
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
                },
                isDeleted: {
                    type: Boolean,
                    default: false
                },
                deletedAt: Date,
                reactions: [
                    {
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        },
                        reactionType: String,
                        reactionEmoji: String,
                        reactedAt: {
                            type: Date,
                            default: Date.now
                        }
                    }
                ],
                replies: [
                    {
                        replyId: String,
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        },
                        userName: String,
                        content: String,
                        createdAt: {
                            type: Date,
                            default: Date.now
                        }
                    }
                ]
            }
        ],
        likes: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                likedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        votes: {
            upvotes: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    votedAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            downvotes: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    votedAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            totalScore: {
                type: Number,
                default: 0
            }
        },
        activities: [
            {
                activityId: String,
                activityType: {
                    type: String,
                    enum: [
                        'created',
                        'updated',
                        'status_changed',
                        'assigned',
                        'unassigned',
                        'priority_changed',
                        'severity_changed',
                        'commented',
                        'attachment_added',
                        'attachment_removed',
                        'linked',
                        'unlinked',
                        'watcher_added',
                        'watcher_removed',
                        'tag_added',
                        'tag_removed',
                        'duplicated',
                        'merged',
                        'closed',
                        'reopened'
                    ]
                },
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                performedByName: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                changes: mongoose.Schema.Types.Mixed,
                oldValue: mongoose.Schema.Types.Mixed,
                newValue: mongoose.Schema.Types.Mixed,
                description: String
            }
        ],
        history: [
            {
                changeId: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                changeType: String,
                fieldName: String,
                oldValue: mongoose.Schema.Types.Mixed,
                newValue: mongoose.Schema.Types.Mixed,
                changes: mongoose.Schema.Types.Mixed
            }
        ],
        estimatedTime: {
            value: Number,
            unit: {
                type: String,
                enum: ['minutes', 'hours', 'days', 'weeks']
            }
        },
        actualTime: {
            value: Number,
            unit: {
                type: String,
                enum: ['minutes', 'hours', 'days', 'weeks']
            }
        },
        timeTracking: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                startTime: Date,
                endTime: Date,
                duration: Number,
                description: String,
                loggedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        dueDate: Date,
        resolvedDate: Date,
        closedDate: Date,
        verifiedDate: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolution: {
            resolutionType: {
                type: String,
                enum: ['fixed', 'wont_fix', 'duplicate', 'cannot_reproduce', 'works_as_designed', 'deferred', 'custom']
            },
            resolutionDescription: String,
            resolvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            resolvedAt: Date,
            customResolution: String
        },
        customFields: [
            {
                fieldName: String,
                fieldType: {
                    type: String,
                    enum: ['text', 'number', 'date', 'boolean', 'select', 'multi_select', 'url', 'email', 'phone']
                },
                fieldValue: mongoose.Schema.Types.Mixed,
                fieldOptions: [String],
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        workflow: {
            currentStage: String,
            stages: [
                {
                    stageName: String,
                    stageOrder: Number,
                    enteredAt: Date,
                    exitedAt: Date,
                    duration: Number
                }
            ]
        },
        notifications: {
            emailNotificationSent: {
                type: Boolean,
                default: false
            },
            lastNotificationSentAt: Date,
            notificationRecipients: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        visibility: {
            type: String,
            enum: ['private', 'internal', 'public', 'restricted'],
            default: 'internal',
            index: true
        },
        accessControl: {
            allowedUsers: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
            allowedTeams: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Team'
                }
            ],
            allowedDepartments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Department'
                }
            ],
            blockedUsers: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
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
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        archivedAt: Date,
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
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
        isPinned: {
            type: Boolean,
            default: false
        },
        pinnedAt: Date,
        pinnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        metadata: {
            source: String,
            sourceUrl: String,
            externalBugId: String,
            importedFrom: String,
            importedAt: Date,
            lastSyncedAt: Date,
            customMetadata: mongoose.Schema.Types.Mixed
        },
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
            watchers: {
                type: Number,
                default: 0
            },
            timeSpent: {
                type: Number,
                default: 0
            },
            reopenCount: {
                type: Number,
                default: 0
            },
            assignmentChanges: {
                type: Number,
                default: 0
            }
        },
        searchableContent: {
            type: String
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastViewedAt: Date,
        lastViewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'bugs',
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

bugSchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.filter(c => !c.isDeleted).length : 0;
});

bugSchema.virtual('attachmentCount').get(function () {
    return (this.images?.length || 0) + (this.videos?.length || 0) + (this.attachments?.length || 0);
});

bugSchema.virtual('watcherCount').get(function () {
    return this.watchers ? this.watchers.length : 0;
});

bugSchema.virtual('isOverdue').get(function () {
    return this.dueDate && new Date() > this.dueDate && this.status !== 'closed';
});

bugSchema.virtual('totalVotes').get(function () {
    return (this.votes?.upvotes?.length || 0) - (this.votes?.downvotes?.length || 0);
});

bugSchema.virtual('assigneeCount').get(function () {
    return this.assignedTo ? this.assignedTo.length : 0;
});

bugSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

bugSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
bugSchema.index({ organizationId: 1, reportedBy: 1, isDeleted: 0 });
bugSchema.index({ organizationId: 1, 'assignedTo.userId': 1, isDeleted: 0 });
bugSchema.index({ organizationId: 1, priority: 1, status: 1 });
bugSchema.index({ organizationId: 1, severity: 1, status: 1 });
bugSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
bugSchema.index({ projectId: 1, status: 1, isDeleted: 0 });
bugSchema.index({ sprintId: 1, status: 1, isDeleted: 0 });
bugSchema.index({ departmentId: 1, isDeleted: 0 });
bugSchema.index({ teamId: 1, isDeleted: 0 });
bugSchema.index({ phaseId: 1, isDeleted: 0 });
bugSchema.index({ folderId: 1, isDeleted: 0 });
bugSchema.index({ serialNumber: 1 });
bugSchema.index({ bugNumber: 1 });
bugSchema.index({ bugType: 1, status: 1 });
bugSchema.index({ dueDate: 1, status: 1 });
bugSchema.index({ createdAt: -1 });
bugSchema.index({ updatedAt: -1 });
bugSchema.index({ resolvedDate: -1 });
bugSchema.index({ closedDate: -1 });
bugSchema.index({ 'tags.tagName': 1 });
bugSchema.index({ 'watchers.userId': 1 });
bugSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
bugSchema.index({ isPinned: 1, organizationId: 1 });
bugSchema.index({ isFavorite: 1, organizationId: 1 });

bugSchema.pre('save', async function (next) {
    if (this.isNew && !this.serialNumber) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Bug').countDocuments({
            organizationId: this.organizationId
        });
        this.serialNumber = `BUG-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }

    if (this.isNew && !this.bugNumber) {
        const count = await mongoose.model('Bug').countDocuments({
            organizationId: this.organizationId
        });
        this.bugNumber = `BUG-${String(count + 1).padStart(6, '0')}`;
    }

    let searchContent = `${this.title || ''} ${this.description || ''}`;

    if (this.stepsToReproduce && this.stepsToReproduce.length > 0) {
        this.stepsToReproduce.forEach(step => {
            searchContent += ` ${step.stepDescription || ''}`;
        });
    }

    if (this.tags && this.tags.length > 0) {
        searchContent += ` ${this.tags.map(tag => tag.tagName).join(' ')}`;
    }

    if (this.comments && this.comments.length > 0) {
        this.comments.forEach(comment => {
            if (!comment.isDeleted) {
                searchContent += ` ${comment.content || ''}`;
            }
        });
    }

    this.searchableContent = searchContent.toLowerCase().trim();

    if (!this.contextHierarchyPath && this.contextType && this.contextId) {
        this.contextHierarchyPath = `${this.contextType}:${this.contextId.toString()}`;
    }

    this.statistics.commentCount = this.comments ? this.comments.filter(c => !c.isDeleted).length : 0;
    this.statistics.attachmentCount = (this.images?.length || 0) + (this.videos?.length || 0) + (this.attachments?.length || 0);
    this.statistics.watchers = this.watchers ? this.watchers.length : 0;

    if (this.votes) {
        this.votes.totalScore = (this.votes.upvotes?.length || 0) - (this.votes.downvotes?.length || 0);
    }

    next();
});

bugSchema.methods.canBeViewedBy = function (userId) {
    if (!userId) return false;

    if (this.reportedBy && this.reportedBy.toString() === userId.toString()) return true;

    if (this.assignedTo && this.assignedTo.some(assignment => assignment.userId.toString() === userId.toString())) {
        return true;
    }

    if (this.isDeleted || this.isArchived) return false;

    if (this.accessControl && this.accessControl.blockedUsers &&
        this.accessControl.blockedUsers.some(id => id.toString() === userId.toString())) {
        return false;
    }

    if (this.visibility === 'public') return true;

    if (this.visibility === 'private') {
        return this.reportedBy && this.reportedBy.toString() === userId.toString();
    }

    if (this.accessControl && this.accessControl.allowedUsers &&
        this.accessControl.allowedUsers.some(id => id.toString() === userId.toString())) {
        return true;
    }

    if (this.watchers && this.watchers.some(watcher => watcher.userId.toString() === userId.toString())) {
        return true;
    }

    return this.visibility === 'internal';
};

bugSchema.methods.canBeEditedBy = function (userId) {
    if (!userId) return false;

    if (this.reportedBy && this.reportedBy.toString() === userId.toString()) return true;

    if (this.assignedTo && this.assignedTo.some(assignment =>
        assignment.userId.toString() === userId.toString() &&
        (assignment.role === 'admin' || assignment.role === 'editor')
    )) {
        return true;
    }

    return false;
};

bugSchema.methods.canBeDeletedBy = function (userId) {
    if (!userId) return false;
    return this.reportedBy && this.reportedBy.toString() === userId.toString();
};

bugSchema.methods.addComment = function (userId, userName, content, mentions, attachments) {
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.comments.push({
        commentId,
        userId,
        userName,
        content,
        mentions: mentions || [],
        attachments: attachments || [],
        createdAt: new Date(),
        isEdited: false,
        isDeleted: false,
        reactions: [],
        replies: []
    });

    this.statistics.commentCount = this.comments.filter(c => !c.isDeleted).length;

    return commentId;
};

bugSchema.methods.updateComment = function (commentId, content) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = content;
        comment.updatedAt = new Date();
        comment.isEdited = true;
    }
};

bugSchema.methods.deleteComment = function (commentId) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        this.statistics.commentCount = this.comments.filter(c => !c.isDeleted).length;
    }
};

bugSchema.methods.addActivity = function (activityType, performedBy, performedByName, changes, description) {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activities.push({
        activityId,
        activityType,
        performedBy,
        performedByName,
        timestamp: new Date(),
        changes,
        description
    });
};

bugSchema.methods.assignTo = function (userId, assignedBy) {
    const existingAssignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());
    if (!existingAssignment) {
        this.assignedTo.push({
            userId,
            assignedBy,
            assignedAt: new Date(),
            role: 'assignee'
        });

        this.statistics.assignmentChanges = (this.statistics.assignmentChanges || 0) + 1;
    }
};
bugSchema.methods.unassignFrom = function (userId) {
    this.assignedTo = this.assignedTo.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.assignmentChanges = (this.statistics.assignmentChanges || 0) + 1;
};
bugSchema.methods.addWatcher = function (userId) {
    const existingWatcher = this.watchers.find(w => w.userId.toString() === userId.toString());
    if (!existingWatcher) {
        this.watchers.push({
            userId,
            addedAt: new Date()
        });

        this.statistics.watchers = this.watchers.length;
    }
};
bugSchema.methods.removeWatcher = function (userId) {
    this.watchers = this.watchers.filter(w => w.userId.toString() !== userId.toString());
    this.statistics.watchers = this.watchers.length;
};
bugSchema.methods.addTag = function (tagName, tagColor, userId) {
    const existingTag = this.tags.find(t => t.tagName.toLowerCase() === tagName.toLowerCase());
    if (!existingTag) {
        this.tags.push({
            tagName,
            tagColor: tagColor || '#3b82f6',
            addedBy: userId,
            addedAt: new Date()
        });
    }
};
bugSchema.methods.removeTag = function (tagName) {
    this.tags = this.tags.filter(t => t.tagName.toLowerCase() !== tagName.toLowerCase());
};
bugSchema.methods.updateStatus = function (newStatus, userId) {
    const oldStatus = this.status;
    this.status = newStatus;
    if (newStatus === 'closed') {
        this.closedDate = new Date();
    } else if (oldStatus === 'closed' && newStatus !== 'closed') {
        this.statistics.reopenCount = (this.statistics.reopenCount || 0) + 1;
        this.closedDate = null;
    }

    this.addActivity('status_changed', userId, null, {
        oldStatus,
        newStatus
    }, `Status changed from ${oldStatus} to ${newStatus}`);
};
bugSchema.methods.linkReference = function (referenceType, referenceId, referenceTitle, userId) {
    this.references.push({
        referenceType,
        referenceId,
        referenceTitle,
        addedBy: userId,
        addedAt: new Date()
    });
};
bugSchema.methods.unlinkReference = function (referenceId) {
    this.references = this.references.filter(ref =>
        ref.referenceId && ref.referenceId.toString() !== referenceId.toString()
    );
};
bugSchema.methods.addTimeLog = function (userId, duration, description) {
    this.timeTracking.push({
        userId,
        startTime: new Date(),
        duration,
        description,
        loggedAt: new Date()
    });
    this.statistics.timeSpent = (this.statistics.timeSpent || 0) + duration;
};
bugSchema.statics.markAsDeleted = function (bugId, deletedBy) {
    return this.findByIdAndUpdate(bugId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
    });
};
bugSchema.statics.markAsArchived = function (bugId, archivedBy) {
    return this.findByIdAndUpdate(bugId, {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: archivedBy
    });
};
bugSchema.statics.restore = function (bugId) {
    return this.findByIdAndUpdate(bugId, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
    });
};
const Bug = mongoose.model('Bug', bugSchema);
export default Bug;