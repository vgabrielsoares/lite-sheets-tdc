'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import type { SpellPoints } from '@/types/spells';
import { SPELL_CIRCLE_PF_COST, CHANNEL_MANA_LABELS } from '@/constants/spells';

export interface CompactSpellPointsProps {
  /** Pontos de Feitiço do personagem */
  spellPoints: SpellPoints;
  /** Callback para alterar PF */
  onChange: (spellPoints: SpellPoints) => void;
  /** Callback para abrir detalhes (sidebar) */
  onOpenDetails?: () => void;
}

/**
 * CompactSpellPoints - Exibição compacta de Pontos de Feitiço (PF)
 *
 * v0.0.2: Exibe PF atual/máximo com barra de progresso.
 * - Gerar: adiciona PF (via Canalizar Mana em combate)
 * - Gastar PF também gasta PP (regra informada via tooltip)
 * - Cor: secondary (roxo) para distinguir de PP (azul)
 */
export const CompactSpellPoints = React.memo(function CompactSpellPoints({
  spellPoints,
  onChange,
  onOpenDetails,
}: CompactSpellPointsProps) {
  const percent =
    spellPoints.max > 0
      ? Math.min(100, Math.floor((spellPoints.current / spellPoints.max) * 100))
      : 0;

  return (
    <Card
      variant="outlined"
      onClick={onOpenDetails}
      sx={{
        cursor: onOpenDetails ? 'pointer' : 'default',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoFixHighIcon color="secondary" />
            <Typography variant="subtitle2" fontWeight="bold">
              Pontos de Feitiço (PF)
            </Typography>
          </Stack>
          <Tooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
                >
                  Custo de PF por Círculo:
                </Typography>
                {Object.entries(SPELL_CIRCLE_PF_COST).map(([circle, cost]) => (
                  <Typography
                    key={circle}
                    variant="caption"
                    sx={{ display: 'block' }}
                  >
                    {circle}º: <strong>{cost} PF</strong>
                  </Typography>
                ))}
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}
                >
                  Canalizar Mana:
                </Typography>
                {Object.entries(CHANNEL_MANA_LABELS).map(([actions, label]) => (
                  <Typography
                    key={actions}
                    variant="caption"
                    sx={{ display: 'block' }}
                  >
                    {label}
                  </Typography>
                ))}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    fontStyle: 'italic',
                    color: 'warning.main',
                  }}
                >
                  Gastar PF também gasta PP.
                </Typography>
              </Box>
            }
            arrow
          >
            <InfoIcon
              sx={{
                fontSize: 16,
                color: 'text.secondary',
                cursor: 'help',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Stack>

        {/* Current/Max */}
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 0.5 }}
        >
          {spellPoints.current}
          <Typography component="span" variant="h6" color="text.secondary">
            {' '}
            / {spellPoints.max}
          </Typography>
        </Typography>

        {/* Progress bar */}
        <LinearProgress
          color="secondary"
          variant="determinate"
          value={percent}
          sx={{ height: 8, borderRadius: 999 }}
        />
      </CardContent>
    </Card>
  );
});

CompactSpellPoints.displayName = 'CompactSpellPoints';

export default CompactSpellPoints;
