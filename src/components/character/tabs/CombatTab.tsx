'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import type { Character, Resistances, SkillName } from '@/types';
import type {
  Attack,
  DyingState,
  PPLimit as PPLimitType,
  ActionEconomy as ActionEconomyType,
  CombatPenalties,
} from '@/types/combat';
import { CompactHealthPoints, CompactPowerPoints } from '../stats';
import {
  ActionEconomy,
  AttacksDisplay,
  DyingRounds,
  MissPenalties,
  PPLimit,
  ResistancesDisplay,
  SavingThrows,
} from '../combat';
import { getSizeModifiers } from '@/constants/lineage';
import { calculateDefense } from '@/utils/calculations';
import {
  createDefaultCombatPenalties,
  type CombatPenaltiesState,
} from '@/utils/combatPenalties';

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
 * - Economia de Ações
 * - Defesa com Penalidades de Erro (MissPenalties)
 * - Testes de Resistência (SavingThrows)
 * - Ataques
 * - Condições de Combate (Rodadas Morrendo, Limite de PP)
 * - Resistências e Vulnerabilidades
 *
 * Os componentes seguem o princípio DRY, reutilizando componentes
 * existentes de stats quando possível.
 *
 * Memoizado para evitar re-renders desnecessários.
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
export const CombatTab = React.memo(function CombatTab({
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
   * Encontra qual habilidade é atualmente a assinatura
   * Verifica tanto o campo signatureSkill quanto o flag isSignature nas skills
   */
  const currentSignatureSkill = useMemo((): SkillName | undefined => {
    // Primeiro, verifica se alguma skill tem a flag isSignature
    const signatureEntry = Object.entries(character.skills).find(
      ([, skill]) => skill.isSignature
    );
    if (signatureEntry) {
      return signatureEntry[0] as SkillName;
    }
    // Fallback para o campo signatureSkill do personagem
    return character.signatureSkill;
  }, [character.skills, character.signatureSkill]);

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

  /**
   * Handler para atualizar resistências
   */
  const handleResistancesChange = (resistances: Resistances) => {
    onUpdate({
      combat: {
        ...character.combat,
        resistances,
      },
    });
  };

  /**
   * Handler para atualizar economia de ações
   */
  const handleActionEconomyChange = (actionEconomy: ActionEconomyType) => {
    onUpdate({
      combat: {
        ...character.combat,
        actionEconomy,
      },
    });
  };

  /**
   * Handler para atualizar ataques
   */
  const handleAttacksChange = (attacks: Attack[]) => {
    onUpdate({
      combat: {
        ...character.combat,
        attacks,
      },
    });
  };

  /**
   * Handler para atualizar penalidades de combate
   */
  const handlePenaltiesChange = (penalties: CombatPenaltiesState) => {
    onUpdate({
      combat: {
        ...character.combat,
        penalties,
      },
    });
  };

  /**
   * Calcula a defesa base (sem penalidades de erro)
   * Soma todos os bônus: tamanho, armadura, escudo, outros
   * Aplica o limite de agilidade da armadura se houver
   */
  const baseDefense = useMemo(() => {
    const agilidade = character.attributes.agilidade;
    const maxAgilityBonus = character.combat.defense.maxAgilityBonus;

    // Aplica o limite de agilidade da armadura se houver
    const effectiveAgilityBonus =
      maxAgilityBonus !== undefined
        ? Math.min(agilidade, maxAgilityBonus)
        : agilidade;

    const otherBonusesTotal = character.combat.defense.otherBonuses.reduce(
      (sum, mod) => sum + mod.value,
      0
    );
    const totalBonuses =
      sizeDefenseBonus +
      character.combat.defense.armorBonus +
      character.combat.defense.shieldBonus +
      otherBonusesTotal;
    return calculateDefense(effectiveAgilityBonus, totalBonuses);
  }, [
    character.attributes.agilidade,
    sizeDefenseBonus,
    character.combat.defense,
  ]);

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
        {/* Seção 1: Recursos Vitais */}
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

        {/* Seção 2: Economia de Ações */}
        <Box id="section-action-economy">
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            color="text.secondary"
          >
            Economia de Ações
          </Typography>
          <ActionEconomy
            actionEconomy={character.combat.actionEconomy}
            onChange={handleActionEconomyChange}
          />
        </Box>

        <Divider />

        {/* Seção 3: Defesa (com penalidades de erro - Issue 5.6) */}
        <Box id="section-defense">
          <MissPenalties
            penalties={
              character.combat.penalties ?? createDefaultCombatPenalties()
            }
            baseDefense={baseDefense}
            onChange={handlePenaltiesChange}
            onOpenDetails={onOpenDefense}
          />
        </Box>

        <Divider />

        {/* Seção 4: Testes de Resistência */}
        <Box id="section-saving-throws">
          <SavingThrows
            attributes={character.attributes}
            skills={character.skills}
            characterLevel={character.level}
            signatureSkill={currentSignatureSkill}
            penalties={
              character.combat.penalties ?? createDefaultCombatPenalties()
            }
          />
        </Box>

        <Divider />

        {/* Seção 5: Ataques */}
        <Box id="section-attacks">
          <AttacksDisplay
            attacks={character.combat.attacks}
            onChange={handleAttacksChange}
            character={character}
          />
        </Box>

        <Divider />

        {/* Seção 6: Condições de Combate */}
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
              corpo={character.attributes.corpo}
              onChange={handleDyingStateChange}
            />

            {/* Limite de PP por Rodada */}
            <PPLimit
              characterLevel={character.level}
              essencia={character.attributes.essencia}
              ppLimit={character.combat.ppLimit}
              onChange={handlePPLimitChange}
              onOpenDetails={onOpenPPLimit}
            />
          </Box>
        </Box>

        <Divider />

        {/* Seção 7: Resistências e Vulnerabilidades */}
        <Box id="section-resistances">
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            color="text.secondary"
          >
            Resistências e Vulnerabilidades
          </Typography>
          <ResistancesDisplay
            resistances={character.combat.resistances}
            onChange={handleResistancesChange}
          />
        </Box>
      </Stack>
    </Box>
  );
});
