/**
 * Progression Validation — Validates multi-archetype and class constraints
 *
 * Rules (livro v0.1.7):
 * - Each level is invested in exactly one archetype
 * - Sum of archetype levels = character level
 * - Classes unlock at character level 3
 * - Max 3 classes, sum of class levels ≤ character level
 * - Archetype levels can go beyond 15 (powers/talents continue)
 */

import type { Character, Archetype, ArchetypeName } from '@/types/character';
import type { CharacterClass } from '@/types/character';

// ─── Constants ──────────────────────────────────────────────

/** Nível mínimo para desbloquear classes */
export const CLASS_UNLOCK_LEVEL = 3;

/** Número máximo de classes por personagem */
export const MAX_CLASSES = 3;

// ─── Archetype Validation ───────────────────────────────────

/**
 * Calcula a soma total de níveis de arquétipo.
 *
 * @param archetypes - Lista de arquétipos do personagem
 * @returns Soma de todos os níveis de arquétipo
 */
export function getTotalArchetypeLevels(archetypes: Archetype[]): number {
  return archetypes.reduce((sum, a) => sum + a.level, 0);
}

/**
 * Extrai um Record de níveis por arquétipo a partir da lista de arquétipos.
 * Útil para cálculos que precisam de lookup por nome.
 *
 * @param archetypes - Lista de arquétipos do personagem
 * @returns Record mapeando nome do arquétipo para nível
 */
export function getArchetypeLevelsRecord(
  archetypes: Archetype[]
): Partial<Record<ArchetypeName, number>> {
  const record: Partial<Record<ArchetypeName, number>> = {};
  for (const a of archetypes) {
    record[a.name] = a.level;
  }
  return record;
}

/**
 * Valida se a soma dos níveis de arquétipo é consistente com o nível do personagem.
 *
 * @param archetypes - Lista de arquétipos
 * @param characterLevel - Nível total do personagem
 * @returns true se soma de níveis de arquétipo = nível do personagem (ou ambos = 1 sem arquétipo)
 */
export function validateArchetypeLevelsSum(
  archetypes: Archetype[],
  characterLevel: number
): boolean {
  const totalArchetypeLevels = getTotalArchetypeLevels(archetypes);

  // Nível 1 sem arquétipo é válido (personagem ainda não escolheu)
  if (characterLevel === 1 && archetypes.length === 0) {
    return true;
  }

  return totalArchetypeLevels === characterLevel;
}

/**
 * Valida que nenhum arquétipo tem nível negativo ou zero inválido.
 *
 * @param archetypes - Lista de arquétipos
 * @returns true se todos os arquétipos têm nível ≥ 1
 */
export function validateArchetypeLevelsPositive(
  archetypes: Archetype[]
): boolean {
  return archetypes.every((a) => a.level >= 1);
}

// ─── Class Validation ───────────────────────────────────────

/**
 * Valida se o personagem pode ter classes (nível ≥ 3).
 *
 * @param characterLevel - Nível total do personagem
 * @returns true se classes são permitidas
 */
export function canHaveClasses(characterLevel: number): boolean {
  return characterLevel >= CLASS_UNLOCK_LEVEL;
}

/**
 * Valida as classes de um personagem.
 * Regras:
 * - Máximo 3 classes
 * - Classes só se nível ≥ 3
 * - Soma de níveis de classe ≤ nível do personagem
 *
 * @param classes - Lista de classes do personagem
 * @param characterLevel - Nível total do personagem
 * @returns Objeto com resultado da validação e mensagens de erro
 */
export function validateClasses(
  classes: CharacterClass[],
  characterLevel: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (classes.length === 0) {
    return { valid: true, errors: [] };
  }

  if (characterLevel < CLASS_UNLOCK_LEVEL) {
    errors.push(
      `Classes só são desbloqueadas no nível ${CLASS_UNLOCK_LEVEL}. Nível atual: ${characterLevel}.`
    );
  }

  if (classes.length > MAX_CLASSES) {
    errors.push(
      `Máximo de ${MAX_CLASSES} classes. Atualmente: ${classes.length}.`
    );
  }

  const totalClassLevels = classes.reduce((sum, c) => sum + c.level, 0);
  if (totalClassLevels > characterLevel) {
    errors.push(
      `Soma de níveis de classe (${totalClassLevels}) excede o nível do personagem (${characterLevel}).`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calcula quantos níveis de classe ainda podem ser distribuídos.
 *
 * @param classes - Lista de classes do personagem
 * @param characterLevel - Nível total do personagem
 * @returns Número de níveis disponíveis para classes
 */
export function getAvailableClassLevels(
  classes: CharacterClass[],
  characterLevel: number
): number {
  const totalClassLevels = classes.reduce((sum, c) => sum + c.level, 0);
  return Math.max(0, characterLevel - totalClassLevels);
}

// ─── Full Character Progression Validation ──────────────────

/**
 * Resultado completo de validação de progressão.
 */
export interface ProgressionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida a progressão completa de um personagem.
 * Verifica arquétipos, classes, e consistência geral.
 *
 * @param character - Personagem a ser validado
 * @returns Resultado completo da validação
 */
export function validateProgression(
  character: Character
): ProgressionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Valida soma de arquétipos
  if (!validateArchetypeLevelsSum(character.archetypes, character.level)) {
    const total = getTotalArchetypeLevels(character.archetypes);
    errors.push(
      `Soma de níveis de arquétipo (${total}) não corresponde ao nível do personagem (${character.level}).`
    );
  }

  // Valida níveis positivos
  if (!validateArchetypeLevelsPositive(character.archetypes)) {
    errors.push('Todos os arquétipos devem ter nível ≥ 1.');
  }

  // Valida classes
  const classValidation = validateClasses(character.classes, character.level);
  errors.push(...classValidation.errors);

  // Warnings informativos
  if (character.level >= CLASS_UNLOCK_LEVEL && character.classes.length === 0) {
    warnings.push('Personagem pode escolher uma classe a partir do nível 3.');
  }

  if (character.level >= 1 && character.archetypes.length === 0) {
    warnings.push('Personagem ainda não escolheu um arquétipo.');
  }

  // Valida levelHistory consistency
  if (character.levelHistory && character.levelHistory.length > 0) {
    const historyLevels = character.levelHistory.map((h) => h.level);
    const maxHistoryLevel = Math.max(...historyLevels);
    if (maxHistoryLevel > character.level) {
      errors.push(
        `Histórico contém entradas para nível ${maxHistoryLevel}, mas personagem está no nível ${character.level}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
