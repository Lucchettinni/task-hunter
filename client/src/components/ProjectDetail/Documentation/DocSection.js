// src/components/ProjectDetail/Documentation/DocSection.js
import React, { useState, useContext } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';

const DocSection = ({ section, onSave, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editedTitle, setEditedTitle] = useState(section.title);
    const [editedContent, setEditedContent] = useState(section.content);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedSection = { title: editedTitle, content: editedContent };
            await api.put(`/documentation/${section.id}`, updatedSection);
            onSave(); // Trigger a refetch in the parent component
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save section", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete the "${section.title}" section?`)) {
            onDelete(section.id);
        }
    }

    const isAdmin = user.role === 'admin';

    return (
        <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: 'bold' }}>
                    {section.title}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {isAdmin && isEditing ? (
                    <Box>
                        <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            label="Section Content"
                            variant="outlined"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsEditing(false)} disabled={loading} sx={{ mr: 1 }}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSave} disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', p: 1 }}>
                        {section.content || (isAdmin ? "This section is empty. Click 'Edit' to add content." : "No content yet.")}
                    </Typography>
                )}
                {isAdmin && !isEditing && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                         <Tooltip title="Delete Section">
                            <IconButton onClick={handleDelete} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Section">
                            <IconButton onClick={() => setIsEditing(true)} color="primary">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default DocSection;