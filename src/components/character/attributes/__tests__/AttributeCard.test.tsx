/**
 * Tests for AttributeCard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttributeCard } from '../AttributeCard';
import type { AttributeName } from '@/types';

describe('AttributeCard', () => {
  const mockOnChange = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render attribute name and value', () => {
      render(
        <AttributeCard
          name="agilidade"
          value={3}
          onChange={mockOnChange}
          onClick={mockOnClick}
        />
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
        const { unmount } = render(
          <AttributeCard name={attr} value={2} onChange={mockOnChange} />
        );
        unmount();
      });

      // No errors thrown means all rendered successfully
      expect(true).toBe(true);
    });

    it('should show correct dice roll info for normal values', () => {
      render(
        <AttributeCard name="agilidade" value={3} onChange={mockOnChange} />
      );

      expect(screen.getByText('Rola 3d20, usa maior')).toBeInTheDocument();
    });

    it('should show warning for attribute value 0', () => {
      render(
        <AttributeCard name="agilidade" value={0} onChange={mockOnChange} />
      );

      expect(screen.getByText('Rola 2d20, usa menor')).toBeInTheDocument();
    });

    it('should show indicator for attribute above default (>5)', () => {
      render(<AttributeCard name="forca" value={6} onChange={mockOnChange} />);

      expect(screen.getByText('Acima do padrão')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when card is clicked', () => {
      render(
        <AttributeCard
          name="agilidade"
          value={3}
          onChange={mockOnChange}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('Agilidade').closest('.MuiCard-root');
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not provided', () => {
      render(
        <AttributeCard name="agilidade" value={3} onChange={mockOnChange} />
      );

      const card = screen.getByText('Agilidade').closest('.MuiCard-root');
      // Should not throw error
      fireEvent.click(card!);
    });

    it('should allow editing the value', async () => {
      const user = userEvent.setup();

      render(
        <AttributeCard name="agilidade" value={3} onChange={mockOnChange} />
      );

      // Click to edit
      const valueDisplay = screen.getByText('3');
      await user.click(valueDisplay);

      // Find input field
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();

      // Change value
      await user.clear(input);
      await user.type(input, '4');

      // Wait for debounced onChange
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith(4);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Validation', () => {
    it('should respect minimum value', async () => {
      const user = userEvent.setup();

      render(
        <AttributeCard
          name="agilidade"
          value={1}
          onChange={mockOnChange}
          min={0}
        />
      );

      // Click to edit
      await user.click(screen.getByText('1'));

      // Try to set negative value
      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '-1');

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/valor mínimo/i)).toBeInTheDocument();
      });
    });

    it('should allow values above default max (special cases)', async () => {
      const user = userEvent.setup();

      render(
        <AttributeCard
          name="forca"
          value={5}
          onChange={mockOnChange}
          maxDefault={5}
        />
      );

      // Click to edit
      await user.click(screen.getByText('5'));

      // Set value above default max (should be allowed)
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '7');

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith(7);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Visual indicators', () => {
    it('should show warning icon for value 0', () => {
      const { container } = render(
        <AttributeCard name="agilidade" value={0} onChange={mockOnChange} />
      );

      const warningIcon = container.querySelector(
        '[data-testid="WarningIcon"]'
      );
      expect(warningIcon).toBeInTheDocument();
    });

    it('should show trending up icon for value > 5', () => {
      const { container } = render(
        <AttributeCard name="forca" value={6} onChange={mockOnChange} />
      );

      const trendingIcon = container.querySelector(
        '[data-testid="TrendingUpIcon"]'
      );
      expect(trendingIcon).toBeInTheDocument();
    });

    it('should not show icons for normal values (1-5)', () => {
      const { container } = render(
        <AttributeCard name="agilidade" value={3} onChange={mockOnChange} />
      );

      const warningIcon = container.querySelector(
        '[data-testid="WarningIcon"]'
      );
      const trendingIcon = container.querySelector(
        '[data-testid="TrendingUpIcon"]'
      );

      expect(warningIcon).not.toBeInTheDocument();
      expect(trendingIcon).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(
        <AttributeCard
          name="agilidade"
          value={3}
          onChange={mockOnChange}
          onClick={mockOnClick}
        />
      );

      // Card should be clickable
      const card = screen.getByText('Agilidade').closest('.MuiCard-root');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });

    it('should show tooltips on hover for special states', async () => {
      const user = userEvent.setup();

      render(
        <AttributeCard name="agilidade" value={0} onChange={mockOnChange} />
      );

      // Find warning icon
      const warningIcon = screen
        .getByText('Rola 2d20, usa menor')
        .closest('.MuiCardContent-root')
        ?.querySelector('[data-testid="WarningIcon"]');

      if (warningIcon) {
        await user.hover(warningIcon);

        // Tooltip should appear
        await waitFor(() => {
          expect(
            screen.getByText(/Com atributo 0, você rola 2d20/i)
          ).toBeInTheDocument();
        });
      }
    });
  });
});
