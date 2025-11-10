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
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import type { HealthPoints as HealthPointsType } from '@/types';
import { EditableNumber } from '@/components/shared';

export interface HealthPointsProps {
  /**
   * Dados de PV
   */
  hp: HealthPointsType;

  /**
   * Callback para atualizar PV
   */
  onUpdate: (hp: HealthPointsType) => void;

  /**
   * Variante do componente
   */
  variant?: 'default' | 'compact';
}

/**
 * Componente de Pontos de Vida (PV)
 *
 * Exibe e permite edição de:
 * - PV atual
 * - PV máximo
 * - PV temporário
 *
 * Com controles +/- para ajuste rápido
 *
 * @example
 * ```tsx
 * <HealthPoints
 *   hp={character.combat.hp}
 *   onUpdate={(hp) => updateCharacter({ combat: { ...combat, hp } })}
 * />
 * ```
 */
export function HealthPoints({
  hp,
  onUpdate,
  variant = 'default',
}: HealthPointsProps) {
  // Incrementar/decrementar PV atual
  const adjustCurrent = (amount: number) => {
    const newCurrent = Math.max(
      0,
      Math.min(hp.max + hp.temporary, hp.current + amount)
    );
    onUpdate({ ...hp, current: newCurrent });
  };

  // Incrementar/decrementar PV máximo
  const adjustMax = (amount: number) => {
    const newMax = Math.max(1, hp.max + amount);
    onUpdate({ ...hp, max: newMax });
  };

  // Incrementar/decrementar PV temporário
  const adjustTemporary = (amount: number) => {
    const newTemporary = Math.max(0, hp.temporary + amount);
    onUpdate({ ...hp, temporary: newTemporary });
  };

  // Calcular porcentagem de PV para barra visual
  const percentage = Math.round((hp.current / (hp.max + hp.temporary)) * 100);

  // Cor da barra baseada na porcentagem
  const getBarColor = (): string => {
    if (percentage > 75) return 'success.main';
    if (percentage > 50) return 'warning.main';
    if (percentage > 25) return 'error.light';
    return 'error.main';
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FavoriteIcon color="error" />
        <Typography variant="h6">
          {hp.current} / {hp.max}
          {hp.temporary > 0 && ` (+${hp.temporary})`}
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
          <FavoriteIcon color="error" />
          Pontos de Vida (PV)
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Barra Visual de PV */}
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

        <Stack spacing={2}>
          {/* PV Atual */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              PV Atual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PV">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(-1)}
                  disabled={hp.current === 0}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Diminuir 5 PV">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(-5)}
                  disabled={hp.current === 0}
                  color="error"
                >
                  <Typography variant="caption">-5</Typography>
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={hp.current}
                  onChange={(current) => onUpdate({ ...hp, current })}
                  variant="h4"
                  min={0}
                  max={hp.max + hp.temporary}
                  validate={(value) => {
                    if (value < 0) return 'PV não pode ser negativo';
                    if (value > hp.max + hp.temporary) {
                      return `PV atual não pode exceder PV máximo + temporário (${hp.max + hp.temporary})`;
                    }
                    return null;
                  }}
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 5 PV">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(5)}
                  disabled={hp.current >= hp.max + hp.temporary}
                  color="success"
                >
                  <Typography variant="caption">+5</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Aumentar 1 PV">
                <IconButton
                  size="small"
                  onClick={() => adjustCurrent(1)}
                  disabled={hp.current >= hp.max + hp.temporary}
                  color="success"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* PV Máximo */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              PV Máximo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PV máximo">
                <IconButton
                  size="small"
                  onClick={() => adjustMax(-1)}
                  disabled={hp.max === 1}
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={hp.max}
                  onChange={(max) => onUpdate({ ...hp, max })}
                  variant="h5"
                  min={1}
                  validate={(value) => {
                    if (value < 1) return 'PV máximo deve ser pelo menos 1';
                    return null;
                  }}
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 1 PV máximo">
                <IconButton size="small" onClick={() => adjustMax(1)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* PV Temporário */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <ShieldIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                PV Temporário
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Diminuir 1 PV temporário">
                <IconButton
                  size="small"
                  onClick={() => adjustTemporary(-1)}
                  disabled={hp.temporary === 0}
                >
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={hp.temporary}
                  onChange={(temporary) => onUpdate({ ...hp, temporary })}
                  variant="h6"
                  min={0}
                  showSign
                  textFieldProps={{ sx: { textAlign: 'center' } }}
                />
              </Box>

              <Tooltip title="Aumentar 1 PV temporário">
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
