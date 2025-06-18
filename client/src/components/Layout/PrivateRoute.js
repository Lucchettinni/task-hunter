// src/components/Layout/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // Show a loading spinner while checking for auth token
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Outlet renders the child route's element if authenticated
    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;