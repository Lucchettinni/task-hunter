// src/components/ProjectDetail/Admin/ManageUsersTab.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, Autocomplete, TextField, Button, Alert, CircularProgress, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Divider, Tooltip } from '@mui/material';
import api from '../../../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../../contexts/AuthContext';

const ManageUsersTab = ({ projectId }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState([]);
    const [projectUsers, setProjectUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const [allUsersRes, projectUsersRes] = await Promise.all([
                api.get('/users'),
                api.get(`/projects/${projectId}/users`)
            ]);
            
            // Filter out users already in the project from the "add" list
            const projectUserIds = new Set(projectUsersRes.data.map(u => u.id));
            setAllUsers(allUsersRes.data.filter(u => !projectUserIds.has(u.id)));
            
            setProjectUsers(projectUsersRes.data);
        } catch (err) {
            setError('Could not load user data.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
            setSelectedUser(null);
            fetchUsers(); // Refresh both lists
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user.');
        }
    };
    
    const handleRemoveUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to remove ${username} from this project?`)) {
            try {
                await api.delete(`/projects/${projectId}/users/${userId}`);
                setSuccess(`Successfully removed ${username}.`);
                fetchUsers(); // Refresh both lists
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to remove user.');
            }
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Add User to Project</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    Select a user to grant them access to this project.
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, gridColumn: '1 / -1' }}>{success}</Alert>}
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Autocomplete
                        fullWidth
                        options={allUsers}
                        getOptionLabel={(option) => option.username}
                        value={selectedUser}
                        onChange={(event, newValue) => setSelectedUser(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Search for a user..." />}
                    />
                    <Tooltip title="Add User">
                         <IconButton color="primary" onClick={handleAddUser} sx={{ ml: 1, mt: 1 }}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Current Team</Typography>
                 <List>
                    {projectUsers.map((user, index) => (
                        <React.Fragment key={user.id}>
                            <ListItem
                                secondaryAction={
                                    currentUser.id !== user.id && (
                                        <Tooltip title="Remove User">
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveUser(user.id, user.username)}>
                                                <DeleteIcon color="error"/>
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.username}
                                    secondary={user.role}
                                />
                            </ListItem>
                            {index < projectUsers.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default ManageUsersTab;