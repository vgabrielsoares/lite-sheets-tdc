/**
 * Tests for Suffer/Recover Interaction (Phase 4 - v0.2)
 *
 * Tests the GA/PV damage, healing, combat state detection, and PP delta
 * functions used in the GuardVitalityDisplay component.
 */

import type { GuardPoints, VitalityPoints } from '@/types/combat';
import { PV_RECOVERY_COST } from '@/types/combat';
import {
  applyDamageToGuardVitality,
  healGuard,
  healVitality,
  getEffectiveGAMax,
  adjustGAOnPVCrossing,
  determineCombatState,
  applyDeltaToPP,
} from '@/utils/calculations';

// ─── Helpers ─────────────────────────────────────────────────

function makeGuard(overrides: Partial<GuardPoints> = {}): GuardPoints {
  return { current: 15, max: 15, temporary: 0, ...overrides };
}

function makeVitality(overrides: Partial<VitalityPoints> = {}): VitalityPoints {
  return { current: 5, max: 5, ...overrides };
}

function makePP(
  overrides: Partial<{ max: number; current: number; temporary: number }> = {}
) {
  return { max: 10, current: 5, temporary: 0, ...overrides };
}

// ─── PV_RECOVERY_COST constant ──────────────────────────────

describe('PV_RECOVERY_COST', () => {
  it('should be 5', () => {
    expect(PV_RECOVERY_COST).toBe(5);
  });
});

// ─── applyDamageToGuardVitality ─────────────────────────────

describe('applyDamageToGuardVitality', () => {
  it('should return unchanged when damage is 0', () => {
    const guard = makeGuard();
    const vitality = makeVitality();
    const result = applyDamageToGuardVitality(guard, vitality, 0);

    expect(result.guard.current).toBe(15);
    expect(result.vitality.current).toBe(5);
  });

  it('should return unchanged when damage is negative', () => {
    const guard = makeGuard();
    const vitality = makeVitality();
    const result = applyDamageToGuardVitality(guard, vitality, -3);

    expect(result.guard.current).toBe(15);
    expect(result.vitality.current).toBe(5);
  });

  it('should reduce GA only when damage < GA.current', () => {
    const guard = makeGuard({ current: 10 });
    const vitality = makeVitality();
    const result = applyDamageToGuardVitality(guard, vitality, 5);

    expect(result.guard.current).toBe(5);
    expect(result.vitality.current).toBe(5);
  });

  it('should reduce GA to 0 when damage equals GA.current', () => {
    const guard = makeGuard({ current: 10 });
    const vitality = makeVitality();
    const result = applyDamageToGuardVitality(guard, vitality, 10);

    expect(result.guard.current).toBe(0);
    expect(result.vitality.current).toBe(5);
  });

  it('should overflow damage from GA to PV', () => {
    const guard = makeGuard({ current: 3 });
    const vitality = makeVitality({ current: 5 });
    const result = applyDamageToGuardVitality(guard, vitality, 7);

    expect(result.guard.current).toBe(0);
    expect(result.vitality.current).toBe(1); // 5 - (7 - 3) = 1
  });

  it('should absorb temporary GA first, then regular GA, then PV', () => {
    const guard = makeGuard({ current: 5, temporary: 3 });
    const vitality = makeVitality({ current: 5 });
    const result = applyDamageToGuardVitality(guard, vitality, 10);

    // 3 temp absorbed → 7 remaining, 5 GA absorbed → 2 remaining, PV = 5-2 = 3
    expect(result.guard.temporary).toBe(0);
    expect(result.guard.current).toBe(0);
    expect(result.vitality.current).toBe(3);
  });

  it('should absorb damage partially from temporary GA', () => {
    const guard = makeGuard({ current: 10, temporary: 5 });
    const vitality = makeVitality({ current: 5 });
    const result = applyDamageToGuardVitality(guard, vitality, 3);

    expect(result.guard.temporary).toBe(2); // 5 - 3 = 2
    expect(result.guard.current).toBe(10); // untouched
    expect(result.vitality.current).toBe(5); // untouched
  });

  it('should clamp PV to 0 when damage exceeds all GA + PV', () => {
    const guard = makeGuard({ current: 5, temporary: 2 });
    const vitality = makeVitality({ current: 3 });
    const result = applyDamageToGuardVitality(guard, vitality, 100);

    expect(result.guard.temporary).toBe(0);
    expect(result.guard.current).toBe(0);
    expect(result.vitality.current).toBe(0);
  });

  it('should handle default temporary=undefined as 0', () => {
    const guard: GuardPoints = { current: 5, max: 15 }; // no temporary
    const vitality = makeVitality({ current: 5 });
    const result = applyDamageToGuardVitality(guard, vitality, 8);

    expect(result.guard.current).toBe(0);
    expect(result.vitality.current).toBe(2); // 5 - (8 - 5) = 2
  });

  it('should preserve max and other guard properties', () => {
    const guard = makeGuard({ current: 10, max: 15, temporary: 0 });
    const vitality = makeVitality({ current: 5, max: 5 });
    const result = applyDamageToGuardVitality(guard, vitality, 3);

    expect(result.guard.max).toBe(15);
    expect(result.vitality.max).toBe(5);
  });
});

// ─── healGuard ──────────────────────────────────────────────

describe('healGuard', () => {
  it('should heal guard normally', () => {
    const guard = makeGuard({ current: 8, max: 15 });
    const result = healGuard(guard, 5);

    expect(result.current).toBe(13);
  });

  it('should not exceed max', () => {
    const guard = makeGuard({ current: 12, max: 15 });
    const result = healGuard(guard, 10);

    expect(result.current).toBe(15);
  });

  it('should return unchanged when amount is 0', () => {
    const guard = makeGuard({ current: 10, max: 15 });
    const result = healGuard(guard, 0);

    expect(result.current).toBe(10);
  });

  it('should return unchanged when amount is negative', () => {
    const guard = makeGuard({ current: 10, max: 15 });
    const result = healGuard(guard, -3);

    expect(result.current).toBe(10);
  });

  it('should heal from 0 to amount', () => {
    const guard = makeGuard({ current: 0, max: 15 });
    const result = healGuard(guard, 7);

    expect(result.current).toBe(7);
  });

  it('should heal from 0 to max and cap', () => {
    const guard = makeGuard({ current: 0, max: 15 });
    const result = healGuard(guard, 20);

    expect(result.current).toBe(15);
  });

  it('should preserve other guard properties', () => {
    const guard = makeGuard({ current: 5, max: 15, temporary: 3 });
    const result = healGuard(guard, 5);

    expect(result.max).toBe(15);
    expect(result.temporary).toBe(3);
  });
});

// ─── healVitality ───────────────────────────────────────────

describe('healVitality', () => {
  it('should not heal when recovery < PV_RECOVERY_COST (5)', () => {
    const vitality = makeVitality({ current: 3, max: 5 });
    const result = healVitality(vitality, 4);

    expect(result.vitality.current).toBe(3);
    expect(result.remainingRecovery).toBe(4);
  });

  it('should heal 1 PV when recovery = 5', () => {
    const vitality = makeVitality({ current: 3, max: 5 });
    const result = healVitality(vitality, 5);

    expect(result.vitality.current).toBe(4);
    expect(result.remainingRecovery).toBe(0);
  });

  it('should heal 2 PV when recovery = 10', () => {
    const vitality = makeVitality({ current: 3, max: 5 });
    const result = healVitality(vitality, 10);

    expect(result.vitality.current).toBe(5);
    expect(result.remainingRecovery).toBe(0);
  });

  it('should heal 1 PV and return remainder when recovery = 7', () => {
    const vitality = makeVitality({ current: 3, max: 5 });
    const result = healVitality(vitality, 7);

    expect(result.vitality.current).toBe(4);
    expect(result.remainingRecovery).toBe(2);
  });

  it('should not heal when PV is already at max', () => {
    const vitality = makeVitality({ current: 5, max: 5 });
    const result = healVitality(vitality, 10);

    expect(result.vitality.current).toBe(5);
    expect(result.remainingRecovery).toBe(10);
  });

  it('should not heal more PV than missing', () => {
    const vitality = makeVitality({ current: 4, max: 5 });
    const result = healVitality(vitality, 15);

    // Only 1 PV missing → heal 1 PV, spend 5, remain 10
    expect(result.vitality.current).toBe(5);
    expect(result.remainingRecovery).toBe(10);
  });

  it('should handle recovery = 0 without healing', () => {
    const vitality = makeVitality({ current: 2, max: 5 });
    const result = healVitality(vitality, 0);

    expect(result.vitality.current).toBe(2);
    expect(result.remainingRecovery).toBe(0);
  });

  it('should heal from 0 PV with enough recovery', () => {
    const vitality = makeVitality({ current: 0, max: 5 });
    const result = healVitality(vitality, 25);

    expect(result.vitality.current).toBe(5);
    expect(result.remainingRecovery).toBe(0);
  });

  it('should partially heal from 0 PV with limited recovery', () => {
    const vitality = makeVitality({ current: 0, max: 5 });
    const result = healVitality(vitality, 12);

    // floor(12/5) = 2 PV healed, spend 10, remain 2
    expect(result.vitality.current).toBe(2);
    expect(result.remainingRecovery).toBe(2);
  });
});

// ─── getEffectiveGAMax ──────────────────────────────────────

describe('getEffectiveGAMax', () => {
  it('should return gaMax unchanged when PV > 0', () => {
    expect(getEffectiveGAMax(15, 3)).toBe(15);
  });

  it('should return gaMax unchanged when PV = 1', () => {
    expect(getEffectiveGAMax(20, 1)).toBe(20);
  });

  it('should return floor(gaMax / 2) when PV = 0', () => {
    expect(getEffectiveGAMax(15, 0)).toBe(7); // floor(15/2) = 7
  });

  it('should halve even gaMax when PV = 0', () => {
    expect(getEffectiveGAMax(20, 0)).toBe(10);
  });

  it('should round down odd gaMax when PV = 0', () => {
    expect(getEffectiveGAMax(17, 0)).toBe(8); // floor(17/2) = 8
  });

  it('should return 0 when gaMax = 0 and PV = 0', () => {
    expect(getEffectiveGAMax(0, 0)).toBe(0);
  });

  it('should handle negative PV as PV = 0 (halved)', () => {
    expect(getEffectiveGAMax(20, -1)).toBe(10);
  });
});

// ─── adjustGAOnPVCrossing ───────────────────────────────────

describe('adjustGAOnPVCrossing', () => {
  describe('PV reaches 0 (was > 0, now = 0)', () => {
    it('should clamp GA to half max when GA exceeds half', () => {
      // gaMax=20, halfMax=10. GA was 15, should clamp to 10
      expect(adjustGAOnPVCrossing(15, 20, false, true)).toBe(10);
    });

    it('should keep GA unchanged when already below half max', () => {
      // gaMax=20, halfMax=10. GA was 3, stays at 3
      expect(adjustGAOnPVCrossing(3, 20, false, true)).toBe(3);
    });

    it('should clamp to floor(gaMax/2) for odd gaMax', () => {
      // gaMax=15, halfMax=7. GA was 12, should clamp to 7
      expect(adjustGAOnPVCrossing(12, 15, false, true)).toBe(7);
    });
  });

  describe('PV recovers from 0 (was = 0, now > 0)', () => {
    it('should restore GA to at least half max when GA is below half', () => {
      // gaMax=20, halfMax=10. GA was 3, should become 10
      expect(adjustGAOnPVCrossing(3, 20, true, false)).toBe(10);
    });

    it('should keep GA unchanged when already above half max', () => {
      // gaMax=20, halfMax=10. GA was 12, stays at 12
      expect(adjustGAOnPVCrossing(12, 20, true, false)).toBe(12);
    });

    it('should restore to floor(gaMax/2) for odd gaMax', () => {
      // gaMax=15, halfMax=7. GA was 2, should become 7
      expect(adjustGAOnPVCrossing(2, 15, true, false)).toBe(7);
    });
  });

  describe('no PV state change', () => {
    it('should return GA unchanged when PV was > 0 and still > 0', () => {
      expect(adjustGAOnPVCrossing(12, 20, false, false)).toBe(12);
    });

    it('should return GA unchanged when PV was = 0 and still = 0', () => {
      expect(adjustGAOnPVCrossing(5, 20, true, true)).toBe(5);
    });
  });
});

// ─── determineCombatState ───────────────────────────────────

describe('determineCombatState', () => {
  it('should return "ferimento-critico" when PV = 0', () => {
    expect(determineCombatState(10, 15, 0, 5)).toBe('ferimento-critico');
  });

  it('should return "ferimento-critico" when PV < 0', () => {
    expect(determineCombatState(10, 15, -1, 5)).toBe('ferimento-critico');
  });

  it('should return "ferimento-direto" when PV < max', () => {
    expect(determineCombatState(10, 15, 3, 5)).toBe('ferimento-direto');
  });

  it('should return "ferimento-direto" when PV = 1 (and max > 1)', () => {
    expect(determineCombatState(0, 15, 1, 5)).toBe('ferimento-direto');
  });

  it('should return "normal" when PV = max', () => {
    expect(determineCombatState(15, 15, 5, 5)).toBe('normal');
  });

  it('should return "normal" when GA = 0 but PV = max', () => {
    // Even if GA is gone, if PV is full it's still "normal"
    expect(determineCombatState(0, 15, 5, 5)).toBe('normal');
  });

  it('should return "normal" when PV and max are both 0', () => {
    // Edge case: if max is 0, pvCurrent (0) <= 0 → ferimento-critico
    expect(determineCombatState(0, 0, 0, 0)).toBe('ferimento-critico');
  });
});

// ─── applyDeltaToPP ─────────────────────────────────────────

describe('applyDeltaToPP', () => {
  it('should return unchanged when delta is 0', () => {
    const pp = makePP({ current: 5, temporary: 2 });
    const result = applyDeltaToPP(pp, 0);

    expect(result.current).toBe(5);
    expect(result.temporary).toBe(2);
    expect(result.max).toBe(10);
  });

  describe('spending PP (negative delta)', () => {
    it('should consume temporary PP first', () => {
      const pp = makePP({ current: 5, temporary: 3 });
      const result = applyDeltaToPP(pp, -2);

      expect(result.temporary).toBe(1);
      expect(result.current).toBe(5);
    });

    it('should consume temporary then current when cost exceeds temporary', () => {
      const pp = makePP({ current: 5, temporary: 3 });
      const result = applyDeltaToPP(pp, -4);

      // 3 temp consumed, 1 remaining from current → current=4
      expect(result.temporary).toBe(0);
      expect(result.current).toBe(4);
    });

    it('should reduce current directly when no temporary PP', () => {
      const pp = makePP({ current: 5, temporary: 0 });
      const result = applyDeltaToPP(pp, -2);

      expect(result.current).toBe(3);
      expect(result.temporary).toBe(0);
    });

    it('should clamp current to 0 when cost exceeds all PP', () => {
      const pp = makePP({ current: 3, temporary: 2 });
      const result = applyDeltaToPP(pp, -20);

      expect(result.current).toBe(0);
      expect(result.temporary).toBe(0);
    });

    it('should deplete exactly all PP', () => {
      const pp = makePP({ current: 5, temporary: 3 });
      const result = applyDeltaToPP(pp, -8);

      expect(result.current).toBe(0);
      expect(result.temporary).toBe(0);
    });
  });

  describe('recovering PP (positive delta)', () => {
    it('should increase current', () => {
      const pp = makePP({ current: 5, temporary: 0 });
      const result = applyDeltaToPP(pp, 3);

      expect(result.current).toBe(8);
    });

    it('should cap current at max', () => {
      const pp = makePP({ current: 9, max: 10, temporary: 0 });
      const result = applyDeltaToPP(pp, 5);

      expect(result.current).toBe(10);
    });

    it('should not exceed max when already at max', () => {
      const pp = makePP({ current: 10, max: 10, temporary: 0 });
      const result = applyDeltaToPP(pp, 3);

      expect(result.current).toBe(10);
    });

    it('should not affect temporary when recovering', () => {
      const pp = makePP({ current: 5, temporary: 2 });
      const result = applyDeltaToPP(pp, 3);

      expect(result.current).toBe(8);
      expect(result.temporary).toBe(2);
    });

    it('should preserve max', () => {
      const pp = makePP({ current: 3, max: 10, temporary: 0 });
      const result = applyDeltaToPP(pp, 4);

      expect(result.max).toBe(10);
    });
  });
});
