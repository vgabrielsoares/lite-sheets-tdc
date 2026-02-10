'use client';

import React, { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import type {
  Character,
  AttributeName,
  SkillName,
  ProficiencyLevel,
  Modifier,
  Craft,
  LanguageName,
} from '@/types';
import {
  BasicStats,
  CompactGuardVitality,
  CompactPowerPoints,
  CompactDefenseTest,
  MovementDisplay,
  SensesDisplay,
} from '../stats';
import { AttributesDisplay } from '../attributes';
import { SkillsDisplay, CraftsDisplay } from '../skills';
import { LanguagesDisplay } from '../languages';
import {
  getEncumbranceState,
  calculateCarryCapacity,
  getEquippedArmorType,
} from '@/utils';
import {
  calculateConditionDicePenalties,
  type DicePenaltyMap,
} from '@/utils/conditionEffects';
import {
  shouldConditionBeActive,
  type ConditionId,
} from '@/constants/conditions';
import { getSizeModifiers } from '@/constants/lineage';

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
   * Callback para abrir detalhes de GA/PV
   */
  onOpenHP?: () => void;

  /**
   * Callback para abrir detalhes de PP
   */
  onOpenPP?: () => void;
  /**
   * @deprecated Defesa é teste ativo em v0.0.2 — use a aba de Combate
   */
  onOpenDefense?: () => void;
  /**
   * Callback para abrir detalhes de Deslocamento
   */
  onOpenMovement?: () => void;

  /**
   * Callback para abrir detalhes de Sentidos
   */
  onOpenSenses?: () => void;

  /**
   * Callback para abrir detalhes de um atributo
   */
  onOpenAttribute?: (attribute: AttributeName) => void;

  /**
   * Callback para abrir detalhes de uma habilidade
   */
  onOpenSkill?: (skillName: SkillName) => void;

  /**
   * Callback para alterar atributo-chave de uma habilidade
   */
  onSkillKeyAttributeChange?: (
    skillName: SkillName,
    newAttribute: AttributeName
  ) => void;

  /**
   * Callback para alterar proficiência de uma habilidade
   */
  onSkillProficiencyChange?: (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => void;

  /**
   * Callback para alterar modificadores de uma habilidade
   */
  onSkillModifiersChange?: (
    skillName: SkillName,
    modifiers: Modifier[]
  ) => void;

  /**
   * Callback para adicionar ofício
   */
  onAddCraft?: (craft: Omit<Craft, 'id'>) => void;

  /**
   * Callback para atualizar ofício
   */
  onUpdateCraft?: (craftId: string, updates: Partial<Craft>) => void;

  /**
   * Callback para remover ofício
   */
  onRemoveCraft?: (craftId: string) => void;

  /**
   * Callback para alterar ofício selecionado
   */
  onSelectedCraftChange?: (skillName: SkillName, craftId: string) => void;
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
export const MainTab = React.memo(function MainTab({
  character,
  onUpdate,
  onOpenLineage,
  onOpenOrigin,
  onOpenSize,
  onOpenHP,
  onOpenPP,
  onOpenMovement,
  onOpenSenses,
  onOpenAttribute,
  onOpenSkill,
  onSkillKeyAttributeChange,
  onSkillProficiencyChange,
  onSkillModifiersChange,
  onAddCraft,
  onUpdateCraft,
  onRemoveCraft,
  onSelectedCraftChange,
}: MainTabProps) {
  // Calcular se personagem está sobrecarregado
  const carryCapacity = calculateCarryCapacity(character.attributes.corpo);
  // Calcular carga atual somando peso de todos os itens
  const currentLoad = character.inventory.items.reduce(
    (total, item) => total + (item.weight || 0) * (item.quantity || 1),
    0
  );
  const encumbranceState = getEncumbranceState(currentLoad, carryCapacity);
  const isOverloaded =
    encumbranceState === 'sobrecarregado' || encumbranceState === 'imobilizado';

  // Detectar tipo de armadura equipada para penalidades de carga
  const equippedArmorType = useMemo(
    () => getEquippedArmorType(character.inventory.items),
    [character.inventory.items]
  );

  // Obter modificadores de tamanho
  const sizeModifiers = getSizeModifiers(character.size);

  // Calcular penalidades de dados das condições ativas (manuais + automáticas)
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

  return (
    <Box>
      <Stack spacing={3}>
        {/* Informações Básicas */}
        <Box id="section-basic-stats">
          <BasicStats
            character={character}
            onUpdate={onUpdate}
            onOpenLineage={onOpenLineage}
            onOpenOrigin={onOpenOrigin}
            onOpenSize={onOpenSize}
          />
        </Box>

        {/* GA/PV e PP lado a lado */}
        <Box
          id="section-hp-pp"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Guarda + Vitalidade (Compacto) */}
          <CompactGuardVitality
            guard={character.combat.guard ?? { current: 0, max: 0 }}
            vitality={character.combat.vitality ?? { current: 0, max: 0 }}
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
          id="section-defense-movement"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Teste de Defesa Ativo */}
          <CompactDefenseTest
            attributes={character.attributes}
            skills={character.skills}
            characterLevel={character.level}
            signatureSkill={
              Object.entries(character.skills).find(
                ([, s]) => s.isSignature
              )?.[0] as import('@/types').SkillName | undefined
            }
          />

          {/* Deslocamento */}
          <MovementDisplay
            movement={character.movement.speeds}
            onOpenDetails={onOpenMovement}
          />
        </Box>

        {/* Sentidos */}
        <Box id="section-senses">
          <SensesDisplay character={character} onOpenDetails={onOpenSenses} />
        </Box>

        {/* Atributos */}
        <Box id="section-attributes">
          <AttributesDisplay
            attributes={character.attributes}
            onAttributeClick={onOpenAttribute}
            conditionPenalties={conditionDicePenalties}
          />
        </Box>

        {/* Habilidades */}
        <Box id="section-skills">
          {onOpenSkill &&
            onSkillKeyAttributeChange &&
            onSkillProficiencyChange && (
              <SkillsDisplay
                skills={character.skills}
                attributes={character.attributes}
                characterLevel={character.level}
                isOverloaded={isOverloaded}
                equippedArmorType={equippedArmorType}
                onKeyAttributeChange={onSkillKeyAttributeChange}
                onProficiencyChange={onSkillProficiencyChange}
                onModifiersChange={onSkillModifiersChange}
                onSkillClick={onOpenSkill}
                crafts={character.crafts}
                onSelectedCraftChange={onSelectedCraftChange}
                luck={character.luck}
                onLuckLevelChange={(level) =>
                  onUpdate({
                    luck: {
                      ...character.luck,
                      level,
                    },
                  })
                }
                onLuckModifiersChange={(diceModifier, numericModifier) =>
                  onUpdate({
                    luck: {
                      ...character.luck,
                      diceModifier,
                      numericModifier,
                    },
                  })
                }
                sizeSkillModifiers={sizeModifiers.skillModifiers}
                skillProficiencyBonusSlots={
                  character.skillProficiencyBonusSlots ?? 0
                }
                onSkillProficiencyBonusSlotsChange={(bonusSlots) =>
                  onUpdate({ skillProficiencyBonusSlots: bonusSlots })
                }
                conditionPenalties={conditionDicePenalties}
              />
            )}
        </Box>

        {/* Ofícios (Competências) */}
        <Box id="section-crafts">
          {onAddCraft && onUpdateCraft && onRemoveCraft && (
            <CraftsDisplay
              crafts={character.crafts}
              attributes={character.attributes}
              onAdd={onAddCraft}
              onUpdate={onUpdateCraft}
              onRemove={onRemoveCraft}
            />
          )}
        </Box>

        {/* Idiomas Conhecidos */}
        <Box id="section-languages">
          <LanguagesDisplay
            character={character}
            onUpdate={(languages: LanguageName[]) => onUpdate({ languages })}
          />
        </Box>
      </Stack>
    </Box>
  );
});

// Display name para debugging
MainTab.displayName = 'MainTab';
