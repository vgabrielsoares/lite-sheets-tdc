/**
 * Types Tests - Testes de validação dos tipos TypeScript
 *
 * Estes testes verificam se os tipos estão corretamente definidos e exportados.
 */

import {
  // Common
  PROFICIENCY_MULTIPLIERS,
  CURRENCY_CONVERSION,
  DIFFICULTY_VALUES,

  // Attributes
  ATTRIBUTE_CATEGORIES,
  ATTRIBUTE_DEFAULT,
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX_DEFAULT,
  ATTRIBUTE_DESCRIPTIONS,

  // Skills
  SKILL_LIST,
  SKILL_KEY_ATTRIBUTES,
  COMBAT_SKILLS,
  BASE_PROFICIENT_SKILLS,

  // Combat
  DEFAULT_HP_LEVEL_1,
  DEFAULT_PP_LEVEL_1,
  BASE_DEFENSE,
  BASE_DYING_ROUNDS,

  // Inventory
  BASE_CARRYING_CAPACITY,
  STRENGTH_CARRY_MULTIPLIER,
  COINS_WEIGHT_RATIO,
  STARTING_GOLD,

  // Spells
  BASE_SPELL_DC,
  DEFAULT_SPELLCASTING_SKILLS,

  // Character
  DEFAULT_LEVEL_1_CHARACTER,

  // Types
  type Character,
  type Attributes,
  type Skills,
  type SkillName,
  type AttributeName,
  type ProficiencyLevel,
} from '..';

describe('Type System', () => {
  describe('Common Constants', () => {
    it('should have correct proficiency multipliers', () => {
      expect(PROFICIENCY_MULTIPLIERS.leigo).toBe(0);
      expect(PROFICIENCY_MULTIPLIERS.adepto).toBe(1);
      expect(PROFICIENCY_MULTIPLIERS.versado).toBe(2);
      expect(PROFICIENCY_MULTIPLIERS.mestre).toBe(3);
    });

    it('should have correct currency conversion rates', () => {
      expect(CURRENCY_CONVERSION.cobre).toBe(1);
      expect(CURRENCY_CONVERSION.ouro).toBe(100);
      expect(CURRENCY_CONVERSION.platina).toBe(100000);
    });

    it('should have correct difficulty values', () => {
      expect(DIFFICULTY_VALUES.trivial).toBe(5);
      expect(DIFFICULTY_VALUES.facil).toBe(10);
      expect(DIFFICULTY_VALUES.medio).toBe(15);
      expect(DIFFICULTY_VALUES.dificil).toBe(20);
      expect(DIFFICULTY_VALUES.divino).toBe(50);
    });
  });

  describe('Attribute Constants', () => {
    it('should have correct default attribute values', () => {
      expect(ATTRIBUTE_DEFAULT).toBe(1);
      expect(ATTRIBUTE_MIN).toBe(0);
      expect(ATTRIBUTE_MAX_DEFAULT).toBe(5);
    });

    it('should have all six attributes categorized', () => {
      expect(ATTRIBUTE_CATEGORIES.agilidade).toBe('fisico');
      expect(ATTRIBUTE_CATEGORIES.corpo).toBe('fisico');
      expect(ATTRIBUTE_CATEGORIES.influencia).toBe('mental');
      expect(ATTRIBUTE_CATEGORIES.mente).toBe('mental');
      expect(ATTRIBUTE_CATEGORIES.essencia).toBe('espiritual');
      expect(ATTRIBUTE_CATEGORIES.instinto).toBe('espiritual');
    });

    it('should have descriptions for all attributes', () => {
      const attributeNames: AttributeName[] = [
        'agilidade',
        'corpo',
        'influencia',
        'mente',
        'essencia',
        'instinto',
      ];

      attributeNames.forEach((attr) => {
        expect(ATTRIBUTE_DESCRIPTIONS[attr]).toBeDefined();
        expect(typeof ATTRIBUTE_DESCRIPTIONS[attr]).toBe('string');
        expect(ATTRIBUTE_DESCRIPTIONS[attr].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skill Constants', () => {
    it('should have 34 skills', () => {
      expect(SKILL_LIST).toHaveLength(34);
    });

    it('should have key attributes for all skills', () => {
      SKILL_LIST.forEach((skill: SkillName) => {
        expect(SKILL_KEY_ATTRIBUTES[skill]).toBeDefined();
      });
    });

    it('should have combat skills defined', () => {
      expect(COMBAT_SKILLS).toContain('acerto');
      expect(COMBAT_SKILLS).toContain('determinacao');
      expect(COMBAT_SKILLS).toContain('iniciativa');
      expect(COMBAT_SKILLS).toContain('luta');
      expect(COMBAT_SKILLS).toContain('natureza');
      expect(COMBAT_SKILLS).toContain('reflexo');
      expect(COMBAT_SKILLS).toContain('religiao');
    });

    it('should have correct base proficient skills', () => {
      expect(BASE_PROFICIENT_SKILLS).toBe(3);
    });
  });

  describe('Combat Constants', () => {
    it('should have correct level 1 defaults', () => {
      expect(DEFAULT_HP_LEVEL_1).toBe(15);
      expect(DEFAULT_PP_LEVEL_1).toBe(2);
    });

    it('should have correct base defense', () => {
      expect(BASE_DEFENSE).toBe(15);
    });

    it('should have correct base dying rounds', () => {
      expect(BASE_DYING_ROUNDS).toBe(2);
    });
  });

  describe('Inventory Constants', () => {
    it('should have correct carrying capacity values', () => {
      expect(BASE_CARRYING_CAPACITY).toBe(5);
      expect(STRENGTH_CARRY_MULTIPLIER).toBe(5);
    });

    it('should have correct coin weight ratio', () => {
      expect(COINS_WEIGHT_RATIO).toBe(100);
    });

    it('should have correct starting gold', () => {
      expect(STARTING_GOLD).toBe(10);
    });
  });

  describe('Spell Constants', () => {
    it('should have correct base spell DC', () => {
      expect(BASE_SPELL_DC).toBe(12);
    });

    it('should have default spellcasting skills', () => {
      expect(DEFAULT_SPELLCASTING_SKILLS.arcano).toBe('arcano');
      expect(DEFAULT_SPELLCASTING_SKILLS.natureza).toBe('natureza');
      expect(DEFAULT_SPELLCASTING_SKILLS.religiao).toBe('religiao');
    });
  });

  describe('Character Defaults', () => {
    it('should have correct level 1 character defaults', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.level).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.agilidade).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.corpo).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.influencia).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.mente).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.essencia).toBe(1);
      expect(DEFAULT_LEVEL_1_CHARACTER.attributes?.instinto).toBe(1);
    });

    it('should have correct level 1 combat defaults', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.combat?.hp.max).toBe(15);
      expect(DEFAULT_LEVEL_1_CHARACTER.combat?.hp.current).toBe(15);
      expect(DEFAULT_LEVEL_1_CHARACTER.combat?.pp.max).toBe(2);
      expect(DEFAULT_LEVEL_1_CHARACTER.combat?.pp.current).toBe(2);
    });

    it('should have comum language by default', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.languages).toContain('comum');
    });

    it('should have simple weapons proficiency', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.proficiencies?.weapons).toContain(
        'armas-simples'
      );
    });

    it('should have starting inventory items', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.inventory?.items).toHaveLength(2);
      const itemNames = DEFAULT_LEVEL_1_CHARACTER.inventory?.items.map(
        (item: any) => item.name
      );
      expect(itemNames).toContain('Mochila');
      expect(itemNames).toContain('Cartão do Banco');
    });

    it('should have starting gold', () => {
      expect(DEFAULT_LEVEL_1_CHARACTER.inventory?.currency.physical.ouro).toBe(
        10
      );
    });
  });

  describe('Type Compilation', () => {
    it('should compile Attributes type correctly', () => {
      const attrs: Attributes = {
        agilidade: 2,
        corpo: 3,
        influencia: 1,
        mente: 2,
        essencia: 1,
        instinto: 1,
      };

      expect(attrs.agilidade).toBe(2);
      expect(attrs.corpo).toBe(3);
    });

    it('should enforce ProficiencyLevel type', () => {
      const validLevels: ProficiencyLevel[] = [
        'leigo',
        'adepto',
        'versado',
        'mestre',
      ];

      validLevels.forEach((level) => {
        expect(PROFICIENCY_MULTIPLIERS[level]).toBeDefined();
      });
    });

    it('should enforce SkillName type', () => {
      const testSkill: SkillName = 'acrobacia';
      expect(SKILL_LIST).toContain(testSkill);
      expect(SKILL_KEY_ATTRIBUTES[testSkill]).toBeDefined();
    });
  });
});
