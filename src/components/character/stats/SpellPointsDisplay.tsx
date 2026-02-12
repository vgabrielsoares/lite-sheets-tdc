'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import type { SpellPoints } from '@/types/spells';
import type { PowerPoints } from '@/types/combat';
import { SPELL_CIRCLE_PF_COST, CHANNEL_MANA_LABELS } from '@/constants/spells';

export interface SpellPointsDisplayProps {
  /** Pontos de Feitiço do personagem */
  spellPoints: SpellPoints;
  /** Pontos de Poder do personagem (para validação PF↔PP) */
  pp: PowerPoints;
  /** Callback para alterar PF */
  onChange: (spellPoints: SpellPoints) => void;
  /** Callback para alterar PP (gasto de PF também gasta PP) */
  onPPChange: (pp: PowerPoints) => void;
  /** Callback para abrir sidebar de detalhes (opcional) */
  onOpenDetails?: () => void;
}

/**
 * SpellPointsDisplay - Exibição completa de Pontos de Feitiço (PF)
 *
 * Componente completo com Gastar/Gerar para aba de Combate.
 * - Gastar PF também gasta PP (regra do sistema)
 * - Bloqueia gasto se PP = 0 (Esgotado) ou PP insuficiente
 * - Gerar PF (via final de turno ou Canalizar Mana) não gasta PP
 * - Cor: secondary (roxo) conforme guidelines
 * - Ícone: AutoFixHighIcon
 */
export const SpellPointsDisplay = React.memo(function SpellPointsDisplay({
  spellPoints,
  pp,
  onChange,
  onPPChange,
  onOpenDetails,
}: SpellPointsDisplayProps) {
  const [spendValue, setSpendValue] = useState('');
  const [generateValue, setGenerateValue] = useState('');

  const handleSpend = useCallback(() => {
    const amount = parseInt(spendValue, 10);
    if (isNaN(amount) || amount <= 0) return;

    // Validações PF↔PP
    if (pp.current <= 0) return;
    if (pp.current < amount) return;
    if (spellPoints.current < amount) return;

    // Gastar PF e PP simultaneamente
    onChange({
      ...spellPoints,
      current: Math.max(0, spellPoints.current - amount),
    });
    onPPChange({
      ...pp,
      current: Math.max(0, pp.current - amount),
    });
    setSpendValue('');
  }, [spendValue, spellPoints, pp, onChange, onPPChange]);

  const handleGenerate = useCallback(() => {
    const amount = parseInt(generateValue, 10);
    if (isNaN(amount) || amount <= 0) return;

    onChange({
      ...spellPoints,
      current: Math.min(spellPoints.max, spellPoints.current + amount),
    });
    setGenerateValue('');
  }, [generateValue, spellPoints, onChange]);

  const percent =
    spellPoints.max > 0
      ? Math.min(100, Math.floor((spellPoints.current / spellPoints.max) * 100))
      : 0;

  const isExhausted = pp.current <= 0;
  const parsedSpend = parseInt(spendValue, 10);
  const spendDisabled =
    !spendValue ||
    isNaN(parsedSpend) ||
    parsedSpend <= 0 ||
    isExhausted ||
    parsedSpend > pp.current ||
    parsedSpend > spellPoints.current;

  return (
    <Box
      onClick={onOpenDetails}
      sx={{
        cursor: onOpenDetails ? 'pointer' : 'default',
      }}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onOpenDetails) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails();
        }
      }}
    >
      <Card variant="outlined">
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
                  {Object.entries(SPELL_CIRCLE_PF_COST).map(
                    ([circle, cost]) => (
                      <Typography
                        key={circle}
                        variant="caption"
                        sx={{ display: 'block' }}
                      >
                        {circle}º: <strong>{cost} PF</strong>
                      </Typography>
                    )
                  )}
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}
                  >
                    Canalizar Mana:
                  </Typography>
                  {Object.entries(CHANNEL_MANA_LABELS).map(
                    ([actions, label]) => (
                      <Typography
                        key={actions}
                        variant="caption"
                        sx={{ display: 'block' }}
                      >
                        {label}
                      </Typography>
                    )
                  )}
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
                sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }}
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
            sx={{ height: 8, borderRadius: 999, mb: 1.5 }}
          />

          {/* Esgotado warning */}
          {isExhausted && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: 'block',
                textAlign: 'center',
                mb: 1,
                fontWeight: 600,
              }}
            >
              Esgotado — não pode conjurar com 0 PP
            </Typography>
          )}

          {/* Gastar / Gerar */}
          <Stack spacing={1}>
            {/* Gastar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                type="number"
                placeholder="Qtd"
                value={spendValue}
                onChange={(e) => setSpendValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSpend();
                }}
                inputProps={{
                  min: 1,
                  style: { textAlign: 'center' },
                  'aria-label': 'Quantidade para gastar PF',
                }}
                sx={{ width: 80 }}
              />
              <Tooltip
                title={
                  isExhausted
                    ? 'Esgotado — 0 PP'
                    : 'Gastar PF também gasta PP no mesmo valor'
                }
                arrow
              >
                <span style={{ flex: 1, display: 'flex' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={handleSpend}
                    disabled={spendDisabled}
                    sx={{ textTransform: 'none', flex: 1 }}
                  >
                    Gastar
                  </Button>
                </span>
              </Tooltip>
            </Stack>

            {/* Gerar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                type="number"
                placeholder="Qtd"
                value={generateValue}
                onChange={(e) => setGenerateValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                inputProps={{
                  min: 1,
                  style: { textAlign: 'center' },
                  'aria-label': 'Quantidade para gerar PF',
                }}
                sx={{ width: 80 }}
              />
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={handleGenerate}
                disabled={
                  !generateValue ||
                  parseInt(generateValue, 10) <= 0 ||
                  spellPoints.current >= spellPoints.max
                }
                sx={{ textTransform: 'none', flex: 1 }}
              >
                Gerar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
});

SpellPointsDisplay.displayName = 'SpellPointsDisplay';

export default SpellPointsDisplay;
