// src/components/ProjectDetail/TeamChat/Message.js
import React from 'react';
import { Box, Paper, Typography, Link, Avatar, useTheme } from '@mui/material';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// A styled component for attachments
const Attachment = ({ url }) => {
    const fullUrl = `${BACKEND_URL}${url}`;
    const filename = url.split('/').pop();

    if (isImage(url)) {
        return (
            <Link href={fullUrl} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', mt: 1 }}>
                <img src={fullUrl} alt="attachment" style={{ maxWidth: '250px', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover' }} />
            </Link>
        );
    }
    
    return (
        <Paper variant="outlined" sx={{ mt: 1, p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilePresentIcon color="action" />
            <Link href={fullUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ flexGrow: 1 }}>
                {filename}
            </Link>
        </Paper>
    );
};

const Message = ({ msg }) => {
    const theme = useTheme();
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Simple avatar generator
    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start', // Always align to the left
            mb: 2,
            gap: 1.5,
        }}>
            <Avatar sx={{ bgcolor: stringToColor(msg.username), width: 40, height: 40, mt: 0.5 }}>
                {msg.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {msg.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary'}}>
                        {time}
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                    color: 'text.primary',
                    maxWidth: '600px',
                    borderRadius: '20px',
                    borderTopLeftRadius: '4px',
                }}>
                    {msg.message && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</Typography>}
                    {msg.attachment_url && <Attachment url={msg.attachment_url} />}
                </Paper>
            </Box>
        </Box>
    );
};

export default Message;