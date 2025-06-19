// client/src/components/ProjectDetail/TeamChat/ChatWindow.js
import React, { useState, useRef, useEffect, useContext, useLayoutEffect, useCallback } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Chip, Alert, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PeopleIcon from '@mui/icons-material/People';
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

const ChatWindow = ({ channel, messages, onSendMessage, onEditMessage, onDeleteMessage, onToggleUserList, isUserListOpen, hasMoreMessages, onLoadMore, loading }) => {
    const { user } = useContext(AuthContext);
    const [newMessage, setNewMessage] = useState('');
    const [stagedAttachment, setStagedAttachment] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const messageContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const scrollHeightBeforeLoadRef = useRef(null);

    useEffect(() => {
        setNewMessage('');
        setStagedAttachment(null);
        setUploadError('');
    }, [channel]);

    useLayoutEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        if (scrollHeightBeforeLoadRef.current !== null) {
            // We have just loaded more messages.
            // Restore the scroll position to keep the user's view stable.
            container.scrollTop = container.scrollHeight - scrollHeightBeforeLoadRef.current;
            scrollHeightBeforeLoadRef.current = null; // Reset for the next load.
        } else {
            // This runs on initial load or when a new message is added.
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) return;

            // On the initial load (first page of messages), scroll to the bottom.
            if (messages.length > 0 && messages.length <= 30) {
                container.scrollTop = container.scrollHeight;
            }
            // If the last message is from the current user, scroll to bottom.
            else if (lastMessage.user_id === user.id) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [messages, user.id]);

    const handleScroll = useCallback(() => {
        const container = messageContainerRef.current;
        if (container && container.scrollTop === 0 && hasMoreMessages && !loading) {
            // User has scrolled to the top. Store the current scroll height before loading more.
            scrollHeightBeforeLoadRef.current = container.scrollHeight;
            onLoadMore();
        }
    }, [hasMoreMessages, loading, onLoadMore]);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);


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
            <Paper sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} square>
                <Typography variant="h6"># {channel.name}</Typography>
                <Tooltip title={isUserListOpen ? "Hide Members" : "Show Members"}>
                    <IconButton onClick={onToggleUserList} sx={{display: { xs: 'none', md: 'inline-flex' }}}>
                        <PeopleIcon color={isUserListOpen ? "primary" : "action"}/>
                    </IconButton>
                </Tooltip>
            </Paper>

            <Box ref={messageContainerRef} sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                {loading && messages.length === 0 && <CircularProgress />}
                {messages.map((msg) => (
                    <Message 
                        key={msg.id} 
                        msg={msg} 
                        isOwnMessage={msg.user_id === user.id}
                        onEditMessage={onEditMessage}
                        onDeleteMessage={onDeleteMessage}
                    />
                ))}
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