/**
 * Sense Calculations - Funções para cálculos relacionados a sentidos
 *
 * Este arquivo implementa cálculos para os usos de sentidos da habilidade Percepção:
 * - Farejar (associado a sentido aguçado de olfato)
 * - Observar (associado a sentido aguçado de visão)
 * - Ouvir (associado a sentido aguçado de audição)
 *
 * Sistema de pool de dados v0.0.2:
 * - Rola-se Xd(tamanho) onde X = atributo + modificadores de dados
 * - Resultados ≥ 6 = sucessos (✶), resultados = 1 cancelam 1 sucesso
 * - Os bônus de sentido aguçado adicionam dados à pool
 */

import type {
  Character,
  SenseType,
  KeenSense,
  Skill,
  Attributes,
  Modifier,
  DieSize,
} from '@/types';
import { calculateSkillTotalModifier } from './skillCalculations';
import { MAX_SKILL_DICE } from './diceRoller';

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
 * Resultado do cálculo de um sentido específico (pool de dados v0.0.2)
 */
export interface SenseCalculationResult {
  /** Nome do uso de Percepção (Farejar, Observar, Ouvir) */
  useName: string;
  /** Tipo de sentido associado */
  senseType: SenseType;
  /** Dados base da pool (do cálculo de Percepção) */
  baseDice: number;
  /** Bônus de dados de sentido aguçado da linhagem (+Xd) */
  keenSenseDiceBonus: number;
  /** Total de dados na pool */
  totalDice: number;
  /** Tamanho do dado (d6/d8/d10/d12) baseado na proficiência */
  dieSize: DieSize;
  /** Se rola 2d e pega o menor (pool efetiva ≤ 0) */
  isPenaltyRoll: boolean;
  /** Fórmula de rolagem formatada (ex: "3d8", "2d6 (menor)") */
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
 * Calcula a pool de dados para um uso de sentido específico (v0.0.2)
 *
 * Pool = atributo + modificadores de dados + sentido aguçado (+Xd)
 * Tamanho do dado = proficiência em Percepção (d6/d8/d10/d12)
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

  // 1. Obter atributo efetivo (pode ter override para este uso)
  const keyAttribute = perceptionSkill.keyAttribute;
  const overrideAttribute =
    perceptionSkill.defaultUseAttributeOverrides?.[useName];
  const effectiveAttribute = overrideAttribute || keyAttribute;
  const effectiveAttributeValue = attributes[effectiveAttribute];

  // 2. Combinar modificadores da habilidade base + específicos do uso
  const useModifiers =
    perceptionSkill.defaultUseModifierOverrides?.[useName] || [];
  const allModifiers: Modifier[] = [
    ...perceptionSkill.modifiers,
    ...useModifiers,
  ];

  // 3. Calcular pool base via sistema de pool v0.0.2
  const baseCalc = calculateSkillTotalModifier(
    'percepcao',
    effectiveAttribute,
    effectiveAttributeValue,
    perceptionSkill.proficiencyLevel,
    perceptionSkill.isSignature,
    characterLevel,
    allModifiers,
    isOverloaded
  );

  // 4. Obter bônus de sentido aguçado (+Xd extra)
  const keenSenseDiceBonus = getKeenSenseBonus(keenSenses, senseType);

  // 5. Calcular pool final
  const dieSize = baseCalc.dieSize;
  const baseDice = baseCalc.totalDice;
  const effectiveTotalDice = baseDice + keenSenseDiceBonus;

  // 6. Se pool ≤ 0, rola 2d e pega o menor
  if (effectiveTotalDice <= 0) {
    return {
      useName,
      senseType,
      baseDice,
      keenSenseDiceBonus,
      totalDice: 2,
      dieSize,
      isPenaltyRoll: true,
      formula: `2${dieSize} (menor)`,
    };
  }

  const totalDice = Math.min(effectiveTotalDice, MAX_SKILL_DICE);

  return {
    useName,
    senseType,
    baseDice,
    keenSenseDiceBonus,
    totalDice,
    dieSize,
    isPenaltyRoll: false,
    formula: `${totalDice}${dieSize}`,
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
