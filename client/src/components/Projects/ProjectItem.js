// client/src/components/Projects/ProjectItem.js
import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image'; // Icon for placeholder
import AuthContext from '../../contexts/AuthContext';

const ProjectItem = ({ project, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleOpenProject = () => {
        navigate(`/project/${project.id}`);
    };

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
                boxShadow: 6,
            }
        }}>
            {project.image_url ? (
                <CardMedia
                    component="img"
                    height="140"
                    image={project.image_url}
                    alt={project.title}
                    sx={{ objectFit: 'cover' }}
                />
            ) : (
                <Box
                    sx={{
                        height: 140,
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
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">{project.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                    {project.description}
                </Typography>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', p: 2, pt: 0 }}>
                 <Chip 
                    icon={<PeopleIcon />} 
                    label={`${project.user_count || 0} Members`} 
                    variant="outlined"
                    size="small"
                />
                <Box>
                    {user?.role === 'admin' && (
                        <>
                            <Tooltip title="Edit Project">
                                <IconButton onClick={() => onEdit(project)} size="small">
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Project">
                                <IconButton onClick={() => onDelete(project.id)} size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    <Button size="small" variant="contained" onClick={handleOpenProject}>
                        Open
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default ProjectItem;