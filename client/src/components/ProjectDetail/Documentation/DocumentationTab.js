// src/components/ProjectDetail/Documentation/DocumentationTab.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
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

    const fetchDocs = useCallback(async () => {
        try {
            setLoading(true);
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
        fetchDocs();
    }, [fetchDocs]);

    const handleAddNewSection = async () => {
        try {
            await api.post('/documentation', {project_id: projectId, title: 'New Section', content: 'Content for the new section.'});
            fetchDocs(); // Refresh the list
        } catch (error) {
            console.error("Failed to add new section", error)
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

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5">Game Design Document</Typography>
                {user.role === 'admin' && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewSection}>Add New Section</Button>
                )}
            </Box>
            {sections.length > 0 ? (
                sections.map((section) => (
                    <DocSection 
                        key={section.id} 
                        section={section} 
                        onSave={fetchDocs} 
                        onDelete={handleDeleteSection}
                    />
                ))
            ) : (
                <Typography>No documentation sections found.</Typography>
            )}
        </Box>
    );
};

export default DocumentationTab;