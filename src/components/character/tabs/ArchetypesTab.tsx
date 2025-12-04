'use client';

import React, { useCallback } from 'react';
import { Alert, Box, Divider, Typography } from '@mui/material';
import type { Character, Archetype } from '@/types';
import { ArchetypeDisplay } from '../archetypes';

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
 *
 * Futuramente incluirá:
 * - Características de arquétipo
 * - Classes compostas
 * - Habilidades de classe
 * - Melhorias de habilidade
 */
export function ArchetypesTab({ character, onUpdate }: ArchetypesTabProps) {
  const handleArchetypeChange = useCallback(
    (archetypes: Archetype[]) => {
      onUpdate({ archetypes });
    },
    [onUpdate]
  );

  return (
    <Box>
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

      <Divider sx={{ my: 4 }} />

      {/* Placeholder para Classes - implementação futura */}
      <Typography variant="h5" gutterBottom>
        Classes
      </Typography>
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> O sistema de classes compostas
          será implementado em uma fase futura. Classes são formadas pela
          combinação de dois ou mais arquétipos.
        </Typography>
      </Alert>
    </Box>
  );
}
