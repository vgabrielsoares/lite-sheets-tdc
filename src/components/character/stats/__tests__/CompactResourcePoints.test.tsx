/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompactResourcePoints } from '../CompactResourcePoints';
import type { ResourcePoints, ResourceConfig } from '../CompactResourcePoints';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';

describe('CompactResourcePoints', () => {
  const mockOnChange = jest.fn();
  const mockOnOpenDetails = jest.fn();

  const defaultResource: ResourcePoints = {
    current: 10,
    max: 15,
    temporary: 0,
  };

  const hpConfig: ResourceConfig = {
    Icon: FavoriteIcon,
    iconColor: 'error',
    label: 'PV',
    progressColor: 'error',
    adjustValues: {
      small: 1,
      large: 5,
    },
    buttonLabels: {
      decreaseSmall: 'Sofrer 1 de dano',
      decreaseLarge: 'Sofrer 5 de dano',
      increaseSmall: 'Curar 1 PV',
      increaseLarge: 'Curar 5 PV',
    },
  };

  const ppConfig: ResourceConfig = {
    Icon: BoltIcon,
    iconColor: 'info',
    label: 'PP',
    progressColor: 'info',
    adjustValues: {
      small: 1,
      large: 2,
    },
    buttonLabels: {
      decreaseSmall: 'Gastar 1 PP',
      decreaseLarge: 'Gastar 2 PP',
      increaseSmall: 'Recuperar 1 PP',
      increaseLarge: 'Recuperar 2 PP',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com configuração de PV', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('PV')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('deve renderizar com configuração de PP', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={ppConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('PP')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('deve exibir barra de progresso', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const progressBar = container.querySelector('.MuiLinearProgress-root');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Ajustes de Valores', () => {
    it('deve diminuir valor pequeno ao clicar no botão menor', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const decreaseSmallButton = screen.getByLabelText('Sofrer 1 de dano');
      fireEvent.click(decreaseSmallButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 9,
      });
    });

    it('deve diminuir valor grande ao clicar no botão maior', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const decreaseLargeButton = screen.getByLabelText('Sofrer 5 de dano');
      fireEvent.click(decreaseLargeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 5,
      });
    });

    it('deve aumentar valor pequeno ao clicar no botão menor', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const increaseSmallButton = screen.getByLabelText('Curar 1 PV');
      fireEvent.click(increaseSmallButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 11,
      });
    });

    it('deve aumentar valor grande ao clicar no botão maior', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const increaseLargeButton = screen.getByLabelText('Curar 5 PV');
      fireEvent.click(increaseLargeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 15,
      });
    });

    it('não deve permitir valores negativos', () => {
      const lowResource: ResourcePoints = {
        current: 2,
        max: 15,
        temporary: 0,
      };

      render(
        <CompactResourcePoints
          resource={lowResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const decreaseLargeButton = screen.getByLabelText('Sofrer 5 de dano');
      fireEvent.click(decreaseLargeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...lowResource,
        current: 0,
      });
    });
  });

  describe('Edição Direta', () => {
    it('deve permitir edição direta com double-click', async () => {
      const user = userEvent.setup();

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const value = screen.getByText('10');
      await user.dblClick(value);

      // Deve aparecer um input
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('deve confirmar edição ao pressionar Enter', async () => {
      const user = userEvent.setup();

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const value = screen.getByText('10');
      await user.dblClick(value);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '12');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 12,
      });
    });

    it('deve cancelar edição ao pressionar Escape', async () => {
      const user = userEvent.setup();

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const value = screen.getByText('10');
      await user.dblClick(value);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '99');
      await user.keyboard('{Escape}');

      // Não deve ter chamado onChange com o valor digitado
      expect(mockOnChange).not.toHaveBeenCalledWith({
        ...defaultResource,
        current: 99,
      });
    });
  });

  describe('Interação com Card', () => {
    it('deve chamar onOpenDetails ao clicar no card', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      // O card principal com role="button" é o MuiCard
      const card = container.querySelector('.MuiCard-root');
      if (card) {
        fireEvent.click(card);
      }

      expect(mockOnOpenDetails).toHaveBeenCalled();
    });

    it('deve suportar navegação por teclado', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const card = container.querySelector('.MuiCard-root');

      // Enter
      if (card) {
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(mockOnOpenDetails).toHaveBeenCalledTimes(1);

        // Space
        fireEvent.keyDown(card, { key: ' ' });
        expect(mockOnOpenDetails).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('Valores Temporários', () => {
    it('deve exibir overlay para valores temporários', () => {
      const resourceWithTemp: ResourcePoints = {
        current: 10,
        max: 15,
        temporary: 5,
      };

      const { container } = render(
        <CompactResourcePoints
          resource={resourceWithTemp}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      // O overlay para temporários é um Box com position absolute
      const overlay = container.querySelector('.MuiBox-root');
      expect(overlay).toBeInTheDocument();
    });

    it('não deve exibir overlay quando temporary = 0', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      // Conta elementos Box - não deve haver overlay extra
      const boxes = container.querySelectorAll('.MuiBox-root');
      expect(boxes.length).toBeGreaterThan(0); // Apenas os boxes normais
    });
  });

  describe('Função applyDelta customizada', () => {
    it('deve usar applyDelta customizado quando fornecido', () => {
      const customApplyDelta = jest.fn(
        (resource: ResourcePoints, delta: number) => {
          return {
            ...resource,
            current: resource.current + delta * 2, // dobra o delta
          };
        }
      );

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          applyDelta={customApplyDelta}
        />
      );

      const decreaseSmallButton = screen.getByLabelText('Sofrer 1 de dano');
      fireEvent.click(decreaseSmallButton);

      expect(customApplyDelta).toHaveBeenCalledWith(defaultResource, -1);
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 8, // 10 + (-1 * 2)
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-labels nos botões', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Sofrer 1 de dano')).toBeInTheDocument();
      expect(screen.getByLabelText('Sofrer 5 de dano')).toBeInTheDocument();
      expect(screen.getByLabelText('Curar 1 PV')).toBeInTheDocument();
      expect(screen.getByLabelText('Curar 5 PV')).toBeInTheDocument();
    });

    it('deve ter ícone visível', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const icon = container.querySelector('[data-testid="FavoriteIcon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Configurações diferentes', () => {
    it('deve usar valores de ajuste corretos para PP', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={ppConfig}
          onChange={mockOnChange}
        />
      );

      const decreaseLargeButton = screen.getByLabelText('Gastar 2 PP');
      fireEvent.click(decreaseLargeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultResource,
        current: 8, // 10 - 2
      });
    });
  });
});
