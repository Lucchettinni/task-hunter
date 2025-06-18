// src/components/ProjectDetail/TeamChat/TeamChat.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Paper, Box, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import api from '../../../services/api';
import socket from '../../../services/socket';
import AuthContext from '../../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';
import UserList from './UserList';

const TeamChat = ({ projectId }) => {
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [userListOpen, setUserListOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchChannels = useCallback(async () => {
        try {
            const res = await api.get(`/chat/channels/${projectId}`);
            if (res.data.length === 0 && user.role === 'admin') {
                await api.post('/chat/channels', { project_id: projectId, name: 'general' });
                const newRes = await api.get(`/chat/channels/${projectId}`);
                setChannels(newRes.data);
                if (newRes.data.length > 0) setCurrentChannel(newRes.data[0]);
            } else {
                setChannels(res.data);
                if (res.data.length > 0 && !currentChannel) {
                    setCurrentChannel(res.data[0]);
                }
            }
        } catch (err) {
            setError('Failed to load channels.');
        } finally {
            setLoading(false);
        }
    }, [projectId, user.role, currentChannel]);


    useEffect(() => {
        fetchChannels();
    }, [projectId]);

    useEffect(() => {
        if (currentChannel) {
            setMessages([]);
            api.get(`/chat/messages/${currentChannel.id}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch messages", err));
        }
    }, [currentChannel]);

    useEffect(() => {
        if (!projectId || !user) return;
        
        socket.emit('joinProject', { projectId, userId: user.id, username: user.username });
        const messageListener = (newMessage) => {
            if (newMessage.channel_id === currentChannel?.id) {
                setMessages(prev => [...prev, newMessage]);
            }
        };
        const usersListener = (users) => setOnlineUsers(users);
        
        socket.on('receiveMessage', messageListener);
        socket.on('updateOnlineUsers', usersListener);
        return () => {
            socket.off('receiveMessage', messageListener);
            socket.off('updateOnlineUsers', usersListener);
        };
    }, [projectId, user, currentChannel]);

    const handleSendMessage = (messageText, attachmentUrl) => {
        const hasText = messageText && messageText.trim() !== '';
        const hasAttachment = attachmentUrl && attachmentUrl.trim() !== '';
        if (!hasText && !hasAttachment) return;
        
        socket.emit('sendMessage', {
            projectId,
            channelId: currentChannel.id,
            userId: user.id,
            message: messageText,
            attachment_url: attachmentUrl,
        });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;


    return (
        <Box sx={{ height: 'calc(100vh - 128px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    {/* Placeholder for future header content if needed */}
                </Box>
                <Tooltip title={userListOpen ? "Hide User List" : "Show User List"}>
                    <IconButton onClick={() => setUserListOpen(!userListOpen)}>
                        <PeopleIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                {/* Channel List (Fixed Width) */}
                <Box sx={{ width: '260px', height: '100%', borderRight: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                    <ChannelList
                        channels={channels}
                        currentChannel={currentChannel}
                        onSelectChannel={setCurrentChannel}
                        projectId={projectId}
                        onChannelCreated={fetchChannels}
                    />
                </Box>

                {/* Chat Window (Expands) */}
                <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                     {currentChannel ? (
                        <ChatWindow
                            key={currentChannel.id} // Add key to force re-mount on channel change
                            channel={currentChannel}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <Alert severity='info'>Select a channel to start chatting.</Alert>
                        </Box>
                    )}
                </Box>

                {/* Online User List (Fixed Width, Collapsible) */}
                {userListOpen && (
                    <Box sx={{ width: '260px', height: '100%', borderLeft: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                        <UserList users={onlineUsers} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TeamChat;