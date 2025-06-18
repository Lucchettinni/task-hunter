// src/components/Auth/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import { Box, TextField, Button, Typography, Paper, Alert, Link as MuiLink } from '@mui/material';
import { keyframes } from '@mui/system';

// Keyframe animations for the background
const floatAnimation = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
`;

const floatAnimationReverse = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.1); }
`;


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorative elements */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        width: { xs: 300, md: 600 },
                        height: { xs: 300, md: 600 },
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&::before': {
                        top: { xs: -150, md: -300 },
                        right: { xs: -150, md: -300 },
                        animation: `${floatAnimation} 15s ease-in-out infinite`,
                    },
                    '&::after': {
                        bottom: { xs: -150, md: -300 },
                        left: { xs: -150, md: -300 },
                        animation: `${floatAnimationReverse} 20s ease-in-out infinite`,
                    },
                }}
            />
            
            <Paper
                elevation={12}
                sx={{
                    padding: { xs: 3, sm: 4 },
                    width: '100%',
                    maxWidth: 400,
                    zIndex: 10,
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                }}
            >
                <Typography component="h1" variant="h4" sx={{ 
                    mb: 1, 
                    color: 'primary.main', 
                    textAlign: 'center', 
                    fontWeight: 700 
                }}>
                    Task Hunter
                </Typography>
                <Typography color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                    Sign in to continue
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1, color: 'text.primary' }}>Username</Typography>
                      <TextField
                          required
                          fullWidth
                          id="username"
                          name="username"
                          autoComplete="username"
                          autoFocus
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Box>
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1, color: 'text.primary' }}>Password</Typography>
                      <TextField
                          required
                          fullWidth
                          name="password"
                          type="password"
                          id="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                            }
                        }}
                    >
                        Sign In
                    </Button>
                    <Typography variant="body2" align="center" color="text.secondary">
                        Don't have an account?{' '}
                        <MuiLink component={RouterLink} to="/signup" variant="body2" sx={{fontWeight: 'bold'}}>
                            Sign Up
                        </MuiLink>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;