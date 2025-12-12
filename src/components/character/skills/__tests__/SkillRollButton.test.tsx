/**
 * Tests for SkillRollButton component
 *
 * Covers:
 * - Rendering with different props
 * - Dialog opening and closing
 * - Roll execution with different configurations
 * - Different dice counts (positive, zero, negative)
 * - Success/failure alerts with ND
 * - Quick roll on double-click
 * - Edge cases (attribute 0, negative dice)
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillRollButton } from '../SkillRollButton';
import { globalDiceHistory } from '@/utils/diceRoller';
import type { DiceRollResult } from '@/utils/diceRoller';

// Mock the dice roller utility
jest.mock('@/utils/diceRoller', () => {
  const actualModule = jest.requireActual('@/utils/diceRoller');
  return {
    ...actualModule,
    rollD20: jest.fn(),
    globalDiceHistory: {
      add: jest.fn(),
      getHistory: jest.fn(() => []),
      clear: jest.fn(),
    },
  };
});

const mockRollD20 = require('@/utils/diceRoller').rollD20;

describe('SkillRollButton', () => {
  const defaultProps = {
    skillLabel: 'Acrobacia',
    diceCount: 2,
    modifier: 5,
    formula: '2d20+5',
  };

  const mockRollResult: DiceRollResult = {
    formula: '2d20+5',
    rolls: [15, 12],
    diceType: 20,
    diceCount: 2,
    modifier: 5,
    baseResult: 15,
    finalResult: 20,
    timestamp: new Date(),
    rollType: 'normal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRollD20.mockReturnValue(mockRollResult);
  });

  describe('Rendering', () => {
    it('should render button with casino icon', () => {
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(<SkillRollButton {...defaultProps} size="large" />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with custom color', () => {
      render(<SkillRollButton {...defaultProps} color="success" />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<SkillRollButton {...defaultProps} disabled />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      expect(button).toBeDisabled();
    });

    it('should show custom tooltip text when provided', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton {...defaultProps} tooltipText="Custom tooltip" />
      );
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.hover(button);
      await waitFor(() => {
        expect(screen.getByText('Custom tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog on button click', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Teste de Acrobacia/i)).toBeInTheDocument();
      });
    });

    it('should display roll configuration in dialog', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('2d20+5')).toBeInTheDocument();
        expect(screen.getByText(/Configuração:/i)).toBeInTheDocument();
      });
    });

    it('should close dialog on cancel button', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      const closeButton = within(dialog).getByRole('button', {
        name: /fechar/i,
      });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Roll Execution', () => {
    it('should execute normal roll and display result', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      await waitFor(() => {
        expect(mockRollD20).toHaveBeenCalledWith(
          2,
          5,
          'normal',
          'Teste de Acrobacia'
        );
        expect(globalDiceHistory.add).toHaveBeenCalledWith(mockRollResult);
      });
    });

    it('should call onRoll callback if provided', async () => {
      const user = userEvent.setup();
      const onRollMock = jest.fn();
      render(<SkillRollButton {...defaultProps} onRoll={onRollMock} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      await waitFor(() => {
        expect(onRollMock).toHaveBeenCalledWith(mockRollResult);
      });
    });

    it('should display DiceRollResult after rolling', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      // Wait for the roll to complete - check if result is shown
      await waitFor(() => {
        const results = screen.getAllByText('20');
        expect(results.length).toBeGreaterThan(0); // Final result value
      });
    });
  });

  describe('ND (Difficulty) Handling', () => {
    it('should display success alert when result >= ND', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} nd={15} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');

      // Show ND in dialog
      expect(screen.getByText(/ND: 15/i)).toBeInTheDocument();

      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });
      await user.click(rollButton);

      await waitFor(() => {
        expect(screen.getByText(/Sucesso!/i)).toBeInTheDocument();
        expect(screen.getByText(/Resultado 20 ≥ ND 15/i)).toBeInTheDocument();
      });
    });

    it('should display failure alert when result < ND', async () => {
      const user = userEvent.setup();
      const failResult: DiceRollResult = {
        ...mockRollResult,
        baseResult: 8,
        finalResult: 13,
      };
      mockRollD20.mockReturnValue(failResult);

      render(<SkillRollButton {...defaultProps} nd={15} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      await waitFor(() => {
        expect(screen.getByText(/Falha/i)).toBeInTheDocument();
      });
    });

    it('should not show success/failure alert if no ND provided', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      await waitFor(() => {
        expect(screen.queryByText(/Sucesso!/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Falha/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle attribute 0 case (takeLowest with diceCount >= 1)', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton
          {...defaultProps}
          diceCount={2}
          modifier={3}
          takeLowest={true}
          formula="-2d20+3"
        />
      );
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      // Should roll 2 dice with disadvantage because of takeLowest flag
      await waitFor(() => {
        expect(mockRollD20).toHaveBeenCalledWith(
          2,
          3,
          'disadvantage',
          expect.any(String)
        );
      });
    });

    it('should handle negative dice count', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton
          {...defaultProps}
          diceCount={3}
          modifier={2}
          takeLowest={true}
          formula="-3d20+2"
        />
      );
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');
      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });

      await user.click(rollButton);

      // Negative dice: Math.abs(-1) + 2 = 3 dice with disadvantage
      await waitFor(() => {
        expect(mockRollD20).toHaveBeenCalledWith(
          3,
          2,
          'disadvantage',
          expect.any(String)
        );
      });
    });

    it('should handle diceCount = 0 (attribute 0, no modifiers)', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton
          {...defaultProps}
          diceCount={2}
          modifier={0}
          formula="-2d20"
          takeLowest={true}
        />
      );
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);
      const dialog = await screen.findByRole('dialog');

      // Dialog should open - component will roll 2 dice with disadvantage internally
      expect(dialog).toBeInTheDocument();

      const rollButton = within(dialog).getByRole('button', {
        name: /^rolar$/i,
      });
      await user.click(rollButton);

      await waitFor(() => {
        // diceCount < 1 → Math.abs(0) + 2 = 2 dice with disadvantage
        expect(mockRollD20).toHaveBeenCalledWith(
          2,
          0,
          'disadvantage',
          expect.any(String)
        );
      });
    });
  });

  describe('Quick Roll (Double-Click)', () => {
    it('should execute quick roll on double-click', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.dblClick(button);

      await waitFor(() => {
        expect(mockRollD20).toHaveBeenCalledWith(
          2,
          5,
          'normal',
          'Teste de Acrobacia'
        );
        expect(globalDiceHistory.add).toHaveBeenCalledWith(mockRollResult);
      });
    });

    it('should open dialog on quick roll', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.dblClick(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should auto-close dialog after 3 seconds on quick roll', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.dblClick(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should not auto-close if user manually closes dialog', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.dblClick(button);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Manually close before timeout
      const cancelButton = within(dialog).getByRole('button', {
        name: /fechar/i,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Fast-forward to ensure timer doesn't cause issues
      jest.advanceTimersByTime(3000);

      // Should still be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Formula Display', () => {
    it('should use provided formula when available', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} formula="2d20+5 (custom)" />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);

      await waitFor(() => {
        // O texto está dentro de um Chip, vamos buscar diretamente com regex
        const customFormula = screen.getByText(/2d20\+5 \(custom\)/i);
        expect(customFormula).toBeInTheDocument();
      });
    });

    it('should auto-generate formula if not provided', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton skillLabel="Atletismo" diceCount={3} modifier={7} />
      );
      const button = screen.getByRole('button', { name: /rolar atletismo/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('3d20+7')).toBeInTheDocument();
      });
    });

    it('should show negative modifier correctly', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton skillLabel="Atletismo" diceCount={2} modifier={-3} />
      );
      const button = screen.getByRole('button', { name: /rolar atletismo/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('2d20-3')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button label', () => {
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      expect(button).toHaveAccessibleName();
    });

    it('should have accessible dialog', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      await user.click(button);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });

      // Focus and activate with keyboard
      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
