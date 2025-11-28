import mongoose from 'mongoose';
import { hashToken, compareToken } from '../utils/token.util.js';

const inviteSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            index: true
        },
        inviteToken: {
            type: String,
            unique: true,
            index: true
        },
        inviteType: {
            type: String,
            enum: ['organization', 'department', 'team', 'project'],
            index: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
            index: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
            index: true
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        invitedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        expiresAt: {
            type: Date,

            index: true
        },
        role: {
            type: String,
            enum: ['superadmin', 'admin', 'member'],
            default: 'member'
        },
        permissions: {
            canManageMembers: {
                type: Boolean,
                default: false
            },
            canManageTeams: {
                type: Boolean,
                default: false
            },
            canManageDepartments: {
                type: Boolean,
                default: false
            },
            canManageProjects: {
                type: Boolean,
                default: false
            },
            canManageDocuments: {
                type: Boolean,
                default: false
            },
            canViewAnalytics: {
                type: Boolean,
                default: false
            }
        },
        autoAccessGrant: {
            type: Boolean,
            default: false
        },
        autoAccessProjects: [{
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
        autoAccessDepartments: [{
            departmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Department'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
        autoAccessTeams: [{
            teamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
        autoAccessFolders: [{
            folderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Folder'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
        autoAccessSprints: [{
            sprintId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sprint'
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            }
        }],
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'expired', 'revoked', 'resent'],
            default: 'pending',
            index: true
        },
        acceptedAt: {
            type: Date,
            default: null
        },
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectedAt: {
            type: Date,
            default: null
        },
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectionReason: {
            type: String,
            default: null
        },
        revokedAt: {
            type: Date,
            default: null
        },
        revokedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        revocationReason: {
            type: String,
            default: null
        },
        resendCount: {
            type: Number,
            default: 0,
            max: 5
        },
        lastResentAt: {
            type: Date,
            default: null
        },
        inviteMetadata: {
            senderName: String,
            organizationName: String,
            departmentName: String,
            teamName: String,
            projectName: String,
            customMessage: String,
            inviteSource: {
                type: String,
                enum: ['direct', 'bulk', 'csv_import', 'api', 'csv'],
                default: 'direct'
            }
        },
        bulkInviteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BulkInvite',
            default: null
        },
        accessInheritanceConfig: {
            inheritProjectAccess: {
                type: Boolean,
                default: true
            },
            inheritDepartmentAccess: {
                type: Boolean,
                default: true
            },
            inheritTeamAccess: {
                type: Boolean,
                default: true
            },
            inheritFromParent: {
                type: Boolean,
                default: true
            }
        },
        customFields: mongoose.Schema.Types.Mixed,
        auditLog: [{
            action: String,
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            details: mongoose.Schema.Types.Mixed
        }],
        tags: [String],
        notes: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
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
        }
    },
    {
        timestamps: true,
        collection: 'invites',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

inviteSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date() && this.status !== 'accepted' && this.status !== 'rejected';
});

inviteSchema.virtual('isPending').get(function () {
    return this.status === 'pending' && !this.isExpired;
});

inviteSchema.virtual('canResend').get(function () {
    return this.resendCount < 5 && (this.status === 'pending' || this.status === 'resent');
});

inviteSchema.virtual('daysUntilExpiry').get(function () {
    if (this.status === 'accepted' || this.status === 'rejected') return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

inviteSchema.virtual('hoursUntilExpiry').get(function () {
    if (this.status === 'accepted' || this.status === 'rejected') return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60));
});

inviteSchema.index({ organizationId: 1, email: 1, isActive: 1 });
inviteSchema.index({ organizationId: 1, status: 1, isActive: 1 });
inviteSchema.index({ inviteToken: 1, isActive: 1 });
inviteSchema.index({ email: 1, isActive: 1 });
inviteSchema.index({ inviteType: 1, isActive: 1 });
inviteSchema.index({ departmentId: 1, status: 1 });
inviteSchema.index({ teamId: 1, status: 1 });
inviteSchema.index({ projectId: 1, status: 1 });
inviteSchema.index({ expiresAt: 1, status: 1 });
inviteSchema.index({ invitedBy: 1, invitedAt: -1 });
inviteSchema.index({ bulkInviteId: 1 });
inviteSchema.index({ organizationId: 1, inviteType: 1, status: 1 });
inviteSchema.index({ createdAt: -1 });

inviteSchema.pre('save', function (next) {
    if (this.isExpired && this.status === 'pending') {
        this.status = 'expired';
        this.isActive = false;
    }

    if (this.status === 'accepted' || this.status === 'rejected' || this.status === 'revoked') {
        this.isActive = false;
    }

    next();
});

// Hash inviteToken on save if it's not already hashed
inviteSchema.pre('save', function (next) {
    try {
        if (this.isModified('inviteToken') && this.inviteToken && !String(this.inviteToken).startsWith('$2')) {
            this.inviteToken = hashToken(this.inviteToken);
        }
    } catch (e) {
        // noop - proceed without hashing if error
    }

    next();
});

inviteSchema.methods.isValid = function () {
    if (this.isDeleted) return false;
    if (this.isExpired) return false;
    if (this.status === 'rejected' || this.status === 'revoked' || this.status === 'accepted') return false;
    return this.isPending;
};

inviteSchema.methods.accept = function (userId) {
    if (!this.isValid()) {
        return false;
    }

    this.acceptedAt = new Date();
    this.acceptedBy = userId;
    this.status = 'accepted';
    this.isActive = false;

    this.auditLog.push({
        action: 'invite_accepted',
        performedBy: userId,
        timestamp: new Date(),
        details: { acceptedAt: this.acceptedAt }
    });

    return true;
};

inviteSchema.methods.reject = function (userId, reason = '') {
    if (this.status === 'accepted') {
        return false;
    }

    this.rejectedAt = new Date();
    this.rejectedBy = userId;
    this.rejectionReason = reason;
    this.status = 'rejected';
    this.isActive = false;

    this.auditLog.push({
        action: 'invite_rejected',
        performedBy: userId,
        timestamp: new Date(),
        details: { reason, rejectedAt: this.rejectedAt }
    });

    return true;
};

inviteSchema.methods.revoke = function (userId, reason = '') {
    if (this.status === 'accepted') {
        return false;
    }

    this.revokedAt = new Date();
    this.revokedBy = userId;
    this.revocationReason = reason;
    this.status = 'revoked';
    this.isActive = false;

    this.auditLog.push({
        action: 'invite_revoked',
        performedBy: userId,
        timestamp: new Date(),
        details: { reason, revokedAt: this.revokedAt }
    });

    return true;
};

inviteSchema.methods.resend = function (resendBy) {
    if (!this.canResend) {
        return false;
    }

    if (this.resendCount === 0) {
        this.status = 'resent';
    }

    this.resendCount += 1;
    this.lastResentAt = new Date();

    this.auditLog.push({
        action: 'invite_resent',
        performedBy: resendBy,
        timestamp: new Date(),
        details: { resendCount: this.resendCount }
    });

    return true;
};

inviteSchema.methods.addAutoAccessProject = function (projectId, permission = 'view') {
    const existingAccess = this.autoAccessProjects.find(p => p.projectId.toString() === projectId.toString());

    if (!existingAccess) {
        this.autoAccessProjects.push({
            projectId,
            permission
        });
    }

    this.autoAccessGrant = true;
};

inviteSchema.methods.removeAutoAccessProject = function (projectId) {
    this.autoAccessProjects = this.autoAccessProjects.filter(p => p.projectId.toString() !== projectId.toString());
};

inviteSchema.methods.addAutoAccessDepartment = function (departmentId, permission = 'view') {
    const existingAccess = this.autoAccessDepartments.find(d => d.departmentId.toString() === departmentId.toString());

    if (!existingAccess) {
        this.autoAccessDepartments.push({
            departmentId,
            permission
        });
    }

    this.autoAccessGrant = true;
};

inviteSchema.methods.removeAutoAccessDepartment = function (departmentId) {
    this.autoAccessDepartments = this.autoAccessDepartments.filter(d => d.departmentId.toString() !== departmentId.toString());
};

inviteSchema.methods.addAutoAccessTeam = function (teamId, permission = 'view') {
    const existingAccess = this.autoAccessTeams.find(t => t.teamId.toString() === teamId.toString());

    if (!existingAccess) {
        this.autoAccessTeams.push({
            teamId,
            permission
        });
    }

    this.autoAccessGrant = true;
};

inviteSchema.methods.removeAutoAccessTeam = function (teamId) {
    this.autoAccessTeams = this.autoAccessTeams.filter(t => t.teamId.toString() !== teamId.toString());
};

inviteSchema.methods.addAutoAccessFolder = function (folderId, permission = 'view') {
    const existingAccess = this.autoAccessFolders.find(f => f.folderId.toString() === folderId.toString());

    if (!existingAccess) {
        this.autoAccessFolders.push({
            folderId,
            permission
        });
    }

    this.autoAccessGrant = true;
};

inviteSchema.methods.removeAutoAccessFolder = function (folderId) {
    this.autoAccessFolders = this.autoAccessFolders.filter(f => f.folderId.toString() !== folderId.toString());
};

inviteSchema.methods.addAutoAccessSprint = function (sprintId, permission = 'view') {
    const existingAccess = this.autoAccessSprints.find(s => s.sprintId.toString() === sprintId.toString());

    if (!existingAccess) {
        this.autoAccessSprints.push({
            sprintId,
            permission
        });
    }

    this.autoAccessGrant = true;
};

inviteSchema.methods.removeAutoAccessSprint = function (sprintId) {
    this.autoAccessSprints = this.autoAccessSprints.filter(s => s.sprintId.toString() !== sprintId.toString());
};

inviteSchema.methods.getAutoAccessList = function () {
    return {
        projects: this.autoAccessProjects,
        departments: this.autoAccessDepartments,
        teams: this.autoAccessTeams,
        folders: this.autoAccessFolders,
        sprints: this.autoAccessSprints
    };
};

inviteSchema.methods.clearAutoAccess = function () {
    this.autoAccessProjects = [];
    this.autoAccessDepartments = [];
    this.autoAccessTeams = [];
    this.autoAccessFolders = [];
    this.autoAccessSprints = [];
    this.autoAccessGrant = false;
};

inviteSchema.methods.setPermissions = function (permissions) {
    this.permissions = {
        ...this.permissions,
        ...permissions
    };
};

inviteSchema.methods.updateInviteMetadata = function (metadata) {
    this.inviteMetadata = {
        ...this.inviteMetadata,
        ...metadata
    };
};

inviteSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

inviteSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

inviteSchema.methods.hasTag = function (tag) {
    return this.tags.includes(tag);
};

inviteSchema.methods.addAuditLog = function (action, performedBy, details = {}) {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        details
    });

    if (this.auditLog.length > 5000) {
        this.auditLog = this.auditLog.slice(-5000);
    }
};

inviteSchema.methods.getAuditHistory = function (limit = 50) {
    return this.auditLog.slice(-limit).reverse();
};

inviteSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;

    this.auditLog.push({
        action: 'invite_deleted',
        performedBy: deletedBy,
        timestamp: new Date(),
        details: { deletedAt: this.deletedAt }
    });
};

inviteSchema.methods.canUpgradeRole = function (newRole) {
    const roleHierarchy = { member: 0, admin: 1, superadmin: 2 };
    return roleHierarchy[newRole] > roleHierarchy[this.role];
};

inviteSchema.methods.upgradeRole = function (newRole, upgradedBy) {
    if (this.canUpgradeRole(newRole)) {
        const oldRole = this.role;
        this.role = newRole;

        this.auditLog.push({
            action: 'role_upgraded',
            performedBy: upgradedBy,
            timestamp: new Date(),
            details: { from: oldRole, to: newRole }
        });

        return true;
    }

    return false;
};

inviteSchema.methods.downgradeRole = function (newRole, downgradedBy) {
    const roleHierarchy = { member: 0, admin: 1, superadmin: 2 };

    if (roleHierarchy[newRole] < roleHierarchy[this.role]) {
        const oldRole = this.role;
        this.role = newRole;

        this.auditLog.push({
            action: 'role_downgraded',
            performedBy: downgradedBy,
            timestamp: new Date(),
            details: { from: oldRole, to: newRole }
        });

        return true;
    }

    return false;
};

inviteSchema.statics.findPendingInvites = function (organizationId) {
    return this.find({
        organizationId,
        status: 'pending',
        isActive: true,
        expiresAt: { $gt: new Date() }
    });
};

inviteSchema.statics.findExpiredInvites = function (organizationId) {
    return this.find({
        organizationId,
        expiresAt: { $lt: new Date() },
        status: 'pending'
    });
};

inviteSchema.statics.findByEmail = function (email, organizationId) {
    return this.find({
        email,
        organizationId,
        isActive: true
    });
};

inviteSchema.statics.findByToken = async function (inviteToken) {
    if (!inviteToken) return null;

    // try direct match first (handles legacy plaintext tokens)
    const direct = await this.findOne({ inviteToken: inviteToken, isActive: true });
    if (direct) return direct;

    // fall back to scanning recent active invites and comparing hashes
    const candidates = await this.find({ isActive: true }).sort({ createdAt: -1 }).limit(2000);
    for (const c of candidates) {
        if (compareToken(inviteToken, c.inviteToken)) return c;
    }

    return null;
};

inviteSchema.statics.cleanupExpiredInvites = async function (organizationId) {
    const result = await this.updateMany(
        {
            organizationId,
            expiresAt: { $lt: new Date() },
            status: 'pending'
        },
        {
            status: 'expired',
            isActive: false
        }
    );
    return result;
};

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;