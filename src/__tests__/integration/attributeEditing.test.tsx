/**
 * Testes de Integração - Edição de Atributos e Sincronização Redux-IndexedDB
 *
 * Foca em validar a sincronização entre Redux e IndexedDB quando atributos
 * são atualizados, sem depender de componentes UI complexos.
 */

import { act, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer, {
  addCharacter,
  updateCharacter,
} from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer from '@/features/app/appSlice';
import { db } from '@/services/db';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';
import { indexedDBSyncMiddleware } from '@/store/indexedDBSyncMiddleware';

/**
 * Helper para criar store de teste com middleware de sincronização
 */
function createTestStore() {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
      app: appReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(indexedDBSyncMiddleware),
  });
}

describe('Fluxo de Edição de Atributos e Sincronização Redux-IndexedDB', () => {
  let testCharacter: Character;

  beforeEach(async () => {
    // Limpa o banco de dados
    await db.characters.clear();

    // Cria personagem de teste
    testCharacter = createDefaultCharacter({ name: 'Personagem Teste' });

    // Salva no IndexedDB
    await db.characters.add(testCharacter);
  });

  afterEach(async () => {
    await db.characters.clear();
  });

  describe('Atualização de Atributos', () => {
    it('deve atualizar atributo e sincronizar com IndexedDB', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar Agilidade via Redux
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              attributes: {
                ...testCharacter.attributes,
                agilidade: 3,
              },
            },
          })
        );
      });

      // Assert - Mudança foi aplicada no IndexedDB
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.attributes.agilidade).toBe(3);
        },
        { timeout: 2000 }
      );
    });

    it('deve atualizar múltiplos atributos', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar múltiplos atributos
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              attributes: {
                ...testCharacter.attributes,
                agilidade: 3,
                forca: 4,
                mente: 2,
              },
            },
          })
        );
      });

      // Assert - Todas as mudanças foram aplicadas
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.attributes.agilidade).toBe(3);
          expect(saved?.attributes.forca).toBe(4);
          expect(saved?.attributes.mente).toBe(2);
        },
        { timeout: 2000 }
      );
    });

    it('deve permitir Agilidade 0 (regra do dado: rolar 2d20 e pegar o menor)', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Definir Agilidade para 0
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              attributes: {
                ...testCharacter.attributes,
                agilidade: 0,
              },
            },
          })
        );
      });

      // Assert - Agilidade 0 foi salva corretamente
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.attributes.agilidade).toBe(0);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Atualização de Nível', () => {
    it('deve atualizar nível do personagem', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar nível
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              level: 5,
            },
          })
        );
      });

      // Assert - Nível foi atualizado no IndexedDB
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.level).toBe(5);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Atualização de Idiomas', () => {
    it('deve atualizar lista de idiomas', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Adicionar idiomas (comum já vem por padrão, adicionar élfico e anão)
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              languages: ['comum', 'elfico', 'anao'],
            },
          })
        );
      });

      // Assert - Idiomas foram atualizados no IndexedDB
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.languages).toHaveLength(3);
          expect(saved?.languages).toContain('comum');
          expect(saved?.languages).toContain('elfico');
          expect(saved?.languages).toContain('anao');
        },
        { timeout: 2000 }
      );
    });

    it('deve permitir atualização de idiomas baseada em Mente', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar Mente para 3 (permite 3 idiomas adicionais ao Comum)
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              attributes: {
                ...testCharacter.attributes,
                mente: 3,
              },
              languages: ['comum', 'elfico', 'anao', 'draconico'],
            },
          })
        );
      });

      // Assert - Mente e idiomas foram atualizados
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.attributes.mente).toBe(3);
          expect(saved?.languages).toHaveLength(4);
          expect(saved?.languages).toContain('draconico');
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Atualização de Habilidades', () => {
    it('deve atualizar proficiência de habilidade', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar proficiência em atletismo para Versado (x2)
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              skills: {
                ...testCharacter.skills,
                atletismo: {
                  ...testCharacter.skills.atletismo,
                  proficiencyLevel: 'versado',
                },
              },
            },
          })
        );
      });

      // Assert - Proficiência foi atualizada no IndexedDB
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.skills.atletismo.proficiencyLevel).toBe('versado');
        },
        { timeout: 2000 }
      );
    });

    it('deve atualizar habilidade de assinatura', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Definir atletismo como habilidade de assinatura
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              skills: {
                ...testCharacter.skills,
                atletismo: {
                  ...testCharacter.skills.atletismo,
                  isSignature: true,
                },
              },
            },
          })
        );
      });

      // Assert - Habilidade de assinatura foi marcada
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.skills.atletismo.isSignature).toBe(true);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Atualização de PV e PP', () => {
    it('deve atualizar PV máximo', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Atualizar PV máximo
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              pv: {
                ...testCharacter.pv,
                max: 20,
              },
            },
          })
        );
      });

      // Assert - PV máximo foi atualizado
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.pv.max).toBe(20);
        },
        { timeout: 2000 }
      );
    });

    it('deve atualizar PP temporário', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Act - Adicionar PP temporário
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              pp: {
                ...testCharacter.pp,
                temporary: 5,
              },
            },
          })
        );
      });

      // Assert - PP temporário foi adicionado
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved?.pp.temporary).toBe(5);
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Persistência de Timestamps', () => {
    it('deve atualizar updatedAt ao modificar personagem', async () => {
      // Arrange
      const store = createTestStore();

      await act(async () => {
        await store.dispatch(addCharacter(testCharacter));
      });

      // Aguardar personagem ser salvo no IndexedDB
      await waitFor(
        async () => {
          const initial = await db.characters.get(testCharacter.id);
          expect(initial).toBeDefined();
        },
        { timeout: 1000 }
      );

      // Obter timestamp inicial do banco de dados
      const initial = await db.characters.get(testCharacter.id);
      if (!initial) {
        throw new Error('Personagem não encontrado no IndexedDB');
      }
      const initialUpdatedAt = initial.updatedAt;

      // Aguardar 20ms para garantir timestamp diferente
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Act - Atualizar nome
      await act(async () => {
        await store.dispatch(
          updateCharacter({
            id: testCharacter.id,
            updates: {
              name: 'Nome Atualizado',
            },
          })
        );
      });

      // Assert - updatedAt foi atualizado
      await waitFor(
        async () => {
          const saved = await db.characters.get(testCharacter.id);
          expect(saved).toBeDefined();
          expect(saved?.name).toBe('Nome Atualizado');
          // Comparar timestamps como strings ISO ou como números
          if (saved) {
            const savedTime = new Date(saved.updatedAt).getTime();
            const initialTime = new Date(initialUpdatedAt).getTime();
            // Se ambos são NaN, usamos comparação de string direta
            if (isNaN(savedTime) || isNaN(initialTime)) {
              expect(saved.updatedAt).not.toBe(initialUpdatedAt);
            } else {
              expect(savedTime).toBeGreaterThan(initialTime);
            }
          }
        },
        { timeout: 2000 }
      );
    });
  });
});
