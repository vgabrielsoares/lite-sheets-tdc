/**
 * Testes para SkillRow
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillRow } from '../SkillRow';
import type { Skill, Attributes } from '@/types';

// Mock dos dados
const mockAttributes: Attributes = {
  agilidade: 2,
  constituicao: 3,
  forca: 1,
  influencia: 2,
  mente: 2,
  presenca: 1,
};

const mockSkill: Skill = {
  name: 'acrobacia',
  keyAttribute: 'agilidade',
  proficiencyLevel: 'versado',
  isSignature: false,
  modifiers: [],
};

const mockSignatureSkill: Skill = {
  name: 'atletismo',
  keyAttribute: 'constituicao',
  proficiencyLevel: 'adepto',
  isSignature: true,
  modifiers: [],
};

describe('SkillRow', () => {
  const mockOnKeyAttributeChange = jest.fn();
  const mockOnProficiencyChange = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome da habilidade corretamente', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Acrobacia')).toBeInTheDocument();
  });

  it('deve exibir o atributo-chave selecionado', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Verificar que o atributo correto está exibido
    const agilidadeElements = screen.getAllByText('Agilidade');
    expect(agilidadeElements.length).toBeGreaterThan(0);
  });

  it('deve exibir a proficiência selecionada', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Verificar que a proficiência correta está exibida
    expect(screen.getByText('Versado')).toBeInTheDocument();
  });

  it('deve calcular e exibir o modificador total corretamente', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Agilidade 2, Versado (x2) = +4
    const modifiers = screen.getAllByText('+4');
    expect(modifiers.length).toBeGreaterThan(0);
  });

  it('deve exibir a fórmula de rolagem corretamente', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Agilidade 2, modificador +4 = 2d20+4
    const formulas = screen.getAllByText('2d20+4');
    expect(formulas.length).toBeGreaterThan(0);
  });

  it('deve chamar onClick quando a linha é clicada', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    const row = screen
      .getByText('Acrobacia')
      .closest('div[role]')?.parentElement;
    if (row) {
      fireEvent.click(row);
      expect(mockOnClick).toHaveBeenCalledWith('acrobacia');
    }
  });

  it('deve renderizar corretamente com callback de alteração de atributo', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    const attributeSelect = screen.getByLabelText(
      /Atributo-chave para Acrobacia/i
    );
    expect(attributeSelect).toBeInTheDocument();
    expect(mockOnKeyAttributeChange).not.toHaveBeenCalled();
  });

  it('deve renderizar corretamente com callback de alteração de proficiência', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    const proficiencySelect = screen.getByLabelText(
      /Proficiência em Acrobacia/i
    );
    expect(proficiencySelect).toBeInTheDocument();
    expect(mockOnProficiencyChange).not.toHaveBeenCalled();
  });

  it('deve exibir ícone de estrela quando é Habilidade de Assinatura', () => {
    render(
      <SkillRow
        skill={mockSignatureSkill}
        attributes={mockAttributes}
        characterLevel={5}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Verificar ícone de estrela
    const starIcon = screen.getByTestId('StarIcon');
    expect(starIcon).toBeInTheDocument();
  });

  it('deve aplicar bônus de assinatura corretamente', () => {
    render(
      <SkillRow
        skill={mockSignatureSkill}
        attributes={mockAttributes}
        characterLevel={5}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Constituição 3, Adepto (x1) = 3, + bônus assinatura 5 (não-combate) = +8
    const modifiers = screen.getAllByText('+8');
    expect(modifiers.length).toBeGreaterThan(0);
  });

  it('deve aplicar penalidade de carga quando sobrecarregado', () => {
    render(
      <SkillRow
        skill={mockSkill} // Acrobacia tem propriedade Carga
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={true} // Sobrecarregado
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Agilidade 2, Versado (x2) = 4, - penalidade carga 5 = -1
    const modifiers = screen.getAllByText('-1');
    expect(modifiers.length).toBeGreaterThan(0);
  });

  it('deve destacar visualmente quando atributo foi customizado', () => {
    const customSkill: Skill = {
      ...mockSkill,
      keyAttribute: 'forca', // Diferente do padrão (agilidade)
    };

    render(
      <SkillRow
        skill={customSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Verificar se há ícone de customização
    const swapIcons = screen.getAllByTestId('SwapHorizIcon');
    expect(swapIcons.length).toBeGreaterThan(0);
  });

  it('deve exibir modificador negativo com sinal correto', () => {
    const weakSkill: Skill = {
      ...mockSkill,
      proficiencyLevel: 'leigo', // x0 = modificador 0
      modifiers: [
        { name: 'Ferimento', type: 'penalty', value: -3, source: 'condição' },
      ],
    };

    render(
      <SkillRow
        skill={weakSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onKeyAttributeChange={mockOnKeyAttributeChange}
        onProficiencyChange={mockOnProficiencyChange}
        onClick={mockOnClick}
      />
    );

    // Leigo (x0) = 0, - 3 (ferimento) = -3
    const modifiers = screen.getAllByText('-3');
    expect(modifiers.length).toBeGreaterThan(0);
  });
});
