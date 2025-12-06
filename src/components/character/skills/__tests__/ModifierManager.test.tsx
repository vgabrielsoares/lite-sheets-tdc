/**
 * Testes do InlineModifiers e funções utilitárias do ModifierManager
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InlineModifiers,
  extractDiceModifier,
  extractNumericModifier,
  buildModifiersArray,
} from '../ModifierManager';
import type { Modifier } from '@/types';

describe('InlineModifiers', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar com valores iniciais', () => {
      render(
        <InlineModifiers
          diceModifier={0}
          numericModifier={0}
          onUpdate={mockOnUpdate}
        />
      );

      // Deve haver dois inputs numéricos
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });

    it('deve exibir valores de modificadores corretamente', () => {
      render(
        <InlineModifiers
          diceModifier={2}
          numericModifier={5}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(2); // dice modifier
      expect(inputs[1]).toHaveValue(5); // numeric modifier
    });

    it('deve exibir valores negativos', () => {
      render(
        <InlineModifiers
          diceModifier={-1}
          numericModifier={-3}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(-1);
      expect(inputs[1]).toHaveValue(-3);
    });
  });

  describe('Interações', () => {
    it('deve chamar onUpdate quando dice modifier muda', () => {
      render(
        <InlineModifiers
          diceModifier={0}
          numericModifier={5}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '2' } });

      expect(mockOnUpdate).toHaveBeenCalledWith(2, 5);
    });

    it('deve chamar onUpdate quando numeric modifier muda', () => {
      render(
        <InlineModifiers
          diceModifier={1}
          numericModifier={0}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[1], { target: { value: '3' } });

      expect(mockOnUpdate).toHaveBeenCalledWith(1, 3);
    });

    it('deve tratar valores inválidos como zero', () => {
      render(
        <InlineModifiers
          diceModifier={0}
          numericModifier={0}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: 'abc' } });

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Desabilitado', () => {
    it('deve desabilitar inputs quando disabled=true', () => {
      render(
        <InlineModifiers
          diceModifier={0}
          numericModifier={0}
          onUpdate={mockOnUpdate}
          disabled
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });
});

describe('Funções utilitárias', () => {
  describe('extractDiceModifier', () => {
    it('deve retornar 0 para array vazio', () => {
      expect(extractDiceModifier([])).toBe(0);
    });

    it('deve retornar 0 para undefined', () => {
      expect(extractDiceModifier(undefined)).toBe(0);
    });

    it('deve extrair soma de modificadores de dados', () => {
      const modifiers: Modifier[] = [
        { name: 'Extra Dice', value: 2, type: 'bonus', affectsDice: true },
        { name: 'Buff', value: 1, type: 'bonus', affectsDice: true },
      ];

      expect(extractDiceModifier(modifiers)).toBe(3);
    });

    it('deve ignorar modificadores numéricos', () => {
      const modifiers: Modifier[] = [
        { name: 'Dice', value: 2, type: 'bonus', affectsDice: true },
        { name: 'Numeric', value: 5, type: 'bonus', affectsDice: false },
      ];

      expect(extractDiceModifier(modifiers)).toBe(2);
    });

    it('deve somar modificadores negativos corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Buff', value: 2, type: 'bonus', affectsDice: true },
        { name: 'Debuff', value: -1, type: 'penalidade', affectsDice: true },
      ];

      expect(extractDiceModifier(modifiers)).toBe(1);
    });
  });

  describe('extractNumericModifier', () => {
    it('deve retornar 0 para array vazio', () => {
      expect(extractNumericModifier([])).toBe(0);
    });

    it('deve retornar 0 para undefined', () => {
      expect(extractNumericModifier(undefined)).toBe(0);
    });

    it('deve extrair soma de modificadores numéricos', () => {
      const modifiers: Modifier[] = [
        { name: 'Buff 1', value: 3, type: 'bonus', affectsDice: false },
        { name: 'Buff 2', value: 2, type: 'bonus', affectsDice: false },
      ];

      expect(extractNumericModifier(modifiers)).toBe(5);
    });

    it('deve ignorar modificadores de dados', () => {
      const modifiers: Modifier[] = [
        { name: 'Dice', value: 2, type: 'bonus', affectsDice: true },
        { name: 'Numeric', value: 5, type: 'bonus', affectsDice: false },
      ];

      expect(extractNumericModifier(modifiers)).toBe(5);
    });

    it('deve somar modificadores negativos corretamente', () => {
      const modifiers: Modifier[] = [
        { name: 'Buff', value: 5, type: 'bonus', affectsDice: false },
        { name: 'Debuff', value: -2, type: 'penalidade', affectsDice: false },
      ];

      expect(extractNumericModifier(modifiers)).toBe(3);
    });
  });

  describe('buildModifiersArray', () => {
    it('deve retornar array vazio quando ambos são zero', () => {
      expect(buildModifiersArray(0, 0)).toEqual([]);
    });

    it('deve criar modificador de dados positivo', () => {
      const result = buildModifiersArray(2, 0);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Modificador de Dados',
        value: 2,
        type: 'bonus',
        affectsDice: true,
      });
    });

    it('deve criar modificador de dados negativo', () => {
      const result = buildModifiersArray(-1, 0);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Modificador de Dados',
        value: -1,
        type: 'penalidade',
        affectsDice: true,
      });
    });

    it('deve criar modificador numérico positivo', () => {
      const result = buildModifiersArray(0, 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Modificador Numérico',
        value: 5,
        type: 'bonus',
        affectsDice: false,
      });
    });

    it('deve criar modificador numérico negativo', () => {
      const result = buildModifiersArray(0, -3);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Modificador Numérico',
        value: -3,
        type: 'penalidade',
        affectsDice: false,
      });
    });

    it('deve criar ambos modificadores quando necessário', () => {
      const result = buildModifiersArray(2, 5);

      expect(result).toHaveLength(2);
      expect(result[0].affectsDice).toBe(true);
      expect(result[0].value).toBe(2);
      expect(result[1].affectsDice).toBe(false);
      expect(result[1].value).toBe(5);
    });
  });
});
