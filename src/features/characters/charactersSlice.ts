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
  /** Lista derivada de personagens (compatibilidade com testes legados) */
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
  entities: {},
  ids: [],
  characters: [],
  selectedCharacterId: null,
  loading: false,
  error: null,
};

/**
 * Atualiza a lista derivada characters a partir de entities/ids
 */
function syncCharactersArray(state: CharactersState): void {
  state.characters = state.ids
    .map((id) => state.entities[id])
    .filter((c): c is Character => Boolean(c));
}

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
 * Thunk para carregar um único personagem por ID do IndexedDB
 */
export const loadCharacterById = createAsyncThunk(
  'characters/loadCharacterById',
  async (characterId: string) => {
    const character = await characterService.getById(characterId);
    if (!character) {
      throw new Error(`Personagem com ID ${characterId} não encontrado`);
    }
    return character;
  }
);

/**
 * Thunk para adicionar novo personagem
 * Salva no IndexedDB e adiciona ao Redux store
 */
export const addCharacter = createAsyncThunk(
  'characters/addCharacter',
  async (
    character: Character | Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    // Service.create generates new ID/timestamps, so we must return its result
    const created = await characterService.create(character as any);
    return created;
  }
);

/**
 * Thunk para atualizar personagem existente
 * Atualiza no IndexedDB e no Redux store
 *
 * IMPORTANTE: Se o personagem não existir no IndexedDB, ele será restaurado
 * a partir do Redux state antes de atualizar. Isso resolve race conditions
 * onde o personagem existe no Redux mas não no IndexedDB.
 */
export const updateCharacter = createAsyncThunk(
  'characters/updateCharacter',
  async (
    { id, updates }: { id: string; updates: Partial<Character> },
    { getState }
  ) => {
    // Verificar se o personagem existe no IndexedDB
    let existingCharacter = await characterService.getById(id);

    // Se não existir no IndexedDB mas existir no Redux, restaurar primeiro
    if (!existingCharacter) {
      const state = getState() as any;
      const reduxCharacter = state.characters.entities[id] as
        | Character
        | undefined;

      if (reduxCharacter) {
        console.warn(
          `⚠️ Personagem ${id} existe no Redux mas não no IndexedDB. Restaurando...`
        );

        // Criar o personagem no IndexedDB a partir do Redux state
        // Removendo campos que são gerados automaticamente no create
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...characterData
        } = reduxCharacter;

        // Usar um método especial para restaurar com o ID original
        // Vamos adicionar ao IndexedDB diretamente preservando todos os campos
        await characterService.restore(reduxCharacter);

        console.log(`✅ Personagem ${id} restaurado no IndexedDB`);
      } else {
        // Personagem não existe em nenhum lugar - erro crítico
        console.error(`❌ Personagem ${id} NÃO ENCONTRADO em lugar nenhum!`);
        throw new Error(
          `Personagem com ID ${id} não encontrado no Redux nem no IndexedDB`
        );
      }
    }

    // Agora atualizar normalmente
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

    /**
     * Atualiza a Habilidade de Assinatura do personagem
     * Remove a assinatura da habilidade anterior e define a nova
     */
    updateSignatureAbility: (
      state,
      action: PayloadAction<{
        characterId: string;
        skillName: import('@/types').SkillName | null;
      }>
    ) => {
      const { characterId, skillName } = action.payload;
      const character = state.entities[characterId];

      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      // Remove a assinatura da habilidade anterior
      Object.values(character.skills).forEach((skill) => {
        skill.isSignature = false;
      });

      // Define a nova habilidade de assinatura (se fornecida)
      if (skillName && character.skills[skillName]) {
        character.skills[skillName].isSignature = true;
      }

      // Atualiza timestamp
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Adiciona um novo ofício ao personagem
     */
    /**
     * Adiciona um ofício ao personagem
     */
    addCraft: (
      state,
      action: PayloadAction<{
        characterId: string;
        craft: import('@/types').Craft;
      }>
    ) => {
      const { characterId, craft } = action.payload;
      const character = state.entities[characterId];

      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      character.crafts.push(craft);
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Atualiza um ofício existente do personagem
     */
    updateCraft: (
      state,
      action: PayloadAction<{
        characterId: string;
        craftId: string;
        updates: Partial<import('@/types').Craft>;
      }>
    ) => {
      const { characterId, craftId, updates } = action.payload;
      const character = state.entities[characterId];

      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      const craftIndex = character.crafts.findIndex((c) => c.id === craftId);
      if (craftIndex === -1) {
        state.error = `Ofício com ID ${craftId} não encontrado`;
        return;
      }

      // Atualizar o ofício com os novos valores
      character.crafts[craftIndex] = {
        ...character.crafts[craftIndex],
        ...updates,
      };

      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Remove um ofício do personagem
     */
    removeCraft: (
      state,
      action: PayloadAction<{
        characterId: string;
        craftId: string;
      }>
    ) => {
      const { characterId, craftId } = action.payload;
      const character = state.entities[characterId];

      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      character.crafts = character.crafts.filter((c) => c.id !== craftId);
      character.updatedAt = new Date().toISOString();
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
      syncCharactersArray(state);
    });
    builder.addCase(loadCharacters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar personagens';
    });

    // Load character by ID
    builder.addCase(loadCharacterById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadCharacterById.fulfilled, (state, action) => {
      state.loading = false;
      const character = action.payload;
      state.entities[character.id] = character;
      if (!state.ids.includes(character.id)) {
        state.ids.push(character.id);
      }
      state.error = null;
      syncCharactersArray(state);
    });
    builder.addCase(loadCharacterById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao carregar personagem';
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
      syncCharactersArray(state);
    });
    builder.addCase(addCharacter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Erro ao adicionar personagem';
    });

    // Update character (async thunk)
    builder.addCase(updateCharacter.pending, (state) => {
      // NÃO alteramos loading para true aqui para evitar UI "piscando"
      // durante updates automáticos (auto-save)
      state.error = null;
    });
    builder.addCase(updateCharacter.fulfilled, (state, action) => {
      state.loading = false;
      const { id, updates } = action.payload;
      if (state.entities[id]) {
        const character = state.entities[id];
        
        // Deep merge para skills (se presente)
        if (updates.skills) {
          character.skills = {
            ...character.skills,
            ...updates.skills,
          };
          // Remove skills das updates para não fazer merge duplo
          const { skills, ...otherUpdates } = updates;
          Object.assign(character, otherUpdates);
        } else {
          // Atualizar apenas os campos modificados, mantendo a mesma referência
          Object.assign(character, updates);
        }
        state.error = null;
      } else {
        state.error = `Personagem com ID ${id} não encontrado`;
      }
      syncCharactersArray(state);
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
      syncCharactersArray(state);
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
      syncCharactersArray(state);
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
  updateSignatureAbility,
  addCraft,
  updateCraft,
  removeCraft,
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
