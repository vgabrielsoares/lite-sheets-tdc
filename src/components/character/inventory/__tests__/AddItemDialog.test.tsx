/**
 * Testes para AddItemDialog
 *
 * Testes do componente de diálogo para adicionar/editar itens
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddItemDialog } from '../AddItemDialog';
import type { InventoryItem } from '@/types/inventory';

// Mock de item para testes
const createItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 'test-item-1',
  name: 'Test Item',
  category: 'diversos',
  quantity: 1,
  weight: 2,
  value: 10,
  equipped: false,
  ...overrides,
});

describe('AddItemDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não deve renderizar quando closed', () => {
      render(
        <AddItemDialog open={false} onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deve renderizar quando open', () => {
      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('deve exibir título "Adicionar Item" para novo item', () => {
      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(
        screen.getByRole('heading', { name: 'Adicionar Item' })
      ).toBeInTheDocument();
    });

    it('deve exibir título "Editar Item" quando editando', () => {
      const item = createItem();

      render(
        <AddItemDialog
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          editItem={item}
        />
      );

      expect(screen.getByText('Editar Item')).toBeInTheDocument();
    });

    it('deve exibir todos os campos do formulário', () => {
      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(screen.getByLabelText(/nome do item/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/peso unitário/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
      // Switch é verificado em teste separado
    });
  });

  describe('Valores padrão', () => {
    it('deve iniciar com valores padrão para novo item', () => {
      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const nameInput = screen.getByLabelText(
        /nome do item/i
      ) as HTMLInputElement;
      const quantityInput = screen.getByLabelText(
        /quantidade/i
      ) as HTMLInputElement;
      const weightInput = screen.getByLabelText(
        /peso unitário/i
      ) as HTMLInputElement;

      expect(nameInput.value).toBe('');
      expect(quantityInput.value).toBe('1');
      expect(weightInput.value).toBe('0');
    });

    it('deve preencher campos com dados do item ao editar', () => {
      const item = createItem({
        name: 'Espada Mágica',
        description: 'Uma espada brilhante',
        quantity: 3,
        weight: 5,
        value: 100,
      });

      render(
        <AddItemDialog
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          editItem={item}
        />
      );

      const nameInput = screen.getByLabelText(
        /nome do item/i
      ) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        /descrição/i
      ) as HTMLInputElement;
      const quantityInput = screen.getByLabelText(
        /quantidade/i
      ) as HTMLInputElement;
      const weightInput = screen.getByLabelText(
        /peso unitário/i
      ) as HTMLInputElement;
      const valueInput = screen.getByLabelText(/valor/i) as HTMLInputElement;

      expect(nameInput.value).toBe('Espada Mágica');
      expect(descriptionInput.value).toBe('Uma espada brilhante');
      expect(quantityInput.value).toBe('3');
      expect(weightInput.value).toBe('5');
      expect(valueInput.value).toBe('100');
    });
  });

  describe('Validação', () => {
    it('deve exibir erro quando nome está vazio', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Tentar salvar sem preencher o nome
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('não deve chamar onSave com dados inválidos', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Tentar salvar sem preencher o nome
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Submissão de formulário', () => {
    it('deve chamar onSave com dados corretos para novo item', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Preencher nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.type(nameInput, 'Poção de Cura');

      // Preencher quantidade
      const quantityInput = screen.getByLabelText(/quantidade/i);
      await user.clear(quantityInput);
      await user.type(quantityInput, '5');

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Poção de Cura',
          quantity: 5,
          category: 'diversos',
        })
      );
    });

    it('deve chamar onSave com ID original ao editar', async () => {
      const user = userEvent.setup();
      const item = createItem({ id: 'original-id', name: 'Item Original' });

      render(
        <AddItemDialog
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          editItem={item}
        />
      );

      // Modificar nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Item Modificado');

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /salvar alterações/i,
      });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'original-id',
          name: 'Item Modificado',
        })
      );
    });

    it('deve fechar o diálogo após salvar', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Preencher nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.type(nameInput, 'Novo Item');

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Cancelamento', () => {
    it('deve chamar onClose ao clicar em Cancelar', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('deve limpar o formulário ao cancelar e reabrir', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Preencher nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.type(nameInput, 'Item Temporário');

      // Cancelar
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      // Reabrir o diálogo
      rerender(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const newNameInput = screen.getByLabelText(
        /nome do item/i
      ) as HTMLInputElement;
      expect(newNameInput.value).toBe('');
    });
  });

  describe('Categorias', () => {
    it('deve permitir selecionar diferentes categorias', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Abrir select de categoria
      const categorySelect = screen.getByLabelText(/categoria/i);
      await user.click(categorySelect);

      // Verificar que todas as opções estão disponíveis
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(screen.getByRole('option', { name: 'Arma' })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Ferramenta' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Consumível' })
      ).toBeInTheDocument();
    });
  });

  describe('Switch de Equipado', () => {
    it('deve permitir marcar item como equipado', async () => {
      const user = userEvent.setup();

      render(
        <AddItemDialog open={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Preencher nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.type(nameInput, 'Armadura');

      // Marcar como equipado usando o texto do label
      const equippedSwitch = screen.getByText(/item equipado/i);
      await user.click(equippedSwitch);

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          equipped: true,
        })
      );
    });
  });
});
