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
    it('should have entries for all 31 skills', () => {
      // Verificar que todas as 31 habilidades estão mapeadas
      const skills: SkillName[] = [
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
        'instrucao',
        'intimidacao',
        'investigacao',
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
      // reflexo: Agarrar-se à Beirada, Resistir
      expect(DEFAULT_SKILL_USES.reflexo).toHaveLength(2);

      // acrobacia: 5 usos
      expect(DEFAULT_SKILL_USES.acrobacia).toHaveLength(5);

      // atletismo: 6 usos
      expect(DEFAULT_SKILL_USES.atletismo).toHaveLength(6);

      // medicina: 5 usos
      expect(DEFAULT_SKILL_USES.medicina).toHaveLength(5);

      // oficio: 0 usos (só custom)
      expect(DEFAULT_SKILL_USES.oficio).toHaveLength(0);
    });

    it('should have correct proficiency requirements for enganacao', () => {
      const enganacaoUses = DEFAULT_SKILL_USES.enganacao;

      // Insinuar - sem requisito
      const insinuar = enganacaoUses.find((u) => u.name === 'Insinuar');
      expect(insinuar).toBeDefined();
      expect(insinuar?.requiredProficiency).toBeUndefined();

      // Disfarçar - requer adepto
      const disfarcar = enganacaoUses.find((u) => u.name === 'Disfarçar');
      expect(disfarcar).toBeDefined();
      expect(disfarcar?.requiredProficiency).toBe('adepto');
    });
  });

  describe('getDefaultSkillUses', () => {
    it('should return all default uses for a skill', () => {
      const reflexoUses = getDefaultSkillUses('reflexo');
      expect(reflexoUses).toHaveLength(2);
      expect(reflexoUses[0].name).toBe('Agarrar-se à Beirada');
      expect(reflexoUses[1].name).toBe('Resistir');
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
      const insinuar = DEFAULT_SKILL_USES.enganacao[0]; // Insinuar - sem requisito
      expect(isDefaultUseAvailable(insinuar, 'leigo')).toBe(true);
      expect(isDefaultUseAvailable(insinuar, 'adepto')).toBe(true);
      expect(isDefaultUseAvailable(insinuar, 'versado')).toBe(true);
      expect(isDefaultUseAvailable(insinuar, 'mestre')).toBe(true);
    });

    it('should return false for leigo with adepto requirement', () => {
      const disfarcar = DEFAULT_SKILL_USES.enganacao[3]; // Disfarçar - requer adepto
      expect(isDefaultUseAvailable(disfarcar, 'leigo')).toBe(false);
    });

    it('should return true for adepto with adepto requirement', () => {
      const disfarcar = DEFAULT_SKILL_USES.enganacao[3]; // Disfarçar - requer adepto
      expect(isDefaultUseAvailable(disfarcar, 'adepto')).toBe(true);
    });

    it('should return true for higher proficiencies with adepto requirement', () => {
      const disfarcar = DEFAULT_SKILL_USES.enganacao[3]; // Disfarçar - requer adepto
      expect(isDefaultUseAvailable(disfarcar, 'versado')).toBe(true);
      expect(isDefaultUseAvailable(disfarcar, 'mestre')).toBe(true);
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
      const enganacaoUses = getAvailableDefaultUses('enganacao', 'leigo');
      // enganacao: Insinuar, Intrigar, Mentir (ok), Disfarçar (adepto - bloqueado), Falsificar (versado - bloqueado)
      expect(enganacaoUses).toHaveLength(3);
      expect(enganacaoUses[0].name).toBe('Insinuar');
    });

    it('should return more uses for adepto', () => {
      const enganacaoUses = getAvailableDefaultUses('enganacao', 'adepto');
      // enganacao: Insinuar, Intrigar, Mentir + Disfarçar (adepto ok), Falsificar (versado - bloqueado)
      expect(enganacaoUses).toHaveLength(4);
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
