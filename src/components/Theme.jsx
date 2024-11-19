// themes.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#27afb1', // Color secundario
    },
    secondary: {
      main: '#4c6995', // Color primario
    },
    accent: {
      main: '#4c6995', // Color acento
    },
    background: {
      default: '#f5f5f5', // Fondo claro
    },
    text: {
      primary: '#000000', // Texto en modo claro
      secondary: '#000000', // Texto en modo claro
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#56d1cb',
    },
    secondary: {
      main: '#32aaf4',
    },
    accent: {
      main: '#32aaf4',
    },
    background: {
      default: '#162131',
      paper: '#162131',
      light: '#f5f5f5'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
    },
  },
});

