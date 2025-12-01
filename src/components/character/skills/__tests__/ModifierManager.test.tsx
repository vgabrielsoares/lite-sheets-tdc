/**
 * Testes do ModifierManager
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModifierManager } from '../ModifierManager';
import type { Modifier } from '@/types';

describe('ModifierManager', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar com lista vazia', () => {
      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      expect(
        screen.getByRole('heading', { name: /Modificadores \(0\)/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Nenhum modificador adicionado/i)
      ).toBeInTheDocument();
    });

    it('deve renderizar com modificadores existentes', () => {
      const modifiers: Modifier[] = [
        { name: 'Bênção', value: 2, type: 'bonus', affectsDice: false },
        {
          name: 'Ferimento',
          value: -1,
          type: 'penalidade',
          affectsDice: false,
        },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Bênção')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.getByText('Ferimento')).toBeInTheDocument();
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('deve renderizar em modo compacto', () => {
      const modifiers: Modifier[] = [
        { name: 'Teste', value: 3, type: 'bonus', affectsDice: false },
      ];

      render(
        <ModifierManager
          modifiers={modifiers}
          onUpdate={mockOnUpdate}
          compact
        />
      );

      // Em modo compacto, não deve mostrar título detalhado
      expect(screen.queryByText(/Nenhum modificador/i)).not.toBeInTheDocument();
    });
  });

  describe('Adicionar Modificador', () => {
    it('deve abrir formulário ao clicar em Adicionar', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      expect(screen.getByLabelText(/Nome do Modificador/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();
    });

    it('deve adicionar modificador numérico', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/Nome do Modificador/i);
      const valueInput = screen.getByLabelText(/Valor/i);

      await user.type(nameInput, 'Bênção Divina');
      await user.clear(valueInput);
      await user.type(valueInput, '5');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith([
        {
          name: 'Bênção Divina',
          value: 5,
          type: 'bonus',
          affectsDice: false,
        },
      ]);
    });

    it('deve adicionar modificador de dados', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/Nome do Modificador/i);
      const diceSwitch = screen.getByRole('switch');

      await user.type(nameInput, 'Adrenalina');
      await user.click(diceSwitch);

      // Após clicar no switch, o label muda para "Dados (+/-d20)"
      const valueInput = screen.getByLabelText(/Dados \(\+\/-d20\)/i);
      await user.clear(valueInput);
      await user.type(valueInput, '2');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith([
        {
          name: 'Adrenalina',
          value: 2,
          type: 'bonus',
          affectsDice: true,
        },
      ]);
    });

    it('não deve salvar sem nome', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const valueInput = screen.getByLabelText(/Valor/i);
      await user.clear(valueInput);
      await user.type(valueInput, '3');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeDisabled();
    });

    it('não deve salvar com valor zero', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/Nome do Modificador/i);
      await user.type(nameInput, 'Teste');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Editar Modificador', () => {
    it('deve editar modificador existente', async () => {
      const user = userEvent.setup();
      const modifiers: Modifier[] = [
        { name: 'Original', value: 2, type: 'bonus', affectsDice: false },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      const editButton = screen.getByLabelText(/editar/i);
      await user.click(editButton);

      const nameInput = screen.getByLabelText(/Nome do Modificador/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Modificado');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith([
        {
          name: 'Modificado',
          value: 2,
          type: 'bonus',
          affectsDice: false,
        },
      ]);
    });
  });

  describe('Remover Modificador', () => {
    it('deve remover modificador', async () => {
      const user = userEvent.setup();
      const modifiers: Modifier[] = [
        { name: 'Teste 1', value: 2, type: 'bonus', affectsDice: false },
        { name: 'Teste 2', value: -1, type: 'penalidade', affectsDice: false },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      const deleteButtons = screen.getAllByLabelText(/remover/i);
      await user.click(deleteButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalledWith([
        { name: 'Teste 2', value: -1, type: 'penalidade', affectsDice: false },
      ]);
    });
  });

  describe('Cancelar', () => {
    it('deve cancelar adição', async () => {
      const user = userEvent.setup();

      render(<ModifierManager modifiers={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/Nome do Modificador/i);
      await user.type(nameInput, 'Será Cancelado');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(
        screen.queryByLabelText(/Nome do Modificador/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Renderização de Cores', () => {
    it('deve usar cor success para bônus positivo', () => {
      const modifiers: Modifier[] = [
        { name: 'Bônus', value: 3, type: 'bonus', affectsDice: false },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      const chip = screen.getByText('+3');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    });

    it('deve usar cor error para penalidade negativa', () => {
      const modifiers: Modifier[] = [
        {
          name: 'Penalidade',
          value: -2,
          type: 'penalidade',
          affectsDice: false,
        },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      const chip = screen.getByText('-2');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });
  });

  describe('Formato de Dados', () => {
    it('deve exibir formato de dados corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Extra Dice', value: 2, type: 'bonus', affectsDice: true },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      // Nome do modificador e valor são renderizados separadamente em não-compacto
      expect(screen.getByText('Extra Dice')).toBeInTheDocument();
      expect(screen.getByText('+2d20')).toBeInTheDocument();
    });

    it('deve exibir dados negativos corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Fadiga', value: -1, type: 'penalidade', affectsDice: true },
      ];

      render(<ModifierManager modifiers={modifiers} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Fadiga')).toBeInTheDocument();
      expect(screen.getByText('-1d20')).toBeInTheDocument();
    });
  });
});
