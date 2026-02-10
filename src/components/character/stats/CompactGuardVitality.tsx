/**
 * CompactGuardVitality - Exibição compacta de GA (Guarda) + PV (Vitalidade)
 *
 * Componente v0.0.2 para a aba principal, mostrando GA e PV lado a lado em formato compacto.
 * Substitui o antigo CompactHealthPoints (sistema de HP depreciado).
 *
 * - GA (Guarda): Escudo, cor primária (dourado)
 * - PV (Vitalidade): Coração, cor vermelha
 * - Clicável para abrir detalhes na sidebar
 */
'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import type { GuardPoints, VitalityPoints } from '@/types/combat';
import { determineCombatState } from '@/utils/calculations';

export interface CompactGuardVitalityProps {
  /** Pontos de Guarda (GA) */
  guard: GuardPoints;
  /** Pontos de Vitalidade (PV) */
  vitality: VitalityPoints;
  /** Callback para abrir detalhes */
  onOpenDetails?: () => void;
}

/**
 * Componente compacto para exibir GA e PV na aba principal
 */
export const CompactGuardVitality = React.memo(function CompactGuardVitality({
  guard,
  vitality,
  onOpenDetails,
}: CompactGuardVitalityProps) {
  const theme = useTheme();

  // Calcula GA máxima incluindo modificadores
  const gaMaxModifiersTotal = (guard.maxModifiers ?? []).reduce(
    (sum, mod) => sum + mod.value,
    0
  );
  const modifiedGAMax = guard.max + gaMaxModifiersTotal;
  const gaTempValue = guard.temporary ?? 0;

  // Percentuais para barras de progresso
  const gaPercentage =
    modifiedGAMax > 0 ? (guard.current / modifiedGAMax) * 100 : 0;
  const gaTempPercentage =
    gaTempValue > 0 && modifiedGAMax > 0
      ? Math.min(100 - gaPercentage, (gaTempValue / modifiedGAMax) * 100)
      : 0;
  const pvPercentage =
    vitality.max > 0 ? (vitality.current / vitality.max) * 100 : 0;

  const combatState = useMemo(
    () =>
      determineCombatState(
        guard.current,
        modifiedGAMax,
        vitality.current,
        vitality.max
      ),
    [guard.current, modifiedGAMax, vitality.current, vitality.max]
  );

  const stateLabel = useMemo(() => {
    switch (combatState) {
      case 'ferimento-critico':
        return 'Ferimento Crítico';
      case 'ferimento-direto':
        return 'Ferimento Direto';
      default:
        return null;
    }
  }, [combatState]);

  return (
    <Card
      variant="outlined"
      sx={{
        cursor: onOpenDetails ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        borderColor: onOpenDetails ? 'primary.main' : 'divider',
        '&:hover': onOpenDetails
          ? {
              boxShadow: 2,
              transform: 'translateY(-1px)',
            }
          : {},
      }}
      onClick={onOpenDetails}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onKeyDown={
        onOpenDetails
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDetails();
              }
            }
          : undefined
      }
      aria-label="Guarda e Vitalidade"
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Título com ícone */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Saúde
            </Typography>
            {stateLabel && (
              <Typography
                variant="caption"
                color={
                  combatState === 'ferimento-critico' ? 'error' : 'warning.main'
                }
                fontWeight="bold"
              >
                {stateLabel}
              </Typography>
            )}
            {onOpenDetails && (
              <Tooltip title="Ver detalhes de GA/PV">
                <InfoIcon fontSize="small" color="action" />
              </Tooltip>
            )}
          </Stack>

          {/* GA (Guarda) */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ShieldIcon
                  fontSize="small"
                  sx={{ color: theme.palette.primary.main }}
                />
                <Typography variant="body2" fontWeight="medium">
                  GA
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="bold">
                {guard.current}/{modifiedGAMax}
                {gaTempValue > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="info.main"
                    sx={{ ml: 0.5, fontWeight: 'bold' }}
                  >
                    (+{gaTempValue})
                  </Typography>
                )}
              </Typography>
            </Stack>
            {/* Barra segmentada: GA principal + GA temporária */}
            <Box
              sx={{
                position: 'relative',
                height: 6,
                borderRadius: 3,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              {/* GA principal */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(gaPercentage, 100)}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
              {/* GA temporária */}
              {gaTempPercentage > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${Math.min(gaPercentage, 100)}%`,
                    top: 0,
                    height: '100%',
                    width: `${gaTempPercentage}%`,
                    bgcolor: 'info.main',
                    borderRadius: 3,
                    transition: 'width 0.3s ease-in-out',
                    opacity: 0.7,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* PV (Vitalidade) */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FavoriteIcon
                  fontSize="small"
                  sx={{ color: theme.palette.error.main }}
                />
                <Typography variant="body2" fontWeight="medium">
                  PV
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="bold">
                {vitality.current}/{vitality.max}
              </Typography>
            </Stack>
            <Box
              sx={{
                position: 'relative',
                height: 6,
                borderRadius: 3,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(pvPercentage, 100)}%`,
                  bgcolor: 'error.main',
                  borderRadius: 3,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

CompactGuardVitality.displayName = 'CompactGuardVitality';

export default CompactGuardVitality;
