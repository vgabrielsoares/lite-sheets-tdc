/**
 * Currency Calculations - Funções utilitárias para cálculos de moedas
 *
 * Este arquivo contém funções puras para realizar cálculos relacionados
 * ao sistema de moedas do Tabuleiro do Caos RPG.
 *
 * Regras importantes:
 * - Arredondamento sempre para baixo (regra geral do sistema)
 * - 100 C$ = 1 PO$
 * - 1.000 PO$ = 1 PP$
 * - 100 moedas físicas = 1 peso
 */

import type {
  Currency,
  CurrencyType,
  CurrencyDenomination,
  TotalWealth,
  CurrencyConversionResult,
  CoinWeight,
  WealthSummary,
} from '@/types/currency';

import {
  CURRENCY_VALUE_IN_COPPER,
  COINS_PER_WEIGHT_UNIT,
  CURRENCY_EXCHANGE_RATES,
  EMPTY_CURRENCY_DENOMINATION,
} from '@/constants/currency';

// ============================================================================
// Conversão para Unidade Base (Cobre)
// ============================================================================

/**
 * Converte uma denominação de moedas para valor total em cobre
 *
 * @param denomination - Denominação com quantidades de cada moeda
 * @returns Valor total em cobre
 *
 * @example
 * convertToCopper({ cobre: 50, ouro: 2, platina: 0 }) // 250 (50 + 200)
 */
export function convertToCopper(denomination: CurrencyDenomination): number {
  return (
    denomination.cobre * CURRENCY_VALUE_IN_COPPER.cobre +
    denomination.ouro * CURRENCY_VALUE_IN_COPPER.ouro +
    denomination.platina * CURRENCY_VALUE_IN_COPPER.platina
  );
}

/**
 * Converte um valor em cobre para uma denominação otimizada
 * (usando a maior quantidade possível de moedas de maior valor)
 *
 * @param copperAmount - Quantidade em cobre
 * @returns Denominação otimizada
 *
 * @example
 * copperToDenomination(100150) // { cobre: 50, ouro: 1, platina: 1 }
 */
export function copperToDenomination(
  copperAmount: number
): CurrencyDenomination {
  if (copperAmount <= 0) {
    return { ...EMPTY_CURRENCY_DENOMINATION };
  }

  let remaining = Math.floor(copperAmount);

  const platina = Math.floor(remaining / CURRENCY_VALUE_IN_COPPER.platina);
  remaining = remaining % CURRENCY_VALUE_IN_COPPER.platina;

  const ouro = Math.floor(remaining / CURRENCY_VALUE_IN_COPPER.ouro);
  remaining = remaining % CURRENCY_VALUE_IN_COPPER.ouro;

  const cobre = remaining;

  return { cobre, ouro, platina };
}

// ============================================================================
// Cálculos de Riqueza Total
// ============================================================================

/**
 * Calcula o total de riquezas (físico + banco) em cada denominação
 *
 * @param currency - Moedas do personagem
 * @returns Total em cada denominação
 *
 * @example
 * calculateTotalWealth({
 *   physical: { cobre: 50, ouro: 5, platina: 0 },
 *   bank: { cobre: 100, ouro: 10, platina: 1 }
 * })
 * // { totalCobre: 100650, totalOuro: 1006.5, totalPlatina: 1.00650 }
 */
export function calculateTotalWealth(currency: Currency): TotalWealth {
  const physicalCopper = convertToCopper(currency.physical);
  const bankCopper = convertToCopper(currency.bank);
  const totalCopper = physicalCopper + bankCopper;

  return {
    totalCobre: totalCopper,
    totalOuro: totalCopper / CURRENCY_VALUE_IN_COPPER.ouro,
    totalPlatina: totalCopper / CURRENCY_VALUE_IN_COPPER.platina,
  };
}

/**
 * Soma duas denominações de moedas
 *
 * @param a - Primeira denominação
 * @param b - Segunda denominação
 * @returns Soma das denominações
 */
export function addDenominations(
  a: CurrencyDenomination,
  b: CurrencyDenomination
): CurrencyDenomination {
  return {
    cobre: a.cobre + b.cobre,
    ouro: a.ouro + b.ouro,
    platina: a.platina + b.platina,
  };
}

/**
 * Subtrai uma denominação de outra (a - b)
 * Retorna 0 para valores negativos
 *
 * @param a - Denominação base
 * @param b - Denominação a subtrair
 * @returns Resultado da subtração (mínimo 0 para cada moeda)
 */
export function subtractDenominations(
  a: CurrencyDenomination,
  b: CurrencyDenomination
): CurrencyDenomination {
  return {
    cobre: Math.max(0, a.cobre - b.cobre),
    ouro: Math.max(0, a.ouro - b.ouro),
    platina: Math.max(0, a.platina - b.platina),
  };
}

// ============================================================================
// Conversão Entre Moedas
// ============================================================================

/**
 * Converte uma quantidade de moedas de um tipo para outro
 *
 * @param amount - Quantidade a converter
 * @param from - Tipo de moeda de origem
 * @param to - Tipo de moeda de destino
 * @returns Resultado da conversão com resto
 *
 * @example
 * convertCurrency(250, 'cobre', 'ouro')
 * // { from: 'cobre', to: 'ouro', originalAmount: 250, convertedAmount: 2, remainder: 50 }
 */
export function convertCurrency(
  amount: number,
  from: CurrencyType,
  to: CurrencyType
): CurrencyConversionResult {
  if (amount <= 0) {
    return {
      from,
      to,
      originalAmount: amount,
      convertedAmount: 0,
      remainder: 0,
    };
  }

  // Converter para cobre primeiro
  const valueInCopper = Math.floor(amount) * CURRENCY_VALUE_IN_COPPER[from];

  // Converter para moeda destino
  const targetValue = CURRENCY_VALUE_IN_COPPER[to];
  const convertedAmount = Math.floor(valueInCopper / targetValue);
  const remainderInCopper = valueInCopper % targetValue;

  // Converter o resto de volta para moeda origem
  const remainder = Math.floor(
    remainderInCopper / CURRENCY_VALUE_IN_COPPER[from]
  );

  return {
    from,
    to,
    originalAmount: Math.floor(amount),
    convertedAmount,
    remainder,
  };
}

/**
 * Troca (exchange) uma quantidade de moedas de um tipo para outro,
 * retornando a denominação atualizada
 *
 * @param denomination - Denominação atual
 * @param amount - Quantidade a trocar
 * @param from - Moeda de origem
 * @param to - Moeda de destino
 * @returns Nova denominação após a troca, ou null se não houver moedas suficientes
 */
export function exchangeCurrency(
  denomination: CurrencyDenomination,
  amount: number,
  from: CurrencyType,
  to: CurrencyType
): CurrencyDenomination | null {
  if (amount <= 0) return { ...denomination };

  // Verificar se há moedas suficientes
  if (denomination[from] < amount) {
    return null;
  }

  const conversion = convertCurrency(amount, from, to);

  const newDenomination = { ...denomination };
  newDenomination[from] -= amount;
  newDenomination[to] += conversion.convertedAmount;
  newDenomination[from] += conversion.remainder; // Adiciona o resto de volta

  return newDenomination;
}

// ============================================================================
// Cálculos de Peso de Moedas
// ============================================================================

/**
 * Calcula o peso das moedas físicas
 *
 * Regra: 100 moedas físicas = 1 peso
 *
 * @param physical - Denominação de moedas físicas
 * @returns Dados de peso das moedas
 *
 * @example
 * calculateCoinWeight({ cobre: 150, ouro: 30, platina: 5 })
 * // { totalCoins: 185, weight: 1 }
 */
export function calculateCoinWeight(
  physical: CurrencyDenomination
): CoinWeight {
  const totalCoins = physical.cobre + physical.ouro + physical.platina;
  const weight = Math.floor(totalCoins / COINS_PER_WEIGHT_UNIT);

  return {
    totalCoins,
    weight,
  };
}

// ============================================================================
// Resumo Completo de Riquezas
// ============================================================================

/**
 * Gera um resumo completo das riquezas do personagem
 *
 * @param currency - Moedas do personagem
 * @returns Resumo completo incluindo totais e peso
 */
export function calculateWealthSummary(currency: Currency): WealthSummary {
  return {
    physical: { ...currency.physical },
    bank: { ...currency.bank },
    totals: calculateTotalWealth(currency),
    coinWeight: calculateCoinWeight(currency.physical),
  };
}

// ============================================================================
// Formatação e Exibição
// ============================================================================

/**
 * Formata um valor de moeda para exibição com o símbolo correto
 *
 * @param amount - Quantidade
 * @param type - Tipo de moeda
 * @returns String formatada (ex: "150 C$", "10 PO$")
 */
export function formatCurrency(amount: number, type: CurrencyType): string {
  const symbols: Record<CurrencyType, string> = {
    cobre: 'C$',
    ouro: 'PO$',
    platina: 'PP$',
  };

  return `${Math.floor(amount)} ${symbols[type]}`;
}

/**
 * Formata uma denominação completa para exibição
 *
 * @param denomination - Denominação a formatar
 * @param includeZeros - Se deve incluir moedas com valor 0
 * @returns String formatada (ex: "5 PP$, 10 PO$, 25 C$")
 */
export function formatDenomination(
  denomination: CurrencyDenomination,
  includeZeros = false
): string {
  const parts: string[] = [];

  if (denomination.platina > 0 || includeZeros) {
    parts.push(formatCurrency(denomination.platina, 'platina'));
  }
  if (denomination.ouro > 0 || includeZeros) {
    parts.push(formatCurrency(denomination.ouro, 'ouro'));
  }
  if (denomination.cobre > 0 || includeZeros) {
    parts.push(formatCurrency(denomination.cobre, 'cobre'));
  }

  if (parts.length === 0) {
    return '0 C$';
  }

  return parts.join(', ');
}

/**
 * Formata o total de riquezas em uma moeda específica (com casas decimais)
 *
 * @param total - Total em cobre
 * @param displayAs - Moeda para exibição
 * @param decimals - Número de casas decimais (padrão 2)
 * @returns String formatada
 */
export function formatTotalAs(
  total: number,
  displayAs: CurrencyType,
  decimals = 2
): string {
  const value = total / CURRENCY_VALUE_IN_COPPER[displayAs];
  const symbols: Record<CurrencyType, string> = {
    cobre: 'C$',
    ouro: 'PO$',
    platina: 'PP$',
  };

  return `${value.toFixed(decimals)} ${symbols[displayAs]}`;
}

// ============================================================================
// Validações
// ============================================================================

/**
 * Verifica se uma denominação tem moedas suficientes para uma transação
 *
 * @param denomination - Denominação atual
 * @param costInCopper - Custo em cobre
 * @returns true se pode pagar, false caso contrário
 */
export function canAfford(
  denomination: CurrencyDenomination,
  costInCopper: number
): boolean {
  const totalCopper = convertToCopper(denomination);
  return totalCopper >= costInCopper;
}

/**
 * Verifica se uma denominação é válida (sem valores negativos)
 *
 * @param denomination - Denominação a validar
 * @returns true se válida, false caso contrário
 */
export function isValidDenomination(
  denomination: CurrencyDenomination
): boolean {
  return (
    denomination.cobre >= 0 &&
    denomination.ouro >= 0 &&
    denomination.platina >= 0 &&
    Number.isFinite(denomination.cobre) &&
    Number.isFinite(denomination.ouro) &&
    Number.isFinite(denomination.platina)
  );
}

/**
 * Verifica se uma moeda é do tipo correto
 *
 * @param type - Tipo a verificar
 * @returns true se é um tipo válido
 */
export function isValidCurrencyType(type: string): type is CurrencyType {
  return type === 'cobre' || type === 'ouro' || type === 'platina';
}

// ============================================================================
// Transações
// ============================================================================

/**
 * Realiza um pagamento, deduzindo o custo de uma denominação
 * Usa moedas de menor valor primeiro quando necessário
 *
 * @param denomination - Denominação atual
 * @param costInCopper - Custo em cobre
 * @returns Nova denominação após pagamento, ou null se fundos insuficientes
 */
export function makePayment(
  denomination: CurrencyDenomination,
  costInCopper: number
): CurrencyDenomination | null {
  if (!canAfford(denomination, costInCopper)) {
    return null;
  }

  const totalCopper = convertToCopper(denomination);
  const remainingCopper = totalCopper - costInCopper;

  return copperToDenomination(remainingCopper);
}

/**
 * Adiciona moedas a uma denominação
 *
 * @param denomination - Denominação atual
 * @param amount - Quantidade a adicionar
 * @param type - Tipo de moeda
 * @returns Nova denominação com moedas adicionadas
 */
export function addCurrency(
  denomination: CurrencyDenomination,
  amount: number,
  type: CurrencyType
): CurrencyDenomination {
  if (amount <= 0) return { ...denomination };

  return {
    ...denomination,
    [type]: denomination[type] + Math.floor(amount),
  };
}

/**
 * Remove moedas de uma denominação
 *
 * @param denomination - Denominação atual
 * @param amount - Quantidade a remover
 * @param type - Tipo de moeda
 * @returns Nova denominação, ou null se quantidade insuficiente
 */
export function removeCurrency(
  denomination: CurrencyDenomination,
  amount: number,
  type: CurrencyType
): CurrencyDenomination | null {
  if (amount <= 0) return { ...denomination };

  if (denomination[type] < amount) {
    return null;
  }

  return {
    ...denomination,
    [type]: denomination[type] - Math.floor(amount),
  };
}

/**
 * Transfere moedas entre físico e banco
 *
 * @param currency - Moedas atuais do personagem
 * @param amount - Quantidade a transferir
 * @param type - Tipo de moeda
 * @param fromPhysical - true para transferir de físico para banco, false para banco para físico
 * @returns Nova configuração de moedas, ou null se quantidade insuficiente
 */
export function transferCurrency(
  currency: Currency,
  amount: number,
  type: CurrencyType,
  fromPhysical: boolean
): Currency | null {
  if (amount <= 0) return { ...currency };

  const source = fromPhysical ? currency.physical : currency.bank;
  const destination = fromPhysical ? currency.bank : currency.physical;

  if (source[type] < amount) {
    return null;
  }

  const newSource = { ...source, [type]: source[type] - amount };
  const newDestination = { ...destination, [type]: destination[type] + amount };

  return {
    physical: fromPhysical ? newSource : newDestination,
    bank: fromPhysical ? newDestination : newSource,
  };
}
