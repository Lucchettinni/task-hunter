// server/socket/index.js
const db = require('../db');

module.exports = function (io) {
    let onlineUsersByProject = {};

    const getProjectUsers = async (projectId) => {
        if (!onlineUsersByProject[projectId]) {
            onlineUsersByProject[projectId] = {};
        }

        try {
            const [usersFromDb] = await db.query(
                `SELECT u.id, u.username, u.role, u.profile_image_url, u.primary_color 
                 FROM users u 
                 JOIN project_users pu ON u.id = pu.user_id 
                 WHERE pu.project_id = ?`,
                [projectId]
            );

            const currentOnlineIds = new Set(Object.keys(onlineUsersByProject[projectId]).map(id => parseInt(id, 10)));

            for (const user of usersFromDb) {
                if (!onlineUsersByProject[projectId][user.id]) {
                    onlineUsersByProject[projectId][user.id] = { ...user, status: 'offline' };
                }
            }
            
            const dbUserIds = new Set(usersFromDb.map(u => u.id));
            for (const onlineUserId of currentOnlineIds) {
                if (!dbUserIds.has(onlineUserId)) {
                    delete onlineUsersByProject[projectId][onlineUserId];
                }
            }

        } catch (error) {
            console.error("Error fetching project users for socket list:", error);
        }

        return Object.values(onlineUsersByProject[projectId]).map(({ socketId, ...user }) => user);
    };

    io.on('connection', (socket) => {
        let currentProjectId = null;
        let currentUserId = null;

        socket.on('joinProject', async ({ projectId, user }) => {
            if (!user || !user.id) return;

            socket.join(projectId);
            currentProjectId = projectId;
            currentUserId = user.id;

            if (!onlineUsersByProject[projectId]) {
                onlineUsersByProject[projectId] = {};
            }
            onlineUsersByProject[projectId][user.id] = { ...user, socketId: socket.id, status: 'online' };
            
            const allProjectUsers = await getProjectUsers(projectId);
            io.to(projectId).emit('updateOnlineUsers', allProjectUsers);
        });

        const updateUserStatus = (status) => {
            if (currentProjectId && currentUserId && onlineUsersByProject[currentProjectId]?.[currentUserId]) {
                onlineUsersByProject[currentProjectId][currentUserId].status = status;
                getProjectUsers(currentProjectId).then(users => {
                     io.to(currentProjectId).emit('updateOnlineUsers', users);
                });
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
                    const onlineUsers = await getProjectUsers(projectId);
                    mentions.forEach(mentionedUsername => {
                         const targetUser = onlineUsers.find(u => u.username === mentionedUsername);
                         if (targetUser && onlineUsersByProject[projectId][targetUser.id] && targetUser.id !== userId) {
                            const targetSocketId = onlineUsersByProject[projectId][targetUser.id].socketId;
                            if (targetSocketId) {
                                io.to(targetSocketId).emit('receivePing', { channelId: finalMessage.channel_id, messageId: finalMessage.id });
                            }
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

                const messageToDelete = messagesToDelete[0];
                
                // FIX: Archive the message by explicitly mapping properties to prevent errors.
                await db.query(
                    'INSERT INTO deleted_messages (original_message_id, channel_id, user_id, message, attachment_url, original_created_at, deleted_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        messageToDelete.id,
                        messageToDelete.channel_id,
                        messageToDelete.user_id, // The original author's ID
                        messageToDelete.message,
                        messageToDelete.attachment_url,
                        messageToDelete.created_at,
                        userId // The ID of the user performing the deletion
                    ]
                );
                
                await db.query('DELETE FROM chat_messages WHERE id = ?', [messageId]);
                io.to(projectId).emit('messageDeleted', { messageId, channelId: messageToDelete.channel_id });
            } catch (error) { console.error('Error deleting message:', error); }
        });
        
        socket.on('disconnect', () => {
            if (currentProjectId && currentUserId) {
                updateUserStatus('offline');
            }
        });
    });
};