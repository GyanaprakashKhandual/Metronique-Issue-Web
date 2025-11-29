import jwt from 'jsonwebtoken';

// Generate access token
export const generateToken = (payload, expiresIn = '1d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
        issuer: 'bug-tracker-api'
    });
};

// Generate refresh token
export const generateRefreshToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn,
        issuer: 'bug-tracker-api'
    });
};

// Verify access token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token verification error:', error.message);
        return null;
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        console.error('Refresh token verification error:', error.message);
        return null;
    }
};

// Decode token without verification
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Token decode error:', error.message);
        return null;
    }
};

// Check if token is expired
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;

        return Date.now() >= decoded.exp * 1000;
    } catch (error) {
        return true;
    }
};

// Get token expiry time
export const getTokenExpiry = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded?.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
        return null;
    }
};

// Generate MFA temporary token (short-lived)
export const generateMfaTempToken = (payload) => {
    return jwt.sign(
        { ...payload, mfaPending: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m', issuer: 'bug-tracker-api' }
    );
};

// Verify MFA temporary token
export const verifyMfaTempToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.mfaPending) {
            throw new Error('Invalid MFA token');
        }
        return decoded;
    } catch (error) {
        console.error('MFA token verification error:', error.message);
        return null;
    }
};