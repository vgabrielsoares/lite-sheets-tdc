/**
 * Skill Calculations - Funções para cálculos relacionados a habilidades
 *
 * Este arquivo implementa todos os cálculos necessários para o sistema de habilidades
 * do Tabuleiro do Caos RPG, incluindo:
 * - Modificador total de habilidade
 * - Fórmula de rolagem
 * - Penalidade de carga
 * - Bônus de Habilidade de Assinatura
 *
 * Regras:
 * - Sempre arredondar para BAIXO
 * - Atributo 0: rola 2d20 e escolhe o MENOR resultado
 * - Fórmula: Atributo × Proficiência + Modificadores
 * - Carga: -5 quando Sobrecarregado (apenas habilidades com propriedade Carga)
 */

import type {
  SkillName,
  ProficiencyLevel,
  AttributeName,
  Attributes,
  SkillModifierCalculation,
  SkillRollFormula,
  Modifier,
} from '@/types';
import {
  SKILL_METADATA,
  SKILL_PROFICIENCY_LEVELS,
  CARGA_PENALTY_VALUE,
  COMBAT_SKILLS,
} from '@/constants';
import { calculateSignatureAbilityBonus } from './calculations';

/**
 * Calcula o modificador total de uma habilidade
 *
 * Fórmula: (Atributo × Multiplicador de Proficiência) + Bônus de Assinatura + Outros Modificadores
 *
 * @param skillName - Nome da habilidade
 * @param keyAttribute - Atributo-chave atual (pode ser customizado)
 * @param attributeValue - Valor do atributo-chave
 * @param proficiencyLevel - Nível de proficiência
 * @param isSignature - Se é a Habilidade de Assinatura do personagem
 * @param characterLevel - Nível do personagem (para cálculo de bônus de assinatura)
 * @param otherModifiers - Array de modificadores adicionais (default: [])
 * @param isOverloaded - Se o personagem está Sobrecarregado (default: false)
 * @returns Objeto com detalhamento completo do cálculo
 *
 * @example
 * // Acrobacia (Agilidade 2, Versado, sem ser assinatura, nível 1, sem sobrecarga)
 * calculateSkillTotalModifier('acrobacia', 'agilidade', 2, 'versado', false, 1, [], false);
 * // { attributeValue: 2, proficiencyMultiplier: 2, baseModifier: 4, signatureBonus: 0, otherModifiers: 0, totalModifier: 4 }
 *
 * // Atletismo (Constituição 3, Adepto, assinatura, nível 5, sobrecarregado)
 * calculateSkillTotalModifier('atletismo', 'constituicao', 3, 'adepto', true, 5, [], true);
 * // { attributeValue: 3, proficiencyMultiplier: 1, baseModifier: 3, signatureBonus: 5, otherModifiers: -5, totalModifier: 3 }
 */
export function calculateSkillTotalModifier(
  skillName: SkillName,
  keyAttribute: AttributeName | 'especial',
  attributeValue: number,
  proficiencyLevel: ProficiencyLevel,
  isSignature: boolean,
  characterLevel: number,
  otherModifiers: Modifier[] = [],
  isOverloaded: boolean = false
): SkillModifierCalculation {
  // 1. Modificador base: Atributo × Proficiência
  const proficiencyMultiplier = SKILL_PROFICIENCY_LEVELS[proficiencyLevel];
  const baseModifier = attributeValue * proficiencyMultiplier;

  // 2. Bônus de Habilidade de Assinatura
  let signatureBonus = 0;
  if (isSignature) {
    const isCombatSkill = COMBAT_SKILLS.includes(skillName);
    signatureBonus = calculateSignatureAbilityBonus(
      characterLevel,
      isCombatSkill
    );
  }

  // 3. Outros modificadores (somar todos os valores)
  let otherModifiersTotal = otherModifiers.reduce(
    (sum, mod) => sum + (mod.value || 0),
    0
  );

  // 4. Penalidade de Carga (-5 se Sobrecarregado E habilidade tem propriedade Carga)
  const metadata = SKILL_METADATA[skillName];
  if (isOverloaded && metadata.hasCargaPenalty) {
    otherModifiersTotal += CARGA_PENALTY_VALUE;
  }

  // 5. Modificador Total
  const totalModifier = baseModifier + signatureBonus + otherModifiersTotal;

  return {
    attributeValue,
    proficiencyMultiplier,
    baseModifier,
    signatureBonus,
    otherModifiers: otherModifiersTotal,
    totalModifier,
  };
}

/**
 * Calcula a fórmula de rolagem de uma habilidade
 *
 * Regras:
 * - Quantidade de d20 = Valor do atributo
 * - Atributo 0: Rola 2d20 e escolhe o MENOR resultado (desvantagem)
 * - Atributo ≥ 1: Rola Xd20 e escolhe o MAIOR resultado (vantagem natural)
 * - Modificadores de dados podem alterar a quantidade de dados (+/- d20)
 *
 * @param attributeValue - Valor do atributo-chave
 * @param totalModifier - Modificador total calculado
 * @param diceModifiers - Modificadores que alteram quantidade de dados (ex: +1d20, -2d20)
 * @returns Objeto com fórmula de rolagem completa
 *
 * @example
 * // Atributo 2, modificador +4, sem modificadores de dados
 * calculateSkillRollFormula(2, 4, []);
 * // { diceCount: 2, takeLowest: false, modifier: 4, formula: '2d20+4' }
 *
 * // Atributo 0, modificador +2 (desvantagem)
 * calculateSkillRollFormula(0, 2, []);
 * // { diceCount: 2, takeLowest: true, modifier: 2, formula: '2d20 (menor)+2' }
 *
 * // Atributo 3, modificador -1, com +1d20
 * calculateSkillRollFormula(3, -1, [{ type: 'dice', value: 1 }]);
 * // { diceCount: 4, takeLowest: false, modifier: -1, formula: '4d20-1' }
 *
 * // Atributo 2, modificador +5, com -3d20 (desvantagem)
 * calculateSkillRollFormula(2, 5, [{ type: 'dice', value: -3 }]);
 * // { diceCount: 5, takeLowest: true, modifier: 5, formula: '5d20 (menor)+5' }
 */
export function calculateSkillRollFormula(
  attributeValue: number,
  totalModifier: number,
  diceModifiers: Modifier[] = []
): SkillRollFormula {
  // 1. Aplicar modificadores de dados ao atributo
  const diceModifierTotal = diceModifiers
    .filter((mod) => mod.affectsDice === true)
    .reduce((sum, mod) => sum + (mod.value || 0), 0);

  // 2. Calcular quantidade de dados "real" (atributo + modificadores)
  const realDiceCount = attributeValue + diceModifierTotal;

  // 3. Determinar quantidade final e se pega o menor
  let finalDiceCount: number;
  let takeLowest: boolean;

  if (realDiceCount < 1) {
    // Quando resultado real é < 1:
    // 0 → 2d20 vermelho, -1 → 3d20 vermelho, -2 → 4d20 vermelho
    finalDiceCount = 2 - realDiceCount; // 0→2, -1→3, -2→4
    takeLowest = true;
  } else {
    // Resultado real >= 1: rolagem normal
    finalDiceCount = realDiceCount;
    takeLowest = false;
  }

  // 4. Gerar string da fórmula com indicador "(menor)" quando aplicável
  let formula = `${finalDiceCount}d20`;

  // Adicionar indicador "(menor)" para rolagens que pegam o menor resultado
  if (takeLowest) {
    formula += ' (menor)';
  }

  // Adicionar modificador
  if (totalModifier > 0) {
    formula += `+${totalModifier}`;
  } else if (totalModifier < 0) {
    formula += `${totalModifier}`; // já tem o sinal negativo
  }

  return {
    diceCount: finalDiceCount,
    takeLowest,
    modifier: totalModifier,
    formula,
  };
}

/**
 * Calcula modificador e rolagem completos de uma habilidade
 * Combina calculateSkillTotalModifier e calculateSkillRollFormula
 *
 * @param skillName - Nome da habilidade
 * @param keyAttribute - Atributo-chave atual
 * @param attributes - Objeto com todos os atributos do personagem
 * @param proficiencyLevel - Nível de proficiência
 * @param isSignature - Se é Habilidade de Assinatura
 * @param characterLevel - Nível do personagem
 * @param modifiers - Array de modificadores (bônus/penalidades, modificadores de dados)
 * @param isOverloaded - Se personagem está Sobrecarregado
 * @returns Objeto com cálculo completo e fórmula de rolagem
 *
 * @example
 * const attributes = { agilidade: 2, constituicao: 3, forca: 1, influencia: 2, mente: 2, presenca: 1 };
 * calculateSkillRoll('acrobacia', 'agilidade', attributes, 'versado', false, 1, [], false);
 * // {
 * //   calculation: { attributeValue: 2, proficiencyMultiplier: 2, baseModifier: 4, signatureBonus: 0, otherModifiers: 0, totalModifier: 4 },
 * //   rollFormula: { diceCount: 2, takeLowest: false, modifier: 4, formula: '2d20+4' }
 * // }
 */
export function calculateSkillRoll(
  skillName: SkillName,
  keyAttribute: AttributeName | 'especial',
  attributes: Attributes,
  proficiencyLevel: ProficiencyLevel,
  isSignature: boolean,
  characterLevel: number,
  modifiers: Modifier[] = [],
  isOverloaded: boolean = false
): {
  calculation: SkillModifierCalculation;
  rollFormula: SkillRollFormula;
} {
  // Para habilidades especiais sem atributo definido (como "oficio" sem craft selecionado),
  // usar 0 como valor padrão
  const attributeValue =
    keyAttribute === 'especial' ? 0 : attributes[keyAttribute];

  // Separar modificadores de valor e de dados
  const valueModifiers = modifiers.filter((mod) => !mod.affectsDice);
  const diceModifiers = modifiers.filter((mod) => mod.affectsDice === true);

  // Calcular modificador total
  const calculation = calculateSkillTotalModifier(
    skillName,
    keyAttribute,
    attributeValue,
    proficiencyLevel,
    isSignature,
    characterLevel,
    valueModifiers,
    isOverloaded
  );

  // Calcular fórmula de rolagem
  const rollFormula = calculateSkillRollFormula(
    attributeValue,
    calculation.totalModifier,
    diceModifiers
  );

  return {
    calculation,
    rollFormula,
  };
}

/**
 * Verifica se uma habilidade sofre penalidade de carga
 *
 * @param skillName - Nome da habilidade
 * @returns true se a habilidade tem propriedade "Carga"
 *
 * @example
 * hasLoadPenalty('acrobacia'); // true
 * hasLoadPenalty('percepcao'); // false
 */
export function hasLoadPenalty(skillName: SkillName): boolean {
  return SKILL_METADATA[skillName].hasCargaPenalty;
}

/**
 * Verifica se uma habilidade requer instrumento para uso
 *
 * @param skillName - Nome da habilidade
 * @returns true se a habilidade requer instrumento
 *
 * @example
 * requiresInstrument('arte'); // true
 * requiresInstrument('atletismo'); // false
 */
export function requiresInstrument(skillName: SkillName): boolean {
  return SKILL_METADATA[skillName].requiresInstrument;
}

/**
 * Verifica se uma habilidade requer proficiência para uso efetivo
 *
 * @param skillName - Nome da habilidade
 * @returns true se a habilidade requer proficiência
 *
 * @example
 * requiresProficiency('arcano'); // true
 * requiresProficiency('atletismo'); // false
 */
export function requiresProficiency(skillName: SkillName): boolean {
  return SKILL_METADATA[skillName].requiresProficiency;
}

/**
 * Verifica se uma habilidade é de combate
 * Habilidades de combate têm bônus de Assinatura reduzido (Nível ÷ 3)
 *
 * @param skillName - Nome da habilidade
 * @returns true se é habilidade de combate
 *
 * @example
 * isCombatSkill('acerto'); // true
 * isCombatSkill('acrobacia'); // false
 */
export function isCombatSkill(skillName: SkillName): boolean {
  return SKILL_METADATA[skillName].isCombatSkill;
}

/**
 * Calcula o modificador total para um uso customizado de habilidade
 *
 * Usa as mesmas regras que calculateSkillTotalModifier, mas com:
 * - Atributo-chave do uso customizado
 * - Bônus específico do uso
 * - Mesma proficiência da habilidade base
 * - Mesma lógica de assinatura e penalidades
 *
 * @param skillUse - Uso customizado da habilidade
 * @param baseSkill - Habilidade base (para proficiência e assinatura)
 * @param attributes - Atributos do personagem
 * @param characterLevel - Nível do personagem (para bônus de assinatura)
 * @param isOverloaded - Se personagem está sobrecarregado
 * @returns Modificador total do uso customizado
 *
 * @example
 * const skillUse: SkillUse = {
 *   id: '1',
 *   name: 'Acrobacia em Combate',
 *   skillName: 'acrobacia',
 *   keyAttribute: 'forca',
 *   bonus: 2,
 * };
 * const skill: Skill = {
 *   name: 'acrobacia',
 *   keyAttribute: 'agilidade',
 *   proficiencyLevel: 'versado',
 *   isSignature: false,
 *   modifiers: [],
 * };
 * const attributes: Attributes = { agilidade: 3, forca: 2, ... };
 * calculateSkillUseModifier(skillUse, skill, attributes, 5, false);
 * // Returns: (2 * 2) + 2 = 6 (Força 2 × Versado + bônus +2)
 */
export function calculateSkillUseModifier(
  skillUse: {
    keyAttribute: AttributeName | 'especial';
    bonus: number;
    skillName: SkillName;
    modifiers?: Modifier[];
  },
  baseSkill: {
    proficiencyLevel: ProficiencyLevel;
    isSignature: boolean;
    modifiers: Modifier[];
  },
  attributes: Attributes,
  characterLevel: number,
  isOverloaded: boolean
): number {
  const metadata = SKILL_METADATA[skillUse.skillName];

  // Valor do atributo customizado (0 para 'especial')
  const attributeValue =
    skillUse.keyAttribute === 'especial'
      ? 0
      : attributes[skillUse.keyAttribute];

  // Usa a proficiência da habilidade base
  const proficiencyMultiplier =
    SKILL_PROFICIENCY_LEVELS[baseSkill.proficiencyLevel];

  // Modificador base
  const baseModifier = attributeValue * proficiencyMultiplier;

  // Bônus de assinatura (usa regras da habilidade base)
  let signatureBonus = 0;
  if (baseSkill.isSignature && proficiencyMultiplier > 0) {
    const isCombat = metadata.isCombatSkill === true;
    signatureBonus = isCombat
      ? Math.max(1, Math.floor(characterLevel / 3))
      : characterLevel;
  }

  // Combinar modificadores: habilidade base + uso específico
  const allModifiers = [
    ...(baseSkill.modifiers || []),
    ...(skillUse.modifiers || []),
  ];

  // Somar apenas modificadores que não afetam dados (modificadores numéricos)
  const numericModifiers = allModifiers
    .filter((mod) => !mod.affectsDice)
    .reduce((sum, mod) => sum + mod.value, 0);

  // Bônus específico do uso
  const useBonus = skillUse.bonus;

  // Penalidade de carga
  const loadPenalty =
    isOverloaded && metadata.hasCargaPenalty === true ? CARGA_PENALTY_VALUE : 0;

  return (
    baseModifier + signatureBonus + numericModifiers + useBonus + loadPenalty
  );
}

/**
 * Calcula a fórmula de rolagem para um uso customizado de habilidade
 *
 * @param skillUse - Uso customizado da habilidade
 * @param baseSkill - Habilidade base (para proficiência e assinatura)
 * @param attributes - Atributos do personagem
 * @param characterLevel - Nível do personagem (para bônus de assinatura)
 * @param isOverloaded - Se personagem está sobrecarregado
 * @returns Fórmula de rolagem formatada (ex: "2d20+6")
 *
 * @example
 * calculateSkillUseRollFormula(skillUse, skill, attributes, 5, false);
 * // Returns: "2d20+6" (Força 2 = 2d20, modificador total +6)
 */
export function calculateSkillUseRollFormula(
  skillUse: {
    keyAttribute: AttributeName | 'especial';
    bonus: number;
    skillName: SkillName;
    modifiers?: Modifier[];
  },
  baseSkill: {
    proficiencyLevel: ProficiencyLevel;
    isSignature: boolean;
    modifiers: Modifier[];
  },
  attributes: Attributes,
  characterLevel: number,
  isOverloaded: boolean
): string {
  const modifier = calculateSkillUseModifier(
    skillUse,
    baseSkill,
    attributes,
    characterLevel,
    isOverloaded
  );

  const attributeValue =
    skillUse.keyAttribute === 'especial'
      ? 0
      : attributes[skillUse.keyAttribute];

  // Combinar modificadores de dados: habilidade base + uso específico
  const allModifiers = [
    ...(baseSkill.modifiers || []),
    ...(skillUse.modifiers || []),
  ];

  // Somar modificadores que afetam dados
  const diceModifiers = allModifiers
    .filter((mod) => mod.affectsDice === true)
    .reduce((sum, mod) => sum + mod.value, 0);

  // Quantidade de dados = atributo + modificadores de dados
  const baseDiceCount = attributeValue;
  const realDiceCount = baseDiceCount + diceModifiers;

  // Determinar se pega o menor (quando real < 1)
  let finalDiceCount: number;
  let takeLowest = false;

  if (realDiceCount < 1) {
    // 0→2d20, -1→3d20, -2→4d20, etc.
    finalDiceCount = 2 - realDiceCount;
    takeLowest = true;
  } else {
    finalDiceCount = realDiceCount;
  }

  // Formatar fórmula com "(menor)" quando aplicável
  const sign = modifier >= 0 ? '+' : '';
  let formula = `${finalDiceCount}d20`;

  if (takeLowest) {
    formula += ' (menor)';
  }

  if (modifier !== 0) {
    formula += `${sign}${modifier}`;
  }

  return formula;
}
