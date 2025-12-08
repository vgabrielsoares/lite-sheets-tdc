'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { KnownSpell } from '@/types/spells';
import {
  SPELL_MATRIX_LABELS,
  SPELL_CIRCLE_PP_COST,
  SPELL_COMPONENT_ABBREVIATIONS,
  SPELLCASTING_SKILL_LABELS,
} from '@/constants/spells';

export interface SpellCardProps {
  spell: KnownSpell;
  onView?: (spell: KnownSpell) => void;
  onEdit?: (spell: KnownSpell) => void;
  onDelete?: (spellId: string) => void;
}

/**
 * SpellCard - Card individual de feitiço
 *
 * Exibe informações resumidas de um feitiço conhecido:
 * - Nome
 * - Círculo e custo em PP
 * - Matriz
 * - Habilidade de conjuração
 * - Ações (visualizar, editar, deletar)
 */
export function SpellCard({ spell, onView, onEdit, onDelete }: SpellCardProps) {
  const ppCost = SPELL_CIRCLE_PP_COST[spell.circle];
  const matrixLabel = SPELL_MATRIX_LABELS[spell.matrix];
  const skillLabel =
    SPELLCASTING_SKILL_LABELS[
      spell.spellcastingSkill as keyof typeof SPELLCASTING_SKILL_LABELS
    ] ||
    spell.spellcastingSkill.charAt(0).toUpperCase() +
      spell.spellcastingSkill.slice(1);

  const handleView = () => {
    if (onView) onView(spell);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(spell);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(spell.spellId);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          {/* Informações do feitiço */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Nome e círculo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {spell.name}
              </Typography>
              <Chip
                label={`${spell.circle}º círculo`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>

            {/* Detalhes */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
              }}
            >
              {/* Custo PP */}
              <Tooltip title="Custo em PP" arrow>
                <Chip
                  label={`${ppCost} PP`}
                  size="small"
                  color="info"
                  sx={{ fontSize: '0.65rem', height: 18 }}
                />
              </Tooltip>

              {/* Matriz */}
              <Tooltip title="Matriz" arrow>
                <Chip
                  label={matrixLabel}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 18 }}
                />
              </Tooltip>

              {/* Habilidade */}
              <Tooltip title="Habilidade de conjuração" arrow>
                <Chip
                  label={skillLabel}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                  }}
                />
              </Tooltip>
            </Box>

            {/* Anotações (se houver) */}
            {spell.notes && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {spell.notes}
              </Typography>
            )}
          </Box>

          {/* Ações */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              flexShrink: 0,
              alignItems: 'flex-start',
            }}
          >
            {onView && (
              <Tooltip title="Visualizar detalhes" arrow>
                <IconButton
                  size="small"
                  onClick={handleView}
                  aria-label="Visualizar feitiço"
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Editar" arrow>
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  aria-label="Editar feitiço"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Remover" arrow>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  color="error"
                  aria-label="Remover feitiço"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
