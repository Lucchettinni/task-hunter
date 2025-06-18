// src/App.js
import React, { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeProvider';
import AuthContext from './contexts/AuthContext';

import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ProjectList from './components/Projects/ProjectList';
import ProjectView from './components/ProjectDetail/ProjectView';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';
import ProfileModal from './components/Layout/ProfileModal';

function AppContent() {
  const { user } = useContext(AuthContext);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      <Navbar onOpenProfile={() => setProfileModalOpen(true)} />
      {user && <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />}
      <Box component="main" sx={{ pt: '64px', height: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
          </Route>

        </Routes>
      </Box>
    </>
  );
}


function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;