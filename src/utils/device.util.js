import { UAParser } from 'ua-parser-js';

// Parse device info
export const parseDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';

    const ua = new UAParser(userAgent).getResult();

    return {
        userAgent,
        ipAddress,
        deviceName: getDeviceName(ua),
        osInfo: getOSInfo(ua),
        browserInfo: getBrowserInfo(ua)
    };
};

// Helpers
const getDeviceName = (ua) => {
    if (ua.device.vendor && ua.device.model) {
        return `${ua.device.vendor} ${ua.device.model}`;
    }
    if (ua.device.type) {
        return ua.device.type;
    }
    if (ua.os.name?.includes('Windows') || ua.os.name?.includes('Mac')) {
        return 'Desktop';
    }
    if (ua.os.name === 'Android' || ua.os.name === 'iOS') {
        return 'Mobile';
    }
    return 'Unknown Device';
};

const getOSInfo = (ua) => {
    return ua.os.name
        ? `${ua.os.name}${ua.os.version ? ' ' + ua.os.version : ''}`
        : 'Unknown OS';
};

const getBrowserInfo = (ua) => {
    return ua.browser.name
        ? `${ua.browser.name}${ua.browser.version ? ' ' + ua.browser.version : ''}`
        : 'Unknown Browser';
};

// Check if device is mobile
export const isMobileDevice = (req) => {
    const ua = new UAParser(req.headers['user-agent']).getResult();
    return ua.device.type === 'mobile' || ua.device.type === 'tablet';
};

// Get device type
export const getDeviceType = (req) => {
    const ua = new UAParser(req.headers['user-agent']).getResult();
    if (ua.device.type === 'mobile') return 'mobile';
    if (ua.device.type === 'tablet') return 'tablet';
    return 'desktop';
};

// Get IP address
export const getIpAddress = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown'
    );
};

// Get user agent
export const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};

// Device Fingerprint
export const generateDeviceFingerprint = (req) => {
    const userAgent = getUserAgent(req);
    const ipAddress = getIpAddress(req);
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    const data = `${userAgent}-${ipAddress}-${acceptLanguage}-${acceptEncoding}`;

    return crypto.subtle ?
        crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)) :
        require('crypto').createHash('sha256').update(data).digest('hex');
};

// Detailed device info
export const getDetailedDeviceInfo = (req) => {
    const ua = new UAParser(req.headers['user-agent']).getResult();

    return {
        browser: ua.browser,
        engine: ua.engine,
        os: ua.os,
        device: ua.device,
        cpu: ua.cpu,
        ipAddress: getIpAddress(req),
        userAgent: req.headers['user-agent']
    };
};
