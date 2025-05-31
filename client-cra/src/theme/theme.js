// client-cra/src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2D3E50', // TopNavBar and key buttons
            contrastText: '#fff',
        },
        secondary: {
            main: '#3B8C84', // Action buttons / accents
        },
        background: {
            default: '#F4EAD5', // Cream background for pages
            paper: '#FFFFFF',   // Card/panel background
        },
        text: {
            primary: '#1e1e1e',
            secondary: '#555',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#F4EAD5', // Cream drawer background
                },
            },
        },
    },
});

export default theme;
