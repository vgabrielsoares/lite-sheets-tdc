/**
 * Utility functions for handling retroactive attribute updates
 *
 * When certain attributes change, they trigger automatic updates to other
 * character properties (retroactive rules):
 * - Mente → Number of known languages (Mente - 1, min 0)
 * - Mente → Number of skill proficiencies (3 + Mente)
 */

import type { Character, LanguageName, SkillName } from '@/types';
import {
  calculateAdditionalLanguages,
  calculateSkillProficiencies,
  calculateTotalGA,
  calculateTotalPP,
  calculateTotalPV,
} from './calculations';

/**
 * Updates the character's languages when Mente attribute changes
 *
 * According to the rules:
 * - Comum (Common) is always known
 * - Additional languages = Mente - 1 (minimum 0)
 * - This is retroactive: if Mente increases, languages can be added
 *
 * If the new Mente value allows for more languages than currently known,
 * no action is taken (player must manually add new languages).
 *
 * If the new Mente value allows for fewer languages than currently known,
 * the excess languages are NOT automatically removed (player decision).
 *
 * @param character - The character to update
 * @param newMente - The new Mente attribute value
 * @returns Updated character with adjusted language slots (but same languages list)
 *
 * @example
 * // Mente 1 → 2: allows 1 language (was 0)
 * updateLanguagesForMente(character, 2);
 *
 * // Mente 3 → 2: allows 1 language (was 2)
 * // Character keeps existing languages, but is aware of the limit
 * updateLanguagesForMente(character, 2);
 */
export function getAvailableLanguageSlots(mente: number): number {
  // Comum is always known, additional languages based on Mente
  return calculateAdditionalLanguages(mente);
}

/**
 * Validates if the character has the correct number of languages for their Mente
 *
 * @param character - The character to validate
 * @returns Object with validation result
 *
 * @example
 * validateLanguages(character);
 * // { valid: false, expected: 2, actual: 3, excess: 1 }
 */
export function validateLanguages(character: Character): {
  valid: boolean;
  expected: number;
  actual: number;
  excess: number;
} {
  const expectedSlots = getAvailableLanguageSlots(character.attributes.mente);
  const actualLanguages = character.languages.filter(
    (lang) => lang !== 'comum'
  ).length; // Don't count Comum

  return {
    valid: actualLanguages <= expectedSlots,
    expected: expectedSlots,
    actual: actualLanguages,
    excess: Math.max(0, actualLanguages - expectedSlots),
  };
}

/**
 * Gets the maximum number of additional languages a character can learn
 * based on their current Mente value
 *
 * @param character - The character
 * @returns Number of additional language slots available
 */
export function getAvailableLanguageSlotsForCharacter(
  character: Character
): number {
  const totalSlots = getAvailableLanguageSlots(character.attributes.mente);
  const currentAdditional = character.languages.filter(
    (lang) => lang !== 'comum'
  ).length;
  return Math.max(0, totalSlots - currentAdditional);
}

/**
 * Updates the character's skill proficiency slots when Mente attribute changes
 *
 * According to the rules:
 * - Proficiency slots = 3 + Mente
 * - This is retroactive: if Mente increases, proficiency slots increase
 *
 * Similar to languages, if Mente decreases, existing proficiencies are NOT
 * automatically removed (player decision).
 *
 * @param character - The character to update
 * @param newMente - The new Mente attribute value
 * @returns Number of available proficiency slots
 *
 * @example
 * // Mente 1 → 2: allows 5 proficiencies (was 4)
 * getAvailableSkillProficiencySlots(2);
 *
 * // Mente 3 → 2: allows 5 proficiencies (was 6)
 * getAvailableSkillProficiencySlots(2);
 */
export function getAvailableSkillProficiencySlots(mente: number): number {
  return calculateSkillProficiencies(mente);
}

/**
 * Validates if the character has the correct number of skill proficiencies for their Mente
 *
 * @param character - The character to validate
 * @returns Object with validation result
 *
 * @example
 * validateSkillProficiencies(character);
 * // { valid: false, expected: 4, actual: 5, excess: 1 }
 */
export function validateSkillProficiencies(character: Character): {
  valid: boolean;
  expected: number;
  actual: number;
  excess: number;
} {
  const expectedSlots = getAvailableSkillProficiencySlots(
    character.attributes.mente
  );

  // Count how many skills are not 'leigo' (not proficient)
  const actualProficiencies = Object.values(character.skills).filter(
    (skill) => skill.proficiencyLevel !== 'leigo'
  ).length;

  return {
    valid: actualProficiencies <= expectedSlots,
    expected: expectedSlots,
    actual: actualProficiencies,
    excess: Math.max(0, actualProficiencies - expectedSlots),
  };
}

/**
 * Gets the number of available skill proficiency slots for a character
 *
 * @param character - The character
 * @returns Number of skill proficiency slots still available
 */
export function getAvailableSkillProficiencySlotsForCharacter(
  character: Character
): number {
  const totalSlots = getAvailableSkillProficiencySlots(
    character.attributes.mente
  );
  const currentProficiencies = Object.values(character.skills).filter(
    (skill) => skill.proficiencyLevel !== 'leigo'
  ).length;
  return Math.max(0, totalSlots - currentProficiencies);
}

/**
 * Handles all retroactive updates when an attribute changes
 *
 * This function should be called whenever an attribute is modified to ensure
 * all dependent values are recalculated correctly.
 *
 * @param character - The current character state
 * @param attribute - The attribute that changed
 * @param newValue - The new attribute value
 * @returns Partial character update object
 *
 * @example
 * const updates = handleAttributeChange(character, 'mente', 3);
 * // Updates will contain any necessary changes based on the new Mente value
 */
export function handleAttributeChange(
  character: Character,
  attribute: string,
  newValue: number
): Partial<Character> {
  const newAttributes = {
    ...character.attributes,
    [attribute]: newValue,
  };

  const updates: Partial<Character> = {
    attributes: newAttributes,
  };

  // Recalcular GA/PP/PV (dinâmicos com base nos atributos atuais)
  if (character.archetypes.length > 0) {
    const newGAMax = calculateTotalGA(character.archetypes, newAttributes);
    const newPPMax = calculateTotalPP(
      character.archetypes,
      newAttributes.essencia
    );
    const newPVMax = calculateTotalPV(newGAMax);

    const gaMaxDiff = newGAMax - character.combat.guard.max;
    const ppMaxDiff = newPPMax - character.combat.pp.max;
    const pvMaxDiff = newPVMax - character.combat.vitality.max;

    updates.combat = {
      ...character.combat,
      guard: {
        ...character.combat.guard,
        max: newGAMax,
        // Ajustar current proporcionalmente (não exceder max)
        current: Math.min(
          Math.max(0, character.combat.guard.current + gaMaxDiff),
          newGAMax
        ),
      },
      pp: {
        ...character.combat.pp,
        max: newPPMax,
        current: Math.min(
          Math.max(0, character.combat.pp.current + ppMaxDiff),
          newPPMax
        ),
      },
      vitality: {
        ...character.combat.vitality,
        max: newPVMax,
        current: Math.min(
          Math.max(0, character.combat.vitality.current + pvMaxDiff),
          newPVMax
        ),
      },
    };
  }

  // Handle Mente-specific retroactive updates
  if (attribute === 'mente') {
    // Language and proficiency slots are validated but not automatically adjusted
    // The UI should show warnings if limits are exceeded
    // This is intentional to give players control over what to remove
  }

  return updates;
}

/**
 * Gets a warning message if the character exceeds language or proficiency limits
 *
 * @param character - The character to check
 * @returns Warning message or null if no warnings
 */
export function getAttributeWarnings(character: Character): string[] {
  const warnings: string[] = [];

  // Check languages
  const langValidation = validateLanguages(character);
  if (!langValidation.valid) {
    warnings.push(
      `Você tem ${langValidation.excess} idioma(s) a mais do que o permitido pelo seu atributo Mente. Considere remover ${langValidation.excess} idioma(s).`
    );
  }

  // Check skill proficiencies
  const skillValidation = validateSkillProficiencies(character);
  if (!skillValidation.valid) {
    warnings.push(
      `Você tem ${skillValidation.excess} proficiência(s) com habilidades a mais do que o permitido pelo seu atributo Mente. Considere remover ${skillValidation.excess} proficiência(s).`
    );
  }

  return warnings;
}
