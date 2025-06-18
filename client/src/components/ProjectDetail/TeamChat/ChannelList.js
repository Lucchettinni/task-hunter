// src/components/ProjectDetail/TeamChat/ChannelList.js
import React, { useState, useContext } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography, TextField, Button, Box } from '@mui/material';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';

const ChannelList = ({ channels, currentChannel, onSelectChannel, projectId, onChannelCreated }) => {
    const { user } = useContext(AuthContext);
    const [newChannelName, setNewChannelName] = useState('');

    const handleCreateChannel = async () => {
        if (newChannelName.trim() === '') return;
        try {
            await api.post('/chat/channels', { project_id: projectId, name: newChannelName });
            setNewChannelName('');
            onChannelCreated(); // Tell the parent to refetch channels
        } catch (error) {
            console.error('Failed to create channel', error);
        }
    };
    
    return (
        <Box sx={{p: 1, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h6" sx={{p: 1}}>Channels</Typography>
            <List sx={{flexGrow: 1}}>
                {channels.map((channel) => (
                    <ListItem key={channel.id} disablePadding>
                        <ListItemButton
                            selected={currentChannel?.id === channel.id}
                            onClick={() => onSelectChannel(channel)}
                        >
                            <ListItemText primary={`# ${channel.name}`} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {user.role === 'admin' && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Create new channel"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateChannel()}
                    />
                    <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={handleCreateChannel}>Create</Button>
                </Box>
            )}
        </Box>
    );
};

export default ChannelList;