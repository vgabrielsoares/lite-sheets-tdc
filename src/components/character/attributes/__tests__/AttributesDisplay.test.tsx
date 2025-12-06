/**
 * Tests for AttributesDisplay component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  describe('Renderização', () => {
    it('deve renderizar título Atributos', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Atributos')).toBeInTheDocument();
    });

    it('deve renderizar label de atributos corporais', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Corporais')).toBeInTheDocument();
    });

    it('deve renderizar label de atributos mentais', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('Mentais')).toBeInTheDocument();
    });

    it('deve renderizar todos os 6 atributos', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      expect(screen.getByText('AGI')).toBeInTheDocument();
      expect(screen.getByText('CON')).toBeInTheDocument();
      expect(screen.getByText('FOR')).toBeInTheDocument();
      expect(screen.getByText('INF')).toBeInTheDocument();
      expect(screen.getByText('MEN')).toBeInTheDocument();
      expect(screen.getByText('PRE')).toBeInTheDocument();
    });

    it('deve exibir os valores corretos dos atributos', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      // Verifica que existem múltiplos valores - devido ao layout horizontal
      // AGI=2, INF=2, CON=3, MEN=3, FOR=1, PRE=1
      const twos = screen.getAllByText('2');
      const threes = screen.getAllByText('3');
      const ones = screen.getAllByText('1');

      expect(twos.length).toBeGreaterThanOrEqual(2); // AGI e INF
      expect(threes.length).toBeGreaterThanOrEqual(2); // CON e MEN
      expect(ones.length).toBeGreaterThanOrEqual(2); // FOR e PRE
    });
  });

  describe('Interações', () => {
    it('deve chamar onAttributeClick quando atributo é clicado', () => {
      render(
        <AttributesDisplay
          attributes={mockAttributes}
          onAttributeClick={mockOnAttributeClick}
        />
      );

      const agiCard = screen.getByText('AGI').closest('.MuiCard-root');
      if (agiCard) {
        fireEvent.click(agiCard);
      }

      expect(mockOnAttributeClick).toHaveBeenCalledWith('agilidade');
    });

    it('deve chamar onAttributeClick com atributo correto', () => {
      render(
        <AttributesDisplay
          attributes={mockAttributes}
          onAttributeClick={mockOnAttributeClick}
        />
      );

      const menteCard = screen.getByText('MEN').closest('.MuiCard-root');
      if (menteCard) {
        fireEvent.click(menteCard);
      }

      expect(mockOnAttributeClick).toHaveBeenCalledWith('mente');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter botão de informações', () => {
      render(<AttributesDisplay attributes={mockAttributes} />);

      const infoButton = screen.getByLabelText('Informações sobre atributos');
      expect(infoButton).toBeInTheDocument();
    });
  });

  describe('Valores Especiais', () => {
    it('deve exibir atributo com valor 0', () => {
      const zeroAttributes: Attributes = {
        ...mockAttributes,
        agilidade: 0,
      };

      render(<AttributesDisplay attributes={zeroAttributes} />);

      // Deve haver um "0" no display
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve exibir atributo com valor máximo (5)', () => {
      const maxAttributes: Attributes = {
        ...mockAttributes,
        forca: 5,
      };

      render(<AttributesDisplay attributes={maxAttributes} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
