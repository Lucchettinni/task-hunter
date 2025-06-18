// client/src/components/ProjectDetail/TaskBoard/TaskBoard.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import api from '../../../services/api';
import TaskList from './TaskList'; // Updated import
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
        }
    };
    
    const handleStatusChange = async (taskId, newStatus) => {
        const originalTasks = [...tasks];
        try {
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? {...t, status: newStatus} : t));
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            // The list will visually update instantly. A full fetch isn't strictly necessary here
            // unless other data besides status could have changed on the backend.
        } catch (error) {
            console.error("Failed to update task status", error);
            setTasks(originalTasks); // Revert on failure
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

    if (loading) return <CircularProgress />;
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