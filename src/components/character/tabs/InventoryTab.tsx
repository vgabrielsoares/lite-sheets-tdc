'use client';

import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import type { Character } from '@/types';
import { CurrencyManager, CarryCapacityDisplay } from '../inventory';

export interface InventoryTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Inventário
 *
 * Exibe inventário e riquezas:
 * - Cunhagem (moedas físicas e banco)
 * - Riquezas totais
 * - Peso de moedas
 * - Capacidade de carga
 * - Estado de carga
 * - Listagem de itens (a ser implementado)
 */
export function InventoryTab({ character, onUpdate }: InventoryTabProps) {
  /**
   * Handler para atualizar as moedas do personagem
   */
  const handleCurrencyUpdate = (
    currency: Character['inventory']['currency']
  ) => {
    onUpdate({
      inventory: {
        ...character.inventory,
        currency,
      },
    });
  };

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <InventoryIcon color="primary" />
        Inventário
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Gerenciador de Moedas */}
        <CurrencyManager
          currency={character.inventory.currency}
          onUpdate={handleCurrencyUpdate}
        />

        {/* Capacidade de Carga */}
        <CarryCapacityDisplay character={character} showDetails />

        {/* Placeholder para componentes futuros */}
        {/* Issue 6.4: InventoryItemList */}
      </Stack>
    </Box>
  );
}
