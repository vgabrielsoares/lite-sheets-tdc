/**
 * TraitsTab - Aba de Particularidades
 *
 * Gerencia todas as particularidades do personagem:
 * - Características complementares (positivas e negativas)
 * - Características completas
 */

'use client';

import React, { useCallback } from 'react';
import { Box, Stack, Divider } from '@mui/material';
import { ComplementaryTraits } from './ComplementaryTraits';
import { CompleteTraits } from './CompleteTraits';
import type { Character, ComplementaryTrait, CompleteTrait } from '@/types';
import { calculateTraitBalance } from '@/types/traits';

export interface TraitsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Particularidades
 *
 * Exibe e gerencia as particularidades do personagem:
 * - Características Complementares (divididas em negativas e positivas)
 * - Características Completas (já balanceadas)
 *
 * Características complementares devem estar equilibradas (balanço = 0).
 */
export function TraitsTab({ character, onUpdate }: TraitsTabProps) {
  const handleUpdateNegativeTraits = useCallback(
    (negativeTraits: ComplementaryTrait[]) => {
      const balance = calculateTraitBalance(
        negativeTraits,
        character.particularities.positiveTraits
      );

      onUpdate({
        particularities: {
          ...character.particularities,
          negativeTraits,
          balance,
        },
      });
    },
    [character.particularities.positiveTraits, onUpdate]
  );

  const handleUpdatePositiveTraits = useCallback(
    (positiveTraits: ComplementaryTrait[]) => {
      const balance = calculateTraitBalance(
        character.particularities.negativeTraits,
        positiveTraits
      );

      onUpdate({
        particularities: {
          ...character.particularities,
          positiveTraits,
          balance,
        },
      });
    },
    [character.particularities.negativeTraits, onUpdate]
  );

  const handleUpdateCompleteTraits = useCallback(
    (completeTraits: CompleteTrait[]) => {
      onUpdate({
        particularities: {
          ...character.particularities,
          completeTraits,
        },
      });
    },
    [character.particularities, onUpdate]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={4}>
        {/* Características Complementares */}
        <Box>
          <ComplementaryTraits
            negativeTraits={character.particularities.negativeTraits}
            positiveTraits={character.particularities.positiveTraits}
            onUpdateNegative={handleUpdateNegativeTraits}
            onUpdatePositive={handleUpdatePositiveTraits}
          />
        </Box>

        <Divider />

        {/* Características Completas */}
        <Box>
          <CompleteTraits
            traits={character.particularities.completeTraits}
            onUpdate={handleUpdateCompleteTraits}
          />
        </Box>
      </Stack>
    </Box>
  );
}
