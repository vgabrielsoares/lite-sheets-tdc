/**
 * Tests for AttributeCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttributeCard } from '../AttributeCard';
import type { AttributeName } from '@/types';

describe('AttributeCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render attribute name and value', () => {
      render(
        <AttributeCard name="agilidade" value={3} onClick={mockOnClick} />
      );

      expect(screen.getByText('Agilidade')).toBeInTheDocument();
      expect(screen.getByText('AGI')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render all six attributes correctly', () => {
      const attributes: AttributeName[] = [
        'agilidade',
        'constituicao',
        'forca',
        'influencia',
        'mente',
        'presenca',
      ];

      attributes.forEach((attr) => {
        const { unmount } = render(<AttributeCard name={attr} value={2} />);
        unmount();
      });

      // No errors thrown means all rendered successfully
      expect(true).toBe(true);
    });

    it('should show correct dice roll info for normal values', () => {
      render(<AttributeCard name="agilidade" value={3} />);

      expect(screen.getByText('Rola 3d20, usa maior')).toBeInTheDocument();
    });

    it('should show warning for attribute value 0', () => {
      render(<AttributeCard name="agilidade" value={0} />);

      expect(screen.getByText('Rola 2d20, usa menor')).toBeInTheDocument();
    });

    it('should show indicator for attribute above default (>5)', () => {
      render(<AttributeCard name="forca" value={6} />);

      expect(screen.getByText('Acima do padrão')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when card is clicked', () => {
      render(
        <AttributeCard name="agilidade" value={3} onClick={mockOnClick} />
      );

      const card = screen.getByText('Agilidade').closest('.MuiCard-root');
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not provided', () => {
      render(<AttributeCard name="agilidade" value={3} />);

      const card = screen.getByText('Agilidade').closest('.MuiCard-root');
      // Should not throw error
      fireEvent.click(card!);
    });

    it('should display value as read-only (no edit mode)', () => {
      render(<AttributeCard name="agilidade" value={3} />);

      // Value should be displayed but not editable
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should show warning icon for value 0', () => {
      const { container } = render(
        <AttributeCard name="agilidade" value={0} />
      );

      // Check for warning icon
      const warningIcon = container.querySelector(
        '[data-testid="WarningIcon"]'
      );
      expect(warningIcon).toBeInTheDocument();
    });

    it('should show trending up icon for value above 5', () => {
      const { container } = render(<AttributeCard name="forca" value={6} />);

      // Check for trending up icon
      const trendingIcon = container.querySelector(
        '[data-testid="TrendingUpIcon"]'
      );
      expect(trendingIcon).toBeInTheDocument();
    });

    it('should have hover effect when onClick is provided', () => {
      const { container } = render(
        <AttributeCard name="agilidade" value={3} onClick={mockOnClick} />
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });

    it('should not have hover effect when onClick is not provided', () => {
      const { container } = render(
        <AttributeCard name="agilidade" value={3} />
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).toHaveStyle({ cursor: 'default' });
    });
  });
});
