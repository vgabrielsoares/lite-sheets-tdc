/**
 * Tests for proficiencyPurchases constants and utility functions
 *
 * Covers:
 * - PURCHASABLE_PROFICIENCIES structure
 * - getAvailablePurchasePoints
 * - getSpentPurchasePoints
 * - getRemainingPurchasePoints
 * - canPurchaseProficiency
 */

import {
  PURCHASABLE_PROFICIENCIES,
  PROFICIENCY_PURCHASE_CATEGORY_LABELS,
  getAvailablePurchasePoints,
  getSpentPurchasePoints,
  getRemainingPurchasePoints,
  canPurchaseProficiency,
} from '@/constants/proficiencyPurchases';
import type {
  PurchasableProficiency,
  ProficiencyPurchaseRecord,
} from '@/constants/proficiencyPurchases';
import type { AttributeName } from '@/types/attributes';

// ─── Helper ─────────────────────────────────────────────────

const defaultAttributes: Record<AttributeName, number> = {
  agilidade: 3,
  corpo: 2,
  influencia: 1,
  mente: 2,
  essencia: 1,
  instinto: 1,
};

function makePurchase(
  partial: Partial<ProficiencyPurchaseRecord>
): ProficiencyPurchaseRecord {
  return {
    id: 'purchase-1',
    proficiencyId: 'one-weapon-marcial',
    name: '1 Arma Marcial',
    paidWithAttribute: 'agilidade',
    cost: 1,
    refunded: false,
    ...partial,
  };
}

// ─── PURCHASABLE_PROFICIENCIES ──────────────────────────────

describe('PURCHASABLE_PROFICIENCIES', () => {
  it('should have 16 purchasable proficiencies', () => {
    expect(PURCHASABLE_PROFICIENCIES).toHaveLength(16);
  });

  it('should have unique IDs', () => {
    const ids = PURCHASABLE_PROFICIENCIES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have at least one cost option per proficiency', () => {
    for (const prof of PURCHASABLE_PROFICIENCIES) {
      expect(Object.keys(prof.costOptions).length).toBeGreaterThan(0);
    }
  });

  it('should cover all categories', () => {
    const categories = new Set(
      PURCHASABLE_PROFICIENCIES.map((p) => p.category)
    );
    expect(categories).toContain('weapon');
    expect(categories).toContain('armor');
    expect(categories).toContain('skill');
    expect(categories).toContain('language');
    expect(categories).toContain('tool');
  });

  it('should have all cost options as positive numbers', () => {
    for (const prof of PURCHASABLE_PROFICIENCIES) {
      for (const cost of Object.values(prof.costOptions)) {
        expect(cost).toBeGreaterThan(0);
      }
    }
  });

  it('group purchases should cost more than individual for same weapon class', () => {
    const findById = (id: string) =>
      PURCHASABLE_PROFICIENCIES.find((p) => p.id === id)!;

    // Marcial: individual costs 1, group costs 3
    const singleMarcial = findById('one-weapon-marcial');
    const allMarcial = findById('all-weapons-marcial');
    expect(allMarcial.isGroupPurchase).toBe(true);
    expect(singleMarcial.isGroupPurchase).toBe(false);
    // Every cost option in group should be >= the corresponding single option
    for (const attr of Object.keys(allMarcial.costOptions) as AttributeName[]) {
      expect(allMarcial.costOptions[attr]!).toBeGreaterThan(
        singleMarcial.costOptions[attr]!
      );
    }
  });
});

describe('PROFICIENCY_PURCHASE_CATEGORY_LABELS', () => {
  it('should have labels for all categories', () => {
    expect(PROFICIENCY_PURCHASE_CATEGORY_LABELS.weapon).toBe('Armas');
    expect(PROFICIENCY_PURCHASE_CATEGORY_LABELS.armor).toBe('Armaduras');
    expect(PROFICIENCY_PURCHASE_CATEGORY_LABELS.skill).toBe('Habilidades');
    expect(PROFICIENCY_PURCHASE_CATEGORY_LABELS.language).toBe('Idiomas');
    expect(PROFICIENCY_PURCHASE_CATEGORY_LABELS.tool).toBe('Instrumentos');
  });
});

// ─── getAvailablePurchasePoints ─────────────────────────────

describe('getAvailablePurchasePoints', () => {
  it('should return attribute values as available points', () => {
    const points = getAvailablePurchasePoints(defaultAttributes);
    expect(points.agilidade).toBe(3);
    expect(points.corpo).toBe(2);
    expect(points.influencia).toBe(1);
    expect(points.mente).toBe(2);
    expect(points.essencia).toBe(1);
    expect(points.instinto).toBe(1);
  });

  it('should return a copy (not the same reference)', () => {
    const points = getAvailablePurchasePoints(defaultAttributes);
    expect(points).not.toBe(defaultAttributes);
    expect(points).toEqual(defaultAttributes);
  });

  it('should handle zero attributes', () => {
    const zeroAttrs: Record<AttributeName, number> = {
      agilidade: 0,
      corpo: 0,
      influencia: 0,
      mente: 0,
      essencia: 0,
      instinto: 0,
    };
    const points = getAvailablePurchasePoints(zeroAttrs);
    expect(points.agilidade).toBe(0);
    expect(points.corpo).toBe(0);
  });
});

// ─── getSpentPurchasePoints ─────────────────────────────────

describe('getSpentPurchasePoints', () => {
  it('should return empty object for no purchases', () => {
    const spent = getSpentPurchasePoints([]);
    expect(Object.keys(spent)).toHaveLength(0);
  });

  it('should sum costs per attribute', () => {
    const purchases: ProficiencyPurchaseRecord[] = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 1 }),
      makePurchase({ id: '2', paidWithAttribute: 'agilidade', cost: 2 }),
      makePurchase({ id: '3', paidWithAttribute: 'corpo', cost: 3 }),
    ];
    const spent = getSpentPurchasePoints(purchases);
    expect(spent.agilidade).toBe(3); // 1 + 2
    expect(spent.corpo).toBe(3);
  });

  it('should skip refunded purchases', () => {
    const purchases: ProficiencyPurchaseRecord[] = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 2 }),
      makePurchase({
        id: '2',
        paidWithAttribute: 'agilidade',
        cost: 1,
        refunded: true,
      }),
    ];
    const spent = getSpentPurchasePoints(purchases);
    expect(spent.agilidade).toBe(2); // Only the non-refunded one
  });

  it('should handle all attributes', () => {
    const purchases: ProficiencyPurchaseRecord[] = [
      makePurchase({ id: '1', paidWithAttribute: 'mente', cost: 1 }),
      makePurchase({ id: '2', paidWithAttribute: 'essencia', cost: 1 }),
      makePurchase({ id: '3', paidWithAttribute: 'instinto', cost: 1 }),
    ];
    const spent = getSpentPurchasePoints(purchases);
    expect(spent.mente).toBe(1);
    expect(spent.essencia).toBe(1);
    expect(spent.instinto).toBe(1);
    expect(spent.agilidade).toBeUndefined();
  });
});

// ─── getRemainingPurchasePoints ─────────────────────────────

describe('getRemainingPurchasePoints', () => {
  it('should return full attributes when no purchases', () => {
    const remaining = getRemainingPurchasePoints(defaultAttributes, []);
    expect(remaining).toEqual(defaultAttributes);
  });

  it('should subtract spent points', () => {
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 2 }),
    ];
    const remaining = getRemainingPurchasePoints(defaultAttributes, purchases);
    expect(remaining.agilidade).toBe(1); // 3 - 2
    expect(remaining.corpo).toBe(2); // unchanged
  });

  it('should floor at 0 (never negative)', () => {
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'influencia', cost: 5 }),
    ];
    const remaining = getRemainingPurchasePoints(defaultAttributes, purchases);
    // influencia = 1, spent 5 → max(0, 1-5) = 0
    expect(remaining.influencia).toBe(0);
  });

  it('should ignore refunded purchases', () => {
    const purchases = [
      makePurchase({
        id: '1',
        paidWithAttribute: 'corpo',
        cost: 2,
        refunded: true,
      }),
    ];
    const remaining = getRemainingPurchasePoints(defaultAttributes, purchases);
    expect(remaining.corpo).toBe(2); // no deduction
  });

  it('should handle retroactive attribute increase', () => {
    // If attributes increase, remaining points increase too
    const highAttrs = { ...defaultAttributes, agilidade: 5 };
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 2 }),
    ];
    const remaining = getRemainingPurchasePoints(highAttrs, purchases);
    expect(remaining.agilidade).toBe(3); // 5 - 2
  });
});

// ─── canPurchaseProficiency ─────────────────────────────────

describe('canPurchaseProficiency', () => {
  const singleMarcial = PURCHASABLE_PROFICIENCIES.find(
    (p) => p.id === 'one-weapon-marcial'
  )!;
  const allMarcial = PURCHASABLE_PROFICIENCIES.find(
    (p) => p.id === 'all-weapons-marcial'
  )!;
  const heavyArmor = PURCHASABLE_PROFICIENCIES.find(
    (p) => p.id === 'one-armor-pesada'
  )!;

  it('should return true when enough points are available', () => {
    // single marcial: costs 1 agilidade, we have 3
    expect(
      canPurchaseProficiency(singleMarcial, 'agilidade', defaultAttributes, [])
    ).toBe(true);
  });

  it('should return false when not enough points', () => {
    const lowAttrs = { ...defaultAttributes, agilidade: 0 };
    expect(
      canPurchaseProficiency(singleMarcial, 'agilidade', lowAttrs, [])
    ).toBe(false);
  });

  it('should return false for invalid attribute (no cost option)', () => {
    // heavy armor only has corpo cost option
    expect(
      canPurchaseProficiency(heavyArmor, 'agilidade', defaultAttributes, [])
    ).toBe(false);
  });

  it('should account for existing purchases', () => {
    // agilidade = 3, spent 3 → remaining 0
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 3 }),
    ];
    expect(
      canPurchaseProficiency(
        singleMarcial,
        'agilidade',
        defaultAttributes,
        purchases
      )
    ).toBe(false);
  });

  it('should allow purchase when remaining is exactly enough', () => {
    // agilidade = 3, spent 2 → remaining 1, cost = 1
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 2 }),
    ];
    expect(
      canPurchaseProficiency(
        singleMarcial,
        'agilidade',
        defaultAttributes,
        purchases
      )
    ).toBe(true);
  });

  it('should reject group purchase when insufficient points', () => {
    // all marcial: costs 3 agilidade, we have 3 → enough
    expect(
      canPurchaseProficiency(allMarcial, 'agilidade', defaultAttributes, [])
    ).toBe(true);

    // Now spend 1 → remaining 2, cost = 3 → not enough
    const purchases = [
      makePurchase({ id: '1', paidWithAttribute: 'agilidade', cost: 1 }),
    ];
    expect(
      canPurchaseProficiency(
        allMarcial,
        'agilidade',
        defaultAttributes,
        purchases
      )
    ).toBe(false);
  });

  it('should handle corpo cost option for heavy armor', () => {
    // one-armor-pesada costs corpo: 3, we have corpo: 2 → not enough
    expect(
      canPurchaseProficiency(heavyArmor, 'corpo', defaultAttributes, [])
    ).toBe(false);

    // With corpo: 3 → enough
    const highCorpo = { ...defaultAttributes, corpo: 3 };
    expect(canPurchaseProficiency(heavyArmor, 'corpo', highCorpo, [])).toBe(
      true
    );
  });
});
