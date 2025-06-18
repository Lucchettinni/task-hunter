// src/components/Layout/Navbar.js
import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeProvider';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../services/api';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { setThemeName } = useThemeContext();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    const handleThemeChange = async (theme) => {
        setThemeName(theme);
        // Persist theme preference to the backend
        try {
            await api.put('/users/theme', { theme });
        } catch (error) {
            console.error("Failed to save theme", error);
        }
        handleClose();
    };


    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    GameDev Tracker
                </Typography>

                {user ? (
                    <>
                        <Typography>Hi, {user.username}</Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <SettingsIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>Change Theme</MenuItem>
                            <MenuItem onClick={() => handleThemeChange('light')}>Light</MenuItem>
                            <MenuItem onClick={() => handleThemeChange('dark')}>Dark</MenuItem>
                            <MenuItem onClick={() => handleThemeChange('cyberpunk')}>Cyberpunk</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;