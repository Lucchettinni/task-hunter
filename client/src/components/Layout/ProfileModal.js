// client/src/components/Layout/ProfileModal.js
import React, { useState, useEffect, useContext } from 'react';
import {
    Modal, Box, Typography, TextField, Button, Paper, Alert,
    Tabs, Tab, Avatar, ToggleButtonGroup, ToggleButton
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
    const { user, login } = useContext(AuthContext);
    const { setThemeName, setPrimaryColor } = useThemeContext();
    const [tabIndex, setTabIndex] = useState(0);

    // Profile Tab State
    const [name, setName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Appearance Tab State
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const [selectedColor, setSelectedColor] = useState('#90caf9');

    // Password Tab State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Feedback State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            if (user.profile_image_url) {
                setPreviewUrl(user.profile_image_url);
            } else {
                setPreviewUrl('');
            }
            setSelectedTheme(user.theme || 'dark');
            setSelectedColor(user.primary_color || (user.theme === 'light' ? '#1976d2' : '#90caf9'));
        }
        // Reset state on modal open
        setError('');
        setSuccess('');
        setSelectedFile(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }, [user, open]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setError('');
        setSuccess('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10000000) { // 10MB check
                setError("File is too large. Maximum size is 10MB.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        const formData = new FormData();
        formData.append('name', name);
        if (selectedFile) {
            formData.append('profileImage', selectedFile);
        }

        try {
            const { data } = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.token) {
                login(data.token);
            }
            setSuccess('Profile updated successfully!');
            setSelectedFile(null);
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
                login(data.token);
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
                            <Avatar src={previewUrl} sx={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                                {(name || ' ').charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>
                        <TextField
                            fullWidth margin="normal" label="Name"
                            value={name} onChange={(e) => setName(e.target.value)}
                        />
                         <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                            Upload New Image
                            <input type="file" hidden accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} />
                        </Button>
                        {selectedFile && <Typography variant="caption" display="block" sx={{mt: 1, textAlign: 'center'}}>Selected: {selectedFile.name}</Typography>}
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