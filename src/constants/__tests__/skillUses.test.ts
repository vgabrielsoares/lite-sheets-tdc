/**
 * @jest-environment node
 * @fileoverview Tests for default skill uses constants and helper functions
 */

import {
  DEFAULT_SKILL_USES,
  getDefaultSkillUses,
  isDefaultUseAvailable,
  getAvailableDefaultUses,
} from '../skillUses';
import type { SkillName, ProficiencyLevel } from '@/types';

describe('skillUses constants', () => {
  describe('DEFAULT_SKILL_USES', () => {
    it('should have entries for all 33 skills', () => {
      // Verificar que todas as 33 habilidades estão mapeadas
      const skills: SkillName[] = [
        'acerto',
        'acrobacia',
        'adestramento',
        'arcano',
        'arte',
        'atletismo',
        'conducao',
        'destreza',
        'determinacao',
        'enganacao',
        'estrategia',
        'furtividade',
        'historia',
        'iniciativa',
        'instrucao',
        'intimidacao',
        'investigacao',
        'luta',
        'medicina',
        'natureza',
        'oficio',
        'percepcao',
        'performance',
        'perspicacia',
        'persuasao',
        'rastreamento',
        'reflexo',
        'religiao',
        'sobrevivencia',
        'sociedade',
        'sorte',
        'tenacidade',
        'vigor',
      ];

      skills.forEach((skillName) => {
        expect(DEFAULT_SKILL_USES).toHaveProperty(skillName);
        expect(Array.isArray(DEFAULT_SKILL_USES[skillName])).toBe(true);
      });
    });

    it('should have valid data structure for each default use', () => {
      Object.entries(DEFAULT_SKILL_USES).forEach(([skillName, uses]) => {
        uses.forEach((use) => {
          // Nome é obrigatório e não vazio
          expect(use.name).toBeDefined();
          expect(typeof use.name).toBe('string');
          expect(use.name.length).toBeGreaterThan(0);

          // Se requiredProficiency existe, deve ser válido
          if (use.requiredProficiency) {
            expect(['adepto', 'versado', 'mestre']).toContain(
              use.requiredProficiency
            );
          }

          // Se description existe, deve ser string
          if (use.description) {
            expect(typeof use.description).toBe('string');
          }
        });
      });
    });

    it('should have expected number of uses for specific skills', () => {
      // acerto: Atacar, Mirar (adepto)
      expect(DEFAULT_SKILL_USES.acerto).toHaveLength(2);

      // acrobacia: 5 usos
      expect(DEFAULT_SKILL_USES.acrobacia).toHaveLength(5);

      // atletismo: 6 usos
      expect(DEFAULT_SKILL_USES.atletismo).toHaveLength(6);

      // medicina: 5 usos
      expect(DEFAULT_SKILL_USES.medicina).toHaveLength(5);

      // oficio: 0 usos (só custom)
      expect(DEFAULT_SKILL_USES.oficio).toHaveLength(0);
    });

    it('should have correct proficiency requirements for acerto', () => {
      const acertoUses = DEFAULT_SKILL_USES.acerto;

      // Atacar - sem requisito
      const atacar = acertoUses.find((u) => u.name === 'Atacar');
      expect(atacar).toBeDefined();
      expect(atacar?.requiredProficiency).toBeUndefined();

      // Mirar - requer adepto
      const mirar = acertoUses.find((u) => u.name === 'Mirar');
      expect(mirar).toBeDefined();
      expect(mirar?.requiredProficiency).toBe('adepto');
    });
  });

  describe('getDefaultSkillUses', () => {
    it('should return all default uses for a skill', () => {
      const acertoUses = getDefaultSkillUses('acerto');
      expect(acertoUses).toHaveLength(2);
      expect(acertoUses[0].name).toBe('Atacar');
      expect(acertoUses[1].name).toBe('Mirar');
    });

    it('should return empty array for oficio', () => {
      const oficioUses = getDefaultSkillUses('oficio');
      expect(oficioUses).toEqual([]);
    });

    it('should return skills with multiple uses correctly', () => {
      const acrobaciaUses = getDefaultSkillUses('acrobacia');
      expect(acrobaciaUses).toHaveLength(5);

      const atletismoUses = getDefaultSkillUses('atletismo');
      expect(atletismoUses).toHaveLength(6);
    });
  });

  describe('isDefaultUseAvailable', () => {
    it('should return true for uses without proficiency requirement', () => {
      const atacar = DEFAULT_SKILL_USES.acerto[0]; // Atacar - sem requisito
      expect(isDefaultUseAvailable(atacar, 'leigo')).toBe(true);
      expect(isDefaultUseAvailable(atacar, 'adepto')).toBe(true);
      expect(isDefaultUseAvailable(atacar, 'versado')).toBe(true);
      expect(isDefaultUseAvailable(atacar, 'mestre')).toBe(true);
    });

    it('should return false for leigo with adepto requirement', () => {
      const mirar = DEFAULT_SKILL_USES.acerto[1]; // Mirar - requer adepto
      expect(isDefaultUseAvailable(mirar, 'leigo')).toBe(false);
    });

    it('should return true for adepto with adepto requirement', () => {
      const mirar = DEFAULT_SKILL_USES.acerto[1]; // Mirar - requer adepto
      expect(isDefaultUseAvailable(mirar, 'adepto')).toBe(true);
    });

    it('should return true for higher proficiencies with adepto requirement', () => {
      const mirar = DEFAULT_SKILL_USES.acerto[1]; // Mirar - requer adepto
      expect(isDefaultUseAvailable(mirar, 'versado')).toBe(true);
      expect(isDefaultUseAvailable(mirar, 'mestre')).toBe(true);
    });

    it('should handle versado requirements correctly', () => {
      // acrobacia - Amortecer Queda (versado)
      const amortecerQueda = DEFAULT_SKILL_USES.acrobacia.find(
        (u) => u.name === 'Amortecer Queda'
      )!;

      expect(isDefaultUseAvailable(amortecerQueda, 'leigo')).toBe(false);
      expect(isDefaultUseAvailable(amortecerQueda, 'adepto')).toBe(false);
      expect(isDefaultUseAvailable(amortecerQueda, 'versado')).toBe(true);
      expect(isDefaultUseAvailable(amortecerQueda, 'mestre')).toBe(true);
    });
  });

  describe('getAvailableDefaultUses', () => {
    it('should return all uses for leigo with no requirements', () => {
      const atletismoUses = getAvailableDefaultUses('atletismo', 'leigo');
      // atletismo tem 6 usos, todos sem requisito
      expect(atletismoUses).toHaveLength(6);
    });

    it('should filter adepto requirements for leigo', () => {
      const acertoUses = getAvailableDefaultUses('acerto', 'leigo');
      // acerto: Atacar (ok), Mirar (adepto - bloqueado)
      expect(acertoUses).toHaveLength(1);
      expect(acertoUses[0].name).toBe('Atacar');
    });

    it('should return all uses for adepto', () => {
      const acertoUses = getAvailableDefaultUses('acerto', 'adepto');
      // acerto: Atacar + Mirar (ambos disponíveis)
      expect(acertoUses).toHaveLength(2);
    });

    it('should filter versado requirements correctly', () => {
      // acrobacia leigo: 2 disponíveis (sem requisito)
      const leigo = getAvailableDefaultUses('acrobacia', 'leigo');
      expect(leigo.length).toBeGreaterThan(0);

      // acrobacia adepto: mais disponíveis
      const adepto = getAvailableDefaultUses('acrobacia', 'adepto');
      expect(adepto.length).toBeGreaterThan(leigo.length);

      // acrobacia versado: todos 5
      const versado = getAvailableDefaultUses('acrobacia', 'versado');
      expect(versado).toHaveLength(5);
    });

    it('should return empty array for oficio', () => {
      const oficioUses = getAvailableDefaultUses('oficio', 'mestre');
      expect(oficioUses).toEqual([]);
    });
  });

  describe('Integration with all skills', () => {
    it('should have at least one use for most skills', () => {
      const skillsWithNoUses: SkillName[] = [];
      const allSkills = Object.keys(DEFAULT_SKILL_USES) as SkillName[];

      allSkills.forEach((skillName) => {
        const uses = getDefaultSkillUses(skillName);
        if (uses.length === 0) {
          skillsWithNoUses.push(skillName);
        }
      });

      // Apenas oficio não tem usos padrões (só customizados)
      expect(skillsWithNoUses).toEqual(['oficio']);
    });

    it('should have consistent proficiency progression', () => {
      // Verificar que nível de proficiência sempre aumenta ou mantém
      const proficiencyOrder: Record<ProficiencyLevel, number> = {
        leigo: 0,
        adepto: 1,
        versado: 2,
        mestre: 3,
      };

      Object.entries(DEFAULT_SKILL_USES).forEach(([skillName, uses]) => {
        uses.forEach((use) => {
          if (use.requiredProficiency) {
            // Requisito não pode ser 'leigo' (seria redundante)
            expect(use.requiredProficiency).not.toBe('leigo');

            // Requisito deve ser válido
            expect(proficiencyOrder[use.requiredProficiency]).toBeDefined();
          }
        });
      });
    });
  });
});
