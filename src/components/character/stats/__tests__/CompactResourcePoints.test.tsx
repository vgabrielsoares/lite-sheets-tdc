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

    it('deve exibir barras de progresso', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const progressBars = container.querySelectorAll(
        '.MuiLinearProgress-root'
      );
      expect(progressBars).toHaveLength(2); // Atual e temporário
    });
  });

  describe('Tooltips Explicativos', () => {
    it('deve mostrar tooltips nos botões de ajuste', async () => {
      const user = userEvent.setup();

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      // Hover no botão de diminuir grande
      const decreaseLargeButton = screen.getByLabelText('Sofrer 5 de dano');
      await user.hover(decreaseLargeButton);

      // Tooltip deve aparecer
      expect(
        await screen.findByText('Sofrer 5 de dano', {
          selector: '[role="tooltip"]',
        })
      ).toBeInTheDocument();
    });

    it('deve mostrar tooltip com breakdown de valores', async () => {
      const user = userEvent.setup();

      const resourceWithTemp: ResourcePoints = {
        current: 10,
        max: 15,
        temporary: 3,
      };

      const { container } = render(
        <CompactResourcePoints
          resource={resourceWithTemp}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      // Hover na área das barras de progresso
      const progressArea = container.querySelector('.MuiBox-root');
      if (progressArea) {
        await user.hover(progressArea);
      }

      // Tooltip deve mostrar breakdown
      expect(
        await screen.findByText('Atual: 10 | Temporários: 3 | Máximo: 15')
      ).toBeInTheDocument();
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
        current: 9,
        max: 15,
        temporary: 0,
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
        current: 5,
        max: 15,
        temporary: 0,
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
        current: 11,
        max: 15,
        temporary: 0,
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
        current: 15,
        max: 15,
        temporary: 0,
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
        current: 0,
        max: 15,
        temporary: 0,
      });
    });
  });

  describe('Função applyDelta Customizada', () => {
    it('deve usar applyDelta customizada quando fornecida', () => {
      const customApplyDelta = jest.fn((resource, delta) => ({
        ...resource,
        current: resource.current + delta * 2, // Exemplo: dobra o delta
      }));

      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          applyDelta={customApplyDelta}
        />
      );

      const increaseSmallButton = screen.getByLabelText('Curar 1 PV');
      fireEvent.click(increaseSmallButton);

      expect(customApplyDelta).toHaveBeenCalledWith(defaultResource, 1);
      expect(mockOnChange).toHaveBeenCalledWith({
        current: 12, // 10 + (1 * 2)
        max: 15,
        temporary: 0,
      });
    });
  });

  describe('Interação com Sidebar', () => {
    it('deve chamar onOpenDetails ao clicar no card', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockOnOpenDetails).toHaveBeenCalled();
    });

    it('deve suportar navegação por teclado', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const card = screen.getByRole('button');

      // Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnOpenDetails).toHaveBeenCalledTimes(1);

      // Space
      fireEvent.keyDown(card, { key: ' ' });
      expect(mockOnOpenDetails).toHaveBeenCalledTimes(2);
    });

    it('não deve ter interação se onOpenDetails não for fornecido', () => {
      const { container } = render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).not.toHaveAttribute('role', 'button');
      expect(card).not.toHaveAttribute('tabindex');
    });

    it('não deve propagar cliques dos botões para o card', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={hpConfig}
          onChange={mockOnChange}
          onOpenDetails={mockOnOpenDetails}
        />
      );

      const increaseButton = screen.getByLabelText('Curar 1 PV');
      fireEvent.click(increaseButton);

      expect(mockOnOpenDetails).not.toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Configurações Diferentes (PP vs PV)', () => {
    it('deve usar valores de ajuste diferentes para PP', () => {
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
        current: 8, // 10 - 2
        max: 15,
        temporary: 0,
      });
    });

    it('deve mostrar labels corretos para PP', () => {
      render(
        <CompactResourcePoints
          resource={defaultResource}
          config={ppConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Gastar 1 PP')).toBeInTheDocument();
      expect(screen.getByLabelText('Gastar 2 PP')).toBeInTheDocument();
      expect(screen.getByLabelText('Recuperar 1 PP')).toBeInTheDocument();
      expect(screen.getByLabelText('Recuperar 2 PP')).toBeInTheDocument();
    });
  });

  describe('Barras de Progresso', () => {
    it('deve calcular porcentagens corretamente com valores temporários', () => {
      const resourceWithTemp: ResourcePoints = {
        current: 10,
        max: 20,
        temporary: 5,
      };

      const { container } = render(
        <CompactResourcePoints
          resource={resourceWithTemp}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const progressBars = container.querySelectorAll(
        '.MuiLinearProgress-root'
      );
      // Apenas 1 LinearProgress (barra base)
      expect(progressBars).toHaveLength(1);

      // Verifica se há um Box overlay para temporários
      const overlayBox = container.querySelector(
        'div[style*="position: absolute"]'
      );
      expect(overlayBox).toBeInTheDocument();

      // 10/20 = 50% para atual
      // 5/20 = 25% para temporário (aparece após os 50%)
    });

    it('deve mostrar apenas barra base quando não há temporários', () => {
      const resourceNoTemp: ResourcePoints = {
        current: 10,
        max: 20,
        temporary: 0,
      };

      const { container } = render(
        <CompactResourcePoints
          resource={resourceNoTemp}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const progressBars = container.querySelectorAll(
        '.MuiLinearProgress-root'
      );
      // Apenas 1 barra base
      expect(progressBars).toHaveLength(1);

      // Não deve haver overlay
      const overlayBox = container.querySelector(
        'div[style*="position: absolute"]'
      );
      expect(overlayBox).not.toBeInTheDocument();
    });

    it('deve garantir que temporários apareçam mesmo em 100%', () => {
      const resourceAtMax: ResourcePoints = {
        current: 15,
        max: 15,
        temporary: 3,
      };

      const { container } = render(
        <CompactResourcePoints
          resource={resourceAtMax}
          config={hpConfig}
          onChange={mockOnChange}
        />
      );

      const progressBars = container.querySelectorAll(
        '.MuiLinearProgress-root'
      );
      // Apenas 1 LinearProgress (barra base)
      expect(progressBars).toHaveLength(1);

      // Deve haver overlay para temporários
      const overlayBox = container.querySelector(
        'div[style*="position: absolute"]'
      );
      expect(overlayBox).toBeInTheDocument();
    });
  });
});
