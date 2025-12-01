import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
    {
        requirementSerialNumber: {
            type: String,

            index: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        detailedDescription: {
            type: String
        },
        requirementType: {
            type: String,
            default: 'functional'
        },
        customRequirementTypes: [
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
        complexity: {
            type: String,
            default: 'medium'
        },
        customComplexities: [
            {
                complexityName: String,
                complexityLevel: Number,
                complexityColor: String,
                complexityIcon: String,
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
            default: 'draft',
            index: true
        },
        customStatuses: [
            {
                statusName: String,
                statusColor: String,
                statusIcon: String,
                statusOrder: Number,
                isCompleted: {
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
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        createdBy: {
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
        acceptanceCriteria: [
            {
                criteriaId: String,
                criteriaNumber: Number,
                criteriaTitle: String,
                criteriaDescription: String,
                isMet: {
                    type: Boolean,
                    default: false
                },
                metBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                metAt: Date,
                verifiedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                verifiedAt: Date,
                priority: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        functionalRequirements: [
            {
                requirementId: String,
                requirementNumber: String,
                title: String,
                description: String,
                priority: String,
                isCompleted: {
                    type: Boolean,
                    default: false
                },
                completedAt: Date,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        nonFunctionalRequirements: [
            {
                requirementId: String,
                requirementNumber: String,
                title: String,
                description: String,
                metricType: String,
                targetValue: mongoose.Schema.Types.Mixed,
                currentValue: mongoose.Schema.Types.Mixed,
                unit: String,
                priority: String,
                isCompleted: {
                    type: Boolean,
                    default: false
                },
                completedAt: Date,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        userStories: [
            {
                storyId: String,
                storyNumber: String,
                asA: String,
                iWant: String,
                soThat: String,
                acceptanceCriteria: [String],
                priority: String,
                storyPoints: Number,
                status: String,
                assignedTo: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        useCases: [
            {
                useCaseId: String,
                useCaseNumber: String,
                title: String,
                description: String,
                actors: [String],
                preconditions: [String],
                postconditions: [String],
                mainFlow: [
                    {
                        stepNumber: Number,
                        stepDescription: String
                    }
                ],
                alternativeFlows: [
                    {
                        flowName: String,
                        steps: [
                            {
                                stepNumber: Number,
                                stepDescription: String
                            }
                        ]
                    }
                ],
                exceptionFlows: [
                    {
                        flowName: String,
                        steps: [
                            {
                                stepNumber: Number,
                                stepDescription: String
                            }
                        ]
                    }
                ],
                priority: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        businessRules: [
            {
                ruleId: String,
                ruleNumber: String,
                ruleName: String,
                ruleDescription: String,
                condition: String,
                action: String,
                priority: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        constraints: [
            {
                constraintId: String,
                constraintType: String,
                constraintDescription: String,
                impact: String,
                mitigation: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        assumptions: [
            {
                assumptionId: String,
                assumptionDescription: String,
                validationStatus: String,
                validatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                validatedAt: Date,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        dependencies: [
            {
                dependencyType: {
                    type: String,
                    enum: ['blocks', 'blocked_by', 'relates_to', 'parent', 'child', 'duplicates', 'duplicated_by']
                },
                requirementId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Requirement'
                },
                requirementTitle: String,
                description: String,
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
        diagrams: [
            {
                diagramId: String,
                diagramType: {
                    type: String,
                    enum: ['flowchart', 'sequence', 'state', 'use_case', 'class', 'entity_relationship', 'wireframe', 'mockup', 'custom']
                },
                diagramUrl: String,
                diagramName: String,
                diagramData: mongoose.Schema.Types.Mixed,
                thumbnailUrl: String,
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
        mockups: [
            {
                mockupId: String,
                mockupUrl: String,
                mockupName: String,
                mockupType: String,
                screenName: String,
                platform: String,
                thumbnailUrl: String,
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
                    enum: ['requirement', 'bug', 'document', 'sheet', 'slide', 'url', 'custom']
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
        relatedRequirements: [
            {
                requirementId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Requirement'
                },
                requirementTitle: String,
                relationType: String,
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
        reviews: [
            {
                reviewId: String,
                reviewedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                reviewerName: String,
                reviewStatus: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected', 'needs_revision']
                },
                reviewComments: String,
                reviewDate: {
                    type: Date,
                    default: Date.now
                },
                reviewedAt: Date
            }
        ],
        approvals: [
            {
                approvalId: String,
                approvedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                approverName: String,
                approverRole: String,
                approvalStatus: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected']
                },
                approvalComments: String,
                requestedAt: {
                    type: Date,
                    default: Date.now
                },
                approvedAt: Date
            }
        ],
        versions: [
            {
                versionNumber: Number,
                versionName: String,
                title: String,
                description: String,
                requirementData: mongoose.Schema.Types.Mixed,
                changes: String,
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
        currentVersion: {
            type: Number,
            default: 1
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
                        'complexity_changed',
                        'commented',
                        'attachment_added',
                        'attachment_removed',
                        'linked',
                        'unlinked',
                        'watcher_added',
                        'watcher_removed',
                        'tag_added',
                        'tag_removed',
                        'reviewed',
                        'approved',
                        'rejected',
                        'version_created',
                        'criteria_added',
                        'criteria_met'
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
        estimatedEffort: {
            value: Number,
            unit: {
                type: String,
                enum: ['hours', 'days', 'weeks', 'months', 'story_points']
            }
        },
        actualEffort: {
            value: Number,
            unit: {
                type: String,
                enum: ['hours', 'days', 'weeks', 'months', 'story_points']
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
        storyPoints: {
            type: Number,
            min: 0
        },
        targetDate: Date,
        startDate: Date,
        completionDate: Date,
        reviewDate: Date,
        approvalDate: Date,
        implementationDate: Date,
        testingDate: Date,
        deploymentDate: Date,
        milestones: [
            {
                milestoneId: String,
                milestoneName: String,
                milestoneDescription: String,
                milestoneDate: Date,
                isCompleted: {
                    type: Boolean,
                    default: false
                },
                completedAt: Date,
                completedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        testCases: [
            {
                testCaseId: String,
                testCaseNumber: String,
                testCaseTitle: String,
                testCaseDescription: String,
                preconditions: [String],
                testSteps: [
                    {
                        stepNumber: Number,
                        stepDescription: String,
                        expectedResult: String,
                        actualResult: String
                    }
                ],
                testStatus: String,
                priority: String,
                executedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                executedAt: Date,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        riskAssessment: {
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical']
            },
            riskDescription: String,
            mitigationStrategy: String,
            contingencyPlan: String,
            assessedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            assessedAt: Date
        },
        impactAnalysis: {
            businessImpact: String,
            technicalImpact: String,
            userImpact: String,
            financialImpact: String,
            affectedSystems: [String],
            affectedUsers: Number,
            analyzedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            analyzedAt: Date
        },
        feasibilityStudy: {
            technicalFeasibility: String,
            economicFeasibility: String,
            operationalFeasibility: String,
            scheduleFeasibility: String,
            recommendation: String,
            studiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            studiedAt: Date
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
                    duration: Number,
                    assignedTo: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
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
        isLocked: {
            type: Boolean,
            default: false
        },
        lockedAt: Date,
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        metadata: {
            source: String,
            sourceUrl: String,
            externalId: String,
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
            linkedBugCount: {
                type: Number,
                default: 0
            },
            linkedRequirementCount: {
                type: Number,
                default: 0
            },
            acceptanceCriteriaMet: {
                type: Number,
                default: 0
            },
            acceptanceCriteriaTotal: {
                type: Number,
                default: 0
            },
            approvalCount: {
                type: Number,
                default: 0
            },
            reviewCount: {
                type: Number,
                default: 0
            },
            timeSpent: {
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
        collection: 'requirements',
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
requirementSchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.filter(c => !c.isDeleted).length : 0;
});
requirementSchema.virtual('attachmentCount').get(function () {
    return (this.images?.length || 0) + (this.videos?.length || 0) + (this.attachments?.length || 0) + (this.diagrams?.length || 0) + (this.mockups?.length || 0);
});
requirementSchema.virtual('watcherCount').get(function () {
    return this.watchers ? this.watchers.length : 0;
});
requirementSchema.virtual('stakeholderCount').get(function () {
    return this.stakeholders ? this.stakeholders.length : 0;
});
requirementSchema.virtual('isOverdue').get(function () {
    return this.targetDate && new Date() > this.targetDate && this.status !== 'completed';
});
requirementSchema.virtual('totalVotes').get(function () {
    return (this.votes?.upvotes?.length || 0) - (this.votes?.downvotes?.length || 0);
});
requirementSchema.virtual('assigneeCount').get(function () {
    return this.assignedTo ? this.assignedTo.length : 0;
});
requirementSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});
requirementSchema.virtual('acceptanceCriteriaProgress').get(function () {
    if (!this.acceptanceCriteria || this.acceptanceCriteria.length === 0) return 0;
    const metCriteria = this.acceptanceCriteria.filter(c => c.isMet).length;
    return Math.round((metCriteria / this.acceptanceCriteria.length) * 100);
});
requirementSchema.virtual('approvalProgress').get(function () {
    if (!this.approvals || this.approvals.length === 0) return 0;
    const approvedCount = this.approvals.filter(a => a.approvalStatus === 'approved').length;
    return Math.round((approvedCount / this.approvals.length) * 100);
});
requirementSchema.index({ organizationId: 1, status: 1, isDeleted: 0 });
requirementSchema.index({ organizationId: 1, createdBy: 1, isDeleted: 0 });
requirementSchema.index({ organizationId: 1, 'assignedTo.userId': 1, isDeleted: 0 });
requirementSchema.index({ organizationId: 1, priority: 1, status: 1 });
requirementSchema.index({ organizationId: 1, complexity: 1, status: 1 });
requirementSchema.index({ contextType: 1, contextId: 1, isDeleted: 0 });
requirementSchema.index({ projectId: 1, status: 1, isDeleted: 0 });
requirementSchema.index({ sprintId: 1, status: 1, isDeleted: 0 });
requirementSchema.index({ departmentId: 1, isDeleted: 0 });
requirementSchema.index({ teamId: 1, isDeleted: 0 });
requirementSchema.index({ phaseId: 1, isDeleted: 0 });
requirementSchema.index({ folderId: 1, isDeleted: 0 });
requirementSchema.index({ serialNumber: 1 });
requirementSchema.index({ requirementNumber: 1 });
requirementSchema.index({ requirementType: 1, status: 1 });
requirementSchema.index({ category: 1, status: 1 });
requirementSchema.index({ targetDate: 1, status: 1 });
requirementSchema.index({ createdAt: -1 });
requirementSchema.index({ updatedAt: -1 });
requirementSchema.index({ completionDate: -1 });
requirementSchema.index({ 'tags.tagName': 1 });
requirementSchema.index({ 'watchers.userId': 1 });
requirementSchema.index({ 'stakeholders.userId': 1 });
requirementSchema.index({ searchableContent: 'text', title: 'text', description: 'text' });
requirementSchema.index({ isPinned: 1, organizationId: 1 });
requirementSchema.index({ isFavorite: 1, organizationId: 1 });
requirementSchema.pre('save', async function (next) {
    if (this.isNew && !this.serialNumber) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Requirement').countDocuments({
            organizationId: this.organizationId
        });
        this.serialNumber = `REQ-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }

    if (this.isNew && !this.requirementNumber) {
        const count = await mongoose.model('Requirement').countDocuments({
            organizationId: this.organizationId
        });
        this.requirementNumber = `REQ-${String(count + 1).padStart(6, '0')}`;
    }

    let searchContent = `${this.title || ''} ${this.description || ''} ${this.detailedDescription || ''}`;

    if (this.acceptanceCriteria && this.acceptanceCriteria.length > 0) {
        this.acceptanceCriteria.forEach(criteria => {
            searchContent += ` ${criteria.criteriaTitle || ''} ${criteria.criteriaDescription || ''}`;
        });
    }

    if (this.functionalRequirements && this.functionalRequirements.length > 0) {
        this.functionalRequirements.forEach(req => {
            searchContent += ` ${req.title || ''} ${req.description || ''}`;
        });
    }

    if (this.userStories && this.userStories.length > 0) {
        this.userStories.forEach(story => {
            searchContent += ` ${story.asA || ''} ${story.iWant || ''} ${story.soThat || ''}`;
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
    this.statistics.attachmentCount = (this.images?.length || 0) + (this.videos?.length || 0) + (this.attachments?.length || 0) + (this.diagrams?.length || 0) + (this.mockups?.length || 0);
    this.statistics.watcherCount = this.watchers ? this.watchers.length : 0;
    this.statistics.stakeholderCount = this.stakeholders ? this.stakeholders.length : 0;
    this.statistics.linkedBugCount = this.relatedBugs ? this.relatedBugs.length : 0;
    this.statistics.linkedRequirementCount = this.relatedRequirements ? this.relatedRequirements.length : 0;
    this.statistics.acceptanceCriteriaTotal = this.acceptanceCriteria ? this.acceptanceCriteria.length : 0;
    this.statistics.acceptanceCriteriaMet = this.acceptanceCriteria ? this.acceptanceCriteria.filter(c => c.isMet).length : 0;
    this.statistics.approvalCount = this.approvals ? this.approvals.length : 0;
    this.statistics.reviewCount = this.reviews ? this.reviews.length : 0;

    if (this.votes) {
        this.votes.totalScore = (this.votes.upvotes?.length || 0) - (this.votes.downvotes?.length || 0);
    }

    if (this.acceptanceCriteria && this.acceptanceCriteria.length > 0) {
        const metCriteria = this.acceptanceCriteria.filter(c => c.isMet).length;
        this.progress = Math.round((metCriteria / this.acceptanceCriteria.length) * 100);
    }

    next();
});

requirementSchema.methods.canBeViewedBy = function (userId) {
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

requirementSchema.methods.canBeEditedBy = function (userId) {
    if (!userId) return false;

    if (this.createdBy && this.createdBy.toString() === userId.toString()) return true;

    if (this.isLocked) return false;

    if (this.assignedTo && this.assignedTo.some(assignment =>
        assignment.userId.toString() === userId.toString() &&
        (assignment.role === 'admin' || assignment.role === 'editor')
    )) {
        return true;
    }

    return false;
};

requirementSchema.methods.canBeDeletedBy = function (userId) {
    if (!userId) return false;
    return this.createdBy && this.createdBy.toString() === userId.toString();
};

requirementSchema.methods.addComment = function (userId, userName, content, mentions, attachments) {
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

requirementSchema.methods.updateComment = function (commentId, content) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = content;
        comment.updatedAt = new Date();
        comment.isEdited = true;
    }
};

requirementSchema.methods.deleteComment = function (commentId) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        this.statistics.commentCount = this.comments.filter(c => !c.isDeleted).length;
    }
};

requirementSchema.methods.addActivity = function (activityType, performedBy, performedByName, changes, description) {
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

requirementSchema.methods.assignTo = function (userId, assignedBy, role) {
    const existingAssignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());

    if (!existingAssignment) {
        this.assignedTo.push({
            userId,
            assignedBy,
            assignedAt: new Date(),
            role: role || 'assignee'
        });
    }
};

requirementSchema.methods.unassignFrom = function (userId) {
    this.assignedTo = this.assignedTo.filter(a => a.userId.toString() !== userId.toString());
};

requirementSchema.methods.addStakeholder = function (userId, userName, userEmail, role, addedBy) {
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

requirementSchema.methods.removeStakeholder = function (userId) {
    this.stakeholders = this.stakeholders.filter(s => s.userId.toString() !== userId.toString());
    this.statistics.stakeholderCount = this.stakeholders.length;
};

requirementSchema.methods.addWatcher = function (userId) {
    const existingWatcher = this.watchers.find(w => w.userId.toString() === userId.toString());

    if (!existingWatcher) {
        this.watchers.push({
            userId,
            addedAt: new Date()
        });

        this.statistics.watcherCount = this.watchers.length;
    }
};

requirementSchema.methods.removeWatcher = function (userId) {
    this.watchers = this.watchers.filter(w => w.userId.toString() !== userId.toString());
    this.statistics.watcherCount = this.watchers.length;
};

requirementSchema.methods.addTag = function (tagName, tagColor, userId) {
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

requirementSchema.methods.removeTag = function (tagName) {
    this.tags = this.tags.filter(t => t.tagName.toLowerCase() !== tagName.toLowerCase());
};

requirementSchema.methods.updateStatus = function (newStatus, userId) {
    const oldStatus = this.status;
    this.status = newStatus;

    if (newStatus === 'completed' && !this.completionDate) {
        this.completionDate = new Date();
    }

    this.addActivity('status_changed', userId, null, {
        oldStatus,
        newStatus
    }, `Status changed from ${oldStatus} to ${newStatus}`);
};

requirementSchema.methods.addAcceptanceCriteria = function (criteriaTitle, criteriaDescription, priority) {
    const criteriaId = `criteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.acceptanceCriteria.push({
        criteriaId,
        criteriaNumber: this.acceptanceCriteria.length + 1,
        criteriaTitle,
        criteriaDescription,
        isMet: false,
        priority: priority || 'medium',
        createdAt: new Date()
    });

    this.statistics.acceptanceCriteriaTotal = this.acceptanceCriteria.length;
};

requirementSchema.methods.markCriteriaMet = function (criteriaId, userId) {
    const criteria = this.acceptanceCriteria.find(c => c.criteriaId === criteriaId);

    if (criteria) {
        criteria.isMet = true;
        criteria.metBy = userId;
        criteria.metAt = new Date();
        this.statistics.acceptanceCriteriaMet = this.acceptanceCriteria.filter(c => c.isMet).length;
    }
};

requirementSchema.methods.linkReference = function (referenceType, referenceId, referenceTitle, userId) {
    this.references.push({
        referenceType,
        referenceId,
        referenceTitle,
        addedBy: userId,
        addedAt: new Date()
    });
};

requirementSchema.methods.unlinkReference = function (referenceId) {
    this.references = this.references.filter(ref =>
        ref.referenceId && ref.referenceId.toString() !== referenceId.toString()
    );
};

requirementSchema.methods.addReview = function (reviewedBy, reviewerName, reviewStatus, reviewComments) {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.reviews.push({
        reviewId,
        reviewedBy,
        reviewerName,
        reviewStatus,
        reviewComments,
        reviewDate: new Date()
    });

    this.statistics.reviewCount = this.reviews.length;

    return reviewId;
};

requirementSchema.methods.addApproval = function (approvedBy, approverName, approverRole) {
    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.approvals.push({
        approvalId,
        approvedBy,
        approverName,
        approverRole,
        approvalStatus: 'pending',
        requestedAt: new Date()
    });

    this.statistics.approvalCount = this.approvals.length;

    return approvalId;
};

requirementSchema.methods.updateApprovalStatus = function (approvalId, approvalStatus, approvalComments) {
    const approval = this.approvals.find(a => a.approvalId === approvalId);

    if (approval) {
        approval.approvalStatus = approvalStatus;
        approval.approvalComments = approvalComments;
        approval.approvedAt = new Date();

        if (approvalStatus === 'approved') {
            const allApproved = this.approvals.every(a => a.approvalStatus === 'approved');
            if (allApproved && !this.approvalDate) {
                this.approvalDate = new Date();
            }
        }
    }
};

requirementSchema.methods.createVersion = function (userId, versionName, changes) {
    const versionNumber = this.currentVersion + 1;

    this.versions.push({
        versionNumber,
        versionName: versionName || `Version ${versionNumber}`,
        title: this.title,
        description: this.description,
        requirementData: {
            acceptanceCriteria: this.acceptanceCriteria,
            functionalRequirements: this.functionalRequirements,
            nonFunctionalRequirements: this.nonFunctionalRequirements,
            userStories: this.userStories,
            useCases: this.useCases
        },
        changes,
        createdBy: userId,
        createdAt: new Date()
    });

    this.currentVersion = versionNumber;
};

requirementSchema.methods.addTimeLog = function (userId, duration, description) {
    this.timeTracking.push({
        userId,
        startTime: new Date(),
        duration,
        description,
        loggedAt: new Date()
    });

    this.statistics.timeSpent = (this.statistics.timeSpent || 0) + duration;
};

requirementSchema.statics.markAsDeleted = function (requirementId, deletedBy) {
    return this.findByIdAndUpdate(requirementId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
    });
};

requirementSchema.statics.markAsArchived = function (requirementId, archivedBy) {
    return this.findByIdAndUpdate(requirementId, {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: archivedBy
    });
};

requirementSchema.statics.restore = function (requirementId) {
    return this.findByIdAndUpdate(requirementId, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
    });
};

const Requirement = mongoose.model('Requirement', requirementSchema);

export default Requirement;