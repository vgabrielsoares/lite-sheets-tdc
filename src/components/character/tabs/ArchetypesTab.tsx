'use client';

import React, { useCallback } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import type {
  Character,
  Archetype,
  ArchetypeFeature,
  CharacterClass,
} from '@/types';
import type {
  SpecialAbility,
  SpecialAbilitySource,
} from '@/types/specialAbilities';
import { ArchetypeDisplay, ArchetypeFeatures } from '../archetypes';
import { ClassesDisplay } from '../classes';
import { ProgressionTable } from '../progression';
import { uuidv4 } from '@/utils/uuid';

export interface ArchetypesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Arquétipos e Classes
 *
 * Exibe informações de arquétipos e classes:
 * - Nível total do personagem
 * - Nível de cada arquétipo (somente leitura — level up via aba Principal)
 * - Cálculo de GA e PP baseado nos arquétipos
 * - Características e Poderes de arquétipo (sincronizados com aba Especiais)
 * - Sistema de classes (até 3 classes)
 * - Tabela de progressão (níveis 1-15)
 *
 * Memoizado para evitar re-renders desnecessários.
 */
export const ArchetypesTab = React.memo(function ArchetypesTab({
  character,
  onUpdate,
}: ArchetypesTabProps) {
  /**
   * Sincroniza features de arquétipo com specialAbilities.
   * Quando features mudam, recria as entradas de source='arquetipo'
   * em specialAbilities para manter as abas sincronizadas.
   */
  const handleFeaturesChange = useCallback(
    (archetypes: Archetype[]) => {
      // Coletar todas as features de todos os arquétipos
      const allFeatures: { feature: ArchetypeFeature; archName: string }[] = [];
      for (const arch of archetypes) {
        for (const feature of arch.features ?? []) {
          allFeatures.push({ feature, archName: arch.name });
        }
      }

      // Manter specialAbilities que NÃO são de fonte 'arquetipo'
      const existingNonArchetypeAbilities = (
        character.specialAbilities ?? []
      ).filter(
        (sa) =>
          sa.source !== 'arquetipo' &&
          sa.source !== 'poder' &&
          sa.source !== 'competencia'
      );

      // Manter specialAbilities de arquétipo/poder/competência que foram
      // criadas pelo LevelUpModal (têm levelGained definido)
      const levelUpAbilities = (character.specialAbilities ?? []).filter(
        (sa) =>
          (sa.source === 'arquetipo' ||
            sa.source === 'poder' ||
            sa.source === 'competencia') &&
          sa.levelGained !== undefined
      );

      // Converter features de arquétipo em specialAbilities
      // (apenas features que não correspondem a entradas já criadas pelo LevelUpModal)
      const featureAbilities: SpecialAbility[] = allFeatures
        .filter((f) => {
          // Não duplicar se já existe uma entrada do LevelUpModal com mesmo nome
          return !levelUpAbilities.some(
            (la) => la.name === f.feature.name && la.sourceName === f.archName
          );
        })
        .map((f) => ({
          id: uuidv4(),
          name: f.feature.name,
          description: f.feature.description,
          source: 'arquetipo' as SpecialAbilitySource,
          sourceName: f.archName,
        }));

      const updatedSpecialAbilities = [
        ...existingNonArchetypeAbilities,
        ...levelUpAbilities,
        ...featureAbilities,
      ];

      onUpdate({
        archetypes,
        specialAbilities: updatedSpecialAbilities,
      });
    },
    [onUpdate, character.specialAbilities]
  );

  const handleClassesChange = useCallback(
    (classes: CharacterClass[]) => {
      onUpdate({ classes });
    },
    [onUpdate]
  );

  return (
    <Box>
      {/* Seção 1: Arquétipos */}
      <Box id="section-archetypes">
        <Typography variant="h5" gutterBottom>
          Arquétipos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Seus níveis de arquétipo são definidos ao subir de nível pela aba
          Principal. Cada arquétipo contribui para seu GA e PP máximos e
          desbloqueia habilidades específicas.
        </Typography>

        <ArchetypeDisplay
          archetypes={character.archetypes ?? []}
          characterLevel={character.level}
          attributes={character.attributes}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Seção 2: Características e Poderes de Arquétipo */}
      <Box id="section-archetype-features">
        <ArchetypeFeatures
          archetypes={character.archetypes ?? []}
          characterLevel={character.level}
          onFeaturesChange={handleFeaturesChange}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Seção 3: Sistema de Classes */}
      <Box id="section-classes">
        <ClassesDisplay
          classes={character.classes ?? []}
          characterLevel={character.level}
          onClassesChange={handleClassesChange}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Seção 4: Tabela de Progressão */}
      <Box id="section-progression">
        <ProgressionTable currentLevel={character.level} />
      </Box>
    </Box>
  );
});
