/**
 * Carry Capacity Calculations - Cálculos de Capacidade de Carga
 *
 * Funções utilitárias para calcular capacidade de carga do personagem,
 * estados de encumbrance, capacidade de empurrar/levantar, e peso de moedas.
 *
 * Fórmula base: 5 + (Força × 5) + sizeModifier + otherModifiers
 *
 * Estados de carga:
 * - Normal: peso ≤ capacidade máxima
 * - Sobrecarregado: peso > capacidade máxima E ≤ 2× capacidade máxima
 * - Imobilizado: peso > 2× capacidade máxima
 */

import type {
  CarryingCapacity,
  Currency,
  InventoryItem,
} from '@/types/inventory';
import type { CreatureSize } from '@/types/common';
import {
  BASE_CARRYING_CAPACITY,
  STRENGTH_CARRY_MULTIPLIER,
  COINS_WEIGHT_RATIO,
} from '@/types/inventory';
import { SIZE_MODIFIERS } from '@/constants/lineage';

/**
 * Estado de carga do personagem
 */
export type EncumbranceState = 'normal' | 'sobrecarregado' | 'imobilizado';

/**
 * Resultado completo do cálculo de capacidade de carga
 */
export interface CarryCapacityResult {
  /** Capacidade base (5 + Força × 5) */
  base: number;
  /** Modificador de tamanho aplicado */
  sizeModifier: number;
  /** Outros modificadores (itens, habilidades, etc.) */
  otherModifiers: number;
  /** Capacidade total máxima */
  total: number;
  /** Capacidade de empurrar (2× total) */
  pushCapacity: number;
  /** Capacidade de levantar (0.5× total, arredondado para baixo) */
  liftCapacity: number;
}

/**
 * Calcula a capacidade de carga base
 *
 * Fórmula: 5 + (Força × 5)
 *
 * @param forca - Valor do atributo Força (0-5, podendo exceder)
 * @returns Capacidade de carga base
 */
export function calculateBaseCarryCapacity(forca: number): number {
  return BASE_CARRYING_CAPACITY + forca * STRENGTH_CARRY_MULTIPLIER;
}

/**
 * Obtém o modificador de capacidade de carga baseado no tamanho
 *
 * @param size - Tamanho da criatura
 * @returns Modificador aditivo de capacidade
 */
export function getSizeCarryModifier(size: CreatureSize): number {
  const modifiers = SIZE_MODIFIERS[size];
  return modifiers?.carryingCapacity ?? 0;
}

/**
 * Calcula a capacidade de carga total
 *
 * Fórmula: 5 + (Força × 5) + sizeModifier + otherModifiers
 *
 * @param forca - Valor do atributo Força
 * @param sizeModifier - Modificador de tamanho (aditivo)
 * @param otherModifiers - Outros modificadores (itens, habilidades)
 * @returns Capacidade de carga total
 */
export function calculateCarryCapacity(
  forca: number,
  sizeModifier: number = 0,
  otherModifiers: number = 0
): number {
  const base = calculateBaseCarryCapacity(forca);
  return Math.max(0, Math.floor(base + sizeModifier + otherModifiers));
}

/**
 * Calcula a capacidade de empurrar
 *
 * Regra: 2× a capacidade máxima
 *
 * @param maxCapacity - Capacidade de carga máxima
 * @returns Capacidade de empurrar
 */
export function calculatePushCapacity(maxCapacity: number): number {
  return Math.floor(maxCapacity * 2);
}

/**
 * Calcula a capacidade de levantar
 *
 * Regra: 0.5× a capacidade máxima (arredondado para baixo)
 *
 * @param maxCapacity - Capacidade de carga máxima
 * @returns Capacidade de levantar
 */
export function calculateLiftCapacity(maxCapacity: number): number {
  return Math.floor(maxCapacity * 0.5);
}

/**
 * Determina o estado de carga do personagem
 *
 * Estados:
 * - Normal: peso ≤ capacidade máxima
 * - Sobrecarregado: peso > capacidade máxima E ≤ 2× capacidade máxima
 * - Imobilizado: peso > 2× capacidade máxima
 *
 * @param currentWeight - Peso atualmente carregado
 * @param maxCapacity - Capacidade de carga máxima
 * @returns Estado de carga atual
 */
export function getEncumbranceState(
  currentWeight: number,
  maxCapacity: number
): EncumbranceState {
  if (maxCapacity <= 0) {
    return currentWeight > 0 ? 'imobilizado' : 'normal';
  }

  if (currentWeight <= maxCapacity) {
    return 'normal';
  }

  if (currentWeight <= maxCapacity * 2) {
    return 'sobrecarregado';
  }

  return 'imobilizado';
}

/**
 * Calcula o peso total das moedas físicas
 *
 * Regra: 100 moedas = 1 peso
 *
 * @param currency - Dados de moedas do personagem
 * @returns Peso das moedas físicas
 */
export function calculateCoinsWeight(currency: Currency): number {
  const totalCoins =
    currency.physical.cobre +
    currency.physical.ouro +
    currency.physical.platina;

  // 100 moedas = 1 peso
  return Math.floor(totalCoins / COINS_WEIGHT_RATIO);
}

/**
 * Calcula o peso total dos itens do inventário
 *
 * @param items - Lista de itens do inventário
 * @param includeEquipped - Se deve incluir itens equipados (padrão: true)
 * @returns Peso total dos itens
 */
export function calculateItemsWeight(
  items: InventoryItem[],
  includeEquipped: boolean = true
): number {
  return items.reduce((total, item) => {
    // Se não deve incluir equipados e o item está equipado, pula
    if (!includeEquipped && item.equipped) {
      return total;
    }

    return total + item.weight * item.quantity;
  }, 0);
}

/**
 * Calcula o peso total carregado (itens + moedas físicas)
 *
 * @param items - Lista de itens do inventário
 * @param currency - Dados de moedas do personagem
 * @returns Peso total carregado
 */
export function calculateTotalWeight(
  items: InventoryItem[],
  currency: Currency
): number {
  const itemsWeight = calculateItemsWeight(items);
  const coinsWeight = calculateCoinsWeight(currency);

  return itemsWeight + coinsWeight;
}

/**
 * Calcula a capacidade de carga completa do personagem
 *
 * @param forca - Valor do atributo Força
 * @param size - Tamanho da criatura
 * @param otherModifiers - Outros modificadores
 * @returns Resultado completo do cálculo
 */
export function calculateFullCarryCapacity(
  forca: number,
  size: CreatureSize,
  otherModifiers: number = 0
): CarryCapacityResult {
  const base = calculateBaseCarryCapacity(forca);
  const sizeModifier = getSizeCarryModifier(size);
  const total = calculateCarryCapacity(forca, sizeModifier, otherModifiers);

  return {
    base,
    sizeModifier,
    otherModifiers,
    total,
    pushCapacity: calculatePushCapacity(total),
    liftCapacity: calculateLiftCapacity(total),
  };
}

/**
 * Gera um objeto CarryingCapacity completo para o personagem
 *
 * @param forca - Valor do atributo Força
 * @param size - Tamanho da criatura
 * @param items - Lista de itens do inventário
 * @param currency - Dados de moedas do personagem
 * @param otherModifiers - Outros modificadores
 * @returns Objeto CarryingCapacity completo
 */
export function generateCarryingCapacity(
  forca: number,
  size: CreatureSize,
  items: InventoryItem[],
  currency: Currency,
  otherModifiers: number = 0
): CarryingCapacity {
  const base = calculateBaseCarryCapacity(forca);
  const sizeModifier = getSizeCarryModifier(size);
  const total = calculateCarryCapacity(forca, sizeModifier, otherModifiers);
  const currentWeight = calculateTotalWeight(items, currency);

  return {
    base,
    modifiers: sizeModifier + otherModifiers,
    total,
    currentWeight,
    encumbranceState: getEncumbranceState(currentWeight, total),
    pushLimit: calculatePushCapacity(total),
    liftLimit: calculateLiftCapacity(total),
  };
}

/**
 * Descrições dos estados de carga
 */
export const ENCUMBRANCE_STATE_DESCRIPTIONS: Record<EncumbranceState, string> =
  {
    normal: 'Peso normal - sem penalidades',
    sobrecarregado:
      'Sobrecarregado - deslocamento reduzido pela metade, desvantagem em testes físicos',
    imobilizado: 'Imobilizado - incapaz de se mover',
  } as const;

/**
 * Cores semânticas para estados de carga (para UI)
 */
export const ENCUMBRANCE_STATE_COLORS: Record<
  EncumbranceState,
  'success' | 'warning' | 'error'
> = {
  normal: 'success',
  sobrecarregado: 'warning',
  imobilizado: 'error',
} as const;

/**
 * Calcula a porcentagem de carga atual
 *
 * @param currentWeight - Peso atual
 * @param maxCapacity - Capacidade máxima
 * @returns Porcentagem de carga (0-100+)
 */
export function calculateCarryPercentage(
  currentWeight: number,
  maxCapacity: number
): number {
  if (maxCapacity <= 0) {
    return currentWeight > 0 ? 100 : 0;
  }

  return Math.round((currentWeight / maxCapacity) * 100);
}

/**
 * Verifica se o personagem pode carregar um peso adicional
 *
 * @param currentWeight - Peso atual
 * @param additionalWeight - Peso a adicionar
 * @param maxCapacity - Capacidade máxima
 * @returns true se pode carregar sem ficar sobrecarregado
 */
export function canCarryWithoutPenalty(
  currentWeight: number,
  additionalWeight: number,
  maxCapacity: number
): boolean {
  return currentWeight + additionalWeight <= maxCapacity;
}

/**
 * Verifica se o personagem pode carregar um peso adicional (incluindo sobrecarregado)
 *
 * @param currentWeight - Peso atual
 * @param additionalWeight - Peso a adicionar
 * @param maxCapacity - Capacidade máxima
 * @returns true se pode carregar (mesmo sobrecarregado), false se ficaria imobilizado
 */
export function canCarryAtAll(
  currentWeight: number,
  additionalWeight: number,
  maxCapacity: number
): boolean {
  return currentWeight + additionalWeight <= maxCapacity * 2;
}
