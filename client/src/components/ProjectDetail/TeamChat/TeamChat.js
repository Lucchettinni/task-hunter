// client/src/components/ProjectDetail/TeamChat/TeamChat.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Paper, Box, CircularProgress, Alert, Grid } from '@mui/material';
import api from '../../../services/api';
import socket from '../../../services/socket';
import AuthContext from '../../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';
import UserList from './UserList';
import ChannelModal from './ChannelModal';

const TeamChat = ({ projectId }) => {
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    // State for channel modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);

    const fetchChannels = useCallback(async () => {
        try {
            const res = await api.get(`/chat/channels/${projectId}`);
            setChannels(res.data);
            if (res.data.length > 0 && !currentChannel) {
                setCurrentChannel(res.data[0]);
            } else if (res.data.length === 0) {
                setCurrentChannel(null);
            }
        } catch (err) {
            setError('Failed to load channels.');
        } finally {
            setLoading(false);
        }
    }, [projectId, currentChannel]);

    useEffect(() => {
        fetchChannels();
    }, [projectId]);

    useEffect(() => {
        if (currentChannel) {
            setLoading(true);
            setMessages([]);
            api.get(`/chat/messages/${currentChannel.id}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch messages", err))
                .finally(() => setLoading(false));
        }
    }, [currentChannel]);

    useEffect(() => {
        if (!projectId || !user) return;
        
        socket.emit('joinProject', { projectId, userId: user.id, username: user.username, role: user.role });
        
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
        if ((!messageText || !messageText.trim()) && (!attachmentUrl || !attachmentUrl.trim())) return;
        
        socket.emit('sendMessage', {
            projectId,
            channelId: currentChannel.id,
            userId: user.id,
            message: messageText,
            attachment_url: attachmentUrl,
        });
    };

    // --- Channel Modal Handlers ---
    const handleOpenCreateModal = () => {
        setEditingChannel(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (channel) => {
        setEditingChannel(channel);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingChannel(null);
    };

    const handleSaveChannel = async (name) => {
        try {
            if (editingChannel) {
                await api.put(`/chat/channels/${editingChannel.id}`, { name });
            } else {
                await api.post('/chat/channels', { project_id: projectId, name });
            }
            fetchChannels();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save channel", err);
            setError(err.response?.data?.message || 'Failed to save channel.');
        }
    };
    
    const handleDeleteChannel = async (channelId) => {
        if (window.confirm("Are you sure you want to delete this channel? All messages within it will be permanently lost.")) {
            try {
                await api.delete(`/chat/channels/${channelId}`);
                // If the deleted channel was the current one, reset it.
                if (currentChannel?.id === channelId) {
                    setCurrentChannel(null);
                }
                fetchChannels();
            } catch (err) {
                console.error("Failed to delete channel", err);
                setError(err.response?.data?.message || 'Failed to delete channel.');
            }
        }
    };

    return (
        <Paper elevation={3} sx={{ height: 'calc(100vh - 220px)', width: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            <Grid container sx={{height: '100%'}}>
                <Grid item xs={12} sm={3} md={2.5} sx={{ borderRight: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <ChannelList
                        channels={channels}
                        currentChannel={currentChannel}
                        onSelectChannel={setCurrentChannel}
                        onAdd={handleOpenCreateModal}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteChannel}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={7} sx={{ height: '100%' }}>
                     {currentChannel ? (
                        <ChatWindow
                            key={currentChannel.id}
                            channel={currentChannel}
                            messages={messages}
                            loading={loading}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            {loading ? <CircularProgress /> : <Alert severity='info'>Select a channel to start chatting, or an admin can create one.</Alert>}
                        </Box>
                    )}
                </Grid>

                <Grid item xs={12} sm={3} md={2.5} sx={{ borderLeft: '1px solid', borderColor: 'divider', height: '100%', display: { xs: 'none', sm: 'block' } }}>
                    <UserList users={onlineUsers} />
                </Grid>
            </Grid>
            
            <ChannelModal 
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveChannel}
                channel={editingChannel}
            />
        </Paper>
    );
};

export default TeamChat;