/**
 * Import Service Tests
 *
 * Testes abrangentes para o serviço de importação de personagens
 */

import { importCharacter, ImportServiceError } from '../importService';
import { EXPORT_VERSION } from '../exportService';
import { db } from '../db';
import type { Character } from '@/types';

// Mock do IndexedDB
jest.mock('../db', () => ({
  db: {
    characters: {
      add: jest.fn(),
      get: jest.fn(),
    },
  },
}));

// Mock do uuid
jest.mock('@/utils/uuid', () => ({
  uuidv4: jest.fn(() => 'mock-uuid-1234'),
  isNativeUUIDAvailable: jest.fn(() => false),
  isValidUUID: jest.fn(() => true),
  generateBulkUUIDs: jest.fn((count: number) =>
    Array.from({ length: count }, (_, i) => `mock-uuid-${i + 1}`)
  ),
}));

// Silencia logs de console
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('importService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper para criar um personagem mock válido
   */
  function createMockCharacter(): Character {
    return {
      id: 'original-id-123',
      name: 'Aragorn',
      playerName: 'Viggo',
      level: 5,
      attributes: {
        agilidade: 3,
        corpo: 3,
        influencia: 2,
        mente: 2,
        essencia: 3,
        instinto: 1,
      },
      combat: {
        hp: {
          current: 25,
          max: 30,
          temporary: 0,
        },
        pp: {
          current: 5,
          max: 8,
          temporary: 0,
        },
      },
      skills: {
        acerto: {
          proficiencyLevel: 'versado',
          keyAttribute: 'agilidade',
          otherModifiers: 0,
        },
        atletismo: {
          proficiencyLevel: 'adepto',
          keyAttribute: 'corpo',
          otherModifiers: 0,
        },
      },
      createdAt: '2024-12-01T10:00:00.000Z',
      updatedAt: '2024-12-01T10:00:00.000Z',
    } as any;
  }

  /**
   * Helper para criar um arquivo JSON mock
   */
  function createMockFile(content: object, filename = 'test.json'): File {
    const jsonString = JSON.stringify(content);
    const file = new File([jsonString], filename, { type: 'application/json' });

    // Mock do método text() para retornar o conteúdo JSON
    file.text = jest.fn().mockResolvedValue(jsonString);

    return file;
  }

  describe('importCharacter', () => {
    it('deve importar personagem válido com sucesso', async () => {
      const mockChar = createMockCharacter();
      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid-1234');

      const result = await importCharacter(file);

      // Type guard: check if it's a single character import
      expect('character' in result).toBe(true);
      if ('character' in result) {
        expect(result.character).toBeDefined();
        expect(result.character.name).toBe('Aragorn');
        expect(result.character.id).toBe('mock-uuid-1234'); // Novo ID
        expect(result.character.id).not.toBe('original-id-123'); // ID original diferente
      }
      expect(result.wasMigrated).toBe(true);
      expect(result.originalVersion).toBe(EXPORT_VERSION);
      expect(result.warnings).toEqual([]);

      expect(db.characters.add).toHaveBeenCalledTimes(1);
      expect(db.characters.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aragorn',
          id: 'mock-uuid-1234',
        })
      );
    });

    it('deve rejeitar arquivo com tipo inválido', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Tipo de arquivo inválido/
      );
    });

    it('deve rejeitar JSON inválido', async () => {
      const file = new File(['{ invalid json }'], 'invalid.json', {
        type: 'application/json',
      });

      // Mock do método text() para retornar JSON inválido
      file.text = jest.fn().mockResolvedValue('{ invalid json }');

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(/JSON inválido/);
    });

    it('deve rejeitar arquivo sem versão', async () => {
      const mockChar = createMockCharacter();
      const invalidData = {
        character: mockChar,
        // versão ausente
      };

      const file = createMockFile(invalidData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(/sem versão/);
    });

    it('deve rejeitar arquivo sem dados de personagem', async () => {
      const invalidData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        // character ausente
      };

      const file = createMockFile(invalidData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /sem dados de personagem/
      );
    });

    it('deve rejeitar versão incompatível', async () => {
      const mockChar = createMockCharacter();
      const invalidData = {
        version: '2.0.0', // Versão incompatível
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(invalidData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Versão incompatível/
      );
    });

    it('deve rejeitar personagem sem campos obrigatórios', async () => {
      const invalidChar = {
        id: '123',
        name: 'Test',
        // level ausente
      };

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: invalidChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Campo obrigatório ausente/
      );
    });

    it('deve rejeitar personagem com nível inválido', async () => {
      const mockChar = createMockCharacter();
      mockChar.level = 0; // Nível inválido

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Nível de personagem inválido/
      );
    });

    it('deve rejeitar personagem com atributos inválidos', async () => {
      const mockChar = createMockCharacter();
      mockChar.attributes.agilidade = -1; // Atributo inválido

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Valor de atributo inválido/
      );
    });

    it('deve rejeitar personagem com PV inválido', async () => {
      const mockChar = createMockCharacter();
      mockChar.combat.hp!.current = -10; // HP negativo

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Valor inválido em HP/
      );
    });

    it('deve rejeitar personagem com PP inválido', async () => {
      const mockChar = createMockCharacter();
      mockChar.combat.pp.max = -5; // PP negativo

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Valor inválido em PP/
      );
    });

    it('deve rejeitar personagem com habilidade inválida', async () => {
      const mockChar = createMockCharacter();
      (mockChar.skills as any).acerto.proficiencyLevel = 'invalid'; // Proficiência inválida

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Nível de proficiência inválido/
      );
    });

    it('deve gerar aviso para atributo acima do máximo padrão', async () => {
      const mockChar = createMockCharacter();
      mockChar.attributes.corpo = 7; // Acima do máximo padrão

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid-1234');

      const result = await importCharacter(file);

      expect(result.warnings).toContain(
        'Atributo corpo excede valor padrão máximo (5): 7'
      );
    });

    it('deve atualizar timestamps ao importar', async () => {
      const mockChar = createMockCharacter();
      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid-1234');

      // Mock de Date.now para controlar timestamps
      const mockNow = new Date('2024-12-10T15:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      const result = await importCharacter(file);

      if ('character' in result) {
        expect(result.character.createdAt).toBe(mockNow.toISOString());
        expect(result.character.updatedAt).toBe(mockNow.toISOString());
      }

      jest.restoreAllMocks();
    });

    it('deve propagar erro do IndexedDB', async () => {
      const mockChar = createMockCharacter();
      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character: mockChar,
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(importCharacter(file)).rejects.toThrow(ImportServiceError);
      await expect(importCharacter(file)).rejects.toThrow(
        /Falha ao importar personagem/
      );
    });
  });

  describe('Detecção automática de formato (único vs múltiplo)', () => {
    it('deve detectar e importar formato único corretamente', async () => {
      const character = createMockCharacter();
      character.name = 'Personagem Único';

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        character,
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid');

      const result = await importCharacter(file);

      expect('character' in result).toBe(true);
      if ('character' in result) {
        expect(result.character.name).toBe('Personagem Único');
      }
    });

    it('deve detectar e importar formato múltiplo (backup) corretamente', async () => {
      const char1 = createMockCharacter();
      char1.name = 'Personagem 1';

      const char2 = createMockCharacter();
      char2.name = 'Personagem 2';

      const char3 = createMockCharacter();
      char3.name = 'Personagem 3';

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        count: 3,
        characters: [char1, char2, char3],
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid');

      const result = await importCharacter(file);

      expect('characters' in result).toBe(true);
      if ('characters' in result) {
        expect(result.count).toBe(3);
        expect(result.characters).toHaveLength(3);
        expect(result.characters[0].name).toBe('Personagem 1');
        expect(result.characters[1].name).toBe('Personagem 2');
        expect(result.characters[2].name).toBe('Personagem 3');
      }
    });

    it('deve lidar com erros parciais em importação múltipla', async () => {
      const char1 = createMockCharacter();
      char1.name = 'Válido 1';

      const char2 = { ...createMockCharacter(), level: -1 }; // Inválido
      char2.name = 'Inválido';

      const char3 = createMockCharacter();
      char3.name = 'Válido 2';

      const exportedData = {
        version: EXPORT_VERSION,
        exportedAt: '2024-12-10T12:00:00.000Z',
        count: 3,
        characters: [char1, char2, char3],
      };

      const file = createMockFile(exportedData);
      (db.characters.add as jest.Mock).mockResolvedValue('mock-uuid');

      const result = await importCharacter(file);

      if ('characters' in result) {
        expect(result.count).toBe(2); // Apenas os válidos
        expect(result.errors).toHaveLength(1); // Um erro
        expect(result.errors[0].name).toBe('Inválido');
        expect(result.characters[0].name).toBe('Válido 1');
        expect(result.characters[1].name).toBe('Válido 2');
      }
    });
  });

  describe('ImportServiceError', () => {
    it('deve criar erro com código e mensagem', () => {
      const error = new ImportServiceError('Teste de erro', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImportServiceError);
      expect(error.message).toBe('Teste de erro');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('ImportServiceError');
    });

    it('deve armazenar erro original', () => {
      const originalError = new Error('Original');
      const error = new ImportServiceError('Teste', 'TEST_CODE', originalError);

      expect(error.originalError).toBe(originalError);
    });
  });
});
