/**
 * DefenseDisplay Component
 *
 * Displays the character's Defense value with automatic calculation
 * Formula: 15 + Agilidade + size bonus + armor bonus (limited by Agility) + other bonuses
 *
 * According to RPG rules:
 * - Base defense: 15
 * - Agility bonus: Full Agilidade attribute value
 * - Size bonus: From creature size (e.g., +3 for tiny, -1 for large)
 * - Armor bonus: Limited by armor's max Agility bonus
 * - Other bonuses: From spells, abilities, etc.
 *
 * This component shows only the total defense value with a tooltip breakdown.
 * Click to open the Defense Sidebar for editing all defense components.
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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ShieldIcon from '@mui/icons-material/Shield';
import type { Modifier } from '@/types';

interface DefenseDisplayProps {
  /** Current Agilidade (Agility) attribute value */
  agilidade: number;
  /** Size modifier bonus from creature size (can be negative) */
  sizeBonus?: number;
  /** Armor bonus (already limited by armor's max Agility if applicable) */
  armorBonus?: number;
  /** Shield bonus */
  shieldBonus?: number;
  /** Maximum Agility bonus allowed by armor (0 = no armor, undefined = no limit) */
  maxAgilityBonus?: number;
  /** Other bonuses from spells, abilities, etc. */
  otherBonuses?: Modifier[];
  /** Callback to open a sidebar for detailed editing */
  onOpenDetails?: () => void;
}

export const DefenseDisplay: React.FC<DefenseDisplayProps> = React.memo(function DefenseDisplay({
  agilidade,
  sizeBonus = 0,
  armorBonus = 0,
  shieldBonus = 0,
  maxAgilityBonus,
  otherBonuses = [],
  onOpenDetails,
}) {
  // Calculate the effective agility bonus (limited by armor if applicable)
  const effectiveAgilityBonus =
    maxAgilityBonus !== undefined
      ? Math.min(agilidade, maxAgilityBonus)
      : agilidade;

  // Calculate total from other bonuses
  const otherBonusesTotal = otherBonuses.reduce(
    (sum, modifier) => sum + modifier.value,
    0
  );

  // Calculate total defense (including size bonus)
  const totalDefense =
    15 +
    effectiveAgilityBonus +
    sizeBonus +
    armorBonus +
    shieldBonus +
    otherBonusesTotal;

  // Build tooltip text
  const tooltipLines = [
    'Cálculo de Defesa:',
    '• Base: 15',
    `• Agilidade: ${agilidade > 0 ? '+' : ''}${agilidade}${maxAgilityBonus !== undefined && agilidade > maxAgilityBonus ? ` (limitado a ${maxAgilityBonus})` : ''}`,
  ];

  if (sizeBonus !== 0) {
    tooltipLines.push(`• Tamanho: ${sizeBonus > 0 ? '+' : ''}${sizeBonus}`);
  }

  if (armorBonus !== 0) {
    tooltipLines.push(`• Armadura: ${armorBonus > 0 ? '+' : ''}${armorBonus}`);
  }

  if (shieldBonus !== 0) {
    tooltipLines.push(`• Escudo: ${shieldBonus > 0 ? '+' : ''}${shieldBonus}`);
  }

  if (otherBonusesTotal !== 0) {
    tooltipLines.push(
      `• Outros: ${otherBonusesTotal > 0 ? '+' : ''}${otherBonusesTotal}`
    );
  }

  tooltipLines.push('━━━━━━━━━━━━━━━━━');
  tooltipLines.push(`Total: ${totalDefense}`);

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
        <ShieldIcon color="primary" />
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          Defesa
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

      {/* Total Defense Value */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Typography
          variant="h3"
          component="div"
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          {totalDefense}
        </Typography>
      </Box>
    </Paper>
  );
});

// Display name para debugging
DefenseDisplay.displayName = 'DefenseDisplay';

export default DefenseDisplay;
