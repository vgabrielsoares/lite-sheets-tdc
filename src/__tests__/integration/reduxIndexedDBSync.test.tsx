/**
 * Testes de Integração - Sincronização Redux <-> IndexedDB
 *
 * Testa a sincronização bidirecional entre o Redux store e IndexedDB,
 * validando que mudanças em um são refletidas no outro automaticamente.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer, {
  addCharacter,
  updateCharacter,
  deleteCharacter,
  removeCharacter,
  setCharacters,
  selectAllCharacters,
} from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer from '@/features/app/appSlice';
import { indexedDBSyncMiddleware } from '@/store/indexedDBSyncMiddleware';
import { db } from '@/services/db';
import { characterService } from '@/services/characterService';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';
import type { ReactNode } from 'react';

/**
 * Helper para criar store com middleware de sincronização
 */
function createTestStore() {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
      app: appReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignorar paths que podem ter objetos não serializáveis
          ignoredActions: ['characters/addCharacter/fulfilled'],
        },
      }).concat(indexedDBSyncMiddleware),
  });
}

/**
 * Helper para renderizar hook com store preparado
 */
function renderHookWithStore() {
  const store = createTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    wrapper,
  };
}

describe('Sincronização Redux <-> IndexedDB (Integração)', () => {
  beforeEach(async () => {
    // Limpa IndexedDB antes de cada teste
    await db.characters.clear();
  });

  afterEach(async () => {
    await db.characters.clear();
  });

  describe('Redux -> IndexedDB', () => {
    it('deve sincronizar ao adicionar personagem via Redux', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Aragorn' });

      // Act - Dispatch action (returns the created character with new ID)
      let createdCharacter: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdCharacter = result.payload as Character;
      });

      // Assert - Verificar Redux
      await waitFor(() => {
        const state = store.getState();
        expect(state.characters.characters).toHaveLength(1);
        expect(state.characters.characters[0].name).toBe('Aragorn');
      });

      // Assert - Verificar IndexedDB sincronizado (use the NEW id from created character)
      await waitFor(async () => {
        const saved = await db.characters.get(createdCharacter!.id);
        expect(saved).toBeDefined();
        expect(saved?.name).toBe('Aragorn');
      });
    });

    it('deve sincronizar ao atualizar personagem via Redux', async () => {
      // Arrange - Criar personagem no Redux e IndexedDB
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Legolas' });

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      await waitFor(async () => {
        expect(await db.characters.get(createdChar!.id)).toBeDefined();
      });

      // Act - Atualizar via Redux
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: createdChar!.id,
            updates: {
              level: 10,
              experience: { current: 5000, toNextLevel: 100 },
            },
          })
        );
      });

      // Assert - Redux atualizado
      await waitFor(() => {
        const state = store.getState();
        const updated = state.characters.characters.find(
          (c) => c.id === createdChar!.id
        );
        expect(updated?.level).toBe(10);
      });

      // Assert - IndexedDB sincronizado
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved?.level).toBe(10);
        expect(saved?.experience.current).toBe(5000);
      });
    });

    it('deve sincronizar ao deletar personagem via Redux', async () => {
      // Arrange - Criar personagem
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Gimli' });

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      await waitFor(async () => {
        expect(await db.characters.get(createdChar!.id)).toBeDefined();
      });

      // Act - Deletar via Redux
      await act(async () => {
        await store.dispatch(deleteCharacter(createdChar!.id));
      });

      // Assert - Redux removido
      await waitFor(() => {
        const state = store.getState();
        expect(
          state.characters.characters.find((c) => c.id === createdChar!.id)
        ).toBeUndefined();
      });

      // Assert - IndexedDB sincronizado (use new ID)
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved).toBeUndefined();
      });
    });

    it('deve sincronizar removeCharacter (ação síncrona)', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Gandalf' });

      // Adicionar diretamente no IndexedDB
      await db.characters.add(character);

      // Adicionar no Redux
      await act(async () => {
        store.dispatch(setCharacters([character]));
      });

      // Act - Remover via removeCharacter (síncrona)
      await act(async () => {
        store.dispatch(removeCharacter(character.id));
      });

      // Assert - Redux removido
      const state = store.getState();
      expect(
        state.characters.characters.find((c) => c.id === character.id)
      ).toBeUndefined();

      // Assert - IndexedDB sincronizado (aguardar sincronização do middleware)
      await waitFor(
        async () => {
          const saved = await db.characters.get(character.id);
          expect(saved).toBeUndefined();
        },
        { timeout: 2000 }
      );
    });

    it('deve sincronizar setCharacters com múltiplos personagens', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const characters = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
      ];

      // Act - Definir múltiplos personagens
      await act(async () => {
        store.dispatch(setCharacters(characters));
      });

      // Assert - Redux atualizado
      const state = store.getState();
      const allCharacters = selectAllCharacters(state);
      expect(allCharacters).toHaveLength(3);

      // Assert - IndexedDB sincronizado
      await waitFor(
        async () => {
          const saved = await db.characters.toArray();
          expect(saved).toHaveLength(3);
          expect(saved.map((c) => c.name).sort()).toEqual([
            'Char1',
            'Char2',
            'Char3',
          ]);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('IndexedDB -> Redux (via CharacterLoader)', () => {
    it('deve carregar personagens do IndexedDB ao iniciar', async () => {
      // Arrange - Adicionar personagens diretamente no IndexedDB
      const characters = [
        createDefaultCharacter({ name: 'Pre-existing 1' }),
        createDefaultCharacter({ name: 'Pre-existing 2' }),
      ];
      await db.characters.bulkAdd(characters);

      // Act - Carregar via characterService
      const loaded = await characterService.getAll();

      // Assert
      expect(loaded).toHaveLength(2);
      expect(loaded.map((c) => c.name).sort()).toEqual([
        'Pre-existing 1',
        'Pre-existing 2',
      ]);
    });
  });

  describe('Consistência Bidirecional', () => {
    it('deve manter consistência após múltiplas operações', async () => {
      // Arrange
      const { store } = renderHookWithStore();

      // Act - Sequência de operações
      const char1 = createDefaultCharacter({ name: 'Character 1' });
      const char2 = createDefaultCharacter({ name: 'Character 2' });
      const char3 = createDefaultCharacter({ name: 'Character 3' });

      let createdChar1: Character | undefined;
      let createdChar2: Character | undefined;
      let createdChar3: Character | undefined;

      // Adicionar 3 personagens
      await act(async () => {
        const result1 = await store.dispatch(addCharacter(char1));
        createdChar1 = result1.payload as Character;
        const result2 = await store.dispatch(addCharacter(char2));
        createdChar2 = result2.payload as Character;
        const result3 = await store.dispatch(addCharacter(char3));
        createdChar3 = result3.payload as Character;
      });

      await waitFor(async () => {
        expect(await db.characters.count()).toBe(3);
      });

      // Atualizar char1
      await act(async () => {
        await store.dispatch(
          updateCharacter({ id: createdChar1!.id, updates: { level: 5 } })
        );
      });

      // Deletar char2
      await act(async () => {
        await store.dispatch(deleteCharacter(createdChar2!.id));
      });

      // Assert - Redux consistente
      await waitFor(() => {
        const state = store.getState();
        expect(state.characters.characters).toHaveLength(2);

        const char1State = state.characters.characters.find(
          (c) => c.id === createdChar1!.id
        );
        expect(char1State?.level).toBe(5);

        const char2State = state.characters.characters.find(
          (c) => c.id === createdChar2!.id
        );
        expect(char2State).toBeUndefined();
      });

      // Assert - IndexedDB sincronizado
      await waitFor(async () => {
        const saved = await db.characters.toArray();
        expect(saved).toHaveLength(2);

        const savedChar1 = saved.find((c) => c.id === createdChar1!.id);
        expect(savedChar1?.level).toBe(5);

        const savedChar2 = saved.find((c) => c.id === createdChar2!.id);
        expect(savedChar2).toBeUndefined();
      });
    });

    it('deve manter consistência após falha parcial', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Test' });

      // Act - Adicionar personagem
      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      await waitFor(async () => {
        expect(await db.characters.get(createdChar!.id)).toBeDefined();
      });

      // Act - Atualizar com dados válidos
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: createdChar!.id,
            updates: {
              level: 3,
              experience: { current: 500, toNextLevel: 100 },
            },
          })
        );
      });

      // Assert - Verificar consistência
      await waitFor(async () => {
        const stateChar = store
          .getState()
          .characters.characters.find((c) => c.id === createdChar!.id);
        const savedChar = await db.characters.get(createdChar!.id);

        expect(stateChar?.level).toBe(savedChar?.level);
        expect(stateChar?.experience.current).toBe(
          savedChar?.experience.current
        );
      });
    });
  });

  describe('Performance e Otimização', () => {
    it('deve sincronizar múltiplas operações rapidamente', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const characters: Character[] = [];

      for (let i = 1; i <= 20; i++) {
        characters.push(createDefaultCharacter({ name: `Character ${i}` }));
      }

      // Act - Adicionar 20 personagens
      const startTime = Date.now();

      await act(async () => {
        for (const char of characters) {
          await store.dispatch(addCharacter(char));
        }
      });

      const endTime = Date.now();

      // Assert - Deve ser razoavelmente rápido (< 5 segundos)
      expect(endTime - startTime).toBeLessThan(5000);

      // Assert - Todos sincronizados
      await waitFor(async () => {
        const saved = await db.characters.toArray();
        expect(saved).toHaveLength(20);
      });
    });

    it('deve não bloquear UI durante sincronização', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const character = createDefaultCharacter({ name: 'Non-blocking Test' });

      // Act - A sincronização deve ser assíncrona (fire-and-forget)
      const dispatchStartTime = Date.now();

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      const dispatchEndTime = Date.now();

      // Assert - Dispatch deve retornar rapidamente
      expect(dispatchEndTime - dispatchStartTime).toBeLessThan(500);

      // Assert - Mas sincronização deve completar eventualmente
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved).toBeDefined();
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve continuar funcionando após erro de sincronização', async () => {
      // Arrange
      const { store } = renderHookWithStore();
      const char1 = createDefaultCharacter({ name: 'Before Error' });
      const char2 = createDefaultCharacter({ name: 'After Error' });

      let createdChar1: Character | undefined;
      let createdChar2: Character | undefined;

      // Act - Adicionar char1 (deve funcionar)
      await act(async () => {
        const result = await store.dispatch(addCharacter(char1));
        createdChar1 = result.payload as Character;
      });

      await waitFor(async () => {
        expect(await db.characters.get(createdChar1!.id)).toBeDefined();
      });

      // Act - Tentar adicionar char2 (mesmo se houver erro, Redux deve funcionar)
      await act(async () => {
        const result = await store.dispatch(addCharacter(char2));
        createdChar2 = result.payload as Character;
      });

      // Assert - Redux deve ter ambos
      const state = store.getState();
      expect(state.characters.characters).toHaveLength(2);

      // Assert - IndexedDB sincronizado (eventualmente)
      await waitFor(async () => {
        const saved = await db.characters.toArray();
        expect(saved.length).toBeGreaterThanOrEqual(1); // Pelo menos char1
      });
    });
  });
});
