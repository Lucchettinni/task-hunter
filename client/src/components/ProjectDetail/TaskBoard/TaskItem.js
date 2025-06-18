// client/src/components/ProjectDetail/TaskBoard/TaskItem.js
import React, { useContext } from 'react';
import { Paper, Typography, Box, Chip, Button, useTheme, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AuthContext from '../../../contexts/AuthContext';

const priorityMap = {
    low: { label: 'Low', color: 'success.main' },
    medium: { label: 'Medium', color: 'warning.main' },
    high: { label: 'High', color: 'error.main' },
};

const statusMap = {
    'to do': { label: 'To Do', color: 'grey.500' },
    'in progress': { label: 'In Progress', color: 'info.main' },
    'complete': { label: 'Complete', color: 'success.main' },
};

const TaskItem = ({ task, onStatusChange, onEdit, onDelete }) => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    
    const isAdmin = user.role === 'admin';
    const isComplete = task.status === 'complete';

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(task);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(task.id);
    };

    const handleStatusChangeClick = (e, newStatus) => {
        e.stopPropagation();
        onStatusChange(task.id, newStatus);
    }
    
    const renderProgressButton = () => {
        if (isComplete) {
            if (isAdmin) {
                return (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<ReplayIcon />}
                        onClick={(e) => handleStatusChangeClick(e, 'to do')}
                        sx={{ backgroundColor: 'grey.500', '&:hover': { backgroundColor: 'grey.600' } }}
                    >
                        Re-open
                    </Button>
                );
            }
            return null;
        }
        if (task.status === 'to do') {
            return (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={(e) => handleStatusChangeClick(e, 'in progress')}
                >
                    Start Task
                </Button>
            );
        }
        if (task.status === 'in progress') {
            return (
                <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={(e) => handleStatusChangeClick(e, 'complete')}
                >
                    Complete
                </Button>
            );
        }
        return null;
    };
    
    const topBarColor = theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200];
    const topBarContrastColor = theme.palette.getContrastText(topBarColor);
    const buttonBackgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300];

    return (
        <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
            <Accordion sx={{ '&.Mui-expanded:before': { opacity: 1 } }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: topBarContrastColor }} />}
                    sx={{
                        backgroundColor: topBarColor,
                        color: topBarContrastColor,
                        padding: '12px 16px', // **FIX 2: Explicit and consistent padding**
                        minHeight: '64px', // **FIX 2: Enforce a minimum height**
                        '&.Mui-expanded': {
                            minHeight: '64px',
                        },
                        '& .MuiAccordionSummary-content': {
                            margin: '0 !important', // **FIX 2: Force margin to be zero**
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                        </Typography>
                        <Chip
                            label={priorityMap[task.priority].label}
                            size="small"
                            sx={{ backgroundColor: priorityMap[task.priority].color, color: '#fff', flexShrink: 0 }}
                        />
                        <Chip
                            label={statusMap[task.status].label}
                            size="small"
                            sx={{ backgroundColor: statusMap[task.status].color, color: '#fff', flexShrink: 0 }}
                        />
                         <Box sx={{ 
                            display: 'flex', 
                            gap: 0.5, 
                            flexShrink: 1,
                            minWidth: 50,
                            overflow: 'hidden',
                         }}>
                             <Box sx={{
                                display: 'flex',
                                gap: 0.5,
                                overflowX: 'auto', // **FIX 3: Enable horizontal scroll**
                                flexWrap: 'nowrap', // **FIX 3: Prevent wrapping**
                                // Simple scrollbar styling
                                '&::-webkit-scrollbar': { height: '4px' },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }
                             }}>
                                {task.tags && task.tags.map(tag => (
                                    <Chip key={tag} label={tag} size="small" />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        {renderProgressButton()}
                        {isAdmin && (
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleEditClick}
                                    sx={{ 
                                        backgroundColor: buttonBackgroundColor, 
                                        color: topBarContrastColor,
                                        '&:hover': { backgroundColor: theme.palette.grey[500] } 
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleDeleteClick}
                                    sx={{ 
                                        backgroundColor: buttonBackgroundColor, 
                                        color: theme.palette.error.light, 
                                        '&:hover': { backgroundColor: theme.palette.error.dark }
                                    }}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {task.description || 'No description provided.'}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default TaskItem;