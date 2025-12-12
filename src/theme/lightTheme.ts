/**
 * Tema Claro - Light Theme
 *
 * Paleta de cores inspirada em pergaminho medieval e elementos de RPG,
 * mantendo acessibilidade (WCAG AA) e legibilidade.
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Configuração do tema claro
 */
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#5E2C04', // Marrom escuro medieval (boa para textos e elementos principais)
      light: '#8B4513', // Saddle brown
      dark: '#3E1C00', // Marrom muito escuro
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B4513', // Saddle brown (complementar ao primário)
      light: '#A0522D', // Sienna
      dark: '#654321', // Dark brown
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C62828', // Vermelho escuro (WCAG AA compliant)
      light: '#EF5350',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F57C00', // Laranja escuro (WCAG AA compliant)
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#000000',
    },
    info: {
      main: '#0277BD', // Azul escuro (WCAG AA compliant)
      light: '#03A9F4',
      dark: '#01579B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32', // Verde escuro (WCAG AA compliant)
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F1E8', // Pergaminho claro - cor de fundo suave
      paper: '#FFFFFF', // Branco puro para cards e papéis
    },
    text: {
      primary: '#212121', // Preto quase total (ótimo contraste)
      secondary: '#424242', // Cinza escuro para textos secundários
      disabled: '#9E9E9E', // Cinza médio para textos desabilitados
    },
    divider: '#BDBDBD', // Cinza claro para divisores
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  breakpoints: {
    values: {
      xs: 0, // Mobile portrait
      sm: 600, // Mobile landscape / small tablets
      md: 960, // Tablets
      lg: 1280, // Desktop
      xl: 1920, // Large desktop
    },
  },
  spacing: 8, // Base spacing unit (8px)
  shape: {
    borderRadius: 8, // Bordas arredondadas suaves
  },
  transitions: {
    duration: {
      shortest: 100,
      shorter: 125,
      short: 150,
      standard: 150,
      complex: 250,
      enteringScreen: 150,
      leavingScreen: 125,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // Sobrescreve uppercase padrão para melhor UX
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove gradiente padrão do MUI
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 3px 9px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0, // Drawer sem bordas arredondadas
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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
};

/**
 * Tema claro criado
 */
export const lightTheme = createTheme(lightThemeOptions);
