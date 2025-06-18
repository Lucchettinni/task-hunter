// src/App.js
import React, { useState, useContext } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeProvider';
import AuthContext from './contexts/AuthContext';

import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ProjectList from './components/Projects/ProjectList';
import ProjectView from './components/ProjectDetail/ProjectView';
import PrivateRoute from './components/Layout/PrivateRoute';
import ProfileModal from './components/Layout/ProfileModal';
import Sidebar from './components/Layout/Sidebar';

const SIDEBAR_WIDTH = 280;

// This component defines the layout for all authenticated pages
const MainLayout = ({ onOpenProfile }) => (
  <Box sx={{ display: 'flex' }}>
    <Sidebar onOpenProfile={onOpenProfile} />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: `${SIDEBAR_WIDTH}px`,
        p: { xs: 2, sm: 3 },
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <Outlet /> {/* Child routes will render here */}
    </Box>
  </Box>
);

function AppContent() {
  const { user } = useContext(AuthContext);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  return (
    <>
      {user && <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />}
      <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Private routes wrapped in PrivateRoute and MainLayout */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout onOpenProfile={() => setProfileModalOpen(true)} />}>
              <Route path="/" element={<ProjectList />} />
              <Route path="/project/:projectId" element={<ProjectView />} />
            </Route>
          </Route>
      </Routes>
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