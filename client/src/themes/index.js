// src/themes/index.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // A nice blue
    },
    secondary: {
      main: '#dc004e', // A pinkish red
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // A lighter blue for dark mode
    },
    secondary: {
      main: '#f48fb1', // A lighter pink for dark mode
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export const cyberpunkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00ffff', // Cyan
      },
      secondary: {
        main: '#ff00ff', // Magenta
      },
      background: {
        default: '#0d0221', // Deep purple
        paper: '#241b4a',
      },
      text: {
        primary: '#00ffff',
        secondary: '#fdfdfd',
      }
    },
  });