/**
 * Constantes de Progressão — Tabela de XP e Level Up
 *
 * Tabela oficial do livro v0.1.7 (Tabuleiro do Caos RPG).
 * Inclui XP necessário por nível (0→30+), e funções auxiliares.
 */

/**
 * XP necessário para progredir de cada nível para o próximo.
 * Índice 0 = nível 0→1, índice 1 = nível 1→2, etc.
 * Tabela oficial (livro v0.1.7):
 */
export const XP_TABLE: readonly number[] = [
  15, // 0→1
  50, // 1→2
  125, // 2→3
  250, // 3→4
  425, // 4→5
  650, // 5→6
  925, // 6→7
  1250, // 7→8
  1625, // 8→9
  2050, // 9→10
  2500, // 10→11
  3050, // 11→12
  3625, // 12→13
  4250, // 13→14
  4925, // 14→15
  5650, // 15→16
  7710, // 16→17
  8700, // 17→18
  9750, // 18→19
  10860, // 19→20
  12030, // 20→21
  13260, // 21→22
  14550, // 22→23
  15900, // 23→24
  17310, // 24→25
  18780, // 25→26
  20310, // 26→27
  21900, // 27→28
  23550, // 28→29
  25260, // 29→30
  30000, // 30→31
] as const;

/**
 * Fator de multiplicação para XP além do nível 31.
 * Após nível 30→31 = 30000, cada nível seguinte é anterior × 1.07
 */
export const XP_OVERFLOW_MULTIPLIER = 1.07;

/**
 * Retorna o XP necessário para progredir do nível atual para o próximo.
 *
 * @param currentLevel - Nível atual do personagem (0-based para a tabela)
 * @returns XP necessário para o próximo nível
 *
 * @example
 * getXPForNextLevel(0); // 15 (nível 0→1)
 * getXPForNextLevel(1); // 50 (nível 1→2)
 * getXPForNextLevel(30); // 30000 (nível 30→31)
 * getXPForNextLevel(31); // floor(30000 × 1.07) = 32100
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < 0) return XP_TABLE[0];

  if (currentLevel < XP_TABLE.length) {
    return XP_TABLE[currentLevel];
  }

  // Níveis além da tabela: aplica multiplicador recursivo
  let xp = XP_TABLE[XP_TABLE.length - 1];
  const extraLevels = currentLevel - (XP_TABLE.length - 1);
  for (let i = 0; i < extraLevels; i++) {
    xp = Math.floor(xp * XP_OVERFLOW_MULTIPLIER);
  }
  return xp;
}

/**
 * Verifica se o personagem pode subir de nível.
 *
 * @param currentXP - XP atual do personagem
 * @param currentLevel - Nível atual do personagem
 * @returns true se XP atual ≥ XP necessário para o próximo nível
 */
export function canLevelUp(currentXP: number, currentLevel: number): boolean {
  return currentXP >= getXPForNextLevel(currentLevel);
}

/**
 * Calcula o XP restante após subir de nível.
 * XP excedente é mantido.
 *
 * @param currentXP - XP atual
 * @param currentLevel - Nível atual (antes de subir)
 * @returns XP restante após subir de nível (excedente)
 */
export function calculateRemainingXP(
  currentXP: number,
  currentLevel: number
): number {
  const required = getXPForNextLevel(currentLevel);
  return Math.max(0, currentXP - required);
}

/**
 * Nível máximo padrão do sistema (15 para jogo normal, 30 para extensão).
 */
export const STANDARD_MAX_LEVEL = 15;
export const EXTENDED_MAX_LEVEL = 30;

/**
 * Nível de personagem a partir do qual Classes são desbloqueadas.
 */
export const CLASS_UNLOCK_LEVEL = 3;

// MAX_CLASSES é definido em src/constants/classes.ts (= 3)

/**
 * Níveis de arquétipo em que se ganha Poder de Arquétipo ou Talento.
 * Todos os níveis que não são característica (1) nem competencia (5,10,15).
 */
export const POWER_OR_TALENT_LEVELS = [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14];

/**
 * Níveis de arquétipo em que se ganha Competência (múltiplos de 5 no arquétipo).
 * Níveis 5, 10, 15 do arquétipo → Competência ao invés de Poder.
 */
export const COMPETENCE_LEVELS = [5, 10, 15];

/**
 * Níveis de arquétipo em que se ganham Características de Arquétipo.
 */
export const ARCHETYPE_FEATURE_LEVELS = [1, 5, 10, 15];

/**
 * Bônus de Habilidade de Assinatura por nível do personagem.
 * +1d (nível 1-5), +2d (nível 6-10), +3d (nível 11-15)
 * Fórmula: Math.min(3, Math.ceil(level / 5))
 */
export function getSignatureAbilityBonus(level: number): number {
  return Math.min(3, Math.ceil(level / 5));
}

/**
 * Labels de tipo de ganho em Level Up para exibição.
 */
export const LEVEL_UP_GAIN_LABELS = {
  ga: 'Guarda (GA)',
  pp: 'Pontos de Poder (PP)',
  pv: 'Vitalidade (PV)',
  poder_ou_talento: 'Poder de Arquétipo ou Talento',
  competencia: 'Competência',
  caracteristica: 'Característica de Arquétipo',
  classe: 'Classes desbloqueadas',
} as const;
