'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Feitiços
 *
 * Exibe informações de conjuração:
 * - Dashboard de feitiços
 * - Número de feitiços conhecidos
 * - Limite de PP por rodada
 * - PP atuais
 * - ND dos feitiços (Arcanos, Divinos, Religiosos)
 * - Bônus de ataque de feitiços
 * - Listagem de feitiços conhecidos
 *
 * Será implementada na FASE 6.
 */
export function SpellsTab({ character, onUpdate }: SpellsTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Feitiços
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 6 com componentes para gerenciar feitiços e conjuração.
        </Typography>
      </Alert>
    </Box>
  );
}
