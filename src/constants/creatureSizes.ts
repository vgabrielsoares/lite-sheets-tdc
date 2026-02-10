/**
 * Creature Sizes - Constantes e utilitários para tamanhos de criatura (v0.0.2)
 *
 * Re-exporta tipos e constantes de lineage.ts e adiciona helpers específicos
 * para o sistema de tamanho v0.0.2 (modificadores em dados).
 *
 * @module constants/creatureSizes
 */

// Re-export all size-related types and constants from lineage
export {
  CREATURE_SIZES,
  SIZE_LABELS,
  SIZE_DESCRIPTIONS,
  SIZE_MODIFIERS,
  getSizeModifiers,
  formatMeleeDamage,
} from './lineage';

export type { SizeModifiers } from './lineage';

import { getSizeModifiers } from './lineage';
import type { CreatureSize } from '@/types/common';

/**
 * Retorna o modificador de Guarda (GA) baseado no tamanho.
 * Valor fixo adicionado/subtraído do GA máximo.
 *
 * @param size - Tamanho da criatura
 * @returns Modificador de GA
 */
export function getGuardModifierForSize(size: CreatureSize): number {
  return getSizeModifiers(size).guard;
}

/**
 * Retorna o modificador de dados para uma habilidade baseado no tamanho.
 * v0.0.2: Os modificadores são em dados (+Xd/-Xd), adicionados ao pool.
 *
 * @param size - Tamanho da criatura
 * @param skill - Nome da habilidade (acrobacia, atletismo, furtividade, reflexo, tenacidade)
 * @returns Modificador de dados (positivo = +Xd, negativo = -Xd, 0 = sem modificador)
 */
export function getSkillDiceModifierForSize(
  size: CreatureSize,
  skill: 'acrobacia' | 'atletismo' | 'furtividade' | 'reflexo' | 'tenacidade'
): number {
  const modifiers = getSizeModifiers(size);
  return modifiers.skillModifiers[skill] ?? 0;
}

/**
 * Retorna o modificador de dados para manobras de combate.
 *
 * @param size - Tamanho da criatura
 * @returns Modificador de dados para manobras
 */
export function getCombatManeuverModifier(size: CreatureSize): number {
  return getSizeModifiers(size).combatManeuvers;
}

/**
 * Retorna o modificador de dados para rastreio.
 *
 * @param size - Tamanho da criatura
 * @returns Modificador de dados para rastreio
 */
export function getTrackingModifier(size: CreatureSize): number {
  return getSizeModifiers(size).trackingDC;
}

/**
 * Retorna o modificador aditivo de espaço de carga.
 * Somado à fórmula base: 5 + Corpo × 5
 *
 * @param size - Tamanho da criatura
 * @returns Modificador aditivo de espaço
 */
export function getCarryingCapacityModifier(size: CreatureSize): number {
  return getSizeModifiers(size).carryingCapacity;
}

/**
 * Formata um modificador de dados para exibição
 * Ex: 2 → "+2d", -1 → "-1d", 0 → "0d"
 */
export function formatDiceModifier(value: number): string {
  if (value === 0) return '0d';
  return value > 0 ? `+${value}d` : `${value}d`;
}
