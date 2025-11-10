'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShieldIcon from '@mui/icons-material/Shield';
import type { PowerPoints as PowerPointsType } from '@/types';
import { EditableNumber } from '@/components/shared';

export interface PowerPointsProps {
  /**
   * Dados de PP
   */
  pp: PowerPointsType;

  /**
   * Callback para atualizar PP
   */
  onUpdate: (pp: PowerPointsType) => void;

  /**
   * Variante do componente
   */
  variant?: 'default' | 'compact';
}

/**
 * Componente de Pontos de Poder (PP)
 *
 * Exibe e permite edição de:
 * - PP atual
 * - PP máximo
 * - PP temporário
 *
 * Com controles +/- para ajuste rápido
 *
 * @example
 * ```tsx
 * <PowerPoints
 *   pp={character.combat.pp}
 *   onUpdate={(pp) => updateCharacter({ combat: { ...combat, pp } })}
 * />
 * ```
 */
export function PowerPoints({
  pp,
  onUpdate,
  variant = 'default',
}: PowerPointsProps) {
  // Incrementar/decrementar PP atual
  const adjustCurrent = (amount: number) => {
    const newCurrent = Math.max(
      0,
      Math.min(pp.max + pp.temporary, pp.current + amount)
    );
    onUpdate({ ...pp, current: newCurrent });
  };

  // Incrementar/decrementar PP máximo
  const adjustMax = (amount: number) => {
    const newMax = Math.max(0, pp.max + amount);
    onUpdate({ ...pp, max: newMax });
  };

  // Incrementar/decrementar PP temporário
  const adjustTemporary = (amount: number) => {
    const newTemporary = Math.max(0, pp.temporary + amount);
    onUpdate({ ...pp, temporary: newTemporary });
  };

  // Calcular porcentagem de PP para barra visual
  const maxTotal = pp.max + pp.temporary;
  const percentage =
    maxTotal > 0 ? Math.round((pp.current / maxTotal) * 100) : 0;

  // Cor da barra baseada na porcentagem
  const getBarColor = (): string => {
    if (percentage > 75) return 'info.main';
    if (percentage > 50) return 'primary.main';
    if (percentage > 25) return 'warning.light';
    return 'warning.main';
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6">
          {pp.current} / {pp.max}
          {pp.temporary > 0 && ` (+${pp.temporary})`}
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AutoAwesomeIcon color="primary" />
          Pontos de Poder (PP)
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Barra Visual de PP */}
        {maxTotal > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: '100%',
                height: 24,
                bgcolor: 'action.disabledBackground',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: `${percentage}%`,
                  height: '100%',
                  bgcolor: getBarColor(),
                  transition: 'width 0.3s ease-in-out, background-color 0.3s',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 0 2px rgba(0,0,0,0.8)',
                }}
              >
                {percentage}%
              </Typography>
            </Box>
          </Box>
        )}

        <Stack spacing={2}>
          {/* PP Atual */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              PP Atual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PP">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(-1)}
                  disabled={pp.current === 0}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={pp.current}
                  onChange={(current) => onUpdate({ ...pp, current })}
                  variant="h4"
                  min={0}
                  max={pp.max + pp.temporary}
                  validate={(value) => {
                    if (value < 0) return 'PP não pode ser negativo';
                    if (value > pp.max + pp.temporary) {
                      return `PP atual não pode exceder PP máximo + temporário (${pp.max + pp.temporary})`;
                    }
                    return null;
                  }}
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 1 PP">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(1)}
                  disabled={pp.current >= pp.max + pp.temporary}
                  color="success"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* PP Máximo */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              PP Máximo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PP máximo">
                <IconButton
                  size="small"
                  onClick={() => adjustMax(-1)}
                  disabled={pp.max === 0}
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={pp.max}
                  onChange={(max) => onUpdate({ ...pp, max })}
                  variant="h5"
                  min={0}
                  validate={(value) => {
                    if (value < 0) return 'PP máximo não pode ser negativo';
                    return null;
                  }}
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 1 PP máximo">
                <IconButton size="small" onClick={() => adjustMax(1)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* PP Temporário */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <ShieldIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                PP Temporário
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PP temporário">
                <IconButton
                  size="small"
                  onClick={() => adjustTemporary(-1)}
                  disabled={pp.temporary === 0}
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={pp.temporary}
                  onChange={(temporary) => onUpdate({ ...pp, temporary })}
                  variant="h6"
                  min={0}
                  showSign
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 1 PP temporário">
                <IconButton size="small" onClick={() => adjustTemporary(1)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
