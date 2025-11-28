import mongoose from 'mongoose';

const phaseSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        slug: {
            type: String
        },
        phaseSerialNumber: {
            type: String
        },
        description: {
            type: String,
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
        parentPhaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase',
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
        childPhases: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase'
        }],
        phaseNumber: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'],
            default: 'planned'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
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
        sprints: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint'
        }],
        milestones: [{
            milestoneId: String,
            name: String,
            description: String,
            dueDate: Date,
            status: {
                type: String,
                enum: ['pending', 'completed', 'missed'],
                default: 'pending'
            },
            completedAt: Date,
            completedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        deliverables: [{
            deliverableId: String,
            name: String,
            description: String,
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'completed', 'rejected'],
                default: 'pending'
            },
            dueDate: Date,
            submittedAt: Date,
            submittedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        dependencies: [{
            phaseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Phase'
            },
            dependencyType: {
                type: String,
                enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
                default: 'finish_to_start'
            },
            lagDays: {
                type: Number,
                default: 0
            }
        }],
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
            parentPhaseName: String
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
            inheritedFromParent: {
                type: Boolean,
                default: true
            }
        },
        statistics: {
            totalSubPhases: {
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
            totalBugs: {
                type: Number,
                default: 0
            },
            openBugs: {
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
            totalSprints: {
                type: Number,
                default: 0
            },
            completedMilestones: {
                type: Number,
                default: 0
            },
            totalDeliverables: {
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
        collection: 'phases',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

phaseSchema.virtual('isRootPhase').get(function () {
    return !this.parentPhaseId;
});

phaseSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

phaseSchema.virtual('isOverdue').get(function () {
    if (!this.endDate) return false;
    return this.status !== 'completed' && this.endDate < new Date();
});

phaseSchema.virtual('completionPercentage').get(function () {
    return this.progress;
});

phaseSchema.virtual('daysRemaining').get(function () {
    if (!this.endDate) return null;
    const now = new Date();
    const diffTime = this.endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

phaseSchema.virtual('assignedUserCount').get(function () {
    return this.assignedTo.length;
});

phaseSchema.index({ organizationId: 1, isDeleted: 1 });
phaseSchema.index({ projectId: 1, isDeleted: 1 });
phaseSchema.index({ parentPhaseId: 1, isDeleted: 1 });
phaseSchema.index({ organizationId: 1, projectId: 1, isDeleted: 1 });
phaseSchema.index({ hierarchyPath: 1 });
phaseSchema.index({ owner: 1 });
phaseSchema.index({ 'assignedTo.userId': 1 });
phaseSchema.index({ status: 1, isDeleted: 1 });
phaseSchema.index({ priority: 1, isDeleted: 1 });
phaseSchema.index({ startDate: 1, endDate: 1 });
phaseSchema.index({ createdAt: -1 });
phaseSchema.index({ name: 'text', description: 'text' });

phaseSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentPhaseId') || this.isNew) {
        if (this.parentPhaseId) {
            const parentPhase = await mongoose.model('Phase').findById(this.parentPhaseId);
            if (parentPhase) {
                this.hierarchyLevel = parentPhase.hierarchyLevel + 1;
                this.hierarchyPath = parentPhase.hierarchyPath
                    ? `${parentPhase.hierarchyPath}/${this._id.toString()}`
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

phaseSchema.methods.isOwner = function (userId) {
    return this.owner.toString() === userId.toString();
};

phaseSchema.methods.isAssigned = function (userId) {
    return this.assignedTo.some(a => a.userId.toString() === userId.toString()) ||
        this.isOwner(userId);
};

phaseSchema.methods.getUserRole = function (userId) {
    if (this.isOwner(userId)) return 'owner';

    const assignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());
    return assignment ? assignment.role : null;
};

phaseSchema.methods.addAssignedUser = function (userId, assignedBy, role = 'contributor') {
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

phaseSchema.methods.removeAssignedUser = function (userId) {
    this.assignedTo = this.assignedTo.filter(a => a.userId.toString() !== userId.toString());
};

phaseSchema.methods.updateUserRole = function (userId, newRole) {
    const assignment = this.assignedTo.find(a => a.userId.toString() === userId.toString());
    if (assignment) {
        assignment.role = newRole;
    }
};

phaseSchema.methods.addSubPhase = function (subPhaseId) {
    if (!this.childPhases.includes(subPhaseId)) {
        this.childPhases.push(subPhaseId);
        this.statistics.totalSubPhases += 1;
    }
};

phaseSchema.methods.removeSubPhase = function (subPhaseId) {
    this.childPhases = this.childPhases.filter(p => p.toString() !== subPhaseId.toString());
    this.statistics.totalSubPhases = Math.max(0, this.statistics.totalSubPhases - 1);
};

phaseSchema.methods.addFolder = function (folderId) {
    if (!this.folders.includes(folderId)) {
        this.folders.push(folderId);
        this.statistics.totalFolders += 1;
    }
};

phaseSchema.methods.removeFolder = function (folderId) {
    this.folders = this.folders.filter(f => f.toString() !== folderId.toString());
    this.statistics.totalFolders = Math.max(0, this.statistics.totalFolders - 1);
};

phaseSchema.methods.addDocument = function (documentId, addedBy) {
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

phaseSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
};

phaseSchema.methods.addSheet = function (sheetId, addedBy) {
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

phaseSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
};

phaseSchema.methods.addSlide = function (slideId, addedBy) {
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

phaseSchema.methods.removeSlide = function (slideId) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
};

phaseSchema.methods.addBug = function (bugId) {
    if (!this.bugs.includes(bugId)) {
        this.bugs.push(bugId);
        this.statistics.totalBugs += 1;
        this.statistics.openBugs += 1;
    }
};

phaseSchema.methods.removeBug = function (bugId) {
    this.bugs = this.bugs.filter(b => b.toString() !== bugId.toString());
    this.statistics.totalBugs = Math.max(0, this.statistics.totalBugs - 1);
};

phaseSchema.methods.updateBugCounts = function (openCount, closedCount) {
    this.statistics.openBugs = openCount;
    this.statistics.closedBugs = closedCount;
};

phaseSchema.methods.addRequirement = function (requirementId) {
    if (!this.requirements.includes(requirementId)) {
        this.requirements.push(requirementId);
        this.statistics.totalRequirements += 1;
    }
};

phaseSchema.methods.removeRequirement = function (requirementId) {
    this.requirements = this.requirements.filter(r => r.toString() !== requirementId.toString());
    this.statistics.totalRequirements = Math.max(0, this.statistics.totalRequirements - 1);
};

phaseSchema.methods.updateRequirementCounts = function (completedCount) {
    this.statistics.completedRequirements = completedCount;
};

phaseSchema.methods.addSprint = function (sprintId) {
    if (!this.sprints.includes(sprintId)) {
        this.sprints.push(sprintId);
        this.statistics.totalSprints += 1;
    }
};

phaseSchema.methods.removeSprint = function (sprintId) {
    this.sprints = this.sprints.filter(s => s.toString() !== sprintId.toString());
    this.statistics.totalSprints = Math.max(0, this.statistics.totalSprints - 1);
};

phaseSchema.methods.addMilestone = function (milestoneId, name, description, dueDate) {
    const existingMilestone = this.milestones.find(m => m.milestoneId === milestoneId);

    if (!existingMilestone) {
        this.milestones.push({
            milestoneId,
            name,
            description,
            dueDate,
            status: 'pending',
            createdAt: new Date()
        });
    }
};

phaseSchema.methods.completeMilestone = function (milestoneId, completedBy) {
    const milestone = this.milestones.find(m => m.milestoneId === milestoneId);

    if (milestone && milestone.status !== 'completed') {
        milestone.status = 'completed';
        milestone.completedAt = new Date();
        milestone.completedBy = completedBy;
        this.statistics.completedMilestones += 1;
    }
};

phaseSchema.methods.addDeliverable = function (deliverableId, name, description, dueDate) {
    const existingDeliverable = this.deliverables.find(d => d.deliverableId === deliverableId);

    if (!existingDeliverable) {
        this.deliverables.push({
            deliverableId,
            name,
            description,
            dueDate,
            status: 'pending',
            createdAt: new Date()
        });

        this.statistics.totalDeliverables += 1;
    }
};

phaseSchema.methods.updateDeliverableStatus = function (deliverableId, status, userId) {
    const deliverable = this.deliverables.find(d => d.deliverableId === deliverableId);

    if (deliverable) {
        deliverable.status = status;

        if (status === 'completed') {
            deliverable.submittedAt = new Date();
            deliverable.submittedBy = userId;
        }
    }
};

phaseSchema.methods.addDependency = function (phaseId, dependencyType = 'finish_to_start', lagDays = 0) {
    const existingDependency = this.dependencies.find(d => d.phaseId.toString() === phaseId.toString());

    if (!existingDependency) {
        this.dependencies.push({
            phaseId,
            dependencyType,
            lagDays
        });
    }
};

phaseSchema.methods.removeDependency = function (phaseId) {
    this.dependencies = this.dependencies.filter(d => d.phaseId.toString() !== phaseId.toString());
};

phaseSchema.methods.updateProgress = function (progress) {
    this.progress = Math.min(100, Math.max(0, progress));

    if (this.progress === 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.actualEndDate = new Date();
    }
};

phaseSchema.methods.startPhase = function () {
    if (this.status === 'planned') {
        this.status = 'in_progress';
        this.actualStartDate = new Date();
    }
};

phaseSchema.methods.completePhase = function () {
    this.status = 'completed';
    this.progress = 100;
    this.actualEndDate = new Date();

    if (this.startDate && this.actualEndDate) {
        const diffTime = this.actualEndDate - this.startDate;
        this.duration.actualDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

phaseSchema.methods.holdPhase = function () {
    if (this.status === 'in_progress') {
        this.status = 'on_hold';
    }
};

phaseSchema.methods.cancelPhase = function () {
    this.status = 'cancelled';
};

phaseSchema.methods.addLabel = function (labelId, labelName, color, description) {
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

phaseSchema.methods.removeLabel = function (labelId) {
    this.labels = this.labels.filter(l => l.labelId !== labelId);
};

phaseSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

phaseSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

phaseSchema.methods.addCustomField = function (fieldId, fieldName, fieldType, fieldValue) {
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

phaseSchema.methods.removeCustomField = function (fieldId) {
    this.customFields = this.customFields.filter(f => f.fieldId !== fieldId);
};

phaseSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, uploadedBy) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        fileType,
        uploadedAt: new Date(),
        uploadedBy
    });
};

phaseSchema.methods.removeAttachment = function (fileId) {
    this.attachments = this.attachments.filter(a => a.fileId !== fileId);
};

phaseSchema.methods.addComment = function (commentId, userId, content, mentionedUsers = []) {
    this.comments.push({
        commentId,
        userId,
        content,
        mentionedUsers,
        createdAt: new Date(),
        isEdited: false
    });
};

phaseSchema.methods.updateComment = function (commentId, newContent) {
    const comment = this.comments.find(c => c.commentId === commentId);

    if (comment) {
        comment.content = newContent;
        comment.updatedAt = new Date();
        comment.isEdited = true;
    }
};

phaseSchema.methods.removeComment = function (commentId) {
    this.comments = this.comments.filter(c => c.commentId !== commentId);
};

phaseSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
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

phaseSchema.methods.canCreateSubPhase = function () {
    return this.hierarchyLevel < 50;
};

phaseSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

phaseSchema.methods.restore = function () {
    this.isDeleted = false;
    this.isActive = true;
    this.deletedAt = null;
    this.deletedBy = null;
};

phaseSchema.methods.getHierarchyPath = function () {
    return this.hierarchyPath.split('/');
};

phaseSchema.methods.getAllAncestors = async function () {
    if (!this.parentPhaseId) {
        return [];
    }

    const ancestors = [];
    let currentId = this.parentPhaseId;

    while (currentId) {
        const parent = await mongoose.model('Phase').findById(currentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.parentPhaseId;
        } else {
            break;
        }
    }

    return ancestors;
};

phaseSchema.methods.getAllDescendants = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await mongoose.model('Phase').find({ parentPhaseId: currentId });

        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

phaseSchema.methods.calculateEstimatedDuration = function () {
    if (this.startDate && this.endDate) {
        const diffTime = this.endDate - this.startDate;
        this.duration.estimatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

phaseSchema.methods.updateMetadata = function (metadata) {
    this.metadata = {
        ...this.metadata,
        ...metadata
    };
};

const Phase = mongoose.model('Phase', phaseSchema);

export default Phase;