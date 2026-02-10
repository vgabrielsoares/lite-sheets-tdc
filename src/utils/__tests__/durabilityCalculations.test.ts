/**
 * Testes para durabilityCalculations.ts
 *
 * Testes unitários para funções de cálculo de durabilidade de itens,
 * incluindo criação, teste, reparo, rolagem de dado e helpers de UI.
 */

import {
  DURABILITY_DIE_OPTIONS,
  createItemDurability,
  getDurabilityPercent,
  testDurability,
  applyDurabilityTestResult,
  repairItem,
  rollDurabilityDie,
  getDurabilityColor,
  getDurabilityLabel,
} from '../durabilityCalculations';
import type { ItemDurability, DurabilityState } from '@/types/inventory';
import { RESOURCE_DIE_SCALE, RESOURCE_DIE_SIDES } from '@/types/resources';

// ============================================================================
// DURABILITY_DIE_OPTIONS
// ============================================================================

describe('DURABILITY_DIE_OPTIONS', () => {
  it('should contain the expected die types', () => {
    expect(DURABILITY_DIE_OPTIONS).toEqual([
      'd2',
      'd4',
      'd6',
      'd8',
      'd10',
      'd12',
      'd20',
      'd100',
    ]);
  });

  it('should be a subset of RESOURCE_DIE_SCALE', () => {
    for (const die of DURABILITY_DIE_OPTIONS) {
      expect(RESOURCE_DIE_SCALE).toContain(die);
    }
  });
});

// ============================================================================
// createItemDurability
// ============================================================================

describe('createItemDurability', () => {
  it('should create durability with currentDie equal to maxDie', () => {
    const result = createItemDurability('d8');
    expect(result.currentDie).toBe('d8');
    expect(result.maxDie).toBe('d8');
  });

  it('should create with state intacto', () => {
    const result = createItemDurability('d12');
    expect(result.state).toBe('intacto');
  });

  it('should work for all durability die options', () => {
    for (const die of DURABILITY_DIE_OPTIONS) {
      const result = createItemDurability(die);
      expect(result).toEqual({
        currentDie: die,
        maxDie: die,
        state: 'intacto',
      });
    }
  });

  it('should create with d2 (smallest die)', () => {
    const result = createItemDurability('d2');
    expect(result.currentDie).toBe('d2');
    expect(result.maxDie).toBe('d2');
    expect(result.state).toBe('intacto');
  });

  it('should create with d100 (largest die)', () => {
    const result = createItemDurability('d100');
    expect(result.currentDie).toBe('d100');
    expect(result.maxDie).toBe('d100');
    expect(result.state).toBe('intacto');
  });
});

// ============================================================================
// getDurabilityPercent
// ============================================================================

describe('getDurabilityPercent', () => {
  it('should return 100 for intacto items', () => {
    const durability: ItemDurability = {
      currentDie: 'd12',
      maxDie: 'd12',
      state: 'intacto',
    };
    expect(getDurabilityPercent(durability)).toBe(100);
  });

  it('should return 0 for quebrado items', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd12',
      state: 'quebrado',
    };
    expect(getDurabilityPercent(durability)).toBe(0);
  });

  it('should return intermediate value for danificado items', () => {
    // d8 is index 4, d12 is index 6 in RESOURCE_DIE_SCALE
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd12',
      state: 'danificado',
    };
    const percent = getDurabilityPercent(durability);
    expect(percent).toBeGreaterThan(0);
    expect(percent).toBeLessThan(100);
  });

  it('should return correct percentage based on die indices', () => {
    // d6 is index 3, d100 is index 8 in RESOURCE_DIE_SCALE
    const durability: ItemDurability = {
      currentDie: 'd6',
      maxDie: 'd100',
      state: 'danificado',
    };
    const percent = getDurabilityPercent(durability);
    expect(percent).toBe(Math.round((3 / 8) * 100)); // 38
  });

  it('should return 100 for intacto even with d2 max', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd2',
      state: 'intacto',
    };
    expect(getDurabilityPercent(durability)).toBe(100);
  });

  it('should return 0 for quebrado regardless of dice', () => {
    const durability: ItemDurability = {
      currentDie: 'd100',
      maxDie: 'd100',
      state: 'quebrado',
    };
    expect(getDurabilityPercent(durability)).toBe(0);
  });
});

// ============================================================================
// testDurability
// ============================================================================

describe('testDurability', () => {
  it('should not damage item when roll >= 2', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = testDurability(durability, 5);

    expect(result.damaged).toBe(false);
    expect(result.roll).toBe(5);
    expect(result.previousDie).toBe('d8');
    expect(result.newDie).toBe('d8');
    expect(result.newState).toBe('intacto');
  });

  it('should damage item when roll = 1', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = testDurability(durability, 1);

    expect(result.damaged).toBe(true);
    expect(result.roll).toBe(1);
    expect(result.previousDie).toBe('d8');
    expect(result.newDie).toBe('d6'); // step down from d8 → d6
    expect(result.newState).toBe('danificado');
  });

  it('should step down die on damage: d12 → d10', () => {
    const durability: ItemDurability = {
      currentDie: 'd12',
      maxDie: 'd12',
      state: 'intacto',
    };

    const result = testDurability(durability, 1);

    expect(result.damaged).toBe(true);
    expect(result.newDie).toBe('d10');
    expect(result.newState).toBe('danificado');
  });

  it('should step down die on damage: d4 → d3', () => {
    const durability: ItemDurability = {
      currentDie: 'd4',
      maxDie: 'd12',
      state: 'danificado',
    };

    const result = testDurability(durability, 1);

    expect(result.damaged).toBe(true);
    expect(result.newDie).toBe('d3');
    expect(result.newState).toBe('danificado');
  });

  it('should break item when d2 fails (roll = 1)', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd8',
      state: 'danificado',
    };

    const result = testDurability(durability, 1);

    expect(result.damaged).toBe(true);
    expect(result.roll).toBe(1);
    expect(result.newDie).toBe('d2'); // stays d2 but becomes quebrado
    expect(result.newState).toBe('quebrado');
  });

  it('should not damage quebrado items', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd8',
      state: 'quebrado',
    };

    const result = testDurability(durability, 1);

    expect(result.damaged).toBe(false);
    expect(result.newState).toBe('quebrado');
    expect(result.newDie).toBe('d2');
  });

  it('should keep quebrado state even with roll >= 2', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd8',
      state: 'quebrado',
    };

    const result = testDurability(durability, 2);

    expect(result.damaged).toBe(false);
    expect(result.newState).toBe('quebrado');
  });

  it('should preserve danificado state on successful roll', () => {
    const durability: ItemDurability = {
      currentDie: 'd6',
      maxDie: 'd12',
      state: 'danificado',
    };

    const result = testDurability(durability, 4);

    expect(result.damaged).toBe(false);
    expect(result.newDie).toBe('d6');
    expect(result.newState).toBe('danificado');
  });

  it('should handle roll = 2 (boundary) as success', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = testDurability(durability, 2);

    expect(result.damaged).toBe(false);
    expect(result.newState).toBe('intacto');
  });
});

// ============================================================================
// applyDurabilityTestResult
// ============================================================================

describe('applyDurabilityTestResult', () => {
  it('should apply damage result correctly', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = testDurability(durability, 1);
    const updated = applyDurabilityTestResult(durability, result);

    expect(updated.currentDie).toBe('d6');
    expect(updated.state).toBe('danificado');
    expect(updated.maxDie).toBe('d8'); // maxDie should not change
  });

  it('should apply no-damage result correctly', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = testDurability(durability, 5);
    const updated = applyDurabilityTestResult(durability, result);

    expect(updated.currentDie).toBe('d8');
    expect(updated.state).toBe('intacto');
    expect(updated.maxDie).toBe('d8');
  });

  it('should apply quebrado result correctly', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd12',
      state: 'danificado',
    };

    const result = testDurability(durability, 1);
    const updated = applyDurabilityTestResult(durability, result);

    expect(updated.state).toBe('quebrado');
    expect(updated.maxDie).toBe('d12');
  });

  it('should preserve maxDie through multiple damage applications', () => {
    let durability: ItemDurability = {
      currentDie: 'd12',
      maxDie: 'd12',
      state: 'intacto',
    };

    // Apply multiple damage steps
    for (let i = 0; i < 3; i++) {
      const result = testDurability(durability, 1);
      durability = applyDurabilityTestResult(durability, result);
    }

    expect(durability.maxDie).toBe('d12');
    expect(durability.state).toBe('danificado');
  });
});

// ============================================================================
// repairItem
// ============================================================================

describe('repairItem', () => {
  it('should reset currentDie to maxDie', () => {
    const durability: ItemDurability = {
      currentDie: 'd4',
      maxDie: 'd12',
      state: 'danificado',
    };

    const result = repairItem(durability);

    expect(result.currentDie).toBe('d12');
    expect(result.maxDie).toBe('d12');
  });

  it('should set state to intacto', () => {
    const durability: ItemDurability = {
      currentDie: 'd2',
      maxDie: 'd8',
      state: 'quebrado',
    };

    const result = repairItem(durability);

    expect(result.state).toBe('intacto');
  });

  it('should handle repairing already intacto items', () => {
    const durability: ItemDurability = {
      currentDie: 'd8',
      maxDie: 'd8',
      state: 'intacto',
    };

    const result = repairItem(durability);

    expect(result.currentDie).toBe('d8');
    expect(result.maxDie).toBe('d8');
    expect(result.state).toBe('intacto');
  });

  it('should repair danificado item correctly', () => {
    const durability: ItemDurability = {
      currentDie: 'd6',
      maxDie: 'd100',
      state: 'danificado',
    };

    const result = repairItem(durability);

    expect(result.currentDie).toBe('d100');
    expect(result.maxDie).toBe('d100');
    expect(result.state).toBe('intacto');
  });
});

// ============================================================================
// rollDurabilityDie
// ============================================================================

describe('rollDurabilityDie', () => {
  it('should return a value between 1 and die sides for d6', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDurabilityDie('d6');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });

  it('should return a value between 1 and die sides for d2', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollDurabilityDie('d2');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(2);
    }
  });

  it('should return a value between 1 and die sides for d100', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDurabilityDie('d100');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
    }
  });

  it('should return a value between 1 and die sides for d20', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDurabilityDie('d20');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('should return valid range for all durability die options', () => {
    for (const die of DURABILITY_DIE_OPTIONS) {
      const maxSides = RESOURCE_DIE_SIDES[die];
      for (let i = 0; i < 50; i++) {
        const result = rollDurabilityDie(die);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(maxSides);
      }
    }
  });

  it('should return integer values', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollDurabilityDie('d12');
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

// ============================================================================
// getDurabilityColor
// ============================================================================

describe('getDurabilityColor', () => {
  it('should return success for intacto', () => {
    expect(getDurabilityColor('intacto')).toBe('success');
  });

  it('should return warning for danificado', () => {
    expect(getDurabilityColor('danificado')).toBe('warning');
  });

  it('should return error for quebrado', () => {
    expect(getDurabilityColor('quebrado')).toBe('error');
  });

  it('should return correct color for all states', () => {
    const states: DurabilityState[] = ['intacto', 'danificado', 'quebrado'];
    const expectedColors = ['success', 'warning', 'error'] as const;

    states.forEach((state, index) => {
      expect(getDurabilityColor(state)).toBe(expectedColors[index]);
    });
  });
});

// ============================================================================
// getDurabilityLabel
// ============================================================================

describe('getDurabilityLabel', () => {
  it('should return Intacto for intacto', () => {
    expect(getDurabilityLabel('intacto')).toBe('Intacto');
  });

  it('should return Danificado for danificado', () => {
    expect(getDurabilityLabel('danificado')).toBe('Danificado');
  });

  it('should return Quebrado for quebrado', () => {
    expect(getDurabilityLabel('quebrado')).toBe('Quebrado');
  });

  it('should return correct label for all states', () => {
    const states: DurabilityState[] = ['intacto', 'danificado', 'quebrado'];
    const expectedLabels = ['Intacto', 'Danificado', 'Quebrado'];

    states.forEach((state, index) => {
      expect(getDurabilityLabel(state)).toBe(expectedLabels[index]);
    });
  });
});
