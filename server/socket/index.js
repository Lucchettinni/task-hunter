// server/socket/index.js
const db = require('../db');

module.exports = function (io) {
    let onlineUsersByProject = {};

    const getProjectUsers = (projectId) => {
        if (!onlineUsersByProject[projectId]) return [];
        return Object.values(onlineUsersByProject[projectId]).map(({ socketId, ...user }) => user);
    };

    io.on('connection', (socket) => {
        let currentProjectId = null;
        let currentUserId = null;

        socket.on('joinProject', ({ projectId, user }) => {
            if (!user || !user.id) return;

            socket.join(projectId);
            currentProjectId = projectId;
            currentUserId = user.id;

            if (!onlineUsersByProject[projectId]) {
                onlineUsersByProject[projectId] = {};
            }
            onlineUsersByProject[projectId][user.id] = { ...user, socketId: socket.id, status: 'online' };
            
            io.to(projectId).emit('updateOnlineUsers', getProjectUsers(projectId));
        });

        const updateUserStatus = (status) => {
            if (currentProjectId && currentUserId && onlineUsersByProject[currentProjectId]?.[currentUserId]) {
                onlineUsersByProject[currentProjectId][currentUserId].status = status;
                io.to(currentProjectId).emit('updateOnlineUsers', getProjectUsers(currentProjectId));
            }
        };
        
        socket.on('userActive', () => updateUserStatus('online'));
        socket.on('userInactive', () => updateUserStatus('away'));
        
        socket.on('sendMessage', async (data) => {
            const { projectId, channelId, userId, message, attachment_url, mentions } = data;
            try {
                const [result] = await db.query(
                    'INSERT INTO chat_messages (channel_id, user_id, message, attachment_url) VALUES (?, ?, ?, ?)',
                    [channelId, userId, message, attachment_url]
                );
                
                const [newMessage] = await db.query(
                    `SELECT cm.*, u.username, u.profile_image_url, u.primary_color 
                     FROM chat_messages cm JOIN users u ON cm.user_id = u.id 
                     WHERE cm.id = ?`,
                    [result.insertId]
                );

                const finalMessage = newMessage[0];
                io.to(projectId).emit('receiveMessage', finalMessage);
                
                if (mentions && mentions.length > 0 && onlineUsersByProject[projectId]) {
                    mentions.forEach(mentionedUsername => {
                        const targetUser = Object.values(onlineUsersByProject[projectId]).find(u => u.username === mentionedUsername);
                        if (targetUser && targetUser.id !== userId) {
                            io.to(targetUser.socketId).emit('receivePing', { channelId: finalMessage.channel_id, messageId: finalMessage.id });
                        }
                    });
                }
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
            }
        });
        
        socket.on('editMessage', async (data) => {
            const { messageId, newMessage, userId, projectId } = data;
            try {
                const [originalMessages] = await db.query('SELECT * FROM chat_messages WHERE id = ? AND user_id = ?', [messageId, userId]);
                if (originalMessages.length === 0) return; 
                
                await db.query(
                    'INSERT INTO edited_messages (original_message_id, original_message, edited_by_user_id) VALUES (?, ?, ?)',
                    [messageId, originalMessages[0].message, userId]
                );

                await db.query('UPDATE chat_messages SET message = ?, is_edited = TRUE WHERE id = ?', [newMessage, messageId]);

                const [updatedMessages] = await db.query(
                    `SELECT cm.*, u.username, u.profile_image_url, u.primary_color 
                     FROM chat_messages cm JOIN users u ON cm.user_id = u.id 
                     WHERE cm.id = ?`,
                    [messageId]
                );
                
                io.to(projectId).emit('messageEdited', updatedMessages[0]);
            } catch (error) { console.error('Error editing message:', error); }
        });

        socket.on('deleteMessage', async (data) => {
            const { messageId, userId, projectId } = data;
            try {
                const [messagesToDelete] = await db.query('SELECT * FROM chat_messages WHERE id = ? AND user_id = ?', [messageId, userId]);
                if (messagesToDelete.length === 0) return;
                
                await db.query(
                    'INSERT INTO deleted_messages (original_message_id, channel_id, user_id, message, attachment_url, original_created_at, deleted_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [...Object.values(messagesToDelete[0]), userId]
                );
                
                await db.query('DELETE FROM chat_messages WHERE id = ?', [messageId]);
                io.to(projectId).emit('messageDeleted', { messageId, channelId: messagesToDelete[0].channel_id });
            } catch (error) { console.error('Error deleting message:', error); }
        });
        
        socket.on('disconnect', () => {
            if (currentProjectId && currentUserId && onlineUsersByProject[currentProjectId]?.[currentUserId]) {
                onlineUsersByProject[currentProjectId][currentUserId].status = 'offline';
                io.to(currentProjectId).emit('updateOnlineUsers', getProjectUsers(currentProjectId));
                // Optionally remove the user after a delay
                setTimeout(() => {
                    if (onlineUsersByProject[currentProjectId]?.[currentUserId]?.status === 'offline') {
                        delete onlineUsersByProject[currentProjectId][currentUserId];
                        io.to(currentProjectId).emit('updateOnlineUsers', getProjectUsers(currentProjectId));
                    }
                }, 60000); // 1 minute
            }
        });
    });
};