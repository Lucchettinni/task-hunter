// server/socket/index.js
const db = require('../db');

module.exports = function (io) {
    // Structure: { projectId: { userId: { socketId: '...', username: '...' } } }
    let onlineUsersByProject = {};

    const getProjectUsers = (projectId) => {
        if (!onlineUsersByProject[projectId]) return [];
        // Return an array of { userId, username }
        return Object.entries(onlineUsersByProject[projectId]).map(([userId, data]) => ({
            userId,
            username: data.username,
        }));
    };

    io.on('connection', (socket) => {
        let currentProjectId = null;
        let currentUserId = null;

        // User joins a project room
        socket.on('joinProject', ({ projectId, userId, username }) => {
            socket.join(projectId);
            currentProjectId = projectId;
            currentUserId = userId;

            if (!onlineUsersByProject[projectId]) {
                onlineUsersByProject[projectId] = {};
            }
            onlineUsersByProject[projectId][userId] = { socketId: socket.id, username };
            
            // Broadcast updated user list to the project room
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
                    `SELECT cm.*, u.username 
                     FROM chat_messages cm JOIN users u ON cm.user_id = u.id 
                     WHERE cm.id = ?`,
                    [result.insertId]
                );

                io.to(projectId).emit('receiveMessage', newMessage[0]);
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
            }
        });
        
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