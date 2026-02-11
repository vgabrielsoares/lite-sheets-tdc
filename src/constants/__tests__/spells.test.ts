/**
 * Tests for spell constants
 *
 * Covers:
 * - SPELL_CIRCLE_PP_COST
 * - SPELL_CIRCLE_PF_COST
 * - CHANNEL_MANA_PF_GENERATION
 * - CHANNEL_MANA_LABELS
 * - Spell system structure
 */

import {
  SPELL_CIRCLES,
  SPELL_CIRCLE_PP_COST,
  SPELL_CIRCLE_PF_COST,
  CHANNEL_MANA_PF_GENERATION,
  CHANNEL_MANA_LABELS,
  SPELLCASTING_SKILLS,
  SPELL_MATRICES,
  SPELL_MATRICES_BY_SKILL,
  SPELL_CLASSES,
  SPELL_COMPONENTS,
  SPELL_LEARNING_CIRCLE_MODIFIER,
  SPELL_LEARNING_MIN_CHANCE,
  SPELL_LEARNING_MAX_CHANCE,
  SPELL_BASE_DC,
} from '@/constants/spells';
import type { SpellCircle } from '@/constants/spells';

// ─── Spell Circles ──────────────────────────────────────────

describe('SPELL_CIRCLES', () => {
  it('should have 8 circles (1-8)', () => {
    expect(SPELL_CIRCLES).toHaveLength(8);
    expect(SPELL_CIRCLES[0]).toBe(1);
    expect(SPELL_CIRCLES[7]).toBe(8);
  });
});

// ─── PP Cost (deprecated but still used) ────────────────────

describe('SPELL_CIRCLE_PP_COST', () => {
  it('should have correct costs per circle (book v0.1.7)', () => {
    expect(SPELL_CIRCLE_PP_COST[1]).toBe(0);
    expect(SPELL_CIRCLE_PP_COST[2]).toBe(1);
    expect(SPELL_CIRCLE_PP_COST[3]).toBe(3);
    expect(SPELL_CIRCLE_PP_COST[4]).toBe(5);
    expect(SPELL_CIRCLE_PP_COST[5]).toBe(7);
    expect(SPELL_CIRCLE_PP_COST[6]).toBe(9);
    expect(SPELL_CIRCLE_PP_COST[7]).toBe(15);
    expect(SPELL_CIRCLE_PP_COST[8]).toBe(20);
  });

  it('should have a cost for every circle', () => {
    for (const circle of SPELL_CIRCLES) {
      expect(SPELL_CIRCLE_PP_COST[circle]).toBeDefined();
      expect(typeof SPELL_CIRCLE_PP_COST[circle]).toBe('number');
    }
  });

  it('should have non-decreasing costs', () => {
    for (let i = 1; i < SPELL_CIRCLES.length; i++) {
      const current = SPELL_CIRCLES[i];
      const prev = SPELL_CIRCLES[i - 1];
      expect(SPELL_CIRCLE_PP_COST[current]).toBeGreaterThanOrEqual(
        SPELL_CIRCLE_PP_COST[prev]
      );
    }
  });
});

// ─── PF Cost ────────────────────────────────────────────────

describe('SPELL_CIRCLE_PF_COST', () => {
  it('should have correct costs per circle (book v0.1.7)', () => {
    expect(SPELL_CIRCLE_PF_COST[1]).toBe(0);
    expect(SPELL_CIRCLE_PF_COST[2]).toBe(1);
    expect(SPELL_CIRCLE_PF_COST[3]).toBe(3);
    expect(SPELL_CIRCLE_PF_COST[4]).toBe(5);
    expect(SPELL_CIRCLE_PF_COST[5]).toBe(7);
    expect(SPELL_CIRCLE_PF_COST[6]).toBe(9);
    expect(SPELL_CIRCLE_PF_COST[7]).toBe(15);
    expect(SPELL_CIRCLE_PF_COST[8]).toBe(20);
  });

  it('should have a cost for every circle', () => {
    for (const circle of SPELL_CIRCLES) {
      expect(SPELL_CIRCLE_PF_COST[circle]).toBeDefined();
    }
  });

  it('should match PP costs (v0.1.7: same table)', () => {
    // In v0.1.7, PF costs = PP costs (same values)
    for (const circle of SPELL_CIRCLES) {
      expect(SPELL_CIRCLE_PF_COST[circle]).toBe(SPELL_CIRCLE_PP_COST[circle]);
    }
  });

  it('1st circle should be free (cost 0)', () => {
    expect(SPELL_CIRCLE_PF_COST[1]).toBe(0);
  });

  it('8th circle should be the most expensive (20 PF)', () => {
    expect(SPELL_CIRCLE_PF_COST[8]).toBe(20);
    for (const circle of SPELL_CIRCLES) {
      expect(SPELL_CIRCLE_PF_COST[8]).toBeGreaterThanOrEqual(
        SPELL_CIRCLE_PF_COST[circle]
      );
    }
  });
});

// ─── Channel Mana ───────────────────────────────────────────

describe('CHANNEL_MANA_PF_GENERATION', () => {
  it('should generate correct PF per action cost', () => {
    expect(CHANNEL_MANA_PF_GENERATION[1]).toBe(1); // ▶ = 1 PF
    expect(CHANNEL_MANA_PF_GENERATION[2]).toBe(2); // ▶▶ = 2 PF
    expect(CHANNEL_MANA_PF_GENERATION[3]).toBe(4); // ▶▶▶ = 4 PF
  });

  it('should scale non-linearly (3 actions give 4, not 3)', () => {
    // 1 action = 1 PF/action
    // 2 actions = 1 PF/action
    // 3 actions = 1.33 PF/action (but gives 4 total)
    expect(CHANNEL_MANA_PF_GENERATION[3]).toBeGreaterThan(
      CHANNEL_MANA_PF_GENERATION[2] + 1
    );
  });
});

describe('CHANNEL_MANA_LABELS', () => {
  it('should have labels for all action costs', () => {
    expect(CHANNEL_MANA_LABELS[1]).toBeDefined();
    expect(CHANNEL_MANA_LABELS[2]).toBeDefined();
    expect(CHANNEL_MANA_LABELS[3]).toBeDefined();
  });

  it('should include action symbols', () => {
    expect(CHANNEL_MANA_LABELS[1]).toContain('▶');
    expect(CHANNEL_MANA_LABELS[2]).toContain('▶▶');
    expect(CHANNEL_MANA_LABELS[3]).toContain('▶▶▶');
  });

  it('should include PF amounts', () => {
    expect(CHANNEL_MANA_LABELS[1]).toContain('1 PF');
    expect(CHANNEL_MANA_LABELS[2]).toContain('2 PF');
    expect(CHANNEL_MANA_LABELS[3]).toContain('4 PF');
  });
});

// ─── Spellcasting Structure ─────────────────────────────────

describe('Spell system structure', () => {
  it('should have 3 spellcasting skills', () => {
    expect(SPELLCASTING_SKILLS).toHaveLength(3);
    expect(SPELLCASTING_SKILLS).toContain('arcano');
    expect(SPELLCASTING_SKILLS).toContain('natureza');
    expect(SPELLCASTING_SKILLS).toContain('religiao');
  });

  it('should have 10 spell matrices', () => {
    expect(SPELL_MATRICES).toHaveLength(10);
  });

  it('each spellcasting skill should have associated matrices', () => {
    for (const skill of SPELLCASTING_SKILLS) {
      expect(SPELL_MATRICES_BY_SKILL[skill].length).toBeGreaterThan(0);
    }
  });

  it('mundana matrix should be available to all skills', () => {
    for (const skill of SPELLCASTING_SKILLS) {
      expect(SPELL_MATRICES_BY_SKILL[skill]).toContain('mundana');
    }
  });

  it('should have 15 spell classes', () => {
    expect(SPELL_CLASSES).toHaveLength(15);
  });

  it('should have 4 spell components', () => {
    expect(SPELL_COMPONENTS).toEqual([
      'somatico',
      'verbal',
      'material',
      'circular',
    ]);
  });
});

// ─── Spell Learning ─────────────────────────────────────────

describe('Spell learning constants', () => {
  it('should have learning modifiers for every circle', () => {
    for (const circle of SPELL_CIRCLES) {
      expect(SPELL_LEARNING_CIRCLE_MODIFIER[circle]).toBeDefined();
    }
  });

  it('higher circles should have lower (or equal) modifiers', () => {
    for (let i = 1; i < SPELL_CIRCLES.length; i++) {
      const current = SPELL_CIRCLES[i];
      const prev = SPELL_CIRCLES[i - 1];
      expect(SPELL_LEARNING_CIRCLE_MODIFIER[current]).toBeLessThanOrEqual(
        SPELL_LEARNING_CIRCLE_MODIFIER[prev]
      );
    }
  });

  it('1st circle should have maximum modifier (+30)', () => {
    expect(SPELL_LEARNING_CIRCLE_MODIFIER[1]).toBe(30);
  });

  it('8th circle should have minimum modifier (-70)', () => {
    expect(SPELL_LEARNING_CIRCLE_MODIFIER[8]).toBe(-70);
  });

  it('should have correct min/max learning chance', () => {
    expect(SPELL_LEARNING_MIN_CHANCE).toBe(1);
    expect(SPELL_LEARNING_MAX_CHANCE).toBe(99);
  });

  it('should have correct base DC', () => {
    expect(SPELL_BASE_DC).toBe(12);
  });
});
