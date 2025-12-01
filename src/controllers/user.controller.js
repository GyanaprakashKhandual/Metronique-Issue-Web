import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { generateVerificationToken, generatePasswordResetToken } from '../utils/token.util.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/notification/mail.service.js';
import { parseDeviceInfo } from '../utils/device.util.js';

// @desc    Register new user (Traditional)
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, organizationName } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: firstName, lastName, email, password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone: phone || null,
            password,
            authProvider: 'email',
            status: 'active',
            isEmailVerified: false
        });

        // Generate email verification token
        const verificationToken = generateVerificationToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await user.save();

        // If organizationName provided, create organization and make user superadmin
        if (organizationName) {
            const organization = new Organization({
                name: organizationName,
                superAdmin: user._id,
                members: [{
                    userId: user._id,
                    role: 'superadmin',
                    status: 'active',
                    joinedAt: new Date()
                }]
            });

            await organization.save();

            // Update user with organization membership
            user.addOrganizationMembership(organization._id, 'superadmin');
            await user.save();
        }

        // Send verification email
        await sendVerificationEmail(user.email, user.firstName, verificationToken);

        // Log activity
        user.logActivity('user_registered', 'user', user._id, {
            method: 'email',
            email: user.email
        });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// @desc    Verify email address
// @route   GET /api/users/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpire: { $gt: new Date() },
            isDeleted: false
        }).select('+emailVerificationToken +emailVerificationExpire');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpire = null;
        user.logActivity('email_verified', 'user', user._id);

        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.firstName);

        // Redirect to frontend
        res.redirect(`http://localhost:3000/app?verified=true`);

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message
        });
    }
};

// @desc    Login user (Traditional with persistent login)
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password, rememberMe = false } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase(),
            isDeleted: false,
            authProvider: 'email'
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil((user.loginAttempts.lockedUntil - new Date()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            user.incrementLoginAttempts();
            await user.save();

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                attemptsRemaining: Math.max(0, 5 - user.loginAttempts.count)
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                emailVerified: false
            });
        }

        // Check MFA requirement
        if (user.mfaEnabled) {
            // Generate temporary session token for MFA
            const mfaTempToken = generateToken({ userId: user._id, mfaPending: true }, '10m');

            return res.status(200).json({
                success: true,
                requiresMfa: true,
                mfaMethod: user.mfaMethod,
                tempToken: mfaTempToken,
                message: 'MFA verification required'
            });
        }

        // Parse device information
        const deviceInfo = parseDeviceInfo(req);

        // Generate tokens
        const accessTokenExpiry = rememberMe ? '30d' : '1d';
        const refreshTokenExpiry = rememberMe ? '90d' : '7d';

        const accessToken = generateToken({ userId: user._id }, accessTokenExpiry);
        const refreshToken = generateRefreshToken({ userId: user._id }, refreshTokenExpiry);

        // Calculate session expiry
        const expiresAt = new Date(Date.now() + (rememberMe ? 90 : 7) * 24 * 60 * 60 * 1000);

        // Add session to user
        user.addSession(accessToken, refreshToken, deviceInfo, expiresAt);
        user.resetLoginAttempts();
        await user.save();

        // Log activity
        user.logActivity('user_login', 'user', user._id, {
            method: 'email',
            deviceInfo
        });
        await user.save();

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 90 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    profileImage: user.profileImage,
                    role: user.organizationMemberships[0]?.role || 'member',
                    preferences: user.preferences
                },
                accessToken,
                expiresAt
            }
        });

    } catch (error) {
        console.error('Login user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Find user and check if refresh token exists in sessions
        const user = await User.findOne({
            _id: decoded.userId,
            'sessions.refreshToken': refreshToken,
            isDeleted: false
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token or session expired'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken({ userId: user._id }, '1d');

        // Update session activity
        const session = user.sessions.find(s => s.refreshToken === refreshToken);
        if (session) {
            session.token = newAccessToken;
            session.lastActivityAt = new Date();
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = async (req, res) => {
    try {
        const { user, token } = req;

        // Remove current session
        user.removeSession(token);
        await user.save();

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        // Log activity
        user.logActivity('user_logout', 'user', user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// @desc    Logout from all devices
// @route   POST /api/users/logout-all
// @access  Private
export const logoutAllDevices = async (req, res) => {
    try {
        const { user } = req;

        // Clear all sessions
        user.clearAllSessions();
        await user.save();

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        // Log activity
        user.logActivity('user_logout_all', 'user', user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully'
        });

    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out from all devices',
            error: error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('organizationMemberships.organizationId', 'name slug logo')
            .populate('departmentMemberships.departmentId', 'name slug')
            .populate('teamMemberships.teamId', 'name slug');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    isEmailVerified: user.isEmailVerified,
                    mfaEnabled: user.mfaEnabled,
                    preferences: user.preferences,
                    organizations: user.organizationMemberships,
                    departments: user.departmentMemberships,
                    teams: user.teamMemberships,
                    status: user.status,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, profileImage } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (profileImage) user.profileImage = profileImage;

        user.lastProfileUpdate = new Date();
        user.logActivity('profile_updated', 'user', user._id, { fields: Object.keys(req.body) });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = async (req, res) => {
    try {
        const { language, timezone, theme, notificationSettings } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update preferences
        if (language) user.preferences.language = language;
        if (timezone) user.preferences.timezone = timezone;
        if (theme) user.preferences.theme = theme;
        if (notificationSettings) {
            user.preferences.notificationSettings = {
                ...user.preferences.notificationSettings,
                ...notificationSettings
            };
        }

        user.logActivity('preferences_updated', 'user', user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: { preferences: user.preferences }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        user.logActivity('password_changed', 'user', user._id);
        await user.save();

        // Clear all other sessions for security
        user.clearAllSessions();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc    Forgot password - Send reset email
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            isDeleted: false
        });

        // Always return success even if user not found (security)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = generatePasswordResetToken();
        user.passwordResetToken = resetToken;
        user.passwordResetExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user.email, user.firstName, resetToken);

        user.logActivity('password_reset_requested', 'user', user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request',
            error: error.message
        });
    }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpire: { $gt: new Date() },
            isDeleted: false
        }).select('+passwordResetToken +passwordResetExpire');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpire = null;

        // Clear all sessions for security
        user.clearAllSessions();

        user.logActivity('password_reset_completed', 'user', user._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// @desc    Get user active sessions
// @route   GET /api/users/sessions
// @access  Private
export const getUserSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Cleanup expired sessions first
        user.invalidateExpiredSessions();
        await user.save();

        const activeSessions = user.getActiveSessions().map(session => ({
            loginAt: session.loginAt,
            lastActivityAt: session.lastActivityAt,
            expiresAt: session.expiresAt,
            deviceInfo: session.deviceInfo,
            isCurrent: session.token === req.token
        }));

        res.status(200).json({
            success: true,
            data: {
                sessions: activeSessions,
                totalSessions: activeSessions.length
            }
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions',
            error: error.message
        });
    }
};

// ============================================
// ADMIN OPERATIONS
// ============================================

// @desc    Admin - Get all users in organization
// @route   GET /api/users/admin/organization/:orgId/users
// @access  Private (Admin)
export const adminGetOrganizationUsers = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { page = 1, limit = 20, search = '', role, status } = req.query;

        // Verify admin access
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
                message: 'You do not have permission to view users in this organization'
            });
        }

        // Build query
        const query = {
            'organizationMemberships.organizationId': orgId,
            isDeleted: false
        };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query['organizationMemberships.role'] = role;
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('firstName lastName email phone profileImage status isEmailVerified organizationMemberships createdAt lastLogin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalUsers: total,
                    hasMore: skip + users.length < total
                }
            }
        });

    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Admin - Add user to organization
// @route   POST /api/users/admin/organization/:orgId/users
// @access  Private (Admin)
export const adminAddUserToOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { firstName, lastName, email, phone, role = 'member', sendInvite = true } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and email are required'
            });
        }

        // Verify admin access
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
                message: 'You do not have permission to add users to this organization'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

        if (user) {
            // Check if already member
            const isMember = user.organizationMemberships.some(
                m => m.organizationId.toString() === orgId
            );

            if (isMember) {
                return res.status(400).json({
                    success: false,
                    message: 'User is already a member of this organization'
                });
            }

            // Add to organization
            user.addOrganizationMembership(orgId, role);
            organization.addMember(user._id, req.user._id, role);

        } else {
            // Create new user
            const tempPassword = Math.random().toString(36).slice(-8);

            user = new User({
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone: phone || null,
                password: tempPassword,
                authProvider: 'email',
                status: 'active',
                isEmailVerified: false
            });

            // Generate verification token
            const verificationToken = generateVerificationToken();
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await user.save();

            // Add to organization
            user.addOrganizationMembership(orgId, role);
            organization.addMember(user._id, req.user._id, role);

            // Send invite email if requested
            if (sendInvite) {
                await sendVerificationEmail(user.email, user.firstName, verificationToken);
            }
        }

        await user.save();
        await organization.save();

        // Log activity
        organization.logActivity('user_added', req.user._id, 'user', user._id, {
            role,
            addedBy: req.user._id
        });
        await organization.save();

        res.status(201).json({
            success: true,
            message: 'User added to organization successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Admin add user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding user to organization',
            error: error.message
        });
    }
};

// @desc    Admin - Update user role
// @route   PUT /api/users/admin/organization/:orgId/users/:userId
// @access  Private (Admin)
export const adminUpdateUserRole = async (req, res) => {
    try {
        const { orgId, userId } = req.params;
        const { role, status } = req.body;

        // Verify admin access
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
                message: 'You do not have permission to update users in this organization'
            });
        }

        // Cannot modify superadmin
        if (organization.isSuperAdmin(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify organization super admin'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update role in user's organization membership
        const membership = user.organizationMemberships.find(
            m => m.organizationId.toString() === orgId
        );

        if (!membership) {
            return res.status(404).json({
                success: false,
                messmessage: 'User is not a member of this organization'
            });
        }

        // Update role
        if (role) {
            membership.role = role;

            // Update in organization
            const orgMember = organization.members.find(
                m => m.userId.toString() === userId
            );
            if (orgMember) {
                orgMember.role = role;
            }
        }

        // Update status
        if (status) {
            membership.status = status;

            const orgMember = organization.members.find(
                m => m.userId.toString() === userId
            );
            if (orgMember) {
                orgMember.status = status;
            }
        }

        await user.save();
        await organization.save();

        // Log activity
        organization.logActivity('user_updated', req.user._id, 'user', user._id, {
            role,
            status,
            updatedBy: req.user._id
        });
        await organization.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Admin - Remove user from organization
// @route   DELETE /api/users/admin/organization/:orgId/users/:userId
// @access  Private (Admin)
export const adminRemoveUserFromOrganization = async (req, res) => {
    try {
        const { orgId, userId } = req.params;

        // Verify admin access
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
                message: 'You do not have permission to remove users from this organization'
            });
        }

        // Cannot remove superadmin
        if (organization.isSuperAdmin(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot remove organization super admin'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove from organization
        user.organizationMemberships = user.organizationMemberships.filter(
            m => m.organizationId.toString() !== orgId
        );

        organization.removeMember(userId);

        await user.save();
        await organization.save();

        // Log activity
        organization.logActivity('user_removed', req.user._id, 'user', user._id, {
            removedBy: req.user._id
        });
        await organization.save();

        res.status(200).json({
            success: true,
            message: 'User removed from organization successfully'
        });

    } catch (error) {
        console.error('Admin remove user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing user from organization',
            error: error.message
        });
    }
};

// @desc    Admin - Delete user permanently
// @route   DELETE /api/users/admin/users/:userId
// @access  Private (SuperAdmin only)
export const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete
        user.softDelete(req.user._id);
        await user.save();

        // Log activity
        user.logActivity('user_deleted', 'user', user._id, {
            deletedBy: req.user._id
        });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Admin - Get user details
// @route   GET /api/users/admin/users/:userId
// @access  Private (Admin)
export const adminGetUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('organizationMemberships.organizationId', 'name slug logo')
            .populate('departmentMemberships.departmentId', 'name slug')
            .populate('teamMemberships.teamId', 'name slug')
            .populate('projectAccess.projectId', 'name slug');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Admin get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            error: error.message
        });
    }
};

// @desc    Admin - Suspend user account
// @route   PUT /api/users/admin/users/:userId/suspend
// @access  Private (Admin)
export const adminSuspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'suspended';
        user.clearAllSessions();
        user.logActivity('user_suspended', 'user', user._id, {
            reason,
            suspendedBy: req.user._id
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User suspended successfully'
        });

    } catch (error) {
        console.error('Admin suspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending user',
            error: error.message
        });
    }
};

// @desc    Admin - Activate user account
// @route   PUT /api/users/admin/users/:userId/activate
// @access  Private (Admin)
export const adminActivateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'active';
        user.logActivity('user_activated', 'user', user._id, {
            activatedBy: req.user._id
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User activated successfully'
        });

    } catch (error) {
        console.error('Admin activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating user',
            error: error.message
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, user.firstName, verificationToken);

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (error) {
        console.error('Resend verification email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification email',
            error: error.message
        });
    }
};

// @desc    Get user activity log
// @route   GET /api/users/activity-log
// @access  Private
export const getUserActivityLog = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skip = (page - 1) * limit;
        const activities = user.activityLog
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                activities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(user.activityLog.length / limit),
                    totalActivities: user.activityLog.length
                }
            }
        });

    } catch (error) {
        console.error('Get activity log error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity log',
            error: error.message
        });
    }
};