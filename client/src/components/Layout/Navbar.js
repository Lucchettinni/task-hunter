// client/src/components/Layout/Navbar.js
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Navbar = ({ onOpenProfile }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // Function to generate a color from a string for the avatar background
    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    Task Hunter
                </Typography>

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Welcome, {user.name}
                        </Typography>
                        <Tooltip title="Profile & Settings">
                             <IconButton onClick={onOpenProfile} sx={{ p: 0 }}>
                                <Avatar alt={user.name} src={user.profile_image_url} sx={{ bgcolor: stringToColor(user.name || '') }}>
                                    {/* Avatar component automatically shows the first letter if src is invalid/missing */}
                                    {user.name ? user.name.charAt(0).toUpperCase() : ''}
                                </Avatar>
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