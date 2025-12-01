import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';
import Department from '../models/department.model.js';
import Team from '../models/team.model.js';
import Project from '../models/project.model.js';
import AccessControl from '../models/accesscontrol.model.js';
import ActivityLog from '../models/activitylog.model.js';
import Invite from '../models/invite.model.js';
import { generateToken } from '../utils/jwt.util.js';
import { generateInviteToken, hashToken } from '../utils/token.util.js';
import { sendInviteEmail } from '../services/notification/mail.service.js';

export const createOrganization = async (req, res) => {
    console.log('=== CREATE ORGANIZATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { name, description, website, industry, size, country, city, address } = req.body;
        const userId = req.user._id;

        console.log('Validating required fields...');
        if (!name) {
            console.log('Validation failed: Missing organization name');
            return res.status(400).json({
                success: false,
                message: 'Organization name is required'
            });
        }

        console.log('Checking if organization name already exists...');
        const existingOrg = await Organization.findOne({
            name: name.trim(),
            isDeleted: false
        });

        if (existingOrg) {
            console.log('Organization name already exists:', name);
            return res.status(400).json({
                success: false,
                message: 'Organization with this name already exists'
            });
        }

        console.log('Fetching user details...');
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Creating new organization...');
        const organization = new Organization({
            name: name.trim(),
            description: description || null,
            website: website || null,
            industry: industry || null,
            size: size || 'small',
            country: country || null,
            city: city || null,
            address: address || null,
            superAdmin: userId,
            members: [{
                userId: userId,
                role: 'superadmin',
                status: 'active',
                joinedAt: new Date()
            }],
            status: 'active'
        });

        await organization.save();
        console.log('Organization created successfully:', organization._id);

        console.log('Adding organization membership to user...');
        user.addOrganizationMembership(organization._id, 'superadmin');
        await user.save();

        console.log('Creating access control for organization...');
        const accessControl = new AccessControl({
            organizationId: organization._id,
            userId: userId,
            resourceType: 'organization',
            resourceId: organization._id,
            permission: 'admin',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: organization.name,
                resourcePath: `/${organization.name}`
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        organization.logActivity('organization_created', userId, 'organization', organization._id, {
            organizationName: organization.name
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: organization._id,
            userId: userId,
            action: 'organization_created',
            resourceType: 'organization',
            resourceId: organization._id,
            resourceName: organization.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Created organization: ${organization.name}`
        });

        console.log('=== CREATE ORGANIZATION SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: {
                organization: organization
            }
        });

    } catch (error) {
        console.error('=== CREATE ORGANIZATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error creating organization',
            error: error.message
        });
    }
};

export const getOrganizationById = async (req, res) => {
    console.log('=== GET ORGANIZATION BY ID START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);

    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        })
            .populate('superAdmin', 'firstName lastName email profileImage')
            .populate('admins.userId', 'firstName lastName email profileImage')
            .populate('members.userId', 'firstName lastName email profileImage');

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking user membership...');
        if (!organization.isMember(userId)) {
            console.log('User is not a member of organization');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this organization'
            });
        }

        console.log('=== GET ORGANIZATION BY ID SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Organization retrieved successfully',
            data: {
                organization: organization
            }
        });

    } catch (error) {
        console.error('=== GET ORGANIZATION BY ID ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching organization',
            error: error.message
        });
    }
};

export const getUserOrganizations = async (req, res) => {
    console.log('=== GET USER ORGANIZATIONS START ===');
    console.log('Request User ID:', req.user?._id);

    try {
        const userId = req.user._id;

        console.log('Fetching user...');
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Fetching user organizations...');
        const organizationIds = user.organizationMemberships.map(m => m.organizationId);

        const organizations = await Organization.find({
            _id: { $in: organizationIds },
            isDeleted: false
        })
            .populate('superAdmin', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 });

        console.log('Organizations found:', organizations.length);

        const organizationsWithRole = organizations.map(org => {
            const membership = user.organizationMemberships.find(
                m => m.organizationId.toString() === org._id.toString()
            );

            return {
                ...org.toJSON(),
                userRole: membership?.role || 'member',
                userStatus: membership?.status || 'active'
            };
        });

        console.log('=== GET USER ORGANIZATIONS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Organizations retrieved successfully',
            data: {
                organizations: organizationsWithRole,
                total: organizationsWithRole.length
            }
        });

    } catch (error) {
        console.error('=== GET USER ORGANIZATIONS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching organizations',
            error: error.message
        });
    }
};

export const updateOrganization = async (req, res) => {
    console.log('=== UPDATE ORGANIZATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const { name, description, website, industry, size, country, city, address, logo, banner } = req.body;

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update organization details'
            });
        }

        console.log('Updating organization fields...');
        if (name && name.trim() !== organization.name) {
            const existingOrg = await Organization.findOne({
                name: name.trim(),
                _id: { $ne: orgId },
                isDeleted: false
            });

            if (existingOrg) {
                console.log('Organization name already exists:', name);
                return res.status(400).json({
                    success: false,
                    message: 'Organization with this name already exists'
                });
            }

            organization.name = name.trim();
        }

        if (description !== undefined) organization.description = description;
        if (website !== undefined) organization.website = website;
        if (industry !== undefined) organization.industry = industry;
        if (size !== undefined) organization.size = size;
        if (country !== undefined) organization.country = country;
        if (city !== undefined) organization.city = city;
        if (address !== undefined) organization.address = address;
        if (logo !== undefined) organization.logo = logo;
        if (banner !== undefined) organization.banner = banner;

        organization.lastUpdatedBy = userId;

        console.log('Logging activity...');
        organization.logActivity('organization_updated', userId, 'organization', organization._id, {
            updatedFields: Object.keys(req.body)
        });

        await organization.save();

        await ActivityLog.createLog({
            organizationId: organization._id,
            userId: userId,
            action: 'organization_updated',
            resourceType: 'organization',
            resourceId: organization._id,
            resourceName: organization.name,
            actionCategory: 'update',
            severity: 'low',
            details: `Updated organization: ${organization.name}`
        });

        console.log('=== UPDATE ORGANIZATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: {
                organization: organization
            }
        });

    } catch (error) {
        console.error('=== UPDATE ORGANIZATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating organization',
            error: error.message
        });
    }
};

export const deleteOrganization = async (req, res) => {
    console.log('=== DELETE ORGANIZATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);

    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!organization.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can delete organization'
            });
        }

        console.log('Soft deleting organization...');
        organization.softDelete(userId);
        await organization.save();

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: organization._id,
            userId: userId,
            action: 'organization_deleted',
            resourceType: 'organization',
            resourceId: organization._id,
            resourceName: organization.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Deleted organization: ${organization.name}`
        });

        console.log('=== DELETE ORGANIZATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Organization deleted successfully'
        });

    } catch (error) {
        console.error('=== DELETE ORGANIZATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error deleting organization',
            error: error.message
        });
    }
};

export const getOrganizationMembers = async (req, res) => {
    console.log('=== GET ORGANIZATION MEMBERS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Query Params:', req.query);

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 20, search = '', role, status } = req.query;

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking user membership...');
        if (!organization.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this organization'
            });
        }

        console.log('Building member query...');
        let memberIds = organization.members.map(m => m.userId);

        if (role) {
            memberIds = organization.members
                .filter(m => m.role === role)
                .map(m => m.userId);
        }

        if (status) {
            memberIds = organization.members
                .filter(m => m.status === status)
                .map(m => m.userId);
        }

        const query = {
            _id: { $in: memberIds },
            isDeleted: false
        };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        console.log('Fetching members...');
        const members = await User.find(query)
            .select('firstName lastName email phone profileImage status isEmailVerified createdAt lastLogin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        const membersWithRole = members.map(member => {
            const membership = organization.members.find(
                m => m.userId.toString() === member._id.toString()
            );

            return {
                ...member.toJSON(),
                role: membership?.role || 'member',
                memberStatus: membership?.status || 'active',
                joinedAt: membership?.joinedAt,
                invitedBy: membership?.invitedBy
            };
        });

        console.log('Members found:', membersWithRole.length);

        console.log('=== GET ORGANIZATION MEMBERS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Organization members retrieved successfully',
            data: {
                members: membersWithRole,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalMembers: total,
                    hasMore: skip + members.length < total
                }
            }
        });

    } catch (error) {
        console.error('=== GET ORGANIZATION MEMBERS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching organization members',
            error: error.message
        });
    }
};

export const addOrganizationMember = async (req, res) => {
    console.log('=== ADD ORGANIZATION MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const { memberId, role = 'member' } = req.body;

        console.log('Validating required fields...');
        if (!memberId) {
            console.log('Validation failed: Missing memberId');
            return res.status(400).json({
                success: false,
                message: 'Member ID is required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can add members'
            });
        }

        console.log('Fetching member user...');
        const memberUser = await User.findById(memberId);
        if (!memberUser) {
            console.log('Member user not found:', memberId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Checking if user is already a member...');
        if (organization.isMember(memberId)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this organization'
            });
        }

        console.log('Adding member to organization...');
        organization.addMember(memberId, userId, role);
        await organization.save();

        console.log('Adding organization membership to user...');
        memberUser.addOrganizationMembership(orgId, role);
        await memberUser.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: orgId,
            userId: memberId,
            resourceType: 'organization',
            resourceId: orgId,
            permission: role === 'admin' || role === 'superadmin' ? 'admin' : 'view',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: organization.name,
                resourcePath: `/${organization.name}`
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        organization.logActivity('organization_member_added', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            role: role
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: orgId,
            userId: userId,
            action: 'organization_member_added',
            resourceType: 'organization',
            resourceId: orgId,
            resourceName: organization.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Added ${memberUser.email} as ${role}`
        });

        console.log('=== ADD ORGANIZATION MEMBER SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: {
                member: {
                    userId: memberUser._id,
                    email: memberUser.email,
                    firstName: memberUser.firstName,
                    lastName: memberUser.lastName,
                    role: role
                }
            }
        });

    } catch (error) {
        console.error('=== ADD ORGANIZATION MEMBER ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error adding member',
            error: error.message
        });
    }
};

export const removeOrganizationMember = async (req, res) => {
    console.log('=== REMOVE ORGANIZATION MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Member ID:', req.params.memberId);

    try {
        const { orgId, memberId } = req.params;
        const userId = req.user._id;

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can remove members'
            });
        }

        console.log('Checking if trying to remove super admin...');
        if (organization.isSuperAdmin(memberId)) {
            console.log('Cannot remove super admin');
            return res.status(403).json({
                success: false,
                message: 'Cannot remove organization super admin'
            });
        }

        console.log('Checking if member exists...');
        if (!organization.isMember(memberId)) {
            console.log('Member not found in organization');
            return res.status(404).json({
                success: false,
                message: 'Member not found in organization'
            });
        }

        console.log('Fetching member user...');
        const memberUser = await User.findById(memberId);
        if (!memberUser) {
            console.log('Member user not found:', memberId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Removing member from organization...');
        organization.removeMember(memberId);
        await organization.save();

        console.log('Removing organization membership from user...');
        memberUser.organizationMemberships = memberUser.organizationMemberships.filter(
            m => m.organizationId.toString() !== orgId
        );
        await memberUser.save();

        console.log('Revoking access controls...');
        await AccessControl.updateMany(
            {
                organizationId: orgId,
                userId: memberId,
                isActive: true
            },
            {
                isActive: false,
                revokedAt: new Date(),
                revokedBy: userId,
                revocationReason: 'Member removed from organization'
            }
        );

        console.log('Logging activity...');
        organization.logActivity('organization_member_removed', userId, 'user', memberId, {
            memberName: memberUser.fullName
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: orgId,
            userId: userId,
            action: 'organization_member_removed',
            resourceType: 'organization',
            resourceId: orgId,
            resourceName: organization.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Removed ${memberUser.email} from organization`
        });

        console.log('=== REMOVE ORGANIZATION MEMBER SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('=== REMOVE ORGANIZATION MEMBER ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error removing member',
            error: error.message
        });
    }
};

export const updateMemberRole = async (req, res) => {
    console.log('=== UPDATE MEMBER ROLE START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Member ID:', req.params.memberId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { orgId, memberId } = req.params;
        const userId = req.user._id;
        const { role } = req.body;

        console.log('Validating required fields...');
        if (!role) {
            console.log('Validation failed: Missing role');
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update member roles'
            });
        }

        console.log('Checking if trying to update super admin...');
        if (organization.isSuperAdmin(memberId)) {
            console.log('Cannot update super admin role');
            return res.status(403).json({
                success: false,
                message: 'Cannot update super admin role'
            });
        }

        console.log('Checking if member exists...');
        const memberIndex = organization.members.findIndex(
            m => m.userId.toString() === memberId
        );

        if (memberIndex === -1) {
            console.log('Member not found in organization');
            return res.status(404).json({
                success: false,
                message: 'Member not found in organization'
            });
        }

        console.log('Fetching member user...');
        const memberUser = await User.findById(memberId);
        if (!memberUser) {
            console.log('Member user not found:', memberId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Updating member role in organization...');
        const oldRole = organization.members[memberIndex].role;
        organization.members[memberIndex].role = role;

        if (role === 'admin') {
            console.log('Adding admin privileges...');
            organization.addAdmin(memberId, userId);
        } else {
            console.log('Removing admin privileges if exists...');
            organization.removeAdmin(memberId);
        }

        await organization.save();

        console.log('Updating user organization membership...');
        const membershipIndex = memberUser.organizationMemberships.findIndex(
            m => m.organizationId.toString() === orgId
        );

        if (membershipIndex !== -1) {
            memberUser.organizationMemberships[membershipIndex].role = role;
            await memberUser.save();
        }

        console.log('Updating access control permission...');
        const accessControl = await AccessControl.findOne({
            organizationId: orgId,
            userId: memberId,
            resourceType: 'organization',
            resourceId: orgId,
            isActive: true
        });

        if (accessControl) {
            const newPermission = role === 'admin' || role === 'superadmin' ? 'admin' : 'view';
            accessControl.updatePermission(newPermission, userId, `Role changed from ${oldRole} to ${role}`);
            await accessControl.save();
        }

        console.log('Logging activity...');
        organization.logActivity('organization_member_role_updated', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            oldRole: oldRole,
            newRole: role
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: orgId,
            userId: userId,
            action: 'organization_member_role_updated',
            resourceType: 'organization',
            resourceId: orgId,
            resourceName: organization.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Updated ${memberUser.email} role from ${oldRole} to ${role}`
        });

        console.log('=== UPDATE MEMBER ROLE SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            data: {
                member: {
                    userId: memberUser._id,
                    email: memberUser.email,
                    firstName: memberUser.firstName,
                    lastName: memberUser.lastName,
                    oldRole: oldRole,
                    newRole: role
                }
            }
        });

    } catch (error) {
        console.error('=== UPDATE MEMBER ROLE ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating member role',
            error: error.message
        });
    }
};

export const createInvitation = async (req, res) => {
    console.log('=== CREATE INVITATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const {
            email,
            role = 'member',
            autoAccessGrant = false,
            autoAccessProjects = [],
            autoAccessPermission = 'view'
        } = req.body;

        console.log('Validating required fields...');
        if (!email) {
            console.log('Validation failed: Missing email');
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findOne({
            _id: orgId,
            isDeleted: false
        });

        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can send invitations'
            });
        }

        console.log('Checking if email already invited...');
        const existingInvitation = organization.invitations.find(
            inv => inv.email.toLowerCase() === email.toLowerCase() && !inv.accepted
        );

        if (existingInvitation) {
            console.log('Email already has pending invitation');
            return res.status(400).json({
                success: false,
                message: 'This email already has a pending invitation'
            });
        }

        console.log('Checking if user already member...');
        const existingMember = await User.findOne({ email: email.toLowerCase() });
        if (existingMember && organization.isMember(existingMember._id)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this organization'
            });
        }

        console.log('Generating invite token...');
        const inviteToken = generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        console.log('Creating invitation in organization...');
        organization.createInvitation(
            email,
            inviteToken,
            expiresAt,
            userId,
            role,
            autoAccessGrant,
            autoAccessProjects,
            autoAccessPermission
        );
        await organization.save();

        console.log('Creating Invite document...');
        const invite = new Invite({
            email,
            inviteToken,
            inviteType: 'organization',
            organizationId: orgId,
            invitedBy: userId,
            invitedAt: new Date(),
            expiresAt,
            role,
            permissions: {
                canManageMembers: role === 'admin',
                canManageDepartments: role === 'admin',
                canManageTeams: role === 'admin',
                canManageProjects: role === 'admin',
                canViewAnalytics: role === 'admin'
            },
            autoAccessGrant,
            autoAccessProjects,
            status: 'pending',
            inviteMetadata: {
                organizationName: organization.name,
                senderName: `${req.user.firstName} ${req.user.lastName}`
            }
        });

        await invite.save();

        console.log('Sending invitation email...');
        await sendInviteEmail({
            email,
            inviteToken,
            organizationName: organization.name,
            senderName: `${req.user.firstName} ${req.user.lastName}`,
            inviteType: 'organization',
            inviteLink: `${process.env.FRONTEND_URL}/invites/${inviteToken}`
        });

        console.log('Logging activity...');
        organization.logActivity('organization_invitation_created', userId, 'invitation', invite._id, {
            invitedEmail: email,
            role: role
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: orgId,
            userId: userId,
            action: 'invitation_created',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation to ${email}`,
            actionCategory: 'create',
            severity: 'medium',
            details: `Sent invitation to ${email} for organization`
        });

        console.log('=== CREATE INVITATION SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                invite: {
                    inviteId: invite._id,
                    email: invite.email,
                    role: invite.role,
                    expiresAt: invite.expiresAt,
                    status: invite.status
                }
            }
        });

    } catch (error) {
        console.error('=== CREATE INVITATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error creating invitation',
            error: error.message
        });
    }
};

export const acceptInvitation = async (req, res) => {
    console.log('=== ACCEPT INVITATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const userId = req.user._id;
        const { inviteToken } = req.body;

        console.log('Validating required fields...');
        if (!inviteToken) {
            console.log('Validation failed: Missing inviteToken');
            return res.status(400).json({
                success: false,
                message: 'Invite token is required'
            });
        }

        console.log('Finding invite...');
        const invite = await Invite.findByToken(inviteToken);

        if (!invite) {
            console.log('Invite not found');
            return res.status(404).json({
                success: false,
                message: 'Invalid invitation'
            });
        }

        console.log('Checking if invite is valid...');
        if (!invite.isValid()) {
            console.log('Invite is not valid:', invite.status);
            return res.status(400).json({
                success: false,
                message: `Invitation is ${invite.status}`
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(invite.organizationId);
        if (!organization) {
            console.log('Organization not found');
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Fetching user...');
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Adding user to organization...');
        organization.addMember(userId, invite.invitedBy, invite.role);
        await organization.save();

        console.log('Adding organization membership to user...');
        user.addOrganizationMembership(organization._id, invite.role);
        await user.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: organization._id,
            userId: userId,
            resourceType: 'organization',
            resourceId: organization._id,
            permission: invite.role === 'admin' ? 'admin' : 'view',
            grantedBy: invite.invitedBy,
            accessType: 'direct',
            metadata: {
                resourceName: organization.name,
                resourcePath: `/${organization.name}`
            }
        });
        await accessControl.save();

        console.log('Accepting invitation...');
        invite.accept(userId);
        await invite.save();

        console.log('Granting auto access if enabled...');
        if (invite.autoAccessGrant && invite.autoAccessProjects.length > 0) {
            for (const projectId of invite.autoAccessProjects) {
                const projectAccess = new AccessControl({
                    organizationId: organization._id,
                    userId: userId,
                    resourceType: 'project',
                    resourceId: projectId,
                    permission: invite.autoAccessPermission || 'view',
                    grantedBy: invite.invitedBy,
                    accessType: 'inherited',
                    metadata: { inheritedFrom: 'invitation' }
                });
                await projectAccess.save();
            }
        }

        console.log('Logging activity...');
        organization.logActivity('organization_invitation_accepted', userId, 'invitation', invite._id, {
            acceptedBy: user.email
        });
        await organization.save();

        await ActivityLog.createLog({
            organizationId: organization._id,
            userId: userId,
            action: 'invitation_accepted',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation accepted by ${user.email}`,
            actionCategory: 'create',
            severity: 'medium',
            details: `${user.email} accepted invitation to organization`
        });

        console.log('=== ACCEPT INVITATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: {
                organization: {
                    organizationId: organization._id,
                    organizationName: organization.name,
                    userRole: invite.role
                }
            }
        });

    } catch (error) {
        console.error('=== ACCEPT INVITATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error accepting invitation',
            error: error.message
        });
    }
};

export const rejectInvitation = async (req, res) => {
    console.log('=== REJECT INVITATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const userId = req.user._id;
        const { inviteToken, reason = '' } = req.body;

        console.log('Validating required fields...');
        if (!inviteToken) {
            console.log('Validation failed: Missing inviteToken');
            return res.status(400).json({
                success: false,
                message: 'Invite token is required'
            });
        }

        console.log('Finding invite...');
        const invite = await Invite.findByToken(inviteToken);

        if (!invite) {
            console.log('Invite not found');
            return res.status(404).json({
                success: false,
                message: 'Invalid invitation'
            });
        }

        console.log('Rejecting invitation...');
        const rejected = invite.reject(userId, reason);

        if (!rejected) {
            console.log('Invitation cannot be rejected');
            return res.status(400).json({
                success: false,
                message: 'This invitation cannot be rejected'
            });
        }

        await invite.save();

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: invite.organizationId,
            userId: userId,
            action: 'invitation_declined',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation declined`,
            actionCategory: 'delete',
            severity: 'low',
            details: `User declined invitation to organization`
        });

        console.log('=== REJECT INVITATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitation rejected successfully'
        });

    } catch (error) {
        console.error('=== REJECT INVITATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error rejecting invitation',
            error: error.message
        });
    }
};

export const cancelInvitation = async (req, res) => {
    console.log('=== CANCEL INVITATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Invite ID:', req.params.inviteId);

    try {
        const userId = req.user._id;
        const { inviteId } = req.params;

        console.log('Fetching invite...');
        const invite = await Invite.findById(inviteId);

        if (!invite) {
            console.log('Invite not found:', inviteId);
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        console.log('Fetching organization...');
        const organization = await Organization.findById(invite.organizationId);
        if (!organization) {
            console.log('Organization not found');
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can cancel invitations'
            });
        }

        console.log('Revoking invitation...');
        const revoked = invite.revoke(userId, 'Invitation cancelled by admin');

        if (!revoked) {
            console.log('Invitation cannot be revoked');
            return res.status(400).json({
                success: false,
                message: 'This invitation cannot be cancelled'
            });
        }

        await invite.save();

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: organization._id,
            userId: userId,
            action: 'invitation_cancelled',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation to ${invite.email} cancelled`,
            actionCategory: 'delete',
            severity: 'medium',
            details: `Cancelled invitation for ${invite.email}`
        });

        console.log('=== CANCEL INVITATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitation cancelled successfully'
        });

    } catch (error) {
        console.error('=== CANCEL INVITATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error cancelling invitation',
            error: error.message
        });
    }
};

export const getOrganizationInvitations = async (req, res) => {
    console.log('=== GET ORGANIZATION INVITATIONS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Query Params:', req.query);

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        console.log('Fetching organization...');
        const organization = await Organization.findById(orgId);
        if (!organization) {
            console.log('Organization not found:', orgId);
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!organization.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can view invitations'
            });
        }

        const skip = (page - 1) * limit;

        console.log('Fetching invitations...');
        const query = { organizationId: orgId };
        if (status) query.status = status;

        const invitations = await Invite.find(query)
            .populate('invitedBy', 'firstName lastName email')
            .sort({ invitedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invite.countDocuments(query);

        console.log('Invitations found:', invitations.length);

        console.log('=== GET ORGANIZATION INVITATIONS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitations retrieved successfully',
            data: {
                invitations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalInvitations: total,
                    hasMore: skip + invitations.length < total
                }
            }
        });

    } catch (error) {
        console.error('=== GET ORGANIZATION INVITATIONS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching invitations',
            error: error.message
        });
    }
};