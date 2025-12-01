import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Department from '../models/department.model.js';
import AccessControl from '../models/accesscontrol.model.js';
import ActivityLog from '../models/activitylog.model.js';
import Invite from '../models/invite.model.js';
import { generateInviteToken } from '../utils/token.util.js';
import { sendInviteEmail } from '../services/notification/mail.service.js';

export const createTeam = async (req, res) => {
    console.log('=== CREATE TEAM START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { deptId } = req.params;
        const userId = req.user._id;
        const { name, description, parentTeamId } = req.body;

        console.log('Validating required fields...');
        if (!name) {
            console.log('Validation failed: Missing team name');
            return res.status(400).json({
                success: false,
                message: 'Team name is required'
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
                message: 'Only admins can create teams'
            });
        }

        let parentTeam = null;
        if (parentTeamId) {
            console.log('Fetching parent team...');
            parentTeam = await Team.findOne({
                _id: parentTeamId,
                departmentId: deptId,
                isDeleted: false
            });

            if (!parentTeam) {
                console.log('Parent team not found');
                return res.status(404).json({
                    success: false,
                    message: 'Parent team not found'
                });
            }

            console.log('Checking if parent can have sub-teams...');
            if (!parentTeam.canCreateSubTeam()) {
                console.log('Parent team hierarchy limit reached');
                return res.status(400).json({
                    success: false,
                    message: 'Maximum team hierarchy level reached'
                });
            }
        }

        console.log('Creating new team...');
        const team = new Team({
            name: name.trim(),
            description: description || null,
            organizationId: department.organizationId,
            departmentId: deptId,
            parentTeamId: parentTeamId || null,
            superAdmin: userId,
            members: [{
                userId: userId,
                role: 'superadmin',
                status: 'active',
                joinedAt: new Date()
            }],
            status: 'active'
        });

        await team.save();
        console.log('Team created successfully:', team._id);

        if (parentTeam) {
            console.log('Adding team to parent...');
            parentTeam.addSubTeam(team._id);
            await parentTeam.save();
        }

        console.log('Adding team to department...');
        department.addTeam(team._id);
        await department.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: department.organizationId,
            userId: userId,
            resourceType: 'team',
            resourceId: team._id,
            permission: 'admin',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: team.name,
                resourcePath: `/${department.name}/${team.name}`,
                department: {
                    departmentId: department._id,
                    departmentName: department.name
                }
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        team.logActivity('team_created', userId, 'team', team._id, {
            teamName: team.name,
            departmentId: deptId,
            parentTeamId: parentTeamId || null
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: department.organizationId,
            userId: userId,
            action: 'team_created',
            resourceType: 'team',
            resourceId: team._id,
            resourceName: team.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Created team: ${team.name}`,
            metadata: {
                department: {
                    departmentId: department._id,
                    departmentName: department.name
                }
            }
        });

        console.log('=== CREATE TEAM SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Team created successfully',
            data: {
                team: team
            }
        });

    } catch (error) {
        console.error('=== CREATE TEAM ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error creating team',
            error: error.message
        });
    }
};

export const getTeamById = async (req, res) => {
    console.log('=== GET TEAM BY ID START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        })
            .populate('superAdmin', 'firstName lastName email profileImage')
            .populate('admins.userId', 'firstName lastName email profileImage')
            .populate('members.userId', 'firstName lastName email profileImage')
            .populate('parentTeamId', 'name')
            .populate('childTeams', 'name');

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member of team');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('=== GET TEAM BY ID SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team retrieved successfully',
            data: {
                team: team
            }
        });

    } catch (error) {
        console.error('=== GET TEAM BY ID ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team',
            error: error.message
        });
    }
};

export const getTeamHierarchy = async (req, res) => {
    console.log('=== GET TEAM HIERARCHY START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Department ID:', req.params.deptId);

    try {
        const { deptId } = req.params;
        const userId = req.user._id;

        console.log('Fetching department...');
        const department = await Department.findById(deptId);
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

        console.log('Fetching root teams...');
        const rootTeams = await Team.find({
            departmentId: deptId,
            parentTeamId: null,
            isDeleted: false
        }).populate('childTeams');

        const buildHierarchy = async (team) => {
            const children = await Team.find({
                parentTeamId: team._id,
                isDeleted: false
            }).populate('childTeams');

            return {
                ...team.toJSON(),
                children: await Promise.all(children.map(child => buildHierarchy(child)))
            };
        };

        const hierarchy = await Promise.all(
            rootTeams.map(team => buildHierarchy(team))
        );

        console.log('=== GET TEAM HIERARCHY SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team hierarchy retrieved successfully',
            data: {
                hierarchy: hierarchy,
                total: rootTeams.length
            }
        });

    } catch (error) {
        console.error('=== GET TEAM HIERARCHY ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team hierarchy',
            error: error.message
        });
    }
};

export const updateTeam = async (req, res) => {
    console.log('=== UPDATE TEAM START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { name, description } = req.body;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update team details'
            });
        }

        console.log('Updating team fields...');
        if (name) team.name = name.trim();
        if (description !== undefined) team.description = description;

        team.lastUpdatedBy = userId;

        console.log('Logging activity...');
        team.logActivity('team_updated', userId, 'team', team._id, {
            updatedFields: Object.keys(req.body)
        });

        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_updated',
            resourceType: 'team',
            resourceId: team._id,
            resourceName: team.name,
            actionCategory: 'update',
            severity: 'low',
            details: `Updated team: ${team.name}`,
            metadata: {
                department: {
                    departmentId: team.departmentId,
                    departmentName: 'N/A'
                }
            }
        });

        console.log('=== UPDATE TEAM SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team updated successfully',
            data: {
                team: team
            }
        });

    } catch (error) {
        console.error('=== UPDATE TEAM ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating team',
            error: error.message
        });
    }
};

export const deleteTeam = async (req, res) => {
    console.log('=== DELETE TEAM START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!team.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can delete team'
            });
        }

        console.log('Soft deleting team...');
        team.softDelete(userId);

        if (team.parentTeamId) {
            console.log('Removing from parent team...');
            const parentTeam = await Team.findById(team.parentTeamId);
            if (parentTeam) {
                parentTeam.removeSubTeam(teamId);
                await parentTeam.save();
            }
        }

        const department = await Department.findById(team.departmentId);
        if (department) {
            console.log('Removing from department...');
            department.removeTeam(teamId);
            await department.save();
        }

        await team.save();

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_deleted',
            resourceType: 'team',
            resourceId: team._id,
            resourceName: team.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Deleted team: ${team.name}`
        });

        console.log('=== DELETE TEAM SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team deleted successfully'
        });

    } catch (error) {
        console.error('=== DELETE TEAM ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error deleting team',
            error: error.message
        });
    }
};

export const getTeamMembers = async (req, res) => {
    console.log('=== GET TEAM MEMBERS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Query Params:', req.query);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 20, search = '', role, status } = req.query;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('Building member query...');
        let memberIds = team.members.map(m => m.userId);

        if (role) {
            memberIds = team.members
                .filter(m => m.role === role)
                .map(m => m.userId);
        }

        if (status) {
            memberIds = team.members
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
            const membership = team.members.find(
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

        console.log('=== GET TEAM MEMBERS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team members retrieved successfully',
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
        console.error('=== GET TEAM MEMBERS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team members',
            error: error.message
        });
    }
};

export const addTeamMember = async (req, res) => {
    console.log('=== ADD TEAM MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId } = req.params;
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

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
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
        if (team.isMember(memberId)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this team'
            });
        }

        console.log('Adding member to team...');
        team.addMember(memberId, userId, role);
        await team.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: team.organizationId,
            userId: memberId,
            resourceType: 'team',
            resourceId: teamId,
            permission: role === 'admin' || role === 'superadmin' ? 'admin' : 'view',
            grantedBy: userId,
            accessType: 'direct',
            metadata: {
                resourceName: team.name,
                resourcePath: `/${team.name}`
            }
        });
        await accessControl.save();

        console.log('Logging activity...');
        team.logActivity('team_member_added', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            role: role
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_member_added',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'create',
            severity: 'medium',
            details: `Added ${memberUser.email} as ${role}`
        });

        console.log('=== ADD TEAM MEMBER SUCCESS ===');
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
        console.error('=== ADD TEAM MEMBER ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error adding member',
            error: error.message
        });
    }
};

export const removeTeamMember = async (req, res) => {
    console.log('=== REMOVE TEAM MEMBER START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Member ID:', req.params.memberId);

    try {
        const { teamId, memberId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can remove members'
            });
        }

        console.log('Checking if trying to remove super admin...');
        if (team.isSuperAdmin(memberId)) {
            console.log('Cannot remove super admin');
            return res.status(403).json({
                success: false,
                message: 'Cannot remove team super admin'
            });
        }

        console.log('Checking if member exists...');
        if (!team.isMember(memberId)) {
            console.log('Member not found in team');
            return res.status(404).json({
                success: false,
                message: 'Member not found in team'
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

        console.log('Removing member from team...');
        team.removeMember(memberId);
        await team.save();

        console.log('Revoking access controls...');
        await AccessControl.updateMany(
            {
                organizationId: team.organizationId,
                userId: memberId,
                resourceType: 'team',
                resourceId: teamId,
                isActive: true
            },
            {
                isActive: false,
                revokedAt: new Date(),
                revokedBy: userId,
                revocationReason: 'Member removed from team'
            }
        );

        console.log('Logging activity...');
        team.logActivity('team_member_removed', userId, 'user', memberId, {
            memberName: memberUser.fullName
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_member_removed',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'delete',
            severity: 'high',
            details: `Removed ${memberUser.email} from team`
        });

        console.log('=== REMOVE TEAM MEMBER SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('=== REMOVE TEAM MEMBER ERROR ===');
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
    console.log('Team ID:', req.params.teamId);
    console.log('Member ID:', req.params.memberId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId, memberId } = req.params;
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

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can update member roles'
            });
        }

        console.log('Checking if trying to update super admin...');
        if (team.isSuperAdmin(memberId)) {
            console.log('Cannot update super admin role');
            return res.status(403).json({
                success: false,
                message: 'Cannot update super admin role'
            });
        }

        console.log('Checking if member exists...');
        const memberIndex = team.members.findIndex(
            m => m.userId.toString() === memberId
        );

        if (memberIndex === -1) {
            console.log('Member not found in team');
            return res.status(404).json({
                success: false,
                message: 'Member not found in team'
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
        const oldRole = team.members[memberIndex].role;
        team.members[memberIndex].role = role;

        if (role === 'admin') {
            console.log('Adding admin privileges...');
            team.addAdmin(memberId, userId);
        } else {
            console.log('Removing admin privileges if exists...');
            team.removeAdmin(memberId);
        }

        await team.save();

        console.log('Updating access control permission...');
        const accessControl = await AccessControl.findOne({
            organizationId: team.organizationId,
            userId: memberId,
            resourceType: 'team',
            resourceId: teamId,
            isActive: true
        });

        if (accessControl) {
            const newPermission = role === 'admin' || role === 'superadmin' ? 'admin' : 'view';
            accessControl.updatePermission(newPermission, userId, `Role changed from ${oldRole} to ${role}`);
            await accessControl.save();
        }

        console.log('Logging activity...');
        team.logActivity('team_member_role_updated', userId, 'user', memberId, {
            memberName: memberUser.fullName,
            oldRole: oldRole,
            newRole: role
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_member_role_updated',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
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
        console.error('Error Stack: ', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating member role',
            error: error.message
        });
    }
};

export const inviteToTeam = async (req, res) => {
    console.log('=== INVITE TO TEAM START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { email, role = 'member', autoAccessGrant = false, autoAccessProjects = [], autoAccessPermission = 'view' } = req.body;

        console.log('Validating required fields...');
        if (!email) {
            console.log('Validation failed: Missing email');
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        }).populate('organizationId');

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can invite members'
            });
        }

        console.log('Checking if email already exists in team...');
        const existingMember = await User.findOne({ email: email.toLowerCase() });
        if (existingMember && team.isMember(existingMember._id)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this team'
            });
        }

        console.log('Checking for existing invitation...');
        const existingInvitation = team.invitations.find(
            inv => inv.email === email.toLowerCase() && !inv.accepted
        );

        if (existingInvitation && existingInvitation.expiresAt > new Date()) {
            console.log('Active invitation already exists');
            return res.status(400).json({
                success: false,
                message: 'An active invitation already exists for this email'
            });
        }

        console.log('Generating invite token...');
        const inviteToken = generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        console.log('Creating invitation...');
        team.createInvitation(
            email.toLowerCase(),
            inviteToken,
            expiresAt,
            userId,
            role,
            autoAccessGrant,
            autoAccessProjects,
            autoAccessPermission
        );

        await team.save();

        console.log('Creating global invite record...');
        const invite = new Invite({
            organizationId: team.organizationId._id,
            email: email.toLowerCase(),
            inviteToken: inviteToken,
            invitedBy: userId,
            role: role,
            resourceType: 'team',
            resourceId: teamId,
            expiresAt: expiresAt,
            metadata: {
                teamName: team.name,
                departmentId: team.departmentId,
                autoAccessGrant,
                autoAccessProjects,
                autoAccessPermission
            }
        });

        await invite.save();

        console.log('Sending invitation email...');
        const inviterUser = await User.findById(userId);
        await sendInviteEmail(
            email,
            inviterUser.fullName,
            team.name,
            'team',
            inviteToken
        );

        console.log('Logging activity...');
        team.logActivity('invitation_sent', userId, 'team', teamId, {
            email: email,
            role: role
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId._id,
            userId: userId,
            action: 'invitation_created',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'create',
            severity: 'low',
            details: `Invited ${email} to team as ${role}`
        });

        console.log('=== INVITE TO TEAM SUCCESS ===');
        return res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                email: email,
                role: role,
                expiresAt: expiresAt
            }
        });

    } catch (error) {
        console.error('=== INVITE TO TEAM ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error sending invitation',
            error: error.message
        });
    }
};

export const acceptTeamInvitation = async (req, res) => {
    console.log('=== ACCEPT TEAM INVITATION START ===');
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

        console.log('Finding invitation...');
        const invite = await Invite.findOne({
            inviteToken: inviteToken,
            accepted: false
        });

        if (!invite) {
            console.log('Invitation not found');
            return res.status(404).json({
                success: false,
                message: 'Invalid invitation token'
            });
        }

        console.log('Checking if invitation expired...');
        if (invite.expiresAt < new Date()) {
            console.log('Invitation expired');
            return res.status(400).json({
                success: false,
                message: 'Invitation has expired'
            });
        }

        console.log('Verifying email match...');
        const user = await User.findById(userId);
        if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
            console.log('Email mismatch');
            return res.status(403).json({
                success: false,
                message: 'This invitation was sent to a different email address'
            });
        }

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: invite.resourceId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found');
            return res.status(404).json({
                success: false,
                message: 'Team not found or has been deleted'
            });
        }

        console.log('Checking if already a member...');
        if (team.isMember(userId)) {
            console.log('User is already a member');
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this team'
            });
        }

        console.log('Accepting invitation in team...');
        const invitation = await team.acceptInvitation(inviteToken, userId);

        if (!invitation) {
            console.log('Failed to accept invitation');
            return res.status(400).json({
                success: false,
                message: 'Failed to accept invitation'
            });
        }

        console.log('Adding member to team...');
        team.addMember(userId, invitation.invitedBy, invitation.role);
        await team.save();

        console.log('Marking invite as accepted...');
        invite.accepted = true;
        invite.acceptedAt = new Date();
        invite.acceptedBy = userId;
        await invite.save();

        console.log('Creating access control...');
        const accessControl = new AccessControl({
            organizationId: team.organizationId,
            userId: userId,
            resourceType: 'team',
            resourceId: team._id,
            permission: invitation.role === 'admin' ? 'admin' : 'view',
            grantedBy: invitation.invitedBy,
            accessType: 'direct',
            metadata: {
                resourceName: team.name,
                resourcePath: `/${team.name}`
            }
        });
        await accessControl.save();

        console.log('Granting auto access to projects if enabled...');
        if (invitation.autoAccessGrant && invitation.autoAccessProjects.length > 0) {
            for (const projectId of invitation.autoAccessProjects) {
                const projectAccess = new AccessControl({
                    organizationId: team.organizationId,
                    userId: userId,
                    resourceType: 'project',
                    resourceId: projectId,
                    permission: invitation.autoAccessPermission,
                    grantedBy: invitation.invitedBy,
                    accessType: 'inherited',
                    inheritedFrom: 'team',
                    inheritedFromId: team._id,
                    metadata: {
                        resourceName: 'Auto-granted from team invitation'
                    }
                });
                await projectAccess.save();
            }
        }

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'invitation_accepted',
            resourceType: 'team',
            resourceId: team._id,
            resourceName: team.name,
            actionCategory: 'create',
            severity: 'low',
            details: `${user.email} accepted team invitation`
        });

        console.log('=== ACCEPT TEAM INVITATION SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: {
                team: {
                    _id: team._id,
                    name: team.name,
                    description: team.description,
                    role: invitation.role
                }
            }
        });

    } catch (error) {
        console.error('=== ACCEPT TEAM INVITATION ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error accepting invitation',
            error: error.message
        });
    }
};

export const cancelInvitation = async (req, res) => {
    console.log('=== CANCEL INVITATION START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Invitation ID:', req.params.invitationId);

    try {
        const { teamId, invitationId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can cancel invitations'
            });
        }

        console.log('Finding invitation...');
        const invitation = team.invitations.id(invitationId);

        if (!invitation) {
            console.log('Invitation not found');
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        if (invitation.accepted) {
            console.log('Invitation already accepted');
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel an already accepted invitation'
            });
        }

        console.log('Removing invitation...');
        await team.cancelInvitation(invitation.inviteToken);
        await team.save();

        console.log('Updating global invite record...');
        await Invite.updateOne(
            {
                inviteToken: invitation.inviteToken
            },
            {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: userId
            }
        );

        console.log('Logging activity...');
        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'invitation_cancelled',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'delete',
            severity: 'low',
            details: `Cancelled invitation for ${invitation.email}`
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

export const getTeamInvitations = async (req, res) => {
    console.log('=== GET TEAM INVITATIONS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { status = 'pending' } = req.query;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        }).populate('invitations.invitedBy', 'firstName lastName email');

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking admin permissions...');
        if (!team.isAdmin(userId)) {
            console.log('User is not an admin');
            return res.status(403).json({
                success: false,
                message: 'Only admins can view invitations'
            });
        }

        console.log('Filtering invitations...');
        let invitations = team.invitations;

        if (status === 'pending') {
            invitations = invitations.filter(
                inv => !inv.accepted && inv.expiresAt > new Date()
            );
        } else if (status === 'accepted') {
            invitations = invitations.filter(inv => inv.accepted);
        } else if (status === 'expired') {
            invitations = invitations.filter(
                inv => !inv.accepted && inv.expiresAt <= new Date()
            );
        }

        console.log('Invitations found:', invitations.length);

        console.log('=== GET TEAM INVITATIONS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team invitations retrieved successfully',
            data: {
                invitations: invitations,
                total: invitations.length
            }
        });

    } catch (error) {
        console.error('=== GET TEAM INVITATIONS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching invitations',
            error: error.message
        });
    }
};

export const addAdmin = async (req, res) => {
    console.log('=== ADD ADMIN START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { memberId, permissions = {} } = req.body;

        console.log('Validating required fields...');
        if (!memberId) {
            console.log('Validation failed: Missing memberId');
            return res.status(400).json({
                success: false,
                message: 'Member ID is required'
            });
        }

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!team.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can add admins'
            });
        }

        console.log('Checking if user is a member...');
        if (!team.isMember(memberId)) {
            console.log('User is not a member');
            return res.status(400).json({
                success: false,
                message: 'User must be a team member first'
            });
        }

        console.log('Checking if already an admin...');
        if (team.isAdmin(memberId)) {
            console.log('User is already an admin');
            return res.status(400).json({
                success: false,
                message: 'User is already an admin'
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

        console.log('Adding admin privileges...');
        team.addAdmin(memberId, userId, permissions);

        const memberIndex = team.members.findIndex(
            m => m.userId.toString() === memberId
        );
        if (memberIndex !== -1) {
            team.members[memberIndex].role = 'admin';
        }

        await team.save();

        console.log('Updating access control permission...');
        const accessControl = await AccessControl.findOne({
            organizationId: team.organizationId,
            userId: memberId,
            resourceType: 'team',
            resourceId: teamId,
            isActive: true
        });

        if (accessControl) {
            accessControl.updatePermission('admin', userId, 'Promoted to admin');
            await accessControl.save();
        }

        console.log('Logging activity...');
        team.logActivity('team_admin_added', userId, 'user', memberId, {
            memberName: memberUser.fullName
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_admin_added',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Added ${memberUser.email} as admin`
        });

        console.log('=== ADD ADMIN SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Admin added successfully',
            data: {
                admin: {
                    userId: memberUser._id,
                    email: memberUser.email,
                    firstName: memberUser.firstName,
                    lastName: memberUser.lastName,
                    permissions: team.getAdminPermissions(memberId)
                }
            }
        });

    } catch (error) {
        console.error('=== ADD ADMIN ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error adding admin',
            error: error.message
        });
    }
};

export const removeAdmin = async (req, res) => {
    console.log('=== REMOVE ADMIN START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Admin ID:', req.params.adminId);

    try {
        const { teamId, adminId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!team.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can remove admins'
            });
        }

        console.log('Checking if trying to remove super admin...');
        if (team.isSuperAdmin(adminId)) {
            console.log('Cannot remove super admin');
            return res.status(403).json({
                success: false,
                message: 'Cannot remove super admin'
            });
        }

        console.log('Checking if user is an admin...');
        if (!team.isAdmin(adminId)) {
            console.log('User is not an admin');
            return res.status(400).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        console.log('Fetching admin user...');
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            console.log('Admin user not found:', adminId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Removing admin privileges...');
        team.removeAdmin(adminId);

        const memberIndex = team.members.findIndex(
            m => m.userId.toString() === adminId
        );
        if (memberIndex !== -1) {
            team.members[memberIndex].role = 'member';
        }

        await team.save();

        console.log('Downgrading access control permission...');
        const accessControl = await AccessControl.findOne({
            organizationId: team.organizationId,
            userId: adminId,
            resourceType: 'team',
            resourceId: teamId,
            isActive: true
        });

        if (accessControl) {
            accessControl.updatePermission('view', userId, 'Removed from admin');
            await accessControl.save();
        }

        console.log('Logging activity...');
        team.logActivity('team_admin_removed', userId, 'user', adminId, {
            memberName: adminUser.fullName
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_admin_removed',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'update',
            severity: 'medium',
            details: `Removed ${adminUser.email} from admin`
        });

        console.log('=== REMOVE ADMIN SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Admin removed successfully'
        });

    } catch (error) {
        console.error('=== REMOVE ADMIN ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error removing admin',
            error: error.message
        });
    }
};

export const updateAdminPermissions = async (req, res) => {
    console.log('=== UPDATE ADMIN PERMISSIONS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Admin ID:', req.params.adminId);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { teamId, adminId } = req.params;
        const userId = req.user._id;
        const { permissions } = req.body;

        console.log('Validating required fields...');
        if (!permissions) {
            console.log('Validation failed: Missing permissions');
            return res.status(400).json({
                success: false,
                message: 'Permissions are required'
            });
        }

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking super admin permissions...');
        if (!team.isSuperAdmin(userId)) {
            console.log('User is not super admin');
            return res.status(403).json({
                success: false,
                message: 'Only super admin can update admin permissions'
            });
        }

        console.log('Checking if user is an admin...');
        if (!team.isAdmin(adminId) || team.isSuperAdmin(adminId)) {
            console.log('User is not an admin or is super admin');
            return res.status(400).json({
                success: false,
                message: 'User is not an admin or cannot be modified'
            });
        }

        console.log('Fetching admin user...');
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            console.log('Admin user not found:', adminId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Updating admin permissions...');
        team.updateAdminPermissions(adminId, permissions);
        await team.save();

        console.log('Logging activity...');
        team.logActivity('team_admin_permissions_updated', userId, 'user', adminId, {
            memberName: adminUser.fullName,
            newPermissions: permissions
        });
        await team.save();

        await ActivityLog.createLog({
            organizationId: team.organizationId,
            userId: userId,
            action: 'team_admin_permissions_updated',
            resourceType: 'team',
            resourceId: teamId,
            resourceName: team.name,
            actionCategory: 'update',
            severity: 'low',
            details: `Updated admin permissions for ${adminUser.email}`
        });

        console.log('=== UPDATE ADMIN PERMISSIONS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Admin permissions updated successfully',
            data: {
                admin: {
                    userId: adminUser._id,
                    email: adminUser.email,
                    firstName: adminUser.firstName,
                    lastName: adminUser.lastName,
                    permissions: team.getAdminPermissions(adminId)
                }
            }
        });

    } catch (error) {
        console.error('=== UPDATE ADMIN PERMISSIONS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error updating admin permissions',
            error: error.message
        });
    }
};

export const getTeamProjects = async (req, res) => {
    console.log('=== GET TEAM PROJECTS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        }).populate({
            path: 'projects',
            match: { isDeleted: false },
            select: 'name description status startDate endDate members'
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('Projects found:', team.projects.length);

        console.log('=== GET TEAM PROJECTS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team projects retrieved successfully',
            data: {
                projects: team.projects,
                total: team.projects.length
            }
        });

    } catch (error) {
        console.error('=== GET TEAM PROJECTS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team projects',
            error: error.message
        });
    }
};

export const getTeamDocuments = async (req, res) => {
    console.log('=== GET TEAM DOCUMENTS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);

    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        }).populate({
            path: 'documents.documentId',
            match: { isDeleted: false },
            select: 'title content createdBy createdAt updatedAt'
        }).populate('documents.addedBy', 'firstName lastName email');

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        const documents = team.documents.filter(doc => doc.documentId !== null);
        console.log('Documents found:', documents.length);
        console.log('=== GET TEAM DOCUMENTS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team documents retrieved successfully',
            data: {
                documents: documents,
                total: documents.length
            }
        });

    } catch (error) {
        console.error('=== GET TEAM DOCUMENTS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team documents',
            error: error.message
        });
    }
};
export const getTeamActivity = async (req, res) => {
    console.log('=== GET TEAM ACTIVITY START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Query Params:', req.query);
    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 50, startDate, endDate } = req.query;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('Fetching activity logs...');
        const query = {
            'metadata.team.teamId': teamId,
            isArchived: false
        };

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const activities = await ActivityLog.find(query)
            .populate('userId', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        console.log('Activities found:', activities.length);

        console.log('=== GET TEAM ACTIVITY SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team activity retrieved successfully',
            data: {
                activities: activities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalActivities: total,
                    hasMore: skip + activities.length < total
                }
            }
        });

    } catch (error) {
        console.error('=== GET TEAM ACTIVITY ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team activity',
            error: error.message
        });
    }
};
export const getTeamStatistics = async (req, res) => {
    console.log('=== GET TEAM STATISTICS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('Compiling statistics...');
        const statistics = {
            members: {
                total: team.statistics.totalMembers,
                active: team.members.filter(m => m.status === 'active').length,
                inactive: team.members.filter(m => m.status === 'inactive').length,
                suspended: team.members.filter(m => m.status === 'suspended').length,
                admins: team.admins.length + 1 // +1 for super admin
            },
            resources: {
                projects: team.statistics.totalProjects,
                documents: team.statistics.totalDocuments,
                sheets: team.statistics.totalSheets,
                slides: team.statistics.totalSlides,
                subTeams: team.statistics.totalSubTeams
            },
            hierarchy: {
                level: team.hierarchyLevel,
                isRootTeam: team.isRootTeam,
                hasParent: !!team.parentTeamId,
                childrenCount: team.childTeams.length
            },
            invitations: {
                pending: team.invitations.filter(
                    inv => !inv.accepted && inv.expiresAt > new Date()
                ).length,
                accepted: team.invitations.filter(inv => inv.accepted).length,
                expired: team.invitations.filter(
                    inv => !inv.accepted && inv.expiresAt <= new Date()
                ).length
            },
            lastUpdated: team.statistics.lastUpdated
        };

        console.log('=== GET TEAM STATISTICS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Team statistics retrieved successfully',
            data: {
                statistics: statistics
            }
        });

    } catch (error) {
        console.error('=== GET TEAM STATISTICS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error fetching team statistics',
            error: error.message
        });
    }
};
export const searchTeamMembers = async (req, res) => {
    console.log('=== SEARCH TEAM MEMBERS START ===');
    console.log('Request User ID:', req.user?._id);
    console.log('Team ID:', req.params.teamId);
    console.log('Search Query:', req.query.q);
    try {
        const { teamId } = req.params;
        const userId = req.user._id;
        const { q: searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        console.log('Fetching team...');
        const team = await Team.findOne({
            _id: teamId,
            isDeleted: false
        });

        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('Checking user membership...');
        if (!team.isMember(userId)) {
            console.log('User is not a member');
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        console.log('Searching members...');
        const memberIds = team.members.map(m => m.userId);

        const members = await User.find({
            _id: { $in: memberIds },
            isDeleted: false,
            $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('firstName lastName email profileImage');

        const membersWithRole = members.map(member => {
            const membership = team.members.find(
                m => m.userId.toString() === member._id.toString()
            );

            return {
                ...member.toJSON(),
                role: membership?.role || 'member',
                memberStatus: membership?.status || 'active'
            };
        });

        console.log('Members found:', membersWithRole.length);

        console.log('=== SEARCH TEAM MEMBERS SUCCESS ===');
        return res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            data: {
                members: membersWithRole,
                total: membersWithRole.length
            }
        });

    } catch (error) {
        console.error('=== SEARCH TEAM MEMBERS ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error searching members',
            error: error.message
        });
    }
};