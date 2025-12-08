/**
 * Testes para cálculos de feitiços
 */

import {
  calculateSpellDC,
  calculateSpellAttackBonus,
  calculateSpellLearningChance,
  calculateSpellPPCost,
} from '../spellCalculations';

describe('spellCalculations', () => {
  describe('calculateSpellDC', () => {
    it('deve calcular ND básico corretamente (12 + Presença + Habilidade)', () => {
      expect(calculateSpellDC(2, 4, 0)).toBe(18); // 12 + 2 + 4 + 0
      expect(calculateSpellDC(3, 6, 0)).toBe(21); // 12 + 3 + 6 + 0
      expect(calculateSpellDC(1, 2, 0)).toBe(15); // 12 + 1 + 2 + 0
    });

    it('deve incluir bônus adicional ao ND', () => {
      expect(calculateSpellDC(3, 6, 2)).toBe(23); // 12 + 3 + 6 + 2
      expect(calculateSpellDC(2, 4, 5)).toBe(23); // 12 + 2 + 4 + 5
    });

    it('deve funcionar com bônus padrão (0)', () => {
      expect(calculateSpellDC(3, 6)).toBe(21); // 12 + 3 + 6
      expect(calculateSpellDC(2, 4)).toBe(18); // 12 + 2 + 4
    });

    it('deve funcionar com valores zero', () => {
      expect(calculateSpellDC(0, 0, 0)).toBe(12); // Base ND = 12
      expect(calculateSpellDC(0, 5, 0)).toBe(17); // 12 + 0 + 5
      expect(calculateSpellDC(3, 0, 0)).toBe(15); // 12 + 3 + 0
    });

    it('deve funcionar com bônus negativo (penalidade)', () => {
      expect(calculateSpellDC(3, 6, -2)).toBe(19); // 12 + 3 + 6 - 2
      expect(calculateSpellDC(2, 4, -5)).toBe(13); // 12 + 2 + 4 - 5
    });
  });

  describe('calculateSpellAttackBonus', () => {
    it('deve calcular bônus de ataque básico (Presença + Habilidade)', () => {
      expect(calculateSpellAttackBonus(2, 4, 0)).toBe(6); // 2 + 4 + 0
      expect(calculateSpellAttackBonus(3, 6, 0)).toBe(9); // 3 + 6 + 0
      expect(calculateSpellAttackBonus(1, 2, 0)).toBe(3); // 1 + 2 + 0
    });

    it('deve incluir bônus adicional ao ataque', () => {
      expect(calculateSpellAttackBonus(3, 6, 2)).toBe(11); // 3 + 6 + 2
      expect(calculateSpellAttackBonus(2, 4, 5)).toBe(11); // 2 + 4 + 5
    });

    it('deve funcionar com bônus padrão (0)', () => {
      expect(calculateSpellAttackBonus(3, 6)).toBe(9); // 3 + 6
      expect(calculateSpellAttackBonus(2, 4)).toBe(6); // 2 + 4
    });

    it('deve funcionar com valores zero', () => {
      expect(calculateSpellAttackBonus(0, 0, 0)).toBe(0);
      expect(calculateSpellAttackBonus(0, 5, 0)).toBe(5);
      expect(calculateSpellAttackBonus(3, 0, 0)).toBe(3);
    });

    it('deve funcionar com bônus negativo (penalidade)', () => {
      expect(calculateSpellAttackBonus(3, 6, -2)).toBe(7); // 3 + 6 - 2
      expect(calculateSpellAttackBonus(2, 4, -5)).toBe(1); // 2 + 4 - 5
    });
  });

  describe('calculateSpellLearningChance', () => {
    describe('primeiro feitiço (1º círculo)', () => {
      it('deve aplicar modificador +0 para 1º círculo se for o primeiro feitiço', () => {
        // Mente 2, Arcano +4, 1º círculo, primeiro feitiço
        const chance = calculateSpellLearningChance(2, 4, 1, true);
        expect(chance).toBe(14); // (2×5) + 4 + 0 = 14
      });

      it('deve aplicar modificador +30 para 1º círculo se NÃO for o primeiro feitiço', () => {
        // Mente 2, Arcano +4, 1º círculo, não é o primeiro
        const chance = calculateSpellLearningChance(2, 4, 1, false);
        expect(chance).toBe(44); // (2×5) + 4 + 30 = 44
      });
    });

    describe('modificadores por círculo', () => {
      it('deve aplicar +30 no 1º círculo (feitiço subsequente)', () => {
        const chance = calculateSpellLearningChance(3, 6, 1, false);
        expect(chance).toBe(51); // (3×5) + 6 + 30 = 51
      });

      it('deve aplicar +10 no 2º círculo', () => {
        const chance = calculateSpellLearningChance(3, 6, 2, false);
        expect(chance).toBe(31); // (3×5) + 6 + 10 = 31
      });

      it('deve aplicar +0 no 3º círculo', () => {
        const chance = calculateSpellLearningChance(3, 6, 3, false);
        expect(chance).toBe(21); // (3×5) + 6 + 0 = 21
      });

      it('deve aplicar -10 no 4º círculo', () => {
        const chance = calculateSpellLearningChance(3, 6, 4, false);
        expect(chance).toBe(11); // (3×5) + 6 - 10 = 11
      });

      it('deve aplicar -20 no 5º círculo', () => {
        const chance = calculateSpellLearningChance(3, 6, 5, false);
        expect(chance).toBe(1); // (3×5) + 6 - 20 = 1 (mínimo 1%)
      });

      it('deve aplicar -30 no 6º círculo', () => {
        const chance = calculateSpellLearningChance(3, 6, 6, false);
        expect(chance).toBe(1); // (3×5) + 6 - 30 = -9, limitado a 1%
      });

      it('deve aplicar -50 no 7º círculo', () => {
        const chance = calculateSpellLearningChance(4, 10, 7, false);
        expect(chance).toBe(1); // (4×5) + 10 - 50 = -20, limitado a 1%
      });

      it('deve aplicar -70 no 8º círculo', () => {
        const chance = calculateSpellLearningChance(5, 15, 8, false);
        expect(chance).toBe(1); // (5×5) + 15 - 70 = -30, limitado a 1%
      });
    });

    describe('limites de chance', () => {
      it('deve limitar a chance mínima em 1%', () => {
        // Valores muito baixos
        const chance = calculateSpellLearningChance(1, 0, 8, false);
        expect(chance).toBe(1); // (1×5) + 0 - 70 = -65, limitado a 1%
      });

      it('deve limitar a chance máxima em 99%', () => {
        // Valores muito altos com muitos modificadores
        const chance = calculateSpellLearningChance(
          5, // Mente
          20, // Habilidade
          1, // Círculo
          false, // Não é o primeiro
          10, // Modificador de feitiços conhecidos
          15, // Modificador de matriz
          20 // Outros modificadores
        );
        // (5×5) + 20 + 30 + 10 + 15 + 20 = 120, limitado a 99%
        expect(chance).toBe(99);
      });
    });

    describe('modificadores adicionais', () => {
      it('deve incluir modificador de feitiços conhecidos', () => {
        const chance = calculateSpellLearningChance(
          3, // Mente
          6, // Habilidade
          2, // Círculo (+10)
          false,
          -5 // Modificador de feitiços conhecidos
        );
        expect(chance).toBe(26); // (3×5) + 6 + 10 - 5 = 26
      });

      it('deve incluir modificador de matriz', () => {
        const chance = calculateSpellLearningChance(
          3, // Mente
          6, // Habilidade
          2, // Círculo (+10)
          false,
          0, // Modificador de feitiços conhecidos
          3 // Modificador de matriz
        );
        expect(chance).toBe(34); // (3×5) + 6 + 10 + 0 + 3 = 34
      });

      it('deve incluir outros modificadores', () => {
        const chance = calculateSpellLearningChance(
          3, // Mente
          6, // Habilidade
          2, // Círculo (+10)
          false,
          0, // Modificador de feitiços conhecidos
          0, // Modificador de matriz
          5 // Outros modificadores
        );
        expect(chance).toBe(36); // (3×5) + 6 + 10 + 0 + 0 + 5 = 36
      });

      it('deve combinar todos os modificadores', () => {
        const chance = calculateSpellLearningChance(
          4, // Mente
          8, // Habilidade
          3, // Círculo (0)
          false,
          -2, // Modificador de feitiços conhecidos
          3, // Modificador de matriz
          2 // Outros modificadores
        );
        expect(chance).toBe(31); // (4×5) + 8 + 0 - 2 + 3 + 2 = 31
      });
    });

    describe('casos reais de personagem', () => {
      it('deve calcular corretamente para mago iniciante aprendendo 1º feitiço', () => {
        // Personagem nível 1: Mente 3, Arcano Adepto (+3), primeiro feitiço
        const chance = calculateSpellLearningChance(3, 3, 1, true);
        expect(chance).toBe(18); // (3×5) + 3 + 0 = 18%
      });

      it('deve calcular corretamente para mago experiente aprendendo feitiço avançado', () => {
        // Personagem nível 10: Mente 4, Arcano Versado (+8), 5º círculo
        const chance = calculateSpellLearningChance(4, 8, 5, false);
        expect(chance).toBe(8); // (4×5) + 8 - 20 = 8%
      });

      it('deve calcular corretamente para clérigo aprendendo feitiço médio', () => {
        // Personagem nível 7: Mente 2, Religião Versado (+4), 3º círculo
        const chance = calculateSpellLearningChance(2, 4, 3, false);
        expect(chance).toBe(14); // (2×5) + 4 + 0 = 14%
      });
    });
  });

  describe('calculateSpellPPCost', () => {
    it('deve retornar o custo do círculo sem modificadores', () => {
      expect(calculateSpellPPCost(0, 0)).toBe(0); // 1º círculo
      expect(calculateSpellPPCost(3, 0)).toBe(3); // 3º círculo
      expect(calculateSpellPPCost(7, 0)).toBe(7); // 5º círculo
      expect(calculateSpellPPCost(15, 0)).toBe(15); // 8º círculo
    });

    it('deve adicionar custo adicional corretamente', () => {
      expect(calculateSpellPPCost(3, 2)).toBe(5); // 3º círculo + 2 PP
      expect(calculateSpellPPCost(7, 3)).toBe(10); // 5º círculo + 3 PP
    });

    it('deve funcionar com custo adicional padrão (0)', () => {
      expect(calculateSpellPPCost(5)).toBe(5); // 4º círculo sem adicional
      expect(calculateSpellPPCost(9)).toBe(9); // 6º círculo sem adicional
    });

    it('deve lidar com custo negativo (nunca deve retornar negativo)', () => {
      expect(calculateSpellPPCost(0, -5)).toBe(0); // Mínimo 0
      expect(calculateSpellPPCost(3, -10)).toBe(0); // Mínimo 0
    });

    it('deve permitir custos adicionais grandes', () => {
      expect(calculateSpellPPCost(7, 10)).toBe(17); // 5º círculo + 10 PP
      expect(calculateSpellPPCost(0, 20)).toBe(20); // 1º círculo + 20 PP
    });

    describe('exemplos com custos de círculo reais', () => {
      it('1º círculo (custo 0)', () => {
        expect(calculateSpellPPCost(0, 0)).toBe(0);
      });

      it('2º círculo (custo 1)', () => {
        expect(calculateSpellPPCost(1, 0)).toBe(1);
      });

      it('3º círculo (custo 3)', () => {
        expect(calculateSpellPPCost(3, 0)).toBe(3);
      });

      it('4º círculo (custo 5)', () => {
        expect(calculateSpellPPCost(5, 0)).toBe(5);
      });

      it('5º círculo (custo 7)', () => {
        expect(calculateSpellPPCost(7, 0)).toBe(7);
      });

      it('6º círculo (custo 9)', () => {
        expect(calculateSpellPPCost(9, 0)).toBe(9);
      });

      it('7º círculo (custo 12)', () => {
        expect(calculateSpellPPCost(12, 0)).toBe(12);
      });

      it('8º círculo (custo 15)', () => {
        expect(calculateSpellPPCost(15, 0)).toBe(15);
      });
    });
  });
});
