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
  selectAllCharacters,
  selectSelectedCharacter,
  selectCharacterById,
  selectSelectedCharacterId,
  selectCharactersLoading,
  selectCharactersError,
  selectCharactersCount,
} from '../charactersSlice';
import type { Character } from '@/types';

// Mock de personagem para testes
const mockCharacter: Character = {
  id: 'char-1',
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
  },
  attributes: {
    agilidade: 2,
    constituicao: 2,
    forca: 3,
    influencia: 2,
    mente: 1,
    presenca: 1,
  },
  skills: {} as any,
  signatureSkill: 'atletismo',
  archetypes: [],
  classes: [],
  proficiencies: {
    weapons: ['armas-simples'],
    armor: [],
    tools: [],
    other: [],
  },
  languages: ['comum'],
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
    speeds: { andando: 6, voando: 0, escalando: 0, escavando: 0, nadando: 0 },
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
  },
  crafts: [],
  inventory: {
    items: [],
    carryingCapacity: {
      base: 20,
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
  describe('reducers', () => {
    it('deve retornar o estado inicial', () => {
      expect(charactersReducer(undefined, { type: 'unknown' })).toEqual({
        characters: [],
        selectedCharacterId: null,
        loading: false,
        error: null,
      });
    });

    it('deve adicionar um personagem', () => {
      const actual = charactersReducer(undefined, addCharacter(mockCharacter));
      expect(actual.characters).toHaveLength(1);
      expect(actual.characters[0]).toEqual(mockCharacter);
      expect(actual.error).toBeNull();
    });

    it('deve atualizar um personagem existente', () => {
      const initialState = {
        characters: [mockCharacter],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const updatedCharacter = {
        ...mockCharacter,
        name: 'Aragorn II',
      };

      const actual = charactersReducer(
        initialState,
        updateCharacter(updatedCharacter)
      );

      expect(actual.characters[0].name).toBe('Aragorn II');
      expect(actual.error).toBeNull();
    });

    it('deve definir erro ao tentar atualizar personagem inexistente', () => {
      const initialState = {
        characters: [],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const actual = charactersReducer(
        initialState,
        updateCharacter(mockCharacter)
      );

      expect(actual.error).toContain('não encontrado');
    });

    it('deve remover um personagem', () => {
      const initialState = {
        characters: [mockCharacter, mockCharacter2],
        selectedCharacterId: null,
        loading: false,
        error: null,
      };

      const actual = charactersReducer(initialState, removeCharacter('char-1'));

      expect(actual.characters).toHaveLength(1);
      expect(actual.characters[0].id).toBe('char-2');
      expect(actual.error).toBeNull();
    });

    it('deve limpar seleção ao remover personagem selecionado', () => {
      const initialState = {
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

      expect(actual.characters).toHaveLength(1);
      expect(actual.characters[0].id).toBe('char-2');
      expect(actual.error).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      characters: {
        characters: [mockCharacter, mockCharacter2],
        selectedCharacterId: 'char-1',
        loading: false,
        error: null,
      },
    };

    it('selectAllCharacters deve retornar todos os personagens', () => {
      expect(selectAllCharacters(mockState)).toEqual([
        mockCharacter,
        mockCharacter2,
      ]);
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
  });
});
