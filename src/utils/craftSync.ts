/**
 * craftSync - Utilitários para sincronizar ofícios com a habilidade "Ofício"
 *
 * Mantém character.crafts sincronizado com skill.customUses para a habilidade "oficio"
 */

import type { Craft, Skill, SkillUse, Modifier } from '@/types';
import { getCraftMultiplier } from './calculations';

/**
 * Converte um Craft em um SkillUse para a habilidade "oficio"
 */
export function craftToSkillUse(craft: Craft): SkillUse {
  const modifiers: Modifier[] = [];

  // Adicionar modificador de dados se presente
  if (craft.diceModifier !== 0) {
    modifiers.push({
      name: 'Modificador de Dados',
      value: craft.diceModifier,
      type: craft.diceModifier > 0 ? 'bonus' : 'penalidade',
      affectsDice: true,
    });
  }

  // Adicionar modificador numérico se presente
  if (craft.numericModifier !== 0) {
    modifiers.push({
      name: 'Modificador Numérico',
      value: craft.numericModifier,
      type: craft.numericModifier > 0 ? 'bonus' : 'penalidade',
      affectsDice: false,
    });
  }

  return {
    id: craft.id,
    name: craft.name,
    skillName: 'oficio',
    keyAttribute: craft.attributeKey,
    bonus: 0, // O bônus vem do nível do craft via multiplicador
    description: craft.description,
    modifiers,
  };
}

/**
 * Converte um SkillUse de volta para um Craft
 */
export function skillUseToCraft(
  skillUse: SkillUse,
  existingCraft?: Craft
): Craft {
  const diceModifier =
    skillUse.modifiers
      ?.filter((mod) => mod.affectsDice === true)
      .reduce((sum, mod) => sum + mod.value, 0) || 0;

  const numericModifier =
    skillUse.modifiers
      ?.filter((mod) => !mod.affectsDice)
      .reduce((sum, mod) => sum + mod.value, 0) || 0;

  return {
    id: skillUse.id,
    name: skillUse.name,
    level: existingCraft?.level || 1, // Manter nível existente ou default
    attributeKey: skillUse.keyAttribute,
    diceModifier,
    numericModifier,
    description: skillUse.description,
  };
}

/**
 * Sincroniza a lista de crafts com os customUses da habilidade "oficio"
 * Atualiza skill.customUses baseado em character.crafts
 */
export function syncCraftsToOficioSkill(
  crafts: Craft[],
  oficioSkill: Skill
): Skill {
  return {
    ...oficioSkill,
    customUses: crafts.map(craftToSkillUse),
  };
}

/**
 * Sincroniza os customUses da habilidade "oficio" de volta para crafts
 * Atualiza character.crafts baseado em skill.customUses (preservando levels)
 */
export function syncOficioSkillToCrafts(
  oficioSkill: Skill,
  existingCrafts: Craft[]
): Craft[] {
  if (!oficioSkill.customUses) return existingCrafts;

  return oficioSkill.customUses.map((use) => {
    const existingCraft = existingCrafts.find((c) => c.id === use.id);
    return skillUseToCraft(use, existingCraft);
  });
}

/**
 * Calcula o modificador base de um craft baseado no atributo e nível
 */
export function calculateCraftBaseModifier(
  craft: Craft,
  attributeValue: number
): number {
  const multiplier = getCraftMultiplier(craft.level);
  return attributeValue * multiplier;
}

/**
 * Calcula o modificador total de um craft (base + numérico)
 */
export function calculateCraftTotalModifier(
  craft: Craft,
  attributeValue: number
): number {
  return (
    calculateCraftBaseModifier(craft, attributeValue) + craft.numericModifier
  );
}
