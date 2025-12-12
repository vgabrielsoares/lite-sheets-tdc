import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ItemDetailsSidebar } from '../ItemDetailsSidebar';
import type { InventoryItem } from '@/types/inventory';

const createItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 'item-1',
  name: 'Espada Curta',
  category: 'arma',
  quantity: 1,
  weight: 2,
  value: 10,
  equipped: false,
  ...overrides,
});

describe('ItemDetailsSidebar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('mostra aviso quando nenhum item está selecionado', () => {
    render(
      <ItemDetailsSidebar
        open
        onClose={jest.fn()}
        item={null}
        onUpdate={jest.fn()}
      />
    );

    expect(screen.getByText('Nenhum item selecionado')).toBeInTheDocument();
  });

  it('dispara onUpdate ao editar e salvar automaticamente', () => {
    const item = createItem();
    const handleUpdate = jest.fn();

    render(
      <ItemDetailsSidebar
        open
        onClose={jest.fn()}
        item={item}
        onUpdate={handleUpdate}
      />
    );

    const nameInput = screen.getByLabelText(/Nome do Item/i);
    fireEvent.change(nameInput, { target: { value: 'Espada Longa' } });

    act(() => {
      jest.runAllTimers();
    });

    expect(handleUpdate).toHaveBeenCalled();
    const updatedItem = handleUpdate.mock.calls[0][0] as InventoryItem;
    expect(updatedItem.name).toBe('Espada Longa');
  });
});
