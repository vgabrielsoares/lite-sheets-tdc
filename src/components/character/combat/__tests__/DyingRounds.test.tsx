/**
 * Tests for DyingRounds component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DyingRounds } from '../DyingRounds';
import type { DyingState } from '@/types/combat';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DyingRounds', () => {
  const defaultDyingState: DyingState = {
    isDying: false,
    currentRounds: 0,
    maxRounds: 3,
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render component title', () => {
      renderWithTheme(
        <DyingRounds
          dyingState={defaultDyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Rodadas Morrendo')).toBeInTheDocument();
    });

    it('should display current/max rounds', () => {
      renderWithTheme(
        <DyingRounds
          dyingState={defaultDyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      // Com constituicao=1: max = 2 + 1 = 3
      expect(screen.getByText('0 / 3')).toBeInTheDocument();
    });

    it('should show "Estável" when not dying', () => {
      renderWithTheme(
        <DyingRounds
          dyingState={defaultDyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Estável')).toBeInTheDocument();
    });

    it('should show "Iniciar Morrendo" button when not dying', () => {
      renderWithTheme(
        <DyingRounds
          dyingState={defaultDyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Iniciar Morrendo')).toBeInTheDocument();
    });
  });

  describe('Max Rounds Calculation', () => {
    it('should calculate max rounds as 2 + Constituição', () => {
      const testCases = [
        { constituicao: 0, expected: 2 },
        { constituicao: 1, expected: 3 },
        { constituicao: 2, expected: 4 },
        { constituicao: 3, expected: 5 },
        { constituicao: 5, expected: 7 },
      ];

      testCases.forEach(({ constituicao, expected }) => {
        const { unmount } = renderWithTheme(
          <DyingRounds
            dyingState={defaultDyingState}
            constituicao={constituicao}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByText(`0 / ${expected}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should include other modifiers in calculation', () => {
      const dyingStateWithModifiers: DyingState = {
        ...defaultDyingState,
        otherModifiers: 2,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingStateWithModifiers}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      // 2 + 1 + 2 = 5
      expect(screen.getByText('0 / 5')).toBeInTheDocument();
    });
  });

  describe('Dying State', () => {
    it('should show remaining rounds when dying', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText('2 restantes')).toBeInTheDocument();
    });

    it('should show "CRÍTICO!" when 1 round remaining', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 2,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('CRÍTICO!')).toBeInTheDocument();
    });

    it('should show "Estabilizar" button when dying', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Estabilizar')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should start dying when "Iniciar Morrendo" is clicked', () => {
      renderWithTheme(
        <DyingRounds
          dyingState={defaultDyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByText('Iniciar Morrendo'));

      expect(mockOnChange).toHaveBeenCalledWith({
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      });
    });

    it('should increment rounds when + button is clicked', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Adicionar 1 rodada morrendo'));

      expect(mockOnChange).toHaveBeenCalledWith({
        isDying: true,
        currentRounds: 2,
        maxRounds: 3,
      });
    });

    it('should decrement rounds when - button is clicked', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 2,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Remover 1 rodada morrendo'));

      expect(mockOnChange).toHaveBeenCalledWith({
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      });
    });

    it('should exit dying state when decrementing to 0', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Remover 1 rodada morrendo'));

      expect(mockOnChange).toHaveBeenCalledWith({
        isDying: false,
        currentRounds: 0,
        maxRounds: 3,
      });
    });

    it('should reset dying state when "Estabilizar" is clicked', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 2,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByText('Estabilizar'));

      expect(mockOnChange).toHaveBeenCalledWith({
        isDying: false,
        currentRounds: 0,
        maxRounds: 3,
      });
    });

    it('should not exceed max rounds when incrementing', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 3,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.getByLabelText('Adicionar 1 rodada morrendo');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const dyingState: DyingState = {
        isDying: true,
        currentRounds: 1,
        maxRounds: 3,
      };

      renderWithTheme(
        <DyingRounds
          dyingState={dyingState}
          constituicao={1}
          onChange={mockOnChange}
        />
      );

      expect(
        screen.getByLabelText('Adicionar 1 rodada morrendo')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Remover 1 rodada morrendo')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Resetar estado morrendo')
      ).toBeInTheDocument();
    });
  });
});
