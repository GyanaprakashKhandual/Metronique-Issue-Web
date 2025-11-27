import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
    {
        name: {
            type: String,


            minlength: 2,
            maxlength: 100
        },
        slug: {
            type: String,

            lowercase: true,
            match: /^[a-z0-9-]+$/
        },
        description: {
            type: String,
            maxlength: 1000,
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

            index: true
        },
        phaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
            default: null,
            index: true
        },
        parentSprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
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
        childSprints: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint'
        }],
        sprintNumber: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['planning', 'active', 'paused', 'completed', 'cancelled'],
            default: 'planning'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        sprintType: {
            type: String,
            enum: ['standard', 'hardening', 'planning', 'release', 'custom'],
            default: 'standard'
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        actualStartDate: {
            type: Date,
            default: null
        },
        actualEndDate: {
            type: Date,
            default: null
        },
        duration: {
            estimatedDays: {
                type: Number,
                default: 0
            },
            actualDays: {
                type: Number,
                default: 0
            }
        },
        velocity: {
            planned: {
                type: Number,
                default: 0
            },
            actual: {
                type: Number,
                default: 0
            }
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedTo: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            assignedAt: {
                type: Date,
                default: Date.now
            },
            assignedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'lead', 'contributor', 'viewer'],
                default: 'contributor'
            }
        }],
        folders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder'
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
        bugs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bug'
        }],
        requirements: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Requirement'
        }],
        stories: [{
            storyId: String,
            title: String,
            description: String,
            storyPoints: {
                type: Number,
                default: 0
            },
            status: {
                type: String,
                enum: ['backlog', 'todo', 'in_progress', 'review', 'done'],
                default: 'backlog'
            },
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            completedAt: {
                type: Date,
                default: null
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium'
            }
        }],
        tasks: [{
            taskId: String,
            title: String,
            description: String,
            status: {
                type: String,
                enum: ['todo', 'in_progress', 'done', 'blocked'],
                default: 'todo'
            },
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium'
            },
            dueDate: Date,
            estimatedHours: {
                type: Number,
                default: 0
            },
            actualHours: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            completedAt: {
                type: Date,
                default: null
            }
        }],
        burndown: [{
            date: {
                type: Date,
                required: true
            },
            remainingPoints: {
                type: Number,
                default: 0
            },
            completedPoints: {
                type: Number,
                default: 0
            },
            recordedAt: {
                type: Date,
                default: Date.now
            }
        }],
        retrospective: {
            completed: {
                type: Boolean,
                default: false
            },
            whatWentWell: [String],
            whatCouldImprove: [String],
            actionItems: [{
                item: String,
                owner: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                dueDate: Date,
                completed: {
                    type: Boolean,
                    default: false
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            conductedAt: Date,
            conductedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        standups: [{
            date: {
                type: Date,
                required: true
            },
            attendees: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            updates: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                whatDidYesterday: String,
                whatToday: String,
                blockers: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }],
            conductedAt: Date,
            conductedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        goals: [{
            goalId: String,
            title: String,
            description: String,
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'completed', 'failed'],
                default: 'pending'
            },
            successCriteria: [String],
            createdAt: {
                type: Date,
                default: Date.now
            },
            completedAt: {
                type: Date,
                default: null
            }
        }],
        metrics: {
            totalStories: {
                type: Number,
                default: 0
            },
            completedStories: {
                type: Number,
                default: 0
            },
            totalTasks: {
                type: Number,
                default: 0
            },
            completedTasks: {
                type: Number,
                default: 0
            },
            totalBugs: {
                type: Number,
                default: 0
            },
            closedBugs: {
                type: Number,
                default: 0
            },
            totalRequirements: {
                type: Number,
                default: 0
            },
            completedRequirements: {
                type: Number,
                default: 0
            },
            plannedVelocity: {
                type: Number,
                default: 0
            },
            actualVelocity: {
                type: Number,
                default: 0
            },
            blockedItems: {
                type: Number,
                default: 0
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
            parentSprintName: String
        },
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
            inheritedFromParent: {
                type: Boolean,
                default: true
            }
        },
        statistics: {
            totalSubSprints: {
                type: Number,
                default: 0
            },
            totalFolders: {
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
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        labels: [{
            labelId: String,
            labelName: String,
            color: String,
            description: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        tags: [String],
        customFields: [{
            fieldId: String,
            fieldName: String,
            fieldType: {
                type: String,
                enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox']
            },
            fieldValue: mongoose.Schema.Types.Mixed,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        attachments: [{
            fileId: String,
            fileName: String,
            fileSize: Number,
            fileType: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        comments: [{
            commentId: String,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: String,
            mentionedUsers: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: Date,
            isEdited: {
                type: Boolean,
                default: false
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
        notes: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
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
        }
    },
    {
        timestamps: true,
        collection: 'sprints',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

sprintSchema.virtual('isRootSprint').get(function () {
    return !this.parentSprintId;
});

sprintSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

sprintSchema.virtual('isOverdue').get(function () {
    if (!this.endDate) return false;
    return this.status !== 'completed' && this.status !== 'cancelled' && this.endDate < new Date();
});

sprintSchema.virtual('isActive').get(function () {
    return this.status === 'active' && this.actualStartDate;
});

sprintSchema.virtual('daysRemaining').get(function () {
    if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') return null;
    const now = new Date();
    const diffTime = this.endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

sprintSchema.virtual('sprintDuration').get(function () {
    if (!this.startDate || !this.endDate) return null;
    const diffTime = this.endDate - this.startDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

sprintSchema.virtual('completionPercentage').get(function () {
    return this.progress;
});

sprintSchema.virtual('assignedUserCount').get(function () {
    return this.assignedTo.length;
});

sprintSchema.virtual('storyCompletionRate').get(function () {
    if (this.metrics.totalStories === 0) return 0;
    return Math.round((this.metrics.completedStories / this.metrics.totalStories) * 100);
});

sprintSchema.virtual('taskCompletionRate').get(function () {
    if (this.metrics.totalTasks === 0) return 0;
    return Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100);
});

sprintSchema.virtual('bugCompletionRate').get(function () {
    if (this.metrics.totalBugs === 0) return 0;
    return Math.round((this.metrics.closedBugs / this.metrics.totalBugs) * 100);
});

sprintSchema.virtual('velocityTrend').get(function () {
    if (this.velocity.planned === 0) return 0;
    return Math.round((this.velocity.actual / this.velocity.planned) * 100);
});

sprintSchema.index({ organizationId: 1, isDeleted: 1 });
sprintSchema.index({ projectId: 1, isDeleted: 1 });
sprintSchema.index({ phaseId: 1, isDeleted: 1 });
sprintSchema.index({ parentSprintId: 1, isDeleted: 1 });
sprintSchema.index({ organizationId: 1, projectId: 1, isDeleted: 1 });
sprintSchema.index({ hierarchyPath: 1 });
sprintSchema.index({ owner: 1 });
sprintSchema.index({ 'assignedTo.userId': 1 });
sprintSchema.index({ status: 1, isDeleted: 1 });
sprintSchema.index({ priority: 1, isDeleted: 1 });
sprintSchema.index({ startDate: 1, endDate: 1 });
sprintSchema.index({ createdAt: -1 });
sprintSchema.index({ name: 'text', description: 'text' });

sprintSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentSprintId') || this.isNew) {
        if (this.parentSprintId) {
            const parentSprint = await mongoose.model('Sprint').findById(this.parentSprintId);
            if (parentSprint) {
                this.hierarchyLevel = parentSprint.hierarchyLevel + 1;
                this.hierarchyPath = parentSprint.hierarchyPath
                    ? `${parentSprint.hierarchyPath}/${this._id.toString()}`
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

sprintSchema.methods.isOwner = function (userId) {
    return this.owner.toString() === userId.toString();
};

sprintSchema.methods.isAssigned = function (userId) {
    return this.assignedTo.some(a => a.userId.toString() === userId.toString()) ||
        this.isOwner(userId);
};

sprintSchema.methods.getUserRole = function (userId) {
    if (this.isOwner(userId)) return 'owner';

    const assignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());
    return assignment ? assignment.role : null;
};

sprintSchema.methods.addAssignedUser = function (userId, assignedBy, role = 'contributor') {
    const existingAssignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());

    if (!existingAssignment) {
        this.assignedTo.push({
            userId,
            assignedAt: new Date(),
            assignedBy,
            role
        });
    }
};

sprintSchema.methods.removeAssignedUser = function (userId) {
    this.assignedTo = this.assignedTo.filter(a => a.userId.toString() !== userId.toString());
};

sprintSchema.methods.updateUserRole = function (userId, newRole) {
    const assignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());
    if (assignment) {
        assignment.role = newRole;
    }
};

sprintSchema.methods.addSubSprint = function (subSprintId) {
    if (!this.childSprints.includes(subSprintId)) {
        this.childSprints.push(subSprintId);
        this.statistics.totalSubSprints += 1;
    }
};

sprintSchema.methods.removeSubSprint = function (subSprintId) {
    this.childSprints = this.childSprints.filter(s => s.toString() !== subSprintId.toString());
    this.statistics.totalSubSprints = Math.max(0, this.statistics.totalSubSprints - 1);
};

sprintSchema.methods.addFolder = function (folderId) {
    if (!this.folders.includes(folderId)) {
        this.folders.push(folderId);
        this.statistics.totalFolders += 1;
    }
};

sprintSchema.methods.removeFolder = function (folderId) {
    this.folders = this.folders.filter(f => f.toString() !== folderId.toString());
    this.statistics.totalFolders = Math.max(0, this.statistics.totalFolders - 1);
};

sprintSchema.methods.addDocument = function (documentId, addedBy) {
    const existingDoc = this.documents.find(d => d.documentId.toString() === documentId.toString());

    if (!existingDoc) {
        this.documents.push({
            documentId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalDocuments += 1;
    }
};

sprintSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
};

sprintSchema.methods.addSheet = function (sheetId, addedBy) {
    const existingSheet = this.sheets.find(s => s.sheetId.toString() === sheetId.toString());

    if (!existingSheet) {
        this.sheets.push({
            sheetId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalSheets += 1;
    }
};

sprintSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
};

sprintSchema.methods.addSlide = function (slideId, addedBy) {
    const existingSlide = this.slides.find(s => s.slideId.toString() === slideId.toString());

    if (!existingSlide) {
        this.slides.push({
            slideId,
            addedAt: new Date(),
            addedBy
        });

        this.statistics.totalSlides += 1;
    }
};

sprintSchema.methods.removeSlide = function (slideId) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
};

sprintSchema.methods.addBug = function (bugId) {
    if (!this.bugs.includes(bugId)) {
        this.bugs.push(bugId);
        this.metrics.totalBugs += 1;
    }
};

sprintSchema.methods.removeBug = function (bugId) {
    this.bugs = this.bugs.filter(b => b.toString() !== bugId.toString());
    this.metrics.totalBugs = Math.max(0, this.metrics.totalBugs - 1);
};

sprintSchema.methods.updateBugCounts = function (closedCount) {
    this.metrics.closedBugs = closedCount;
};

sprintSchema.methods.addRequirement = function (requirementId) {
    if (!this.requirements.includes(requirementId)) {
        this.requirements.push(requirementId);
        this.metrics.totalRequirements += 1;
    }
};

sprintSchema.methods.removeRequirement = function (requirementId) {
    this.requirements = this.requirements.filter(r => r.toString() !== requirementId.toString());
    this.metrics.totalRequirements = Math.max(0, this.metrics.totalRequirements - 1);
};

sprintSchema.methods.updateRequirementCounts = function (completedCount) {
    this.metrics.completedRequirements = completedCount;
};

sprintSchema.methods.addStory = function (storyId, title, description, storyPoints = 0) {
    const existingStory = this.stories.find(s => s.storyId === storyId);

    if (!existingStory) {
        this.stories.push({
            storyId,
            title,
            description,
            storyPoints,
            status: 'backlog',
            createdAt: new Date()
        });

        this.metrics.totalStories += 1;
        this.velocity.planned += storyPoints;
    }
};

sprintSchema.methods.removeStory = function (storyId) {
    const story = this.stories.find(s => s.storyId === storyId);

    if (story) {
        this.velocity.planned = Math.max(0, this.velocity.planned - story.storyPoints);
        if (story.status === 'done') {
            this.metrics.completedStories = Math.max(0, this.metrics.completedStories - 1);
        }

        this.stories = this.stories.filter(s => s.storyId !== storyId);
        this.metrics.totalStories = Math.max(0, this.metrics.totalStories - 1);
    }
};

sprintSchema.methods.updateStoryStatus = function (storyId, newStatus) {
    const story = this.stories.find(s => s.storyId === storyId);

    if (story) {
        const previousStatus = story.status;
        story.status = newStatus;

        if (newStatus === 'done' && previousStatus !== 'done') {
            this.metrics.completedStories += 1;
            this.velocity.actual += story.storyPoints;
            story.completedAt = new Date();
        } else if (newStatus !== 'done' && previousStatus === 'done') {
            this.metrics.completedStories = Math.max(0, this.metrics.completedStories - 1);
            this.velocity.actual = Math.max(0, this.velocity.actual - story.storyPoints);
            story.completedAt = null;
        }
    }
};

sprintSchema.methods.addTask = function (taskId, title, description, estimatedHours = 0) {
    const existingTask = this.tasks.find(t => t.taskId === taskId);

    if (!existingTask) {
        this.tasks.push({
            taskId,
            title,
            description,
            status: 'todo',
            estimatedHours,
            createdAt: new Date()
        });

        this.metrics.totalTasks += 1;
    }
};

sprintSchema.methods.removeTask = function (taskId) {
    const task = this.tasks.find(t => t.taskId === taskId);

    if (task) {
        if (task.status === 'done') {
            this.metrics.completedTasks = Math.max(0, this.metrics.completedTasks - 1);
        }

        if (task.status === 'blocked') {
            this.metrics.blockedItems = Math.max(0, this.metrics.blockedItems - 1);
        }

        this.tasks = this.tasks.filter(t => t.taskId !== taskId);
        this.metrics.totalTasks = Math.max(0, this.metrics.totalTasks - 1);
    }
};

sprintSchema.methods.updateTaskStatus = function (taskId, newStatus) {
    const task = this.tasks.find(t => t.taskId === taskId);

    if (task) {
        const previousStatus = task.status;
        task.status = newStatus;

        if (newStatus === 'done' && previousStatus !== 'done') {
            this.metrics.completedTasks += 1;
            task.completedAt = new Date();
        } else if (newStatus !== 'done' && previousStatus === 'done') {
            this.metrics.completedTasks = Math.max(0, this.metrics.completedTasks - 1);
            task.completedAt = null;
        }

        if (newStatus === 'blocked' && previousStatus !== 'blocked') {
            this.metrics.blockedItems += 1;
        } else if (newStatus !== 'blocked' && previousStatus === 'blocked') {
            this.metrics.blockedItems = Math.max(0, this.metrics.blockedItems - 1);
        }
    }
};

sprintSchema.methods.addBurndownEntry = function (remainingPoints, completedPoints) {
    this.burndown.push({
        date: new Date(),
        remainingPoints,
        completedPoints,
        recordedAt: new Date()
    });

    if (this.burndown.length > 365) {
        this.burndown = this.burndown.slice(-365);
    }
};

sprintSchema.methods.recordStandup = function (date, attendees, updates, conductedBy) {
    this.standups.push({
        date,
        attendees,
        updates,
        conductedAt: new Date(),
        conductedBy
    });
};

sprintSchema.methods.completeRetrospective = function (whatWentWell, whatCouldImprove, actionItems, conductedBy) {
    this.retrospective = {
        completed: true,
        whatWentWell,
        whatCouldImprove,
        actionItems,
        conductedAt: new Date(),
        conductedBy
    };
};

sprintSchema.methods.addGoal = function (goalId, title, description, successCriteria = []) {
    const existingGoal = this.goals.find(g => g.goalId === goalId);

    if (!existingGoal) {
        this.goals.push({
            goalId,
            title,
            description,
            status: 'pending',
            successCriteria,
            createdAt: new Date()
        });
    }
};

sprintSchema.methods.completeGoal = function (goalId) {
    const goal = this.goals.find(g => g.goalId === goalId);

    if (goal && goal.status !== 'completed') {
        goal.status = 'completed';
        goal.completedAt = new Date();
    }
};

sprintSchema.methods.updateProgress = function (progress) {
    this.progress = Math.min(100, Math.max(0, progress));

    if (this.progress === 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.actualEndDate = new Date();
    }
};

sprintSchema.methods.startSprint = function () {
    if (this.status === 'planning') {
        this.status = 'active';
        this.actualStartDate = new Date();
    }
};

sprintSchema.methods.completeSprint = function () {
    this.status = 'completed';
    this.progress = 100;
    this.actualEndDate = new Date();

    if (this.startDate && this.actualEndDate) {
        const diffTime = this.actualEndDate - this.startDate;
        this.duration.actualDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

sprintSchema.methods.pauseSprint = function () {
    if (this.status === 'active') {
        this.status = 'paused';
    }
};

sprintSchema.methods.resumeSprint = function () {
    if (this.status === 'paused') {
        this.status = 'active';
    }
};

sprintSchema.methods.cancelSprint = function () {
    this.status = 'cancelled';
};

sprintSchema.methods.addLabel = function (labelId, labelName, color, description) {
    const existingLabel = this.labels.find(l => l.labelId === labelId);

    if (!existingLabel) {
        this.labels.push({
            labelId,
            labelName,
            color,
            description,
            createdAt: new Date()
        });
    }
};

sprintSchema.methods.removeLabel = function (labelId) {
    this.labels = this.labels.filter(l => l.labelId !== labelId);
};

sprintSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

sprintSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

sprintSchema.methods.addCustomField = function (fieldId, fieldName, fieldType, fieldValue) {
    const existingField = this.customFields.find(f => f.fieldId === fieldId);

    if (existingField) {
        existingField.fieldValue = fieldValue;
    } else {
        this.customFields.push({
            fieldId,
            fieldName,
            fieldType,
            fieldValue,
            createdAt: new Date()
        });
    }
};

sprintSchema.methods.removeCustomField = function (fieldId) {
    this.customFields = this.customFields.filter(f => f.fieldId !== fieldId);
};

sprintSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, uploadedBy) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        fileType,
        uploadedAt: new Date(),
        uploadedBy
    });
};

sprintSchema.methods.removeAttachment = function (fileId) {
    this.attachments = this.attachments.filter(a => a.fileId !== fileId);
};

sprintSchema.methods.addComment = function (commentId, userId, content, mentionedUsers = []) {
    this.comments.push({
        commentId,
        userId,
        content,
        mentionedUsers,
        createdAt: new Date(),
        isEdited: false
    });
};

sprintSchema.methods.updateComment = function (commentId, newContent) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = newContent;
        comment.updatedAt = new Date();
        comment.isEdited = true;
    }
};

sprintSchema.methods.removeComment = function (commentId) {
    this.comments = this.comments.filter(c => c.commentId !== commentId);
};

sprintSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
    this.activityLog.push({
        action,
        performedBy,
        resourceType,
        resourceId,
        timestamp: new Date(),
        details
    });

    if (this.activityLog.length > 10000) {
        this.activityLog = this.activityLog.slice(-10000);
    }
};

sprintSchema.methods.canCreateSubSprint = function () {
    return this.hierarchyLevel < 50;
};

sprintSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

sprintSchema.methods.restore = function () {
    this.isDeleted = false;
    this.isActive = true;
    this.deletedAt = null;
    this.deletedBy = null;
};

sprintSchema.methods.getHierarchyPath = function () {
    return this.hierarchyPath.split('/');
};

sprintSchema.methods.getAllAncestors = async function () {
    if (!this.parentSprintId) {
        return [];
    }

    const ancestors = [];
    let currentId = this.parentSprintId;

    while (currentId) {
        const parent = await mongoose.model('Sprint').findById(currentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.parentSprintId;
        } else {
            break;
        }
    }

    return ancestors;
};

sprintSchema.methods.getAllDescendants = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await mongoose.model('Sprint').find({ parentSprintId: currentId });

        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

sprintSchema.methods.calculateEstimatedDuration = function () {
    if (this.startDate && this.endDate) {
        const diffTime = this.endDate - this.startDate;
        this.duration.estimatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

sprintSchema.methods.updateMetadata = function (metadata) {
    this.metadata = {
        ...this.metadata,
        ...metadata
    };
};

sprintSchema.methods.getBurndownChart = function (limit = 30) {
    return this.burndown.slice(-limit);
};

sprintSchema.methods.getSprintHealth = function () {
    const storyRate = this.storyCompletionRate;
    const taskRate = this.taskCompletionRate;
    const bugRate = this.bugCompletionRate;
    const averageHealth = Math.round((storyRate + taskRate + bugRate) / 3);

    return {
        overallHealth: averageHealth,
        storyHealth: storyRate,
        taskHealth: taskRate,
        bugHealth: bugRate,
        blockedItems: this.metrics.blockedItems,
        velocityTrend: this.velocityTrend
    };
};

sprintSchema.methods.getSprintSummary = function () {
    return {
        id: this._id,
        name: this.name,
        status: this.status,
        progress: this.progress,
        startDate: this.startDate,
        endDate: this.endDate,
        actualStartDate: this.actualStartDate,
        actualEndDate: this.actualEndDate,
        daysRemaining: this.daysRemaining,
        velocity: {
            planned: this.velocity.planned,
            actual: this.velocity.actual,
            trend: this.velocityTrend
        },
        metrics: {
            stories: {
                total: this.metrics.totalStories,
                completed: this.metrics.completedStories,
                rate: this.storyCompletionRate
            },
            tasks: {
                total: this.metrics.totalTasks,
                completed: this.metrics.completedTasks,
                rate: this.taskCompletionRate
            },
            bugs: {
                total: this.metrics.totalBugs,
                closed: this.metrics.closedBugs,
                rate: this.bugCompletionRate
            },
            blockedItems: this.metrics.blockedItems
        }
    };
};

const Sprint = mongoose.model('Sprint', sprintSchema);

export default Sprint;