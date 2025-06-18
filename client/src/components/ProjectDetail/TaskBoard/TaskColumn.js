// src/components/ProjectDetail/TaskBoard/TaskColumn.js
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import TaskCard from './TaskCard';

// Add onEdit to the destructuring and pass it down
const TaskColumn = ({ title, tasks, onStatusChange, onEdit, onDelete }) => {
    return (
        <Paper sx={{ p: 2, height: '100%', backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#f0f0f0' }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Box>
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </Box>
        </Paper>
    );
};

export default TaskColumn;