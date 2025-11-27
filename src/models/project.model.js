import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
        key: {
            type: String,

            unique: true,
            uppercase: true,
            match: /^[A-Z][A-Z0-9]{0,9}$/
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
            index: true
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
            index: true
        },
        parentProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
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
        childProjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }],
        icon: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: '#3498db'
        },
        visibility: {
            type: String,
            enum: ['private', 'internal', 'public'],
            default: 'private'
        },
        projectType: {
            type: String,
            enum: ['software', 'marketing', 'design', 'business', 'custom'],
            default: 'software'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        admins: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            permissions: {
                canManageMembers: {
                    type: Boolean,
                    default: true
                },
                canManagePages: {
                    type: Boolean,
                    default: true
                },
                canManageSprints: {
                    type: Boolean,
                    default: true
                },
                canManageBugs: {
                    type: Boolean,
                    default: true
                },
                canManageRequirements: {
                    type: Boolean,
                    default: true
                },
                canManageDocuments: {
                    type: Boolean,
                    default: true
                },
                canViewAnalytics: {
                    type: Boolean,
                    default: true
                }
            }
        }],
        members: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            invitedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'lead', 'member', 'contributor', 'viewer'],
                default: 'member'
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended'],
                default: 'active'
            },
            lastActivityAt: {
                type: Date,
                default: null
            }
        }],
        phases: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phase'
        }],
        sprints: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint'
        }],
        pages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page'
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
        projectSettings: {
            startDate: {
                type: Date,
                default: null
            },
            endDate: {
                type: Date,
                default: null
            },
            status: {
                type: String,
                enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
                default: 'planning'
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium'
            },
            category: String,
            defaultLanguage: {
                type: String,
                default: 'en'
            },
            timezone: {
                type: String,
                default: 'UTC'
            }
        },
        accessControl: {
            defaultMemberPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            inheritedFromOrganization: {
                type: Boolean,
                default: true
            },
            inheritedFromTeam: {
                type: Boolean,
                default: true
            }
        },
        invitations: [{
            email: {
                type: String,
                lowercase: true,
                required: true
            },
            inviteToken: {
                type: String,

                unique: true,
                index: true
            },
            role: {
                type: String,
                enum: ['admin', 'lead', 'member', 'contributor', 'viewer'],
                default: 'member'
            },
            invitedAt: {
                type: Date,
                default: Date.now
            },
            invitedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            expiresAt: {
                type: Date,
                required: true
            },
            accepted: {
                type: Boolean,
                default: false
            },
            acceptedAt: {
                type: Date,
                default: null
            },
            acceptedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            autoAccessFolders: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Folder'
            }],
            autoAccessSprints: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sprint'
            }],
            autoAccessPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
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
        statistics: {
            totalMembers: {
                type: Number,
                default: 0
            },
            totalPhases: {
                type: Number,
                default: 0
            },
            totalSprints: {
                type: Number,
                default: 0
            },
            totalPages: {
                type: Number,
                default: 0
            },
            totalFolders: {
                type: Number,
                default: 0
            },
            totalSubProjects: {
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
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        customFields: [{
            fieldId: {
                type: String,
                required: true
            },
            fieldName: {
                type: String,
                required: true
            },
            fieldType: {
                type: String,
                enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox'],
                required: true
            },
            isRequired: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        labels: [{
            labelId: {
                type: String,
                required: true
            },
            labelName: String,
            color: String,
            description: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        tags: [String],
        attachments: [{
            fileId: {
                type: String,
                required: true
            },
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
        notes: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'archived', 'deleted'],
            default: 'active'
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
        },
        archivedAt: {
            type: Date,
            default: null
        },
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        collection: 'projects',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

projectSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

projectSchema.virtual('activeMembers').get(function () {
    return this.members.filter(m => m.status === 'active').length;
});

projectSchema.virtual('adminCount').get(function () {
    return this.admins.length + 1;
});

projectSchema.virtual('isRootProject').get(function () {
    return !this.parentProjectId;
});

projectSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

projectSchema.virtual('bugCompletionRate').get(function () {
    if (this.statistics.totalBugs === 0) return 0;
    return Math.round((this.statistics.closedBugs / this.statistics.totalBugs) * 100);
});

projectSchema.virtual('requirementCompletionRate').get(function () {
    if (this.statistics.totalRequirements === 0) return 0;
    return Math.round((this.statistics.completedRequirements / this.statistics.totalRequirements) * 100);
});

projectSchema.index({ organizationId: 1, isDeleted: 1 });
projectSchema.index({ key: 1, organizationId: 1 });
projectSchema.index({ parentProjectId: 1, isDeleted: 1 });
projectSchema.index({ organizationId: 1, parentProjectId: 1, isDeleted: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ 'admins.userId': 1 });
projectSchema.index({ 'projectSettings.status': 1, isDeleted: 1 });
projectSchema.index({ teamId: 1 });
projectSchema.index({ departmentId: 1 });
projectSchema.index({ hierarchyPath: 1 });
projectSchema.index({ visibility: 1, isDeleted: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'invitations.inviteToken': 1 });
projectSchema.index({ 'invitations.email': 1 });
projectSchema.index({ name: 'text', description: 'text' });

projectSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentProjectId') || this.isNew) {
        if (this.parentProjectId) {
            const parentProject = await mongoose.model('Project').findById(this.parentProjectId);
            if (parentProject) {
                this.hierarchyLevel = parentProject.hierarchyLevel + 1;
                this.hierarchyPath = parentProject.hierarchyPath
                    ? `${parentProject.hierarchyPath}/${this._id.toString()}`
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

projectSchema.methods.isOwner = function (userId) {
    return this.owner.toString() === userId.toString();
};

projectSchema.methods.isAdmin = function (userId) {
    return this.admins.some(admin => admin.userId.toString() === userId.toString()) ||
        this.isOwner(userId);
};

projectSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.userId.toString() === userId.toString()) ||
        this.isAdmin(userId);
};

projectSchema.methods.getMemberRole = function (userId) {
    if (this.isOwner(userId)) return 'owner';

    const admin = this.admins.find(a => a.userId.toString() === userId.toString());
    if (admin) return 'admin';

    const member = this.members.find(m => m.userId.toString() === userId.toString());
    return member ? member.role : null;
};

projectSchema.methods.addMember = function (userId, invitedBy, role = 'member') {
    const existingMember = this.members.find(m => m.userId.toString() === userId.toString());

    if (!existingMember) {
        this.members.push({
            userId,
            joinedAt: new Date(),
            invitedBy,
            role,
            status: 'active'
        });

        this.statistics.totalMembers = this.members.length;
    }
};

projectSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.totalMembers = this.members.length;
};

projectSchema.methods.updateMemberRole = function (userId, newRole) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.role = newRole;
    }
};

projectSchema.methods.suspendMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'suspended';
    }
};

projectSchema.methods.activateMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'active';
    }
};

projectSchema.methods.updateMemberActivity = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.lastActivityAt = new Date();
    }
};

projectSchema.methods.addAdmin = function (userId, addedBy, permissions = {}) {
    const existingAdmin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (!existingAdmin) {
        this.admins.push({
            userId,
            addedAt: new Date(),
            addedBy,
            permissions: {
                canManageMembers: permissions.canManageMembers !== false,
                canManagePages: permissions.canManagePages !== false,
                canManageSprints: permissions.canManageSprints !== false,
                canManageBugs: permissions.canManageBugs !== false,
                canManageRequirements: permissions.canManageRequirements !== false,
                canManageDocuments: permissions.canManageDocuments !== false,
                canViewAnalytics: permissions.canViewAnalytics !== false
            }
        });
    }
};

projectSchema.methods.removeAdmin = function (userId) {
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
};

projectSchema.methods.updateAdminPermissions = function (userId, permissions) {
    const admin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (admin) {
        admin.permissions = {
            ...admin.permissions,
            ...permissions
        };
    }
};

projectSchema.methods.getAdminPermissions = function (userId) {
    if (this.isOwner(userId)) {
        return {
            canManageMembers: true,
            canManagePages: true,
            canManageSprints: true,
            canManageBugs: true,
            canManageRequirements: true,
            canManageDocuments: true,
            canViewAnalytics: true
        };
    }

    const admin = this.admins.find(a => a.userId.toString() === userId.toString());
    return admin ? admin.permissions : null;
};

projectSchema.methods.addSubProject = function (subProjectId) {
    if (!this.childProjects.includes(subProjectId)) {
        this.childProjects.push(subProjectId);
        this.statistics.totalSubProjects += 1;
    }
};

projectSchema.methods.removeSubProject = function (subProjectId) {
    this.childProjects = this.childProjects.filter(p => p.toString() !== subProjectId.toString());
    this.statistics.totalSubProjects = Math.max(0, this.statistics.totalSubProjects - 1);
};

projectSchema.methods.addPhase = function (phaseId) {
    if (!this.phases.includes(phaseId)) {
        this.phases.push(phaseId);
        this.statistics.totalPhases += 1;
    }
};

projectSchema.methods.removePhase = function (phaseId) {
    this.phases = this.phases.filter(p => p.toString() !== phaseId.toString());
    this.statistics.totalPhases = Math.max(0, this.statistics.totalPhases - 1);
};

projectSchema.methods.addSprint = function (sprintId) {
    if (!this.sprints.includes(sprintId)) {
        this.sprints.push(sprintId);
        this.statistics.totalSprints += 1;
    }
};

projectSchema.methods.removeSprint = function (sprintId) {
    this.sprints = this.sprints.filter(s => s.toString() !== sprintId.toString());
    this.statistics.totalSprints = Math.max(0, this.statistics.totalSprints - 1);
};

projectSchema.methods.addPage = function (pageId) {
    if (!this.pages.includes(pageId)) {
        this.pages.push(pageId);
        this.statistics.totalPages += 1;
    }
};

projectSchema.methods.removePage = function (pageId) {
    this.pages = this.pages.filter(p => p.toString() !== pageId.toString());
    this.statistics.totalPages = Math.max(0, this.statistics.totalPages - 1);
};

projectSchema.methods.addFolder = function (folderId) {
    if (!this.folders.includes(folderId)) {
        this.folders.push(folderId);
        this.statistics.totalFolders += 1;
    }
};

projectSchema.methods.removeFolder = function (folderId) {
    this.folders = this.folders.filter(f => f.toString() !== folderId.toString());
    this.statistics.totalFolders = Math.max(0, this.statistics.totalFolders - 1);
};

projectSchema.methods.addDocument = function (documentId, addedBy) {
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

projectSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
};

projectSchema.methods.addSheet = function (sheetId, addedBy) {
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

projectSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
};

projectSchema.methods.addSlide = function (slideId, addedBy) {
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

projectSchema.methods.removeSlide = function (slideId) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
};

projectSchema.methods.addBug = function (bugId) {
    if (!this.bugs.includes(bugId)) {
        this.bugs.push(bugId);
        this.statistics.totalBugs += 1;
        this.statistics.openBugs += 1;
    }
};

projectSchema.methods.removeBug = function (bugId) {
    this.bugs = this.bugs.filter(b => b.toString() !== bugId.toString());
    this.statistics.totalBugs = Math.max(0, this.statistics.totalBugs - 1);
};

projectSchema.methods.updateBugCounts = function (openCount, closedCount) {
    this.statistics.openBugs = openCount;
    this.statistics.closedBugs = closedCount;
};

projectSchema.methods.addRequirement = function (requirementId) {
    if (!this.requirements.includes(requirementId)) {
        this.requirements.push(requirementId);
        this.statistics.totalRequirements += 1;
    }
};

projectSchema.methods.removeRequirement = function (requirementId) {
    this.requirements = this.requirements.filter(r => r.toString() !== requirementId.toString());
    this.statistics.totalRequirements = Math.max(0, this.statistics.totalRequirements - 1);
};

projectSchema.methods.updateRequirementCounts = function (completedCount) {
    this.statistics.completedRequirements = completedCount;
};

projectSchema.methods.createInvitation = function (email, inviteToken, expiresAt, invitedBy, role = 'member', autoAccessFolders = [], autoAccessSprints = [], autoAccessPermission = 'view') {
    this.invitations.push({
        email,
        inviteToken,
        role,
        invitedAt: new Date(),
        invitedBy,
        expiresAt,
        accepted: false,
        autoAccessFolders,
        autoAccessSprints,
        autoAccessPermission
    });
};

projectSchema.methods.getInvitationByToken = function (inviteToken) {
    return this.invitations.find(inv => inv.inviteToken === inviteToken);
};

projectSchema.methods.acceptInvitation = function (inviteToken, userId) {
    const invitation = this.getInvitationByToken(inviteToken);

    if (invitation && !invitation.accepted) {
        invitation.accepted = true;
        invitation.acceptedAt = new Date();
        invitation.acceptedBy = userId;

        return invitation;
    }

    return null;
};

projectSchema.methods.cancelInvitation = function (inviteToken) {
    this.invitations = this.invitations.filter(inv => inv.inviteToken !== inviteToken);
};

projectSchema.methods.isInvitationExpired = function (inviteToken) {
    const invitation = this.getInvitationByToken(inviteToken);
    return invitation && invitation.expiresAt < new Date();
};

projectSchema.methods.addLabel = function (labelId, labelName, color, description) {
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

projectSchema.methods.removeLabel = function (labelId) {
    this.labels = this.labels.filter(l => l.labelId !== labelId);
};

projectSchema.methods.addCustomField = function (fieldId, fieldName, fieldType, isRequired = false) {
    const existingField = this.customFields.find(f => f.fieldId === fieldId);

    if (!existingField) {
        this.customFields.push({
            fieldId,
            fieldName,
            fieldType,
            isRequired,
            createdAt: new Date()
        });
    }
};

projectSchema.methods.removeCustomField = function (fieldId) {
    this.customFields = this.customFields.filter(f => f.fieldId !== fieldId);
};

projectSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

projectSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

projectSchema.methods.addAttachment = function (fileId, fileName, fileSize, fileType, uploadedBy) {
    this.attachments.push({
        fileId,
        fileName,
        fileSize,
        fileType,
        uploadedAt: new Date(),
        uploadedBy
    });
};

projectSchema.methods.removeAttachment = function (fileId) {
    this.attachments = this.attachments.filter(a => a.fileId !== fileId);
};

projectSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
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

projectSchema.methods.canCreateSubProject = function () {
    return this.hierarchyLevel < 50;
};

projectSchema.methods.archiveProject = function (archivedBy) {
    this.status = 'archived';
    this.projectSettings.status = 'archived';
    this.archivedAt = new Date();
    this.archivedBy = archivedBy;
};

projectSchema.methods.unarchiveProject = function () {
    this.status = 'active';
    this.projectSettings.status = 'active';
    this.archivedAt = null;
    this.archivedBy = null;
};

projectSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.status = 'deleted';
};

projectSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = 'active';
};

const Project = mongoose.model('Project', projectSchema);

export default Project;