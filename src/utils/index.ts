/**
 * Utility functions index
 *
 * Central export point for all utility functions used throughout the application.
 */

// UUID generation (optimized with native crypto API)
export {
  uuidv4,
  isNativeUUIDAvailable,
  isValidUUID,
  generateBulkUUIDs,
} from './uuid';

// Character factory
export {
  createDefaultCharacter,
  UNARMED_ATTACK_NAME,
} from './characterFactory';

// Dice rolling utilities
export {
  rollD20,
  rollDamage,
  rollDamageWithCritical,
  rollSkillTest,
  DiceRollHistory,
  globalDiceHistory,
  type DiceRollResult,
  type RollType,
} from './diceRoller';

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
  getCraftMultiplier,
  calculateCraftModifier,
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

// Craft sync utilities
export {
  craftToSkillUse,
  skillUseToCraft,
  syncCraftsToOficioSkill,
  syncOficioSkillToCrafts,
  calculateCraftBaseModifier,
  calculateCraftTotalModifier,
} from './craftSync';

// Language management utilities
export {
  getTotalLanguageSlots,
  getLineageLanguages,
  getMaxAllowedLanguages,
  canAddLanguage,
  addLanguage,
  canRemoveLanguage,
  removeLanguage,
  getAvailableLanguages,
  validateLanguageSelection,
  ensureComumLanguage,
  getLanguageSummary,
} from './languageUtils';

// Sense calculation utilities
export {
  calculateSenseModifier,
  calculateAllSenses,
  getKeenSenseBonus,
  PERCEPTION_USE_TO_SENSE,
  SENSE_TO_PERCEPTION_USE,
  SENSE_USE_LABELS,
  SENSE_ICONS,
} from './senseCalculations';
export type { SenseCalculationResult } from './senseCalculations';

// Combat penalties utilities
export {
  createDefaultCombatPenalties,
  applyDefensePenalty,
  resetDefensePenalty,
  applySavingThrowPenalty,
  resetSavingThrowPenalty,
  resetAllPenalties,
  calculateEffectiveDefense,
  hasAnyPenalty,
  MIN_DEFENSE,
  DEFENSE_PENALTY_PER_MISS,
  SAVING_THROW_DICE_PENALTY_PER_SUCCESS,
  SAVING_THROW_LABELS,
  SAVING_THROW_COLORS,
} from './combatPenalties';
export type { CombatPenaltiesState } from './combatPenalties';

// Currency calculation utilities
export {
  convertToCopper,
  copperToDenomination,
  calculateTotalWealth,
  addDenominations,
  subtractDenominations,
  convertCurrency,
  exchangeCurrency,
  calculateCoinWeight as calculateCurrencyCoinWeight,
  calculateWealthSummary,
  formatCurrency,
  formatDenomination,
  formatTotalAs,
  canAfford,
  isValidDenomination,
  isValidCurrencyType,
  makePayment,
  addCurrency,
  removeCurrency,
  transferCurrency,
} from './currencyCalculations';

// Carry capacity calculation utilities
export {
  calculateBaseCarryCapacity,
  getSizeCarryModifier,
  calculateCarryCapacity as calculateCarryCapacityFromForce,
  calculatePushCapacity,
  calculateLiftCapacity,
  getEncumbranceState as getCarryEncumbranceState,
  calculateCoinsWeight,
  calculateItemsWeight,
  countZeroWeightItems,
  calculateTotalWeight,
  calculateFullCarryCapacity,
  generateCarryingCapacity,
  calculateCarryPercentage,
  canCarryWithoutPenalty,
  canCarryAtAll,
  ENCUMBRANCE_STATE_DESCRIPTIONS,
  ENCUMBRANCE_STATE_COLORS,
} from './carryCapacityCalculations';
export type {
  EncumbranceState,
  CarryCapacityResult,
} from './carryCapacityCalculations';

// Spell calculation utilities
// Note: calculateSpellDC and calculateSpellAttackBonus are already exported from './calculations'
export {
  calculateSpellLearningChance,
  calculateSpellPPCost,
} from './spellCalculations';

// Rest calculation utilities
export {
  calculateRestRecovery,
  getQualityMultiplier,
  validateRestInputs,
  REST_QUALITY_LABELS,
  REST_QUALITY_DESCRIPTIONS,
} from './restCalculations';
export type { RestQuality, RestRecovery } from './restCalculations';
