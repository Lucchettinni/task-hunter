import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Menu, MenuItem, Collapse, CircularProgress, Alert, Divider, Tooltip } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import CategoryModal from './CategoryModal';
import ChannelModal from './ChannelModal';

// DraggableChannel Component (No changes)
const DraggableChannel = ({ channel, index, onSelectChannel, currentChannelId, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        if (event) event.stopPropagation();
        setAnchorEl(null);
    };

    const handleEdit = (e) => {
        onEdit(channel);
        handleMenuClose(e);
    };

    const handleDelete = (e) => {
        onDelete(channel.id);
        handleMenuClose(e);
    };

    return (
        <Draggable draggableId={`channel-${channel.id}`} index={index}>
            {(provided, snapshot) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                        display: 'flex', alignItems: 'center', pl: 4, py: 0.5, borderRadius: 1, cursor: 'pointer',
                        backgroundColor: snapshot.isDragging ? 'action.hover' : (currentChannelId === channel.id ? 'primary.light' : 'transparent'),
                        color: currentChannelId === channel.id ? 'primary.contrastText' : 'text.primary',
                        '&:hover': { backgroundColor: 'action.hover', '.channel-actions': { opacity: 1 } },
                    }}
                    onClick={() => onSelectChannel(channel)}
                >
                    <Typography variant="body2" component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>#</Typography>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>{channel.name}</Typography>
                    {user.role === 'admin' && (
                        <Box className="channel-actions" sx={{ opacity: 0 }}>
                            <IconButton size="small" onClick={handleMenuOpen}><MoreVertIcon fontSize="small" /></IconButton>
                        </Box>
                    )}
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
                    </Menu>
                </Box>
            )}
        </Draggable>
    );
};

// CategorySection Component (No changes)
const CategorySection = ({ category, channels, currentChannelId, onSelectChannel, onEditChannel, onDeleteChannel, onAddChannel, onEditCategory, onDeleteCategory }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, mt: 1, "&:hover": { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                <IconButton size="small" onClick={() => setIsOpen(!isOpen)} sx={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Typography variant="overline" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                    {category.name}
                </Typography>
                {user.role === 'admin' && (
                    <>
                        <Tooltip title="Add Channel"><IconButton size="small" onClick={() => onAddChannel(category.id)}><AddIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Category Settings"><IconButton size="small" onClick={handleMenuOpen}><MoreVertIcon fontSize="small" /></IconButton></Tooltip>
                    </>
                )}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => { onEditCategory(category); handleMenuClose(); }}>Edit Category</MenuItem>
                    <MenuItem onClick={() => { onDeleteCategory(category.id, category.name); handleMenuClose(); }} sx={{ color: 'error.main' }}>Delete Category</MenuItem>
                </Menu>
            </Box>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Droppable droppableId={String(category.id)} type="channel">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: '10px' }}>
                            {channels.map((channel, index) => (
                                <DraggableChannel
                                    key={channel.id} channel={channel} index={index}
                                    onSelectChannel={onSelectChannel} currentChannelId={currentChannelId}
                                    onEdit={onEditChannel} onDelete={onDeleteChannel}
                                />
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </Collapse>
        </>
    );
};


// Main ChannelList Component
const ChannelList = ({ projectId, onSelectChannel, currentChannel }) => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [isChannelModalOpen, setChannelModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);
    const [targetCategoryId, setTargetCategoryId] = useState(null);

    // CHANGE: The `fetchData` function is now wrapped in a useCallback that ONLY depends on projectId.
    // This means the function itself won't be recreated on every render unless the project ID changes.
    const fetchData = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const { data } = await api.get(`/chat/channels/${projectId}`);
            setCategories(data);
            return data;
        } catch (err) {
            setError('Failed to fetch channels.');
            return null;
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [projectId]);

    // CHANGE: This useEffect now handles the INITIAL data load and channel selection.
    // It runs only once when the component is first mounted for a given project.
    // It no longer depends on `currentChannel` or `onSelectChannel`, which prevents it
    // from re-running every time you click a channel.
    useEffect(() => {
        const loadInitialData = async () => {
            const initialCategories = await fetchData(true);
            if (initialCategories) {
                const firstCategoryWithChannels = initialCategories.find(c => c.channels && c.channels.length > 0);
                if (firstCategoryWithChannels) {
                    onSelectChannel(firstCategoryWithChannels.channels[0]);
                } else {
                    onSelectChannel(null);
                }
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]); // This hook correctly runs only when the projectId changes.

    const handleOpenCreateCategory = () => { setEditingCategory(null); setCategoryModalOpen(true); };
    const handleOpenEditCategory = (category) => { setEditingCategory(category); setCategoryModalOpen(true); };
    const handleCloseCategoryModal = () => { setCategoryModalOpen(false); setEditingCategory(null); };

    const handleOpenCreateChannel = (categoryId) => { setEditingChannel(null); setTargetCategoryId(categoryId); setChannelModalOpen(true); };
    const handleOpenEditChannel = (channel) => { setEditingChannel(channel); setTargetCategoryId(null); setChannelModalOpen(true); };
    const handleCloseChannelModal = () => { setChannelModalOpen(false); setEditingChannel(null); setTargetCategoryId(null); };

    const handleSaveCategory = async (name) => {
        try {
            const payload = { project_id: projectId, name };
            if (editingCategory) {
                await api.put(`/chat/categories/${editingCategory.id}`, { name });
            } else {
                await api.post('/chat/categories', payload);
            }
            fetchData();
        } catch (err) { console.error("Failed to save category", err); }
        handleCloseCategoryModal();
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`Are you sure you want to delete the "${categoryName}" category and all its channels?`)) {
            try { await api.delete(`/chat/categories/${categoryId}`); await fetchData(); }
            catch (err) { console.error("Failed to delete category", err); }
        }
    };

    const handleSaveChannel = async (name) => {
        try {
            if (editingChannel) {
                await api.put(`/chat/channels/${editingChannel.id}`, { name });
            } else {
                await api.post('/chat/channels', { project_id: projectId, name, category_id: targetCategoryId });
            }
            await fetchData();
        } catch (err) { console.error("Failed to save channel", err); }
        handleCloseChannelModal();
    };
    
    const handleDeleteChannel = async (channelId) => {
        if (window.confirm(`Are you sure you want to delete this channel?`)) {
            try { 
                await api.delete(`/chat/channels/${channelId}`); 
                // If the deleted channel was the current one, select a new one or null
                if (currentChannel && currentChannel.id === channelId) {
                    onSelectChannel(null);
                }
                await fetchData(); 
            }
            catch (err) { console.error("Failed to delete channel", err); }
        }
    };
    
    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const newCategories = JSON.parse(JSON.stringify(categories));
        const sourceCat = newCategories.find(c => String(c.id) === source.droppableId);
        const destCat = newCategories.find(c => String(c.id) === destination.droppableId);
        if (!sourceCat || !destCat) return;

        const [movedChannel] = sourceCat.channels.splice(source.index, 1);
        destCat.channels.splice(destination.index, 0, movedChannel);
        
        setCategories(newCategories);

        const orderData = newCategories.map(cat => ({
            categoryId: cat.id,
            channels: cat.channels.map(chan => chan.id),
        }));
        
        api.put('/chat/reorder', { projectId, orderData })
            .catch(err => {
                console.error("Failed to update channel order:", err);
                fetchData();
            });
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}><CircularProgress size={30} /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{p: 1, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1 }}>
                <Typography variant="h6">Channels</Typography>
                {user.role === 'admin' && (
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateCategory}>
                        New Category
                    </Button>
                )}
            </Box>
            <Divider />
            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{flexGrow: 1, overflowY: 'auto', mt: 1}}>
                    {categories.length > 0 ? categories.map(category => (
                        <CategorySection 
                            key={category.id}
                            category={category}
                            channels={category.channels}
                            currentChannelId={currentChannel?.id}
                            onSelectChannel={onSelectChannel}
                            onAddChannel={handleOpenCreateChannel}
                            onEditChannel={handleOpenEditChannel}
                            onDeleteChannel={handleDeleteChannel}
                            onEditCategory={handleOpenEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                        />
                    )) : (
                        <Typography sx={{p: 2, textAlign: 'center', color: 'text.secondary'}}>
                            No categories created yet.
                        </Typography>
                    )}
                </Box>
            </DragDropContext>
            
            <CategoryModal open={isCategoryModalOpen} onClose={handleCloseCategoryModal} onSave={handleSaveCategory} category={editingCategory} />
            <ChannelModal open={isChannelModalOpen} onClose={handleCloseChannelModal} onSave={handleSaveChannel} channel={editingChannel} />
        </Box>
    );
};

export default ChannelList;