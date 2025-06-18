// client/src/contexts/ThemeProvider.js
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import AuthContext from './AuthContext';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Default to 'light' theme if no user is logged in.
    const [themeName, setThemeName] = useState('light');
    const [primaryColor, setPrimaryColor] = useState('#1976d2'); // Default light theme primary color

    useEffect(() => {
        if (user && user.theme && user.primary_color) {
            // If a user is logged in, apply their saved theme.
            setThemeName(user.theme);
            setPrimaryColor(user.primary_color);
        } else {
            // If no user or user has no theme saved, default to light theme.
            setThemeName('light');
            setPrimaryColor('#1976d2');
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