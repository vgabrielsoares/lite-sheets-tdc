/**
 * Testes para DiceRollHistory component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DiceRollHistory } from '../DiceRollHistory';
import * as diceRollerUtils from '@/utils/diceRoller';
import type { DiceRollResult } from '@/utils/diceRoller';

// Mock do módulo diceRoller
jest.mock('@/utils/diceRoller', () => ({
  ...jest.requireActual('@/utils/diceRoller'),
  globalDiceHistory: {
    add: jest.fn(),
    getAll: jest.fn(() => []),
    clear: jest.fn(),
    size: jest.fn(() => 0),
  },
}));

describe('DiceRollHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoll1: DiceRollResult = {
    formula: '1d20+5',
    rolls: [15],
    diceType: 20,
    diceCount: 1,
    modifier: 5,
    baseResult: 15,
    finalResult: 20,
    timestamp: new Date('2024-12-08T10:30:00'),
    rollType: 'normal',
    context: 'Teste de Acrobacia',
  };

  const mockRoll2: DiceRollResult = {
    formula: '2d6+3',
    rolls: [4, 5],
    diceType: 6,
    diceCount: 2,
    modifier: 3,
    baseResult: 9,
    finalResult: 12,
    timestamp: new Date('2024-12-08T10:31:00'),
    rollType: 'normal',
    context: 'Dano de Espada',
  };

  const mockRoll3Critical: DiceRollResult = {
    formula: '1d20+3',
    rolls: [20],
    diceType: 20,
    diceCount: 1,
    modifier: 3,
    baseResult: 20,
    finalResult: 23,
    timestamp: new Date('2024-12-08T10:32:00'),
    rollType: 'normal',
    isCritical: true,
    context: 'Ataque',
  };

  describe('Estado Vazio', () => {
    it('deve exibir mensagem quando não há rolagens', () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        []
      );
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(0);

      render(<DiceRollHistory />);

      expect(screen.getByText(/nenhuma rolagem ainda/i)).toBeInTheDocument();
      expect(
        screen.getByText(/role os dados para começar/i)
      ).toBeInTheDocument();
    });

    it('não deve exibir botão de limpar quando vazio', () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        []
      );
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(0);

      render(<DiceRollHistory />);

      expect(
        screen.queryByRole('button', { name: /limpar tudo/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Exibição de Histórico', () => {
    it('deve exibir rolagens no histórico', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
        mockRoll2,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(2);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/teste de acrobacia/i)).toBeInTheDocument();
        expect(screen.getByText(/dano de espada/i)).toBeInTheDocument();
      });
    });

    it('deve exibir fórmula e resultado de cada rolagem', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/1d20\+5/)).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
      });
    });

    it('deve exibir timestamp formatado', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        // Timestamp deve estar presente (formato HH:MM:SS)
        expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
      });
    });

    it('deve exibir contador de rolagens', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
        mockRoll2,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(2);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/histórico \(2\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Críticos e Falhas', () => {
    it('deve destacar rolagem crítica', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll3Critical,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        // Deve exibir chip com resultado em warning (dourado)
        const chip = screen.getByText('23');
        expect(chip).toBeInTheDocument();
      });
    });

    it('deve destacar rolagem de falha crítica', async () => {
      const mockFailure: DiceRollResult = {
        ...mockRoll1,
        rolls: [1],
        baseResult: 1,
        finalResult: 6,
        isCriticalFailure: true,
      };

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockFailure,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        // Deve exibir chip com resultado em error (vermelho)
        const chip = screen.getByText('6');
        expect(chip).toBeInTheDocument();
      });
    });
  });

  describe('Expansão de Detalhes', () => {
    it('deve permitir expandir detalhes quando expandable é true', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      const user = userEvent.setup();
      render(<DiceRollHistory expandable={true} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/expandir detalhes/i)).toBeInTheDocument();
      });

      const expandButton = screen.getByLabelText(/expandir detalhes/i);
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/resultado final/i)).toBeInTheDocument();
      });
    });

    it('não deve exibir botão de expandir quando expandable é false', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory expandable={false} />);

      await waitFor(() => {
        expect(
          screen.queryByLabelText(/expandir detalhes/i)
        ).not.toBeInTheDocument();
      });
    });

    it('deve alternar expansão ao clicar', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      const user = userEvent.setup();
      render(<DiceRollHistory expandable={true} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/expandir detalhes/i)).toBeInTheDocument();
      });

      const expandButton = screen.getByLabelText(/expandir detalhes/i);

      // Expandir
      await user.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText(/resultado final/i)).toBeInTheDocument();
      });

      // Recolher
      const collapseButton = screen.getByLabelText(/recolher detalhes/i);
      await user.click(collapseButton);
      await waitFor(() => {
        expect(screen.queryByText(/resultado final/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Limpar Histórico', () => {
    it('deve exibir botão de limpar quando há rolagens', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /limpar todo o histórico/i })
        ).toBeInTheDocument();
      });
    });

    it('deve limpar histórico ao clicar em limpar', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
        mockRoll2,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(2);

      const user = userEvent.setup();
      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/teste de acrobacia/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', {
        name: /limpar todo o histórico/i,
      });
      await user.click(clearButton);

      expect(diceRollerUtils.globalDiceHistory.clear).toHaveBeenCalled();
    });

    it('deve chamar callback onClear quando fornecido', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      const onClearMock = jest.fn();
      const user = userEvent.setup();
      render(<DiceRollHistory onClear={onClearMock} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /limpar todo o histórico/i })
        ).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', {
        name: /limpar todo o histórico/i,
      });
      await user.click(clearButton);

      expect(onClearMock).toHaveBeenCalled();
    });
  });

  describe('Limite de Entradas', () => {
    it('deve respeitar maxEntries', async () => {
      const manyRolls = Array.from({ length: 10 }, (_, i) => ({
        ...mockRoll1,
        timestamp: new Date(`2024-12-08T10:${30 + i}:00`),
        context: `Rolagem ${i + 1}`,
      }));

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        manyRolls
      );
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(10);

      render(<DiceRollHistory maxEntries={5} />);

      await waitFor(() => {
        expect(screen.getByText(/histórico \(5\)/i)).toBeInTheDocument();
      });
    });

    it('deve exibir indicador quando há mais rolagens que o limite', async () => {
      const manyRolls = Array.from({ length: 10 }, (_, i) => ({
        ...mockRoll1,
        timestamp: new Date(`2024-12-08T10:${30 + i}:00`),
      }));

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        manyRolls.slice(0, 5)
      );
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(10);

      render(<DiceRollHistory maxEntries={5} />);

      await waitFor(() => {
        expect(
          screen.getByText(/mostrando últimas 5 de 10 rolagens/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Atualização Automática', () => {
    it('deve atualizar histórico automaticamente', async () => {
      jest.useFakeTimers();

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([mockRoll1]);

      (diceRollerUtils.globalDiceHistory.size as jest.Mock)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1);

      render(<DiceRollHistory />);

      // Estado inicial vazio
      expect(screen.getByText(/nenhuma rolagem ainda/i)).toBeInTheDocument();

      // Avançar 1 segundo (tempo do polling)
      jest.advanceTimersByTime(1000);

      // Deve atualizar com a nova rolagem
      await waitFor(() => {
        expect(
          screen.queryByText(/nenhuma rolagem ainda/i)
        ).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Contexto', () => {
    it('deve exibir contexto quando presente', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        mockRoll1,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/teste de acrobacia/i)).toBeInTheDocument();
      });
    });

    it('deve funcionar sem contexto', async () => {
      const rollWithoutContext: DiceRollResult = {
        ...mockRoll1,
        context: undefined,
      };

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue([
        rollWithoutContext,
      ]);
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(1);

      render(<DiceRollHistory />);

      await waitFor(() => {
        expect(screen.getByText(/1d20\+5/)).toBeInTheDocument();
      });
    });
  });

  describe('Scroll', () => {
    it('deve permitir scroll quando há muitas rolagens', async () => {
      const manyRolls = Array.from({ length: 20 }, (_, i) => ({
        ...mockRoll1,
        timestamp: new Date(`2024-12-08T10:${30 + i}:00`),
        context: `Rolagem ${i + 1}`,
      }));

      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        manyRolls
      );
      (diceRollerUtils.globalDiceHistory.size as jest.Mock).mockReturnValue(20);

      const { container } = render(<DiceRollHistory maxEntries={20} />);

      await waitFor(() => {
        const list = container.querySelector('[class*="MuiList"]');
        expect(list).toHaveStyle({ maxHeight: '400px', overflowY: 'auto' });
      });
    });
  });
});
