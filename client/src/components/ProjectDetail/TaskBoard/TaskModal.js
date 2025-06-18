// src/components/ProjectDetail/TaskBoard/TaskModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Box, Paper, Typography, TextField, Button, MenuItem, Chip, Stack } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const TaskModal = ({ open, onClose, onSave, task, projectId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [currentTag, setCurrentTag] = useState('');
    const [tags, setTags] = useState([]);

    // When the 'task' prop changes, populate the form
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setTags(task.tags || []);
        } else {
            // Reset form for 'Create' mode
            setTitle('');
            setDescription('');
            setPriority('medium');
            setTags([]);
        }
    }, [task, open]); // Re-run when the modal opens or the task changes

    const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag]);
            setCurrentTag('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags((currentTags) => currentTags.filter((tag) => tag !== tagToDelete));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            project_id: projectId,
            title,
            description,
            priority,
            tags,
            // If we are editing, we need to pass the current status back
            status: task ? task.status : 'to do',
        };
        onSave(taskData, task ? task.id : null);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={style}>
                <Typography variant="h6" component="h2">
                    {task ? 'Edit Task' : 'Create New Task'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="normal" required fullWidth label="Task Title"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="normal" fullWidth label="Description" multiline rows={4}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        select margin="normal" required fullWidth label="Priority"
                        value={priority} onChange={(e) => setPriority(e.target.value)}
                    >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                    </TextField>
                    
                    {/* Tagging UI */}
                    <Box sx={{ my: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField
                                size="small" label="Add a tag" value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <Button onClick={handleAddTag} sx={{ ml: 1 }}>Add</Button>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            {tags.map((tag) => (
                                <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />
                            ))}
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default TaskModal;