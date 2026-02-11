/**
 * Tests for Export Service
 *
 * Testes abrangentes para o serviço de exportação de fichas de personagem,
 * garantindo serialização correta, validação de dados e geração de arquivos.
 */

import {
  exportCharacter,
  exportMultipleCharacters,
  ExportServiceError,
  EXPORT_VERSION,
} from '../exportService';
import type { Character } from '@/types';

// Mock do DOM para testes
let mockCreateElement: jest.SpyInstance;
let mockAppendChild: jest.SpyInstance;
let mockRemoveChild: jest.SpyInstance;
let mockClick: jest.Mock;

// Character mock para testes
const createMockCharacter = (overrides?: Partial<Character>): Character =>
  ({
    id: 'test-id-123',
    name: 'Aragorn',
    playerName: 'John Doe',
    level: 5,
    xp: { current: 150, nextLevel: 200 },
    linhagem: 'Humano',
    origem: 'Soldado',
    concept: 'Um guerreiro nobre e leal',
    attributes: {
      agilidade: 2,
      constituicao: 3,
      forca: 4,
      influencia: 1,
      mente: 2,
      presenca: 1,
    },
    pv: {
      current: 45,
      max: 50,
      temp: 0,
    },
    pp: {
      current: 8,
      max: 10,
      temp: 0,
    },
    defense: {
      base: 17,
      current: 17,
      byStage: { stage1: 17, stage2: 19, stage3: 21 },
      modifiers: [],
    },
    movement: {},
    skills: {} as any,
    languages: ['comum', 'elfico'],
    proficiencies: {
      weapons: ['Armas Simples', 'Espadas'],
      armor: ['Armaduras Leves'],
      tools: [],
      other: [],
    },
    signatureAbility: { skill: 'luta', bonus: 5 },
    luckyPoints: { level: 1, total: 6 },
    senses: {} as any,
    crafts: [],
    archetypes: [],
    classes: [],
    combat: {
      dyingRounds: { current: 0, max: 5 },
      ppLimit: {} as any,
      resistances: {
        immunities: [],
        damageReduction: [],
        enhancedResistances: [],
        vulnerabilities: [],
      },
      actionEconomy: {
        majorAction: true,
        minorActions: 2,
        reaction: true,
        defensiveReaction: true,
      },
      attacks: [],
      savingThrows: {
        determinacao: 7,
        reflexo: 7,
        tenacidade: 9,
        vigor: 8,
      },
    },
    inventory: {
      items: [
        { id: '1', name: 'Mochila', quantity: 1, weight: 1, description: '' },
        {
          id: '2',
          name: 'Cartão do Banco',
          quantity: 1,
          weight: 0,
          description: '',
        },
      ],
      currency: {
        physical: { copper: 0, gold: 10, platinum: 0 },
        bank: { copper: 0, gold: 0, platinum: 0 },
      },
      carryCapacity: { max: 25, current: 1 },
    },
    spellcasting: {
      spells: [],
      knownSpellsCount: 0,
      preferredConjurationSkill: 'arcano',
    },
    particularities: { complementary: [], complete: [] },
    description: {
      appearance: {
        skin: '',
        hair: '',
        eyes: '',
        height: '',
        others: '',
      },
      personality: {
        flaws: '',
        fears: '',
        ideals: '',
        traits: '',
        goals: '',
      },
      backstory: '',
      allies: '',
      organizations: '',
      faith: '',
    },
    notes: [],
    createdAt: '2025-12-10T00:00:00.000Z',
    updatedAt: '2025-12-10T00:00:00.000Z',
    ...overrides,
  }) as Character;

describe('ExportService', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();

    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock Blob
    global.Blob = jest.fn().mockImplementation((content: any[]) => ({
      size: content[0]?.length || 0,
      type: 'application/json',
    })) as any;

    // Mock DOM methods - reset with default return value
    mockClick = jest.fn();
    mockCreateElement = jest.spyOn(document, 'createElement');
    mockCreateElement.mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
      style: {},
    } as any);

    mockAppendChild = jest
      .spyOn(document.body, 'appendChild')
      .mockReturnValue({} as any);
    mockRemoveChild = jest
      .spyOn(document.body, 'removeChild')
      .mockReturnValue({} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('exportCharacter', () => {
    it('should export character successfully', async () => {
      const character = createMockCharacter();

      await exportCharacter(character);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('📤 Iniciando exportação')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Personagem exportado com sucesso')
      );
    });

    it('should generate correct filename', async () => {
      const character = createMockCharacter({ name: 'Test Character' });
      const mockA = { click: mockClick, href: '', download: '', style: {} };
      mockCreateElement.mockReturnValue(mockA as any);

      await exportCharacter(character);

      // Nome deve ser normalizado para lowercase e hifenizado
      expect(mockA.download).toMatch(
        /^test-character-\d{4}-\d{2}-\d{2}\.json$/
      );
    });

    it('should handle special characters in filename', async () => {
      const character = createMockCharacter({ name: 'Örök Drágön' });
      const mockA = { click: mockClick, href: '', download: '', style: {} };
      mockCreateElement.mockReturnValue(mockA as any);

      await exportCharacter(character);

      // Caracteres especiais devem ser removidos/normalizados
      expect(mockA.download).toMatch(/^orok-dragon-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should include version and timestamp in exported data', async () => {
      const character = createMockCharacter();
      const mockBlob = jest.fn();
      global.Blob = jest.fn((content) => {
        const jsonContent = content[0] as string;
        const parsed = JSON.parse(jsonContent);

        expect(parsed.version).toBe(EXPORT_VERSION);
        expect(parsed.exportedAt).toBeDefined();
        expect(new Date(parsed.exportedAt).getTime()).toBeGreaterThan(0);
        expect(parsed.character).toEqual(character);

        mockBlob(content);
        return {} as Blob;
      }) as any;

      await exportCharacter(character);
    });

    it('should throw error for null character', async () => {
      await expect(exportCharacter(null as any)).rejects.toThrow(
        ExportServiceError
      );
      await expect(exportCharacter(null as any)).rejects.toThrow(
        /Personagem inválido|Falha ao exportar/
      );
    });

    it('should throw error for undefined character', async () => {
      await expect(exportCharacter(undefined as any)).rejects.toThrow(
        ExportServiceError
      );
    });

    it('should throw error for character without id', async () => {
      const character = createMockCharacter({ id: '' });

      await expect(exportCharacter(character)).rejects.toThrow(
        ExportServiceError
      );
      await expect(exportCharacter(character)).rejects.toThrow(
        'ID ausente ou inválido'
      );
    });

    it('should throw error for character without name', async () => {
      const character = createMockCharacter({ name: '' });

      await expect(exportCharacter(character)).rejects.toThrow(
        ExportServiceError
      );
      await expect(exportCharacter(character)).rejects.toThrow(
        'nome ausente ou inválido'
      );
    });

    it('should accept character with level 0', async () => {
      const character = createMockCharacter({ level: 0 });

      // Level 0 is valid now (character starts at level 0)
      await expect(exportCharacter(character)).resolves.not.toThrow();
    });

    it('should throw error for character with negative level', async () => {
      const character = createMockCharacter({ level: -5 });

      await expect(exportCharacter(character)).rejects.toThrow(
        ExportServiceError
      );
    });

    it('should preserve all character data', async () => {
      const character = createMockCharacter() as any;
      character.notes = [
        {
          id: 'note-1',
          title: 'Test Note',
          content: 'This is a test note',
          tags: ['test', 'example'],
          category: 'quest',
          createdAt: '2025-12-10T00:00:00.000Z',
          updatedAt: '2025-12-10T00:00:00.000Z',
          pinned: false,
        },
      ];
      character.pv = { current: 30, max: 50, temp: 5 };

      global.Blob = jest.fn((content) => {
        const jsonContent = content[0] as string;
        const parsed = JSON.parse(jsonContent);

        expect(parsed.character.notes).toHaveLength(1);
        expect(parsed.character.notes[0].title).toBe('Test Note');
        expect(parsed.character.pv.current).toBe(30);
        expect(parsed.character.pv.temp).toBe(5);

        return {} as Blob;
      }) as any;

      await exportCharacter(character);
    });

    it('should format JSON with indentation', async () => {
      const character = createMockCharacter();

      global.Blob = jest.fn((content) => {
        const jsonContent = content[0] as string;

        // JSON deve estar formatado com indentação (não minificado)
        expect(jsonContent).toContain('\n');
        expect(jsonContent).toContain('  '); // 2 espaços de indentação

        return {} as Blob;
      }) as any;

      await exportCharacter(character);
    });

    it('should handle download errors', async () => {
      const character = createMockCharacter();
      (global.URL.createObjectURL as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create URL');
      });

      await expect(exportCharacter(character)).rejects.toThrow(
        ExportServiceError
      );
      await expect(exportCharacter(character)).rejects.toThrow(
        'Falha ao criar arquivo de download'
      );
    });
  });

  describe('exportMultipleCharacters', () => {
    it('should export multiple characters successfully', async () => {
      const characters = [
        createMockCharacter({ id: '1', name: 'Character 1' }),
        createMockCharacter({ id: '2', name: 'Character 2' }),
        createMockCharacter({ id: '3', name: 'Character 3' }),
      ];

      await exportMultipleCharacters(characters);

      expect(mockClick).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Exportando 3 personagens')
      );
    });

    it('should include count in exported data', async () => {
      const characters = [
        createMockCharacter({ id: '1', name: 'Char 1' }),
        createMockCharacter({ id: '2', name: 'Char 2' }),
      ];

      global.Blob = jest.fn((content) => {
        const jsonContent = content[0] as string;
        const parsed = JSON.parse(jsonContent);

        expect(parsed.count).toBe(2);
        expect(parsed.characters).toHaveLength(2);
        expect(parsed.version).toBe(EXPORT_VERSION);

        return {} as Blob;
      }) as any;

      await exportMultipleCharacters(characters);
    });

    it('should generate filename with character count', async () => {
      const characters = [
        createMockCharacter({ id: '1', name: 'A' }),
        createMockCharacter({ id: '2', name: 'B' }),
        createMockCharacter({ id: '3', name: 'C' }),
      ];

      await exportMultipleCharacters(characters);

      // Should have created blob with multiple characters
      expect(global.Blob).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('3 personagens')
      );
    });

    it('should throw error for empty array', async () => {
      await expect(exportMultipleCharacters([])).rejects.toThrow(
        ExportServiceError
      );
      await expect(exportMultipleCharacters([])).rejects.toThrow(
        'Nenhum personagem fornecido'
      );
    });

    it('should throw error for null array', async () => {
      await expect(exportMultipleCharacters(null as any)).rejects.toThrow(
        ExportServiceError
      );
    });

    it('should validate all characters in array', async () => {
      const characters = [
        createMockCharacter({ id: '1', name: 'Valid' }),
        createMockCharacter({ id: '', name: 'Invalid' }), // ID inválido
      ];

      await expect(exportMultipleCharacters(characters)).rejects.toThrow(
        ExportServiceError
      );
    });

    it('should export single character in array', async () => {
      const characters = [createMockCharacter({ name: 'Solo Character' })];

      await exportMultipleCharacters(characters);

      expect(mockClick).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Exportando 1 personagens')
      );
    });
  });

  describe('ExportServiceError', () => {
    it('should create error with correct properties', () => {
      const error = new ExportServiceError('Test message', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ExportServiceError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should include original error', () => {
      const originalError = new Error('Original error');
      const error = new ExportServiceError(
        'Wrapped error',
        'WRAPPED_CODE',
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });
  });
});
