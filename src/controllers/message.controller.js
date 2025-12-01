import Message from '../models/message.model.js';
import AccessControl from '../models/accessControl.model.js';
import ActivityLog from '../models/activityLog.model.js';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Department from '../models/department.model.js';
import Team from '../models/team.model.js';
import Project from '../models/project.model.js';
import Phase from '../models/phase.model.js';
import Sprint from '../models/sprint.model.js';
import { emitToRoom, emitToUser } from '../config/socket.config.js';

const getRoomId = (organizationId, contextType, contextId) => {
    return `org:${organizationId}:${contextType}:${contextId}`;
};

const canUserAccessContext = async (userId, organizationId, contextType, contextId) => {
    console.log(`[AccessControl] Checking access for user ${userId} to ${contextType} ${contextId}`);

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        console.log(`[AccessControl] User ${userId} not found or deleted`);
        return false;
    }

    const orgMember = user.organizationMemberships.find(m => m.organizationId.toString() === organizationId.toString());
    if (!orgMember || orgMember.status !== 'active') {
        console.log(`[AccessControl] User ${userId} not in organization ${organizationId}`);
        return false;
    }

    if (contextType === 'organization') {
        console.log(`[AccessControl] Organization context - access granted`);
        return true;
    }

    if (contextType === 'department') {
        const deptMember = user.departmentMemberships.find(
            m => m.departmentId.toString() === contextId.toString() && m.organizationId.toString() === organizationId.toString()
        );
        if (!deptMember || deptMember.status !== 'active') {
            console.log(`[AccessControl] User ${userId} not in department ${contextId}`);
            return false;
        }
        console.log(`[AccessControl] Department context - access granted`);
        return true;
    }

    if (contextType === 'team') {
        const teamMember = user.teamMemberships.find(
            m => m.teamId.toString() === contextId.toString() && m.organizationId.toString() === organizationId.toString()
        );
        if (!teamMember || teamMember.status !== 'active') {
            console.log(`[AccessControl] User ${userId} not in team ${contextId}`);
            return false;
        }
        console.log(`[AccessControl] Team context - access granted`);
        return true;
    }

    if (contextType === 'project') {
        const projectAccess = user.projectAccess.find(
            p => p.projectId.toString() === contextId.toString() && p.organizationId.toString() === organizationId.toString()
        );
        if (!projectAccess) {
            console.log(`[AccessControl] User ${userId} no access to project ${contextId}`);
            return false;
        }
        console.log(`[AccessControl] Project context - access granted`);
        return true;
    }

    if (contextType === 'phase') {
        const phase = await Phase.findById(contextId);
        if (!phase) {
            console.log(`[AccessControl] Phase ${contextId} not found`);
            return false;
        }
        const projectAccess = user.projectAccess.find(
            p => p.projectId.toString() === phase.projectId.toString() && p.organizationId.toString() === organizationId.toString()
        );
        if (!projectAccess) {
            console.log(`[AccessControl] User ${userId} no access to phase ${contextId}`);
            return false;
        }
        console.log(`[AccessControl] Phase context - access granted`);
        return true;
    }

    if (contextType === 'sprint') {
        const sprint = await Sprint.findById(contextId);
        if (!sprint) {
            console.log(`[AccessControl] Sprint ${contextId} not found`);
            return false;
        }
        const projectAccess = user.projectAccess.find(
            p => p.projectId.toString() === sprint.projectId.toString() && p.organizationId.toString() === organizationId.toString()
        );
        if (!projectAccess) {
            console.log(`[AccessControl] User ${userId} no access to sprint ${contextId}`);
            return false;
        }
        console.log(`[AccessControl] Sprint context - access granted`);
        return true;
    }

    console.log(`[AccessControl] Unknown context type ${contextType}`);
    return false;
};



const getValidMentionableUsers = async (userId, organizationId, contextType, contextId) => {
    console.log(`[MentionableUsers] Fetching for user ${userId} in ${contextType} ${contextId}`);

    const members = await getContextMembers(organizationId, contextType, contextId);
    const mentionableMembers = members.filter(memberId => memberId !== userId.toString());

    console.log(`[MentionableUsers] Found ${mentionableMembers.length} mentionable users`);
    return mentionableMembers;
};

export const sendMessage = async (req, res) => {
    try {
        const { organizationId, contextType, contextId, content, mentions = [], attachments = [] } = req.body;
        const userId = req.user.id;

        console.log(`[SendMessage] New message from user ${userId}`);
        console.log(`[SendMessage] Context: ${contextType} ${contextId}`);
        console.log(`[SendMessage] Content length: ${content.length}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[SendMessage] User ${userId} denied access to ${contextType} ${contextId}`);
            return res.status(403).json({ message: 'Access denied to this context' });
        }

        const sender = await User.findById(userId);
        const plainTextContent = content.replace(/<[^>]*>/g, '');

        const message = new Message({
            organizationId,
            contextType,
            contextId,
            senderId: userId,
            senderName: `${sender.firstName} ${sender.lastName}`,
            senderEmail: sender.email,
            senderProfileImage: sender.profileImage,
            content,
            plainTextContent,
            messageType: 'text',
            searchableContent: `${content} ${sender.firstName} ${sender.lastName}`.toLowerCase()
        });

        if (mentions && mentions.length > 0) {
            const validMentions = await getValidMentionableUsers(userId, organizationId, contextType, contextId);
            for (const mentionUserId of mentions) {
                if (validMentions.includes(mentionUserId.toString())) {
                    const mentionUser = await User.findById(mentionUserId);
                    message.addMention(mentionUserId, `${mentionUser.firstName} ${mentionUser.lastName}`, mentionUser.email);
                }
            }
        }

        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                message.addAttachment(
                    attachment.fileId,
                    attachment.fileName,
                    attachment.fileSize,
                    attachment.fileType,
                    attachment.fileUrl,
                    userId
                );
            }
        }

        message.deliveryStatus.status = 'sent';
        message.deliveryStatus.sentAt = new Date();

        await message.save();

        console.log(`[SendMessage] Message saved with ID ${message._id}`);

        const roomId = getRoomId(organizationId, contextType, contextId);
        const messageData = {
            _id: message._id,
            content: message.content,
            senderName: message.senderName,
            senderEmail: message.senderEmail,
            senderProfileImage: message.senderProfileImage,
            mentions: message.mentions,
            attachments: message.attachments,
            createdAt: message.createdAt,
            deliveryStatus: message.deliveryStatus
        };

        emitToRoom(roomId, 'message:received', messageData);
        console.log(`[SendMessage] Message emitted to room ${roomId}`);

        await ActivityLog.createLog({
            organizationId,
            userId,
            action: 'message_created',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: `Message sent in ${contextType}`,
            metadata: { contextType, contextId, messageLengthChars: content.length }
        });

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: messageData
        });
    } catch (error) {
        console.error(`[SendMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

export const getContextMessages = async (req, res) => {
    try {
        const { organizationId, contextType, contextId } = req.query;
        const { limit = 50, skip = 0 } = req.query;
        const userId = req.user.id;

        console.log(`[GetMessages] Fetching messages for ${contextType} ${contextId}`);
        console.log(`[GetMessages] Limit: ${limit}, Skip: ${skip}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[GetMessages] User ${userId} denied access`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.getContextMessages(organizationId, contextType, contextId, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        console.log(`[GetMessages] Retrieved ${messages.length} messages`);

        return res.status(200).json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error(`[GetMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content, editReason = '' } = req.body;
        const userId = req.user.id;

        console.log(`[EditMessage] User ${userId} editing message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[EditMessage] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId.toString() !== userId.toString()) {
            console.log(`[EditMessage] User ${userId} not message sender`);
            return res.status(403).json({ message: 'Can only edit your own messages' });
        }

        if (!message.canBeEditedBy(userId)) {
            console.log(`[EditMessage] Message edit window expired for ${messageId}`);
            return res.status(400).json({ message: 'Message edit window has expired (15 minutes)' });
        }

        const oldContent = message.content;
        message.editMessage(content, userId, editReason);
        message.plainTextContent = content.replace(/<[^>]*>/g, '');

        await message.save();

        console.log(`[EditMessage] Message ${messageId} edited successfully`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:edited', {
            messageId: message._id,
            content: message.content,
            editedAt: message.lastEditTime,
            editHistory: message.editHistory
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_updated',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: 'Message edited',
            changes: {
                before: oldContent.substring(0, 100),
                after: content.substring(0, 100)
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Message edited successfully',
            data: {
                messageId: message._id,
                content: message.content,
                editedAt: message.lastEditTime
            }
        });
    } catch (error) {
        console.error(`[EditMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to edit message', error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { isSoftDelete = true, reason = '' } = req.body;
        const userId = req.user.id;

        console.log(`[DeleteMessage] User ${userId} deleting message ${messageId}`);
        console.log(`[DeleteMessage] Soft delete: ${isSoftDelete}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[DeleteMessage] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (!message.canBeDeletedBy(userId)) {
            console.log(`[DeleteMessage] User ${userId} not authorized to delete`);
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        if (isSoftDelete) {
            message.softDelete(userId, reason);
            console.log(`[DeleteMessage] Message soft deleted`);
        } else {
            message.hardDelete(userId, reason);
            console.log(`[DeleteMessage] Message hard deleted`);
        }

        await message.save();

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:deleted', {
            messageId: message._id,
            isSoftDelete,
            deletedAt: message.deletedAt || message.softDeletedAt
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_deleted',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: isSoftDelete ? 'info' : 'high',
            details: `Message ${isSoftDelete ? 'soft' : 'hard'} deleted. Reason: ${reason || 'Not provided'}`
        });

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error(`[DeleteMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to delete message', error: error.message });
    }
};

export const pinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        console.log(`[PinMessage] User ${userId} pinning message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[PinMessage] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.isPinned) {
            console.log(`[PinMessage] Message already pinned`);
            return res.status(400).json({ message: 'Message is already pinned' });
        }

        message.pinMessage(userId);
        await message.save();

        console.log(`[PinMessage] Message ${messageId} pinned`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:pinned', {
            messageId: message._id,
            pinnedAt: message.pinnedAt,
            pinnedBy: userId
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_pinned',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: 'Message pinned'
        });

        return res.status(200).json({
            success: true,
            message: 'Message pinned successfully'
        });
    } catch (error) {
        console.error(`[PinMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to pin message', error: error.message });
    }
};

export const unpinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        console.log(`[UnpinMessage] User ${userId} unpinning message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[UnpinMessage] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (!message.isPinned) {
            console.log(`[UnpinMessage] Message not pinned`);
            return res.status(400).json({ message: 'Message is not pinned' });
        }

        message.unpinMessage();
        await message.save();

        console.log(`[UnpinMessage] Message ${messageId} unpinned`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:unpinned', {
            messageId: message._id,
            unpinnedAt: new Date()
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_unpinned',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: 'Message unpinned'
        });

        return res.status(200).json({
            success: true,
            message: 'Message unpinned successfully'
        });
    } catch (error) {
        console.error(`[UnpinMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to unpin message', error: error.message });
    }
};

export const getPinnedMessages = async (req, res) => {
    try {
        const { contextType, contextId } = req.query;
        const { limit = 20 } = req.query;
        const userId = req.user.id;

        console.log(`[GetPinnedMessages] Fetching pinned messages for ${contextType} ${contextId}`);

        const organizationId = req.query.organizationId;
        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[GetPinnedMessages] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const pinnedMessages = await Message.getPinnedMessages(contextType, contextId, parseInt(limit));

        console.log(`[GetPinnedMessages] Retrieved ${pinnedMessages.length} pinned messages`);

        return res.status(200).json({
            success: true,
            data: pinnedMessages,
            count: pinnedMessages.length
        });
    } catch (error) {
        console.error(`[GetPinnedMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch pinned messages', error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        console.log(`[MarkAsRead] User ${userId} marking message ${messageId} as read`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[MarkAsRead] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        message.markAsRead(userId);
        await message.save();

        console.log(`[MarkAsRead] Message marked as read. Total reads: ${message.readCount}`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:read', {
            messageId: message._id,
            userId,
            readCount: message.readCount,
            readAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'Message marked as read',
            readCount: message.readCount
        });
    } catch (error) {
        console.error(`[MarkAsRead] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to mark as read', error: error.message });
    }
};

export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        console.log(`[AddReaction] User ${userId} adding reaction ${emoji} to message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[AddReaction] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        message.addReaction(emoji, userId);
        await message.save();

        console.log(`[AddReaction] Reaction added. Total reactions: ${message.reactions.totalReactions}`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'reaction:added', {
            messageId: message._id,
            emoji,
            userId,
            totalReactions: message.reactions.totalReactions,
            reactionSummary: message.reactions.reactionSummary
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_reaction_added',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: `Reaction added: ${emoji}`
        });

        return res.status(200).json({
            success: true,
            message: 'Reaction added successfully',
            reactionSummary: message.reactions.reactionSummary
        });
    } catch (error) {
        console.error(`[AddReaction] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to add reaction', error: error.message });
    }
};

export const removeReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        console.log(`[RemoveReaction] User ${userId} removing reaction ${emoji} from message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[RemoveReaction] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        message.removeReaction(emoji, userId);
        await message.save();

        console.log(`[RemoveReaction] Reaction removed. Total reactions: ${message.reactions.totalReactions}`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'reaction:removed', {
            messageId: message._id,
            emoji,
            userId,
            totalReactions: message.reactions.totalReactions,
            reactionSummary: message.reactions.reactionSummary
        });

        return res.status(200).json({
            success: true,
            message: 'Reaction removed successfully',
            reactionSummary: message.reactions.reactionSummary
        });
    } catch (error) {
        console.error(`[RemoveReaction] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to remove reaction', error: error.message });
    }
};

export const addThreadReply = async (req, res) => {
    try {
        const { parentMessageId } = req.params;
        const { content, mentions = [] } = req.body;
        const userId = req.user.id;

        console.log(`[ThreadReply] User ${userId} replying to thread ${parentMessageId}`);

        const parentMessage = await Message.findById(parentMessageId);
        if (!parentMessage) {
            console.log(`[ThreadReply] Parent message ${parentMessageId} not found`);
            return res.status(404).json({ message: 'Parent message not found' });
        }

        const hasAccess = await canUserAccessContext(userId, parentMessage.organizationId, parentMessage.contextType, parentMessage.contextId);
        if (!hasAccess) {
            console.log(`[ThreadReply] Access denied to parent context`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const sender = await User.findById(userId);
        const plainTextContent = content.replace(/<[^>]*>/g, '');

        const reply = new Message({
            organizationId: parentMessage.organizationId,
            contextType: parentMessage.contextType,
            contextId: parentMessage.contextId,
            senderId: userId,
            senderName: `${sender.firstName} ${sender.lastName}`,
            senderEmail: sender.email,
            senderProfileImage: sender.profileImage,
            content,
            plainTextContent,
            messageType: 'thread_reply',
            threadSettings: {
                isThreadReply: true,
                parentMessageId
            },
            searchableContent: `${content} ${sender.firstName} ${sender.lastName}`.toLowerCase()
        });

        if (mentions && mentions.length > 0) {
            const validMentions = await getValidMentionableUsers(userId, parentMessage.organizationId, parentMessage.contextType, parentMessage.contextId);
            for (const mentionUserId of mentions) {
                if (validMentions.includes(mentionUserId.toString())) {
                    const mentionUser = await User.findById(mentionUserId);
                    reply.addMention(mentionUserId, `${mentionUser.firstName} ${mentionUser.lastName}`, mentionUser.email);
                }
            }
        }

        reply.deliveryStatus.status = 'sent';
        reply.deliveryStatus.sentAt = new Date();

        await reply.save();

        parentMessage.addThreadReply();
        parentMessage.updateLastThreadReply(userId);
        await parentMessage.save();

        console.log(`[ThreadReply] Reply saved with ID ${reply._id}`);

        const roomId = getRoomId(parentMessage.organizationId, parentMessage.contextType, parentMessage.contextId);
        emitToRoom(roomId, 'thread:reply', {
            replyId: reply._id,
            parentMessageId,
            content: reply.content,
            senderName: reply.senderName,
            senderEmail: reply.senderEmail,
            threadCount: parentMessage.threadSettings.threadCount,
            createdAt: reply.createdAt
        });

        await ActivityLog.createLog({
            organizationId: parentMessage.organizationId,
            userId,
            action: 'thread_reply_created',
            resourceType: 'message',
            resourceId: reply._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: 'Thread reply added'
        });

        return res.status(201).json({
            success: true,
            message: 'Reply sent successfully',
            data: {
                replyId: reply._id,
                parentMessageId,
                threadCount: parentMessage.threadSettings.threadCount
            }
        });
    } catch (error) {
        console.error(`[ThreadReply] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to send reply', error: error.message });
    }
};

export const getThreadMessages = async (req, res) => {
    try {
        const { parentMessageId } = req.params;
        const { limit = 50, skip = 0 } = req.query;
        const userId = req.user.id;

        console.log(`[GetThread] Fetching thread for parent message ${parentMessageId}`);

        const parentMessage = await Message.findById(parentMessageId);
        if (!parentMessage) {
            console.log(`[GetThread] Parent message ${parentMessageId} not found`);
            return res.status(404).json({ message: 'Parent message not found' });
        }

        const hasAccess = await canUserAccessContext(userId, parentMessage.organizationId, parentMessage.contextType, parentMessage.contextId);
        if (!hasAccess) {
            console.log(`[GetThread] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const replies = await Message.getThreadMessages(parentMessageId, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        console.log(`[GetThread] Retrieved ${replies.length} thread replies`);

        return res.status(200).json({
            success: true,
            data: {
                parentMessage: {
                    _id: parentMessage._id,
                    content: parentMessage.content,
                    senderName: parentMessage.senderName,
                    createdAt: parentMessage.createdAt,
                    threadCount: parentMessage.threadSettings.threadCount
                },
                replies,
                count: replies.length
            }
        });
    } catch (error) {
        console.error(`[GetThread] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch thread', error: error.message });
    }
};

export const searchMessages = async (req, res) => {
    try {
        const { organizationId, contextType, searchTerm } = req.query;
        const { limit = 50, skip = 0 } = req.query;
        const userId = req.user.id;

        console.log(`[SearchMessages] User ${userId} searching for "${searchTerm}" in ${contextType}`);

        const results = await Message.searchMessages(organizationId, contextType, searchTerm, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        console.log(`[SearchMessages] Found ${results.length} results`);

        return res.status(200).json({
            success: true,
            data: results,
            count: results.length,
            searchTerm
        });
    } catch (error) {
        console.error(`[SearchMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to search messages', error: error.message });
    }
};

export const getContextStats = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.query;
        const userId = req.user.id;

        console.log(`[ContextStats] Fetching stats for ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[ContextStats] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const stats = await Message.getContextStats(contextType, contextId);

        console.log(`[ContextStats] Retrieved stats - Total messages: ${stats.totalMessages}`);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(`[ContextStats] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

export const getMentionedMessages = async (req, res) => {
    try {
        const { organizationId } = req.query;
        const { limit = 50, skip = 0 } = req.query;
        const userId = req.user.id;

        console.log(`[MentionedMessages] Fetching messages mentioning user ${userId}`);

        const messages = await Message.getMentionedMessages(userId, organizationId, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        console.log(`[MentionedMessages] Found ${messages.length} mentions`);

        return res.status(200).json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error(`[MentionedMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch mentions', error: error.message });
    }
};

export const getUserMessages = async (req, res) => {
    try {
        const { organizationId } = req.query;
        const { limit = 50, skip = 0 } = req.query;
        const userId = req.user.id;

        console.log(`[UserMessages] Fetching messages from user ${userId}`);

        const messages = await Message.getUserMessages(userId, organizationId, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        console.log(`[UserMessages] Retrieved ${messages.length} messages`);

        return res.status(200).json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error(`[UserMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch user messages', error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const { contextType, contextId } = req.query;
        const userId = req.user.id;

        console.log(`[UnreadCount] Fetching unread count for ${contextType} ${contextId}`);

        const count = await Message.getUnreadMessagesCount(userId, contextType, contextId);

        console.log(`[UnreadCount] Unread messages: ${count}`);

        return res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error(`[UnreadCount] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.body;
        const userId = req.user.id;

        console.log(`[MarkAllAsRead] User ${userId} marking all messages as read in ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[MarkAllAsRead] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({
            contextType,
            contextId,
            'readBy.userId': { $ne: userId },
            isDeleted: false,
            isSoftDeleted: false
        });

        console.log(`[MarkAllAsRead] Found ${messages.length} unread messages`);

        for (const message of messages) {
            message.markAsRead(userId);
            await message.save();
        }

        console.log(`[MarkAllAsRead] All messages marked as read`);

        const roomId = getRoomId(organizationId, contextType, contextId);
        emitToRoom(roomId, 'messages:all-read', {
            userId,
            contextType,
            contextId,
            markedAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'All messages marked as read',
            markedCount: messages.length
        });
    } catch (error) {
        console.error(`[MarkAllAsRead] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to mark all as read', error: error.message });
    }
};

export const getContextMembers = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.query;
        const userId = req.user.id;

        console.log(`[GetContextMembers] Fetching members for ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[GetContextMembers] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const memberIds = await getContextMembers(organizationId, contextType, contextId);
        const members = await User.find(
            { _id: { $in: memberIds }, isDeleted: false },
            'firstName lastName email profileImage'
        );

        console.log(`[GetContextMembers] Retrieved ${members.length} members`);

        return res.status(200).json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error(`[GetContextMembers] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch members', error: error.message });
    }
};

export const getMentionableSuggestions = async (req, res) => {
    try {
        const { contextType, contextId, organizationId, searchTerm = '' } = req.query;
        const userId = req.user.id;

        console.log(`[MentionSuggestions] Fetching suggestions for "${searchTerm}" in ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[MentionSuggestions] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const mentionableIds = await getValidMentionableUsers(userId, organizationId, contextType, contextId);

        let query = { _id: { $in: mentionableIds }, isDeleted: false };

        if (searchTerm) {
            query.$or = [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const suggestions = await User.find(query, 'firstName lastName email profileImage').limit(10);

        console.log(`[MentionSuggestions] Found ${suggestions.length} suggestions`);

        return res.status(200).json({
            success: true,
            data: suggestions,
            count: suggestions.length
        });
    } catch (error) {
        console.error(`[MentionSuggestions] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch suggestions', error: error.message });
    }
};

export const restoreMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        console.log(`[RestoreMessage] User ${userId} restoring message ${messageId}`);

        const message = await Message.findById(messageId);
        if (!message) {
            console.log(`[RestoreMessage] Message ${messageId} not found`);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (!message.isSoftDeleted) {
            console.log(`[RestoreMessage] Message not soft deleted`);
            return res.status(400).json({ message: 'Message is not soft deleted' });
        }

        const restored = message.restoreSoftDelete();
        if (!restored) {
            console.log(`[RestoreMessage] Could not restore message`);
            return res.status(400).json({ message: 'Could not restore message' });
        }

        await message.save();

        console.log(`[RestoreMessage] Message ${messageId} restored`);

        const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
        emitToRoom(roomId, 'message:restored', {
            messageId: message._id,
            content: message.content,
            restoredAt: new Date()
        });

        await ActivityLog.createLog({
            organizationId: message.organizationId,
            userId,
            action: 'message_restored',
            resourceType: 'message',
            resourceId: message._id,
            actionCategory: 'collaboration',
            severity: 'info',
            details: 'Soft deleted message restored'
        });

        return res.status(200).json({
            success: true,
            message: 'Message restored successfully',
            data: {
                messageId: message._id,
                content: message.content,
                restoredAt: new Date()
            }
        });
    } catch (error) {
        console.error(`[RestoreMessage] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to restore message', error: error.message });
    }
};

export const muteContext = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.body;
        const userId = req.user.id;

        console.log(`[MuteContext] User ${userId} muting ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[MuteContext] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const userPreference = await UserMessagePreference.findOneAndUpdate(
            { userId, contextType, contextId },
            { isMuted: true, mutedAt: new Date() },
            { upsert: true, new: true }
        );

        console.log(`[MuteContext] Context muted for user ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Context muted successfully'
        });
    } catch (error) {
        console.error(`[MuteContext] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to mute context', error: error.message });
    }
};

export const unmuteContext = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.body;
        const userId = req.user.id;

        console.log(`[UnmuteContext] User ${userId} unmuting ${contextType} ${contextId}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[UnmuteContext] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const userPreference = await UserMessagePreference.findOneAndUpdate(
            { userId, contextType, contextId },
            { isMuted: false, unmutedAt: new Date() },
            { new: true }
        );

        console.log(`[UnmuteContext] Context unmuted for user ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Context unmuted successfully'
        });
    } catch (error) {
        console.error(`[UnmuteContext] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to unmute context', error: error.message });
    }
};

export const getContextActivity = async (req, res) => {
    try {
        const { contextType, contextId, organizationId } = req.query;
        const { days = 7 } = req.query;
        const userId = req.user.id;

        console.log(`[ContextActivity] Fetching activity for ${contextType} ${contextId} last ${days} days`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[ContextActivity] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

        const activity = await Message.aggregate([
            {
                $match: {
                    contextType,
                    contextId,
                    createdAt: { $gte: startDate },
                    isDeleted: false,
                    isSoftDeleted: false
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        senderId: '$senderId'
                    },
                    messageCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);

        console.log(`[ContextActivity] Retrieved activity data`);

        return res.status(200).json({
            success: true,
            data: activity,
            period: `Last ${days} days`
        });
    } catch (error) {
        console.error(`[ContextActivity] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
    }
};

export const getActiveContexts = async (req, res) => {
    try {
        const { organizationId } = req.query;
        const { days = 7 } = req.query;
        const userId = req.user.id;

        console.log(`[ActiveContexts] Fetching active contexts for last ${days} days`);

        const userOrg = await User.findOne({
            _id: userId,
            'organizationMemberships.organizationId': organizationId,
            isDeleted: false
        });

        if (!userOrg) {
            console.log(`[ActiveContexts] User not in organization`);
            return res.status(403).json({ message: 'User not in organization' });
        }

        const contexts = await Message.getActiveContexts(organizationId, parseInt(days));

        console.log(`[ActiveContexts] Found ${contexts.length} active contexts`);

        return res.status(200).json({
            success: true,
            data: contexts,
            count: contexts.length
        });
    } catch (error) {
        console.error(`[ActiveContexts] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to fetch active contexts', error: error.message });
    }
};

export const bulkDeleteMessages = async (req, res) => {
    try {
        const { messageIds, isSoftDelete = true } = req.body;
        const userId = req.user.id;

        console.log(`[BulkDelete] User ${userId} bulk deleting ${messageIds.length} messages`);

        const messages = await Message.find({ _id: { $in: messageIds } });

        if (messages.length === 0) {
            console.log(`[BulkDelete] No messages found`);
            return res.status(404).json({ message: 'No messages found' });
        }

        const unauthorizedCount = messages.filter(m => m.senderId.toString() !== userId.toString()).length;
        if (unauthorizedCount > 0) {
            console.log(`[BulkDelete] User not authorized to delete ${unauthorizedCount} messages`);
            return res.status(403).json({ message: 'Not authorized to delete some messages' });
        }

        const deletedMessages = [];

        for (const message of messages) {
            if (isSoftDelete) {
                message.softDelete(userId, 'Bulk delete');
            } else {
                message.hardDelete(userId, 'Bulk delete');
            }
            await message.save();
            deletedMessages.push(message._id);

            const roomId = getRoomId(message.organizationId, message.contextType, message.contextId);
            emitToRoom(roomId, 'message:deleted', {
                messageId: message._id,
                isSoftDelete
            });
        }

        console.log(`[BulkDelete] Deleted ${deletedMessages.length} messages`);

        await ActivityLog.createLog({
            organizationId: messages[0].organizationId,
            userId,
            action: 'messages_bulk_deleted',
            resourceType: 'message',
            actionCategory: 'collaboration',
            severity: isSoftDelete ? 'info' : 'high',
            details: `Bulk deleted ${deletedMessages.length} messages`
        });

        return res.status(200).json({
            success: true,
            message: 'Messages deleted successfully',
            deletedCount: deletedMessages.length
        });
    } catch (error) {
        console.error(`[BulkDelete] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to bulk delete messages', error: error.message });
    }
};

export const exportMessages = async (req, res) => {
    try {
        const { contextType, contextId, organizationId, format = 'json' } = req.query;
        const userId = req.user.id;

        console.log(`[ExportMessages] User ${userId} exporting messages as ${format}`);

        const hasAccess = await canUserAccessContext(userId, organizationId, contextType, contextId);
        if (!hasAccess) {
            console.log(`[ExportMessages] Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({
            organizationId,
            contextType,
            contextId,
            isDeleted: false,
            isSoftDeleted: false
        }).sort({ createdAt: 1 });

        console.log(`[ExportMessages] Retrieved ${messages.length} messages for export`);

        if (format === 'csv') {
            const csv = messages.map(m => `"${m.createdAt}","${m.senderName}","${m.content.replace(/"/g, '""')}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="messages-${contextId}.csv"`);
            return res.send(csv);
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="messages-${contextId}.json"`);
        return res.json({
            exported: new Date(),
            contextType,
            contextId,
            messageCount: messages.length,
            messages: messages.map(m => ({
                id: m._id,
                content: m.content,
                sender: m.senderName,
                senderEmail: m.senderEmail,
                createdAt: m.createdAt,
                mentions: m.mentions.length,
                reactions: m.reactions.totalReactions
            }))
        });
    } catch (error) {
        console.error(`[ExportMessages] Error: ${error.message}`);
        return res.status(500).json({ message: 'Failed to export messages', error: error.message });
    }
};