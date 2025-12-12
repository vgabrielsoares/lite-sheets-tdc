/**
 * Tests for attributeUpdates utility functions
 */

import {
  getAvailableLanguageSlots,
  validateLanguages,
  getAvailableLanguageSlotsForCharacter,
  getAvailableSkillProficiencySlots,
  validateSkillProficiencies,
  getAvailableSkillProficiencySlotsForCharacter,
  handleAttributeChange,
  getAttributeWarnings,
} from '../attributeUpdates';
import { createDefaultCharacter } from '../characterFactory';
import type { Character, Skill } from '@/types';

// Helper function to update skill proficiency immutably
function setSkillProficiency(
  character: Character,
  skillName: keyof Character['skills'],
  proficiencyLevel: Skill['proficiencyLevel']
): void {
  character.skills[skillName] = {
    ...character.skills[skillName],
    proficiencyLevel,
  };
}

describe('attributeUpdates utilities', () => {
  describe('getAvailableLanguageSlots', () => {
    it('should calculate correct language slots based on Mente', () => {
      expect(getAvailableLanguageSlots(0)).toBe(0); // 0 - 1 = -1, min 0
      expect(getAvailableLanguageSlots(1)).toBe(0); // 1 - 1 = 0
      expect(getAvailableLanguageSlots(2)).toBe(1); // 2 - 1 = 1
      expect(getAvailableLanguageSlots(3)).toBe(2); // 3 - 1 = 2
      expect(getAvailableLanguageSlots(5)).toBe(4); // 5 - 1 = 4
    });

    it('should never return negative values', () => {
      expect(getAvailableLanguageSlots(0)).toBeGreaterThanOrEqual(0);
      expect(getAvailableLanguageSlots(1)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateLanguages', () => {
    it('should validate character with correct number of languages', () => {
      const character = createDefaultCharacter({
        name: 'Test',
        playerName: 'Player',
      });
      character.attributes.mente = 2; // Allows 1 additional language
      character.languages = ['comum', 'elfico']; // 1 additional

      const result = validateLanguages(character);

      expect(result.valid).toBe(true);
      expect(result.expected).toBe(1);
      expect(result.actual).toBe(1);
      expect(result.excess).toBe(0);
    });

    it('should detect excess languages', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 0 additional languages
      character.languages = ['comum', 'elfico', 'anao']; // 2 additional (excess!)

      const result = validateLanguages(character);

      expect(result.valid).toBe(false);
      expect(result.expected).toBe(0);
      expect(result.actual).toBe(2);
      expect(result.excess).toBe(2);
    });

    it('should not count Comum language in validation', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 0 additional languages
      character.languages = ['comum']; // Only Comum, no additional

      const result = validateLanguages(character);

      expect(result.valid).toBe(true);
      expect(result.actual).toBe(0); // Comum not counted
    });

    it('should allow fewer languages than maximum', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 5; // Allows 4 additional languages
      character.languages = ['comum', 'elfico']; // Only 1 additional

      const result = validateLanguages(character);

      expect(result.valid).toBe(true);
      expect(result.excess).toBe(0);
    });
  });

  describe('getAvailableLanguageSlotsForCharacter', () => {
    it('should calculate remaining language slots', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 3; // Allows 2 additional languages
      character.languages = ['comum', 'elfico']; // 1 additional used

      const available = getAvailableLanguageSlotsForCharacter(character);

      expect(available).toBe(1); // 2 allowed - 1 used = 1 remaining
    });

    it('should return 0 when all slots are used', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 2; // Allows 1 additional language
      character.languages = ['comum', 'elfico']; // 1 additional used

      const available = getAvailableLanguageSlotsForCharacter(character);

      expect(available).toBe(0);
    });

    it('should return 0 (not negative) when over limit', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 0 additional languages
      character.languages = ['comum', 'elfico', 'anao']; // 2 additional (over!)

      const available = getAvailableLanguageSlotsForCharacter(character);

      expect(available).toBe(0); // Can't go negative
    });
  });

  describe('getAvailableSkillProficiencySlots', () => {
    it('should calculate correct proficiency slots based on Mente', () => {
      expect(getAvailableSkillProficiencySlots(0)).toBe(3); // 3 + 0 = 3
      expect(getAvailableSkillProficiencySlots(1)).toBe(4); // 3 + 1 = 4
      expect(getAvailableSkillProficiencySlots(2)).toBe(5); // 3 + 2 = 5
      expect(getAvailableSkillProficiencySlots(3)).toBe(6); // 3 + 3 = 6
      expect(getAvailableSkillProficiencySlots(5)).toBe(8); // 3 + 5 = 8
    });

    it('should always include base 3 proficiencies', () => {
      expect(getAvailableSkillProficiencySlots(0)).toBeGreaterThanOrEqual(3);
      expect(getAvailableSkillProficiencySlots(1)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateSkillProficiencies', () => {
    it('should validate character with correct number of proficiencies', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 4 proficiencies
      // Set 4 skills to non-leigo
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'acrobacia', 'versado');
      setSkillProficiency(character, 'atletismo', 'adepto');
      setSkillProficiency(character, 'furtividade', 'mestre');

      const result = validateSkillProficiencies(character);

      expect(result.valid).toBe(true);
      expect(result.expected).toBe(4);
      expect(result.actual).toBe(4);
      expect(result.excess).toBe(0);
    });

    it('should detect excess proficiencies', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 0; // Allows only 3 proficiencies
      // Set 5 skills to non-leigo (excess!)
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'acrobacia', 'adepto');
      setSkillProficiency(character, 'atletismo', 'adepto');
      setSkillProficiency(character, 'furtividade', 'adepto');
      setSkillProficiency(character, 'percepcao', 'adepto');

      const result = validateSkillProficiencies(character);

      expect(result.valid).toBe(false);
      expect(result.expected).toBe(3);
      expect(result.actual).toBe(5);
      expect(result.excess).toBe(2);
    });

    it('should not count leigo proficiency level', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 4 proficiencies
      // All skills at leigo (default)

      const result = validateSkillProficiencies(character);

      expect(result.actual).toBe(0); // No proficiencies
      expect(result.valid).toBe(true);
    });
  });

  describe('getAvailableSkillProficiencySlotsForCharacter', () => {
    it('should calculate remaining proficiency slots', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 2; // Allows 5 proficiencies
      // Set 3 skills to non-leigo
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'atletismo', 'versado');
      setSkillProficiency(character, 'percepcao', 'adepto');

      const available =
        getAvailableSkillProficiencySlotsForCharacter(character);

      expect(available).toBe(2); // 5 allowed - 3 used = 2 remaining
    });

    it('should return 0 when all slots are used', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 4 proficiencies
      // Set exactly 4 skills
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'atletismo', 'adepto');
      setSkillProficiency(character, 'percepcao', 'adepto');
      setSkillProficiency(character, 'furtividade', 'adepto');

      const available =
        getAvailableSkillProficiencySlotsForCharacter(character);

      expect(available).toBe(0);
    });
  });

  describe('handleAttributeChange', () => {
    it('should return updated attributes', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      const updates = handleAttributeChange(character, 'agilidade', 3);

      expect(updates.attributes).toBeDefined();
      expect(updates.attributes?.agilidade).toBe(3);
    });

    it('should preserve other attributes when changing one', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.forca = 2;
      character.attributes.constituicao = 3;

      const updates = handleAttributeChange(character, 'agilidade', 4);

      expect(updates.attributes?.forca).toBe(2);
      expect(updates.attributes?.constituicao).toBe(3);
      expect(updates.attributes?.agilidade).toBe(4);
    });

    it('should handle Mente attribute changes', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      const updates = handleAttributeChange(character, 'mente', 3);

      expect(updates.attributes?.mente).toBe(3);
      // Language/proficiency validation is done separately
    });
  });

  describe('getAttributeWarnings', () => {
    it('should return empty array when no warnings', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 2;
      character.languages = ['comum', 'elfico']; // 1 additional, within limit

      const warnings = getAttributeWarnings(character);

      expect(warnings).toHaveLength(0);
    });

    it('should warn about excess languages', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 0 additional
      character.languages = ['comum', 'elfico', 'anao']; // 2 additional (excess!)

      const warnings = getAttributeWarnings(character);

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('idioma');
    });

    it('should warn about excess skill proficiencies', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 0; // Allows 3 proficiencies
      // Set 5 skills (excess!)
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'atletismo', 'adepto');
      setSkillProficiency(character, 'percepcao', 'adepto');
      setSkillProficiency(character, 'furtividade', 'adepto');
      setSkillProficiency(character, 'acrobacia', 'adepto');

      const warnings = getAttributeWarnings(character);

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes('proficiência'))).toBe(true);
    });

    it('should return multiple warnings when both limits exceeded', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.attributes.mente = 1; // Allows 0 languages, 4 proficiencies
      // Excess languages
      character.languages = ['comum', 'elfico', 'anao'];
      // Excess proficiencies
      setSkillProficiency(character, 'acerto', 'adepto');
      setSkillProficiency(character, 'atletismo', 'adepto');
      setSkillProficiency(character, 'percepcao', 'adepto');
      setSkillProficiency(character, 'furtividade', 'adepto');
      setSkillProficiency(character, 'acrobacia', 'adepto');
      setSkillProficiency(character, 'luta', 'adepto');

      const warnings = getAttributeWarnings(character);

      expect(warnings.length).toBe(2); // One for languages, one for proficiencies
    });
  });
});
