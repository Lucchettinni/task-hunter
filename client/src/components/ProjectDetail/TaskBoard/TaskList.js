// client/src/components/ProjectDetail/TaskBoard/TaskList.js
import React, { useState, useMemo } from 'react';
import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography, Paper, InputAdornment, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onStatusChange, onEdit, onDelete }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    // Extract all unique tags from the tasks for the filter dropdown
    const allTags = useMemo(() => {
        const tagsSet = new Set();
        tasks.forEach(task => {
            task.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            
            const matchesSearch = searchTerm === '' ||
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTags = selectedTags.length === 0 ||
                selectedTags.every(selectedTag => task.tags?.includes(selectedTag));

            return matchesStatus && matchesPriority && matchesSearch && matchesTags;
        });
    }, [tasks, statusFilter, priorityFilter, searchTerm, selectedTags]);

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                 <TextField
                    label="Search by title or description..."
                    variant="outlined"
                    size="small"
                    sx={{ flex: '1 1 250px' }}
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
                 <Autocomplete
                    multiple
                    limitTags={2}
                    id="tags-filter"
                    options={allTags}
                    value={selectedTags}
                    onChange={(event, newValue) => {
                        setSelectedTags(newValue);
                    }}
                    sx={{ flex: '1 1 250px' }}
                    renderInput={(params) => (
                        <TextField {...params} label="Filter by tags" size="small" />
                    )}
                />
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>Status</Typography>
                    <ToggleButtonGroup size="small" value={statusFilter} exclusive onChange={(e, v) => v && setStatusFilter(v)}>
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="to do">To Do</ToggleButton>
                        <ToggleButton value="in progress">In Progress</ToggleButton>
                        <ToggleButton value="complete">Complete</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                 <Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>Priority</Typography>
                    <ToggleButtonGroup size="small" value={priorityFilter} exclusive onChange={(e, v) => v && setPriorityFilter(v)}>
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="low">Low</ToggleButton>
                        <ToggleButton value="medium">Medium</ToggleButton>
                        <ToggleButton value="high">High</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Paper>

            <Box>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
                    ))
                ) : (
                    <Paper sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                        <Typography>No tasks match the current filters.</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default TaskList;