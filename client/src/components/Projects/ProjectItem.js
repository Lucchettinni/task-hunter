// client/src/components/Projects/ProjectItem.js
import React, { useContext } from 'react';
import { Box, Typography, Button, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AuthContext from '../../contexts/AuthContext';
import BaseProjectCard from './BaseProjectCard';

const ProjectItem = ({ project, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleOpenProject = () => {
        navigate(`/project/${project.id}`);
    };

    const actionBtnStyles = {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 2,
        }
    };

    return (
        <BaseProjectCard onClick={handleOpenProject}>
            {/* Project Image or Placeholder */}
            {project.image_url ? (
                <CardMedia
                    component="img"
                    height="160"
                    image={project.image_url}
                    alt={project.title}
                    sx={{ objectFit: 'cover' }}
                />
            ) : (
                <Box
                    sx={{
                        height: 160,
                        minHeight: 160,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'grey.200',
                        color: 'grey.500',
                    }}
                >
                    <ImageIcon sx={{ fontSize: '4rem' }} />
                </Box>
            )}

            {/* Project Content with Padding */}
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box mb={2} flexGrow={1}>
                    <Typography variant="h6" component="h2" fontWeight={600} color="text.primary" mb={0.5}>
                        {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                        height: 40,
                        maxHeight: 40,
                        overflow: 'auto',
                        wordBreak: 'break-word',
                    }}>
                        {project.description}
                    </Typography>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mt: 'auto',
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mr: 2 }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="body2">{project.user_count || 0} members</Typography>
                    </Box>
                    {user?.role === 'admin' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                                startIcon={<EditIcon />}
                                sx={{...actionBtnStyles, color: 'primary.main', borderColor: 'primary.light', '&:hover': { bgcolor: 'primary.lighter' } }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                                startIcon={<DeleteIcon />}
                                sx={{...actionBtnStyles, color: 'error.main', borderColor: 'error.light', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                                Delete
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </BaseProjectCard>
    );
};

export default ProjectItem;