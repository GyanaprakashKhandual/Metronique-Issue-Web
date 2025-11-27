import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
    {
        serialNumber: {
            type: String,
            unique: true,
            index: true
        },
        issueNumber: {
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
        issueType: {
            type: String,
            default: 'operational'
        },
        customIssueTypes: [
            {
                typeName: String,
                typeColor: String,
                typeIcon: String,
                typeDescription: String,
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
        category: {
            type: String,
            default: 'general'
        },
        customCategories: [
            {
                categoryName: String,
                categoryColor: String,
                categoryIcon: String,
                categoryDescription: String,
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
                isResolved: {
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        solvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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
        stakeholders: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                userName: String,
                userEmail: String,
                role: String,
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
        rootCause: {
            causeName: String,
            causeDescription: String,
            analyzedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            analyzedAt: Date
        },
        potentialCauses: [
            {
                causeId: String,
                causeName: String,
                causeDescription: String,
                probability: String,
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
        issuePath: {
            initiatingEvent: String,
            escalationSteps: [
                {
                    stepNumber: Number,
                    stepDescription: String,
                    stepTime: Date,
                    observedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
                }
            ],
            impactedAreas: [String]
        },
        impactAnalysis: {
            businessImpact: String,
            operationalImpact: String,
            financialImpact: String,
            userImpact: String,
            affectedSystems: [String],
            affectedUsers: Number,
            estimatedLoss: String,
            analyzedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            analyzedAt: Date
        },
        commenceAt: Date,
        startedAt: Date,
        targetResolutionDate: Date,
        endedAt: Date,
        resolvedDate: Date,
        closedAt: Date,
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolution: {
            resolutionType: {
                type: String,
                enum: ['fixed', 'workaround', 'cannot_reproduce', 'external_issue', 'deferred', 'duplicate', 'custom']
            },
            resolutionDescription: String,
            resolutionSteps: [
                {
                    stepNumber: Number,
                    stepDescription: String,
                    appliedAt: Date,
                    appliedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
                }
            ],
            resolvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            resolvedAt: Date,
            customResolution: String
        },
        preventiveMeasures: [
            {
                measureId: String,
                measureName: String,
                measureDescription: String,
                implementationDate: Date,
                implementedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                status: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        correctionActions: [
            {
                actionId: String,
                actionName: String,
                actionDescription: String,
                dueDate: Date,
                completionDate: Date,
                assignedTo: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                status: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        communicationLog: [
            {
                logId: String,
                communicationType: {
                    type: String,
                    enum: ['email', 'phone', 'meeting', 'message', 'escalation', 'update']
                },
                communicationDetails: String,
                communicatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                recipients: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
                ],
                communicatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        escalationDetails: {
            isEscalated: {
                type: Boolean,
                default: false
            },
            escalationLevel: {
                type: String,
                enum: ['level1', 'level2', 'level3', 'level4']
            },
            escalatedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            escalationReason: String,
            escalatedAt: Date,
            escalationHistory: [
                {
                    escalationNumber: Number,
                    escalatedFrom: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    escalatedTo: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    reason: String,
                    escalatedAt: Date
                }
            ]
        },
        environment: {
            operatingSystem: String,
            systemVersion: String,
            affectedComponent: String,
            componentVersion: String,
            configuration: String,
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
        documents: [
            {
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Document'
                },
                documentTitle: String,
                documentType: String,
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
        references: [
            {
                referenceType: {
                    type: String,
                    enum: ['issue', 'bug', 'requirement', 'document', 'sheet', 'slide', 'url', 'custom']
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
        relatedIssues: [
            {
                issueId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Issue'
                },
                relationType: {
                    type: String,
                    enum: ['related', 'duplicate', 'blocks', 'blocked_by', 'caused_by', 'causes', 'parent', 'child']
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
        relatedBugs: [
            {
                bugId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Bug'
                },
                bugTitle: String,
                bugStatus: String,
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
                        'escalated',
                        'resolved',
                        'closed',
                        'reopened',
                        'cause_identified',
                        'resolution_applied',
                        'verified'
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
        sla: {
            responseTime: Number,
            resolutionTime: Number,
            responseTimeUnit: {
                type: String,
                enum: ['minutes', 'hours', 'days']
            },
            resolutionTimeUnit: {
                type: String,
                enum: ['minutes', 'hours', 'days']
            },
            breached: {
                type: Boolean,
                default: false
            },
            breachedAt: Date
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
            externalIssueId: String,
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
            watcherCount: {
                type: Number,
                default: 0
            },
            stakeholderCount: {
                type: Number,
                default: 0
            },
            escalationCount: {
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
        }
    },
    {
        timestamps: true,
        collection: 'issues',
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

issueSchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.filter(c => !c.isDeleted).length : 0;
});

issueSchema.virtual('attachmentCount').get(function () {
    return (this.images?.length || 0) + (this.videos?.length || 0) + (this.attachments?.length || 0);
});

issueSchema.virtual('watcherCount').get(function () {
    return this.watchers ? this.watchers.length : 0;
});

issueSchema.virtual('stakeholderCount').get(function () {
    return this.stakeholders ? this.stakeholders.length : 0;
});

issueSchema.virtual('isOverdue').get(function () {
    return this.targetResolutionDate && new Date() > this.targetResolutionDate && this.status !== 'closed';
});

issueSchema.virtual('totalVotes').get(function () {
    return (this.votes?.upvotes?.length || 0) - (this.votes?.downvotes?.length || 0);
});

issueSchema.virtual('assigneeCount').get(function () {
    return this.assignedTo ? this.assignedTo.length : 0;
});

issueSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

issueSchema.virtual('isActive').get(function () {
    return this.status !== 'closed' && this.status !== 'resolved' && !this.isDeleted && !this.isArchived;
});

issueSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
issueSchema.index({ organizationId: 1, createdBy: 1, isDeleted: 0 });
issueSchema.index({ organizationId: 1, 'assignedTo.userId': 1, isDeleted: 0 });
issueSchema.index({ organizationId: 1, priority: 1, status: 1 });
issueSchema.index({ organizationId: 1, severity: 1, status: 1 });
issueSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
issueSchema.index({ projectId: 1, status: 1, isDeleted: 0 });
issueSchema.index({ sprintId: 1, status: 1, isDeleted: 0 });
issueSchema.index({ departmentId: 1, isDeleted: 0 });
issueSchema.index({ teamId: 1, isDeleted: 0 });
issueSchema.index({ phaseId: 1, isDeleted: 0 });
issueSchema.index({ folderId: 1, isDeleted: 0 });
issueSchema.index({ serialNumber: 1 });
issueSchema.index({ issueNumber: 1 });
issueSchema.index({ issueType: 1, status: 1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ targetResolutionDate: 1, status: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ updatedAt: -1 });
issueSchema.index({ resolvedDate: -1 });
issueSchema.index({ closedAt: -1 });
issueSchema.index({ 'tags.tagName': 1 });
issueSchema.index({ 'watchers.userId': 1 });
issueSchema.index({ 'stakeholders.userId': 1 });
issueSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
issueSchema.index({ isPinned: 1, organizationId: 1 });
issueSchema.index({ isFavorite: 1, organizationId: 1 });
issueSchema.index({ 'escalationDetails.isEscalated': 1, status: 1 });
issueSchema.index({ 'escalationDetails.escalationLevel': 1 });

issueSchema.pre('save', async function (next) {
    if (this.isNew && !this.serialNumber) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Issue').countDocuments({
            organizationId: this.organizationId
        });
        this.serialNumber = `ISS-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }

    if (this.isNew && !this.issueNumber) {
        const count = await mongoose.model('Issue').countDocuments({
            organizationId: this.organizationId
        });
        this.issueNumber = `ISS-${String(count + 1).padStart(6, '0')}`;
    }

    let searchContent = `${this.title || ''} ${this.description || ''}`;

    if (this.potentialCauses && this.potentialCauses.length > 0) {
        this.potentialCauses.forEach(cause => {
            searchContent += ` ${cause.causeName || ''} ${cause.causeDescription || ''}`;
        });
    }

    if (this.rootCause) {
        searchContent += ` ${this.rootCause.causeName || ''} ${this.rootCause.causeDescription || ''}`;
    }

    if (this.resolution && this.resolution.resolutionSteps) {
        this.resolution.resolutionSteps.forEach(step => {
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
    this.statistics.watcherCount = this.watchers ? this.watchers.length : 0;
    this.statistics.stakeholderCount = this.stakeholders ? this.stakeholders.length : 0;
    this.statistics.escalationCount = this.escalationDetails?.escalationHistory?.length || 0;

    if (this.votes) {
        this.votes.totalScore = (this.votes.upvotes?.length || 0) - (this.votes.downvotes?.length || 0);
    }

    next();
});

issueSchema.methods.canBeViewedBy = function (userId) {
    if (!userId) return false;

    if (this.createdBy && this.createdBy.toString() === userId.toString()) return true;

    if (this.assignedTo && this.assignedTo.some(assignment => assignment.userId.toString() === userId.toString())) {
        return true;
    }

    if (this.stakeholders && this.stakeholders.some(stakeholder => stakeholder.userId.toString() === userId.toString())) {
        return true;
    }

    if (this.isDeleted || this.isArchived) return false;

    if (this.accessControl && this.accessControl.blockedUsers &&
        this.accessControl.blockedUsers.some(id => id.toString() === userId.toString())) {
        return false;
    }

    if (this.visibility === 'public') return true;

    if (this.visibility === 'private') {
        return this.createdBy && this.createdBy.toString() === userId.toString();
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

issueSchema.methods.canBeEditedBy = function (userId) {
    if (!userId) return false;

    if (this.createdBy && this.createdBy.toString() === userId.toString()) return true;

    if (this.assignedTo && this.assignedTo.some(assignment =>
        assignment.userId.toString() === userId.toString() &&
        (assignment.role === 'admin' || assignment.role === 'editor')
    )) {
        return true;
    }

    return false;
};

issueSchema.methods.canBeDeletedBy = function (userId) {
    if (!userId) return false;
    return this.createdBy && this.createdBy.toString() === userId.toString();
};

issueSchema.methods.addComment = function (userId, userName, content, mentions, attachments) {
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

issueSchema.methods.updateComment = function (commentId, content) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = content;
        comment.updatedAt = new Date();
        comment.isEdited = true;
    }
};

issueSchema.methods.deleteComment = function (commentId) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        this.statistics.commentCount = this.comments.filter(c => !c.isDeleted).length;
    }
};

issueSchema.methods.addActivity = function (activityType, performedBy, performedByName, changes, description) {
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

issueSchema.methods.assignTo = function (userId, assignedBy, role) {
    const existingAssignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());

    if (!existingAssignment) {
        this.assignedTo.push({
            userId,
            assignedBy,
            assignedAt: new Date(),
            role: role || 'assignee'
        });

        this.statistics.assignmentChanges = (this.statistics.assignmentChanges || 0) + 1;
    }
};

issueSchema.methods.unassignFrom = function (userId) {
    this.assignedTo = this.assignedTo.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.assignmentChanges = (this.statistics.assignmentChanges || 0) + 1;
};

issueSchema.methods.addStakeholder = function (userId, userName, userEmail, role, addedBy) {
    const existingStakeholder = this.stakeholders.find(s => s.userId.toString() === userId.toString());

    if (!existingStakeholder) {
        this.stakeholders.push({
            userId,
            userName,
            userEmail,
            role,
            addedBy,
            addedAt: new Date()
        });

        this.statistics.stakeholderCount = this.stakeholders.length;
    }
};

issueSchema.methods.removeStakeholder = function (userId) {
    this.stakeholders = this.stakeholders.filter(s => s.userId.toString() !== userId.toString());
    this.statistics.stakeholderCount = this.stakeholders.length;
};

issueSchema.methods.addWatcher = function (userId) {
    const existingWatcher = this.watchers.find(w => w.userId.toString() === userId.toString());

    if (!existingWatcher) {
        this.watchers.push({
            userId,
            addedAt: new Date()
        });

        this.statistics.watcherCount = this.watchers.length;
    }
};

issueSchema.methods.removeWatcher = function (userId) {
    this.watchers = this.watchers.filter(w => w.userId.toString() !== userId.toString());
    this.statistics.watcherCount = this.watchers.length;
};

issueSchema.methods.addTag = function (tagName, tagColor, userId) {
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

issueSchema.methods.removeTag = function (tagName) {
    this.tags = this.tags.filter(t => t.tagName.toLowerCase() !== tagName.toLowerCase());
};

issueSchema.methods.updateStatus = function (newStatus, userId) {
    const oldStatus = this.status;
    this.status = newStatus;

    if (newStatus === 'closed' && !this.closedAt) {
        this.closedAt = new Date();
    } else if (oldStatus === 'closed' && newStatus !== 'closed') {
        this.statistics.reopenCount = (this.statistics.reopenCount || 0) + 1;
        this.closedAt = null;
    }

    if (newStatus === 'resolved' && !this.resolvedDate) {
        this.resolvedDate = new Date();
    }

    this.addActivity('status_changed', userId, null, {
        oldStatus,
        newStatus
    }, `Status changed from ${oldStatus} to ${newStatus}`);
};

issueSchema.methods.addPotentialCause = function (causeName, causeDescription, probability, userId) {
    const causeId = `cause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.potentialCauses.push({
        causeId,
        causeName,
        causeDescription,
        probability: probability || 'medium',
        addedBy: userId,
        addedAt: new Date()
    });
};

issueSchema.methods.setRootCause = function (causeName, causeDescription, userId) {
    this.rootCause = {
        causeName,
        causeDescription,
        analyzedBy: userId,
        analyzedAt: new Date()
    };

    this.addActivity('cause_identified', userId, null, {
        causeName,
        causeDescription
    }, `Root cause identified: ${causeName}`);
};

issueSchema.methods.addEscalationStep = function (stepDescription, stepTime, observedBy) {
    if (!this.issuePath) {
        this.issuePath = {
            escalationSteps: []
        };
    }

    this.issuePath.escalationSteps.push({
        stepNumber: (this.issuePath.escalationSteps?.length || 0) + 1,
        stepDescription,
        stepTime: stepTime || new Date(),
        observedBy
    });
};

issueSchema.methods.escalate = function (escalationLevel, escalatedTo, escalationReason, userId) {
    if (!this.escalationDetails.isEscalated) {
        this.escalationDetails.isEscalated = true;
    }

    this.escalationDetails.escalationLevel = escalationLevel;
    this.escalationDetails.escalatedTo = escalatedTo;
    this.escalationDetails.escalationReason = escalationReason;
    this.escalationDetails.escalatedAt = new Date();

    const escalationNumber = (this.escalationDetails.escalationHistory?.length || 0) + 1;

    this.escalationDetails.escalationHistory.push({
        escalationNumber,
        escalatedFrom: userId,
        escalatedTo,
        reason: escalationReason,
        escalatedAt: new Date()
    });

    this.statistics.escalationCount = this.escalationDetails.escalationHistory.length;

    this.addActivity('escalated', userId, null, {
        escalationLevel,
        reason: escalationReason
    }, `Issue escalated to ${escalationLevel}`);
};

issueSchema.methods.addResolutionStep = function (stepDescription, userId) {
    if (!this.resolution) {
        this.resolution = {
            resolutionSteps: []
        };
    }

    this.resolution.resolutionSteps.push({
        stepNumber: (this.resolution.resolutionSteps?.length || 0) + 1,
        stepDescription,
        appliedAt: new Date(),
        appliedBy: userId
    });
};

issueSchema.methods.resolveIssue = function (resolutionType, resolutionDescription, userId, customResolution) {
    this.resolution = {
        resolutionType,
        resolutionDescription,
        resolvedBy: userId,
        resolvedAt: new Date(),
        customResolution: customResolution || null
    };

    this.resolvedDate = new Date();
    this.solvedBy = userId;
    this.status = 'resolved';

    this.addActivity('resolved', userId, null, {
        resolutionType,
        resolutionDescription
    }, `Issue resolved with ${resolutionType}`);
};

issueSchema.methods.verifyResolution = function (userId) {
    this.verifiedAt = new Date();
    this.verifiedBy = userId;
    this.status = 'closed';
    this.closedAt = new Date();

    this.addActivity('verified', userId, null, null, 'Issue verified and closed');
};

issueSchema.methods.addCorrectionAction = function (actionName, actionDescription, dueDate, assignedTo) {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.correctionActions.push({
        actionId,
        actionName,
        actionDescription,
        dueDate,
        assignedTo,
        status: 'pending',
        createdAt: new Date()
    });
};

issueSchema.methods.completeCorrectionAction = function (actionId, completionDate) {
    const action = this.correctionActions.find(a => a.actionId === actionId);

    if (action) {
        action.status = 'completed';
        action.completionDate = completionDate || new Date();
    }
};

issueSchema.methods.addPreventiveMeasure = function (measureName, measureDescription, implementationDate, implementedBy) {
    const measureId = `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.preventiveMeasures.push({
        measureId,
        measureName,
        measureDescription,
        implementationDate,
        implementedBy,
        status: 'pending',
        createdAt: new Date()
    });
};

issueSchema.methods.addCommunicationLog = function (communicationType, communicationDetails, communicatedBy, recipients) {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.communicationLog.push({
        logId,
        communicationType,
        communicationDetails,
        communicatedBy,
        recipients: recipients || [],
        communicatedAt: new Date()
    });
};

issueSchema.methods.linkReference = function (referenceType, referenceId, referenceTitle, userId) {
    this.references.push({
        referenceType,
        referenceId,
        referenceTitle,
        addedBy: userId,
        addedAt: new Date()
    });
};

issueSchema.methods.unlinkReference = function (referenceId) {
    this.references = this.references.filter(ref =>
        ref.referenceId && ref.referenceId.toString() !== referenceId.toString()
    );
};

issueSchema.methods.relateIssue = function (issueId, relationType, userId) {
    const existingRelation = this.relatedIssues.find(r => r.issueId.toString() === issueId.toString());

    if (!existingRelation) {
        this.relatedIssues.push({
            issueId,
            relationType,
            linkedBy: userId,
            linkedAt: new Date()
        });
    }
};

issueSchema.methods.unrelatIssue = function (issueId) {
    this.relatedIssues = this.relatedIssues.filter(r => r.issueId.toString() !== issueId.toString());
};

issueSchema.methods.relateBug = function (bugId, bugTitle, bugStatus, userId) {
    const existingBug = this.relatedBugs.find(b => b.bugId.toString() === bugId.toString());

    if (!existingBug) {
        this.relatedBugs.push({
            bugId,
            bugTitle,
            bugStatus,
            linkedBy: userId,
            linkedAt: new Date()
        });
    }
};

issueSchema.methods.unrelateBug = function (bugId) {
    this.relatedBugs = this.relatedBugs.filter(b => b.bugId.toString() !== bugId.toString());
};

issueSchema.methods.relateRequirement = function (requirementId, requirementTitle, userId) {
    const existingReq = this.relatedRequirements.find(r => r.requirementId.toString() === requirementId.toString());

    if (!existingReq) {
        this.relatedRequirements.push({
            requirementId,
            requirementTitle,
            linkedBy: userId,
            linkedAt: new Date()
        });
    }
};

issueSchema.methods.unrelateRequirement = function (requirementId) {
    this.relatedRequirements = this.relatedRequirements.filter(r => r.requirementId.toString() !== requirementId.toString());
};

issueSchema.methods.addTimeLog = function (userId, duration, description) {
    this.timeTracking.push({
        userId,
        startTime: new Date(),
        duration,
        description,
        loggedAt: new Date()
    });

    this.statistics.timeSpent = (this.statistics.timeSpent || 0) + duration;
};

issueSchema.methods.checkSLABreach = function () {
    if (!this.sla) return false;

    const now = new Date();

    if (this.sla.responseTime && this.commenceAt) {
        const responseDeadline = new Date(this.commenceAt);
        const unit = this.sla.responseTimeUnit;

        if (unit === 'minutes') {
            responseDeadline.setMinutes(responseDeadline.getMinutes() + this.sla.responseTime);
        } else if (unit === 'hours') {
            responseDeadline.setHours(responseDeadline.getHours() + this.sla.responseTime);
        } else if (unit === 'days') {
            responseDeadline.setDate(responseDeadline.getDate() + this.sla.responseTime);
        }

        if (now > responseDeadline && !this.startedAt) {
            this.sla.breached = true;
            this.sla.breachedAt = new Date();
            return true;
        }
    }

    if (this.sla.resolutionTime && this.startedAt) {
        const resolutionDeadline = new Date(this.startedAt);
        const unit = this.sla.resolutionTimeUnit;

        if (unit === 'minutes') {
            resolutionDeadline.setMinutes(resolutionDeadline.getMinutes() + this.sla.resolutionTime);
        } else if (unit === 'hours') {
            resolutionDeadline.setHours(resolutionDeadline.getHours() + this.sla.resolutionTime);
        } else if (unit === 'days') {
            resolutionDeadline.setDate(resolutionDeadline.getDate() + this.sla.resolutionTime);
        }

        if (now > resolutionDeadline && !this.resolvedDate) {
            this.sla.breached = true;
            this.sla.breachedAt = new Date();
            return true;
        }
    }

    return false;
};

issueSchema.statics.markAsDeleted = function (issueId, deletedBy) {
    return this.findByIdAndUpdate(issueId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
    });
};

issueSchema.statics.markAsArchived = function (issueId, archivedBy) {
    return this.findByIdAndUpdate(issueId, {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: archivedBy
    });
};

issueSchema.statics.restore = function (issueId) {
    return this.findByIdAndUpdate(issueId, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
    });
};

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;