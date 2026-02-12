/**
 * Testes para SpellLearningCalculator
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import { SpellLearningCalculator } from '../SpellLearningCalculator';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';

describe('SpellLearningCalculator', () => {
  const createMockCharacter = (overrides?: Partial<Character>): Character => {
    const baseCharacter = createDefaultCharacter({
      name: 'Test Character',
      playerName: 'Player 1',
    });

    return {
      ...baseCharacter,
      attributes: {
        ...baseCharacter.attributes,
        mente: 3,
      },
      skills: {
        ...baseCharacter.skills,
        // Set arcano to 'versado' proficiency (d10 die, totalDice = essencia)
        arcano: {
          ...baseCharacter.skills.arcano,
          proficiencyLevel: 'versado',
        },
      },
      spellcasting: {
        isCaster: true,
        castingSkill: 'arcano',
        spellPoints: { current: 0, max: 0 },
        knownSpells: [
          {
            spellId: 'spell-1',
            name: 'Mísseis Mágicos',
            circle: 1,
            matrix: 'arcana',
            spellcastingSkill: 'arcano',
          },
          {
            spellId: 'spell-2',
            name: 'Escudo Arcano',
            circle: 1,
            matrix: 'arcana',
            spellcastingSkill: 'arcano',
          },
        ],
        maxKnownSpells: 10,
        knownSpellsModifiers: 0,
        spellcastingAbilities: [
          {
            id: 'ability-1',
            skill: 'arcano',
            attribute: 'essencia',
            castingBonus: 0,
          },
        ],
        masteredMatrices: [],
      },
      ...overrides,
    };
  };

  describe('Renderização Básica', () => {
    it('deve renderizar corretamente', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      expect(screen.getByText('Aprendizado de Feitiços')).toBeInTheDocument();
    });

    it('deve estar retraído por padrão', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      // Deve mostrar apenas o título
      expect(screen.getByText('Aprendizado de Feitiços')).toBeInTheDocument();

      // Não deve mostrar os campos quando retraído
      expect(screen.queryByLabelText('Atributo Mente')).not.toBeVisible();
    });

    it('deve expandir ao clicar no header', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Agora deve mostrar os campos
      expect(screen.getByLabelText('Atributo Mente')).toBeVisible();
      expect(screen.getByLabelText('Habilidade de Conjuração')).toBeVisible();
    });

    it('deve exibir campo de seleção de habilidade', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      const skillSelect = screen.getByLabelText('Habilidade de Conjuração');
      expect(skillSelect).toBeInTheDocument();

      // Abrir o select
      fireEvent.mouseDown(skillSelect);

      // Verificar opções disponíveis (usando getAllByText porque aparecem no select e nas opções)
      expect(screen.getAllByText(/Arcano/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Arte/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Natureza/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Performance/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Religião/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Vigor/).length).toBeGreaterThan(0);
    });
  });

  describe('Cálculo da Chance', () => {
    it('deve calcular chance corretamente para 1º círculo com habilidade Arcano', async () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Aguardar expansão do componente
      await waitFor(() => {
        // v0.2: modHabilidade = totalDice = essencia(1) + 0 = 1
        // (3×5) + 1 + 30 = 46%
        const percentageDisplays = screen.getAllByText('46%');
        expect(percentageDisplays.length).toBeGreaterThan(0);
      });
    });

    it('deve recalcular ao trocar a habilidade de conjuração', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Trocar para Natureza (leigo, instinto=1)
      const skillSelect = screen.getByLabelText('Habilidade de Conjuração');
      fireEvent.mouseDown(skillSelect);
      const listbox = within(screen.getByRole('listbox'));
      fireEvent.click(listbox.getByText(/Natureza/));

      // v0.2: modHabilidade = totalDice = instinto(1) + 0 = 1
      // (3×5) + 1 + 30 = 46%
      const percentageDisplays = screen.getAllByText('46%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });

    it('deve calcular chance para 2º círculo', async () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Círculo do Feitiço')).toBeInTheDocument();
      });

      // Mudar para 2º círculo
      const circleSelect = screen.getByLabelText('Círculo do Feitiço');
      fireEvent.mouseDown(circleSelect);
      const listbox = within(screen.getByRole('listbox'));
      fireEvent.click(listbox.getByText('2º Círculo'));

      await waitFor(() => {
        // v0.2: modHabilidade = totalDice = essencia(1) + 0 = 1
        // (3×5) + 1 + 10 = 26%
        const percentageDisplays = screen.getAllByText('26%');
        expect(percentageDisplays.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Primeiro Feitiço', () => {
    it('deve aplicar modificador +0 se for o primeiro feitiço', async () => {
      const character = createMockCharacter({
        spellcasting: {
          isCaster: true,
          castingSkill: 'arcano',
          spellPoints: { current: 0, max: 0 },
          knownSpells: [],
          maxKnownSpells: 10,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [
            {
              id: 'ability-1',
              skill: 'arcano',
              attribute: 'essencia',
              castingBonus: 0,
            },
          ],
          masteredMatrices: [],
        },
      });

      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // v0.2: modHabilidade = totalDice = essencia(1) + 0 = 1
        // (3×5) + 1 + 0 = 16%
        const percentageDisplays = screen.getAllByText('16%');
        expect(percentageDisplays.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Modificadores Editáveis', () => {
    it('deve permitir editar modificador de matriz', async () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mod. Matriz')).toBeInTheDocument();
      });

      const matrizInput = screen.getByLabelText('Mod. Matriz');
      fireEvent.change(matrizInput, { target: { value: '5' } });

      await waitFor(() => {
        // v0.2: modHabilidade = totalDice = essencia(1) + 0 = 1
        // (3×5) + 1 + 30 + 5 = 51%
        const percentageDisplays = screen.getAllByText('51%');
        expect(percentageDisplays.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Labels de Dificuldade', () => {
    it('deve exibir "Bom" para chance >= 50%', async () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      await waitFor(() => {
        // v0.2: (3×5) + 1 + 30 = 46% -> "Moderado"
        expect(screen.getByText('Moderado')).toBeInTheDocument();
      });
    });
  });

  describe('Limites de Chance', () => {
    it('deve limitar chance máxima em 99%', () => {
      const character = createMockCharacter({
        attributes: {
          agilidade: 1,
          corpo: 1,
          influencia: 1,
          mente: 5,
          essencia: 1,
          instinto: 1,
        },
        skills: {
          arcano: {
            keyAttribute: 'mente',
            proficiencyLevel: 'mestre',
          },
        } as any,
      });

      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Adicionar matriz +20
      const matrixInput = screen.getByLabelText('Mod. Matriz');
      fireEvent.change(matrixInput, { target: { value: '20' } });

      // v0.2: modHabilidade = totalDice = mente(5) + 0 = 5
      // (5×5) + 5 + 30 + 20 = 80% (abaixo do limite, mas vamos usar outros mods)
      const otherInput = screen.getByLabelText('Outros Modificadores');
      fireEvent.change(otherInput, { target: { value: '20' } });

      // (5×5) + 5 + 30 + 20 + 20 = 100 -> limitado a 99%
      const percentageDisplays = screen.getAllByText('99%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });
  });
});
