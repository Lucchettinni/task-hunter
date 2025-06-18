// client/src/contexts/ThemeProvider.js
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import AuthContext from './AuthContext';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Set default theme state, which will be updated by user context
    const [themeName, setThemeName] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#90caf9'); // Default dark theme color

    // Update theme state when user data changes
    useEffect(() => {
        if (user) {
            setThemeName(user.theme || 'dark');
            setPrimaryColor(user.primary_color || (user.theme === 'light' ? '#1976d2' : '#90caf9'));
        }
    }, [user]);

    const theme = useMemo(() => {
        const baseTheme = themeName === 'light' 
            ? {
                palette: {
                    mode: 'light',
                    primary: { main: primaryColor },
                    secondary: { main: '#dc004e' },
                    background: { default: '#f4f6f8', paper: '#ffffff' },
                }
            }
            : {
                palette: {
                    mode: 'dark',
                    primary: { main: primaryColor },
                    secondary: { main: '#f48fb1' },
                    background: { default: '#121212', paper: '#1e1e1e' },
                }
            };
        return createTheme(baseTheme);
    }, [themeName, primaryColor]);

    // Provide a way to update the theme contextually
    const contextValue = {
        themeName,
        setThemeName,
        primaryColor,
        setPrimaryColor
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};