// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Phone validation (basic)
export const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Validate registration data
export const validateRegistration = (req, res, next) => {
    const { firstName, lastName, email, password, phone } = req.body;
    const errors = [];

    // First name validation
    if (!firstName || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
    }

    // Last name validation
    if (!lastName || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
    }

    // Email validation
    if (!email || !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (!validatePassword(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Phone validation (optional)
    if (phone && !validatePhone(phone)) {
        errors.push('Please provide a valid phone number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate login data
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate password change
export const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const errors = [];

    if (!currentPassword) {
        errors.push('Current password is required');
    }

    if (!newPassword) {
        errors.push('New password is required');
    } else if (newPassword.length < 8) {
        errors.push('New password must be at least 8 characters long');
    } else if (!validatePassword(newPassword)) {
        errors.push('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
        errors.push('New password and confirm password do not match');
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
        errors.push('New password must be different from current password');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate profile update
export const validateProfileUpdate = (req, res, next) => {
    const { firstName, lastName, phone, email } = req.body;
    const errors = [];

    if (firstName && firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
    }

    if (lastName && lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
    }

    if (email && !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (phone && !validatePhone(phone)) {
        errors.push('Please provide a valid phone number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate forgot password
export const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;
    const errors = [];

    if (!email || !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate reset password
export const validateResetPassword = (req, res, next) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    const errors = [];

    if (!token) {
        errors.push('Reset token is required');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (!validatePassword(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    if (confirmPassword && password !== confirmPassword) {
        errors.push('Password and confirm password do not match');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const mongoose = require('mongoose');

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};

// Sanitize input
export const sanitizeInput = (req, res, next) => {
    // Remove any HTML tags and trim whitespace
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim().replace(/<[^>]*>/g, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
};