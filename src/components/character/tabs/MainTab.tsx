'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface MainTabProps {
  /**
   * Dados do personagem
   */
  character: Character;

  /**
   * Callback para atualizar o personagem
   */
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba Principal da Ficha de Personagem
 *
 * Exibe stats básicos:
 * - Nome do personagem e jogador
 * - Linhagem e origem
 * - PV e PP (atual/máximo/temporário)
 * - Nível e XP
 * - Defesa
 * - Deslocamento
 *
 */
export function MainTab({ character, onUpdate }: MainTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Stats Básicos
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          Issue 3.2 com componentes para exibir e editar stats básicos do
          personagem (PV, PP, defesa, deslocamento, etc.).
        </Typography>
      </Alert>

      {/* Placeholder para desenvolvimento futuro */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Nome: {character.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nível: {character.level}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PV: {character.combat.hp.current}/{character.combat.hp.max}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PP: {character.combat.pp.current}/{character.combat.pp.max}
        </Typography>
      </Box>
    </Box>
  );
}
