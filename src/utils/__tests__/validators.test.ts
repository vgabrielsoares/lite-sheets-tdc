/**
 * Tests for validation utilities
 */

import {
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
} from '../validators';

describe('isValidAttributeValue', () => {
  it('should accept valid attribute values (0-5)', () => {
    expect(isValidAttributeValue(0)).toBe(true);
    expect(isValidAttributeValue(1)).toBe(true);
    expect(isValidAttributeValue(3)).toBe(true);
    expect(isValidAttributeValue(5)).toBe(true);
  });

  it('should accept values above 5 when allowExceedMax is true (default)', () => {
    expect(isValidAttributeValue(6)).toBe(true);
    expect(isValidAttributeValue(10)).toBe(true);
  });

  it('should reject values above 5 when allowExceedMax is false', () => {
    expect(isValidAttributeValue(6, false)).toBe(false);
    expect(isValidAttributeValue(10, false)).toBe(false);
  });

  it('should reject negative values', () => {
    expect(isValidAttributeValue(-1)).toBe(false);
    expect(isValidAttributeValue(-5)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidAttributeValue(2.5)).toBe(false);
    expect(isValidAttributeValue(1.1)).toBe(false);
  });
});

describe('isValidLevel1AttributeValue', () => {
  it('should accept valid level 1 attribute values (0-3)', () => {
    expect(isValidLevel1AttributeValue(0)).toBe(true);
    expect(isValidLevel1AttributeValue(1)).toBe(true);
    expect(isValidLevel1AttributeValue(2)).toBe(true);
    expect(isValidLevel1AttributeValue(3)).toBe(true);
  });

  it('should reject values above 3 for level 1', () => {
    expect(isValidLevel1AttributeValue(4)).toBe(false);
    expect(isValidLevel1AttributeValue(5)).toBe(false);
    expect(isValidLevel1AttributeValue(6)).toBe(false);
  });

  it('should reject negative values', () => {
    expect(isValidLevel1AttributeValue(-1)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidLevel1AttributeValue(2.5)).toBe(false);
  });
});

describe('isValidAttributeName', () => {
  it('should accept valid attribute names', () => {
    expect(isValidAttributeName('agilidade')).toBe(true);
    expect(isValidAttributeName('corpo')).toBe(true);
    expect(isValidAttributeName('influencia')).toBe(true);
    expect(isValidAttributeName('mente')).toBe(true);
    expect(isValidAttributeName('essencia')).toBe(true);
    expect(isValidAttributeName('instinto')).toBe(true);
  });

  it('should reject invalid attribute names', () => {
    expect(isValidAttributeName('invalid')).toBe(false);
    expect(isValidAttributeName('strength')).toBe(false);
    expect(isValidAttributeName('')).toBe(false);
  });
});

describe('isValidCharacterLevel', () => {
  it('should accept valid character levels (0-15)', () => {
    expect(isValidCharacterLevel(0)).toBe(true);
    expect(isValidCharacterLevel(1)).toBe(true);
    expect(isValidCharacterLevel(5)).toBe(true);
    expect(isValidCharacterLevel(10)).toBe(true);
    expect(isValidCharacterLevel(15)).toBe(true);
  });

  it('should accept epic levels (16-30) when allowEpic is true (default)', () => {
    expect(isValidCharacterLevel(16)).toBe(true);
    expect(isValidCharacterLevel(20)).toBe(true);
    expect(isValidCharacterLevel(30)).toBe(true);
  });

  it('should reject epic levels when allowEpic is false', () => {
    expect(isValidCharacterLevel(16, false)).toBe(false);
    expect(isValidCharacterLevel(20, false)).toBe(false);
  });

  it('should reject negative levels', () => {
    expect(isValidCharacterLevel(-1)).toBe(false);
    expect(isValidCharacterLevel(-5)).toBe(false);
  });

  it('should reject levels above 30 even in epic mode', () => {
    expect(isValidCharacterLevel(31)).toBe(false);
    expect(isValidCharacterLevel(50)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidCharacterLevel(5.5)).toBe(false);
  });
});

describe('isValidProficiencyLevel', () => {
  it('should accept valid proficiency levels', () => {
    expect(isValidProficiencyLevel('leigo')).toBe(true);
    expect(isValidProficiencyLevel('adepto')).toBe(true);
    expect(isValidProficiencyLevel('versado')).toBe(true);
    expect(isValidProficiencyLevel('mestre')).toBe(true);
  });

  it('should reject invalid proficiency levels', () => {
    expect(isValidProficiencyLevel('invalid')).toBe(false);
    expect(isValidProficiencyLevel('expert')).toBe(false);
    expect(isValidProficiencyLevel('')).toBe(false);
  });
});

describe('isValidSkillName', () => {
  it('should accept valid skill names', () => {
    expect(isValidSkillName('acerto')).toBe(true);
    expect(isValidSkillName('atletismo')).toBe(true);
    expect(isValidSkillName('percepcao')).toBe(true);
    expect(isValidSkillName('furtividade')).toBe(true);
  });

  it('should reject invalid skill names', () => {
    expect(isValidSkillName('invalid')).toBe(false);
    expect(isValidSkillName('stealth')).toBe(false);
    expect(isValidSkillName('')).toBe(false);
  });
});

describe('isValidHP', () => {
  it('should accept valid HP values', () => {
    expect(isValidHP(10, 15)).toBe(true);
    expect(isValidHP(15, 15)).toBe(true);
    expect(isValidHP(0, 15)).toBe(true);
  });

  it('should accept negative current HP (dying state)', () => {
    expect(isValidHP(-5, 15)).toBe(true);
    expect(isValidHP(-10, 15)).toBe(true);
  });

  it('should accept temporary HP', () => {
    expect(isValidHP(10, 15, 5)).toBe(true);
    expect(isValidHP(15, 15, 10)).toBe(true);
  });

  it('should reject current HP exceeding max HP', () => {
    expect(isValidHP(20, 15)).toBe(false);
    expect(isValidHP(16, 15)).toBe(false);
  });

  it('should reject max HP less than 1', () => {
    expect(isValidHP(0, 0)).toBe(false);
    expect(isValidHP(5, -1)).toBe(false);
  });

  it('should reject negative temporary HP', () => {
    expect(isValidHP(10, 15, -5)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidHP(10.5, 15)).toBe(false);
    expect(isValidHP(10, 15.5)).toBe(false);
    expect(isValidHP(10, 15, 5.5)).toBe(false);
  });
});

describe('isValidPP', () => {
  it('should accept valid PP values', () => {
    expect(isValidPP(2, 5)).toBe(true);
    expect(isValidPP(5, 5)).toBe(true);
    expect(isValidPP(0, 5)).toBe(true);
  });

  it('should accept temporary PP', () => {
    expect(isValidPP(2, 5, 3)).toBe(true);
    expect(isValidPP(5, 5, 5)).toBe(true);
  });

  it('should reject negative current PP', () => {
    expect(isValidPP(-1, 5)).toBe(false);
  });

  it('should reject current PP exceeding max PP', () => {
    expect(isValidPP(6, 5)).toBe(false);
    expect(isValidPP(10, 5)).toBe(false);
  });

  it('should reject negative max PP', () => {
    expect(isValidPP(0, -1)).toBe(false);
  });

  it('should accept zero max PP', () => {
    expect(isValidPP(0, 0)).toBe(true);
  });

  it('should reject negative temporary PP', () => {
    expect(isValidPP(2, 5, -1)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidPP(2.5, 5)).toBe(false);
    expect(isValidPP(2, 5.5)).toBe(false);
    expect(isValidPP(2, 5, 3.5)).toBe(false);
  });
});

describe('isValidXP', () => {
  it('should accept valid XP values', () => {
    expect(isValidXP(0)).toBe(true);
    expect(isValidXP(100)).toBe(true);
    expect(isValidXP(10000)).toBe(true);
  });

  it('should reject negative XP', () => {
    expect(isValidXP(-1)).toBe(false);
    expect(isValidXP(-100)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidXP(100.5)).toBe(false);
  });
});

describe('isValidDefense', () => {
  it('should accept valid defense values (≥15)', () => {
    expect(isValidDefense(15)).toBe(true);
    expect(isValidDefense(20)).toBe(true);
    expect(isValidDefense(25)).toBe(true);
  });

  it('should accept high values when allowHighValues is true (default)', () => {
    expect(isValidDefense(35)).toBe(true);
    expect(isValidDefense(50)).toBe(true);
  });

  it('should reject high values when allowHighValues is false', () => {
    expect(isValidDefense(31, false)).toBe(false);
    expect(isValidDefense(50, false)).toBe(false);
  });

  it('should reject values below 15', () => {
    expect(isValidDefense(14)).toBe(false);
    expect(isValidDefense(10)).toBe(false);
    expect(isValidDefense(0)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidDefense(15.5)).toBe(false);
  });
});

describe('isValidWeight', () => {
  it('should accept valid weight values', () => {
    expect(isValidWeight(0)).toBe(true);
    expect(isValidWeight(10)).toBe(true);
    expect(isValidWeight(100.5)).toBe(true); // can be fractional
  });

  it('should reject negative weight', () => {
    expect(isValidWeight(-1)).toBe(false);
    expect(isValidWeight(-10.5)).toBe(false);
  });

  it('should reject non-numeric values', () => {
    expect(isValidWeight(NaN)).toBe(false);
  });
});

describe('isValidCurrency', () => {
  it('should accept valid currency amounts', () => {
    expect(isValidCurrency(0)).toBe(true);
    expect(isValidCurrency(10)).toBe(true);
    expect(isValidCurrency(1000)).toBe(true);
  });

  it('should reject negative currency', () => {
    expect(isValidCurrency(-1)).toBe(false);
    expect(isValidCurrency(-100)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidCurrency(10.5)).toBe(false);
  });
});

describe('isValidArchetypeLevel', () => {
  it('should accept valid archetype levels', () => {
    expect(isValidArchetypeLevel(0, 5)).toBe(true); // can have 0 levels
    expect(isValidArchetypeLevel(3, 5)).toBe(true);
    expect(isValidArchetypeLevel(5, 5)).toBe(true); // can equal character level
  });

  it('should reject archetype level exceeding character level', () => {
    expect(isValidArchetypeLevel(6, 5)).toBe(false);
    expect(isValidArchetypeLevel(10, 5)).toBe(false);
  });

  it('should reject negative archetype level', () => {
    expect(isValidArchetypeLevel(-1, 5)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidArchetypeLevel(2.5, 5)).toBe(false);
    expect(isValidArchetypeLevel(2, 5.5)).toBe(false);
  });
});

describe('isValidClassLevels', () => {
  it('should accept valid class level distributions', () => {
    expect(isValidClassLevels([1, 0, 0], 1)).toBe(true);
    expect(isValidClassLevels([2, 3], 5)).toBe(true);
    expect(isValidClassLevels([1, 1, 1], 3)).toBe(true);
    expect(isValidClassLevels([5], 5)).toBe(true);
  });

  it('should accept sum equal to character level', () => {
    expect(isValidClassLevels([2, 3], 5)).toBe(true);
    expect(isValidClassLevels([1, 2, 2], 5)).toBe(true);
  });

  it('should accept sum less than character level', () => {
    expect(isValidClassLevels([1, 1], 5)).toBe(true);
    expect(isValidClassLevels([2], 5)).toBe(true);
  });

  it('should reject sum exceeding character level', () => {
    expect(isValidClassLevels([3, 4], 5)).toBe(false); // sum = 7
    expect(isValidClassLevels([6], 5)).toBe(false);
  });

  it('should reject negative class levels', () => {
    expect(isValidClassLevels([-1, 2], 5)).toBe(false);
    expect(isValidClassLevels([1, -1], 5)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidClassLevels([1.5, 2], 5)).toBe(false);
    expect(isValidClassLevels([1, 2], 5.5)).toBe(false);
  });

  it('should reject non-array input', () => {
    expect(isValidClassLevels('invalid' as any, 5)).toBe(false);
    expect(isValidClassLevels(5 as any, 5)).toBe(false);
  });

  it('should reject invalid character level', () => {
    expect(isValidClassLevels([1, 2], 0)).toBe(false);
    expect(isValidClassLevels([1, 2], -1)).toBe(false);
  });
});

describe('isValidSkillProficiencyCount', () => {
  it('should accept valid skill proficiency counts (≤ 3 + Mente)', () => {
    expect(isValidSkillProficiencyCount(4, 1)).toBe(true); // 3 + 1 = 4
    expect(isValidSkillProficiencyCount(6, 3)).toBe(true); // 3 + 3 = 6
    expect(isValidSkillProficiencyCount(3, 0)).toBe(true); // 3 + 0 = 3
  });

  it('should accept counts less than maximum', () => {
    expect(isValidSkillProficiencyCount(2, 1)).toBe(true);
    expect(isValidSkillProficiencyCount(0, 5)).toBe(true);
  });

  it('should reject counts exceeding maximum', () => {
    expect(isValidSkillProficiencyCount(5, 1)).toBe(false); // exceeds 3 + 1 = 4
    expect(isValidSkillProficiencyCount(10, 3)).toBe(false); // exceeds 3 + 3 = 6
  });

  it('should reject negative counts', () => {
    expect(isValidSkillProficiencyCount(-1, 3)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidSkillProficiencyCount(4.5, 1)).toBe(false);
    expect(isValidSkillProficiencyCount(4, 1.5)).toBe(false);
  });
});

describe('isValidLanguageCount', () => {
  it('should accept valid language counts (≤ 1 + Mente - 1)', () => {
    expect(isValidLanguageCount(1, 0)).toBe(true); // Comum only (1 + 0 - 1 = 0, but min 1)
    expect(isValidLanguageCount(1, 1)).toBe(true); // Comum only (1 + 1 - 1 = 1)
    expect(isValidLanguageCount(3, 3)).toBe(true); // Comum + 2 (1 + 3 - 1 = 3)
  });

  it('should accept counts less than maximum', () => {
    expect(isValidLanguageCount(1, 5)).toBe(true);
    expect(isValidLanguageCount(2, 3)).toBe(true);
  });

  it('should reject counts exceeding maximum', () => {
    expect(isValidLanguageCount(2, 0)).toBe(false); // exceeds 1 + 0 - 1 = 0 (min 1)
    expect(isValidLanguageCount(5, 3)).toBe(false); // exceeds 1 + 3 - 1 = 3
  });

  it('should reject zero or negative counts', () => {
    expect(isValidLanguageCount(0, 1)).toBe(false); // must at least know Comum
    expect(isValidLanguageCount(-1, 3)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidLanguageCount(2.5, 3)).toBe(false);
    expect(isValidLanguageCount(2, 3.5)).toBe(false);
  });
});

describe('isValidMovementSpeed', () => {
  it('should accept valid movement speeds', () => {
    expect(isValidMovementSpeed(0)).toBe(true); // immobilized
    expect(isValidMovementSpeed(6)).toBe(true); // typical walking
    expect(isValidMovementSpeed(12)).toBe(true); // flying
  });

  it('should reject negative speeds', () => {
    expect(isValidMovementSpeed(-1)).toBe(false);
    expect(isValidMovementSpeed(-10)).toBe(false);
  });

  it('should reject non-integer values', () => {
    expect(isValidMovementSpeed(6.5)).toBe(false);
  });
});
