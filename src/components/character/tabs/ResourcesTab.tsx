'use client';

import React, { useCallback } from 'react';
import { Box, Stack, Divider } from '@mui/material';
import {
  ProficienciesList,
  LanguagesList,
  RestCalculator,
} from '@/components/character/resources';
import type { Character, Proficiencies, LanguageName } from '@/types';

export interface ResourcesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Recursos
 *
 * Exibe e gerencia recursos do personagem:
 * - Proficiências (armas, armaduras, ferramentas, outros)
 * - Idiomas conhecidos
 * - Calculadora de descanso (recuperação de PV/PP)
 */
export function ResourcesTab({ character, onUpdate }: ResourcesTabProps) {
  const handleProficienciesUpdate = useCallback(
    (proficiencies: Proficiencies) => {
      onUpdate({ proficiencies });
    },
    [onUpdate]
  );

  const handleLanguagesUpdate = useCallback(
    (languages: LanguageName[]) => {
      onUpdate({ languages });
    },
    [onUpdate]
  );

  const handleApplyRecovery = useCallback(
    (pvRecovery: number, ppRecovery: number) => {
      const newCurrentPV = Math.min(
        character.combat.hp.current + pvRecovery,
        character.combat.hp.max
      );
      const newCurrentPP = Math.min(
        character.combat.pp.current + ppRecovery,
        character.combat.pp.max
      );

      onUpdate({
        combat: {
          ...character.combat,
          hp: {
            ...character.combat.hp,
            current: newCurrentPV,
          },
          pp: {
            ...character.combat.pp,
            current: newCurrentPP,
          },
        },
      });
    },
    [character, onUpdate]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={4}>
        {/* Proficiências */}
        <Box>
          <ProficienciesList
            proficiencies={character.proficiencies}
            onUpdate={handleProficienciesUpdate}
          />
        </Box>

        <Divider />

        {/* Idiomas */}
        <Box>
          <LanguagesList
            languages={character.languages}
            menteValue={character.attributes.mente}
            lineageLanguages={character.lineage?.languages || []}
            onUpdate={handleLanguagesUpdate}
          />
        </Box>

        <Divider />

        {/* Calculadora de Descanso */}
        <Box>
          <RestCalculator
            character={character}
            onApplyRecovery={handleApplyRecovery}
          />
        </Box>
      </Stack>
    </Box>
  );
}
