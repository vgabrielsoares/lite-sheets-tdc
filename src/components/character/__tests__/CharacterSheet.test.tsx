import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CharacterSheet } from '../CharacterSheet';
import appReducer, { SheetPosition } from '@/features/app/appSlice';
import type { Character } from '@/types';
import { createDefaultCharacter } from '@/utils/characterFactory';

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: 'test-character-id',
  }),
}));

/**
 * Cria uma store de teste
 */
const createTestStore = (sheetPosition: SheetPosition = 'left') => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState: {
      app: {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
        sheetPosition,
      },
    },
  });
};

/**
 * Helper para renderizar o componente com Provider
 */
const renderWithProvider = (
  component: React.ReactElement,
  sheetPosition: SheetPosition = 'left'
) => {
  const store = createTestStore(sheetPosition);
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

/**
 * Testes do componente CharacterSheet
 */
describe('CharacterSheet', () => {
  const mockOnUpdate = jest.fn();
  let mockCharacter: Character;

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockPush.mockClear();
    mockCharacter = createDefaultCharacter({
      name: 'Aragorn',
      playerName: 'John Doe',
    });
  });

  describe('Renderização', () => {
    it('deve renderizar o breadcrumb com nome do personagem', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText('Fichas')).toBeInTheDocument();
      // Pode haver múltiplos elementos com "Aragorn" (breadcrumb + ficha)
      expect(screen.getAllByText('Aragorn').length).toBeGreaterThan(0);
    });

    it('deve renderizar a navegação por abas', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Verifica se pelo menos uma aba está presente
      expect(
        screen.getByRole('tab', { name: 'Principal' })
      ).toBeInTheDocument();
    });

    it('deve renderizar o conteúdo da aba principal por padrão', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Verifica se conteúdo da aba principal está visível (ex: "Linhagem")
      expect(screen.getByText('Linhagem')).toBeInTheDocument();
    });
  });

  describe('Navegação', () => {
    it('deve permitir voltar para a lista de fichas', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      const backLink = screen.getByText('Fichas');
      fireEvent.click(backLink);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('deve alternar entre abas corretamente', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Inicia na aba Principal - verifica conteúdo da aba main
      expect(screen.getByText('Linhagem')).toBeInTheDocument();

      // Navega para aba de Combate
      const combatTab = screen.getByRole('tab', { name: 'Combate' });
      fireEvent.click(combatTab);

      // Verifica se o conteúdo da aba de Combate está visível
      expect(
        screen.getByText(/será implementada na FASE 5/i)
      ).toBeInTheDocument();
    });
  });

  describe('Posicionamento', () => {
    it('deve ter botão de alternar posicionamento', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      const toggleButton = screen.getByLabelText(
        'Alternar posicionamento da ficha'
      );
      expect(toggleButton).toBeInTheDocument();
    });

    it('deve alternar o posicionamento ao clicar no botão', () => {
      const { store } = renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />,
        'left'
      );

      const toggleButton = screen.getByLabelText(
        'Alternar posicionamento da ficha'
      );

      // Estado inicial: left
      expect(store.getState().app.sheetPosition).toBe('left');

      // Clica para alternar
      fireEvent.click(toggleButton);

      // Verifica se mudou para right
      expect(store.getState().app.sheetPosition).toBe('right');

      // Clica novamente para alternar de volta
      fireEvent.click(toggleButton);

      // Verifica se voltou para left
      expect(store.getState().app.sheetPosition).toBe('left');
    });
  });

  describe('Atualização de personagem', () => {
    it('deve chamar onUpdate quando a aba atualizar o personagem', () => {
      // Este teste será expandido quando as abas tiverem funcionalidades de edição
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      // Por enquanto, apenas verifica se o componente renderiza sem erros
      // Pode haver múltiplos elementos com "Aragorn"
      expect(screen.getAllByText('Aragorn').length).toBeGreaterThan(0);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter roles ARIA corretos para tabpanel', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id', 'tabpanel-main');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-main');
    });

    it('deve ter breadcrumb acessível', () => {
      renderWithProvider(
        <CharacterSheet character={mockCharacter} onUpdate={mockOnUpdate} />
      );

      const breadcrumb = screen.getByRole('navigation', { name: 'navegação' });
      expect(breadcrumb).toBeInTheDocument();
    });
  });
});
