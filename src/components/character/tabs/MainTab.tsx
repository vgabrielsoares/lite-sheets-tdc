'use client';

import React from 'react';
import { Box, Stack } from '@mui/material';
import type { Character } from '@/types';
import {
  BasicStats,
  HealthPoints,
  PowerPoints,
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
          {/* Pontos de Vida */}
          <HealthPoints
            hp={character.combat.hp}
            onUpdate={(hp) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  hp,
                },
              })
            }
          />

          {/* Pontos de Poder */}
          <PowerPoints
            pp={character.combat.pp}
            onUpdate={(pp) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  pp,
                },
              })
            }
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
