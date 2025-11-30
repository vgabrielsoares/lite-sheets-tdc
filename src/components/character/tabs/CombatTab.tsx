'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface CombatTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Combate da Ficha de Personagem
 *
 * Exibe informações de combate:
 * - PV e PP com controles
 * - Rodadas no estado Morrendo
 * - Limite de PP por rodada
 * - Defesa detalhada
 * - Resistências e vulnerabilidades
 * - Economia de ações
 * - Ataques
 * - Testes de resistência
 *
 * Será implementada na FASE 5.
 */
export function CombatTab({ character, onUpdate }: CombatTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Combate
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 5 com componentes para gerenciar combate, ataques, defesa e
          economia de ações.
        </Typography>
      </Alert>
    </Box>
  );
}
