/**
 * Testes para SignatureAbility
 *
 * Testa a funcionalidade de seleção de Habilidade de Assinatura:
 * - Renderização do componente
 * - Seleção de habilidade
 * - Cálculo de bônus correto
 * - Diferenciação entre habilidades de combate e não-combate
 * - Validação de apenas uma habilidade selecionada
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignatureAbility } from '../SignatureAbility';
import { Skills, SkillName } from '@/types';
import { SKILL_LIST, COMBAT_SKILLS } from '@/constants';

// Helper para criar skills mock
const createMockSkills = (signatureSkill?: SkillName): Skills => {
  const skills = {} as Skills;

  SKILL_LIST.forEach((skillName) => {
    skills[skillName] = {
      name: skillName,
      keyAttribute: 'agilidade',
      proficiencyLevel: 'adepto',
      isSignature: skillName === signatureSkill,
      modifiers: [],
    };
  });

  return skills;
};

describe('SignatureAbility', () => {
  const mockOnSignatureChange = jest.fn();

  beforeEach(() => {
    mockOnSignatureChange.mockClear();
  });

  // Helper: busca o Alert de sucesso que mostra o bônus de assinatura
  const getSuccessAlert = () =>
    screen.getAllByRole('alert').find((a) => a.textContent?.includes('recebe'));

  describe('Renderização', () => {
    it('deve renderizar o componente sem habilidade selecionada', () => {
      const skills = createMockSkills();

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      expect(screen.getByText('Habilidade de Assinatura')).toBeInTheDocument();
      expect(
        screen.getByText(/Selecione uma habilidade.../i)
      ).toBeInTheDocument();
    });

    it('deve renderizar o componente com habilidade selecionada', () => {
      const skills = createMockSkills('acrobacia');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={3}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Verificar que a habilidade está selecionada no combobox
      const select = screen.getByRole('combobox');
      expect(select).toHaveTextContent('Acrobacia');

      // Verificar Alert de sucesso com o bônus (v0.0.2: Math.min(3, ceil(3/5)) = 1)
      const alerts = screen.getAllByRole('alert');
      const successAlert = alerts.find((alert) =>
        alert.textContent?.includes('Acrobacia recebe')
      );
      expect(successAlert).toBeDefined();
      expect(successAlert).toHaveTextContent('Acrobacia');
      expect(successAlert).toHaveTextContent('recebe');
      expect(successAlert).toHaveTextContent('+1d');
    });

    it('deve renderizar em modo compacto', () => {
      const skills = createMockSkills();

      const { container } = render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
          compact
        />
      );

      // Em modo compacto, não deve mostrar a explicação detalhada
      expect(
        screen.queryByText(/Bônus de Habilidade de Assinatura:/i)
      ).not.toBeInTheDocument();
    });

    it('deve renderizar explicação detalhada em modo normal', () => {
      const skills = createMockSkills();

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      expect(
        screen.getByText(/Bônus de Habilidade de Assinatura:/i)
      ).toBeInTheDocument();
      // v0.0.2: Mostra faixas de nível em vez de combate/não-combate
      expect(screen.getByText(/Nível 1-5:/i)).toBeInTheDocument();
      expect(screen.getByText(/Nível 6-10:/i)).toBeInTheDocument();
      expect(screen.getByText(/Nível 11-15:/i)).toBeInTheDocument();
    });
  });

  describe('Seleção de Habilidade', () => {
    it('deve chamar onSignatureChange ao selecionar uma habilidade', async () => {
      const skills = createMockSkills();

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Abrir o select
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      // Aguardar o menu abrir e selecionar "Acrobacia +1"
      const option = await screen.findByRole('option', {
        name: /Acrobacia.*\+1/i,
      });
      fireEvent.click(option);

      expect(mockOnSignatureChange).toHaveBeenCalledWith('acrobacia');
    });

    it('deve chamar onSignatureChange com null ao desmarcar', async () => {
      const skills = createMockSkills('acrobacia');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Abrir o select
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      // Selecionar "Nenhuma selecionada"
      const option = await screen.findByRole('option', {
        name: /Nenhuma selecionada/i,
      });
      fireEvent.click(option);

      expect(mockOnSignatureChange).toHaveBeenCalledWith(null);
    });

    it('deve mostrar todas as 33 habilidades no dropdown', async () => {
      const skills = createMockSkills();

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Abrir o select
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      // Aguardar as opções aparecerem
      await screen.findByRole('option', { name: /Nenhuma selecionada/i });

      // Verificar que todas as opções estão presentes (+1 para "Nenhuma selecionada")
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(SKILL_LIST.length + 1);
    });
  });

  describe('Cálculo de Bônus', () => {
    it('deve calcular bônus +2d para nível 7 (faixa 6-10)', () => {
      const skills = createMockSkills('atletismo');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={7}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(7/5)) = 2
      expect(getSuccessAlert()).toHaveTextContent('+2d');
    });

    it('deve calcular bônus +2d para nível 9 (faixa 6-10)', () => {
      const skills = createMockSkills('acerto'); // Acerto é combate, mas bônus é o mesmo

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={9}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(9/5)) = 2
      expect(getSuccessAlert()).toHaveTextContent('+2d');
    });

    it('deve calcular bônus +1d para nível baixo (faixa 1-5)', () => {
      const skills = createMockSkills('luta'); // Luta é combate

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={2}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(2/5)) = 1
      expect(getSuccessAlert()).toHaveTextContent('+1d');
    });

    it('deve mostrar chip "Combate" para habilidades de combate', () => {
      const skills = createMockSkills('acerto');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={5}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Deve haver chip "Combate" no select renderValue
      const combatChips = screen.getAllByText('Combate');
      expect(combatChips.length).toBeGreaterThan(0);
    });

    it('deve calcular mesmo bônus para combate e não-combate no mesmo nível (v0.0.2)', () => {
      // v0.0.2: Sem distinção combate/não-combate para assinatura
      const skillsNonCombat = createMockSkills('atletismo');
      const { rerender } = render(
        <SignatureAbility
          skills={skillsNonCombat}
          characterLevel={6}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(6/5)) = 2 para não-combate
      expect(getSuccessAlert()).toHaveTextContent('+2d');

      // Combate: mesmo bônus
      const skillsCombat = createMockSkills('acerto');
      rerender(
        <SignatureAbility
          skills={skillsCombat}
          characterLevel={6}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(6/5)) = 2 para combate também
      expect(getSuccessAlert()).toHaveTextContent('+2d');
    });
  });

  describe('Identificação de Habilidades de Combate', () => {
    it('deve identificar corretamente todas as habilidades de combate', () => {
      const skills = createMockSkills();

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Abrir o select uma única vez para ver as opções
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      // As habilidades de combate devem ter o chip "Combate"
      // Deve haver pelo menos 7 chips (um para cada habilidade de combate)
      const combatChips = screen.getAllByText('Combate');
      expect(combatChips.length).toBeGreaterThanOrEqual(COMBAT_SKILLS.length);
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com nível 0 (bônus 0 ou 1 mínimo)', () => {
      const skills = createMockSkills('atletismo');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={0}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Nível 0, bônus = Math.min(3, ceil(0/5)) = 0
      expect(screen.getByText(/\+0d/i)).toBeInTheDocument();
    });

    it('deve ter bônus máximo de +3d para nível alto', () => {
      const skills = createMockSkills('persuasao');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={30}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(30/5)) = 3 (cap at 3)
      expect(getSuccessAlert()).toHaveTextContent('+3d');
    });

    it('deve atualizar bônus quando nível muda', () => {
      const skills = createMockSkills('medicina');

      const { rerender } = render(
        <SignatureAbility
          skills={skills}
          characterLevel={3}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(3/5)) = 1
      expect(getSuccessAlert()).toHaveTextContent('+1d');

      // Atualizar nível
      rerender(
        <SignatureAbility
          skills={skills}
          characterLevel={7}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // v0.0.2: Math.min(3, ceil(7/5)) = 2
      expect(getSuccessAlert()).toHaveTextContent('+2d');
    });
  });

  describe('Validação de Apenas Uma Assinatura', () => {
    it('deve encontrar apenas uma habilidade de assinatura', () => {
      const skills = createMockSkills('investigacao');

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      // Verificar que "Investigação" está selecionada no select
      const select = screen.getByRole('combobox');
      expect(select).toHaveTextContent('Investigação');

      // Verificar que está mostrando o bônus correto no Alert de sucesso
      const successAlerts = screen
        .getAllByRole('alert')
        .filter((alert) => alert.textContent?.includes('recebe'));
      expect(successAlerts.length).toBe(1);
      expect(successAlerts[0]).toHaveTextContent('Investigação');
      expect(successAlerts[0]).toHaveTextContent('+1');
    });

    it('deve lidar com nenhuma habilidade de assinatura', () => {
      const skills = createMockSkills(); // Nenhuma assinatura

      render(
        <SignatureAbility
          skills={skills}
          characterLevel={1}
          onSignatureChange={mockOnSignatureChange}
        />
      );

      expect(
        screen.getByText(/Selecione uma habilidade.../i)
      ).toBeInTheDocument();
    });
  });
});
