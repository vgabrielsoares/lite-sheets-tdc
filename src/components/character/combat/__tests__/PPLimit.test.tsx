/**
 * Tests for PPLimit component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PPLimit } from '../PPLimit';
import type { PPLimit as PPLimitType } from '@/types/combat';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PPLimit', () => {
  const defaultPPLimit: PPLimitType = {
    base: 2,
    modifiers: [],
    total: 2,
  };

  const mockOnChange = jest.fn();
  const mockOnOpenDetails = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnOpenDetails.mockClear();
  });

  describe('Rendering', () => {
    it('should render component title', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={1}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Limite de PP/Rodada')).toBeInTheDocument();
    });

    it('should display calculated PP limit', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={1}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      // Level 1 + Presença 1 = 2
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('PP máx/rodada')).toBeInTheDocument();
    });

    it('should display breakdown chips', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Nível +3')).toBeInTheDocument();
      expect(screen.getByText('Presença +2')).toBeInTheDocument();
    });
  });

  describe('Limit Calculation', () => {
    it('should calculate limit as Level + Presença', () => {
      const testCases = [
        { level: 1, presenca: 1, expected: '2' },
        { level: 5, presenca: 3, expected: '8' },
        { level: 10, presenca: 5, expected: '15' },
        { level: 3, presenca: 0, expected: '3' },
      ];

      testCases.forEach(({ level, presenca, expected }) => {
        const { unmount } = renderWithTheme(
          <PPLimit
            characterLevel={level}
            presenca={presenca}
            ppLimit={defaultPPLimit}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('should include modifiers in calculation', () => {
      const ppLimitWithModifiers: PPLimitType = {
        base: 5,
        modifiers: [{ name: 'Habilidade Especial', value: 2, type: 'bonus' }],
        total: 7,
      };

      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={ppLimitWithModifiers}
          onChange={mockOnChange}
        />
      );

      // 3 + 2 + 2 = 7
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('Outros +2')).toBeInTheDocument();
    });

    it('should display negative modifiers correctly', () => {
      const ppLimitWithNegativeModifiers: PPLimitType = {
        base: 5,
        modifiers: [{ name: 'Condição', value: -1, type: 'penalidade' }],
        total: 4,
      };

      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={ppLimitWithNegativeModifiers}
          onChange={mockOnChange}
        />
      );

      // 3 + 2 - 1 = 4
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Outros -1')).toBeInTheDocument();
    });
  });

  describe('PP Spent Tracking', () => {
    it('should display PP spent this round when provided', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={defaultPPLimit}
          ppSpentThisRound={3}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Gastos nesta rodada:')).toBeInTheDocument();
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('should not display PP spent when 0', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={defaultPPLimit}
          ppSpentThisRound={0}
          onChange={mockOnChange}
        />
      );

      expect(
        screen.queryByText('Gastos nesta rodada:')
      ).not.toBeInTheDocument();
    });
  });

  describe('Limit State Indicators', () => {
    it('should show warning indicator when near limit', () => {
      // Near limit = 2 remaining
      renderWithTheme(
        <PPLimit
          characterLevel={3}
          presenca={2}
          ppLimit={defaultPPLimit}
          ppSpentThisRound={3} // 5 - 3 = 2 remaining
          onChange={mockOnChange}
        />
      );

      // Should have warning color on remaining PP
      const spentText = screen.getByText('3 / 5');
      expect(spentText).toHaveStyle({ fontWeight: expect.any(Number) });
    });
  });

  describe('Interactions', () => {
    it('should call onOpenDetails when card is clicked', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={1}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      fireEvent.click(screen.getByText('Limite de PP/Rodada'));

      expect(mockOnOpenDetails).toHaveBeenCalled();
    });

    it('should be clickable via keyboard when onOpenDetails is provided', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={1}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(mockOnOpenDetails).toHaveBeenCalled();
    });

    it('should not have button role when onOpenDetails is not provided', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={1}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0 presença correctly', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={1}
          presenca={0}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      // 1 + 0 = 1
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Presença +0')).toBeInTheDocument();
    });

    it('should handle high level characters', () => {
      renderWithTheme(
        <PPLimit
          characterLevel={15}
          presenca={5}
          ppLimit={defaultPPLimit}
          onChange={mockOnChange}
        />
      );

      // 15 + 5 = 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });
});
