/**
 * Utility functions for language management
 *
 * Handles adding, removing, and validating character languages based on
 * the Mente attribute and lineage bonuses.
 */

import type { Character, LanguageName } from '@/types';
import { DEFAULT_LANGUAGE, LANGUAGE_LIST } from '@/constants';
import { getAvailableLanguageSlots } from './attributeUpdates';

/**
 * Gets the total number of language slots available to a character
 * This includes the base Comum language plus additional slots from Mente
 *
 * @param character - The character
 * @returns Total language slots (includes Comum)
 */
export function getTotalLanguageSlots(character: Character): number {
  const additionalSlots = getAvailableLanguageSlots(character.attributes.mente);
  return 1 + additionalSlots; // Always includes Comum
}

/**
 * Gets languages gained from lineage
 *
 * @param character - The character
 * @returns Array of language names from lineage
 */
export function getLineageLanguages(character: Character): LanguageName[] {
  if (!character.lineage) {
    return [];
  }
  return character.lineage.languages || [];
}

/**
 * Gets the total number of languages a character can know
 * This is the sum of Mente-based slots plus lineage bonuses
 *
 * @param character - The character
 * @returns Total allowed languages
 */
export function getMaxAllowedLanguages(character: Character): number {
  const baseSlots = getTotalLanguageSlots(character);
  const lineageLanguages = getLineageLanguages(character);
  return baseSlots + lineageLanguages.length;
}

/**
 * Checks if a character can add a new language
 *
 * @param character - The character
 * @param language - The language to add
 * @returns Object with canAdd flag and reason if false
 */
export function canAddLanguage(
  character: Character,
  language: LanguageName
): {
  canAdd: boolean;
  reason?: string;
} {
  // Check if language is already known
  if (character.languages.includes(language)) {
    return {
      canAdd: false,
      reason: 'Este idioma já é conhecido pelo personagem.',
    };
  }

  // Check if character has available slots
  const maxAllowed = getMaxAllowedLanguages(character);
  const currentCount = character.languages.length;

  if (currentCount >= maxAllowed) {
    return {
      canAdd: false,
      reason: `Você já atingiu o limite de ${maxAllowed} idiomas. Aumente Mente ou remova um idioma existente.`,
    };
  }

  return { canAdd: true };
}

/**
 * Adds a language to a character if allowed
 *
 * @param character - The character
 * @param language - The language to add
 * @returns Updated character or null if not allowed
 */
export function addLanguage(
  character: Character,
  language: LanguageName
): Character | null {
  const validation = canAddLanguage(character, language);

  if (!validation.canAdd) {
    return null;
  }

  return {
    ...character,
    languages: [...character.languages, language],
  };
}

/**
 * Checks if a language can be removed
 * Comum cannot be removed as it's the default language
 *
 * @param character - The character
 * @param language - The language to remove
 * @returns Object with canRemove flag and reason if false
 */
export function canRemoveLanguage(
  character: Character,
  language: LanguageName
): {
  canRemove: boolean;
  reason?: string;
} {
  // Cannot remove Comum
  if (language === DEFAULT_LANGUAGE) {
    return {
      canRemove: false,
      reason: 'O idioma Comum não pode ser removido.',
    };
  }

  // Check if language is known
  if (!character.languages.includes(language)) {
    return {
      canRemove: false,
      reason: 'Este idioma não é conhecido pelo personagem.',
    };
  }

  return { canRemove: true };
}

/**
 * Removes a language from a character if allowed
 *
 * @param character - The character
 * @param language - The language to remove
 * @returns Updated character or null if not allowed
 */
export function removeLanguage(
  character: Character,
  language: LanguageName
): Character | null {
  const validation = canRemoveLanguage(character, language);

  if (!validation.canRemove) {
    return null;
  }

  return {
    ...character,
    languages: character.languages.filter((lang) => lang !== language),
  };
}

/**
 * Gets available languages that can be selected
 * Excludes languages already known by the character
 *
 * @param character - The character
 * @returns Array of available language names
 */
export function getAvailableLanguages(character: Character): LanguageName[] {
  return LANGUAGE_LIST.filter((lang) => !character.languages.includes(lang));
}

/**
 * Validates current language selection
 * Returns warnings if the character exceeds allowed limits
 *
 * @param character - The character
 * @returns Validation result with warnings
 */
export function validateLanguageSelection(character: Character): {
  valid: boolean;
  currentCount: number;
  maxAllowed: number;
  excess: number;
  warnings: string[];
} {
  const maxAllowed = getMaxAllowedLanguages(character);
  const currentCount = character.languages.length;
  const excess = Math.max(0, currentCount - maxAllowed);
  const warnings: string[] = [];

  // Check if Comum is present
  if (!character.languages.includes(DEFAULT_LANGUAGE)) {
    warnings.push('O idioma Comum deve sempre estar presente.');
  }

  // Check if exceeds limit
  if (excess > 0) {
    warnings.push(
      `Você tem ${excess} idioma(s) a mais do que o permitido. Remova ${excess} idioma(s) ou aumente o atributo Mente.`
    );
  }

  return {
    valid: warnings.length === 0,
    currentCount,
    maxAllowed,
    excess,
    warnings,
  };
}

/**
 * Ensures Comum is always in the character's known languages
 * Adds it if missing
 *
 * @param character - The character
 * @returns Updated character with Comum guaranteed
 */
export function ensureComumLanguage(character: Character): Character {
  if (character.languages.includes(DEFAULT_LANGUAGE)) {
    return character;
  }

  return {
    ...character,
    languages: [DEFAULT_LANGUAGE, ...character.languages],
  };
}

/**
 * Gets a summary of the character's language situation
 *
 * @param character - The character
 * @returns Summary object with counts and available slots
 */
export function getLanguageSummary(character: Character): {
  total: number;
  fromMente: number;
  fromLineage: number;
  remaining: number;
  maxAllowed: number;
} {
  const maxAllowed = getMaxAllowedLanguages(character);
  const total = character.languages.length;
  const fromMente = getTotalLanguageSlots(character);
  const fromLineage = getLineageLanguages(character).length;
  const remaining = Math.max(0, maxAllowed - total);

  return {
    total,
    fromMente,
    fromLineage,
    remaining,
    maxAllowed,
  };
}
