/**
 * Dice Steps — Passos de Dados do Sistema
 *
 * Progressão e regressão de passos de dados conforme o livro v0.1.7.
 * Várias mecânicas de jogo podem alterar os passos de dado de algum
 * efeito mecânico do sistema.
 */

/**
 * Representação de um passo de dado na progressão.
 * Cada passo pode ter uma ou mais notações equivalentes.
 */
export interface DiceStep {
  /** Índice do passo (0-based) */
  index: number;
  /** Notação principal (ex: "1d6") */
  primary: string;
  /** Notações alternativas equivalentes (ex: ["2d4"]) */
  alternatives: string[];
}

/**
 * Progressão completa de passos de dados conforme livro v0.1.7.
 *
 * Ordem: 1(1d1) → 1d2 → 1d3 → 1d4 → 1d6 → 1d8/2d4 → 1d10 →
 * 1d12/2d6/3d4 → 2d8/4d4 → 3d6 → 2d10/5d4 → 2d12/3d8/4d6/6d4 →
 * 3d10/5d6 → 4d8/8d4 → 3d12/6d6 → 4d10/5d8 → 7d6 →
 * 4d12/6d8/8d6 → 5d10 → 7d8 → 6d10/5d12 → 8d8 →
 * 7d10 → 6d12 → 8d10 → 7d12 → 8d12
 */
export const DICE_STEPS: readonly DiceStep[] = [
  { index: 0, primary: '1', alternatives: ['1d1'] },
  { index: 1, primary: '1d2', alternatives: [] },
  { index: 2, primary: '1d3', alternatives: [] },
  { index: 3, primary: '1d4', alternatives: [] },
  { index: 4, primary: '1d6', alternatives: [] },
  { index: 5, primary: '1d8', alternatives: ['2d4'] },
  { index: 6, primary: '1d10', alternatives: [] },
  { index: 7, primary: '1d12', alternatives: ['2d6', '3d4'] },
  { index: 8, primary: '2d8', alternatives: ['4d4'] },
  { index: 9, primary: '3d6', alternatives: [] },
  { index: 10, primary: '2d10', alternatives: ['5d4'] },
  { index: 11, primary: '2d12', alternatives: ['3d8', '4d6', '6d4'] },
  { index: 12, primary: '3d10', alternatives: ['5d6'] },
  { index: 13, primary: '4d8', alternatives: ['8d4'] },
  { index: 14, primary: '3d12', alternatives: ['6d6'] },
  { index: 15, primary: '4d10', alternatives: ['5d8'] },
  { index: 16, primary: '7d6', alternatives: [] },
  { index: 17, primary: '4d12', alternatives: ['6d8', '8d6'] },
  { index: 18, primary: '5d10', alternatives: [] },
  { index: 19, primary: '7d8', alternatives: [] },
  { index: 20, primary: '6d10', alternatives: ['5d12'] },
  { index: 21, primary: '8d8', alternatives: [] },
  { index: 22, primary: '7d10', alternatives: [] },
  { index: 23, primary: '6d12', alternatives: [] },
  { index: 24, primary: '8d10', alternatives: [] },
  { index: 25, primary: '7d12', alternatives: [] },
  { index: 26, primary: '8d12', alternatives: [] },
] as const;

/**
 * Total de passos de dados na progressão
 */
export const DICE_STEPS_COUNT = DICE_STEPS.length;

/**
 * Retorna o passo de dado pelo índice
 */
export function getDiceStep(index: number): DiceStep | undefined {
  if (index < 0 || index >= DICE_STEPS.length) return undefined;
  return DICE_STEPS[index];
}

/**
 * Busca o índice de um passo de dado pela notação (primária ou alternativa)
 * @returns O índice do passo, ou -1 se não encontrado
 */
export function findDiceStepIndex(notation: string): number {
  const normalized = notation.trim().toLowerCase();
  return DICE_STEPS.findIndex(
    (step) =>
      step.primary.toLowerCase() === normalized ||
      step.alternatives.some((alt) => alt.toLowerCase() === normalized)
  );
}

/**
 * Avança N passos na progressão de dados
 * @param currentNotation - Notação atual (ex: "1d6")
 * @param steps - Quantidade de passos a avançar (positivo) ou regredir (negativo)
 * @returns Nova notação de dado, ou undefined se fora dos limites
 */
export function stepDice(
  currentNotation: string,
  steps: number
): DiceStep | undefined {
  const currentIndex = findDiceStepIndex(currentNotation);
  if (currentIndex === -1) return undefined;
  return getDiceStep(currentIndex + steps);
}

/**
 * Formata um passo de dado para exibição
 * Se tiver alternativas, mostra "primário ou alt1/alt2"
 */
export function formatDiceStep(step: DiceStep): string {
  if (step.alternatives.length === 0) return step.primary;
  return `${step.primary} ou ${step.alternatives.join('/')}`;
}
