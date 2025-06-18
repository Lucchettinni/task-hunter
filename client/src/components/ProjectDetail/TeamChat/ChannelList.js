// client/src/components/ProjectDetail/TeamChat/ChannelList.js
import React, { useState, useContext } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography, Button, Box, IconButton, Menu, MenuItem, Divider, Tooltip } from '@mui/material';
import AuthContext from '../../../contexts/AuthContext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';

const ChannelList = ({ channels, currentChannel, onSelectChannel, onAdd, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedChannelForMenu, setSelectedChannelForMenu] = useState(null);

    const handleMenuOpen = (event, channel) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedChannelForMenu(channel);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedChannelForMenu(null);
    };

    const handleEdit = () => {
        onEdit(selectedChannelForMenu);
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete(selectedChannelForMenu.id);
        handleMenuClose();
    };
    
    return (
        <Box sx={{p: 1, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                <Typography variant="h6">Channels</Typography>
                {user.role === 'admin' && (
                    <Tooltip title="Add New Channel">
                        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAdd}>
                            New
                        </Button>
                    </Tooltip>
                )}
            </Box>
            <Divider sx={{ my: 1 }} />
            <List sx={{flexGrow: 1, overflowY: 'auto'}}>
                {channels.map((channel) => (
                    <ListItem key={channel.id} disablePadding
                        secondaryAction={
                            user.role === 'admin' ? (
                                <IconButton edge="end" aria-label="options" onClick={(e) => handleMenuOpen(e, channel)}>
                                    <MoreVertIcon />
                                </IconButton>
                            ) : null
                        }
                    >
                        <ListItemButton
                            selected={currentChannel?.id === channel.id}
                            onClick={() => onSelectChannel(channel)}
                        >
                            <ListItemText primary={`# ${channel.name}`} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete} sx={{color: 'error.main'}}>Delete</MenuItem>
            </Menu>
        </Box>
    );
};

export default ChannelList;