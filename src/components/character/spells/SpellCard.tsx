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
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { KnownSpell } from '@/types/spells';
import {
  SPELL_MATRIX_LABELS,
  SPELL_CIRCLE_PF_COST,
  SPELL_COMPONENT_ABBREVIATIONS,
  SPELLCASTING_SKILL_LABELS,
  SPELL_MATRIX_COLORS,
  SPELLCASTING_SKILL_COLORS,
} from '@/constants/spells';
import { getContrastColor } from '@/utils';

export interface SpellCardProps {
  spell: KnownSpell;
  onClick?: (spell: KnownSpell) => void;
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
 * - Ação de deletar
 *
 * Clique no card para abrir detalhes/edição
 */
export function SpellCard({ spell, onClick, onDelete }: SpellCardProps) {
  const pfCost = SPELL_CIRCLE_PF_COST[spell.circle];
  const matrixLabel = SPELL_MATRIX_LABELS[spell.matrix];
  const skillLabel =
    SPELLCASTING_SKILL_LABELS[
      spell.spellcastingSkill as keyof typeof SPELLCASTING_SKILL_LABELS
    ] ||
    spell.spellcastingSkill.charAt(0).toUpperCase() +
      spell.spellcastingSkill.slice(1);

  const handleCardClick = () => {
    if (onClick) onClick(spell);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(spell.spellId);
  };

  return (
    <Card
      elevation={0}
      onClick={handleCardClick}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              borderColor: 'primary.main',
              boxShadow: 2,
            }
          : {},
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
              {/* Custo PF */}
              <Tooltip title="Custo em PF" arrow>
                <Chip
                  label={`${pfCost} PF`}
                  size="small"
                  color="secondary"
                  sx={{ fontSize: '0.65rem', height: 18 }}
                />
              </Tooltip>

              {/* Matriz */}
              <Tooltip title="Matriz" arrow>
                <Chip
                  label={matrixLabel}
                  size="small"
                  variant="filled"
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    backgroundColor: SPELL_MATRIX_COLORS[spell.matrix],
                    color: getContrastColor(SPELL_MATRIX_COLORS[spell.matrix]),
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: SPELL_MATRIX_COLORS[spell.matrix],
                      filter: 'brightness(0.9)',
                    },
                  }}
                />
              </Tooltip>

              {/* Habilidade */}
              <Tooltip title="Habilidade de conjuração" arrow>
                <Chip
                  label={skillLabel}
                  size="small"
                  variant="filled"
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    backgroundColor:
                      SPELLCASTING_SKILL_COLORS[
                        spell.spellcastingSkill as keyof typeof SPELLCASTING_SKILL_COLORS
                      ] || '#757575',
                    color: getContrastColor(
                      SPELLCASTING_SKILL_COLORS[
                        spell.spellcastingSkill as keyof typeof SPELLCASTING_SKILL_COLORS
                      ] || '#757575'
                    ),
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor:
                        SPELLCASTING_SKILL_COLORS[
                          spell.spellcastingSkill as keyof typeof SPELLCASTING_SKILL_COLORS
                        ] || '#757575',
                      filter: 'brightness(0.9)',
                    },
                  }}
                />
              </Tooltip>
            </Box>

            {/* Tags (se houver) */}
            {spell.tags && spell.tags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  mt: 1,
                }}
              >
                {spell.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: 16,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            )}

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
          {onDelete && (
            <Box
              sx={{
                display: 'flex',
                flexShrink: 0,
                alignItems: 'flex-start',
              }}
            >
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
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
