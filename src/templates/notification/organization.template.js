import { getBaseTemplate } from './base.template.js';

export const getOrganizationCreatedEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Organization Created</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your organization <strong>${organizationName}</strong> has been created successfully!</p>
            <p>You are now the super admin of this organization. You can manage members, projects, teams, and departments.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Next Steps:</strong></p>
                <ul style="margin: 10px 0 0 40px; padding: 0; color: #000000;">
                    <li style="margin-bottom: 8px;">Invite team members</li>
                    <li style="margin-bottom: 8px;">Create your first project</li>
                    <li style="margin-bottom: 8px;">Set up departments and teams</li>
                    <li>Start tracking bugs and requirements</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/organizations" class="button">Manage Organization</a>
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

export const getOrganizationMemberInvitationEmailTemplate = (firstName, organizationName, inviteLink) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Join ${organizationName}</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>You have been invited to join the organization <strong>${organizationName}</strong>.</p>
            <p>Click the button below to accept the invitation and start collaborating:</p>
            
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
            
            <p style="font-size: 13px; color: #000000;">If you didn't expect this invitation, please ignore this email.</p>
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

export const getMemberAddedToOrganizationEmailTemplate = (firstName, organizationName, role) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="26" y2="14"/><line x1="23" y1="11" x2="23" y2="17"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Added to Organization</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>You have been added to the organization <strong>${organizationName}</strong>.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Details:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>Role:</strong> ${role || 'Member'}</p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>Organization:</strong> ${organizationName}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Go to Dashboard</a>
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

export const getMemberRoleUpdatedEmailTemplate = (firstName, organizationName, newRole, oldRole) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Role Updated</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your role in <strong>${organizationName}</strong> has been updated.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Changes:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>Previous Role:</strong> ${oldRole || 'Member'}</p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>New Role:</strong> ${newRole || 'Member'}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Go to Dashboard</a>
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

export const getMemberRemovedFromOrganizationEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Removed from Organization</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>You have been removed from the organization <strong>${organizationName}</strong>.</p>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>If you believe this is a mistake,</strong> please contact the organization admin.</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #000000;">You can still access other organizations you are a member of at any time.</p>
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

export const getAdminAddedEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Admin Privileges Granted</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>You have been promoted to admin in <strong>${organizationName}</strong>.</p>
            <p>You now have administrative privileges and can manage members, projects, and organization settings.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Admin Capabilities:</strong></p>
                <ul style="margin: 10px 0 0 40px; padding: 0; color: #000000;">
                    <li style="margin-bottom: 8px;">Manage organization members</li>
                    <li style="margin-bottom: 8px;">Create and manage projects</li>
                    <li style="margin-bottom: 8px;">Update organization settings</li>
                    <li>View organization activity logs</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Admin Dashboard</a>
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

export const getAdminRemovedEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><line x1="3" y1="3" x2="21" y2="21"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Admin Privileges Removed</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your admin privileges in <strong>${organizationName}</strong> have been revoked.</p>
            <p>You are now a regular member with standard permissions.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Current Privileges:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;">Member with standard permissions</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Go to Dashboard</a>
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

export const getProjectCreatedEmailTemplate = (firstName, projectName, organizationName) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Project Created</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>A new project <strong>${projectName}</strong> has been created in <strong>${organizationName}</strong>.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Next Steps:</strong></p>
                <ul style="margin: 10px 0 0 40px; padding: 0; color: #000000;">
                    <li style="margin-bottom: 8px;">Invite project members</li>
                    <li style="margin-bottom: 8px;">Create project boards</li>
                    <li style="margin-bottom: 8px;">Add bugs and requirements</li>
                    <li>Start tracking issues</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/projects" class="button">View Project</a>
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

export const getInvitationCancelledEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="26" y2="14"/><line x1="23" y1="11" x2="23" y2="17"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Invitation Cancelled</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your invitation to join <strong>${organizationName}</strong> has been cancelled by an administrator.</p>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>If you have questions,</strong> please contact the organization admin.</p>
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

export const getOrganizationDeletedEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <polyline points="3 6 5 4 21 4 23 6 23 20a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Organization Deleted</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>The organization <strong>${organizationName}</strong> has been permanently deleted.</p>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>All data associated with this organization has been removed.</strong></p>
            </div>
            
            <p style="margin-top: 15px; color: #000000;">If you believe this was done in error or have any questions, please contact our support team.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support" class="button">Contact Support</a>
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

export const getSettingsUpdatedEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Settings Updated</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>The settings for <strong>${organizationName}</strong> have been updated by an administrator.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Updated Settings:</strong></p>
                <ul style="margin: 10px 0 0 40px; padding: 0; color: #000000;">
                    <li style="margin-bottom: 8px;">Organization preferences</li>
                    <li style="margin-bottom: 8px;">Access control policies</li>
                    <li>Collaboration settings</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">View Settings</a>
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

export const getIntegrationConnectedEmailTemplate = (firstName, organizationName, integrationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Integration Connected</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p><strong>${integrationName}</strong> has been successfully connected to <strong>${organizationName}</strong>.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Connected Integration:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000; text-transform: capitalize;">${integrationName}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/integrations" class="button">Manage Integrations</a>
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

export const getIntegrationDisconnectedEmailTemplate = (firstName, organizationName, integrationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <line x1="3" y1="3" x2="21" y2="21"/><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4m0-18v18m6-18h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Integration Disconnected</h1>
        </div>
        <div class="email-body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p><strong>${integrationName}</strong> has been disconnected from <strong>${organizationName}</strong>.</p>
            
            <div class="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #22c55e;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Disconnected Integration:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000; text-transform: capitalize;">${integrationName}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/integrations" class="button">Manage Integrations</a>
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

export const getMemberLeftOrganizationEmailTemplate = (firstName, organizationName) => {
    const content = `
        <div class="email-header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <h1 style="margin: 0; color: #ffffff;">Member Left Organization</h1>
        </div>
        <div class="email-body">
            <p>Hi Organization Admin,</p>
            <p>A member has left <strong>${organizationName}</strong>.</p>
            
            <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px; vertical-align: middle; color: #1e40af;">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="26" y2="14"/><line x1="23" y1="11" x2="23" y2="17"/>
                </svg>
                <p style="margin: 0; color: #000000; display: inline;"><strong>Member Details:</strong></p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>Name:</strong> ${firstName}</p>
                <p style="margin: 5px 0 0 0; color: #000000;"><strong>Organization:</strong> ${organizationName}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/app" class="button">Go to Dashboard</a>
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