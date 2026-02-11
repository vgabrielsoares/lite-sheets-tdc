/**
 * Testes para CarryCapacityDisplay
 *
 * Testes do componente de exibição de capacidade de carga
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CarryCapacityDisplay } from '../CarryCapacityDisplay';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';
import type { InventoryItem, Currency } from '@/types/inventory';

// Mock de item para testes
const createItem = (
  weight: number,
  quantity: number = 1,
  equipped: boolean = false
): InventoryItem => ({
  id: crypto.randomUUID(),
  name: 'Test Item',
  category: 'miscelanea',
  quantity,
  weight,
  value: 0,
  equipped,
});

// Mock de moedas para testes
const createCurrency = (
  physicalCobre: number = 0,
  physicalOuro: number = 0,
  physicalPlatina: number = 0
): Currency => ({
  physical: {
    cobre: physicalCobre,
    ouro: physicalOuro,
    platina: physicalPlatina,
  },
  bank: {
    cobre: 0,
    ouro: 0,
    platina: 0,
  },
});

describe('CarryCapacityDisplay', () => {
  let baseCharacter: Character;

  beforeEach(() => {
    baseCharacter = createDefaultCharacter({ name: 'Test Character' });
  });

  describe('Renderização básica', () => {
    it('deve renderizar o título do componente', () => {
      render(<CarryCapacityDisplay character={baseCharacter} />);

      expect(screen.getByText('Capacidade de Carga')).toBeInTheDocument();
    });

    it('deve exibir o espaço atual e capacidade máxima', () => {
      render(<CarryCapacityDisplay character={baseCharacter} />);

      // Corpo 1 padrão = 5 + 5 = 10 de capacidade
      expect(screen.getByText(/Espaço Atual/)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 10/)).toBeInTheDocument();
    });

    it('deve exibir o chip de estado Normal quando sem carga', () => {
      render(<CarryCapacityDisplay character={baseCharacter} />);

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('deve exibir a porcentagem de carga', () => {
      render(<CarryCapacityDisplay character={baseCharacter} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Cálculos de capacidade', () => {
    it('deve calcular capacidade baseada em Corpo', () => {
      const character: Character = {
        ...baseCharacter,
        attributes: {
          ...baseCharacter.attributes,
          corpo: 3, // 5 + (3 × 5) = 20
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText(/0 \/ 20/)).toBeInTheDocument();
    });

    it('deve considerar peso de itens no inventário', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(5), createItem(2)], // Total: 7
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText(/7 \/ 10/)).toBeInTheDocument();
    });

    it('deve considerar peso de moedas físicas', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          currency: createCurrency(200, 0, 0), // 200 moedas = 2 peso
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText(/2 \/ 10/)).toBeInTheDocument();
    });

    it('deve somar peso de itens e moedas', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(5)],
          currency: createCurrency(300, 0, 0), // 300 moedas = 3 peso
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      // 5 (itens) + 3 (moedas) = 8
      expect(screen.getByText(/8 \/ 10/)).toBeInTheDocument();
    });
  });

  describe('Estados de encumbrance', () => {
    it('deve exibir Normal quando peso ≤ capacidade', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(5)], // Peso 5, capacidade 10
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('deve exibir Sobrecarregado quando peso > capacidade e ≤ 2×', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(15)], // Peso 15, capacidade 10
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText('Sobrecarregado')).toBeInTheDocument();
    });

    it('deve exibir Imobilizado quando peso > 2× capacidade', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(25)], // Peso 25, capacidade 10
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText('Imobilizado')).toBeInTheDocument();
    });

    it('deve exibir descrição de penalidade para Sobrecarregado', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(15)],
        },
      };

      render(<CarryCapacityDisplay character={character} showDetails />);

      expect(
        screen.getByText(/deslocamento reduzido pela metade/i)
      ).toBeInTheDocument();
    });

    it('deve exibir descrição de penalidade para Imobilizado', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(25)],
        },
      };

      render(<CarryCapacityDisplay character={character} showDetails />);

      expect(screen.getByText(/incapaz de se mover/i)).toBeInTheDocument();
    });
  });

  describe('Detalhes expandidos', () => {
    it('deve exibir detalhes quando showDetails é true', () => {
      render(<CarryCapacityDisplay character={baseCharacter} showDetails />);

      expect(screen.getByText('Capacidade Base')).toBeInTheDocument();
      expect(screen.getByText('Mod. Tamanho')).toBeInTheDocument();
      expect(screen.getByText('Total Mod.')).toBeInTheDocument();
      expect(screen.getByText('Empurrar')).toBeInTheDocument();
      expect(screen.getByText('Levantar')).toBeInTheDocument();
    });

    it('não deve exibir detalhes quando showDetails é false', () => {
      render(
        <CarryCapacityDisplay character={baseCharacter} showDetails={false} />
      );

      expect(screen.queryByText('Capacidade Base')).not.toBeInTheDocument();
      expect(screen.queryByText('Empurrar')).not.toBeInTheDocument();
    });

    it('deve exibir capacidade base correta', () => {
      const character: Character = {
        ...baseCharacter,
        attributes: {
          ...baseCharacter.attributes,
          corpo: 2, // 5 + (2 × 5) = 15
        },
      };

      render(<CarryCapacityDisplay character={character} showDetails />);

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('deve exibir capacidade de empurrar (10 × Corpo, mín. 5)', () => {
      const character: Character = {
        ...baseCharacter,
        attributes: {
          ...baseCharacter.attributes,
          corpo: 2, // Push = 10 × 2 = 20
        },
      };

      render(<CarryCapacityDisplay character={character} showDetails />);

      // Corpo 2, empurrar = 10 × 2 = 20
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('deve exibir capacidade de levantar (5 × Corpo, mín. 2)', () => {
      render(<CarryCapacityDisplay character={baseCharacter} showDetails />);

      // Corpo 1, levantar = 5 × 1 = 5
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Porcentagem de carga', () => {
    it('deve calcular porcentagem corretamente', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(5)], // 50% de 10
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('deve exibir porcentagem acima de 100% quando sobrecarregado', () => {
      const character: Character = {
        ...baseCharacter,
        inventory: {
          ...baseCharacter.inventory,
          items: [createItem(15)], // 150% de 10
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText('150%')).toBeInTheDocument();
    });
  });

  describe('Modificadores de tamanho', () => {
    it('deve aplicar modificador de tamanho pequeno', () => {
      const character: Character = {
        ...baseCharacter,
        size: 'pequeno', // -2 de capacidade
        attributes: {
          ...baseCharacter.attributes,
          corpo: 2, // Base: 15, com modificador: 13
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText(/0 \/ 13/)).toBeInTheDocument();
    });

    it('deve aplicar modificador de tamanho grande', () => {
      const character: Character = {
        ...baseCharacter,
        size: 'grande', // +2 de capacidade
        attributes: {
          ...baseCharacter.attributes,
          corpo: 2, // Base: 15, com modificador: 17
        },
      };

      render(<CarryCapacityDisplay character={character} />);

      expect(screen.getByText(/0 \/ 17/)).toBeInTheDocument();
    });
  });
});
