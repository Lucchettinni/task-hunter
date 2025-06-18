// src/components/ProjectDetail/TeamChat/ChatWindow.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Chip, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import AuthContext from '../../../contexts/AuthContext';
import Message from './Message';
import api from '../../../services/api';

const StagedAttachment = ({ file, url, onRemove, isUploading }) => (
    <Chip
        icon={isUploading ? <CircularProgress size={20} /> : undefined}
        label={file.name}
        onDelete={onRemove}
        color="primary"
        variant="outlined"
        sx={{ mb: 1 }}
    />
);

const ChatWindow = ({ channel, messages, onSendMessage }) => {
    const { user } = useContext(AuthContext);
    const [newMessage, setNewMessage] = useState('');
    const [stagedAttachment, setStagedAttachment] = useState(null); // {file, url, isUploading}
    const [uploadError, setUploadError] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Reset state when the channel changes
    useEffect(() => {
        setNewMessage('');
        setStagedAttachment(null);
        setUploadError('');
    }, [channel]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView();
    useEffect(scrollToBottom, [messages]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError('');
        setStagedAttachment({ file, url: null, isUploading: true });

        const formData = new FormData();
        formData.append('chat-attachment', file);

        try {
            const res = await api.post('/chat/upload', formData);
            setStagedAttachment({ file, url: res.data.filePath, isUploading: false });
        } catch (error) {
            console.error("File upload failed", error);
            setUploadError("File upload failed. Please try again.");
            setStagedAttachment(null);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeStagedAttachment = () => {
        setStagedAttachment(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const hasText = newMessage.trim() !== '';
        const hasAttachment = stagedAttachment && stagedAttachment.url;
        
        if (hasText || hasAttachment) {
            onSendMessage(newMessage, hasAttachment ? stagedAttachment.url : null);
            setNewMessage('');
            setStagedAttachment(null);
        }
    };

    const canSend = (newMessage.trim() !== '' || stagedAttachment?.url) && !stagedAttachment?.isUploading;

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }} square>
                <Typography variant="h6"># {channel.name}</Typography>
            </Paper>

            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                {messages.map((msg) => (
                    <Message key={msg.id} msg={msg} isOwnMessage={msg.user_id === user.id} />
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                {uploadError && <Alert severity="error" sx={{mb: 1}}>{uploadError}</Alert>}
                {stagedAttachment && (
                    <StagedAttachment
                        file={stagedAttachment.file}
                        url={stagedAttachment.url}
                        onRemove={removeStagedAttachment}
                        isUploading={stagedAttachment.isUploading}
                    />
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="file" ref={fileInputRef} onChange={handleFileSelect}
                        style={{ display: 'none' }} id={`file-input-${channel.id}`}
                    />
                    <IconButton component="label" htmlFor={`file-input-${channel.id}`} disabled={stagedAttachment?.isUploading}>
                        <AttachFileIcon />
                    </IconButton>
                    <TextField
                        fullWidth size="small" variant="outlined" placeholder={`Message #${channel.name}`}
                        value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        autoComplete="off"
                    />
                    <IconButton type="submit" color="primary" disabled={!canSend}>
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatWindow;