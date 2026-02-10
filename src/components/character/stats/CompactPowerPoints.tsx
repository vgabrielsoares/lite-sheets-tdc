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
  Chip,
  Tooltip,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import type { PowerPoints } from '@/types/combat';
import { applyDeltaToPP } from '@/utils';

export interface CompactPowerPointsProps {
  pp: PowerPoints;
  onChange: (pp: PowerPoints) => void;
  onOpenDetails?: () => void;
}

/**
 * CompactPowerPoints - Exibição compacta de Pontos de Poder com Gastar/Recuperar
 *
 * v0.0.2: Usa padrão de input numérico + botões Gastar/Recuperar
 * em vez de botões +/-.
 * - Gasto subtrai de PP temporários primeiro, depois dos atuais
 * - Recuperação adiciona aos PP atuais (cap em max)
 */
export const CompactPowerPoints = React.memo(function CompactPowerPoints({
  pp,
  onChange,
  onOpenDetails,
}: CompactPowerPointsProps) {
  const [spendValue, setSpendValue] = useState('');
  const [recoverValue, setRecoverValue] = useState('');

  const handleSpend = useCallback(() => {
    const amount = parseInt(spendValue, 10);
    if (!isNaN(amount) && amount > 0) {
      onChange(applyDeltaToPP(pp, -amount));
      setSpendValue('');
    }
  }, [spendValue, pp, onChange]);

  const handleRecover = useCallback(() => {
    const amount = parseInt(recoverValue, 10);
    if (!isNaN(amount) && amount > 0) {
      onChange(applyDeltaToPP(pp, amount));
      setRecoverValue('');
    }
  }, [recoverValue, pp, onChange]);

  const effectiveMax = pp.max + (pp.temporary ?? 0);
  const percent =
    effectiveMax > 0
      ? Math.min(100, Math.floor((pp.current / effectiveMax) * 100))
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
            <BoltIcon color="info" />
            <Typography variant="subtitle2" fontWeight="bold">
              Pontos de Poder (PP)
            </Typography>
          </Stack>
          {(pp.temporary ?? 0) > 0 && (
            <Chip
              label={`+${pp.temporary} temp`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        {/* Current/Max */}
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
        </Typography>

        {/* Progress bar */}
        <LinearProgress
          color="info"
          variant="determinate"
          value={percent}
          sx={{ height: 8, borderRadius: 999, mb: 1.5 }}
        />

        {/* Gastar / Recuperar */}
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
              disabled={
                !spendValue || parseInt(spendValue, 10) <= 0 || pp.current <= 0
              }
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
              disabled={
                !recoverValue ||
                parseInt(recoverValue, 10) <= 0 ||
                pp.current >= pp.max
              }
              sx={{ textTransform: 'none', flex: 1 }}
            >
              Recuperar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

CompactPowerPoints.displayName = 'CompactPowerPoints';

export default CompactPowerPoints;
