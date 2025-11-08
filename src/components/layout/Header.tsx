/**
 * Header Component
 *
 * Cabeçalho principal da aplicação com logo, título, navegação e toggle de tema.
 * Fixo no topo e responsivo para mobile e desktop.
 */

'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, selectThemeMode } from '@/features/app/appSlice';
import Navigation from './Navigation';
import { useState } from 'react';

/**
 * Header da aplicação
 *
 * Componente fixo no topo que inclui:
 * - Logo e título do app
 * - Navegação principal (desktop)
 * - Toggle de tema (claro/escuro)
 * - Menu hamburguer (mobile)
 *
 * @example
 * ```tsx
 * // Usado dentro do AppLayout
 * <Header />
 * ```
 */
export default function Header() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Alterna entre tema claro e escuro
   */
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  /**
   * Abre/fecha menu mobile
   */
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: theme.shadows[2],
        }}
      >
        <Toolbar>
          {/* Menu hamburguer (mobile) */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo e Título */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            {/* Ícone/Logo (pode ser substituído por imagem) */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                color: 'primary.contrastText',
              }}
            >
              LS
            </Box>

            {/* Título */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Lite Sheets TDC
            </Typography>

            {/* Título curto para mobile */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                display: { xs: 'block', sm: 'none' },
              }}
            >
              LS TDC
            </Typography>
          </Box>

          {/* Navegação (desktop) */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, ml: 4 }}>
              <Navigation variant="horizontal" />
            </Box>
          )}

          {/* Toggle de Tema */}
          <IconButton
            color="inherit"
            onClick={handleToggleTheme}
            aria-label={
              themeMode === 'dark'
                ? 'Mudar para tema claro'
                : 'Mudar para tema escuro'
            }
            sx={{ ml: 'auto' }}
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menu Mobile (Drawer) */}
      {isMobile && (
        <Navigation
          variant="drawer"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
