import mongoose from 'mongoose';
import { hashToken, compareToken } from '../utils/token.util.js';

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        slug: {
            type: String,
        },
        teamSerialNumber: {
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
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            index: true
        },
        parentTeamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
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
        childTeams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }],
        superAdmin: {
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
                canManageSubTeams: {
                    type: Boolean,
                    default: true
                },
                canManageProjects: {
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
                enum: ['superadmin', 'admin', 'member'],
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
        projects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
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
        invitations: [{
            email: {
                type: String,
                lowercase: true,
                required: true
            },
            inviteToken: {
                type: String,


                index: true
            },
            role: {
                type: String,
                enum: ['admin', 'member'],
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
            autoAccessGrant: {
                type: Boolean,
                default: false
            },
            autoAccessProjects: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project'
            }],
            autoAccessPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
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
            inheritedFromDepartment: {
                type: Boolean,
                default: true
            },
            inheritedFromParent: {
                type: Boolean,
                default: true
            }
        },
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
            totalProjects: {
                type: Number,
                default: 0
            },
            totalSubTeams: {
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
        status: {
            type: String,
            enum: ['active', 'inactive', 'archived'],
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
        }
    },
    {
        timestamps: true,
        collection: 'teams',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

teamSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

teamSchema.virtual('activeMembers').get(function () {
    return this.members.filter(m => m.status === 'active').length;
});

teamSchema.virtual('adminCount').get(function () {
    return this.admins.length + 1;
});

teamSchema.virtual('isRootTeam').get(function () {
    return !this.parentTeamId;
});

teamSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

teamSchema.index({ organizationId: 1, isDeleted: 1 });
teamSchema.index({ departmentId: 1, isDeleted: 1 });
teamSchema.index({ parentTeamId: 1, isDeleted: 1 });
teamSchema.index({ organizationId: 1, departmentId: 1, isDeleted: 1 });
teamSchema.index({ hierarchyPath: 1 });
teamSchema.index({ superAdmin: 1 });
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ 'admins.userId': 1 });
teamSchema.index({ status: 1, isDeleted: 1 });
teamSchema.index({ createdAt: -1 });
teamSchema.index({ 'invitations.inviteToken': 1 });
teamSchema.index({ name: 'text', description: 'text' });

teamSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentTeamId') || this.isNew) {
        if (this.parentTeamId) {
            const parentTeam = await mongoose.model('Team').findById(this.parentTeamId);
            if (parentTeam) {
                this.hierarchyLevel = parentTeam.hierarchyLevel + 1;
                this.hierarchyPath = parentTeam.hierarchyPath
                    ? `${parentTeam.hierarchyPath}/${this._id.toString()}`
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

teamSchema.methods.isSuperAdmin = function (userId) {
    return this.superAdmin.toString() === userId.toString();
};

teamSchema.methods.isAdmin = function (userId) {
    return this.admins.some(admin => admin.userId.toString() === userId.toString()) ||
        this.isSuperAdmin(userId);
};

teamSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.userId.toString() === userId.toString()) ||
        this.isAdmin(userId);
};

teamSchema.methods.getMemberRole = function (userId) {
    if (this.isSuperAdmin(userId)) return 'superadmin';
    if (this.admins.some(admin => admin.userId.toString() === userId.toString())) return 'admin';

    const member = this.members.find(m => m.userId.toString() === userId.toString());
    return member ? member.role : null;
};

teamSchema.methods.addMember = function (userId, invitedBy, role = 'member') {
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

teamSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.totalMembers = this.members.length;
};

teamSchema.methods.suspendMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'suspended';
    }
};

teamSchema.methods.activateMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'active';
    }
};

teamSchema.methods.updateMemberActivity = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.lastActivityAt = new Date();
    }
};

teamSchema.methods.addAdmin = function (userId, addedBy, permissions = {}) {
    const existingAdmin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (!existingAdmin) {
        this.admins.push({
            userId,
            addedAt: new Date(),
            addedBy,
            permissions: {
                canManageMembers: permissions.canManageMembers !== false,
                canManageSubTeams: permissions.canManageSubTeams !== false,
                canManageProjects: permissions.canManageProjects !== false,
                canManageDocuments: permissions.canManageDocuments !== false,
                canViewAnalytics: permissions.canViewAnalytics !== false
            }
        });
    }
};

teamSchema.methods.removeAdmin = function (userId) {
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
};

teamSchema.methods.updateAdminPermissions = function (userId, permissions) {
    const admin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (admin) {
        admin.permissions = {
            ...admin.permissions,
            ...permissions
        };
    }
};

teamSchema.methods.getAdminPermissions = function (userId) {
    if (this.isSuperAdmin(userId)) {
        return {
            canManageMembers: true,
            canManageSubTeams: true,
            canManageProjects: true,
            canManageDocuments: true,
            canViewAnalytics: true
        };
    }

    const admin = this.admins.find(a => a.userId.toString() === userId.toString());
    return admin ? admin.permissions : null;
};

teamSchema.methods.addSubTeam = function (subTeamId) {
    if (!this.childTeams.includes(subTeamId)) {
        this.childTeams.push(subTeamId);
        this.statistics.totalSubTeams += 1;
    }
};

teamSchema.methods.removeSubTeam = function (subTeamId) {
    this.childTeams = this.childTeams.filter(
        t => t.toString() !== subTeamId.toString()
    );
    this.statistics.totalSubTeams = Math.max(0, this.statistics.totalSubTeams - 1);
};

teamSchema.methods.addProject = function (projectId) {
    if (!this.projects.includes(projectId)) {
        this.projects.push(projectId);
        this.statistics.totalProjects += 1;
    }
};

teamSchema.methods.removeProject = function (projectId) {
    this.projects = this.projects.filter(p => p.toString() !== projectId.toString());
    this.statistics.totalProjects = Math.max(0, this.statistics.totalProjects - 1);
};

teamSchema.methods.addDocument = function (documentId, addedBy) {
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

teamSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
};

teamSchema.methods.addSheet = function (sheetId, addedBy) {
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

teamSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
};

teamSchema.methods.addSlide = function (slideId, addedBy) {
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

teamSchema.methods.removeSlide = function (slideId) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
};

teamSchema.methods.createInvitation = function (email, inviteToken, expiresAt, invitedBy, role = 'member', autoAccessGrant = false, autoAccessProjects = [], autoAccessPermission = 'view') {
    const hashed = hashToken(inviteToken);
    this.invitations.push({
        email,
        inviteToken: hashed,
        role,
        invitedAt: new Date(),
        invitedBy,
        expiresAt,
        accepted: false,
        autoAccessGrant,
        autoAccessProjects,
        autoAccessPermission
    });
};

teamSchema.methods.getInvitationByToken = async function (inviteToken) {
    if (!inviteToken) return null;
    for (const inv of this.invitations) {
        if (compareToken(inviteToken, inv.inviteToken)) return inv;
    }
    return null;
};

teamSchema.methods.acceptInvitation = async function (inviteToken, userId) {
    const invitation = await this.getInvitationByToken(inviteToken);

    if (invitation && !invitation.accepted) {
        invitation.accepted = true;
        invitation.acceptedAt = new Date();
        invitation.acceptedBy = userId;

        return invitation;
    }

    return null;
};

teamSchema.methods.cancelInvitation = async function (inviteToken) {
    // remove any invitation matching the provided token
    this.invitations = this.invitations.filter(inv => !compareToken(inviteToken, inv.inviteToken));
};

teamSchema.methods.isInvitationExpired = async function (inviteToken) {
    const invitation = await this.getInvitationByToken(inviteToken);
    return invitation && invitation.expiresAt < new Date();
};

teamSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
    this.activityLog.push({
        action,
        performedBy,
        resourceType,
        resourceId,
        timestamp: new Date(),
        details
    });

    if (this.activityLog.length > 5000) {
        this.activityLog = this.activityLog.slice(-5000);
    }
};

teamSchema.methods.canCreateSubTeam = function () {
    return this.hierarchyLevel < 50;
};

teamSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.status = 'inactive';
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

teamSchema.methods.getHierarchyPath = function () {
    return this.hierarchyPath.split('/');
};

teamSchema.methods.getAllAncestors = async function () {
    if (!this.parentTeamId) {
        return [];
    }

    const ancestors = [];
    let currentId = this.parentTeamId;

    while (currentId) {
        const parent = await mongoose.model('Team').findById(currentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.parentTeamId;
        } else {
            break;
        }
    }

    return ancestors;
};

teamSchema.methods.getAllDescendants = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await mongoose.model('Team').find({ parentTeamId: currentId });

        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

const Team = mongoose.model('Team', teamSchema);

export default Team;