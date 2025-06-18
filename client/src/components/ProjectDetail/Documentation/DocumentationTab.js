// client/src/components/ProjectDetail/Documentation/DocumentationTab.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Paper, Divider } from '@mui/material';
import api from '../../../services/api';
import DocSection from './DocSection';
import AuthContext from '../../../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';

const defaultSections = [
    "Game Overview", "Game Mechanics", "Story & Lore", 
    "Art Direction", "Technical Specifications", "Development Timeline"
];

const DocumentationTab = ({ projectId }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchDocs = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const res = await api.get(`/documentation/project/${projectId}`);
            if (res.data.length === 0 && user.role === 'admin') {
                const creationPromises = defaultSections.map(title =>
                    api.post('/documentation', { project_id: projectId, title, content: '' })
                );
                await Promise.all(creationPromises);
                const newRes = await api.get(`/documentation/project/${projectId}`);
                setSections(newRes.data);
            } else {
                setSections(res.data);
            }
        } catch (err) {
            setError('Failed to fetch or create documentation.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId, user.role]);

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
        try {
            await api.delete(`/documentation/${sectionId}`);
            fetchDocs(); // Refresh list after deleting
        } catch (error) {
            setError('Failed to delete section.');
            console.error("Failed to delete section", error);
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress /></Box>;
    
    return (
        <Paper sx={{ p: 3 }} elevation={2}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5" component="h2">Game Design Document</Typography>
                {user.role === 'admin' && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewSection}>Add Section</Button>
                )}
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
                            onDelete={handleDeleteSection}
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