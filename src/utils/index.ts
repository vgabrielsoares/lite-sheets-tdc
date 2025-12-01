/**
 * Utility functions index
 *
 * Central export point for all utility functions used throughout the application.
 */

// Character factory
export { createDefaultCharacter } from './characterFactory';

// Calculation utilities
export {
  roundDown,
  calculateDefense,
  calculateSkillModifier,
  calculateTotalSkillModifier,
  calculateCarryCapacity,
  calculateMaxDyingRounds,
  calculatePPPerRound,
  calculateSignatureAbilityBonus,
  calculateRestHPRecovery,
  calculateAdditionalLanguages,
  calculateSkillProficiencies,
  calculateMaxPush,
  calculateMaxLift,
  calculateSpellDC,
  calculateSpellAttackBonus,
  calculateCoinWeight,
  getEncumbranceState,
  applyDeltaToHP,
  applyDeltaToPP,
} from './calculations';

// Validation utilities
export {
  isValidAttributeValue,
  isValidLevel1AttributeValue,
  isValidAttributeName,
  isValidCharacterLevel,
  isValidProficiencyLevel,
  isValidSkillName,
  isValidHP,
  isValidPP,
  isValidXP,
  isValidDefense,
  isValidWeight,
  isValidCurrency,
  isValidArchetypeLevel,
  isValidClassLevels,
  isValidSkillProficiencyCount,
  isValidLanguageCount,
  isValidMovementSpeed,
} from './validators';

// Lineage utilities
export {
  applyAttributeModifiers,
  validateAttributeModifier,
  calculateCarryingCapacity,
  getDefaultMovementSpeed,
  createDefaultMovement,
  getSizeModifierForSkill,
  createDefaultLineage,
  validateLineage,
  applyLineageToCharacter,
} from './lineageUtils';

// Origin utilities
export {
  createDefaultOrigin,
  validateOrigin,
  isOriginEmpty,
  getAttributeModifiersSummary,
  applyOriginAttributeModifiers,
  createExampleOrigin,
} from './originUtils';

// Attribute update utilities
export {
  getAvailableLanguageSlots,
  validateLanguages,
  getAvailableLanguageSlotsForCharacter,
  getAvailableSkillProficiencySlots,
  validateSkillProficiencies,
  getAvailableSkillProficiencySlotsForCharacter,
  handleAttributeChange,
  getAttributeWarnings,
} from './attributeUpdates';

// Skill calculation utilities
export {
  calculateSkillTotalModifier,
  calculateSkillRollFormula,
  calculateSkillRoll,
  hasLoadPenalty,
  requiresInstrument,
  requiresProficiency,
  isCombatSkill,
} from './skillCalculations';

// Proficiency calculation utilities
export {
  calculateMaxProficiencies,
  countAcquiredProficiencies,
  canAddProficiency,
  validateProficienciesLimit,
  getRemainingProficiencies,
  getProficiencyInfo,
  countProficienciesByLevel,
} from './proficiencyCalculations';
