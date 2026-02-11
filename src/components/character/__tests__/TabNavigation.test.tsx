import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabNavigation, CHARACTER_TABS } from '../TabNavigation';
import type { CharacterTabId } from '../TabNavigation';

/**
 * Testes do componente TabNavigation
 */
describe('TabNavigation', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar todas as abas no desktop', () => {
      render(<TabNavigation currentTab="main" onTabChange={mockOnTabChange} />);

      CHARACTER_TABS.forEach((tab) => {
        expect(screen.getByText(tab.label)).toBeInTheDocument();
      });
    });

    it('deve renderizar com a aba correta selecionada', () => {
      const { rerender } = render(
        <TabNavigation currentTab="main" onTabChange={mockOnTabChange} />
      );

      // Verifica se a aba 'main' está selecionada
      const mainTab = screen.getByRole('tab', { name: 'Principal' });
      expect(mainTab).toHaveAttribute('aria-selected', 'true');

      // Troca para outra aba
      rerender(
        <TabNavigation currentTab="combat" onTabChange={mockOnTabChange} />
      );

      // Verifica se a aba 'combat' está selecionada
      const combatTab = screen.getByRole('tab', { name: 'Combate' });
      expect(combatTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Navegação', () => {
    it('deve chamar onTabChange ao clicar em uma aba', () => {
      render(<TabNavigation currentTab="main" onTabChange={mockOnTabChange} />);

      const combatTab = screen.getByRole('tab', { name: 'Combate' });
      fireEvent.click(combatTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('combat');
    });

    it('deve permitir navegação entre todas as abas', () => {
      render(<TabNavigation currentTab="main" onTabChange={mockOnTabChange} />);

      // Filtrar a aba atual ('main') pois o MUI Tabs não dispara onChange ao clicar na aba já selecionada
      const otherTabs = CHARACTER_TABS.filter((tab) => tab.id !== 'main');

      otherTabs.forEach((tab, index) => {
        const tabElement = screen.getByRole('tab', { name: tab.label });
        fireEvent.click(tabElement);

        expect(mockOnTabChange).toHaveBeenNthCalledWith(index + 1, tab.id);
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter roles ARIA corretos', () => {
      render(<TabNavigation currentTab="main" onTabChange={mockOnTabChange} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      CHARACTER_TABS.forEach((tab) => {
        const tabElement = screen.getByRole('tab', { name: tab.label });
        expect(tabElement).toHaveAttribute('id', `tab-${tab.id}`);
        expect(tabElement).toHaveAttribute(
          'aria-controls',
          `tabpanel-${tab.id}`
        );
      });
    });

    it('deve ter label de navegação', () => {
      render(<TabNavigation currentTab="main" onTabChange={mockOnTabChange} />);

      const tablist = screen.getByRole('tablist', {
        name: 'Navegação da ficha de personagem',
      });
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Dados das abas', () => {
    it('deve ter 9 abas definidas', () => {
      expect(CHARACTER_TABS).toHaveLength(9);
    });

    it('deve ter todas as abas com id e label', () => {
      CHARACTER_TABS.forEach((tab) => {
        expect(tab).toHaveProperty('id');
        expect(tab).toHaveProperty('label');
        expect(typeof tab.id).toBe('string');
        expect(typeof tab.label).toBe('string');
      });
    });

    it('deve ter as abas na ordem correta', () => {
      const expectedOrder: CharacterTabId[] = [
        'main',
        'combat',
        'archetypes',
        'resources',
        'specials',
        'inventory',
        'spells',
        'description',
        'notes',
      ];

      CHARACTER_TABS.forEach((tab, index) => {
        expect(tab.id).toBe(expectedOrder[index]);
      });
    });
  });
});
