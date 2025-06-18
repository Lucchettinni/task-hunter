// src/components/ProjectDetail/Admin/ManageUsersTab.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Autocomplete, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../../../services/api';

const ManageUsersTab = ({ projectId }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                // In a large application, you'd want to fetch only users NOT in the project.
                // For simplicity, we fetch all and let the backend handle duplicates.
                const res = await api.get('/users');
                setAllUsers(res.data);
            } catch (err) {
                setError('Could not load user list.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    const handleAddUser = async () => {
        if (!selectedUser) {
            setError('Please select a user to add.');
            return;
        }
        setError('');
        setSuccess('');
        try {
            await api.post(`/projects/${projectId}/users`, { userId: selectedUser.id });
            setSuccess(`Successfully added ${selectedUser.username} to the project.`);
            setSelectedUser(null); // Reset the field
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user.');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h5" gutterBottom>Add User to Project</Typography>
            <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                Select a user from the list to grant them access to this project. They will be able to see the project, its tasks, and documentation.
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                    fullWidth
                    options={allUsers}
                    getOptionLabel={(option) => option.username}
                    value={selectedUser}
                    onChange={(event, newValue) => {
                        setSelectedUser(newValue);
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} label="Search for a user..." />}
                />
                <Button variant="contained" onClick={handleAddUser} sx={{ ml: 2, height: '56px' }}>
                    Add User
                </Button>
            </Box>
        </Box>
    );
};

export default ManageUsersTab;