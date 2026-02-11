/**
 * LevelUpIndicator — Visual indicator for XP progress and level up readiness
 *
 * Shows:
 * - XP progress bar (current / needed)
 * - Pulsing glow when level up is available
 * - Tooltip with detailed XP info
 * - "Subir de Nível!" button when ready
 */

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/system';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { canLevelUp, getXPForNextLevel } from '@/constants/progression';

// ─── Animations ─────────────────────────────────────────────

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.8);
    transform: scale(1.02);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// ─── Props ──────────────────────────────────────────────────

export interface LevelUpIndicatorProps {
  /** XP atual do personagem */
  currentXP: number;
  /** Nível atual do personagem */
  level: number;
  /** Callback ao clicar em "Subir de Nível" */
  onLevelUp?: () => void;
  /** Desabilitar o botão de level up */
  disabled?: boolean;
  /** Tamanho compacto (sem botão, apenas barra) */
  compact?: boolean;
}

// ─── Component ──────────────────────────────────────────────

export const LevelUpIndicator = React.memo(function LevelUpIndicator({
  currentXP,
  level,
  onLevelUp,
  disabled = false,
  compact = false,
}: LevelUpIndicatorProps) {
  const xpNeeded = useMemo(() => getXPForNextLevel(level), [level]);
  const isReady = useMemo(
    () => canLevelUp(currentXP, level),
    [currentXP, level]
  );
  const progress = useMemo(
    () => (xpNeeded > 0 ? Math.min((currentXP / xpNeeded) * 100, 100) : 0),
    [currentXP, xpNeeded]
  );
  const xpRemaining = useMemo(
    () => Math.max(0, xpNeeded - currentXP),
    [currentXP, xpNeeded]
  );

  const tooltipText = isReady
    ? `XP suficiente para subir de nível! (${currentXP} / ${xpNeeded})`
    : `Faltam ${xpRemaining} XP para o nível ${level + 1} (${currentXP} / ${xpNeeded})`;

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Box sx={{ width: '100%' }}>
        {/* XP Progress Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <StarIcon
            fontSize="small"
            color={isReady ? 'warning' : 'disabled'}
            sx={
              isReady
                ? {
                    animation: `${pulseGlow} 2s ease-in-out infinite`,
                    borderRadius: '50%',
                  }
                : {}
            }
          />
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={isReady ? 'warning' : 'primary'}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  ...(isReady
                    ? {
                        background:
                          'linear-gradient(90deg, #ff9800 0%, #ffc107 50%, #ff9800 100%)',
                        backgroundSize: '200px 100%',
                        animation: `${shimmer} 1.5s ease-in-out infinite`,
                      }
                    : {}),
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color={isReady ? 'warning.main' : 'text.secondary'}
            sx={{ minWidth: 'fit-content', fontWeight: isReady ? 700 : 400 }}
          >
            {currentXP} / {xpNeeded}
          </Typography>
        </Box>

        {/* Level Up Button */}
        {!compact && isReady && onLevelUp && (
          <Button
            variant="contained"
            color="warning"
            size="small"
            fullWidth
            startIcon={<TrendingUpIcon />}
            onClick={onLevelUp}
            disabled={disabled}
            aria-label="Subir de nível"
            sx={{
              mt: 0.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              animation: `${pulseGlow} 2s ease-in-out infinite`,
              '&:hover': {
                animation: 'none',
                transform: 'scale(1.02)',
              },
            }}
          >
            Subir de Nível!
          </Button>
        )}

        {/* XP remaining text when not ready */}
        {!compact && !isReady && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}
          >
            Faltam {xpRemaining} XP
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
});

LevelUpIndicator.displayName = 'LevelUpIndicator';

export default LevelUpIndicator;
