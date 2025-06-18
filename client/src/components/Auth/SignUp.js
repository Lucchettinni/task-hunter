// src/components/Auth/SignUp.js
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

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError('');
        try {
            const res = await api.post('/auth/signup', { 
                username, 
                password,
                name,
                email,
                profile_image_url: profileImageUrl 
            });
            login(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Sign up failed. Please try again.');
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
                py: 4
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
                    maxWidth: 420,
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
                    Create Account
                </Typography>
                <Typography color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                    Join the hub and start tracking
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    
                    <TextField fullWidth required margin="dense" label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>
                    <TextField fullWidth required margin="dense" label="Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>
                    <TextField fullWidth required margin="dense" label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>
                    <TextField fullWidth required margin="dense" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>
                    <TextField fullWidth required margin="dense" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>
                    
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
                        Sign Up
                    </Button>
                    <Typography variant="body2" align="center" color="text.secondary">
                        Already have an account?{' '}
                        <MuiLink component={RouterLink} to="/login" variant="body2" sx={{fontWeight: 'bold'}}>
                            Sign In
                        </MuiLink>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default SignUp;