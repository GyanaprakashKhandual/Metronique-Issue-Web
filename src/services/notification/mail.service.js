import createTransporter from '../../configs/mail.config.js';
import {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordChangedEmailTemplate,
    getAccountSuspendedEmailTemplate,
    getOrganizationInviteEmailTemplate
} from '../../templates/notification/mail.template.js';

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Metronique Issues'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export const sendVerificationEmail = async (email, firstName, token) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

        const html = getVerificationEmailTemplate(firstName, verificationLink);

        await sendEmail(
            email,
            'Verify Your Email Address',
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send verification email error:', error);
        throw error;
    }
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

        const html = getPasswordResetEmailTemplate(firstName, resetLink);

        await sendEmail(
            email,
            'Password Reset Request',
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send password reset email error:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email, firstName) => {
    try {
        const html = getWelcomeEmailTemplate(firstName);

        await sendEmail(
            email,
            `Welcome to ${process.env.APP_NAME || 'Metronique Issues'}!`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send welcome email error:', error);
        throw error;
    }
};

export const sendPasswordChangedEmail = async (email, firstName) => {
    try {
        const html = getPasswordChangedEmailTemplate(firstName);

        await sendEmail(
            email,
            'Password Changed Successfully',
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send password changed email error:', error);
        throw error;
    }
};

export const sendAccountSuspendedEmail = async (email, firstName, reason) => {
    try {
        const html = getAccountSuspendedEmailTemplate(firstName, reason);

        await sendEmail(
            email,
            'Account Suspended',
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send account suspended email error:', error);
        throw error;
    }
};

export const sendOrganizationInviteEmail = async (email, firstName, organizationName, inviteLink) => {
    try {
        const html = getOrganizationInviteEmailTemplate(firstName, organizationName, inviteLink);

        await sendEmail(
            email,
            `Invitation to join ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send organization invite email error:', error);
        throw error;
    }
};