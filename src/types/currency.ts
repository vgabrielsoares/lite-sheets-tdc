/**
 * Currency Types - Tipos relacionados ao sistema de moedas
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de moedas
 * do Tabuleiro do Caos RPG, incluindo moedas físicas, banco e conversões.
 *
 * Sistema de moedas:
 * - C$ (Chama de Cobre) - moeda base
 * - PO$ (Pepita de Ouro) - 100 C$
 * - PP$ (Estrela de Platina) - 100.000 C$ (1.000 PO$)
 *
 * Regras de peso:
 * - Cada 100 moedas físicas = 1 de peso
 * - Moedas no banco não contam para peso
 */

/**
 * Tipos de moeda do sistema
 */
export type CurrencyType = 'cobre' | 'ouro' | 'platina';

/**
 * Denominações de moeda (quantidade de cada tipo)
 */
export interface CurrencyDenomination {
  /** Chamas de Cobre (C$) */
  cobre: number;
  /** Pepitas de Ouro (PO$) */
  ouro: number;
  /** Estrelas de Platina (PP$) */
  platina: number;
}

/**
 * Moedas do personagem divididas entre físico e banco
 */
export interface Currency {
  /** Moedas físicas (contam para peso) */
  physical: CurrencyDenomination;
  /** Moedas no banco (não contam para peso) */
  bank: CurrencyDenomination;
}

/**
 * Riqueza total calculada em cada denominação
 */
export interface TotalWealth {
  /** Total em Chamas de Cobre (C$) */
  totalCobre: number;
  /** Total em Pepitas de Ouro (PO$) */
  totalOuro: number;
  /** Total em Estrelas de Platina (PP$) */
  totalPlatina: number;
}

/**
 * Resultado de uma conversão de moedas
 */
export interface CurrencyConversionResult {
  /** Tipo de moeda de origem */
  from: CurrencyType;
  /** Tipo de moeda de destino */
  to: CurrencyType;
  /** Quantidade original */
  originalAmount: number;
  /** Quantidade convertida (resultado) */
  convertedAmount: number;
  /** Resto não convertível (quando aplicável) */
  remainder: number;
}

/**
 * Dados do peso das moedas físicas
 */
export interface CoinWeight {
  /** Total de moedas físicas */
  totalCoins: number;
  /** Peso em unidades de carga (1 por cada 100 moedas) */
  weight: number;
}

/**
 * Resumo completo das riquezas do personagem
 */
export interface WealthSummary {
  /** Moedas físicas */
  physical: CurrencyDenomination;
  /** Moedas no banco */
  bank: CurrencyDenomination;
  /** Total em cada denominação (físico + banco) */
  totals: TotalWealth;
  /** Peso das moedas físicas */
  coinWeight: CoinWeight;
}

/**
 * Estado de localização das moedas
 */
export type CurrencyLocation = 'physical' | 'bank';

/**
 * Operação de transferência entre físico e banco
 */
export interface CurrencyTransfer {
  /** Direção da transferência */
  from: CurrencyLocation;
  to: CurrencyLocation;
  /** Tipo de moeda */
  currencyType: CurrencyType;
  /** Quantidade a transferir */
  amount: number;
}

/**
 * Valores padrão iniciais de moedas
 */
export const DEFAULT_CURRENCY: Currency = {
  physical: {
    cobre: 0,
    ouro: 0,
    platina: 0,
  },
  bank: {
    cobre: 0,
    ouro: 10, // 10 PO$ inicial conforme regras
    platina: 0,
  },
};

/**
 * Denominação vazia (zero em todas as moedas)
 */
export const EMPTY_DENOMINATION: CurrencyDenomination = {
  cobre: 0,
  ouro: 0,
  platina: 0,
};
