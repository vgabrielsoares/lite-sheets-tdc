/**
 * Combat Penalties - Funções utilitárias para sistema de penalidades de combate
 *
 * v0.0.2 Mudanças:
 * - Penalidade de defesa: @deprecated (defesa fixa não existe mais)
 * - Penalidades de testes de resistência: agora em -Xd (dados), não -1d20
 *
 * Sistema v0.0.2:
 * 1. Penalidade de Testes de Resistência:
 *    - Quando passa em um teste que mitiga todo o efeito, sofre -1d naquele teste
 *    - Cada tipo de resistência é rastreado separadamente
 *    - Reseta quando falha no teste ou no início da próxima rodada
 */

import type { SavingThrowType, CombatPenalties } from '@/types/combat';

/**
 * Re-export do tipo para uso interno consistente
 * @deprecated Use CombatPenalties de '@/types/combat' diretamente
 */
export type CombatPenaltiesState = CombatPenalties;

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2. Mantido para compatibilidade.
 */
export const MIN_DEFENSE = 15;

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2. Mantido para compatibilidade.
 */
export const DEFENSE_PENALTY_PER_MISS = -1;

/**
 * Valor da penalidade por sucesso em teste de resistência (em dados, -Xd)
 */
export const SAVING_THROW_DICE_PENALTY_PER_SUCCESS = -1;

/**
 * Cria estado inicial das penalidades de combate
 */
export function createDefaultCombatPenalties(): CombatPenaltiesState {
  return {
    defensePenalty: 0,
    savingThrowPenalties: {
      determinacao: 0,
      reflexo: 0,
      sintonia: 0,
      tenacidade: 0,
      vigor: 0,
    },
  };
}

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2.
 * Aplica penalidade na defesa quando um ataque erra
 */
export function applyDefensePenalty(
  currentPenalty: number,
  baseDefense: number
): number {
  const newPenalty = currentPenalty + DEFENSE_PENALTY_PER_MISS;

  // Verifica se a nova penalidade não faria a defesa cair abaixo de 15
  const effectiveDefense = baseDefense + newPenalty;
  if (effectiveDefense < MIN_DEFENSE) {
    // Calcula a penalidade máxima permitida
    return MIN_DEFENSE - baseDefense;
  }

  return newPenalty;
}

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2.
 */
export function resetDefensePenalty(): number {
  return 0;
}

/**
 * Aplica penalidade em um teste de resistência quando passa no teste
 *
 * @param currentPenalties - Estado atual das penalidades
 * @param savingThrowType - Tipo do teste de resistência
 * @returns Novo estado das penalidades
 */
export function applySavingThrowPenalty(
  currentPenalties: Record<SavingThrowType, number>,
  savingThrowType: SavingThrowType
): Record<SavingThrowType, number> {
  return {
    ...currentPenalties,
    [savingThrowType]:
      currentPenalties[savingThrowType] + SAVING_THROW_DICE_PENALTY_PER_SUCCESS,
  };
}

/**
 * Reseta a penalidade de um teste de resistência específico (quando falha no teste)
 *
 * @param currentPenalties - Estado atual das penalidades
 * @param savingThrowType - Tipo do teste de resistência
 * @returns Novo estado das penalidades
 */
export function resetSavingThrowPenalty(
  currentPenalties: Record<SavingThrowType, number>,
  savingThrowType: SavingThrowType
): Record<SavingThrowType, number> {
  return {
    ...currentPenalties,
    [savingThrowType]: 0,
  };
}

/**
 * Reseta todas as penalidades (no início do turno)
 *
 * @returns Estado zerado de todas as penalidades
 */
export function resetAllPenalties(): CombatPenaltiesState {
  return createDefaultCombatPenalties();
}

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2.
 */
export function calculateEffectiveDefense(
  baseDefense: number,
  penalty: number
): number {
  const effective = baseDefense + penalty;
  return Math.max(effective, MIN_DEFENSE);
}

/**
 * Verifica se há alguma penalidade ativa
 *
 * @param penalties - Estado das penalidades
 * @returns true se houver qualquer penalidade ativa
 */
export function hasAnyPenalty(penalties: CombatPenaltiesState): boolean {
  if (penalties.defensePenalty !== 0) return true;

  return Object.values(penalties.savingThrowPenalties).some(
    (penalty) => penalty !== 0
  );
}

/**
 * Labels em português para os tipos de teste de resistência
 */
export const SAVING_THROW_LABELS: Record<SavingThrowType, string> = {
  determinacao: 'Determinação',
  reflexo: 'Reflexo',
  sintonia: 'Sintonia',
  tenacidade: 'Tenacidade',
  vigor: 'Vigor',
};

/**
 * Cores temáticas para cada tipo de teste de resistência
 */
export const SAVING_THROW_COLORS: Record<SavingThrowType, string> = {
  determinacao: '#9C27B0', // Roxo
  reflexo: '#4CAF50', // Verde
  sintonia: '#2196F3', // Azul
  tenacidade: '#FFC107', // Amarelo
  vigor: '#F44336', // Vermelho
};
