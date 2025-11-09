'use client';

import React, { useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Larguras disponíveis para a sidebar
 */
const SIDEBAR_WIDTHS = {
  sm: 320,
  md: 480,
  lg: 640,
} as const;

export type SidebarWidth = keyof typeof SIDEBAR_WIDTHS;

export interface SidebarProps {
  /**
   * Controla se a sidebar está aberta ou fechada
   */
  open: boolean;

  /**
   * Callback chamado quando a sidebar deve ser fechada
   */
  onClose: () => void;

  /**
   * Título exibido no topo da sidebar (opcional)
   */
  title?: string;

  /**
   * Conteúdo da sidebar
   */
  children: React.ReactNode;

  /**
   * Largura da sidebar
   * @default 'md'
   */
  width?: SidebarWidth;

  /**
   * Lado da tela onde a sidebar aparece
   * @default 'right'
   */
  anchor?: 'left' | 'right';

  /**
   * Se true, exibe um overlay escurecido quando aberta
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Se true, permite fechar ao clicar no overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Se true, permite fechar ao pressionar ESC
   * @default true
   */
  closeOnEscape?: boolean;
}

/**
 * Componente Sidebar Retrátil
 *
 * Sidebar reutilizável que se adapta responsivamente:
 * - Desktop: Sidebar fixa lateral
 * - Mobile: Drawer que cobre a tela
 *
 * Funcionalidades:
 * - Animação suave de abertura/fechamento
 * - Diferentes tamanhos (sm, md, lg)
 * - Fechamento por ESC, overlay ou botão
 * - Totalmente acessível (keyboard navigation)
 * - Responsivo (drawer no mobile, sidebar no desktop)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, open, close } = useSidebar();
 *
 *   return (
 *     <>
 *       <button onClick={open}>Abrir detalhes</button>
 *       <Sidebar
 *         open={isOpen}
 *         onClose={close}
 *         title="Detalhes do Atributo"
 *         width="md"
 *       >
 *         <p>Conteúdo aqui...</p>
 *       </Sidebar>
 *     </>
 *   );
 * }
 * ```
 */
export function Sidebar({
  open,
  onClose,
  title,
  children,
  width = 'md',
  anchor = 'right',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Largura da sidebar baseada no tamanho selecionado
  const sidebarWidth = SIDEBAR_WIDTHS[width];

  // No mobile, usa fullscreen em telas muito pequenas
  const drawerWidth =
    isMobile && window.innerWidth < 360 ? '100%' : sidebarWidth;

  /**
   * Effect para fechar sidebar ao pressionar ESC
   */
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, onClose]);

  /**
   * Handler para fechar ao clicar no overlay
   */
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={handleOverlayClick}
      variant={isMobile ? 'temporary' : 'temporary'}
      ModalProps={{
        keepMounted: false, // Desmonta quando fecha para melhor testabilidade
        ...(showOverlay
          ? {}
          : {
              BackdropProps: {
                invisible: true,
              },
            }),
      }}
      SlideProps={{
        direction: anchor === 'left' ? 'right' : 'left',
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          maxWidth: '100vw',
          boxSizing: 'border-box',
          // Transição suave
          transition: theme.transitions.create(['transform', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        role="complementary"
        aria-label={title || 'Sidebar de detalhes'}
      >
        {/* Header da Sidebar */}
        {title && (
          <>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 64,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  flex: 1,
                  pr: 2,
                }}
              >
                {title}
              </Typography>

              <IconButton
                onClick={onClose}
                aria-label="Fechar sidebar"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
          </>
        )}

        {/* Botão de fechar quando não há título */}
        {!title && (
          <Box
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <IconButton
              onClick={onClose}
              aria-label="Fechar sidebar"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Conteúdo da Sidebar */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            // Scrollbar personalizada
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.default,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Drawer>
  );
}
