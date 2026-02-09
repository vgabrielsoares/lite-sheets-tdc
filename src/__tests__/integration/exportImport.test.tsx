/**
 * Testes de Integração - Exportação e Importação de Fichas
 *
 * Testa o fluxo completo de exportação de fichas para JSON e importação,
 * validando integridade dos dados, compatibilidade de versões e tratamento de erros.
 */

import {
  serializeCharacterToObject,
  exportCharacter,
} from '@/services/exportService';
import {
  importCharacter,
  ImportServiceError,
  type ImportResult,
} from '@/services/importService';
import { createDefaultCharacter } from '@/utils/characterFactory';
import { db } from '@/services/db';
import type { Character } from '@/types';
import type { ExportedCharacter } from '@/services/exportService';

describe('Fluxo de Exportação e Importação (Integração)', () => {
  let testCharacter: Character;

  /**
   * Mock de File para ambiente de teste (jsdom não implementa File.text)
   */
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

  beforeEach(async () => {
    // Limpa banco de dados
    await db.characters.clear();

    // Cria personagem completo para teste
    testCharacter = createDefaultCharacter({
      name: 'Aragorn',
      playerName: 'Jogador Teste',
    });

    // Customiza personagem para ter dados diversos
    testCharacter.level = 5;
    testCharacter.experience.current = 1500;
    testCharacter.attributes.corpo = 3;
    testCharacter.attributes.agilidade = 4;
    testCharacter.attributes.mente = 2;
    testCharacter.skills.atletismo.proficiencyLevel = 'versado';
    testCharacter.skills.acrobacia.proficiencyLevel = 'adepto';
    testCharacter.languages = ['comum', 'elfico', 'anao'];
    testCharacter.inventory.currency.physical.ouro = 100;

    // Salva no banco
    await db.characters.add(testCharacter);
  });

  afterEach(async () => {
    await db.characters.clear();
  });

  beforeAll(() => {
    // Mock de APIs do browser usadas no export
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();

    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        (el as HTMLAnchorElement).click = jest.fn();
      }
      return el;
    });

    // Substitui File por FakeFile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).File = FakeFile as any;
  });

  describe('Exportação de Personagem', () => {
    it('deve exportar personagem com estrutura válida', () => {
      // Act
      const exportedData = serializeCharacterToObject(testCharacter);

      // Assert - Estrutura básica
      expect(exportedData).toHaveProperty('version');
      expect(exportedData).toHaveProperty('exportedAt');
      expect(exportedData).toHaveProperty('character');

      // Assert - Versão
      expect(exportedData.version).toMatch(/^\d+\.\d+\.\d+$/);

      // Assert - Timestamp válido
      expect(new Date(exportedData.exportedAt)).toBeInstanceOf(Date);
      expect(new Date(exportedData.exportedAt).getTime()).toBeGreaterThan(0);

      // Assert - Dados do personagem
      expect(exportedData.character).toMatchObject({
        id: testCharacter.id,
        name: testCharacter.name,
        level: testCharacter.level,
      });
    });

    it('deve preservar todos os dados do personagem', () => {
      // Act
      const exportedData = serializeCharacterToObject(testCharacter);

      // Assert - Informações básicas
      expect(exportedData.character.name).toBe('Aragorn');
      expect(exportedData.character.playerName).toBe('Jogador Teste');
      expect(exportedData.character.level).toBe(5);

      // Assert - XP
      expect(exportedData.character.experience.current).toBe(1500);

      // Assert - Atributos
      expect(exportedData.character.attributes.corpo).toBe(3);
      expect(exportedData.character.attributes.agilidade).toBe(4);
      expect(exportedData.character.attributes.mente).toBe(2);

      // Assert - Habilidades
      expect(exportedData.character.skills.atletismo.proficiencyLevel).toBe(
        'versado'
      );
      expect(exportedData.character.skills.acrobacia.proficiencyLevel).toBe(
        'adepto'
      );

      // Assert - Idiomas
      expect(exportedData.character.languages).toEqual(
        expect.arrayContaining(['comum', 'elfico', 'anao'])
      );

      // Assert - Inventário
      expect(exportedData.character.inventory.currency.physical.ouro).toBe(100);
    });

    it('deve gerar JSON válido e parseável', () => {
      // Act
      const exportedData = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exportedData);
      const parsed = JSON.parse(jsonString);

      // Assert - Only check defined fields (JSON.stringify removes undefined)
      expect(parsed).toHaveProperty('version', exportedData.version);
      expect(parsed).toHaveProperty('exportedAt', exportedData.exportedAt);
      expect(parsed.character.name).toBe('Aragorn');
      expect(parsed.character.id).toBe(testCharacter.id);
      expect(parsed.character.level).toBe(testCharacter.level);
    });

    it('deve rejeitar exportação de personagem inválido', async () => {
      // Arrange
      const invalidCharacter = { name: 'Invalid' } as Character;

      // Act & Assert
      await expect(exportCharacter(invalidCharacter)).rejects.toThrow();
    });

    it('deve rejeitar exportação de personagem null/undefined', async () => {
      // Act & Assert
      await expect(exportCharacter(null as any)).rejects.toThrow();
      await expect(exportCharacter(undefined as any)).rejects.toThrow();
    });
  });

  describe('Importação de Personagem', () => {
    it('deve importar personagem exportado corretamente', async () => {
      // Arrange - Exportar personagem
      const exportedData = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exportedData);

      // Limpar banco (simular importação em novo dispositivo)
      await db.characters.clear();

      // Act - Importar
      const file = new FakeFile([jsonString], 'aragorn.json', {
        type: 'application/json',
      });
      const result = await importCharacter(file as unknown as File);
      expect('character' in result).toBe(true);
      if ('character' in result) {
        const importedCharacter = result.character;
        // Assert - Dados preservados
        expect(importedCharacter.name).toBe('Aragorn');
        expect(importedCharacter.playerName).toBe('Jogador Teste');
        expect(importedCharacter.level).toBe(5);
        expect(importedCharacter.experience.current).toBe(1500);
        expect(importedCharacter.attributes.corpo).toBe(3);
        expect(importedCharacter.attributes.agilidade).toBe(4);
        expect(importedCharacter.skills.atletismo.proficiencyLevel).toBe(
          'versado'
        );
        expect(importedCharacter.languages).toContain('elfico');
        expect(importedCharacter.inventory.currency.physical.ouro).toBe(100);
      }
    });

    it('deve gerar novo ID ao importar (evitar conflitos)', async () => {
      // Arrange - Clear DB to avoid ConstraintError from fixed UUID mock
      await db.characters.clear();

      const exportedData = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exportedData);
      const originalId = testCharacter.id;

      // Act
      const file = new FakeFile([jsonString], 'character.json', {
        type: 'application/json',
      });
      const result = await importCharacter(file as unknown as File);
      expect('character' in result).toBe(true);
      if ('character' in result) {
        const importedCharacter = result.character;
        // Assert - ID diferente
        expect(importedCharacter.id).not.toBe(originalId);
        // ID deve ser uma string válida (aceita tanto UUIDs reais quanto mocks de teste)
        expect(importedCharacter.id).toBeTruthy();
        expect(typeof importedCharacter.id).toBe('string');
      }
    });

    it('deve atualizar timestamps de createdAt e updatedAt', async () => {
      // Arrange - Clear DB to avoid ConstraintError from fixed UUID mock
      await db.characters.clear();

      const exportedData = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exportedData);
      const originalCreatedAt = testCharacter.createdAt;

      // Aguardar 10ms para garantir diferença de timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      const file = new FakeFile([jsonString], 'character.json', {
        type: 'application/json',
      });
      const result = await importCharacter(file as unknown as File);
      expect('character' in result).toBe(true);
      if ('character' in result) {
        const importedCharacter = result.character;
        // Assert - Timestamps atualizados
        expect(importedCharacter.createdAt).not.toBe(originalCreatedAt);
        // Verifica que os timestamps são strings válidas
        expect(importedCharacter.createdAt).toBeTruthy();
        expect(typeof importedCharacter.createdAt).toBe('string');
        expect(importedCharacter.updatedAt).toBe(importedCharacter.createdAt);
      }
    });

    it('deve rejeitar arquivo JSON inválido', async () => {
      // Arrange
      const invalidJson = '{ invalid json content';
      const file = new FakeFile([invalidJson], 'invalid.json', {
        type: 'application/json',
      });

      // Act & Assert
      await expect(importCharacter(file as unknown as File)).rejects.toThrow(
        ImportServiceError
      );
      await expect(
        importCharacter(file as unknown as File)
      ).rejects.toMatchObject({
        code: 'INVALID_JSON',
      });
    });

    it('deve rejeitar estrutura de dados inválida', async () => {
      // Arrange - JSON válido mas estrutura errada
      const invalidStructure = JSON.stringify({
        name: 'Character',
        level: 1,
        // Faltam campos obrigatórios
      });
      const file = new FakeFile([invalidStructure], 'invalid.json', {
        type: 'application/json',
      });

      // Act & Assert
      await expect(importCharacter(file as unknown as File)).rejects.toThrow(
        ImportServiceError
      );
    });

    it('deve rejeitar arquivo não-JSON', async () => {
      // Arrange
      const textFile = new FakeFile(['Plain text content'], 'notjson.txt', {
        type: 'text/plain',
      });

      // Act & Assert
      await expect(
        importCharacter(textFile as unknown as File)
      ).rejects.toThrow(ImportServiceError);
    });

    it('deve validar campos obrigatórios', async () => {
      // Arrange - Remover campo obrigatório
      const exportedData = serializeCharacterToObject(testCharacter);
      delete (exportedData.character as any).name;
      const jsonString = JSON.stringify(exportedData);

      const file = new FakeFile([jsonString], 'invalid.json', {
        type: 'application/json',
      });

      // Act & Assert
      await expect(importCharacter(file as unknown as File)).rejects.toThrow();
    });
  });

  describe('Ciclo Completo: Exportar -> Importar', () => {
    it('deve preservar dados em ciclo completo', async () => {
      // Arrange - Personagem complexo
      testCharacter.concept = 'Guerreiro lendário de Gondor';
      testCharacter.lineage = {
        name: 'Humano (Dúnedain)',
        description: 'Descendência dos reis de Númenor',
        attributeModifiers: [],
        size: 'medium',
        height: 185,
        weightKg: 85,
        weightRPG: 0,
        age: 87,
        languages: ['comum'],
        movement: { walk: 9 },
      } as any;
      testCharacter.origin = {
        name: 'Nobre',
        skillProficiencies: [],
        attributeModifiers: [],
      };
      testCharacter.combat.hp.current = 50;
      testCharacter.combat.hp.max = 60;
      testCharacter.combat.pp.current = 5;
      testCharacter.combat.pp.max = 10;

      await db.characters.put(testCharacter);

      // Act - Exportar
      const exportedData = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exportedData);

      // Limpar banco (simular novo dispositivo)
      await db.characters.clear();

      // Act - Importar
      const file = new FakeFile([jsonString], 'aragorn-complete.json', {
        type: 'application/json',
      });
      const result = await importCharacter(file as unknown as File);
      expect('character' in result).toBe(true);
      if ('character' in result) {
        const importedCharacter = result.character;
        // Assert - Todos os dados preservados
        expect(importedCharacter.name).toBe(testCharacter.name);
        expect(importedCharacter.concept).toBe(testCharacter.concept);
        expect(importedCharacter.lineage?.name).toBe(
          testCharacter.lineage?.name
        );
        expect(importedCharacter.origin?.name).toBe(testCharacter.origin?.name);
        expect(importedCharacter.level).toBe(testCharacter.level);
        expect(importedCharacter.combat.hp.current).toBe(
          testCharacter.combat.hp.current
        );
        expect(importedCharacter.combat.hp.max).toBe(
          testCharacter.combat.hp.max
        );
        expect(importedCharacter.combat.pp.current).toBe(
          testCharacter.combat.pp.current
        );
        expect(importedCharacter.combat.pp.max).toBe(
          testCharacter.combat.pp.max
        );
        expect(importedCharacter.attributes).toMatchObject(
          testCharacter.attributes
        );
      }
    });

    it('deve permitir importar múltiplos personagens', async () => {
      // Arrange - Criar segundo personagem
      const character2 = createDefaultCharacter({ name: 'Legolas' });
      character2.level = 7;
      character2.attributes.agilidade = 5;
      await db.characters.add(character2);

      // Act - Exportar ambos
      const export1 = serializeCharacterToObject(testCharacter);
      const export2 = serializeCharacterToObject(character2);

      // Limpar banco
      await db.characters.clear();

      // Act - Importar ambos
      const file1 = new FakeFile([JSON.stringify(export1)], 'char1.json', {
        type: 'application/json',
      });
      const file2 = new FakeFile([JSON.stringify(export2)], 'char2.json', {
        type: 'application/json',
      });

      const imported1 = (await importCharacter(
        file1 as unknown as File
      )) as ImportResult;
      const imported2 = (await importCharacter(
        file2 as unknown as File
      )) as ImportResult;

      // Assert - Ambos personagens restaurados
      expect(imported1.character.name).toBe('Aragorn');
      expect(imported2.character.name).toBe('Legolas');

      expect(imported1.character.level).toBe(5);
      expect(imported2.character.level).toBe(7);

      expect(imported1.character.id).not.toBe(imported2.character.id);
    });

    it('deve manter integridade de dados complexos', async () => {
      // Arrange - Adicionar dados complexos
      testCharacter.inventory.items.push({
        id: 'sword-1',
        name: 'Andúril',
        category: 'arma',
        quantity: 1,
        weight: 3,
        value: 0,
        equipped: false,
        description: 'Espada reforjada de Narsil',
      });

      if (!testCharacter.spellcasting) {
        testCharacter.spellcasting = {
          knownSpells: [],
          maxKnownSpells: 0,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [],
          masteredMatrices: [],
        } as any;
      }

      testCharacter.spellcasting!.knownSpells.push({
        spellId: 'spell-1' as any,
        circle: 1,
        name: 'Curar Ferimentos',
        matrix: 'arcana',
        spellcastingSkill: 'religiao',
      });

      await db.characters.put(testCharacter);

      // Act - Exportar e importar
      const exported = serializeCharacterToObject(testCharacter);
      const jsonString = JSON.stringify(exported);

      await db.characters.clear();

      const file = new FakeFile([jsonString], 'full-character.json', {
        type: 'application/json',
      });
      const imported = (await importCharacter(
        file as unknown as File
      )) as ImportResult;

      // Assert - Dados complexos preservados
      expect(imported.character.inventory.items.length).toBeGreaterThan(2);
      const sword = imported.character.inventory.items.find(
        (item) => item.name === 'Andúril'
      );
      expect(sword).toBeDefined();
      expect(sword?.description).toContain('reforjada');

      expect(
        imported.character.spellcasting?.knownSpells.length
      ).toBeGreaterThan(0);
      const spell = imported.character.spellcasting?.knownSpells.find(
        (s) => s.name === 'Curar Ferimentos'
      );
      expect(spell).toBeDefined();
      expect(spell?.matrix).toBe('arcana');
    });
  });

  describe('Compatibilidade de Versões', () => {
    it('deve incluir versão na exportação', () => {
      // Act
      const exported = serializeCharacterToObject(testCharacter);

      // Assert
      expect(exported.version).toBeDefined();
      expect(typeof exported.version).toBe('string');
      expect(exported.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('deve incluir timestamp de exportação', () => {
      // Act
      const beforeExport = new Date();
      const exported = serializeCharacterToObject(testCharacter);
      const afterExport = new Date();

      // Assert
      const exportedDate = new Date(exported.exportedAt);
      expect(exportedDate.getTime()).toBeGreaterThanOrEqual(
        beforeExport.getTime()
      );
      expect(exportedDate.getTime()).toBeLessThanOrEqual(afterExport.getTime());
    });
  });
});
