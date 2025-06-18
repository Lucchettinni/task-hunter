// src/components/Auth/SignUp.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import { Container, Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

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
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            py: 4,
            bgcolor: 'background.default'
        }}>
            <Container component="main" maxWidth="xs">
                <Paper elevation={6} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h5">
                        Create Account
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                        <TextField
                            margin="normal" required fullWidth id="name"
                            label="Full Name" name="name" autoComplete="name"
                            value={name} onChange={(e) => setName(e.target.value)}
                        />
                         <TextField
                            margin="normal" required fullWidth id="email"
                            label="Email Address" name="email" autoComplete="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth id="username"
                            label="Username" name="username" autoComplete="username"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth name="password"
                            label="Password" type="password" id="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth name="confirmPassword"
                            label="Confirm Password" type="password" id="confirmPassword"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <TextField
                            margin="normal" fullWidth name="profileImageUrl"
                            label="Profile Photo URL (Optional)" type="url" id="profileImageUrl"
                            value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)}
                        />
                        <Button
                            type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Typography variant="body2" align="center">
                            Already have an account?{' '}
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <Button>Sign In</Button>
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUp;