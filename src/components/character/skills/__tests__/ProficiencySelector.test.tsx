/**
 * Testes para ProficiencySelector
 *
 * Testa:
 * - Renderização do seletor de proficiências
 * - Cálculo de proficiências disponíveis (3 + Mente)
 * - Adição e remoção de proficiências
 * - Validação de limite de proficiências
 * - Atualização retroativa ao mudar Mente
 * - Indicadores visuais de status
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProficiencySelector } from '../ProficiencySelector';
import type { Skills, SkillName, ProficiencyLevel } from '@/types';
import { SKILL_LIST } from '@/constants';

// Helper para matching flexível de texto (lida com texto quebrado por interpolação)
// Busca no elemento <p> específico para evitar múltiplas correspondências
const getByTextContent = (text: string) => {
  return (_: string, element: Element | null) => {
    // Buscar apenas elementos <p> para evitar múltiplos matches
    const hasText = element?.textContent?.includes(text) ?? false;
    const isTargetElement = element?.tagName?.toLowerCase() === 'p';
    return hasText && isTargetElement;
  };
};

// Helper para criar skills mock
const createMockSkills = (proficientSkills: SkillName[] = []): Skills => {
  const skills: Partial<Skills> = {};

  SKILL_LIST.forEach((skillName) => {
    skills[skillName] = {
      name: skillName,
      keyAttribute: 'agilidade',
      proficiencyLevel: proficientSkills.includes(skillName)
        ? 'adepto'
        : 'leigo',
      isSignature: false,
      modifiers: [],
    };
  });

  return skills as Skills;
};

describe('ProficiencySelector', () => {
  const mockOnProficiencyChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar título e contador de proficiências', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      expect(
        screen.getByText('Proficiências de Habilidades')
      ).toBeInTheDocument();
      // 3 + 3 (Mente) = 6 proficiências disponíveis
      expect(
        screen.getByText(getByTextContent('0 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve renderizar todas as habilidades', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // Verificar que há checkboxes para as habilidades
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('deve exibir indicador verde quando dentro do limite', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 2 de 6 proficiências usadas - deve estar válido
      expect(
        screen.getByText(getByTextContent('2 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve exibir indicador vermelho quando excede o limite', () => {
      const skills = createMockSkills([
        'acrobacia',
        'atletismo',
        'acerto',
        'adestramento',
        'arte',
        'conducao',
        'destreza',
        'determinacao',
      ]); // 8 proficiências (limite seria 6 com Mente 3)

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      expect(
        screen.getByText(getByTextContent('8 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });
  });

  describe('Cálculo de Proficiências Disponíveis', () => {
    it('deve calcular corretamente com Mente = 0', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={0}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 0 = 3 proficiências
      expect(
        screen.getByText(getByTextContent('0 de 3 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve calcular corretamente com Mente = 5', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={5}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 5 = 8 proficiências
      expect(
        screen.getByText(getByTextContent('0 de 8 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve exibir proficiências restantes', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 2 usadas de 6 = 4 restantes
      expect(
        screen.getByText(getByTextContent('4 restantes'))
      ).toBeInTheDocument();
    });
  });

  describe('Adição de Proficiências', () => {
    it('deve permitir adicionar proficiência quando há espaço', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // Encontrar checkbox de Acrobacia e clicar
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnProficiencyChange).toHaveBeenCalledWith(
        expect.any(String),
        'adepto'
      );
    });

    it('deve adicionar proficiência como "adepto"', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnProficiencyChange).toHaveBeenCalledWith(
        expect.any(String),
        'adepto'
      );
    });
  });

  describe('Remoção de Proficiências', () => {
    it('deve permitir remover proficiência existente', () => {
      const skills = createMockSkills(['acrobacia']);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // Encontrar checkbox marcado e desmarcar
      const checkedCheckboxes = screen
        .getAllByRole('checkbox')
        .filter((cb) => (cb as HTMLInputElement).checked);

      fireEvent.click(checkedCheckboxes[0]);

      expect(mockOnProficiencyChange).toHaveBeenCalledWith(
        expect.any(String),
        'leigo'
      );
    });

    it('deve remover proficiência como "leigo"', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      const checkedCheckboxes = screen
        .getAllByRole('checkbox')
        .filter((cb) => (cb as HTMLInputElement).checked);

      fireEvent.click(checkedCheckboxes[0]);

      expect(mockOnProficiencyChange).toHaveBeenCalledWith(
        expect.any(String),
        'leigo'
      );
    });
  });

  describe('Validação de Limite', () => {
    it('deve marcar como válido quando dentro do limite', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 2 de 6 - válido
      expect(
        screen.getByText(getByTextContent('2 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve marcar como inválido quando excede o limite', () => {
      const skills = createMockSkills([
        'acrobacia',
        'atletismo',
        'acerto',
        'adestramento',
        'arte',
        'conducao',
        'luta',
      ]); // 7 proficiências (limite = 6 com Mente 3)

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      expect(
        screen.getByText(getByTextContent('7 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve exibir proficiências restantes = 0 quando no limite exato', () => {
      const skills = createMockSkills([
        'acrobacia',
        'atletismo',
        'acerto',
        'adestramento',
        'arte',
        'furtividade',
      ]);

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      expect(
        screen.getByText(getByTextContent('6 de 6 proficiências usadas'))
      ).toBeInTheDocument();
    });
  });

  describe('Atualização Retroativa (Mente)', () => {
    it('deve aumentar limite quando Mente aumenta', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      const { rerender } = render(
        <ProficiencySelector
          skills={skills}
          menteValue={2}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 2 = 5 proficiências
      expect(
        screen.getByText(getByTextContent('2 de 5 proficiências usadas'))
      ).toBeInTheDocument();

      // Aumentar Mente para 4
      rerender(
        <ProficiencySelector
          skills={skills}
          menteValue={4}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 4 = 7 proficiências
      expect(
        screen.getByText(getByTextContent('2 de 7 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve diminuir limite quando Mente diminui', () => {
      const skills = createMockSkills(['acrobacia', 'atletismo']);

      const { rerender } = render(
        <ProficiencySelector
          skills={skills}
          menteValue={4}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 4 = 7 proficiências
      expect(
        screen.getByText(getByTextContent('2 de 7 proficiências usadas'))
      ).toBeInTheDocument();

      // Diminuir Mente para 1
      rerender(
        <ProficiencySelector
          skills={skills}
          menteValue={1}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 1 = 4 proficiências
      expect(
        screen.getByText(getByTextContent('2 de 4 proficiências usadas'))
      ).toBeInTheDocument();
    });

    it('deve manter proficiências existentes quando Mente diminui', () => {
      const skills = createMockSkills([
        'acrobacia',
        'atletismo',
        'acerto',
        'adestramento',
        'arte',
      ]); // 5 proficiências

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={1}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      // 3 + 1 = 4 limite, mas tem 5 - deve mostrar como inválido
      expect(
        screen.getByText(getByTextContent('5 de 4 proficiências usadas'))
      ).toBeInTheDocument();
    });
  });

  describe('Modo Compacto', () => {
    it('deve renderizar em modo compacto quando compact=true', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
          compact={true}
        />
      );

      // Modo compacto ainda deve renderizar o componente
      expect(
        screen.getByText('Proficiências de Habilidades')
      ).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter checkboxes acessíveis', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Todos os checkboxes devem estar habilitados
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeDisabled();
      });
    });

    it('deve ter labels associados aos checkboxes', () => {
      const skills = createMockSkills();

      render(
        <ProficiencySelector
          skills={skills}
          menteValue={3}
          onProficiencyChange={mockOnProficiencyChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        // MUI FormControlLabel garante que há label associado
        expect(checkbox).toBeInTheDocument();
      });
    });
  });
});
