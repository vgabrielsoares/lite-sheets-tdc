/**
 * Tests for AttributesDisplay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AttributesDisplay } from '../AttributesDisplay';
import type { Attributes } from '@/types';

describe('AttributesDisplay', () => {
  const mockAttributes: Attributes = {
    agilidade: 2,
    constituicao: 3,
    forca: 1,
    influencia: 2,
    mente: 3,
    presenca: 1,
  };

  const mockOnAttributeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component title', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Atributos')).toBeInTheDocument();
    });

    it('should render physical attributes section', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Atributos Corporais')).toBeInTheDocument();
      expect(screen.getByText('Agilidade')).toBeInTheDocument();
      expect(screen.getByText('Constituição')).toBeInTheDocument();
      expect(screen.getByText('Força')).toBeInTheDocument();
    });

    it('should render mental attributes section', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Atributos Mentais')).toBeInTheDocument();
      expect(screen.getByText('Influência')).toBeInTheDocument();
      expect(screen.getByText('Mente')).toBeInTheDocument();
      expect(screen.getByText('Presença')).toBeInTheDocument();
    });

    it('should render all attribute values correctly', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      // Check all values are displayed (may appear multiple times due to abbreviations)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });

    it('should render explanatory note', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(
        screen.getByText(/Clique em um atributo para abrir a sidebar/)
      ).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onAttributeClick when attribute card is clicked', () => {
      render(
        <AttributesDisplay
          attributes={mockAttributes}
          onAttributeClick={mockOnAttributeClick}
        />
      );

      const agilidadeCard = screen
        .getByText('Agilidade')
        .closest('.MuiCard-root');
      agilidadeCard!.click();

      expect(mockOnAttributeClick).toHaveBeenCalledWith('agilidade');
    });

    it('should not crash when onAttributeClick is not provided', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      const agilidadeCard = screen
        .getByText('Agilidade')
        .closest('.MuiCard-root');
      // Should not throw error
      agilidadeCard!.click();
    });
  });

  describe('Layout', () => {
    it('should separate physical and mental attributes with divider', () => {
      const { container } = render(
        <AttributesDisplay attributes={mockAttributes} />
      );

      const dividers = container.querySelectorAll('.MuiDivider-root');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });
});
