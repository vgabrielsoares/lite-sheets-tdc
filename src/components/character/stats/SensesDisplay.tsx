/**
 * SensesDisplay Component
 *
 * Displays the character's senses information in a compact 2x2 grid:
 * - Row 1: Observar (vision sense) | Vision Type
 * - Row 2: Farejar (smell sense) | Ouvir (hearing sense)
 *
 * The keen sense bonuses from lineage are automatically added to the
 * corresponding perception uses:
 * - Visão (vision) → Observar (observe)
 * - Olfato (smell) → Farejar (sniff)
 * - Audição (hearing) → Ouvir (listen)
 */

'use client';

import React, { memo } from 'react';
import { Box, Typography, Paper, Tooltip, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import AirIcon from '@mui/icons-material/Air';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import type { Character, VisionType } from '@/types';
import {
  calculateAllSenses,
  getKeenSenseBonus,
  type SenseCalculationResult,
} from '@/utils/senseCalculations';
import { getEncumbranceState, calculateCarryCapacity } from '@/utils';
import { VISION_LABELS, VISION_DESCRIPTIONS } from '@/constants/lineage';

export interface SensesDisplayProps {
  /** Character data */
  character: Character;
  /** Callback to open senses sidebar for detailed editing */
  onOpenDetails?: () => void;
}

/**
 * Get icon for each sense type
 */
const getSenseIcon = (useName: string): React.ReactNode => {
  switch (useName) {
    case 'Observar':
      return <VisibilityIcon fontSize="small" color="info" />;
    case 'Ouvir':
      return <HearingIcon fontSize="small" color="secondary" />;
    case 'Farejar':
      return <AirIcon fontSize="small" color="success" />;
    default:
      return null;
  }
};

/**
 * Compact sense card component
 */
interface SenseCardProps {
  sense: SenseCalculationResult;
  keenSenseBonus: number;
}

const SenseCard: React.FC<SenseCardProps> = ({ sense, keenSenseBonus }) => {
  const tooltipLines = [
    `${sense.useName} (Percepção):`,
    `• Modificador base: ${sense.baseModifier >= 0 ? '+' : ''}${sense.baseModifier}`,
  ];

  if (keenSenseBonus > 0) {
    tooltipLines.push(`• Sentido Aguçado: +${keenSenseBonus}`);
  }

  tooltipLines.push('━━━━━━━━━━━━━━━━━');
  tooltipLines.push(
    `Total: ${sense.totalModifier >= 0 ? '+' : ''}${sense.totalModifier}`
  );
  tooltipLines.push(`Rolagem: ${sense.formula}`);

  if (sense.takeLowest) {
    tooltipLines.push('⚠️ Escolhe o menor resultado');
  }

  return (
    <Tooltip
      title={
        <Typography sx={{ whiteSpace: 'pre-line' }}>
          {tooltipLines.join('\n')}
        </Typography>
      }
      arrow
      enterDelay={150}
    >
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'background.paper',
          cursor: 'help',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getSenseIcon(sense.useName)}
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {sense.useName}
          </Typography>
          {keenSenseBonus > 0 && (
            <Chip
              label={`+${keenSenseBonus}`}
              size="small"
              color="success"
              sx={{
                height: 16,
                fontSize: '0.65rem',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: sense.takeLowest ? 'error.main' : 'text.primary',
          }}
        >
          {sense.formula}
        </Typography>
      </Paper>
    </Tooltip>
  );
};

/**
 * Vision type card component
 */
interface VisionCardProps {
  vision: VisionType;
}

const VisionCard: React.FC<VisionCardProps> = ({ vision }) => {
  const getVisionColor = () => {
    switch (vision) {
      case 'penumbra':
        return 'info.main';
      case 'escuro':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Tooltip title={VISION_DESCRIPTIONS[vision]} arrow enterDelay={150}>
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'background.paper',
          cursor: 'help',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RemoveRedEyeIcon fontSize="small" sx={{ color: getVisionColor() }} />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Visão
          </Typography>
        </Box>
        <Chip
          label={VISION_LABELS[vision]}
          size="small"
          color={
            vision === 'normal'
              ? 'default'
              : vision === 'penumbra'
                ? 'info'
                : 'primary'
          }
          variant={vision === 'normal' ? 'outlined' : 'filled'}
          sx={{ fontWeight: 'bold' }}
        />
      </Paper>
    </Tooltip>
  );
};

export const SensesDisplay: React.FC<SensesDisplayProps> = memo(
  ({ character, onOpenDetails }) => {
    // Calculate encumbrance state
    const carryCapacity = calculateCarryCapacity(character.attributes.forca);
    const currentLoad = character.inventory.items.reduce(
      (total, item) => total + (item.weight || 0) * (item.quantity || 1),
      0
    );
    const encumbranceState = getEncumbranceState(currentLoad, carryCapacity);
    const isOverloaded =
      encumbranceState === 'sobrecarregado' ||
      encumbranceState === 'imobilizado';

    // Calculate all senses
    const senses = calculateAllSenses(character, isOverloaded);

    // Get individual senses
    const observar = senses.find((s) => s.useName === 'Observar')!;
    const farejar = senses.find((s) => s.useName === 'Farejar')!;
    const ouvir = senses.find((s) => s.useName === 'Ouvir')!;

    // Get keen senses for bonus display
    const keenSenses = character.senses?.keenSenses || [];

    // Get vision type
    const vision =
      character.senses?.vision || character.lineage?.vision || 'normal';

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="info" />
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            Sentidos
          </Typography>
        </Box>

        {/* 2x2 Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
          }}
        >
          {/* Row 1: Observar | Visão */}
          <SenseCard
            sense={observar}
            keenSenseBonus={getKeenSenseBonus(keenSenses, 'visao')}
          />
          <VisionCard vision={vision} />

          {/* Row 2: Farejar | Ouvir */}
          <SenseCard
            sense={farejar}
            keenSenseBonus={getKeenSenseBonus(keenSenses, 'olfato')}
          />
          <SenseCard
            sense={ouvir}
            keenSenseBonus={getKeenSenseBonus(keenSenses, 'audicao')}
          />
        </Box>
      </Paper>
    );
  }
);

SensesDisplay.displayName = 'SensesDisplay';

export default SensesDisplay;
