// client/src/components/ProjectDetail/TaskBoard/TaskCard.js
import React, { useContext } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AuthContext from '../../../contexts/AuthContext';
import LowPriorityIcon from '@mui/icons-material/ArrowDownward';
import MediumPriorityIcon from '@mui/icons-material/Remove';
import HighPriorityIcon from '@mui/icons-material/ArrowUpward';

const priorityMap = {
    low: { label: 'Low', color: 'success', icon: <LowPriorityIcon fontSize="small"/> },
    medium: { label: 'Medium', color: 'warning', icon: <MediumPriorityIcon fontSize="small"/> },
    high: { label: 'High', color: 'error', icon: <HighPriorityIcon fontSize="small"/> },
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const currentPriority = priorityMap[task.priority] || priorityMap.medium;

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
    
    const canMoveTo = (status) => {
        if (task.status !== status) {
            onStatusChange(task.id, status)
        }
        handleClose();
    }

    return (
        <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div" sx={{flexGrow: 1, pr: 1, wordBreak: 'break-word'}}>
                        {task.title}
                    </Typography>
                    <IconButton size="small" onClick={handleClick}><MoreVertIcon /></IconButton>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('edit')}>Edit Details</MenuItem>}
                        <MenuItem disabled>Move to...</MenuItem>
                        <MenuItem onClick={() => canMoveTo('to do')} disabled={task.status === 'to do'}>To Do</MenuItem>
                        <MenuItem onClick={() => canMoveTo('in progress')} disabled={task.status === 'in progress'}>In Progress</MenuItem>
                        <MenuItem onClick={() => canMoveTo('complete')} disabled={task.status === 'complete'}>Complete</MenuItem>
                        {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('delete')} sx={{color: 'error.main'}}>Delete Task</MenuItem>}
                    </Menu>
                </Box>
                <Typography sx={{ mt: 1, mb: 2, minHeight: '40px' }} color="text.secondary">
                    {task.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                        icon={currentPriority.icon}
                        label={currentPriority.label}
                        color={currentPriority.color}
                        size="small"
                        variant="outlined"
                    />
                     <Box>
                        {task.tags && task.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ ml: 0.5 }} />
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TaskCard;