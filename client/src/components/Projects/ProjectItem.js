// src/components/Projects/ProjectItem.js
import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, Chip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../contexts/AuthContext';

// Add onEdit and onDelete props
const ProjectItem = ({ project, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleOpenProject = () => {
        navigate(`/project/${project.id}`);
    };
    
    const imageUrl = project.image_url || 'https://via.placeholder.com/345x140.png?text=Game+Project';

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img" height="140" image={imageUrl} alt={project.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">{project.title}</Typography>
                <Typography variant="body2" color="text.secondary">{project.description}</Typography>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                <Chip icon={<PeopleIcon />} label={project.user_count} sx={{ ml: 1 }} />
                <Box>
                    {user?.role === 'admin' && (
                        <>
                            {/* Call the onEdit prop when clicked */}
                            <IconButton onClick={() => onEdit(project)} color="primary">
                                <EditIcon />
                            </IconButton>
                            {/* Call the onDelete prop when clicked */}
                            <IconButton onClick={() => onDelete(project.id)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                    <Button size="small" variant="contained" onClick={handleOpenProject} sx={{ mr: 1 }}>
                        Open
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default ProjectItem;