/**
 * Utility functions for RPG system calculations
 *
 * All calculations follow Tabuleiro do Caos RPG rules (livro v0.1.7):
 * - Always round DOWN for fractional results
 * - Attributes range from 0 to 5 by default (can exceed in special cases, max 6)
 * - Attribute value 0: Roll 2d6 and take LOWEST result
 *
 * v0.0.2: GA (Guarda) + PV (Vitalidade) replace old HP system.
 * Defense is now an active test, not a fixed value.
 */

import type { ProficiencyLevel } from '@/types';
import type {
  GuardPoints,
  VitalityPoints,
  VulnerabilityDieSize,
} from '@/types/combat';
import { VULNERABILITY_DIE_STEPS, PV_RECOVERY_COST } from '@/types/combat';
import { SKILL_PROFICIENCY_LEVELS } from '@/constants';

/**
 * Rounds a number down to the nearest integer
 * Following RPG rule: "Sempre arredondamos para baixo, independente de seu valor"
 *
 * @param value - The number to round down
 * @returns The rounded down integer
 *
 * @example
 * roundDown(7.9); // 7
 * roundDown(3.5); // 3
 * roundDown(2.1); // 2
 * roundDown(-1.5); // -2 (rounds down, not towards zero)
 */
export function roundDown(value: number): number {
  return Math.floor(value);
}

/**
 * @deprecated Defesa fixa não existe mais em v0.0.2. Defesa agora é teste ativo (Reflexo ou Vigor).
 * Mantido para compatibilidade.
 *
 * Calculates the Defense value for a character (LEGACY)
 * Formula: 15 + Agilidade + outros bônus
 */
export function calculateDefense(
  agilidade: number,
  otherBonuses: number = 0
): number {
  return 15 + agilidade + otherBonuses;
}

// ─── GA (Guarda) & PV (Vitalidade) ─────────────────────────

/**
 * Calculates maximum Vitality Points (PV) from maximum Guard Points (GA)
 * Formula: floor(GA_max / 3)
 *
 * @param gaMax - Maximum Guard Points
 * @returns Maximum Vitality Points
 *
 * @example
 * calculateVitality(15); // 5 (floor(15/3))
 * calculateVitality(20); // 6 (floor(20/3))
 * calculateVitality(16); // 5 (floor(16/3))
 */
export function calculateVitality(gaMax: number): number {
  return roundDown(gaMax / 3);
}

/**
 * Applies damage to the Guard/Vitality system.
 * Damage hits GA first; overflow goes to PV.
 *
 * @param guard - Current guard state
 * @param vitality - Current vitality state
 * @param damage - Amount of raw damage (positive number)
 * @returns Updated guard and vitality states
 *
 * @example
 * // Damage absorbed by GA only
 * applyDamageToGuardVitality({current: 10, max: 15}, {current: 5, max: 5}, 5);
 * // → guard.current = 5, vitality.current = 5
 *
 * // Damage overflows from GA to PV
 * applyDamageToGuardVitality({current: 3, max: 15}, {current: 5, max: 5}, 7);
 * // → guard.current = 0, vitality.current = 1
 */
export function applyDamageToGuardVitality(
  guard: GuardPoints,
  vitality: VitalityPoints,
  damage: number
): { guard: GuardPoints; vitality: VitalityPoints } {
  if (damage <= 0) return { guard, vitality };

  let remaining = damage;
  let newTemporary = guard.temporary ?? 0;
  let newGuardCurrent = guard.current;
  let newVitalityCurrent = vitality.current;

  // Damage hits temporary GA first
  if (newTemporary > 0) {
    const tempDamage = Math.min(newTemporary, remaining);
    newTemporary -= tempDamage;
    remaining -= tempDamage;
  }

  // Then hits regular GA
  if (remaining > 0 && newGuardCurrent > 0) {
    const guardDamage = Math.min(newGuardCurrent, remaining);
    newGuardCurrent -= guardDamage;
    remaining -= guardDamage;
  }

  // Overflow goes to PV
  if (remaining > 0) {
    newVitalityCurrent = Math.max(0, newVitalityCurrent - remaining);
  }

  return {
    guard: { ...guard, current: newGuardCurrent, temporary: newTemporary },
    vitality: { ...vitality, current: newVitalityCurrent },
  };
}

/**
 * Applies healing to Guard Points (GA).
 * Cannot exceed max.
 *
 * @param guard - Current guard state
 * @param amount - Amount to heal (positive number)
 * @returns Updated guard state
 */
export function healGuard(guard: GuardPoints, amount: number): GuardPoints {
  if (amount <= 0) return guard;
  return {
    ...guard,
    current: Math.min(guard.current + amount, guard.max),
  };
}

/**
 * Applies healing to Vitality Points (PV).
 * PV recovery costs 5 recovery points per 1 PV.
 * Option should only be available when PV < PV_max AND recovery ≥ 5.
 *
 * @param vitality - Current vitality state
 * @param recoveryPoints - Total recovery points available
 * @returns Updated vitality state and remaining recovery points
 */
export function healVitality(
  vitality: VitalityPoints,
  recoveryPoints: number
): { vitality: VitalityPoints; remainingRecovery: number } {
  if (recoveryPoints < PV_RECOVERY_COST || vitality.current >= vitality.max) {
    return { vitality, remainingRecovery: recoveryPoints };
  }

  const pvCanHeal = vitality.max - vitality.current;
  const pvFromRecovery = roundDown(recoveryPoints / PV_RECOVERY_COST);
  const pvHealed = Math.min(pvCanHeal, pvFromRecovery);
  const recoverySpent = pvHealed * PV_RECOVERY_COST;

  return {
    vitality: {
      ...vitality,
      current: vitality.current + pvHealed,
    },
    remainingRecovery: recoveryPoints - recoverySpent,
  };
}

/**
 * Determines the effective GA max when PV is critically low.
 * Rule: When PV = 0, GA max is halved.
 *
 * @param gaMax - Normal maximum GA
 * @param pvCurrent - Current PV
 * @returns Effective GA max
 */
export function getEffectiveGAMax(gaMax: number, pvCurrent: number): number {
  if (pvCurrent <= 0) {
    return roundDown(gaMax / 2);
  }
  return gaMax;
}

/**
 * Adjusts current GA when PV crosses the 0 threshold.
 * Rule: When PV reaches 0, GA current is clamped to half of GA max.
 * When PV recovers from 0, GA current is restored to at least half of GA max.
 *
 * @param guardCurrent - Current GA value
 * @param gaMax - Maximum GA value (including modifiers)
 * @param pvWasZero - Whether PV was at 0 before
 * @param pvIsZero - Whether PV is at 0 now
 * @returns Adjusted GA current value
 */
export function adjustGAOnPVCrossing(
  guardCurrent: number,
  gaMax: number,
  pvWasZero: boolean,
  pvIsZero: boolean
): number {
  const halfMax = roundDown(gaMax / 2);

  // PV chegou a 0: limitar GA à metade
  if (!pvWasZero && pvIsZero) {
    return Math.min(guardCurrent, halfMax);
  }

  // PV saiu de 0: restaurar GA para pelo menos metade
  if (pvWasZero && !pvIsZero) {
    return Math.max(guardCurrent, halfMax);
  }

  // Sem mudança de estado
  return guardCurrent;
}

/**
 * Determines the combat state based on GA and PV values.
 *
 * @param gaCurrent - Current GA
 * @param gaMax - Maximum GA
 * @param pvCurrent - Current PV
 * @param pvMax - Maximum PV
 * @returns The current combat state
 */
export function determineCombatState(
  gaCurrent: number,
  gaMax: number,
  pvCurrent: number,
  pvMax: number
): 'normal' | 'ferimento-direto' | 'ferimento-critico' {
  if (pvCurrent <= 0) return 'ferimento-critico';
  if (pvCurrent < pvMax) return 'ferimento-direto';
  return 'normal';
}

// ─── Dado de Vulnerabilidade ────────────────────────────────

/**
 * Steps down the vulnerability die by one level.
 * d20 → d12 → d10 → d8 → d6 → d4
 * If already at d4, stays at d4.
 *
 * @param currentDie - Current vulnerability die size
 * @returns Next smaller die size
 *
 * @example
 * stepDownVulnerabilityDie('d20'); // 'd12'
 * stepDownVulnerabilityDie('d4');  // 'd4' (cannot go lower)
 */
export function stepDownVulnerabilityDie(
  currentDie: VulnerabilityDieSize
): VulnerabilityDieSize {
  const currentIndex = VULNERABILITY_DIE_STEPS.indexOf(currentDie);
  if (
    currentIndex === -1 ||
    currentIndex >= VULNERABILITY_DIE_STEPS.length - 1
  ) {
    return 'd4'; // Already at minimum or invalid
  }
  return VULNERABILITY_DIE_STEPS[currentIndex + 1];
}

/**
 * Resets the vulnerability die to d20 (start of combat or after Ferimento Crítico).
 *
 * @returns The default (largest) vulnerability die
 */
export function resetVulnerabilityDie(): VulnerabilityDieSize {
  return 'd20';
}

/**
 * Calculates the skill modifier based on attribute and proficiency level
 * Formula: Atributo × multiplicador de proficiência
 *
 * Proficiency multipliers:
 * - Leigo (x0): 0
 * - Adepto (x1): 1
 * - Versado (x2): 2
 * - Mestre (x3): 3
 *
 * @param attributeValue - The value of the key attribute for this skill
 * @param proficiencyLevel - The proficiency level ('leigo', 'adepto', 'versado', 'mestre')
 * @returns The calculated skill modifier
 *
 * @example
 * calculateSkillModifier(2, 'versado'); // 4 (2 × 2)
 * calculateSkillModifier(3, 'leigo'); // 0 (3 × 0)
 * calculateSkillModifier(4, 'mestre'); // 12 (4 × 3)
 * calculateSkillModifier(0, 'adepto'); // 0 (0 × 1)
 */
export function calculateSkillModifier(
  attributeValue: number,
  proficiencyLevel: ProficiencyLevel
): number {
  const multiplier = SKILL_PROFICIENCY_LEVELS[proficiencyLevel];
  return attributeValue * multiplier;
}

/**
 * Calculates the carry capacity for a character
 * Formula: 5 + (Corpo × 5)
 * Result is in "Espaço" units (RPG measurement)
 *
 * @param corpo - The Corpo (Body) attribute value
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The total carry capacity in "Espaço" units
 *
 * @example
 * calculateCarryCapacity(1); // 10 (5 + 1 × 5)
 * calculateCarryCapacity(3); // 20 (5 + 3 × 5)
 * calculateCarryCapacity(2, 5); // 20 (5 + 2 × 5 + 5)
 */
export function calculateCarryCapacity(
  corpo: number,
  otherBonuses: number = 0
): number {
  return 5 + corpo * 5 + otherBonuses;
}

/**
 * Calculates the maximum number of rounds a character can stay in "Morrendo" (Dying) state
 * Formula: 2 + Corpo + outros modificadores
 *
 * @param corpo - The Corpo (Body) attribute value
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The maximum number of rounds before death
 *
 * @example
 * calculateMaxDyingRounds(1); // 3 (2 + 1)
 * calculateMaxDyingRounds(3); // 5 (2 + 3)
 * calculateMaxDyingRounds(2, 1); // 5 (2 + 2 + 1)
 */
export function calculateMaxDyingRounds(
  corpo: number,
  otherBonuses: number = 0
): number {
  return 2 + corpo + otherBonuses;
}

/**
 * Calculates the maximum PP (Power Points) a character can spend per round
 * Formula: Nível do Personagem + Essência + outros modificadores
 *
 * @param characterLevel - The character's current level
 * @param essencia - The Essência (Essence) attribute value
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The maximum PP that can be spent in a single round
 *
 * @example
 * calculatePPPerRound(1, 2); // 3 (1 + 2)
 * calculatePPPerRound(5, 3); // 8 (5 + 3)
 * calculatePPPerRound(3, 2, 1); // 6 (3 + 2 + 1)
 */
export function calculatePPPerRound(
  characterLevel: number,
  essencia: number,
  otherBonuses: number = 0
): number {
  return characterLevel + essencia + otherBonuses;
}

/**
 * Calculates the Signature Ability dice bonus based on character level
 *
 * Formula: Math.min(3, Math.ceil(level / 5))
 * - Level 1-5: +1d
 * - Level 6-10: +2d
 * - Level 11-15: +3d
 *
 * No combat/non-combat distinction in v0.0.2.
 *
 * @param characterLevel - The character's current level
 * @param _isCombatSkill - @deprecated Ignored in v0.0.2 (kept for backward compat)
 * @returns The number of bonus dice (+Xd) to add to the skill pool
 *
 * @example
 * calculateSignatureAbilityBonus(1); // 1 (+1d)
 * calculateSignatureAbilityBonus(5); // 1 (+1d)
 * calculateSignatureAbilityBonus(6); // 2 (+2d)
 * calculateSignatureAbilityBonus(10); // 2 (+2d)
 * calculateSignatureAbilityBonus(11); // 3 (+3d)
 * calculateSignatureAbilityBonus(15); // 3 (+3d)
 */
export function calculateSignatureAbilityBonus(
  characterLevel: number,
  _isCombatSkill?: boolean
): number {
  return Math.min(3, Math.ceil(characterLevel / 5));
}

/**
 * Calculates the total skill modifier including signature ability bonus
 * Formula: (Atributo × multiplicador de proficiência) + bônus de assinatura + outros modificadores
 *
 * @param attributeValue - The value of the key attribute for this skill
 * @param proficiencyLevel - The proficiency level ('leigo', 'adepto', 'versado', 'mestre')
 * @param isSignature - Whether this is the character's signature ability
 * @param characterLevel - The character's current level (required if isSignature is true)
 * @param isCombatSkill - Whether this is a combat skill (required if isSignature is true)
 * @param otherModifiers - Additional modifiers from equipment, spells, etc. (default: 0)
 * @returns The total calculated skill modifier
 *
 * @example
 * calculateTotalSkillModifier(2, 'versado', false, 1, false); // 4 (2 × 2 + 0)
 * calculateTotalSkillModifier(3, 'adepto', true, 5, false); // 8 (3 × 1 + 5)
 * calculateTotalSkillModifier(2, 'versado', true, 9, true); // 7 (2 × 2 + 3)
 * calculateTotalSkillModifier(4, 'mestre', false, 1, false, 2); // 14 (4 × 3 + 0 + 2)
 */
export function calculateTotalSkillModifier(
  attributeValue: number,
  proficiencyLevel: ProficiencyLevel,
  isSignature: boolean,
  characterLevel: number,
  isCombatSkill: boolean,
  otherModifiers: number = 0
): number {
  const baseModifier = calculateSkillModifier(attributeValue, proficiencyLevel);
  const signatureBonus = isSignature
    ? calculateSignatureAbilityBonus(characterLevel, isCombatSkill)
    : 0;
  return baseModifier + signatureBonus + otherModifiers;
}

/**
 * Calculates GA recovery from a Descanso (Rest) using the Dormir (Sleep) action
 * Formula: Nível do Personagem × Corpo + outros modificadores
 *
 * In v0.0.2, this restores Guard Points (GA), not HP.
 *
 * @param characterLevel - The character's current level
 * @param corpo - The Corpo (Body) attribute value
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The amount of GA recovered
 *
 * @example
 * calculateRestGARecovery(1, 2); // 2 (1 × 2)
 * calculateRestGARecovery(5, 3); // 15 (5 × 3)
 * calculateRestGARecovery(3, 2, 5); // 11 (3 × 2 + 5)
 */
export function calculateRestGARecovery(
  characterLevel: number,
  corpo: number,
  otherBonuses: number = 0
): number {
  return characterLevel * corpo + otherBonuses;
}

/**
 * @deprecated Substituído por calculateRestGARecovery em v0.0.2.
 * Mantido para compatibilidade.
 */
export const calculateRestHPRecovery = calculateRestGARecovery;

/**
 * Calculates the number of additional languages known based on Mente attribute
 * Formula: Mente - 1 (minimum 0)
 * This is retroactive - if Mente increases, languages increase
 *
 * Note: Comum (Common) language is always known by default (not counted here)
 *
 * @param mente - The Mente (Mind) attribute value
 * @returns The number of additional languages the character knows
 *
 * @example
 * calculateAdditionalLanguages(1); // 0 (1 - 1 = 0)
 * calculateAdditionalLanguages(3); // 2 (3 - 1 = 2)
 * calculateAdditionalLanguages(0); // 0 (minimum 0)
 */
export function calculateAdditionalLanguages(mente: number): number {
  return Math.max(mente - 1, 0);
}

/**
 * Calculates the number of skill proficiencies a character gets
 * Formula: 3 + Mente
 * This is retroactive - if Mente increases, available proficiencies increase
 *
 * @param mente - The Mente (Mind) attribute value
 * @returns The number of skills the character can be proficient in
 *
 * @example
 * calculateSkillProficiencies(1); // 4 (3 + 1)
 * calculateSkillProficiencies(3); // 6 (3 + 3)
 * calculateSkillProficiencies(0); // 3 (3 + 0)
 */
export function calculateSkillProficiencies(mente: number): number {
  return 3 + mente;
}

/**
 * Calculates the maximum weight a character can push
 * Formula: 2 × Capacidade de Carga Total
 *
 * @param carryCapacity - The character's total carry capacity
 * @returns The maximum weight that can be pushed
 *
 * @example
 * calculateMaxPush(10); // 20
 * calculateMaxPush(20); // 40
 */
export function calculateMaxPush(carryCapacity: number): number {
  return carryCapacity * 2;
}

/**
 * Calculates the maximum weight a character can lift
 * Formula: Capacidade de Carga Total ÷ 2 (round down)
 *
 * @param carryCapacity - The character's total carry capacity
 * @returns The maximum weight that can be lifted
 *
 * @example
 * calculateMaxLift(10); // 5
 * calculateMaxLift(15); // 7 (15 ÷ 2 = 7.5, round down)
 */
export function calculateMaxLift(carryCapacity: number): number {
  return roundDown(carryCapacity / 2);
}

/**
 * Calculates the spell difficulty class (ND) for a character's spells
 * Formula: 12 + Essência + Habilidade de Conjuração + Bônus de ND
 *
 * @param essencia - The Essência (Essence) attribute value
 * @param spellcastingSkillModifier - The modifier from the spellcasting skill (Arcano, Religião, etc.)
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The spell difficulty class
 *
 * @example
 * calculateSpellDC(2, 4); // 18 (12 + 2 + 4)
 * calculateSpellDC(3, 6, 2); // 23 (12 + 3 + 6 + 2)
 */
export function calculateSpellDC(
  essencia: number,
  spellcastingSkillModifier: number,
  otherBonuses: number = 0
): number {
  return 12 + essencia + spellcastingSkillModifier + otherBonuses;
}

/**
 * Calculates the spell attack bonus for a character
 * Formula: Essência + Habilidade de Conjuração + Bônus de Ataque
 *
 * @param essencia - The Essência (Essence) attribute value
 * @param spellcastingSkillModifier - The modifier from the spellcasting skill (Arcano, Religião, etc.)
 * @param otherBonuses - Additional bonuses from abilities, equipment, etc. (default: 0)
 * @returns The spell attack bonus
 *
 * @example
 * calculateSpellAttackBonus(2, 4); // 6 (2 + 4)
 * calculateSpellAttackBonus(3, 6, 2); // 11 (3 + 6 + 2)
 */
export function calculateSpellAttackBonus(
  essencia: number,
  spellcastingSkillModifier: number,
  otherBonuses: number = 0
): number {
  return essencia + spellcastingSkillModifier + otherBonuses;
}

/**
 * Calculates weight contribution from physical coins (moedas físicas)
 * Each 100 physical coins count as 1 Peso
 *
 * @param totalPhysicalCoins - Total number of physical coins carried
 * @returns Weight in Peso units
 *
 * @example
 * calculateCoinWeight(50); // 0 (less than 100)
 * calculateCoinWeight(100); // 1
 * calculateCoinWeight(250); // 2 (250 ÷ 100 = 2.5, round down)
 */
export function calculateCoinWeight(totalPhysicalCoins: number): number {
  return roundDown(totalPhysicalCoins / 100);
}

/**
 * Determines the character's encumbrance state based on current load
 * - Normal: 0 to carry capacity
 * - Sobrecarregado (Overloaded): carry capacity + 1 to 2× carry capacity
 * - Imobilizado (Immobilized): more than 2× carry capacity
 *
 * @param currentLoad - The current weight being carried (in Peso)
 * @param carryCapacity - The character's carry capacity (in Peso)
 * @returns Encumbrance state: 'normal' | 'sobrecarregado' | 'imobilizado'
 *
 * @example
 * getEncumbranceState(5, 10); // 'normal'
 * getEncumbranceState(15, 10); // 'sobrecarregado'
 * getEncumbranceState(21, 10); // 'imobilizado'
 */
export function getEncumbranceState(
  currentLoad: number,
  carryCapacity: number
): 'normal' | 'sobrecarregado' | 'imobilizado' {
  if (currentLoad > carryCapacity * 2) {
    return 'imobilizado';
  }
  if (currentLoad > carryCapacity) {
    return 'sobrecarregado';
  }
  return 'normal';
}

/**
 * Applies damage to Health Points prioritizing temporary HP first.
 * When adding (healing), only current HP increases; temporary does not auto-recover.
 *
 * @deprecated Use applyDamageToGuardVitality + healGuard for v0.0.2.
 * Kept for backward compatibility with any remaining HP-based code.
 *
 * @param hp - Current HP object { max, current, temporary }
 * @param delta - Negative for damage, positive for healing
 * @returns Updated HP object
 */
export function applyDeltaToHP(
  hp: { max: number; current: number; temporary: number },
  delta: number
) {
  if (delta === 0) return hp;
  if (delta < 0) {
    const damage = Math.abs(delta);
    let remaining = damage;
    let newTemp = hp.temporary;
    let newCurrent = hp.current;

    if (newTemp > 0) {
      const tempDamage = Math.min(newTemp, remaining);
      newTemp -= tempDamage;
      remaining -= tempDamage;
    }
    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }
    return { ...hp, current: newCurrent, temporary: newTemp };
  }
  // Healing: increase current only, cap at max
  const healed = Math.min(hp.current + delta, hp.max);
  return { ...hp, current: healed };
}

/**
 * Applies a delta to PP (Power Points) following the same logic as HP
 * - Spending (negative delta): Subtract from temporary first, then current
 * - Recovery (positive delta): Add to current only, cap at max
 *
 * @param pp - Current PP state with max, current, and temporary values
 * @param delta - The change to apply (negative for spending, positive for recovery)
 * @returns New PP state after applying the delta
 *
 * @example
 * // Spending PP: temporary first, then current
 * applyDeltaToPP({ max: 10, current: 5, temporary: 3 }, -4); // { max: 10, current: 4, temporary: 0 }
 * applyDeltaToPP({ max: 10, current: 5, temporary: 0 }, -2); // { max: 10, current: 3, temporary: 0 }
 *
 * // Recovering PP: add to current, cap at max
 * applyDeltaToPP({ max: 10, current: 5, temporary: 0 }, 3); // { max: 10, current: 8, temporary: 0 }
 * applyDeltaToPP({ max: 10, current: 9, temporary: 0 }, 5); // { max: 10, current: 10, temporary: 0 }
 */
export function applyDeltaToPP(
  pp: { max: number; current: number; temporary: number },
  delta: number
) {
  if (delta === 0) return pp;
  if (delta < 0) {
    const cost = Math.abs(delta);
    let remaining = cost;
    let newTemp = pp.temporary;
    let newCurrent = pp.current;

    // Subtract from temporary first
    if (newTemp > 0) {
      const tempCost = Math.min(newTemp, remaining);
      newTemp -= tempCost;
      remaining -= tempCost;
    }
    // Then subtract remaining from current
    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }
    return { ...pp, current: newCurrent, temporary: newTemp };
  }
  // Recovery: increase current only, cap at max
  const recovered = Math.min(pp.current + delta, pp.max);
  return { ...pp, current: recovered };
}

/**
 * Calculates the craft proficiency multiplier based on craft level
 * Formula:
 * - Level 0: x0
 * - Level 1-2: x1
 * - Level 3-4: x2
 * - Level 5: x3
 *
 * @param level - The craft level (0-5)
 * @returns The multiplier for the craft
 *
 * @example
 * getCraftMultiplier(0); // 0
 * getCraftMultiplier(1); // 1
 * getCraftMultiplier(2); // 1
 * getCraftMultiplier(3); // 2
 * getCraftMultiplier(4); // 2
 * getCraftMultiplier(5); // 3
 */
export function getCraftMultiplier(level: 0 | 1 | 2 | 3 | 4 | 5): number {
  if (level === 0) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  return 3;
}

/**
 * Calculates the total craft modifier
 * Formula: Atributo-chave × Multiplicador de Nível + Outros Modificadores
 *
 * @param attributeValue - The value of the key attribute for this craft
 * @param level - The craft level (0-5)
 * @param otherModifiers - Sum of other modifiers (default: 0)
 * @returns The total calculated craft modifier
 *
 * @example
 * calculateCraftModifier(2, 0); // 0 (2 × 0)
 * calculateCraftModifier(2, 1); // 2 (2 × 1)
 * calculateCraftModifier(2, 2); // 2 (2 × 1)
 * calculateCraftModifier(3, 3); // 6 (3 × 2)
 * calculateCraftModifier(3, 4); // 6 (3 × 2)
 * calculateCraftModifier(4, 5); // 12 (4 × 3)
 * calculateCraftModifier(2, 3, 2); // 8 (2 × 2 + 2)
 */
export function calculateCraftModifier(
  attributeValue: number,
  level: 0 | 1 | 2 | 3 | 4 | 5,
  otherModifiers: number = 0
): number {
  const multiplier = getCraftMultiplier(level);
  return attributeValue * multiplier + otherModifiers;
}
