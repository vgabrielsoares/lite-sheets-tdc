/**
 * Tests for MovementDisplay component
 *
 * This component displays movement speeds using Chips.
 * Only non-zero movements are shown.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MovementDisplay } from '../MovementDisplay';
import type { MovementType, MovementSpeed } from '@/types';

describe('MovementDisplay', () => {
  // Default movement using old number format (backwards compatible)
  const defaultMovementNumber: Record<MovementType, number> = {
    andando: 9,
    voando: 0,
    escalando: 0,
    escavando: 0,
    nadando: 0,
  };

  // Default movement using new MovementSpeed format
  const defaultMovementSpeed: Record<MovementType, MovementSpeed> = {
    andando: { base: 9, bonus: 0 },
    voando: { base: 0, bonus: 0 },
    escalando: { base: 0, bonus: 0 },
    escavando: { base: 0, bonus: 0 },
    nadando: { base: 0, bonus: 0 },
  };

  describe('Rendering', () => {
    it('renders correctly with number format (backwards compatible)', () => {
      render(<MovementDisplay movement={defaultMovementNumber} />);

      expect(screen.getByText('Deslocamento')).toBeInTheDocument();
      // Walking speed should show as chip "9m"
      expect(screen.getByText('9m')).toBeInTheDocument();
    });

    it('renders correctly with MovementSpeed format', () => {
      render(<MovementDisplay movement={defaultMovementSpeed} />);

      expect(screen.getByText('Deslocamento')).toBeInTheDocument();
      expect(screen.getByText('9m')).toBeInTheDocument();
    });

    it('displays only non-zero movements as chips', () => {
      const movementWithMultiple: Record<MovementType, MovementSpeed> = {
        andando: { base: 9, bonus: 0 },
        voando: { base: 12, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 6, bonus: 0 },
      };

      render(<MovementDisplay movement={movementWithMultiple} />);

      // Should show three chips (andando, voando, nadando)
      expect(screen.getByText('9m')).toBeInTheDocument();
      expect(screen.getByText('12m')).toBeInTheDocument();
      expect(screen.getByText('6m')).toBeInTheDocument();
    });

    it('shows "Nenhum deslocamento" when all movements are zero', () => {
      const zeroMovement: Record<MovementType, MovementSpeed> = {
        andando: { base: 0, bonus: 0 },
        voando: { base: 0, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      };

      render(<MovementDisplay movement={zeroMovement} />);

      expect(screen.getByText('Nenhum deslocamento')).toBeInTheDocument();
    });
  });

  describe('Bonus handling', () => {
    it('calculates total correctly with positive bonus', () => {
      const movementWithBonus: Record<MovementType, MovementSpeed> = {
        andando: { base: 9, bonus: 3 }, // total: 12
        voando: { base: 0, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      };

      render(<MovementDisplay movement={movementWithBonus} />);

      expect(screen.getByText('12m')).toBeInTheDocument();
    });

    it('calculates total correctly with negative bonus', () => {
      const movementWithNegativeBonus: Record<MovementType, MovementSpeed> = {
        andando: { base: 9, bonus: -3 }, // total: 6
        voando: { base: 0, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      };

      render(<MovementDisplay movement={movementWithNegativeBonus} />);

      expect(screen.getByText('6m')).toBeInTheDocument();
    });

    it('treats negative total as zero', () => {
      const movementWithLargeNegativeBonus: Record<
        MovementType,
        MovementSpeed
      > = {
        andando: { base: 3, bonus: -10 }, // total would be -7, but should be 0
        voando: { base: 0, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      };

      render(<MovementDisplay movement={movementWithLargeNegativeBonus} />);

      // Should show "Nenhum deslocamento" since all are zero or negative
      expect(screen.getByText('Nenhum deslocamento')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders walking icon for andando', () => {
      render(<MovementDisplay movement={defaultMovementSpeed} />);

      // There should be at least one DirectionsWalkIcon (in header)
      expect(
        screen.getAllByTestId('DirectionsWalkIcon').length
      ).toBeGreaterThanOrEqual(1);
    });

    it('renders appropriate icons for each movement type', () => {
      const allMovement: Record<MovementType, MovementSpeed> = {
        andando: { base: 9, bonus: 0 },
        voando: { base: 12, bonus: 0 },
        escalando: { base: 6, bonus: 0 },
        escavando: { base: 3, bonus: 0 },
        nadando: { base: 9, bonus: 0 },
      };

      render(<MovementDisplay movement={allMovement} />);

      // Check for icons
      expect(
        screen.getAllByTestId('DirectionsWalkIcon').length
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('FlightIcon')).toBeInTheDocument();
      expect(
        screen.getAllByTestId('TerrainIcon').length
      ).toBeGreaterThanOrEqual(2); // escalando + escavando (rotated)
      expect(screen.getByTestId('WavesIcon')).toBeInTheDocument();
    });

    it('has info icon for tooltip', () => {
      render(<MovementDisplay movement={defaultMovementSpeed} />);

      expect(screen.getByTestId('InfoIcon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onOpenDetails when paper is clicked', async () => {
      const mockOnOpenDetails = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <MovementDisplay
          movement={defaultMovementSpeed}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Click on the Paper component (the outermost clickable element)
      const paper = container.querySelector('.MuiPaper-root');
      if (paper) {
        await user.click(paper);
        expect(mockOnOpenDetails).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('All movement types', () => {
    it('displays all five movement types when all are non-zero', () => {
      const allMovement: Record<MovementType, MovementSpeed> = {
        andando: { base: 9, bonus: 0 },
        voando: { base: 12, bonus: 0 },
        escalando: { base: 6, bonus: 0 },
        escavando: { base: 3, bonus: 0 },
        nadando: { base: 15, bonus: 0 },
      };

      render(<MovementDisplay movement={allMovement} />);

      // Should show all 5 speeds
      expect(screen.getByText('9m')).toBeInTheDocument(); // andando
      expect(screen.getByText('12m')).toBeInTheDocument(); // voando
      expect(screen.getByText('6m')).toBeInTheDocument(); // escalando
      expect(screen.getByText('3m')).toBeInTheDocument(); // escavando
      expect(screen.getByText('15m')).toBeInTheDocument(); // nadando
    });

    it('handles high movement values', () => {
      const highMovement: Record<MovementType, MovementSpeed> = {
        andando: { base: 50, bonus: 10 },
        voando: { base: 100, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      };

      render(<MovementDisplay movement={highMovement} />);

      expect(screen.getByText('60m')).toBeInTheDocument(); // 50 + 10
      expect(screen.getByText('100m')).toBeInTheDocument();
    });
  });
});
