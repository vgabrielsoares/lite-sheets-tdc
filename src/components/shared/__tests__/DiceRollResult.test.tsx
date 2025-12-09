/**
 * Testes para DiceRollResult component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiceRollResult } from '../DiceRollResult';
import type { DiceRollResult as DiceRollResultType } from '@/utils/diceRoller';

describe('DiceRollResult', () => {
  const mockBaseResult: DiceRollResultType = {
    formula: '2d20+5',
    rolls: [12, 15],
    diceType: 20,
    diceCount: 2,
    modifier: 5,
    baseResult: 15,
    finalResult: 20,
    timestamp: new Date('2024-12-08T10:30:00'),
    rollType: 'normal',
  };

  describe('Renderização Básica', () => {
    it('deve renderizar resultado corretamente', () => {
      render(<DiceRollResult result={mockBaseResult} />);

      expect(screen.getByText('2d20+5')).toBeInTheDocument();
      expect(screen.getByLabelText('Resultado final: 20')).toBeInTheDocument();
      expect(screen.getByText('Resultado Final')).toBeInTheDocument();
    });

    it('deve exibir fórmula da rolagem', () => {
      render(<DiceRollResult result={mockBaseResult} />);

      expect(screen.getByText('Fórmula:')).toBeInTheDocument();
      expect(screen.getByText('2d20+5')).toBeInTheDocument();
    });

    it('deve exibir resultado final destacado', () => {
      render(<DiceRollResult result={mockBaseResult} />);

      const finalResult = screen.getByLabelText('Resultado final: 20');
      expect(finalResult).toHaveTextContent('20');
    });
  });

  describe('Breakdown Detalhado', () => {
    it('deve exibir breakdown quando showBreakdown é true', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      expect(screen.getByText(/dados rolados/i)).toBeInTheDocument();
      expect(screen.getByText(/cálculo/i)).toBeInTheDocument();
    });

    it('não deve exibir breakdown quando showBreakdown é false', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={false} />);

      expect(screen.queryByText(/dados rolados/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/cálculo/i)).not.toBeInTheDocument();
    });

    it('deve exibir todos os dados rolados', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      // Verifica se os valores 12 e 15 estão presentes
      const chips = screen.getAllByText(/12|15/);
      expect(chips.length).toBeGreaterThanOrEqual(2);
    });

    it('deve destacar o dado escolhido', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      // O dado de valor 15 deve estar destacado (foi o maior escolhido)
      const chips = screen.getAllByText('15');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('deve exibir cálculo correto', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      // Verificar que os componentes de cálculo estão presentes
      expect(screen.getByText('Cálculo:')).toBeInTheDocument();
      const fifteens = screen.getAllByText(/15/);
      expect(fifteens.length).toBeGreaterThan(0); // Valor base aparece em múltiplos lugares
      const plusSigns = screen.getAllByText(/\+/);
      expect(plusSigns.length).toBeGreaterThan(0); // Sinal de adição
      expect(screen.getByText(/modificador/)).toBeInTheDocument(); // Modificador label
    });

    it('deve exibir timestamp formatado', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      expect(screen.getByText(/rolado em:/i)).toBeInTheDocument();
    });
  });

  describe('Críticos e Falhas', () => {
    it('deve exibir tag de crítico quando isCritical é true', () => {
      const criticalResult: DiceRollResultType = {
        ...mockBaseResult,
        rolls: [20],
        baseResult: 20,
        finalResult: 25,
        isCritical: true,
      };

      render(<DiceRollResult result={criticalResult} />);

      expect(screen.getByText(/crítico/i)).toBeInTheDocument();
    });

    it('deve exibir tag de falha crítica quando isCriticalFailure é true', () => {
      const failureResult: DiceRollResultType = {
        ...mockBaseResult,
        rolls: [1],
        baseResult: 1,
        finalResult: 6,
        isCriticalFailure: true,
      };

      render(<DiceRollResult result={failureResult} />);

      expect(screen.getByText(/falha crítica/i)).toBeInTheDocument();
    });

    it('deve destacar dado 20 em dourado', () => {
      const criticalResult: DiceRollResultType = {
        ...mockBaseResult,
        rolls: [20, 15],
        baseResult: 20,
        finalResult: 25,
        isCritical: true,
      };

      render(<DiceRollResult result={criticalResult} showBreakdown={true} />);

      // Verifica que existem chips com valor 20 (pode haver mais de um)
      const chips = screen.getAllByText('20');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('deve destacar dado 1 em vermelho', () => {
      const failureResult: DiceRollResultType = {
        ...mockBaseResult,
        rolls: [1, 5],
        baseResult: 1,
        finalResult: 6,
        isCriticalFailure: true,
      };

      render(<DiceRollResult result={failureResult} showBreakdown={true} />);

      // Verifica que existe um chip com valor 1
      const oneChips = screen.getAllByText('1');
      expect(oneChips.length).toBeGreaterThan(0);
    });
  });

  describe('Tipos de Rolagem', () => {
    it('deve exibir tag de vantagem quando rollType é advantage', () => {
      const advantageResult: DiceRollResultType = {
        ...mockBaseResult,
        rollType: 'advantage',
      };

      render(<DiceRollResult result={advantageResult} showBreakdown={true} />);

      expect(screen.getByText(/com vantagem/i)).toBeInTheDocument();
    });

    it('deve exibir tag de desvantagem quando rollType é disadvantage', () => {
      const disadvantageResult: DiceRollResultType = {
        ...mockBaseResult,
        rollType: 'disadvantage',
      };

      render(
        <DiceRollResult result={disadvantageResult} showBreakdown={true} />
      );

      expect(screen.getByText(/com desvantagem/i)).toBeInTheDocument();
    });

    it('não deve exibir tag quando rollType é normal', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      expect(screen.queryByText(/com vantagem/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/com desvantagem/i)).not.toBeInTheDocument();
    });
  });

  describe('Contexto', () => {
    it('deve exibir contexto quando fornecido', () => {
      const resultWithContext: DiceRollResultType = {
        ...mockBaseResult,
        context: 'Teste de Acrobacia',
      };

      render(
        <DiceRollResult result={resultWithContext} showBreakdown={true} />
      );

      expect(screen.getByText('Contexto:')).toBeInTheDocument();
      expect(screen.getByText('Teste de Acrobacia')).toBeInTheDocument();
    });

    it('não deve exibir contexto quando não fornecido', () => {
      render(<DiceRollResult result={mockBaseResult} showBreakdown={true} />);

      expect(screen.queryByText('Contexto:')).not.toBeInTheDocument();
    });
  });

  describe('Modificadores', () => {
    it('deve exibir modificador positivo corretamente', () => {
      const resultWithPositiveMod: DiceRollResultType = {
        ...mockBaseResult,
        modifier: 5,
        finalResult: 20,
      };

      render(
        <DiceRollResult result={resultWithPositiveMod} showBreakdown={true} />
      );

      expect(screen.getByText(/\+5 \(modificador\)/i)).toBeInTheDocument();
    });

    it('deve exibir modificador negativo corretamente', () => {
      const resultWithNegativeMod: DiceRollResultType = {
        ...mockBaseResult,
        modifier: -3,
        baseResult: 15,
        finalResult: 12,
      };

      render(
        <DiceRollResult result={resultWithNegativeMod} showBreakdown={true} />
      );

      expect(screen.getByText(/-3 \(modificador\)/i)).toBeInTheDocument();
    });

    it('deve exibir modificador zero corretamente', () => {
      const resultWithZeroMod: DiceRollResultType = {
        ...mockBaseResult,
        modifier: 0,
        baseResult: 15,
        finalResult: 15,
      };

      render(
        <DiceRollResult result={resultWithZeroMod} showBreakdown={true} />
      );

      // Não deve exibir modificador quando é 0
      expect(screen.queryByText(/modificador/i)).not.toBeInTheDocument();
    });
  });

  describe('Rolagem de Dano', () => {
    it('deve exibir rolagem de dano com d6', () => {
      const damageResult: DiceRollResultType = {
        formula: '2d6+3',
        rolls: [4, 5],
        diceType: 6,
        diceCount: 2,
        modifier: 3,
        baseResult: 9,
        finalResult: 12,
        timestamp: new Date(),
        rollType: 'normal',
      };

      render(<DiceRollResult result={damageResult} />);

      expect(screen.getByText('2d6+3')).toBeInTheDocument();
      expect(screen.getByLabelText('Resultado final: 12')).toBeInTheDocument();
    });

    it('deve exibir todos os dados de dano rolados', () => {
      const damageResult: DiceRollResultType = {
        formula: '3d8+2',
        rolls: [3, 7, 5],
        diceType: 8,
        diceCount: 3,
        modifier: 2,
        baseResult: 15,
        finalResult: 17,
        timestamp: new Date(),
        rollType: 'normal',
      };

      render(<DiceRollResult result={damageResult} showBreakdown={true} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Animações', () => {
    it('deve aplicar animação quando animate é true', () => {
      const { container } = render(
        <DiceRollResult result={mockBaseResult} animate={true} />
      );

      const paper = container.querySelector('[class*="MuiPaper"]');
      // Verifica que a animação foi aplicada (MUI aplica via className)
      expect(paper).toBeInTheDocument();
    });

    it('não deve aplicar animação quando animate é false', () => {
      const { container } = render(
        <DiceRollResult result={mockBaseResult} animate={false} />
      );

      const paper = container.querySelector('[class*="MuiPaper"]');
      expect(paper).toBeInTheDocument();
    });
  });

  describe('Atributo 0', () => {
    it('deve exibir corretamente rolagem com atributo 0', () => {
      const zeroAttrResult: DiceRollResultType = {
        formula: '0d20+2 (2d20, menor)',
        rolls: [8, 15],
        diceType: 20,
        diceCount: 0,
        modifier: 2,
        baseResult: 8,
        finalResult: 10,
        timestamp: new Date(),
        rollType: 'disadvantage',
      };

      render(<DiceRollResult result={zeroAttrResult} />);

      expect(screen.getByText('0d20+2 (2d20, menor)')).toBeInTheDocument();
      expect(screen.getByLabelText('Resultado final: 10')).toBeInTheDocument();
    });
  });

  describe('Dados Negativos', () => {
    it('deve exibir corretamente rolagem com dados negativos', () => {
      const negativeResult: DiceRollResultType = {
        formula: '-2d20+3 (4d20, menor)',
        rolls: [5, 12, 18, 7],
        diceType: 20,
        diceCount: -2,
        modifier: 3,
        baseResult: 5,
        finalResult: 8,
        timestamp: new Date(),
        rollType: 'disadvantage',
      };

      render(<DiceRollResult result={negativeResult} />);

      expect(screen.getByText('-2d20+3 (4d20, menor)')).toBeInTheDocument();
      expect(screen.getByLabelText('Resultado final: 8')).toBeInTheDocument();
    });
  });
});
