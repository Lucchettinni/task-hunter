// client/src/components/ProjectDetail/TaskBoard/TaskItem.js
import React, { useContext } from 'react';
import { Paper, Typography, Box, Chip, IconButton, Menu, MenuItem, Tooltip, useTheme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import AuthContext from '../../../contexts/AuthContext';
import LowPriorityIcon from '@mui/icons-material/ArrowDownward';
import MediumPriorityIcon from '@mui/icons-material/Remove';
import HighPriorityIcon from '@mui/icons-material/ArrowUpward';

const priorityMap = {
    low: { label: 'Low', color: 'success', icon: <LowPriorityIcon fontSize="inherit" /> },
    medium: { label: 'Medium', color: 'warning', icon: <MediumPriorityIcon fontSize="inherit" /> },
    high: { label: 'High', color: 'error', icon: <HighPriorityIcon fontSize="inherit" /> },
};

const statusMap = {
    'to do': { label: 'To Do', color: 'default' },
    'in progress': { label: 'In Progress', color: 'info' },
    'complete': { label: 'Complete', color: 'success' },
};

const TaskItem = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const isAdmin = user.role === 'admin';
    const isComplete = task.status === 'complete';

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleEditClick = () => {
        onEdit(task);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        onDelete(task.id);
        handleMenuClose();
    };

    const handleStatusChangeClick = (newStatus) => {
        onStatusChange(task.id, newStatus);
        handleMenuClose();
    }

    const renderProgressButton = () => {
        if (isComplete) {
            if (isAdmin) {
                return (
                    <Tooltip title="Re-open Task">
                        <IconButton onClick={() => handleStatusChangeClick('to do')} size="small">
                            <ReplayIcon />
                        </IconButton>
                    </Tooltip>
                );
            }
            return null; // Regular users can't re-open tasks
        }
        if (task.status === 'to do') {
            return (
                <Tooltip title="Start Task">
                    <IconButton onClick={() => handleStatusChangeClick('in progress')} size="small" color="primary">
                        <PlayCircleOutlineIcon />
                    </IconButton>
                </Tooltip>
            );
        }
        if (task.status === 'in progress') {
            return (
                <Tooltip title="Complete Task">
                    <IconButton onClick={() => handleStatusChangeClick('complete')} size="small" color="success">
                        <CheckCircleIcon />
                    </IconButton>
                </Tooltip>
            );
        }
        return null;
    };

    const tabColor = isComplete ? theme.palette.success.main : theme.palette.primary.main;
    const tabTextColor = isComplete ? theme.palette.success.contrastText : theme.palette.primary.contrastText;

    return (
        <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: tabColor,
                    color: tabTextColor
                }}
            >
                <Chip
                    icon={priorityMap[task.priority]?.icon}
                    label={priorityMap[task.priority]?.label}
                    size="small"
                    sx={{
                        color: tabTextColor,
                        '.MuiChip-icon': { color: tabTextColor },
                        border: `1px solid ${tabTextColor}`,
                        backgroundColor: 'transparent'
                    }}
                />
                <Chip
                    label={statusMap[task.status]?.label}
                    size="small"
                    sx={{
                        color: tabTextColor,
                        border: `1px solid ${tabTextColor}`,
                        backgroundColor: 'transparent'
                    }}
                />
                 {task.tags?.map(tag => (
                    <Chip key={tag} label={tag} size="small" sx={{
                        color: tabTextColor,
                        border: `1px solid ${tabTextColor}`,
                        backgroundColor: 'transparent'
                    }}/>
                ))}
            </Box>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {task.description || 'No description provided.'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {renderProgressButton()}
                    {isAdmin && (
                        <>
                            <Tooltip title="Edit Task">
                                <IconButton onClick={() => onEdit(task)} size="small">
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Task">
                                <IconButton onClick={() => onDelete(task.id)} size="small">
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default TaskItem;