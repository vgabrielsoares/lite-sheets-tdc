/**
 * Tema Escuro - Dark Theme
 *
 * Paleta de cores inspirada em elementos noturnos medievais e RPG,
 * mantendo acessibilidade (WCAG AA) e legibilidade em ambientes escuros.
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Configuração do tema escuro
 */
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37', // Dourado medieval (destaque em fundo escuro)
      light: '#E6C961', // Dourado claro
      dark: '#B8941F', // Dourado escuro
      contrastText: '#000000',
    },
    secondary: {
      main: '#C9A961', // Dourado acobreado
      light: '#D9BB81', // Cobre claro
      dark: '#A68B45', // Cobre escuro
      contrastText: '#000000',
    },
    error: {
      main: '#EF5350', // Vermelho mais claro para dark mode (WCAG AA compliant)
      light: '#FF8A80',
      dark: '#C62828',
      contrastText: '#000000',
    },
    warning: {
      main: '#FF9800', // Laranja para dark mode (WCAG AA compliant)
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    info: {
      main: '#29B6F6', // Azul claro para dark mode (WCAG AA compliant)
      light: '#4FC3F7',
      dark: '#0288D1',
      contrastText: '#000000',
    },
    success: {
      main: '#66BB6A', // Verde claro para dark mode (WCAG AA compliant)
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Preto suave (Material Design dark baseline)
      paper: '#1E1E1E', // Cinza muito escuro para cards e papéis
    },
    text: {
      primary: '#E0E0E0', // Branco suave (ótimo contraste em fundo escuro)
      secondary: '#B0B0B0', // Cinza claro para textos secundários
      disabled: '#757575', // Cinza médio para textos desabilitados
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Divisor translúcido
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
      color: '#D4AF37', // Dourado para títulos principais
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
      color: '#D4AF37', // Dourado para títulos secundários
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
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.7)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
        },
        elevation3: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0, // Drawer sem bordas arredondadas
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4AF37', // Dourado no foco
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2D2D2D',
          color: '#E0E0E0',
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        },
      },
    },
  },
};

/**
 * Tema escuro criado
 */
export const darkTheme = createTheme(darkThemeOptions);
