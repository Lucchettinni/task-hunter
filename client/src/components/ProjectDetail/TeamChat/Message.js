// src/components/ProjectDetail/TeamChat/Message.js
import React from 'react';
import { Box, Paper, Typography, Link } from '@mui/material';

// Function to check if a URL points to an image
const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);

const BACKEND_URL = 'http://localhost:5000';

const Attachment = ({ url }) => {
    // Prepend backend URL to the relative path
    const fullUrl = `${BACKEND_URL}${url}`;
    const filename = url.split('/').pop();

    if (isImage(url)) {
        // Use the fullUrl for the image source
        return <img src={fullUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />;
    }
    
    // Use the fullUrl for the download link
    return (
        <Link href={fullUrl} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>
            {filename}
        </Link>
    );
};

const Message = ({ msg, isOwnMessage }) => {
    // Format the timestamp to be more readable
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
            mb: 2,
        }}>
            <Box>
                 <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    display: 'block',
                    textAlign: isOwnMessage ? 'right' : 'left',
                    mx: 1.5
                }}>
                    {msg.username}
                </Typography>
                <Paper elevation={2} sx={{
                    p: 1.5,
                    backgroundColor: isOwnMessage ? 'primary.main' : 'background.paper',
                    color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                    maxWidth: '500px',
                    borderRadius: isOwnMessage ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                }}>
                    {/* Render the message text if it exists */}
                    {msg.message && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</Typography>}
                    {/* Render the attachment if it exists */}
                    {msg.attachment_url && <Attachment url={msg.attachment_url} />}
                </Paper>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: isOwnMessage ? 'right' : 'left', mx: 1.5, mt: 0.5 }}>
                    {time}
                </Typography>
            </Box>
        </Box>
    );
};

export default Message;