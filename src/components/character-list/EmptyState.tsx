'use client';

import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon, PersonOutline } from '@mui/icons-material';

/**
 * Props do EmptyState
 */
interface EmptyStateProps {
  /** Título do estado vazio */
  title: string;
  /** Descrição do estado vazio */
  description?: string;
  /** Texto do botão de ação */
  actionLabel: string;
  /** Callback ao clicar no botão de ação */
  onAction: () => void;
  /** Ícone a ser exibido (componente MUI Icon) */
  icon?: React.ReactNode;
}

/**
 * Componente de estado vazio reutilizável
 *
 * Exibe:
 * - Ícone representativo
 * - Título
 * - Descrição (opcional)
 * - Botão de ação principal
 *
 * Usado em:
 * - Lista de fichas vazia
 * - Seções de inventário vazias
 * - Listas de feitiços vazias
 * - Qualquer outro estado vazio da aplicação
 *
 * Seguindo princípio DRY (Don't Repeat Yourself):
 * - Componente reutilizável para todos os estados vazios
 * - Customizável via props
 * - Acessível
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const DefaultIcon = icon || (
    <PersonOutline
      sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }}
    />
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: '50vh', sm: '60vh' },
        textAlign: 'center',
        gap: 3,
        px: 2,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Ícone */}
      {DefaultIcon}

      {/* Textos */}
      <Box sx={{ maxWidth: 500 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              fontSize: { xs: '0.95rem', sm: '1rem' },
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Botão de Ação */}
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={onAction}
        sx={{
          px: 4,
          py: 1.5,
          fontSize: { xs: '0.95rem', sm: '1rem' },
        }}
        aria-label={actionLabel}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
