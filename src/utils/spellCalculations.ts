/**
 * Cálculos relacionados a feitiços e magia
 *
 * Funções utilitárias para calcular ND, bônus de ataque e chance de aprendizado
 * de feitiços conforme as regras do Tabuleiro do Caos RPG.
 */

import {
  SPELL_BASE_DC,
  SPELL_LEARNING_CIRCLE_MODIFIER,
  SPELL_LEARNING_MIN_CHANCE,
  SPELL_LEARNING_MAX_CHANCE,
  type SpellCircle,
} from '@/constants/spells';

/**
 * Calcula o ND (Nível de Dificuldade) de feitiços
 *
 * Fórmula: 12 + Essência + Modificador da Habilidade + Bônus de ND
 *
 * @param essenciaValue - Valor do atributo Essência
 * @param skillModifier - Modificador total da habilidade de conjuração (Arcano, Natureza ou Religião)
 * @param dcBonus - Bônus adicional ao ND (padrão: 0)
 * @returns ND calculado
 *
 * @example
 * // Personagem com Essência 3, Arcano +6, sem bônus
 * calculateSpellDC(3, 6, 0) // retorna 21 (12 + 3 + 6 + 0)
 */
export function calculateSpellDC(
  essenciaValue: number,
  skillModifier: number,
  dcBonus: number = 0
): number {
  return SPELL_BASE_DC + essenciaValue + skillModifier + dcBonus;
}

/**
 * Calcula o Bônus de Ataque de feitiços
 *
 * Fórmula: Essência + Modificador da Habilidade + Bônus de Ataque
 *
 * @param essenciaValue - Valor do atributo Essência
 * @param skillModifier - Modificador total da habilidade de conjuração
 * @param attackBonus - Bônus adicional ao ataque (padrão: 0)
 * @returns Bônus de ataque calculado
 *
 * @example
 * // Personagem com Essência 3, Religião +4, sem bônus
 * calculateSpellAttackBonus(3, 4, 0) // retorna 7 (3 + 4 + 0)
 */
export function calculateSpellAttackBonus(
  essenciaValue: number,
  skillModifier: number,
  attackBonus: number = 0
): number {
  return essenciaValue + skillModifier + attackBonus;
}

/**
 * Calcula a chance de aprendizado de um feitiço
 *
 * Fórmula base: (Mente × 5) + Modificador da Habilidade + Modificador do Círculo + Outros Modificadores
 * Resultado sempre entre 1% e 99%
 *
 * Modificadores por círculo:
 * - 1º: +30 (ou +0 se for o primeiro feitiço do personagem)
 * - 2º: +10
 * - 3º: 0
 * - 4º: -10
 * - 5º: -20
 * - 6º: -30
 * - 7º: -50
 * - 8º: -70
 *
 * @param menteValue - Valor do atributo Mente
 * @param skillModifier - Modificador total da habilidade de conjuração
 * @param circle - Círculo do feitiço (1 a 8)
 * @param isFirstSpell - Se é o primeiro feitiço do personagem (afeta bônus do 1º círculo)
 * @param knownSpellsModifier - Modificador baseado no número de feitiços conhecidos
 * @param matrixModifier - Modificador por domínio de matriz
 * @param otherModifiers - Outros modificadores diversos
 * @returns Chance de aprendizado entre 1% e 99%
 *
 * @example
 * // Primeiro feitiço, Mente 2, Arcano +4, 1º círculo
 * calculateSpellLearningChance(2, 4, 1, true) // retorna 14 (2×5 + 4 + 0)
 *
 * @example
 * // Segundo feitiço, Mente 3, Natureza +6, 2º círculo
 * calculateSpellLearningChance(3, 6, 2, false) // retorna 31 (3×5 + 6 + 10)
 */
export function calculateSpellLearningChance(
  menteValue: number,
  skillModifier: number,
  circle: SpellCircle,
  isFirstSpell: boolean = false,
  knownSpellsModifier: number = 0,
  matrixModifier: number = 0,
  otherModifiers: number = 0
): number {
  // Valor base: Mente × 5
  const baseValue = menteValue * 5;

  // Modificador do círculo (1º círculo é +0 se for o primeiro feitiço)
  const circleModifier =
    circle === 1 && isFirstSpell ? 0 : SPELL_LEARNING_CIRCLE_MODIFIER[circle];

  // Soma total
  const totalChance =
    baseValue +
    skillModifier +
    circleModifier +
    knownSpellsModifier +
    matrixModifier +
    otherModifiers;

  // Limita entre 1% e 99%
  return Math.max(
    SPELL_LEARNING_MIN_CHANCE,
    Math.min(SPELL_LEARNING_MAX_CHANCE, totalChance)
  );
}

/**
 * Calcula o custo total em PP de um feitiço considerando círculo e modificadores
 *
 * @param circleCost - Custo base do círculo (conforme SPELL_CIRCLE_PP_COST)
 * @param additionalCost - Custo adicional (ex: metamágica, aprimoramentos)
 * @returns Custo total em PP
 *
 * @example
 * // Feitiço de 3º círculo (custo 3) sem modificadores
 * calculateSpellPPCost(3, 0) // retorna 3
 *
 * @example
 * // Feitiço de 5º círculo (custo 7) com +2 PP de metamágica
 * calculateSpellPPCost(7, 2) // retorna 9
 */
export function calculateSpellPPCost(
  circleCost: number,
  additionalCost: number = 0
): number {
  return Math.max(0, circleCost + additionalCost);
}
