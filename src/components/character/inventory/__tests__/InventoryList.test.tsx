/**
 * Testes para InventoryList
 *
 * Testes do componente de lista de itens do inventário
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryList } from '../InventoryList';
import type { InventoryItem } from '@/types/inventory';

// Mock de item para testes
const createItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: `item-${Math.random().toString(36).substring(7)}`,
  name: 'Test Item',
  category: 'miscelanea',
  quantity: 1,
  weight: 2,
  value: 10,
  equipped: false,
  ...overrides,
});

describe('InventoryList', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar o título do componente', () => {
      render(<InventoryList items={[]} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Itens do Inventário')).toBeInTheDocument();
    });

    it('deve exibir estado vazio quando não há itens', () => {
      render(<InventoryList items={[]} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Nenhum item no inventário')).toBeInTheDocument();
      expect(
        screen.getByText(/clique em.*adicionar item/i)
      ).toBeInTheDocument();
    });

    it('deve exibir lista de itens quando há itens', () => {
      const items = [
        createItem({ id: 'item-1', name: 'Espada' }),
        createItem({ id: 'item-2', name: 'Escudo' }),
      ];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Espada')).toBeInTheDocument();
      expect(screen.getByText('Escudo')).toBeInTheDocument();
    });

    it('deve exibir o total de itens', () => {
      const items = [
        createItem({ id: 'item-1', quantity: 3 }),
        createItem({ id: 'item-2', quantity: 2 }),
      ];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // 3 + 2 = 5 itens
      expect(screen.getByText('5 itens')).toBeInTheDocument();
    });

    it('deve exibir o peso total dos itens', () => {
      const items = [
        createItem({ id: 'item-1', weight: 3, quantity: 2 }), // 6
        createItem({ id: 'item-2', weight: 2, quantity: 1 }), // 2
      ];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // 6 + 2 = 8
      expect(screen.getByText('8 espaço')).toBeInTheDocument();
    });
  });

  describe('Adicionar item', () => {
    it('deve exibir botão de adicionar item', () => {
      render(<InventoryList items={[]} onUpdate={mockOnUpdate} />);

      expect(
        screen.getByRole('button', { name: /adicionar item/i })
      ).toBeInTheDocument();
    });

    it('deve abrir diálogo ao clicar em adicionar', async () => {
      const user = userEvent.setup();

      render(<InventoryList items={[]} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /adicionar item/i })
      ).toBeInTheDocument();
    });

    it('deve adicionar novo item à lista', async () => {
      const user = userEvent.setup();

      render(<InventoryList items={[]} onUpdate={mockOnUpdate} />);

      // Abrir diálogo
      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      await user.click(addButton);

      // Preencher nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.type(nameInput, 'Novo Item');

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /adicionar item/i,
      });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Novo Item' })])
      );
    });
  });

  describe('Editar item', () => {
    it('deve abrir diálogo de edição ao clicar no botão editar', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item para Editar' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      const editButton = screen.getByRole('button', {
        name: /editar item para editar/i,
      });
      await user.click(editButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar Item')).toBeInTheDocument();
    });

    it('deve preencher diálogo com dados do item ao editar', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item Original', quantity: 5 })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      const editButton = screen.getByRole('button', {
        name: /editar item original/i,
      });
      await user.click(editButton);

      const nameInput = screen.getByLabelText(
        /nome do item/i
      ) as HTMLInputElement;
      expect(nameInput.value).toBe('Item Original');

      const quantityInput = screen.getByLabelText(
        /quantidade/i
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe('5');
    });

    it('deve atualizar item existente ao salvar edição', async () => {
      const user = userEvent.setup();
      const items = [createItem({ id: 'edit-me', name: 'Nome Antigo' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // Abrir edição
      const editButton = screen.getByRole('button', {
        name: /editar nome antigo/i,
      });
      await user.click(editButton);

      // Modificar nome
      const nameInput = screen.getByLabelText(/nome do item/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Nome Novo');

      // Salvar
      const saveButton = screen.getByRole('button', {
        name: /salvar alterações/i,
      });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'edit-me', name: 'Nome Novo' }),
        ])
      );
    });
  });

  describe('Remover item', () => {
    it('deve abrir diálogo de confirmação ao clicar em remover', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item para Remover' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      const removeButton = screen.getByRole('button', {
        name: /remover item para remover/i,
      });
      await user.click(removeButton);

      expect(
        screen.getByRole('heading', { name: /remover item/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/tem certeza/i)).toBeInTheDocument();
    });

    it('deve exibir nome do item no diálogo de confirmação', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Espada Longa' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      const removeButton = screen.getByRole('button', {
        name: /remover espada longa/i,
      });
      await user.click(removeButton);

      // O nome aparece na lista e no diálogo de confirmação
      const matches = screen.getAllByText(/Espada Longa/);
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });

    it('deve remover item ao confirmar', async () => {
      const user = userEvent.setup();
      const items = [
        createItem({ id: 'keep-me', name: 'Item Mantido' }),
        createItem({ id: 'remove-me', name: 'Item Removido' }),
      ];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // Clicar no botão remover do segundo item
      const removeButtons = screen.getAllByRole('button', { name: /remover/i });
      await user.click(removeButtons[1]); // segundo item

      // Confirmar
      const confirmButton = screen.getByRole('button', { name: /^remover$/i });
      await user.click(confirmButton);

      expect(mockOnUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'keep-me' }),
      ]);
    });

    it('não deve remover item ao cancelar', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item Preservado' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // Abrir confirmação
      const removeButton = screen.getByRole('button', { name: /remover/i });
      await user.click(removeButton);

      // Cancelar
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Estados de carga', () => {
    it('deve exibir estado normal quando peso está dentro da capacidade', () => {
      const items = [createItem({ weight: 5, quantity: 1 })];

      render(
        <InventoryList items={items} onUpdate={mockOnUpdate} maxCapacity={10} />
      );

      // Não deve haver alerta de sobrecarga
      expect(screen.queryByText(/sobrecarregado/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/imobilizado/i)).not.toBeInTheDocument();
    });

    it('deve exibir alerta quando sobrecarregado', () => {
      const items = [createItem({ weight: 15, quantity: 1 })];

      render(
        <InventoryList
          items={items}
          onUpdate={mockOnUpdate}
          maxCapacity={10} // Peso 15 > 10, mas < 20
        />
      );

      expect(screen.getByText(/sobrecarregado/i)).toBeInTheDocument();
      expect(screen.getByText(/deslocamento reduzido/i)).toBeInTheDocument();
    });

    it('deve exibir alerta quando imobilizado', () => {
      const items = [createItem({ weight: 25, quantity: 1 })];

      render(
        <InventoryList
          items={items}
          onUpdate={mockOnUpdate}
          maxCapacity={10} // Peso 25 > 20 (2× capacidade)
        />
      );

      expect(screen.getByText(/imobilizado/i)).toBeInTheDocument();
      expect(screen.getByText(/não pode se mover/i)).toBeInTheDocument();
    });
  });

  describe('Expandir/Recolher', () => {
    it('deve permitir recolher a lista', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item Visível' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // Item deve estar visível inicialmente
      expect(screen.getByText('Item Visível')).toBeInTheDocument();

      // Recolher
      const collapseButton = screen.getByRole('button', { name: /recolher/i });
      await user.click(collapseButton);

      // Item não deve estar visível
      await waitFor(() => {
        expect(screen.queryByText('Item Visível')).not.toBeVisible();
      });
    });

    it('deve permitir expandir a lista após recolher', async () => {
      const user = userEvent.setup();
      const items = [createItem({ name: 'Item Toggleável' })];

      render(<InventoryList items={items} onUpdate={mockOnUpdate} />);

      // Recolher
      const collapseButton = screen.getByRole('button', { name: /recolher/i });
      await user.click(collapseButton);

      // Expandir
      const expandButton = screen.getByRole('button', { name: /expandir/i });
      await user.click(expandButton);

      // Item deve estar visível novamente
      await waitFor(() => {
        expect(screen.getByText('Item Toggleável')).toBeVisible();
      });
    });
  });

  describe('Peso de moedas', () => {
    it('deve considerar peso de moedas no cálculo de encumbrance', () => {
      // Sem itens, mas com peso de moedas alto
      render(
        <InventoryList
          items={[]}
          onUpdate={mockOnUpdate}
          maxCapacity={10}
          coinsWeight={15} // Peso de moedas > capacidade
        />
      );

      expect(screen.getByText(/sobrecarregado/i)).toBeInTheDocument();
    });

    it('deve somar peso de itens e moedas para encumbrance', () => {
      const items = [createItem({ weight: 8, quantity: 1 })];

      render(
        <InventoryList
          items={items}
          onUpdate={mockOnUpdate}
          maxCapacity={10}
          coinsWeight={5} // 8 + 5 = 13 > 10
        />
      );

      expect(screen.getByText(/sobrecarregado/i)).toBeInTheDocument();
    });
  });

  describe('Modo desabilitado', () => {
    it('deve desabilitar botão de adicionar quando disabled', () => {
      render(
        <InventoryList items={[]} onUpdate={mockOnUpdate} disabled={true} />
      );

      const addButton = screen.getByRole('button', { name: /adicionar item/i });
      expect(addButton).toBeDisabled();
    });

    it('deve desabilitar botões de ação nos itens quando disabled', () => {
      const items = [createItem({ name: 'Item Bloqueado' })];

      render(
        <InventoryList items={items} onUpdate={mockOnUpdate} disabled={true} />
      );

      const editButton = screen.getByRole('button', { name: /editar/i });
      const removeButton = screen.getByRole('button', { name: /remover/i });

      expect(editButton).toBeDisabled();
      expect(removeButton).toBeDisabled();
    });
  });
});
