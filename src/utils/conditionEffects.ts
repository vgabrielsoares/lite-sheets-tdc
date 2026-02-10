/**
 * conditionEffects - Cálculo de efeitos mecânicos das condições
 *
 * Agrega penalidades de dados de todas as condições ativas (manuais + automáticas)
 * e retorna um mapa de penalidades por alvo (atributo ou 'todos').
 *
 * v0.0.2: Condições aplicam penalidades em dados (-Xd), não em valores fixos.
 * Condições empilháveis multiplicam a penalidade pelo número de pilhas.
 */

import type { Condition } from '@/types/combat';
import {
  CONDITIONS,
  type ConditionId,
  type ConditionInfo,
} from '@/constants/conditions';

/**
 * Mapa de penalidades de dados por alvo
 *
 * Chaves possíveis:
 * - 'todos': aplica a todos os testes
 * - Nome de atributo: 'agilidade', 'corpo', 'influencia', 'mente', 'essencia', 'instinto'
 *
 * Valores são negativos (penalidades) ou positivos (bônus).
 */
export type DicePenaltyMap = Record<string, number>;

/** Cache de ConditionInfo por ID para acesso rápido */
const CONDITION_INFO_MAP = new Map<ConditionId, ConditionInfo>(
  CONDITIONS.map((c) => [c.id, c])
);

/**
 * Calcula as penalidades de dados agregadas de todas as condições ativas
 *
 * @param manualConditions - Condições aplicadas manualmente ao personagem
 * @param autoConditionIds - IDs das condições ativadas automaticamente
 * @returns Mapa de penalidades por alvo
 *
 * @example
 * ```ts
 * const penalties = calculateConditionDicePenalties(
 *   character.combat.conditions,
 *   ['avariado', 'esgotado']
 * );
 * // Resultado: { corpo: -1, instinto: -1 } (de Esgotado)
 * ```
 */
export function calculateConditionDicePenalties(
  manualConditions: Condition[],
  autoConditionIds: ConditionId[]
): DicePenaltyMap {
  const penalties: DicePenaltyMap = {};

  const addPenalty = (target: string, value: number) => {
    penalties[target] = (penalties[target] ?? 0) + value;
  };

  // 1. Processar condições manuais
  for (const condition of manualConditions) {
    const info = CONDITION_INFO_MAP.get(condition.name as ConditionId);
    if (!info?.dicePenalty) continue;

    const stacks = info.stackable
      ? (condition.modifiers.find((m) => m.name === 'stacks')?.value ?? 1)
      : 1;

    const totalModifier = info.dicePenalty.scalesWithStacks
      ? info.dicePenalty.modifier * stacks
      : info.dicePenalty.modifier;

    for (const target of info.dicePenalty.targets) {
      addPenalty(target, totalModifier);
    }
  }

  // 2. Processar condições automáticas (não estão no array manual)
  for (const autoId of autoConditionIds) {
    // Evitar duplicação: auto-conditions não devem estar nas manuais
    if (manualConditions.some((c) => c.name === autoId)) continue;

    const info = CONDITION_INFO_MAP.get(autoId);
    if (!info?.dicePenalty) continue;

    for (const target of info.dicePenalty.targets) {
      addPenalty(target, info.dicePenalty.modifier);
    }
  }

  return penalties;
}

/**
 * Obtém a penalidade total de dados para um atributo específico,
 * incluindo a penalidade 'todos' se existir.
 *
 * @param penalties - Mapa de penalidades calculado
 * @param attribute - Nome do atributo (ex: 'agilidade', 'corpo')
 * @returns Penalidade total em dados (negativo = penalidade)
 */
export function getDicePenaltyForAttribute(
  penalties: DicePenaltyMap,
  attribute: string
): number {
  return (penalties['todos'] ?? 0) + (penalties[attribute] ?? 0);
}

/**
 * Verifica se há alguma penalidade ativa no mapa
 */
export function hasActivePenalties(penalties: DicePenaltyMap): boolean {
  return Object.values(penalties).some((v) => v !== 0);
}

/**
 * Formata as penalidades para exibição textual
 *
 * @example
 * formatPenaltySummary({ todos: -2, agilidade: -1 })
 * // → ["-2d todos os testes", "-1d Agilidade"]
 */
export function formatPenaltySummary(penalties: DicePenaltyMap): string[] {
  const ATTRIBUTE_DISPLAY: Record<string, string> = {
    todos: 'todos os testes',
    agilidade: 'Agilidade',
    corpo: 'Corpo',
    influencia: 'Influência',
    mente: 'Mente',
    essencia: 'Essência',
    instinto: 'Instinto',
  };

  return Object.entries(penalties)
    .filter(([, value]) => value !== 0)
    .map(([target, value]) => {
      const label = ATTRIBUTE_DISPLAY[target] ?? target;
      return `${value > 0 ? '+' : ''}${value}d ${label}`;
    });
}
