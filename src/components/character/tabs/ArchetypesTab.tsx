'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface ArchetypesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Arquétipos e Classes
 *
 * Exibe informações de arquétipos e classes:
 * - Nível de cada arquétipo
 * - Características de arquétipo
 * - Nível de cada classe
 * - Habilidades de classe
 * - Melhorias de habilidade
 * - Defesa por etapa
 * - Ganhos por classe
 * - Progressão de personagem
 *
 * Será implementada na FASE 5.
 */
export function ArchetypesTab({ character, onUpdate }: ArchetypesTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Arquétipos e Classes
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 5 com componentes para gerenciar arquétipos, classes e progressão
          de personagem.
        </Typography>
      </Alert>
    </Box>
  );
}
