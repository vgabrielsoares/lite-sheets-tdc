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
  LinearProgress,
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

  const gaPercentage = guard.max > 0 ? (guard.current / guard.max) * 100 : 0;
  const pvPercentage =
    vitality.max > 0 ? (vitality.current / vitality.max) * 100 : 0;

  const combatState = useMemo(
    () =>
      determineCombatState(
        guard.current,
        guard.max,
        vitality.current,
        vitality.max
      ),
    [guard.current, guard.max, vitality.current, vitality.max]
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
                {guard.current}/{guard.max}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(gaPercentage, 100)}
              color="primary"
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
              }}
            />
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
            <LinearProgress
              variant="determinate"
              value={Math.min(pvPercentage, 100)}
              color="error"
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

CompactGuardVitality.displayName = 'CompactGuardVitality';

export default CompactGuardVitality;
