/**
 * Testes para DiceRollResult
 *
 * Testa o componente de exibição de resultado de rolagem com os novos tipos:
 * - DicePoolResult (rolagens de skill com sucessos)
 * - DamageDiceRollResult (rolagens de dano)
 * - CustomDiceResult (rolagens customizadas)
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DiceRollResult } from '../DiceRollResult';
import { lightTheme } from '@/theme';
import type {
  DamageDiceRollResult,
  CustomDiceResult,
} from '@/utils/diceRoller';
import type { DicePoolResult } from '@/types';

// ============================================================================
// Test Wrapper
// ============================================================================

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

// ============================================================================
// Mock Data Factories
// ============================================================================

const createMockDicePoolResult = (
  overrides: Partial<DicePoolResult> = {}
): DicePoolResult => ({
  formula: '3d6',
  dice: [
    { value: 6, dieSize: 'd6', isSuccess: true, isCancellation: false },
    { value: 4, dieSize: 'd6', isSuccess: false, isCancellation: false },
    { value: 1, dieSize: 'd6', isSuccess: false, isCancellation: true },
  ],
  rolls: [6, 4, 1],
  dieSize: 'd6',
  diceCount: 3,
  successes: 1,
  cancellations: 1,
  netSuccesses: 0,
  timestamp: new Date(),
  isPenaltyRoll: false,
  diceModifier: 0,
  ...overrides,
});

const createMockDamageDiceRollResult = (
  overrides: Partial<DamageDiceRollResult> = {}
): DamageDiceRollResult => ({
  formula: '2d6+3',
  rolls: [4, 5],
  diceType: 6,
  diceCount: 2,
  modifier: 3,
  baseResult: 9,
  finalResult: 12,
  timestamp: new Date(),
  isDamageRoll: true,
  isCritical: false,
  ...overrides,
});

const createMockCustomDiceResult = (
  overrides: Partial<CustomDiceResult> = {}
): CustomDiceResult => ({
  formula: '1d20+5',
  rolls: [15],
  diceType: 20,
  diceCount: 1,
  modifier: 5,
  total: 20,
  summed: true,
  timestamp: new Date(),
  ...overrides,
});

// ============================================================================
// Test Suites
// ============================================================================

describe('DiceRollResult', () => {
  describe('Pool Result Display', () => {
    it('deve renderizar fórmula da pool', () => {
      const result = createMockDicePoolResult({ formula: '4d8' });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText('Fórmula:')).toBeInTheDocument();
      expect(screen.getByText('4d8')).toBeInTheDocument();
    });

    it('deve exibir número de sucessos líquidos', () => {
      const result = createMockDicePoolResult({
        netSuccesses: 3,
        successes: 4,
        cancellations: 1,
      });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByLabelText(/3 sucessos/i)).toBeInTheDocument();
    });

    it('deve exibir 0 sucessos para falha', () => {
      const result = createMockDicePoolResult({
        netSuccesses: 0,
        successes: 1,
        cancellations: 1,
      });
      renderWithTheme(<DiceRollResult result={result} />);

      // Should show "0✶ FALHA" chip
      expect(screen.getByText('0✶ FALHA')).toBeInTheDocument();
    });

    it('deve exibir dados individuais no breakdown', () => {
      const result = createMockDicePoolResult();
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      // Should show dice values: 6, 4, 1
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('deve exibir contagem de sucessos e cancelamentos', () => {
      const result = createMockDicePoolResult({
        successes: 2,
        cancellations: 1,
        netSuccesses: 1,
      });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('Contagem:')).toBeInTheDocument();
      // Should show "2✶ - 1 cancelado = 1✶"
      expect(screen.getByText(/2✶/)).toBeInTheDocument();
      expect(screen.getByText(/1 cancelado/)).toBeInTheDocument();
    });

    it('não deve exibir breakdown quando showBreakdown é false', () => {
      const result = createMockDicePoolResult();
      renderWithTheme(<DiceRollResult result={result} showBreakdown={false} />);

      expect(screen.queryByText('Contagem:')).not.toBeInTheDocument();
    });

    it('deve exibir tag de penalidade quando isPenaltyRoll é true', () => {
      const result = createMockDicePoolResult({ isPenaltyRoll: true });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText(/2d \(menor\)/i)).toBeInTheDocument();
    });

    it('deve exibir contexto quando fornecido', () => {
      const result = createMockDicePoolResult({
        context: 'Teste de Acrobacia',
      });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('Contexto:')).toBeInTheDocument();
      expect(screen.getByText('Teste de Acrobacia')).toBeInTheDocument();
    });

    it('deve exibir timestamp formatado', () => {
      const mockDate = new Date('2024-01-15T14:30:45');
      const result = createMockDicePoolResult({ timestamp: mockDate });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText(/14:30:45/)).toBeInTheDocument();
    });

    it('deve exibir modificador de dados quando presente', () => {
      const result = createMockDicePoolResult({ diceModifier: 2 });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('+2d')).toBeInTheDocument();
    });

    it('deve exibir modificador negativo de dados', () => {
      const result = createMockDicePoolResult({ diceModifier: -1 });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('-1d')).toBeInTheDocument();
    });

    it('deve usar cor de erro para 0 sucessos', () => {
      const result = createMockDicePoolResult({ netSuccesses: 0 });
      renderWithTheme(<DiceRollResult result={result} />);

      const chip = screen.getByText('0✶ FALHA');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });

    it('deve comparar com requiredSuccesses quando fornecido', () => {
      const result = createMockDicePoolResult({
        netSuccesses: 2,
        successes: 2,
        cancellations: 0,
      });
      renderWithTheme(<DiceRollResult result={result} requiredSuccesses={3} />);

      // 2 is less than required 3, but should still show success count
      expect(screen.getByLabelText(/2 sucessos/i)).toBeInTheDocument();
    });
  });

  describe('Damage Result Display', () => {
    it('deve renderizar fórmula de dano', () => {
      const result = createMockDamageDiceRollResult({ formula: '3d8+2' });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText('Dano:')).toBeInTheDocument();
      expect(screen.getByText('3d8+2')).toBeInTheDocument();
    });

    it('deve exibir resultado final de dano', () => {
      const result = createMockDamageDiceRollResult({ finalResult: 18 });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByLabelText(/dano: 18/i)).toBeInTheDocument();
    });

    it('deve exibir tag de crítico quando isCritical é true', () => {
      const result = createMockDamageDiceRollResult({ isCritical: true });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText('CRÍTICO!')).toBeInTheDocument();
    });

    it('deve exibir dados de dano no breakdown', () => {
      const result = createMockDamageDiceRollResult({ rolls: [4, 5, 6] });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('deve exibir cálculo de dano no breakdown', () => {
      const result = createMockDamageDiceRollResult({
        baseResult: 9,
        modifier: 3,
        finalResult: 12,
      });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('Cálculo:')).toBeInTheDocument();
      // Text is split by elements, check individual parts
      expect(screen.getByText('9')).toBeInTheDocument();
    });

    it('deve exibir contexto de dano quando fornecido', () => {
      const result = createMockDamageDiceRollResult({
        context: 'Espada Longa',
      });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('Espada Longa')).toBeInTheDocument();
    });

    it('não deve exibir breakdown quando showBreakdown é false', () => {
      const result = createMockDamageDiceRollResult();
      renderWithTheme(<DiceRollResult result={result} showBreakdown={false} />);

      expect(screen.queryByText('Cálculo:')).not.toBeInTheDocument();
    });
  });

  describe('Custom Result Display', () => {
    it('deve renderizar fórmula customizada', () => {
      const result = createMockCustomDiceResult({ formula: '2d10+5' });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText('Fórmula:')).toBeInTheDocument();
      expect(screen.getByText('2d10+5')).toBeInTheDocument();
    });

    it('deve exibir total da rolagem customizada', () => {
      const result = createMockCustomDiceResult({ total: 25 });
      renderWithTheme(<DiceRollResult result={result} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('deve exibir dados no breakdown', () => {
      const result = createMockCustomDiceResult({ rolls: [8, 7] });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('deve exibir contexto quando fornecido', () => {
      const result = createMockCustomDiceResult({ context: 'Rolagem Livre' });
      renderWithTheme(<DiceRollResult result={result} showBreakdown={true} />);

      expect(screen.getByText('Rolagem Livre')).toBeInTheDocument();
    });

    it('não deve exibir breakdown quando showBreakdown é false', () => {
      const result = createMockCustomDiceResult();
      renderWithTheme(<DiceRollResult result={result} showBreakdown={false} />);

      expect(screen.queryByText('Contexto:')).not.toBeInTheDocument();
    });
  });

  describe('Animações', () => {
    it('deve aplicar animação quando animate é true (pool)', () => {
      const result = createMockDicePoolResult();
      const { container } = renderWithTheme(
        <DiceRollResult result={result} animate={true} />
      );

      const paper = container.querySelector('.MuiPaper-root');
      // Animation should NOT be 'none'
      expect(paper?.getAttribute('style')).not.toContain('animation: none');
    });

    it('deve não aplicar animação quando animate é false (pool)', () => {
      const result = createMockDicePoolResult();
      const { container } = renderWithTheme(
        <DiceRollResult result={result} animate={false} />
      );

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toHaveStyle({ animation: 'none' });
    });

    it('deve aplicar animação para dano', () => {
      const result = createMockDamageDiceRollResult();
      const { container } = renderWithTheme(
        <DiceRollResult result={result} animate={true} />
      );

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper?.getAttribute('style')).not.toContain('animation: none');
    });

    it('deve aplicar animação para custom', () => {
      const result = createMockCustomDiceResult();
      const { container } = renderWithTheme(
        <DiceRollResult result={result} animate={true} />
      );

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper?.getAttribute('style')).not.toContain('animation: none');
    });
  });

  describe('Fallback para tipo desconhecido', () => {
    it('deve exibir mensagem de erro para tipo desconhecido', () => {
      // Creating an invalid result that doesn't match any type guard
      const invalidResult = {
        formula: 'invalid',
        timestamp: new Date(),
      } as any;

      renderWithTheme(<DiceRollResult result={invalidResult} />);

      expect(
        screen.getByText('Tipo de resultado desconhecido')
      ).toBeInTheDocument();
    });
  });

  describe('Múltiplos Sucessos', () => {
    it('deve destacar múltiplos sucessos com borda verde', () => {
      const result = createMockDicePoolResult({
        netSuccesses: 4,
        successes: 4,
        cancellations: 0,
      });
      const { container } = renderWithTheme(<DiceRollResult result={result} />);

      const paper = container.querySelector('.MuiPaper-root');
      // Should have higher elevation for multiple successes
      expect(paper).toHaveClass('MuiPaper-elevation8');
    });

    it('deve ter elevação normal para poucos sucessos', () => {
      const result = createMockDicePoolResult({
        netSuccesses: 1,
        successes: 1,
        cancellations: 0,
      });
      const { container } = renderWithTheme(<DiceRollResult result={result} />);

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toHaveClass('MuiPaper-elevation2');
    });
  });
});
