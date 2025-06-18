// src/components/Projects/EditProjectModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Box, Paper, Typography, TextField, Button } from '@mui/material';

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

const EditProjectModal = ({ open, handleClose, handleUpdateProject, project }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // When the modal opens with a project, populate the fields
        if (project) {
            setTitle(project.title);
            setDescription(project.description);
            setImageUrl(project.image_url || '');
        }
    }, [project, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdateProject(project.id, { title, description, image_url: imageUrl });
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Paper sx={style}>
                <Typography variant="h6" component="h2">
                    Edit Project
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="normal" required fullWidth label="Project Title"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="normal" fullWidth label="Description" multiline rows={4}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="normal" fullWidth label="Image URL"
                        value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Changes</Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default EditProjectModal;