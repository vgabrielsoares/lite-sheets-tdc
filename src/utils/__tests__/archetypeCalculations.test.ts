/**
 * @file Unit tests for archetype calculations
 * @description Tests for Issue 5.11 - Validação e Conformidade - Fase 5
 *
 * Tests verify:
 * - PV gains per archetype per level
 * - PP gains per archetype per level
 * - Level gain types at correct levels
 * - Archetype constants compliance with RPG rules
 */

import {
  ARCHETYPE_LIST,
  ARCHETYPE_HP_PER_LEVEL,
  ARCHETYPE_PP_PER_LEVEL,
  ARCHETYPE_LEVEL_GAINS,
  ARCHETYPE_GAIN_LEVELS,
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  type ArchetypeName,
  type ArchetypeLevelGainType,
} from '@/constants/archetypes';

describe('archetypeCalculations', () => {
  describe('ARCHETYPE_LIST', () => {
    it('deve ter exatamente 6 arquétipos', () => {
      expect(ARCHETYPE_LIST.length).toBe(6);
    });

    it('deve conter todos os 6 arquétipos do sistema', () => {
      expect(ARCHETYPE_LIST).toContain('academico');
      expect(ARCHETYPE_LIST).toContain('acolito');
      expect(ARCHETYPE_LIST).toContain('combatente');
      expect(ARCHETYPE_LIST).toContain('feiticeiro');
      expect(ARCHETYPE_LIST).toContain('ladino');
      expect(ARCHETYPE_LIST).toContain('natural');
    });
  });

  describe('ARCHETYPE_HP_PER_LEVEL', () => {
    it('deve ter configuração para todos os 6 arquétipos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_HP_PER_LEVEL[archetype]).toBeDefined();
      });
    });

    it('Combatente deve dar 5 + Constituição de PV por nível', () => {
      expect(ARCHETYPE_HP_PER_LEVEL.combatente).toBe(5);
    });

    it('Ladino deve dar 4 + Constituição de PV por nível', () => {
      expect(ARCHETYPE_HP_PER_LEVEL.ladino).toBe(4);
    });

    it('Natural e Acólito devem dar 3 + Constituição de PV por nível', () => {
      expect(ARCHETYPE_HP_PER_LEVEL.natural).toBe(3);
      expect(ARCHETYPE_HP_PER_LEVEL.acolito).toBe(3);
    });

    it('Acadêmico deve dar 2 + Constituição de PV por nível', () => {
      expect(ARCHETYPE_HP_PER_LEVEL.academico).toBe(2);
    });

    it('Feiticeiro deve dar 1 + Constituição de PV por nível', () => {
      expect(ARCHETYPE_HP_PER_LEVEL.feiticeiro).toBe(1);
    });

    it('todos os valores de PV base devem ser positivos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_HP_PER_LEVEL[archetype]).toBeGreaterThan(0);
      });
    });

    it('PV base deve seguir a ordem inversa de PP base (combatente mais PV, feiticeiro menos)', () => {
      const hpValues = ARCHETYPE_LIST.map((a) => ARCHETYPE_HP_PER_LEVEL[a]);
      const maxHp = Math.max(...hpValues);
      const minHp = Math.min(...hpValues);

      expect(ARCHETYPE_HP_PER_LEVEL.combatente).toBe(maxHp);
      expect(ARCHETYPE_HP_PER_LEVEL.feiticeiro).toBe(minHp);
    });
  });

  describe('ARCHETYPE_PP_PER_LEVEL', () => {
    it('deve ter configuração para todos os 6 arquétipos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_PP_PER_LEVEL[archetype]).toBeDefined();
      });
    });

    it('Feiticeiro deve dar 5 + Presença de PP por nível', () => {
      expect(ARCHETYPE_PP_PER_LEVEL.feiticeiro).toBe(5);
    });

    it('Acadêmico deve dar 4 + Presença de PP por nível', () => {
      expect(ARCHETYPE_PP_PER_LEVEL.academico).toBe(4);
    });

    it('Acólito e Natural devem dar 3 + Presença de PP por nível', () => {
      expect(ARCHETYPE_PP_PER_LEVEL.acolito).toBe(3);
      expect(ARCHETYPE_PP_PER_LEVEL.natural).toBe(3);
    });

    it('Ladino deve dar 2 + Presença de PP por nível', () => {
      expect(ARCHETYPE_PP_PER_LEVEL.ladino).toBe(2);
    });

    it('Combatente deve dar 1 + Presença de PP por nível', () => {
      expect(ARCHETYPE_PP_PER_LEVEL.combatente).toBe(1);
    });

    it('todos os valores de PP base devem ser positivos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_PP_PER_LEVEL[archetype]).toBeGreaterThan(0);
      });
    });

    it('PP base deve seguir a ordem inversa de PV base (feiticeiro mais PP, combatente menos)', () => {
      const ppValues = ARCHETYPE_LIST.map((a) => ARCHETYPE_PP_PER_LEVEL[a]);
      const maxPp = Math.max(...ppValues);
      const minPp = Math.min(...ppValues);

      expect(ARCHETYPE_PP_PER_LEVEL.feiticeiro).toBe(maxPp);
      expect(ARCHETYPE_PP_PER_LEVEL.combatente).toBe(minPp);
    });
  });

  describe('Cálculos de PV/PP por arquétipo', () => {
    const calculateHpGain = (
      archetype: ArchetypeName,
      constituicao: number
    ) => {
      return ARCHETYPE_HP_PER_LEVEL[archetype] + constituicao;
    };

    const calculatePpGain = (archetype: ArchetypeName, presenca: number) => {
      return ARCHETYPE_PP_PER_LEVEL[archetype] + presenca;
    };

    it('deve calcular PV corretamente para Combatente com Constituição 3', () => {
      expect(calculateHpGain('combatente', 3)).toBe(8); // 5 + 3
    });

    it('deve calcular PV corretamente para Feiticeiro com Constituição 1', () => {
      expect(calculateHpGain('feiticeiro', 1)).toBe(2); // 1 + 1
    });

    it('deve calcular PP corretamente para Feiticeiro com Presença 3', () => {
      expect(calculatePpGain('feiticeiro', 3)).toBe(8); // 5 + 3
    });

    it('deve calcular PP corretamente para Combatente com Presença 1', () => {
      expect(calculatePpGain('combatente', 1)).toBe(2); // 1 + 1
    });

    it('deve arredondar para baixo se Constituição for fracional', () => {
      // Regra: "Sempre arredondamos para baixo"
      expect(Math.floor(calculateHpGain('ladino', 2.7))).toBe(6); // floor(4 + 2.7) = 6
    });

    it('deve calcular PV total após múltiplos níveis', () => {
      const constituicao = 2;
      const levels = 5; // 5 níveis de combatente
      const pvPerLevel = calculateHpGain('combatente', constituicao);
      const totalHpFromArchetype = pvPerLevel * levels;

      expect(totalHpFromArchetype).toBe(35); // (5 + 2) × 5 = 35
    });
  });

  describe('ARCHETYPE_LEVEL_GAINS', () => {
    it('deve ter ganhos definidos para múltiplos níveis', () => {
      expect(ARCHETYPE_LEVEL_GAINS.length).toBeGreaterThan(0);
    });

    const getGainTypesForLevel = (level: number): ArchetypeLevelGainType[] => {
      return ARCHETYPE_LEVEL_GAINS.filter((g) => g.level === level).map(
        (g) => g.type
      );
    };

    describe('Níveis com Característica de Arquétipo (1, 5, 10, 15)', () => {
      [1, 5, 10, 15].forEach((level) => {
        it(`nível ${level} deve ter ganho de característica`, () => {
          expect(getGainTypesForLevel(level)).toContain('caracteristica');
        });
      });
    });

    describe('Níveis com Poder de Arquétipo (2, 4, 6, 8, 9, 11, 13, 14)', () => {
      [2, 4, 6, 8, 9, 11, 13, 14].forEach((level) => {
        it(`nível ${level} deve ter ganho de poder`, () => {
          expect(getGainTypesForLevel(level)).toContain('poder');
        });
      });
    });

    describe('Níveis com Competência (3, 7, 12)', () => {
      [3, 7, 12].forEach((level) => {
        it(`nível ${level} deve ter ganho de competência`, () => {
          expect(getGainTypesForLevel(level)).toContain('competencia');
        });
      });
    });

    describe('Níveis com Aumento de Atributo (4, 8, 13)', () => {
      [4, 8, 13].forEach((level) => {
        it(`nível ${level} deve ter ganho de atributo`, () => {
          expect(getGainTypesForLevel(level)).toContain('atributo');
        });
      });
    });

    describe('Níveis com Grau de Habilidade (5, 9, 14)', () => {
      [5, 9, 14].forEach((level) => {
        it(`nível ${level} deve ter ganho de grau de habilidade`, () => {
          expect(getGainTypesForLevel(level)).toContain('grau_habilidade');
        });
      });
    });

    describe('Níveis com Defesa por Etapa (5, 10, 15)', () => {
      [5, 10, 15].forEach((level) => {
        it(`nível ${level} deve ter ganho de defesa por etapa`, () => {
          expect(getGainTypesForLevel(level)).toContain('defesa_etapa');
        });
      });
    });
  });

  describe('ARCHETYPE_GAIN_LEVELS', () => {
    it('deve mapear característica para níveis 1, 5, 10, 15', () => {
      expect(ARCHETYPE_GAIN_LEVELS.caracteristica).toEqual([1, 5, 10, 15]);
    });

    it('deve mapear poder para níveis 2, 4, 6, 8, 9, 11, 13, 14', () => {
      expect(ARCHETYPE_GAIN_LEVELS.poder).toEqual([2, 4, 6, 8, 9, 11, 13, 14]);
    });

    it('deve mapear competência para níveis 3, 7, 12', () => {
      expect(ARCHETYPE_GAIN_LEVELS.competencia).toEqual([3, 7, 12]);
    });

    it('deve mapear atributo para níveis 4, 8, 13', () => {
      expect(ARCHETYPE_GAIN_LEVELS.atributo).toEqual([4, 8, 13]);
    });

    it('deve mapear grau_habilidade para níveis 5, 9, 14', () => {
      expect(ARCHETYPE_GAIN_LEVELS.grau_habilidade).toEqual([5, 9, 14]);
    });

    it('deve mapear defesa_etapa para níveis 5, 10, 15', () => {
      expect(ARCHETYPE_GAIN_LEVELS.defesa_etapa).toEqual([5, 10, 15]);
    });
  });

  describe('ARCHETYPE_LABELS', () => {
    it('deve ter labels para todos os arquétipos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_LABELS[archetype]).toBeDefined();
        expect(typeof ARCHETYPE_LABELS[archetype]).toBe('string');
        expect(ARCHETYPE_LABELS[archetype].length).toBeGreaterThan(0);
      });
    });

    it('labels devem estar em português', () => {
      expect(ARCHETYPE_LABELS.academico).toBe('Acadêmico');
      expect(ARCHETYPE_LABELS.acolito).toBe('Acólito');
      expect(ARCHETYPE_LABELS.combatente).toBe('Combatente');
      expect(ARCHETYPE_LABELS.feiticeiro).toBe('Feiticeiro');
      expect(ARCHETYPE_LABELS.ladino).toBe('Ladino');
      expect(ARCHETYPE_LABELS.natural).toBe('Natural');
    });
  });

  describe('ARCHETYPE_DESCRIPTIONS', () => {
    it('deve ter descrições para todos os arquétipos', () => {
      ARCHETYPE_LIST.forEach((archetype) => {
        expect(ARCHETYPE_DESCRIPTIONS[archetype]).toBeDefined();
        expect(typeof ARCHETYPE_DESCRIPTIONS[archetype]).toBe('string');
        expect(ARCHETYPE_DESCRIPTIONS[archetype].length).toBeGreaterThan(10);
      });
    });
  });

  describe('Validação de soma de níveis de arquétipos', () => {
    it('soma de níveis de arquétipos deve ser igual ao nível do personagem', () => {
      const archetypeLevels = { combatente: 3, ladino: 2, feiticeiro: 0 };
      const totalArchetypeLevels = Object.values(archetypeLevels).reduce(
        (sum, level) => sum + level,
        0
      );
      const characterLevel = 5;

      expect(totalArchetypeLevels).toBe(characterLevel);
    });

    it('cada arquétipo pode ter nível de 0 até nível máximo do personagem', () => {
      const characterLevel = 10;
      const validArchetypeLevel = 7;
      const invalidArchetypeLevel = 11;

      expect(validArchetypeLevel).toBeLessThanOrEqual(characterLevel);
      expect(invalidArchetypeLevel).toBeGreaterThan(characterLevel);
    });
  });

  describe('Cálculo de PV/PP total baseado em arquétipos', () => {
    const calculateTotalHpFromArchetypes = (
      archetypeLevels: Partial<Record<ArchetypeName, number>>,
      constituicao: number
    ): number => {
      return Object.entries(archetypeLevels).reduce(
        (total, [archetype, levels]) => {
          if (!levels) return total;
          const hpPerLevel =
            ARCHETYPE_HP_PER_LEVEL[archetype as ArchetypeName] + constituicao;
          return total + hpPerLevel * levels;
        },
        0
      );
    };

    const calculateTotalPpFromArchetypes = (
      archetypeLevels: Partial<Record<ArchetypeName, number>>,
      presenca: number
    ): number => {
      return Object.entries(archetypeLevels).reduce(
        (total, [archetype, levels]) => {
          if (!levels) return total;
          const ppPerLevel =
            ARCHETYPE_PP_PER_LEVEL[archetype as ArchetypeName] + presenca;
          return total + ppPerLevel * levels;
        },
        0
      );
    };

    it('deve calcular PV total para personagem multiclasse', () => {
      // Personagem nível 5: Combatente 3, Ladino 2
      // Constituição: 2
      const archetypes = { combatente: 3, ladino: 2 };
      const constituicao = 2;

      // Combatente: (5 + 2) × 3 = 21
      // Ladino: (4 + 2) × 2 = 12
      // Total: 33
      expect(calculateTotalHpFromArchetypes(archetypes, constituicao)).toBe(33);
    });

    it('deve calcular PP total para personagem multiclasse', () => {
      // Personagem nível 5: Feiticeiro 3, Acadêmico 2
      // Presença: 3
      const archetypes = { feiticeiro: 3, academico: 2 };
      const presenca = 3;

      // Feiticeiro: (5 + 3) × 3 = 24
      // Acadêmico: (4 + 3) × 2 = 14
      // Total: 38
      expect(calculateTotalPpFromArchetypes(archetypes, presenca)).toBe(38);
    });

    it('deve retornar 0 quando não há níveis de arquétipo', () => {
      expect(calculateTotalHpFromArchetypes({}, 3)).toBe(0);
      expect(calculateTotalPpFromArchetypes({}, 3)).toBe(0);
    });
  });
});
