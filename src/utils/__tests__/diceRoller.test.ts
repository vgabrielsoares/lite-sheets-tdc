/**
 * Testes para o Sistema de Rolagem de Dados
 */

import {
  rollD20,
  rollDamage,
  rollDamageWithCritical,
  rollSkillTest,
  DiceRollHistory,
  globalDiceHistory,
  type DiceRollResult,
} from '../diceRoller';

describe('Sistema de Rolagem de Dados', () => {
  describe('rollD20 - Rolagem de d20', () => {
    describe('Atributo 0 (2d20, escolher menor)', () => {
      it('deve rolar 2 dados quando atributo é 0', () => {
        const result = rollD20(0, 0);

        expect(result.rolls).toHaveLength(2);
        expect(result.diceCount).toBe(0);
        expect(result.rollType).toBe('disadvantage');
        expect(result.formula).toContain('0d20');
        expect(result.formula).toContain('2d20, menor');
      });

      it('deve escolher o MENOR valor quando atributo é 0', () => {
        // Mock Math.random para resultados controlados
        let callCount = 0;
        const mockRolls = [15, 8]; // Deve escolher 8
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(0, 0);

        expect(result.baseResult).toBe(8);
        expect(result.finalResult).toBe(8);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve aplicar modificador corretamente com atributo 0', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola 11

        const result = rollD20(0, 5);

        expect(result.modifier).toBe(5);
        expect(result.finalResult).toBe(result.baseResult + 5);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Dados Negativos (penalidade extra)', () => {
      it('deve rolar 3 dados para -1d20', () => {
        const result = rollD20(-1, 0);

        expect(result.rolls).toHaveLength(3);
        expect(result.diceCount).toBe(-1);
        expect(result.rollType).toBe('disadvantage');
      });

      it('deve rolar 4 dados para -2d20', () => {
        const result = rollD20(-2, 0);

        expect(result.rolls).toHaveLength(4);
        expect(result.diceCount).toBe(-2);
      });

      it('deve rolar 5 dados para -3d20', () => {
        const result = rollD20(-3, 0);

        expect(result.rolls).toHaveLength(5);
        expect(result.diceCount).toBe(-3);
      });

      it('deve escolher o MENOR valor em dados negativos', () => {
        let callCount = 0;
        const mockRolls = [15, 8, 12]; // -1d20 = 3d20, deve escolher 8
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(-1, 0);

        expect(result.baseResult).toBe(8);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Dados Positivos (normal)', () => {
      it('deve rolar o número correto de dados', () => {
        const result1 = rollD20(1, 0);
        expect(result1.rolls).toHaveLength(1);

        const result2 = rollD20(2, 0);
        expect(result2.rolls).toHaveLength(2);

        const result3 = rollD20(3, 0);
        expect(result3.rolls).toHaveLength(3);

        const result5 = rollD20(5, 0);
        expect(result5.rolls).toHaveLength(5);
      });

      it('deve escolher o MAIOR valor em rolagem normal', () => {
        let callCount = 0;
        const mockRolls = [8, 15, 12]; // Deve escolher 15
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(3, 0, 'normal');

        expect(result.baseResult).toBe(15);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve aplicar modificador positivo corretamente', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola 11

        const result = rollD20(2, 5);

        expect(result.modifier).toBe(5);
        expect(result.finalResult).toBe(result.baseResult + 5);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve aplicar modificador negativo corretamente', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola 11

        const result = rollD20(2, -3);

        expect(result.modifier).toBe(-3);
        expect(result.finalResult).toBe(result.baseResult - 3);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Múltiplos Dados', () => {
      it('deve rolar 2d20 e escolher o MAIOR', () => {
        let callCount = 0;
        const mockRolls = [8, 15]; // Deve escolher 15
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(2, 0);

        expect(result.rolls).toHaveLength(2);
        expect(result.baseResult).toBe(15);
        expect(result.rollType).toBe('normal');

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve rolar 3d20 e escolher o MAIOR', () => {
        let callCount = 0;
        const mockRolls = [8, 15, 12]; // Deve escolher 15
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(3, 0);

        expect(result.rolls).toHaveLength(3);
        expect(result.baseResult).toBe(15);
        expect(result.rollType).toBe('normal');

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Críticos e Falhas Críticas', () => {
      it('deve detectar crítico (20 natural)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.99); // Rola 20

        const result = rollD20(1, 0);

        expect(result.baseResult).toBe(20);
        expect(result.isCritical).toBe(true);
        expect(result.isCriticalFailure).toBe(false);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve detectar falha crítica (1 natural)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // Rola 1

        const result = rollD20(1, 0);

        expect(result.baseResult).toBe(1);
        expect(result.isCritical).toBe(false);
        expect(result.isCriticalFailure).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Contexto e Timestamp', () => {
      it('deve armazenar contexto da rolagem', () => {
        const context = 'Teste de Acrobacia';
        const result = rollD20(2, 3, 'normal', context);

        expect(result.context).toBe(context);
      });

      it('deve ter timestamp válido', () => {
        const before = new Date();
        const result = rollD20(2, 0);
        const after = new Date();

        expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        );
        expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });

    describe('Validação de resultados', () => {
      it('todos os dados devem estar entre 1 e 20', () => {
        for (let i = 0; i < 100; i++) {
          const result = rollD20(3, 0);
          result.rolls.forEach((roll) => {
            expect(roll).toBeGreaterThanOrEqual(1);
            expect(roll).toBeLessThanOrEqual(20);
          });
        }
      });
    });
  });

  describe('rollDamage - Rolagem de Dano', () => {
    it('deve rolar o número correto de dados', () => {
      const result = rollDamage(3, 6, 0);

      expect(result.rolls).toHaveLength(3);
      expect(result.diceType).toBe(6);
      expect(result.diceCount).toBe(3);
    });

    it('deve somar todos os dados rolados', () => {
      let callCount = 0;
      const mockRolls = [3, 5, 2]; // Total = 10
      jest.spyOn(Math, 'random').mockImplementation(() => {
        const value = (mockRolls[callCount] - 1) / 6;
        callCount++;
        return value;
      });

      const result = rollDamage(3, 6, 0);

      expect(result.baseResult).toBe(10);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve aplicar modificador de dano', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola valores médios

      const result = rollDamage(2, 6, 5);

      expect(result.modifier).toBe(5);
      expect(result.finalResult).toBe(result.baseResult + 5);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('não deve permitir dano negativo', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // Rola 1 em cada dado

      const result = rollDamage(1, 6, -10);

      expect(result.finalResult).toBeGreaterThanOrEqual(0);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve funcionar com diferentes tipos de dados', () => {
      const d4 = rollDamage(1, 4, 0);
      expect(d4.diceType).toBe(4);

      const d6 = rollDamage(1, 6, 0);
      expect(d6.diceType).toBe(6);

      const d8 = rollDamage(1, 8, 0);
      expect(d8.diceType).toBe(8);

      const d10 = rollDamage(1, 10, 0);
      expect(d10.diceType).toBe(10);

      const d12 = rollDamage(1, 12, 0);
      expect(d12.diceType).toBe(12);
    });

    it('deve lidar com 0 dados', () => {
      const result = rollDamage(0, 6, 5);

      expect(result.rolls).toHaveLength(0);
      expect(result.baseResult).toBe(0);
      expect(result.finalResult).toBe(5);
    });

    it('deve gerar fórmula correta', () => {
      const result1 = rollDamage(3, 6, 5);
      expect(result1.formula).toBe('3d6+5');

      const result2 = rollDamage(2, 8, -2);
      expect(result2.formula).toBe('2d8-2');

      const result3 = rollDamage(1, 4, 0);
      expect(result3.formula).toBe('1d4+0');
    });

    describe('Validação de resultados', () => {
      it('todos os dados devem estar dentro do range', () => {
        for (let i = 0; i < 100; i++) {
          const result = rollDamage(3, 8, 0);
          result.rolls.forEach((roll) => {
            expect(roll).toBeGreaterThanOrEqual(1);
            expect(roll).toBeLessThanOrEqual(8);
          });
        }
      });
    });
  });

  describe('rollDamageWithCritical - Dano com Crítico', () => {
    it('deve maximizar os dados em crítico', () => {
      const result = rollDamageWithCritical(2, 6, 3, true);

      expect(result.rolls).toHaveLength(2); // 2d6
      expect(result.rolls.every((r) => r === 6)).toBe(true); // Todos maximizados
      expect(result.baseResult).toBe(12); // 2 * 6
      expect(result.finalResult).toBe(15); // 12 + 3
      expect(result.isCritical).toBe(true);
      expect(result.formula).toContain('MAXIMIZADO');
    });

    it('não deve modificar o modificador em crítico', () => {
      const result = rollDamageWithCritical(2, 6, 5, true);

      // 2d6 crítico = MAXIMIZADO = 12, modificador permanece 5
      expect(result.baseResult).toBe(12); // 2 * 6
      expect(result.finalResult).toBe(17); // 12 + 5
    });

    it('deve funcionar normalmente quando não é crítico', () => {
      const result = rollDamageWithCritical(2, 6, 3, false);

      expect(result.rolls).toHaveLength(2);
      expect(result.isCritical).toBeUndefined();
      expect(result.formula).not.toContain('crítico');
    });
  });

  describe('rollSkillTest - Teste de Habilidade', () => {
    it('deve calcular bônus de proficiência corretamente', () => {
      // Atributo 3, Versado (x2) = +6 de proficiência
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola 11

      const result = rollSkillTest(3, 2, 0, 'normal', 'Teste de Acrobacia');

      expect(result.modifier).toBe(6); // 3 * 2
      expect(result.context).toBe('Teste de Acrobacia');

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve somar modificador adicional ao bônus de proficiência', () => {
      // Atributo 2, Adepto (x1), +3 adicional = +5 total
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = rollSkillTest(2, 1, 3);

      expect(result.modifier).toBe(5); // (2 * 1) + 3

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve funcionar com leigo (x0)', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = rollSkillTest(3, 0, 0);

      expect(result.modifier).toBe(0); // 3 * 0

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve funcionar com mestre (x3)', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = rollSkillTest(4, 3, 0);

      expect(result.modifier).toBe(12); // 4 * 3

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('deve usar tipo de rolagem normal para dados positivos', () => {
      const result = rollSkillTest(2, 1, 0);
      expect(result.rollType).toBe('normal');
    });
  });

  describe('DiceRollHistory - Histórico de Rolagens', () => {
    let history: DiceRollHistory;

    beforeEach(() => {
      history = new DiceRollHistory();
    });

    it('deve adicionar rolagens ao histórico', () => {
      const roll = rollD20(2, 3);
      history.add(roll);

      expect(history.size).toBe(1);
      expect(history.getAll()[0]).toEqual(roll);
    });

    it('deve adicionar novas rolagens no início', () => {
      const roll1 = rollD20(2, 3);
      const roll2 = rollD20(3, 5);

      history.add(roll1);
      history.add(roll2);

      const all = history.getAll();
      expect(all[0]).toEqual(roll2); // Mais recente primeiro
      expect(all[1]).toEqual(roll1);
    });

    it('deve respeitar limite máximo de histórico', () => {
      // Adicionar 60 rolagens (limite é 50)
      for (let i = 0; i < 60; i++) {
        history.add(rollD20(2, i));
      }

      expect(history.size).toBe(50);
    });

    it('deve retornar últimas N rolagens', () => {
      for (let i = 0; i < 10; i++) {
        history.add(rollD20(2, i));
      }

      const last3 = history.getLast(3);
      expect(last3).toHaveLength(3);
      expect(last3[0].modifier).toBe(9); // Mais recente
      expect(last3[2].modifier).toBe(7);
    });

    it('deve limpar histórico', () => {
      history.add(rollD20(2, 3));
      history.add(rollD20(2, 5));

      expect(history.size).toBe(2);

      history.clear();

      expect(history.size).toBe(0);
      expect(history.getAll()).toEqual([]);
    });

    it('deve retornar cópia do histórico (não referência)', () => {
      const roll = rollD20(2, 3);
      history.add(roll);

      const all = history.getAll();
      all.push(rollD20(3, 5)); // Modifica a cópia

      expect(history.size).toBe(1); // Original não muda
    });
  });

  describe('globalDiceHistory - Histórico Global', () => {
    beforeEach(() => {
      globalDiceHistory.clear();
    });

    it('deve ser uma instância de DiceRollHistory', () => {
      expect(globalDiceHistory).toBeInstanceOf(DiceRollHistory);
    });

    it('deve persistir entre chamadas', () => {
      globalDiceHistory.add(rollD20(2, 3));

      expect(globalDiceHistory.size).toBe(1);

      globalDiceHistory.add(rollD20(3, 5));

      expect(globalDiceHistory.size).toBe(2);
    });
  });

  describe('Casos de Uso Reais', () => {
    it('deve simular teste de habilidade com atributo 0', () => {
      // Personagem com Agilidade 0, Leigo em Acrobacia
      const result = rollSkillTest(0, 0, 0, 'normal', 'Acrobacia');

      expect(result.diceCount).toBe(0);
      expect(result.rolls).toHaveLength(2); // 2d20, menor
      expect(result.rollType).toBe('disadvantage');
    });

    it('deve simular teste de habilidade normal', () => {
      // Personagem com Força 3, Versado em Atletismo, +2 circunstancial
      const result = rollSkillTest(3, 2, 2, 'normal', 'Atletismo');

      expect(result.diceCount).toBe(3);
      expect(result.modifier).toBe(8); // (3 * 2) + 2
    });

    it('deve simular ataque com penalidade', () => {
      // Personagem atacando com -2d20 de penalidade
      const result = rollD20(-2, 5, 'normal', 'Ataque de Espada');

      expect(result.rolls).toHaveLength(4); // -2d20 = 4d20 (menor)
      expect(result.rollType).toBe('disadvantage');
    });

    it('deve simular dano crítico', () => {
      // Ataque crítico: 2d6+3 (MAXIMIZADO)
      const result = rollDamageWithCritical(2, 6, 3, true, 'Dano de Espada');

      expect(result.rolls).toHaveLength(2); // 2d6
      expect(result.baseResult).toBe(12); // Maximizado: 2 * 6
      expect(result.finalResult).toBe(15); // 12 + 3
      expect(result.isCritical).toBe(true);
      expect(result.context).toBe('Dano de Espada');
    });
  });

  describe('Detecção de Desastres', () => {
    describe('Single d20 = 1', () => {
      it('deve detectar desastre quando único d20 = 1', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // Rola 1

        const result = rollD20(1, 0);

        expect(result.rolls).toEqual([1]);
        expect(result.isDisaster).toBe(true);
        expect(result.isCriticalFailure).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('NÃO deve detectar desastre quando único d20 != 1', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // Rola 11

        const result = rollD20(1, 0);

        expect(result.rolls).toEqual([11]);
        expect(result.isDisaster).toBe(false);
        expect(result.isCriticalFailure).toBe(false);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Múltiplos dados - mais da metade iguais', () => {
      it('deve detectar desastre com 2 dados iguais (2d20)', () => {
        let callCount = 0;
        const mockRolls = [7, 7]; // Ambos iguais
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(2, 0);

        expect(result.rolls).toEqual([7, 7]);
        expect(result.isDisaster).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve detectar desastre com 2 de 3 dados iguais (3d20)', () => {
        let callCount = 0;
        const mockRolls = [10, 10, 5]; // 2 iguais de 3
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(3, 0);

        expect(result.rolls).toEqual([10, 10, 5]);
        expect(result.isDisaster).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve detectar desastre com 3 de 4 dados iguais (4d20)', () => {
        let callCount = 0;
        const mockRolls = [8, 8, 8, 3]; // 3 iguais de 4
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(4, 0);

        expect(result.rolls).toEqual([8, 8, 8, 3]);
        expect(result.isDisaster).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('NÃO deve detectar desastre com apenas 1 de 3 dados iguais', () => {
        let callCount = 0;
        const mockRolls = [10, 5, 3]; // Todos diferentes
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(3, 0);

        expect(result.rolls).toEqual([10, 5, 3]);
        expect(result.isDisaster).toBe(false);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('NÃO deve detectar desastre quando os dados iguais são 20', () => {
        let callCount = 0;
        const mockRolls = [20, 20]; // Ambos 20
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(2, 0);

        expect(result.rolls).toEqual([20, 20]);
        expect(result.isDisaster).toBe(false); // 20 não conta para desastre
        expect(result.isCritical).toBe(true); // Mas é crítico

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Atributo 0 e dados negativos', () => {
      it('deve detectar desastre com atributo 0 (2d20, ambos iguais)', () => {
        let callCount = 0;
        const mockRolls = [5, 5];
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(0, 0);

        expect(result.rolls).toEqual([5, 5]);
        expect(result.isDisaster).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('deve detectar desastre com -1d20 (3d20, 2+ iguais)', () => {
        let callCount = 0;
        const mockRolls = [12, 12, 8]; // 2 iguais
        jest.spyOn(Math, 'random').mockImplementation(() => {
          const value = (mockRolls[callCount] - 1) / 20;
          callCount++;
          return value;
        });

        const result = rollD20(-1, 0);

        expect(result.rolls).toEqual([12, 12, 8]);
        expect(result.isDisaster).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });
    });

    describe('Rolagens de dano - NÃO devem ter desastres', () => {
      it('NÃO deve marcar desastre em rolagem de dano', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // Todos os dados = 1

        const result = rollDamage(3, 6, 0);

        expect(result.rolls).toEqual([1, 1, 1]);
        expect(result.isDisaster).toBe(false); // Dano não tem desastres
        expect(result.isDamageRoll).toBe(true);

        jest.spyOn(Math, 'random').mockRestore();
      });

      it('NÃO deve marcar desastre em dano crítico', () => {
        const result = rollDamageWithCritical(2, 8, 3, true);

        expect(result.isDisaster).toBe(false);
        expect(result.isDamageRoll).toBe(true);
        expect(result.isCritical).toBe(true);
      });
    });
  });
});
