/**
 * Testes para skillCalculations.ts
 *
 * Testa todos os cálculos relacionados a habilidades do sistema
 */

import {
  calculateSkillTotalModifier,
  calculateSkillRollFormula,
  calculateSkillRoll,
  calculateSkillUseModifier,
  calculateSkillUseRollFormula,
  hasLoadPenalty,
  requiresInstrument,
  requiresProficiency,
  isCombatSkill,
} from '../skillCalculations';
import type { Attributes, Modifier, Skill } from '@/types';

describe('skillCalculations', () => {
  describe('calculateSkillTotalModifier', () => {
    it('deve calcular modificador corretamente para Leigo (x0)', () => {
      const result = calculateSkillTotalModifier(
        'acrobacia',
        'agilidade',
        3,
        'leigo',
        false,
        1,
        [],
        false
      );

      expect(result.proficiencyMultiplier).toBe(0);
      expect(result.baseModifier).toBe(0); // 3 × 0
      expect(result.signatureBonus).toBe(0);
      expect(result.otherModifiers).toBe(0);
      expect(result.totalModifier).toBe(0);
    });

    it('deve calcular modificador corretamente para Adepto (x1)', () => {
      const result = calculateSkillTotalModifier(
        'atletismo',
        'constituicao',
        2,
        'adepto',
        false,
        1,
        [],
        false
      );

      expect(result.proficiencyMultiplier).toBe(1);
      expect(result.baseModifier).toBe(2); // 2 × 1
      expect(result.totalModifier).toBe(2);
    });

    it('deve calcular modificador corretamente para Versado (x2)', () => {
      const result = calculateSkillTotalModifier(
        'percepcao',
        'presenca',
        3,
        'versado',
        false,
        1,
        [],
        false
      );

      expect(result.proficiencyMultiplier).toBe(2);
      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.totalModifier).toBe(6);
    });

    it('deve calcular modificador corretamente para Mestre (x3)', () => {
      const result = calculateSkillTotalModifier(
        'investigacao',
        'mente',
        4,
        'mestre',
        false,
        1,
        [],
        false
      );

      expect(result.proficiencyMultiplier).toBe(3);
      expect(result.baseModifier).toBe(12); // 4 × 3
      expect(result.totalModifier).toBe(12);
    });

    it('deve aplicar bônus de Habilidade de Assinatura para habilidade NÃO-COMBATE', () => {
      const result = calculateSkillTotalModifier(
        'atletismo', // não-combate
        'constituicao',
        2,
        'adepto',
        true, // é assinatura
        5, // nível 5
        [],
        false
      );

      expect(result.baseModifier).toBe(2); // 2 × 1
      expect(result.signatureBonus).toBe(5); // nível do personagem
      expect(result.totalModifier).toBe(7); // 2 + 5
    });

    it('deve aplicar bônus de Habilidade de Assinatura para habilidade DE COMBATE (dividido por 3)', () => {
      const result = calculateSkillTotalModifier(
        'acerto', // combate
        'agilidade',
        3,
        'versado',
        true, // é assinatura
        9, // nível 9
        [],
        false
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.signatureBonus).toBe(3); // 9 ÷ 3 = 3
      expect(result.totalModifier).toBe(9); // 6 + 3
    });

    it('deve aplicar bônus de Assinatura mínimo de 1 para habilidade de combate (nível baixo)', () => {
      const result = calculateSkillTotalModifier(
        'luta', // combate
        'forca',
        2,
        'adepto',
        true, // é assinatura
        1, // nível 1
        [],
        false
      );

      expect(result.baseModifier).toBe(2); // 2 × 1
      expect(result.signatureBonus).toBe(1); // mínimo 1 (1 ÷ 3 = 0.33, mas mínimo é 1)
      expect(result.totalModifier).toBe(3); // 2 + 1
    });

    it('deve somar outros modificadores positivos', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2 },
        { name: 'Item Mágico', type: 'bonus', value: 3 },
      ];

      const result = calculateSkillTotalModifier(
        'persuasao',
        'influencia',
        2,
        'adepto',
        false,
        1,
        modifiers,
        false
      );

      expect(result.baseModifier).toBe(2); // 2 × 1
      expect(result.otherModifiers).toBe(5); // 2 + 3
      expect(result.totalModifier).toBe(7); // 2 + 5
    });

    it('deve somar outros modificadores negativos', () => {
      const modifiers: Modifier[] = [
        { name: 'Ferimento', type: 'penalidade', value: -2 },
      ];

      const result = calculateSkillTotalModifier(
        'acrobacia',
        'agilidade',
        3,
        'versado',
        false,
        1,
        modifiers,
        false
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.otherModifiers).toBe(-2);
      expect(result.totalModifier).toBe(4); // 6 - 2
    });

    it('deve aplicar penalidade de carga (-5) quando Sobrecarregado E habilidade tem propriedade Carga', () => {
      const result = calculateSkillTotalModifier(
        'acrobacia', // tem propriedade Carga
        'agilidade',
        3,
        'versado',
        false,
        1,
        [],
        true // sobrecarregado
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.otherModifiers).toBe(-5); // penalidade de carga
      expect(result.totalModifier).toBe(1); // 6 - 5
    });

    it('NÃO deve aplicar penalidade de carga quando NÃO sobrecarregado', () => {
      const result = calculateSkillTotalModifier(
        'acrobacia', // tem propriedade Carga
        'agilidade',
        3,
        'versado',
        false,
        1,
        [],
        false // NÃO sobrecarregado
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.otherModifiers).toBe(0); // sem penalidade
      expect(result.totalModifier).toBe(6);
    });

    it('NÃO deve aplicar penalidade de carga quando habilidade NÃO tem propriedade Carga', () => {
      const result = calculateSkillTotalModifier(
        'percepcao', // NÃO tem propriedade Carga
        'presenca',
        3,
        'versado',
        false,
        1,
        [],
        true // sobrecarregado (mas habilidade não sofre penalidade)
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.otherModifiers).toBe(0); // sem penalidade
      expect(result.totalModifier).toBe(6);
    });

    it('deve funcionar corretamente com atributo 0', () => {
      const result = calculateSkillTotalModifier(
        'atletismo',
        'constituicao',
        0, // atributo 0
        'adepto',
        false,
        1,
        [],
        false
      );

      expect(result.attributeValue).toBe(0);
      expect(result.baseModifier).toBe(0); // 0 × 1
      expect(result.totalModifier).toBe(0);
    });

    it('deve combinar todos os modificadores corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2 },
        { name: 'Ferimento', type: 'penalidade', value: -1 },
      ];

      const result = calculateSkillTotalModifier(
        'atletismo', // tem propriedade Carga
        'constituicao',
        3,
        'versado',
        true, // assinatura
        5, // nível 5
        modifiers,
        true // sobrecarregado
      );

      expect(result.baseModifier).toBe(6); // 3 × 2
      expect(result.signatureBonus).toBe(5); // nível 5 (não-combate)
      expect(result.otherModifiers).toBe(-4); // +2 - 1 - 5 (carga)
      expect(result.totalModifier).toBe(7); // 6 + 5 - 4
    });
  });

  describe('calculateSkillRollFormula', () => {
    it('deve gerar fórmula correta para atributo normal (≥1)', () => {
      const result = calculateSkillRollFormula(2, 4, []);

      expect(result.diceCount).toBe(2);
      expect(result.takeLowest).toBe(false);
      expect(result.modifier).toBe(4);
      expect(result.formula).toBe('2d20+4');
    });

    it('deve gerar fórmula correta para atributo 0 (desvantagem)', () => {
      const result = calculateSkillRollFormula(0, 2, []);

      expect(result.diceCount).toBe(2);
      expect(result.takeLowest).toBe(true); // escolhe o menor
      expect(result.modifier).toBe(2);
      expect(result.formula).toBe('2d20+2'); // sem (menor) - UI usa cor vermelha
    });

    it('deve gerar fórmula com modificador negativo', () => {
      const result = calculateSkillRollFormula(3, -2, []);

      expect(result.formula).toBe('3d20-2');
    });

    it('deve gerar fórmula sem modificador quando modificador = 0', () => {
      const result = calculateSkillRollFormula(2, 0, []);

      expect(result.formula).toBe('2d20');
    });

    it('deve aplicar modificadores de dados positivos', () => {
      const diceModifiers: Modifier[] = [
        { name: 'Vantagem', type: 'bonus', value: 1, affectsDice: true },
      ];

      const result = calculateSkillRollFormula(2, 4, diceModifiers);

      expect(result.diceCount).toBe(3); // 2 + 1
      expect(result.takeLowest).toBe(false);
      expect(result.formula).toBe('3d20+4');
    });

    it('deve aplicar modificadores de dados negativos', () => {
      const diceModifiers: Modifier[] = [
        {
          name: 'Desvantagem',
          type: 'penalidade',
          value: -1,
          affectsDice: true,
        },
      ];

      const result = calculateSkillRollFormula(3, 5, diceModifiers);

      expect(result.diceCount).toBe(2); // 3 - 1
      expect(result.takeLowest).toBe(false);
      expect(result.formula).toBe('2d20+5');
    });

    it('deve aplicar regra especial quando dados ficam < 1 (rola valor absoluto, escolhe menor)', () => {
      const diceModifiers: Modifier[] = [
        {
          name: 'Desvantagem Extrema',
          type: 'penalidade',
          value: -3,
          affectsDice: true,
        },
      ];

      const result = calculateSkillRollFormula(2, 5, diceModifiers);

      expect(result.diceCount).toBe(3); // 2 - 3 = -1 → 2 - (-1) = 3
      expect(result.takeLowest).toBe(true); // passou de negativo
      expect(result.formula).toBe('3d20+5'); // sem (menor) - UI usa cor vermelha
    });

    it('deve combinar múltiplos modificadores de dados', () => {
      const diceModifiers: Modifier[] = [
        { name: 'Vantagem', type: 'bonus', value: 2, affectsDice: true },
        {
          name: 'Desvantagem',
          type: 'penalidade',
          value: -1,
          affectsDice: true,
        },
      ];

      const result = calculateSkillRollFormula(3, 4, diceModifiers);

      expect(result.diceCount).toBe(4); // 3 + 2 - 1
      expect(result.formula).toBe('4d20+4');
    });

    it('deve funcionar corretamente com atributo alto', () => {
      const result = calculateSkillRollFormula(5, 15, []);

      expect(result.diceCount).toBe(5);
      expect(result.formula).toBe('5d20+15');
    });
  });

  describe('calculateSkillRoll', () => {
    const attributes: Attributes = {
      agilidade: 2,
      constituicao: 3,
      forca: 1,
      influencia: 2,
      mente: 2,
      presenca: 1,
    };

    it('deve combinar cálculo de modificador e fórmula de rolagem', () => {
      const result = calculateSkillRoll(
        'acrobacia',
        'agilidade',
        attributes,
        'versado',
        false,
        1,
        [],
        false
      );

      expect(result.calculation.attributeValue).toBe(2);
      expect(result.calculation.baseModifier).toBe(4); // 2 × 2
      expect(result.calculation.totalModifier).toBe(4);

      expect(result.rollFormula.diceCount).toBe(2);
      expect(result.rollFormula.modifier).toBe(4);
      expect(result.rollFormula.formula).toBe('2d20+4');
    });

    it('deve separar modificadores de valor e de dados corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2 },
        { name: 'Vantagem', type: 'bonus', value: 1, affectsDice: true },
      ];

      const result = calculateSkillRoll(
        'atletismo',
        'constituicao',
        attributes,
        'adepto',
        false,
        1,
        modifiers,
        false
      );

      expect(result.calculation.baseModifier).toBe(3); // 3 × 1
      expect(result.calculation.otherModifiers).toBe(2); // apenas bônus de valor
      expect(result.calculation.totalModifier).toBe(5); // 3 + 2

      expect(result.rollFormula.diceCount).toBe(4); // 3 + 1 (modificador de dados)
      expect(result.rollFormula.modifier).toBe(5);
      expect(result.rollFormula.formula).toBe('4d20+5');
    });

    it('deve funcionar com Habilidade de Assinatura', () => {
      const result = calculateSkillRoll(
        'percepcao',
        'presenca',
        attributes,
        'versado',
        true, // assinatura
        5, // nível 5
        [],
        false
      );

      expect(result.calculation.baseModifier).toBe(2); // 1 × 2
      expect(result.calculation.signatureBonus).toBe(5);
      expect(result.calculation.totalModifier).toBe(7); // 2 + 5

      expect(result.rollFormula.formula).toBe('1d20+7');
    });

    it('deve aplicar penalidade de carga quando sobrecarregado', () => {
      const result = calculateSkillRoll(
        'acrobacia',
        'agilidade',
        attributes,
        'versado',
        false,
        1,
        [],
        true // sobrecarregado
      );

      expect(result.calculation.baseModifier).toBe(4); // 2 × 2
      expect(result.calculation.otherModifiers).toBe(-5); // penalidade de carga
      expect(result.calculation.totalModifier).toBe(-1); // 4 - 5

      expect(result.rollFormula.formula).toBe('2d20-1');
    });
  });

  describe('hasLoadPenalty', () => {
    it('deve retornar true para habilidades com propriedade Carga', () => {
      expect(hasLoadPenalty('acrobacia')).toBe(true);
      expect(hasLoadPenalty('atletismo')).toBe(true);
      expect(hasLoadPenalty('furtividade')).toBe(true);
      expect(hasLoadPenalty('reflexo')).toBe(true);
    });

    it('deve retornar false para habilidades SEM propriedade Carga', () => {
      expect(hasLoadPenalty('percepcao')).toBe(false);
      expect(hasLoadPenalty('investigacao')).toBe(false);
      expect(hasLoadPenalty('persuasao')).toBe(false);
    });
  });

  describe('requiresInstrument', () => {
    it('deve retornar true para habilidades que requerem instrumento', () => {
      expect(requiresInstrument('arte')).toBe(true);
      expect(requiresInstrument('medicina')).toBe(true);
      expect(requiresInstrument('conducao')).toBe(true);
    });

    it('deve retornar false para habilidades que NÃO requerem instrumento', () => {
      expect(requiresInstrument('atletismo')).toBe(false);
      expect(requiresInstrument('percepcao')).toBe(false);
    });
  });

  describe('requiresProficiency', () => {
    it('deve retornar true para habilidades que requerem proficiência', () => {
      expect(requiresProficiency('arcano')).toBe(true);
      expect(requiresProficiency('medicina')).toBe(true);
      expect(requiresProficiency('rastreamento')).toBe(true);
    });

    it('deve retornar false para habilidades que NÃO requerem proficiência', () => {
      expect(requiresProficiency('atletismo')).toBe(false);
      expect(requiresProficiency('percepcao')).toBe(false);
    });
  });

  describe('isCombatSkill', () => {
    it('deve retornar true para habilidades de combate', () => {
      expect(isCombatSkill('acerto')).toBe(true);
      expect(isCombatSkill('luta')).toBe(true);
      expect(isCombatSkill('iniciativa')).toBe(true);
      expect(isCombatSkill('reflexo')).toBe(true);
      expect(isCombatSkill('determinacao')).toBe(true);
      expect(isCombatSkill('natureza')).toBe(true);
      expect(isCombatSkill('religiao')).toBe(true);
    });

    it('deve retornar false para habilidades NÃO-combate', () => {
      expect(isCombatSkill('acrobacia')).toBe(false);
      expect(isCombatSkill('atletismo')).toBe(false);
      expect(isCombatSkill('percepcao')).toBe(false);
      expect(isCombatSkill('persuasao')).toBe(false);
    });
  });

  describe('calculateSkillUseModifier', () => {
    const mockAttributes: Attributes = {
      agilidade: 3,
      constituicao: 2,
      forca: 4,
      influencia: 1,
      mente: 2,
      presenca: 3,
    };

    it('deve calcular modificador de uso customizado com atributo diferente', () => {
      const skillUse = {
        keyAttribute: 'forca' as const,
        bonus: 2,
        skillName: 'acrobacia' as const,
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        5,
        false
      );

      // Força 4 × Versado (2) + Bônus +2 = 8 + 2 = 10
      expect(result).toBe(10);
    });

    it('deve incluir bônus de assinatura em uso customizado (habilidade não-combate)', () => {
      const skillUse = {
        keyAttribute: 'forca' as const,
        bonus: 1,
        skillName: 'atletismo' as const,
      };

      const baseSkill: Skill = {
        name: 'atletismo',
        keyAttribute: 'constituicao',
        proficiencyLevel: 'adepto',
        isSignature: true, // Habilidade de Assinatura
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        7, // Nível 7
        false
      );

      // Força 4 × Adepto (1) + Assinatura (7, não-combate) + Bônus +1 = 4 + 7 + 1 = 12
      expect(result).toBe(12);
    });

    it('deve incluir bônus de assinatura reduzido em uso customizado (habilidade de combate)', () => {
      const skillUse = {
        keyAttribute: 'constituicao' as const,
        bonus: 0,
        skillName: 'luta' as const,
      };

      const baseSkill: Skill = {
        name: 'luta',
        keyAttribute: 'forca',
        proficiencyLevel: 'mestre',
        isSignature: true, // Habilidade de Assinatura
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        9, // Nível 9
        false
      );

      // Constituição 2 × Mestre (3) + Assinatura (9÷3 = 3, combate) + Bônus 0 = 6 + 3 = 9
      expect(result).toBe(9);
    });

    it('deve aplicar penalidade de carga quando sobrecarregado', () => {
      const skillUse = {
        keyAttribute: 'agilidade' as const,
        bonus: 0,
        skillName: 'acrobacia' as const, // Tem propriedade Carga
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        true // Sobrecarregado
      );

      // Agilidade 3 × Versado (2) - Carga (-5) = 6 - 5 = 1
      expect(result).toBe(1);
    });

    it('deve incluir modificadores da habilidade base', () => {
      const skillUse = {
        keyAttribute: 'presenca' as const,
        bonus: 3,
        skillName: 'persuasao' as const,
      };

      const baseSkill: Skill = {
        name: 'persuasao',
        keyAttribute: 'influencia',
        proficiencyLevel: 'adepto',
        isSignature: false,
        modifiers: [
          { value: 2, source: 'item', type: 'bonus' },
          { value: -1, source: 'debuff', type: 'penalidade' },
        ],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // Presença 3 × Adepto (1) + Modificadores (2-1) + Bônus +3 = 3 + 1 + 3 = 7
      expect(result).toBe(7);
    });
  });

  describe('calculateSkillUseRollFormula', () => {
    const mockAttributes: Attributes = {
      agilidade: 3,
      constituicao: 2,
      forca: 4,
      influencia: 0, // Atributo 0 para testar regra especial
      mente: 2,
      presenca: 3,
    };

    it('deve gerar fórmula correta para uso customizado', () => {
      const skillUse = {
        keyAttribute: 'forca' as const,
        bonus: 2,
        skillName: 'acrobacia' as const,
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseRollFormula(
        skillUse,
        baseSkill,
        mockAttributes,
        5,
        false
      );

      // Força 4 = 4d20, modificador +10
      expect(result).toBe('4d20+10');
    });

    it('deve aplicar regra especial para atributo 0', () => {
      const skillUse = {
        keyAttribute: 'influencia' as const, // Influência = 0
        bonus: 0,
        skillName: 'persuasao' as const,
      };

      const baseSkill: Skill = {
        name: 'persuasao',
        keyAttribute: 'influencia',
        proficiencyLevel: 'leigo',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseRollFormula(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // Influência 0 = 2d20 (menor), modificador 0
      expect(result).toBe('2d20'); // sem (menor) - UI usa cor vermelha
    });

    it('deve gerar fórmula com modificador negativo', () => {
      const skillUse = {
        keyAttribute: 'mente' as const,
        bonus: -3,
        skillName: 'investigacao' as const,
      };

      const baseSkill: Skill = {
        name: 'investigacao',
        keyAttribute: 'mente',
        proficiencyLevel: 'leigo',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseRollFormula(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // Mente 2 = 2d20, modificador -3
      expect(result).toBe('2d20-3');
    });

    it('deve gerar fórmula sem modificador quando zero', () => {
      const skillUse = {
        keyAttribute: 'presenca' as const,
        bonus: 0,
        skillName: 'percepcao' as const,
      };

      const baseSkill: Skill = {
        name: 'percepcao',
        keyAttribute: 'presenca',
        proficiencyLevel: 'leigo',
        isSignature: false,
        modifiers: [],
      };

      const result = calculateSkillUseRollFormula(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // Presença 3 = 3d20, modificador 0
      expect(result).toBe('3d20');
    });
  });
});
