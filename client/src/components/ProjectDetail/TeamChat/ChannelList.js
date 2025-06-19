import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Menu, MenuItem, Collapse, CircularProgress, Alert, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import CategoryModal from './CategoryModal';
import ChannelModal from './ChannelModal';

// Component for a single draggable channel item
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
                        display: 'flex',
                        alignItems: 'center',
                        pl: 4,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: snapshot.isDragging ? 'action.hover' : (currentChannelId === channel.id ? 'primary.light' : 'transparent'),
                        color: currentChannelId === channel.id ? 'primary.contrastText' : 'text.primary',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            '.channel-actions': { opacity: 1 }
                        },
                    }}
                    onClick={() => onSelectChannel(channel)}
                >
                    <Typography variant="body2" component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>#</Typography>
                    <Typography variant="body1" sx={{flexGrow: 1}}>{channel.name}</Typography>
                    {user.role === 'admin' && (
                         <Box className="channel-actions" sx={{ opacity: 0 }}>
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                         </Box>
                    )}
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={handleEdit}>Edit</MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
                    </Menu>
                </Box>
            )}
        </Draggable>
    );
};

// Component for a single category section, which is also a droppable area
const CategorySection = ({ category, onSelectChannel, currentChannelId, onUpdate, projectId, onEditChannel }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isChannelModalOpen, setChannelModalOpen] = useState(false);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleEditCategory = async (name) => {
        try {
            await api.put(`/chat/categories/${category.id}`, { name });
            onUpdate();
        } catch (error) {
            console.error("Failed to edit category", error);
        }
        setCategoryModalOpen(false);
    };
    
    const handleDeleteCategory = async () => {
        handleMenuClose();
        if (window.confirm(`Are you sure you want to delete the "${category.name}" category? All channels inside will be permanently deleted.`)) {
            try {
                await api.delete(`/chat/categories/${category.id}`);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete category", error);
            }
        }
    };

    const handleCreateChannel = async (name) => {
         try {
            await api.post('/chat/channels', { project_id: projectId, name, category_id: category.id });
            onUpdate();
        } catch (error) {
            console.error("Failed to create channel", error);
        }
        setChannelModalOpen(false);
    };

     const handleDeleteChannel = async (channelId) => {
        if (window.confirm(`Are you sure you want to delete this channel?`)) {
            try {
                await api.delete(`/chat/channels/${channelId}`);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete channel", error);
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, mt: 1, "&:hover": { bgcolor: 'action.hover' }, borderRadius: 1 }}>
                <IconButton size="small" onClick={() => setIsOpen(!isOpen)} sx={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Typography variant="overline" sx={{ flexGrow: 1, fontWeight: 'bold' }} onClick={() => setIsOpen(!isOpen)}>{category.name}</Typography>
                {user.role === 'admin' && (
                    <>
                        <IconButton size="small" onClick={() => setChannelModalOpen(true)}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
                 <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => { setCategoryModalOpen(true); handleMenuClose(); }}>Edit Category</MenuItem>
                    <MenuItem onClick={handleDeleteCategory} sx={{ color: 'error.main' }}>Delete Category</MenuItem>
                </Menu>
            </Box>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Droppable droppableId={String(category.id)} type="channel">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps} sx={{minHeight: '10px'}}>
                            {category.channels.map((channel, index) => (
                                <DraggableChannel 
                                    key={channel.id} 
                                    channel={channel} 
                                    index={index} 
                                    onSelectChannel={onSelectChannel} 
                                    currentChannelId={currentChannelId}
                                    onEdit={onEditChannel}
                                    onDelete={handleDeleteChannel}
                                />
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </Collapse>
            <CategoryModal open={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleEditCategory} category={category} />
            <ChannelModal open={isChannelModalOpen} onClose={() => setChannelModalOpen(false)} onSave={handleCreateChannel} />
        </>
    );
};


// Main Component
const ChannelList = ({ projectId, onSelectChannel, currentChannel }) => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isChannelModalOpen, setChannelModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get(`/chat/channels/${projectId}`);
            setCategories(data);
            if(data.length > 0 && !currentChannel) {
                const firstCategoryWithChannels = data.find(c => c.channels.length > 0);
                if(firstCategoryWithChannels) {
                    onSelectChannel(firstCategoryWithChannels.channels[0]);
                } else {
                    onSelectChannel(null); // No channels exist
                }
            } else if (data.length === 0) {
                 onSelectChannel(null);
            }
        } catch (err) {
            setError('Failed to fetch channels.');
        } finally {
            setLoading(false);
        }
    }, [projectId, currentChannel, onSelectChannel]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleCreateCategory = async (name) => {
        try {
            await api.post('/chat/categories', { project_id: projectId, name });
            fetchData();
        } catch (error) {
            console.error("Failed to create category", error);
        }
        setCategoryModalOpen(false);
    };

    const handleEditChannel = (channel) => {
        setEditingChannel(channel);
        setChannelModalOpen(true);
    };

    const handleSaveChannel = async (name) => {
        try {
            await api.put(`/chat/channels/${editingChannel.id}`, { name });
            fetchData();
        } catch (error) {
            console.error("Failed to edit channel", error);
        }
        setChannelModalOpen(false);
        setEditingChannel(null);
    };
    
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const sourceCatId = source.droppableId;
        const destCatId = destination.droppableId;
        
        const newCategories = Array.from(categories);
        const sourceCatIndex = newCategories.findIndex(c => String(c.id) === sourceCatId);
        const destCatIndex = newCategories.findIndex(c => String(c.id) === destCatId);
        
        const [movedChannel] = newCategories[sourceCatIndex].channels.splice(source.index, 1);
        newCategories[destCatIndex].channels.splice(destination.index, 0, movedChannel);

        setCategories(newCategories);

        const channelId = parseInt(draggableId.split('-')[1]);
        api.put(`/chat/channels/order`, { channelId, categoryId: destCatId, sortOrder: destination.index })
            .catch(err => {
                console.error("Failed to update channel order", err);
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
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCategoryModalOpen(true)}>
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
                        onSelectChannel={onSelectChannel}
                        currentChannelId={currentChannel?.id}
                        onUpdate={fetchData}
                        projectId={projectId}
                        onEditChannel={handleEditChannel}
                    />
                )) : (
                    <Typography sx={{p: 2, textAlign: 'center', color: 'text.secondary'}}>
                        No categories created yet.
                    </Typography>
                )}
                </Box>
            </DragDropContext>
            <CategoryModal open={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleCreateCategory} />
            <ChannelModal open={isChannelModalOpen} onClose={() => setChannelModalOpen(false)} onSave={handleSaveChannel} channel={editingChannel}/>
        </Box>
    );
};

export default ChannelList;