/**
 * CarryCapacityDisplay - Exibição de Capacidade de Carga
 *
 * Componente para exibir a capacidade de carga do personagem,
 * incluindo peso atual, capacidade máxima, estado de encumbrance,
 * e capacidades de empurrar/levantar.
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Tooltip,
  Divider,
  Grid,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PushPinIcon from '@mui/icons-material/PushPin';
import type { Character } from '@/types';
import type { CreatureSize } from '@/types/common';
import {
  generateCarryingCapacity,
  calculateCarryPercentage,
  ENCUMBRANCE_STATE_DESCRIPTIONS,
  ENCUMBRANCE_STATE_COLORS,
  type EncumbranceState,
} from '@/utils/carryCapacityCalculations';

export interface CarryCapacityDisplayProps {
  /** Personagem para calcular capacidade */
  character: Character;
  /** Se deve mostrar detalhes expandidos */
  showDetails?: boolean;
}

/**
 * Ícone para o estado de carga
 */
function EncumbranceIcon({ state }: { state: EncumbranceState }) {
  switch (state) {
    case 'normal':
      return <CheckCircleIcon fontSize="small" />;
    case 'sobrecarregado':
      return <WarningIcon fontSize="small" />;
    case 'imobilizado':
      return <BlockIcon fontSize="small" />;
  }
}

/**
 * Label formatado para estado de carga
 */
function getStateLabel(state: EncumbranceState): string {
  switch (state) {
    case 'normal':
      return 'Normal';
    case 'sobrecarregado':
      return 'Sobrecarregado';
    case 'imobilizado':
      return 'Imobilizado';
  }
}

/**
 * Cor da barra de progresso baseada na porcentagem
 */
function getProgressColor(percentage: number): 'success' | 'warning' | 'error' {
  if (percentage <= 100) return 'success';
  if (percentage <= 200) return 'warning';
  return 'error';
}

/**
 * Componente de Exibição de Capacidade de Carga
 */
export function CarryCapacityDisplay({
  character,
  showDetails = true,
}: CarryCapacityDisplayProps) {
  // Calcular capacidade de carga
  const carryingCapacity = useMemo(() => {
    const forca = character.attributes?.forca ?? 1;
    const size = (character.size ?? 'medio') as CreatureSize;
    const items = character.inventory?.items ?? [];
    const currency = character.inventory?.currency ?? {
      physical: { cobre: 0, ouro: 0, platina: 0 },
      bank: { cobre: 0, ouro: 0, platina: 0 },
    };

    // Outros modificadores podem vir de habilidades, itens mágicos, etc.
    const otherModifiers = 0;

    return generateCarryingCapacity(
      forca,
      size,
      items,
      currency,
      otherModifiers
    );
  }, [character]);

  // Calcular porcentagem para a barra de progresso
  const percentage = useMemo(
    () =>
      calculateCarryPercentage(
        carryingCapacity.currentWeight,
        carryingCapacity.total
      ),
    [carryingCapacity]
  );

  // Normalizar porcentagem para a barra (máximo 100%)
  const normalizedPercentage = Math.min(percentage, 100);

  // Obter cor do estado
  const stateColor =
    ENCUMBRANCE_STATE_COLORS[carryingCapacity.encumbranceState];
  const stateDescription =
    ENCUMBRANCE_STATE_DESCRIPTIONS[carryingCapacity.encumbranceState];

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: stateColor === 'error' ? 'error.main' : 'divider',
        transition: 'border-color 0.3s ease-in-out',
      }}
    >
      <CardContent>
        {/* Cabeçalho */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FitnessCenterIcon color="primary" fontSize="small" />
            Capacidade de Carga
          </Typography>

          <Tooltip title={stateDescription} arrow>
            <Chip
              icon={
                <EncumbranceIcon state={carryingCapacity.encumbranceState} />
              }
              label={getStateLabel(carryingCapacity.encumbranceState)}
              color={stateColor}
              size="small"
              variant="filled"
            />
          </Tooltip>
        </Stack>

        {/* Barra de Progresso */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Peso Atual
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {carryingCapacity.currentWeight} / {carryingCapacity.total}
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={normalizedPercentage}
            color={getProgressColor(percentage)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.hover',
            }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
          >
            {percentage}%
          </Typography>
        </Box>

        {/* Detalhes Expandidos */}
        {showDetails && (
          <>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {/* Capacidade Base */}
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Capacidade Base
                </Typography>
                <Typography variant="body2">{carryingCapacity.base}</Typography>
              </Grid>

              {/* Modificadores */}
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Modificadores
                </Typography>
                <Typography variant="body2">
                  {carryingCapacity.modifiers >= 0 ? '+' : ''}
                  {carryingCapacity.modifiers}
                </Typography>
              </Grid>

              {/* Capacidade de Empurrar */}
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title="Peso máximo que pode empurrar (2× capacidade)"
                  arrow
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PushPinIcon
                      fontSize="small"
                      color="action"
                      sx={{ transform: 'rotate(45deg)' }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Empurrar
                      </Typography>
                      <Typography variant="body2">
                        {carryingCapacity.pushLimit}
                      </Typography>
                    </Box>
                  </Stack>
                </Tooltip>
              </Grid>

              {/* Capacidade de Levantar */}
              <Grid size={{ xs: 6 }}>
                <Tooltip
                  title="Peso máximo que pode levantar (0.5× capacidade)"
                  arrow
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ArrowUpwardIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Levantar
                      </Typography>
                      <Typography variant="body2">
                        {carryingCapacity.liftLimit}
                      </Typography>
                    </Box>
                  </Stack>
                </Tooltip>
              </Grid>
            </Grid>

            {/* Aviso de penalidade */}
            {carryingCapacity.encumbranceState !== 'normal' && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor:
                    stateColor === 'warning' ? 'warning.light' : 'error.light',
                  color:
                    stateColor === 'warning' ? 'warning.dark' : 'error.dark',
                }}
              >
                <Typography variant="caption" fontWeight="medium">
                  {stateDescription}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CarryCapacityDisplay;
