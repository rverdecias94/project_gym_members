// themes.js
import { createTheme } from '@mui/material/styles';

const commonComponents = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          padding: '8px 16px',
          minHeight: '40px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid #eaeaea',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid #eaeaea',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid #eaeaea',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6164c7', // Color secundario
      accent: '#ef74b9',
    },
    secondary: {
      main: '#e49c10',
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
    error: {
      // Si el modo es oscuro, usa un rojo más brillante. Si no, el rojo por defecto.
      main: '#d32f2f',
    },
  },
  ...commonComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6164c7',
      optional: "#fffaa5",
      accent: '#56d1cb'
    },
    secondary: {
      main: '#32aaf4',
    },
    accent: {
      main: '#e49c10',
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
    error: {
      main: '#ff9a9a'
    }
  },
  components: {
    ...commonComponents.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.12)', // Borde más suave para el modo oscuro
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
});

