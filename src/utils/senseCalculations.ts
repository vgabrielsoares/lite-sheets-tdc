/**
 * Sense Calculations - Funções para cálculos relacionados a sentidos
 *
 * Este arquivo implementa cálculos para os usos de sentidos da habilidade Percepção:
 * - Farejar (associado a sentido aguçado de olfato)
 * - Observar (associado a sentido aguçado de visão)
 * - Ouvir (associado a sentido aguçado de audição)
 *
 * Os bônus de sentido aguçado da linhagem são somados automaticamente
 * aos modificadores desses usos específicos da Percepção.
 */

import type {
  Character,
  SenseType,
  KeenSense,
  Skill,
  Attributes,
  Modifier,
} from '@/types';
import { calculateSkillTotalModifier } from './skillCalculations';

/**
 * Mapeamento de usos de Percepção para tipos de sentido aguçado
 */
export const PERCEPTION_USE_TO_SENSE: Record<string, SenseType> = {
  Farejar: 'olfato',
  Observar: 'visao',
  Ouvir: 'audicao',
} as const;

/**
 * Mapeamento de tipos de sentido para usos de Percepção
 */
export const SENSE_TO_PERCEPTION_USE: Record<SenseType, string> = {
  olfato: 'Farejar',
  visao: 'Observar',
  audicao: 'Ouvir',
} as const;

/**
 * Resultado do cálculo de um sentido específico
 */
export interface SenseCalculationResult {
  /** Nome do uso de Percepção (Farejar, Observar, Ouvir) */
  useName: string;
  /** Tipo de sentido associado */
  senseType: SenseType;
  /** Modificador base da habilidade Percepção */
  baseModifier: number;
  /** Bônus de sentido aguçado da linhagem */
  keenSenseBonus: number;
  /** Outros modificadores específicos do uso */
  otherModifiers: number;
  /** Modificador total final */
  totalModifier: number;
  /** Quantidade de dados para rolagem */
  diceCount: number;
  /** Se pega o menor resultado (atributo 0) */
  takeLowest: boolean;
  /** Fórmula de rolagem formatada */
  formula: string;
}

/**
 * Obtém o bônus de sentido aguçado para um tipo específico
 *
 * @param keenSenses - Array de sentidos aguçados do personagem
 * @param senseType - Tipo de sentido a buscar
 * @returns Bônus do sentido aguçado (0 se não tiver)
 */
export function getKeenSenseBonus(
  keenSenses: KeenSense[] | undefined,
  senseType: SenseType
): number {
  if (!keenSenses || keenSenses.length === 0) return 0;

  const sense = keenSenses.find((s) => s.type === senseType);
  return sense?.bonus || 0;
}

/**
 * Calcula o modificador total para um uso de sentido específico
 *
 * Fórmula: Modificador de Percepção + Bônus de Sentido Aguçado + Outros Modificadores
 *
 * @param useName - Nome do uso (Farejar, Observar, Ouvir)
 * @param perceptionSkill - Dados da habilidade Percepção
 * @param attributes - Atributos do personagem
 * @param characterLevel - Nível do personagem
 * @param keenSenses - Sentidos aguçados da linhagem
 * @param isOverloaded - Se o personagem está sobrecarregado
 * @returns Resultado completo do cálculo
 */
export function calculateSenseModifier(
  useName: 'Farejar' | 'Observar' | 'Ouvir',
  perceptionSkill: Skill,
  attributes: Attributes,
  characterLevel: number,
  keenSenses: KeenSense[] | undefined,
  isOverloaded: boolean = false
): SenseCalculationResult {
  const senseType = PERCEPTION_USE_TO_SENSE[useName];

  // 1. Calcular modificador base da Percepção
  const keyAttribute = perceptionSkill.keyAttribute;
  const attributeValue = attributes[keyAttribute];

  // Verificar se há override de atributo para este uso específico
  const overrideAttribute =
    perceptionSkill.defaultUseAttributeOverrides?.[useName];
  const effectiveAttribute = overrideAttribute || keyAttribute;
  const effectiveAttributeValue = attributes[effectiveAttribute];

  // Verificar se há modificadores específicos para este uso
  const useModifiers =
    perceptionSkill.defaultUseModifierOverrides?.[useName] || [];

  // Combinar com modificadores da habilidade base
  const allSkillModifiers = [...perceptionSkill.modifiers, ...useModifiers];

  // IMPORTANTE: Separar modificadores numéricos e de dados
  // Modificadores de dados (affectsDice: true) afetam apenas a quantidade de d20
  // Modificadores numéricos afetam o bônus adicionado ao resultado
  const valueModifiers = allSkillModifiers.filter((mod) => !mod.affectsDice);
  const diceModifiers = allSkillModifiers.filter(
    (mod) => mod.affectsDice === true
  );

  const baseCalc = calculateSkillTotalModifier(
    'percepcao',
    effectiveAttribute,
    effectiveAttributeValue,
    perceptionSkill.proficiencyLevel,
    perceptionSkill.isSignature,
    characterLevel,
    valueModifiers, // Apenas modificadores numéricos
    isOverloaded
  );

  // 2. Obter bônus de sentido aguçado
  const keenSenseBonus = getKeenSenseBonus(keenSenses, senseType);

  // 3. Calcular modificador total (numérico apenas)
  const totalModifier = baseCalc.totalModifier + keenSenseBonus;

  // 4. Calcular quantidade de dados
  // Modificadores de dados afetam a quantidade de d20
  const diceModifiersTotal = diceModifiers.reduce(
    (sum, mod) => sum + (mod.value || 0),
    0
  );

  const realDiceCount = effectiveAttributeValue + diceModifiersTotal;

  let finalDiceCount: number;
  let takeLowest: boolean;

  if (realDiceCount < 1) {
    finalDiceCount = 2 - realDiceCount;
    takeLowest = true;
  } else {
    finalDiceCount = realDiceCount;
    takeLowest = false;
  }

  // 5. Gerar fórmula
  let formula = `${finalDiceCount}d20`;
  if (totalModifier > 0) {
    formula += `+${totalModifier}`;
  } else if (totalModifier < 0) {
    formula += `${totalModifier}`;
  }

  return {
    useName,
    senseType,
    baseModifier: baseCalc.totalModifier,
    keenSenseBonus,
    otherModifiers: 0,
    totalModifier,
    diceCount: finalDiceCount,
    takeLowest,
    formula,
  };
}

/**
 * Calcula todos os três sentidos de Percepção para um personagem
 *
 * @param character - Personagem completo
 * @param isOverloaded - Se o personagem está sobrecarregado
 * @returns Array com os três cálculos de sentidos
 */
export function calculateAllSenses(
  character: Character,
  isOverloaded: boolean = false
): SenseCalculationResult[] {
  const perceptionSkill = character.skills.percepcao;
  const keenSenses = character.senses?.keenSenses || [];

  return (['Farejar', 'Observar', 'Ouvir'] as const).map((useName) =>
    calculateSenseModifier(
      useName,
      perceptionSkill,
      character.attributes,
      character.level,
      keenSenses,
      isOverloaded
    )
  );
}

/**
 * Labels em português para os usos de sentidos
 */
export const SENSE_USE_LABELS: Record<string, string> = {
  Farejar: 'Farejar',
  Observar: 'Observar',
  Ouvir: 'Ouvir',
} as const;

/**
 * Ícones para cada tipo de sentido
 * Usado para exibição na interface
 */
export const SENSE_ICONS: Record<SenseType, string> = {
  olfato: '👃',
  visao: '👁️',
  audicao: '👂',
} as const;
