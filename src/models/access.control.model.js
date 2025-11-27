import mongoose from 'mongoose';

const accessControlSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

            index: true
        },
        resourceType: {
            type: String,
            enum: ['organization', 'department', 'team', 'project', 'phase', 'sprint', 'folder', 'document', 'sheet', 'slide', 'bug', 'requirement'],

            index: true
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,

            index: true
        },
        permission: {
            type: String,
            enum: ['view', 'edit', 'admin'],
            default: 'view',
            index: true
        },
        grantedAt: {
            type: Date,
            default: Date.now
        },
        grantedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        accessType: {
            type: String,
            enum: ['direct', 'inherited', 'team', 'department', 'organization'],
            default: 'direct'
        },
        inheritedFrom: {
            type: String,
            enum: ['organization', 'department', 'team', 'project', 'phase', 'sprint', 'folder', 'parent_resource'],
            default: null
        },
        inheritedFromId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        inheritanceChain: [{
            resourceType: String,
            resourceId: mongoose.Schema.Types.ObjectId,
            permission: String,
            level: Number
        }],
        isInherited: {
            type: Boolean,
            default: false,
            index: true
        },
        canDelegate: {
            type: Boolean,
            default: false
        },
        delegatedTo: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            permission: {
                type: String,
                enum: ['view', 'edit']
            },
            delegatedAt: {
                type: Date,
                default: Date.now
            },
            delegatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            expiresAt: {
                type: Date,
                default: null
            }
        }],
        expiresAt: {
            type: Date,
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
        isActive: {
            type: Boolean,
            default: true,
            index: true
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
            project: {
                projectId: mongoose.Schema.Types.ObjectId,
                projectName: String
            },
            resourceName: String,
            resourcePath: String
        },
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
            changes: mongoose.Schema.Types.Mixed,
            details: String
        }],
        tags: [String],
        notes: {
            type: String,
            default: null
        },
        lastAccessedAt: {
            type: Date,
            default: null
        },
        accessCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        collection: 'accesscontrols',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

accessControlSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
});

accessControlSchema.virtual('isRevoked').get(function () {
    return this.revokedAt !== null;
});

accessControlSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

accessControlSchema.virtual('permissionLevel').get(function () {
    const levels = { view: 0, edit: 1, admin: 2 };
    return levels[this.permission];
});

accessControlSchema.index({ organizationId: 1, userId: 1, isActive: 1 });
accessControlSchema.index({ organizationId: 1, resourceId: 1, isActive: 1 });
accessControlSchema.index({ userId: 1, resourceType: 1, isActive: 1 });
accessControlSchema.index({ organizationId: 1, resourceType: 1, isActive: 1 });
accessControlSchema.index({ isInherited: 1, isActive: 1 });
accessControlSchema.index({ permission: 1, isActive: 1 });
accessControlSchema.index({ expiresAt: 1, isActive: 1 });
accessControlSchema.index({ revokedAt: 1 });
accessControlSchema.index({ 'inheritanceChain.resourceId': 1 });
accessControlSchema.index({ organizationId: 1, userId: 1, resourceId: 1 });
accessControlSchema.index({ createdAt: -1 });

accessControlSchema.pre('save', function (next) {
    if (this.revokedAt && !this.isActive) {
        this.isActive = false;
    }

    if (this.expiresAt && this.expiresAt < new Date()) {
        this.isActive = false;
    }

    next();
});

accessControlSchema.methods.hasPermission = function (requiredPermission) {
    if (!this.isActive) return false;
    if (this.isExpired) return false;
    if (this.isRevoked) return false;

    const permissionHierarchy = { view: 0, edit: 1, admin: 2 };
    return permissionHierarchy[this.permission] >= permissionHierarchy[requiredPermission];
};

accessControlSchema.methods.canDelete = function () {
    return this.hasPermission('admin');
};

accessControlSchema.methods.canEdit = function () {
    return this.hasPermission('edit');
};

accessControlSchema.methods.canView = function () {
    return this.hasPermission('view');
};

accessControlSchema.methods.upgradePermission = function (newPermission, upgradedBy) {
    const permissionHierarchy = { view: 0, edit: 1, admin: 2 };

    if (permissionHierarchy[newPermission] > permissionHierarchy[this.permission]) {
        const oldPermission = this.permission;
        this.permission = newPermission;

        this.auditLog.push({
            action: 'permission_upgraded',
            performedBy: upgradedBy,
            timestamp: new Date(),
            changes: {
                from: oldPermission,
                to: newPermission
            },
            details: `Permission upgraded from ${oldPermission} to ${newPermission}`
        });
    }
};

accessControlSchema.methods.downgradePermission = function (newPermission, downgradedBy) {
    const permissionHierarchy = { view: 0, edit: 1, admin: 2 };

    if (permissionHierarchy[newPermission] < permissionHierarchy[this.permission]) {
        const oldPermission = this.permission;
        this.permission = newPermission;

        this.auditLog.push({
            action: 'permission_downgraded',
            performedBy: downgradedBy,
            timestamp: new Date(),
            changes: {
                from: oldPermission,
                to: newPermission
            },
            details: `Permission downgraded from ${oldPermission} to ${newPermission}`
        });
    }
};

accessControlSchema.methods.updatePermission = function (newPermission, updatedBy, reason = '') {
    if (this.permission !== newPermission) {
        const oldPermission = this.permission;
        this.permission = newPermission;

        this.auditLog.push({
            action: 'permission_updated',
            performedBy: updatedBy,
            timestamp: new Date(),
            changes: {
                from: oldPermission,
                to: newPermission
            },
            details: reason || `Permission changed from ${oldPermission} to ${newPermission}`
        });
    }
};

accessControlSchema.methods.delegateAccess = function (targetUserId, delegatedPermission, delegatedBy, expiresAt = null) {
    const permissionHierarchy = { view: 0, edit: 1, admin: 2 };

    if (permissionHierarchy[delegatedPermission] > permissionHierarchy[this.permission]) {
        return false;
    }

    const existingDelegation = this.delegatedTo.find(d => d.userId.toString() === targetUserId.toString());

    if (existingDelegation) {
        existingDelegation.permission = delegatedPermission;
        existingDelegation.delegatedAt = new Date();
        existingDelegation.delegatedBy = delegatedBy;
        existingDelegation.expiresAt = expiresAt;
    } else {
        this.delegatedTo.push({
            userId: targetUserId,
            permission: delegatedPermission,
            delegatedAt: new Date(),
            delegatedBy,
            expiresAt
        });
    }

    this.auditLog.push({
        action: 'access_delegated',
        performedBy: delegatedBy,
        timestamp: new Date(),
        changes: {
            targetUserId,
            permission: delegatedPermission
        },
        details: `Access delegated to user ${targetUserId} with ${delegatedPermission} permission`
    });

    return true;
};

accessControlSchema.methods.revokeDelegation = function (targetUserId, revokedBy) {
    const delegation = this.delegatedTo.find(d => d.userId.toString() === targetUserId.toString());

    if (delegation) {
        this.delegatedTo = this.delegatedTo.filter(d => d.userId.toString() !== targetUserId.toString());

        this.auditLog.push({
            action: 'delegation_revoked',
            performedBy: revokedBy,
            timestamp: new Date(),
            changes: { targetUserId },
            details: `Delegation revoked for user ${targetUserId}`
        });

        return true;
    }

    return false;
};

accessControlSchema.methods.revoke = function (revokedBy, reason = '') {
    if (!this.isRevoked) {
        this.revokedAt = new Date();
        this.revokedBy = revokedBy;
        this.revocationReason = reason;
        this.isActive = false;
        this.delegatedTo = [];

        this.auditLog.push({
            action: 'access_revoked',
            performedBy: revokedBy,
            timestamp: new Date(),
            changes: { isActive: false },
            details: reason || 'Access revoked'
        });

        return true;
    }

    return false;
};

accessControlSchema.methods.restore = function (restoredBy, reason = '') {
    if (this.isRevoked && !this.isExpired) {
        this.revokedAt = null;
        this.revokedBy = null;
        this.revocationReason = null;
        this.isActive = true;

        this.auditLog.push({
            action: 'access_restored',
            performedBy: restoredBy,
            timestamp: new Date(),
            changes: { isActive: true },
            details: reason || 'Access restored'
        });

        return true;
    }

    return false;
};

accessControlSchema.methods.setExpiration = function (expiryDate, setBy) {
    const oldExpiryDate = this.expiresAt;
    this.expiresAt = expiryDate;

    this.auditLog.push({
        action: 'expiration_updated',
        performedBy: setBy,
        timestamp: new Date(),
        changes: {
            from: oldExpiryDate,
            to: expiryDate
        },
        details: `Expiration date updated to ${expiryDate}`
    });
};

accessControlSchema.methods.removeExpiration = function (removedBy) {
    if (this.expiresAt) {
        this.expiresAt = null;

        this.auditLog.push({
            action: 'expiration_removed',
            performedBy: removedBy,
            timestamp: new Date(),
            details: 'Expiration date removed'
        });

        return true;
    }

    return false;
};

accessControlSchema.methods.recordAccess = function () {
    this.lastAccessedAt = new Date();
    this.accessCount += 1;
};

accessControlSchema.methods.setInheritanceChain = function (chain) {
    this.inheritanceChain = chain;
    this.isInherited = chain.length > 0;
};

accessControlSchema.methods.addInheritanceLevel = function (resourceType, resourceId, permission, level) {
    this.inheritanceChain.push({
        resourceType,
        resourceId,
        permission,
        level
    });
};

accessControlSchema.methods.getInheritanceLevel = function () {
    return this.inheritanceChain.length;
};

accessControlSchema.methods.getFullInheritancePath = async function () {
    const path = [];

    for (const link of this.inheritanceChain) {
        const model = mongoose.model(link.resourceType.charAt(0).toUpperCase() + link.resourceType.slice(1));
        const resource = await model.findById(link.resourceId);

        if (resource) {
            path.push({
                level: link.level,
                resourceType: link.resourceType,
                resourceId: link.resourceId,
                resourceName: resource.name || resource.title,
                permission: link.permission
            });
        }
    }

    return path;
};

accessControlSchema.methods.addAuditLog = function (action, performedBy, changes = {}, details = '') {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        changes,
        details
    });

    if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-10000);
    }
};

accessControlSchema.methods.getAuditHistory = function (limit = 50) {
    return this.auditLog.slice(-limit).reverse();
};

accessControlSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
};

accessControlSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
};

accessControlSchema.methods.hasTag = function (tag) {
    return this.tags.includes(tag);
};

accessControlSchema.methods.updateMetadata = function (metadata) {
    this.metadata = {
        ...this.metadata,
        ...metadata
    };
};

accessControlSchema.methods.cleanupExpiredAccess = async function () {
    if (this.expiresAt && this.expiresAt < new Date()) {
        this.isActive = false;
        await this.save();
        return true;
    }
    return false;
};

accessControlSchema.methods.cleanupExpiredDelegations = function () {
    const now = new Date();
    const initialLength = this.delegatedTo.length;

    this.delegatedTo = this.delegatedTo.filter(d => {
        if (d.expiresAt && d.expiresAt < now) {
            return false;
        }
        return true;
    });

    return initialLength - this.delegatedTo.length;
};

accessControlSchema.statics.findUserResourceAccess = function (userId, resourceId, resourceType) {
    return this.findOne({
        userId,
        resourceId,
        resourceType,
        isActive: true
    });
};

accessControlSchema.statics.findUserOrgAccess = function (userId, organizationId) {
    return this.find({
        userId,
        organizationId,
        isActive: true
    });
};

accessControlSchema.statics.findResourceAccessList = function (resourceId, resourceType) {
    return this.find({
        resourceId,
        resourceType,
        isActive: true
    }).populate('userId', 'firstName lastName email');
};

accessControlSchema.statics.revokeExpiredAccess = async function (organizationId) {
    const now = new Date();
    const result = await this.updateMany(
        {
            organizationId,
            expiresAt: { $lt: now },
            isActive: true
        },
        {
            isActive: false
        }
    );
    return result;
};

const AccessControl = mongoose.model('AccessControl', accessControlSchema);

export default AccessControl;