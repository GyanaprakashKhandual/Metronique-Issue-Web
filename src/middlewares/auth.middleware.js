import Organization from '../models/organization.model.js';
import Department from '../models/department.model.js';
import Team from '../models/team.model.js';
import Project from '../models/project.model.js';
import { verifyToken } from '../utils/jwt.util.js';
import User from '../models/user.model.js';

export const isOrganizationAdmin = async (req, res, next) => {
    try {
        const { orgId } = req.params;

        if (!orgId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }

        const organization = await Organization.findById(orgId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        if (!organization.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have admin access to this organization'
            });
        }

        req.organization = organization;
        next();
    } catch (error) {
        console.error('Organization admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying admin access',
            error: error.message
        });
    }
};

export const isOrganizationSuperAdmin = async (req, res, next) => {
    try {
        const { orgId } = req.params;

        if (!orgId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }

        const organization = await Organization.findById(orgId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        if (!organization.isSuperAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Only organization super admin can perform this action'
            });
        }

        req.organization = organization;
        next();
    } catch (error) {
        console.error('Organization super admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying super admin access',
            error: error.message
        });
    }
};

export const isOrganizationMember = async (req, res, next) => {
    try {
        const { orgId } = req.params;

        if (!orgId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }

        const organization = await Organization.findById(orgId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        if (!organization.isMember(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this organization'
            });
        }

        req.organization = organization;
        next();
    } catch (error) {
        console.error('Organization member check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying membership',
            error: error.message
        });
    }
};

export const isDepartmentAdmin = async (req, res, next) => {
    try {
        const { deptId } = req.params;

        if (!deptId) {
            return res.status(400).json({
                success: false,
                message: 'Department ID is required'
            });
        }

        const department = await Department.findById(deptId);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        if (!department.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have admin access to this department'
            });
        }

        req.department = department;
        next();
    } catch (error) {
        console.error('Department admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying admin access',
            error: error.message
        });
    }
};

export const isTeamAdmin = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: 'Team ID is required'
            });
        }

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        if (!team.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have admin access to this team'
            });
        }

        req.team = team;
        next();
    } catch (error) {
        console.error('Team admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying admin access',
            error: error.message
        });
    }
};

export const isProjectAdmin = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have admin access to this project'
            });
        }

        req.project = project;
        next();
    } catch (error) {
        console.error('Project admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying admin access',
            error: error.message
        });
    }
};

export const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRoles = req.user.organizationMemberships.map(m => m.role);
        const hasRequiredRole = roles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

export const hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const { orgId } = req.params;

            if (!orgId) {
                return res.status(400).json({
                    success: false,
                    message: 'Organization ID is required'
                });
            }

            const organization = await Organization.findById(orgId);

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            if (organization.isSuperAdmin(req.user._id)) {
                return next();
            }

            const permissions = organization.getAdminPermissions(req.user._id);

            if (!permissions || !permissions[permission]) {
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to: ${permission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying permissions',
                error: error.message
            });
        }
    };
};

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.substring(7);

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const user = await User.findOne({
            _id: decoded.userId,
            isDeleted: false,
            status: { $in: ['active'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or account is inactive'
            });
        }

        const hasActiveSession = user.sessions.some(
            session => session.token === token &&
                session.isActive &&
                session.expiresAt > new Date()
        );

        if (!hasActiveSession) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        user.updateSessionActivity(token);
        await user.save();

        req.user = user;
        req.token = token;
        req.userId = user._id;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (decoded) {
            const user = await User.findOne({
                _id: decoded.userId,
                isDeleted: false
            });

            if (user) {
                req.user = user;
                req.token = token;
                req.userId = user._id;
            }
        }

        next();
    } catch (error) {
        next();
    }
};

export const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email address to access this resource',
            emailVerified: false
        });
    }

    next();
};

export const requireMfaVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.mfaEnabled) {
        const session = req.user.sessions.find(s => s.token === req.token);

        if (!session || !session.mfaVerified) {
            return res.status(403).json({
                success: false,
                message: 'MFA verification required',
                requiresMfa: true
            });
        }
    }

    next();
};

export const verifyResourceOwnership = (resourceIdParam = 'id') => {
    return (req, res, next) => {
        const resourceOwnerId = req.params[resourceIdParam];

        if (req.user._id.toString() !== resourceOwnerId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};