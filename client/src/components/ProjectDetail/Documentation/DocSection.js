// src/components/ProjectDetail/Documentation/DocSection.js
import React, { useState, useContext } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';

const DocSection = ({ section, onSave }) => {
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

    const isAdmin = user.role === 'admin';

    return (
        <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ width: '100%', flexShrink: 0 }}>
                    {/* Admins see an editable field, users see plain text */}
                    {isAdmin && isEditing ? (
                        <TextField
                            fullWidth
                            variant="standard"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevents accordion from toggling
                        />
                    ) : (
                        section.title
                    )}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {isAdmin && isEditing ? (
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
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
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                        {section.content || (isAdmin ? "Click 'Edit' to add content." : "No content yet.")}
                    </Typography>
                )}
                {/* The edit button is outside the editing form */}
                {isAdmin && !isEditing && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={() => setIsEditing(true)}>
                            Edit Section
                        </Button>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default DocSection;