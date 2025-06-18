// src/components/Projects/ProjectModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Paper } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ProjectModal = ({ open, handleClose, handleSave, project }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // If a 'project' prop is passed, we're in "Edit" mode.
    // Populate the form with the project's data when the modal opens.
    useEffect(() => {
        if (project) {
            setTitle(project.title || '');
            setDescription(project.description || '');
            setImageUrl(project.image_url || '');
        } else {
            // Otherwise, we're in "Create" mode. Clear the form.
            setTitle('');
            setDescription('');
            setImageUrl('');
        }
    }, [project, open]);

    const onFormSubmit = (e) => {
        e.preventDefault();
        const projectData = { title, description, image_url: imageUrl };
        handleSave(projectData);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Paper sx={style}>
                <Typography variant="h6" component="h2">
                    {project ? 'Edit Project' : 'Create New Project'}
                </Typography>
                <Box component="form" onSubmit={onFormSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="normal" required fullWidth label="Project Title"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="normal" fullWidth label="Description" multiline rows={4}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="normal" fullWidth label="Image URL (optional)"
                        value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default ProjectModal;