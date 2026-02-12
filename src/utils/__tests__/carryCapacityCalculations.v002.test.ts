/**
 * Testes para carryCapacityCalculations.ts — validação v0.2
 *
 * Verifica as mudanças de fórmula introduzidas na v0.2:
 * - Empurrar: 10 × Corpo (mínimo 5) — baseado em Corpo diretamente
 * - Levantar: 5 × Corpo (mínimo 2) — baseado em Corpo diretamente
 * - Terminologia: "Espaço" em vez de "Peso"
 */

import {
  calculatePushCapacity,
  calculateLiftCapacity,
  calculateFullCarryCapacity,
  generateCarryingCapacity,
  ENCUMBRANCE_STATE_DESCRIPTIONS,
} from '../carryCapacityCalculations';
import type { Currency, InventoryItem } from '@/types/inventory';

// ============================================================================
// Helpers
// ============================================================================

const createItem = (weight: number, quantity = 1): InventoryItem => ({
  id: 'test-' + Math.random().toString(36).slice(2),
  name: 'Test Item',
  category: 'miscelanea',
  quantity,
  weight,
  value: 0,
  equipped: false,
});

const emptyCurrency: Currency = {
  physical: { cobre: 0, ouro: 0, platina: 0 },
  bank: { cobre: 0, ouro: 0, platina: 0 },
};

// ============================================================================
// calculatePushCapacity (v0.2)
// ============================================================================

describe('calculatePushCapacity (v0.2)', () => {
  it('should return minimum 5 when corpo = 0', () => {
    expect(calculatePushCapacity(0)).toBe(5);
  });

  it('should return 10 when corpo = 1', () => {
    expect(calculatePushCapacity(1)).toBe(10);
  });

  it('should return 30 when corpo = 3', () => {
    expect(calculatePushCapacity(3)).toBe(30);
  });

  it('should return 50 when corpo = 5', () => {
    expect(calculatePushCapacity(5)).toBe(50);
  });

  it('should use formula: Math.max(5, 10 * corpo)', () => {
    for (let corpo = 0; corpo <= 6; corpo++) {
      expect(calculatePushCapacity(corpo)).toBe(Math.max(5, 10 * corpo));
    }
  });

  it('should handle corpo = 2', () => {
    expect(calculatePushCapacity(2)).toBe(20);
  });

  it('should handle corpo = 4', () => {
    expect(calculatePushCapacity(4)).toBe(40);
  });

  it('should handle corpo beyond normal max (6)', () => {
    expect(calculatePushCapacity(6)).toBe(60);
  });
});

// ============================================================================
// calculateLiftCapacity (v0.2)
// ============================================================================

describe('calculateLiftCapacity (v0.2)', () => {
  it('should return minimum 2 when corpo = 0', () => {
    expect(calculateLiftCapacity(0)).toBe(2);
  });

  it('should return 5 when corpo = 1', () => {
    expect(calculateLiftCapacity(1)).toBe(5);
  });

  it('should return 15 when corpo = 3', () => {
    expect(calculateLiftCapacity(3)).toBe(15);
  });

  it('should return 25 when corpo = 5', () => {
    expect(calculateLiftCapacity(5)).toBe(25);
  });

  it('should use formula: Math.max(2, 5 * corpo)', () => {
    for (let corpo = 0; corpo <= 6; corpo++) {
      expect(calculateLiftCapacity(corpo)).toBe(Math.max(2, 5 * corpo));
    }
  });

  it('should handle corpo = 2', () => {
    expect(calculateLiftCapacity(2)).toBe(10);
  });

  it('should handle corpo = 4', () => {
    expect(calculateLiftCapacity(4)).toBe(20);
  });

  it('should handle corpo beyond normal max (6)', () => {
    expect(calculateLiftCapacity(6)).toBe(30);
  });
});

// ============================================================================
// calculateFullCarryCapacity (v0.2 push/lift)
// ============================================================================

describe('calculateFullCarryCapacity (v0.2 push/lift)', () => {
  it('should use new push formula (10 × Corpo, min 5)', () => {
    const result = calculateFullCarryCapacity(3, 'medio');
    expect(result.pushCapacity).toBe(30); // 10 × 3
  });

  it('should use new lift formula (5 × Corpo, min 2)', () => {
    const result = calculateFullCarryCapacity(3, 'medio');
    expect(result.liftCapacity).toBe(15); // 5 × 3
  });

  it('should apply push minimum of 5 when corpo = 0', () => {
    const result = calculateFullCarryCapacity(0, 'medio');
    expect(result.pushCapacity).toBe(5);
  });

  it('should apply lift minimum of 2 when corpo = 0', () => {
    const result = calculateFullCarryCapacity(0, 'medio');
    expect(result.liftCapacity).toBe(2);
  });

  it('should calculate correct values for corpo = 5', () => {
    const result = calculateFullCarryCapacity(5, 'medio');
    expect(result.pushCapacity).toBe(50); // 10 × 5
    expect(result.liftCapacity).toBe(25); // 5 × 5
  });

  it('should calculate correct values for corpo = 1', () => {
    const result = calculateFullCarryCapacity(1, 'medio');
    expect(result.pushCapacity).toBe(10); // 10 × 1
    expect(result.liftCapacity).toBe(5); // 5 × 1
  });

  it('should still calculate base and total correctly', () => {
    const result = calculateFullCarryCapacity(3, 'medio');
    // Base: 5 + (3 × 5) = 20
    expect(result.base).toBe(20);
    expect(result.total).toBeGreaterThanOrEqual(result.base);
  });
});

// ============================================================================
// generateCarryingCapacity (v0.2 push/lift)
// ============================================================================

describe('generateCarryingCapacity (v0.2 push/lift)', () => {
  it('should use new push formula for pushLimit', () => {
    const result = generateCarryingCapacity(3, 'medio', [], emptyCurrency);
    expect(result.pushLimit).toBe(30); // 10 × 3
  });

  it('should use new lift formula for liftLimit', () => {
    const result = generateCarryingCapacity(3, 'medio', [], emptyCurrency);
    expect(result.liftLimit).toBe(15); // 5 × 3
  });

  it('should apply push minimum of 5 when corpo = 0', () => {
    const result = generateCarryingCapacity(0, 'medio', [], emptyCurrency);
    expect(result.pushLimit).toBe(5);
  });

  it('should apply lift minimum of 2 when corpo = 0', () => {
    const result = generateCarryingCapacity(0, 'medio', [], emptyCurrency);
    expect(result.liftLimit).toBe(2);
  });

  it('should calculate correct values for corpo = 5', () => {
    const result = generateCarryingCapacity(5, 'medio', [], emptyCurrency);
    expect(result.pushLimit).toBe(50);
    expect(result.liftLimit).toBe(25);
  });

  it('should calculate correct values for corpo = 1', () => {
    const result = generateCarryingCapacity(1, 'medio', [], emptyCurrency);
    expect(result.pushLimit).toBe(10);
    expect(result.liftLimit).toBe(5);
  });

  it('should still calculate currentWeight correctly with items', () => {
    const items = [createItem(3, 2), createItem(5, 1)];
    const result = generateCarryingCapacity(3, 'medio', items, emptyCurrency);
    // Items: 3×2 + 5×1 = 11
    expect(result.currentWeight).toBe(11);
    // Push and lift still based on corpo
    expect(result.pushLimit).toBe(30);
    expect(result.liftLimit).toBe(15);
  });

  it('should still calculate encumbrance state correctly', () => {
    const result = generateCarryingCapacity(3, 'medio', [], emptyCurrency);
    expect(result.encumbranceState).toBe('normal');
  });

  it('should return correct structure with all fields', () => {
    const result = generateCarryingCapacity(2, 'medio', [], emptyCurrency);
    expect(result).toHaveProperty('base');
    expect(result).toHaveProperty('sizeModifier');
    expect(result).toHaveProperty('otherModifiers');
    expect(result).toHaveProperty('modifiers');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('currentWeight');
    expect(result).toHaveProperty('encumbranceState');
    expect(result).toHaveProperty('pushLimit');
    expect(result).toHaveProperty('liftLimit');
  });
});

// ============================================================================
// ENCUMBRANCE_STATE_DESCRIPTIONS (v0.2 terminology)
// ============================================================================

describe('ENCUMBRANCE_STATE_DESCRIPTIONS (v0.2 terminology)', () => {
  it('should use "Espaço" in the normal state description', () => {
    expect(ENCUMBRANCE_STATE_DESCRIPTIONS.normal).toContain('Espaço');
  });

  it('should not use "Peso" in any description', () => {
    for (const description of Object.values(ENCUMBRANCE_STATE_DESCRIPTIONS)) {
      expect(description).not.toContain('Peso');
    }
  });

  it('should have descriptions for all three states', () => {
    expect(ENCUMBRANCE_STATE_DESCRIPTIONS).toHaveProperty('normal');
    expect(ENCUMBRANCE_STATE_DESCRIPTIONS).toHaveProperty('sobrecarregado');
    expect(ENCUMBRANCE_STATE_DESCRIPTIONS).toHaveProperty('imobilizado');
  });

  it('should have non-empty descriptions', () => {
    for (const description of Object.values(ENCUMBRANCE_STATE_DESCRIPTIONS)) {
      expect(description.length).toBeGreaterThan(0);
    }
  });
});
