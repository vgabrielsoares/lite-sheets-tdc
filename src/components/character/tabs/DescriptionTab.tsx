/**
 * DescriptionTab - Aba de Descrição e Detalhes
 *
 * Exibe informações descritivas do personagem:
 * - Campos curtos (gênero, divindade, motivação, fé) - Fase 8
 * - Descrição de aparência (pele, olhos, cabelo, outros) - Fase 8
 * - Conceito de personagem - Fase 8
 * - Definidores (falhas, medos, ideais, traços, objetivos, aliados, organizações) - Fase 8
 * - História completa - Fase 8
 * - Anotações (com tags, categorias, pesquisa) - Fase 8
 *
 * Nota: Particularidades foi movida para ResourcesTab
 */

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
 * Seções planejadas para Fase 8:
 * - Descrição Física
 * - Conceito de Personagem
 * - Definidores (Falhas, Medos, Ideais, etc.)
 * - História
 * - Anotações
 */
export function DescriptionTab({ character, onUpdate }: DescriptionTabProps) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Em desenvolvimento (Fase 8):</strong> Esta aba conterá
          informações descritivas do personagem, incluindo Descrição Física,
          Conceito do Personagem, Definidores (Falhas, Medos, Ideais, Traços,
          Objetivos, Aliados, Organizações), História completa e Anotações.
        </Typography>
      </Alert>
    </Box>
  );
}
