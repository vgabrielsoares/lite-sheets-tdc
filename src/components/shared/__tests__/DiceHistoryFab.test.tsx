/**
 * Testes para DiceHistoryFab component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DiceHistoryFab } from '../DiceHistoryFab';
import * as diceRollerUtils from '@/utils/diceRoller';

// Mock do módulo diceRoller
jest.mock('@/utils/diceRoller', () => ({
  ...jest.requireActual('@/utils/diceRoller'),
  globalDiceHistory: {
    getAll: jest.fn(() => []),
    clear: jest.fn(),
    get size() {
      return 0;
    },
  },
}));

// Mock do DiceRollHistory
jest.mock('../DiceRollHistory', () => ({
  DiceRollHistory: () => <div>Histórico Mock</div>,
}));

describe('DiceHistoryFab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o FAB quando show é true', () => {
      render(<DiceHistoryFab show={true} />);

      expect(
        screen.getByRole('button', { name: /abrir histórico de rolagens/i })
      ).toBeInTheDocument();
    });

    it('não deve renderizar quando show é false', () => {
      render(<DiceHistoryFab show={false} />);

      expect(
        screen.queryByRole('button', { name: /abrir histórico de rolagens/i })
      ).not.toBeInTheDocument();
    });

    it('deve exibir badge com contador de rolagens', async () => {
      // Mock para retornar 5 rolagens
      Object.defineProperty(diceRollerUtils.globalDiceHistory, 'size', {
        get: jest.fn(() => 5),
      });

      render(<DiceHistoryFab />);

      // Badge pode levar um momento para atualizar
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  describe('Interação', () => {
    it('deve abrir drawer ao clicar no FAB', async () => {
      const user = userEvent.setup();
      render(<DiceHistoryFab />);

      const fab = screen.getByRole('button', {
        name: /abrir histórico de rolagens/i,
      });
      await user.click(fab);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /histórico de rolagens/i })
        ).toBeInTheDocument();
      });
    });

    it('deve fechar drawer ao clicar no botão fechar', async () => {
      const user = userEvent.setup();
      render(<DiceHistoryFab />);

      // Abrir drawer
      const fab = screen.getByRole('button', {
        name: /abrir histórico de rolagens/i,
      });
      await user.click(fab);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /histórico de rolagens/i })
        ).toBeInTheDocument();
      });

      // Fechar drawer
      const closeButton = screen.getByRole('button', {
        name: /fechar histórico/i,
      });
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /histórico de rolagens/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados', () => {
      render(<DiceHistoryFab />);

      const fab = screen.getByRole('button', {
        name: /abrir histórico de rolagens/i,
      });
      expect(fab).toBeInTheDocument();
    });

    it('deve ter role complementary no drawer', async () => {
      const user = userEvent.setup();
      render(<DiceHistoryFab />);

      const fab = screen.getByRole('button', {
        name: /abrir histórico de rolagens/i,
      });
      await user.click(fab);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });
  });
});
