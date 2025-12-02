import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LuckDisplay } from '../LuckDisplay';
import type { LuckLevel } from '@/types';

describe('LuckDisplay', () => {
  const mockOnLevelChange = jest.fn();
  const mockOnValueChange = jest.fn();

  const defaultLuck: LuckLevel = {
    level: 0,
    value: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar corretamente no modo normal', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('Nível de Sorte')).toBeInTheDocument();
      expect(
        screen.getByText(/A sorte funciona de forma única/i)
      ).toBeInTheDocument();
    });

    it('deve renderizar corretamente no modo compacto', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
          compact
        />
      );

      expect(screen.getByText('Sorte')).toBeInTheDocument();
      expect(screen.getByText('Nível')).toBeInTheDocument();
      expect(screen.getByText('Valor Total')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 0', () => {
      render(
        <LuckDisplay
          luck={{ level: 0, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('1d20')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 1', () => {
      render(
        <LuckDisplay
          luck={{ level: 1, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('2d20')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 2', () => {
      render(
        <LuckDisplay
          luck={{ level: 2, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('2d20+2')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 3', () => {
      render(
        <LuckDisplay
          luck={{ level: 3, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('3d20+3')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 4', () => {
      render(
        <LuckDisplay
          luck={{ level: 4, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('3d20+6')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 5', () => {
      render(
        <LuckDisplay
          luck={{ level: 5, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('4d20+8')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 6', () => {
      render(
        <LuckDisplay
          luck={{ level: 6, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('4d20+12')).toBeInTheDocument();
    });

    it('deve exibir a fórmula de rolagem correta para nível 7', () => {
      render(
        <LuckDisplay
          luck={{ level: 7, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('5d20+15')).toBeInTheDocument();
    });

    it('deve exibir tabela de referência no modo normal', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(
        screen.getByText('Referência Rápida de Níveis')
      ).toBeInTheDocument();
      expect(screen.getByText('Nível 0:')).toBeInTheDocument();
      expect(screen.getByText('Nível 7:')).toBeInTheDocument();
    });

    it('não deve exibir tabela de referência no modo compacto', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
          compact
        />
      );

      expect(
        screen.queryByText('Referência Rápida de Níveis')
      ).not.toBeInTheDocument();
    });

    it('deve destacar o nível atual na tabela de referência', () => {
      const { container } = render(
        <LuckDisplay
          luck={{ level: 3, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Encontra o elemento do nível 3 na tabela
      const level3Row = screen.getByText('Nível 3:').closest('div');
      expect(level3Row).toHaveStyle({ fontWeight: 600 });
    });
  });

  describe('Valores Exibidos', () => {
    it('deve exibir o nível correto', () => {
      render(
        <LuckDisplay
          luck={{ level: 5, value: 20 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Verifica na fórmula de rolagem
      expect(screen.getByText(/Nível 5/i)).toBeInTheDocument();
    });

    it('deve exibir valores diferentes de nível e valor total', () => {
      render(
        <LuckDisplay
          luck={{ level: 2, value: 15 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText(/Nível 2/i)).toBeInTheDocument();
      // Valor total é editável, então deve estar no campo
    });
  });

  describe('Fórmulas de Rolagem', () => {
    const testCases = [
      { level: 0, expected: '1d20' },
      { level: 1, expected: '2d20' },
      { level: 2, expected: '2d20+2' },
      { level: 3, expected: '3d20+3' },
      { level: 4, expected: '3d20+6' },
      { level: 5, expected: '4d20+8' },
      { level: 6, expected: '4d20+12' },
      { level: 7, expected: '5d20+15' },
    ];

    testCases.forEach(({ level, expected }) => {
      it(`deve exibir fórmula "${expected}" para nível ${level}`, () => {
        render(
          <LuckDisplay
            luck={{ level, value: 0 }}
            onLevelChange={mockOnLevelChange}
            onValueChange={mockOnValueChange}
          />
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });

    it('deve calcular fórmula dinamicamente para níveis acima de 7', () => {
      render(
        <LuckDisplay
          luck={{ level: 8, value: 0 }}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Fórmula calculada: 8d20 + (8 * 3) = 8d20+24
      expect(screen.getByText('8d20+24')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter ícone de sorte visível', () => {
      const { container } = render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const icon = container.querySelector('[data-testid="CasinoIcon"]');
      expect(icon).toBeInTheDocument();
    });

    it('deve ter labels adequados para campos editáveis', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('Nível de Sorte')).toBeInTheDocument();
      expect(screen.getByText('Valor Total')).toBeInTheDocument();
    });

    it('deve ter helper texts informativos', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      expect(screen.getByText('Níveis disponíveis: 0 a 7')).toBeInTheDocument();
      expect(
        screen.getByText('Inclui modificadores temporários e permanentes')
      ).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve usar grid responsivo no modo normal', () => {
      const { container } = render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Verifica se existe um Box com gridTemplateColumns
      const gridBox = container.querySelector(
        '[style*="grid-template-columns"]'
      );
      expect(gridBox).toBeInTheDocument();
    });
  });

  describe('Visual e Estilo', () => {
    it('deve usar cor warning para indicadores de sorte', () => {
      const { container } = render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Verifica se o ícone usa a cor warning
      const icon = container.querySelector('[data-testid="CasinoIcon"]');
      expect(icon).toHaveClass('MuiSvgIcon-colorWarning');
    });

    it('deve usar fonte monospace para fórmulas', () => {
      render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const chip = screen.getByText('1d20').closest('.MuiChip-root');
      expect(chip).toHaveStyle({ fontFamily: 'monospace' });
    });
  });
});
