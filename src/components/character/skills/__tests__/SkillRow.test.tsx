/**
 * Testes para SkillRow
 *
 * O SkillRow agora exibe valores estáticos (Chips) para atributo-chave
 * e proficiência. A edição desses valores é feita apenas na sidebar.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillRow } from '../SkillRow';
import type { Skill, Attributes } from '@/types';

// Mock dos dados
const mockAttributes: Attributes = {
  agilidade: 2,
  corpo: 3,
  influencia: 2,
  mente: 2,
  essencia: 1,
  instinto: 1,
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
  keyAttribute: 'corpo',
  proficiencyLevel: 'adepto',
  isSignature: true,
  modifiers: [],
};

describe('SkillRow', () => {
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
        onClick={mockOnClick}
      />
    );

    // Verificar que o atributo correto está exibido (usa abreviação AGI)
    const agiElements = screen.getAllByText('AGI');
    expect(agiElements.length).toBeGreaterThan(0);
  });

  it('deve exibir a proficiência selecionada', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // Verificar que a proficiência correta está exibida (label completo em desktop)
    expect(screen.getByText('Versado')).toBeInTheDocument();
  });

  it('deve calcular e exibir o modificador total corretamente', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // v0.2: Agilidade 2, Versado (d10) = pool 2d10
    expect(screen.getByText('2d10')).toBeInTheDocument();
  });

  it('deve exibir a fórmula de rolagem corretamente', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // v0.2: Agilidade 2, Versado (d10) = pool 2d10
    expect(screen.getByText('2d10')).toBeInTheDocument();
  });

  it('deve chamar onClick quando a linha é clicada', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
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

  it('deve exibir o chip de atributo-chave', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // Verificar que o chip de atributo está visível
    const agiChips = screen.getAllByText('AGI');
    expect(agiChips.length).toBeGreaterThan(0);
  });

  it('deve exibir o chip de proficiência', () => {
    render(
      <SkillRow
        skill={mockSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // Verifica que a proficiência está exibida como chip (label completo em desktop)
    expect(screen.getByText('Versado')).toBeInTheDocument();
  });

  it('deve exibir ícone de estrela quando é Habilidade de Assinatura', () => {
    render(
      <SkillRow
        skill={mockSignatureSkill}
        attributes={mockAttributes}
        characterLevel={5}
        isOverloaded={false}
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
        onClick={mockOnClick}
      />
    );

    // v0.2: Corpo 3, Adepto (d8), + bônus assinatura +1d (level 5) = pool 4d8
    expect(screen.getByText('4d8')).toBeInTheDocument();
  });

  it('deve aplicar penalidade de carga quando sobrecarregado', () => {
    render(
      <SkillRow
        skill={mockSkill} // Acrobacia tem propriedade Carga
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={true} // Sobrecarregado
        onClick={mockOnClick}
      />
    );

    // v0.2: Agilidade 2, Versado (d10), overloaded -2d = 0d → penalty roll 2d10 (menor)
    expect(screen.getByText(/2d10.*menor/i)).toBeInTheDocument();
  });

  it('deve destacar visualmente quando atributo foi customizado', () => {
    const customSkill: Skill = {
      ...mockSkill,
      keyAttribute: 'corpo', // Diferente do padrão (agilidade)
    };

    render(
      <SkillRow
        skill={customSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
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
      proficiencyLevel: 'leigo',
      modifiers: [
        {
          name: 'Ferimento',
          type: 'penalidade',
          value: -3,
          affectsDice: true,
        },
      ],
    };

    render(
      <SkillRow
        skill={weakSkill}
        attributes={mockAttributes}
        characterLevel={1}
        isOverloaded={false}
        onClick={mockOnClick}
      />
    );

    // Exibe chip de modificador de dados -3d
    const modifiers = screen.getAllByText('-3d');
    expect(modifiers.length).toBeGreaterThan(0);
  });
});
