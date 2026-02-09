/**
 * Sistema de Rolagem de Dados para Tabuleiro do Caos RPG (v0.0.2)
 *
 * Mecânicas implementadas:
 * - Pool de Dados: Rolar X dados onde X = valor do atributo + modificadores de dado
 * - Dado base: d6 (pode ser d8, d10, d12 dependendo do grau de proficiência)
 * - Sucesso (✶): Resultado ≥ 6
 * - Cancelamento: Resultado = 1 cancela 1 sucesso (mínimo 0✶)
 * - Atributo 0 / Penalidade extrema: Rola 2d e escolhe o MENOR valor
 * - Limite: Máximo 8 dados por teste de habilidade
 * - Modificadores: Sempre +Xd / -Xd (nunca numéricos para testes de habilidade)
 * - Sem triunfo/desastre: Mecânicas removidas do sistema
 *
 * Mantidos do sistema anterior:
 * - rollDamage: Rolagem de dano (soma de dados, d4/d6/d8/d10/d12/d20)
 * - rollDamageWithCritical: Rolagem de dano com crítico (maximiza dados)
 * - DiceRollHistory: Histórico de rolagens (aceita todos os formatos)
 */

import type { DieSize, DicePoolDie, DicePoolResult } from '@/types';
import { DIE_SIZE_TO_SIDES } from '@/types';

/** Limite máximo de dados por teste de habilidade */
export const MAX_SKILL_DICE = 8;

/** Valor mínimo para contar como sucesso */
export const SUCCESS_THRESHOLD = 6;

/** Valor que cancela um sucesso */
export const CANCELLATION_VALUE = 1;

// ============================================================================
// Tipo legado para rolagens de dano
// ============================================================================

/**
 * Resultado de uma rolagem de dano
 */
export interface DamageDiceRollResult {
  /** Fórmula da rolagem (ex: "2d6+3") */
  formula: string;
  /** Valores individuais rolados */
  rolls: number[];
  /** Tipo de dado usado (número de lados: 4, 6, 8, etc.) */
  diceType: number;
  /** Número de dados rolados */
  diceCount: number;
  /** Modificador aplicado */
  modifier: number;
  /** Resultado antes do modificador (soma dos dados) */
  baseResult: number;
  /** Resultado final após modificador */
  finalResult: number;
  /** Timestamp da rolagem */
  timestamp: Date;
  /** Descrição do contexto da rolagem */
  context?: string;
  /** Sempre true para rolagens de dano */
  isDamageRoll: true;
  /** Se houve crítico (dados maximizados) */
  isCritical?: boolean;
}

// ============================================================================
// Funções auxiliares de rolagem
// ============================================================================

/**
 * Rola um único dado de N lados (1 a N)
 */
function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Classifica um resultado individual de dado na pool
 */
function classifyDie(value: number, dieSize: DieSize): DicePoolDie {
  return {
    value,
    dieSize,
    isSuccess: value >= SUCCESS_THRESHOLD,
    isCancellation: value === CANCELLATION_VALUE,
  };
}

// ============================================================================
// Pool de Dados — Sistema Principal (v0.0.2)
// ============================================================================

/**
 * Rola uma pool de dados e conta sucessos/cancelamentos
 *
 * Regras:
 * - Resultado ≥ 6 = 1 sucesso (✶)
 * - Resultado = 1 = cancela 1 sucesso
 * - Sucessos líquidos = max(0, sucessos - cancelamentos)
 *
 * @param quantity - Quantidade de dados a rolar (deve ser ≥ 1)
 * @param dieSize - Tamanho do dado (d6, d8, d10 ou d12)
 * @param context - Contexto opcional da rolagem
 * @returns Resultado completo da pool de dados
 */
export function rollDicePool(
  quantity: number,
  dieSize: DieSize,
  context?: string
): DicePoolResult {
  const sides = DIE_SIZE_TO_SIDES[dieSize];
  const actualQuantity = Math.max(1, quantity);

  const dice: DicePoolDie[] = Array.from({ length: actualQuantity }, () => {
    const value = rollSingleDie(sides);
    return classifyDie(value, dieSize);
  });

  const rolls = dice.map((d) => d.value);
  const successes = dice.filter((d) => d.isSuccess).length;
  const cancellations = dice.filter((d) => d.isCancellation).length;
  const netSuccesses = Math.max(0, successes - cancellations);

  return {
    formula: `${actualQuantity}${dieSize}`,
    dice,
    rolls,
    dieSize,
    diceCount: actualQuantity,
    successes,
    cancellations,
    netSuccesses,
    timestamp: new Date(),
    context,
    isPenaltyRoll: false,
    diceModifier: 0,
  };
}

/**
 * Rolagem com penalidade: atributo 0 ou dados reduzidos abaixo de 1
 *
 * Rola 2 dados e usa apenas o MENOR valor para determinar sucesso.
 *
 * @param dieSize - Tamanho do dado
 * @param context - Contexto opcional
 * @returns Resultado da pool (baseado no menor dos 2 dados)
 */
export function rollWithPenalty(
  dieSize: DieSize,
  context?: string
): DicePoolResult {
  const sides = DIE_SIZE_TO_SIDES[dieSize];

  const value1 = rollSingleDie(sides);
  const value2 = rollSingleDie(sides);
  const lowestValue = Math.min(value1, value2);

  const allDice: DicePoolDie[] = [
    classifyDie(value1, dieSize),
    classifyDie(value2, dieSize),
  ];
  const rolls = [value1, value2];

  // Contar sucesso/cancelamento apenas do dado menor
  const isSuccess = lowestValue >= SUCCESS_THRESHOLD;
  const isCancellation = lowestValue === CANCELLATION_VALUE;
  const successes = isSuccess ? 1 : 0;
  const cancellations = isCancellation ? 1 : 0;
  const netSuccesses = Math.max(0, successes - cancellations);

  return {
    formula: `2${dieSize} (menor)`,
    dice: allDice,
    rolls,
    dieSize,
    diceCount: 2,
    successes,
    cancellations,
    netSuccesses,
    timestamp: new Date(),
    context,
    isPenaltyRoll: true,
    diceModifier: 0,
  };
}

/**
 * Rola um teste de habilidade completo no sistema de pool de dados
 *
 * Regras:
 * - Dados = valor do atributo + modificadores em dados (+Xd / -Xd)
 * - Se total ≤ 0: usa rollWithPenalty (2d, menor)
 * - Máximo de 8 dados por teste
 * - Tamanho do dado determinado pelo grau de proficiência
 *
 * @param attributeValue - Valor do atributo (0-5+)
 * @param dieSize - Tamanho do dado (determinado pelo grau de proficiência)
 * @param diceModifier - Modificador de dados (+Xd ou -Xd)
 * @param context - Contexto opcional da rolagem
 * @returns Resultado completo da pool de dados
 */
export function rollSkillTest(
  attributeValue: number,
  dieSize: DieSize,
  diceModifier: number = 0,
  context?: string
): DicePoolResult {
  const totalDice = attributeValue + diceModifier;

  // Penalidade extrema: se total ≤ 0, rola 2d e escolhe o menor
  if (totalDice <= 0) {
    const result = rollWithPenalty(dieSize, context);
    return {
      ...result,
      diceModifier,
    };
  }

  // Aplicar limite máximo de 8 dados
  const cappedDice = Math.min(totalDice, MAX_SKILL_DICE);

  const result = rollDicePool(cappedDice, dieSize, context);
  return {
    ...result,
    diceModifier,
  };
}

// ============================================================================
// Rolagem de Dano (mantido do sistema anterior)
// ============================================================================

/**
 * Rola dados de dano (soma todos os dados)
 *
 * @param diceCount - Número de dados
 * @param diceSides - Lados do dado (d4, d6, d8, d10, d12, d20, etc.)
 * @param modifier - Modificador a adicionar ao total
 * @param context - Descrição do contexto
 * @returns Resultado detalhado da rolagem de dano
 */
export function rollDamage(
  diceCount: number,
  diceSides: number,
  modifier: number = 0,
  context?: string
): DamageDiceRollResult {
  if (diceCount <= 0) {
    return {
      formula: `0d${diceSides}+${modifier}`,
      rolls: [],
      diceType: diceSides,
      diceCount: 0,
      modifier,
      baseResult: 0,
      finalResult: Math.max(0, modifier),
      timestamp: new Date(),
      context,
      isDamageRoll: true,
    };
  }

  const rolls = Array.from({ length: diceCount }, () =>
    rollSingleDie(diceSides)
  );
  const baseResult = rolls.reduce((sum, roll) => sum + roll, 0);
  const finalResult = Math.max(0, baseResult + modifier);

  const formula = `${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier}`;

  return {
    formula,
    rolls,
    diceType: diceSides,
    diceCount,
    modifier,
    baseResult,
    finalResult,
    timestamp: new Date(),
    context,
    isDamageRoll: true,
  };
}

/**
 * Rola dano com possibilidade de crítico
 * Crítico MAXIMIZA os dados (não rola, usa valor máximo)
 *
 * @param diceCount - Número de dados base
 * @param diceSides - Lados do dado
 * @param modifier - Modificador
 * @param isCritical - Se é um acerto crítico
 * @param context - Descrição do contexto
 * @returns Resultado detalhado da rolagem de dano
 */
export function rollDamageWithCritical(
  diceCount: number,
  diceSides: number,
  modifier: number = 0,
  isCritical: boolean = false,
  context?: string
): DamageDiceRollResult {
  if (isCritical) {
    const maxDamage = diceCount * diceSides;
    const finalResult = maxDamage + modifier;

    return {
      formula: `${diceCount}d${diceSides} MAXIMIZADO (${maxDamage})${modifier >= 0 ? '+' : ''}${modifier}`,
      rolls: Array(diceCount).fill(diceSides),
      diceType: diceSides,
      diceCount,
      modifier,
      baseResult: maxDamage,
      finalResult: Math.max(0, finalResult),
      timestamp: new Date(),
      isCritical: true,
      context,
      isDamageRoll: true,
    };
  }

  return rollDamage(diceCount, diceSides, modifier, context);
}

// ============================================================================
// Rolagem Customizada (dados livres)
// ============================================================================

/**
 * Resultado de uma rolagem customizada (dados livres)
 */
export interface CustomDiceResult {
  /** Fórmula da rolagem (ex: "3d8+2") */
  formula: string;
  /** Valores individuais rolados */
  rolls: number[];
  /** Tipo de dado (número de lados) */
  diceType: number;
  /** Número de dados rolados */
  diceCount: number;
  /** Modificador numérico aplicado */
  modifier: number;
  /** Total somado (soma dos dados + modificador) */
  total: number;
  /** Se os dados foram somados ou exibidos individualmente */
  summed: boolean;
  /** Timestamp da rolagem */
  timestamp: Date;
  /** Contexto da rolagem */
  context?: string;
}

/**
 * Rola dados customizados (rolador livre)
 *
 * Apenas este rolador customizado aceita modificadores numéricos (+1, +2, etc).
 * Testes de habilidade sempre usam +Xd/-Xd.
 *
 * @param diceType - Número de lados do dado (4, 6, 8, 10, 12, 20, 100)
 * @param quantity - Quantidade de dados
 * @param modifier - Modificador numérico (+/- valor)
 * @param summed - Se deve somar os dados ou mostrar individualmente
 * @param context - Contexto opcional
 * @returns Resultado da rolagem customizada
 */
export function rollCustomDice(
  diceType: number,
  quantity: number,
  modifier: number = 0,
  summed: boolean = true,
  context?: string
): CustomDiceResult {
  const actualQuantity = Math.max(1, quantity);
  const rolls = Array.from({ length: actualQuantity }, () =>
    rollSingleDie(diceType)
  );
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  const modStr =
    modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
  const formula = `${actualQuantity}d${diceType}${modStr}`;

  return {
    formula,
    rolls,
    diceType,
    diceCount: actualQuantity,
    modifier,
    total,
    summed,
    timestamp: new Date(),
    context,
  };
}

// ============================================================================
// Histórico de Rolagens
// ============================================================================

/**
 * Tipo união de todos os resultados possíveis no histórico
 */
export type HistoryEntry =
  | DicePoolResult
  | DamageDiceRollResult
  | CustomDiceResult;

/**
 * Histórico de rolagens — armazena as últimas N rolagens
 */
export class DiceRollHistory {
  private history: HistoryEntry[] = [];
  private maxHistory: number = 50;

  /** Adiciona uma rolagem ao histórico */
  add(roll: HistoryEntry): void {
    this.history.unshift(roll);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  /** Retorna todo o histórico */
  getAll(): HistoryEntry[] {
    return [...this.history];
  }

  /** Retorna as últimas N rolagens */
  getLast(count: number): HistoryEntry[] {
    return this.history.slice(0, count);
  }

  /** Limpa o histórico */
  clear(): void {
    this.history = [];
  }

  /** Retorna o tamanho do histórico */
  get size(): number {
    return this.history.length;
  }
}

/**
 * Instância global do histórico de rolagens
 */
export const globalDiceHistory = new DiceRollHistory();

// ============================================================================
// Helpers de tipo para consumidores
// ============================================================================

/**
 * Type guard: verifica se um resultado de histórico é uma DicePoolResult
 */
export function isDicePoolResult(entry: HistoryEntry): entry is DicePoolResult {
  return 'netSuccesses' in entry && 'dice' in entry;
}

/**
 * Type guard: verifica se um resultado de histórico é uma DamageDiceRollResult
 */
export function isDamageDiceRollResult(
  entry: HistoryEntry
): entry is DamageDiceRollResult {
  return (
    'isDamageRoll' in entry &&
    (entry as DamageDiceRollResult).isDamageRoll === true
  );
}

/**
 * Type guard: verifica se um resultado de histórico é uma CustomDiceResult
 */
export function isCustomDiceResult(
  entry: HistoryEntry
): entry is CustomDiceResult {
  return 'summed' in entry && 'total' in entry && !('isDamageRoll' in entry);
}

// ============================================================================
// LEGACY COMPATIBILITY — To be removed in Phase 3
// These functions provide backward compatibility for combat components
// that haven't been updated to the new pool system yet.
// ============================================================================

/**
 * @deprecated Use rollDicePool or rollSkillTest instead.
 * This function is temporarily preserved for combat components.
 * Will be removed in Phase 3.
 */
export type RollType = 'normal' | 'advantage' | 'disadvantage';

/**
 * @deprecated Legacy result type for d20 rolls.
 * Combat components should migrate to DicePoolResult.
 */
export interface DiceRollResult {
  /** Total numérico */
  total: number;
  /** Alias for total - used by combat components */
  finalResult: number;
  /** Dados rolados */
  rolls: number[];
  /** Fórmula utilizada */
  formula: string;
  /** Modificador aplicado */
  modifier: number;
  /** Tipo de rolagem */
  rollType: RollType;
  /** Se é crítico (20 natural) */
  isCritical: boolean;
  /** Timestamp */
  timestamp: Date;
  /** Contexto */
  context?: string;
}

/**
 * @deprecated Converts legacy DiceRollResult to a HistoryEntry for the dice history.
 * This allows combat components to still add their rolls to the global history.
 * Will be removed in Phase 3 when combat is refactored.
 */
export function legacyRollToHistoryEntry(
  roll: DiceRollResult
): CustomDiceResult {
  return {
    diceType: 20, // d20 = 20 sides
    diceCount: roll.rolls.length,
    rolls: roll.rolls, // Already number[]
    total: roll.total,
    modifier: roll.modifier,
    formula: roll.formula,
    summed: true,
    timestamp: roll.timestamp,
    context: roll.context,
  };
}

/**
 * @deprecated Legacy d20 roll function for combat components.
 * Use rollSkillTest for skill checks. Will be removed in Phase 3.
 *
 * This now simulates the old behavior using the pool system,
 * returning a compatible result structure.
 */
export function rollD20(
  diceCount: number,
  modifier: number,
  rollType: RollType = 'normal',
  context?: string
): DiceRollResult {
  // Use the new pool system internally but return legacy format
  const poolResult = rollSkillTest(diceCount, 'd6', 0, context);

  // Convert pool result to legacy format
  // Note: This is an approximation for backward compatibility
  // Combat components should be refactored in Phase 3
  const d20Rolls: number[] = [];

  // Roll actual d20s for the legacy interface
  for (let i = 0; i < Math.max(1, diceCount); i++) {
    d20Rolls.push(Math.floor(Math.random() * 20) + 1);
  }

  // Handle advantage/disadvantage for legacy interface
  let selectedRoll: number;
  if (rollType === 'advantage' && d20Rolls.length >= 2) {
    selectedRoll = Math.max(...d20Rolls.slice(0, 2));
  } else if (rollType === 'disadvantage' && d20Rolls.length >= 2) {
    selectedRoll = Math.min(...d20Rolls.slice(0, 2));
  } else {
    selectedRoll = d20Rolls[0] ?? 10;
  }

  const total = selectedRoll + modifier;
  const isCritical = d20Rolls.includes(20);

  return {
    total,
    finalResult: total,
    rolls: d20Rolls,
    formula: `${diceCount}d20${modifier >= 0 ? '+' : ''}${modifier}`,
    modifier,
    rollType,
    isCritical,
    timestamp: new Date(),
    context,
  };
}
