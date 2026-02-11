/**
 * Durability Calculations - Funções utilitárias para durabilidade de itens
 *
 * Sistema de durabilidade v0.0.2:
 * - Durabilidade representada por um dado (d2 a d100)
 * - Teste: rolar o dado atual
 *   - Resultado = 1: item danificado, dado desce um passo
 *   - Resultado ≥ 2: nada acontece
 * - Quando dado d2 falha (resultado 1): item quebrado
 *
 * Reutiliza a escala de dados de recurso (RESOURCE_DIE_SCALE).
 */

import type { DiceType } from '@/types/common';
import type {
  ItemDurability,
  DurabilityState,
  DurabilityTestResult,
} from '@/types/inventory';
import {
  RESOURCE_DIE_SCALE,
  RESOURCE_DIE_SIDES,
  getResourceDieIndex,
} from '@/types/resources';

// ============================================================================
// Constantes
// ============================================================================

/** Dados disponíveis para durabilidade (subset comum) */
export const DURABILITY_DIE_OPTIONS: readonly DiceType[] = [
  'd2',
  'd4',
  'd6',
  'd8',
  'd10',
  'd12',
  'd20',
  'd100',
] as const;

// ============================================================================
// Funções de Criação
// ============================================================================

/**
 * Cria durabilidade padrão para um item (intacto, dado máximo)
 */
export function createItemDurability(maxDie: DiceType): ItemDurability {
  return {
    currentDie: maxDie,
    maxDie,
    state: 'intacto',
  };
}

// ============================================================================
// Funções de Cálculo
// ============================================================================

/**
 * Determina o estado de durabilidade com base no dado atual vs máximo.
 *
 * - intacto: dado atual === dado máximo
 * - danificado: dado atual < dado máximo mas > d2
 * - quebrado: dado atual é d2 e falhou, ou já marcado como quebrado
 */
export function getDurabilityState(
  durability: ItemDurability
): DurabilityState {
  return durability.state;
}

/**
 * Calcula a porcentagem de durabilidade (para barras de progresso).
 * Retorna 0 a 100.
 */
export function getDurabilityPercent(durability: ItemDurability): number {
  if (durability.state === 'quebrado') return 0;
  if (durability.state === 'intacto') return 100;

  const currentIndex = getResourceDieIndex(durability.currentDie);
  const maxIndex = getResourceDieIndex(durability.maxDie);

  if (maxIndex === 0) return 100;

  return Math.round((currentIndex / maxIndex) * 100);
}

/**
 * Step-down do dado de durabilidade.
 * Retorna o dado anterior na escala, ou null se já estava no d2.
 */
function stepDownDurabilityDie(currentDie: DiceType): DiceType | null {
  const currentIndex = getResourceDieIndex(currentDie);
  if (currentIndex <= 0) return null;
  return RESOURCE_DIE_SCALE[currentIndex - 1];
}

/**
 * Processa um teste de durabilidade.
 *
 * @param durability - Estado atual de durabilidade do item
 * @param rollValue - Valor rolado no dado (1 a N)
 * @returns Resultado do teste com novo estado
 */
export function testDurability(
  durability: ItemDurability,
  rollValue: number
): DurabilityTestResult {
  const previousDie = durability.currentDie;

  // Item já quebrado - não pode testar
  if (durability.state === 'quebrado') {
    return {
      roll: rollValue,
      damaged: false,
      previousDie,
      newDie: previousDie,
      newState: 'quebrado',
    };
  }

  // Resultado ≥ 2: nada acontece
  if (rollValue >= 2) {
    return {
      roll: rollValue,
      damaged: false,
      previousDie,
      newDie: previousDie,
      newState: durability.state,
    };
  }

  // Resultado = 1: item danificado
  const newDie = stepDownDurabilityDie(previousDie);

  if (newDie === null) {
    // Estava no d2 e falhou → quebrado
    return {
      roll: 1,
      damaged: true,
      previousDie,
      newDie: previousDie, // mantém d2 mas estado muda
      newState: 'quebrado',
    };
  }

  // Dado desce um passo → danificado
  return {
    roll: 1,
    damaged: true,
    previousDie,
    newDie,
    newState: 'danificado',
  };
}

/**
 * Aplica o resultado de um teste de durabilidade a um ItemDurability.
 * Retorna o novo estado de durabilidade.
 */
export function applyDurabilityTestResult(
  durability: ItemDurability,
  result: DurabilityTestResult
): ItemDurability {
  return {
    ...durability,
    currentDie: result.newDie,
    state: result.newState,
  };
}

/**
 * Repara um item, restaurando o dado ao máximo.
 */
export function repairItem(durability: ItemDurability): ItemDurability {
  return {
    currentDie: durability.maxDie,
    maxDie: durability.maxDie,
    state: 'intacto',
  };
}

/**
 * Rola o dado de durabilidade (gera valor aleatório 1 a N lados).
 */
export function rollDurabilityDie(die: DiceType): number {
  const sides = RESOURCE_DIE_SIDES[die];
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Retorna a cor semântica para o estado de durabilidade.
 */
export function getDurabilityColor(
  state: DurabilityState
): 'success' | 'warning' | 'error' {
  switch (state) {
    case 'intacto':
      return 'success';
    case 'danificado':
      return 'warning';
    case 'quebrado':
      return 'error';
  }
}

/**
 * Retorna o label em português para o estado de durabilidade.
 */
export function getDurabilityLabel(state: DurabilityState): string {
  switch (state) {
    case 'intacto':
      return 'Intacto';
    case 'danificado':
      return 'Danificado';
    case 'quebrado':
      return 'Quebrado';
  }
}
