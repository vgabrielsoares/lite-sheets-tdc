/**
 * Tests for CombatTab component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { CombatTab } from '../CombatTab';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('CombatTab', () => {
  let mockCharacter: Character;
  const mockOnUpdate = jest.fn();
  const mockOnOpenHP = jest.fn();
  const mockOnOpenPP = jest.fn();
  const mockOnOpenDefense = jest.fn();
  const mockOnOpenPPLimit = jest.fn();

  beforeEach(() => {
    mockCharacter = createDefaultCharacter({ name: 'Test Character' });
    mockOnUpdate.mockClear();
    mockOnOpenHP.mockClear();
    mockOnOpenPP.mockClear();
    mockOnOpenDefense.mockClear();
    mockOnOpenPPLimit.mockClear();
  });

  describe('Rendering', () => {
    it('should render the combat tab title', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Combate')).toBeInTheDocument();
    });

    it('should render section headers', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Recursos Vitais')).toBeInTheDocument();
      expect(screen.getByText('Condições de Combate')).toBeInTheDocument();
      // Economia de Ações pode aparecer múltiplas vezes
      expect(screen.getAllByText('Economia de Ações').length).toBeGreaterThan(
        0
      );
    });

    it('should render Guard/Vitality component with correct values', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Default character has 15 GA and 5 PV
      expect(screen.getByText('Guarda (GA)')).toBeInTheDocument();
      expect(screen.getByText('Vitalidade (PV)')).toBeInTheDocument();
    });

    it('should render PP component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // PP label should be present
      expect(screen.getByText('Pontos de Poder (PP)')).toBeInTheDocument();
    });

    it('should render dying rounds component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Rodadas Morrendo')).toBeInTheDocument();
      // Default character: 2 + 1 (Corpo) = 3 max rounds
      expect(screen.getByText('0 / 3')).toBeInTheDocument();
    });

    it('should render PP limit component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Limite de PP/Rodada')).toBeInTheDocument();
      // Level 1 + Essência 1 = 2
      expect(screen.getByText('Nível +1')).toBeInTheDocument();
      expect(screen.getByText('Essência +1')).toBeInTheDocument();
    });

    it('should render defense test section', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // v0.0.2: Defesa é teste ativo, não valor fixo
      expect(screen.getByText('Teste de Defesa')).toBeInTheDocument();
    });
  });

  describe('Guard/Vitality Updates', () => {
    it('should call onUpdate when damage is applied to Guard', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Enter damage amount in Guard's input and click Sofrer
      const damageInputs = screen.getAllByLabelText('Quantidade para Sofrer');
      fireEvent.change(damageInputs[0], { target: { value: '1' } });
      const sofrerButtons = screen.getAllByRole('button', { name: 'Sofrer' });
      fireEvent.click(sofrerButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.guard.current).toBe(14); // 15 - 1
    });

    it('should update combat state when Guard reaches 0', () => {
      mockCharacter.combat.guard.current = 1;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Apply 1 damage to Guard
      const damageInputs = screen.getAllByLabelText('Quantidade para Sofrer');
      fireEvent.change(damageInputs[0], { target: { value: '1' } });
      const sofrerButtons = screen.getAllByRole('button', { name: 'Sofrer' });
      fireEvent.click(sofrerButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.guard.current).toBe(0);
    });
  });

  describe('PP Updates', () => {
    it('should call onUpdate when PP is modified', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Enter spend amount and click Gastar
      const spendInput = screen.getByLabelText('Quantidade para gastar PP');
      fireEvent.change(spendInput, { target: { value: '1' } });
      const spendButton = screen.getByRole('button', { name: 'Gastar' });
      fireEvent.click(spendButton);

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.pp.current).toBe(1); // 2 - 1
    });
  });

  describe('Dying State Updates', () => {
    it('should call onUpdate when dying state changes', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Click "Iniciar Morrendo"
      fireEvent.click(screen.getByText('Iniciar Morrendo'));

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.dyingState.isDying).toBe(true);
      expect(updateCall.combat.dyingState.currentRounds).toBe(1);
      expect(updateCall.combat.state).toBe('morrendo');
    });

    it('should update state to "morto" when dying rounds reach max', () => {
      mockCharacter.combat.dyingState = {
        isDying: true,
        currentRounds: 2,
        maxRounds: 3,
      };

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Click to add 1 round (will reach max)
      fireEvent.click(screen.getByLabelText('Adicionar 1 rodada morrendo'));

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.dyingState.currentRounds).toBe(3);
      expect(updateCall.combat.state).toBe('morto');
    });
  });

  describe('Sidebar Callbacks', () => {
    it('should call onOpenHP when Guard/Vitality component is clicked', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenHP={mockOnOpenHP}
        />
      );

      // Find the Guard/Vitality area and click it
      const guardLabel = screen.getByText('Guarda (GA)');
      fireEvent.click(guardLabel.closest('[role="button"]') as HTMLElement);

      expect(mockOnOpenHP).toHaveBeenCalled();
    });

    it('should call onOpenPP when PP component is clicked', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenPP={mockOnOpenPP}
        />
      );

      // Find the PP card and click it
      const ppLabel = screen.getByText('Pontos de Poder (PP)');
      fireEvent.click(ppLabel.closest('[class*="MuiCard"]') as HTMLElement);

      expect(mockOnOpenPP).toHaveBeenCalled();
    });

    it('should render defense test section (onOpenDefense is deprecated)', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenDefense={mockOnOpenDefense}
        />
      );

      // v0.0.2: Defense is now an active test, onOpenDefense is deprecated
      // Just verify the DefenseTest component renders
      expect(screen.getByText('Teste de Defesa')).toBeInTheDocument();
      // The prop is accepted but not used
      expect(mockOnOpenDefense).toBeDefined();
    });

    it('should call onOpenPPLimit when PP Limit component is clicked', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenPPLimit={mockOnOpenPPLimit}
        />
      );

      // Find the PP Limit card and click it
      const ppLimitLabel = screen.getByText('Limite de PP/Rodada');
      fireEvent.click(ppLimitLabel.closest('[role="button"]') as HTMLElement);

      expect(mockOnOpenPPLimit).toHaveBeenCalled();
    });
  });

  describe('Dynamic Calculations', () => {
    it('should reflect correct dying rounds based on Constitution', () => {
      mockCharacter.attributes.corpo = 3;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // 2 + 3 = 5 max rounds
      expect(screen.getByText('0 / 5')).toBeInTheDocument();
    });

    it('should reflect correct PP limit based on level and Essência', () => {
      mockCharacter.level = 5;
      mockCharacter.attributes.essencia = 3;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // 5 + 3 = 8
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
});
