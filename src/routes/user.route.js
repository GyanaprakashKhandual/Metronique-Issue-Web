import express from 'express';
import {
    registerUser,
    verifyEmail,
    loginUser,
    refreshAccessToken,
    logoutUser,
    logoutAllDevices,
    getCurrentUser,
    updateUserProfile,
    updateUserPreferences,
    changePassword,
    forgotPassword,
    resetPassword,
    getUserSessions,
    adminGetOrganizationUsers,
    adminAddUserToOrganization,
    adminUpdateUserRole,
    adminRemoveUserFromOrganization,
    adminDeleteUser,
    adminGetUserDetails,
    adminSuspendUser,
    adminActivateUser,
    resendVerificationEmail,
    getUserActivityLog
} from '../controllers/users/userController.js';
import {
    authenticate,
    isOrganizationAdmin,
    isOrganizationSuperAdmin,
    hasPermission
} from '../middlewares/auth.middleware.js';
import {
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate,
    validateForgotPassword,
    validateResetPassword,
    sanitizeInput,
    validateObjectId
} from '../private/user.validator.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Register & Authentication
router.post('/register', sanitizeInput, validateRegistration, registerUser);
router.post('/login', sanitizeInput, validateLogin, loginUser);
router.post('/refresh-token', refreshAccessToken);

// Email Verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', sanitizeInput, resendVerificationEmail);

// Password Reset
router.post('/forgot-password', sanitizeInput, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', sanitizeInput, validateResetPassword, resetPassword);

// ==================== PROTECTED ROUTES ====================

// Logout
router.post('/logout', authenticate, logoutUser);
router.post('/logout-all', authenticate, logoutAllDevices);

// User Profile
router.get('/profile', authenticate, getCurrentUser);
router.put('/profile', authenticate, sanitizeInput, validateProfileUpdate, updateUserProfile);
router.put('/preferences', authenticate, sanitizeInput, updateUserPreferences);

// Password Management
router.put('/change-password', authenticate, sanitizeInput, validatePasswordChange, changePassword);

// Sessions
router.get('/sessions', authenticate, getUserSessions);

// Activity Log
router.get('/activity-log', authenticate, getUserActivityLog);

// ==================== ADMIN ROUTES ====================

// Organization User Management
router.get(
    '/admin/organization/:orgId/users',
    authenticate,
    validateObjectId('orgId'),
    isOrganizationAdmin,
    adminGetOrganizationUsers
);

router.post(
    '/admin/organization/:orgId/users',
    authenticate,
    sanitizeInput,
    validateObjectId('orgId'),
    isOrganizationAdmin,
    hasPermission('canManageMembers'),
    adminAddUserToOrganization
);

router.put(
    '/admin/organization/:orgId/users/:userId',
    authenticate,
    sanitizeInput,
    validateObjectId('orgId'),
    validateObjectId('userId'),
    isOrganizationAdmin,
    hasPermission('canManageMembers'),
    adminUpdateUserRole
);

router.delete(
    '/admin/organization/:orgId/users/:userId',
    authenticate,
    validateObjectId('orgId'),
    validateObjectId('userId'),
    isOrganizationAdmin,
    hasPermission('canManageMembers'),
    adminRemoveUserFromOrganization
);

// User Details
router.get(
    '/admin/users/:userId',
    authenticate,
    validateObjectId('userId'),
    adminGetUserDetails
);

// User Account Management
router.put(
    '/admin/users/:userId/suspend',
    authenticate,
    sanitizeInput,
    validateObjectId('userId'),
    adminSuspendUser
);

router.put(
    '/admin/users/:userId/activate',
    authenticate,
    validateObjectId('userId'),
    adminActivateUser
);

router.delete(
    '/admin/users/:userId',
    authenticate,
    validateObjectId('userId'),
    adminDeleteUser
);

export default router;