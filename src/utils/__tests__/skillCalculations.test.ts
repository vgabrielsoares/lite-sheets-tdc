/**
 * Testes para skillCalculations.ts
 *
 * Sistema v0.0.2:
 * - Proficiência → tamanho do dado: Leigo(d6), Adepto(d8), Versado(d10), Mestre(d12)
 * - Atributo → quantidade base de dados na pool
 * - Modificadores são sempre +Xd / -Xd (affectsDice: true)
 * - Bônus de Assinatura: Math.min(3, Math.ceil(level / 5)) dados extras
 * - Pool ≤ 0 → rola 2d e pega o menor (isPenaltyRoll)
 * - Máximo 8 dados por teste (MAX_SKILL_DICE)
 */

import {
  calculateSkillTotalModifier,
  calculateSkillRollFormula,
  calculateSkillRoll,
  calculateSkillUseModifier,
  calculateSkillUseRollFormula,
  calculateSkillPenalties,
  hasLoadPenalty,
  requiresInstrument,
  requiresProficiency,
  isCombatSkill,
} from '../skillCalculations';
import type { Attributes, Modifier, Skill } from '@/types';

describe('skillCalculations', () => {
  describe('calculateSkillTotalModifier', () => {
    it('deve retornar dieSize d6 para Leigo', () => {
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

      expect(result.attributeValue).toBe(3);
      expect(result.dieSize).toBe('d6');
      expect(result.signatureDiceBonus).toBe(0);
      expect(result.otherDiceModifiers).toBe(0);
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(3);
      expect(result.isPenaltyRoll).toBe(false);
    });

    it('deve retornar dieSize d8 para Adepto', () => {
      const result = calculateSkillTotalModifier(
        'atletismo',
        'corpo',
        2,
        'adepto',
        false,
        1,
        [],
        false
      );

      expect(result.attributeValue).toBe(2);
      expect(result.dieSize).toBe('d8');
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(2);
    });

    it('deve retornar dieSize d10 para Versado', () => {
      const result = calculateSkillTotalModifier(
        'percepcao',
        'instinto',
        3,
        'versado',
        false,
        1,
        [],
        false
      );

      expect(result.attributeValue).toBe(3);
      expect(result.dieSize).toBe('d10');
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(3);
    });

    it('deve retornar dieSize d12 para Mestre', () => {
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

      expect(result.attributeValue).toBe(4);
      expect(result.dieSize).toBe('d12');
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(4);
    });

    it('deve aplicar bônus de Habilidade de Assinatura (+1d para nível 1-5)', () => {
      const result = calculateSkillTotalModifier(
        'atletismo',
        'corpo',
        2,
        'adepto',
        true, // é assinatura
        5, // nível 5
        [],
        false
      );

      // Assinatura nível 5 = Math.min(3, ceil(5/5)) = 1
      expect(result.attributeValue).toBe(2);
      expect(result.signatureDiceBonus).toBe(1);
      expect(result.totalDiceModifier).toBe(1);
      expect(result.totalDice).toBe(3); // 2 + 1
    });

    it('deve aplicar bônus de Assinatura +2d para nível 6-10', () => {
      const result = calculateSkillTotalModifier(
        'acerto',
        'agilidade',
        3,
        'versado',
        true, // é assinatura
        9, // nível 9
        [],
        false
      );

      // Assinatura nível 9 = Math.min(3, ceil(9/5)) = 2
      expect(result.attributeValue).toBe(3);
      expect(result.signatureDiceBonus).toBe(2);
      expect(result.totalDiceModifier).toBe(2);
      expect(result.totalDice).toBe(5); // 3 + 2
    });

    it('deve aplicar bônus de Assinatura +1d para nível 1 (mínimo)', () => {
      const result = calculateSkillTotalModifier(
        'luta',
        'corpo',
        2,
        'adepto',
        true, // é assinatura
        1, // nível 1
        [],
        false
      );

      // Assinatura nível 1 = Math.min(3, ceil(1/5)) = 1
      expect(result.signatureDiceBonus).toBe(1);
      expect(result.totalDice).toBe(3); // 2 + 1
    });

    it('deve somar modificadores de dados positivos (+Xd)', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2, affectsDice: true },
        { name: 'Item Mágico', type: 'bonus', value: 3, affectsDice: true },
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

      expect(result.otherDiceModifiers).toBe(5); // 2 + 3
      expect(result.totalDiceModifier).toBe(5);
      expect(result.totalDice).toBe(7); // 2 + 5
    });

    it('deve somar modificadores de dados negativos (-Xd)', () => {
      const modifiers: Modifier[] = [
        {
          name: 'Ferimento',
          type: 'penalidade',
          value: -2,
          affectsDice: true,
        },
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

      expect(result.otherDiceModifiers).toBe(-2);
      expect(result.totalDiceModifier).toBe(-2);
      expect(result.totalDice).toBe(1); // 3 - 2
    });

    it('deve aplicar penalidade de carga (-2d) quando Sobrecarregado E habilidade tem Carga', () => {
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

      expect(result.loadDicePenalty).toBe(-2);
      expect(result.totalDiceModifier).toBe(-2);
      expect(result.totalDice).toBe(1); // 3 - 2
    });

    it('NÃO deve aplicar penalidade de carga quando NÃO sobrecarregado', () => {
      const result = calculateSkillTotalModifier(
        'acrobacia',
        'agilidade',
        3,
        'versado',
        false,
        1,
        [],
        false // NÃO sobrecarregado
      );

      expect(result.loadDicePenalty).toBe(0);
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(3);
    });

    it('NÃO deve aplicar penalidade de carga quando habilidade NÃO tem Carga', () => {
      const result = calculateSkillTotalModifier(
        'percepcao', // NÃO tem propriedade Carga
        'instinto',
        3,
        'versado',
        false,
        1,
        [],
        true // sobrecarregado (mas habilidade não sofre penalidade)
      );

      expect(result.loadDicePenalty).toBe(0);
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(3);
    });

    it('deve ativar isPenaltyRoll quando atributo 0 e sem modificadores', () => {
      const result = calculateSkillTotalModifier(
        'atletismo',
        'corpo',
        0, // atributo 0
        'adepto',
        false,
        1,
        [],
        false
      );

      expect(result.attributeValue).toBe(0);
      expect(result.totalDice).toBe(0);
      expect(result.isPenaltyRoll).toBe(true);
    });

    it('deve combinar todos os modificadores corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2, affectsDice: true },
        {
          name: 'Ferimento',
          type: 'penalidade',
          value: -1,
          affectsDice: true,
        },
      ];

      const result = calculateSkillTotalModifier(
        'atletismo', // tem propriedade Carga
        'corpo',
        3,
        'versado',
        true, // assinatura
        5, // nível 5
        modifiers,
        true // sobrecarregado
      );

      // signatureDiceBonus = Math.min(3, ceil(5/5)) = 1
      // otherDiceModifiers = 2 + (-1) = 1
      // loadDicePenalty = -2 (atletismo has carga, overloaded)
      // totalDiceModifier = 1 + 1 + (-2) = 0
      // totalDice = 3 + 0 = 3
      expect(result.signatureDiceBonus).toBe(1);
      expect(result.otherDiceModifiers).toBe(1);
      expect(result.loadDicePenalty).toBe(-2);
      expect(result.totalDiceModifier).toBe(0);
      expect(result.totalDice).toBe(3);
      expect(result.isPenaltyRoll).toBe(false);
    });

    it('deve ignorar modificadores sem affectsDice (legacy)', () => {
      const modifiers: Modifier[] = [
        { name: 'Bônus numérico', type: 'bonus', value: 5 }, // sem affectsDice
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

      // Modificador sem affectsDice é ignorado
      expect(result.otherDiceModifiers).toBe(0);
      expect(result.totalDice).toBe(3);
    });

    it('deve aceitar SkillPenaltyContext com armadura', () => {
      const result = calculateSkillTotalModifier(
        'acrobacia',
        'agilidade',
        3,
        'versado',
        false,
        1,
        [],
        { isOverloaded: true, equippedArmorType: 'pesada' }
      );

      // loadDicePenalty = -2 (overloaded + carga)
      // armorDicePenalty = -2 (pesada + carga)
      // totalDice = 3 + (-2) + (-2) = -1, isPenaltyRoll
      expect(result.loadDicePenalty).toBe(-2);
      expect(result.armorDicePenalty).toBe(-2);
      expect(result.totalDice).toBe(-1);
      expect(result.isPenaltyRoll).toBe(true);
    });
  });

  describe('calculateSkillPenalties', () => {
    it('deve retornar todas penalidades zero quando sem penalidades', () => {
      const result = calculateSkillPenalties('percepcao', 'versado', {});
      expect(result.loadDicePenalty).toBe(0);
      expect(result.armorDicePenalty).toBe(0);
      expect(result.proficiencyDicePenalty).toBe(0);
      expect(result.instrumentDicePenalty).toBe(0);
      expect(result.totalPenalty).toBe(0);
    });

    it('deve aplicar penalidade de carga (-2d) quando sobrecarregado em habilidade com Carga', () => {
      const result = calculateSkillPenalties('acrobacia', 'versado', {
        isOverloaded: true,
      });
      expect(result.loadDicePenalty).toBe(-2);
      expect(result.totalPenalty).toBe(-2);
    });

    it('deve aplicar penalidade de armadura média (-1d) em habilidade com Carga', () => {
      const result = calculateSkillPenalties('atletismo', 'adepto', {
        equippedArmorType: 'media',
      });
      expect(result.armorDicePenalty).toBe(-1);
      expect(result.totalPenalty).toBe(-1);
    });

    it('deve aplicar penalidade de armadura pesada (-2d) em habilidade com Carga', () => {
      const result = calculateSkillPenalties('atletismo', 'adepto', {
        equippedArmorType: 'pesada',
      });
      expect(result.armorDicePenalty).toBe(-2);
      expect(result.totalPenalty).toBe(-2);
    });

    it('deve aplicar penalidade de proficiência (-2d) quando Leigo em habilidade que requer proficiência', () => {
      const result = calculateSkillPenalties('arcano', 'leigo', {});
      expect(result.proficiencyDicePenalty).toBe(-2);
      expect(result.totalPenalty).toBe(-2);
    });

    it('NÃO deve aplicar penalidade de proficiência quando Adepto ou superior', () => {
      const result = calculateSkillPenalties('arcano', 'adepto', {});
      expect(result.proficiencyDicePenalty).toBe(0);
    });

    it('deve aplicar penalidade de instrumento (-2d) quando falta instrumento', () => {
      const result = calculateSkillPenalties('medicina', 'adepto', {
        hasRequiredInstrument: false,
      });
      expect(result.instrumentDicePenalty).toBe(-2);
      expect(result.totalPenalty).toBe(-2);
    });

    it('deve acumular penalidades de carga e armadura', () => {
      const result = calculateSkillPenalties('acrobacia', 'versado', {
        isOverloaded: true,
        equippedArmorType: 'pesada',
      });
      expect(result.loadDicePenalty).toBe(-2);
      expect(result.armorDicePenalty).toBe(-2);
      expect(result.totalPenalty).toBe(-4);
    });
  });

  describe('calculateSkillRollFormula', () => {
    it('deve gerar fórmula correta para pool normal', () => {
      const result = calculateSkillRollFormula(3, 'd8');

      expect(result.diceCount).toBe(3);
      expect(result.dieSize).toBe('d8');
      expect(result.isPenaltyRoll).toBe(false);
      expect(result.formula).toBe('3d8');
    });

    it('deve gerar fórmula de penalidade quando totalDice = 0', () => {
      const result = calculateSkillRollFormula(0, 'd6');

      expect(result.diceCount).toBe(2);
      expect(result.dieSize).toBe('d6');
      expect(result.isPenaltyRoll).toBe(true);
      expect(result.formula).toBe('2d6 (menor)');
    });

    it('deve gerar fórmula de penalidade quando totalDice negativo', () => {
      const result = calculateSkillRollFormula(-2, 'd10');

      expect(result.diceCount).toBe(2);
      expect(result.isPenaltyRoll).toBe(true);
      expect(result.formula).toBe('2d10 (menor)');
    });

    it('deve limitar pool a 8 dados (MAX_SKILL_DICE)', () => {
      const result = calculateSkillRollFormula(10, 'd12');

      expect(result.diceCount).toBe(8);
      expect(result.isPenaltyRoll).toBe(false);
      expect(result.formula).toBe('8d12');
    });

    it('deve funcionar com exatamente 8 dados', () => {
      const result = calculateSkillRollFormula(8, 'd6');

      expect(result.diceCount).toBe(8);
      expect(result.formula).toBe('8d6');
    });

    it('deve funcionar com 1 dado', () => {
      const result = calculateSkillRollFormula(1, 'd6');

      expect(result.diceCount).toBe(1);
      expect(result.isPenaltyRoll).toBe(false);
      expect(result.formula).toBe('1d6');
    });

    it('deve usar dieSize correto para cada proficiência', () => {
      expect(calculateSkillRollFormula(2, 'd6').formula).toBe('2d6');
      expect(calculateSkillRollFormula(2, 'd8').formula).toBe('2d8');
      expect(calculateSkillRollFormula(2, 'd10').formula).toBe('2d10');
      expect(calculateSkillRollFormula(2, 'd12').formula).toBe('2d12');
    });
  });

  describe('calculateSkillRoll', () => {
    const attributes: Attributes = {
      agilidade: 2,
      corpo: 3,
      influencia: 2,
      mente: 2,
      essencia: 1,
      instinto: 1,
    };

    it('deve combinar cálculo de pool e fórmula de rolagem', () => {
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
      expect(result.calculation.dieSize).toBe('d10');
      expect(result.calculation.totalDiceModifier).toBe(0);
      expect(result.calculation.totalDice).toBe(2);

      expect(result.rollFormula.diceCount).toBe(2);
      expect(result.rollFormula.dieSize).toBe('d10');
      expect(result.rollFormula.formula).toBe('2d10');
    });

    it('deve contar apenas modificadores de dados (affectsDice) na pool', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', type: 'bonus', value: 2 }, // NÃO afeta dados
        { name: 'Vantagem', type: 'bonus', value: 1, affectsDice: true },
      ];

      const result = calculateSkillRoll(
        'atletismo',
        'corpo',
        attributes,
        'adepto',
        false,
        1,
        modifiers,
        false
      );

      // corpo=3, +1d (vantagem), bônus numérico ignorado
      expect(result.calculation.otherDiceModifiers).toBe(1);
      expect(result.calculation.totalDice).toBe(4); // 3 + 1

      expect(result.rollFormula.diceCount).toBe(4);
      expect(result.rollFormula.dieSize).toBe('d8');
      expect(result.rollFormula.formula).toBe('4d8');
    });

    it('deve funcionar com Habilidade de Assinatura', () => {
      const result = calculateSkillRoll(
        'percepcao',
        'instinto',
        attributes,
        'versado',
        true, // assinatura
        5, // nível 5
        [],
        false
      );

      // instinto=1, signatureDiceBonus=Math.min(3, ceil(5/5))=1, totalDice=2
      expect(result.calculation.signatureDiceBonus).toBe(1);
      expect(result.calculation.totalDice).toBe(2);

      expect(result.rollFormula.formula).toBe('2d10');
    });

    it('deve ativar penaltyRoll quando pool zerada por penalidade de carga', () => {
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

      // agilidade=2, loadDicePenalty=-2, totalDice=0, isPenaltyRoll=true
      expect(result.calculation.loadDicePenalty).toBe(-2);
      expect(result.calculation.totalDice).toBe(0);
      expect(result.calculation.isPenaltyRoll).toBe(true);

      expect(result.rollFormula.isPenaltyRoll).toBe(true);
      expect(result.rollFormula.formula).toBe('2d10 (menor)');
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
      expect(requiresInstrument('medicina')).toBe(true);
      expect(requiresInstrument('conducao')).toBe(true);
      expect(requiresInstrument('destreza')).toBe(true);
      expect(requiresInstrument('enganacao')).toBe(true);
      expect(requiresInstrument('oficio')).toBe(true);
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
      expect(isCombatSkill('reflexo')).toBe(true);
      expect(isCombatSkill('determinacao')).toBe(true);
      expect(isCombatSkill('natureza')).toBe(true);
      expect(isCombatSkill('religiao')).toBe(true);
      expect(isCombatSkill('arcano')).toBe(true);
      expect(isCombatSkill('sintonia')).toBe(true);
      expect(isCombatSkill('tenacidade')).toBe(true);
      expect(isCombatSkill('vigor')).toBe(true);
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
      corpo: 4,
      influencia: 1,
      mente: 2,
      essencia: 3,
      instinto: 1,
    };

    it('deve calcular total de dados com atributo customizado', () => {
      const skillUse = {
        keyAttribute: 'corpo' as const,
        bonus: 2,
        skillName: 'acrobacia' as const,
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado' as const,
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

      // corpo=4 + bonus=2 = 6
      expect(result).toBe(6);
    });

    it('deve incluir bônus de assinatura em uso customizado', () => {
      const skillUse = {
        keyAttribute: 'corpo' as const,
        bonus: 1,
        skillName: 'atletismo' as const,
      };

      const baseSkill: Skill = {
        name: 'atletismo',
        keyAttribute: 'corpo',
        proficiencyLevel: 'adepto' as const,
        isSignature: true,
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        7, // Nível 7
        false
      );

      // corpo=4 + signatureBonus=ceil(7/5)=2 + bonus=1 = 7
      expect(result).toBe(7);
    });

    it('deve aplicar mesma fórmula de assinatura para combate e não-combate', () => {
      const skillUse = {
        keyAttribute: 'mente' as const,
        bonus: 0,
        skillName: 'luta' as const,
      };

      const baseSkill: Skill = {
        name: 'luta',
        keyAttribute: 'corpo',
        proficiencyLevel: 'mestre' as const,
        isSignature: true,
        modifiers: [],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        9, // Nível 9
        false
      );

      // mente=2 + signatureBonus=ceil(9/5)=2 + bonus=0 = 4
      expect(result).toBe(4);
    });

    it('deve aplicar penalidade de carga quando sobrecarregado', () => {
      const skillUse = {
        keyAttribute: 'agilidade' as const,
        bonus: 0,
        skillName: 'acrobacia' as const,
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado' as const,
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

      // agilidade=3 + loadPenalty=-2 = 1
      expect(result).toBe(1);
    });

    it('deve incluir modificadores de dados da habilidade base', () => {
      const skillUse = {
        keyAttribute: 'essencia' as const,
        bonus: 3,
        skillName: 'persuasao' as const,
      };

      const baseSkill: Skill = {
        name: 'persuasao',
        keyAttribute: 'influencia',
        proficiencyLevel: 'adepto' as const,
        isSignature: false,
        modifiers: [
          {
            name: 'Bônus de item',
            value: 2,
            type: 'bonus' as const,
            affectsDice: true,
          },
          {
            name: 'Penalidade de debuff',
            value: -1,
            type: 'penalidade' as const,
            affectsDice: true,
          },
        ],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // essencia=3 + diceModifiers(2-1=1) + bonus=3 = 7
      expect(result).toBe(7);
    });

    it('deve ignorar modificadores sem affectsDice nos modificadores da base', () => {
      const skillUse = {
        keyAttribute: 'essencia' as const,
        bonus: 0,
        skillName: 'persuasao' as const,
      };

      const baseSkill: Skill = {
        name: 'persuasao',
        keyAttribute: 'influencia',
        proficiencyLevel: 'adepto' as const,
        isSignature: false,
        modifiers: [
          { name: 'Bônus numérico', value: 5, type: 'bonus' as const },
        ],
      };

      const result = calculateSkillUseModifier(
        skillUse,
        baseSkill,
        mockAttributes,
        1,
        false
      );

      // essencia=3, modificador ignorado, bonus=0 → total=3
      expect(result).toBe(3);
    });
  });

  describe('calculateSkillUseRollFormula', () => {
    const mockAttributes: Attributes = {
      agilidade: 3,
      corpo: 4,
      influencia: 0, // Atributo 0 para testar regra especial
      mente: 2,
      essencia: 3,
      instinto: 3,
    };

    it('deve gerar fórmula pool correta para uso customizado', () => {
      const skillUse = {
        keyAttribute: 'corpo' as const,
        bonus: 2,
        skillName: 'acrobacia' as const,
      };

      const baseSkill: Skill = {
        name: 'acrobacia',
        keyAttribute: 'agilidade',
        proficiencyLevel: 'versado' as const,
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

      // corpo=4 + bonus=2 = 6d10 (versado)
      expect(result).toBe('6d10');
    });

    it('deve aplicar regra de penalidade para atributo 0 sem bônus', () => {
      const skillUse = {
        keyAttribute: 'influencia' as const,
        bonus: 0,
        skillName: 'persuasao' as const,
      };

      const baseSkill: Skill = {
        name: 'persuasao',
        keyAttribute: 'influencia',
        proficiencyLevel: 'leigo' as const,
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

      // influencia=0, totalDice=0, isPenalty → 2d6 (menor)
      expect(result).toBe('2d6 (menor)');
    });

    it('deve gerar fórmula de penalidade quando bônus negativo reduz pool a ≤ 0', () => {
      const skillUse = {
        keyAttribute: 'mente' as const,
        bonus: -3,
        skillName: 'investigacao' as const,
      };

      const baseSkill: Skill = {
        name: 'investigacao',
        keyAttribute: 'mente',
        proficiencyLevel: 'leigo' as const,
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

      // mente=2 + bonus=-3 = -1, isPenalty → 2d6 (menor)
      expect(result).toBe('2d6 (menor)');
    });

    it('deve gerar fórmula pool normal quando sem modificadores', () => {
      const skillUse = {
        keyAttribute: 'instinto' as const,
        bonus: 0,
        skillName: 'percepcao' as const,
      };

      const baseSkill: Skill = {
        name: 'percepcao',
        keyAttribute: 'instinto',
        proficiencyLevel: 'leigo' as const,
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

      // instinto=3, totalDice=3 → 3d6 (leigo)
      expect(result).toBe('3d6');
    });

    it('deve usar tamanho de dado correto por proficiência', () => {
      const makeSkillUse = () => ({
        keyAttribute: 'corpo' as const,
        bonus: 0,
        skillName: 'atletismo' as const,
      });

      const makeBaseSkill = (
        proficiencyLevel: 'leigo' | 'adepto' | 'versado' | 'mestre'
      ): Skill => ({
        name: 'atletismo',
        keyAttribute: 'corpo',
        proficiencyLevel,
        isSignature: false,
        modifiers: [],
      });

      // corpo=4, variando proficiência
      expect(
        calculateSkillUseRollFormula(
          makeSkillUse(),
          makeBaseSkill('leigo'),
          mockAttributes,
          1,
          false
        )
      ).toBe('4d6');
      expect(
        calculateSkillUseRollFormula(
          makeSkillUse(),
          makeBaseSkill('adepto'),
          mockAttributes,
          1,
          false
        )
      ).toBe('4d8');
      expect(
        calculateSkillUseRollFormula(
          makeSkillUse(),
          makeBaseSkill('versado'),
          mockAttributes,
          1,
          false
        )
      ).toBe('4d10');
      expect(
        calculateSkillUseRollFormula(
          makeSkillUse(),
          makeBaseSkill('mestre'),
          mockAttributes,
          1,
          false
        )
      ).toBe('4d12');
    });
  });
});
