/**
 * Characters Slice - Redux Toolkit
 *
 * Gerencia o estado global dos personagens (characters).
 * Inclui operações CRUD e sincronização com IndexedDB.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Character } from '@/types';
import { characterService } from '@/services/characterService';

/**
 * Estado da slice de personagens
 */
interface CharactersState {
  /** Personagens armazenados como objeto normalizado (entities) */
  entities: Record<string, Character>;
  /** Array com IDs dos personagens na ordem */
  ids: string[];
  /** ID do personagem atualmente selecionado */
  selectedCharacterId: string | null;
  /** Status de carregamento */
  loading: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
}

/**
 * Estado inicial
 */
const initialState: CharactersState = {
  entities: {},
  ids: [],
  selectedCharacterId: null,
  loading: false,
  error: null,
};

/**
 * Thunk para carregar personagens do IndexedDB
 */
export const loadCharacters = createAsyncThunk(
  'characters/loadCharacters',
  async () => {
    const characters = await characterService.getAll();
    return characters;
  }
);

/**
 * Thunk para adicionar novo personagem
 * Salva no IndexedDB e adiciona ao Redux store
 */
export const addCharacter = createAsyncThunk(
  'characters/addCharacter',
  async (character: Character) => {
    await characterService.create(character);
    return character;
  }
);

/**
 * Thunk para atualizar personagem existente
 * Atualiza no IndexedDB e no Redux store
 */
export const updateCharacter = createAsyncThunk(
  'characters/updateCharacter',
  async ({ id, updates }: { id: string; updates: Partial<Character> }) => {
    await characterService.update(id, updates);
    return { id, updates };
  }
);

/**
 * Thunk para salvar personagem no IndexedDB
 * @deprecated Use addCharacter ou updateCharacter ao invés deste
 */
export const saveCharacter = createAsyncThunk(
  'characters/saveCharacter',
  async (character: Character) => {
    await characterService.create(character);
    return character;
  }
);

/**
 * Thunk para deletar personagem do IndexedDB
 */
export const deleteCharacter = createAsyncThunk(
  'characters/deleteCharacter',
  async (characterId: string) => {
    await characterService.delete(characterId);
    return characterId;
  }
);

/**
 * Slice de personagens
 */
const charactersSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    /**
     * Remove um personagem do estado (ação síncrona)
     */
    removeCharacter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.entities[id];
      state.ids = state.ids.filter((charId) => charId !== id);
      // Se o personagem removido era o selecionado, limpa a seleção
      if (state.selectedCharacterId === id) {
        state.selectedCharacterId = null;
      }
      state.error = null;
    },

    /**
     * Seleciona um personagem
     */
    selectCharacter: (state, action: PayloadAction<string>) => {
      state.selectedCharacterId = action.payload;
      state.error = null;
    },

    /**
     * Limpa a seleção de personagem
     */
    clearSelection: (state) => {
      state.selectedCharacterId = null;
    },

    /**
     * Limpa o erro
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Substitui todos os personagens (útil para importação)
     */
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      const characters = action.payload;
      state.entities = {};
      state.ids = [];
      characters.forEach((character) => {
        state.entities[character.id] = character;
        state.ids.push(character.id);
      });
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load characters
    builder.addCase(loadCharacters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadCharacters.fulfilled, (state, action) => {
      state.loading = false;
      state.entities = {};
      state.ids = [];
      action.payload.forEach((character) => {
        state.entities[character.id] = character;
        state.ids.push(character.id);
      });
      state.error = null;
    });
    builder.addCase(loadCharacters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar personagens';
    });

    // Add character (async thunk)
    builder.addCase(addCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const character = action.payload;
      state.entities[character.id] = character;
      if (!state.ids.includes(character.id)) {
        state.ids.push(character.id);
      }
      state.error = null;
    });
    builder.addCase(addCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao adicionar personagem';
    });

    // Update character (async thunk)
    builder.addCase(updateCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const { id, updates } = action.payload;
      if (state.entities[id]) {
        state.entities[id] = { ...state.entities[id], ...updates };
        state.error = null;
      } else {
        state.error = `Personagem com ID ${id} não encontrado`;
      }
    });
    builder.addCase(updateCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao atualizar personagem';
    });

    // Save character (deprecated, mantido para compatibilidade)
    builder.addCase(saveCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const character = action.payload;
      state.entities[character.id] = character;
      if (!state.ids.includes(character.id)) {
        state.ids.push(character.id);
      }
      state.error = null;
    });
    builder.addCase(saveCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao salvar personagem';
    });

    // Delete character
    builder.addCase(deleteCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.payload;
      delete state.entities[id];
      state.ids = state.ids.filter((charId) => charId !== id);
      if (state.selectedCharacterId === id) {
        state.selectedCharacterId = null;
      }
      state.error = null;
    });
    builder.addCase(deleteCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao deletar personagem';
    });
  },
});

/**
 * Actions exportadas (apenas síncronas)
 */
export const {
  removeCharacter,
  selectCharacter,
  clearSelection,
  clearError,
  setCharacters,
} = charactersSlice.actions;

/**
 * Selectors
 * Nota: Os selectors recebem 'any' aqui e são re-exportados com tipos corretos no store
 */

/** Retorna todos os personagens como array */
export const selectAllCharacters = (state: any): Character[] => {
  if (!state.characters || !state.characters.ids) return [];
  return state.characters.ids
    .map((id: string) => state.characters.entities[id])
    .filter(Boolean);
};

/** Retorna o personagem selecionado */
export const selectSelectedCharacter = (state: any): Character | null => {
  if (!state.characters) return null;
  const id = state.characters.selectedCharacterId;
  if (!id) return null;
  return state.characters.entities[id] || null;
};

/** Retorna um personagem por ID */
export const selectCharacterById = (
  state: any,
  characterId: string
): Character | undefined => {
  if (!state.characters || !state.characters.entities) return undefined;
  return state.characters.entities[characterId];
};

/** Retorna o ID do personagem selecionado */
export const selectSelectedCharacterId = (state: any): string | null => {
  if (!state.characters) return null;
  return state.characters.selectedCharacterId;
};

/** Retorna o estado de carregamento */
export const selectCharactersLoading = (state: any): boolean => {
  if (!state.characters) return false;
  return state.characters.loading;
};

/** Retorna o erro (se houver) */
export const selectCharactersError = (state: any): string | null => {
  if (!state.characters) return null;
  return state.characters.error;
};

/** Retorna a quantidade de personagens */
export const selectCharactersCount = (state: any): number => {
  if (!state.characters || !state.characters.ids) return 0;
  return state.characters.ids.length;
};

/** Retorna todas as entities (útil para manipulação direta) */
export const selectCharacterEntities = (
  state: any
): Record<string, Character> => {
  if (!state.characters || !state.characters.entities) return {};
  return state.characters.entities;
};

/** Retorna todos os IDs de personagens */
export const selectCharacterIds = (state: any): string[] => {
  if (!state.characters || !state.characters.ids) return [];
  return state.characters.ids;
};

/**
 * Reducer exportado
 */
export default charactersSlice.reducer;
