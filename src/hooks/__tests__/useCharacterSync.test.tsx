/**
 * Testes para useCharacterSync hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCharacterSync } from '../useCharacterSync';
import charactersReducer, {
  loadCharacters,
  addCharacter,
} from '@/features/characters/charactersSlice';
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
jest.mock('../useNotifications', () => ({
  useNotifications: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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

  describe('Sincronização com Debounce', () => {
    it('deve sincronizar mudanças com debounce de 500ms', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Adicionar personagem ao Redux
      const newCharacter = createTestCharacter({
        id: 'new-char',
        name: 'New Character',
      });

      await act(async () => {
        await store.dispatch(addCharacter(newCharacter));
      });

      // Não deve sincronizar imediatamente
      expect(characterService.create).not.toHaveBeenCalled();

      // Avançar timers em menos de 500ms
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(characterService.create).not.toHaveBeenCalled();

      // Avançar timers para completar o debounce
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      // Aguardar sincronização
      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalledTimes(1);
      });
    });

    it('deve resetar debounce ao fazer múltiplas mudanças', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const char1 = createTestCharacter({ id: 'char-1', name: 'Char 1' });
      const char2 = createTestCharacter({ id: 'char-2', name: 'Char 2' });

      // Adicionar primeiro personagem
      await act(async () => {
        await store.dispatch(addCharacter(char1));
      });

      // Avançar tempo parcial
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Adicionar segundo personagem (deve resetar debounce)
      await act(async () => {
        await store.dispatch(addCharacter(char2));
      });

      // Avançar mais 300ms (total de 600ms desde primeira mudança, mas só 300ms desde segunda)
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Ainda não deve ter sincronizado
      expect(characterService.create).not.toHaveBeenCalled();

      // Completar debounce
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      // Agora deve sincronizar ambos
      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Sincronização Forçada', () => {
    it('deve forçar sincronização imediata sem debounce', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Adicionar personagem
      const newCharacter = createTestCharacter();
      await act(async () => {
        await store.dispatch(addCharacter(newCharacter));
      });

      // Forçar sincronização
      await act(async () => {
        result.current.forceSync();
      });

      // Deve sincronizar imediatamente
      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalledTimes(1);
      });
    });

    it('deve cancelar timer de debounce ao forçar sincronização', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newCharacter = createTestCharacter();
      await act(async () => {
        await store.dispatch(addCharacter(newCharacter));
      });

      // Avançar tempo parcial
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Forçar sincronização
      await act(async () => {
        result.current.forceSync();
      });

      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalledTimes(1);
      });

      // Avançar tempo restante do debounce
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Não deve sincronizar novamente
      expect(characterService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detecção de Mudanças', () => {
    it('não deve sincronizar se não houve mudanças', async () => {
      const mockCharacters = [createTestCharacter()];
      (characterService.getAll as jest.Mock).mockResolvedValue(mockCharacters);

      renderHookWithProvider();

      await waitFor(() => {
        expect(characterService.getAll).toHaveBeenCalledTimes(1);
      });

      // Avançar tempo
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Não deve tentar sincronizar
      expect(characterService.create).not.toHaveBeenCalled();
      expect(characterService.update).not.toHaveBeenCalled();
    });

    it('deve sincronizar apenas quando houver mudanças reais', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Adicionar personagem
      const newCharacter = createTestCharacter();
      await act(async () => {
        await store.dispatch(addCharacter(newCharacter));
      });

      // Completar debounce
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalledTimes(1);
      });

      // Limpar mock
      (characterService.create as jest.Mock).mockClear();

      // Avançar tempo sem mudanças
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Não deve sincronizar novamente
      expect(characterService.create).not.toHaveBeenCalled();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro ao sincronizar e exibir notificação', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockRejectedValue(
        new Error('Erro ao salvar')
      );

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Adicionar personagem
      const newCharacter = createTestCharacter();
      await act(async () => {
        await store.dispatch(addCharacter(newCharacter));
      });

      // Completar debounce
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Aguardar tentativa de sincronização
      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalled();
      });

      // Verificar que erro foi logado (console.error)
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Atualização vs Criação', () => {
    it('deve atualizar personagem existente', async () => {
      const existingChar = createTestCharacter({ id: 'existing-char' });

      (characterService.getAll as jest.Mock).mockResolvedValue([existingChar]);
      (characterService.getById as jest.Mock).mockResolvedValue(existingChar);
      (characterService.update as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modificar personagem existente
      const updatedChar = { ...existingChar, name: 'Updated Name' };

      await act(async () => {
        // Usar setCharacters para simular atualização
        store.dispatch({
          type: 'characters/setCharacters',
          payload: [updatedChar],
        });
      });

      // Completar debounce
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Deve chamar update, não create
      await waitFor(() => {
        expect(characterService.update).toHaveBeenCalled();
        expect(characterService.create).not.toHaveBeenCalled();
      });
    });

    it('deve criar personagem novo', async () => {
      (characterService.getAll as jest.Mock).mockResolvedValue([]);
      (characterService.getById as jest.Mock).mockResolvedValue(null);
      (characterService.create as jest.Mock).mockResolvedValue(undefined);

      const { result, store } = renderHookWithProvider();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Adicionar novo personagem
      const newChar = createTestCharacter({ id: 'new-char' });

      await act(async () => {
        await store.dispatch(addCharacter(newChar));
      });

      // Completar debounce
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Deve chamar create
      await waitFor(() => {
        expect(characterService.create).toHaveBeenCalled();
        expect(characterService.update).not.toHaveBeenCalled();
      });
    });
  });
});
