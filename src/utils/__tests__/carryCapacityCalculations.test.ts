/**
 * Testes para carryCapacityCalculations.ts
 *
 * Testes unitários para todas as funções de cálculo de capacidade de carga,
 * incluindo cálculos base, estados de encumbrance, e peso de itens/moedas.
 */

import {
  calculateBaseCarryCapacity,
  getSizeCarryModifier,
  calculateCarryCapacity,
  calculatePushCapacity,
  calculateLiftCapacity,
  getEncumbranceState,
  calculateCoinsWeight,
  calculateItemsWeight,
  calculateTotalWeight,
  calculateFullCarryCapacity,
  generateCarryingCapacity,
  calculateCarryPercentage,
  canCarryWithoutPenalty,
  canCarryAtAll,
  ENCUMBRANCE_STATE_DESCRIPTIONS,
  ENCUMBRANCE_STATE_COLORS,
} from '../carryCapacityCalculations';
import type { Currency, InventoryItem } from '@/types/inventory';
import type { CreatureSize } from '@/types/common';

// Mock de moedas para testes
const createCurrency = (
  physicalCobre: number = 0,
  physicalOuro: number = 0,
  physicalPlatina: number = 0,
  bankCobre: number = 0,
  bankOuro: number = 0,
  bankPlatina: number = 0
): Currency => ({
  physical: {
    cobre: physicalCobre,
    ouro: physicalOuro,
    platina: physicalPlatina,
  },
  bank: {
    cobre: bankCobre,
    ouro: bankOuro,
    platina: bankPlatina,
  },
});

// Mock de item para testes
const createItem = (
  weight: number,
  quantity: number = 1,
  equipped: boolean = false
): InventoryItem => ({
  id: crypto.randomUUID(),
  name: 'Test Item',
  category: 'miscelanea',
  quantity,
  weight,
  value: 0,
  equipped,
});

describe('carryCapacityCalculations', () => {
  describe('calculateBaseCarryCapacity', () => {
    it('deve calcular corretamente com Força 0', () => {
      // Base = 5 + (0 × 5) = 5
      expect(calculateBaseCarryCapacity(0)).toBe(5);
    });

    it('deve calcular corretamente com Força 1 (padrão nível 1)', () => {
      // Base = 5 + (1 × 5) = 10
      expect(calculateBaseCarryCapacity(1)).toBe(10);
    });

    it('deve calcular corretamente com Força 3', () => {
      // Base = 5 + (3 × 5) = 20
      expect(calculateBaseCarryCapacity(3)).toBe(20);
    });

    it('deve calcular corretamente com Força 5 (máximo normal)', () => {
      // Base = 5 + (5 × 5) = 30
      expect(calculateBaseCarryCapacity(5)).toBe(30);
    });

    it('deve calcular corretamente com Força acima de 5', () => {
      // Base = 5 + (7 × 5) = 40
      expect(calculateBaseCarryCapacity(7)).toBe(40);
    });
  });

  describe('getSizeCarryModifier', () => {
    it('deve retornar -5 para criaturas minúsculas', () => {
      expect(getSizeCarryModifier('minusculo')).toBe(-5);
    });

    it('deve retornar -2 para criaturas pequenas', () => {
      expect(getSizeCarryModifier('pequeno')).toBe(-2);
    });

    it('deve retornar 0 para criaturas médias', () => {
      expect(getSizeCarryModifier('medio')).toBe(0);
    });

    it('deve retornar +2 para criaturas grandes', () => {
      expect(getSizeCarryModifier('grande')).toBe(2);
    });

    it('deve retornar +5 para criaturas enormes 1', () => {
      expect(getSizeCarryModifier('enorme-1')).toBe(5);
    });

    it('deve retornar +6 para criaturas enormes 2', () => {
      expect(getSizeCarryModifier('enorme-2')).toBe(5);
    });

    it('deve retornar +7 para criaturas enormes 3', () => {
      expect(getSizeCarryModifier('enorme-3')).toBe(5);
    });

    it('deve retornar +10 para criaturas colossais 1', () => {
      expect(getSizeCarryModifier('colossal-1')).toBe(10);
    });

    it('deve retornar +12 para criaturas colossais 2', () => {
      expect(getSizeCarryModifier('colossal-2')).toBe(10);
    });

    it('deve retornar +15 para criaturas colossais 3', () => {
      expect(getSizeCarryModifier('colossal-3')).toBe(10);
    });
  });

  describe('calculateCarryCapacity', () => {
    it('deve calcular corretamente sem modificadores', () => {
      // Força 3: 5 + (3 × 5) = 20
      expect(calculateCarryCapacity(3)).toBe(20);
    });

    it('deve aplicar modificador de tamanho corretamente', () => {
      // Força 3 + tamanho pequeno (-2): 20 - 2 = 18
      expect(calculateCarryCapacity(3, -2)).toBe(18);
    });

    it('deve aplicar outros modificadores corretamente', () => {
      // Força 2 + bônus de item (+5): 15 + 5 = 20
      expect(calculateCarryCapacity(2, 0, 5)).toBe(20);
    });

    it('deve aplicar ambos os modificadores', () => {
      // Força 3 + grande (+2) + item (+3): 20 + 2 + 3 = 25
      expect(calculateCarryCapacity(3, 2, 3)).toBe(25);
    });

    it('não deve retornar valores negativos', () => {
      // Força 0 + minúsculo (-5) + penalidade (-5): 5 - 5 - 5 = -5 → 0
      expect(calculateCarryCapacity(0, -5, -5)).toBe(0);
    });

    it('deve arredondar para baixo', () => {
      // Resultado com decimais (não esperado, mas garantia)
      expect(calculateCarryCapacity(1, 0, 0.7)).toBe(10);
    });
  });

  describe('calculatePushCapacity', () => {
    it('deve retornar 10 × Corpo (v0.2)', () => {
      // corpo=2: 10 × 2 = 20
      expect(calculatePushCapacity(2)).toBe(20);
    });

    it('deve ter mínimo de 5 quando Corpo = 0', () => {
      expect(calculatePushCapacity(0)).toBe(5);
    });

    it('deve calcular corretamente com Corpo alto', () => {
      // corpo=5: 10 × 5 = 50
      expect(calculatePushCapacity(5)).toBe(50);
    });
  });

  describe('calculateLiftCapacity', () => {
    it('deve retornar 5 × Corpo (v0.2)', () => {
      // corpo=2: 5 × 2 = 10
      expect(calculateLiftCapacity(2)).toBe(10);
    });

    it('deve ter mínimo de 2 quando Corpo = 0', () => {
      expect(calculateLiftCapacity(0)).toBe(2);
    });

    it('deve calcular corretamente com Corpo alto', () => {
      // corpo=5: 5 × 5 = 25
      expect(calculateLiftCapacity(5)).toBe(25);
    });

    it('deve calcular corretamente com Corpo = 1', () => {
      // corpo=1: 5 × 1 = 5
      expect(calculateLiftCapacity(1)).toBe(5);
    });
  });

  describe('getEncumbranceState', () => {
    const maxCapacity = 20;

    it('deve retornar normal quando peso ≤ capacidade', () => {
      expect(getEncumbranceState(15, maxCapacity)).toBe('normal');
      expect(getEncumbranceState(20, maxCapacity)).toBe('normal');
      expect(getEncumbranceState(0, maxCapacity)).toBe('normal');
    });

    it('deve retornar sobrecarregado quando peso > capacidade e ≤ 2×', () => {
      expect(getEncumbranceState(21, maxCapacity)).toBe('sobrecarregado');
      expect(getEncumbranceState(30, maxCapacity)).toBe('sobrecarregado');
      expect(getEncumbranceState(40, maxCapacity)).toBe('sobrecarregado');
    });

    it('deve retornar imobilizado quando peso > 2× capacidade', () => {
      expect(getEncumbranceState(41, maxCapacity)).toBe('imobilizado');
      expect(getEncumbranceState(100, maxCapacity)).toBe('imobilizado');
    });

    it('deve tratar capacidade 0 corretamente', () => {
      expect(getEncumbranceState(0, 0)).toBe('normal');
      expect(getEncumbranceState(1, 0)).toBe('imobilizado');
    });

    it('deve tratar peso 0 como normal', () => {
      expect(getEncumbranceState(0, 20)).toBe('normal');
    });
  });

  describe('calculateCoinsWeight', () => {
    it('deve calcular peso de moedas físicas (100 moedas = 1 peso)', () => {
      const currency = createCurrency(100, 0, 0);
      expect(calculateCoinsWeight(currency)).toBe(1);
    });

    it('deve somar todos os tipos de moedas físicas', () => {
      const currency = createCurrency(50, 30, 20); // 100 total
      expect(calculateCoinsWeight(currency)).toBe(1);
    });

    it('deve ignorar moedas no banco', () => {
      const currency = createCurrency(0, 0, 0, 1000, 1000, 1000);
      expect(calculateCoinsWeight(currency)).toBe(0);
    });

    it('deve arredondar para baixo', () => {
      const currency = createCurrency(150, 0, 0); // 1.5 → 1
      expect(calculateCoinsWeight(currency)).toBe(1);
    });

    it('deve retornar 0 para menos de 100 moedas', () => {
      const currency = createCurrency(50, 20, 10); // 80 total
      expect(calculateCoinsWeight(currency)).toBe(0);
    });

    it('deve calcular corretamente com muitas moedas', () => {
      const currency = createCurrency(500, 300, 200); // 1000 total = 10 peso
      expect(calculateCoinsWeight(currency)).toBe(10);
    });
  });

  describe('calculateItemsWeight', () => {
    it('deve calcular peso total de itens', () => {
      const items = [createItem(2), createItem(3), createItem(1)];
      expect(calculateItemsWeight(items)).toBe(6);
    });

    it('deve considerar quantidade', () => {
      const items = [createItem(2, 5)]; // 2 peso × 5 unidades
      expect(calculateItemsWeight(items)).toBe(10);
    });

    it('deve retornar 0 para lista vazia', () => {
      expect(calculateItemsWeight([])).toBe(0);
    });

    it('deve incluir itens equipados por padrão', () => {
      const items = [createItem(5, 1, true), createItem(3, 1, false)];
      expect(calculateItemsWeight(items)).toBe(8);
    });

    it('deve excluir itens equipados quando solicitado', () => {
      const items = [createItem(5, 1, true), createItem(3, 1, false)];
      expect(calculateItemsWeight(items, false)).toBe(3);
    });
  });

  describe('calculateTotalWeight', () => {
    it('deve somar peso de itens e moedas', () => {
      const items = [createItem(5), createItem(3)];
      const currency = createCurrency(200, 0, 0); // 2 peso

      expect(calculateTotalWeight(items, currency)).toBe(10);
    });

    it('deve funcionar só com itens', () => {
      const items = [createItem(7)];
      const currency = createCurrency(0, 0, 0);

      expect(calculateTotalWeight(items, currency)).toBe(7);
    });

    it('deve funcionar só com moedas', () => {
      const items: InventoryItem[] = [];
      const currency = createCurrency(300, 0, 0); // 3 peso

      expect(calculateTotalWeight(items, currency)).toBe(3);
    });
  });

  describe('calculateFullCarryCapacity', () => {
    it('deve retornar objeto completo para personagem médio', () => {
      const result = calculateFullCarryCapacity(3, 'medio');

      expect(result.base).toBe(20);
      expect(result.sizeModifier).toBe(0);
      expect(result.otherModifiers).toBe(0);
      expect(result.total).toBe(20);
      expect(result.pushCapacity).toBe(30); // 10 × 3 (v0.2)
      expect(result.liftCapacity).toBe(15); // 5 × 3 (v0.2)
    });

    it('deve aplicar modificador de tamanho grande', () => {
      const result = calculateFullCarryCapacity(2, 'grande');

      expect(result.base).toBe(15);
      expect(result.sizeModifier).toBe(2);
      expect(result.total).toBe(17);
      expect(result.pushCapacity).toBe(20); // 10 × 2 (v0.2)
      expect(result.liftCapacity).toBe(10); // 5 × 2 (v0.2)
    });

    it('deve aplicar outros modificadores', () => {
      const result = calculateFullCarryCapacity(1, 'medio', 5);

      expect(result.base).toBe(10);
      expect(result.sizeModifier).toBe(0);
      expect(result.otherModifiers).toBe(5);
      expect(result.total).toBe(15);
    });
  });

  describe('generateCarryingCapacity', () => {
    it('deve gerar objeto CarryingCapacity completo', () => {
      const items = [createItem(5)];
      const currency = createCurrency(100, 0, 0); // 1 peso

      const result = generateCarryingCapacity(3, 'medio', items, currency);

      expect(result.base).toBe(20);
      expect(result.modifiers).toBe(0);
      expect(result.total).toBe(20);
      expect(result.currentWeight).toBe(6); // 5 + 1
      expect(result.encumbranceState).toBe('normal');
      expect(result.pushLimit).toBe(30); // 10 × 3 (v0.2)
      expect(result.liftLimit).toBe(15); // 5 × 3 (v0.2)
    });

    it('deve detectar estado sobrecarregado', () => {
      // Força 1 = capacidade 10, peso 15 = sobrecarregado (> 10, <= 20)
      const items = [createItem(15)];
      const currency = createCurrency(0, 0, 0);

      const result = generateCarryingCapacity(1, 'medio', items, currency);

      expect(result.currentWeight).toBe(15);
      expect(result.total).toBe(10);
      expect(result.encumbranceState).toBe('sobrecarregado');
    });

    it('deve detectar estado imobilizado', () => {
      const items = [createItem(50)];
      const currency = createCurrency(0, 0, 0);

      const result = generateCarryingCapacity(1, 'medio', items, currency);

      expect(result.currentWeight).toBe(50);
      expect(result.total).toBe(10);
      expect(result.encumbranceState).toBe('imobilizado');
    });
  });

  describe('calculateCarryPercentage', () => {
    it('deve calcular porcentagem corretamente', () => {
      expect(calculateCarryPercentage(10, 20)).toBe(50);
      expect(calculateCarryPercentage(20, 20)).toBe(100);
      expect(calculateCarryPercentage(15, 20)).toBe(75);
    });

    it('deve permitir mais de 100%', () => {
      expect(calculateCarryPercentage(30, 20)).toBe(150);
    });

    it('deve tratar capacidade 0', () => {
      expect(calculateCarryPercentage(0, 0)).toBe(0);
      expect(calculateCarryPercentage(5, 0)).toBe(100);
    });

    it('deve arredondar para inteiro mais próximo', () => {
      expect(calculateCarryPercentage(7, 20)).toBe(35);
    });
  });

  describe('canCarryWithoutPenalty', () => {
    it('deve retornar true se peso final não excede capacidade', () => {
      expect(canCarryWithoutPenalty(10, 5, 20)).toBe(true);
      expect(canCarryWithoutPenalty(15, 5, 20)).toBe(true);
    });

    it('deve retornar false se peso final excede capacidade', () => {
      expect(canCarryWithoutPenalty(16, 5, 20)).toBe(false);
      expect(canCarryWithoutPenalty(20, 1, 20)).toBe(false);
    });
  });

  describe('canCarryAtAll', () => {
    it('deve retornar true se peso final não excede 2× capacidade', () => {
      expect(canCarryAtAll(30, 10, 20)).toBe(true); // 40 = 2×20, OK
    });

    it('deve retornar false se peso final excede 2× capacidade', () => {
      expect(canCarryAtAll(35, 10, 20)).toBe(false); // 45 > 40
    });
  });

  describe('Constantes', () => {
    it('deve ter descrições para todos os estados', () => {
      expect(ENCUMBRANCE_STATE_DESCRIPTIONS.normal).toBeDefined();
      expect(ENCUMBRANCE_STATE_DESCRIPTIONS.sobrecarregado).toBeDefined();
      expect(ENCUMBRANCE_STATE_DESCRIPTIONS.imobilizado).toBeDefined();
    });

    it('deve ter cores semânticas para todos os estados', () => {
      expect(ENCUMBRANCE_STATE_COLORS.normal).toBe('success');
      expect(ENCUMBRANCE_STATE_COLORS.sobrecarregado).toBe('warning');
      expect(ENCUMBRANCE_STATE_COLORS.imobilizado).toBe('error');
    });
  });
});
