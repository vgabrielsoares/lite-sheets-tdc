'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import type { Character } from '@/types';
import type { InventoryItem } from '@/types/inventory';
import type { CreatureSize } from '@/types/common';
import {
  CurrencyManager,
  CarryCapacityDisplay,
  InventoryList,
} from '../inventory';
import {
  calculateCoinsWeight,
  calculateCarryCapacity,
  getSizeCarryModifier,
} from '@/utils/carryCapacityCalculations';

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
 * - Listagem de itens
 */
export function InventoryTab({ character, onUpdate }: InventoryTabProps) {
  /**
   * Handler para atualizar as moedas do personagem
   */
  const handleCurrencyUpdate = useCallback(
    (currency: Character['inventory']['currency']) => {
      onUpdate({
        inventory: {
          ...character.inventory,
          currency,
        },
      });
    },
    [character.inventory, onUpdate]
  );

  /**
   * Handler para atualizar os itens do inventário
   */
  const handleItemsUpdate = useCallback(
    (items: InventoryItem[]) => {
      onUpdate({
        inventory: {
          ...character.inventory,
          items,
        },
      });
    },
    [character.inventory, onUpdate]
  );

  /**
   * Handler para atualizar modificadores adicionais de capacidade de carga
   */
  const handleOtherModifiersChange = useCallback(
    (value: number) => {
      onUpdate({
        inventory: {
          ...character.inventory,
          carryingCapacity: {
            ...character.inventory.carryingCapacity,
            otherModifiers: value,
          },
        },
      });
    },
    [character.inventory, onUpdate]
  );

  /**
   * Calcula a capacidade máxima de carga
   */
  const maxCapacity = useMemo(() => {
    const forca = character.attributes?.forca ?? 1;
    const size = (character.size ?? 'medio') as CreatureSize;
    const sizeModifier = getSizeCarryModifier(size);
    return calculateCarryCapacity(forca, sizeModifier, 0);
  }, [character.attributes?.forca, character.size]);

  /**
   * Calcula o peso das moedas físicas
   */
  const coinsWeight = useMemo(() => {
    const currency = character.inventory?.currency ?? {
      physical: { cobre: 0, ouro: 0, platina: 0 },
      bank: { cobre: 0, ouro: 0, platina: 0 },
    };
    return calculateCoinsWeight(currency);
  }, [character.inventory?.currency]);

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
        <CarryCapacityDisplay
          character={character}
          showDetails
          onOtherModifiersChange={handleOtherModifiersChange}
        />

        {/* Lista de Itens do Inventário */}
        <InventoryList
          items={character.inventory?.items ?? []}
          onUpdate={handleItemsUpdate}
          maxCapacity={maxCapacity}
          coinsWeight={coinsWeight}
        />
      </Stack>
    </Box>
  );
}
