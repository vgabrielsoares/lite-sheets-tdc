/**
 * Testes para SpellLearningCalculator
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SpellLearningCalculator } from '../SpellLearningCalculator';
import type { Character } from '@/types';

describe('SpellLearningCalculator', () => {
  const createMockCharacter = (overrides?: Partial<Character>): Character => ({
    id: 'char-1',
    name: 'Test Character',
    playerName: 'Player 1',
    level: 1,
    xp: { current: 0, forNextLevel: 1000 },
    linhagem: undefined,
    origem: undefined,
    attributes: {
      agilidade: 1,
      constituicao: 1,
      forca: 1,
      influencia: 1,
      mente: 3,
      presenca: 1,
    },
    pv: {
      max: 15,
      current: 15,
      temporary: 0,
    },
    pp: {
      max: 2,
      current: 2,
      temporary: 0,
    },
    combat: {
      defense: { base: 16, modifiers: 0 },
      initiative: { base: 1, modifiers: 0 },
      movement: { base: 9, modifiers: 0 },
      pvLimit: { total: 15, modifiers: 0 },
      ppLimit: { total: 2, modifiers: 0 },
      attacks: [],
      criticalRange: 20,
      criticalMultiplier: 2,
    },
    skills: {
      arcano: {
        keyAttribute: 'mente',
        proficiencyLevel: 'versado',
      },
      arte: {
        keyAttribute: 'presenca',
        proficiencyLevel: 'leigo',
      },
      natureza: {
        keyAttribute: 'mente',
        proficiencyLevel: 'leigo',
      },
      performance: {
        keyAttribute: 'presenca',
        proficiencyLevel: 'leigo',
      },
      religiao: {
        keyAttribute: 'mente',
        proficiencyLevel: 'leigo',
      },
      vigor: {
        keyAttribute: 'constituicao',
        proficiencyLevel: 'leigo',
      },
    } as any,
    languages: ['comum'],
    proficiencies: {
      weapons: ['simples'],
      armors: [],
      shields: [],
      tools: [],
      skills: [],
    },
    inventory: {
      items: [],
      currency: { PO: 10 },
      encumbrance: { current: 0, max: 50 },
    },
    spellcasting: {
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
          abilityId: 'spell-1',
          skill: 'arcano',
          attribute: 'presenca',
          dcBonus: 0,
          attackBonus: 0,
        },
      ],
      masteredMatrices: [],
    },
    crafts: [],
    senses: {
      perceptionBonus: 0,
      darkvision: 0,
    },
    size: 'medio',
    conditions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

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
    it('deve calcular chance corretamente para 1º círculo com habilidade Arcano', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Mente 3, Arcano versado (3×2=6), 1º círculo, não primeiro feitiço (já tem 2 feitiços)
      // (3×5) + 6 + 30 = 51%
      const percentageDisplays = screen.getAllByText('51%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });

    it('deve recalcular ao trocar a habilidade de conjuração', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Trocar para Natureza (leigo, modificador 0)
      const skillSelect = screen.getByLabelText('Habilidade de Conjuração');
      fireEvent.mouseDown(skillSelect);
      const listbox = within(screen.getByRole('listbox'));
      fireEvent.click(listbox.getByText(/Natureza/));

      // (3×5) + 0 + 30 = 45%
      const percentageDisplays = screen.getAllByText('45%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });

    it('deve calcular chance para 2º círculo', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Mudar para 2º círculo
      const circleSelect = screen.getByLabelText('Círculo do Feitiço');
      fireEvent.mouseDown(circleSelect);
      const listbox = within(screen.getByRole('listbox'));
      fireEvent.click(listbox.getByText('2º Círculo'));

      // (3×5) + 6 + 10 = 31%
      const percentageDisplays = screen.getAllByText('31%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('Primeiro Feitiço', () => {
    it('deve aplicar modificador +0 se for o primeiro feitiço', () => {
      const character = createMockCharacter({
        spellcasting: {
          knownSpells: [],
          maxKnownSpells: 10,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [
            {
              abilityId: 'spell-1',
              skill: 'arcano',
              attribute: 'presenca',
              dcBonus: 0,
              attackBonus: 0,
            },
          ],
          masteredMatrices: [],
        },
      });

      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // Mente 3, Arcano versado (3×2=6), 1º círculo, primeiro feitiço
      // (3×5) + 6 + 0 = 21%
      const percentageDisplays = screen.getAllByText('21%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('Modificadores Editáveis', () => {
    it('deve permitir editar modificador de matriz', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      const matrixInput = screen.getByLabelText('Mod. Matriz');
      fireEvent.change(matrixInput, { target: { value: '5' } });

      // (3×5) + 6 + 30 + 5 = 56%
      const percentageDisplays = screen.getAllByText('56%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('Labels de Dificuldade', () => {
    it('deve exibir "Bom" para chance >= 50%', () => {
      const character = createMockCharacter();
      render(<SpellLearningCalculator character={character} />);

      const expandButton = screen.getByLabelText('Expandir');
      fireEvent.click(expandButton);

      // (3×5) + 6 + 30 = 51% -> "Bom"
      expect(screen.getByText('Bom')).toBeInTheDocument();
    });
  });

  describe('Limites de Chance', () => {
    it('deve limitar chance máxima em 99%', () => {
      const character = createMockCharacter({
        attributes: {
          agilidade: 1,
          constituicao: 1,
          forca: 1,
          influencia: 1,
          mente: 5,
          presenca: 1,
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

      // (5×5) + 15 + 30 + 20 = 90% (abaixo do limite, mas vamos usar outros mods)
      const otherInput = screen.getByLabelText('Outros Modificadores');
      fireEvent.change(otherInput, { target: { value: '20' } });

      // (5×5) + 15 + 30 + 20 + 20 = 110 -> limitado a 99%
      const percentageDisplays = screen.getAllByText('99%');
      expect(percentageDisplays.length).toBeGreaterThan(0);
    });
  });
});
