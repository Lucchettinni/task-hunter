// src/components/ProjectDetail/TaskBoard/TaskCard.js
import React, { useContext } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AuthContext from '../../../contexts/AuthContext';

const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
};

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const TaskCard = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (action) => {
        if(action === 'edit') onEdit(task);
        if(action === 'delete') onDelete(task.id);
        handleClose();
    }
    
    // Users can move tasks, admins can do more
    const canMoveTo = (status) => {
        if (task.status !== status) {
            onStatusChange(task.id, status)
        }
        handleClose();
    }

    return (
        <StyledCard>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div">
                        {task.title}
                    </Typography>
                     <IconButton size="small" onClick={handleClick}><MoreVertIcon /></IconButton>
                     <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('edit')}>Edit</MenuItem>}
                        {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('delete')}>Delete</MenuItem>}
                         {user.role === 'admin' && task.status === 'complete' && <MenuItem onClick={() => canMoveTo('to do')}>Re-open Task</MenuItem>}
                        <MenuItem disabled>Move to...</MenuItem>
                        <MenuItem onClick={() => canMoveTo('to do')} disabled={task.status === 'to do'}>To Do</MenuItem>
                        <MenuItem onClick={() => canMoveTo('in progress')} disabled={task.status === 'in progress'}>In Progress</MenuItem>
                        <MenuItem onClick={() => canMoveTo('complete')} disabled={task.status === 'complete'}>Complete</MenuItem>
                    </Menu>
                </Box>
                <Typography sx={{ mt: 1.5 }} color="text.secondary">
                    {task.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Chip
                        label={task.priority}
                        color={priorityColors[task.priority]}
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    {task.tags && task.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 1 }} />
                    ))}
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default TaskCard;