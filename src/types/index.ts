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
  CURRENCY_SYMBOLS,
  CURRENCY_CONVERSION,
  DIFFICULTY_VALUES,
} from './common';

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
  HealthPoints,
  PowerPoints,
  CombatState,
  DyingState,
  ActionEconomy,
  ActionType,
  Defense,
  AttackType,
  Attack,
  AttackResult,
  PPLimit,
  SavingThrowType,
  SavingThrow,
  Resistances,
  Condition,
  Initiative,
  CombatData,
} from './combat';

export {
  DEFAULT_HP_LEVEL_1,
  DEFAULT_PP_LEVEL_1,
  BASE_DEFENSE,
  BASE_DYING_ROUNDS,
} from './combat';

// Inventory
export type {
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
  SpellType,
  SpellMatrix,
  MagicSchool,
  SpellComponents,
  SpellArea,
  Spell,
  KnownSpell,
  SpellcastingAbility,
  SpellcastingData,
} from './spells';

export {
  BASE_SPELL_DC,
  DEFAULT_SPELLCASTING_SKILLS,
  SPELL_MATRIX_BASE_COSTS,
} from './spells';

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
  Experience,
  Character,
} from './character';

export { DEFAULT_LEVEL_1_CHARACTER } from './character';
