/**
 * Testes para InventoryItemRow
 *
 * Testes do componente de linha de item do inventário
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryItemRow } from '../InventoryItemRow';
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

describe('InventoryItemRow', () => {
  const mockOnEdit = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar o nome do item', () => {
      const item = createItem({ name: 'Espada Longa' });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('Espada Longa')).toBeInTheDocument();
    });

    it('deve exibir a quantidade do item', () => {
      const item = createItem({ quantity: 5 });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('deve exibir o peso total do item', () => {
      const item = createItem({ weight: 3, quantity: 2 });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      // Peso total = 3 × 2 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('deve exibir a categoria do item', () => {
      const item = createItem({ category: 'arma' });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('Arma')).toBeInTheDocument();
    });

    it('deve exibir ícone de equipado quando item está equipado', () => {
      const item = createItem({ equipped: true });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      // Verifica se o tooltip de "Equipado" está presente
      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
    });

    it('não deve exibir ícone de equipado quando item não está equipado', () => {
      const item = createItem({ equipped: false });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByTestId('CheckCircleIcon')).not.toBeInTheDocument();
    });

    it('deve exibir a descrição do item quando presente', () => {
      const item = createItem({ description: 'Uma espada muito afiada' });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('Uma espada muito afiada')).toBeInTheDocument();
    });
  });

  describe('Categorias de item', () => {
    it.each([
      ['arma', 'Arma'],
      ['armadura', 'Armadura'],
      ['escudo', 'Escudo'],
      ['ferramenta', 'Ferramenta'],
      ['consumivel', 'Consumível'],
      ['material', 'Material'],
      ['magico', 'Mágico'],
      ['diversos', 'Diversos'],
    ] as const)(
      'deve exibir label correto para categoria %s',
      (category, expectedLabel) => {
        const item = createItem({ category });

        render(
          <InventoryItemRow
            item={item}
            onEdit={mockOnEdit}
            onRemove={mockOnRemove}
          />
        );

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      }
    );
  });

  describe('Interações', () => {
    it('deve chamar onEdit quando botão de editar é clicado', () => {
      const item = createItem();

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      const editButton = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(item);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onRemove quando botão de remover é clicado', () => {
      const item = createItem({ id: 'item-to-remove' });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remover/i });
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith('item-to-remove');
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onEdit quando disabled', () => {
      const item = createItem();

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /editar/i });
      expect(editButton).toBeDisabled();
    });

    it('não deve chamar onRemove quando disabled', () => {
      const item = createItem();

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remover/i });
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Cálculo de peso', () => {
    it('deve calcular peso zero corretamente', () => {
      const item = createItem({ weight: 0, quantity: 10 });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      // Peso total = 0 × 10 = 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve calcular peso alto corretamente', () => {
      const item = createItem({ weight: 5, quantity: 3 });

      render(
        <InventoryItemRow
          item={item}
          onEdit={mockOnEdit}
          onRemove={mockOnRemove}
        />
      );

      // Peso total = 5 × 3 = 15
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });
});
