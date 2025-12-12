'use client';

import React, { useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SIDEBAR_WIDTHS = {
  sm: 320,
  md: 480,
  lg: 640,
} as const;

export type SidebarWidth = keyof typeof SIDEBAR_WIDTHS;

export interface SidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Título da sidebar
   */
  title?: string;

  /**
   * Conteúdo da sidebar
   */
  children: React.ReactNode;

  /**
   * Largura da sidebar
   * @default 'lg' (640px) - Padrão definido pela LinhagemSidebar
   */
  width?: SidebarWidth;

  /**
   * Se true, fecha sidebar ao pressionar ESC
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Se true, adiciona padding de 3 no conteúdo (padrão LinhagemSidebar)
   * @default true
   */
  contentPadding?: boolean;

  /**
   * Elevação do Paper (sombra)
   * @default 2
   */
  elevation?: number;
}

/**
 * Componente Sidebar padronizado
 *
 * Este componente fornece uma estrutura completa e consistente para sidebars
 * em toda a aplicação. Ele já inclui:
 * - Header com título e botão de fechar
 * - Área de conteúdo com scroll customizado
 * - Padding padrão de 3 (24px) seguindo o padrão da LinhagemSidebar
 * - Largura padrão 'lg' (640px) seguindo o padrão da LinhagemSidebar
 * - Renderização inline (ao lado do conteúdo principal, não modal)
 * - Tratamento de tecla ESC para fechar
 *
 * **Importante**: Este componente é renderizado inline e deve ser usado dentro
 * de um container flex/grid para posicionamento correto ao lado da ficha.
 *
 * @example
 * ```tsx
 * <Box sx={{ display: 'flex', gap: 2 }}>
 *   <Box sx={{ flex: 1 }}>
 *     {/* Conteúdo principal (ficha) *\/}
 *   </Box>
 *   <Sidebar open={open} onClose={handleClose} title="Detalhes">
 *     <Stack spacing={3}>
 *       {/* Conteúdo da sidebar *\/}
 *     </Stack>
 *   </Sidebar>
 * </Box>
 * ```
 */
export function Sidebar({
  open,
  onClose,
  title,
  width = 'lg', // Padrão da LinhagemSidebar
  closeOnEscape = true,
  contentPadding = true, // Padrão da LinhagemSidebar (p: 3)
  elevation = 2,
  children,
}: SidebarProps) {
  /**
   * Fecha sidebar ao pressionar ESC
   */
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Não renderiza nada se não estiver aberta
  if (!open) {
    return null;
  }

  const sidebarWidth = SIDEBAR_WIDTHS[width];

  return (
    <Paper
      elevation={elevation}
      role="complementary"
      aria-label={title || 'Sidebar de detalhes'}
      sx={{
        width: { xs: '100vw', md: sidebarWidth },
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        // Mobile: comporta-se como modal fullscreen
        top: { xs: 0, md: 150 },
        right: {
          xs: 0,
          md: 16,
          lg: `calc((100vw - 900px) / 2 - ${sidebarWidth}px - 24px)`,
          xl: `calc((100vw - 900px) / 2 - ${sidebarWidth}px - 24px)`,
        },
        left: {
          xs: 0,
          lg: `calc((100vw + 900px) / 2 + 24px)`,
          xl: `calc((100vw + 900px) / 2 + 24px)`,
        },
        // Mobile: altura total da tela
        height: { xs: '100vh', md: 'auto' },
        maxHeight: { xs: '100vh', md: 'calc(100vh - 220px)' },
        zIndex: 1300, // Acima de tudo no mobile para comportar-se como modal
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 64,
          flexShrink: 0, // Não encolher o header
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          id="sidebar-title"
          sx={{ fontWeight: 600 }}
        >
          {title || 'Detalhes'}
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label={`Fechar ${title || 'sidebar'}`}
          size="small"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Área de Conteúdo */}
      <Box
        role="region"
        aria-labelledby="sidebar-title"
        sx={{
          flex: 1,
          overflow: 'auto', // Scroll interno quando conteúdo exceder
          // Padding padrão de 3 (24px) seguindo LinhagemSidebar
          ...(contentPadding && { p: 3 }),
          // Scrollbar customizada
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.hover',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
