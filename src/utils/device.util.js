import parser from 'ua-parser-js';

// Parse device information from request
export const parseDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const ua = parser(userAgent);

    return {
        userAgent,
        ipAddress,
        deviceName: getDeviceName(ua),
        osInfo: getOSInfo(ua),
        browserInfo: getBrowserInfo(ua)
    };
};

// Get device name
const getDeviceName = (ua) => {
    const device = ua.device;

    if (device.vendor && device.model) {
        return `${device.vendor} ${device.model}`;
    }

    if (device.type) {
        return device.type.charAt(0).toUpperCase() + device.type.slice(1);
    }

    const os = ua.os.name;
    if (os === 'Windows' || os === 'Mac OS') {
        return 'Desktop';
    }

    if (os === 'Android' || os === 'iOS') {
        return 'Mobile';
    }

    return 'Unknown Device';
};

// Get OS information
const getOSInfo = (ua) => {
    const os = ua.os;

    if (os.name && os.version) {
        return `${os.name} ${os.version}`;
    }

    if (os.name) {
        return os.name;
    }

    return 'Unknown OS';
};

// Get browser information
const getBrowserInfo = (ua) => {
    const browser = ua.browser;

    if (browser.name && browser.version) {
        return `${browser.name} ${browser.version}`;
    }

    if (browser.name) {
        return browser.name;
    }

    return 'Unknown Browser';
};

// Check if device is mobile
export const isMobileDevice = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ua = parser(userAgent);

    return ua.device.type === 'mobile' || ua.device.type === 'tablet';
};

// Get device type
export const getDeviceType = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ua = parser(userAgent);

    if (ua.device.type === 'mobile') return 'mobile';
    if (ua.device.type === 'tablet') return 'tablet';

    return 'desktop';
};

// Get IP address from request
export const getIpAddress = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        'unknown'
    );
};

// Get user agent from request
export const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};

// Generate device fingerprint
export const generateDeviceFingerprint = (req) => {
    const userAgent = getUserAgent(req);
    const ipAddress = getIpAddress(req);
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    const data = `${userAgent}-${ipAddress}-${acceptLanguage}-${acceptEncoding}`;

    // Create hash
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Get detailed device info for logging
export const getDetailedDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ua = parser(userAgent);

    return {
        browser: {
            name: ua.browser.name || 'Unknown',
            version: ua.browser.version || 'Unknown',
            major: ua.browser.major || 'Unknown'
        },
        engine: {
            name: ua.engine.name || 'Unknown',
            version: ua.engine.version || 'Unknown'
        },
        os: {
            name: ua.os.name || 'Unknown',
            version: ua.os.version || 'Unknown'
        },
        device: {
            vendor: ua.device.vendor || 'Unknown',
            model: ua.device.model || 'Unknown',
            type: ua.device.type || 'desktop'
        },
        cpu: {
            architecture: ua.cpu.architecture || 'Unknown'
        },
        ipAddress: getIpAddress(req),
        userAgent: userAgent
    };
};