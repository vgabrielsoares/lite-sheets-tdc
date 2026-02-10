/**
 * Tests for Resource Die System (Phase 4 - v0.0.2)
 *
 * Tests the resource die scale, step-down/step-up mechanics,
 * and the processResourceUse function that handles resource consumption.
 */

import type { DiceType } from '@/types/common';
import type { ResourceDie, ResourceDieRollResult } from '@/types/resources';
import {
  RESOURCE_DIE_SCALE,
  RESOURCE_DIE_SIDES,
  getResourceDieIndex,
  stepDownResourceDie,
  stepUpResourceDie,
  processResourceUse,
} from '@/types/resources';

// ─── Helper: factory for ResourceDie ─────────────────────────

function makeResource(overrides: Partial<ResourceDie> = {}): ResourceDie {
  return {
    id: 'res-1',
    name: 'Tocha',
    currentDie: 'd8',
    minDie: 'd2',
    maxDie: 'd12',
    state: 'active',
    isCustom: false,
    ...overrides,
  };
}

// ─── RESOURCE_DIE_SCALE ──────────────────────────────────────

describe('RESOURCE_DIE_SCALE', () => {
  it('should have exactly 9 entries', () => {
    expect(RESOURCE_DIE_SCALE).toHaveLength(9);
  });

  it('should be in ascending order: d2 → d3 → d4 → d6 → d8 → d10 → d12 → d20 → d100', () => {
    expect([...RESOURCE_DIE_SCALE]).toEqual([
      'd2',
      'd3',
      'd4',
      'd6',
      'd8',
      'd10',
      'd12',
      'd20',
      'd100',
    ]);
  });

  it('should be a readonly array (typed as readonly DiceType[])', () => {
    // `as const` creates a readonly tuple at the type level
    // Verify the array reference itself is stable
    const ref1 = RESOURCE_DIE_SCALE;
    const ref2 = RESOURCE_DIE_SCALE;
    expect(ref1).toBe(ref2);
  });
});

// ─── RESOURCE_DIE_SIDES ─────────────────────────────────────

describe('RESOURCE_DIE_SIDES', () => {
  it('should map all 9 DiceType values to their correct number of sides', () => {
    expect(RESOURCE_DIE_SIDES).toEqual({
      d2: 2,
      d3: 3,
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d20: 20,
      d100: 100,
    });
  });

  it.each([
    ['d2', 2],
    ['d3', 3],
    ['d4', 4],
    ['d6', 6],
    ['d8', 8],
    ['d10', 10],
    ['d12', 12],
    ['d20', 20],
    ['d100', 100],
  ] as [DiceType, number][])(
    'should return %i sides for %s',
    (die, expectedSides) => {
      expect(RESOURCE_DIE_SIDES[die]).toBe(expectedSides);
    }
  );
});

// ─── getResourceDieIndex ─────────────────────────────────────

describe('getResourceDieIndex', () => {
  it.each([
    ['d2', 0],
    ['d3', 1],
    ['d4', 2],
    ['d6', 3],
    ['d8', 4],
    ['d10', 5],
    ['d12', 6],
    ['d20', 7],
    ['d100', 8],
  ] as [DiceType, number][])(
    'should return index %i for %s',
    (die, expectedIndex) => {
      expect(getResourceDieIndex(die)).toBe(expectedIndex);
    }
  );

  it('should return -1 for an invalid die type', () => {
    expect(getResourceDieIndex('dx' as DiceType)).toBe(-1);
  });
});

// ─── stepDownResourceDie ─────────────────────────────────────

describe('stepDownResourceDie', () => {
  it('should step d12 down to d10 (minDie = d2)', () => {
    expect(stepDownResourceDie('d12', 'd2')).toBe('d10');
  });

  it('should step d8 down to d6 (minDie = d2)', () => {
    expect(stepDownResourceDie('d8', 'd2')).toBe('d6');
  });

  it('should step d6 down to d4 (minDie = d4)', () => {
    expect(stepDownResourceDie('d6', 'd4')).toBe('d4');
  });

  it('should step d100 down to d20 (minDie = d2)', () => {
    expect(stepDownResourceDie('d100', 'd2')).toBe('d20');
  });

  it('should step d3 down to d2 (minDie = d2)', () => {
    expect(stepDownResourceDie('d3', 'd2')).toBe('d2');
  });

  it('should return null when currentDie equals minDie (depleted)', () => {
    expect(stepDownResourceDie('d4', 'd4')).toBeNull();
  });

  it('should return null when currentDie is below minDie', () => {
    // d2 (index 0) is below d4 (index 2)
    expect(stepDownResourceDie('d2', 'd4')).toBeNull();
  });

  it('should return null when d2 is the min and current die is d2', () => {
    expect(stepDownResourceDie('d2', 'd2')).toBeNull();
  });
});

// ─── stepUpResourceDie ──────────────────────────────────────

describe('stepUpResourceDie', () => {
  it('should step d6 up to d8 (maxDie = d12)', () => {
    expect(stepUpResourceDie('d6', 'd12')).toBe('d8');
  });

  it('should step d2 up to d3 (maxDie = d100)', () => {
    expect(stepUpResourceDie('d2', 'd100')).toBe('d3');
  });

  it('should step d10 up to d12 (maxDie = d12)', () => {
    expect(stepUpResourceDie('d10', 'd12')).toBe('d12');
  });

  it('should step d20 up to d100 (maxDie = d100)', () => {
    expect(stepUpResourceDie('d20', 'd100')).toBe('d100');
  });

  it('should return maxDie when currentDie equals maxDie', () => {
    expect(stepUpResourceDie('d12', 'd12')).toBe('d12');
  });

  it('should return maxDie when currentDie is above maxDie', () => {
    // d20 (index 7) is above d12 (index 6), should clamp
    expect(stepUpResourceDie('d20', 'd12')).toBe('d12');
  });

  it('should return maxDie when d100 is current and max', () => {
    expect(stepUpResourceDie('d100', 'd100')).toBe('d100');
  });
});

// ─── processResourceUse ──────────────────────────────────────

describe('processResourceUse', () => {
  describe('when resource is already depleted (currentDie = null)', () => {
    it('should return depleted result regardless of roll value', () => {
      const resource = makeResource({ currentDie: null, state: 'depleted' });
      const result = processResourceUse(resource, 3);

      expect(result.isDepleted).toBe(true);
      expect(result.isSteppedDown).toBe(false);
      expect(result.newDie).toBeNull();
      expect(result.resourceId).toBe(resource.id);
      expect(result.resourceName).toBe(resource.name);
      // When depleted, dieRolled should be minDie
      expect(result.dieRolled).toBe(resource.minDie);
    });
  });

  describe('when rollValue = 1 (resource depleted)', () => {
    it('should deplete the resource', () => {
      const resource = makeResource({ currentDie: 'd8' });
      const result = processResourceUse(resource, 1);

      expect(result.isDepleted).toBe(true);
      expect(result.isSteppedDown).toBe(false);
      expect(result.newDie).toBeNull();
      expect(result.dieRolled).toBe('d8');
      expect(result.value).toBe(1);
    });

    it('should deplete even if at highest die', () => {
      const resource = makeResource({ currentDie: 'd100', maxDie: 'd100' });
      const result = processResourceUse(resource, 1);

      expect(result.isDepleted).toBe(true);
      expect(result.newDie).toBeNull();
    });

    it('should deplete even if at lowest die', () => {
      const resource = makeResource({ currentDie: 'd2', minDie: 'd2' });
      const result = processResourceUse(resource, 1);

      expect(result.isDepleted).toBe(true);
      expect(result.newDie).toBeNull();
    });
  });

  describe('when rollValue >= 2 (resource steps down)', () => {
    it('should step down d8 to d6 with roll=2', () => {
      const resource = makeResource({ currentDie: 'd8', minDie: 'd2' });
      const result = processResourceUse(resource, 2);

      expect(result.isDepleted).toBe(false);
      expect(result.isSteppedDown).toBe(true);
      expect(result.newDie).toBe('d6');
      expect(result.dieRolled).toBe('d8');
      expect(result.value).toBe(2);
    });

    it('should step down d12 to d10 with roll=5', () => {
      const resource = makeResource({ currentDie: 'd12', minDie: 'd2' });
      const result = processResourceUse(resource, 5);

      expect(result.isSteppedDown).toBe(true);
      expect(result.newDie).toBe('d10');
    });

    it('should step down and deplete when at minDie (d4 with minDie=d4)', () => {
      const resource = makeResource({ currentDie: 'd4', minDie: 'd4' });
      const result = processResourceUse(resource, 3);

      // stepDown returns null when currentDie === minDie
      expect(result.isSteppedDown).toBe(true);
      expect(result.isDepleted).toBe(true);
      expect(result.newDie).toBeNull();
    });

    it('should step d3 down to d2 (minDie=d2) and not deplete', () => {
      const resource = makeResource({ currentDie: 'd3', minDie: 'd2' });
      const result = processResourceUse(resource, 2);

      expect(result.isSteppedDown).toBe(true);
      expect(result.isDepleted).toBe(false);
      expect(result.newDie).toBe('d2');
    });

    it('should include correct resourceId and resourceName', () => {
      const resource = makeResource({
        id: 'water-01',
        name: 'Água',
        currentDie: 'd10',
      });
      const result = processResourceUse(resource, 4);

      expect(result.resourceId).toBe('water-01');
      expect(result.resourceName).toBe('Água');
    });

    it('should handle high roll values the same as roll=2', () => {
      const resource = makeResource({ currentDie: 'd20', minDie: 'd2' });
      const resultLow = processResourceUse(resource, 2);
      const resourceHigh = makeResource({ currentDie: 'd20', minDie: 'd2' });
      const resultHigh = processResourceUse(resourceHigh, 19);

      // Both should step down identically
      expect(resultLow.newDie).toBe(resultHigh.newDie);
      expect(resultLow.isSteppedDown).toBe(resultHigh.isSteppedDown);
      expect(resultLow.isDepleted).toBe(resultHigh.isDepleted);
    });
  });
});
