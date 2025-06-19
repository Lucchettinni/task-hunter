// client/src/components/ProjectDetail/TeamChat/TeamChat.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Paper, Box, CircularProgress, Alert, Collapse } from '@mui/material';
import api from '../../../services/api';
import socket from '../../../services/socket';
import AuthContext from '../../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';
import UserList from './UserList';

const TeamChat = ({ projectId }) => {
    const [currentChannel, setCurrentChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const { user } = useContext(AuthContext);

    const [isUserListOpen, setIsUserListOpen] = useState(true);
    
    useEffect(() => {
        // When a new channel is selected, fetch its messages
        if (currentChannel) {
            setLoadingMessages(true);
            setMessages([]);
            api.get(`/chat/messages/${currentChannel.id}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch messages", err))
                .finally(() => setLoadingMessages(false));
        } else {
            setMessages([]);
        }
    }, [currentChannel]);

    useEffect(() => {
        if (!projectId || !user) return;
        
        socket.emit('joinProject', { projectId, userId: user.id, username: user.username });
        
        const receiveMessageListener = (newMessage) => {
            if (newMessage.channel_id === currentChannel?.id) {
                setMessages(prev => [...prev, newMessage]);
            }
        };

        const messageEditedListener = (editedMessage) => {
            if (editedMessage.channel_id === currentChannel?.id) {
                setMessages(prev => prev.map(msg => msg.id === editedMessage.id ? editedMessage : msg));
            }
        };

        const messageDeletedListener = ({ messageId, channelId }) => {
            if (channelId === currentChannel?.id) {
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
            }
        };
        const usersListener = (users) => setOnlineUsers(users);
        
        socket.on('receiveMessage', receiveMessageListener);
        socket.on('messageEdited', messageEditedListener);
        socket.on('messageDeleted', messageDeletedListener);
        socket.on('updateOnlineUsers', usersListener);

        return () => {
            socket.off('receiveMessage', receiveMessageListener);
            socket.off('messageEdited', messageEditedListener);
            socket.off('messageDeleted', messageDeletedListener);
            socket.off('updateOnlineUsers', usersListener);
        };
    }, [projectId, user, currentChannel]);

    const handleSendMessage = (messageText, attachmentUrl) => {
        if ((!messageText || !messageText.trim()) && (!attachmentUrl || !attachmentUrl.trim())) return;
        
        socket.emit('sendMessage', {
            projectId,
            channelId: currentChannel.id,
            userId: user.id,
            message: messageText,
            attachment_url: attachmentUrl,
        });
    };
    
    const handleEditMessage = (messageId, newMessage) => {
        socket.emit('editMessage', { messageId, newMessage, userId: user.id, projectId });
    };

    const handleDeleteMessage = (messageId) => {
        socket.emit('deleteMessage', { messageId, userId: user.id, projectId });
    };

    return (
        <Paper elevation={3} sx={{ height: 'calc(100vh - 220px)', width: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            <Box sx={{ borderRight: 1, borderColor: 'divider', width: { xs: '200px', sm: '240px', md: '280px' }, display: 'flex', flexDirection: 'column' }}>
                <ChannelList
                    projectId={projectId}
                    currentChannel={currentChannel}
                    onSelectChannel={setCurrentChannel}
                />
            </Box>
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                 {currentChannel ? (
                    <ChatWindow
                        key={currentChannel.id}
                        channel={currentChannel}
                        messages={messages}
                        loading={loadingMessages}
                        onSendMessage={handleSendMessage}
                        onEditMessage={handleEditMessage}
                        onDeleteMessage={handleDeleteMessage}
                        onToggleUserList={() => setIsUserListOpen(!isUserListOpen)}
                        isUserListOpen={isUserListOpen}
                    />
                ) : (
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                         <Alert severity='info'>Select a channel to start chatting.</Alert>
                    </Box>
                )}
            </Box>

            <Collapse in={isUserListOpen} orientation="horizontal" timeout="auto">
                <Box sx={{ 
                    borderLeft: 1, 
                    borderColor: 'divider', 
                    width: '280px', 
                    maxWidth: '280px', 
                    height: '100%',
                    display: { xs: 'none', md: 'block' }
                }}>
                    <UserList users={onlineUsers} />
                </Box>
            </Collapse>
        </Paper>
    );
};

export default TeamChat;