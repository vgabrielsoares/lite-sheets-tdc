'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface ResourcesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Recursos
 *
 * Exibe recursos do personagem:
 * - Habilidades especiais
 * - Proficiências (armas, armaduras, ferramentas)
 * - Idiomas conhecidos
 * - Recuperação em descanso
 * - Particularidades (características complementares e completas)
 *
 * Será implementada na FASE 5.
 */
export function ResourcesTab({ character, onUpdate }: ResourcesTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Recursos
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 5 com componentes para gerenciar habilidades especiais,
          proficiências e particularidades.
        </Typography>
      </Alert>
    </Box>
  );
}
