'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import type { Character } from '@/types';

export interface InventoryTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Inventário
 *
 * Exibe inventário e riquezas:
 * - Capacidade de carga
 * - Estado de carga
 * - Listagem de itens
 * - Cunhagem (moedas físicas e banco)
 * - Riquezas totais
 * - Conversor de moedas
 * - Indicador de peso em moedas
 * - Indicador de empurrar/levantar
 *
 * Será implementada na FASE 6.
 */
export function InventoryTab({ character, onUpdate }: InventoryTabProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Inventário
      </Typography>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Em desenvolvimento:</strong> Esta aba será implementada na
          FASE 6 com componentes para gerenciar inventário, itens e riquezas.
        </Typography>
      </Alert>
    </Box>
  );
}
