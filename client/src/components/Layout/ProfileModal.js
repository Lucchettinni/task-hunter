// client/src/components/Layout/ProfileModal.js
import React, { useState, useEffect, useContext } from 'react';
import {
    Modal, Box, Typography, TextField, Button, Paper, Alert,
    Tabs, Tab, Avatar, InputAdornment, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import api from '../../services/api';
import AuthContext from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeProvider';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
};

const ProfileModal = ({ open, onClose }) => {
    const { user, login } = useContext(AuthContext); // Use login to update the token
    const { setThemeName, setPrimaryColor } = useThemeContext();
    const [tabIndex, setTabIndex] = useState(0);

    const [name, setName] = useState(user?.name || '');
    const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_image_url || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [selectedTheme, setSelectedTheme] = useState(user?.theme || 'dark');
    const [selectedColor, setSelectedColor] = useState(user?.primary_color || '#90caf9');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setProfileImageUrl(user.profile_image_url || '');
            setSelectedTheme(user.theme || 'dark');
            setSelectedColor(user.primary_color || (user.theme === 'light' ? '#1976d2' : '#90caf9'));
        }
        // Reset feedback messages when modal opens or user changes
        setError('');
        setSuccess('');
    }, [user, open]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setError('');
        setSuccess('');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const { data } = await api.updateUserProfile({ name, profile_image_url: profileImageUrl });
            if (data.token) {
                login(data.token); // Re-login with the new token to update context
            }
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        try {
            await api.updateUserPassword({ currentPassword, newPassword });
            setSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        }
    };

    const handleThemeUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const { data } = await api.updateUserTheme({ theme: selectedTheme, primary_color: selectedColor });
            if (data.token) {
                login(data.token); // Re-login with the new token to update context
            }
            setThemeName(selectedTheme);
            setPrimaryColor(selectedColor);
            setSuccess('Theme updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update theme.');
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={modalStyle}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
                        <Tab label="Profile" />
                        <Tab label="Appearance" />
                        <Tab label="Password" />
                    </Tabs>
                </Box>
                
                {tabIndex === 0 && (
                    <Box component="form" onSubmit={handleProfileUpdate} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Edit Profile</Typography>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
                            <Avatar src={profileImageUrl || ''} sx={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                                {(name || ' ').charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>
                        <TextField
                            fullWidth margin="normal" label="Name"
                            value={name} onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            fullWidth margin="normal" label="Profile Image URL"
                            value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Save Changes</Button>
                    </Box>
                )}

                 {tabIndex === 1 && (
                    <Box component="form" onSubmit={handleThemeUpdate} sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom>Theme Settings</Typography>
                         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                         {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                         <Box sx={{display: 'flex', justifyContent: 'center', mb: 3}}>
                            <ToggleButtonGroup
                                color="primary"
                                value={selectedTheme}
                                exclusive
                                onChange={(e, newTheme) => newTheme && setSelectedTheme(newTheme)}
                                >
                                <ToggleButton value="light">Light</ToggleButton>
                                <ToggleButton value="dark">Dark</ToggleButton>
                            </ToggleButtonGroup>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{flexShrink: 0}}>Primary Color</Typography>
                            <Box sx={{width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2}}>
                                <Typography variant="body2" color="text.secondary">{selectedColor}</Typography>
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        border: 'none',
                                        padding: 0,
                                        background: 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Box>
                        </Box>

                         <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Save Theme</Button>
                    </Box>
                )}

                {tabIndex === 2 && (
                    <Box component="form" onSubmit={handlePasswordUpdate} sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom>Change Password</Typography>
                         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                         {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                         <TextField
                            fullWidth margin="normal" label="Current Password" type="password" required
                            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                         />
                         <TextField
                            fullWidth margin="normal" label="New Password" type="password" required
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                         />
                          <TextField
                            fullWidth margin="normal" label="Confirm New Password" type="password" required
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                         />
                         <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Update Password</Button>
                    </Box>
                )}
            </Paper>
        </Modal>
    );
};

export default ProfileModal;