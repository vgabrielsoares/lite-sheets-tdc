/**
 * Tests for SkillRollButton component (v0.0.2 Pool System)
 *
 * Covers:
 * - Rendering with different props
 * - Dialog opening and closing
 * - Roll execution with pool dice system
 * - Different attribute values and proficiency levels
 * - Success/failure feedback with required successes
 * - Quick roll on double-click
 * - Dice modifier adjustments
 * - Edge cases (attribute 0, penalty rolls)
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillRollButton } from '../SkillRollButton';
import { globalDiceHistory } from '@/utils/diceRoller';
import type { DicePoolResult } from '@/types';

// Mock the dice roller utility
jest.mock('@/utils/diceRoller', () => {
  const actualModule = jest.requireActual('@/utils/diceRoller');
  return {
    ...actualModule,
    rollSkillTest: jest.fn(),
    globalDiceHistory: {
      add: jest.fn(),
      getHistory: jest.fn(() => []),
      clear: jest.fn(),
    },
  };
});

const mockRollSkillTest = require('@/utils/diceRoller').rollSkillTest;

describe('SkillRollButton', () => {
  const defaultProps = {
    skillLabel: 'Acrobacia',
    attributeValue: 3,
    proficiencyLevel: 'leigo' as const,
    diceModifier: 0,
  };

  const mockPoolResult: DicePoolResult = {
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
    context: 'Teste de Acrobacia',
    isPenaltyRoll: false,
    diceModifier: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRollSkillTest.mockReturnValue(mockPoolResult);
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

    it('should show default tooltip with dice info', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.hover(button);
      await waitFor(() => {
        expect(screen.getByText(/rolar 3d6/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog on click', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/teste de acrobacia/i)).toBeInTheDocument();
    });

    it('should close dialog when clicking close button', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const closeButton = screen.getByRole('button', { name: /fechar/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show dice configuration in dialog', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      // Should show dice formula and proficiency level
      expect(screen.getByText('3d6')).toBeInTheDocument();
      expect(screen.getByText(/leigo/i)).toBeInTheDocument();
    });

    it('should show required successes when provided', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} requiredSuccesses={2} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      expect(screen.getByText(/precisa: 2✶/i)).toBeInTheDocument();
    });
  });

  describe('Roll Execution', () => {
    it('should call rollSkillTest with correct parameters', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        3, // attributeValue
        'd6', // dieSize from 'leigo'
        0, // diceModifier
        'Teste de Acrobacia' // context
      );
    });

    it('should add result to global history', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(globalDiceHistory.add).toHaveBeenCalledWith(mockPoolResult);
    });

    it('should call onRoll callback with result', async () => {
      const onRoll = jest.fn();
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} onRoll={onRoll} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(onRoll).toHaveBeenCalledWith(mockPoolResult);
    });

    it('should display result after rolling', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      // Should show the net successes (0 in this case) - may appear multiple times
      const successTexts = screen.getAllByText(/0✶/);
      expect(successTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Proficiency Levels', () => {
    it('should use d6 for leigo', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} proficiencyLevel="leigo" />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        expect.anything(),
        'd6',
        expect.anything(),
        expect.anything()
      );
    });

    it('should use d8 for adepto', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} proficiencyLevel="adepto" />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        expect.anything(),
        'd8',
        expect.anything(),
        expect.anything()
      );
    });

    it('should use d10 for versado', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} proficiencyLevel="versado" />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        expect.anything(),
        'd10',
        expect.anything(),
        expect.anything()
      );
    });

    it('should use d12 for mestre', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} proficiencyLevel="mestre" />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        expect.anything(),
        'd12',
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Success/Failure Feedback', () => {
    it('should show success alert when net successes >= required', async () => {
      const successResult: DicePoolResult = {
        ...mockPoolResult,
        netSuccesses: 3,
      };
      mockRollSkillTest.mockReturnValue(successResult);

      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} requiredSuccesses={2} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(screen.getByText(/sucesso!/i)).toBeInTheDocument();
    });

    it('should show failure alert when net successes < required', async () => {
      const failResult: DicePoolResult = {
        ...mockPoolResult,
        netSuccesses: 1,
      };
      mockRollSkillTest.mockReturnValue(failResult);

      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} requiredSuccesses={3} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(screen.getByText(/falha\./i)).toBeInTheDocument();
    });

    it('should not show feedback when required successes not provided', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(screen.queryByText(/sucesso!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/falha\./i)).not.toBeInTheDocument();
    });
  });

  describe('Dice Modifier', () => {
    it('should allow adjusting dice modifier', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      // Find the modifier input and change it
      const modifierInput = screen.getByLabelText(/\+\/- dados/i);
      await user.clear(modifierInput);
      await user.type(modifierInput, '2');

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        3, // attributeValue
        'd6', // dieSize
        2, // modified diceModifier
        'Teste de Acrobacia'
      );
    });

    it('should use initial diceModifier prop', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} diceModifier={1} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        3, // attributeValue
        'd6', // dieSize
        1, // initial diceModifier
        'Teste de Acrobacia'
      );
    });
  });

  describe('Attribute Value Edge Cases', () => {
    it('should show penalty indicator for attribute 0', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} attributeValue={0} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      // The dialog shows a "Penalidade" chip - look within the dialog
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Penalidade')).toBeInTheDocument();
    });

    it('should show effective dice as "2 (menor)" for penalty rolls', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} attributeValue={0} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      expect(screen.getByText('2 (menor)d6')).toBeInTheDocument();
    });

    it('should handle negative total dice (penalty from modifier)', async () => {
      const user = userEvent.setup();
      render(
        <SkillRollButton
          {...defaultProps}
          attributeValue={1}
          diceModifier={-3}
        />
      );

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.click(button);

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Penalidade')).toBeInTheDocument();
    });
  });

  describe('Quick Roll', () => {
    it('should execute quick roll on double-click', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.dblClick(button);

      expect(mockRollSkillTest).toHaveBeenCalled();
      expect(globalDiceHistory.add).toHaveBeenCalled();
    });

    it('should call onRoll callback on quick roll', async () => {
      const onRoll = jest.fn();
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} onRoll={onRoll} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.dblClick(button);

      expect(onRoll).toHaveBeenCalled();
    });

    it('should open dialog with result on quick roll', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /rolar acrobacia/i });
      await user.dblClick(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // May have multiple success displays
        const successTexts = screen.getAllByText(/0✶/);
        expect(successTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Different Skills', () => {
    it('should display skill name correctly', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} skillLabel="Atletismo" />);

      const button = screen.getByRole('button', { name: /rolar atletismo/i });
      await user.click(button);

      expect(screen.getByText(/teste de atletismo/i)).toBeInTheDocument();
    });

    it('should include skill name in roll context', async () => {
      const user = userEvent.setup();
      render(<SkillRollButton {...defaultProps} skillLabel="Furtividade" />);

      const button = screen.getByRole('button', { name: /rolar furtividade/i });
      await user.click(button);

      const rollButton = screen.getByRole('button', { name: /rolar$/i });
      await user.click(rollButton);

      expect(mockRollSkillTest).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'Teste de Furtividade'
      );
    });
  });
});
