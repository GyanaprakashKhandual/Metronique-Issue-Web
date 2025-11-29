import { getBaseTemplate } from './base.template.js';

export const getVerificationEmailTemplate = (firstName, verificationLink) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Verify Your Email</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Thank you for signing up! We're excited to have you on board.</p>
            <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; color: #000000;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                <p class="link-text" style="margin-top: 10px;">${verificationLink}</p>
            </div>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>This link will expire in 24 hours.</strong></p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #000000;">If you didn't create an account, please ignore this email or contact our support team if you have concerns.</p>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};

export const getPasswordResetEmailTemplate = (firstName, resetLink) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Password Reset Request</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; color: #000000;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                <p class="link-text" style="margin-top: 10px;">${resetLink}</p>
            </div>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>This link will expire in 1 hour.</strong></p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #000000;"><strong>Important:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.</p>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};

export const getWelcomeEmailTemplate = (firstName) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M11 15H7a4 4 0 0 0-4 4v2h14v-2a4 4 0 0 0-4-4h-4zM7 4a4 4 0 0 1 0 8 4 4 0 0 1 0-8z"/><path d="M15.5 1h5v5M20 6l-5-5"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Welcome to ${process.env.APP_NAME || 'Bug Tracker'}!</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your email has been verified successfully! Welcome to our platform.</p>
            <p>You're now ready to start tracking bugs, managing projects, and collaborating with your team.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Quick Start Guide:</strong></p>
                <ul style="margin: 10px 0 0 40px; padding: 0; color: #000000;">
                    <li style="margin-bottom: 8px;">Create or join an organization</li>
                    <li style="margin-bottom: 8px;">Set up your first project</li>
                    <li style="margin-bottom: 8px;">Invite team members</li>
                    <li>Start tracking bugs and requirements</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Get Started</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #000000;">Need help getting started? Check out our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/docs" style="color: #22c55e; text-decoration: none;">documentation</a> or contact our support team.</p>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};

export const getPasswordChangedEmailTemplate = (firstName) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M10 17l2 2 4-4"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Password Changed</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>This is a confirmation that your password has been changed successfully.</p>
            
            <div class="info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Change Details:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;">Date & Time: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Didn't make this change?</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;">If you didn't change your password, please contact our support team immediately and secure your account.</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support" class="button">Contact Support</a>
            </div>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};

export const getAccountSuspendedEmailTemplate = (firstName, reason) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Account Suspended</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your account has been temporarily suspended.</p>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Reason:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;">${reason || 'Violation of terms of service'}</p>
            </div>
            
            <p style="color: #000000;">If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support" class="button">Contact Support</a>
            </div>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};

export const getOrganizationInviteEmailTemplate = (firstName, organizationName, inviteLink) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Organization Invitation</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>You have been invited to join <strong>${organizationName}</strong>.</p>
            <p>Click the button below to accept the invitation:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; color: #000000;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                <p class="link-text" style="margin-top: 10px;">${inviteLink}</p>
            </div>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>This invitation will expire in 7 days.</strong></p>
            </div>
            
            <div class="divider"></div>
        </div>
        <div class="email-footer">
            <p style="color: #000000;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Bug Tracker'}. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit our website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
            </p>
        </div>
    `;

    return getBaseTemplate(content);
};