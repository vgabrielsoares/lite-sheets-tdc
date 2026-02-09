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
  CompactHealthPoints,
  CompactPowerPoints,
  DefenseDisplay,
  MovementDisplay,
  SensesDisplay,
} from '../stats';
import { AttributesDisplay } from '../attributes';
import { SkillsDisplay, CraftsDisplay } from '../skills';
import { LanguagesDisplay } from '../languages';
import { getEncumbranceState, calculateCarryCapacity } from '@/utils';
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
  onOpenDefense,
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

  // Obter modificador de defesa pelo tamanho
  const sizeModifiers = getSizeModifiers(character.size);
  const sizeDefenseBonus = sizeModifiers.defense;

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

        {/* PV e PP lado a lado */}
        <Box
          id="section-hp-pp"
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
          id="section-defense-movement"
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
