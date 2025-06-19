// client/src/components/ProjectDetail/TeamChat/TeamChat.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Paper, Box, CircularProgress, Alert, Collapse } from '@mui/material';
import api from '../../../services/api';
import socket from '../../../services/socket';
import AuthContext from '../../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';
import UserList from './UserList';

const TeamChat = ({ projectId, onPing }) => { // Add onPing prop
    const [currentChannel, setCurrentChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagePage, setMessagePage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const { user } = useContext(AuthContext);

    const [isUserListOpen, setIsUserListOpen] = useState(true);
    
    const fetchMessages = useCallback(async (channelId, page) => {
        setLoadingMessages(true);
        try {
            const { data } = await api.get(`/chat/messages/${channelId}?page=${page}&limit=30`);
            setMessages(prev => (page === 1 ? data.messages : [...data.messages, ...prev]));
            setHasMoreMessages(data.hasMore);
            setMessagePage(page + 1);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        if (currentChannel) {
            setMessagePage(1);
            setHasMoreMessages(true);
            setMessages([]);
            fetchMessages(currentChannel.id, 1);
        } else {
            setMessages([]);
        }
    }, [currentChannel, fetchMessages]);

    useEffect(() => {
        if (!projectId || !user) return;
        
        socket.emit('joinProject', { projectId, user });

        const handleVisibilityChange = () => {
            if (document.hidden) {
                socket.emit('userInactive');
            } else {
                socket.emit('userActive');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
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
        const pingListener = ({ channelId }) => {
            if (channelId !== currentChannel?.id) {
                onPing(channelId);
            }
        };
        
        socket.on('receiveMessage', receiveMessageListener);
        socket.on('messageEdited', messageEditedListener);
        socket.on('messageDeleted', messageDeletedListener);
        socket.on('updateOnlineUsers', usersListener);
        socket.on('receivePing', pingListener);

        return () => {
            socket.off('receiveMessage', receiveMessageListener);
            socket.off('messageEdited', messageEditedListener);
            socket.off('messageDeleted', messageDeletedListener);
            socket.off('updateOnlineUsers', usersListener);
            socket.off('receivePing', pingListener);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socket.emit('userInactive');
        };
    }, [projectId, user, currentChannel, onPing]);

    const handleSendMessage = (messageText, attachmentUrl) => {
        const hasText = messageText && messageText.trim() !== '';
        const hasAttachment = attachmentUrl && attachmentUrl.trim() !== '';
        if (!hasText && !hasAttachment) return;
        
        const mentionRegex = /@(\w+)/g;
        const mentions = [...messageText.matchAll(mentionRegex)].map(match => match[1]);

        socket.emit('sendMessage', {
            projectId,
            channelId: currentChannel.id,
            userId: user.id,
            message: messageText,
            attachment_url: attachmentUrl,
            mentions: [...new Set(mentions)] // Send unique mentions
        });
    };
    
    const handleEditMessage = (messageId, newMessage) => {
        socket.emit('editMessage', { messageId, newMessage, userId: user.id, projectId });
    };

    const handleDeleteMessage = (messageId) => {
        socket.emit('deleteMessage', { messageId, userId: user.id, projectId });
    };
    
    const loadMoreMessages = () => {
        if (!loadingMessages && hasMoreMessages) {
            fetchMessages(currentChannel.id, messagePage);
        }
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
                        hasMoreMessages={hasMoreMessages}
                        onLoadMore={loadMoreMessages}
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