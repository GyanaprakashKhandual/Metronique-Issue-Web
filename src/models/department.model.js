import mongoose from 'mongoose';
import { hashToken, compareToken } from '../utils/token.util.js';

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        slug: {
            type: String
        },
        departmentId: {
            type: String
        },
        description: {
            type: String
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
             
        },
        parentDepartmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
             
        },
        hierarchyPath: {
            type: String,
            default: null
        },
        hierarchyLevel: {
            type: Number,
            default: 0
        },
        childDepartments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
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
                canManageTeams: {
                    type: Boolean,
                    default: true
                },
                canManageSubDepartments: {
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
        teams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
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

                unique: true,
                 
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
            autoAccessTeams: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
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
            totalTeams: {
                type: Number,
                default: 0
            },
            totalSubDepartments: {
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
        collection: 'departments',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

departmentSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

departmentSchema.virtual('activeMembers').get(function () {
    return this.members.filter(m => m.status === 'active').length;
});

departmentSchema.virtual('adminCount').get(function () {
    return this.admins.length + 1;
});

departmentSchema.virtual('isRootDepartment').get(function () {
    return !this.parentDepartmentId;
});

departmentSchema.virtual('depth').get(function () {
    return this.hierarchyLevel;
});

departmentSchema.index({ organizationId: 1, isDeleted: 1 });
departmentSchema.index({ parentDepartmentId: 1, isDeleted: 1 });
departmentSchema.index({ organizationId: 1, parentDepartmentId: 1, isDeleted: 1 });
departmentSchema.index({ hierarchyPath: 1 });
departmentSchema.index({ superAdmin: 1 });
departmentSchema.index({ 'members.userId': 1 });
departmentSchema.index({ 'admins.userId': 1 });
departmentSchema.index({ status: 1, isDeleted: 1 });
departmentSchema.index({ createdAt: -1 });
departmentSchema.index({ 'invitations.inviteToken': 1 });
departmentSchema.index({ name: 'text', description: 'text' });

departmentSchema.pre('save', async function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }

    if (this.isModified('parentDepartmentId') || this.isNew) {
        if (this.parentDepartmentId) {
            const parentDept = await mongoose.model('Department').findById(this.parentDepartmentId);
            if (parentDept) {
                this.hierarchyLevel = parentDept.hierarchyLevel + 1;
                this.hierarchyPath = parentDept.hierarchyPath
                    ? `${parentDept.hierarchyPath}/${this._id.toString()}`
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

departmentSchema.methods.isSuperAdmin = function (userId) {
    return this.superAdmin.toString() === userId.toString();
};

departmentSchema.methods.isAdmin = function (userId) {
    return this.admins.some(admin => admin.userId.toString() === userId.toString()) ||
        this.isSuperAdmin(userId);
};

departmentSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.userId.toString() === userId.toString()) ||
        this.isAdmin(userId);
};

departmentSchema.methods.getMemberRole = function (userId) {
    if (this.isSuperAdmin(userId)) return 'superadmin';
    if (this.admins.some(admin => admin.userId.toString() === userId.toString())) return 'admin';

    const member = this.members.find(m => m.userId.toString() === userId.toString());
    return member ? member.role : null;
};

departmentSchema.methods.addMember = function (userId, invitedBy, role = 'member') {
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

departmentSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.totalMembers = this.members.length;
};

departmentSchema.methods.suspendMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'suspended';
    }
};

departmentSchema.methods.activateMember = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.status = 'active';
    }
};

departmentSchema.methods.updateMemberActivity = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    if (member) {
        member.lastActivityAt = new Date();
    }
};

departmentSchema.methods.addAdmin = function (userId, addedBy, permissions = {}) {
    const existingAdmin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (!existingAdmin) {
        this.admins.push({
            userId,
            addedAt: new Date(),
            addedBy,
            permissions: {
                canManageMembers: permissions.canManageMembers !== false,
                canManageTeams: permissions.canManageTeams !== false,
                canManageSubDepartments: permissions.canManageSubDepartments !== false,
                canManageDocuments: permissions.canManageDocuments !== false,
                canViewAnalytics: permissions.canViewAnalytics !== false
            }
        });
    }
};

departmentSchema.methods.removeAdmin = function (userId) {
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
};

departmentSchema.methods.updateAdminPermissions = function (userId, permissions) {
    const admin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (admin) {
        admin.permissions = {
            ...admin.permissions,
            ...permissions
        };
    }
};

departmentSchema.methods.getAdminPermissions = function (userId) {
    if (this.isSuperAdmin(userId)) {
        return {
            canManageMembers: true,
            canManageTeams: true,
            canManageSubDepartments: true,
            canManageDocuments: true,
            canViewAnalytics: true
        };
    }

    const admin = this.admins.find(a => a.userId.toString() === userId.toString());
    return admin ? admin.permissions : null;
};

departmentSchema.methods.addSubDepartment = function (subDepartmentId) {
    if (!this.childDepartments.includes(subDepartmentId)) {
        this.childDepartments.push(subDepartmentId);
        this.statistics.totalSubDepartments += 1;
    }
};

departmentSchema.methods.removeSubDepartment = function (subDepartmentId) {
    this.childDepartments = this.childDepartments.filter(
        d => d.toString() !== subDepartmentId.toString()
    );
    this.statistics.totalSubDepartments = Math.max(0, this.statistics.totalSubDepartments - 1);
};

departmentSchema.methods.addTeam = function (teamId) {
    if (!this.teams.includes(teamId)) {
        this.teams.push(teamId);
        this.statistics.totalTeams += 1;
    }
};

departmentSchema.methods.removeTeam = function (teamId) {
    this.teams = this.teams.filter(t => t.toString() !== teamId.toString());
    this.statistics.totalTeams = Math.max(0, this.statistics.totalTeams - 1);
};

departmentSchema.methods.addDocument = function (documentId, addedBy) {
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

departmentSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(d => d.documentId.toString() !== documentId.toString());
    this.statistics.totalDocuments = Math.max(0, this.statistics.totalDocuments - 1);
};

departmentSchema.methods.addSheet = function (sheetId, addedBy) {
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

departmentSchema.methods.removeSheet = function (sheetId) {
    this.sheets = this.sheets.filter(s => s.sheetId.toString() !== sheetId.toString());
    this.statistics.totalSheets = Math.max(0, this.statistics.totalSheets - 1);
};

departmentSchema.methods.addSlide = function (slideId, addedBy) {
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

departmentSchema.methods.removeSlide = function (slideId) {
    this.slides = this.slides.filter(s => s.slideId.toString() !== slideId.toString());
    this.statistics.totalSlides = Math.max(0, this.statistics.totalSlides - 1);
};

departmentSchema.methods.createInvitation = function (email, inviteToken, expiresAt, invitedBy, role = 'member', autoAccessGrant = false, autoAccessTeams = [], autoAccessPermission = 'view') {
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
        autoAccessTeams,
        autoAccessPermission
    });
};

departmentSchema.methods.getInvitationByToken = async function (inviteToken) {
    if (!inviteToken) return null;
    for (const inv of this.invitations) {
        if (compareToken(inviteToken, inv.inviteToken)) return inv;
    }
    return null;
};

departmentSchema.methods.acceptInvitation = async function (inviteToken, userId) {
    const invitation = await this.getInvitationByToken(inviteToken);

    if (invitation && !invitation.accepted) {
        invitation.accepted = true;
        invitation.acceptedAt = new Date();
        invitation.acceptedBy = userId;

        return invitation;
    }

    return null;
};

departmentSchema.methods.cancelInvitation = async function (inviteToken) {
    this.invitations = this.invitations.filter(inv => !compareToken(inviteToken, inv.inviteToken));
};

departmentSchema.methods.isInvitationExpired = async function (inviteToken) {
    const invitation = await this.getInvitationByToken(inviteToken);
    return invitation && invitation.expiresAt < new Date();
};

departmentSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
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

departmentSchema.methods.canCreateSubDepartment = function () {
    return this.hierarchyLevel < 50;
};

departmentSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.status = 'inactive';
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

departmentSchema.methods.getHierarchyPath = function () {
    return this.hierarchyPath.split('/');
};

departmentSchema.methods.getAllAncestors = async function () {
    if (!this.parentDepartmentId) {
        return [];
    }

    const ancestors = [];
    let currentId = this.parentDepartmentId;

    while (currentId) {
        const parent = await mongoose.model('Department').findById(currentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.parentDepartmentId;
        } else {
            break;
        }
    }

    return ancestors;
};

departmentSchema.methods.getAllDescendants = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await mongoose.model('Department').find({ parentDepartmentId: currentId });

        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;