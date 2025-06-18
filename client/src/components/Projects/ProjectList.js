// src/components/Projects/ProjectList.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Typography, Fab, Box, CircularProgress, Alert, Paper, Divider } from '@mui/material';
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
        <Container sx={{ py: 4 }}>
            <Paper sx={{ p: 4, mb: 4 }} elevation={2}>
                 <Typography variant="h3" component="h1" gutterBottom>
                    Welcome Hub
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Select a project to continue or create a new one to get started.
                </Typography>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={4}>
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <Grid item key={project.id} xs={12} sm={6} md={4}>
                            <ProjectItem 
                                project={project}
                                onEdit={handleOpenEditModal}
                                onDelete={handleDeleteProject}
                            />
                        </Grid>
                    ))
                ) : (
                     <Grid item xs={12}>
                       <Typography variant="subtitle1" color="text.secondary" sx={{textAlign: 'center', mt: 4}}>
                           No projects found. An admin can create one to get started!
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {user?.role === 'admin' && (
                <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={handleOpenCreateModal}>
                    <AddIcon />
                </Fab>
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