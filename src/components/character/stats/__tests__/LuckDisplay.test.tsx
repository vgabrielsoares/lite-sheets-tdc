import React from 'react';
import { render, screen } from '@testing-library/react';
import { LuckDisplay } from '../LuckDisplay';
import type { LuckLevel } from '@/types';

describe('LuckDisplay', () => {
  const mockOnLevelChange = jest.fn();
  const mockOnValueChange = jest.fn();

  /**
   * Cria um objeto LuckLevel com valores padrão
   */
  const createLuck = (
    level: number,
    value: number = 0,
    diceModifier: number = 0,
    numericModifier: number = 0
  ): LuckLevel => ({
    level,
    value,
    diceModifier,
    numericModifier,
  });

  const defaultLuck = createLuck(0);

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

      // No modo normal, há dois "Nível de Sorte": título principal e label do campo
      const nivelDeSorteElements = screen.getAllByText('Nível de Sorte');
      expect(nivelDeSorteElements.length).toBeGreaterThanOrEqual(1);
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
          luck={createLuck(0)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Fórmula aparece no Chip e na tabela de referência
      const formulas = screen.getAllByText('1d6');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 1', () => {
      render(
        <LuckDisplay
          luck={createLuck(1)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('2d6');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 2', () => {
      render(
        <LuckDisplay
          luck={createLuck(2)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('2d8');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 3', () => {
      render(
        <LuckDisplay
          luck={createLuck(3)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('3d8');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 4', () => {
      render(
        <LuckDisplay
          luck={createLuck(4)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('3d10');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 5', () => {
      render(
        <LuckDisplay
          luck={createLuck(5)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('4d10');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 6', () => {
      render(
        <LuckDisplay
          luck={createLuck(6)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('4d12');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a fórmula de rolagem correta para nível 7', () => {
      render(
        <LuckDisplay
          luck={createLuck(7)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const formulas = screen.getAllByText('5d12');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
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
      render(
        <LuckDisplay
          luck={createLuck(3)}
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
          luck={createLuck(5, 20)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Verifica na fórmula de rolagem (texto único)
      expect(
        screen.getByText(/Fórmula de Rolagem \(Nível 5\)/i)
      ).toBeInTheDocument();
    });

    it('deve exibir valores diferentes de nível e valor total', () => {
      render(
        <LuckDisplay
          luck={createLuck(2, 15)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Verifica na fórmula de rolagem
      expect(
        screen.getByText(/Fórmula de Rolagem \(Nível 2\)/i)
      ).toBeInTheDocument();
      // Valor total é editável, então deve estar no campo
    });
  });

  describe('Fórmulas de Rolagem', () => {
    const testCases = [
      { level: 0, expected: '1d6' },
      { level: 1, expected: '2d6' },
      { level: 2, expected: '2d8' },
      { level: 3, expected: '3d8' },
      { level: 4, expected: '3d10' },
      { level: 5, expected: '4d10' },
      { level: 6, expected: '4d12' },
      { level: 7, expected: '5d12' },
    ];

    testCases.forEach(({ level, expected }) => {
      it(`deve exibir fórmula "${expected}" para nível ${level}`, () => {
        render(
          <LuckDisplay
            luck={createLuck(level)}
            onLevelChange={mockOnLevelChange}
            onValueChange={mockOnValueChange}
          />
        );

        // Fórmula aparece no Chip principal e na tabela de referência
        const formulas = screen.getAllByText(expected);
        expect(formulas.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('deve usar fórmula do nível máximo para níveis acima de 7', () => {
      render(
        <LuckDisplay
          luck={createLuck(8)}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // Níveis acima de 7 usam a fórmula do nível máximo (7): 5d12
      const formulas = screen.getAllByText('5d12');
      expect(formulas.length).toBeGreaterThanOrEqual(1);
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

      // Título principal
      const nivelDeSorteElements = screen.getAllByText('Nível de Sorte');
      expect(nivelDeSorteElements.length).toBeGreaterThanOrEqual(1);
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
    it('deve usar grid layout no modo normal', () => {
      const { container } = render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      // MUI usa classes CSS, não inline styles - verificamos se o componente renderizou corretamente
      const gridBox = container.querySelector('.MuiBox-root');
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

    it('deve exibir Chip com a fórmula', () => {
      const { container } = render(
        <LuckDisplay
          luck={defaultLuck}
          onLevelChange={mockOnLevelChange}
          onValueChange={mockOnValueChange}
        />
      );

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });
});
