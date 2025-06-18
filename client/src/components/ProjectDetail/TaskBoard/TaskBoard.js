// src/components/ProjectDetail/TaskBoard/TaskBoard.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Grid, Box, CircularProgress, Alert, Button } from '@mui/material';
import api from '../../../services/api';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal'; // Import the new modal
import AddIcon from '@mui/icons-material/Add';
import AuthContext from '../../../contexts/AuthContext';

const TaskBoard = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tasks/project/${projectId}`);
            setTasks(res.data);
        } catch (err) {
            setError('Failed to fetch tasks.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    // --- CRUD Handlers ---

    const handleOpenCreateModal = () => {
        setEditingTask(null); // Make sure it's in 'create' mode
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = async (taskData, taskId) => {
        try {
            if (taskId) {
                // Editing an existing task
                await api.put(`/tasks/${taskId}`, taskData);
            } else {
                // Creating a new task
                await api.post('/tasks', taskData);
            }
            fetchTasks(); // Refresh list
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save task:', err);
            // Optionally set an error state to show in the modal
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, status: newStatus} : t));
            await api.put(`/tasks/${taskId}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update task status", error);
            fetchTasks(); // Revert on failure
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${taskId}`);
                fetchTasks();
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    // --- Render Logic ---

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    const columns = {
        'to do': tasks.filter(t => t.status === 'to do'),
        'in progress': tasks.filter(t => t.status === 'in progress'),
        'complete': tasks.filter(t => t.status === 'complete'),
    };

    return (
        <Box>
            {user.role === 'admin' && (
                <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 3 }} onClick={handleOpenCreateModal}>
                    Create Task
                </Button>
            )}
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <TaskColumn title="To Do" tasks={columns['to do']} onStatusChange={handleStatusChange} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TaskColumn title="In Progress" tasks={columns['in progress']} onStatusChange={handleStatusChange} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TaskColumn title="Complete" tasks={columns['complete']} onStatusChange={handleStatusChange} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                </Grid>
            </Grid>

            <TaskModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                task={editingTask}
                projectId={projectId}
            />
        </Box>
    );
};

export default TaskBoard;