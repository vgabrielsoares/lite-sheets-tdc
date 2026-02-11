/**
 * Testes de Progressão (Issue 5.9)
 *
 * Cobre:
 * - GA total: base 15 + Σ(atributo × nível do arquétipo)
 * - PP total: base 2 + Σ((pp_base + essência) × nível)
 * - PV total: floor(GA_max / 3)
 * - Validação de arquétipos (soma = nível, nenhum negativo)
 * - Validação de classes (máx 3, soma ≤ nível, desbloqueio nível 3)
 * - Validação completa de progressão
 * - Exemplo: Combatente 7 / Acólito 3 com atributos específicos
 */

import {
  calculateTotalGA,
  calculateTotalPP,
  calculateTotalPV,
  calculateVitality,
  calculateAdditionalLanguages,
  calculateSkillProficiencies,
} from '@/utils/calculations';
import {
  getTotalArchetypeLevels,
  getArchetypeLevelsRecord,
  validateArchetypeLevelsSum,
  validateArchetypeLevelsPositive,
  canHaveClasses,
  validateClasses,
  getAvailableClassLevels,
  validateProgression,
  CLASS_UNLOCK_LEVEL,
  MAX_CLASSES,
} from '@/utils/progressionValidation';
import {
  ARCHETYPE_GA_ATTRIBUTE,
  ARCHETYPE_PP_BASE_PER_LEVEL,
} from '@/constants/archetypes';
import type { Archetype, Attributes, Character } from '@/types';
import type { CharacterClass } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterFactory';

// ─── Helpers ────────────────────────────────────────────────

function createTestCharacter() {
  return createDefaultCharacter({ name: 'Teste', playerName: 'Jogador' });
}

const BASE_ATTRIBUTES: Attributes = {
  agilidade: 1,
  corpo: 1,
  influencia: 1,
  mente: 1,
  essencia: 1,
  instinto: 1,
};

function makeArchetype(name: Archetype['name'], level: number): Archetype {
  return { name, level, features: [] };
}

function makeClass(name: string, level: number): CharacterClass {
  return {
    name,
    archetypes: [],
    level,
    features: [],
  };
}

// ─── calculateTotalGA ───────────────────────────────────────

describe('calculateTotalGA', () => {
  it('should return base 15 with no archetypes', () => {
    expect(calculateTotalGA([], BASE_ATTRIBUTES)).toBe(15);
  });

  it('should add attribute × archetype level for single archetype', () => {
    // Combatente uses Corpo; Corpo=3, level=3: 15 + 3×3 = 24
    const attrs = { ...BASE_ATTRIBUTES, corpo: 3 };
    const archetypes = [makeArchetype('combatente', 3)];
    expect(calculateTotalGA(archetypes, attrs)).toBe(24);
  });

  it('should sum across multiple archetypes', () => {
    // Combatente 5 (Corpo=3) + Ladino 3 (Agilidade=2)
    // 15 + (3×5) + (2×3) = 15 + 15 + 6 = 36
    const attrs = { ...BASE_ATTRIBUTES, corpo: 3, agilidade: 2 };
    const archetypes = [
      makeArchetype('combatente', 5),
      makeArchetype('ladino', 3),
    ];
    expect(calculateTotalGA(archetypes, attrs)).toBe(36);
  });

  it('should use correct attribute per archetype', () => {
    // Verify each archetype's GA attribute mapping
    const attrs: Attributes = {
      agilidade: 2,
      corpo: 3,
      influencia: 4,
      mente: 5,
      essencia: 1,
      instinto: 2,
    };

    // Academico → Mente: 15 + 5×1 = 20
    expect(calculateTotalGA([makeArchetype('academico', 1)], attrs)).toBe(20);

    // Acolito → Influencia: 15 + 4×1 = 19
    expect(calculateTotalGA([makeArchetype('acolito', 1)], attrs)).toBe(19);

    // Combatente → Corpo: 15 + 3×1 = 18
    expect(calculateTotalGA([makeArchetype('combatente', 1)], attrs)).toBe(18);

    // Feiticeiro → Essencia: 15 + 1×1 = 16
    expect(calculateTotalGA([makeArchetype('feiticeiro', 1)], attrs)).toBe(16);

    // Ladino → Agilidade: 15 + 2×1 = 17
    expect(calculateTotalGA([makeArchetype('ladino', 1)], attrs)).toBe(17);

    // Natural → Instinto: 15 + 2×1 = 17
    expect(calculateTotalGA([makeArchetype('natural', 1)], attrs)).toBe(17);
  });

  it('should apply otherModifiers', () => {
    expect(calculateTotalGA([], BASE_ATTRIBUTES, 5)).toBe(20);
    expect(calculateTotalGA([], BASE_ATTRIBUTES, -3)).toBe(12);
  });

  it('should handle attribute value 0', () => {
    const attrs = { ...BASE_ATTRIBUTES, corpo: 0 };
    const archetypes = [makeArchetype('combatente', 5)];
    // 15 + 0×5 = 15
    expect(calculateTotalGA(archetypes, attrs)).toBe(15);
  });

  it('should handle high archetype level', () => {
    const attrs = { ...BASE_ATTRIBUTES, corpo: 5 };
    const archetypes = [makeArchetype('combatente', 15)];
    // 15 + 5×15 = 90
    expect(calculateTotalGA(archetypes, attrs)).toBe(90);
  });
});

// ─── calculateTotalPP ───────────────────────────────────────

describe('calculateTotalPP', () => {
  it('should return base 2 with no archetypes', () => {
    expect(calculateTotalPP([], 1)).toBe(2);
  });

  it('should add (pp_base + essencia) × level for single archetype', () => {
    // Feiticeiro (pp_base=5), essencia=2, level=3: 2 + (5+2)×3 = 23
    const archetypes = [makeArchetype('feiticeiro', 3)];
    expect(calculateTotalPP(archetypes, 2)).toBe(23);
  });

  it('should use correct PP base per archetype', () => {
    const essencia = 1;

    // Academico (pp_base=4): 2 + (4+1)×1 = 7
    expect(calculateTotalPP([makeArchetype('academico', 1)], essencia)).toBe(7);

    // Acolito (pp_base=3): 2 + (3+1)×1 = 6
    expect(calculateTotalPP([makeArchetype('acolito', 1)], essencia)).toBe(6);

    // Combatente (pp_base=1): 2 + (1+1)×1 = 4
    expect(calculateTotalPP([makeArchetype('combatente', 1)], essencia)).toBe(
      4
    );

    // Feiticeiro (pp_base=5): 2 + (5+1)×1 = 8
    expect(calculateTotalPP([makeArchetype('feiticeiro', 1)], essencia)).toBe(
      8
    );

    // Ladino (pp_base=2): 2 + (2+1)×1 = 5
    expect(calculateTotalPP([makeArchetype('ladino', 1)], essencia)).toBe(5);

    // Natural (pp_base=3): 2 + (3+1)×1 = 6
    expect(calculateTotalPP([makeArchetype('natural', 1)], essencia)).toBe(6);
  });

  it('should sum across multiple archetypes', () => {
    // Feiticeiro 3 (pp=5) + Academico 2 (pp=4), essencia=2
    // 2 + (5+2)×3 + (4+2)×2 = 2 + 21 + 12 = 35
    const archetypes = [
      makeArchetype('feiticeiro', 3),
      makeArchetype('academico', 2),
    ];
    expect(calculateTotalPP(archetypes, 2)).toBe(35);
  });

  it('should apply otherModifiers', () => {
    expect(calculateTotalPP([], 1, 5)).toBe(7);
  });

  it('should handle essencia 0', () => {
    // Combatente (pp_base=1), ess=0, level=3: 2 + (1+0)×3 = 5
    expect(calculateTotalPP([makeArchetype('combatente', 3)], 0)).toBe(5);
  });
});

// ─── calculateTotalPV / calculateVitality ───────────────────

describe('calculateTotalPV', () => {
  it('should be floor(GA_max / 3)', () => {
    expect(calculateTotalPV(15)).toBe(5); // floor(15/3) = 5
    expect(calculateTotalPV(16)).toBe(5); // floor(16/3) = 5
    expect(calculateTotalPV(17)).toBe(5); // floor(17/3) = 5
    expect(calculateTotalPV(18)).toBe(6); // floor(18/3) = 6
    expect(calculateTotalPV(24)).toBe(8); // floor(24/3) = 8
    expect(calculateTotalPV(90)).toBe(30); // floor(90/3) = 30
  });

  it('should return 0 for GA = 0', () => {
    expect(calculateTotalPV(0)).toBe(0);
  });

  it('should return same as calculateVitality', () => {
    for (let ga = 0; ga <= 100; ga++) {
      expect(calculateTotalPV(ga)).toBe(calculateVitality(ga));
    }
  });

  it('should always round down', () => {
    // GA = 7 → floor(7/3) = 2, not 3
    expect(calculateTotalPV(7)).toBe(2);
    // GA = 10 → floor(10/3) = 3, not 4
    expect(calculateTotalPV(10)).toBe(3);
    // GA = 1 → floor(1/3) = 0
    expect(calculateTotalPV(1)).toBe(0);
  });
});

// ─── Progression Validation: Archetypes ─────────────────────

describe('getTotalArchetypeLevels', () => {
  it('should return 0 with no archetypes', () => {
    expect(getTotalArchetypeLevels([])).toBe(0);
  });

  it('should sum single archetype', () => {
    expect(getTotalArchetypeLevels([makeArchetype('combatente', 5)])).toBe(5);
  });

  it('should sum multiple archetypes', () => {
    expect(
      getTotalArchetypeLevels([
        makeArchetype('combatente', 7),
        makeArchetype('acolito', 3),
      ])
    ).toBe(10);
  });
});

describe('getArchetypeLevelsRecord', () => {
  it('should return empty record for no archetypes', () => {
    expect(getArchetypeLevelsRecord([])).toEqual({});
  });

  it('should map name → level', () => {
    const record = getArchetypeLevelsRecord([
      makeArchetype('combatente', 7),
      makeArchetype('acolito', 3),
    ]);
    expect(record).toEqual({ combatente: 7, acolito: 3 });
  });
});

describe('validateArchetypeLevelsSum', () => {
  it('should pass when sum equals character level', () => {
    const archetypes = [
      makeArchetype('combatente', 7),
      makeArchetype('acolito', 3),
    ];
    expect(validateArchetypeLevelsSum(archetypes, 10)).toBe(true);
  });

  it('should fail when sum differs from character level', () => {
    const archetypes = [makeArchetype('combatente', 3)];
    expect(validateArchetypeLevelsSum(archetypes, 5)).toBe(false);
  });

  it('should allow level 1 with no archetypes (fresh character)', () => {
    expect(validateArchetypeLevelsSum([], 1)).toBe(true);
  });

  it('should fail for level > 1 with no archetypes', () => {
    expect(validateArchetypeLevelsSum([], 5)).toBe(false);
  });
});

describe('validateArchetypeLevelsPositive', () => {
  it('should pass when all levels ≥ 1', () => {
    expect(
      validateArchetypeLevelsPositive([
        makeArchetype('combatente', 1),
        makeArchetype('acolito', 5),
      ])
    ).toBe(true);
  });

  it('should pass for empty array', () => {
    expect(validateArchetypeLevelsPositive([])).toBe(true);
  });

  it('should fail if any level is 0', () => {
    expect(
      validateArchetypeLevelsPositive([makeArchetype('combatente', 0)])
    ).toBe(false);
  });
});

// ─── Progression Validation: Classes ────────────────────────

describe('canHaveClasses', () => {
  it('should return false for levels below 3', () => {
    expect(canHaveClasses(0)).toBe(false);
    expect(canHaveClasses(1)).toBe(false);
    expect(canHaveClasses(2)).toBe(false);
  });

  it('should return true for level 3 and above', () => {
    expect(canHaveClasses(3)).toBe(true);
    expect(canHaveClasses(10)).toBe(true);
    expect(canHaveClasses(15)).toBe(true);
  });
});

describe('validateClasses', () => {
  it('should allow no classes at any level', () => {
    const result = validateClasses([], 1);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject classes before level 3', () => {
    const result = validateClasses([makeClass('Guerreiro', 1)], 2);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('nível 3'))).toBe(true);
  });

  it('should allow up to 3 classes at level 3+', () => {
    const classes = [makeClass('A', 1), makeClass('B', 1), makeClass('C', 1)];
    const result = validateClasses(classes, 5);
    expect(result.valid).toBe(true);
  });

  it('should reject more than 3 classes', () => {
    const classes = [
      makeClass('A', 1),
      makeClass('B', 1),
      makeClass('C', 1),
      makeClass('D', 1),
    ];
    const result = validateClasses(classes, 10);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Máximo'))).toBe(true);
  });

  it('should reject class levels exceeding character level', () => {
    const classes = [makeClass('A', 8)];
    const result = validateClasses(classes, 5);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('excede'))).toBe(true);
  });

  it('should allow class levels equal to character level', () => {
    const classes = [makeClass('A', 3), makeClass('B', 2)];
    const result = validateClasses(classes, 5);
    expect(result.valid).toBe(true);
  });
});

describe('getAvailableClassLevels', () => {
  it('should return full level when no classes', () => {
    expect(getAvailableClassLevels([], 10)).toBe(10);
  });

  it('should subtract used class levels', () => {
    const classes = [makeClass('A', 3), makeClass('B', 2)];
    expect(getAvailableClassLevels(classes, 10)).toBe(5);
  });

  it('should floor at 0', () => {
    const classes = [makeClass('A', 10)];
    expect(getAvailableClassLevels(classes, 5)).toBe(0);
  });
});

// ─── Full validateProgression ───────────────────────────────

describe('validateProgression', () => {
  it('should pass for valid character', () => {
    const character = createTestCharacter();
    // Level 1 with no archetypes is valid
    const result = validateProgression(character);
    expect(result.valid).toBe(true);
  });

  it('should fail if archetype levels do not match character level', () => {
    const character = createTestCharacter();
    character.level = 5;
    character.archetypes = [makeArchetype('combatente', 3)]; // only 3, should be 5
    const result = validateProgression(character);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('não corresponde'))).toBe(true);
  });

  it('should warn about no archetype chosen', () => {
    const character = createTestCharacter();
    character.level = 1;
    character.archetypes = [];
    const result = validateProgression(character);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('arquétipo'))).toBe(true);
  });

  it('should warn about available classes at level 3+', () => {
    const character = createTestCharacter();
    character.level = 5;
    character.archetypes = [makeArchetype('combatente', 5)];
    character.classes = [];
    const result = validateProgression(character);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('classe'))).toBe(true);
  });
});

// ─── Idiomas & Proficiências (regressions) ──────────────────

describe('calculateAdditionalLanguages (regression)', () => {
  it('should return Mente - 1, minimum 0', () => {
    expect(calculateAdditionalLanguages(0)).toBe(0);
    expect(calculateAdditionalLanguages(1)).toBe(0);
    expect(calculateAdditionalLanguages(2)).toBe(1);
    expect(calculateAdditionalLanguages(3)).toBe(2);
    expect(calculateAdditionalLanguages(5)).toBe(4);
  });
});

describe('calculateSkillProficiencies (regression)', () => {
  it('should return 3 + Mente', () => {
    expect(calculateSkillProficiencies(0)).toBe(3);
    expect(calculateSkillProficiencies(1)).toBe(4);
    expect(calculateSkillProficiencies(5)).toBe(8);
  });
});

// ─── Integration: Example Character ─────────────────────────

describe('Example character: Combatente 7 / Acólito 3 (level 10)', () => {
  const attrs: Attributes = {
    agilidade: 2,
    corpo: 4,
    influencia: 1,
    mente: 2,
    essencia: 3,
    instinto: 1,
  };

  const archetypes: Archetype[] = [
    makeArchetype('combatente', 7),
    makeArchetype('acolito', 3),
  ];

  it('should have total archetype levels = 10', () => {
    expect(getTotalArchetypeLevels(archetypes)).toBe(10);
  });

  it('should pass archetype validation at level 10', () => {
    expect(validateArchetypeLevelsSum(archetypes, 10)).toBe(true);
  });

  it('should calculate GA correctly', () => {
    // Combatente → Corpo(4) × 7 = 28
    // Acolito → Influencia(1) × 3 = 3
    // Total: 15 + 28 + 3 = 46
    expect(calculateTotalGA(archetypes, attrs)).toBe(46);
  });

  it('should calculate PP correctly', () => {
    // Combatente: pp_base=1, ess=3, level=7 → (1+3)×7 = 28
    // Acolito: pp_base=3, ess=3, level=3 → (3+3)×3 = 18
    // Total: 2 + 28 + 18 = 48
    expect(calculateTotalPP(archetypes, attrs.essencia)).toBe(48);
  });

  it('should calculate PV correctly', () => {
    const ga = calculateTotalGA(archetypes, attrs); // 46
    // PV = floor(46 / 3) = 15
    expect(calculateTotalPV(ga)).toBe(15);
  });

  it('should have 1 additional language (Mente=2 → 2-1=1)', () => {
    expect(calculateAdditionalLanguages(attrs.mente)).toBe(1);
  });

  it('should have 5 skill proficiency slots (3 + Mente=2)', () => {
    expect(calculateSkillProficiencies(attrs.mente)).toBe(5);
  });

  it('should allow classes (level ≥ 3)', () => {
    expect(canHaveClasses(10)).toBe(true);
  });

  it('should validate classes correctly', () => {
    const classes = [makeClass('Cavaleiro', 3), makeClass('Paladino', 2)];
    const result = validateClasses(classes, 10);
    expect(result.valid).toBe(true);
  });

  it('should have 5 available class levels with used classes', () => {
    const classes = [makeClass('Cavaleiro', 3), makeClass('Paladino', 2)];
    expect(getAvailableClassLevels(classes, 10)).toBe(5);
  });
});

// ─── Constants check ────────────────────────────────────────

describe('Progression constants', () => {
  it('CLASS_UNLOCK_LEVEL should be 3', () => {
    expect(CLASS_UNLOCK_LEVEL).toBe(3);
  });

  it('MAX_CLASSES should be 3', () => {
    expect(MAX_CLASSES).toBe(3);
  });

  it('ARCHETYPE_GA_ATTRIBUTE should map all 6 archetypes', () => {
    expect(Object.keys(ARCHETYPE_GA_ATTRIBUTE)).toHaveLength(6);
    expect(ARCHETYPE_GA_ATTRIBUTE.combatente).toBe('corpo');
    expect(ARCHETYPE_GA_ATTRIBUTE.ladino).toBe('agilidade');
    expect(ARCHETYPE_GA_ATTRIBUTE.academico).toBe('mente');
    expect(ARCHETYPE_GA_ATTRIBUTE.feiticeiro).toBe('essencia');
    expect(ARCHETYPE_GA_ATTRIBUTE.acolito).toBe('influencia');
    expect(ARCHETYPE_GA_ATTRIBUTE.natural).toBe('instinto');
  });

  it('ARCHETYPE_PP_BASE_PER_LEVEL should have correct values', () => {
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.combatente).toBe(1);
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.ladino).toBe(2);
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.natural).toBe(3);
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.academico).toBe(4);
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.acolito).toBe(3);
    expect(ARCHETYPE_PP_BASE_PER_LEVEL.feiticeiro).toBe(5);
  });
});
