import createTransporter from '../../configs/mail.config.js';
import {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordChangedEmailTemplate,
    getAccountSuspendedEmailTemplate,
    getOrganizationInviteEmailTemplate,
    getOrganizationCreatedEmailTemplate,
    getOrganizationMemberInvitationEmailTemplate,
    getMemberAddedToOrganizationEmailTemplate,
    getMemberRoleUpdatedEmailTemplate,
    getMemberRemovedFromOrganizationEmailTemplate,
    getAdminAddedEmailTemplate,
    getAdminRemovedEmailTemplate,
    getProjectCreatedEmailTemplate,
    getInvitationCancelledEmailTemplate
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
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

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
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

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

export const sendOrganizationCreatedEmail = async (email, firstName, organizationName) => {
    try {
        const html = getOrganizationCreatedEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Organization Created: ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send organization created email error:', error);
        throw error;
    }
};

export const sendOrganizationMemberInvitationEmail = async (email, firstName, organizationName, inviteLink) => {
    try {
        const html = getOrganizationMemberInvitationEmailTemplate(firstName, organizationName, inviteLink);

        await sendEmail(
            email,
            `Join ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send organization member invitation email error:', error);
        throw error;
    }
};

export const sendMemberAddedToOrganizationEmail = async (email, firstName, organizationName, role) => {
    try {
        const html = getMemberAddedToOrganizationEmailTemplate(firstName, organizationName, role);

        await sendEmail(
            email,
            `You've been added to ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send member added email error:', error);
        throw error;
    }
};

export const sendMemberRoleUpdatedEmail = async (email, firstName, organizationName, newRole, oldRole) => {
    try {
        const html = getMemberRoleUpdatedEmailTemplate(firstName, organizationName, newRole, oldRole);

        await sendEmail(
            email,
            `Role Updated in ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send member role updated email error:', error);
        throw error;
    }
};

export const sendMemberRemovedFromOrganizationEmail = async (email, firstName, organizationName) => {
    try {
        const html = getMemberRemovedFromOrganizationEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Removed from ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send member removed email error:', error);
        throw error;
    }
};

export const sendAdminAddedEmail = async (email, firstName, organizationName) => {
    try {
        const html = getAdminAddedEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Admin Privileges Granted in ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send admin added email error:', error);
        throw error;
    }
};

export const sendAdminRemovedEmail = async (email, firstName, organizationName) => {
    try {
        const html = getAdminRemovedEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Admin Privileges Removed from ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send admin removed email error:', error);
        throw error;
    }
};

export const sendProjectCreatedEmail = async (email, firstName, projectName, organizationName) => {
    try {
        const html = getProjectCreatedEmailTemplate(firstName, projectName, organizationName);

        await sendEmail(
            email,
            `New Project Created: ${projectName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send project created email error:', error);
        throw error;
    }
};

export const sendInvitationCancelledEmail = async (email, firstName, organizationName) => {
    try {
        const html = getInvitationCancelledEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Invitation Cancelled for ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send invitation cancelled email error:', error);
        throw error;
    }
};

export const sendOrganizationDeletedEmail = async (email, firstName, organizationName) => {
    try {
        const html = getOrganizationDeletedEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Organization Deleted: ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send organization deleted email error:', error);
        throw error;
    }
};

export const sendSettingsUpdatedEmail = async (email, firstName, organizationName) => {
    try {
        const html = getSettingsUpdatedEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Settings Updated in ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send settings updated email error:', error);
        throw error;
    }
};

export const sendIntegrationConnectedEmail = async (email, firstName, organizationName, integrationName) => {
    try {
        const html = getIntegrationConnectedEmailTemplate(firstName, organizationName, integrationName);

        await sendEmail(
            email,
            `${integrationName} Connected to ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send integration connected email error:', error);
        throw error;
    }
};

export const sendIntegrationDisconnectedEmail = async (email, firstName, organizationName, integrationName) => {
    try {
        const html = getIntegrationDisconnectedEmailTemplate(firstName, organizationName, integrationName);

        await sendEmail(
            email,
            `${integrationName} Disconnected from ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send integration disconnected email error:', error);
        throw error;
    }
};

export const sendMemberLeftOrganizationEmail = async (email, firstName, organizationName) => {
    try {
        const html = getMemberLeftOrganizationEmailTemplate(firstName, organizationName);

        await sendEmail(
            email,
            `Member Left ${organizationName}`,
            html
        );

        return { success: true };
    } catch (error) {
        console.error('Send member left email error:', error);
        throw error;
    }
};