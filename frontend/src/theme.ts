import { createTheme, alpha } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#fff',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e',
      },
      error: {
        main: '#f44336',
      },
      success: {
        main: '#4caf50',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: ({ theme }) => ({
            boxShadow: `0 1px 3px 0 ${alpha(
              theme.palette.mode === 'dark' ? '#000' : '#6b7280',
              0.1
            )}, 0 1px 2px -1px ${alpha(
              theme.palette.mode === 'dark' ? '#000' : '#6b7280',
              0.1
            )}`,
          }),
          elevation3: ({ theme }) => ({
            boxShadow: `0 4px 6px -1px ${alpha(
              theme.palette.mode === 'dark' ? '#000' : '#6b7280',
              0.1
            )}, 0 2px 4px -2px ${alpha(
              theme.palette.mode === 'dark' ? '#000' : '#6b7280',
              0.1
            )}`,
          }),
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
  });
};

export default getTheme; 