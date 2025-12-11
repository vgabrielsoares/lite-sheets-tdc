/**
 * SkipLink Component
 *
 * Componente de acessibilidade que permite aos usuários de teclado
 * e leitores de tela pular diretamente para o conteúdo principal,
 * evitando ter que navegar por toda a navegação.
 *
 * Seguindo as diretrizes WCAG 2.1 - G1, G123, G124
 */

'use client';

import { Box, Link } from '@mui/material';

export interface SkipLinkProps {
  /**
   * ID do elemento de destino (geralmente o conteúdo principal)
   * @default 'main-content'
   */
  targetId?: string;

  /**
   * Texto do link
   * @default 'Pular para o conteúdo principal'
   */
  label?: string;
}

/**
 * Componente SkipLink
 *
 * Fornece um link visível apenas no foco do teclado que permite
 * aos usuários pular diretamente para o conteúdo principal da página.
 *
 * **Acessibilidade:**
 * - Visível apenas quando focado via teclado
 * - Alto contraste para melhor visibilidade
 * - Posicionamento consistente no topo da página
 * - Funciona com leitores de tela
 *
 * @example
 * ```tsx
 * // No layout principal
 * <SkipLink targetId="main-content" />
 *
 * // No conteúdo principal
 * <main id="main-content">
 *   {children}
 * </main>
 * ```
 */
export function SkipLink({
  targetId = 'main-content',
  label = 'Pular para o conteúdo principal',
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
        '&:focus-within': {
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
          padding: 2,
        },
      }}
    >
      <Link
        href={`#${targetId}`}
        onClick={handleClick}
        sx={{
          display: 'block',
          padding: '12px 24px',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          borderRadius: 1,
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'primary.dark',
            transform: 'translateY(2px)',
          },
          '&:focus': {
            outline: '3px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px',
          },
        }}
      >
        {label}
      </Link>
    </Box>
  );
}

export default SkipLink;
