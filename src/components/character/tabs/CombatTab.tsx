'use client';

import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import type { Character } from '@/types';
import type { DyingState, PPLimit as PPLimitType } from '@/types/combat';
import {
  CompactHealthPoints,
  CompactPowerPoints,
  DefenseDisplay,
} from '../stats';
import { DyingRounds, PPLimit } from '../combat';
import { getSizeModifiers } from '@/constants/lineage';

export interface CombatTabProps {
  /** Dados do personagem */
  character: Character;
  /** Callback para atualizar o personagem */
  onUpdate: (updates: Partial<Character>) => void;
  /** Callback para abrir detalhes de PV */
  onOpenHP?: () => void;
  /** Callback para abrir detalhes de PP */
  onOpenPP?: () => void;
  /** Callback para abrir detalhes de Defesa */
  onOpenDefense?: () => void;
  /** Callback para abrir detalhes do Limite de PP */
  onOpenPPLimit?: () => void;
}

/**
 * Aba de Combate da Ficha de Personagem
 *
 * Exibe informações de combate:
 * - PV (atual/máximo/temporário) - reutiliza CompactHealthPoints
 * - PP (atual/máximo/temporário) - reutiliza CompactPowerPoints
 * - Rodadas Máximas Morrendo (2 + Constituição + modificadores)
 * - Rodadas Atuais Morrendo (editável, contador)
 * - Limite de PP por Rodada (Nível + Presença + modificadores)
 * - Defesa (reutiliza DefenseDisplay)
 *
 * Os componentes seguem o princípio DRY, reutilizando componentes
 * existentes de stats quando possível.
 *
 * @example
 * ```tsx
 * <CombatTab
 *   character={character}
 *   onUpdate={handleUpdate}
 *   onOpenHP={() => setSidebarType('hp')}
 *   onOpenPP={() => setSidebarType('pp')}
 *   onOpenDefense={() => setSidebarType('defense')}
 * />
 * ```
 */
export function CombatTab({
  character,
  onUpdate,
  onOpenHP,
  onOpenPP,
  onOpenDefense,
  onOpenPPLimit,
}: CombatTabProps) {
  // Obter modificador de defesa pelo tamanho
  const sizeModifiers = getSizeModifiers(character.size);
  const sizeDefenseBonus = sizeModifiers.defense;

  /**
   * Handler para atualizar estado morrendo
   */
  const handleDyingStateChange = (dyingState: DyingState) => {
    onUpdate({
      combat: {
        ...character.combat,
        dyingState,
        // Atualizar estado de combate baseado no dying state
        state: dyingState.isDying
          ? dyingState.currentRounds >= dyingState.maxRounds
            ? 'morto'
            : 'morrendo'
          : character.combat.hp.current > 0
            ? 'normal'
            : 'inconsciente',
      },
    });
  };

  /**
   * Handler para atualizar limite de PP
   */
  const handlePPLimitChange = (ppLimit: PPLimitType) => {
    onUpdate({
      combat: {
        ...character.combat,
        ppLimit,
      },
    });
  };

  return (
    <Box>
      {/* Header da seção */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mb: 3, fontWeight: 'bold' }}
      >
        Combate
      </Typography>

      <Stack spacing={3}>
        {/* Seção: Pontos de Vida e Poder */}
        <Box id="section-combat-stats">
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            color="text.secondary"
          >
            Recursos Vitais
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Pontos de Vida */}
            <CompactHealthPoints
              hp={character.combat.hp}
              onChange={(hp) =>
                onUpdate({
                  combat: {
                    ...character.combat,
                    hp,
                    // Atualizar estado baseado em HP
                    state:
                      hp.current <= 0
                        ? character.combat.dyingState.isDying
                          ? 'morrendo'
                          : 'inconsciente'
                        : 'normal',
                  },
                })
              }
              onOpenDetails={onOpenHP}
            />

            {/* Pontos de Poder */}
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
        </Box>

        <Divider />

        {/* Seção: Estado Morrendo e Limite de PP */}
        <Box id="section-dying-and-pplimit">
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            color="text.secondary"
          >
            Condições de Combate
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Rodadas Morrendo */}
            <DyingRounds
              dyingState={character.combat.dyingState}
              constituicao={character.attributes.constituicao}
              onChange={handleDyingStateChange}
            />

            {/* Limite de PP por Rodada */}
            <PPLimit
              characterLevel={character.level}
              presenca={character.attributes.presenca}
              ppLimit={character.combat.ppLimit}
              onChange={handlePPLimitChange}
              onOpenDetails={onOpenPPLimit}
            />
          </Box>
        </Box>

        <Divider />

        {/* Seção: Defesa */}
        <Box id="section-defense">
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            color="text.secondary"
          >
            Defesas
          </Typography>
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
              sizeBonus={sizeDefenseBonus}
              armorBonus={character.combat.defense.armorBonus}
              shieldBonus={character.combat.defense.shieldBonus}
              maxAgilityBonus={character.combat.defense.maxAgilityBonus}
              otherBonuses={character.combat.defense.otherBonuses}
              onOpenDetails={onOpenDefense}
            />
          </Box>
        </Box>

        {/* Nota: Seções adicionais serão implementadas nas próximas issues:
            - Issue 5.2: Sistema de Resistências
            - Issue 5.3: Economia de Ações
            - Issue 5.4: Sistema de Ataques
            - Issue 5.5: Testes de Resistência
            - Issue 5.6: Sistema de Penalidade por Erros
        */}
      </Stack>
    </Box>
  );
}
