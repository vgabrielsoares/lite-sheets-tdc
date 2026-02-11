'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Divider, Alert, Chip } from '@mui/material';
import type { Character, Resistances, SkillName } from '@/types';
import type {
  Attack,
  DyingState,
  PPLimit as PPLimitType,
  ActionEconomy as ActionEconomyType,
  CombatPenalties,
  VulnerabilityDie as VulnerabilityDieType,
} from '@/types/combat';
import {
  PowerPointsDisplay,
  SpellPointsDisplay,
  GuardVitalityDisplay,
} from '../stats';
import {
  ActionEconomy,
  AttacksDisplay,
  CombatActionsReference,
  CombatConditions,
  DefenseTest,
  DyingRounds,
  PPLimit,
  ResistancesDisplay,
  SavingThrows,
  VulnerabilityDie,
} from '../combat';
import { createDefaultCombatPenalties } from '@/utils/combatPenalties';
import {
  calculateConditionDicePenalties,
  hasActivePenalties,
  formatPenaltySummary,
  type DicePenaltyMap,
} from '@/utils/conditionEffects';
import {
  shouldConditionBeActive,
  type ConditionId,
} from '@/constants/conditions';

export interface CombatTabProps {
  /** Dados do personagem */
  character: Character;
  /** Callback para atualizar o personagem */
  onUpdate: (updates: Partial<Character>) => void;
  /** Callback para abrir detalhes de PV */
  onOpenHP?: () => void;
  /** Callback para abrir detalhes de PP */
  onOpenPP?: () => void;
  /** @deprecated v0.0.2: Defesa agora é teste ativo, não tem sidebar */
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
   * Calcula penalidades de dados das condições ativas (manuais + automáticas)
   */
  const conditionDicePenalties = useMemo((): DicePenaltyMap => {
    const AUTO_IDS: ConditionId[] = ['avariado', 'machucado', 'esgotado'];
    const state = {
      gaCurrent: character.combat.guard.current,
      gaMax: character.combat.guard.max,
      pvCurrent: character.combat.vitality.current,
      pvMax: character.combat.vitality.max,
      ppCurrent: character.combat.pp.current,
    };
    const activeAutoIds = AUTO_IDS.filter((id) =>
      shouldConditionBeActive(id, state)
    );
    return calculateConditionDicePenalties(
      character.combat.conditions,
      activeAutoIds
    );
  }, [
    character.combat.conditions,
    character.combat.guard.current,
    character.combat.guard.max,
    character.combat.vitality.current,
    character.combat.vitality.max,
    character.combat.pp.current,
  ]);

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
          : character.combat.guard.current > 0 ||
              character.combat.vitality.current > 0
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

          {/* Guarda (GA) e Vitalidade (PV) */}
          <GuardVitalityDisplay
            guard={character.combat.guard}
            vitality={character.combat.vitality}
            onChange={(guard, vitality) =>
              onUpdate({
                combat: {
                  ...character.combat,
                  guard,
                  vitality,
                  state:
                    vitality.current <= 0
                      ? 'morrendo'
                      : guard.current <= 0
                        ? 'inconsciente'
                        : 'normal',
                },
              })
            }
            onOpenDetails={onOpenHP}
          />

          {/* PP e PF lado a lado (PF apenas para conjuradores) */}
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: character.spellcasting?.isCaster
                ? { xs: '1fr', md: '1fr 1fr' }
                : '1fr',
              gap: 2,
            }}
          >
            {/* Pontos de Poder */}
            <PowerPointsDisplay
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

            {/* Pontos de Feitiço — apenas para conjuradores */}
            {character.spellcasting?.isCaster && (
              <SpellPointsDisplay
                spellPoints={{
                  current: character.spellcasting.spellPoints?.current ?? 0,
                  max: character.combat.pp.max, // PF max = PP max sempre
                }}
                pp={character.combat.pp}
                onChange={(spellPoints) =>
                  onUpdate({
                    spellcasting: {
                      ...(character.spellcasting || {
                        isCaster: true,
                        spellPoints: { current: 0, max: 0 },
                        knownSpells: [],
                        maxKnownSpells: 0,
                        knownSpellsModifiers: 0,
                        spellcastingAbilities: [],
                        masteredMatrices: [],
                      }),
                      spellPoints,
                    },
                  })
                }
                onPPChange={(pp) =>
                  onUpdate({
                    combat: {
                      ...character.combat,
                      pp,
                    },
                  })
                }
                onOpenDetails={onOpenPP}
              />
            )}
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
          <Box sx={{ mt: 2 }}>
            <CombatActionsReference />
          </Box>
        </Box>

        <Divider />

        {/* Seção 3: Teste de Defesa Ativo (v0.0.2 — substitui defesa fixa) */}
        <Box id="section-defense">
          <DefenseTest
            attributes={character.attributes}
            skills={character.skills}
            characterLevel={character.level}
            signatureSkill={currentSignatureSkill}
            conditionPenalties={conditionDicePenalties}
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
            conditionPenalties={conditionDicePenalties}
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
            {/* Dado de Vulnerabilidade */}
            <VulnerabilityDie
              vulnerabilityDie={character.combat.vulnerabilityDie}
              onChange={(vulnerabilityDie) =>
                onUpdate({
                  combat: {
                    ...character.combat,
                    vulnerabilityDie,
                  },
                })
              }
            />

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

            {/* Condições Ativas */}
            <CombatConditions
              conditions={character.combat.conditions}
              onChange={(conditions) =>
                onUpdate({
                  combat: {
                    ...character.combat,
                    conditions,
                  },
                })
              }
              gaCurrent={character.combat.guard.current}
              gaMax={character.combat.guard.max}
              pvCurrent={character.combat.vitality.current}
              pvMax={character.combat.vitality.max}
              ppCurrent={character.combat.pp.current}
            />
          </Box>

          {/* Resumo de penalidades de condições */}
          {hasActivePenalties(conditionDicePenalties) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mb: 0.5 }}
              >
                Penalidades de condições ativas:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formatPenaltySummary(conditionDicePenalties).map((text) => (
                  <Chip
                    key={text}
                    label={text}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Alert>
          )}
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
