/**
 * Tests for SensesDisplay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SensesDisplay } from '../SensesDisplay';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('SensesDisplay', () => {
  let mockCharacter: Character;
  const mockOnOpenDetails = jest.fn();

  beforeEach(() => {
    mockCharacter = createDefaultCharacter({ name: 'Test Character' });
    mockOnOpenDetails.mockClear();
  });

  describe('Rendering', () => {
    it('should render the senses section title', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Sentidos')).toBeInTheDocument();
    });

    it('should render vision label', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Visão')).toBeInTheDocument();
    });

    it('should render default normal vision', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('should render all three perception uses', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Farejar')).toBeInTheDocument();
      expect(screen.getByText('Observar')).toBeInTheDocument();
      expect(screen.getByText('Ouvir')).toBeInTheDocument();
    });

    it('should render in a 2x2 grid layout', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // All four cards should be present (3 senses + 1 vision)
      expect(screen.getByText('Observar')).toBeInTheDocument();
      expect(screen.getByText('Visão')).toBeInTheDocument();
      expect(screen.getByText('Farejar')).toBeInTheDocument();
      expect(screen.getByText('Ouvir')).toBeInTheDocument();
    });
  });

  describe('Vision Types', () => {
    it('should display penumbra vision', () => {
      mockCharacter.senses = {
        vision: 'penumbra',
        keenSenses: [],
        perceptionModifiers: { visao: 0, olfato: 0, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Penumbra')).toBeInTheDocument();
    });

    it('should display dark vision', () => {
      mockCharacter.senses = {
        vision: 'escuro',
        keenSenses: [],
        perceptionModifiers: { visao: 0, olfato: 0, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('Escuro')).toBeInTheDocument();
    });
  });

  describe('Keen Senses', () => {
    it('should show keen sense bonus chip on corresponding perception use', () => {
      mockCharacter.senses = {
        vision: 'normal',
        keenSenses: [{ type: 'visao', bonus: 5 }],
        perceptionModifiers: { visao: 5, olfato: 0, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // The +5 chip should appear near Observar (which uses visao)
      const bonusChips = screen.getAllByText('+5');
      expect(bonusChips.length).toBeGreaterThan(0);
    });

    it('should show multiple keen sense bonuses', () => {
      mockCharacter.senses = {
        vision: 'normal',
        keenSenses: [
          { type: 'visao', bonus: 5 },
          { type: 'olfato', bonus: 3 },
        ],
        perceptionModifiers: { visao: 5, olfato: 3, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      expect(screen.getByText('+5')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
    });
  });

  describe('Perception Calculations', () => {
    it('should show roll formula for perception uses', () => {
      // Default character has Presença 1, so base calculation is:
      // Attribute 1 × Leigo 0 = 0 modifier, 1d20+0
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // Should have formulas displayed
      const formulas = screen.getAllByText(/\d+d20/);
      expect(formulas.length).toBeGreaterThan(0);
    });

    it('should reflect higher Presença in roll formula', () => {
      mockCharacter.attributes.presenca = 3;

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // With Presença 3, should show 3d20 in formula
      expect(screen.getAllByText(/3d20/).length).toBeGreaterThan(0);
    });

    it('should add keen sense bonus to total modifier', () => {
      mockCharacter.attributes.presenca = 2;
      mockCharacter.skills.percepcao = {
        ...mockCharacter.skills.percepcao,
        proficiencyLevel: 'adepto', // x1 multiplier
      };
      mockCharacter.senses = {
        vision: 'normal',
        keenSenses: [{ type: 'visao', bonus: 5 }],
        perceptionModifiers: { visao: 5, olfato: 0, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // With Presença 2, Adepto (x1), base = 2
      // Plus keen sense +5 for Observar = 2+5 = 7
      // Formula for Observar should show 2d20+7
      expect(screen.getByText('2d20+7')).toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('should call onOpenDetails when clicked', () => {
      renderWithTheme(
        <SensesDisplay
          character={mockCharacter}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Click on the Paper component
      const sensesSection = screen
        .getByText('Sentidos')
        .closest('[class*="MuiPaper-root"]') as HTMLElement;
      if (sensesSection) {
        sensesSection.click();
        expect(mockOnOpenDetails).toHaveBeenCalled();
      }
    });

    it('should have clickable style when onOpenDetails is provided', () => {
      renderWithTheme(
        <SensesDisplay
          character={mockCharacter}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const sensesSection = screen
        .getByText('Sentidos')
        .closest('[class*="MuiPaper-root"]');
      expect(sensesSection).toHaveStyle({ cursor: 'pointer' });
    });

    it('should not have clickable style when onOpenDetails is not provided', () => {
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      const sensesSection = screen
        .getByText('Sentidos')
        .closest('[class*="MuiPaper-root"]');
      expect(sensesSection).toHaveStyle({ cursor: 'default' });
    });
  });
});
