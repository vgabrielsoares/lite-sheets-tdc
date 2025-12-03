/**
 * MovementDisplay Component
 *
 * Displays the character's movement speeds by type
 * Shows only movement types with total (base + bonus) > 0
 *
 * According to RPG rules:
 * - Default movement comes from Lineage
 * - Can be modified by abilities, spells, equipment
 * - Measured in meters (m) or squares (quadrados)
 *
 * This component shows only non-zero movement speeds.
 * Click to open the Movement Sidebar for editing all movement types.
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
import type { MovementType, MovementSpeed } from '@/types';

interface MovementDisplayProps {
  /** Movement speeds by type (supports old format with number or new with MovementSpeed) */
  movement: Record<MovementType, MovementSpeed | number>;
  /** Callback to open a sidebar for detailed editing */
  onOpenDetails?: () => void;
}

// Helper to get total speed from MovementSpeed or number
function getTotalSpeed(speed: MovementSpeed | number | undefined): number {
  if (typeof speed === 'number') {
    return speed;
  }
  if (speed && typeof speed === 'object') {
    return Math.max(0, speed.base + speed.bonus);
  }
  return 0;
}

// Helper to get speed details for tooltip
function getSpeedDetails(speed: MovementSpeed | number | undefined): {
  base: number;
  bonus: number;
  total: number;
} {
  if (typeof speed === 'number') {
    return { base: speed, bonus: 0, total: speed };
  }
  if (speed && typeof speed === 'object') {
    return {
      base: speed.base,
      bonus: speed.bonus,
      total: Math.max(0, speed.base + speed.bonus),
    };
  }
  return { base: 0, bonus: 0, total: 0 };
}

// Icons for each movement type
const MOVEMENT_ICONS: Record<MovementType, React.ReactNode> = {
  andando: <DirectionsWalkIcon fontSize="small" />,
  voando: <FlightIcon fontSize="small" />,
  escalando: <TerrainIcon fontSize="small" />,
  escavando: (
    <TerrainIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
  ),
  nadando: <WavesIcon fontSize="small" />,
};

// Labels for each movement type
const MOVEMENT_LABELS: Record<MovementType, string> = {
  andando: 'Andando',
  voando: 'Voando',
  escalando: 'Escalando',
  escavando: 'Escavando',
  nadando: 'Nadando',
};

// Descriptions for tooltips
const MOVEMENT_DESCRIPTIONS: Record<MovementType, string> = {
  andando: 'Deslocamento ao caminhar ou correr no solo',
  voando: 'Deslocamento ao voar pelo ar',
  escalando: 'Deslocamento ao escalar superfícies verticais',
  escavando: 'Deslocamento ao cavar através do solo',
  nadando: 'Deslocamento ao nadar na água',
};

// Color for each movement type
const MOVEMENT_COLORS: Record<
  MovementType,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  andando: 'success',
  voando: 'info',
  escalando: 'warning',
  escavando: 'secondary',
  nadando: 'primary',
};

export const MovementDisplay: React.FC<MovementDisplayProps> = ({
  movement,
  onOpenDetails,
}) => {
  // Get all non-zero movements with their totals
  const activeMovements = (
    Object.entries(movement) as [MovementType, MovementSpeed | number][]
  )
    .map(([type, speed]) => ({
      type,
      ...getSpeedDetails(speed),
    }))
    .filter(({ total }) => total > 0);

  // Check if there are any movements
  const hasMovement = activeMovements.length > 0;

  // Build tooltip text showing all active movements
  const tooltipLines = hasMovement
    ? [
        'Deslocamento do Personagem:',
        ...activeMovements.map(({ type, base, bonus, total }) => {
          if (bonus !== 0) {
            const bonusSign = bonus > 0 ? '+' : '';
            return `• ${MOVEMENT_LABELS[type]}: ${base}${bonusSign}${bonus} = ${total}m`;
          }
          return `• ${MOVEMENT_LABELS[type]}: ${total}m`;
        }),
      ]
    : ['Nenhum deslocamento configurado'];

  const tooltipText = tooltipLines.join('\n');

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
        border: onOpenDetails ? 1 : 0,
        borderColor: onOpenDetails ? 'primary.main' : 'transparent',
        cursor: onOpenDetails ? 'pointer' : 'default',
        transition: 'all 0.15s ease-in-out',
        '&:hover': onOpenDetails
          ? {
              borderColor: 'primary.dark',
              bgcolor: 'action.hover',
            }
          : {},
      }}
      onClick={onOpenDetails}
    >
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
      >
        <DirectionsWalkIcon color="success" />
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          Deslocamento
        </Typography>
        <Tooltip
          title={
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {tooltipText}
            </Typography>
          }
          arrow
          enterDelay={150}
        >
          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ width: '100%' }} />

      {/* Movement Chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          py: 2,
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {hasMovement ? (
          activeMovements.map(({ type, base, bonus, total }) => (
            <Tooltip
              key={type}
              title={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {MOVEMENT_LABELS[type]}
                  </Typography>
                  <Typography variant="caption">
                    {MOVEMENT_DESCRIPTIONS[type]}
                  </Typography>
                  {bonus !== 0 && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Base: {base}m {bonus > 0 ? '+' : ''}
                      {bonus}m bônus
                    </Typography>
                  )}
                </Box>
              }
              arrow
              enterDelay={150}
            >
              <Chip
                icon={MOVEMENT_ICONS[type] as React.ReactElement}
                label={`${total}m`}
                color={MOVEMENT_COLORS[type]}
                variant="outlined"
                size="medium"
                sx={{
                  fontWeight: 'bold',
                  fontSize: type === 'andando' ? '1.1rem' : '0.9rem',
                  py: type === 'andando' ? 2 : 1,
                }}
              />
            </Tooltip>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum deslocamento
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MovementDisplay;
