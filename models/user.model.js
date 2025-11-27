import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        profileImage: {
            type: String,
            default: null
        },
        password: {
            type: String,
        },
        authProvider: {
            type: String,
            enum: ['email', 'google', 'github'],
            default: 'email'
        },
        googleId: {
            type: String,
            sparse: true,
            default: null
        },
        githubId: {
            type: String,
            sparse: true,
            default: null
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            select: false,
            default: null
        },
        emailVerificationExpire: {
            type: Date,
            select: false,
            default: null
        },
        mfaEnabled: {
            type: Boolean,
            default: false
        },
        mfaMethod: {
            type: String,
            enum: ['totp', 'email', 'sms'],
            default: null
        },
        totpSecret: {
            type: String,
            select: false,
            default: null
        },
        backupCodes: [{
            code: {
                type: String,
                select: false
            },
            used: {
                type: Boolean,
                default: false
            },
            usedAt: {
                type: Date,
                default: null
            }
        }],
        passwordResetToken: {
            type: String,
            select: false,
            default: null
        },
        passwordResetExpire: {
            type: Date,
            select: false,
            default: null
        },
        sessions: [{
            token: {
                type: String,
                index: true
            },
            refreshToken: {
                type: String,
                required: true
            },
            deviceInfo: {
                userAgent: String,
                ipAddress: String,
                deviceName: String,
                osInfo: String,
                browserInfo: String
            },
            loginAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                required: true
            },
            isActive: {
                type: Boolean,
                default: true
            },
            lastActivityAt: {
                type: Date,
                default: Date.now
            },
            mfaVerified: {
                type: Boolean,
                default: false
            }
        }],
        lastLogin: {
            type: Date,
            default: null
        },
        lastLoginIp: {
            type: String,
            default: null
        },
        loginAttempts: {
            count: {
                type: Number,
                default: 0
            },
            lastAttempt: {
                type: Date,
                default: null
            },
            lockedUntil: {
                type: Date,
                default: null
            }
        },
        preferences: {
            language: {
                type: String,
                default: 'en'
            },
            timezone: {
                type: String,
                default: 'UTC'
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto'
            },
            notificationSettings: {
                emailNotifications: {
                    type: Boolean,
                    default: true
                },
                inAppNotifications: {
                    type: Boolean,
                    default: true
                },
                bugAssignmentNotification: {
                    type: Boolean,
                    default: true
                },
                requirementNotification: {
                    type: Boolean,
                    default: true
                },
                sprintNotification: {
                    type: Boolean,
                    default: true
                },
                commentMentionNotification: {
                    type: Boolean,
                    default: true
                },
                dailyDigest: {
                    type: Boolean,
                    default: false
                },
                digestTime: {
                    type: String,
                    default: '09:00'
                }
            }
        },
        organizationMemberships: [{
            organizationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true
            },
            role: {
                type: String,
                enum: ['superadmin', 'admin', 'member'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended'],
                default: 'active'
            }
        }],
        departmentMemberships: [{
            departmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Department',
                required: true
            },
            organizationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true
            },
            role: {
                type: String,
                enum: ['superadmin', 'admin', 'member'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended'],
                default: 'active'
            }
        }],
        teamMemberships: [{
            teamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team',
                required: true
            },
            departmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Department'
            },
            organizationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true
            },
            role: {
                type: String,
                enum: ['superadmin', 'admin', 'member'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended'],
                default: 'active'
            }
        }],
        projectAccess: [{
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project',
                required: true
            },
            organizationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true
            },
            permission: {
                type: String,
                enum: ['view', 'edit', 'admin'],
                default: 'view'
            },
            accessGrantedAt: {
                type: Date,
                default: Date.now
            },
            accessGrantedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            isInherited: {
                type: Boolean,
                default: false
            },
            inheritedFrom: {
                type: String,
                enum: ['organization', 'department', 'team', 'project_admin'],
                default: null
            }
        }],
        activityLog: [{
            action: String,
            resource: String,
            resourceId: mongoose.Schema.Types.ObjectId,
            timestamp: {
                type: Date,
                default: Date.now
            },
            details: mongoose.Schema.Types.Mixed
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
        lastProfileUpdate: {
            type: Date,
            default: null
        },
        accountSecurityChangedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: 'users',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.totpSecret;
                delete ret.emailVerificationToken;
                delete ret.passwordResetToken;
                delete ret.backupCodes;
                delete ret.__v;
                return ret;
            }
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.totpSecret;
                delete ret.emailVerificationToken;
                delete ret.passwordResetToken;
                delete ret.backupCodes;
                delete ret.__v;
                return ret;
            }
        }
    }
);

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('activeSession').get(function () {
    return this.sessions.filter(s => s.isActive && s.expiresAt > new Date())[0] || null;
});

userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ googleId: 1, isDeleted: 1 });
userSchema.index({ githubId: 1, isDeleted: 1 });
userSchema.index({ 'organizationMemberships.organizationId': 1 });
userSchema.index({ 'departmentMemberships.departmentId': 1 });
userSchema.index({ 'teamMemberships.teamId': 1 });
userSchema.index({ 'projectAccess.projectId': 1 });
userSchema.index({ status: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'sessions.token': 1 });
userSchema.index({ 'sessions.refreshToken': 1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.accountSecurityChangedAt = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addSession = function (token, refreshToken, deviceInfo, expiresAt) {
    const sessionIndex = this.sessions.findIndex(s => s.token === token);

    if (sessionIndex > -1) {
        this.sessions[sessionIndex] = {
            token,
            refreshToken,
            deviceInfo,
            loginAt: new Date(),
            expiresAt,
            isActive: true,
            lastActivityAt: new Date(),
            mfaVerified: false
        };
    } else {
        this.sessions.push({
            token,
            refreshToken,
            deviceInfo,
            loginAt: new Date(),
            expiresAt,
            isActive: true,
            lastActivityAt: new Date(),
            mfaVerified: false
        });
    }

    if (this.sessions.length > 10) {
        this.sessions = this.sessions.sort((a, b) => b.loginAt - a.loginAt).slice(0, 10);
    }

    this.lastLogin = new Date();
    this.lastLoginIp = deviceInfo?.ipAddress || null;
    this.loginAttempts.count = 0;
    this.loginAttempts.lockedUntil = null;
};

userSchema.methods.removeSession = function (token) {
    this.sessions = this.sessions.filter(s => s.token !== token);
};

userSchema.methods.updateSessionActivity = function (token) {
    const session = this.sessions.find(s => s.token === token);
    if (session) {
        session.lastActivityAt = new Date();
    }
};

userSchema.methods.verifySessionMFA = function (token) {
    const session = this.sessions.find(s => s.token === token);
    if (session) {
        session.mfaVerified = true;
    }
};

userSchema.methods.getActiveSessions = function () {
    return this.sessions.filter(s => s.isActive && s.expiresAt > new Date());
};

userSchema.methods.invalidateExpiredSessions = function () {
    this.sessions = this.sessions.filter(s => s.expiresAt > new Date());
};

userSchema.methods.clearAllSessions = function () {
    this.sessions = [];
};

userSchema.methods.incrementLoginAttempts = function () {
    this.loginAttempts.count += 1;
    this.loginAttempts.lastAttempt = new Date();

    if (this.loginAttempts.count >= 5) {
        this.loginAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
};

userSchema.methods.resetLoginAttempts = function () {
    this.loginAttempts.count = 0;
    this.loginAttempts.lastAttempt = null;
    this.loginAttempts.lockedUntil = null;
};

userSchema.methods.isAccountLocked = function () {
    if (!this.loginAttempts.lockedUntil) return false;
    return this.loginAttempts.lockedUntil > new Date();
};

userSchema.methods.addOrganizationMembership = function (organizationId, role = 'member') {
    const existingMembership = this.organizationMemberships.find(
        m => m.organizationId.toString() === organizationId.toString()
    );

    if (!existingMembership) {
        this.organizationMemberships.push({
            organizationId,
            role,
            joinedAt: new Date(),
            status: 'active'
        });
    }
};

userSchema.methods.addDepartmentMembership = function (departmentId, organizationId, role = 'member') {
    const existingMembership = this.departmentMemberships.find(
        m => m.departmentId.toString() === departmentId.toString()
    );

    if (!existingMembership) {
        this.departmentMemberships.push({
            departmentId,
            organizationId,
            role,
            joinedAt: new Date(),
            status: 'active'
        });
    }
};

userSchema.methods.addTeamMembership = function (teamId, departmentId, organizationId, role = 'member') {
    const existingMembership = this.teamMemberships.find(
        m => m.teamId.toString() === teamId.toString()
    );

    if (!existingMembership) {
        this.teamMemberships.push({
            teamId,
            departmentId,
            organizationId,
            role,
            joinedAt: new Date(),
            status: 'active'
        });
    }
};

userSchema.methods.grantProjectAccess = function (projectId, organizationId, permission = 'view', isInherited = false, inheritedFrom = null) {
    const existingAccess = this.projectAccess.find(
        p => p.projectId.toString() === projectId.toString()
    );

    if (existingAccess) {
        existingAccess.permission = permission;
        existingAccess.isInherited = isInherited;
        existingAccess.inheritedFrom = inheritedFrom;
    } else {
        this.projectAccess.push({
            projectId,
            organizationId,
            permission,
            accessGrantedAt: new Date(),
            isInherited,
            inheritedFrom
        });
    }
};

userSchema.methods.removeProjectAccess = function (projectId) {
    this.projectAccess = this.projectAccess.filter(
        p => p.projectId.toString() !== projectId.toString()
    );
};

userSchema.methods.hasProjectAccess = function (projectId, requiredPermission = 'view') {
    const access = this.projectAccess.find(
        p => p.projectId.toString() === projectId.toString()
    );

    if (!access) return false;

    const permissionHierarchy = { view: 0, edit: 1, admin: 2 };
    return permissionHierarchy[access.permission] >= permissionHierarchy[requiredPermission];
};

userSchema.methods.updateMFASetup = function (mfaMethod, totpSecret = null, backupCodes = []) {
    this.mfaMethod = mfaMethod;
    this.mfaEnabled = true;

    if (totpSecret) {
        this.totpSecret = totpSecret;
    }

    if (backupCodes.length > 0) {
        this.backupCodes = backupCodes.map(code => ({
            code,
            used: false,
            usedAt: null
        }));
    }

    this.accountSecurityChangedAt = new Date();
};

userSchema.methods.disableMFA = function () {
    this.mfaEnabled = false;
    this.mfaMethod = null;
    this.totpSecret = null;
    this.backupCodes = [];
    this.accountSecurityChangedAt = new Date();
};

userSchema.methods.logActivity = function (action, resource, resourceId, details = {}) {
    this.activityLog.push({
        action,
        resource,
        resourceId,
        timestamp: new Date(),
        details
    });

    if (this.activityLog.length > 1000) {
        this.activityLog = this.activityLog.slice(-1000);
    }
};

userSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.status = 'deleted';
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.clearAllSessions();
};

userSchema.methods.shouldEnforceMFA = async function (organizationId) {
    const org = await mongoose.model('Organization').findById(organizationId);
    return org && org.accessControl.requiresMFA && !this.mfaEnabled;
};
const User = mongoose.model('User', userSchema);

export default User;