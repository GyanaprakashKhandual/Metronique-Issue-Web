import express from 'express';
import passport from 'passport';
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
    getUserActivityLog,
    googleCallback,
    githubCallback,
    continueWithEmail,
    verifyEmailWithToken
} from '../controllers/user.controller.js';
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

// Register new user with email and password
router.post('/register', sanitizeInput, validateRegistration, registerUser);

// Verify email address with token
router.get('/verify-email/:token', verifyEmail);
router.post('/verify-email-token', sanitizeInput, verifyEmailWithToken);

// Login user with email and password
router.post('/login', sanitizeInput, validateLogin, loginUser);

// Refresh access token using refresh token from cookies
router.post('/refresh-token', refreshAccessToken);

// Logout user from current session
router.post('/logout', authenticate, logoutUser);

// Logout user from all devices
router.post('/logout-all', authenticate, logoutAllDevices);

// Get current authenticated user profile
router.get('/profile', authenticate, getCurrentUser);

// Update user profile information
router.put('/profile', authenticate, sanitizeInput, validateProfileUpdate, updateUserProfile);

// Update user preferences and settings
router.put('/preferences', authenticate, sanitizeInput, updateUserPreferences);

// Change user password
router.put('/change-password', authenticate, sanitizeInput, validatePasswordChange, changePassword);

// Request password reset email
router.post('/forgot-password', sanitizeInput, validateForgotPassword, forgotPassword);

// Reset password with token
router.post('/reset-password/:token', sanitizeInput, validateResetPassword, resetPassword);

// Get user active sessions
router.get('/sessions', authenticate, getUserSessions);

// Get user activity log
router.get('/activity-log', authenticate, getUserActivityLog);

// Resend email verification
router.post('/resend-verification', sanitizeInput, resendVerificationEmail);

// Continue with email (no password, passwordless login)
router.post('/continue-with-email', sanitizeInput, continueWithEmail);

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
}));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }), googleCallback);

// Initiate GitHub OAuth login
router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}));

// GitHub OAuth callback
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login?error=auth_failed' }), githubCallback);

// Get all users in organization (admin)
router.get('/admin/organization/:orgId/users', authenticate, validateObjectId('orgId'), isOrganizationAdmin, adminGetOrganizationUsers);

// Add user to organization (admin)
router.post('/admin/organization/:orgId/users', authenticate, sanitizeInput, validateObjectId('orgId'), isOrganizationAdmin, hasPermission('canManageMembers'), adminAddUserToOrganization);

// Update user role in organization (admin)
router.put('/admin/organization/:orgId/users/:userId', authenticate, sanitizeInput, validateObjectId('orgId'), validateObjectId('userId'), isOrganizationAdmin, hasPermission('canManageMembers'), adminUpdateUserRole);

// Remove user from organization (admin)
router.delete('/admin/organization/:orgId/users/:userId', authenticate, validateObjectId('orgId'), validateObjectId('userId'), isOrganizationAdmin, hasPermission('canManageMembers'), adminRemoveUserFromOrganization);

// Get user details (admin)
router.get('/admin/users/:userId', authenticate, validateObjectId('userId'), adminGetUserDetails);

// Suspend user account (admin)
router.put('/admin/users/:userId/suspend', authenticate, sanitizeInput, validateObjectId('userId'), adminSuspendUser);

// Activate suspended user account (admin)
router.put('/admin/users/:userId/activate', authenticate, validateObjectId('userId'), adminActivateUser);

// Delete user permanently (admin)
router.delete('/admin/users/:userId', authenticate, validateObjectId('userId'), adminDeleteUser);

export default router;