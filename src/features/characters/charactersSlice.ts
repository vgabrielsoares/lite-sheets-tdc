/**
 * Characters Slice - Redux Toolkit
 *
 * Gerencia o estado global dos personagens (characters).
 * Inclui operações CRUD e sincronização com IndexedDB.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Character } from '@/types';

/**
 * Estado da slice de personagens
 */
interface CharactersState {
  /** Lista de personagens */
  characters: Character[];
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
  characters: [],
  selectedCharacterId: null,
  loading: false,
  error: null,
};

/**
 * Thunk para carregar personagens do IndexedDB
 * (Será implementado quando o serviço de DB estiver pronto)
 */
export const loadCharacters = createAsyncThunk(
  'characters/loadCharacters',
  async () => {
    // TODO: Implementar integração com characterService quando disponível
    // const characters = await characterService.getAll();
    // return characters;
    return [] as Character[];
  }
);

/**
 * Thunk para salvar personagem no IndexedDB
 * (Será implementado quando o serviço de DB estiver pronto)
 */
export const saveCharacter = createAsyncThunk(
  'characters/saveCharacter',
  async (character: Character) => {
    // TODO: Implementar integração com characterService quando disponível
    // await characterService.save(character);
    return character;
  }
);

/**
 * Thunk para deletar personagem do IndexedDB
 * (Será implementado quando o serviço de DB estiver pronto)
 */
export const deleteCharacter = createAsyncThunk(
  'characters/deleteCharacter',
  async (characterId: string) => {
    // TODO: Implementar integração com characterService quando disponível
    // await characterService.delete(characterId);
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
     * Adiciona um novo personagem ao estado
     */
    addCharacter: (state, action: PayloadAction<Character>) => {
      state.characters.push(action.payload);
      state.error = null;
    },

    /**
     * Atualiza um personagem existente
     */
    updateCharacter: (state, action: PayloadAction<Character>) => {
      const index = state.characters.findIndex(
        (char) => char.id === action.payload.id
      );
      if (index !== -1) {
        state.characters[index] = action.payload;
        state.error = null;
      } else {
        state.error = `Personagem com ID ${action.payload.id} não encontrado`;
      }
    },

    /**
     * Remove um personagem do estado
     */
    removeCharacter: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter(
        (char) => char.id !== action.payload
      );
      // Se o personagem removido era o selecionado, limpa a seleção
      if (state.selectedCharacterId === action.payload) {
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
      state.characters = action.payload;
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
      state.characters = action.payload;
      state.error = null;
    });
    builder.addCase(loadCharacters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar personagens';
    });

    // Save character
    builder.addCase(saveCharacter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.characters.findIndex(
        (char) => char.id === action.payload.id
      );
      if (index !== -1) {
        state.characters[index] = action.payload;
      } else {
        state.characters.push(action.payload);
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
      state.characters = state.characters.filter(
        (char) => char.id !== action.payload
      );
      if (state.selectedCharacterId === action.payload) {
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
 * Actions exportadas
 */
export const {
  addCharacter,
  updateCharacter,
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

/** Retorna todos os personagens */
export const selectAllCharacters = (state: any) => state.characters.characters;

/** Retorna o personagem selecionado */
export const selectSelectedCharacter = (state: any) => {
  const id = state.characters.selectedCharacterId;
  if (!id) return null;
  return (
    state.characters.characters.find((char: Character) => char.id === id) ||
    null
  );
};

/** Retorna um personagem por ID */
export const selectCharacterById = (state: any, characterId: string) =>
  state.characters.characters.find(
    (char: Character) => char.id === characterId
  );

/** Retorna o ID do personagem selecionado */
export const selectSelectedCharacterId = (state: any) =>
  state.characters.selectedCharacterId;

/** Retorna o estado de carregamento */
export const selectCharactersLoading = (state: any) => state.characters.loading;

/** Retorna o erro (se houver) */
export const selectCharactersError = (state: any) => state.characters.error;

/** Retorna a quantidade de personagens */
export const selectCharactersCount = (state: any) =>
  state.characters.characters.length;

/**
 * Reducer exportado
 */
export default charactersSlice.reducer;
