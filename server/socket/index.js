// server/socket/index.js
const db = require('../db');

module.exports = function (io) {
    // Structure will now be: { projectId: { userId: { socketId: '...', ...fullUserObject } } }
    let onlineUsersByProject = {};

    // **MODIFICATION: This function now returns the full user objects.**
    const getProjectUsers = (projectId) => {
        if (!onlineUsersByProject[projectId]) return [];
        // Return an array of user objects, excluding their socketId.
        return Object.values(onlineUsersByProject[projectId]).map(({ socketId, ...user }) => user);
    };

    io.on('connection', (socket) => {
        let currentProjectId = null;
        let currentUserId = null;

        // **MODIFICATION: The 'joinProject' handler now expects a full 'user' object.**
        socket.on('joinProject', ({ projectId, user }) => {
            if (!user || !user.id) return; // Guard against incomplete data

            socket.join(projectId);
            currentProjectId = projectId;
            currentUserId = user.id;

            if (!onlineUsersByProject[projectId]) {
                onlineUsersByProject[projectId] = {};
            }
            // Store the full user object along with their socket ID
            onlineUsersByProject[projectId][user.id] = { ...user, socketId: socket.id };
            
            // Broadcast the updated, complete list of online users to the project room
            io.to(projectId).emit('updateOnlineUsers', getProjectUsers(projectId));
        });

        // Listen for new messages
        socket.on('sendMessage', async (data) => {
            const { projectId, channelId, userId, message, attachment_url } = data;
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

                io.to(projectId).emit('receiveMessage', newMessage[0]);
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
            }
        });

        // Listen for message edits
        socket.on('editMessage', async (data) => {
            const { messageId, newMessage, userId, projectId } = data;
            try {
                // First, get the original message to save it
                const [originalMessages] = await db.query('SELECT * FROM chat_messages WHERE id = ? AND user_id = ?', [messageId, userId]);
                if (originalMessages.length === 0) {
                    // Message doesn't exist or user doesn't have permission
                    return; 
                }
                const originalMessage = originalMessages[0];
                
                // Save the original message to the edited_messages table
                await db.query(
                    'INSERT INTO edited_messages (original_message_id, original_message, edited_by_user_id) VALUES (?, ?, ?)',
                    [messageId, originalMessage.message, userId]
                );

                // Update the message in the chat_messages table
                await db.query(
                    'UPDATE chat_messages SET message = ?, is_edited = TRUE WHERE id = ?',
                    [newMessage, messageId]
                );

                // Fetch the updated message to broadcast
                const [updatedMessages] = await db.query(
                    `SELECT cm.*, u.username, u.profile_image_url, u.primary_color 
                     FROM chat_messages cm JOIN users u ON cm.user_id = u.id 
                     WHERE cm.id = ?`,
                    [messageId]
                );
                
                // Broadcast the updated message
                io.to(projectId).emit('messageEdited', updatedMessages[0]);
            } catch (error) {
                console.error('Error editing message:', error);
            }
        });

        // Listen for message deletions
        socket.on('deleteMessage', async (data) => {
            const { messageId, userId, projectId } = data;
            try {
                // Get the message to be deleted
                const [messagesToDelete] = await db.query('SELECT * FROM chat_messages WHERE id = ? AND user_id = ?', [messageId, userId]);
                 if (messagesToDelete.length === 0) {
                    // Message doesn't exist or user doesn't have permission
                    return;
                }
                const messageToDelete = messagesToDelete[0];

                // Move the message to the deleted_messages table
                await db.query(
                    'INSERT INTO deleted_messages (original_message_id, channel_id, user_id, message, attachment_url, original_created_at, deleted_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        messageToDelete.id,
                        messageToDelete.channel_id,
                        messageToDelete.user_id,
                        messageToDelete.message,
                        messageToDelete.attachment_url,
                        messageToDelete.created_at,
                        userId
                    ]
                );
                
                // Delete the message from the chat_messages table
                await db.query('DELETE FROM chat_messages WHERE id = ?', [messageId]);

                // Broadcast the ID of the deleted message
                io.to(projectId).emit('messageDeleted', { messageId, channelId: messageToDelete.channel_id });
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        });
        
        // **MODIFICATION: The disconnect handler logic is correct and needs no changes.**
        socket.on('disconnect', () => {
            if (currentProjectId && currentUserId) {
                const projectUsers = onlineUsersByProject[currentProjectId];
                if (projectUsers && projectUsers[currentUserId]) {
                    delete projectUsers[currentUserId];
                    // Broadcast updated user list
                    io.to(currentProjectId).emit('updateOnlineUsers', getProjectUsers(currentProjectId));
                }
            }
        });
    });
};