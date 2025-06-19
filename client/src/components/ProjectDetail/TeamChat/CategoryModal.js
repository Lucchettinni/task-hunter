// client/src/components/ProjectDetail/TeamChat/CategoryModal.js
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

const CategoryModal = ({ open, onClose, onSave, category }) => {
    const [name, setName] = useState('');

    const isEditing = Boolean(category);

    useEffect(() => {
        if (isEditing) {
            setName(category.name || '');
        } else {
            setName('');
        }
    }, [category, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={style}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    {isEditing ? 'Edit Category' : 'Create New Category'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {isEditing ? 'Save Changes' : 'Create'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Modal>
    );
};

export default CategoryModal;