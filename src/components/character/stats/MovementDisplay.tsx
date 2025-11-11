/**
 * MovementDisplay Component
 *
 * Displays the character's movement speeds by type
 * Shows all movement types: Andando (Walking), Voando (Flying), Escalando (Climbing),
 * Escavando (Burrowing), Nadando (Swimming)
 *
 * According to RPG rules:
 * - Default movement comes from Lineage
 * - Can be modified by abilities, spells, equipment
 * - Measured in meters (m) or squares (quadrados)
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import FlightIcon from '@mui/icons-material/Flight';
import TerrainIcon from '@mui/icons-material/Terrain';
import WavesIcon from '@mui/icons-material/Waves';
import type { MovementType } from '@/types';
import { EditableNumber } from '@/components/shared';

interface MovementDisplayProps {
  /** Movement speeds by type */
  movement: Record<MovementType, number>;
  /** Callback when movement speed changes */
  onMovementChange?: (type: MovementType, value: number) => void;
  /** Whether the component is in edit mode */
  editable?: boolean;
}

// Icons for each movement type
const MOVEMENT_ICONS: Record<MovementType, React.ReactNode> = {
  andando: <DirectionsWalkIcon />,
  voando: <FlightIcon />,
  escalando: <TerrainIcon />,
  escavando: <TerrainIcon sx={{ transform: 'rotate(180deg)' }} />,
  nadando: <WavesIcon />,
};

// Labels for each movement type
const MOVEMENT_LABELS: Record<MovementType, string> = {
  andando: 'Andando',
  voando: 'Voando',
  escalando: 'Escalando',
  escavando: 'Escavando',
  nadando: 'Nadando',
};

// Color for each movement type
const MOVEMENT_COLORS: Record<
  MovementType,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  andando: 'primary',
  voando: 'info',
  escalando: 'success',
  escavando: 'warning',
  nadando: 'secondary',
};

export const MovementDisplay: React.FC<MovementDisplayProps> = ({
  movement,
  onMovementChange,
  editable = true,
}) => {
  // Get primary movement (andando/walking) for main display
  const primaryMovement = movement.andando || 0;

  // Get available secondary movements (non-zero values)
  const secondaryMovements = (
    Object.entries(movement) as [MovementType, number][]
  ).filter(([type, speed]) => type !== 'andando' && speed > 0);

  const hasSecondaryMovement = secondaryMovements.length > 0;

  const tooltipText = `
Deslocamento do Personagem:

${Object.entries(movement)
  .filter(([_, speed]) => speed > 0)
  .map(
    ([type, speed]) => `• ${MOVEMENT_LABELS[type as MovementType]}: ${speed}m`
  )
  .join('\n')}

${
  Object.values(movement).every((speed) => speed === 0)
    ? 'Nenhum deslocamento configurado'
    : ''
}
  `.trim();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        minWidth: 200,
      }}
    >
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
      >
        <DirectionsWalkIcon color="primary" />
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          Deslocamento
        </Typography>
        <Tooltip title={tooltipText} arrow>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ width: '100%' }} />

      {/* Primary Movement (Walking) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
          gap: 1,
        }}
      >
        {editable ? (
          <>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              <EditableNumber
                value={primaryMovement}
                onChange={(value) => onMovementChange?.('andando', value)}
                min={0}
                max={100}
                variant="h4"
                autoSave
              />
            </Typography>
            <Typography variant="h6" color="text.secondary">
              m
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              {primaryMovement}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              m
            </Typography>
          </>
        )}
      </Box>

      {/* Secondary Movements */}
      {hasSecondaryMovement && (
        <>
          <Divider sx={{ width: '100%' }} />
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Outros Deslocamentos:
            </Typography>
            {secondaryMovements.map(([type, speed]) => (
              <Box
                key={type}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {MOVEMENT_ICONS[type]}
                  <Typography variant="body2">
                    {MOVEMENT_LABELS[type]}:
                  </Typography>
                </Box>
                {editable ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EditableNumber
                      value={speed}
                      onChange={(value) => onMovementChange?.(type, value)}
                      min={0}
                      max={100}
                      variant="body2"
                      autoSave
                    />
                    <Typography variant="body2" color="text.secondary">
                      m
                    </Typography>
                  </Box>
                ) : (
                  <Chip
                    label={`${speed}m`}
                    size="small"
                    color={MOVEMENT_COLORS[type]}
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* All Movement Types (Expandable) */}
      {editable && (
        <>
          <Divider sx={{ width: '100%' }} />
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Configurar Todos os Deslocamentos:
            </Typography>
            {(Object.entries(MOVEMENT_LABELS) as [MovementType, string][]).map(
              ([type, label]) => (
                <Box
                  key={type}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {MOVEMENT_ICONS[type]}
                    <Typography variant="body2">{label}:</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EditableNumber
                      value={movement[type]}
                      onChange={(value) => onMovementChange?.(type, value)}
                      min={0}
                      max={100}
                      variant="body2"
                      autoSave
                    />
                    <Typography variant="body2" color="text.secondary">
                      m
                    </Typography>
                  </Box>
                </Box>
              )
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MovementDisplay;
