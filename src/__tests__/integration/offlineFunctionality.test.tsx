/**
 * Testes de Integração - Funcionalidade Offline
 *
 * Testa o funcionamento da aplicação em modo offline, validando
 * que todas as funcionalidades principais (CRUD, persistência, etc.)
 * continuam funcionando sem conexão com a internet.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer, {
  addCharacter,
  updateCharacter,
  deleteCharacter,
} from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer from '@/features/app/appSlice';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { db } from '@/services/db';
import { characterService } from '@/services/characterService';
import { createDefaultCharacter } from '@/utils/characterFactory';
import { serializeCharacterToObject } from '@/services/exportService';
import { importCharacter } from '@/services/importService';
import type { Character } from '@/types';
import type { ReactNode } from 'react';

// Mock File para ambiente jsdom (File.text não implementado)
class FakeFile {
  constructor(
    private readonly parts: Array<string | Blob>,
    public readonly name: string,
    public readonly options?: { type?: string }
  ) {}

  async text(): Promise<string> {
    return this.parts
      .map((part) => (typeof part === 'string' ? part : ''))
      .join('');
  }

  get type(): string {
    return this.options?.type ?? 'application/json';
  }
}

const selectCharactersArray = (state: any): Character[] =>
  Object.values(state.characters.entities ?? {});

/**
 * Helper para criar store de teste
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
 * Helper para renderizar hook com providers
 */
function renderHookWithProviders() {
  const store = createTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    ...renderHook(() => useOnlineStatus(), { wrapper }),
    store,
  };
}

/**
 * Mock do navigator.onLine
 */
function mockOnlineStatus(isOnline: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: isOnline,
  });
}

/**
 * Simula evento de mudança de status online/offline
 */
function triggerOnlineStatusChange(isOnline: boolean) {
  mockOnlineStatus(isOnline);
  const event = new Event(isOnline ? 'online' : 'offline');
  window.dispatchEvent(event);
}

describe('Funcionalidade Offline (Integração)', () => {
  beforeEach(async () => {
    // Limpa IndexedDB antes de cada teste
    await db.characters.clear();

    // Restaura status online padrão
    mockOnlineStatus(true);
  });

  afterEach(async () => {
    await db.characters.clear();

    // Restaura status online
    mockOnlineStatus(true);
  });

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).File = FakeFile as any;
  });

  describe('Detecção de Status Online/Offline', () => {
    it('deve detectar status online inicial', () => {
      // Arrange
      mockOnlineStatus(true);

      // Act
      const { result } = renderHookWithProviders();

      // Assert
      expect(result.current).toBe(true);
    });

    it('deve detectar status offline inicial', () => {
      // Arrange
      mockOnlineStatus(false);

      // Act
      const { result } = renderHookWithProviders();

      // Assert
      expect(result.current).toBe(false);
    });

    it('deve detectar mudança de online para offline', async () => {
      // Arrange
      mockOnlineStatus(true);
      const { result } = renderHookWithProviders();

      // Assert - Inicialmente online
      expect(result.current).toBe(true);

      // Act - Simular perda de conexão
      act(() => {
        triggerOnlineStatusChange(false);
      });

      // Assert - Agora offline
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('deve detectar mudança de offline para online', async () => {
      // Arrange
      mockOnlineStatus(false);
      const { result } = renderHookWithProviders();

      // Assert - Inicialmente offline
      expect(result.current).toBe(false);

      // Act - Simular reconexão
      act(() => {
        triggerOnlineStatusChange(true);
      });

      // Assert - Agora online
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('deve detectar múltiplas mudanças de status', async () => {
      // Arrange
      mockOnlineStatus(true);
      const { result } = renderHookWithProviders();

      // Assert - Online
      expect(result.current).toBe(true);

      // Act - Offline
      act(() => {
        triggerOnlineStatusChange(false);
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      // Act - Online novamente
      act(() => {
        triggerOnlineStatusChange(true);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Act - Offline novamente
      act(() => {
        triggerOnlineStatusChange(false);
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('CRUD Offline - Criação', () => {
    it('deve criar personagem offline', async () => {
      // Arrange
      mockOnlineStatus(false);
      const store = createTestStore();
      const character = createDefaultCharacter({ name: 'Offline Character' });

      // Act - Get new ID from dispatch result
      let createdCharacter: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdCharacter = result.payload as Character;
      });

      // Assert - Redux atualizado
      await waitFor(() => {
        const state = store.getState();
        const chars = selectCharactersArray(state);
        expect(chars).toHaveLength(1);
        expect(chars[0].name).toBe('Offline Character');
      });

      // Assert - IndexedDB persistido (use NEW id)
      const saved = await db.characters.get(createdCharacter!.id);
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Offline Character');
    });

    it('deve criar múltiplos personagens offline', async () => {
      // Arrange
      mockOnlineStatus(false);
      const store = createTestStore();

      const characters = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
      ];

      // Act - Track created IDs
      const createdIds: string[] = [];
      await act(async () => {
        for (const char of characters) {
          const result = await store.dispatch(addCharacter(char));
          const created = result.payload as Character;
          createdIds.push(created.id);
        }
      });

      // Assert - Todos criados
      await waitFor(async () => {
        const saved = await db.characters.toArray();
        expect(saved).toHaveLength(3);
      });
    });
  });

  describe('CRUD Offline - Leitura', () => {
    it('deve ler personagens do IndexedDB offline', async () => {
      // Arrange - Criar personagens enquanto online
      mockOnlineStatus(true);
      const characters = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
      ];
      await db.characters.bulkAdd(characters);

      // Act - Ficar offline e ler
      mockOnlineStatus(false);
      const loaded = await characterService.getAll();

      // Assert - Dados disponíveis offline
      expect(loaded).toHaveLength(2);
      expect(loaded.map((c) => c.name).sort()).toEqual(['Char1', 'Char2']);
    });

    it('deve buscar personagem específico offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test Offline' });
      await db.characters.add(character);

      // Act - Ficar offline e buscar
      mockOnlineStatus(false);
      const found = await characterService.getById(character.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Offline');
    });
  });

  describe('CRUD Offline - Atualização', () => {
    it('deve atualizar personagem offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Initial Name' });
      const store = createTestStore();

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      // Act - Ficar offline e atualizar
      mockOnlineStatus(false);

      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: createdChar!.id,
            updates: { name: 'Updated Name', level: 5 },
          })
        );
      });

      // Assert - Redux atualizado
      await waitFor(() => {
        const state = store.getState();
        const updated = selectCharactersArray(state).find(
          (c) => c.id === createdChar!.id
        );
        expect(updated?.name).toBe('Updated Name');
        expect(updated?.level).toBe(5);
      });

      // Assert - IndexedDB sincronizado
      const saved = await db.characters.get(createdChar!.id);
      expect(saved?.name).toBe('Updated Name');
      expect(saved?.level).toBe(5);
    });

    it('deve atualizar múltiplos campos offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test' });
      const store = createTestStore();

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      mockOnlineStatus(false);

      // Act - Atualizar vários campos
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: createdChar!.id,
            updates: {
              level: 10,
              experience: {
                ...character.experience,
                current: 5000,
              },
              combat: {
                ...character.combat,
                guard: {
                  ...character.combat.guard,
                  current: 50,
                  max: 60,
                },
                pp: {
                  ...character.combat.pp,
                  current: 5,
                  max: 10,
                  temporary: 0,
                },
              },
              attributes: {
                ...character.attributes,
                corpo: 5,
                agilidade: 4,
              },
            },
          })
        );
      });

      // Assert
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved?.level).toBe(10);
        expect(saved?.experience.current).toBe(5000);
        expect(saved?.combat.guard.current).toBe(50);
        expect(saved?.attributes.corpo).toBe(5);
      });
    });
  });

  describe('CRUD Offline - Exclusão', () => {
    it('deve deletar personagem offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'To Delete' });
      const store = createTestStore();

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      // Act - Ficar offline e deletar
      mockOnlineStatus(false);

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

      // Assert - IndexedDB removido
      const saved = await db.characters.get(createdChar!.id);
      expect(saved).toBeUndefined();
    });
  });

  describe('Exportação/Importação Offline', () => {
    it('deve exportar personagem offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Export Offline' });
      await db.characters.add(character);

      // Act - Ficar offline e exportar
      mockOnlineStatus(false);
      const exported = serializeCharacterToObject(character);

      // Assert
      expect(exported).toBeDefined();
      expect(exported.character.name).toBe('Export Offline');
      expect(exported.version).toBeDefined();
    });

    it('deve importar personagem offline', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Import Offline' });
      character.level = 7;

      const exported = serializeCharacterToObject(character);
      const jsonString = JSON.stringify(exported);

      // Act - Ficar offline e importar
      mockOnlineStatus(false);

      const file = new FakeFile([jsonString], 'character.json', {
        type: 'application/json',
      });
      const imported = await importCharacter(file as unknown as File);

      // Assert
      expect('character' in imported).toBe(true);
      if ('character' in imported) {
        expect(imported.character.name).toBe('Import Offline');
        expect(imported.character.level).toBe(7);
      }
    });

    it('deve exportar e importar enquanto offline (backup local)', async () => {
      // Arrange - Criar personagens offline
      mockOnlineStatus(false);

      const characters = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
      ];
      await db.characters.bulkAdd(characters);

      // Act - Exportar ambos
      const exports = characters.map((char) =>
        serializeCharacterToObject(char)
      );

      // Limpar banco (simular perda de dados)
      await db.characters.clear();

      // Act - Importar backup
      const file1 = new FakeFile([JSON.stringify(exports[0])], 'char1.json', {
        type: 'application/json',
      });
      const file2 = new FakeFile([JSON.stringify(exports[1])], 'char2.json', {
        type: 'application/json',
      });

      const imported1 = await importCharacter(file1 as unknown as File);
      const imported2 = await importCharacter(file2 as unknown as File);

      // Assert
      expect('character' in imported1 && imported1.character.name).toBe(
        'Char1'
      );
      expect('character' in imported2 && imported2.character.name).toBe(
        'Char2'
      );
    });
  });

  describe('Sincronização ao Retornar Online', () => {
    it('deve manter dados criados offline ao retornar online', async () => {
      // Arrange - Criar offline
      mockOnlineStatus(false);
      const store = createTestStore();
      const character = createDefaultCharacter({ name: 'Created Offline' });

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      // Act - Retornar online
      mockOnlineStatus(true);

      // Assert - Dados ainda presentes
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved).toBeDefined();
        expect(saved?.name).toBe('Created Offline');
      });

      const state = store.getState();
      expect(
        state.characters.characters.find((c) => c.id === createdChar!.id)
      ).toBeDefined();
    });

    it('deve manter mudanças feitas offline após reconexão', async () => {
      // Arrange - Criar online
      mockOnlineStatus(true);
      const store = createTestStore();
      const character = createDefaultCharacter({ name: 'Initial' });

      let createdChar: Character | undefined;
      await act(async () => {
        const result = await store.dispatch(addCharacter(character));
        createdChar = result.payload as Character;
      });

      // Act - Ficar offline e atualizar
      mockOnlineStatus(false);

      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: createdChar!.id,
            updates: { level: 10, name: 'Updated Offline' },
          })
        );
      });

      // Act - Retornar online
      mockOnlineStatus(true);

      // Assert - Mudanças mantidas
      await waitFor(async () => {
        const saved = await db.characters.get(createdChar!.id);
        expect(saved?.name).toBe('Updated Offline');
        expect(saved?.level).toBe(10);
      });
    });
  });

  describe('Feedback Visual de Status Offline', () => {
    it('useOnlineStatus deve permitir componentes reagirem ao status', () => {
      // Arrange
      mockOnlineStatus(true);
      const { result } = renderHookWithProviders();

      // Assert - Online
      expect(result.current).toBe(true);

      // Act - Simular offline
      act(() => {
        triggerOnlineStatusChange(false);
      });

      // Assert - Hook atualizado
      waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Performance Offline', () => {
    it('operações offline devem ser rápidas', async () => {
      // Arrange
      mockOnlineStatus(false);
      const store = createTestStore();
      const character = createDefaultCharacter({ name: 'Performance Test' });

      // Act - Medir tempo de criação
      const startTime = Date.now();

      await act(async () => {
        await store.dispatch(addCharacter(character));
      });

      const endTime = Date.now();

      // Assert - Deve ser rápido (< 500ms)
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('deve suportar volume de dados offline', async () => {
      // Arrange
      mockOnlineStatus(false);
      const characters: Character[] = [];

      for (let i = 1; i <= 50; i++) {
        characters.push(createDefaultCharacter({ name: `Character ${i}` }));
      }

      // Act
      const startTime = Date.now();
      await db.characters.bulkAdd(characters);
      const endTime = Date.now();

      // Assert - Operação rápida (< 2 segundos)
      expect(endTime - startTime).toBeLessThan(2000);

      // Assert - Todos salvos
      const saved = await db.characters.toArray();
      expect(saved).toHaveLength(50);
    });
  });

  describe('Integridade de Dados Offline', () => {
    it('deve manter integridade após sequência de operações offline', async () => {
      // Arrange
      mockOnlineStatus(false);
      const store = createTestStore();

      // Act - Criar personagens
      const char1 = createDefaultCharacter({ name: 'Char1' });
      const char2 = createDefaultCharacter({ name: 'Char2' });
      const char3 = createDefaultCharacter({ name: 'Char3' });

      let createdChar1: Character | undefined;
      let createdChar2: Character | undefined;
      let createdChar3: Character | undefined;

      await act(async () => {
        const result1 = await store.dispatch(addCharacter(char1));
        createdChar1 = result1.payload as Character;
        const result2 = await store.dispatch(addCharacter(char2));
        createdChar2 = result2.payload as Character;
        const result3 = await store.dispatch(addCharacter(char3));
        createdChar3 = result3.payload as Character;
      });

      // Act - Atualizar char1
      await act(async () => {
        await store.dispatch(
          updateCharacter({ id: createdChar1!.id, updates: { level: 5 } })
        );
      });

      // Act - Deletar char2
      await act(async () => {
        await store.dispatch(deleteCharacter(createdChar2!.id));
      });

      // Assert - Estado consistente
      await waitFor(async () => {
        const saved = await db.characters.toArray();
        expect(saved).toHaveLength(2);

        const savedChar1 = saved.find((c) => c.id === createdChar1!.id);
        expect(savedChar1?.level).toBe(5);

        const savedChar2 = saved.find((c) => c.id === createdChar2!.id);
        expect(savedChar2).toBeUndefined();

        const savedChar3 = saved.find((c) => c.id === createdChar3!.id);
        expect(savedChar3).toBeDefined();
      });
    });
  });
});
