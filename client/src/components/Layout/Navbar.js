// client/src/components/Layout/Navbar.js
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';

const Navbar = ({ onOpenProfile }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    Task Hunter
                </Typography>

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.profile_image_url} sx={{ width: 32, height: 32 }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : ''}
                        </Avatar>
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user.name}</Typography>
                        <Tooltip title="Settings">
                            <IconButton onClick={onOpenProfile} color="inherit">
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                ) : (
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;