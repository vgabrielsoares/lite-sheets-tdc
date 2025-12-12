/**
 * Testes para useCharacterSync hook
 *
 * O hook useCharacterSync foi simplificado para apenas:
 * - Carregar personagens do IndexedDB na inicialização
 * - Expor estados de loading/error
 * - Manter forceSync() por compatibilidade (deprecated)
 *
 * A sincronização real é feita pelos thunks do Redux diretamente.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCharacterSync } from '../useCharacterSync';
import charactersReducer from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import { characterService } from '@/services/characterService';
import type { Character } from '@/types';

// Mock do characterService
jest.mock('@/services/characterService', () => ({
  characterService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock do useNotifications
const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();
jest.mock('../useNotifications', () => ({
  useNotifications: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess,
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

/**
 * Helper para criar um store de teste
 */
function createTestStore() {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
    },
  });
}

/**
 * Helper para criar um personagem de teste
 */
function createTestCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-1',
    name: 'Test Character',
    playerName: 'Test Player',
    level: 1,
    xp: 0,
    pv: { current: 15, max: 15, temporary: 0 },
    pp: { current: 2, max: 2, temporary: 0 },
    attributes: {
      agilidade: 1,
      constituicao: 1,
      forca: 1,
      influencia: 1,
      mente: 1,
      presenca: 1,
    },
    defense: { base: 15, armor: 0, shield: 0, other: 0 },
    weaponProficiencies: ['Armas Simples'],
    languages: ['Comum'],
    inventory: {
      items: [],
      currency: {
        physical: { copper: 0, gold: 10, platinum: 0 },
        bank: { copper: 0, gold: 0, platinum: 0 },
      },
    },
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Character;
}

/**
 * Helper para renderizar o hook com Provider
 */
function renderHookWithProvider() {
  const store = createTestStore();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    ...renderHook(() => useCharacterSync(), { wrapper }),
    store,
  };
}

describe('useCharacterSync', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset explícito dos mocks do characterService
    (characterService.create as jest.Mock).mockReset();
    (characterService.update as jest.Mock).mockReset();
    (characterService.delete as jest.Mock).mockReset();
    (characterService.getAll as jest.Mock).mockReset();
    (characterService.getById as jest.Mock).mockReset();
    mockShowError.mockReset();
    mockShowSuccess.mockReset();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Interface do Hook', () => {
    it('deve retornar isLoading, error e forceSync', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('forceSync');
      expect(typeof result.current.forceSync).toBe('function');
    });
  });

  describe('Carregamento Inicial', () => {
    it('deve carregar personagens do IndexedDB na montagem', async () => {
      const mockCharacters = [
        createTestCharacter({ id: 'char-1', name: 'Character 1' }),
        createTestCharacter({ id: 'char-2', name: 'Character 2' }),
      ];

      (characterService.getAll as jest.Mock).mockResolvedValue(mockCharacters);

      const { result } = renderHookWithProvider();

      // Inicialmente deve estar carregando
      expect(result.current.isLoading).toBe(true);

      // Aguardar carregamento
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificar que getAll foi chamado
      expect(characterService.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erro ao carregar personagens', async () => {
      const mockError = new Error('Erro ao carregar');
      (characterService.getAll as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHookWithProvider();

      // Aguardar erro
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.isLoading).toBe(false);
      expect(characterService.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve exibir notificação de erro quando falha ao carregar', async () => {
      const mockError = new Error('Database error');
      (characterService.getAll as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Verificar que showError foi chamado
      expect(mockShowError).toHaveBeenCalled();
    });

    it('deve carregar apenas uma vez mesmo com múltiplas re-renderizações', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result, rerender } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Re-renderizar múltiplas vezes
      rerender();
      rerender();
      rerender();

      // getAll deve ter sido chamado apenas uma vez
      expect(characterService.getAll).toHaveBeenCalledTimes(1);
    });

    it('não deve sincronizar durante carregamento inicial', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      renderHookWithProvider();

      await waitFor(() => {
        expect(characterService.getAll).toHaveBeenCalledTimes(1);
      });

      // Não deve chamar create ou update durante carregamento inicial
      expect(characterService.create).not.toHaveBeenCalled();
      expect(characterService.update).not.toHaveBeenCalled();
    });
  });

  describe('Estado de Loading', () => {
    it('deve retornar isLoading true enquanto carrega', async () => {
      let resolvePromise: (value: Character[]) => void;
      const loadPromise = new Promise<Character[]>((resolve) => {
        resolvePromise = resolve;
      });

      (characterService.getAll as jest.Mock).mockReturnValue(loadPromise);

      const { result } = renderHookWithProvider();

      expect(result.current.isLoading).toBe(true);

      // Resolver a promise
      await act(async () => {
        resolvePromise!([]);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('deve retornar isLoading false após carregamento bem-sucedido', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([
        createTestCharacter(),
      ]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('deve retornar isLoading false após erro', async () => {
      (characterService.getAll as jest.Mock).mockRejectedValue(
        new Error('Erro')
      );

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Estado de Erro', () => {
    it('deve retornar error null quando carregamento bem-sucedido', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('deve retornar error com mensagem quando falha', async () => {
      (characterService.getAll as jest.Mock).mockRejectedValue(
        new Error('Falha ao conectar')
      );

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });
  });

  describe('forceSync (Deprecated)', () => {
    it('deve logar warning quando forceSync é chamado', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Chamar forceSync
      act(() => {
        result.current.forceSync();
      });

      // Deve logar warning sobre deprecation
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
    });

    it('forceSync não deve chamar serviços de persistência', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Limpar mocks
      jest.clearAllMocks();

      // Chamar forceSync
      act(() => {
        result.current.forceSync();
      });

      // Não deve chamar serviços
      expect(characterService.create).not.toHaveBeenCalled();
      expect(characterService.update).not.toHaveBeenCalled();
      expect(characterService.delete).not.toHaveBeenCalled();
    });

    it('forceSync pode ser chamado múltiplas vezes sem erro', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Chamar forceSync múltiplas vezes
      expect(() => {
        act(() => {
          result.current.forceSync();
          result.current.forceSync();
          result.current.forceSync();
        });
      }).not.toThrow();
    });
  });

  describe('Integração com Store', () => {
    it('deve refletir estado do store após carregamento', async () => {
      const mockCharacters = [
        createTestCharacter({ id: 'char-1' }),
        createTestCharacter({ id: 'char-2' }),
      ];

      (characterService.getAll as jest.Mock).mockResolvedValue(mockCharacters);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificar que personagens foram carregados no store
      const state = store.getState();
      expect(state.characters.ids).toHaveLength(2);
    });

    it('não deve alterar store se getAll retorna array vazio', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const state = store.getState();
      expect(state.characters.ids).toHaveLength(0);
    });
  });

  describe('Comportamento de Cleanup', () => {
    it('deve manter estado consistente após unmount', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result, unmount } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Unmount não deve causar erro
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Documentação do Comportamento Atual', () => {
    it('sincronização é feita pelos thunks, não pelo hook', async () => {
      // Este teste documenta o comportamento esperado:
      // O hook NÃO faz sincronização automática
      // Os thunks (addCharacter, updateCharacter, deleteCharacter)
      // já chamam o characterService diretamente

      (characterService.getAll as jest.Mock).mockResolvedValue([]);

      const { result } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Hook não deve ter observadores de mudanças
      // Apenas carrega dados iniciais e expõe estados

      expect(characterService.getAll).toHaveBeenCalledTimes(1);
      expect(characterService.create).not.toHaveBeenCalled();
      expect(characterService.update).not.toHaveBeenCalled();
    });
  });
});
