// client/src/components/ProjectDetail/TeamChat/ChannelList.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Menu, MenuItem, Collapse, CircularProgress, Alert, Divider, Tooltip, useTheme, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AuthContext from '../../../contexts/AuthContext';
import socket from '../../../services/socket';
import api from '../../../services/api';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { darken } from '@mui/material/styles';

import CategoryModal from './CategoryModal';
import ChannelModal from './ChannelModal';

// -- Sub-Components (DraggableChannel, CategorySection) --

const DraggableChannel = ({ channel, index, onSelectChannel, currentChannelId, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isSelected = currentChannelId === channel.id;

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = (event) => {
        if (event) event.stopPropagation();
        setAnchorEl(null);
    };

    const handleEdit = (e) => { onEdit(channel); handleMenuClose(e); };
    const handleDelete = (e) => { onDelete(channel.id); handleMenuClose(e); };

    return (
        <Draggable draggableId={`channel-${channel.id}`} index={index} isDragDisabled={user.role !== 'admin'}>
            {(provided, snapshot) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onSelectChannel(channel)}
                    sx={{
                        display: 'flex', alignItems: 'center', pl: 2, pr: 1, py: 0.5,
                        borderRadius: 1.5, mb: 0.5, cursor: 'pointer',
                        backgroundColor: snapshot.isDragging ? 'action.hover' : (isSelected ? theme.palette.primary.light : 'transparent'),
                        color: isSelected ? theme.palette.primary.contrastText : 'text.primary',
                        '&:hover': {
                            backgroundColor: isSelected ? darken(theme.palette.primary.light, 0.1) : theme.palette.action.hover,
                            '.channel-actions': { opacity: 1 }
                        },
                    }}
                >
                    {user.role === 'admin' && <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', pr: 1, color: 'text.disabled' }}><DragIndicatorIcon fontSize="small" /></Box>}
                    <Typography variant="body2" component="span" sx={{ mr: 0.5, color: isSelected ? theme.palette.primary.contrastText : 'text.secondary' }}>#</Typography>
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

const CategorySection = ({ category, channels, currentChannelId, onSelectChannel, onEditChannel, onDeleteChannel, onAddChannel, onEditCategory, onDeleteCategory, dragHandleProps, isDragging }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => { event.stopPropagation(); setAnchorEl(event.currentTarget); };
    const handleMenuClose = () => setAnchorEl(null);

    return (
        <Paper elevation={isDragging ? 4 : 0} sx={{ backgroundColor: 'transparent' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, mt: 1, "&:hover": { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                <IconButton size="small" onClick={() => setIsOpen(!isOpen)} sx={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Box {...(user.role === 'admin' ? dragHandleProps : {})} sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: user.role === 'admin' ? 'grab' : 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
                    {user.role === 'admin' && <DragIndicatorIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} />}
                    <Typography variant="overline" sx={{ fontWeight: 'bold' }}>
                        {category.name}
                    </Typography>
                </Box>
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
                        <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: '10px', p: '0 8px' }}>
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
        </Paper>
    );
};

// -- Main ChannelList Component --

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

    useEffect(() => {
        const loadInitialData = async () => {
            const initialCategories = await fetchData(true);
            if (initialCategories && !currentChannel) {
                const firstCategoryWithChannels = initialCategories.find(c => c.channels && c.channels.length > 0);
                if (firstCategoryWithChannels) {
                    onSelectChannel(firstCategoryWithChannels.channels[0]);
                }
            }
        };
        loadInitialData();

        const handleStructureUpdate = () => {
            fetchData().then(newCategories => {
                if (currentChannel) {
                    let stillExists = false;
                    for (const cat of newCategories) {
                        const found = cat.channels.find(c => c.id === currentChannel.id);
                        if (found) {
                            stillExists = true;
                            if (found.name !== currentChannel.name) {
                                onSelectChannel(found);
                            }
                            break;
                        }
                    }
                    if (!stillExists) {
                        onSelectChannel(null);
                    }
                }
            });
        };
        socket.on('chat_structure_updated', handleStructureUpdate);
        return () => socket.off('chat_structure_updated', handleStructureUpdate);
    }, [projectId, fetchData, onSelectChannel, currentChannel]);


    const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === 'category' && source.index !== destination.index) {
            const newCategories = Array.from(categories);
            const [movedCategory] = newCategories.splice(source.index, 1);
            newCategories.splice(destination.index, 0, movedCategory);
            setCategories(newCategories);
            api.put('/chat/categories/reorder', {
                projectId,
                orderedCategoryIds: newCategories.map(c => c.id)
            }).catch(() => fetchData());
            return;
        }

        if (type === 'channel') {
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
            api.put('/chat/reorder', { projectId, orderData }).catch(() => fetchData());
        }
    };
    
    // Modal handling functions
    const handleOpenCreateCategory = () => { setEditingCategory(null); setCategoryModalOpen(true); };
    const handleOpenEditCategory = (category) => { setEditingCategory(category); setCategoryModalOpen(true); };
    const handleCloseCategoryModal = () => { setCategoryModalOpen(false); setEditingCategory(null); };

    const handleOpenCreateChannel = (categoryId) => { setEditingChannel(null); setTargetCategoryId(categoryId); setChannelModalOpen(true); };
    const handleOpenEditChannel = (channel) => { setEditingChannel(channel); setTargetCategoryId(null); setChannelModalOpen(true); };
    const handleCloseChannelModal = () => { setChannelModalOpen(false); setEditingChannel(null); setTargetCategoryId(null); };

    const handleSaveCategory = async (name) => {
        try {
            if (editingCategory) {
                await api.put(`/chat/categories/${editingCategory.id}`, { name });
            } else {
                await api.post('/chat/categories', { project_id: projectId, name });
            }
        } catch (err) { console.error("Failed to save category", err); }
        handleCloseCategoryModal();
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`Delete "${categoryName}" category and all its channels?`)) {
            try { await api.delete(`/chat/categories/${categoryId}`); } 
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
        } catch (err) { console.error("Failed to save channel", err); }
        handleCloseChannelModal();
    };

    const handleDeleteChannel = async (channelId) => {
        if (window.confirm(`Are you sure you want to delete this channel?`)) {
            try { await api.delete(`/chat/channels/${channelId}`); }
            catch (err) { console.error("Failed to delete channel", err); }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1 }}>
                <Typography variant="h6">Channels</Typography>
                {user.role === 'admin' && <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateCategory}>New Category</Button>}
            </Box>
            <Divider />

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-categories" type="category">
                    {(provided) => (
                        <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ flexGrow: 1, overflowY: 'auto', mt: 1 }}>
                            {categories.length > 0 ? categories.map((category, index) => (
                                <Draggable key={category.id} draggableId={`category-${category.id}`} index={index} isDragDisabled={user.role !== 'admin'}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps}>
                                            <CategorySection
                                                category={category}
                                                channels={category.channels}
                                                currentChannelId={currentChannel?.id}
                                                onSelectChannel={onSelectChannel}
                                                onAddChannel={handleOpenCreateChannel}
                                                onEditChannel={handleOpenEditChannel}
                                                onDeleteChannel={handleDeleteChannel}
                                                onEditCategory={handleOpenEditCategory}
                                                onDeleteCategory={handleDeleteCategory}
                                                dragHandleProps={provided.dragHandleProps}
                                                isDragging={snapshot.isDragging}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            )) : (
                                <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No categories created.</Typography>
                            )}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            <CategoryModal open={isCategoryModalOpen} onClose={handleCloseCategoryModal} onSave={handleSaveCategory} category={editingCategory} />
            <ChannelModal open={isChannelModalOpen} onClose={handleCloseChannelModal} onSave={handleSaveChannel} channel={editingChannel} />
        </Box>
    );
};

export default ChannelList;