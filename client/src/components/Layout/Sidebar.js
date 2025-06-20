// client/src/components/Layout/Sidebar.js
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdjustIcon from '@mui/icons-material/Adjust';
import AuthContext from '../../contexts/AuthContext';

const Sidebar = ({ onOpenProfile }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItemStyles = {
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '12px',
        color: 'text.secondary',
        fontWeight: 500,
        '& .MuiListItemIcon-root': {
            color: 'text.secondary',
        },
        '&.active': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
            },
            boxShadow: 2
        },
        '&:hover': {
            backgroundColor: 'action.hover',
            color: 'primary.main',
             '& .MuiListItemIcon-root': {
                color: 'primary.main',
            },
        }
    };

    const avatarSrc = user?.profile_image_url ? `${BACKEND_URL}${user.profile_image_url}` : '';

    return (
        <Box
            component={Paper}
            elevation={4}
            sx={{
                width: 280,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                padding: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
            }}
        >
            <Box sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <AdjustIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Task Hunter
                </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 2, backgroundColor: 'action.hover', borderRadius: 3 }}>
                <Avatar 
                    src={avatarSrc} 
                    alt={user?.name || ''}
                    sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : ''}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{lineHeight: 1.2}}>{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
                </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List sx={{ flexGrow: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/" end sx={navItemStyles}>
                        <ListItemIcon><FolderIcon /></ListItemIcon>
                        <ListItemText primary="Projects" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={onOpenProfile} sx={navItemStyles}>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider sx={{ mt: 'auto' }} />

            <Box sx={{ pt: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{...navItemStyles, mb: 0, color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }}}>
                        <ListItemIcon><LogoutIcon sx={{color: 'error.main'}}/></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Box>
    );
};

export default Sidebar;