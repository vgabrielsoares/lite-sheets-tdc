'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Character } from '@/types';
import { SpellDashboard } from '../spells';

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
 * - ND dos feitiços (Arcanos, Natureza, Religião)
 * - Bônus de ataque de feitiços
 * - Listagem de feitiços conhecidos (próximas fases)
 *
 * FASE 6.7: Dashboard de Feitiços
 */
export function SpellsTab({ character, onUpdate }: SpellsTabProps) {
  return (
    <Box>
      <SpellDashboard character={character} onUpdate={onUpdate} />
    </Box>
  );
}
