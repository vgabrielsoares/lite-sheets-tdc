/**
 * Proficiency Calculations - Cálculos relacionados a proficiências de habilidades
 *
 * Este arquivo contém funções para calcular e validar proficiências de habilidades
 * conforme as regras do sistema:
 * - Proficiências disponíveis = 3 + valor de Mente (retroativo)
 * - Apenas habilidades não-Leigo contam como proficiências adquiridas
 * - Sistema deve validar que não se exceda o limite
 */

import type { Skills, ProficiencyLevel } from '@/types';
import { SKILL_LIST, BASE_PROFICIENT_SKILLS } from '@/types/skills';

/**
 * Calcula o número máximo de proficiências disponíveis
 *
 * Regra: 3 + valor do atributo Mente (retroativo)
 *
 * @param menteValue - Valor do atributo Mente
 * @returns Número máximo de proficiências
 *
 * @example
 * calculateMaxProficiencies(1); // 4 (3 base + 1 de Mente)
 * calculateMaxProficiencies(3); // 6 (3 base + 3 de Mente)
 * calculateMaxProficiencies(0); // 3 (mínimo, mesmo com Mente 0)
 */
export function calculateMaxProficiencies(menteValue: number): number {
  return BASE_PROFICIENT_SKILLS + Math.max(0, menteValue);
}

/**
 * Conta quantas proficiências foram adquiridas
 *
 * Proficiências adquiridas = habilidades com nível diferente de 'leigo' + níveis de sorte
 *
 * @param skills - Todas as habilidades do personagem
 * @param luckLevel - Nível de sorte do personagem (cada nível conta como 1 proficiência)
 * @returns Número de proficiências adquiridas
 *
 * @example
 * const skills = {
 *   acerto: { proficiencyLevel: 'adepto', ... },
 *   acrobacia: { proficiencyLevel: 'leigo', ... },
 *   atletismo: { proficiencyLevel: 'versado', ... },
 *   // ...
 * };
 * countAcquiredProficiencies(skills, 2); // 4 (acerto + atletismo + 2 níveis de sorte)
 */
export function countAcquiredProficiencies(
  skills: Skills,
  luckLevel: number = 0
): number {
  const skillProficiencies = SKILL_LIST.reduce((count, skillName) => {
    const skill = skills[skillName];
    return skill.proficiencyLevel !== 'leigo' ? count + 1 : count;
  }, 0);

  // Cada nível de sorte conta como uma proficiência alocada
  return skillProficiencies + luckLevel;
}

/**
 * Valida se é possível adicionar mais uma proficiência
 *
 * @param skills - Todas as habilidades do personagem
 * @param menteValue - Valor do atributo Mente
 * @param luckLevel - Nível de sorte do personagem
 * @returns true se ainda há espaço para mais proficiências
 *
 * @example
 * canAddProficiency(skills, 2, 1); // true se tiver menos de 5 proficiências (incluindo sorte)
 */
export function canAddProficiency(
  skills: Skills,
  menteValue: number,
  luckLevel: number = 0
): boolean {
  const maxProficiencies = calculateMaxProficiencies(menteValue);
  const acquiredProficiencies = countAcquiredProficiencies(skills, luckLevel);
  return acquiredProficiencies < maxProficiencies;
}

/**
 * Valida se o número de proficiências está dentro do limite
 *
 * @param skills - Todas as habilidades do personagem
 * @param menteValue - Valor do atributo Mente
 * @param luckLevel - Nível de sorte do personagem
 * @returns true se o número de proficiências não excede o permitido
 *
 * @example
 * validateProficienciesLimit(skills, 2, 1); // true se <= 5 proficiências (incluindo sorte)
 */
export function validateProficienciesLimit(
  skills: Skills,
  menteValue: number,
  luckLevel: number = 0
): boolean {
  const maxProficiencies = calculateMaxProficiencies(menteValue);
  const acquiredProficiencies = countAcquiredProficiencies(skills, luckLevel);
  return acquiredProficiencies <= maxProficiencies;
}

/**
 * Calcula quantas proficiências ainda estão disponíveis
 *
 * @param skills - Todas as habilidades do personagem
 * @param menteValue - Valor do atributo Mente
 * @param luckLevel - Nível de sorte do personagem
 * @returns Número de proficiências restantes
 *
 * @example
 * getRemainingProficiencies(skills, 2, 1); // Ex: 1 (se tem 4 de 5 usadas, incluindo sorte)
 */
export function getRemainingProficiencies(
  skills: Skills,
  menteValue: number,
  luckLevel: number = 0
): number {
  const maxProficiencies = calculateMaxProficiencies(menteValue);
  const acquiredProficiencies = countAcquiredProficiencies(skills, luckLevel);
  return Math.max(0, maxProficiencies - acquiredProficiencies);
}

/**
 * Calcula informações completas sobre proficiências
 *
 * @param skills - Todas as habilidades do personagem
 * @param menteValue - Valor do atributo Mente
 * @param luckLevel - Nível de sorte do personagem
 * @returns Objeto com informações completas
 *
 * @example
 * const info = getProficiencyInfo(skills, 2, 1);
 * // {
 * //   max: 5,
 * //   acquired: 4, // 3 habilidades + 1 nível de sorte
 * //   remaining: 1,
 * //   canAdd: true,
 * //   isValid: true
 * // }
 */
export function getProficiencyInfo(
  skills: Skills,
  menteValue: number,
  luckLevel: number = 0
) {
  const max = calculateMaxProficiencies(menteValue);
  const acquired = countAcquiredProficiencies(skills, luckLevel);
  const remaining = Math.max(0, max - acquired);
  const canAdd = acquired < max;
  const isValid = acquired <= max;

  return {
    max,
    acquired,
    remaining,
    canAdd,
    isValid,
  };
}

/**
 * Conta proficiências por nível
 *
 * @param skills - Todas as habilidades do personagem
 * @returns Objeto com contagem por nível
 *
 * @example
 * const counts = countProficienciesByLevel(skills);
 * // { leigo: 28, adepto: 3, versado: 1, mestre: 1 }
 */
export function countProficienciesByLevel(
  skills: Skills
): Record<ProficiencyLevel, number> {
  const counts: Record<ProficiencyLevel, number> = {
    leigo: 0,
    adepto: 0,
    versado: 0,
    mestre: 0,
  };

  SKILL_LIST.forEach((skillName) => {
    const skill = skills[skillName];
    counts[skill.proficiencyLevel]++;
  });

  return counts;
}
