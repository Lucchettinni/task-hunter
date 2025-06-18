// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeProvider';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ProjectList from './components/Projects/ProjectList';
import ProjectView from './components/ProjectDetail/ProjectView';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';

function App() {
  return (
    // We wrap the app in the ThemeProvider AFTER the AuthProvider
    <CustomThemeProvider>
      <CssBaseline /> {/* Resets CSS for cross-browser consistency */}
      <Navbar />
      <main style={{ paddingTop: '64px' }}> {/* Offset content below Navbar */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<ProjectList />} />
          </Route>
          <Route path="/project/:projectId" element={<PrivateRoute />}>
             <Route path="/project/:projectId" element={<ProjectView />} />
          </Route>

        </Routes>
      </main>
    </CustomThemeProvider>
  );
}

export default App;