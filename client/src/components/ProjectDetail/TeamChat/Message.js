// client/src/components/ProjectDetail/TeamChat/Message.js
import React, { useState, useContext } from 'react';
import { Box, Paper, Typography, Link, Avatar, useTheme, IconButton, Menu, MenuItem, TextField, Button, Tooltip } from '@mui/material';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../../contexts/AuthContext';

// Helper functions to identify file types
const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
const isVideo = (url) => /\.(mp4|webm|ogv|mov)$/i.test(url);
const isAudio = (url) => /\.(mp3|wav|ogg|aac)$/i.test(url);

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Attachment = ({ url }) => {
    const fullUrl = `${BACKEND_URL}${url}`;
    const filename = url.split('/').pop();

    if (isImage(url)) {
        return (
            <Link href={fullUrl} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', mt: 1 }}>
                <img src={fullUrl} alt="attachment" style={{ maxWidth: '300px', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover' }} />
            </Link>
        );
    }
    
    // FIX: Add video player rendering
    if (isVideo(url)) {
        return (
            <video controls src={fullUrl} style={{ maxWidth: '300px', maxHeight: '250px', borderRadius: '12px', marginTop: '8px' }}>
                Your browser does not support the video tag.
            </video>
        );
    }

    // FIX: Add audio player rendering
    if (isAudio(url)) {
        return (
            <audio controls src={fullUrl} style={{ width: '300px', marginTop: '8px' }}>
                Your browser does not support the audio element.
            </audio>
        );
    }
    
    // Fallback for other file types
    return (
        <Paper variant="outlined" sx={{ mt: 1, p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderRadius: '12px', maxWidth: '300px' }}>
            <FilePresentIcon color="action" />
            <Link href={fullUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                {filename}
            </Link>
        </Paper>
    );
};

const Message = ({ msg, onEditMessage, onDeleteMessage }) => {
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(msg.message);

    const isOwnMessage = msg.user_id === user.id;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        onDeleteMessage(msg.id);
        handleMenuClose();
    };

    const handleEdit = () => {
        setIsEditing(true);
        handleMenuClose();
    };

    const handleSaveEdit = () => {
        if (editedMessage.trim() !== msg.message.trim()) {
            onEditMessage(msg.id, editedMessage);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedMessage(msg.message);
        setIsEditing(false);
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            mb: 2,
            gap: 1.5,
            p: 1,
            borderRadius: 2,
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
                '.message-actions': {
                    opacity: 1,
                }
            }
        }}>
            <Avatar src={msg.profile_image_url || ''} sx={{ bgcolor: msg.primary_color || 'primary.main', width: 40, height: 40, mt: 0.5 }}>
                {msg.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1 }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {msg.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary'}}>
                        {time}
                    </Typography>
                    {Boolean(msg.is_edited) && (
                        <Tooltip title="Edited">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                (edited)
                            </Typography>
                        </Tooltip>
                    )}
                </Box>
                
                {isEditing ? (
                    <Box sx={{width: '100%'}}>
                        <TextField
                            fullWidth
                            multiline
                            variant="outlined"
                            size="small"
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                        />
                        <Box sx={{mt: 1, display: 'flex', gap: 1}}>
                            <Button size="small" variant="contained" onClick={handleSaveEdit}>Save</Button>
                            <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                        </Box>
                    </Box>
                ) : (
                    <Paper elevation={0} sx={{
                        p: 1.5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                        color: 'text.primary',
                        maxWidth: '600px',
                        borderRadius: '12px',
                    }}>
                        {msg.message && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</Typography>}
                        {msg.attachment_url && <Attachment url={msg.attachment_url} />}
                    </Paper>
                )}
            </Box>
             {isOwnMessage && !isEditing && (
                <Box className="message-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                    <IconButton size="small" onClick={handleMenuClick}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{mr: 1}}/> Edit</MenuItem>
                        <MenuItem onClick={handleDelete} sx={{color: 'error.main'}}><DeleteIcon fontSize="small" sx={{mr: 1}}/> Delete</MenuItem>
                    </Menu>
                </Box>
            )}
        </Box>
    );
};

export default Message;