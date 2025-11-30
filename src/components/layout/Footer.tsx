/**
 * Footer Component
 *
 * Rodapé da aplicação com informações de copyright e links úteis.
 */

'use client';

import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  useTheme,
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';

/**
 * Footer da aplicação
 *
 * Exibe:
 * - Informações do projeto
 * - Copyright e licença
 * - Link para repositório GitHub
 * - Versão da aplicação
 *
 * @example
 * ```tsx
 * // Usado dentro do AppLayout
 * <Footer />
 * ```
 */
export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: 3,
        position: 'relative',
        zIndex: (theme) => theme.zIndex.drawer + 1, // Fica acima da sidebar
      }}
    >
      <Container maxWidth="lg">
        {/* Informações principais */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Descrição do projeto */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Lite Sheets TDC
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de gerenciamento de fichas para
              <br />
              Tabuleiro do Caos RPG
            </Typography>
          </Box>

          {/* Links úteis */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              textAlign: { xs: 'center', sm: 'right' },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Links
            </Typography>

            <Link
              href="https://github.com/vgabrielsoares/lite-sheets-tdc"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              <GitHubIcon fontSize="small" />
              GitHub
            </Link>

            <Link
              href="https://github.com/vgabrielsoares/lite-sheets-tdc/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Licença GPL-3.0
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Copyright e versão */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Victor Gabriel Soares. Todos os direitos
            reservados.
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Versão 1.0.0-MVP1
          </Typography>
        </Box>

        {/* Nota sobre offline-first */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Seus dados ficam salvos localmente no seu navegador • Funciona
            offline
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
