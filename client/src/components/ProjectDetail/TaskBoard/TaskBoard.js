// client/src/components/ProjectDetail/TaskBoard/TaskBoard.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import api from '../../../services/api';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import AddIcon from '@mui/icons-material/Add';
import AuthContext from '../../../contexts/AuthContext';

const TaskBoard = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            // No need to set loading to true here, to avoid screen flicker on minor updates
            const res = await api.get(`/tasks/project/${projectId}`);
            // Sort tasks: "in progress" first, then "to do", then "complete"
            const statusOrder = { 'in progress': 1, 'to do': 2, 'complete': 3 };
            const sortedTasks = res.data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
            setTasks(sortedTasks);
        } catch (err) {
            setError('Failed to fetch tasks.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleOpenCreateModal = () => {
        setEditingTask(null);
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
                await api.put(`/tasks/${taskId}`, taskData);
            } else {
                await api.post('/tasks', { ...taskData, project_id: projectId });
            }
            fetchTasks();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save task:', err);
            // You could set an error state here to show in the modal
        }
    };
    
    const handleStatusChange = async (taskId, newStatus) => {
        const originalTasks = [...tasks];
        const taskToUpdate = tasks.find(t => t.id === taskId);

        // Enforce user permissions
        if (user.role !== 'admin' && taskToUpdate.status === 'complete') {
            // Regular users cannot re-open tasks.
            // Silently ignore or show a notification. For now, we'll just log and ignore.
            console.log("User cannot re-open a completed task.");
            return;
        }

        try {
            // Optimistic UI update
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, status: newStatus} : t));
            
            // API call - we only need to send the new status
            await api.put(`/tasks/${taskId}`, { status: newStatus });

            // On success, re-fetch and sort to ensure order is correct.
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task status", error);
            // Revert on failure
            setTasks(originalTasks); 
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${taskId}`);
                fetchTasks(); // Refresh the list
            } catch (error) {
                setError('Failed to delete task.');
                console.error("Failed to delete task", error);
            }
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            {user.role === 'admin' && (
                <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={handleOpenCreateModal}>
                    Create Task
                </Button>
            )}
            
            <TaskList 
                tasks={tasks} 
                onStatusChange={handleStatusChange} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDelete} 
            />

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