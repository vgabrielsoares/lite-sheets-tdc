/**
 * AppLayout Component
 *
 * Layout principal da aplicação com header, conteúdo e footer.
 * Responsivo e adaptável a diferentes tamanhos de tela.
 */

'use client';

import { ReactNode } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

/**
 * Props do AppLayout
 */
interface AppLayoutProps {
  /** Conteúdo principal da página */
  children: ReactNode;
  /** Define se o conteúdo deve ter largura máxima (container) ou largura total */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Remove padding do container (útil para páginas com layout próprio) */
  disablePadding?: boolean;
}

/**
 * Layout principal da aplicação
 *
 * Estrutura base que envolve todas as páginas, fornecendo:
 * - Header fixo no topo com navegação e toggle de tema
 * - Container responsivo para o conteúdo
 * - Footer com informações e links
 * - Espaçamento apropriado para evitar sobreposição do header
 *
 * @example
 * ```tsx
 * // Em uma página
 * export default function MyPage() {
 *   return (
 *     <AppLayout maxWidth="lg">
 *       <h1>Minha Página</h1>
 *       <p>Conteúdo...</p>
 *     </AppLayout>
 *   );
 * }
 * ```
 */
export default function AppLayout({
  children,
  maxWidth = 'xl',
  disablePadding = false,
}: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        // Scrollbar customizada para toda a página
        '& ::-webkit-scrollbar': {
          width: '12px',
        },
        '& ::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '& ::-webkit-scrollbar-thumb': {
          bgcolor: 'action.hover',
          borderRadius: '6px',
          '&:hover': {
            bgcolor: 'action.selected',
          },
        },
      }}
    >
      {/* Header fixo no topo */}
      <Header />

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          // Espaçamento para compensar header fixo (64px desktop, 56px mobile)
          marginTop: isMobile ? '56px' : '64px',
        }}
      >
        {maxWidth === false ? (
          // Largura total sem container
          <Box
            sx={{
              flexGrow: 1,
              padding: disablePadding ? 0 : { xs: 2, sm: 3, md: 4 },
            }}
          >
            {children}
          </Box>
        ) : (
          // Container com largura máxima
          <Container
            maxWidth={maxWidth}
            sx={{
              flexGrow: 1,
              padding: disablePadding ? 0 : { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Container>
        )}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
