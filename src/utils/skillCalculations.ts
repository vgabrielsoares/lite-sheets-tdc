/**
 * Skill Calculations - Funções para cálculos relacionados a habilidades
 *
 * Este arquivo implementa todos os cálculos necessários para o sistema de habilidades
 * do Tabuleiro do Caos RPG, incluindo:
 * - Pool de dados (quantidade de dados + tamanho do dado)
 * - Fórmula de rolagem (ex: "3d8", "2d6 (menor)")
 * - Penalidade de carga (-Xd em habilidades com propriedade Carga)
 * - Bônus de Habilidade de Assinatura (+Xd)
 *
 * Regras:
 * - Proficiência determina o tamanho do dado: Leigo=d6, Adepto=d8, Versado=d10, Mestre=d12
 * - Atributo determina a quantidade base de dados na pool
 * - Todos os modificadores são em dados (+Xd / -Xd)
 * - Sem modificadores numéricos em testes de habilidade
 * - Resultado ≥ 6 = sucesso (✶), resultado = 1 cancela 1 sucesso
 * - Máximo 8 dados por teste
 * - Quando pool ≤ 0: rola 2d e usa o menor
 */

import type {
  SkillName,
  ProficiencyLevel,
  AttributeName,
  Attributes,
  SkillPoolCalculation,
  SkillPoolFormula,
  DieSize,
  Modifier,
  ArmorType,
  InventoryItem,
} from '@/types';
import {
  SKILL_METADATA,
  getSkillDieSize,
  OVERLOAD_DICE_PENALTY,
  MEDIUM_ARMOR_DICE_PENALTY,
  HEAVY_ARMOR_DICE_PENALTY,
  PROFICIENCY_DICE_PENALTY,
  INSTRUMENT_DICE_PENALTY,
} from '@/constants';
import { calculateSignatureAbilityBonus } from './calculations';
import { MAX_SKILL_DICE } from './diceRoller';

/**
 * Contexto de penalidades do personagem para cálculo de habilidades
 *
 * Agrupa todas as informações necessárias para calcular penalidades,
 * evitando múltiplos parâmetros booleanos na assinatura das funções.
 */
export interface SkillPenaltyContext {
  /** Se o personagem está sobrecarregado (excedeu limite de espaço) */
  isOverloaded: boolean;
  /** Tipo de armadura equipada, ou null se sem armadura / armadura leve */
  equippedArmorType: ArmorType | null;
  /** Se o personagem possui o instrumento necessário para a habilidade */
  hasRequiredInstrument: boolean;
}

/** Contexto padrão sem penalidades */
const DEFAULT_PENALTY_CONTEXT: SkillPenaltyContext = {
  isOverloaded: false,
  equippedArmorType: null,
  hasRequiredInstrument: true,
};

/**
 * Calcula a penalidade de carga por armadura em dados
 *
 * @param armorType - Tipo de armadura equipada
 * @returns Penalidade em dados (0, -1 ou -2)
 */
function getArmorDicePenalty(armorType: ArmorType | null): number {
  if (!armorType) return 0;
  switch (armorType) {
    case 'media':
      return MEDIUM_ARMOR_DICE_PENALTY;
    case 'pesada':
      return HEAVY_ARMOR_DICE_PENALTY;
    case 'leve':
    default:
      return 0;
  }
}

/**
 * Calcula todas as penalidades de dados aplicáveis a uma habilidade
 *
 * Penalidades:
 * - Carga (sobrepeso): -2d se sobrecarregado E habilidade tem propriedade Carga
 * - Armadura: -1d (média) ou -2d (pesada) se habilidade tem propriedade Carga
 * - Proficiência: -2d se Leigo E habilidade requer proficiência
 * - Instrumento: -2d se habilidade requer instrumento E personagem não possui
 * Penalidades de carga e armadura são cumulativas entre si.
 * Penalidade de proficiência é cumulativa com instrumento.
 *
 * @param skillName - Nome da habilidade
 * @param proficiencyLevel - Nível de proficiência do personagem
 * @param context - Contexto de penalidades (sobrecarga, armadura, instrumento)
 * @returns Objeto com cada penalidade detalhada
 */
export function calculateSkillPenalties(
  skillName: SkillName,
  proficiencyLevel: ProficiencyLevel,
  context: Partial<SkillPenaltyContext> = {}
): {
  loadDicePenalty: number;
  armorDicePenalty: number;
  proficiencyDicePenalty: number;
  instrumentDicePenalty: number;
  totalPenalty: number;
} {
  const ctx = { ...DEFAULT_PENALTY_CONTEXT, ...context };
  const metadata = SKILL_METADATA[skillName];

  // 1. Penalidade de carga por sobrepeso (-2d)
  const loadDicePenalty =
    ctx.isOverloaded && metadata.hasCargaPenalty ? OVERLOAD_DICE_PENALTY : 0;

  // 2. Penalidade de armadura (-1d média, -2d pesada) — só em habilidades com Carga
  const armorDicePenalty = metadata.hasCargaPenalty
    ? getArmorDicePenalty(ctx.equippedArmorType)
    : 0;

  // 3. Penalidade de proficiência (-2d se Leigo em habilidade que requer proficiência)
  const proficiencyDicePenalty =
    metadata.requiresProficiency && proficiencyLevel === 'leigo'
      ? PROFICIENCY_DICE_PENALTY
      : 0;

  // 4. Penalidade de instrumento (-2d se falta instrumento necessário)
  const instrumentDicePenalty =
    metadata.requiresInstrument && !ctx.hasRequiredInstrument
      ? INSTRUMENT_DICE_PENALTY
      : 0;

  return {
    loadDicePenalty,
    armorDicePenalty,
    proficiencyDicePenalty,
    instrumentDicePenalty,
    totalPenalty:
      loadDicePenalty +
      armorDicePenalty +
      proficiencyDicePenalty +
      instrumentDicePenalty,
  };
}

/**
 * Gera a string de fórmula de uma pool de dados
 *
 * @param diceCount - Quantidade de dados a rolar
 * @param dieSize - Tamanho do dado
 * @param isPenaltyRoll - Se é rolagem de penalidade (2d, menor)
 * @returns String formatada (ex: "3d8", "2d6 (menor)")
 */
function formatPoolFormula(
  diceCount: number,
  dieSize: DieSize,
  isPenaltyRoll: boolean
): string {
  if (isPenaltyRoll) {
    return `2${dieSize} (menor)`;
  }
  return `${diceCount}${dieSize}`;
}

/**
 * Calcula a pool de dados de uma habilidade
 *
 * No sistema de pool:
 * - Atributo determina a quantidade base de dados
 * - Proficiência determina o tamanho do dado (d6/d8/d10/d12)
 * - Assinatura adiciona +Xd dados extras
 * - Penalidades de carga, armadura, proficiência e instrumento (-Xd)
 * - Outros modificadores são sempre +Xd / -Xd
 * - Máximo 8 dados por teste
 * - Se total ≤ 0: rola 2d e usa o menor
 *
 * @param skillName - Nome da habilidade
 * @param keyAttribute - Atributo-chave atual (pode ser customizado)
 * @param attributeValue - Valor do atributo-chave
 * @param proficiencyLevel - Nível de proficiência
 * @param isSignature - Se é a Habilidade de Assinatura do personagem
 * @param characterLevel - Nível do personagem (para cálculo de bônus de assinatura)
 * @param otherModifiers - Array de modificadores adicionais (default: [])
 * @param penaltyContext - Contexto de penalidades (sobrecarga, armadura, instrumento)
 * @returns Objeto com detalhamento completo do cálculo da pool
 *
 * @example
 * // Acrobacia (Agilidade 3, Versado, sem penalidades)
 * calculateSkillTotalModifier('acrobacia', 'agilidade', 3, 'versado', false, 1);
 * // { attributeValue: 3, dieSize: 'd10', signatureDiceBonus: 0, ... totalDice: 3 }
 *
 * // Atletismo (Corpo 2, Adepto, assinatura nível 3, sobrecarregado + armadura pesada)
 * calculateSkillTotalModifier('atletismo', 'corpo', 2, 'adepto', true, 3, [],
 *   { isOverloaded: true, equippedArmorType: 'pesada' });
 * // { attributeValue: 2, loadDicePenalty: -2, armorDicePenalty: -2, signatureDiceBonus: 1, totalDice: -1 }
 */
export function calculateSkillTotalModifier(
  skillName: SkillName,
  keyAttribute: AttributeName | 'especial',
  attributeValue: number,
  proficiencyLevel: ProficiencyLevel,
  isSignature: boolean,
  characterLevel: number,
  otherModifiers: Modifier[] = [],
  penaltyContext: Partial<SkillPenaltyContext> | boolean = {}
): SkillPoolCalculation {
  // Compatibilidade: se recebeu boolean (antigo isOverloaded), converter para contexto
  const ctx: Partial<SkillPenaltyContext> =
    typeof penaltyContext === 'boolean'
      ? { isOverloaded: penaltyContext }
      : penaltyContext;

  // 1. Tamanho do dado determinado pelo grau de proficiência
  const dieSize = getSkillDieSize(proficiencyLevel);

  // 2. Bônus de Habilidade de Assinatura (+Xd)
  let signatureDiceBonus = 0;
  if (isSignature) {
    signatureDiceBonus = calculateSignatureAbilityBonus(characterLevel);
  }

  // 3. Outros modificadores de dados (+Xd / -Xd)
  const otherDiceModifiers = otherModifiers
    .filter((mod) => mod.affectsDice === true)
    .reduce((sum, mod) => sum + (mod.value || 0), 0);

  // 4. Calcular todas as penalidades usando função centralizada
  const penalties = calculateSkillPenalties(skillName, proficiencyLevel, ctx);

  // 5. Total de modificadores de dados
  const totalDiceModifier =
    signatureDiceBonus + otherDiceModifiers + penalties.totalPenalty;

  // 6. Total de dados na pool
  const totalDice = attributeValue + totalDiceModifier;

  // 7. Penalidade extrema: se total ≤ 0, rola 2d e usa o menor
  const isPenaltyRoll = totalDice <= 0;

  return {
    attributeValue,
    proficiencyLevel,
    dieSize,
    signatureDiceBonus,
    otherDiceModifiers,
    loadDicePenalty: penalties.loadDicePenalty,
    armorDicePenalty: penalties.armorDicePenalty,
    proficiencyDicePenalty: penalties.proficiencyDicePenalty,
    instrumentDicePenalty: penalties.instrumentDicePenalty,
    totalDiceModifier,
    totalDice,
    isPenaltyRoll,
  };
}

/**
 * Calcula a fórmula de rolagem de pool de dados de uma habilidade
 *
 * Regras:
 * - Quantidade de dados = valor do atributo + modificadores de dados
 * - Tamanho do dado determinado pelo grau de proficiência
 * - Se total ≤ 0: rola 2d e usa o menor (penalidade extrema)
 * - Máximo de 8 dados por teste
 *
 * @param totalDice - Total de dados calculado (attributeValue + modifiers)
 * @param dieSize - Tamanho do dado (determinado pelo grau)
 * @returns Objeto com fórmula de rolagem completa
 *
 * @example
 * calculateSkillRollFormula(3, 'd8');
 * // { diceCount: 3, dieSize: 'd8', isPenaltyRoll: false, formula: '3d8' }
 *
 * calculateSkillRollFormula(0, 'd6');
 * // { diceCount: 2, dieSize: 'd6', isPenaltyRoll: true, formula: '2d6 (menor)' }
 *
 * calculateSkillRollFormula(-1, 'd10');
 * // { diceCount: 2, dieSize: 'd10', isPenaltyRoll: true, formula: '2d10 (menor)' }
 */
export function calculateSkillRollFormula(
  totalDice: number,
  dieSize: DieSize
): SkillPoolFormula {
  // Penalidade extrema: se total ≤ 0, rola 2d e usa o menor
  if (totalDice <= 0) {
    return {
      diceCount: 2,
      dieSize,
      isPenaltyRoll: true,
      formula: formatPoolFormula(2, dieSize, true),
    };
  }

  // Aplicar limite máximo de dados
  const cappedDice = Math.min(totalDice, MAX_SKILL_DICE);

  return {
    diceCount: cappedDice,
    dieSize,
    isPenaltyRoll: false,
    formula: formatPoolFormula(cappedDice, dieSize, false),
  };
}

/**
 * Calcula pool de dados e fórmula completos de uma habilidade
 * Combina calculateSkillTotalModifier e calculateSkillRollFormula
 *
 * @param skillName - Nome da habilidade
 * @param keyAttribute - Atributo-chave atual
 * @param attributes - Objeto com todos os atributos do personagem
 * @param proficiencyLevel - Nível de proficiência
 * @param isSignature - Se é Habilidade de Assinatura
 * @param characterLevel - Nível do personagem
 * @param modifiers - Array de modificadores (+Xd / -Xd)
 * @param penaltyContext - Contexto de penalidades (sobrecarga, armadura, instrumento)
 * @returns Objeto com cálculo completo e fórmula de rolagem
 *
 * @example
 * const attributes = { agilidade: 3, corpo: 2, influencia: 2, mente: 2, essencia: 1, instinto: 1 };
 * calculateSkillRoll('acrobacia', 'agilidade', attributes, 'versado', false, 1);
 * // {
 * //   calculation: { attributeValue: 3, dieSize: 'd10', totalDice: 3, ... },
 * //   rollFormula: { diceCount: 3, dieSize: 'd10', formula: '3d10' }
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
  penaltyContext: Partial<SkillPenaltyContext> | boolean = {}
): {
  calculation: SkillPoolCalculation;
  rollFormula: SkillPoolFormula;
} {
  // Para habilidades especiais sem atributo definido (como "oficio" sem craft selecionado),
  // usar 0 como valor padrão
  const attributeValue =
    keyAttribute === 'especial' ? 0 : attributes[keyAttribute];

  // Calcular pool de dados
  const calculation = calculateSkillTotalModifier(
    skillName,
    keyAttribute,
    attributeValue,
    proficiencyLevel,
    isSignature,
    characterLevel,
    modifiers,
    penaltyContext
  );

  // Calcular fórmula de rolagem
  const rollFormula = calculateSkillRollFormula(
    calculation.totalDice,
    calculation.dieSize
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
 * Calcula a pool de dados para um uso customizado de habilidade
 *
 * Usa as mesmas regras que calculateSkillTotalModifier, mas com:
 * - Atributo-chave do uso customizado
 * - Bônus específico do uso em dados (+Xd)
 * - Mesma proficiência da habilidade base
 * - Mesma lógica de assinatura e penalidades
 *
 * @param skillUse - Uso customizado da habilidade
 * @param baseSkill - Habilidade base (para proficiência e assinatura)
 * @param attributes - Atributos do personagem
 * @param characterLevel - Nível do personagem (para bônus de assinatura)
 * @param penaltyContext - Contexto de penalidades (sobrecarga, armadura, instrumento)
 * @returns Total de modificadores de dados do uso customizado
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
  penaltyContext: Partial<SkillPenaltyContext> | boolean = {}
): number {
  // Compatibilidade: se recebeu boolean (antigo isOverloaded), converter para contexto
  const ctx: Partial<SkillPenaltyContext> =
    typeof penaltyContext === 'boolean'
      ? { isOverloaded: penaltyContext }
      : penaltyContext;

  // Valor do atributo customizado (0 para 'especial')
  const attributeValue =
    skillUse.keyAttribute === 'especial'
      ? 0
      : attributes[skillUse.keyAttribute];

  // Bônus de assinatura em dados (+Xd)
  let signatureDiceBonus = 0;
  if (baseSkill.isSignature) {
    signatureDiceBonus = calculateSignatureAbilityBonus(characterLevel);
  }

  // Combinar modificadores de dados: habilidade base + uso específico
  const allModifiers = [
    ...(baseSkill.modifiers || []),
    ...(skillUse.modifiers || []),
  ];

  // Somar modificadores de dados (+Xd/-Xd)
  const diceModifiers = allModifiers
    .filter((mod) => mod.affectsDice === true)
    .reduce((sum, mod) => sum + mod.value, 0);

  // Bônus específico do uso em dados (+Xd)
  const useBonus = skillUse.bonus;

  // Calcular penalidades usando função centralizada
  const penalties = calculateSkillPenalties(
    skillUse.skillName,
    baseSkill.proficiencyLevel,
    ctx
  );

  // Total de dados = atributo + assinatura + modificadores + bônus de uso + penalidades
  return (
    attributeValue +
    signatureDiceBonus +
    diceModifiers +
    useBonus +
    penalties.totalPenalty
  );
}

/**
 * Calcula a fórmula de rolagem para um uso customizado de habilidade
 *
 * @param skillUse - Uso customizado da habilidade
 * @param baseSkill - Habilidade base (para proficiência e assinatura)
 * @param attributes - Atributos do personagem
 * @param characterLevel - Nível do personagem (para bônus de assinatura)
 * @param penaltyContext - Contexto de penalidades (sobrecarga, armadura, instrumento)
 * @returns Fórmula de rolagem formatada (ex: "3d8", "2d6 (menor)")
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
  penaltyContext: Partial<SkillPenaltyContext> | boolean = {}
): string {
  const totalDice = calculateSkillUseModifier(
    skillUse,
    baseSkill,
    attributes,
    characterLevel,
    penaltyContext
  );

  const dieSize = getSkillDieSize(baseSkill.proficiencyLevel);

  // Penalidade extrema: se total ≤ 0, rola 2d e usa o menor
  if (totalDice <= 0) {
    return formatPoolFormula(2, dieSize, true);
  }

  const cappedDice = Math.min(totalDice, MAX_SKILL_DICE);
  return formatPoolFormula(cappedDice, dieSize, false);
}

/**
 * Detecta o tipo de armadura mais pesada equipada no inventário
 *
 * Percorre os itens do inventário procurando armaduras equipadas.
 * Se múltiplas estão equipadas, retorna a mais pesada (pesada > media > leve).
 * Itens com category === 'armadura' e equipped === true são considerados.
 * O armorType é detectado via customProperties.armorType ou pelo nome do item.
 *
 * @param items - Lista de itens do inventário
 * @returns Tipo da armadura mais pesada equipada, ou null se sem armadura
 */
export function getEquippedArmorType(items: InventoryItem[]): ArmorType | null {
  const armorPriority: Record<ArmorType, number> = {
    leve: 0,
    media: 1,
    pesada: 2,
  };

  let heaviestArmor: ArmorType | null = null;

  for (const item of items) {
    if (item.category !== 'protecoes' || !item.equipped) continue;

    // Tentar obter armorType de customProperties (onde Armor extends InventoryItem armazena)
    const armorType =
      (item.customProperties?.armorType as ArmorType) ||
      (item as unknown as { armorType?: ArmorType }).armorType;

    if (armorType && armorType in armorPriority) {
      if (
        heaviestArmor === null ||
        armorPriority[armorType] > armorPriority[heaviestArmor]
      ) {
        heaviestArmor = armorType;
      }
    }
  }

  return heaviestArmor;
}
