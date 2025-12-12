'use client';

import React, { useCallback } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import type { Character, Archetype, CharacterClass } from '@/types';
import { ArchetypeDisplay, ArchetypeFeatures } from '../archetypes';
import { ClassesDisplay } from '../classes';
import { ProgressionTable } from '../progression';

export interface ArchetypesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Arquétipos e Classes
 *
 * Exibe informações de arquétipos e classes:
 * - Nível total do personagem
 * - Nível de cada arquétipo (6 arquétipos)
 * - Distribuição de níveis entre arquétipos
 * - Cálculo de PV e PP baseado nos arquétipos
 * - Descrição de cada arquétipo
 * - Características e Poderes de arquétipo
 * - Sistema de classes (até 3 classes)
 * - Habilidades de classe
 * - Melhorias de habilidade
 *
 * Memoizado para evitar re-renders desnecessários.
 */
export const ArchetypesTab = React.memo(function ArchetypesTab({
  character,
  onUpdate,
}: ArchetypesTabProps) {
  const handleArchetypeChange = useCallback(
    (archetypes: Archetype[]) => {
      onUpdate({ archetypes });
    },
    [onUpdate]
  );

  const handleFeaturesChange = useCallback(
    (archetypes: Archetype[]) => {
      onUpdate({ archetypes });
    },
    [onUpdate]
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
          Distribua seus níveis entre os 6 arquétipos. Cada arquétipo contribui
          para seu PV e PP máximos e desbloqueia habilidades específicas.
        </Typography>

        <ArchetypeDisplay
          archetypes={character.archetypes ?? []}
          characterLevel={character.level}
          attributes={character.attributes}
          onArchetypeChange={handleArchetypeChange}
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
