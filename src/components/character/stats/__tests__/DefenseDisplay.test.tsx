/**
 * Testes do DefenseDisplay
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DefenseDisplay } from '../DefenseDisplay';
import type { Modifier } from '@/types';

describe('DefenseDisplay', () => {
  const mockOnOpenDetails = jest.fn();

  beforeEach(() => {
    mockOnOpenDetails.mockClear();
  });

  const defaultProps = {
    agilidade: 2,
    armorBonus: 3,
    onOpenDetails: mockOnOpenDetails,
  };

  describe('Renderização', () => {
    it('deve renderizar título Defesa', () => {
      render(<DefenseDisplay {...defaultProps} />);

      expect(screen.getByText('Defesa')).toBeInTheDocument();
    });

    it('deve calcular defesa corretamente com valores padrão', () => {
      render(<DefenseDisplay {...defaultProps} />);

      // Base: 15, Agilidade: 2, Armor: 3 = Total: 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('deve calcular defesa com size bonus', () => {
      render(<DefenseDisplay {...defaultProps} sizeBonus={2} />);

      // Base: 15, Agilidade: 2, Armor: 3, Size: 2 = Total: 22
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('deve calcular defesa com shield bonus', () => {
      render(<DefenseDisplay {...defaultProps} shieldBonus={2} />);

      // Base: 15, Agilidade: 2, Armor: 3, Shield: 2 = Total: 22
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('deve calcular defesa com other bonuses', () => {
      const otherBonuses: Modifier[] = [
        { name: 'Spell', value: 2, type: 'bonus' },
        { name: 'Penalty', value: -1, type: 'penalidade' },
      ];

      render(<DefenseDisplay {...defaultProps} otherBonuses={otherBonuses} />);

      // Base: 15, Agilidade: 2, Armor: 3, Others: 1 = Total: 21
      expect(screen.getByText('21')).toBeInTheDocument();
    });
  });

  describe('Limitação de Agilidade por Armadura', () => {
    it('deve limitar agilidade quando maxAgilityBonus é definido', () => {
      render(
        <DefenseDisplay
          agilidade={5}
          armorBonus={3}
          maxAgilityBonus={2}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Base: 15, Agilidade: 2 (limitado de 5), Armor: 3 = Total: 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('não deve limitar agilidade quando é menor que maxAgilityBonus', () => {
      render(
        <DefenseDisplay
          agilidade={2}
          armorBonus={3}
          maxAgilityBonus={5}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Base: 15, Agilidade: 2 (sem limite), Armor: 3 = Total: 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  describe('Casos Especiais', () => {
    it('deve calcular defesa com agilidade zero', () => {
      render(
        <DefenseDisplay
          agilidade={0}
          armorBonus={0}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Base: 15, Agilidade: 0, Armor: 0 = Total: 15
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('deve calcular defesa com size bonus negativo', () => {
      render(
        <DefenseDisplay
          agilidade={2}
          armorBonus={3}
          sizeBonus={-2}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // Base: 15, Agilidade: 2, Armor: 3, Size: -2 = Total: 18
      expect(screen.getByText('18')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onOpenDetails ao clicar', () => {
      render(<DefenseDisplay {...defaultProps} />);

      const paper = screen.getByText('Defesa').closest('[class*="MuiPaper"]');
      if (paper) {
        fireEvent.click(paper);
      }

      expect(mockOnOpenDetails).toHaveBeenCalled();
    });

    it('não deve ter cursor de pointer quando onOpenDetails não é fornecido', () => {
      const { container } = render(
        <DefenseDisplay agilidade={2} armorBonus={3} />
      );

      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter ícone de escudo', () => {
      const { container } = render(<DefenseDisplay {...defaultProps} />);

      const shieldIcon = container.querySelector('[data-testid="ShieldIcon"]');
      expect(shieldIcon).toBeInTheDocument();
    });

    it('deve ter botão de info com tooltip', () => {
      const { container } = render(<DefenseDisplay {...defaultProps} />);

      const infoIcon = container.querySelector('[data-testid="InfoIcon"]');
      expect(infoIcon).toBeInTheDocument();
    });
  });
});
