/**
 * CompactPowerPoints - Exibição compacta de PP (Pontos de Poder) + PF (Pontos de Feitiço)
 *
 * Segue o mesmo padrão visual do CompactGuardVitality:
 * - Sem botões de gastar/recuperar (interação via sidebar)
 * - Valores atuais/máximos à direita da barra
 * - Clicável para abrir sidebar de detalhes
 * - Título "Potencial Energético" com tooltip
 * - PF máximo = PP máximo automaticamente
 */
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import type { PowerPoints } from '@/types/combat';
import type { SpellPoints } from '@/types/spells';

export interface CompactPowerPointsProps {
  /** Pontos de Poder */
  pp: PowerPoints;
  /** Callback para abrir detalhes na sidebar */
  onOpenDetails?: () => void;
  /** PF para exibição compacta (apenas barra, sem botões). Mostrado apenas para conjuradores. */
  spellPoints?: SpellPoints;
}

/**
 * Componente compacto para exibir PP e PF na aba principal.
 * Segue o padrão visual do CompactGuardVitality (Saúde).
 */
export const CompactPowerPoints = React.memo(function CompactPowerPoints({
  pp,
  onOpenDetails,
  spellPoints,
}: CompactPowerPointsProps) {
  const theme = useTheme();

  const effectiveMax = pp.max + (pp.temporary ?? 0);
  const ppPercent =
    effectiveMax > 0 ? Math.min(100, (pp.current / effectiveMax) * 100) : 0;
  const ppTempValue = pp.temporary ?? 0;
  const ppTempPercent =
    ppTempValue > 0 && effectiveMax > 0
      ? Math.min(100 - ppPercent, (ppTempValue / effectiveMax) * 100)
      : 0;

  // PF max é sempre sincronizado com PP max (incluindo modificadores)
  const pfMax = spellPoints ? pp.max : 0;
  const pfCurrent = spellPoints?.current ?? 0;
  const pfPercent = pfMax > 0 ? Math.min(100, (pfCurrent / pfMax) * 100) : 0;

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
      aria-label="Potencial Energético"
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Título */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Potencial Energético
            </Typography>
            {ppTempValue > 0 && (
              <Typography variant="caption" color="info.main" fontWeight="bold">
                +{ppTempValue} temp
              </Typography>
            )}
            {onOpenDetails && (
              <Tooltip title="Ver detalhes de PP e PF">
                <InfoIcon fontSize="small" color="action" />
              </Tooltip>
            )}
          </Stack>

          {/* PP (Pontos de Poder) */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: 'info.contrastText',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    ⚡
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  PP
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="bold">
                {pp.current}/{pp.max}
                {ppTempValue > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="info.main"
                    sx={{ ml: 0.5, fontWeight: 'bold' }}
                  >
                    (+{ppTempValue})
                  </Typography>
                )}
              </Typography>
            </Stack>
            {/* Barra segmentada: PP principal + PP temporário */}
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
              {/* PP principal */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(ppPercent, 100)}%`,
                  bgcolor: 'info.main',
                  borderRadius: 3,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
              {/* PP temporário */}
              {ppTempPercent > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${Math.min(ppPercent, 100)}%`,
                    top: 0,
                    height: '100%',
                    width: `${ppTempPercent}%`,
                    bgcolor: 'info.light',
                    borderRadius: 3,
                    transition: 'width 0.3s ease-in-out',
                    opacity: 0.7,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* PF (Pontos de Feitiço) — apenas para conjuradores */}
          {spellPoints && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AutoFixHighIcon
                    fontSize="small"
                    sx={{ color: theme.palette.secondary.main, fontSize: 16 }}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    PF
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold">
                  {pfCurrent}/{pfMax}
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
                    width: `${Math.min(pfPercent, 100)}%`,
                    bgcolor: 'secondary.main',
                    borderRadius: 3,
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

CompactPowerPoints.displayName = 'CompactPowerPoints';

export default CompactPowerPoints;
