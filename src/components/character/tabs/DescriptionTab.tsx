'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface DescriptionTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Descrição e Detalhes
 *
 * Exibe informações descritivas do personagem:
 * - Campos curtos (gênero, divindade, motivação, fé)
 * - Descrição de aparência (pele, olhos, cabelo, outros)
 * - Conceito de personagem
 * - Definidores (falhas, medos, ideais, traços, objetivos, aliados, organizações)
 * - História completa
 * - Anotações (com tags, categorias, pesquisa)
 *
 * Será implementada na FASE 6.
 */
export function DescriptionTab({ character, onUpdate }: DescriptionTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Descrição e Detalhes
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 6 com componentes para gerenciar descrições, história e anotações
          do personagem.
        </Typography>
      </Alert>
    </Box>
  );
}
