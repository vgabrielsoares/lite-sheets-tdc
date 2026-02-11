/**
 * PowerPointsDisplay - Exibição completa de PP (Pontos de Poder)
 *
 * v0.0.2: Componente para aba de combate, segue o padrão de ResourceBlock
 * usado por GuardVitalityDisplay (GA e PV):
 * - Ícone + nome do recurso
 * - Números grandes (current / max)
 * - Barra de progresso segmentada (principal + temporário)
 * - Botões "Gastar" e "Recuperar" com input numérico
 *
 * Diferente do CompactPowerPoints (aba principal), que é compacto e sem botões.
 */
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
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import type { PowerPoints } from '@/types/combat';

export interface PowerPointsDisplayProps {
  /** Pontos de Poder */
  pp: PowerPoints;
  /** Callback para atualizar PP */
  onChange: (pp: PowerPoints) => void;
  /** Callback para abrir sidebar de detalhes (opcional) */
  onOpenDetails?: () => void;
}

/**
 * Componente completo de PP para aba de combate.
 * Segue o mesmo padrão visual de ResourceBlock (GA / PV).
 */
export const PowerPointsDisplay = React.memo(function PowerPointsDisplay({
  pp,
  onChange,
  onOpenDetails,
}: PowerPointsDisplayProps) {
  const theme = useTheme();
  const [spendValue, setSpendValue] = useState('');
  const [recoverValue, setRecoverValue] = useState('');

  const effectiveMax = pp.max + (pp.temporary ?? 0);
  const percent =
    effectiveMax > 0
      ? Math.min(100, Math.floor((pp.current / effectiveMax) * 100))
      : 0;
  const tempValue = pp.temporary ?? 0;
  const tempPercent =
    tempValue > 0 && effectiveMax > 0
      ? Math.min(100 - percent, Math.floor((tempValue / effectiveMax) * 100))
      : 0;

  const isExhausted = pp.current <= 0;

  /** Gastar PP */
  const handleSpend = useCallback(() => {
    const amount = parseInt(spendValue, 10);
    if (isNaN(amount) || amount <= 0) return;
    const newCurrent = Math.max(0, pp.current - amount);
    onChange({ ...pp, current: newCurrent });
    setSpendValue('');
  }, [spendValue, pp, onChange]);

  /** Recuperar PP */
  const handleRecover = useCallback(() => {
    const amount = parseInt(recoverValue, 10);
    if (isNaN(amount) || amount <= 0) return;
    const newCurrent = Math.min(effectiveMax, pp.current + amount);
    onChange({ ...pp, current: newCurrent });
    setRecoverValue('');
  }, [recoverValue, pp, effectiveMax, onChange]);

  const parsedSpend = parseInt(spendValue, 10);
  const spendDisabled =
    !spendValue ||
    isNaN(parsedSpend) ||
    parsedSpend <= 0 ||
    parsedSpend > pp.current;

  const parsedRecover = parseInt(recoverValue, 10);
  const recoverDisabled =
    !recoverValue ||
    isNaN(parsedRecover) ||
    parsedRecover <= 0 ||
    pp.current >= effectiveMax;

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
              <FlashOnIcon color="info" />
              <Typography variant="subtitle2" fontWeight="bold">
                Pontos de Poder (PP)
              </Typography>
            </Stack>
            {isExhausted && (
              <Chip
                label="Esgotado"
                color="error"
                size="small"
                variant="filled"
              />
            )}
          </Stack>

          {/* Current/Max display */}
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ fontWeight: 'bold', mb: 0.5 }}
          >
            {pp.current}
            <Typography component="span" variant="h6" color="text.secondary">
              {' '}
              / {pp.max}
            </Typography>
            {tempValue > 0 && (
              <Typography
                component="span"
                variant="h6"
                color="info.main"
                sx={{ fontWeight: 'bold' }}
              >
                {' '}
                (+{tempValue})
              </Typography>
            )}
          </Typography>

          {/* Progress bar */}
          <Box
            sx={{
              position: 'relative',
              height: 8,
              borderRadius: 999,
              bgcolor: 'action.disabledBackground',
              mb: 1.5,
              overflow: 'hidden',
            }}
          >
            {/* PP principal */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${percent}%`,
                bgcolor: 'info.main',
                borderRadius: 999,
                transition: 'width 0.3s ease-in-out',
              }}
            />
            {/* PP temporário */}
            {tempPercent > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${percent}%`,
                  top: 0,
                  height: '100%',
                  width: `${tempPercent}%`,
                  bgcolor: 'info.light',
                  borderRadius: 999,
                  transition: 'width 0.3s ease-in-out',
                  opacity: 0.7,
                }}
              />
            )}
          </Box>

          {/* Gastar / Recuperar controls */}
          <Stack spacing={1} onClick={(e) => e.stopPropagation()}>
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
                  'aria-label': 'Quantidade para gastar PP',
                }}
                sx={{ width: 80 }}
              />
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
            </Stack>

            {/* Recuperar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                type="number"
                placeholder="Qtd"
                value={recoverValue}
                onChange={(e) => setRecoverValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRecover();
                }}
                inputProps={{
                  min: 1,
                  style: { textAlign: 'center' },
                  'aria-label': 'Quantidade para recuperar PP',
                }}
                sx={{ width: 80 }}
              />
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={handleRecover}
                disabled={recoverDisabled}
                sx={{ textTransform: 'none', flex: 1 }}
              >
                Recuperar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
});

PowerPointsDisplay.displayName = 'PowerPointsDisplay';

export default PowerPointsDisplay;
