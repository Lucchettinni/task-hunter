// client/src/components/ProjectDetail/TaskBoard/TaskItem.js
import React, { useContext } from 'react';
import { Paper, Typography, Box, Chip, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AuthContext from '../../../contexts/AuthContext';
import CircleIcon from '@mui/icons-material/Circle';
import LowPriorityIcon from '@mui/icons-material/ArrowDownward';
import MediumPriorityIcon from '@mui/icons-material/Remove';
import HighPriorityIcon from '@mui/icons-material/ArrowUpward';

const priorityMap = {
    low: { label: 'Low', color: 'success', icon: <LowPriorityIcon fontSize="small"/> },
    medium: { label: 'Medium', color: 'warning', icon: <MediumPriorityIcon fontSize="small"/> },
    high: { label: 'High', color: 'error', icon: <HighPriorityIcon fontSize="small"/> },
};

const statusMap = {
    'to do': { label: 'To Do', color: 'default' },
    'in progress': { label: 'In Progress', color: 'info' },
    'complete': { label: 'Complete', color: 'success' },
};

const TaskItem = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

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

    const currentPriority = priorityMap[task.priority] || priorityMap.medium;
    const currentStatus = statusMap[task.status] || statusMap['to do'];

    return (
        <Paper elevation={2} sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { boxShadow: 6 } }}>
            <Tooltip title={`Priority: ${currentPriority.label}`}>
                <IconButton size="small" sx={{ color: `${currentPriority.color}.main`, cursor: 'default' }}>
                    {currentPriority.icon}
                </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip
                        icon={<CircleIcon sx={{ fontSize: 10 }} />}
                        label={currentStatus.label}
                        color={currentStatus.color}
                        size="small"
                    />
                    {task.tags?.map(tag => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                </Box>
            </Box>
            <IconButton onClick={handleClick}><MoreVertIcon /></IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('edit')}>Edit</MenuItem>}
                {user.role === 'admin' && <MenuItem onClick={() => handleMenuClick('delete')}>Delete</MenuItem>}
                {user.role === 'admin' && task.status === 'complete' && <MenuItem onClick={() => canMoveTo('to do')}>Re-open Task</MenuItem>}
                <MenuItem disabled>Move to...</MenuItem>
                <MenuItem onClick={() => canMoveTo('to do')} disabled={task.status === 'to do'}>To Do</MenuItem>
                <MenuItem onClick={() => canMoveTo('in progress')} disabled={task.status === 'in progress'}>In Progress</MenuItem>
                <MenuItem onClick={() => canMoveTo('complete')} disabled={task.status === 'complete'}>Complete</MenuItem>
            </Menu>
        </Paper>
    );
};

export default TaskItem;