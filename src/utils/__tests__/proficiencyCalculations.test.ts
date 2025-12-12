/**
 * Tests for proficiencyCalculations utility
 */

import {
  calculateMaxProficiencies,
  countAcquiredProficiencies,
  canAddProficiency,
  validateProficienciesLimit,
  getRemainingProficiencies,
  getProficiencyInfo,
  countProficienciesByLevel,
} from '../proficiencyCalculations';
import type { Skills } from '@/types';

// Mock skills helper
const createMockSkills = (
  proficiencyConfig: Record<string, 'leigo' | 'adepto' | 'versado' | 'mestre'>
): Skills => {
  const defaultSkill = {
    keyAttribute: 'agilidade' as const,
    isSignature: false,
    modifiers: [],
  };

  const skills = {
    acerto: {
      ...defaultSkill,
      name: 'acerto' as const,
      proficiencyLevel: 'leigo' as const,
    },
    acrobacia: {
      ...defaultSkill,
      name: 'acrobacia' as const,
      proficiencyLevel: 'leigo' as const,
    },
    adestramento: {
      ...defaultSkill,
      name: 'adestramento' as const,
      proficiencyLevel: 'leigo' as const,
    },
    arcano: {
      ...defaultSkill,
      name: 'arcano' as const,
      proficiencyLevel: 'leigo' as const,
    },
    arte: {
      ...defaultSkill,
      name: 'arte' as const,
      proficiencyLevel: 'leigo' as const,
    },
    atletismo: {
      ...defaultSkill,
      name: 'atletismo' as const,
      proficiencyLevel: 'leigo' as const,
    },
    conducao: {
      ...defaultSkill,
      name: 'conducao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    destreza: {
      ...defaultSkill,
      name: 'destreza' as const,
      proficiencyLevel: 'leigo' as const,
    },
    determinacao: {
      ...defaultSkill,
      name: 'determinacao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    enganacao: {
      ...defaultSkill,
      name: 'enganacao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    estrategia: {
      ...defaultSkill,
      name: 'estrategia' as const,
      proficiencyLevel: 'leigo' as const,
    },
    furtividade: {
      ...defaultSkill,
      name: 'furtividade' as const,
      proficiencyLevel: 'leigo' as const,
    },
    historia: {
      ...defaultSkill,
      name: 'historia' as const,
      proficiencyLevel: 'leigo' as const,
    },
    iniciativa: {
      ...defaultSkill,
      name: 'iniciativa' as const,
      proficiencyLevel: 'leigo' as const,
    },
    instrucao: {
      ...defaultSkill,
      name: 'instrucao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    intimidacao: {
      ...defaultSkill,
      name: 'intimidacao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    investigacao: {
      ...defaultSkill,
      name: 'investigacao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    luta: {
      ...defaultSkill,
      name: 'luta' as const,
      proficiencyLevel: 'leigo' as const,
    },
    medicina: {
      ...defaultSkill,
      name: 'medicina' as const,
      proficiencyLevel: 'leigo' as const,
    },
    natureza: {
      ...defaultSkill,
      name: 'natureza' as const,
      proficiencyLevel: 'leigo' as const,
    },
    oficio: {
      ...defaultSkill,
      name: 'oficio' as const,
      proficiencyLevel: 'leigo' as const,
    },
    percepcao: {
      ...defaultSkill,
      name: 'percepcao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    performance: {
      ...defaultSkill,
      name: 'performance' as const,
      proficiencyLevel: 'leigo' as const,
    },
    perspicacia: {
      ...defaultSkill,
      name: 'perspicacia' as const,
      proficiencyLevel: 'leigo' as const,
    },
    persuasao: {
      ...defaultSkill,
      name: 'persuasao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    rastreamento: {
      ...defaultSkill,
      name: 'rastreamento' as const,
      proficiencyLevel: 'leigo' as const,
    },
    reflexo: {
      ...defaultSkill,
      name: 'reflexo' as const,
      proficiencyLevel: 'leigo' as const,
    },
    religiao: {
      ...defaultSkill,
      name: 'religiao' as const,
      proficiencyLevel: 'leigo' as const,
    },
    sobrevivencia: {
      ...defaultSkill,
      name: 'sobrevivencia' as const,
      proficiencyLevel: 'leigo' as const,
    },
    sociedade: {
      ...defaultSkill,
      name: 'sociedade' as const,
      proficiencyLevel: 'leigo' as const,
    },
    sorte: {
      ...defaultSkill,
      name: 'sorte' as const,
      proficiencyLevel: 'leigo' as const,
    },
    tenacidade: {
      ...defaultSkill,
      name: 'tenacidade' as const,
      proficiencyLevel: 'leigo' as const,
    },
    vigor: {
      ...defaultSkill,
      name: 'vigor' as const,
      proficiencyLevel: 'leigo' as const,
    },
  } as Skills;

  // Apply custom proficiencies
  Object.entries(proficiencyConfig).forEach(([skillName, level]) => {
    if (skills[skillName as keyof Skills]) {
      (skills[skillName as keyof Skills] as any).proficiencyLevel = level;
    }
  });

  return skills;
};

describe('proficiencyCalculations', () => {
  describe('calculateMaxProficiencies', () => {
    it('should calculate max proficiencies correctly for Mente 0', () => {
      expect(calculateMaxProficiencies(0)).toBe(3); // 3 base + 0
    });

    it('should calculate max proficiencies correctly for Mente 1', () => {
      expect(calculateMaxProficiencies(1)).toBe(4); // 3 base + 1
    });

    it('should calculate max proficiencies correctly for Mente 3', () => {
      expect(calculateMaxProficiencies(3)).toBe(6); // 3 base + 3
    });

    it('should calculate max proficiencies correctly for Mente 5', () => {
      expect(calculateMaxProficiencies(5)).toBe(8); // 3 base + 5
    });

    it('should handle negative Mente gracefully', () => {
      expect(calculateMaxProficiencies(-1)).toBe(3); // Minimum 3
    });
  });

  describe('countAcquiredProficiencies', () => {
    it('should count 0 proficiencies when all are leigo', () => {
      const skills = createMockSkills({});
      expect(countAcquiredProficiencies(skills)).toBe(0);
    });

    it('should count adepto proficiencies', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
      });
      expect(countAcquiredProficiencies(skills)).toBe(3);
    });

    it('should count versado proficiencies', () => {
      const skills = createMockSkills({
        acrobacia: 'versado',
        furtividade: 'versado',
      });
      expect(countAcquiredProficiencies(skills)).toBe(2);
    });

    it('should count mestre proficiencies', () => {
      const skills = createMockSkills({
        luta: 'mestre',
      });
      expect(countAcquiredProficiencies(skills)).toBe(1);
    });

    it('should count mixed proficiencies', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'versado',
        percepcao: 'mestre',
        furtividade: 'adepto',
      });
      expect(countAcquiredProficiencies(skills)).toBe(4);
    });
  });

  describe('canAddProficiency', () => {
    it('should allow adding when below limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
      });
      expect(canAddProficiency(skills, 2)).toBe(true); // 2 of 5 used
    });

    it('should not allow adding when at limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
      });
      expect(canAddProficiency(skills, 1)).toBe(false); // 4 of 4 used
    });

    it('should not allow adding when above limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
        luta: 'adepto',
      });
      expect(canAddProficiency(skills, 1)).toBe(false); // 5 of 4 used
    });
  });

  describe('validateProficienciesLimit', () => {
    it('should validate when within limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
      });
      expect(validateProficienciesLimit(skills, 2)).toBe(true); // 3 of 5
    });

    it('should validate when at limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
      });
      expect(validateProficienciesLimit(skills, 1)).toBe(true); // 4 of 4
    });

    it('should not validate when above limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
        luta: 'adepto',
      });
      expect(validateProficienciesLimit(skills, 1)).toBe(false); // 5 of 4
    });

    it('should validate 0 proficiencies', () => {
      const skills = createMockSkills({});
      expect(validateProficienciesLimit(skills, 0)).toBe(true); // 0 of 3
    });
  });

  describe('getRemainingProficiencies', () => {
    it('should calculate remaining proficiencies', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
      });
      expect(getRemainingProficiencies(skills, 2)).toBe(3); // 5 - 2 = 3
    });

    it('should return 0 when at limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
      });
      expect(getRemainingProficiencies(skills, 1)).toBe(0); // 4 - 4 = 0
    });

    it('should return 0 (not negative) when above limit', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
        luta: 'adepto',
      });
      expect(getRemainingProficiencies(skills, 1)).toBe(0); // Max(0, 4-5)
    });
  });

  describe('getProficiencyInfo', () => {
    it('should return complete proficiency info', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'versado',
        percepcao: 'mestre',
      });
      const info = getProficiencyInfo(skills, 2);

      expect(info).toEqual({
        max: 5,
        acquired: 3,
        remaining: 2,
        canAdd: true,
        isValid: true,
      });
    });

    it('should indicate when cannot add more', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
      });
      const info = getProficiencyInfo(skills, 1);

      expect(info.canAdd).toBe(false);
      expect(info.remaining).toBe(0);
    });

    it('should indicate when invalid (above limit)', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
        luta: 'adepto',
      });
      const info = getProficiencyInfo(skills, 1);

      expect(info.isValid).toBe(false);
      expect(info.acquired).toBe(5);
      expect(info.max).toBe(4);
    });
  });

  describe('countProficienciesByLevel', () => {
    it('should count proficiencies by level', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'versado',
        furtividade: 'mestre',
      });
      const counts = countProficienciesByLevel(skills);

      expect(counts.leigo).toBe(29); // 33 - 4
      expect(counts.adepto).toBe(2);
      expect(counts.versado).toBe(1);
      expect(counts.mestre).toBe(1);
    });

    it('should count all leigo when no proficiencies', () => {
      const skills = createMockSkills({});
      const counts = countProficienciesByLevel(skills);

      expect(counts.leigo).toBe(33);
      expect(counts.adepto).toBe(0);
      expect(counts.versado).toBe(0);
      expect(counts.mestre).toBe(0);
    });
  });

  describe('retroactive behavior', () => {
    it('should increase max proficiencies when Mente increases', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
      });

      const infoMente1 = getProficiencyInfo(skills, 1);
      expect(infoMente1.max).toBe(4);
      expect(infoMente1.remaining).toBe(1);

      const infoMente3 = getProficiencyInfo(skills, 3);
      expect(infoMente3.max).toBe(6);
      expect(infoMente3.remaining).toBe(3);
    });

    it('should keep proficiencies when Mente decreases', () => {
      const skills = createMockSkills({
        acerto: 'adepto',
        atletismo: 'adepto',
        percepcao: 'adepto',
        furtividade: 'adepto',
      });

      // Was valid with Mente 2 (max 5)
      expect(validateProficienciesLimit(skills, 2)).toBe(true);

      // Becomes invalid with Mente 1 (max 4), but proficiencies remain
      expect(validateProficienciesLimit(skills, 1)).toBe(true); // 4 of 4
      expect(countAcquiredProficiencies(skills)).toBe(4);
    });
  });
});
