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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization operations
 *   - name: User Profile
 *     description: User profile management
 *   - name: User Admin
 *     description: Admin operations for user management
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               organizationName:
 *                 type: string
 *                 example: ACME Corp
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user exists
 *       500:
 *         description: Registration failed
 */
router.post('/register', sanitizeInput, validateRegistration, registerUser);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               rememberMe:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked
 *       500:
 *         description: Login failed
 */
router.post('/login', sanitizeInput, validateLogin, loginUser);

/**
 * @swagger
 * /api/v1/users/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     description: Verify user email with token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Verification failed
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @swagger
 * /api/v1/users/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Send verification email again
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Email already verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to send email
 */
router.post('/resend-verification', sanitizeInput, resendVerificationEmail);

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       500:
 *         description: Failed to process request
 */
router.post('/forgot-password', sanitizeInput, validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /api/v1/users/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Reset password with token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Reset failed
 */
router.post('/reset-password/:token', sanitizeInput, validateResetPassword, resetPassword);

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Refresh failed
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout from current session
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Logout failed
 */
router.post('/logout', authenticate, logoutUser);

/**
 * @swagger
 * /api/v1/users/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Logout from all active sessions
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful from all devices
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Logout failed
 */
router.post('/logout-all', authenticate, logoutAllDevices);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch profile
 */
router.get('/profile', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Update failed
 */
router.put('/profile', authenticate, sanitizeInput, validateProfileUpdate, updateUserProfile);

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Update user settings and preferences
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *               notificationSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Update failed
 */
router.put('/preferences', authenticate, sanitizeInput, updateUserPreferences);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   put:
 *     summary: Change password
 *     description: Change user password
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Change failed
 */
router.put('/change-password', authenticate, sanitizeInput, validatePasswordChange, changePassword);

/**
 * @swagger
 * /api/v1/users/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: List all active sessions for user
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch sessions
 */
router.get('/sessions', authenticate, getUserSessions);

/**
 * @swagger
 * /api/v1/users/activity-log:
 *   get:
 *     summary: Get activity log
 *     description: Retrieve user activity log with pagination
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: Activity log retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch log
 */
router.get('/activity-log', authenticate, getUserActivityLog);

/**
 * @swagger
 * /api/v1/users/admin/organization/{orgId}/users:
 *   get:
 *     summary: Get organization users
 *     description: List all users in organization
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orgId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [superadmin, admin, member]
 *     responses:
 *       200:
 *         description: Users retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Failed to fetch users
 */
router.get(
    '/admin/organization/:orgId/users',
    authenticate,
    validateObjectId('orgId'),
    isOrganizationAdmin,
    adminGetOrganizationUsers
);

/**
 * @swagger
 * /api/v1/users/admin/organization/{orgId}/users:
 *   post:
 *     summary: Add user to organization
 *     description: Add a new user to organization
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orgId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, member]
 *               sendInvite:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 */
router.post(
    '/admin/organization/:orgId/users',
    authenticate,
    sanitizeInput,
    validateObjectId('orgId'),
    isOrganizationAdmin,
    hasPermission('canManageMembers'),
    adminAddUserToOrganization
);

/**
 * @swagger
 * /api/v1/users/admin/organization/{orgId}/users/{userId}:
 *   put:
 *     summary: Update user role
 *     description: Update user role in organization
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orgId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, member]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
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

/**
 * @swagger
 * /api/v1/users/admin/organization/{orgId}/users/{userId}:
 *   delete:
 *     summary: Remove user from organization
 *     description: Remove user from organization
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orgId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete(
    '/admin/organization/:orgId/users/:userId',
    authenticate,
    validateObjectId('orgId'),
    validateObjectId('userId'),
    isOrganizationAdmin,
    hasPermission('canManageMembers'),
    adminRemoveUserFromOrganization
);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Get detailed information about a user
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
    '/admin/users/:userId',
    authenticate,
    validateObjectId('userId'),
    adminGetUserDetails
);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}/suspend:
 *   put:
 *     summary: Suspend user
 *     description: Suspend user account
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User suspended
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
    '/admin/users/:userId/suspend',
    authenticate,
    sanitizeInput,
    validateObjectId('userId'),
    adminSuspendUser
);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}/activate:
 *   put:
 *     summary: Activate user
 *     description: Activate suspended user account
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
    '/admin/users/:userId/activate',
    authenticate,
    validateObjectId('userId'),
    adminActivateUser
);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Delete user account permanently
 *     tags:
 *       - User Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete(
    '/admin/users/:userId',
    authenticate,
    validateObjectId('userId'),
    adminDeleteUser
);

export default router;