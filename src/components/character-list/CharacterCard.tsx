'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Fade,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Character } from '@/types';
import { ConfirmDialog } from '@/components/shared';

/**
 * Props do CharacterCard
 */
interface CharacterCardProps {
  /** Personagem a ser exibido */
  character: Character;
  /** Callback ao clicar no card */
  onClick?: (characterId: string) => void;
  /** Callback ao deletar o personagem */
  onDelete?: (characterId: string) => void;
  /** Se está deletando (desabilita interações) */
  isDeleting?: boolean;
}

/**
 * Card de personagem para exibição em lista
 *
 * Exibe informações básicas do personagem:
 * - Nome do personagem
 * - Nome do jogador (se preenchido)
 * - Nível
 * - Linhagem (se preenchida)
 * - Origem (se preenchida)
 * - PV atual/máximo
 * - PP atual/máximo
 * - Botão de deletar (com confirmação)
 *
 * Seguindo requisitos do MVP 1:
 * - Informações básicas conforme especificado em mvp-um.md
 * - Clicável para navegação
 * - Responsivo
 * - Confirmação antes de deletar (Issue 2.5)
 */
export default function CharacterCard({
  character,
  onClick,
  onDelete,
  isDeleting = false,
}: CharacterCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (onClick && !isDeleting && !isPending) {
      startTransition(() => {
        onClick(character.id);
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    // Previne propagação para não acionar o onClick do card
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    if (onDelete) {
      onDelete(character.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isDeleting ? 0.6 : 1,
          pointerEvents: isDeleting || isPending ? 'none' : 'auto',
          position: 'relative',
          '&:hover':
            onClick && !isPending
              ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              : {},
        }}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        aria-label={`Ficha do personagem ${character.name || 'Sem nome'}`}
      >
        {/* Loading Overlay - Spinner ao clicar na ficha */}
        <Fade in={isPending} timeout={150}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 10,
              backdropFilter: 'blur(2px)',
              borderRadius: 'inherit',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <CircularProgress size={32} />
              <Typography variant="caption" color="text.secondary">
                Carregando...
              </Typography>
            </Box>
          </Box>
        </Fade>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Header com nome e botão de delete */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {/* Nome do Personagem */}
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {character.name || 'Sem nome'}
            </Typography>

            {/* Botão de Delete */}
            {onDelete && (
              <Tooltip title="Deletar personagem">
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  aria-label={`Deletar personagem ${character.name || 'sem nome'}`}
                  sx={{
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Nome do Jogador (opcional) */}
          {character.playerName && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mt: -1 }}
            >
              Jogador: {character.playerName}
            </Typography>
          )}

          {/* Chips: Nível, Linhagem, Origem */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Nível (sempre exibido) */}
            <Chip
              label={`Nível ${character.level}`}
              size="small"
              color="primary"
              variant="outlined"
            />

            {/* Linhagem (se preenchida) */}
            {character.lineage?.name && (
              <Chip
                label={character.lineage.name}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}

            {/* Origem (se preenchida) */}
            {character.origin?.name && (
              <Chip
                label={character.origin.name}
                size="small"
                variant="outlined"
                color="info"
              />
            )}
          </Box>

          {/* PV e PP */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 'auto',
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <Box
                component="span"
                sx={{ fontWeight: 600, color: 'error.main' }}
              >
                PV:
              </Box>{' '}
              {character.combat.hp.current}/{character.combat.hp.max}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box
                component="span"
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                PP:
              </Box>{' '}
              {character.combat.pp.current}/{character.combat.pp.max}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deletar Personagem"
        message={`Tem certeza que deseja deletar o personagem "${character.name || 'Sem nome'}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={isDeleting}
      />
    </>
  );
}
