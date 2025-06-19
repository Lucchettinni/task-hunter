// client/src/components/ProjectDetail/Documentation/DocumentationTab.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import api from '../../../services/api';
import DocSection from './DocSection';
import AuthContext from '../../../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

const DocumentationTab = ({ projectId }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchDocs = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const res = await api.get(`/documentation/project/${projectId}`);
            setSections(res.data);
        } catch (err) {
            setError('Failed to fetch documentation.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchDocs(true);
    }, [fetchDocs]);

    const handleAddNewSection = async () => {
        try {
            await api.post('/documentation', {project_id: projectId, title: 'New Section', content: 'Content for the new section.'});
            fetchDocs(); // Refresh the list
        } catch (error) {
            setError('Failed to add new section.');
            console.error("Failed to add new section", error);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            try {
                await api.delete(`/documentation/${sectionId}`);
                fetchDocs(); // Refresh list after deleting
            } catch (error) {
                setError('Failed to delete section.');
                console.error("Failed to delete section", error);
            }
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress /></Box>;
    
    return (
        <Paper sx={{ p: 3 }} elevation={2}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5" component="h2">Game Design Document</Typography>
                <Box>
                    {user.role === 'admin' && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewSection} sx={{ mr: 1 }}>Add Section</Button>
                    )}
                    <Tooltip title="Refresh Documentation">
                        <IconButton onClick={() => fetchDocs(true)}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {sections.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {sections.map((section) => (
                        <DocSection 
                            key={section.id} 
                            section={section} 
                            onSave={fetchDocs} 
                            onDelete={() => handleDeleteSection(section.id)}
                        />
                    ))}
                </Box>
            ) : (
                <Typography>No documentation sections found. An admin can add one to get started.</Typography>
            )}
        </Paper>
    );
};

export default DocumentationTab;