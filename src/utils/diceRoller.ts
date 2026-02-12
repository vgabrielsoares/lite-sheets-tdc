/**
 * Sistema de Rolagem de Dados para Tabuleiro do Caos RPG
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
// Pool de Dados — Sistema Principal
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
// Rolagem por Tipo de Resultado de Ataque
// ============================================================================

import type { AttackHitType } from '@/types/combat';
import type { DiceRoll, DiceType } from '@/types/common';

// ─── Dice Notation Parsers ──────────────────────────────────────────

/**
 * Tipos de dado válidos no sistema
 */
const VALID_DIE_SIDES = new Set([2, 3, 4, 6, 8, 10, 12, 20, 100]);

/**
 * Regex para notação de dados: aceita "d6", "1d6", "2d8", "4d12", etc.
 */
export const DICE_NOTATION_REGEX = /^(\d+)?d(\d+)$/i;

/**
 * Regex para notação de dado crítico: aceita "+1d", "+2d", "1d", "2d", etc.
 */
export const CRITICAL_DICE_REGEX = /^\+?(\d+)d$/i;

/**
 * Parseia notação de dados (ex: "1d6", "2d8", "d4") → DiceRoll (sem modificador)
 */
export function parseDiceNotation(notation: string): DiceRoll | null {
  const match = notation.trim().match(DICE_NOTATION_REGEX);
  if (!match) return null;
  const quantity = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  if (quantity < 1 || sides < 1 || !VALID_DIE_SIDES.has(sides)) return null;
  return {
    quantity,
    type: `d${sides}` as DiceType,
    modifier: 0,
  };
}

/**
 * Parseia notação de dado crítico (ex: "+1d", "+2d", "1d") → número de dados extras
 */
export function parseCriticalNotation(notation: string): number | null {
  const match = notation.trim().match(CRITICAL_DICE_REGEX);
  if (!match) return null;
  const count = parseInt(match[1], 10);
  if (count < 1) return null;
  return count;
}

/**
 * Formata DiceRoll como string compacta (ex: "1d6", "2d8")
 */
export function formatDiceNotation(roll: DiceRoll): string {
  return `${roll.quantity}${roll.type}`;
}

/**
 * Formata preview de fórmula de dano para ataque normal (1✶)
 */
export function formatDamagePreview(
  baseDice: DiceRoll,
  bonusDice?: DiceRoll,
  modifier?: number
): string {
  const parts: string[] = [];
  parts.push(formatDiceNotation(baseDice));
  if (bonusDice && bonusDice.quantity > 0) {
    parts.push(formatDiceNotation(bonusDice));
  }
  const mod = modifier ?? baseDice.modifier;
  if (mod > 0) parts.push(`${mod}`);
  else if (mod < 0) parts.push(`${mod}`);
  return parts.join(mod > 0 ? ' + ' : mod < 0 ? ' ' : ' + ');
}

/**
 * Formata preview de fórmula de dano para todos os tipos de resultado
 */
export function formatAllDamagePreviews(
  baseDice: DiceRoll,
  criticalDice: number,
  bonusDice?: DiceRoll
): { raspao: string; normal: string; emCheio: string; critico: string } {
  const baseStr = formatDiceNotation(baseDice);
  const diceSides = parseInt(baseDice.type.replace('d', ''), 10);
  const maxBase = baseDice.quantity * diceSides;
  const bonusStr =
    bonusDice && bonusDice.quantity > 0 ? formatDiceNotation(bonusDice) : '';
  const maxBonus =
    bonusDice && bonusDice.quantity > 0
      ? bonusDice.quantity * parseInt(bonusDice.type.replace('d', ''), 10)
      : 0;
  const mod = baseDice.modifier;
  const modStr = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : '';

  // Raspão: dados base ÷ 2 (sem mod, sem bônus)
  const raspao = `(${baseStr}) ÷ 2`;

  // Normal: dados base + bônus + mod
  const normalParts = [baseStr];
  if (bonusStr) normalParts.push(bonusStr);
  const normal = normalParts.join(' + ') + (modStr ? modStr : '');

  // Em Cheio: max base + bônus rolado + mod
  const emCheioParts = [`${maxBase}`];
  if (bonusStr) emCheioParts.push(bonusStr);
  const emCheio = emCheioParts.join(' + ') + (modStr ? modStr : '');

  // Crítico: max base + bônus rolado + mod + dados críticos
  const critStr = `${criticalDice}${baseDice.type}`;
  const criticoParts = [`${maxBase}`];
  if (bonusStr) criticoParts.push(bonusStr);
  const critico =
    criticoParts.join(' + ') + (modStr ? modStr : '') + ` + ${critStr}`;

  return { raspao, normal, emCheio, critico };
}

// ─── Attack Damage Result ───────────────────────────────────────────

/**
 * Resultado completo de dano baseado no tipo de ataque
 */
export interface AttackDamageResult {
  /** Tipo de resultado do ataque */
  hitType: AttackHitType;
  /** Resultado do dano base (com modificador, maximizado se em cheio/crítico) */
  baseDamage: DamageDiceRollResult;
  /** Resultado dos dados bônus (se houver) */
  bonusDamage?: DamageDiceRollResult;
  /** Dados de dano crítico extra (apenas para 'critico') */
  criticalExtraDamage?: DamageDiceRollResult;
  /** Dano total final */
  totalDamage: number;
  /** Descrição legível do cálculo */
  description: string;
}

/**
 * Calcula dano baseado no tipo de resultado de ataque
 *
 * Regras:
 * - Raspão (0✶): Rola dados base sem modificadores ÷ 2 (mín 1). Sem bônus.
 * - Normal (1✶): Rola dados base + dados bônus + modificador
 * - Em Cheio (2✶): Maximiza dados base + maximiza dados bônus + modificador
 * - Crítico (3+✶): Maximiza dados base + maximiza dados bônus + modificador + rola dados críticos extras
 *
 * @param damageRoll - Configuração base de dano (quantity × type + modifier)
 * @param hitType - Tipo de resultado do ataque
 * @param criticalDice - Número de dados extras do mesmo tipo base (default: 1)
 * @param bonusDice - Dados de dano bônus opcionais
 * @param context - Descrição do contexto
 */
export function rollDamageByHitType(
  damageRoll: DiceRoll,
  hitType: AttackHitType,
  criticalDice: number = 1,
  bonusDice?: DiceRoll,
  context?: string
): AttackDamageResult {
  const diceCount = damageRoll.quantity;
  const diceSides = parseInt(damageRoll.type.replace('d', ''), 10);
  const modifier = damageRoll.modifier;

  // Helper: rolar e/ou maximizar dados bônus
  const rollBonus = (maximize: boolean): DamageDiceRollResult | undefined => {
    if (!bonusDice || bonusDice.quantity <= 0) return undefined;
    const bSides = parseInt(bonusDice.type.replace('d', ''), 10);
    if (maximize) {
      return rollDamageWithCritical(
        bonusDice.quantity,
        bSides,
        0,
        true,
        `Bônus: ${context || ''}`
      );
    }
    return rollDamage(bonusDice.quantity, bSides, 0, `Bônus: ${context || ''}`);
  };

  switch (hitType) {
    case 'raspao': {
      // Rola dados BASE sem modificadores e sem bônus, divide por 2 (mín 1)
      const baseResult = rollDamage(diceCount, diceSides, 0, context);
      const halvedDamage = Math.max(1, Math.floor(baseResult.finalResult / 2));
      const raspaoResult: DamageDiceRollResult = {
        ...baseResult,
        formula: `(${diceCount}d${diceSides} = ${baseResult.finalResult}) ÷ 2 = ${halvedDamage}`,
        finalResult: halvedDamage,
      };
      return {
        hitType,
        baseDamage: raspaoResult,
        totalDamage: halvedDamage,
        description: `Raspão: ${diceCount}d${diceSides} sem modificadores, dividido por 2`,
      };
    }

    case 'normal': {
      // Rola dados base + bônus + modificador
      const normalResult = rollDamage(diceCount, diceSides, modifier, context);
      const bonus = rollBonus(false);
      const total = normalResult.finalResult + (bonus?.finalResult ?? 0);
      return {
        hitType,
        baseDamage: normalResult,
        bonusDamage: bonus,
        totalDamage: total,
        description: `Normal: ${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier}${bonus ? ` + ${bonusDice!.quantity}d${parseInt(bonusDice!.type.replace('d', ''), 10)}` : ''}`,
      };
    }

    case 'em-cheio': {
      // Maximiza dados base + modificador, rola dados bônus normalmente
      const maxResult = rollDamageWithCritical(
        diceCount,
        diceSides,
        modifier,
        true,
        context
      );
      const bonus = rollBonus(false);
      const total = maxResult.finalResult + (bonus?.finalResult ?? 0);
      return {
        hitType,
        baseDamage: maxResult,
        bonusDamage: bonus,
        totalDamage: total,
        description: `Em Cheio: ${diceCount}×${diceSides} (MAX)${modifier >= 0 ? '+' : ''}${modifier}${bonus ? ` + ${bonusDice!.quantity}d${parseInt(bonusDice!.type.replace('d', ''), 10)}` : ''} = ${total}`,
      };
    }

    case 'critico': {
      // Maximiza base + mod, rola dados bônus + rola criticalDice dados extras do mesmo tipo base
      const maxResult = rollDamageWithCritical(
        diceCount,
        diceSides,
        modifier,
        true,
        context
      );
      const bonus = rollBonus(false);
      const effectiveCritDice = Math.max(1, criticalDice);
      const critResult = rollDamage(
        effectiveCritDice,
        diceSides,
        0,
        `Dano Crítico: ${context || ''}`
      );
      const total =
        maxResult.finalResult +
        (bonus?.finalResult ?? 0) +
        critResult.finalResult;

      return {
        hitType,
        baseDamage: maxResult,
        bonusDamage: bonus,
        criticalExtraDamage: critResult,
        totalDamage: total,
        description: `Crítico: ${diceCount}×${diceSides} (MAX)${modifier >= 0 ? '+' : ''}${modifier}${bonus ? ` + ${bonusDice!.quantity}d${parseInt(bonusDice!.type.replace('d', ''), 10)}` : ''} + ${effectiveCritDice}d${diceSides}`,
      };
    }
  }
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
