// client/src/components/ProjectDetail/Documentation/DocSection.js
import React, { useState, useContext } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, Box, CircularProgress, IconButton, Tooltip, Divider } from '@mui/material';
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
        <Accordion sx={{
            border: '1px solid',
            borderColor: 'divider',
            '&:not(:last-child)': {
                borderBottom: 0,
            },
            '&:before': {
                display: 'none',
            },
        }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-content-${section.id}`}
                id={`panel-header-${section.id}`}
                sx={{
                    backgroundColor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '& .MuiAccordionSummary-content': {
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mr: 1
                    }
                }}
            >
                <Typography variant="h6" component="div">{section.title}</Typography>
                 {isAdmin && !isEditing && (
                    <Box onClick={(e) => e.stopPropagation()}>
                         <Tooltip title="Edit Section">
                            <IconButton onClick={() => setIsEditing(true)} color="primary" size="small">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                         <Tooltip title="Delete Section">
                            <IconButton onClick={handleDelete} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
                {isEditing ? (
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            sx={{mb: 2}}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={12}
                            label="Section Content (Markdown supported)"
                            variant="outlined"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={() => setIsEditing(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" onClick={handleSave} disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', p: 1, fontFamily: 'monospace' }}>
                        {section.content || (isAdmin ? "This section is empty. Click the edit icon to add content." : "No content yet.")}
                    </Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default DocSection;