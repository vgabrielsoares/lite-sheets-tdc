/**
 * Testes para constants/inventory.ts
 *
 * Testes unitários para constantes de categorias de itens do inventário.
 * Verifica a integridade e consistência das 20 categorias (v0.0.2).
 */

import {
  ITEM_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DEFAULT_ITEM_CATEGORY,
} from '../inventory';
import type { ItemCategory } from '@/types/inventory';

/**
 * Lista completa das 20 categorias de itens (v0.0.2)
 */
const ALL_ITEM_CATEGORIES: ItemCategory[] = [
  'aventura',
  'comida-bebida',
  'feiticaria',
  'ferramentas',
  'fontes-de-luz',
  'herbalismo',
  'instrumentos-musicais',
  'municoes',
  'produtos-alquimicos',
  'recipientes',
  'utilitarios',
  'venenos',
  'vestimentos',
  'riquezas',
  'armas',
  'protecoes',
  'veiculos-montaria',
  'materiais',
  'itens-magicos',
  'miscelanea',
];

// ============================================================================
// ITEM_CATEGORIES
// ============================================================================

describe('ITEM_CATEGORIES', () => {
  it('should have exactly 20 entries', () => {
    expect(ITEM_CATEGORIES).toHaveLength(20);
  });

  it('should contain all expected category values', () => {
    const values = ITEM_CATEGORIES.map((c) => c.value);
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(values).toContain(category);
    }
  });

  it('should have no duplicate values', () => {
    const values = ITEM_CATEGORIES.map((c) => c.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('should have non-empty value for each entry', () => {
    for (const category of ITEM_CATEGORIES) {
      expect(category.value).toBeTruthy();
      expect(typeof category.value).toBe('string');
      expect(category.value.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty label for each entry', () => {
    for (const category of ITEM_CATEGORIES) {
      expect(category.label).toBeTruthy();
      expect(typeof category.label).toBe('string');
      expect(category.label.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty color for each entry', () => {
    for (const category of ITEM_CATEGORIES) {
      expect(category.color).toBeTruthy();
      expect(typeof category.color).toBe('string');
      expect(category.color.length).toBeGreaterThan(0);
    }
  });

  it('should have valid MUI color values', () => {
    const validColors = [
      'default',
      'primary',
      'secondary',
      'success',
      'error',
      'warning',
      'info',
    ];
    for (const category of ITEM_CATEGORIES) {
      expect(validColors).toContain(category.color);
    }
  });

  it('should have no duplicate labels', () => {
    const labels = ITEM_CATEGORIES.map((c) => c.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});

// ============================================================================
// CATEGORY_LABELS
// ============================================================================

describe('CATEGORY_LABELS', () => {
  it('should have entries for all ItemCategory values', () => {
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(CATEGORY_LABELS).toHaveProperty(category);
      expect(typeof CATEGORY_LABELS[category]).toBe('string');
    }
  });

  it('should have non-empty labels for all categories', () => {
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
    }
  });

  it('should be consistent with ITEM_CATEGORIES', () => {
    for (const item of ITEM_CATEGORIES) {
      expect(CATEGORY_LABELS[item.value]).toBe(item.label);
    }
  });

  it('should have exactly 20 entries', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(20);
  });
});

// ============================================================================
// CATEGORY_COLORS
// ============================================================================

describe('CATEGORY_COLORS', () => {
  it('should have entries for all ItemCategory values', () => {
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(CATEGORY_COLORS).toHaveProperty(category);
      expect(typeof CATEGORY_COLORS[category]).toBe('string');
    }
  });

  it('should have non-empty colors for all categories', () => {
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(CATEGORY_COLORS[category].length).toBeGreaterThan(0);
    }
  });

  it('should be consistent with ITEM_CATEGORIES', () => {
    for (const item of ITEM_CATEGORIES) {
      expect(CATEGORY_COLORS[item.value]).toBe(item.color);
    }
  });

  it('should have exactly 20 entries', () => {
    expect(Object.keys(CATEGORY_COLORS)).toHaveLength(20);
  });

  it('should only contain valid MUI color strings', () => {
    const validColors = [
      'default',
      'primary',
      'secondary',
      'success',
      'error',
      'warning',
      'info',
    ];
    for (const category of ALL_ITEM_CATEGORIES) {
      expect(validColors).toContain(CATEGORY_COLORS[category]);
    }
  });
});

// ============================================================================
// DEFAULT_ITEM_CATEGORY
// ============================================================================

describe('DEFAULT_ITEM_CATEGORY', () => {
  it('should be miscelanea', () => {
    expect(DEFAULT_ITEM_CATEGORY).toBe('miscelanea');
  });

  it('should be a valid ItemCategory value', () => {
    const values = ITEM_CATEGORIES.map((c) => c.value);
    expect(values).toContain(DEFAULT_ITEM_CATEGORY);
  });

  it('should exist in CATEGORY_LABELS', () => {
    expect(CATEGORY_LABELS).toHaveProperty(DEFAULT_ITEM_CATEGORY);
  });

  it('should exist in CATEGORY_COLORS', () => {
    expect(CATEGORY_COLORS).toHaveProperty(DEFAULT_ITEM_CATEGORY);
  });
});
