/**
 * Inventory Constants - Constantes centralizadas para categorias de itens
 *
 * 20 categorias de itens conforme v0.0.2 do livro de regras.
 */

import type { ItemCategory } from '@/types/inventory';

/**
 * Definição de uma categoria de item com label, cor e ícone
 */
export interface ItemCategoryDefinition {
  /** Valor da categoria (usado no código) */
  value: ItemCategory;
  /** Label em português para exibição */
  label: string;
  /** Cor semântica para Chips/badges */
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
}

/**
 * Todas as 20 categorias de itens (v0.0.2)
 *
 * Ordenadas alfabeticamente pelo label para UI.
 */
export const ITEM_CATEGORIES: readonly ItemCategoryDefinition[] = [
  { value: 'armas', label: 'Armas', color: 'error' },
  {
    value: 'aventura',
    label: 'Aventura, Exploração e Viagem',
    color: 'success',
  },
  { value: 'comida-bebida', label: 'Comida e Bebida', color: 'success' },
  { value: 'feiticaria', label: 'Feitiçaria', color: 'secondary' },
  { value: 'ferramentas', label: 'Ferramentas', color: 'info' },
  { value: 'fontes-de-luz', label: 'Fontes de Luz', color: 'warning' },
  { value: 'herbalismo', label: 'Herbalismo', color: 'success' },
  {
    value: 'instrumentos-musicais',
    label: 'Instrumentos Musicais',
    color: 'info',
  },
  { value: 'itens-magicos', label: 'Itens Mágicos', color: 'secondary' },
  { value: 'materiais', label: 'Materiais', color: 'default' },
  { value: 'miscelanea', label: 'Miscelânea', color: 'default' },
  { value: 'municoes', label: 'Munições', color: 'error' },
  {
    value: 'produtos-alquimicos',
    label: 'Produtos Alquímicos',
    color: 'warning',
  },
  { value: 'protecoes', label: 'Proteções', color: 'primary' },
  { value: 'recipientes', label: 'Recipientes', color: 'default' },
  { value: 'riquezas', label: 'Riquezas', color: 'warning' },
  { value: 'utilitarios', label: 'Utilitários', color: 'info' },
  { value: 'veiculos-montaria', label: 'Veículos e Montaria', color: 'info' },
  { value: 'venenos', label: 'Venenos', color: 'error' },
  { value: 'vestimentos', label: 'Vestimentos', color: 'default' },
] as const;

/**
 * Mapa de categoria → label (lookup rápido)
 */
export const CATEGORY_LABELS: Record<ItemCategory, string> = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ItemCategory, string>;

/**
 * Mapa de categoria → cor semântica (lookup rápido)
 */
export const CATEGORY_COLORS: Record<
  ItemCategory,
  'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
> = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.value, c.color])
) as Record<
  ItemCategory,
  'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
>;

/**
 * Categoria padrão para novos itens
 */
export const DEFAULT_ITEM_CATEGORY: ItemCategory = 'miscelanea';
