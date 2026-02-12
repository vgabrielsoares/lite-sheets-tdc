/**
 * Resources - Tipos relacionados ao sistema de dados de recurso
 *
 * No sistema, recursos (água, comida, tochas, flechas etc.)
 * usam dados que diminuem conforme o uso:
 * - Resultado ≥ 2: dado diminui um passo (ex: d12 → d10)
 * - Resultado = 1: recurso acaba (dado zerado)
 *
 * Escala de dados de recurso:
 * d2 → d3 → d4 → d6 → d8 → d10 → d12 → d20 → d100
 */

import type { UUID, DiceType } from './common';

/**
 * Escala ordenada de dados de recurso (do menor para o maior)
 * Usada para step-down e step-up dos dados de recurso.
 */
export const RESOURCE_DIE_SCALE: readonly DiceType[] = [
  'd2',
  'd3',
  'd4',
  'd6',
  'd8',
  'd10',
  'd12',
  'd20',
  'd100',
] as const;

/**
 * Mapeamento de DiceType para número de lados (para dados de recurso)
 */
export const RESOURCE_DIE_SIDES: Record<DiceType, number> = {
  d2: 2,
  d3: 3,
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
};

/**
 * Estado do dado de recurso
 * - active: recurso disponível com dado ativo
 * - depleted: recurso acabou (dado = 0, resultado 1 na última rolagem)
 */
export type ResourceDieState = 'active' | 'depleted';

/**
 * Dado de recurso individual
 *
 * Cada recurso no inventário usa um dado que diminui ao ser utilizado.
 * Configurável com dado mínimo e máximo para cada recurso.
 */
export interface ResourceDie {
  /** ID único do recurso */
  id: UUID;
  /** Nome do recurso (ex: "Água", "Comida", "Tocha") */
  name: string;
  /** Dado atual do recurso (null quando esgotado) */
  currentDie: DiceType | null;
  /** Dado mínimo configurável (menor passo possível antes de acabar) */
  minDie: DiceType;
  /** Dado máximo configurável (maior passo possível / valor de reset) */
  maxDie: DiceType;
  /** Estado do recurso */
  state: ResourceDieState;
  /** Se é um recurso customizado (criado pelo jogador) */
  isCustom: boolean;
}

/**
 * Resultado de uma rolagem de dado de recurso
 */
export interface ResourceDieRollResult {
  /** ID do recurso */
  resourceId: UUID;
  /** Nome do recurso */
  resourceName: string;
  /** Dado que foi rolado */
  dieRolled: DiceType;
  /** Valor obtido */
  value: number;
  /** Se o recurso foi esgotado (valor = 1) */
  isDepleted: boolean;
  /** Se o dado diminuiu (valor ≥ 2) */
  isSteppedDown: boolean;
  /** Novo dado após resultado (null se esgotado) */
  newDie: DiceType | null;
}

/**
 * Retorna o índice de um dado na escala de recursos.
 * Retorna -1 se não encontrado.
 */
export function getResourceDieIndex(die: DiceType): number {
  return RESOURCE_DIE_SCALE.indexOf(die);
}

/**
 * Diminui o dado de recurso em um passo na escala.
 * - Se o dado atual está acima do mínimo, retorna o dado anterior.
 * - Se o dado atual é igual ao mínimo, retorna null (esgotado).
 *
 * @param currentDie - Dado atual do recurso
 * @param minDie - Dado mínimo configurado
 * @returns O novo dado após step-down, ou null se esgotado
 */
export function stepDownResourceDie(
  currentDie: DiceType,
  minDie: DiceType
): DiceType | null {
  const currentIndex = getResourceDieIndex(currentDie);
  const minIndex = getResourceDieIndex(minDie);

  if (currentIndex <= minIndex) {
    return null; // Já está no mínimo ou abaixo, esgota
  }

  return RESOURCE_DIE_SCALE[currentIndex - 1];
}

/**
 * Aumenta o dado de recurso em um passo na escala.
 *
 * @param currentDie - Dado atual do recurso
 * @param maxDie - Dado máximo configurado
 * @returns O novo dado após step-up, ou o maxDie se já no máximo
 */
export function stepUpResourceDie(
  currentDie: DiceType,
  maxDie: DiceType
): DiceType {
  const currentIndex = getResourceDieIndex(currentDie);
  const maxIndex = getResourceDieIndex(maxDie);

  if (currentIndex >= maxIndex) {
    return maxDie;
  }

  return RESOURCE_DIE_SCALE[currentIndex + 1];
}

/**
 * Processa o uso de um recurso: rola o dado e aplica o resultado.
 *
 * @param resource - Recurso atual
 * @param rollValue - Valor rolado no dado (1 a N)
 * @returns Resultado da rolagem com novo estado
 */
export function processResourceUse(
  resource: ResourceDie,
  rollValue: number
): ResourceDieRollResult {
  if (!resource.currentDie) {
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      dieRolled: resource.minDie,
      value: rollValue,
      isDepleted: true,
      isSteppedDown: false,
      newDie: null,
    };
  }

  if (rollValue === 1) {
    // Resultado 1: recurso acaba
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      dieRolled: resource.currentDie,
      value: rollValue,
      isDepleted: true,
      isSteppedDown: false,
      newDie: null,
    };
  }

  // Resultado ≥ 2: dado diminui um passo
  const newDie = stepDownResourceDie(resource.currentDie, resource.minDie);

  return {
    resourceId: resource.id,
    resourceName: resource.name,
    dieRolled: resource.currentDie,
    value: rollValue,
    isDepleted: newDie === null,
    isSteppedDown: true,
    newDie,
  };
}
