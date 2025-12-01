import Department from '../models/department.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Team from '../models/team.model.js';
import AccessControl from '../models/accesscontrol.model.js';
import ActivityLog from '../models/activitylog.model.js';
import Invite from '../models/invite.model.js';
import { generateInviteToken, hashToken } from '../utils/token.util.js';
import { sendInviteEmail } from '../services/notification/mail.service.js';

export const createDepartment = async (req, res) => {
    console.log('=== CREATE DEPARTMENT START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { orgId } = req.params;
        const userId = req.user._id;
        const { name, description, parentDepartmentId } = req.body;

        console.log('Validating required fields...');
        if (!name) {
            console.log('Validation failed: Missing department name');
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

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
                message: 'Only admins can create departments'
            });
        }

        let parentDept = null;
        if (parentDepartmentId) {
            console.log('Fetching parent department...');
            parentDept = await Department.findOne({
                _id: parentDepartmentId,
                organizationId: orgId,
                isDeleted: false
            });

            if (!parentDept) {
                console.log('Parent department not found');
                return res.status(404).json({
                    success: false,
                    message: 'Parent department not found'
                });
            }

            console.log('Checking if parent can have sub-departments...');
            if (!parentDept.canCreateSubDepartment()) {
                console.log('Parent department hierarchy limit reached');
                return res.status(400).json({
                    success: false,
                    message: 'Maximum department hierarchy level reached'
                });
            }
        }

        console.log('Creating new department...');
        const department = new Department({
            name: name.trim(),
            description: description || null,
            organizationId: orgId,
            parentDepartmentId: parentDepartmentId || null,
            superAdmin: userId,
            members: [{
                userId: userId,
                role: 'superadmin',
                status: 'active',
                joinedAt: new Date()
            }],
            status: 'active'
        });

        await department.save();
        console.log('Department created successfully:', department._id);

        if (parentDept) {
            console.log('Adding department to parent...');
            parentDept.addSubDepartment(department._id);
            await parentDept.save();
        }

        console.log('Adding department to organization...');
        organization.addDepartment(department._id);
        await organization.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: orgId,
            userId: userId,
            resourceType: 'department',
            resourceId: department._id,
            permission: 'admin',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: department.name,
                resourcePath: `/${organization.name}/${department.name}`
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        department.logActivity('department_created', userId, 'department', department._id, {
            departmentName: department.name,
            parentDepartmentId: parentDepartmentId || null
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: orgId,
            userId: userId,
            action: 'department_created',
            resourceType: 'department',
            resourceId: department._id,
            resourceName: department.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Created department: ${department.name}`
        });

        console.log('=== CREATE DEPARTMENT SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: {
                department: department
            }
        });

    } catch (error) {
        console.error('=== CREATE DEPARTMENT ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

export const getDepartmentById = async (req, res) => {
    console.log('=== GET DEPARTMENT BY ID START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);

    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        })
            .populate('superAdmin', 'firstName lastName email profileImage')
            .populate('admins.userId', 'firstName lastName email profileImage')
            .populate('members.userId', 'firstName lastName email profileImage')
            .populate('parentDepartmentId', 'name')
            .populate('childDepartments', 'name');

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking user membership...');
        if (!department.isMember(userId)) {
            console.log('User is not a member of department');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this department'
            });
        }

        console.log('=== GET DEPARTMENT BY ID SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department retrieved successfully',
            data: {
                department: department
            }
        });

    } catch (error) {
        console.error('=== GET DEPARTMENT BY ID ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department',
            error: error.message
        });
    }
};

export const getDepartmentHierarchy = async (req, res) => {
    console.log('=== GET DEPARTMENT HIERARCHY START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Organization ID:', req.params.orgId);

    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        console.log('Fetching organization...');
        const organization = await Organization.findById(orgId);
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

        console.log('Fetching root departments...');
        const rootDepartments = await Department.find({
            organizationId: orgId,
            parentDepartmentId: null,
            isDeleted: false
        }).populate('childDepartments');

        const buildHierarchy = async (dept) => {
            const children = await Department.find({
                parentDepartmentId: dept._id,
                isDeleted: false
            }).populate('childDepartments');

            return {
                ...dept.toJSON(),
                children: await Promise.all(children.map(child => buildHierarchy(child)))
            };
        };

        const hierarchy = await Promise.all(
            rootDepartments.map(dept => buildHierarchy(dept))
        );

        console.log('=== GET DEPARTMENT HIERARCHY SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department hierarchy retrieved successfully',
            data: {
                hierarchy: hierarchy,
                total: rootDepartments.length
            }
        });

    } catch (error) {
        console.error('=== GET DEPARTMENT HIERARCHY ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department hierarchy',
            error: error.message
        });
    }
};

export const updateDepartment = async (req, res) => {
    console.log('=== UPDATE DEPARTMENT START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { deptId } = req.params;
        const userId = req.user._id;
        const { name, description } = req.body;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update department details'
            });
        }

        console.log('Updating department fields...');
        if (name) department.name = name.trim();
        if (description !== undefined) department.description = description;

        department.lastUpdatedBy = userId;

        console.log('Logging activity...');
        department.logActivity('department_updated', userId, 'department', department._id, {
            updatedFields: Object.keys(req.body)
        });

        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'department_updated',
            resourceType: 'department',
            resourceId: department._id,
            resourceName: department.name,
            actionCategory: 'update',
            severity: 'low',
            details: `Updated department: ${department.name}`
        });

        console.log('=== UPDATE DEPARTMENT SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: {
                department: department
            }
        });

    } catch (error) {
        console.error('=== UPDATE DEPARTMENT ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

export const deleteDepartment = async (req, res) => {
    console.log('=== DELETE DEPARTMENT START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);

    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!department.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can delete department'
            });
        }

        console.log('Soft deleting department...');
        department.softDelete(userId);

        if (department.parentDepartmentId) {
            console.log('Removing from parent department...');
            const parentDept = await Department.findById(department.parentDepartmentId);
            if (parentDept) {
                parentDept.removeSubDepartment(deptId);
                await parentDept.save();
            }
        }

        await department.save();

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'department_deleted',
            resourceType: 'department',
            resourceId: department._id,
            resourceName: department.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Deleted department: ${department.name}`
        });

        console.log('=== DELETE DEPARTMENT SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });

    } catch (error) {
        console.error('=== DELETE DEPARTMENT ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};

export const getDepartmentMembers = async (req, res) => {
    console.log('=== GET DEPARTMENT MEMBERS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Query Params:', req.query);

    try {
        const { deptId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 20, search = '', role, status } = req.query;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking user membership...');
        if (!department.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this department'
            });
        }

        console.log('Building member query...');
        let memberIds = department.members.map(m => m.userId);

        if (role) {
            memberIds = department.members
                .filter(m => m.role === role)
                .map(m => m.userId);
        }

        if (status) {
            memberIds = department.members
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
            const membership = department.members.find(
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

        console.log('=== GET DEPARTMENT MEMBERS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department members retrieved successfully',
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
        console.error('=== GET DEPARTMENT MEMBERS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department members',
            error: error.message
        });
    }
};

export const addDepartmentMember = async (req, res) => {
    console.log('=== ADD DEPARTMENT MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { deptId } = req.params;
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

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
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
        if (department.isMember(memberId)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this department'
            });
        }

        console.log('Adding member to department...');
        department.addMember(memberId, userId, role);
        await department.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: department.organizationId,
            userId: memberId,
            resourceType: 'department',
            resourceId: deptId,
            permission: role === 'admin' || role === 'superadmin' ? 'admin' : 'view',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: department.name,
                resourcePath: `/${department.name}`
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        department.logActivity('department_member_added', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            role: role
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'department_member_added',
            resourceType: 'department',
            resourceId: deptId,
            resourceName: department.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Added ${memberUser.email} as ${role}`
        });

        console.log('=== ADD DEPARTMENT MEMBER SUCCESS ===');
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
        console.error('=== ADD DEPARTMENT MEMBER ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error adding member',
            error: error.message
        });
    }
};

export const removeDepartmentMember = async (req, res) => {
    console.log('=== REMOVE DEPARTMENT MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Member ID:', req.params.memberId);

    try {
        const { deptId, memberId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can remove members'
            });
        }

        console.log('Checking if trying to remove super admin...');
        if (department.isSuperAdmin(memberId)) {
            console.log('Cannot remove super admin');
            return res.status(403).json({
                success: false,
                message: 'Cannot remove department super admin'
            });
        }

        console.log('Checking if member exists...');
        if (!department.isMember(memberId)) {
            console.log('Member not found in department');
            return res.status(404).json({
                success: false,
                message: 'Member not found in department'
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

        console.log('Removing member from department...');
        department.removeMember(memberId);
        await department.save();

        console.log('Revoking access controls...');
        await AccessControl.updateMany(
            {
                organizationId: department.organizationId,
                userId: memberId,
                resourceType: 'department',
                resourceId: deptId,
                isActive: true
            },
            {
                isActive: false,
                revokedAt: new Date(),
                revokedBy: userId,
                revocationReason: 'Member removed from department'
            }
        );

        console.log('Logging activity...');
        department.logActivity('department_member_removed', userId, 'user', memberId, {
            memberName: memberUser.fullName
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'department_member_removed',
            resourceType: 'department',
            resourceId: deptId,
            resourceName: department.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Removed ${memberUser.email} from department`
        });

        console.log('=== REMOVE DEPARTMENT MEMBER SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('=== REMOVE DEPARTMENT MEMBER ERROR ===');
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
    console.log('Department ID:', req.params.deptId);
    console.log('Member ID:', req.params.memberId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { deptId, memberId } = req.params;
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

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update member roles'
            });
        }

        console.log('Checking if trying to update super admin...');
        if (department.isSuperAdmin(memberId)) {
            console.log('Cannot update super admin role');
            return res.status(403).json({
                success: false,
                message: 'Cannot update super admin role'
            });
        }

        console.log('Checking if member exists...');
        const memberIndex = department.members.findIndex(
            m => m.userId.toString() === memberId
        );

        if (memberIndex === -1) {
            console.log('Member not found in department');
            return res.status(404).json({
                success: false,
                message: 'Member not found in department'
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

        console.log('Updating member role...');
        const oldRole = department.members[memberIndex].role;
        department.members[memberIndex].role = role;

        if (role === 'admin') {
            console.log('Adding admin privileges...');
            department.addAdmin(memberId, userId);
        } else {
            console.log('Removing admin privileges if exists...');
            department.removeAdmin(memberId);
        }

        await department.save();

        console.log('Updating access control permission...');
        const accessControl = await AccessControl.findOne({
            organizationId: department.organizationId,
            userId: memberId,
            resourceType: 'department',
            resourceId: deptId,
            isActive: true
        });

        if (accessControl) {
            const newPermission = role === 'admin' || role === 'superadmin' ? 'admin' : 'view';
            accessControl.updatePermission(newPermission, userId, `Role changed from ${oldRole} to ${role}`);
            await accessControl.save();
        }

        console.log('Logging activity...');
        department.logActivity('department_member_role_updated', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            oldRole: oldRole,
            newRole: role
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'department_member_role_updated',
            resourceType: 'department',
            resourceId: deptId,
            resourceName: department.name,
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
    console.log('Department ID:', req.params.deptId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { deptId } = req.params;
        const userId = req.user._id;
        const {
            email,
            role = 'member',
            autoAccessGrant = false,
            autoAccessTeams = [],
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

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can send invitations'
            });
        }

        console.log('Checking if email already invited...');
        const existingInvitation = department.invitations.find(
            inv => inv.email.toLowerCase() === email.toLowerCase() && !inv.accepted
        );

        if (existingInvitation) {
            console.log('Email already has pending invitation');
            return res.status(400).json({
                success: false,
                message: 'This email already has a pending invitation'
            });
        }

        console.log('Generating invite token...');
        const inviteToken = generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        console.log('Creating invitation in department...');
        department.createInvitation(
            email,
            inviteToken,
            expiresAt,
            userId,
            role,
            autoAccessGrant,
            autoAccessTeams,
            autoAccessPermission
        );
        await department.save();

        console.log('Creating Invite document...');
        const invite = new Invite({
            email,
            inviteToken,
            inviteType: 'department',
            organizationId: department.organizationId,
            departmentId: deptId,
            invitedBy: userId,
            invitedAt: new Date(),
            expiresAt,
            role,
            permissions: {
                canManageMembers: role === 'admin',
                canManageTeams: role === 'admin',
                canManageDepartments: false,
                canViewAnalytics: role === 'admin'
            },
            autoAccessGrant,
            autoAccessTeams,
            status: 'pending',
            inviteMetadata: {
                departmentName: department.name,
                senderName: `${req.user.firstName} ${req.user.lastName}`
            }
        });

        await invite.save();

        console.log('Sending invitation email...');
        await sendInviteEmail({
            email,
            inviteToken,
            departmentName: department.name,
            senderName: `${req.user.firstName} ${req.user.lastName}`,
            inviteType: 'department',
            inviteLink: `${process.env.FRONTEND_URL}/invites/${inviteToken}`
        });

        console.log('Logging activity...');
        department.logActivity('department_invitation_created', userId, 'invitation', invite._id, {
            invitedEmail: email,
            role: role
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'invitation_created',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation to ${email}`,
            actionCategory: 'create',
            severity: 'medium',
            details: `Sent invitation to ${email} for department`
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

        console.log('Fetching department...');
        const department = await Department.findById(invite.departmentId);
        if (!department) {
            console.log('Department not found');
            return res.status(404).json({
                success: false,
                message: 'Department not found'
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

        console.log('Adding user to department...');
        department.addMember(userId, invite.invitedBy, invite.role);
        await department.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: department.organizationId,
            userId: userId,
            resourceType: 'department',
            resourceId: department._id,
            permission: invite.role === 'admin' ? 'admin' : 'view',
            grantedBy: invite.invitedBy,
            accessType: 'direct',
            metadata: {
                resourceName: department.name,
                resourcePath: `/${department.name}`
            }
        });
        await accessControl.save();

        console.log('Accepting invitation...');
        invite.accept(userId);
        await invite.save();

        console.log('Granting auto access if enabled...');
        if (invite.autoAccessGrant && invite.autoAccessTeams.length > 0) {
            for (const teamId of invite.autoAccessTeams) {
                const teamAccess = new AccessControl({
                    organizationId: department.organizationId,
                    userId: userId,
                    resourceType: 'team',
                    resourceId: teamId,
                    permission: invite.autoAccessPermission || 'view',
                    grantedBy: invite.invitedBy,
                    accessType: 'inherited',
                    metadata: { inheritedFrom: 'invitation' }
                });
                await teamAccess.save();
            }
        }

        console.log('Logging activity...');
        department.logActivity('department_invitation_accepted', userId, 'invitation', invite._id, {
            acceptedBy: user.email
        });
        await department.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'invitation_accepted',
            resourceType: 'invitation',
            resourceId: invite._id,
            resourceName: `Invitation accepted by ${user.email}`,
            actionCategory: 'create',
            severity: 'medium',
            details: `${user.email} accepted invitation to department`
        });

        console.log('=== ACCEPT INVITATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: {
                department: {
                    departmentId: department._id,
                    departmentName: department.name,
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
            details: `User declined invitation to department`
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

        console.log('Fetching department...');
        const department = await Department.findById(invite.departmentId);
        if (!department) {
            console.log('Department not found');
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
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
            organizationId: department.organizationId,
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
export const getDepartmentInvitations = async (req, res) => {
    console.log('=== GET DEPARTMENT INVITATIONS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Query Params:', req.query);
    try {
        const { deptId } = req.params;
        const userId = req.user._id;
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        console.log('Fetching department...');
        const department = await Department.findById(deptId);
        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!department.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can view invitations'
            });
        }

        const skip = (page - 1) * limit;

        console.log('Fetching invitations...');
        const query = { departmentId: deptId };
        if (status) query.status = status;

        const invitations = await Invite.find(query)
            .populate('invitedBy', 'firstName lastName email')
            .sort({ invitedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invite.countDocuments(query);

        console.log('Invitations found:', invitations.length);

        console.log('=== GET DEPARTMENT INVITATIONS SUCCESS ===');
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
        console.error('=== GET DEPARTMENT INVITATIONS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching invitations',
            error: error.message
        });
    }
};
export const getDepartmentTeams = async (req, res) => {
    console.log('=== GET DEPARTMENT TEAMS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        }).populate('teams');

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking user membership...');
        if (!department.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this department'
            });
        }

        console.log('=== GET DEPARTMENT TEAMS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department teams retrieved successfully',
            data: {
                teams: department.teams,
                total: department.teams.length
            }
        });

    } catch (error) {
        console.error('=== GET DEPARTMENT TEAMS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department teams',
            error: error.message
        });
    }
};
export const getDepartmentAncestors = async (req, res) => {
    console.log('=== GET DEPARTMENT ANCESTORS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking user membership...');
        if (!department.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this department'
            });
        }

        console.log('Fetching ancestors...');
        const ancestors = await department.getAllAncestors();

        console.log('=== GET DEPARTMENT ANCESTORS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department ancestors retrieved successfully',
            data: {
                ancestors: ancestors,
                total: ancestors.length
            }
        });

    } catch (error) {
        console.error('=== GET DEPARTMENT ANCESTORS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department ancestors',
            error: error.message
        });
    }
};
export const getDepartmentDescendants = async (req, res) => {
    console.log('=== GET DEPARTMENT DESCENDANTS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findOne({
            _id: deptId,
            isDeleted: false
        });

        if (!department) {
            console.log('Department not found:', deptId);
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('Checking user membership...');
        if (!department.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this department'
            });
        }

        console.log('Fetching descendants...');
        const descendants = await department.getAllDescendants();

        console.log('=== GET DEPARTMENT DESCENDANTS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Department descendants retrieved successfully',
            data: {
                descendants: descendants,
                total: descendants.length
            }
        });

    } catch (error) {
        console.error('=== GET DEPARTMENT DESCENDANTS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching department descendants',
            error: error.message
        });
    }
};
