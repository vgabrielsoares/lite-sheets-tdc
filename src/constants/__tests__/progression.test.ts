/**
 * Tests for progression constants and functions
 *
 * Covers:
 * - XP_TABLE values (all 31 levels)
 * - getXPForNextLevel (including overflow levels)
 * - canLevelUp
 * - calculateRemainingXP
 * - getSignatureAbilityBonus
 * - Level constants (CLASS_UNLOCK_LEVEL, etc.)
 */

import {
  XP_TABLE,
  XP_OVERFLOW_MULTIPLIER,
  getXPForNextLevel,
  canLevelUp,
  calculateRemainingXP,
  getSignatureAbilityBonus,
  STANDARD_MAX_LEVEL,
  EXTENDED_MAX_LEVEL,
  CLASS_UNLOCK_LEVEL,
  POWER_OR_TALENT_LEVELS,
  COMPETENCE_LEVELS,
  ARCHETYPE_FEATURE_LEVELS,
} from '@/constants/progression';

describe('XP_TABLE', () => {
  it('should have 31 entries (levels 0→1 through 30→31)', () => {
    expect(XP_TABLE).toHaveLength(31);
  });

  it('should have correct values for key levels', () => {
    expect(XP_TABLE[0]).toBe(15); // 0→1
    expect(XP_TABLE[1]).toBe(50); // 1→2
    expect(XP_TABLE[2]).toBe(125); // 2→3
    expect(XP_TABLE[3]).toBe(250); // 3→4
    expect(XP_TABLE[9]).toBe(2050); // 9→10
    expect(XP_TABLE[14]).toBe(4925); // 14→15
    expect(XP_TABLE[19]).toBe(10860); // 19→20
    expect(XP_TABLE[29]).toBe(25260); // 29→30
    expect(XP_TABLE[30]).toBe(30000); // 30→31
  });

  it('should have monotonically increasing values', () => {
    for (let i = 1; i < XP_TABLE.length; i++) {
      expect(XP_TABLE[i]).toBeGreaterThan(XP_TABLE[i - 1]);
    }
  });

  it('should have all positive values', () => {
    for (const xp of XP_TABLE) {
      expect(xp).toBeGreaterThan(0);
    }
  });
});

describe('getXPForNextLevel', () => {
  it('should return table values for levels within range', () => {
    expect(getXPForNextLevel(0)).toBe(15);
    expect(getXPForNextLevel(1)).toBe(50);
    expect(getXPForNextLevel(10)).toBe(2500);
    expect(getXPForNextLevel(30)).toBe(30000);
  });

  it('should handle negative levels by returning first table entry', () => {
    expect(getXPForNextLevel(-1)).toBe(15);
    expect(getXPForNextLevel(-5)).toBe(15);
  });

  it('should apply overflow multiplier for levels beyond table', () => {
    // Level 31→32: 30000 * 1.07 = 32100
    expect(getXPForNextLevel(31)).toBe(Math.floor(30000 * 1.07));

    // Level 32→33: 32100 * 1.07 = 34347
    expect(getXPForNextLevel(32)).toBe(
      Math.floor(Math.floor(30000 * 1.07) * 1.07)
    );
  });

  it('should always return integers (floor)', () => {
    for (let level = 0; level <= 35; level++) {
      expect(getXPForNextLevel(level) % 1).toBe(0);
    }
  });
});

describe('canLevelUp', () => {
  it('should return true when XP equals required', () => {
    expect(canLevelUp(15, 0)).toBe(true);
    expect(canLevelUp(50, 1)).toBe(true);
  });

  it('should return true when XP exceeds required', () => {
    expect(canLevelUp(100, 0)).toBe(true);
    expect(canLevelUp(200, 1)).toBe(true);
  });

  it('should return false when XP is insufficient', () => {
    expect(canLevelUp(0, 0)).toBe(false);
    expect(canLevelUp(14, 0)).toBe(false);
    expect(canLevelUp(49, 1)).toBe(false);
  });
});

describe('calculateRemainingXP', () => {
  it('should return 0 when XP equals required', () => {
    expect(calculateRemainingXP(15, 0)).toBe(0);
    expect(calculateRemainingXP(50, 1)).toBe(0);
  });

  it('should return excess XP', () => {
    expect(calculateRemainingXP(20, 0)).toBe(5); // 20 - 15 = 5
    expect(calculateRemainingXP(100, 1)).toBe(50); // 100 - 50 = 50
  });

  it('should return 0 when XP is insufficient', () => {
    expect(calculateRemainingXP(10, 0)).toBe(0);
    expect(calculateRemainingXP(0, 0)).toBe(0);
  });
});

describe('getSignatureAbilityBonus', () => {
  it('should return +1d for levels 1-5', () => {
    expect(getSignatureAbilityBonus(1)).toBe(1);
    expect(getSignatureAbilityBonus(2)).toBe(1);
    expect(getSignatureAbilityBonus(5)).toBe(1);
  });

  it('should return +2d for levels 6-10', () => {
    expect(getSignatureAbilityBonus(6)).toBe(2);
    expect(getSignatureAbilityBonus(7)).toBe(2);
    expect(getSignatureAbilityBonus(10)).toBe(2);
  });

  it('should return +3d for levels 11-15', () => {
    expect(getSignatureAbilityBonus(11)).toBe(3);
    expect(getSignatureAbilityBonus(15)).toBe(3);
  });

  it('should cap at 3 for levels above 15', () => {
    expect(getSignatureAbilityBonus(16)).toBe(3);
    expect(getSignatureAbilityBonus(30)).toBe(3);
  });

  it('should follow formula Math.min(3, Math.ceil(level / 5))', () => {
    for (let level = 1; level <= 30; level++) {
      expect(getSignatureAbilityBonus(level)).toBe(
        Math.min(3, Math.ceil(level / 5))
      );
    }
  });
});

describe('Level-related constants', () => {
  it('should have correct standard max level', () => {
    expect(STANDARD_MAX_LEVEL).toBe(15);
  });

  it('should have correct extended max level', () => {
    expect(EXTENDED_MAX_LEVEL).toBe(30);
  });

  it('should unlock classes at level 3', () => {
    expect(CLASS_UNLOCK_LEVEL).toBe(3);
  });

  it('POWER_OR_TALENT_LEVELS should include correct levels', () => {
    expect(POWER_OR_TALENT_LEVELS).toContain(2);
    expect(POWER_OR_TALENT_LEVELS).toContain(4);
    expect(POWER_OR_TALENT_LEVELS).toContain(6);
    expect(POWER_OR_TALENT_LEVELS).toContain(8);
  });

  it('COMPETENCE_LEVELS should include multiples of 5', () => {
    expect(COMPETENCE_LEVELS).toEqual([5, 10, 15]);
  });

  it('ARCHETYPE_FEATURE_LEVELS should include key levels', () => {
    expect(ARCHETYPE_FEATURE_LEVELS).toEqual([1, 5, 10, 15]);
  });

  it('XP_OVERFLOW_MULTIPLIER should be 1.07', () => {
    expect(XP_OVERFLOW_MULTIPLIER).toBe(1.07);
  });
});
