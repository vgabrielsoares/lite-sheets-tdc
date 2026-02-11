import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ItemDetailsSidebar } from '../ItemDetailsSidebar';
import type { InventoryItem } from '@/types/inventory';

const createItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 'item-1',
  name: 'Espada Curta',
  category: 'armas',
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

  it('exibe informações do item em modo leitura', () => {
    const item = createItem({
      name: 'Espada Curta',
      category: 'armas',
      quantity: 2,
      weight: 3,
      value: 15,
      description: 'Uma espada curta afiada',
    });

    render(
      <ItemDetailsSidebar
        open
        onClose={jest.fn()}
        item={item}
        onUpdate={jest.fn()}
      />
    );

    // Deve exibir a categoria como Chip
    expect(screen.getByText('Armas')).toBeInTheDocument();
    // Deve exibir a descrição
    expect(screen.getByText('Uma espada curta afiada')).toBeInTheDocument();
    // Deve exibir quantidade
    expect(screen.getByText('2')).toBeInTheDocument();
    // Deve exibir espaço (weight)
    expect(screen.getByText('3')).toBeInTheDocument();
    // Deve exibir valor
    expect(screen.getByText('15 PO$')).toBeInTheDocument();
  });

  it('dispara onUpdate ao editar notas automaticamente', () => {
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

    const notesInput = screen.getByLabelText(/Notas e Observações/i);
    fireEvent.change(notesInput, { target: { value: 'Nota importante' } });

    act(() => {
      jest.runAllTimers();
    });

    expect(handleUpdate).toHaveBeenCalled();
    const updatedItem = handleUpdate.mock.calls[0][0] as InventoryItem;
    expect(updatedItem.customProperties?.notes).toBe('Nota importante');
  });

  it('exibe alerta orientando usar dialog para edição básica', () => {
    const item = createItem();

    render(
      <ItemDetailsSidebar
        open
        onClose={jest.fn()}
        item={item}
        onUpdate={jest.fn()}
      />
    );

    expect(
      screen.getByText(/Para editar informações básicas/i)
    ).toBeInTheDocument();
  });
});
