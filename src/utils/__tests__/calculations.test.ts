/**
 * Tests for calculation utilities
 */

import {
  roundDown,
  calculateDefense,
  calculateSkillModifier,
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
} from '../calculations';

describe('roundDown', () => {
  it('should round down positive decimals', () => {
    expect(roundDown(7.9)).toBe(7);
    expect(roundDown(3.5)).toBe(3);
    expect(roundDown(2.1)).toBe(2);
    expect(roundDown(1.99)).toBe(1);
  });

  it('should round down negative decimals (toward more negative)', () => {
    expect(roundDown(-1.5)).toBe(-2);
    expect(roundDown(-2.1)).toBe(-3);
  });

  it('should return same value for integers', () => {
    expect(roundDown(5)).toBe(5);
    expect(roundDown(0)).toBe(0);
    expect(roundDown(-3)).toBe(-3);
  });
});

describe('calculateDefense', () => {
  it('should calculate defense with only agilidade', () => {
    expect(calculateDefense(0)).toBe(15);
    expect(calculateDefense(1)).toBe(16);
    expect(calculateDefense(2)).toBe(17);
    expect(calculateDefense(3)).toBe(18);
    expect(calculateDefense(5)).toBe(20);
  });

  it('should calculate defense with agilidade and bonuses', () => {
    expect(calculateDefense(2, 2)).toBe(19); // 15 + 2 + 2
    expect(calculateDefense(3, 5)).toBe(23); // 15 + 3 + 5
    expect(calculateDefense(0, 10)).toBe(25); // 15 + 0 + 10
  });

  it('should handle negative bonuses', () => {
    expect(calculateDefense(3, -1)).toBe(17); // 15 + 3 - 1
  });
});

describe('calculateSkillModifier', () => {
  it('should calculate modifier for leigo proficiency', () => {
    expect(calculateSkillModifier(0, 'leigo')).toBe(0); // 0 × 0
    expect(calculateSkillModifier(3, 'leigo')).toBe(0); // 3 × 0
    expect(calculateSkillModifier(5, 'leigo')).toBe(0); // 5 × 0
  });

  it('should calculate modifier for adepto proficiency', () => {
    expect(calculateSkillModifier(0, 'adepto')).toBe(0); // 0 × 1
    expect(calculateSkillModifier(2, 'adepto')).toBe(2); // 2 × 1
    expect(calculateSkillModifier(4, 'adepto')).toBe(4); // 4 × 1
  });

  it('should calculate modifier for versado proficiency', () => {
    expect(calculateSkillModifier(0, 'versado')).toBe(0); // 0 × 2
    expect(calculateSkillModifier(2, 'versado')).toBe(4); // 2 × 2
    expect(calculateSkillModifier(3, 'versado')).toBe(6); // 3 × 2
  });

  it('should calculate modifier for mestre proficiency', () => {
    expect(calculateSkillModifier(0, 'mestre')).toBe(0); // 0 × 3
    expect(calculateSkillModifier(2, 'mestre')).toBe(6); // 2 × 3
    expect(calculateSkillModifier(4, 'mestre')).toBe(12); // 4 × 3
  });
});

describe('calculateCarryCapacity', () => {
  it('should calculate carry capacity with only força', () => {
    expect(calculateCarryCapacity(0)).toBe(5); // 5 + 0 × 5
    expect(calculateCarryCapacity(1)).toBe(10); // 5 + 1 × 5
    expect(calculateCarryCapacity(2)).toBe(15); // 5 + 2 × 5
    expect(calculateCarryCapacity(3)).toBe(20); // 5 + 3 × 5
  });

  it('should calculate carry capacity with força and bonuses', () => {
    expect(calculateCarryCapacity(2, 5)).toBe(20); // 5 + 2 × 5 + 5
    expect(calculateCarryCapacity(1, 10)).toBe(20); // 5 + 1 × 5 + 10
  });

  it('should handle negative bonuses', () => {
    expect(calculateCarryCapacity(3, -5)).toBe(15); // 5 + 3 × 5 - 5
  });
});

describe('calculateMaxDyingRounds', () => {
  it('should calculate max dying rounds', () => {
    expect(calculateMaxDyingRounds(0)).toBe(2); // 2 + 0
    expect(calculateMaxDyingRounds(1)).toBe(3); // 2 + 1
    expect(calculateMaxDyingRounds(2)).toBe(4); // 2 + 2
    expect(calculateMaxDyingRounds(3)).toBe(5); // 2 + 3
  });

  it('should calculate max dying rounds with bonuses', () => {
    expect(calculateMaxDyingRounds(1, 2)).toBe(5); // 2 + 1 + 2
    expect(calculateMaxDyingRounds(2, 1)).toBe(5); // 2 + 2 + 1
  });
});

describe('calculatePPPerRound', () => {
  it('should calculate PP per round', () => {
    expect(calculatePPPerRound(1, 1)).toBe(2); // 1 + 1
    expect(calculatePPPerRound(1, 2)).toBe(3); // 1 + 2
    expect(calculatePPPerRound(5, 3)).toBe(8); // 5 + 3
  });

  it('should calculate PP per round with bonuses', () => {
    expect(calculatePPPerRound(3, 2, 1)).toBe(6); // 3 + 2 + 1
    expect(calculatePPPerRound(5, 3, 2)).toBe(10); // 5 + 3 + 2
  });
});

describe('calculateSignatureAbilityBonus', () => {
  it('should calculate bonus for non-combat skills (equals level)', () => {
    expect(calculateSignatureAbilityBonus(1, false)).toBe(1);
    expect(calculateSignatureAbilityBonus(5, false)).toBe(5);
    expect(calculateSignatureAbilityBonus(10, false)).toBe(10);
    expect(calculateSignatureAbilityBonus(15, false)).toBe(15);
  });

  it('should calculate bonus for combat skills (level ÷ 3, min 1)', () => {
    expect(calculateSignatureAbilityBonus(1, true)).toBe(1); // 1 ÷ 3 = 0.33, min 1
    expect(calculateSignatureAbilityBonus(2, true)).toBe(1); // 2 ÷ 3 = 0.66, min 1
    expect(calculateSignatureAbilityBonus(3, true)).toBe(1); // 3 ÷ 3 = 1
    expect(calculateSignatureAbilityBonus(4, true)).toBe(1); // 4 ÷ 3 = 1.33, round down
    expect(calculateSignatureAbilityBonus(6, true)).toBe(2); // 6 ÷ 3 = 2
    expect(calculateSignatureAbilityBonus(9, true)).toBe(3); // 9 ÷ 3 = 3
    expect(calculateSignatureAbilityBonus(10, true)).toBe(3); // 10 ÷ 3 = 3.33, round down
  });
});

describe('calculateRestHPRecovery', () => {
  it('should calculate HP recovery from rest', () => {
    expect(calculateRestHPRecovery(1, 1)).toBe(1); // 1 × 1
    expect(calculateRestHPRecovery(1, 2)).toBe(2); // 1 × 2
    expect(calculateRestHPRecovery(5, 3)).toBe(15); // 5 × 3
    expect(calculateRestHPRecovery(3, 2)).toBe(6); // 3 × 2
  });

  it('should calculate HP recovery with bonuses', () => {
    expect(calculateRestHPRecovery(3, 2, 5)).toBe(11); // 3 × 2 + 5
    expect(calculateRestHPRecovery(5, 3, 10)).toBe(25); // 5 × 3 + 10
  });

  it('should handle zero constituição', () => {
    expect(calculateRestHPRecovery(5, 0)).toBe(0); // 5 × 0
  });
});

describe('calculateAdditionalLanguages', () => {
  it('should calculate additional languages (Mente - 1, min 0)', () => {
    expect(calculateAdditionalLanguages(0)).toBe(0); // 0 - 1 = -1, min 0
    expect(calculateAdditionalLanguages(1)).toBe(0); // 1 - 1 = 0
    expect(calculateAdditionalLanguages(2)).toBe(1); // 2 - 1 = 1
    expect(calculateAdditionalLanguages(3)).toBe(2); // 3 - 1 = 2
    expect(calculateAdditionalLanguages(5)).toBe(4); // 5 - 1 = 4
  });
});

describe('calculateSkillProficiencies', () => {
  it('should calculate number of skill proficiencies (3 + Mente)', () => {
    expect(calculateSkillProficiencies(0)).toBe(3); // 3 + 0
    expect(calculateSkillProficiencies(1)).toBe(4); // 3 + 1
    expect(calculateSkillProficiencies(2)).toBe(5); // 3 + 2
    expect(calculateSkillProficiencies(3)).toBe(6); // 3 + 3
    expect(calculateSkillProficiencies(5)).toBe(8); // 3 + 5
  });
});

describe('calculateMaxPush', () => {
  it('should calculate max push weight (2 × carry capacity)', () => {
    expect(calculateMaxPush(10)).toBe(20);
    expect(calculateMaxPush(15)).toBe(30);
    expect(calculateMaxPush(20)).toBe(40);
    expect(calculateMaxPush(5)).toBe(10);
  });
});

describe('calculateMaxLift', () => {
  it('should calculate max lift weight (carry capacity ÷ 2, round down)', () => {
    expect(calculateMaxLift(10)).toBe(5); // 10 ÷ 2 = 5
    expect(calculateMaxLift(15)).toBe(7); // 15 ÷ 2 = 7.5, round down
    expect(calculateMaxLift(20)).toBe(10); // 20 ÷ 2 = 10
    expect(calculateMaxLift(7)).toBe(3); // 7 ÷ 2 = 3.5, round down
  });
});

describe('calculateSpellDC', () => {
  it('should calculate spell DC (12 + Presença + skill modifier)', () => {
    expect(calculateSpellDC(1, 0)).toBe(13); // 12 + 1 + 0
    expect(calculateSpellDC(2, 4)).toBe(18); // 12 + 2 + 4
    expect(calculateSpellDC(3, 6)).toBe(21); // 12 + 3 + 6
  });

  it('should calculate spell DC with bonuses', () => {
    expect(calculateSpellDC(2, 4, 2)).toBe(20); // 12 + 2 + 4 + 2
    expect(calculateSpellDC(3, 6, 5)).toBe(26); // 12 + 3 + 6 + 5
  });
});

describe('calculateSpellAttackBonus', () => {
  it('should calculate spell attack bonus (Presença + skill modifier)', () => {
    expect(calculateSpellAttackBonus(1, 0)).toBe(1); // 1 + 0
    expect(calculateSpellAttackBonus(2, 4)).toBe(6); // 2 + 4
    expect(calculateSpellAttackBonus(3, 6)).toBe(9); // 3 + 6
  });

  it('should calculate spell attack bonus with bonuses', () => {
    expect(calculateSpellAttackBonus(2, 4, 2)).toBe(8); // 2 + 4 + 2
    expect(calculateSpellAttackBonus(3, 6, 5)).toBe(14); // 3 + 6 + 5
  });
});

describe('calculateCoinWeight', () => {
  it('should calculate coin weight (100 coins = 1 Peso)', () => {
    expect(calculateCoinWeight(0)).toBe(0);
    expect(calculateCoinWeight(50)).toBe(0); // less than 100
    expect(calculateCoinWeight(99)).toBe(0); // less than 100
    expect(calculateCoinWeight(100)).toBe(1); // exactly 100
    expect(calculateCoinWeight(150)).toBe(1); // 150 ÷ 100 = 1.5, round down
    expect(calculateCoinWeight(250)).toBe(2); // 250 ÷ 100 = 2.5, round down
    expect(calculateCoinWeight(1000)).toBe(10); // 1000 ÷ 100 = 10
  });
});

describe('getEncumbranceState', () => {
  it('should return normal when load is within capacity', () => {
    expect(getEncumbranceState(0, 10)).toBe('normal');
    expect(getEncumbranceState(5, 10)).toBe('normal');
    expect(getEncumbranceState(10, 10)).toBe('normal');
  });

  it('should return sobrecarregado when load exceeds capacity but not 2×', () => {
    expect(getEncumbranceState(11, 10)).toBe('sobrecarregado');
    expect(getEncumbranceState(15, 10)).toBe('sobrecarregado');
    expect(getEncumbranceState(20, 10)).toBe('sobrecarregado');
  });

  it('should return imobilizado when load exceeds 2× capacity', () => {
    expect(getEncumbranceState(21, 10)).toBe('imobilizado');
    expect(getEncumbranceState(25, 10)).toBe('imobilizado');
    expect(getEncumbranceState(100, 10)).toBe('imobilizado');
  });

  it('should handle edge cases', () => {
    expect(getEncumbranceState(0, 0)).toBe('normal'); // no capacity, no load
    expect(getEncumbranceState(1, 0)).toBe('imobilizado'); // any load with 0 capacity
  });
});

describe('applyDeltaToHP', () => {
  it('should return unchanged HP when delta is 0', () => {
    const hp = { max: 20, current: 10, temporary: 5 };
    expect(applyDeltaToHP(hp, 0)).toEqual(hp);
  });

  describe('damage (negative delta)', () => {
    it('should subtract from temporary HP first', () => {
      const hp = { max: 20, current: 10, temporary: 5 };
      const result = applyDeltaToHP(hp, -3);
      expect(result).toEqual({ max: 20, current: 10, temporary: 2 });
    });

    it('should subtract from current HP when temporary is depleted', () => {
      const hp = { max: 20, current: 10, temporary: 5 };
      const result = applyDeltaToHP(hp, -8);
      expect(result).toEqual({ max: 20, current: 7, temporary: 0 });
    });

    it('should handle damage exceeding all HP', () => {
      const hp = { max: 20, current: 10, temporary: 5 };
      const result = applyDeltaToHP(hp, -20);
      expect(result).toEqual({ max: 20, current: 0, temporary: 0 });
    });

    it('should not allow current HP to go below 0', () => {
      const hp = { max: 20, current: 5, temporary: 0 };
      const result = applyDeltaToHP(hp, -10);
      expect(result).toEqual({ max: 20, current: 0, temporary: 0 });
    });

    it('should subtract from current when no temporary HP', () => {
      const hp = { max: 20, current: 10, temporary: 0 };
      const result = applyDeltaToHP(hp, -3);
      expect(result).toEqual({ max: 20, current: 7, temporary: 0 });
    });
  });

  describe('healing (positive delta)', () => {
    it('should increase current HP only', () => {
      const hp = { max: 20, current: 10, temporary: 5 };
      const result = applyDeltaToHP(hp, 3);
      expect(result).toEqual({ max: 20, current: 13, temporary: 5 });
    });

    it('should cap healing at max HP', () => {
      const hp = { max: 20, current: 18, temporary: 5 };
      const result = applyDeltaToHP(hp, 5);
      expect(result).toEqual({ max: 20, current: 20, temporary: 5 });
    });

    it('should not affect temporary HP', () => {
      const hp = { max: 20, current: 5, temporary: 3 };
      const result = applyDeltaToHP(hp, 10);
      expect(result).toEqual({ max: 20, current: 15, temporary: 3 });
    });
  });
});

describe('applyDeltaToPP', () => {
  it('should return unchanged PP when delta is 0', () => {
    const pp = { max: 10, current: 5, temporary: 3 };
    expect(applyDeltaToPP(pp, 0)).toEqual(pp);
  });

  describe('spending (negative delta)', () => {
    it('should subtract from temporary PP first', () => {
      const pp = { max: 10, current: 5, temporary: 3 };
      const result = applyDeltaToPP(pp, -2);
      expect(result).toEqual({ max: 10, current: 5, temporary: 1 });
    });

    it('should subtract from current PP when temporary is depleted', () => {
      const pp = { max: 10, current: 5, temporary: 3 };
      const result = applyDeltaToPP(pp, -5);
      expect(result).toEqual({ max: 10, current: 3, temporary: 0 });
    });

    it('should handle spending exceeding all PP', () => {
      const pp = { max: 10, current: 5, temporary: 3 };
      const result = applyDeltaToPP(pp, -10);
      expect(result).toEqual({ max: 10, current: 0, temporary: 0 });
    });

    it('should not allow current PP to go below 0', () => {
      const pp = { max: 10, current: 2, temporary: 0 };
      const result = applyDeltaToPP(pp, -5);
      expect(result).toEqual({ max: 10, current: 0, temporary: 0 });
    });

    it('should subtract from current when no temporary PP', () => {
      const pp = { max: 10, current: 5, temporary: 0 };
      const result = applyDeltaToPP(pp, -2);
      expect(result).toEqual({ max: 10, current: 3, temporary: 0 });
    });
  });

  describe('recovery (positive delta)', () => {
    it('should increase current PP only', () => {
      const pp = { max: 10, current: 5, temporary: 3 };
      const result = applyDeltaToPP(pp, 2);
      expect(result).toEqual({ max: 10, current: 7, temporary: 3 });
    });

    it('should cap recovery at max PP', () => {
      const pp = { max: 10, current: 9, temporary: 3 };
      const result = applyDeltaToPP(pp, 5);
      expect(result).toEqual({ max: 10, current: 10, temporary: 3 });
    });

    it('should not affect temporary PP', () => {
      const pp = { max: 10, current: 2, temporary: 2 };
      const result = applyDeltaToPP(pp, 5);
      expect(result).toEqual({ max: 10, current: 7, temporary: 2 });
    });
  });
});
