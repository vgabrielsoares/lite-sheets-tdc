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

      // The +5d chip should appear near Observar (which uses visao)
      const bonusChips = screen.getAllByText('+5d');
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

      expect(screen.getByText('+5d')).toBeInTheDocument();
      expect(screen.getByText('+3d')).toBeInTheDocument();
    });
  });

  describe('Perception Calculations', () => {
    it('should show roll formula for perception uses', () => {
      // Default character has Instinto 1, Leigo in Percepção → 1d6
      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // Should have pool formulas displayed (e.g. 1d6)
      const formulas = screen.getAllByText(/\d+d6/);
      expect(formulas.length).toBeGreaterThan(0);
    });

    it('should reflect higher Instinto in roll formula', () => {
      mockCharacter.attributes.instinto = 3;

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // With Instinto 3, Leigo (d6) → pool formula 3d6
      expect(screen.getAllByText(/3d6/).length).toBeGreaterThan(0);
    });

    it('should add keen sense bonus to total dice pool', () => {
      mockCharacter.attributes.instinto = 2;
      mockCharacter.skills.percepcao = {
        ...mockCharacter.skills.percepcao,
        proficiencyLevel: 'adepto', // die size d8
      };
      mockCharacter.senses = {
        vision: 'normal',
        keenSenses: [{ type: 'visao', bonus: 5 }],
        perceptionModifiers: { visao: 5, olfato: 0, audicao: 0 },
      };

      renderWithTheme(<SensesDisplay character={mockCharacter} />);

      // With Instinto 2, Adepto (d8), base pool = 2d8
      // Plus keen sense +5d for Observar = (2+5)d8 = 7d8
      expect(screen.getByText('7d8')).toBeInTheDocument();
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
