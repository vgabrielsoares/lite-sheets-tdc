/**
 * Tests for conditionEffects utility
 *
 * Validates that dice penalties from conditions are properly aggregated,
 * including stackable conditions, auto-triggered conditions, and
 * the helper functions for formatting and querying penalties.
 */

import {
  calculateConditionDicePenalties,
  getDicePenaltyForAttribute,
  hasActivePenalties,
  formatPenaltySummary,
  type DicePenaltyMap,
} from '../conditionEffects';
import type { Condition } from '@/types/combat';

/**
 * Helper to create a Condition object for testing
 */
function makeCondition(
  name: string,
  stacks?: number,
  source?: string
): Condition {
  const modifiers =
    stacks !== undefined
      ? [{ name: 'stacks', value: stacks, type: 'penalidade' as const }]
      : [];
  return {
    name,
    description: `Test condition: ${name}`,
    duration: null,
    modifiers,
    source,
  };
}

describe('conditionEffects', () => {
  // ─── calculateConditionDicePenalties ──────────────────────

  describe('calculateConditionDicePenalties', () => {
    it('should return empty map when no conditions are active', () => {
      const result = calculateConditionDicePenalties([], []);
      expect(result).toEqual({});
    });

    it('should compute penalty for a simple manual condition (Fraco → -1d agi/corpo)', () => {
      const conditions = [makeCondition('fraco', 1)];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({ agilidade: -1, corpo: -1 });
    });

    it('should compute penalty for Abalado (-1d todos) with stacks', () => {
      const conditions = [makeCondition('abalado', 3)];
      const result = calculateConditionDicePenalties(conditions, []);
      // Abalado: -1d todos, scalesWithStacks → 3 stacks = -3d
      expect(result).toEqual({ todos: -3 });
    });

    it('should compute penalty for Exausto with stacks (-1d agi/corpo per stack)', () => {
      const conditions = [makeCondition('exausto', 2)];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({ agilidade: -2, corpo: -2 });
    });

    it('should compute penalty for Perturbado (-1d influencia/mente per stack)', () => {
      const conditions = [makeCondition('perturbado', 2)];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({ influencia: -2, mente: -2 });
    });

    it('should compute penalty for Dissonante (-1d instinto/essencia per stack)', () => {
      const conditions = [makeCondition('dissonante', 1)];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({ instinto: -1, essencia: -1 });
    });

    it('should aggregate penalties from multiple conditions', () => {
      const conditions = [
        makeCondition('abalado', 2), // -2d todos
        makeCondition('exausto', 1), // -1d agi, -1d corpo
      ];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({
        todos: -2,
        agilidade: -1,
        corpo: -1,
      });
    });

    it('should include auto-triggered condition penalties', () => {
      // Esgotado: -1d corpo, -1d instinto (auto-triggered when PP = 0)
      const result = calculateConditionDicePenalties([], ['esgotado']);
      expect(result).toEqual({ corpo: -1, instinto: -1 });
    });

    it('should not duplicate penalty if auto condition is also in manual list', () => {
      // If esgotado is both in manual conditions and auto list, count only the manual one
      const conditions = [makeCondition('esgotado')];
      const result = calculateConditionDicePenalties(conditions, ['esgotado']);
      // Should be -1 each, not -2
      expect(result).toEqual({ corpo: -1, instinto: -1 });
    });

    it('should handle auto conditions without dicePenalty (avariado, machucado)', () => {
      // Avariado and Machucado don't have dicePenalty defined
      const result = calculateConditionDicePenalties(
        [],
        ['avariado', 'machucado']
      );
      expect(result).toEqual({});
    });

    it('should handle conditions without dicePenalty gracefully', () => {
      // Amedrontado has no dicePenalty
      const conditions = [makeCondition('amedrontado')];
      const result = calculateConditionDicePenalties(conditions, []);
      expect(result).toEqual({});
    });

    it('should handle non-stackable condition with stacks > 1 (uses base modifier)', () => {
      // Esgotado is not stackable — modifier should NOT scale even if stacks set
      const conditions = [makeCondition('esgotado', 3)];
      const result = calculateConditionDicePenalties(conditions, []);
      // scalesWithStacks is falsy, so stays at -1
      expect(result).toEqual({ corpo: -1, instinto: -1 });
    });

    it('should combine auto + manual conditions with overlapping targets', () => {
      const conditions = [
        makeCondition('exausto', 1), // -1d agi, -1d corpo (stackable)
      ];
      const autoIds = ['esgotado'] as const; // -1d corpo, -1d instinto
      const result = calculateConditionDicePenalties(conditions, [...autoIds]);
      expect(result).toEqual({
        agilidade: -1,
        corpo: -2, // -1 from exausto + -1 from esgotado
        instinto: -1,
      });
    });
  });

  // ─── getDicePenaltyForAttribute ───────────────────────────

  describe('getDicePenaltyForAttribute', () => {
    it('should return 0 for empty penalty map', () => {
      expect(getDicePenaltyForAttribute({}, 'agilidade')).toBe(0);
    });

    it('should return attribute-specific penalty', () => {
      const penalties: DicePenaltyMap = { agilidade: -2, corpo: -1 };
      expect(getDicePenaltyForAttribute(penalties, 'agilidade')).toBe(-2);
      expect(getDicePenaltyForAttribute(penalties, 'corpo')).toBe(-1);
    });

    it('should include "todos" penalty in result', () => {
      const penalties: DicePenaltyMap = { todos: -1, agilidade: -2 };
      // agilidade total = -1 (todos) + -2 (agilidade) = -3
      expect(getDicePenaltyForAttribute(penalties, 'agilidade')).toBe(-3);
    });

    it('should return only "todos" when attribute has no specific penalty', () => {
      const penalties: DicePenaltyMap = { todos: -2 };
      expect(getDicePenaltyForAttribute(penalties, 'mente')).toBe(-2);
    });

    it('should return 0 for unaffected attribute', () => {
      const penalties: DicePenaltyMap = { agilidade: -1, corpo: -1 };
      expect(getDicePenaltyForAttribute(penalties, 'mente')).toBe(0);
    });
  });

  // ─── hasActivePenalties ───────────────────────────────────

  describe('hasActivePenalties', () => {
    it('should return false for empty map', () => {
      expect(hasActivePenalties({})).toBe(false);
    });

    it('should return false when all values are 0', () => {
      expect(hasActivePenalties({ todos: 0, agilidade: 0 })).toBe(false);
    });

    it('should return true when any value is non-zero', () => {
      expect(hasActivePenalties({ corpo: -1 })).toBe(true);
    });
  });

  // ─── formatPenaltySummary ─────────────────────────────────

  describe('formatPenaltySummary', () => {
    it('should return empty array for empty map', () => {
      expect(formatPenaltySummary({})).toEqual([]);
    });

    it('should format negative penalties correctly', () => {
      const result = formatPenaltySummary({ agilidade: -2 });
      expect(result).toEqual(['-2d Agilidade']);
    });

    it('should format "todos" target correctly', () => {
      const result = formatPenaltySummary({ todos: -3 });
      expect(result).toEqual(['-3d todos os testes']);
    });

    it('should format multiple penalties', () => {
      const result = formatPenaltySummary({
        todos: -1,
        corpo: -2,
        instinto: -1,
      });
      expect(result).toHaveLength(3);
      expect(result).toContain('-1d todos os testes');
      expect(result).toContain('-2d Corpo');
      expect(result).toContain('-1d Instinto');
    });

    it('should skip zero-value entries', () => {
      const result = formatPenaltySummary({ agilidade: 0, corpo: -1 });
      expect(result).toEqual(['-1d Corpo']);
    });

    it('should format positive values with + prefix', () => {
      const result = formatPenaltySummary({ agilidade: 2 });
      expect(result).toEqual(['+2d Agilidade']);
    });
  });
});
