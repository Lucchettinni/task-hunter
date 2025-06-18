// src/components/ProjectDetail/Documentation/DocumentationTab.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import api from '../../../services/api';
import DocSection from './DocSection';
import AuthContext from '../../../contexts/AuthContext';

const defaultSections = [
    "Game Overview", "Game Mechanics", "Story & Lore", 
    "Art Direction", "Technical Specifications", "Development Timeline"
];

const DocumentationTab = ({ projectId }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchDocs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/documentation/project/${projectId}`);
            if (res.data.length === 0 && user.role === 'admin') {
                // If no sections exist and user is admin, create the default ones
                const creationPromises = defaultSections.map(title =>
                    api.post('/documentation', { project_id: projectId, title, content: '' })
                );
                await Promise.all(creationPromises);
                // Refetch after creating
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
        fetchDocs();
    }, [fetchDocs]);

    const handleAddNewSection = async () => {
        try {
            await api.post('/documentation', {project_id: projectId, title: 'New Section', content: ''});
            fetchDocs(); // Refresh the list
        } catch (error) {
            console.error("Failed to add new section", error)
        }
    }

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5">Game Design Document</Typography>
                {user.role === 'admin' && (
                    <Button variant="contained" onClick={handleAddNewSection}>Add New Section</Button>
                )}
            </Box>
            {sections.length > 0 ? (
                sections.map((section) => (
                    <DocSection key={section.id} section={section} onSave={fetchDocs} />
                ))
            ) : (
                <Typography>No documentation sections found.</Typography>
            )}
        </Box>
    );
};

export default DocumentationTab;