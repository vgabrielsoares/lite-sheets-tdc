/**
 * Validation utilities for RPG system data
 *
 * Provides validation functions for attributes, levels, skills, and other game data
 * to ensure data integrity throughout the application.
 */

import type { AttributeName, ProficiencyLevel, SkillName } from '@/types';
import {
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX,
  ATTRIBUTE_MAX_LEVEL_1,
  ATTRIBUTE_LIST,
} from '@/constants/attributes';
import { SKILL_LIST } from '@/types';

/**
 * Validates if a value is a valid attribute value
 * Attributes normally range from 0 to 5, but can exceed 5 in special cases
 *
 * @param value - The attribute value to validate
 * @param allowExceedMax - Whether to allow values above 5 (default: true for flexibility)
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidAttributeValue(3); // true
 * isValidAttributeValue(0); // true
 * isValidAttributeValue(6); // true (can exceed in special cases)
 * isValidAttributeValue(-1); // false
 * isValidAttributeValue(6, false); // false (when not allowing exceed)
 */
export function isValidAttributeValue(
  value: number,
  allowExceedMax: boolean = true
): boolean {
  if (!Number.isInteger(value)) {
    return false;
  }
  if (value < ATTRIBUTE_MIN) {
    return false;
  }
  if (!allowExceedMax && value > ATTRIBUTE_MAX) {
    return false;
  }
  return true;
}

/**
 * Validates if a value is valid for a level 1 character attribute
 * At level 1, maximum attribute value is 3 (after all bonuses)
 *
 * @param value - The attribute value to validate
 * @returns True if valid for level 1, false otherwise
 *
 * @example
 * isValidLevel1AttributeValue(1); // true
 * isValidLevel1AttributeValue(3); // true
 * isValidLevel1AttributeValue(4); // false (exceeds level 1 max)
 * isValidLevel1AttributeValue(0); // true
 */
export function isValidLevel1AttributeValue(value: number): boolean {
  if (!isValidAttributeValue(value, false)) {
    return false;
  }
  return value <= ATTRIBUTE_MAX_LEVEL_1;
}

/**
 * Validates if a string is a valid attribute name
 *
 * @param name - The attribute name to validate
 * @returns True if valid attribute name, false otherwise
 *
 * @example
 * isValidAttributeName('agilidade'); // true
 * isValidAttributeName('corpo'); // true
 * isValidAttributeName('invalid'); // false
 */
export function isValidAttributeName(name: string): name is AttributeName {
  return ATTRIBUTE_LIST.includes(name as AttributeName);
}

/**
 * Validates if a character level is valid
 * Levels range from 1 to 15 (standard), but can go beyond for epic campaigns
 *
 * @param level - The character level to validate
 * @param allowEpic - Whether to allow levels beyond 15 (default: true)
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidCharacterLevel(1); // true
 * isValidCharacterLevel(15); // true
 * isValidCharacterLevel(20); // true (if allowEpic)
 * isValidCharacterLevel(0); // false
 * isValidCharacterLevel(20, false); // false (if not allowing epic)
 */
export function isValidCharacterLevel(
  level: number,
  allowEpic: boolean = true
): boolean {
  if (!Number.isInteger(level)) {
    return false;
  }
  if (level < 1) {
    return false;
  }
  if (!allowEpic && level > 15) {
    return false;
  }
  // Even in epic mode, set a reasonable upper limit
  if (level > 30) {
    return false;
  }
  return true;
}

/**
 * Validates if a string is a valid proficiency level
 *
 * @param level - The proficiency level to validate
 * @returns True if valid proficiency level, false otherwise
 *
 * @example
 * isValidProficiencyLevel('leigo'); // true
 * isValidProficiencyLevel('mestre'); // true
 * isValidProficiencyLevel('invalid'); // false
 */
export function isValidProficiencyLevel(
  level: string
): level is ProficiencyLevel {
  return ['leigo', 'adepto', 'versado', 'mestre'].includes(level);
}

/**
 * Validates if a string is a valid skill name
 *
 * @param name - The skill name to validate
 * @returns True if valid skill name, false otherwise
 *
 * @example
 * isValidSkillName('acerto'); // true
 * isValidSkillName('atletismo'); // true
 * isValidSkillName('invalid'); // false
 */
export function isValidSkillName(name: string): name is SkillName {
  return SKILL_LIST.includes(name as SkillName);
}

/**
 * Validates if Guard Points (GA) values are valid
 * Current GA cannot exceed max GA.
 *
 * @param current - Current GA
 * @param max - Maximum GA
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidGA(10, 15); // true
 * isValidGA(15, 15); // true
 * isValidGA(20, 15); // false (current > max)
 * isValidGA(-5, 15); // true (can be 0 or below in extreme cases)
 * isValidGA(10, 0); // false (max must be at least 1)
 */
export function isValidGA(current: number, max: number): boolean {
  if (!Number.isInteger(current) || !Number.isInteger(max)) {
    return false;
  }
  if (max < 1) {
    return false;
  }
  if (current > max) {
    return false;
  }
  if (current < 0) {
    return false;
  }
  return true;
}

/**
 * Validates if Vitality Points (PV) values are valid
 * Current PV cannot exceed max PV. PV = floor(GA_max / 3).
 *
 * @param current - Current PV
 * @param max - Maximum PV
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidPV(3, 5); // true
 * isValidPV(0, 5); // true (Ferimento Crítico)
 * isValidPV(6, 5); // false (current > max)
 */
export function isValidPV(current: number, max: number): boolean {
  if (!Number.isInteger(current) || !Number.isInteger(max)) {
    return false;
  }
  if (max < 1) {
    return false;
  }
  if (current > max) {
    return false;
  }
  if (current < 0) {
    return false;
  }
  return true;
}

/**
 * Validates if HP (Health Points) values are valid
 * @deprecated Use isValidGA + isValidPV in v0.0.2. Kept for backward compatibility.
 *
 * Current HP cannot exceed max HP, temporary HP is separate
 *
 * @param current - Current HP
 * @param max - Maximum HP
 * @param temporary - Temporary HP (default: 0)
 * @returns True if valid, false otherwise
 */
export function isValidHP(
  current: number,
  max: number,
  temporary: number = 0
): boolean {
  if (
    !Number.isInteger(current) ||
    !Number.isInteger(max) ||
    !Number.isInteger(temporary)
  ) {
    return false;
  }
  if (max < 1) {
    return false;
  }
  if (current > max) {
    return false;
  }
  if (temporary < 0) {
    return false;
  }
  return true;
}

/**
 * Validates if PP (Power Points) values are valid
 * Current PP cannot exceed max PP, temporary PP is separate
 *
 * @param current - Current PP
 * @param max - Maximum PP
 * @param temporary - Temporary PP (default: 0)
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidPP(2, 5); // true
 * isValidPP(5, 5); // true
 * isValidPP(6, 5); // false (current > max)
 * isValidPP(-1, 5); // false (cannot be negative)
 */
export function isValidPP(
  current: number,
  max: number,
  temporary: number = 0
): boolean {
  if (
    !Number.isInteger(current) ||
    !Number.isInteger(max) ||
    !Number.isInteger(temporary)
  ) {
    return false;
  }
  if (max < 0) {
    return false;
  }
  if (current < 0) {
    return false;
  }
  if (current > max) {
    return false;
  }
  if (temporary < 0) {
    return false;
  }
  return true;
}

/**
 * Validates if an XP (Experience Points) value is valid
 *
 * @param xp - The XP value to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidXP(0); // true
 * isValidXP(1000); // true
 * isValidXP(-100); // false
 */
export function isValidXP(xp: number): boolean {
  if (!Number.isInteger(xp)) {
    return false;
  }
  return xp >= 0;
}

/**
 * Validates if a defense value is reasonable
 * @deprecated Defesa fixa não existe mais em v0.0.2. Defesa agora é teste ativo.
 * Mantido para compatibilidade.
 *
 * Minimum defense is 15 (base), typically shouldn't exceed 30 at normal levels
 *
 * @param defense - The defense value to validate
 * @param allowHighValues - Whether to allow very high values (epic levels) (default: true)
 * @returns True if valid, false otherwise
 */
export function isValidDefense(
  defense: number,
  allowHighValues: boolean = true
): boolean {
  if (!Number.isInteger(defense)) {
    return false;
  }
  if (defense < 15) {
    return false;
  }
  if (!allowHighValues && defense > 30) {
    return false;
  }
  return true;
}

/**
 * Validates if a weight value is valid (in Peso units)
 *
 * @param weight - The weight value to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidWeight(0); // true
 * isValidWeight(10.5); // true (can be fractional before rounding)
 * isValidWeight(-1); // false
 */
export function isValidWeight(weight: number): boolean {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return false;
  }
  return weight >= 0;
}

/**
 * Validates if a currency amount is valid
 *
 * @param amount - The currency amount to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidCurrency(0); // true
 * isValidCurrency(100); // true
 * isValidCurrency(-10); // false
 */
export function isValidCurrency(amount: number): boolean {
  if (!Number.isInteger(amount)) {
    return false;
  }
  return amount >= 0;
}

/**
 * Validates if an archetype level is valid
 * Each archetype can have levels from 0 to character level
 *
 * @param archetypeLevel - The archetype level to validate
 * @param characterLevel - The character's total level
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidArchetypeLevel(0, 5); // true (can have 0 levels in an archetype)
 * isValidArchetypeLevel(3, 5); // true
 * isValidArchetypeLevel(6, 5); // false (exceeds character level)
 */
export function isValidArchetypeLevel(
  archetypeLevel: number,
  characterLevel: number
): boolean {
  if (!Number.isInteger(archetypeLevel) || !Number.isInteger(characterLevel)) {
    return false;
  }
  if (archetypeLevel < 0) {
    return false;
  }
  if (archetypeLevel > characterLevel) {
    return false;
  }
  return true;
}

/**
 * Validates if class levels are valid
 * Sum of all class levels must be ≤ character level
 *
 * @param classLevels - Array of class level values
 * @param characterLevel - The character's total level
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidClassLevels([1, 0, 0], 1); // true
 * isValidClassLevels([2, 3], 5); // true
 * isValidClassLevels([3, 4], 5); // false (sum 7 > 5)
 */
export function isValidClassLevels(
  classLevels: number[],
  characterLevel: number
): boolean {
  if (!Array.isArray(classLevels)) {
    return false;
  }
  if (!Number.isInteger(characterLevel) || characterLevel < 1) {
    return false;
  }

  // Check each individual class level
  for (const level of classLevels) {
    if (!Number.isInteger(level) || level < 0) {
      return false;
    }
  }

  // Sum of all class levels must not exceed character level
  const sum = classLevels.reduce((acc, level) => acc + level, 0);
  return sum <= characterLevel;
}

/**
 * Validates if a number of skill proficiencies is valid for a character
 * Formula: 3 + Mente (retroactive)
 *
 * @param numProficiencies - Number of proficient skills
 * @param mente - The Mente attribute value
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidSkillProficiencyCount(4, 1); // true (3 + 1 = 4)
 * isValidSkillProficiencyCount(6, 3); // true (3 + 3 = 6)
 * isValidSkillProficiencyCount(7, 3); // false (exceeds 3 + 3 = 6)
 */
export function isValidSkillProficiencyCount(
  numProficiencies: number,
  mente: number
): boolean {
  if (!Number.isInteger(numProficiencies) || !Number.isInteger(mente)) {
    return false;
  }
  if (numProficiencies < 0) {
    return false;
  }
  const maxAllowed = 3 + mente;
  return numProficiencies <= maxAllowed;
}

/**
 * Validates if a number of known languages is valid for a character
 * Formula: 1 (Comum) + Mente - 1 (minimum 1 total)
 *
 * @param numLanguages - Number of known languages (including Comum)
 * @param mente - The Mente attribute value
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidLanguageCount(1, 0); // true (Comum only)
 * isValidLanguageCount(3, 3); // true (Comum + 2 additional)
 * isValidLanguageCount(5, 3); // false (exceeds 1 + 3 - 1 = 3)
 */
export function isValidLanguageCount(
  numLanguages: number,
  mente: number
): boolean {
  if (!Number.isInteger(numLanguages) || !Number.isInteger(mente)) {
    return false;
  }
  if (numLanguages < 1) {
    return false; // Must at least know Comum
  }
  const maxAllowed = 1 + Math.max(mente - 1, 0);
  return numLanguages <= maxAllowed;
}

/**
 * Validates if a movement speed value is valid
 *
 * @param speed - The movement speed value to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidMovementSpeed(6); // true (typical walking speed)
 * isValidMovementSpeed(0); // true (immobilized)
 * isValidMovementSpeed(-1); // false
 */
export function isValidMovementSpeed(speed: number): boolean {
  if (!Number.isInteger(speed)) {
    return false;
  }
  return speed >= 0;
}
