// client/src/components/ProjectDetail/TaskBoard/TaskList.js
import React, { useState, useMemo } from 'react';
import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography, Paper, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onStatusChange, onEdit, onDelete }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = (event, newStatus) => {
        if (newStatus !== null) setStatusFilter(newStatus);
    };

    const handlePriorityChange = (event, newPriority) => {
        if (newPriority !== null) setPriorityFilter(newPriority);
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesSearch = searchTerm === '' ||
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

            return matchesStatus && matchesPriority && matchesSearch;
        });
    }, [tasks, statusFilter, priorityFilter, searchTerm]);

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="overline" color="text.secondary">Filter by Status</Typography>
                        <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusChange} aria-label="task status filter">
                            <ToggleButton value="all" aria-label="all">All</ToggleButton>
                            <ToggleButton value="to do" aria-label="to do">To Do</ToggleButton>
                            <ToggleButton value="in progress" aria-label="in progress">In Progress</ToggleButton>
                            <ToggleButton value="complete" aria-label="complete">Complete</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                       <Typography variant="overline" color="text.secondary">Filter by Priority</Typography>
                       <ToggleButtonGroup value={priorityFilter} exclusive onChange={handlePriorityChange} aria-label="task priority filter">
                            <ToggleButton value="all" aria-label="all">All</ToggleButton>
                            <ToggleButton value="low" aria-label="low">Low</ToggleButton>
                            <ToggleButton value="medium" aria-label="medium">Medium</ToggleButton>
                            <ToggleButton value="high" aria-label="high">High</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                     <TextField
                        label="Search Tasks"
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Paper>

            <Box>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
                    ))
                ) : (
                    <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>No tasks match the current filters.</Typography>
                )}
            </Box>
        </Box>
    );
};

export default TaskList;