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
      expect(screen.getByText('Defesas')).toBeInTheDocument();
    });

    it('should render HP component with correct values', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Default character has 15 HP
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should render PP component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // PP label should be present
      expect(screen.getByText('PP')).toBeInTheDocument();
    });

    it('should render dying rounds component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Rodadas Morrendo')).toBeInTheDocument();
      // Default character: 2 + 1 (Const) = 3 max rounds
      expect(screen.getByText('0 / 3')).toBeInTheDocument();
    });

    it('should render PP limit component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Limite de PP/Rodada')).toBeInTheDocument();
      // Level 1 + Presença 1 = 2
      expect(screen.getByText('Nível +1')).toBeInTheDocument();
      expect(screen.getByText('Presença +1')).toBeInTheDocument();
    });

    it('should render defense component', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Defesa')).toBeInTheDocument();
    });
  });

  describe('HP Updates', () => {
    it('should call onUpdate when HP is modified', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Click the damage button (-1)
      const damageButtons = screen.getAllByLabelText('Sofrer 1 de dano');
      fireEvent.click(damageButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.hp.current).toBe(14); // 15 - 1
    });

    it('should update combat state when HP reaches 0', () => {
      mockCharacter.combat.hp.current = 1;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Click the damage button (-1)
      const damageButtons = screen.getAllByLabelText('Sofrer 1 de dano');
      fireEvent.click(damageButtons[0]);

      expect(mockOnUpdate).toHaveBeenCalled();
      const updateCall = mockOnUpdate.mock.calls[0][0];
      expect(updateCall.combat.hp.current).toBe(0);
      expect(updateCall.combat.state).toBe('inconsciente');
    });
  });

  describe('PP Updates', () => {
    it('should call onUpdate when PP is modified', () => {
      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Click the spend PP button (-1)
      const spendButtons = screen.getAllByLabelText('Gastar 1 PP');
      fireEvent.click(spendButtons[0]);

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
    it('should call onOpenHP when HP component is clicked', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenHP={mockOnOpenHP}
        />
      );

      // Find the HP card and click it
      const pvLabel = screen.getByText('PV');
      fireEvent.click(pvLabel.closest('[role="button"]') as HTMLElement);

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
      const ppLabel = screen.getByText('PP');
      fireEvent.click(ppLabel.closest('[role="button"]') as HTMLElement);

      expect(mockOnOpenPP).toHaveBeenCalled();
    });

    it('should call onOpenDefense when Defense component is clicked', () => {
      renderWithTheme(
        <CombatTab
          character={mockCharacter}
          onUpdate={mockOnUpdate}
          onOpenDefense={mockOnOpenDefense}
        />
      );

      // Find the Defense card and click it
      const defenseLabel = screen.getByText('Defesa');
      fireEvent.click(
        defenseLabel.closest('[class*="MuiPaper-root"]') as HTMLElement
      );

      expect(mockOnOpenDefense).toHaveBeenCalled();
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
      mockCharacter.attributes.constituicao = 3;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // 2 + 3 = 5 max rounds
      expect(screen.getByText('0 / 5')).toBeInTheDocument();
    });

    it('should reflect correct PP limit based on level and Presença', () => {
      mockCharacter.level = 5;
      mockCharacter.attributes.presenca = 3;

      renderWithTheme(
        <CombatTab character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // 5 + 3 = 8
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
});
