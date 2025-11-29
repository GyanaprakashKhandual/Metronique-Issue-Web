import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate random verification token
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate invite token
export const generateInviteToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate MFA backup codes
export const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
};

// Hash a token (for storing in database)
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Compare plain token with hashed token
export const compareToken = (plainToken, hashedToken) => {
    const hashedPlain = hashToken(plainToken);
    return hashedPlain === hashedToken;
};

// Generate random string
export const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate numeric OTP
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

// Generate alphanumeric code
export const generateAlphanumericCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// Hash password using bcrypt
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

// Compare password with hashed password
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate secure random token with expiry
export const generateTokenWithExpiry = (expiryHours = 24) => {
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    return { token, expiresAt };
};

// Check if token is expired
export const isTokenExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

// Generate UUID-like identifier
export const generateUUID = () => {
    return crypto.randomUUID();
};

// Generate device ID
export const generateDeviceId = (userAgent, ipAddress) => {
    const data = `${userAgent}-${ipAddress}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};