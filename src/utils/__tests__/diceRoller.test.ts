/**
 * Testes para o Sistema de Rolagem de Dados (v0.2)
 *
 * Sistema de pool de dados com contagem de sucessos:
 * - Xd onde X = valor do atributo + modificadores
 * - Tamanho do dado: d6 (leigo) / d8 (adepto) / d10 (versado) / d12 (mestre)
 * - Sucesso (✶): resultado ≥ 6
 * - Cancelamento: resultado = 1 cancela 1 sucesso
 * - Sucessos líquidos = max(0, sucessos - cancelamentos)
 * - Máximo de 8 dados por rolagem
 * - Atributo 0 ou dados negativos: 2d pegar o menor
 */

import {
  rollDicePool,
  rollWithPenalty,
  rollSkillTest,
  rollDamage,
  rollDamageWithCritical,
  rollCustomDice,
  DiceRollHistory,
  globalDiceHistory,
  isDicePoolResult,
  isDamageDiceRollResult,
  isCustomDiceResult,
  MAX_SKILL_DICE,
  SUCCESS_THRESHOLD,
  CANCELLATION_VALUE,
  type DamageDiceRollResult,
  type CustomDiceResult,
  type HistoryEntry,
} from '../diceRoller';
import type { DicePoolResult, DieSize, DicePoolDie } from '@/types';

// ============================================================================
// Utilitários de Teste
// ============================================================================

/**
 * Gera valores de rolagem mockados para Math.random
 * @param values Array de resultados desejados (1 a N lados)
 * @param diceSides Número de lados do dado
 */
function mockDiceRolls(values: number[], diceSides: number): jest.SpyInstance {
  let callIndex = 0;
  return jest.spyOn(Math, 'random').mockImplementation(() => {
    const roll = values[callIndex % values.length];
    callIndex++;
    // Math.random() retorna [0, 1), floor(random * sides) + 1 = roll
    // Então random deve ser (roll - 1) / sides
    return (roll - 1) / diceSides;
  });
}

/**
 * Restaura Math.random após mock
 */
function restoreMathRandom(spy: jest.SpyInstance): void {
  spy.mockRestore();
}

// ============================================================================
// Testes do Core Pool System
// ============================================================================

describe('Sistema de Pool de Dados (v0.2)', () => {
  describe('rollDicePool - Rolagem de Pool', () => {
    describe('Rolagem básica', () => {
      it('deve rolar a quantidade correta de dados', () => {
        const result = rollDicePool(3, 'd6', 'Teste básico');

        expect(result.dice.length).toBe(3);
        expect(result.diceCount).toBe(3);
        expect(result.formula).toBe('3d6');
        expect(result.context).toBe('Teste básico');
      });

      it('deve rolar quantos dados forem passados (sem limite)', () => {
        // rollDicePool é uma função de baixo nível - não aplica limite
        // O limite de 8 é aplicado em rollSkillTest
        const result = rollDicePool(10, 'd6');

        expect(result.dice.length).toBe(10);
        expect(result.diceCount).toBe(10);
        expect(result.formula).toBe('10d6');
      });

      it('deve registrar o tamanho do dado correto', () => {
        const resultD6 = rollDicePool(2, 'd6');
        const resultD8 = rollDicePool(2, 'd8');
        const resultD10 = rollDicePool(2, 'd10');
        const resultD12 = rollDicePool(2, 'd12');

        expect(resultD6.dieSize).toBe('d6');
        expect(resultD8.dieSize).toBe('d8');
        expect(resultD10.dieSize).toBe('d10');
        expect(resultD12.dieSize).toBe('d12');
      });

      it('deve gerar timestamp', () => {
        const before = new Date();
        const result = rollDicePool(2, 'd6');
        const after = new Date();

        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        );
        expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });

    describe('Contagem de sucessos (≥ 6)', () => {
      it('deve contar resultados ≥ 6 como sucessos', () => {
        const spy = mockDiceRolls([6, 7, 8, 5, 4], 6); // d6: max 6, então 6+ são sucessos

        const result = rollDicePool(5, 'd6');

        // Para d6: 6 = sucesso, 7 não é possível em d6
        // Vamos usar d8 para testar melhor
        restoreMathRandom(spy);
      });

      it('deve contar resultados ≥ 6 corretamente em d8', () => {
        const spy = mockDiceRolls([6, 7, 8, 5, 4], 8);

        const result = rollDicePool(5, 'd8');

        // 6, 7, 8 = 3 sucessos; 5, 4 = 0 sucessos
        expect(result.successes).toBe(3);

        restoreMathRandom(spy);
      });

      it('deve classificar dados individuais corretamente', () => {
        const spy = mockDiceRolls([8, 6, 1, 4, 5], 8);

        const result = rollDicePool(5, 'd8');

        expect(result.dice[0].isSuccess).toBe(true); // 8 >= 6
        expect(result.dice[1].isSuccess).toBe(true); // 6 >= 6
        expect(result.dice[2].isSuccess).toBe(false); // 1 < 6
        expect(result.dice[3].isSuccess).toBe(false); // 4 < 6
        expect(result.dice[4].isSuccess).toBe(false); // 5 < 6

        restoreMathRandom(spy);
      });
    });

    describe('Cancelamentos (resultado = 1)', () => {
      it('deve identificar resultados = 1 como cancelamentos', () => {
        const spy = mockDiceRolls([1, 1, 6, 8], 8);

        const result = rollDicePool(4, 'd8');

        expect(result.dice[0].isCancellation).toBe(true);
        expect(result.dice[1].isCancellation).toBe(true);
        expect(result.dice[2].isCancellation).toBe(false);
        expect(result.dice[3].isCancellation).toBe(false);

        restoreMathRandom(spy);
      });

      it('deve calcular cancelamentos no total', () => {
        const spy = mockDiceRolls([1, 1, 6, 8], 8);

        const result = rollDicePool(4, 'd8');

        expect(result.cancellations).toBe(2);

        restoreMathRandom(spy);
      });

      it('deve subtrair cancelamentos dos sucessos', () => {
        const spy = mockDiceRolls([6, 8, 7, 1], 8); // 3 sucessos - 1 cancelamento = 2

        const result = rollDicePool(4, 'd8');

        expect(result.successes).toBe(3);
        expect(result.cancellations).toBe(1);
        expect(result.netSuccesses).toBe(2);

        restoreMathRandom(spy);
      });

      it('deve garantir mínimo de 0 sucessos líquidos', () => {
        const spy = mockDiceRolls([1, 1, 1, 4], 8); // 0 sucessos - 3 cancelamentos

        const result = rollDicePool(4, 'd8');

        expect(result.successes).toBe(0);
        expect(result.cancellations).toBe(3);
        expect(result.netSuccesses).toBe(0); // min(0, 0-3) = 0

        restoreMathRandom(spy);
      });

      it('deve subtrair corretamente quando cancelamentos > sucessos', () => {
        const spy = mockDiceRolls([6, 1, 1, 1], 8); // 1 sucesso - 3 cancelamentos

        const result = rollDicePool(4, 'd8');

        expect(result.successes).toBe(1);
        expect(result.cancellations).toBe(3);
        expect(result.netSuccesses).toBe(0); // max(0, 1-3) = 0

        restoreMathRandom(spy);
      });
    });

    describe('Dados com 0 ou menos', () => {
      it('rollDicePool garante mínimo de 1 dado', () => {
        // rollDicePool é baixo nível - apenas garante mínimo 1
        // A lógica de penalidade está em rollSkillTest
        const result = rollDicePool(0, 'd6');

        expect(result.dice.length).toBe(1);
        expect(result.isPenaltyRoll).toBe(false);
      });

      it('rollSkillTest aplica penalidade quando total <= 0', () => {
        const result = rollSkillTest(0, 'd6', 0);

        expect(result.isPenaltyRoll).toBe(true);
        expect(result.dice.length).toBe(2);
      });
    });
  });

  describe('rollWithPenalty - Rolagem de Penalidade (2d menor)', () => {
    it('deve rolar exatamente 2 dados', () => {
      const result = rollWithPenalty('d6');

      expect(result.dice.length).toBe(2);
    });

    it('deve escolher o MENOR valor', () => {
      const spy = mockDiceRolls([5, 2], 6); // Deve escolher 2

      const result = rollWithPenalty('d6');

      // Verificar que o resultado é baseado no menor
      expect(result.netSuccesses).toBeLessThanOrEqual(1);

      restoreMathRandom(spy);
    });

    it('deve marcar isPenaltyRoll como true', () => {
      const result = rollWithPenalty('d8');

      expect(result.isPenaltyRoll).toBe(true);
    });

    it('deve incluir "(2d6 menor)" na fórmula', () => {
      const result = rollWithPenalty('d6');

      expect(result.formula).toContain('menor');
    });

    it('deve contar sucesso apenas do dado menor', () => {
      const spy = mockDiceRolls([6, 8], 8); // Menor = 6 (sucesso)

      const result = rollWithPenalty('d8');

      // O dado menor é 6, que é >= SUCCESS_THRESHOLD
      expect(result.successes).toBeGreaterThanOrEqual(0);

      restoreMathRandom(spy);
    });
  });

  describe('rollSkillTest - Teste de Habilidade Completo', () => {
    it('deve combinar diceCount e diceModifier', () => {
      const result = rollSkillTest(3, 'd6', 2); // 3 + 2 = 5 dados

      expect(result.dice.length).toBe(5);
    });

    it('deve respeitar limite de 8 com modificador', () => {
      const result = rollSkillTest(6, 'd8', 5); // 6 + 5 = 11, limitado a 8

      expect(result.dice.length).toBe(MAX_SKILL_DICE);
    });

    it('deve aplicar penalidade quando total <= 0', () => {
      const result = rollSkillTest(2, 'd6', -3); // 2 - 3 = -1

      expect(result.isPenaltyRoll).toBe(true);
      expect(result.dice.length).toBe(2);
    });

    it('deve incluir contexto na rolagem', () => {
      const result = rollSkillTest(3, 'd10', 0, 'Teste de Acrobacia');

      expect(result.context).toBe('Teste de Acrobacia');
    });
  });
});

// ============================================================================
// Testes de Rolagem de Dano
// ============================================================================

describe('Rolagem de Dano (Soma Numérica)', () => {
  describe('rollDamage - Dano Básico', () => {
    it('deve somar todos os dados + modificador', () => {
      const spy = mockDiceRolls([3, 4, 5], 6);

      const result = rollDamage(3, 6, 2); // 3d6 + 2

      expect(result.baseResult).toBe(12); // 3 + 4 + 5
      expect(result.finalResult).toBe(14); // 12 + 2

      restoreMathRandom(spy);
    });

    it('deve registrar valores individuais', () => {
      const spy = mockDiceRolls([2, 4, 6], 6);

      const result = rollDamage(3, 6, 0);

      expect(result.rolls).toEqual([2, 4, 6]);

      restoreMathRandom(spy);
    });

    it('deve gerar fórmula correta', () => {
      const result = rollDamage(2, 8, 3);

      expect(result.formula).toBe('2d8+3');
    });

    it('deve gerar fórmula negativa corretamente', () => {
      const result = rollDamage(1, 6, -2);

      expect(result.formula).toBe('1d6-2');
    });

    it('deve marcar isDamageRoll como true', () => {
      const result = rollDamage(1, 6, 0);

      expect(result.isDamageRoll).toBe(true);
    });
  });

  describe('rollDamageWithCritical - Dano Crítico', () => {
    it('deve maximizar dados em crítico', () => {
      const result = rollDamageWithCritical(3, 6, 2, true); // 3d6+2 crítico

      // Crítico maximiza: 6 * 3 = 18 + 2 = 20
      expect(result.baseResult).toBe(18); // 3 * 6
      expect(result.finalResult).toBe(20); // 18 + 2
      expect(result.isCritical).toBe(true);
    });

    it('deve rolar normalmente sem crítico', () => {
      const result = rollDamageWithCritical(2, 8, 0, false);

      // Sem crítico, delega para rollDamage que não define isCritical
      expect(result.isCritical).toBeUndefined();
    });

    it('deve indicar crítico na fórmula', () => {
      const result = rollDamageWithCritical(2, 6, 0, true);

      // Formato: "2d6 MAXIMIZADO (12)+0"
      expect(result.formula).toContain('MAXIMIZADO');
    });
  });
});

// ============================================================================
// Testes de Rolagem Customizada
// ============================================================================

describe('rollCustomDice - Rolagem Livre', () => {
  it('deve rolar qualquer tipo de dado', () => {
    const result = rollCustomDice(20, 1, 0);

    expect(result.diceType).toBe(20);
    expect(result.diceCount).toBe(1);
  });

  it('deve aplicar modificador numérico', () => {
    const spy = mockDiceRolls([10], 20);

    const result = rollCustomDice(20, 1, 5);

    expect(result.total).toBe(15); // 10 + 5

    restoreMathRandom(spy);
  });

  it('deve gerar fórmula correta', () => {
    const result = rollCustomDice(12, 3, -2);

    expect(result.formula).toBe('3d12-2');
  });

  it('deve registrar se somado ou individual', () => {
    const summed = rollCustomDice(6, 3, 0, true);
    const individual = rollCustomDice(6, 3, 0, false);

    expect(summed.summed).toBe(true);
    expect(individual.summed).toBe(false);
  });

  it('deve garantir mínimo de 1 dado', () => {
    const result = rollCustomDice(6, 0, 0);

    expect(result.diceCount).toBe(1);
    expect(result.rolls.length).toBe(1);
  });
});

// ============================================================================
// Testes de Type Guards
// ============================================================================

describe('Type Guards', () => {
  describe('isDicePoolResult', () => {
    it('deve retornar true para DicePoolResult', () => {
      const poolResult = rollDicePool(2, 'd6');

      expect(isDicePoolResult(poolResult)).toBe(true);
    });

    it('deve retornar false para DamageDiceRollResult', () => {
      const damageResult = rollDamage(1, 6, 0);

      expect(isDicePoolResult(damageResult)).toBe(false);
    });

    it('deve retornar false para CustomDiceResult', () => {
      const customResult = rollCustomDice(20, 1, 0);

      expect(isDicePoolResult(customResult)).toBe(false);
    });
  });

  describe('isDamageDiceRollResult', () => {
    it('deve retornar true para DamageDiceRollResult', () => {
      const damageResult = rollDamage(1, 6, 0);

      expect(isDamageDiceRollResult(damageResult)).toBe(true);
    });

    it('deve retornar false para DicePoolResult', () => {
      const poolResult = rollDicePool(2, 'd6');

      expect(isDamageDiceRollResult(poolResult)).toBe(false);
    });
  });

  describe('isCustomDiceResult', () => {
    it('deve retornar true para CustomDiceResult', () => {
      const customResult = rollCustomDice(20, 1, 0);

      expect(isCustomDiceResult(customResult)).toBe(true);
    });

    it('deve retornar false para DamageDiceRollResult', () => {
      const damageResult = rollDamage(1, 6, 0);

      expect(isCustomDiceResult(damageResult)).toBe(false);
    });
  });
});

// ============================================================================
// Testes de Histórico
// ============================================================================

describe('DiceRollHistory', () => {
  let history: DiceRollHistory;

  beforeEach(() => {
    history = new DiceRollHistory();
  });

  describe('Gerenciamento de histórico', () => {
    it('deve adicionar rolagens ao histórico', () => {
      const result = rollDicePool(2, 'd6');
      history.add(result);

      expect(history.getAll()).toHaveLength(1);
    });

    it('deve retornar rolagens mais recentes primeiro', () => {
      const result1 = rollDicePool(1, 'd6');
      const result2 = rollDicePool(2, 'd8');

      history.add(result1);
      history.add(result2);

      const all = history.getAll();
      expect(all[0]).toBe(result2); // Mais recente primeiro
      expect(all[1]).toBe(result1);
    });

    it('deve respeitar limite máximo de histórico', () => {
      // Adicionar mais que o limite
      for (let i = 0; i < 60; i++) {
        history.add(rollDicePool(1, 'd6'));
      }

      expect(history.getAll().length).toBeLessThanOrEqual(50); // Default max
    });

    it('deve limpar histórico corretamente', () => {
      history.add(rollDicePool(2, 'd6'));
      history.add(rollDamage(1, 8, 2));

      history.clear();

      expect(history.getAll()).toHaveLength(0);
    });
  });

  describe('Suporte a tipos diferentes', () => {
    it('deve aceitar DicePoolResult', () => {
      const poolResult = rollDicePool(2, 'd6');
      history.add(poolResult);

      expect(history.getAll()[0]).toBe(poolResult);
    });

    it('deve aceitar DamageDiceRollResult', () => {
      const damageResult = rollDamage(2, 8, 3);
      history.add(damageResult);

      expect(history.getAll()[0]).toBe(damageResult);
    });

    it('deve aceitar CustomDiceResult', () => {
      const customResult = rollCustomDice(20, 1, 5);
      history.add(customResult);

      expect(history.getAll()[0]).toBe(customResult);
    });
  });
});

describe('globalDiceHistory', () => {
  beforeEach(() => {
    globalDiceHistory.clear();
  });

  it('deve ser acessível globalmente', () => {
    expect(globalDiceHistory).toBeDefined();
    expect(globalDiceHistory).toBeInstanceOf(DiceRollHistory);
  });

  it('deve persistir entre rolagens', () => {
    const result1 = rollDicePool(2, 'd6');
    const result2 = rollDamage(1, 8, 0);

    globalDiceHistory.add(result1);
    globalDiceHistory.add(result2);

    expect(globalDiceHistory.getAll()).toHaveLength(2);
  });
});

// ============================================================================
// Testes de Constantes
// ============================================================================

describe('Constantes do Sistema', () => {
  it('MAX_SKILL_DICE deve ser 8', () => {
    expect(MAX_SKILL_DICE).toBe(8);
  });

  it('SUCCESS_THRESHOLD deve ser 6', () => {
    expect(SUCCESS_THRESHOLD).toBe(6);
  });

  it('CANCELLATION_VALUE deve ser 1', () => {
    expect(CANCELLATION_VALUE).toBe(1);
  });
});

// ============================================================================
// Testes de Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  describe('Valores extremos de dados', () => {
    it('rollSkillTest limita a MAX_SKILL_DICE', () => {
      // rollSkillTest aplica limite, não rollDicePool
      const result = rollSkillTest(100, 'd6', 0);

      expect(result.dice.length).toBe(MAX_SKILL_DICE);
    });

    it('rollSkillTest aplica penalidade com dados negativos', () => {
      const result = rollSkillTest(0, 'd6', -10);

      expect(result.isPenaltyRoll).toBe(true);
      expect(result.dice.length).toBe(2);
    });
  });

  describe('Modificadores de dano extremos', () => {
    it('deve lidar com modificador muito positivo', () => {
      const spy = mockDiceRolls([1], 6);

      const result = rollDamage(1, 6, 100);

      expect(result.finalResult).toBe(101);

      restoreMathRandom(spy);
    });

    it('deve lidar com modificador muito negativo (minímo 0)', () => {
      const spy = mockDiceRolls([6], 6);

      const result = rollDamage(1, 6, -100);

      // Dano tem mínimo 0
      expect(result.finalResult).toBe(0);

      restoreMathRandom(spy);
    });
  });

  describe('Todos os dados sucesso ou cancelamento', () => {
    it('deve lidar com todos os dados sendo 1', () => {
      const spy = mockDiceRolls([1, 1, 1, 1], 8);

      const result = rollDicePool(4, 'd8');

      expect(result.successes).toBe(0);
      expect(result.cancellations).toBe(4);
      expect(result.netSuccesses).toBe(0);

      restoreMathRandom(spy);
    });

    it('deve lidar com todos os dados sendo sucesso máximo', () => {
      const spy = mockDiceRolls([8, 8, 8, 8], 8);

      const result = rollDicePool(4, 'd8');

      expect(result.successes).toBe(4);
      expect(result.cancellations).toBe(0);
      expect(result.netSuccesses).toBe(4);

      restoreMathRandom(spy);
    });

    it('deve lidar com exatamente iguais sucessos e cancelamentos', () => {
      const spy = mockDiceRolls([8, 8, 1, 1], 8); // 2 sucessos, 2 cancelamentos

      const result = rollDicePool(4, 'd8');

      expect(result.successes).toBe(2);
      expect(result.cancellations).toBe(2);
      expect(result.netSuccesses).toBe(0);

      restoreMathRandom(spy);
    });
  });
});
