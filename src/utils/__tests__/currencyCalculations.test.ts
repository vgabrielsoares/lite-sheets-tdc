/**
 * Tests for Currency Calculations
 *
 * Testes unitários para as funções de cálculo de moedas,
 * garantindo que as conversões e operações seguem as regras do sistema.
 *
 * Regras do sistema:
 * - 100 C$ = 1 PO$
 * - 1.000 PO$ = 1 PP$
 * - 100.000 C$ = 1 PP$
 * - 100 moedas físicas = 1 peso
 * - Arredondamento sempre para baixo
 */

import {
  convertToCopper,
  copperToDenomination,
  calculateTotalWealth,
  addDenominations,
  subtractDenominations,
  convertCurrency,
  exchangeCurrency,
  calculateCoinWeight,
  calculateWealthSummary,
  formatCurrency,
  formatDenomination,
  formatTotalAs,
  canAfford,
  isValidDenomination,
  isValidCurrencyType,
  makePayment,
  addCurrency,
  removeCurrency,
  transferCurrency,
} from '../currencyCalculations';

import type { Currency, CurrencyDenomination } from '@/types/currency';

// ============================================================================
// Testes: Conversão para Cobre
// ============================================================================

describe('convertToCopper', () => {
  it('deve converter denominação vazia para 0', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 0,
      platina: 0,
    };
    expect(convertToCopper(denomination)).toBe(0);
  });

  it('deve converter apenas cobre corretamente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    expect(convertToCopper(denomination)).toBe(50);
  });

  it('deve converter apenas ouro corretamente (1 PO$ = 100 C$)', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 1,
      platina: 0,
    };
    expect(convertToCopper(denomination)).toBe(100);
  });

  it('deve converter apenas platina corretamente (1 PP$ = 100.000 C$)', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 0,
      platina: 1,
    };
    expect(convertToCopper(denomination)).toBe(100_000);
  });

  it('deve converter denominação mista corretamente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 2,
      platina: 1,
    };
    // 50 + (2 * 100) + (1 * 100.000) = 50 + 200 + 100.000 = 100.250
    expect(convertToCopper(denomination)).toBe(100_250);
  });

  it('deve lidar com valores grandes', () => {
    const denomination: CurrencyDenomination = {
      cobre: 99,
      ouro: 999,
      platina: 10,
    };
    // 99 + (999 * 100) + (10 * 100.000) = 99 + 99.900 + 1.000.000 = 1.099.999
    expect(convertToCopper(denomination)).toBe(1_099_999);
  });
});

// ============================================================================
// Testes: Cobre para Denominação
// ============================================================================

describe('copperToDenomination', () => {
  it('deve retornar denominação zerada para 0 cobre', () => {
    const result = copperToDenomination(0);
    expect(result).toEqual({ cobre: 0, ouro: 0, platina: 0 });
  });

  it('deve retornar denominação zerada para valor negativo', () => {
    const result = copperToDenomination(-100);
    expect(result).toEqual({ cobre: 0, ouro: 0, platina: 0 });
  });

  it('deve converter valor pequeno apenas em cobre', () => {
    const result = copperToDenomination(50);
    expect(result).toEqual({ cobre: 50, ouro: 0, platina: 0 });
  });

  it('deve converter 100 cobre para 1 ouro', () => {
    const result = copperToDenomination(100);
    expect(result).toEqual({ cobre: 0, ouro: 1, platina: 0 });
  });

  it('deve converter 100.000 cobre para 1 platina', () => {
    const result = copperToDenomination(100_000);
    expect(result).toEqual({ cobre: 0, ouro: 0, platina: 1 });
  });

  it('deve converter valor misto corretamente', () => {
    // 100.250 = 1 PP$ + 2 PO$ + 50 C$
    const result = copperToDenomination(100_250);
    expect(result).toEqual({ cobre: 50, ouro: 2, platina: 1 });
  });

  it('deve arredondar para baixo valores decimais', () => {
    const result = copperToDenomination(99.9);
    expect(result).toEqual({ cobre: 99, ouro: 0, platina: 0 });
  });
});

// ============================================================================
// Testes: Cálculo de Riqueza Total
// ============================================================================

describe('calculateTotalWealth', () => {
  it('deve calcular total zerado para moedas vazias', () => {
    const currency: Currency = {
      physical: { cobre: 0, ouro: 0, platina: 0 },
      bank: { cobre: 0, ouro: 0, platina: 0 },
    };
    const result = calculateTotalWealth(currency);
    expect(result.totalCobre).toBe(0);
    expect(result.totalOuro).toBe(0);
    expect(result.totalPlatina).toBe(0);
  });

  it('deve somar moedas físicas e banco corretamente', () => {
    const currency: Currency = {
      physical: { cobre: 50, ouro: 5, platina: 0 },
      bank: { cobre: 100, ouro: 10, platina: 1 },
    };
    // Physical: 50 + 500 = 550 C$
    // Bank: 100 + 1000 + 100.000 = 101.100 C$
    // Total: 101.650 C$
    const result = calculateTotalWealth(currency);
    expect(result.totalCobre).toBe(101_650);
    expect(result.totalOuro).toBe(1016.5);
    expect(result.totalPlatina).toBe(1.0165);
  });
});

// ============================================================================
// Testes: Operações com Denominações
// ============================================================================

describe('addDenominations', () => {
  it('deve somar duas denominações corretamente', () => {
    const a: CurrencyDenomination = { cobre: 10, ouro: 5, platina: 1 };
    const b: CurrencyDenomination = { cobre: 20, ouro: 3, platina: 2 };
    const result = addDenominations(a, b);
    expect(result).toEqual({ cobre: 30, ouro: 8, platina: 3 });
  });

  it('deve funcionar com denominação zerada', () => {
    const a: CurrencyDenomination = { cobre: 10, ouro: 5, platina: 1 };
    const b: CurrencyDenomination = { cobre: 0, ouro: 0, platina: 0 };
    const result = addDenominations(a, b);
    expect(result).toEqual({ cobre: 10, ouro: 5, platina: 1 });
  });
});

describe('subtractDenominations', () => {
  it('deve subtrair duas denominações corretamente', () => {
    const a: CurrencyDenomination = { cobre: 30, ouro: 8, platina: 3 };
    const b: CurrencyDenomination = { cobre: 10, ouro: 5, platina: 1 };
    const result = subtractDenominations(a, b);
    expect(result).toEqual({ cobre: 20, ouro: 3, platina: 2 });
  });

  it('deve retornar 0 para valores negativos', () => {
    const a: CurrencyDenomination = { cobre: 5, ouro: 2, platina: 0 };
    const b: CurrencyDenomination = { cobre: 10, ouro: 5, platina: 1 };
    const result = subtractDenominations(a, b);
    expect(result).toEqual({ cobre: 0, ouro: 0, platina: 0 });
  });
});

// ============================================================================
// Testes: Conversão Entre Moedas
// ============================================================================

describe('convertCurrency', () => {
  it('deve converter cobre para ouro (100 C$ = 1 PO$)', () => {
    const result = convertCurrency(250, 'cobre', 'ouro');
    expect(result.convertedAmount).toBe(2);
    expect(result.remainder).toBe(50);
  });

  it('deve converter ouro para platina (1000 PO$ = 1 PP$)', () => {
    const result = convertCurrency(1500, 'ouro', 'platina');
    expect(result.convertedAmount).toBe(1);
    expect(result.remainder).toBe(500);
  });

  it('deve converter platina para ouro (1 PP$ = 1000 PO$)', () => {
    const result = convertCurrency(2, 'platina', 'ouro');
    expect(result.convertedAmount).toBe(2000);
    expect(result.remainder).toBe(0);
  });

  it('deve retornar 0 para quantidade zero ou negativa', () => {
    const result = convertCurrency(0, 'cobre', 'ouro');
    expect(result.convertedAmount).toBe(0);
    expect(result.remainder).toBe(0);
  });

  it('deve converter mesma moeda para mesma moeda', () => {
    const result = convertCurrency(50, 'ouro', 'ouro');
    expect(result.convertedAmount).toBe(50);
    expect(result.remainder).toBe(0);
  });
});

describe('exchangeCurrency', () => {
  it('deve trocar moedas quando há quantidade suficiente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 200,
      ouro: 10,
      platina: 0,
    };
    const result = exchangeCurrency(denomination, 100, 'cobre', 'ouro');
    expect(result).not.toBeNull();
    expect(result?.cobre).toBe(100);
    expect(result?.ouro).toBe(11);
  });

  it('deve retornar null quando não há quantidade suficiente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    const result = exchangeCurrency(denomination, 100, 'cobre', 'ouro');
    expect(result).toBeNull();
  });

  it('deve retornar cópia para quantidade zero', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    const result = exchangeCurrency(denomination, 0, 'cobre', 'ouro');
    expect(result).toEqual(denomination);
  });
});

// ============================================================================
// Testes: Peso de Moedas
// ============================================================================

describe('calculateCoinWeight', () => {
  it('deve retornar 0 peso para 0 moedas', () => {
    const physical: CurrencyDenomination = { cobre: 0, ouro: 0, platina: 0 };
    const result = calculateCoinWeight(physical);
    expect(result.totalCoins).toBe(0);
    expect(result.weight).toBe(0);
  });

  it('deve calcular peso para 100 moedas = 1 peso', () => {
    const physical: CurrencyDenomination = { cobre: 100, ouro: 0, platina: 0 };
    const result = calculateCoinWeight(physical);
    expect(result.totalCoins).toBe(100);
    expect(result.weight).toBe(1);
  });

  it('deve contar todas as moedas físicas', () => {
    const physical: CurrencyDenomination = { cobre: 50, ouro: 30, platina: 20 };
    const result = calculateCoinWeight(physical);
    expect(result.totalCoins).toBe(100);
    expect(result.weight).toBe(1);
  });

  it('deve arredondar peso para baixo', () => {
    const physical: CurrencyDenomination = { cobre: 150, ouro: 0, platina: 0 };
    const result = calculateCoinWeight(physical);
    expect(result.totalCoins).toBe(150);
    expect(result.weight).toBe(1); // 150 / 100 = 1.5 → arredonda para 1
  });

  it('deve calcular peso grande corretamente', () => {
    const physical: CurrencyDenomination = {
      cobre: 500,
      ouro: 300,
      platina: 200,
    };
    const result = calculateCoinWeight(physical);
    expect(result.totalCoins).toBe(1000);
    expect(result.weight).toBe(10);
  });
});

// ============================================================================
// Testes: Resumo de Riquezas
// ============================================================================

describe('calculateWealthSummary', () => {
  it('deve gerar resumo completo', () => {
    const currency: Currency = {
      physical: { cobre: 150, ouro: 5, platina: 0 },
      bank: { cobre: 0, ouro: 10, platina: 1 },
    };
    const result = calculateWealthSummary(currency);

    expect(result.physical).toEqual({ cobre: 150, ouro: 5, platina: 0 });
    expect(result.bank).toEqual({ cobre: 0, ouro: 10, platina: 1 });
    expect(result.coinWeight.totalCoins).toBe(155);
    expect(result.coinWeight.weight).toBe(1);
    expect(result.totals.totalCobre).toBe(101_650); // 150 + 500 + 1000 + 100.000
  });
});

// ============================================================================
// Testes: Formatação
// ============================================================================

describe('formatCurrency', () => {
  it('deve formatar cobre corretamente', () => {
    expect(formatCurrency(50, 'cobre')).toBe('50 C$');
  });

  it('deve formatar ouro corretamente', () => {
    expect(formatCurrency(10, 'ouro')).toBe('10 PO$');
  });

  it('deve formatar platina corretamente', () => {
    expect(formatCurrency(2, 'platina')).toBe('2 PP$');
  });

  it('deve arredondar valores decimais para baixo', () => {
    expect(formatCurrency(10.9, 'ouro')).toBe('10 PO$');
  });
});

describe('formatDenomination', () => {
  it('deve formatar denominação completa', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 2,
    };
    expect(formatDenomination(denomination)).toBe('2 PP$, 10 PO$, 50 C$');
  });

  it('deve omitir zeros por padrão', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    expect(formatDenomination(denomination)).toBe('50 C$');
  });

  it('deve incluir zeros quando solicitado', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    expect(formatDenomination(denomination, true)).toBe('0 PP$, 0 PO$, 50 C$');
  });

  it('deve retornar "0 C$" para denominação vazia', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 0,
      platina: 0,
    };
    expect(formatDenomination(denomination)).toBe('0 C$');
  });
});

// ============================================================================
// Testes: Validações
// ============================================================================

describe('canAfford', () => {
  it('deve retornar true quando pode pagar', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    expect(canAfford(denomination, 500)).toBe(true); // 50 + 1000 = 1050 >= 500
  });

  it('deve retornar false quando não pode pagar', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    expect(canAfford(denomination, 100)).toBe(false);
  });

  it('deve retornar true para custo zero', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 0,
      platina: 0,
    };
    expect(canAfford(denomination, 0)).toBe(true);
  });
});

describe('isValidDenomination', () => {
  it('deve retornar true para denominação válida', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 2,
    };
    expect(isValidDenomination(denomination)).toBe(true);
  });

  it('deve retornar false para valores negativos', () => {
    const denomination: CurrencyDenomination = {
      cobre: -10,
      ouro: 10,
      platina: 2,
    };
    expect(isValidDenomination(denomination)).toBe(false);
  });

  it('deve retornar false para valores não finitos', () => {
    const denomination: CurrencyDenomination = {
      cobre: Infinity,
      ouro: 10,
      platina: 2,
    };
    expect(isValidDenomination(denomination)).toBe(false);
  });
});

describe('isValidCurrencyType', () => {
  it('deve retornar true para tipos válidos', () => {
    expect(isValidCurrencyType('cobre')).toBe(true);
    expect(isValidCurrencyType('ouro')).toBe(true);
    expect(isValidCurrencyType('platina')).toBe(true);
  });

  it('deve retornar false para tipos inválidos', () => {
    expect(isValidCurrencyType('prata')).toBe(false);
    expect(isValidCurrencyType('')).toBe(false);
  });
});

// ============================================================================
// Testes: Transações
// ============================================================================

describe('makePayment', () => {
  it('deve deduzir pagamento corretamente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    const result = makePayment(denomination, 500);
    expect(result).not.toBeNull();
    // 1050 - 500 = 550 C$ = 5 PO$ + 50 C$
    expect(result?.cobre).toBe(50);
    expect(result?.ouro).toBe(5);
  });

  it('deve retornar null para fundos insuficientes', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 0,
      platina: 0,
    };
    const result = makePayment(denomination, 100);
    expect(result).toBeNull();
  });

  it('deve converter moedas maiores quando necessário', () => {
    const denomination: CurrencyDenomination = {
      cobre: 0,
      ouro: 1,
      platina: 0,
    };
    const result = makePayment(denomination, 30);
    expect(result).not.toBeNull();
    // 100 - 30 = 70 C$
    expect(result?.cobre).toBe(70);
    expect(result?.ouro).toBe(0);
  });
});

describe('addCurrency', () => {
  it('deve adicionar moedas corretamente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    const result = addCurrency(denomination, 20, 'ouro');
    expect(result.ouro).toBe(30);
    expect(result.cobre).toBe(50); // Inalterado
  });

  it('deve retornar cópia para quantidade zero ou negativa', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    const result = addCurrency(denomination, 0, 'ouro');
    expect(result.ouro).toBe(10);
  });
});

describe('removeCurrency', () => {
  it('deve remover moedas corretamente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    const result = removeCurrency(denomination, 5, 'ouro');
    expect(result).not.toBeNull();
    expect(result?.ouro).toBe(5);
  });

  it('deve retornar null para quantidade insuficiente', () => {
    const denomination: CurrencyDenomination = {
      cobre: 50,
      ouro: 10,
      platina: 0,
    };
    const result = removeCurrency(denomination, 20, 'ouro');
    expect(result).toBeNull();
  });
});

describe('transferCurrency', () => {
  it('deve transferir de físico para banco', () => {
    const currency: Currency = {
      physical: { cobre: 50, ouro: 10, platina: 0 },
      bank: { cobre: 0, ouro: 5, platina: 0 },
    };
    const result = transferCurrency(currency, 5, 'ouro', true);
    expect(result).not.toBeNull();
    expect(result?.physical.ouro).toBe(5);
    expect(result?.bank.ouro).toBe(10);
  });

  it('deve transferir de banco para físico', () => {
    const currency: Currency = {
      physical: { cobre: 50, ouro: 10, platina: 0 },
      bank: { cobre: 0, ouro: 5, platina: 0 },
    };
    const result = transferCurrency(currency, 3, 'ouro', false);
    expect(result).not.toBeNull();
    expect(result?.physical.ouro).toBe(13);
    expect(result?.bank.ouro).toBe(2);
  });

  it('deve retornar null para quantidade insuficiente', () => {
    const currency: Currency = {
      physical: { cobre: 50, ouro: 10, platina: 0 },
      bank: { cobre: 0, ouro: 5, platina: 0 },
    };
    const result = transferCurrency(currency, 20, 'ouro', true);
    expect(result).toBeNull();
  });
});
