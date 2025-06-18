// src/components/Projects/ProjectList.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import AuthContext from '../../contexts/AuthContext';
import ProjectItem from './ProjectItem';
import ProjectModal from './ProjectModal';

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
            
            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item key={project.id} xs={12} md={6} lg={4}>
                        <ProjectItem 
                            project={project}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDeleteProject}
                        />
                    </Grid>
                ))}

                {/* New Project Card */}
                {user?.role === 'admin' && (
                     <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            onClick={handleOpenCreateModal}
                            sx={{
                                height: 350, // Set a fixed height to match ProjectItem
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 1,
                                borderRadius: 4,
                                border: '3px dashed',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    bgcolor: 'action.hover',
                                    boxShadow: 4,
                                }
                            }}
                        >
                            <AddIcon sx={{ fontSize: '3rem' }} />
                            <Typography variant="h6" fontWeight={600}>New Project</Typography>
                        </Paper>
                     </Grid>
                )}

                 {projects.length === 0 && user?.role !== 'admin' && (
                     <Grid item xs={12}>
                       <Typography variant="subtitle1" color="text.secondary" sx={{textAlign: 'center', mt: 4}}>
                           No projects found. An admin can create one to get started!
                        </Typography>
                    </Grid>
                )}
            </Grid>

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