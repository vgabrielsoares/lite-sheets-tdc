/**
 * Character Service Tests
 *
 * Testes unitários para todas as operações CRUD do serviço de personagens.
 * Testa cenários de sucesso, falhas e edge cases.
 */

import { characterService, CharacterServiceError } from '../characterService';
import { db, initializeDatabase, deleteDatabase } from '../db';
import type { Character } from '@/types';

/**
 * Mock simplificado de um personagem válido para testes
 * Usa valores mínimos necessários para passar na validação
 */
const createMockCharacter = (
  overrides?: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>
): Omit<Character, 'id' | 'createdAt' | 'updatedAt'> =>
  ({
    name: 'Personagem de Teste',
    level: 1,
    ...overrides,
  }) as Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;

describe('CharacterService', () => {
  // Setup: Inicializar e limpar banco antes de cada teste
  beforeEach(async () => {
    await initializeDatabase();
    await db.characters.clear();
  });

  // Teardown: Deletar banco após todos os testes
  afterAll(async () => {
    await deleteDatabase();
  });

  describe('create', () => {
    it('deve criar um personagem com sucesso', async () => {
      const mockChar = createMockCharacter();
      const created = await characterService.create(mockChar);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(typeof created.id).toBe('string');
      expect(created.name).toBe(mockChar.name);
      expect(created.level).toBe(mockChar.level);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      expect(created.createdAt).toBe(created.updatedAt);
    });

    it('deve gerar UUID único para cada personagem', async () => {
      const char1 = await characterService.create(createMockCharacter());
      const char2 = await characterService.create(createMockCharacter());

      expect(char1.id).not.toBe(char2.id);
    });

    it('deve falhar ao criar personagem sem nome', async () => {
      const invalidChar = createMockCharacter({ name: '' });

      await expect(characterService.create(invalidChar)).rejects.toThrow(
        CharacterServiceError
      );
    });

    it('deve falhar ao criar personagem com nível negativo', async () => {
      const invalidChar = createMockCharacter({ level: -1 });

      await expect(characterService.create(invalidChar)).rejects.toThrow(
        CharacterServiceError
      );
    });

    it('deve persistir dados corretamente', async () => {
      const mockChar = createMockCharacter({ playerName: 'Jogador Teste' });
      const created = await characterService.create(mockChar);

      // Buscar do banco para garantir persistência
      const fromDb = await characterService.getById(created.id);
      expect(fromDb).toBeDefined();
      expect(fromDb?.name).toBe(mockChar.name);
      expect(fromDb?.playerName).toBe('Jogador Teste');
    });
  });

  describe('getAll', () => {
    it('deve retornar array vazio quando não há personagens', async () => {
      const all = await characterService.getAll();
      expect(all).toEqual([]);
    });

    it('deve retornar todos os personagens', async () => {
      const char1 = await characterService.create(
        createMockCharacter({ name: 'Personagem 1' })
      );
      const char2 = await characterService.create(
        createMockCharacter({ name: 'Personagem 2' })
      );
      const char3 = await characterService.create(
        createMockCharacter({ name: 'Personagem 3' })
      );

      const all = await characterService.getAll();

      expect(all).toHaveLength(3);
      expect(all.map((c) => c.id)).toContain(char1.id);
      expect(all.map((c) => c.id)).toContain(char2.id);
      expect(all.map((c) => c.id)).toContain(char3.id);
    });
  });

  describe('getById', () => {
    it('deve buscar personagem por ID com sucesso', async () => {
      const created = await characterService.create(createMockCharacter());
      const found = await characterService.getById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });

    it('deve retornar undefined para ID inexistente', async () => {
      const found = await characterService.getById('id-inexistente');
      expect(found).toBeUndefined();
    });

    it('deve falhar com ID inválido (não string)', async () => {
      await expect(characterService.getById(null as any)).rejects.toThrow(
        CharacterServiceError
      );
    });
  });

  describe('update', () => {
    it('deve atualizar personagem com sucesso', async () => {
      const created = await characterService.create(createMockCharacter());

      const updated = await characterService.update(created.id, {
        name: 'Novo Nome',
        level: 5,
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Novo Nome');
      expect(updated.level).toBe(5);
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('deve falhar ao atualizar personagem inexistente', async () => {
      await expect(
        characterService.update('id-inexistente', { name: 'Teste' })
      ).rejects.toThrow(CharacterServiceError);
    });

    it('não deve permitir atualizar ID', async () => {
      const created = await characterService.create(createMockCharacter());
      const originalId = created.id;

      const updated = await characterService.update(created.id, {
        id: 'novo-id',
      } as any);

      expect(updated.id).toBe(originalId);
    });

    it('não deve permitir atualizar createdAt', async () => {
      const created = await characterService.create(createMockCharacter());
      const originalCreatedAt = created.createdAt;

      const updated = await characterService.update(created.id, {
        createdAt: '2020-01-01T00:00:00.000Z',
      } as any);

      expect(updated.createdAt).toBe(originalCreatedAt);
    });

    it('deve falhar ao atualizar nome para vazio', async () => {
      const created = await characterService.create(createMockCharacter());

      await expect(
        characterService.update(created.id, { name: '' })
      ).rejects.toThrow(CharacterServiceError);
    });

    it('deve falhar ao atualizar nível para negativo', async () => {
      const created = await characterService.create(createMockCharacter());

      await expect(
        characterService.update(created.id, { level: -1 })
      ).rejects.toThrow(CharacterServiceError);
    });
  });

  describe('delete', () => {
    it('deve deletar personagem com sucesso', async () => {
      const created = await characterService.create(createMockCharacter());

      await characterService.delete(created.id);

      const found = await characterService.getById(created.id);
      expect(found).toBeUndefined();
    });

    it('não deve falhar ao deletar personagem inexistente', async () => {
      await expect(
        characterService.delete('id-inexistente')
      ).resolves.not.toThrow();
    });

    it('deve falhar com ID inválido', async () => {
      await expect(characterService.delete(null as any)).rejects.toThrow(
        CharacterServiceError
      );
    });
  });

  describe('count', () => {
    it('deve retornar 0 quando não há personagens', async () => {
      const count = await characterService.count();
      expect(count).toBe(0);
    });

    it('deve contar personagens corretamente', async () => {
      await characterService.create(createMockCharacter());
      await characterService.create(createMockCharacter());
      await characterService.create(createMockCharacter());

      const count = await characterService.count();
      expect(count).toBe(3);
    });

    it('deve atualizar contagem após deleções', async () => {
      const char1 = await characterService.create(createMockCharacter());
      const char2 = await characterService.create(createMockCharacter());

      expect(await characterService.count()).toBe(2);

      await characterService.delete(char1.id);

      expect(await characterService.count()).toBe(1);
    });
  });

  describe('exists', () => {
    it('deve retornar true para personagem existente', async () => {
      const created = await characterService.create(createMockCharacter());
      const exists = await characterService.exists(created.id);
      expect(exists).toBe(true);
    });

    it('deve retornar false para personagem inexistente', async () => {
      const exists = await characterService.exists('id-inexistente');
      expect(exists).toBe(false);
    });

    it('deve retornar false para ID inválido', async () => {
      const exists = await characterService.exists(null as any);
      expect(exists).toBe(false);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await characterService.create(
        createMockCharacter({ name: 'Aragorn', level: 5 })
      );
      await characterService.create(
        createMockCharacter({ name: 'Legolas', level: 3 })
      );
      await characterService.create(
        createMockCharacter({ name: 'Gimli', level: 7 })
      );
    });

    it('deve buscar por termo no nome', async () => {
      const results = await characterService.search({
        searchTerm: 'Aragorn',
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Aragorn');
    });

    it('deve filtrar por nível mínimo', async () => {
      const results = await characterService.search({ minLevel: 5 });

      expect(results).toHaveLength(2);
      expect(results.every((c) => c.level >= 5)).toBe(true);
    });

    it('deve filtrar por nível máximo', async () => {
      const results = await characterService.search({ maxLevel: 5 });

      expect(results).toHaveLength(2);
      expect(results.every((c) => c.level <= 5)).toBe(true);
    });

    it('deve ordenar por nome', async () => {
      const results = await characterService.search({
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(results[0].name).toBe('Aragorn');
      expect(results[1].name).toBe('Gimli');
      expect(results[2].name).toBe('Legolas');
    });

    it('deve ordenar por nível descendente', async () => {
      const results = await characterService.search({
        sortBy: 'level',
        sortOrder: 'desc',
      });

      expect(results[0].level).toBe(7);
      expect(results[1].level).toBe(5);
      expect(results[2].level).toBe(3);
    });

    it('deve aplicar paginação', async () => {
      const results = await characterService.search({
        limit: 2,
        offset: 1,
      });

      expect(results).toHaveLength(2);
    });

    it('deve combinar múltiplos filtros', async () => {
      const results = await characterService.search({
        minLevel: 3,
        maxLevel: 5,
        sortBy: 'level',
        sortOrder: 'desc',
      });

      expect(results).toHaveLength(2);
      expect(results[0].level).toBe(5);
      expect(results[1].level).toBe(3);
    });
  });

  describe('duplicate', () => {
    it('deve duplicar personagem com novo nome', async () => {
      const original = await characterService.create(
        createMockCharacter({ name: 'Original' })
      );

      const copy = await characterService.duplicate(original.id, 'Cópia');

      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe('Cópia');
      expect(copy.level).toBe(original.level);
      expect(copy.attributes).toEqual(original.attributes);
    });

    it('deve gerar nome padrão se não fornecido', async () => {
      const original = await characterService.create(
        createMockCharacter({ name: 'Original' })
      );

      const copy = await characterService.duplicate(original.id);

      expect(copy.name).toBe('Cópia de Original');
    });

    it('deve falhar ao duplicar personagem inexistente', async () => {
      await expect(
        characterService.duplicate('id-inexistente')
      ).rejects.toThrow(CharacterServiceError);
    });
  });

  describe('bulkDelete', () => {
    it('deve deletar múltiplos personagens', async () => {
      const char1 = await characterService.create(createMockCharacter());
      const char2 = await characterService.create(createMockCharacter());
      const char3 = await characterService.create(createMockCharacter());

      const result = await characterService.bulkDelete([
        char1.id,
        char2.id,
        char3.id,
      ]);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(await characterService.count()).toBe(0);
    });

    it('deve reportar falhas corretamente', async () => {
      const char1 = await characterService.create(createMockCharacter());

      const result = await characterService.bulkDelete([
        char1.id,
        'id-inexistente',
      ]);

      expect(result.success).toBe(2); // Não falha para ID inexistente
      expect(result.failed).toBe(0);
    });
  });

  describe('exportToJSON e importFromJSON', () => {
    it('deve exportar personagem para JSON válido', async () => {
      const created = await characterService.create(createMockCharacter());
      const json = await characterService.exportToJSON(created.id);

      const parsed = JSON.parse(json);
      expect(parsed.character).toBeDefined();
      expect(parsed.character.id).toBe(created.id);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.appName).toBe('Lite Sheets TDC');
    });

    it('deve importar personagem de JSON', async () => {
      const created = await characterService.create(createMockCharacter());
      const json = await characterService.exportToJSON(created.id);

      // Deletar original
      await characterService.delete(created.id);

      // Importar de volta
      const imported = await characterService.importFromJSON(json);

      expect(imported.name).toBe(created.name);
      expect(imported.level).toBe(created.level);
      // ID será diferente (novo personagem)
      expect(imported.id).not.toBe(created.id);
    });

    it('deve sobrescrever personagem existente com overwrite=true', async () => {
      const created = await characterService.create(createMockCharacter());
      const json = await characterService.exportToJSON(created.id);

      const parsed = JSON.parse(json);
      parsed.character.name = 'Nome Atualizado';
      const updatedJson = JSON.stringify(parsed);

      const imported = await characterService.importFromJSON(updatedJson, true);

      expect(imported.id).toBe(created.id);
      expect(imported.name).toBe('Nome Atualizado');
    });

    it('deve falhar ao importar JSON inválido', async () => {
      await expect(
        characterService.importFromJSON('json inválido')
      ).rejects.toThrow(CharacterServiceError);
    });

    it('deve falhar ao importar JSON sem campo character', async () => {
      const invalidJson = JSON.stringify({ invalid: 'data' });

      await expect(
        characterService.importFromJSON(invalidJson)
      ).rejects.toThrow(CharacterServiceError);
    });
  });
});
