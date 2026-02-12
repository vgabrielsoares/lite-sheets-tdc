/**
 * Types Index - Exportação centralizada de todos os tipos
 *
 * Este arquivo exporta todos os tipos e interfaces do sistema de forma centralizada,
 * permitindo imports limpos e organizados em todo o projeto.
 */

// Common types
export type {
  UUID,
  Timestamp,
  ProficiencyLevel,
  DieSize,
  DicePoolDie,
  DicePoolResult,
  MovementType,
  SenseType,
  KeenSense,
  VisionType,
  CreatureSize,
  DiceType,
  DiceRoll,
  DiceRollResult,
  CurrencyType,
  DamageType,
  DamageResistance,
  DamageVulnerability,
  RangeType,
  Duration,
  EncumbranceState,
  DifficultyLevel,
  BaseEntity,
  Modifier,
  Resource,
  Note,
} from './common';

export {
  PROFICIENCY_MULTIPLIERS,
  PROFICIENCY_DIE_MAP,
  DIE_SIZE_TO_SIDES,
  CURRENCY_SYMBOLS,
  CURRENCY_CONVERSION,
  DIFFICULTY_VALUES,
} from './common';

// Notes system
export type { NotesSortField, SortOrder, NotesFilter } from './notes';

export { DEFAULT_NOTES_FILTER } from './notes';

// Attributes
export type {
  AttributeName,
  AttributeCategory,
  Attributes,
  AttributeModifier,
  AttributeDetails,
  AttributesWithDetails,
} from './attributes';

export {
  ATTRIBUTE_CATEGORIES,
  ATTRIBUTE_DEFAULT,
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX_DEFAULT,
  ATTRIBUTE_DESCRIPTIONS,
} from './attributes';

// Skills
export type {
  SkillName,
  Skill,
  Skills,
  SkillUse,
  SkillPoolCalculation,
  SkillPoolFormula,
  SkillModifierCalculation,
  SkillRollFormula,
  DefaultUseAttributeOverrides,
  DefaultUseModifierOverrides,
} from './skills';

export {
  SKILL_LIST,
  SKILL_KEY_ATTRIBUTES,
  COMBAT_SKILLS,
  SKILL_DESCRIPTIONS,
  UNTRAINED_USABLE_SKILLS,
  BASE_PROFICIENT_SKILLS,
} from './skills';

// Combat
export type {
  GuardPoints,
  VitalityPoints,
  HealthPoints,
  PowerPoints,
  CombatState,
  DyingState,
  VulnerabilityDieSize,
  VulnerabilityDie,
  TurnType,
  ActionEconomy,
  ExtraAction,
  ActionType,
  Defense,
  AttackType,
  AttackHitType,
  Attack,
  AttackResult,
  PPLimit,
  SavingThrowType,
  SavingThrow,
  Resistances,
  DamageReductionEntry,
  ConditionCategory,
  Condition,
  Initiative,
  CombatPenalties,
  CombatData,
} from './combat';

export {
  VULNERABILITY_DIE_STEPS,
  ATTACK_HIT_TYPE_LABELS,
  ATTACK_HIT_TYPE_DESCRIPTIONS,
  ATTACK_HIT_TYPE_COLORS,
  suggestHitType,
  SAVING_THROW_ATTRIBUTES,
  SAVING_THROW_SKILLS,
  DEFAULT_GA_LEVEL_1,
  DEFAULT_HP_LEVEL_1,
  DEFAULT_PP_LEVEL_1,
  BASE_DEFENSE,
  BASE_DYING_ROUNDS,
  PV_RECOVERY_COST,
} from './combat';

// Inventory
export type {
  DurabilityState,
  ItemDurability,
  DurabilityTestResult,
  ItemCategory,
  InventoryItem,
  WeaponProficiencyCategory,
  WeaponProperty,
  Weapon,
  ArmorType,
  Armor,
  Shield,
  ToolType,
  Tool,
  CarryingCapacity,
  Currency,
  TotalWealth,
  CurrencyConversion,
  Inventory,
} from './inventory';

export {
  BASE_CARRYING_CAPACITY,
  STRENGTH_CARRY_MULTIPLIER,
  COINS_WEIGHT_RATIO,
  DEFAULT_STARTING_ITEMS,
  STARTING_GOLD,
} from './inventory';

// Spells
export type {
  SpellCircle,
  SpellType,
  SpellMatrix,
  SpellClass,
  SpellComponent,
  Spell,
  KnownSpell,
  SpellPoints,
  SpellcastingSkillName,
  SpellcastingAbility,
  SpellcastingData,
} from './spells';

export { BASE_SPELL_DC, DEFAULT_SPELLCASTING_SKILLS } from './spells';

// Currency (dedicated types for currency system)
export type {
  CurrencyDenomination,
  CoinWeight,
  CurrencyConversionResult,
  WealthSummary,
  CurrencyLocation,
  CurrencyTransfer,
} from './currency';

export { DEFAULT_CURRENCY, EMPTY_DENOMINATION } from './currency';

// Re-export Currency and TotalWealth from currency.ts (canonical source)
// Note: These are also defined in inventory.ts for backward compatibility
export type { Currency as CurrencyData } from './currency';

// Resources
export type {
  ResourceDieState,
  ResourceDie,
  ResourceDieRollResult,
} from './resources';

export {
  RESOURCE_DIE_SCALE,
  RESOURCE_DIE_SIDES,
  getResourceDieIndex,
  stepDownResourceDie,
  stepUpResourceDie,
  processResourceUse,
} from './resources';

// Special Abilities
export type { SpecialAbilitySource, SpecialAbility } from './specialAbilities';

export { SPECIAL_ABILITY_SOURCE_LABELS } from './specialAbilities';

// Character
export type {
  ArchetypeName,
  Archetype,
  ArchetypeFeature,
  CharacterClass,
  ClassFeature,
  ClassImprovement,
  LanguageName,
  Proficiencies,
  Origin,
  AncestryTrait,
  Lineage,
  MovementSpeed,
  Movement,
  Senses,
  LuckLevel,
  Craft,
  ComplementaryTrait,
  CompleteTrait,
  Particularities,
  PhysicalDescription,
  CharacterDefiners,
  LevelProgression,
  LevelHistoryEntry,
  Experience,
  Character,
} from './character';

export { DEFAULT_LEVEL_1_CHARACTER } from './character';

// Traits (utilities for working with particularities)
export type {
  ComplementaryTrait as ComplementaryTraitUtil,
  CompleteTrait as CompleteTraitUtil,
} from './traits';

export {
  calculateTraitBalance,
  areTraitsBalanced,
  createEmptyComplementaryTrait,
  createEmptyCompleteTrait,
} from './traits';

// Wizard (Character Creation)
export type {
  WizardStep,
  WizardStepInfo,
  AttributeModifier as WizardAttributeModifier,
  WizardItem,
  WizardSpecialAbility,
  WizardOriginState,
  WizardLineageState,
  WizardArchetypeState,
  WizardProficiencyPurchase,
  WizardState,
  WizardValidationError,
} from './wizard';

export {
  WIZARD_STEPS,
  WIZARD_STEP_INFO,
  createInitialWizardState,
  calculateFinalAttributes,
  calculateAvailableFreePoints,
  hasLineagePlus2,
  getAttributeMaxLimit,
} from './wizard';
