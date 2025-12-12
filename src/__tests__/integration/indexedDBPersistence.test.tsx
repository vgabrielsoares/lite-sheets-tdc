/**
 * Testes de Integração - Persistência em IndexedDB
 *
 * Testa operações CRUD (Create, Read, Update, Delete) no IndexedDB,
 * validando integridade dos dados, performance e tratamento de erros.
 */

import { db, initializeDatabase, closeDatabase } from '@/services/db';
import { characterService } from '@/services/characterService';
import { createDefaultCharacter } from '@/utils/characterFactory';
import type { Character } from '@/types';

describe('Persistência em IndexedDB (Integração)', () => {
  beforeEach(async () => {
    // Garante que banco está inicializado
    await initializeDatabase();
    // Limpa todos os dados antes de cada teste
    await db.characters.clear();
  });

  afterEach(async () => {
    // Limpa dados após cada teste
    await db.characters.clear();
  });

  afterAll(async () => {
    // Fecha conexão após todos os testes
    closeDatabase();
  });

  describe('Create (Criação)', () => {
    it('deve criar personagem no IndexedDB', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Aragorn' });

      // Act
      await db.characters.add(character);

      // Assert
      const saved = await db.characters.get(character.id);
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Aragorn');
      expect(saved?.id).toBe(character.id);
    });

    it('deve criar múltiplos personagens', async () => {
      // Arrange
      const char1 = createDefaultCharacter({ name: 'Aragorn' });
      const char2 = createDefaultCharacter({ name: 'Legolas' });
      const char3 = createDefaultCharacter({ name: 'Gimli' });

      // Act
      await db.characters.bulkAdd([char1, char2, char3]);

      // Assert
      const all = await db.characters.toArray();
      expect(all).toHaveLength(3);

      const names = all.map((c) => c.name).sort();
      expect(names).toEqual(['Aragorn', 'Gimli', 'Legolas']);
    });

    it('deve rejeitar personagem com ID duplicado', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test' });
      await db.characters.add(character);

      // Act & Assert - Tentar adicionar com mesmo ID
      await expect(db.characters.add(character)).rejects.toThrow();
    });

    it('deve preservar todos os campos do personagem', async () => {
      // Arrange - Personagem com dados completos
      const character = createDefaultCharacter({
        name: 'Personagem Completo',
        playerName: 'Jogador Teste',
      });

      character.level = 5;
      character.experience.current = 2000;
      character.concept = 'Guerreiro corajoso';
      // lineage e origin devem ser objetos complexos, não strings - omitindo para este teste
      character.attributes.forca = 4;
      character.attributes.agilidade = 3;
      character.combat.hp.current = 45;
      character.combat.hp.max = 50;
      character.skills.atletismo.proficiencyLevel = 'versado';
      character.languages = ['comum', 'elfico', 'anao'];
      character.inventory.items.push({
        id: 'sword-1',
        name: 'Espada Longa',
        quantity: 1,
        weight: 3,
        category: 'arma',
        value: 15,
        equipped: false,
      });

      // Act
      await db.characters.add(character);

      // Assert - Recuperar e verificar todos os campos
      const saved = await db.characters.get(character.id);
      expect(saved).toMatchObject({
        name: 'Personagem Completo',
        playerName: 'Jogador Teste',
        level: 5,
        experience: { current: 2000 },
        concept: 'Guerreiro corajoso',
        attributes: expect.objectContaining({
          forca: 4,
          agilidade: 3,
        }),
        combat: expect.objectContaining({
          hp: expect.objectContaining({
            current: 45,
            max: 50,
          }),
        }),
      });

      expect(saved?.skills.atletismo.proficiencyLevel).toBe('versado');
      expect(saved?.languages).toContain('elfico');
      expect(saved?.inventory.items.length).toBeGreaterThan(2); // Padrão + adicionado
    });
  });

  describe('Read (Leitura)', () => {
    it('deve buscar personagem por ID', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Aragorn' });
      await db.characters.add(character);

      // Act
      const found = await db.characters.get(character.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(character.id);
      expect(found?.name).toBe('Aragorn');
    });

    it('deve retornar undefined para ID inexistente', async () => {
      // Act
      const found = await db.characters.get('non-existent-id');

      // Assert
      expect(found).toBeUndefined();
    });

    it('deve buscar todos os personagens', async () => {
      // Arrange
      const chars = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
      ];
      await db.characters.bulkAdd(chars);

      // Act
      const all = await db.characters.toArray();

      // Assert
      expect(all).toHaveLength(3);
    });

    it('deve buscar personagens ordenados por nome', async () => {
      // Arrange
      await db.characters.bulkAdd([
        createDefaultCharacter({ name: 'Zara' }),
        createDefaultCharacter({ name: 'Aragorn' }),
        createDefaultCharacter({ name: 'Merry' }),
      ]);

      // Act
      const sorted = await db.characters.orderBy('name').toArray();

      // Assert
      expect(sorted.map((c) => c.name)).toEqual(['Aragorn', 'Merry', 'Zara']);
    });

    it('deve buscar personagens ordenados por nível', async () => {
      // Arrange
      const char1 = createDefaultCharacter({ name: 'Low' });
      char1.level = 1;
      const char2 = createDefaultCharacter({ name: 'High' });
      char2.level = 10;
      const char3 = createDefaultCharacter({ name: 'Mid' });
      char3.level = 5;

      await db.characters.bulkAdd([char1, char2, char3]);

      // Act
      const sorted = await db.characters.orderBy('level').toArray();

      // Assert
      expect(sorted.map((c) => c.level)).toEqual([1, 5, 10]);
    });

    it('deve filtrar personagens por condição', async () => {
      // Arrange
      const char1 = createDefaultCharacter({ name: 'Low Level' });
      char1.level = 2;
      const char2 = createDefaultCharacter({ name: 'High Level' });
      char2.level = 8;
      const char3 = createDefaultCharacter({ name: 'Mid Level' });
      char3.level = 5;

      await db.characters.bulkAdd([char1, char2, char3]);

      // Act - Buscar personagens nível >= 5
      const filtered = await db.characters
        .filter((char) => char.level >= 5)
        .toArray();

      // Assert
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.name).sort()).toEqual([
        'High Level',
        'Mid Level',
      ]);
    });

    it('deve contar personagens', async () => {
      // Arrange
      await db.characters.bulkAdd([
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
        createDefaultCharacter({ name: 'Char4' }),
        createDefaultCharacter({ name: 'Char5' }),
      ]);

      // Act
      const count = await db.characters.count();

      // Assert
      expect(count).toBe(5);
    });
  });

  describe('Update (Atualização)', () => {
    it('deve atualizar personagem existente', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Aragorn' });
      await db.characters.add(character);

      // Act - Atualizar campos
      await db.characters.update(character.id, {
        level: 10,
        experience: { ...character.experience, current: 5000 },
      });

      // Assert
      const updated = await db.characters.get(character.id);
      expect(updated?.level).toBe(10);
      expect(updated?.experience.current).toBe(5000);
      expect(updated?.name).toBe('Aragorn'); // Não alterado
    });

    it('deve atualizar atributos', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test' });
      await db.characters.add(character);

      // Act
      await db.characters.update(character.id, {
        attributes: {
          ...character.attributes,
          forca: 5,
          agilidade: 4,
        },
      });

      // Assert
      const updated = await db.characters.get(character.id);
      expect(updated?.attributes.forca).toBe(5);
      expect(updated?.attributes.agilidade).toBe(4);
      expect(updated?.attributes.mente).toBe(1); // Não alterado
    });

    it('deve atualizar PV e PP', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test' });
      await db.characters.add(character);

      // Act
      await db.characters.update(character.id, {
        combat: {
          ...character.combat,
          hp: { current: 10, max: 20, temporary: 5 },
          pp: { current: 3, max: 8, temporary: 2 },
        },
      });

      // Assert
      const updated = await db.characters.get(character.id);
      expect(updated?.combat.hp).toMatchObject({
        current: 10,
        max: 20,
        temporary: 5,
      });
      expect(updated?.combat.pp).toMatchObject({
        current: 3,
        max: 8,
        temporary: 2,
      });
    });

    it('deve atualizar timestamp updatedAt', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test' });
      await db.characters.add(character);

      const saved = await db.characters.get(character.id);
      const originalUpdatedAt = saved!.updatedAt;

      // Aguardar para garantir timestamp diferente
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      const newTimestamp = new Date().toISOString();
      await db.characters.update(character.id, {
        updatedAt: newTimestamp,
        level: 2,
      });

      // Assert
      const updated = await db.characters.get(character.id);
      // Use timestamp strings directly for comparison
      expect(updated!.updatedAt).not.toBe(originalUpdatedAt);
      expect(updated!.level).toBe(2);
    });

    it('deve falhar ao atualizar personagem inexistente', async () => {
      // Act
      const result = await db.characters.update('non-existent-id', {
        level: 10,
      });

      // Assert - Dexie retorna 0 quando não encontra o registro
      expect(result).toBe(0);
    });

    it('deve atualizar múltiplos personagens em lote', async () => {
      // Arrange
      const char1 = createDefaultCharacter({ name: 'Char1' });
      const char2 = createDefaultCharacter({ name: 'Char2' });
      await db.characters.bulkAdd([char1, char2]);

      // Act
      await db.characters.bulkUpdate([
        { key: char1.id, changes: { level: 5 } },
        { key: char2.id, changes: { level: 7 } },
      ]);

      // Assert
      const updated1 = await db.characters.get(char1.id);
      const updated2 = await db.characters.get(char2.id);

      expect(updated1?.level).toBe(5);
      expect(updated2?.level).toBe(7);
    });
  });

  describe('Delete (Exclusão)', () => {
    it('deve deletar personagem por ID', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'To Delete' });
      await db.characters.add(character);

      // Assert - Confirmar que existe
      expect(await db.characters.get(character.id)).toBeDefined();

      // Act
      await db.characters.delete(character.id);

      // Assert
      const deleted = await db.characters.get(character.id);
      expect(deleted).toBeUndefined();
    });

    it('deve permitir deletar personagem inexistente sem erro', async () => {
      // Act & Assert - Não deve lançar erro
      await expect(
        db.characters.delete('non-existent-id')
      ).resolves.toBeUndefined();
    });

    it('deve deletar múltiplos personagens', async () => {
      // Arrange
      const chars = [
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
      ];
      await db.characters.bulkAdd(chars);

      // Act
      await db.characters.bulkDelete([chars[0].id, chars[2].id]);

      // Assert
      const remaining = await db.characters.toArray();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('Char2');
    });

    it('deve limpar todos os personagens', async () => {
      // Arrange
      await db.characters.bulkAdd([
        createDefaultCharacter({ name: 'Char1' }),
        createDefaultCharacter({ name: 'Char2' }),
        createDefaultCharacter({ name: 'Char3' }),
      ]);

      // Assert - Confirmar que existem
      expect(await db.characters.count()).toBe(3);

      // Act
      await db.characters.clear();

      // Assert
      expect(await db.characters.count()).toBe(0);
    });
  });

  describe('Integridade e Performance', () => {
    it('deve manter integridade dos dados após múltiplas operações', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Test Character' });

      // Act - Sequência de operações
      await db.characters.add(character);
      await db.characters.update(character.id, { level: 5 });
      await db.characters.update(character.id, {
        attributes: { ...character.attributes, forca: 3 },
      });
      await db.characters.update(character.id, {
        experience: { ...character.experience, current: 1000 },
      });

      // Assert
      const final = await db.characters.get(character.id);
      expect(final).toMatchObject({
        name: 'Test Character',
        level: 5,
        attributes: expect.objectContaining({ forca: 3 }),
        experience: expect.objectContaining({ current: 1000 }),
      });
    });

    it('deve suportar grande volume de personagens', async () => {
      // Arrange - Criar 100 personagens
      const characters: Character[] = [];
      for (let i = 1; i <= 100; i++) {
        characters.push(createDefaultCharacter({ name: `Character ${i}` }));
      }

      // Act
      const startTime = Date.now();
      await db.characters.bulkAdd(characters);
      const endTime = Date.now();

      // Assert
      expect(await db.characters.count()).toBe(100);
      // Operação deve ser rápida (< 1 segundo)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('deve buscar rapidamente em grande volume', async () => {
      // Arrange
      const characters: Character[] = [];
      for (let i = 1; i <= 100; i++) {
        const char = createDefaultCharacter({ name: `Character ${i}` });
        char.level = i % 10;
        characters.push(char);
      }
      await db.characters.bulkAdd(characters);

      // Act
      const startTime = Date.now();
      const results = await db.characters.filter((c) => c.level > 5).toArray();
      const endTime = Date.now();

      // Assert
      expect(results.length).toBeGreaterThan(0);
      // Busca deve ser rápida (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('CharacterService Integration', () => {
    it('deve usar characterService para operações CRUD', async () => {
      // Arrange
      const character = createDefaultCharacter({ name: 'Service Test' });

      // Act & Assert - Create
      const created = await characterService.create(character);
      expect(await characterService.getById(created.id)).toBeDefined();

      // Act & Assert - GetAll
      const all = await characterService.getAll();
      expect(all).toHaveLength(1);

      // Act & Assert - Update
      await characterService.update(created.id, { level: 10 });
      const updated = await characterService.getById(created.id);
      expect(updated?.level).toBe(10);

      // Act & Assert - Delete
      await characterService.delete(created.id);
      expect(await characterService.getById(created.id)).toBeUndefined();
    });
  });
});
