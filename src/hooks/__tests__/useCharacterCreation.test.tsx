import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import { useCharacterCreation } from '../useCharacterCreation';
import charactersReducer from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer from '@/features/app/appSlice';
import type { ReactNode } from 'react';

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

/**
 * Helper para criar um store de teste
 */
function createTestStore() {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
      app: appReducer,
    },
  });
}

/**
 * Helper para renderizar hook com providers necessários
 */
function renderHookWithProviders() {
  const store = createTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    ...renderHook(() => useCharacterCreation(), { wrapper }),
    store,
  };
}

describe('useCharacterCreation', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      const { result } = renderHookWithProviders();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.createdCharacter).toBeNull();
    });

    it('deve fornecer todas as funções necessárias', () => {
      const { result } = renderHookWithProviders();

      expect(typeof result.current.createCharacter).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });
  });

  describe('Validação', () => {
    it('deve rejeitar criação sem nome', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: '' });
      });

      expect(result.current.error).toBe('O nome do personagem é obrigatório');
      expect(result.current.isLoading).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('deve rejeitar criação com nome somente espaços', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: '   ' });
      });

      expect(result.current.error).toBe('O nome do personagem é obrigatório');
    });

    it('deve rejeitar criação com nome muito curto', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'A' });
      });

      expect(result.current.error).toBe(
        'O nome do personagem deve ter pelo menos 2 caracteres'
      );
    });

    it('deve rejeitar criação com nome muito longo', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'A'.repeat(101) });
      });

      expect(result.current.error).toBe(
        'O nome do personagem não pode ter mais de 100 caracteres'
      );
    });
  });

  describe('Criação de Personagem', () => {
    it('deve criar personagem com nome válido', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'Aragorn' });
      });

      const state = store.getState();
      const characters = Object.values(state.characters.entities);
      expect(characters).toHaveLength(1);
      expect(characters[0].name).toBe('Aragorn');
      expect(result.current.error).toBeNull();
    });

    it('deve criar personagem com nome e nome do jogador', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({
          name: 'Legolas',
          playerName: 'João',
        });
      });

      const state = store.getState();
      const characters = Object.values(state.characters.entities);
      expect(characters[0].name).toBe('Legolas');
      expect(characters[0].playerName).toBe('João');
    });

    it('deve trimmar espaços do nome do personagem', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: '  Gimli  ' });
      });

      const state = store.getState();
      const characters = Object.values(state.characters.entities);
      expect(characters[0].name).toBe('Gimli');
    });

    it('deve criar personagem com valores padrão de nível 1', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'Gandalf' });
      });

      const state = store.getState();
      const character = Object.values(state.characters.entities)[0];

      // Verificar valores padrão básicos
      expect(character.level).toBe(1);
      expect(character.combat.hp.max).toBe(15);
      expect(character.combat.hp.current).toBe(15);
      expect(character.combat.pp.max).toBe(2);
      expect(character.combat.pp.current).toBe(2);

      // Verificar atributos
      expect(character.attributes.agilidade).toBe(1);
      expect(character.attributes.corpo).toBe(1);
      expect(character.attributes.influencia).toBe(1);
      expect(character.attributes.mente).toBe(1);
      expect(character.attributes.essencia).toBe(1);
      expect(character.attributes.instinto).toBe(1);

      // Verificar idiomas (comum - lowercase como definido em LANGUAGE_LIST)
      expect(character.languages).toContain('comum');

      // Verificar inventário inicial
      expect(character.inventory.items).toHaveLength(2);
      expect(
        character.inventory.items.find((item) => item.name === 'Mochila')
      ).toBeDefined();
      expect(
        character.inventory.items.find(
          (item) => item.name === 'Cartão do Banco'
        )
      ).toBeDefined();
      // 10 PO$ no banco (já que o personagem começa com Cartão do Banco)
      expect(character.inventory.currency.bank.ouro).toBe(10);
    });
  });

  describe('Navegação', () => {
    it('deve redirecionar para ficha criada após sucesso', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'Boromir' });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringMatching(/^\/characters\?id=.+$/)
        );
      });
    });

    it('deve redirecionar para home ao cancelar', () => {
      const { result } = renderHookWithProviders();

      act(() => {
        result.current.cancel();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Gerenciamento de Erro', () => {
    it('deve limpar erro com clearError', async () => {
      const { result } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: '' });
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Notificações', () => {
    it('deve disparar notificação de sucesso ao criar personagem', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: 'Pippin' });
      });

      const state = store.getState();
      expect(state.notifications.notifications).toHaveLength(1);
      expect(state.notifications.notifications[0].severity).toBe('success');
      expect(state.notifications.notifications[0].message).toBe(
        'Ficha criada com sucesso!'
      );
    });

    it('deve disparar notificação de erro em caso de falha na validação', async () => {
      const { result, store } = renderHookWithProviders();

      await act(async () => {
        await result.current.createCharacter({ name: '' });
      });

      const state = store.getState();
      expect(state.notifications.notifications).toHaveLength(1);
      expect(state.notifications.notifications[0].severity).toBe('error');
    });
  });
});
