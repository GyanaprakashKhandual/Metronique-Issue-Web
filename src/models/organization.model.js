import mongoose from 'mongoose';
import { hashToken, compareToken } from '../utils/token.util.js';

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true
        },
        slug: {
            type: String,
        },
        organizationSerialNumber: {
            type: String
        },
        description: {
            type: String,
            default: null
        },
        logo: {
            type: String,
            default: null
        },
        banner: {
            type: String,
            default: null
        },
        website: {
            type: String,
            default: null
        },
        industry: {
            type: String,
            default: null
        },
        size: {
            type: String,
            enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
            default: 'small'
        },
        country: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        },
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
                canManageDepartments: {
                    type: Boolean,
                    default: true
                },
                canManageTeams: {
                    type: Boolean,
                    default: true
                },
                canManageProjects: {
                    type: Boolean,
                    default: true
                },
                canManageRoles: {
                    type: Boolean,
                    default: true
                },
                canViewAnalytics: {
                    type: Boolean,
                    default: true
                },
                canManageBilling: {
                    type: Boolean,
                    default: false
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
        departments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        }],
        teams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }],
        projects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
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
            defaultProjectPermission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            requiresEmailVerification: {
                type: Boolean,
                default: true
            },
            requiresMFA: {
                type: Boolean,
                default: false
            },
            allowPublicProjects: {
                type: Boolean,
                default: false
            },
            sso: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                provider: {
                    type: String,
                    enum: ['okta', 'azure', 'google-workspace', 'custom'],
                    default: null
                }
            }
        },
        billing: {
            plan: {
                type: String,
                enum: ['free', 'starter', 'professional', 'enterprise'],
                default: 'free'
            },
            status: {
                type: String,
                enum: ['active', 'past_due', 'cancelled', 'suspended'],
                default: 'active'
            },
            currentPeriodStart: {
                type: Date,
                default: Date.now
            },
            currentPeriodEnd: {
                type: Date,
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            maxMembers: {
                type: Number,
                default: 10
            },
            maxProjects: {
                type: Number,
                default: 5
            },
            maxStorage: {
                type: Number,
                default: 5 * 1024 * 1024 * 1024
            },
            usedStorage: {
                type: Number,
                default: 0
            },
            stripeCustomerId: {
                type: String,
                default: null
            },
            subscriptionId: {
                type: String,
                default: null
            }
        },
        settings: {
            timezone: {
                type: String,
                default: 'UTC'
            },
            language: {
                type: String,
                default: 'en'
            },
            dateFormat: {
                type: String,
                default: 'DD/MM/YYYY'
            },
            weekStartDay: {
                type: String,
                enum: ['monday', 'sunday'],
                default: 'monday'
            },
            allowInviteLinks: {
                type: Boolean,
                default: true
            },
            inviteLinkExpiry: {
                type: Number,
                default: 7
            },
            twoFactorRequired: {
                type: Boolean,
                default: false
            },
            sessionTimeout: {
                type: Number,
                default: 30
            },
            allowedDomains: [{
                type: String
            }],
            restrictedDomains: [{
                type: String
            }]
        },
        integrations: [{
            name: {
                type: String,
                enum: ['slack', 'github', 'jira', 'trello', 'asana', 'notion'],
                required: true
            },
            enabled: {
                type: Boolean,
                default: false
            },
            accessToken: {
                type: String,
                select: false,
                default: null
            },
            refreshToken: {
                type: String,
                select: false,
                default: null
            },
            connectedAt: {
                type: Date,
                default: null
            },
            connectedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            config: mongoose.Schema.Types.Mixed
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
            totalDepartments: {
                type: Number,
                default: 0
            },
            totalTeams: {
                type: Number,
                default: 0
            },
            totalProjects: {
                type: Number,
                default: 0
            },
            totalBugs: {
                type: Number,
                default: 0
            },
            totalRequirements: {
                type: Number,
                default: 0
            },
            activeBugs: {
                type: Number,
                default: 0
            },
            closedBugs: {
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
            applicableTo: {
                type: [String],
                enum: ['bug', 'requirement', 'project', 'sprint'],
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'deleted'],
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
        collection: 'organizations',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.integrations = ret.integrations.map(int => {
                    const { accessToken, refreshToken, ...rest } = int;
                    return rest;
                });
                delete ret.__v;
                return ret;
            }
        }
    }
);

organizationSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

organizationSchema.virtual('activeMembers').get(function () {
    return this.members.filter(m => m.status === 'active').length;
});

organizationSchema.virtual('adminCount').get(function () {
    return this.admins.length + 1;
});

organizationSchema.index({ slug: 1 });
organizationSchema.index({ superAdmin: 1 });
organizationSchema.index({ 'members.userId': 1 });
organizationSchema.index({ 'admins.userId': 1 });
organizationSchema.index({ status: 1, isDeleted: 1 });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ 'invitations.inviteToken': 1 });
organizationSchema.index({ 'invitations.email': 1 });
organizationSchema.index({ name: 'text', description: 'text' });

organizationSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

organizationSchema.methods.isSuperAdmin = function (userId) {
    return this.superAdmin.toString() === userId.toString();
};

organizationSchema.methods.isAdmin = function (userId) {
    return this.admins.some(admin => admin.userId.toString() === userId.toString()) ||
        this.isSuperAdmin(userId);
};

organizationSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.userId.toString() === userId.toString()) ||
        this.isAdmin(userId);
};

organizationSchema.methods.getMemberRole = function (userId) {
    if (this.isSuperAdmin(userId)) return 'superadmin';
    if (this.admins.some(admin => admin.userId.toString() === userId.toString())) return 'admin';

    const member = this.members.find(m => m.userId.toString() === userId.toString());
    return member ? member.role : null;
};

organizationSchema.methods.addMember = function (userId, invitedBy, role = 'member') {
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

organizationSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
    this.statistics.totalMembers = this.members.length;
};

organizationSchema.methods.addAdmin = function (userId, addedBy, permissions = {}) {
    const existingAdmin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (!existingAdmin) {
        this.admins.push({
            userId,
            addedAt: new Date(),
            addedBy,
            permissions: {
                canManageMembers: permissions.canManageMembers !== false,
                canManageDepartments: permissions.canManageDepartments !== false,
                canManageTeams: permissions.canManageTeams !== false,
                canManageProjects: permissions.canManageProjects !== false,
                canManageRoles: permissions.canManageRoles !== false,
                canViewAnalytics: permissions.canViewAnalytics !== false,
                canManageBilling: permissions.canManageBilling || false
            }
        });
    }
};

organizationSchema.methods.removeAdmin = function (userId) {
    this.admins = this.admins.filter(a => a.userId.toString() !== userId.toString());
};

organizationSchema.methods.updateAdminPermissions = function (userId, permissions) {
    const admin = this.admins.find(a => a.userId.toString() === userId.toString());

    if (admin) {
        admin.permissions = {
            ...admin.permissions,
            ...permissions
        };
    }
};

organizationSchema.methods.getAdminPermissions = function (userId) {
    if (this.isSuperAdmin(userId)) {
        return {
            canManageMembers: true,
            canManageDepartments: true,
            canManageTeams: true,
            canManageProjects: true,
            canManageRoles: true,
            canViewAnalytics: true,
            canManageBilling: true
        };
    }

    const admin = this.admins.find(a => a.userId.toString() === userId.toString());
    return admin ? admin.permissions : null;
};

organizationSchema.methods.createInvitation = function (email, inviteToken, expiresAt, invitedBy, role = 'member', autoAccessGrant = false, autoAccessProjects = [], autoAccessPermission = 'view') {
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

organizationSchema.methods.getInvitationByToken = async function (inviteToken) {
    if (!inviteToken) return null;
    for (const inv of this.invitations) {
        if (compareToken(inviteToken, inv.inviteToken)) return inv;
    }
    return null;
};

organizationSchema.methods.acceptInvitation = async function (inviteToken, userId) {
    const invitation = await this.getInvitationByToken(inviteToken);

    if (invitation && !invitation.accepted) {
        invitation.accepted = true;
        invitation.acceptedAt = new Date();
        invitation.acceptedBy = userId;

        return invitation;
    }

    return null;
};

organizationSchema.methods.cancelInvitation = async function (inviteToken) {
    this.invitations = this.invitations.filter(inv => !compareToken(inviteToken, inv.inviteToken));
};

organizationSchema.methods.isInvitationExpired = async function (inviteToken) {
    const invitation = await this.getInvitationByToken(inviteToken);
    return invitation && invitation.expiresAt < new Date();
};

organizationSchema.methods.addDepartment = function (departmentId) {
    if (!this.departments.includes(departmentId)) {
        this.departments.push(departmentId);
        this.statistics.totalDepartments += 1;
    }
};

organizationSchema.methods.removeDepartment = function (departmentId) {
    this.departments = this.departments.filter(d => d.toString() !== departmentId.toString());
    this.statistics.totalDepartments = Math.max(0, this.statistics.totalDepartments - 1);
};

organizationSchema.methods.addTeam = function (teamId) {
    if (!this.teams.includes(teamId)) {
        this.teams.push(teamId);
        this.statistics.totalTeams += 1;
    }
};

organizationSchema.methods.removeTeam = function (teamId) {
    this.teams = this.teams.filter(t => t.toString() !== teamId.toString());
    this.statistics.totalTeams = Math.max(0, this.statistics.totalTeams - 1);
};

organizationSchema.methods.addProject = function (projectId) {
    if (!this.projects.includes(projectId)) {
        this.projects.push(projectId);
        this.statistics.totalProjects += 1;
    }
};

organizationSchema.methods.removeProject = function (projectId) {
    this.projects = this.projects.filter(p => p.toString() !== projectId.toString());
    this.statistics.totalProjects = Math.max(0, this.statistics.totalProjects - 1);
};

organizationSchema.methods.addIntegration = function (name, accessToken = null, refreshToken = null, connectedBy, config = {}) {
    const existingIntegration = this.integrations.find(i => i.name === name);

    if (existingIntegration) {
        existingIntegration.enabled = true;
        existingIntegration.accessToken = accessToken;
        existingIntegration.refreshToken = refreshToken;
        existingIntegration.connectedAt = new Date();
        existingIntegration.connectedBy = connectedBy;
        existingIntegration.config = config;
    } else {
        this.integrations.push({
            name,
            enabled: true,
            accessToken,
            refreshToken,
            connectedAt: new Date(),
            connectedBy,
            config
        });
    }
};

organizationSchema.methods.removeIntegration = function (name) {
    const integration = this.integrations.find(i => i.name === name);
    if (integration) {
        integration.enabled = false;
        integration.accessToken = null;
        integration.refreshToken = null;
    }
};

organizationSchema.methods.logActivity = function (action, performedBy, resourceType, resourceId, details = {}) {
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

organizationSchema.methods.canAddMembers = function () {
    return this.members.length < this.billing.maxMembers;
};

organizationSchema.methods.canAddProjects = function () {
    return this.projects.length < this.billing.maxProjects;
};

organizationSchema.methods.canAddStorage = function (size) {
    return (this.billing.usedStorage + size) <= this.billing.maxStorage;
};

organizationSchema.methods.updateStorage = function (size) {
    this.billing.usedStorage += size;
};

organizationSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.status = 'deleted';
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;