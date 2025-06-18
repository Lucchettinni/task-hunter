// src/components/Projects/ProjectList.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import AuthContext from '../../contexts/AuthContext';
import ProjectItem from './ProjectItem';
import ProjectModal from './ProjectModal';
import BaseProjectCard from './BaseProjectCard';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            setError('Failed to fetch projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleSaveProject = async (projectData) => {
        try {
            if (editingProject) {
                await api.put(`/projects/${editingProject.id}`, projectData);
            } else {
                await api.post('/projects', projectData);
            }
            handleCloseModal();
            fetchProjects();
        } catch (err) {
            console.error("Failed to save project", err);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks, documentation, and chat channels.')) {
            try {
                await api.delete(`/projects/${projectId}`);
                fetchProjects();
            } catch (err) {
                console.error("Failed to delete project", err);
                setError("Failed to delete the project.");
            }
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
    if (error && projects.length === 0) return <Container><Alert severity="error" sx={{ mt: 3 }}>{error}</Alert></Container>;

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Box sx={{
                mb: 4,
                p: 3,
                backgroundColor: 'background.paper',
                borderRadius: 4,
                boxShadow: 1
            }}>
                <Typography variant="h4" component="h1" fontWeight={700}>
                    Projects
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Select a project to continue or create a new one.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}>
                {projects.map((project) => (
                    <ProjectItem 
                        key={project.id}
                        project={project}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteProject}
                    />
                ))}

                {/* New Project Card */}
                {user?.role === 'admin' && (
                    <BaseProjectCard
                        onClick={handleOpenCreateModal}
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            border: '3px dashed',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <AddIcon sx={{ fontSize: '3rem' }} />
                        <Typography variant="h6" fontWeight={600}>New Project</Typography>
                    </BaseProjectCard>
                )}
            </Box>

            {projects.length === 0 && user?.role !== 'admin' && (
                 <Box sx={{ mt: 4, width: '100%' }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{textAlign: 'center'}}>
                        No projects found. An admin can create one to get started!
                    </Typography>
                </Box>
            )}

            <ProjectModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                handleSave={handleSaveProject}
                project={editingProject}
            />
        </Container>
    );
};

export default ProjectList;