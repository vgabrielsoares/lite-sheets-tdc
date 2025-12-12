/**
 * Currency Constants - Constantes do sistema de moedas
 *
 * Este arquivo contém as constantes relacionadas ao sistema de moedas
 * do Tabuleiro do Caos RPG.
 *
 * Taxas de conversão:
 * - 100 C$ = 1 PO$
 * - 1.000 PO$ = 1 PP$
 * - 100.000 C$ = 1 PP$
 */

import type { CurrencyType, CurrencyDenomination } from '@/types/currency';

/**
 * Símbolos das moedas para exibição
 */
export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  cobre: 'C$',
  ouro: 'PO$',
  platina: 'PP$',
} as const;

/**
 * Nomes completos das moedas
 */
export const CURRENCY_NAMES: Record<CurrencyType, string> = {
  cobre: 'Chama de Cobre',
  ouro: 'Pepita de Ouro',
  platina: 'Estrela de Platina',
} as const;

/**
 * Nomes no plural das moedas
 */
export const CURRENCY_NAMES_PLURAL: Record<CurrencyType, string> = {
  cobre: 'Chamas de Cobre',
  ouro: 'Pepitas de Ouro',
  platina: 'Estrelas de Platina',
} as const;

/**
 * Valor de cada moeda em Cobre (unidade base)
 *
 * - 1 Cobre = 1 Cobre
 * - 1 Ouro = 100 Cobre
 * - 1 Platina = 100.000 Cobre (1.000 Ouro)
 */
export const CURRENCY_VALUE_IN_COPPER: Record<CurrencyType, number> = {
  cobre: 1,
  ouro: 100,
  platina: 100_000,
} as const;

/**
 * Taxas de conversão direta entre moedas
 *
 * Para converter de A para B: quantidade * CONVERSION_RATES[A][B]
 *
 * Exemplo: 500 cobre → ouro = 500 / 100 = 5 ouro
 */
export const CURRENCY_CONVERSION_RATES: Record<
  CurrencyType,
  Record<CurrencyType, number>
> = {
  cobre: {
    cobre: 1,
    ouro: 0.01, // 1 cobre = 0.01 ouro
    platina: 0.00001, // 1 cobre = 0.00001 platina
  },
  ouro: {
    cobre: 100, // 1 ouro = 100 cobre
    ouro: 1,
    platina: 0.001, // 1 ouro = 0.001 platina
  },
  platina: {
    cobre: 100_000, // 1 platina = 100.000 cobre
    ouro: 1_000, // 1 platina = 1.000 ouro
    platina: 1,
  },
} as const;

/**
 * Quantidade de moedas menores equivalentes a 1 moeda maior
 *
 * - 100 cobre = 1 ouro
 * - 1000 ouro = 1 platina
 */
export const CURRENCY_EXCHANGE_RATES = {
  cobreParaOuro: 100,
  ouroParaPlatina: 1_000,
  cobreParaPlatina: 100_000,
} as const;

/**
 * Número de moedas físicas que equivalem a 1 de peso
 */
export const COINS_PER_WEIGHT_UNIT = 100;

/**
 * Dinheiro inicial do personagem (em ouro no banco)
 */
export const STARTING_GOLD = 10;

/**
 * Ordem de exibição das moedas (da mais valiosa para menos)
 */
export const CURRENCY_DISPLAY_ORDER: CurrencyType[] = [
  'platina',
  'ouro',
  'cobre',
];

/**
 * Ordem de processamento das moedas (da menos valiosa para mais)
 */
export const CURRENCY_PROCESSING_ORDER: CurrencyType[] = [
  'cobre',
  'ouro',
  'platina',
];

/**
 * Cores semânticas para cada tipo de moeda (Material UI palette keys)
 */
export const CURRENCY_COLORS: Record<
  CurrencyType,
  'warning' | 'info' | 'secondary'
> = {
  cobre: 'warning', // Cobre/Laranja
  ouro: 'info', // Dourado/Amarelo (usando info que é azul, mas podemos usar custom)
  platina: 'secondary', // Platina/Cinza prateado
} as const;

/**
 * Ícones para cada tipo de moeda (nomes de Material Icons)
 */
export const CURRENCY_ICONS: Record<CurrencyType, string> = {
  cobre: 'LocalFireDepartment', // Chama
  ouro: 'Circle', // Pepita/Moeda
  platina: 'Star', // Estrela
} as const;

/**
 * Valores mínimo e máximo para moedas
 */
export const CURRENCY_LIMITS = {
  min: 0,
  max: 999_999_999, // Limite prático para evitar overflow
} as const;

/**
 * Denominação inicial padrão (zerada)
 */
export const EMPTY_CURRENCY_DENOMINATION: CurrencyDenomination = {
  cobre: 0,
  ouro: 0,
  platina: 0,
} as const;
