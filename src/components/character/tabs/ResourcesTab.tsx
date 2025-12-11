'use client';

import React, { useCallback, useState } from 'react';
import {
  Box,
  Stack,
  Divider,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import {
  ProficienciesList,
  LanguagesList,
  RestCalculator,
} from '@/components/character/resources';
import { ComplementaryTraits, CompleteTraits } from '../traits';
import type {
  Character,
  Proficiencies,
  LanguageName,
  ComplementaryTrait,
  CompleteTrait,
} from '@/types';
import { calculateTraitBalance } from '@/types/traits';

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
 * - Particularidades (características complementares e completas)
 * - Calculadora de descanso (recuperação de PV/PP)
 *
 * Memoizado para evitar re-renders desnecessários.
 */
export const ResourcesTab = React.memo(function ResourcesTab({
  character,
  onUpdate,
}: ResourcesTabProps) {
  const [particularitiessExpanded, setParticularitiesExpanded] =
    useState(false);
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

  const handleExtraLanguagesModifierUpdate = useCallback(
    (extraLanguagesModifier: number) => {
      onUpdate({ extraLanguagesModifier });
    },
    [onUpdate]
  );

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
    [character.particularities, onUpdate]
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
    [character.particularities, onUpdate]
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
        <Box id="section-proficiencies">
          <ProficienciesList
            proficiencies={character.proficiencies}
            onUpdate={handleProficienciesUpdate}
          />
        </Box>

        <Divider />

        {/* Idiomas */}
        <Box id="section-languages">
          <LanguagesList
            languages={character.languages}
            menteValue={character.attributes.mente}
            lineageLanguages={character.lineage?.languages || []}
            extraLanguagesModifier={character.extraLanguagesModifier}
            onUpdate={handleLanguagesUpdate}
            onUpdateModifier={handleExtraLanguagesModifierUpdate}
          />
        </Box>

        <Divider />

        {/* Particularidades */}
        <Card
          variant="outlined"
          id="section-particularities"
          sx={{
            borderColor: 'primary.main',
            borderWidth: 1,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: particularitiessExpanded ? 2 : 0,
              }}
              onClick={() =>
                setParticularitiesExpanded(!particularitiessExpanded)
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Particularidades
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: particularitiessExpanded
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
                aria-label={particularitiessExpanded ? 'Recolher' : 'Expandir'}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={particularitiessExpanded}>
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
            </Collapse>
          </CardContent>
        </Card>

        <Divider />

        {/* Calculadora de Descanso */}
        <Box id="section-rest">
          <RestCalculator
            character={character}
            onApplyRecovery={handleApplyRecovery}
          />
        </Box>
      </Stack>
    </Box>
  );
});
