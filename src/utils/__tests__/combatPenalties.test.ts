/**
 * @file Unit tests for combat penalties utility functions
 * @description Tests for Issue 5.6 - Sistema de Penalidade por Erros
 */

import {
  MIN_DEFENSE,
  DEFENSE_PENALTY_PER_MISS,
  SAVING_THROW_DICE_PENALTY_PER_SUCCESS,
  createDefaultCombatPenalties,
  applyDefensePenalty,
  resetDefensePenalty,
  applySavingThrowPenalty,
  resetSavingThrowPenalty,
  resetAllPenalties,
  calculateEffectiveDefense,
  hasAnyPenalty,
  SAVING_THROW_LABELS,
  SAVING_THROW_COLORS,
  type CombatPenaltiesState,
} from '../combatPenalties';
import type { SavingThrowType } from '@/types';

describe('combatPenalties', () => {
  describe('Constants', () => {
    it('deve ter MIN_DEFENSE igual a 15', () => {
      expect(MIN_DEFENSE).toBe(15);
    });

    it('deve ter penalidade de defesa por erro igual a -1', () => {
      expect(DEFENSE_PENALTY_PER_MISS).toBe(-1);
    });

    it('deve ter penalidade de dado por sucesso em resistência igual a -1', () => {
      expect(SAVING_THROW_DICE_PENALTY_PER_SUCCESS).toBe(-1);
    });
  });

  describe('createDefaultCombatPenalties', () => {
    it('deve criar penalidades padrão com todos os valores zerados', () => {
      const penalties = createDefaultCombatPenalties();

      expect(penalties.defensePenalty).toBe(0);
      expect(penalties.savingThrowPenalties.determinacao).toBe(0);
      expect(penalties.savingThrowPenalties.reflexo).toBe(0);
      expect(penalties.savingThrowPenalties.tenacidade).toBe(0);
      expect(penalties.savingThrowPenalties.vigor).toBe(0);
    });
  });

  describe('applyDefensePenalty', () => {
    it('deve diminuir penalidade em 1 quando erra ataque', () => {
      const newPenalty = applyDefensePenalty(0, 20);
      expect(newPenalty).toBe(-1);
    });

    it('deve acumular penalidades de defesa', () => {
      const baseDefense = 20;
      let penalty = 0;
      penalty = applyDefensePenalty(penalty, baseDefense);
      penalty = applyDefensePenalty(penalty, baseDefense);
      penalty = applyDefensePenalty(penalty, baseDefense);

      expect(penalty).toBe(-3);
    });

    it('não deve permitir penalidade que deixe defesa abaixo de 15', () => {
      const baseDefense = 17;
      let penalty = 0;

      // Primeira penalidade: 17 - 1 = 16 (ok)
      penalty = applyDefensePenalty(penalty, baseDefense);
      expect(penalty).toBe(-1);

      // Segunda penalidade: 17 - 2 = 15 (ok)
      penalty = applyDefensePenalty(penalty, baseDefense);
      expect(penalty).toBe(-2);

      // Terceira penalidade: 17 - 3 = 14 (não pode! fica em -2)
      penalty = applyDefensePenalty(penalty, baseDefense);
      expect(penalty).toBe(-2); // Mantém -2, que resulta em 15
    });

    it('não deve aplicar penalidade se defesa já está em 15', () => {
      const baseDefense = 15;
      const penalty = applyDefensePenalty(0, baseDefense);
      expect(penalty).toBe(0); // Não pode penalizar, já está no mínimo
    });
  });

  describe('resetDefensePenalty', () => {
    it('deve retornar 0', () => {
      expect(resetDefensePenalty()).toBe(0);
    });
  });

  describe('applySavingThrowPenalty', () => {
    it('deve diminuir penalidade de resistência específica em 1', () => {
      const penalties = createDefaultCombatPenalties().savingThrowPenalties;
      const updated = applySavingThrowPenalty(penalties, 'determinacao');

      expect(updated.determinacao).toBe(-1);
      expect(updated.reflexo).toBe(0);
      expect(updated.tenacidade).toBe(0);
      expect(updated.vigor).toBe(0);
    });

    it('deve acumular penalidades de resistência', () => {
      let penalties = createDefaultCombatPenalties().savingThrowPenalties;
      penalties = applySavingThrowPenalty(penalties, 'reflexo');
      penalties = applySavingThrowPenalty(penalties, 'reflexo');

      expect(penalties.reflexo).toBe(-2);
    });

    const savingThrowTypes: SavingThrowType[] = [
      'determinacao',
      'reflexo',
      'tenacidade',
      'vigor',
    ];

    savingThrowTypes.forEach((type) => {
      it(`deve aplicar penalidade para ${type}`, () => {
        const penalties = createDefaultCombatPenalties().savingThrowPenalties;
        const updated = applySavingThrowPenalty(penalties, type);

        expect(updated[type]).toBe(-1);
      });
    });
  });

  describe('resetSavingThrowPenalty', () => {
    it('deve resetar a penalidade de resistência específica para 0', () => {
      let penalties = createDefaultCombatPenalties().savingThrowPenalties;
      penalties.tenacidade = -3;

      const updated = resetSavingThrowPenalty(penalties, 'tenacidade');

      expect(updated.tenacidade).toBe(0);
    });

    it('não deve alterar outras penalidades de resistência', () => {
      let penalties = createDefaultCombatPenalties().savingThrowPenalties;
      penalties.determinacao = -2;
      penalties.reflexo = -1;

      const updated = resetSavingThrowPenalty(penalties, 'determinacao');

      expect(updated.determinacao).toBe(0);
      expect(updated.reflexo).toBe(-1);
    });
  });

  describe('resetAllPenalties', () => {
    it('deve retornar estado completamente zerado', () => {
      const updated = resetAllPenalties();

      expect(updated.defensePenalty).toBe(0);
      expect(updated.savingThrowPenalties.determinacao).toBe(0);
      expect(updated.savingThrowPenalties.reflexo).toBe(0);
      expect(updated.savingThrowPenalties.tenacidade).toBe(0);
      expect(updated.savingThrowPenalties.vigor).toBe(0);
    });
  });

  describe('calculateEffectiveDefense', () => {
    it('deve calcular defesa efetiva corretamente', () => {
      expect(calculateEffectiveDefense(20, 0)).toBe(20); // Sem penalidade
      expect(calculateEffectiveDefense(20, -3)).toBe(17); // Com penalidade
      expect(calculateEffectiveDefense(18, -2)).toBe(16);
    });

    it('deve respeitar o limite mínimo de defesa (15)', () => {
      expect(calculateEffectiveDefense(16, -5)).toBe(15); // Não pode ir abaixo de 15
      expect(calculateEffectiveDefense(15, -1)).toBe(15);
      expect(calculateEffectiveDefense(20, -10)).toBe(15);
    });

    it('deve retornar defesa base se não houver penalidade', () => {
      expect(calculateEffectiveDefense(25, 0)).toBe(25);
    });
  });

  describe('hasAnyPenalty', () => {
    it('deve retornar false quando não há penalidades', () => {
      const penalties = createDefaultCombatPenalties();
      expect(hasAnyPenalty(penalties)).toBe(false);
    });

    it('deve retornar true quando há penalidade de defesa', () => {
      const penalties: CombatPenaltiesState = {
        defensePenalty: -2,
        savingThrowPenalties: {
          determinacao: 0,
          reflexo: 0,
          tenacidade: 0,
          vigor: 0,
        },
      };
      expect(hasAnyPenalty(penalties)).toBe(true);
    });

    it('deve retornar true quando há penalidade de resistência', () => {
      const penalties: CombatPenaltiesState = {
        defensePenalty: 0,
        savingThrowPenalties: {
          determinacao: 0,
          reflexo: -1,
          tenacidade: 0,
          vigor: 0,
        },
      };
      expect(hasAnyPenalty(penalties)).toBe(true);
    });
  });

  describe('Labels and Colors', () => {
    it('deve ter labels para todos os tipos de resistência', () => {
      expect(SAVING_THROW_LABELS.determinacao).toBe('Determinação');
      expect(SAVING_THROW_LABELS.reflexo).toBe('Reflexo');
      expect(SAVING_THROW_LABELS.tenacidade).toBe('Tenacidade');
      expect(SAVING_THROW_LABELS.vigor).toBe('Vigor');
    });

    it('deve ter cores para todos os tipos de resistência', () => {
      expect(SAVING_THROW_COLORS.determinacao).toBeDefined();
      expect(SAVING_THROW_COLORS.reflexo).toBeDefined();
      expect(SAVING_THROW_COLORS.tenacidade).toBeDefined();
      expect(SAVING_THROW_COLORS.vigor).toBeDefined();
    });
  });

  describe('Cenários de uso em combate', () => {
    it('deve simular sequência de erros em combate', () => {
      const baseDefense = 20;
      let defensePenalty = 0;

      // Personagem erra 3 ataques consecutivos
      defensePenalty = applyDefensePenalty(defensePenalty, baseDefense);
      defensePenalty = applyDefensePenalty(defensePenalty, baseDefense);
      defensePenalty = applyDefensePenalty(defensePenalty, baseDefense);

      // Defesa base 20 fica 17
      expect(calculateEffectiveDefense(baseDefense, defensePenalty)).toBe(17);

      // Personagem acerta um ataque - reseta defesa
      defensePenalty = resetDefensePenalty();
      expect(calculateEffectiveDefense(baseDefense, defensePenalty)).toBe(20);
    });

    it('deve simular sucessos em testes de resistência', () => {
      let penalties = createDefaultCombatPenalties().savingThrowPenalties;

      // Personagem passa 2 testes de Reflexo
      penalties = applySavingThrowPenalty(penalties, 'reflexo');
      penalties = applySavingThrowPenalty(penalties, 'reflexo');

      // Tem -2 dados (mínimo 1d20)
      expect(penalties.reflexo).toBe(-2);

      // Personagem falha um teste - reseta
      penalties = resetSavingThrowPenalty(penalties, 'reflexo');
      expect(penalties.reflexo).toBe(0);
    });

    it('deve simular início de novo turno', () => {
      // Novo turno - reseta tudo
      const updated = resetAllPenalties();

      expect(updated.defensePenalty).toBe(0);
      expect(
        Object.values(updated.savingThrowPenalties).every((v) => v === 0)
      ).toBe(true);
    });
  });
});
