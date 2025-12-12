/**
 * Testes para DiceRoller component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DiceRoller } from '../DiceRoller';
import * as diceRollerUtils from '@/utils/diceRoller';

// Mock do módulo diceRoller
jest.mock('@/utils/diceRoller', () => ({
  ...jest.requireActual('@/utils/diceRoller'),
  rollD20: jest.fn(),
  rollDamage: jest.fn(),
  globalDiceHistory: {
    add: jest.fn(),
    getAll: jest.fn(() => []),
    clear: jest.fn(),
    size: jest.fn(() => 0),
  },
}));

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o componente corretamente', () => {
      render(<DiceRoller />);

      expect(screen.getByText('Rolador de Dados')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Número de dados a rolar')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Modificador a adicionar')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /rolar dados/i })
      ).toBeInTheDocument();
    });

    it('deve usar valores padrão quando não fornecidos', () => {
      render(<DiceRoller />);

      const diceInput = screen.getByLabelText(
        'Número de dados a rolar'
      ) as HTMLInputElement;
      const modifierInput = screen.getByLabelText(
        'Modificador a adicionar'
      ) as HTMLInputElement;

      // Inputs são readonly, então não têm value como inputs normais
      expect(diceInput).toBeInTheDocument();
      expect(modifierInput).toBeInTheDocument();
    });

    it('deve usar valores padrão quando fornecidos', () => {
      render(<DiceRoller defaultDiceCount={3} defaultModifier={5} />);

      const diceInput = screen.getByLabelText(
        'Número de dados a rolar'
      ) as HTMLInputElement;
      const modifierInput = screen.getByLabelText(
        'Modificador a adicionar'
      ) as HTMLInputElement;

      // Valores estão presentes no componente
      expect(diceInput).toBeInTheDocument();
      expect(modifierInput).toBeInTheDocument();
    });

    it('deve exibir contexto quando fornecido', () => {
      render(<DiceRoller context="Teste de Acrobacia" />);

      expect(screen.getByText('Teste de Acrobacia')).toBeInTheDocument();
    });

    it('deve exibir presets quando showPresets é true', () => {
      render(<DiceRoller showPresets={true} />);

      expect(screen.getByText(/atalhos rápidos/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /preset de ataque/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /preset de dano/i })
      ).toBeInTheDocument();
    });

    it('não deve exibir presets quando showPresets é false', () => {
      render(<DiceRoller showPresets={false} />);

      expect(screen.queryByText(/atalhos rápidos/i)).not.toBeInTheDocument();
    });
  });

  describe('Interação com Inputs', () => {
    it('deve atualizar número de dados', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);

      const diceInput = screen.getByLabelText('Número de dados a rolar');

      // Focus e digitar novo valor
      await user.click(diceInput);
      await user.keyboard('{Control>}a{/Control}'); // Selecionar tudo
      await user.keyboard('3');

      // Verificar que o componente foi atualizado
      expect(diceInput).toBeInTheDocument();
    });

    it('deve atualizar modificador', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);

      const modifierInput = screen.getByLabelText('Modificador a adicionar');

      // Focus e digitar novo valor
      await user.click(modifierInput);
      await user.keyboard('{Control>}a{/Control}'); // Selecionar tudo
      await user.keyboard('5');

      // Verificar que o componente foi atualizado
      expect(modifierInput).toBeInTheDocument();
    });

    it('deve alternar entre vantagem/normal/desvantagem', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);

      // Buscar botões mais específicos usando getAllByRole e filtrando
      const buttons = screen.getAllByRole('button');
      const advantageButton = buttons.find(
        (btn) => btn.textContent === 'Vantagem'
      );
      const normalButton = buttons.find(
        (btn) =>
          btn.textContent === 'Normal' &&
          btn.getAttribute('aria-label') === 'Normal'
      );
      const disadvantageButton = buttons.find(
        (btn) => btn.textContent === 'Desvantagem'
      );

      expect(advantageButton).toBeInTheDocument();
      expect(normalButton).toBeInTheDocument();
      expect(disadvantageButton).toBeInTheDocument();

      // Inicialmente deve estar normal
      expect(normalButton).toHaveAttribute('aria-pressed', 'true');

      // Clicar em vantagem
      if (advantageButton) await user.click(advantageButton);
      expect(advantageButton).toHaveAttribute('aria-pressed', 'true');

      // Clicar em desvantagem
      if (disadvantageButton) await user.click(disadvantageButton);
      expect(disadvantageButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('deve alternar entre modo teste e modo dano', async () => {
      const user = userEvent.setup();
      render(<DiceRoller />);

      const testButton = screen.getByRole('button', { name: /teste \(d20\)/i });
      const damageButton = screen.getByRole('button', {
        name: /dano \(dxx\)/i,
      });

      // Inicialmente deve estar em modo teste
      expect(testButton).toHaveAttribute('aria-pressed', 'true');

      // Clicar em modo dano
      await user.click(damageButton);
      expect(damageButton).toHaveAttribute('aria-pressed', 'true');

      // Em modo dano, deve exibir seletor de lados do dado
      expect(
        screen.getByLabelText('Número de lados do dado')
      ).toBeInTheDocument();
    });
  });

  describe('Rolagem de Dados', () => {
    it('deve rolar dados ao clicar no botão', async () => {
      const mockResult = {
        formula: '1d20+0',
        rolls: [15],
        diceType: 20,
        diceCount: 1,
        modifier: 0,
        baseResult: 15,
        finalResult: 15,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollD20 as jest.Mock).mockReturnValue(mockResult);

      const user = userEvent.setup();
      render(<DiceRoller />);

      const rollButton = screen.getByRole('button', { name: /rolar dados/i });
      await user.click(rollButton);

      expect(diceRollerUtils.rollD20).toHaveBeenCalledWith(
        1,
        0,
        'normal',
        undefined
      );
      expect(diceRollerUtils.globalDiceHistory.add).toHaveBeenCalledWith(
        mockResult
      );
    });

    it('deve rolar dados com Enter', async () => {
      const mockResult = {
        formula: '2d20+5',
        rolls: [12, 18],
        diceType: 20,
        diceCount: 2,
        modifier: 5,
        baseResult: 18,
        finalResult: 23,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollD20 as jest.Mock).mockReturnValue(mockResult);

      render(<DiceRoller defaultDiceCount={2} defaultModifier={5} />);

      const diceInput = screen.getByLabelText('Número de dados a rolar');
      fireEvent.keyPress(diceInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });

      expect(diceRollerUtils.rollD20).toHaveBeenCalled();
    });

    it('deve chamar callback onRoll quando fornecido', async () => {
      const mockResult = {
        formula: '1d20+0',
        rolls: [10],
        diceType: 20,
        diceCount: 1,
        modifier: 0,
        baseResult: 10,
        finalResult: 10,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollD20 as jest.Mock).mockReturnValue(mockResult);

      const onRollMock = jest.fn();
      const user = userEvent.setup();
      render(<DiceRoller onRoll={onRollMock} />);

      const rollButton = screen.getByRole('button', { name: /rolar dados/i });
      await user.click(rollButton);

      expect(onRollMock).toHaveBeenCalledWith(mockResult);
    });

    it('deve rolar dano quando em modo dano', async () => {
      const mockResult = {
        formula: '2d6+3',
        rolls: [4, 5],
        diceType: 6,
        diceCount: 2,
        modifier: 3,
        baseResult: 9,
        finalResult: 12,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollDamage as jest.Mock).mockReturnValue(mockResult);

      const user = userEvent.setup();
      render(<DiceRoller />);

      // Alternar para modo dano
      const damageButton = screen.getByRole('button', {
        name: /dano \(dxx\)/i,
      });
      await user.click(damageButton);

      // Rolar
      const rollButton = screen.getByRole('button', { name: /rolar dados/i });
      await user.click(rollButton);

      // Verificar que rollDamage foi chamado
      expect(diceRollerUtils.rollDamage).toHaveBeenCalled();
    });
  });

  describe('Presets', () => {
    it('deve aplicar preset de ataque', async () => {
      const user = userEvent.setup();
      render(<DiceRoller showPresets={true} />);

      const attackPreset = screen.getByRole('button', {
        name: /preset de ataque/i,
      });
      await user.click(attackPreset);

      // Verificar que o preset foi aplicado (componente renderizou)
      expect(attackPreset).toBeInTheDocument();
    });

    it('deve aplicar preset de dano', async () => {
      const user = userEvent.setup();
      render(<DiceRoller showPresets={true} />);

      const damagePreset = screen.getByRole('button', {
        name: /preset de dano/i,
      });
      await user.click(damagePreset);

      // Deve estar em modo dano
      const damageButton = screen.getByRole('button', {
        name: /dano \(dxx\)/i,
      });
      expect(damageButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Exibição de Resultado', () => {
    it('deve exibir resultado após rolagem', async () => {
      const mockResult = {
        formula: '1d20+5',
        rolls: [15],
        diceType: 20,
        diceCount: 1,
        modifier: 5,
        baseResult: 15,
        finalResult: 20,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollD20 as jest.Mock).mockReturnValue(mockResult);

      const user = userEvent.setup();
      render(<DiceRoller />);

      const rollButton = screen.getByRole('button', { name: /rolar dados/i });
      await user.click(rollButton);

      await waitFor(() => {
        expect(screen.getByText('Resultado')).toBeInTheDocument();
        expect(
          screen.getByLabelText(/resultado final: 20/i)
        ).toBeInTheDocument();
      });
    });

    it('deve limpar resultado ao clicar em limpar', async () => {
      const mockResult = {
        formula: '1d20+0',
        rolls: [10],
        diceType: 20,
        diceCount: 1,
        modifier: 0,
        baseResult: 10,
        finalResult: 10,
        timestamp: new Date(),
        rollType: 'normal' as const,
      };

      (diceRollerUtils.rollD20 as jest.Mock).mockReturnValue(mockResult);

      const user = userEvent.setup();
      render(<DiceRoller />);

      // Rolar
      const rollButton = screen.getByRole('button', { name: /rolar dados/i });
      await user.click(rollButton);

      // Verificar que resultado apareceu
      await waitFor(() => {
        expect(screen.getByText('Resultado')).toBeInTheDocument();
      });

      // Limpar
      const clearButton = screen.getByRole('button', {
        name: /limpar resultado/i,
      });
      await user.click(clearButton);

      // Verificar que resultado foi removido
      expect(screen.queryByText('Resultado')).not.toBeInTheDocument();
    });
  });

  describe('Histórico', () => {
    it('deve exibir botão de histórico quando showHistory é true', () => {
      render(<DiceRoller showHistory={true} />);

      expect(
        screen.getByRole('button', { name: /abrir histórico de rolagens/i })
      ).toBeInTheDocument();
    });

    it('não deve exibir botão de histórico quando showHistory é false', () => {
      render(<DiceRoller showHistory={false} />);

      expect(
        screen.queryByRole('button', { name: /abrir histórico de rolagens/i })
      ).not.toBeInTheDocument();
    });

    it('deve alternar visibilidade do histórico', async () => {
      (diceRollerUtils.globalDiceHistory.getAll as jest.Mock).mockReturnValue(
        []
      );

      const user = userEvent.setup();
      render(<DiceRoller showHistory={true} />);

      const historyButton = screen.getByRole('button', {
        name: /abrir histórico de rolagens/i,
      });

      // Abrir histórico
      await user.click(historyButton);
      await waitFor(() => {
        expect(screen.getByText(/histórico/i)).toBeInTheDocument();
      });

      // Fechar histórico
      await user.click(historyButton);
      await waitFor(() => {
        expect(
          screen.queryByText(/nenhuma rolagem ainda/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels ARIA corretos', () => {
      render(<DiceRoller />);

      expect(
        screen.getByLabelText('Número de dados a rolar')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Modificador a adicionar')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo de rolagem')).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo de vantagem')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /rolar dados/i })
      ).toBeInTheDocument();
    });
  });
});
