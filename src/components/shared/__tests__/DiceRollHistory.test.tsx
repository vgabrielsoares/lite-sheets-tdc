/**
 * Testes para DiceRollHistory (v0.0.2)
 *
 * Testa o componente de histórico de rolagens com os novos tipos:
 * - DicePoolResult (rolagens de skill com sucessos)
 * - DamageDiceRollResult (rolagens de dano)
 * - CustomDiceResult (rolagens customizadas)
 */

import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DiceRollHistory } from '../DiceRollHistory';
import { lightTheme } from '@/theme';
import {
  globalDiceHistory,
  type DamageDiceRollResult,
  type CustomDiceResult,
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
    { value: 3, dieSize: 'd6', isSuccess: false, isCancellation: false },
    { value: 1, dieSize: 'd6', isSuccess: false, isCancellation: true },
  ],
  rolls: [6, 3, 1],
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

describe('DiceRollHistory', () => {
  beforeEach(() => {
    // Limpa histórico antes de cada teste
    globalDiceHistory.clear();
  });

  describe('Estado Vazio', () => {
    it('deve exibir mensagem quando não há rolagens', () => {
      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/nenhuma rolagem ainda/i)).toBeInTheDocument();
    });

    it('não deve exibir botão de limpar quando vazio', () => {
      renderWithTheme(<DiceRollHistory />);

      expect(screen.queryByText(/limpar tudo/i)).not.toBeInTheDocument();
    });
  });

  describe('Exibição de Histórico - Pool Results', () => {
    it('deve exibir rolagem de pool com contexto', () => {
      const mockRoll = createMockDicePoolResult({
        context: 'Teste de Acrobacia',
        netSuccesses: 2,
        successes: 2,
        cancellations: 0,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      // Verifica contexto
      expect(screen.getByText(/teste de acrobacia/i)).toBeInTheDocument();
      // Verifica resultado (2 sucessos)
      expect(screen.getByText(/2✶/)).toBeInTheDocument();
    });

    it('deve exibir rolagem de pool sem contexto', () => {
      const mockRoll = createMockDicePoolResult({
        formula: '4d8',
        netSuccesses: 3,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText('4d8')).toBeInTheDocument();
      expect(screen.getByText(/3✶/)).toBeInTheDocument();
    });

    it('deve exibir 0 sucessos com cor de erro', () => {
      const mockRoll = createMockDicePoolResult({
        netSuccesses: 0,
        successes: 1,
        cancellations: 1,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      // Chip com 0✶ deve ter cor error
      const chip = screen.getByText(/0✶/).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorError');
    });

    it('deve exibir rolagem com penalidade', () => {
      const mockRoll = createMockDicePoolResult({
        isPenaltyRoll: true,
        context: 'Atributo 0',
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/penalidade/i)).toBeInTheDocument();
    });

    it('deve exibir sucessos altos com cor de sucesso', () => {
      const mockRoll = createMockDicePoolResult({
        netSuccesses: 4,
        successes: 4,
        cancellations: 0,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      const chip = screen.getByText(/4✶/).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });
  });

  describe('Exibição de Histórico - Damage Results', () => {
    it('deve exibir rolagem de dano', () => {
      const mockRoll = createMockDamageDiceRollResult({
        formula: '3d8+2',
        finalResult: 18,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText('3d8+2')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('deve exibir rolagem de dano crítico', () => {
      const mockRoll = createMockDamageDiceRollResult({
        formula: '2d6 MAXIMIZADO',
        finalResult: 12,
        isCritical: true,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/maximizado/i)).toBeInTheDocument();
      // Critical damage should have success color
      const chip = screen.getByText('12').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('deve exibir dano com contexto', () => {
      const mockRoll = createMockDamageDiceRollResult({
        context: 'Espada Longa',
        finalResult: 10,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/espada longa/i)).toBeInTheDocument();
    });
  });

  describe('Exibição de Histórico - Custom Results', () => {
    it('deve exibir rolagem customizada', () => {
      const mockRoll = createMockCustomDiceResult({
        formula: '1d20+5',
        total: 18,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText('1d20+5')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('deve exibir rolagem customizada com contexto', () => {
      const mockRoll = createMockCustomDiceResult({
        context: 'Rolagem Livre',
        total: 25,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/rolagem livre/i)).toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('deve exibir timestamp formatado', () => {
      const mockDate = new Date('2024-01-15T14:30:45');
      const mockRoll = createMockDicePoolResult({
        timestamp: mockDate,
      });
      globalDiceHistory.add(mockRoll);

      renderWithTheme(<DiceRollHistory />);

      // Verifica formato HH:MM:SS
      expect(screen.getByText(/14:30:45/)).toBeInTheDocument();
    });
  });

  describe('Contador de Rolagens', () => {
    it('deve exibir contador correto', () => {
      globalDiceHistory.add(createMockDicePoolResult());
      globalDiceHistory.add(createMockDamageDiceRollResult());
      globalDiceHistory.add(createMockCustomDiceResult());

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/histórico \(3\)/i)).toBeInTheDocument();
    });
  });

  describe('Limite de Entradas', () => {
    it('deve respeitar maxEntries', () => {
      // Adiciona 10 rolagens
      for (let i = 0; i < 10; i++) {
        globalDiceHistory.add(
          createMockDicePoolResult({ context: `Rolagem ${i}` })
        );
      }

      renderWithTheme(<DiceRollHistory maxEntries={5} />);

      // Só deve exibir as 5 mais recentes
      expect(screen.getByText(/histórico \(5\)/i)).toBeInTheDocument();
    });

    it('deve exibir indicador quando há mais rolagens do que exibido', () => {
      // Adiciona 10 rolagens
      for (let i = 0; i < 10; i++) {
        globalDiceHistory.add(createMockDicePoolResult());
      }

      renderWithTheme(<DiceRollHistory maxEntries={5} />);

      expect(
        screen.getByText(/mostrando últimas 5 de 10 rolagens/i)
      ).toBeInTheDocument();
    });
  });

  describe('Expansão de Detalhes', () => {
    it('deve mostrar botão de expandir quando expandable é true', () => {
      globalDiceHistory.add(createMockDicePoolResult());

      renderWithTheme(<DiceRollHistory expandable={true} />);

      expect(
        screen.getByRole('button', { name: /expandir detalhes/i })
      ).toBeInTheDocument();
    });

    it('não deve mostrar botão de expandir quando expandable é false', () => {
      globalDiceHistory.add(createMockDicePoolResult());

      renderWithTheme(<DiceRollHistory expandable={false} />);

      expect(
        screen.queryByRole('button', { name: /expandir detalhes/i })
      ).not.toBeInTheDocument();
    });

    it('deve alternar expansão ao clicar', () => {
      globalDiceHistory.add(createMockDicePoolResult());

      renderWithTheme(<DiceRollHistory expandable={true} />);

      const expandButton = screen.getByRole('button', {
        name: /expandir detalhes/i,
      });

      // Expande
      fireEvent.click(expandButton);
      expect(
        screen.getByRole('button', { name: /recolher detalhes/i })
      ).toBeInTheDocument();

      // Recolhe
      fireEvent.click(
        screen.getByRole('button', { name: /recolher detalhes/i })
      );
      expect(
        screen.getByRole('button', { name: /expandir detalhes/i })
      ).toBeInTheDocument();
    });

    it('deve expandir detalhes ao clicar no item', () => {
      globalDiceHistory.add(createMockDicePoolResult({ context: 'Teste' }));

      renderWithTheme(<DiceRollHistory expandable={true} />);

      // Clica no item da lista
      const listItem = screen.getByText(/teste/i).closest('div[role="button"]');
      if (listItem) {
        fireEvent.click(listItem);
      }

      expect(
        screen.getByRole('button', { name: /recolher detalhes/i })
      ).toBeInTheDocument();
    });
  });

  describe('Limpar Histórico', () => {
    it('deve limpar histórico ao clicar em limpar', () => {
      globalDiceHistory.add(createMockDicePoolResult());
      globalDiceHistory.add(createMockDamageDiceRollResult());

      const onClear = jest.fn();
      renderWithTheme(<DiceRollHistory onClear={onClear} />);

      fireEvent.click(
        screen.getByRole('button', { name: /limpar todo o histórico/i })
      );

      expect(screen.getByText(/nenhuma rolagem ainda/i)).toBeInTheDocument();
      expect(onClear).toHaveBeenCalled();
    });

    it('deve chamar callback onClear', () => {
      globalDiceHistory.add(createMockDicePoolResult());

      const onClear = jest.fn();
      renderWithTheme(<DiceRollHistory onClear={onClear} />);

      fireEvent.click(
        screen.getByRole('button', { name: /limpar todo o histórico/i })
      );

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Atualização Automática', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('deve atualizar histórico automaticamente', () => {
      renderWithTheme(<DiceRollHistory />);

      // Inicialmente vazio
      expect(screen.getByText(/nenhuma rolagem ainda/i)).toBeInTheDocument();

      // Adiciona rolagem após render
      act(() => {
        globalDiceHistory.add(
          createMockDicePoolResult({ context: 'Nova Rolagem' })
        );
      });

      // Avança o timer de polling
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Agora deve mostrar a rolagem
      expect(screen.getByText(/nova rolagem/i)).toBeInTheDocument();
    });
  });

  describe('Scroll', () => {
    it('deve renderizar lista com scroll para muitas entradas', () => {
      // Adiciona muitas rolagens
      for (let i = 0; i < 20; i++) {
        globalDiceHistory.add(createMockDicePoolResult());
      }

      renderWithTheme(<DiceRollHistory maxEntries={20} />);

      // Lista deve estar presente
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('Tipos Mistos', () => {
    it('deve exibir histórico com múltiplos tipos de rolagem', () => {
      globalDiceHistory.add(createMockDicePoolResult({ context: 'Pool' }));
      globalDiceHistory.add(
        createMockDamageDiceRollResult({ context: 'Dano' })
      );
      globalDiceHistory.add(createMockCustomDiceResult({ context: 'Custom' }));

      renderWithTheme(<DiceRollHistory />);

      expect(screen.getByText(/pool/i)).toBeInTheDocument();
      expect(screen.getByText(/dano/i)).toBeInTheDocument();
      expect(screen.getByText(/custom/i)).toBeInTheDocument();
    });
  });
});
