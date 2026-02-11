/**
 * Tests for levelUpCalculations utility functions
 *
 * Covers:
 * - getArchetypeLevel
 * - calculateArchetypeGAGain
 * - calculateArchetypePPGain
 * - previewLevelUpGains
 * - applyLevelUp
 */

import {
  getArchetypeLevel,
  calculateArchetypeGAGain,
  calculateArchetypePPGain,
  previewLevelUpGains,
  applyLevelUp,
} from '@/utils/levelUpCalculations';
import type { LevelUpSpecialGain } from '@/utils/levelUpCalculations';
import type { Character, ArchetypeName } from '@/types/character';

// ─── Test Fixture ───────────────────────────────────────────

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-1',
    schemaVersion: 2,
    name: 'Test Hero',
    playerName: 'Player',
    level: 1,
    linhagem: '',
    origem: '',
    attributes: {
      agilidade: 2,
      corpo: 3,
      influencia: 1,
      mente: 2,
      essencia: 1,
      instinto: 1,
    },
    skills: {} as Character['skills'],
    proficiencies: {
      weapons: ['simples'],
      armors: [],
      skills: [],
      languages: ['comum'],
      tools: [],
    },
    proficiencyPurchases: [],
    combat: {
      guard: { current: 15, max: 15 },
      vitality: { current: 5, max: 5 },
      pp: { current: 2, max: 2 },
      attacks: [],
      vulnerabilityDie: 'd20',
      movement: {
        base: 9,
        current: 9,
      },
      temporaryEffects: [],
      conditions: [],
      defenses: {
        reflexo: 0,
        vigor: 0,
      },
      savingThrows: {
        determinacao: 0,
        reflexo: 0,
        sintonia: 0,
        tenacidade: 0,
        vigor: 0,
      },
    },
    spellcasting: {
      isCaster: false,
      castingSkill: null,
      spellPoints: {
        current: 0,
        max: 0,
      },
      knownSpells: [],
    },
    inventory: {
      items: [],
      currency: {
        gold: 10,
        silver: 0,
        copper: 0,
      },
      carryingCapacity: {
        carry: 20,
        push: 30,
        lift: 15,
      },
    },
    notes: {
      backstory: '',
      personality: '',
      goals: '',
      allies: '',
      general: '',
    },
    classes: [],
    archetypes: [],
    specialAbilities: [],
    experience: {
      current: 50,
      toNextLevel: 50,
    },
    levelProgression: [],
    traits: {
      fears: [],
      weaknesses: [],
      values: [],
      connections: [],
    },
    signatureAbility: null,
    resources: {
      resourceDice: [],
      crafts: [],
    },
    movement: {
      base: 9,
      current: 9,
      notes: '',
    },
    senses: {
      vision: 'normal',
      specialSenses: [],
    },
    particularities: {
      fears: [],
      defects: [],
      qualities: [],
    },
    definers: {
      physicalDescription: {
        height: '',
        weight: '',
        age: '',
        eyes: '',
        hair: '',
        skin: '',
        other: '',
      },
      appearance: '',
      personality: '',
      history: '',
      goals: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as unknown as Character;
}

// ─── getArchetypeLevel ──────────────────────────────────────

describe('getArchetypeLevel', () => {
  it('should return 0 for a character with no archetypes', () => {
    const char = createMockCharacter({ archetypes: [] });
    expect(getArchetypeLevel(char, 'combatente')).toBe(0);
  });

  it('should return 0 for an archetype the character does not have', () => {
    const char = createMockCharacter({
      archetypes: [{ name: 'combatente', level: 3, features: [] }],
    });
    expect(getArchetypeLevel(char, 'feiticeiro')).toBe(0);
  });

  it('should return the correct level for an existing archetype', () => {
    const char = createMockCharacter({
      archetypes: [
        { name: 'combatente', level: 5, features: [] },
        { name: 'ladino', level: 2, features: [] },
      ],
    });
    expect(getArchetypeLevel(char, 'combatente')).toBe(5);
    expect(getArchetypeLevel(char, 'ladino')).toBe(2);
  });
});

// ─── calculateArchetypeGAGain ───────────────────────────────

describe('calculateArchetypeGAGain', () => {
  const attributes = {
    agilidade: 2,
    corpo: 3,
    influencia: 1,
    mente: 2,
    essencia: 4,
    instinto: 1,
  };

  it('should return Corpo for combatente', () => {
    expect(calculateArchetypeGAGain('combatente', attributes)).toBe(3);
  });

  it('should return Mente for academico', () => {
    expect(calculateArchetypeGAGain('academico', attributes)).toBe(2);
  });

  it('should return Agilidade for ladino', () => {
    expect(calculateArchetypeGAGain('ladino', attributes)).toBe(2);
  });

  it('should return Essencia for feiticeiro', () => {
    expect(calculateArchetypeGAGain('feiticeiro', attributes)).toBe(4);
  });

  it('should return Influencia for acolito', () => {
    expect(calculateArchetypeGAGain('acolito', attributes)).toBe(1);
  });

  it('should return Instinto for natural', () => {
    expect(calculateArchetypeGAGain('natural', attributes)).toBe(1);
  });

  it('should return 0 when the relevant attribute is 0', () => {
    const zeroAttrs = { ...attributes, corpo: 0 };
    expect(calculateArchetypeGAGain('combatente', zeroAttrs)).toBe(0);
  });
});

// ─── calculateArchetypePPGain ───────────────────────────────

describe('calculateArchetypePPGain', () => {
  it('should return base + essencia for each archetype', () => {
    const essencia = 2;
    // combatente: base 1 + ess 2 = 3
    expect(calculateArchetypePPGain('combatente', essencia)).toBe(3);
    // feiticeiro: base 5 + ess 2 = 7
    expect(calculateArchetypePPGain('feiticeiro', essencia)).toBe(7);
    // academico: base 4 + ess 2 = 6
    expect(calculateArchetypePPGain('academico', essencia)).toBe(6);
    // acolito: base 3 + ess 2 = 5
    expect(calculateArchetypePPGain('acolito', essencia)).toBe(5);
    // ladino: base 2 + ess 2 = 4
    expect(calculateArchetypePPGain('ladino', essencia)).toBe(4);
    // natural: base 3 + ess 2 = 5
    expect(calculateArchetypePPGain('natural', essencia)).toBe(5);
  });

  it('should return just the base when essencia is 0', () => {
    expect(calculateArchetypePPGain('combatente', 0)).toBe(1);
    expect(calculateArchetypePPGain('feiticeiro', 0)).toBe(5);
  });

  it('should handle high essencia values', () => {
    expect(calculateArchetypePPGain('combatente', 5)).toBe(6);
    expect(calculateArchetypePPGain('feiticeiro', 5)).toBe(10);
  });
});

// ─── previewLevelUpGains ────────────────────────────────────

describe('previewLevelUpGains', () => {
  it('should preview gains for a level 1→2 combatente', () => {
    const char = createMockCharacter({
      level: 1,
      archetypes: [{ name: 'combatente', level: 1, features: [] }],
    });
    const preview = previewLevelUpGains(char, 'combatente');

    expect(preview.newCharacterLevel).toBe(2);
    expect(preview.newArchetypeLevel).toBe(2);
    // GA gain = corpo = 3
    expect(preview.gaGained).toBe(3);
    // PP gain = combatente base (1) + essencia (1) = 2
    expect(preview.ppGained).toBe(2);
    expect(preview.newGAMax).toBe(15 + 3); // 18
    expect(preview.newPPMax).toBe(2 + 2); // 4
    // PV = floor(18/3) = 6
    expect(preview.newPVMax).toBe(6);
    // Archetype level 2 → grants power or talent
    expect(preview.grantsPowerOrTalent).toBe(true);
    expect(preview.grantsCompetence).toBe(false);
    expect(preview.grantsArchetypeFeature).toBe(false);
    // Character level 2 → doesn't unlock classes (need level 3)
    expect(preview.unlocksClasses).toBe(false);
  });

  it('should preview gains for a new archetype (level 0→1)', () => {
    const char = createMockCharacter({
      level: 3,
      archetypes: [{ name: 'combatente', level: 3, features: [] }],
    });
    const preview = previewLevelUpGains(char, 'feiticeiro');

    expect(preview.newCharacterLevel).toBe(4);
    expect(preview.newArchetypeLevel).toBe(1); // First level in feiticeiro
    // GA gain = essencia = 1
    expect(preview.gaGained).toBe(1);
    // PP gain = feiticeiro base (5) + essencia (1) = 6
    expect(preview.ppGained).toBe(6);
    // Archetype level 1 → grants archetype feature
    expect(preview.grantsArchetypeFeature).toBe(true);
  });

  it('should detect class unlock at level 3', () => {
    const char = createMockCharacter({
      level: 2,
      archetypes: [{ name: 'combatente', level: 2, features: [] }],
    });
    const preview = previewLevelUpGains(char, 'combatente');
    expect(preview.unlocksClasses).toBe(true);
  });

  it('should not detect class unlock if already past level 3', () => {
    const char = createMockCharacter({
      level: 5,
      archetypes: [{ name: 'combatente', level: 5, features: [] }],
    });
    const preview = previewLevelUpGains(char, 'combatente');
    expect(preview.unlocksClasses).toBe(false);
  });

  it('should detect competence at archetype level 5', () => {
    const char = createMockCharacter({
      level: 4,
      archetypes: [{ name: 'combatente', level: 4, features: [] }],
    });
    const preview = previewLevelUpGains(char, 'combatente');
    expect(preview.newArchetypeLevel).toBe(5);
    expect(preview.grantsCompetence).toBe(true);
    expect(preview.grantsArchetypeFeature).toBe(true);
  });

  it('should calculate remaining XP correctly', () => {
    const char = createMockCharacter({
      level: 1,
      experience: { current: 70, toNextLevel: 50 },
    });
    const preview = previewLevelUpGains(char, 'combatente');
    // XP required for level 1→2 = 50, current = 70, remaining = 20
    expect(preview.remainingXP).toBe(20);
  });
});

// ─── applyLevelUp ───────────────────────────────────────────

describe('applyLevelUp', () => {
  it('should increment character level by 1', () => {
    const char = createMockCharacter({ level: 1 });
    applyLevelUp(char, 'combatente');
    expect(char.level).toBe(2);
  });

  it('should create a new archetype if it does not exist', () => {
    const char = createMockCharacter({ archetypes: [] });
    applyLevelUp(char, 'combatente');
    expect(char.archetypes).toHaveLength(1);
    expect(char.archetypes[0].name).toBe('combatente');
    expect(char.archetypes[0].level).toBe(1);
  });

  it('should increment existing archetype level', () => {
    const char = createMockCharacter({
      archetypes: [{ name: 'combatente', level: 2, features: [] }],
    });
    applyLevelUp(char, 'combatente');
    expect(char.archetypes[0].level).toBe(3);
  });

  it('should add GA gain based on archetype attribute', () => {
    const char = createMockCharacter({ level: 1 });
    char.combat.guard = { current: 15, max: 15 };
    // combatente → corpo = 3
    applyLevelUp(char, 'combatente');
    expect(char.combat.guard.max).toBe(18);
    expect(char.combat.guard.current).toBe(18); // also increases current
  });

  it('should add PP gain based on archetype base + essencia', () => {
    const char = createMockCharacter({ level: 1 });
    char.combat.pp = { current: 2, max: 2 };
    // combatente base = 1, essencia = 1 → PP gain = 2
    applyLevelUp(char, 'combatente');
    expect(char.combat.pp.max).toBe(4);
    expect(char.combat.pp.current).toBe(4);
  });

  it('should recalculate PV from new GA max', () => {
    const char = createMockCharacter({ level: 1 });
    char.combat.guard = { current: 15, max: 15 };
    char.combat.vitality = { current: 5, max: 5 };
    // GA: 15+3=18, PV: floor(18/3) = 6
    applyLevelUp(char, 'combatente');
    expect(char.combat.vitality.max).toBe(6);
  });

  it('should carry over excess XP after leveling', () => {
    const char = createMockCharacter({
      level: 1,
      experience: { current: 70, toNextLevel: 50 },
    });
    // XP required to go from level 1 to 2 = 50
    // Excess: 70 - 50 = 20
    applyLevelUp(char, 'combatente');
    expect(char.experience.current).toBe(20);
  });

  it('should update toNextLevel for the new level', () => {
    const char = createMockCharacter({
      level: 1,
      experience: { current: 50, toNextLevel: 50 },
    });
    applyLevelUp(char, 'combatente');
    // Now at level 2, XP for level 2→3 = 125
    expect(char.experience.toNextLevel).toBe(125);
  });

  it('should add special gains as specialAbilities', () => {
    const char = createMockCharacter({
      level: 1,
      specialAbilities: [],
    });
    const gains: LevelUpSpecialGain[] = [
      {
        type: 'poder_ou_talento',
        name: 'Golpe Brutal',
        description: 'Dano extra em ataques corpo a corpo',
        effects: '+1d dano',
      },
    ];
    applyLevelUp(char, 'combatente', gains);
    expect(char.specialAbilities).toHaveLength(1);
    expect(char.specialAbilities[0].name).toBe('Golpe Brutal');
    expect(char.specialAbilities[0].source).toBe('poder');
    expect(char.specialAbilities[0].sourceName).toBe('combatente');
    expect(char.specialAbilities[0].levelGained).toBe(2);
  });

  it('should map competencia type to correct source', () => {
    const char = createMockCharacter({
      level: 4,
      specialAbilities: [],
    });
    const gains: LevelUpSpecialGain[] = [
      {
        type: 'competencia',
        name: 'Mestre em Combate',
        description: 'Maestria em combate',
      },
    ];
    applyLevelUp(char, 'combatente', gains);
    expect(char.specialAbilities[0].source).toBe('competencia');
  });

  it('should map caracteristica type to arquetipo source', () => {
    const char = createMockCharacter({
      level: 4,
      specialAbilities: [],
    });
    const gains: LevelUpSpecialGain[] = [
      {
        type: 'caracteristica',
        name: 'Resistência do Guerreiro',
        description: 'Feature do arquétipo',
      },
    ];
    applyLevelUp(char, 'combatente', gains);
    expect(char.specialAbilities[0].source).toBe('arquetipo');
  });

  it('should add level progression entry', () => {
    const char = createMockCharacter({
      level: 1,
      levelProgression: [],
    });
    applyLevelUp(char, 'combatente');
    expect(char.levelProgression).toHaveLength(1);
    expect(char.levelProgression[0].level).toBe(2);
    expect(char.levelProgression[0].achieved).toBe(true);
    expect(char.levelProgression[0].gains).toContain(
      'Arquétipo: combatente (nível 1)'
    );
    expect(char.levelProgression[0].gains).toContain('+3 GA');
    expect(char.levelProgression[0].gains).toContain('+2 PP');
  });

  it('should update the updatedAt timestamp', () => {
    const char = createMockCharacter();
    char.updatedAt = '2020-01-01T00:00:00.000Z';
    applyLevelUp(char, 'combatente');
    expect(char.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
  });

  it('should handle multiple special gains', () => {
    const char = createMockCharacter({
      level: 4,
      specialAbilities: [],
    });
    const gains: LevelUpSpecialGain[] = [
      {
        type: 'poder_ou_talento',
        name: 'Poder 1',
        description: 'desc1',
      },
      {
        type: 'caracteristica',
        name: 'Feature 1',
        description: 'desc2',
      },
    ];
    applyLevelUp(char, 'combatente', gains);
    expect(char.specialAbilities).toHaveLength(2);
  });

  it('should handle leveling with zero essencia (PP gain = base only)', () => {
    const char = createMockCharacter();
    char.attributes.essencia = 0;
    applyLevelUp(char, 'combatente');
    // combatente base = 1, essencia = 0 → PP gain = 1
    expect(char.combat.pp.max).toBe(3); // 2 + 1
  });

  it('should work with feiticeiro archetype (high PP)', () => {
    const char = createMockCharacter();
    char.attributes.essencia = 4;
    applyLevelUp(char, 'feiticeiro');
    // feiticeiro base = 5, essencia = 4 → PP gain = 9
    expect(char.combat.pp.max).toBe(11); // 2 + 9
    // GA gain = essencia = 4
    expect(char.combat.guard.max).toBe(19); // 15 + 4
  });
});
