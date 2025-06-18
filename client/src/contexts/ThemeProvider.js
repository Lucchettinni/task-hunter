// client/src/contexts/ThemeProvider.js
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme, cyberpunkTheme } from '../themes';
import AuthContext from './AuthContext';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [themeName, setThemeName] = useState('dark'); // Default to dark

    // This effect will run when the user logs in or their data changes
    useEffect(() => {
        if (user?.theme) {
            setThemeName(user.theme);
        }
    }, [user]);

    const theme = useMemo(() => {
        switch (themeName) {
            case 'light': return lightTheme;
            case 'dark': return darkTheme;
            case 'cyberpunk': return cyberpunkTheme;
            default: return darkTheme;
        }
    }, [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};