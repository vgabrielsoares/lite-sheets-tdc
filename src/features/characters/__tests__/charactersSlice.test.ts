/**
 * Testes para o charactersSlice
 */

import charactersReducer, {
  addCharacter,
  updateCharacter,
  removeCharacter,
  selectCharacter,
  clearSelection,
  clearError,
  setCharacters,
  loadCharacters,
  deleteCharacter,
  addCraft,
  updateCraft,
  removeCraft,
  selectAllCharacters,
  selectSelectedCharacter,
  selectCharacterById,
  selectSelectedCharacterId,
  selectCharactersLoading,
  selectCharactersError,
  selectCharactersCount,
  selectCharacterEntities,
  selectCharacterIds,
} from '../charactersSlice';
import type { Character } from '@/types';

// Mock do characterService
jest.mock('@/services/characterService', () => ({
  characterService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { characterService } from '@/services/characterService';

// Mock de personagem para testes
const mockCharacter: Character = {
  id: 'char-1',
  schemaVersion: 2,
  name: 'Aragorn',
  playerName: 'John Doe',
  level: 1,
  experience: {
    current: 0,
    toNextLevel: 1000,
  },
  concept: 'Guerreiro nobre',
  origin: {
    name: 'Nobre',
    skillProficiencies: ['historia', 'persuasao'],
    attributeModifiers: [{ attribute: 'influencia', value: 1 }],
    description: 'Origens nobres',
  },
  lineage: {
    name: 'Humano',
    size: 'medio',
    height: 180,
    weightKg: 80,
    weightRPG: 16,
    age: 30,
    languages: ['comum', 'elfico'],
    movement: { andando: 6, voando: 0, escalando: 0, escavando: 0, nadando: 0 },
    vision: 'normal',
    ancestryTraits: [],
    attributeModifiers: [{ attribute: 'corpo', value: 1 }],
    description: 'Humanos versáteis',
  },
  attributes: {
    agilidade: 2,
    corpo: 3,
    influencia: 2,
    mente: 1,
    essencia: 1,
    instinto: 1,
  },
  skills: {} as any,
  signatureSkill: 'atletismo',
  skillProficiencyBonusSlots: 0,
  archetypes: [],
  classes: [],
  proficiencies: {
    weapons: ['armas-simples'],
    armor: [],
    tools: [],
    other: [],
  },
  languages: ['comum'],
  extraLanguagesModifier: 0,
  combat: {
    hp: {
      current: 15,
      max: 15,
      temporary: 0,
    },
    pp: {
      current: 2,
      max: 2,
      temporary: 0,
    },
  } as any,
  movement: {
    speeds: {
      andando: { base: 6, bonus: 0 },
      voando: { base: 0, bonus: 0 },
      escalando: { base: 0, bonus: 0 },
      escavando: { base: 0, bonus: 0 },
      nadando: { base: 0, bonus: 0 },
    },
    modifiers: 0,
  },
  senses: {
    vision: 'normal',
    keenSenses: [],
    perceptionModifiers: { visao: 0, olfato: 0, audicao: 0 },
  },
  size: 'medio',
  luck: {
    level: 1,
    value: 1,
    diceModifier: 0,
    numericModifier: 0,
  },
  crafts: [],
  resources: [],
  specialAbilities: [],
  inventory: {
    items: [],
    carryingCapacity: {
      base: 20,
      sizeModifier: 0,
      otherModifiers: 0,
      modifiers: 0,
      total: 20,
      currentWeight: 0,
      encumbranceState: 'normal',
      pushLimit: 40,
      liftLimit: 10,
    },
    currency: {
      physical: { cobre: 0, ouro: 10, platina: 0 },
      bank: { cobre: 0, ouro: 0, platina: 0 },
    },
  },
  spellcasting: {} as any,
  particularities: {
    negativeTraits: [],
    positiveTraits: [],
    completeTraits: [],
    balance: 0,
  },
  physicalDescription: {},
  definers: {
    flaws: [],
    fears: [],
    ideals: [],
    traits: [],
    goals: [],
    allies: [],
    organizations: [],
  },
  levelProgression: [],
  notes: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockCharacter2: Character = {
  ...mockCharacter,
  id: 'char-2',
  name: 'Legolas',
};

describe('charactersSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('deve retornar o estado inicial', () => {
      expect(charactersReducer(undefined, { type: 'unknown' })).toEqual({
        entities: {},
        ids: [],
        characters: [], // Derived array from normalized state
        selectedCharacterId: null,
        loading: false,
        error: null,
      });
    });

    it('deve remover um personagem', () => {
      const initialState = {
        entities: {
          'char-1': mockCharacter,
          'char-2': mockCharacter2,
        },
        ids: ['char-1', 'char-2'],
        characters: [mockCharacter, mockCharacter2],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const actual = charactersReducer(initialState, removeCharacter('char-1'));

      expect(actual.ids).toHaveLength(1);
      expect(actual.ids[0]).toBe('char-2');
      expect(actual.entities['char-1']).toBeUndefined();
      expect(actual.entities['char-2']).toEqual(mockCharacter2);
      expect(actual.error).toBeNull();
    });

    it('deve limpar seleção ao remover personagem selecionado', () => {
      const initialState = {
        entities: { 'char-1': mockCharacter },
        ids: ['char-1'],
        characters: [mockCharacter],
        selectedCharacterId: 'char-1',
        loading: false,
        error: null,
      };

      const actual = charactersReducer(initialState, removeCharacter('char-1'));

      expect(actual.selectedCharacterId).toBeNull();
    });

    it('deve selecionar um personagem', () => {
      const initialState = {
        entities: { 'char-1': mockCharacter },
        ids: ['char-1'],
        characters: [mockCharacter],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const actual = charactersReducer(initialState, selectCharacter('char-1'));

      expect(actual.selectedCharacterId).toBe('char-1');
      expect(actual.error).toBeNull();
    });

    it('deve limpar a seleção', () => {
      const initialState = {
        entities: { 'char-1': mockCharacter },
        ids: ['char-1'],
        characters: [mockCharacter],
        selectedCharacterId: 'char-1',
        loading: false,
        error: null,
      };

      const actual = charactersReducer(initialState, clearSelection());

      expect(actual.selectedCharacterId).toBeNull();
    });

    it('deve limpar o erro', () => {
      const initialState = {
        entities: {},
        ids: [],
        characters: [],
        selectedCharacterId: null,
        loading: false,
        error: 'Algum erro',
      };

      const actual = charactersReducer(initialState, clearError());

      expect(actual.error).toBeNull();
    });

    it('deve substituir todos os personagens', () => {
      const initialState = {
        entities: { 'char-1': mockCharacter },
        ids: ['char-1'],
        characters: [mockCharacter],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const newCharacters = [mockCharacter2];

      const actual = charactersReducer(
        initialState,
        setCharacters(newCharacters)
      );

      expect(actual.ids).toHaveLength(1);
      expect(actual.ids[0]).toBe('char-2');
      expect(actual.entities['char-2']).toEqual(mockCharacter2);
      expect(actual.entities['char-1']).toBeUndefined();
      expect(actual.error).toBeNull();
    });
  });

  describe('async thunks', () => {
    it('loadCharacters.fulfilled deve carregar personagens', () => {
      const characters = [mockCharacter, mockCharacter2];
      const action = {
        type: loadCharacters.fulfilled.type,
        payload: { characters, migratedNames: [] },
      };

      const actual = charactersReducer(undefined, action);

      expect(actual.ids).toHaveLength(2);
      expect(actual.ids).toEqual(['char-1', 'char-2']);
      expect(actual.entities['char-1']).toEqual(mockCharacter);
      expect(actual.entities['char-2']).toEqual(mockCharacter2);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBeNull();
    });

    it('loadCharacters.pending deve definir loading como true', () => {
      const action = { type: loadCharacters.pending.type };
      const actual = charactersReducer(undefined, action);

      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('loadCharacters.rejected deve definir erro', () => {
      const action = {
        type: loadCharacters.rejected.type,
        error: { message: 'Erro ao carregar' },
      };
      const actual = charactersReducer(undefined, action);

      expect(actual.loading).toBe(false);
      expect(actual.error).toBe('Erro ao carregar');
    });

    it('addCharacter.fulfilled deve adicionar novo personagem', () => {
      const action = {
        type: addCharacter.fulfilled.type,
        payload: mockCharacter,
      };
      const actual = charactersReducer(undefined, action);

      expect(actual.ids).toHaveLength(1);
      expect(actual.ids[0]).toBe('char-1');
      expect(actual.entities['char-1']).toEqual(mockCharacter);
      expect(actual.loading).toBe(false);
    });

    it('addCharacter.pending deve definir loading', () => {
      const action = { type: addCharacter.pending.type };
      const actual = charactersReducer(undefined, action);

      expect(actual.loading).toBe(true);
    });

    it('updateCharacter.fulfilled deve atualizar personagem existente', () => {
      const initialState = {
        entities: { 'char-1': mockCharacter },
        ids: ['char-1'],
        characters: [mockCharacter],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const updates = { name: 'Aragorn II' };
      const action = {
        type: updateCharacter.fulfilled.type,
        payload: { id: 'char-1', updates },
      };

      const actual = charactersReducer(initialState, action);

      expect(actual.entities['char-1'].name).toBe('Aragorn II');
      expect(actual.loading).toBe(false);
      expect(actual.error).toBeNull();
    });

    it('updateCharacter.fulfilled deve definir erro se personagem não existir', () => {
      const updates = { name: 'Test' };
      const action = {
        type: updateCharacter.fulfilled.type,
        payload: { id: 'non-existent', updates },
      };

      const actual = charactersReducer(undefined, action);

      expect(actual.error).toContain('não encontrado');
    });

    it('deleteCharacter.fulfilled deve remover personagem', () => {
      const initialState = {
        entities: {
          'char-1': mockCharacter,
          'char-2': mockCharacter2,
        },
        ids: ['char-1', 'char-2'],
        characters: [mockCharacter, mockCharacter2],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const action = {
        type: deleteCharacter.fulfilled.type,
        payload: 'char-1',
      };
      const actual = charactersReducer(initialState, action);

      expect(actual.ids).toHaveLength(1);
      expect(actual.ids[0]).toBe('char-2');
      expect(actual.entities['char-1']).toBeUndefined();
      expect(actual.loading).toBe(false);
    });
  });

  describe('selectors', () => {
    const mockState = {
      characters: {
        entities: {
          'char-1': mockCharacter,
          'char-2': mockCharacter2,
        },
        ids: ['char-1', 'char-2'],
        selectedCharacterId: 'char-1',
        loading: false,
        error: null,
      },
    };

    it('selectAllCharacters deve retornar todos os personagens', () => {
      const result = selectAllCharacters(mockState);
      expect(result).toHaveLength(2);
      expect(result).toEqual([mockCharacter, mockCharacter2]);
    });

    it('selectSelectedCharacter deve retornar o personagem selecionado', () => {
      expect(selectSelectedCharacter(mockState)).toEqual(mockCharacter);
    });

    it('selectSelectedCharacter deve retornar null se nenhum selecionado', () => {
      const state = {
        ...mockState,
        characters: { ...mockState.characters, selectedCharacterId: null },
      };
      expect(selectSelectedCharacter(state)).toBeNull();
    });

    it('selectCharacterById deve retornar personagem por ID', () => {
      expect(selectCharacterById(mockState, 'char-2')).toEqual(mockCharacter2);
    });

    it('selectSelectedCharacterId deve retornar o ID selecionado', () => {
      expect(selectSelectedCharacterId(mockState)).toBe('char-1');
    });

    it('selectCharactersLoading deve retornar o estado de loading', () => {
      expect(selectCharactersLoading(mockState)).toBe(false);
    });

    it('selectCharactersError deve retornar o erro', () => {
      expect(selectCharactersError(mockState)).toBeNull();
    });

    it('selectCharactersCount deve retornar a quantidade de personagens', () => {
      expect(selectCharactersCount(mockState)).toBe(2);
    });

    it('selectCharacterEntities deve retornar todas as entities', () => {
      const entities = selectCharacterEntities(mockState);
      expect(entities['char-1']).toEqual(mockCharacter);
      expect(entities['char-2']).toEqual(mockCharacter2);
    });

    it('selectCharacterIds deve retornar todos os IDs', () => {
      const ids = selectCharacterIds(mockState);
      expect(ids).toEqual(['char-1', 'char-2']);
    });
  });

  describe('Craft Actions', () => {
    const initialStateWithCharacter = {
      entities: {
        'char-1': {
          ...mockCharacter,
          crafts: [],
        },
      },
      ids: ['char-1'],
      characters: [{ ...mockCharacter, crafts: [] }],
      selectedCharacterId: null,
      loading: false,
      error: null,
    };

    it('addCraft deve adicionar um novo ofício ao personagem', () => {
      const newCraft = {
        id: 'craft-1',
        name: 'Ferreiro',
        level: 2 as const,
        attributeKey: 'corpo' as const,
        diceModifier: 0,
        numericModifier: 2,
        description: 'Trabalha com metal',
      };

      const state = charactersReducer(
        initialStateWithCharacter,
        addCraft({ characterId: 'char-1', craft: newCraft })
      );

      expect(state.entities['char-1'].crafts).toHaveLength(1);
      expect(state.entities['char-1'].crafts[0]).toEqual(newCraft);
      expect(state.error).toBeNull();
    });

    it('updateCraft deve atualizar um ofício existente', () => {
      const stateWithCraft = {
        ...initialStateWithCharacter,
        entities: {
          'char-1': {
            ...mockCharacter,
            crafts: [
              {
                id: 'craft-1',
                name: 'Ferreiro',
                level: 2 as const,
                attributeKey: 'corpo' as const,
                diceModifier: 0,
                numericModifier: 0,
              },
            ],
          },
        },
      };

      const state = charactersReducer(
        stateWithCraft,
        updateCraft({
          characterId: 'char-1',
          craftId: 'craft-1',
          updates: { name: 'Mestre Ferreiro', level: 5, numericModifier: 3 },
        })
      );

      expect(state.entities['char-1'].crafts[0].name).toBe('Mestre Ferreiro');
      expect(state.entities['char-1'].crafts[0].level).toBe(5);
      expect(state.entities['char-1'].crafts[0].numericModifier).toBe(3);
    });

    it('removeCraft deve remover um ofício', () => {
      const stateWithCraft = {
        ...initialStateWithCharacter,
        entities: {
          'char-1': {
            ...mockCharacter,
            crafts: [
              {
                id: 'craft-1',
                name: 'Ferreiro',
                level: 2 as const,
                attributeKey: 'corpo' as const,
                diceModifier: 0,
                numericModifier: 0,
              },
            ],
          },
        },
      };

      const state = charactersReducer(
        stateWithCraft,
        removeCraft({ characterId: 'char-1', craftId: 'craft-1' })
      );

      expect(state.entities['char-1'].crafts).toHaveLength(0);
    });

    it('deve retornar erro se personagem não existe ao adicionar craft', () => {
      const state = charactersReducer(
        initialStateWithCharacter,
        addCraft({
          characterId: 'non-existent',
          craft: {
            id: 'craft-1',
            name: 'Ferreiro',
            level: 2,
            attributeKey: 'corpo',
            diceModifier: 0,
            numericModifier: 0,
          },
        })
      );

      expect(state.error).toBe('Personagem com ID non-existent não encontrado');
    });
  });
});
