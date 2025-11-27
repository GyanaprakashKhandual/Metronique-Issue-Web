import mongoose from 'mongoose';

const mfaSetupSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',

            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

            unique: true,
            index: true
        },
        userEmail: {
            type: String,
            lowercase: true,
            default: null
        },
        mfaEnabled: {
            type: Boolean,
            default: false,
            index: true
        },
        primaryMethod: {
            type: String,
            enum: ['totp', 'email', 'sms', 'authenticator'],
            default: null
        },
        totp: {
            enabled: {
                type: Boolean,
                default: false
            },
            secret: {
                type: String,
                select: false,
                default: null
            },
            tempSecret: {
                type: String,
                select: false,
                default: null
            },
            backupCodes: [
                {
                    code: {
                        type: String,
                        select: false
                    },
                    used: {
                        type: Boolean,
                        default: false
                    },
                    usedAt: {
                        type: Date,
                        default: null
                    },
                    usedBy: {
                        type: String,
                        default: null
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            verifiedAt: {
                type: Date,
                default: null
            },
            qrCode: {
                type: String,
                default: null
            },
            lastUsedAt: {
                type: Date,
                default: null
            },
            failedAttempts: {
                type: Number,
                default: 0
            },
            lastFailedAt: {
                type: Date,
                default: null
            }
        },
        email: {
            enabled: {
                type: Boolean,
                default: false
            },
            emailAddress: {
                type: String,
                lowercase: true,
                default: null
            },
            verificationCode: {
                type: String,
                select: false,
                default: null
            },
            verificationCodeExpiry: {
                type: Date,
                default: null
            },
            codeAttempts: {
                type: Number,
                default: 0
            },
            lastCodeSentAt: {
                type: Date,
                default: null
            },
            verifiedAt: {
                type: Date,
                default: null
            },
            lastUsedAt: {
                type: Date,
                default: null
            },
            failedAttempts: {
                type: Number,
                default: 0
            },
            lastFailedAt: {
                type: Date,
                default: null
            }
        },
        sms: {
            enabled: {
                type: Boolean,
                default: false
            },
            phoneNumber: {
                type: String,
                default: null
            },
            phoneNumberLastFourDigits: {
                type: String,
                default: null
            },
            verificationCode: {
                type: String,
                select: false,
                default: null
            },
            verificationCodeExpiry: {
                type: Date,
                default: null
            },
            codeAttempts: {
                type: Number,
                default: 0
            },
            lastCodeSentAt: {
                type: Date,
                default: null
            },
            verifiedAt: {
                type: Date,
                default: null
            },
            lastUsedAt: {
                type: Date,
                default: null
            },
            failedAttempts: {
                type: Number,
                default: 0
            },
            lastFailedAt: {
                type: Date,
                default: null
            }
        },
        backup: {
            enabled: {
                type: Boolean,
                default: false
            },
            codes: [
                {
                    code: {
                        type: String,
                        select: false
                    },
                    used: {
                        type: Boolean,
                        default: false
                    },
                    usedAt: {
                        type: Date,
                        default: null
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            generatedAt: {
                type: Date,
                default: null
            },
            downloadedAt: {
                type: Date,
                default: null
            },
            printedAt: {
                type: Date,
                default: null
            }
        },
        trustedDevices: [
            {
                deviceId: String,
                deviceName: String,
                deviceType: {
                    type: String,
                    enum: ['desktop', 'mobile', 'tablet', 'other'],
                    default: 'other'
                },
                osInfo: String,
                browserInfo: String,
                ipAddress: String,
                userAgent: String,
                trusted: {
                    type: Boolean,
                    default: false
                },
                trustedAt: {
                    type: Date,
                    default: null
                },
                trustToken: {
                    type: String,
                    select: false,
                    default: null
                },
                lastUsedAt: {
                    type: Date,
                    default: Date.now
                },
                expiresAt: {
                    type: Date,
                    default: null
                }
            }
        ],
        mfaHistory: [
            {
                action: {
                    type: String,
                    enum: [
                        'mfa_enabled',
                        'mfa_disabled',
                        'method_added',
                        'method_removed',
                        'method_verified',
                        'totp_verified',
                        'email_verified',
                        'sms_verified',
                        'backup_codes_generated',
                        'backup_code_used',
                        'device_trusted',
                        'device_untrusted',
                        'recovery_used',
                        'failed_attempt',
                        'successful_auth'
                    ],
                    required: true
                },
                method: {
                    type: String,
                    enum: ['totp', 'email', 'sms', 'authenticator', 'backup', 'trusted_device'],
                    default: null
                },
                deviceInfo: {
                    deviceName: String,
                    ipAddress: String,
                    userAgent: String,
                    osInfo: String
                },
                status: {
                    type: String,
                    enum: ['success', 'failed', 'pending'],
                    default: 'pending'
                },
                reason: String,
                performedAt: {
                    type: Date,
                    default: Date.now
                },
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        recoveryOptions: {
            recoveryEmailConfigured: {
                type: Boolean,
                default: false
            },
            recoveryEmail: {
                type: String,
                lowercase: true,
                default: null
            },
            recoveryPhoneConfigured: {
                type: Boolean,
                default: false
            },
            recoveryPhone: {
                type: String,
                default: null
            },
            recoveryCodesSent: {
                type: Boolean,
                default: false
            },
            lastRecoveryAttempt: {
                type: Date,
                default: null
            },
            recoveryAttempts: {
                type: Number,
                default: 0
            }
        },
        securitySettings: {
            requireMfaForAllLogins: {
                type: Boolean,
                default: false
            },
            requireMfaForSensitiveActions: {
                type: Boolean,
                default: true
            },
            allowRememberDevice: {
                type: Boolean,
                default: true
            },
            rememberDeviceExpiry: {
                type: Number,
                default: 30
            },
            requirePasswordOnMfaDisable: {
                type: Boolean,
                default: true
            },
            mfaGracePeriod: {
                type: Number,
                default: 0
            },
            mfaEnforcementDate: {
                type: Date,
                default: null
            }
        },
        setupStatus: {
            isSetupComplete: {
                type: Boolean,
                default: false
            },
            setupStartedAt: {
                type: Date,
                default: null
            },
            setupCompletedAt: {
                type: Date,
                default: null
            },
            lastSetupStepCompleted: {
                type: String,
                enum: [
                    'none',
                    'method_selection',
                    'totp_setup',
                    'email_setup',
                    'sms_setup',
                    'verification',
                    'backup_codes',
                    'device_trust',
                    'completed'
                ],
                default: 'none'
            },
            setupPercentage: {
                type: Number,
                default: 0
            }
        },
        enforementPolicy: {
            isMfaEnforced: {
                type: Boolean,
                default: false
            },
            enforcementLevel: {
                type: String,
                enum: ['none', 'recommended', 'required', 'mandatory'],
                default: 'none'
            },
            enforcementDeadline: {
                type: Date,
                default: null
            },
            enforcementGracePeriod: {
                type: Number,
                default: 0
            },
            hasBeenNotified: {
                type: Boolean,
                default: false
            },
            notificationSentAt: {
                type: Date,
                default: null
            }
        },
        sessionManagement: {
            activeSessionsRequireMfa: {
                type: Boolean,
                default: false
            },
            terminateOtherSessionsOnMfaEnable: {
                type: Boolean,
                default: true
            },
            requireMfaReAuthOnSensitiveActions: {
                type: Boolean,
                default: true
            },
            mfaReAuthExpiry: {
                type: Number,
                default: 15
            },
            lastMfaReAuthAt: {
                type: Date,
                default: null
            }
        },
        riskAssessment: {
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'low'
            },
            lastRiskAssessmentAt: {
                type: Date,
                default: null
            },
            riskFactors: [String],
            recommendedActions: [String],
            suspiciousActivities: [
                {
                    activity: String,
                    detectedAt: {
                        type: Date,
                        default: Date.now
                    },
                    ipAddress: String,
                    location: String
                }
            ]
        },
        auditLog: [
            {
                action: String,
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                changes: mongoose.Schema.Types.Mixed,
                details: String
            }
        ],
        metadata: {
            preferredAuthMethod: String,
            authMethodOrder: [String],
            customSettings: mongoose.Schema.Types.Mixed
        },
        status: {
            type: String,
            enum: ['setup_pending', 'setup_in_progress', 'active', 'inactive', 'suspended', 'disabled'],
            default: 'setup_pending',
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        collection: 'mfasetups',
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

mfaSetupSchema.virtual('enabledMethods').get(function () {
    const methods = [];
    if (this.totp.enabled) methods.push('totp');
    if (this.email.enabled) methods.push('email');
    if (this.sms.enabled) methods.push('sms');
    if (this.backup.enabled) methods.push('backup');
    return methods;
});

mfaSetupSchema.virtual('methodCount').get(function () {
    return this.enabledMethods.length;
});

mfaSetupSchema.virtual('hasMultipleMethods').get(function () {
    return this.enabledMethods.length > 1;
});

mfaSetupSchema.virtual('availableBackupCodes').get(function () {
    return this.totp.backupCodes.filter(code => !code.used).length;
});

mfaSetupSchema.virtual('totalBackupCodes').get(function () {
    return this.totp.backupCodes.length;
});

mfaSetupSchema.virtual('usedBackupCodes').get(function () {
    return this.totp.backupCodes.filter(code => code.used).length;
});

mfaSetupSchema.virtual('trustedDeviceCount').get(function () {
    return this.trustedDevices.filter(d => d.trusted && (!d.expiresAt || d.expiresAt > new Date())).length;
});

mfaSetupSchema.virtual('hasBackupCodesAvailable').get(function () {
    return this.availableBackupCodes > 0;
});

mfaSetupSchema.virtual('isSetupComplete').get(function () {
    return this.setupStatus.isSetupComplete && this.mfaEnabled;
});

mfaSetupSchema.virtual('setupProgress').get(function () {
    return this.setupStatus.setupPercentage;
});

mfaSetupSchema.virtual('isMfaEnforced').get(function () {
    return this.enforementPolicy.isMfaEnforced;
});

mfaSetupSchema.index({ organizationId: 1, userId: 1 });
mfaSetupSchema.index({ organizationId: 1, mfaEnabled: 1 });
mfaSetupSchema.index({ userId: 1, mfaEnabled: 1 });
mfaSetupSchema.index({ status: 1, organizationId: 1 });
mfaSetupSchema.index({ 'totp.enabled': 1 });
mfaSetupSchema.index({ 'email.enabled': 1 });
mfaSetupSchema.index({ 'sms.enabled': 1 });
mfaSetupSchema.index({ 'backup.enabled': 1 });
mfaSetupSchema.index({ 'enforementPolicy.isMfaEnforced': 1 });
mfaSetupSchema.index({ 'setupStatus.isSetupComplete': 1 });
mfaSetupSchema.index({ createdAt: -1 });
mfaSetupSchema.index({ 'mfaHistory.performedAt': -1 });

mfaSetupSchema.pre('save', function (next) {
    if (this.mfaEnabled && !this.setupStatus.isSetupComplete) {
        this.setupStatus.isSetupComplete = true;
        this.setupStatus.setupCompletedAt = new Date();
        this.setupStatus.setupPercentage = 100;
    }

    if (!this.mfaEnabled) {
        this.status = 'inactive';
    }

    next();
});

mfaSetupSchema.methods.enableTotp = function (secret, backupCodes = []) {
    this.totp.enabled = true;
    this.totp.secret = secret;
    this.totp.backupCodes = backupCodes.map(code => ({
        code,
        used: false,
        usedAt: null,
        createdAt: new Date()
    }));

    if (!this.mfaEnabled) {
        this.mfaEnabled = true;
    }

    if (!this.primaryMethod) {
        this.primaryMethod = 'totp';
    }
};

mfaSetupSchema.methods.disableTotp = function () {
    this.totp.enabled = false;
    this.totp.secret = null;
    this.totp.tempSecret = null;
    this.totp.backupCodes = [];
    this.totp.verifiedAt = null;

    if (this.primaryMethod === 'totp') {
        const enabledMethods = [];
        if (this.email.enabled) enabledMethods.push('email');
        if (this.sms.enabled) enabledMethods.push('sms');
        this.primaryMethod = enabledMethods[0] || null;
    }

    if (!this.email.enabled && !this.sms.enabled && !this.backup.enabled) {
        this.mfaEnabled = false;
    }
};

mfaSetupSchema.methods.verifyTotp = function (verifiedAt = new Date()) {
    this.totp.verifiedAt = verifiedAt;
    this.totp.tempSecret = null;
    this.addMfaHistory('totp_verified', 'totp', { status: 'success' });
};

mfaSetupSchema.methods.enableEmail = function (emailAddress) {
    this.email.enabled = true;
    this.email.emailAddress = emailAddress;

    if (!this.mfaEnabled) {
        this.mfaEnabled = true;
    }

    if (!this.primaryMethod) {
        this.primaryMethod = 'email';
    }
};

mfaSetupSchema.methods.disableEmail = function () {
    this.email.enabled = false;
    this.email.emailAddress = null;
    this.email.verificationCode = null;
    this.email.verifiedAt = null;

    if (this.primaryMethod === 'email') {
        const enabledMethods = [];
        if (this.totp.enabled) enabledMethods.push('totp');
        if (this.sms.enabled) enabledMethods.push('sms');
        this.primaryMethod = enabledMethods[0] || null;
    }

    if (!this.totp.enabled && !this.sms.enabled && !this.backup.enabled) {
        this.mfaEnabled = false;
    }
};

mfaSetupSchema.methods.setEmailVerificationCode = function (code, expiryMinutes = 10) {
    this.email.verificationCode = code;
    this.email.verificationCodeExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    this.email.codeAttempts = 0;
    this.email.lastCodeSentAt = new Date();
};

mfaSetupSchema.methods.verifyEmail = function (verifiedAt = new Date()) {
    this.email.verifiedAt = verifiedAt;
    this.email.verificationCode = null;
    this.email.verificationCodeExpiry = null;
    this.addMfaHistory('email_verified', 'email', { status: 'success' });
};

mfaSetupSchema.methods.enableSms = function (phoneNumber) {
    this.sms.enabled = true;
    this.sms.phoneNumber = phoneNumber;
    this.sms.phoneNumberLastFourDigits = phoneNumber.slice(-4);

    if (!this.mfaEnabled) {
        this.mfaEnabled = true;
    }

    if (!this.primaryMethod) {
        this.primaryMethod = 'sms';
    }
};

mfaSetupSchema.methods.disableSms = function () {
    this.sms.enabled = false;
    this.sms.phoneNumber = null;
    this.sms.phoneNumberLastFourDigits = null;
    this.sms.verificationCode = null;
    this.sms.verifiedAt = null;

    if (this.primaryMethod === 'sms') {
        const enabledMethods = [];
        if (this.totp.enabled) enabledMethods.push('totp');
        if (this.email.enabled) enabledMethods.push('email');
        this.primaryMethod = enabledMethods[0] || null;
    }

    if (!this.totp.enabled && !this.email.enabled && !this.backup.enabled) {
        this.mfaEnabled = false;
    }
};

mfaSetupSchema.methods.setSmsVerificationCode = function (code, expiryMinutes = 10) {
    this.sms.verificationCode = code;
    this.sms.verificationCodeExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    this.sms.codeAttempts = 0;
    this.sms.lastCodeSentAt = new Date();
};

mfaSetupSchema.methods.verifySms = function (verifiedAt = new Date()) {
    this.sms.verifiedAt = verifiedAt;
    this.sms.verificationCode = null;
    this.sms.verificationCodeExpiry = null;
    this.addMfaHistory('sms_verified', 'sms', { status: 'success' });
};

mfaSetupSchema.methods.recordBackupCodeUsage = function (code) {
    const backupCode = this.totp.backupCodes.find(bc => bc.code === code);

    if (backupCode && !backupCode.used) {
        backupCode.used = true;
        backupCode.usedAt = new Date();
        this.addMfaHistory('backup_code_used', 'backup', { status: 'success' });
        return true;
    }

    return false;
};

mfaSetupSchema.methods.generateBackupCodes = function (count = 10) {
    const codes = [];

    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push({
            code,
            used: false,
            usedAt: null,
            createdAt: new Date()
        });
    }

    this.backup.codes = codes;
    this.backup.enabled = true;
    this.backup.generatedAt = new Date();

    this.addMfaHistory('backup_codes_generated', 'backup', {
        codeCount: count,
        status: 'success'
    });

    return codes.map(c => c.code);
};

mfaSetupSchema.methods.markBackupCodesDownloaded = function () {
    this.backup.downloadedAt = new Date();
};

mfaSetupSchema.methods.markBackupCodesPrinted = function () {
    this.backup.printedAt = new Date();
};

mfaSetupSchema.methods.addTrustedDevice = function (deviceId, deviceName, deviceInfo, trustToken, expiryDays = 30) {
    const existingDevice = this.trustedDevices.find(d => d.deviceId === deviceId);

    if (existingDevice) {
        existingDevice.trusted = true;
        existingDevice.trustedAt = new Date();
        existingDevice.trustToken = trustToken;
        existingDevice.expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        existingDevice.lastUsedAt = new Date();
    } else {
        this.trustedDevices.push({
            deviceId,
            deviceName,
            deviceType: deviceInfo.deviceType || 'other',
            osInfo: deviceInfo.osInfo,
            browserInfo: deviceInfo.browserInfo,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            trusted: true,
            trustedAt: new Date(),
            trustToken,
            lastUsedAt: new Date(),
            expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        });
    }

    this.addMfaHistory('device_trusted', 'trusted_device', {
        deviceId,
        deviceName
    });
};

mfaSetupSchema.methods.removeTrustedDevice = function (deviceId) {
    this.trustedDevices = this.trustedDevices.filter(d => d.deviceId !== deviceId);

    this.addMfaHistory('device_untrusted', 'trusted_device', {
        deviceId
    });
};

mfaSetupSchema.methods.updateDeviceLastUsed = function (deviceId) {
    const device = this.trustedDevices.find(d => d.deviceId === deviceId);

    if (device) {
        device.lastUsedAt = new Date();
    }
};

mfaSetupSchema.methods.isDeviceTrusted = function (deviceId) {
    const device = this.trustedDevices.find(d => d.deviceId === deviceId);

    if (!device) return false;
    if (!device.trusted) return false;
    if (device.expiresAt && device.expiresAt < new Date()) return false;

    return true;
};

mfaSetupSchema.methods.recordTotpAttempt = function (success = true) {
    if (success) {
        this.totp.failedAttempts = 0;
        this.totp.lastUsedAt = new Date();
    } else {
        this.totp.failedAttempts += 1;
        this.totp.lastFailedAt = new Date();
    }
};

mfaSetupSchema.methods.recordEmailAttempt = function (success = true) {
    if (success) {
        this.email.failedAttempts = 0;
        this.email.lastUsedAt = new Date();
    } else {
        this.email.failedAttempts += 1;
        this.email.lastFailedAt = new Date();
        this.email.codeAttempts += 1;
    }
};

mfaSetupSchema.methods.recordSmsAttempt = function (success = true) {
    if (success) {
        this.sms.failedAttempts = 0;
        this.sms.lastUsedAt = new Date();
    } else {
        this.sms.failedAttempts += 1;
        this.sms.lastFailedAt = new Date();
        this.sms.codeAttempts += 1;
    }
};

mfaSetupSchema.methods.addMfaHistory = function (action, method = null, deviceInfo = {}, status = 'success', reason = '') {
    this.mfaHistory.push({
        action,
        method,
        deviceInfo,
        status,
        reason,
        performedAt: new Date()
    });

    if (this.mfaHistory.length > 5000) {
        this.mfaHistory = this.mfaHistory.slice(-5000);
    }
};

mfaSetupSchema.methods.setAsEnforced = function (enforcementDeadline = null, gracePeriodDays = 7) {
    this.enforementPolicy.isMfaEnforced = true;
    this.enforementPolicy.enforcementLevel = 'mandatory';
    this.enforementPolicy.enforcementDeadline = enforcementDeadline || new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000);
    this.enforementPolicy.enforcementGracePeriod = gracePeriodDays;
};

mfaSetupSchema.methods.markEnforcementNotified = function () {
    this.enforementPolicy.hasBeenNotified = true;
    this.enforementPolicy.notificationSentAt = new Date();
};

mfaSetupSchema.methods.disableMfa = function (disabledBy = null) {
    this.mfaEnabled = false;
    this.status = 'disabled';
    this.totp.enabled = false;
    this.email.enabled = false;
    this.sms.enabled = false;
    this.backup.enabled = false;
    this.primaryMethod = null;

    this.addMfaHistory('mfa_disabled', null, {}, 'success');
};

mfaSetupSchema.methods.addAuditLog = function (action, performedBy, changes = {}, details = '') {
    this.auditLog.push({
        action,
        performedBy,
        timestamp: new Date(),
        changes,
        details
    });

    if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-10000);
    }
};

mfaSetupSchema.methods.cleanupExpiredTrustedDevices = function () {
    const now = new Date();
    const initialCount = this.trustedDevices.length;

    this.trustedDevices = this.trustedDevices.filter(device => {
        if (!device.expiresAt) return true;
        return device.expiresAt > now;
    });

    return initialCount - this.trustedDevices.length;
};

mfaSetupSchema.methods.updateRiskLevel = function (riskFactors = []) {
    this.riskAssessment.riskFactors = riskFactors;
    this.riskAssessment.lastRiskAssessmentAt = new Date();

    if (riskFactors.includes('suspicious_location')) {
        this.riskAssessment.riskLevel = 'high';
    } else if (riskFactors.includes('multiple_failed_attempts')) {
        this.riskAssessment.riskLevel = 'medium';
    } else {
        this.riskAssessment.riskLevel = 'low';
    }
};

mfaSetupSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.status = 'disabled';
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

mfaSetupSchema.statics.getMfaEnabledUsers = function (organizationId) {
    return this.find({ organizationId, mfaEnabled: true });
};

const MfaSetup = mongoose.model('MfaSetup', mfaSetupSchema);

export default MfaSetup;