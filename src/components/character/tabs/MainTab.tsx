'use client';

import React from 'react';
import { Box, Stack } from '@mui/material';
import type { Character } from '@/types';
import {
  BasicStats,
  CompactHealthPoints,
  CompactPowerPoints,
  DefenseDisplay,
  MovementDisplay,
} from '../stats';
import type { MovementType } from '@/types';

export interface MainTabProps {
  /**
   * Dados do personagem
   */
  character: Character;

  /**
   * Callback para atualizar o personagem
   */
  onUpdate: (updates: Partial<Character>) => void;

  /**
   * Callback para abrir sidebar de linhagem
   */
  onOpenLineage?: () => void;

  /**
   * Callback para abrir sidebar de origem
   */
  onOpenOrigin?: () => void;

  /**
   * Callback para abrir sidebar de tamanho
   */
  onOpenSize?: () => void;

  /**
   * Callback para abrir detalhes de PV
   */
  onOpenHP?: () => void;

  /**
   * Callback para abrir detalhes de PP
   */
  onOpenPP?: () => void;
  /**
   * Callback para abrir detalhes de Defesa
   */
  onOpenDefense?: () => void;
  /**
   * Callback para abrir detalhes de Deslocamento
   */
  onOpenMovement?: () => void;
}

/**
 * Aba Principal da Ficha de Personagem
 *
 * Exibe stats básicos:
 * - Nome do personagem e jogador
 * - Linhagem e origem
 * - PV e PP (atual/máximo/temporário)
 * - Nível e XP
 *
 * Implementa edição inline com auto-save automático através dos componentes
 * EditableText e EditableNumber.
 *
 * @example
 * ```tsx
 * <MainTab
 *   character={character}
 *   onUpdate={handleUpdate}
 *   onOpenLineage={() => setSidebarType('lineage')}
 *   onOpenOrigin={() => setSidebarType('origin')}
 *   onOpenSize={() => setSidebarType('size')}
 * />
 * ```
 */
export function MainTab({
  character,
  onUpdate,
  onOpenLineage,
  onOpenOrigin,
  onOpenSize,
  onOpenHP,
  onOpenPP,
  onOpenDefense,
  onOpenMovement,
}: MainTabProps) {
  return (
    <Box>
      <Stack spacing={3}>
        {/* Informações Básicas */}
        <BasicStats
          character={character}
          onUpdate={onUpdate}
          onOpenLineage={onOpenLineage}
          onOpenOrigin={onOpenOrigin}
          onOpenSize={onOpenSize}
        />

        {/* PV e PP lado a lado */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Pontos de Vida (Compacto) */}
          <CompactHealthPoints
            hp={character.combat.hp}
            onChange={(hp) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  hp,
                },
              })
            }
            onOpenDetails={onOpenHP}
          />

          {/* Pontos de Poder (Compacto) */}
          <CompactPowerPoints
            pp={character.combat.pp}
            onChange={(pp) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  pp,
                },
              })
            }
            onOpenDetails={onOpenPP}
          />
        </Box>

        {/* Defesa e Deslocamento lado a lado */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Defesa */}
          <DefenseDisplay
            agilidade={character.attributes.agilidade}
            armorBonus={character.combat.defense.armorBonus}
            maxAgilityBonus={character.combat.defense.maxAgilityBonus}
            otherBonuses={character.combat.defense.otherBonuses}
            onOpenDetails={onOpenDefense}
            onArmorBonusChange={(value) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  defense: {
                    ...character.combat.defense,
                    armorBonus: value,
                  },
                },
              })
            }
            onMaxAgilityBonusChange={(value) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  defense: {
                    ...character.combat.defense,
                    maxAgilityBonus: value,
                  },
                },
              })
            }
            onOtherBonusesChange={(bonuses) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  defense: {
                    ...character.combat.defense,
                    otherBonuses: bonuses,
                  },
                },
              })
            }
          />

          {/* Deslocamento */}
          <MovementDisplay
            movement={character.movement.speeds}
            onOpenDetails={onOpenMovement}
            onMovementChange={(type: MovementType, value: number) =>
              onUpdate({
                movement: {
                  ...character.movement,
                  speeds: {
                    ...character.movement.speeds,
                    [type]: value,
                  },
                },
              })
            }
          />
        </Box>
      </Stack>
    </Box>
  );
}
