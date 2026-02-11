/**
 * Characters Slice - Redux Toolkit
 *
 * Gerencia o estado global dos personagens (characters).
 * Inclui operações CRUD e sincronização com IndexedDB.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Character } from '@/types';
import type { ArchetypeName } from '@/types/character';
import type { SpellType, SpellcastingData } from '@/types/spells';
import { SPELL_CIRCLE_PF_COST } from '@/constants/spells';
import type { SpellCircle } from '@/constants/spells';
import { characterService } from '@/services/characterService';
import {
  needsMigration,
  migrateCharacterV1toV2,
  ensureCombatFields,
} from '@/utils/characterMigration';
import {
  applyLevelUp,
  type LevelUpSpecialGain,
} from '@/utils/levelUpCalculations';

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
 * Aplica migração v1→v2 (se necessário) e garante ataque desarmado em todos os personagens.
 * Personagens migrados são persistidos de volta ao IndexedDB.
 * Retorna { characters, migratedNames } para possibilitar notificação ao usuário.
 */
export const loadCharacters = createAsyncThunk(
  'characters/loadCharacters',
  async () => {
    const characters = await characterService.getAll();
    const migratedNames: string[] = [];

    const processed = await Promise.all(
      characters.map(async (char) => {
        let c = char;
        if (needsMigration(c)) {
          c = migrateCharacterV1toV2(c);
          migratedNames.push(c.name);
          await characterService.update(c.id, c);
        }
        // Garantir campos de combate v0.0.2 (safety net)
        c = ensureCombatFields(c);
        return characterService.ensureUnarmedAttack(c);
      })
    );

    return { characters: processed, migratedNames };
  }
);

/**
 * Thunk para carregar um único personagem por ID do IndexedDB
 * Aplica migração v1→v2 (se necessário) e garante ataque desarmado.
 */
export const loadCharacterById = createAsyncThunk(
  'characters/loadCharacterById',
  async (characterId: string) => {
    const character = await characterService.getById(characterId);
    if (!character) {
      throw new Error(`Personagem com ID ${characterId} não encontrado`);
    }
    let c = character;
    if (needsMigration(c)) {
      c = migrateCharacterV1toV2(c);
      await characterService.update(c.id, c);
    }
    // Garantir campos de combate v0.0.2 (safety net)
    c = ensureCombatFields(c);
    return characterService.ensureUnarmedAttack(c);
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
     * Sobe o personagem de nível (Level Up)
     *
     * Aplica todos os ganhos do level up: nível, arquétipo, GA, PP, PV, XP,
     * habilidades especiais, e progressão.
     */
    levelUp: (
      state,
      action: PayloadAction<{
        characterId: string;
        archetypeName: ArchetypeName;
        specialGains?: LevelUpSpecialGain[];
      }>
    ) => {
      const { characterId, archetypeName, specialGains } = action.payload;
      const character = state.entities[characterId];

      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      applyLevelUp(character, archetypeName, specialGains ?? []);
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

    // ─── Feitiços & Conjuração (Fase 6) ───────────────────────────

    /**
     * Toggle de conjurador — habilita/desabilita o sistema de PF
     */
    toggleCaster: (
      state,
      action: PayloadAction<{
        characterId: string;
        isCaster: boolean;
      }>
    ) => {
      const { characterId, isCaster } = action.payload;
      const character = state.entities[characterId];
      if (!character) {
        state.error = `Personagem com ID ${characterId} não encontrado`;
        return;
      }

      const defaultSpellcasting: SpellcastingData = {
        isCaster: false,
        spellPoints: { current: 0, max: 0 },
        knownSpells: [],
        maxKnownSpells: 0,
        knownSpellsModifiers: 0,
        spellcastingAbilities: [],
        masteredMatrices: [],
      };

      character.spellcasting = {
        ...(character.spellcasting || defaultSpellcasting),
        isCaster,
        spellPoints: {
          current: 0,
          max: isCaster ? (character.spellcasting?.spellPoints?.max ?? 0) : 0,
        },
      };

      if (!isCaster) {
        character.spellcasting.castingSkill = undefined;
      }

      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Define a habilidade de conjuração principal
     */
    setCastingSkill: (
      state,
      action: PayloadAction<{
        characterId: string;
        castingSkill: SpellType;
      }>
    ) => {
      const { characterId, castingSkill } = action.payload;
      const character = state.entities[characterId];
      if (!character || !character.spellcasting) {
        state.error = `Personagem com ID ${characterId} não encontrado ou não é conjurador`;
        return;
      }

      character.spellcasting.castingSkill = castingSkill;
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Gasta Pontos de Feitiço (PF) — também gasta PP no mesmo valor
     * Bloqueia se PP insuficiente ou PP = 0
     */
    spendSpellPoints: (
      state,
      action: PayloadAction<{
        characterId: string;
        amount: number;
      }>
    ) => {
      const { characterId, amount } = action.payload;
      const character = state.entities[characterId];
      if (!character || !character.spellcasting) {
        state.error = `Personagem com ID ${characterId} não encontrado ou não é conjurador`;
        return;
      }

      const pp = character.combat.pp;
      const pf = character.spellcasting.spellPoints;

      // Verificações de bloqueio
      if (pp.current <= 0) {
        state.error = 'Esgotado — não pode conjurar com 0 PP';
        return;
      }
      if (pp.current < amount) {
        state.error = `PP insuficiente (atual: ${pp.current}, custo: ${amount})`;
        return;
      }
      if (pf.current < amount) {
        state.error = `PF insuficiente (atual: ${pf.current}, custo: ${amount})`;
        return;
      }

      // Gastar PF e PP simultaneamente
      character.spellcasting.spellPoints.current = Math.max(
        0,
        pf.current - amount
      );
      character.combat.pp.current = Math.max(0, pp.current - amount);
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Gera Pontos de Feitiço (PF) — não gasta PP
     * Usado por Canalizar Mana e final de turno
     */
    generateSpellPoints: (
      state,
      action: PayloadAction<{
        characterId: string;
        amount: number;
      }>
    ) => {
      const { characterId, amount } = action.payload;
      const character = state.entities[characterId];
      if (!character || !character.spellcasting) {
        state.error = `Personagem com ID ${characterId} não encontrado ou não é conjurador`;
        return;
      }

      const pf = character.spellcasting.spellPoints;
      character.spellcasting.spellPoints.current = Math.min(
        pf.max,
        pf.current + amount
      );
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Reseta PF para 0 (início de combate)
     */
    resetSpellPoints: (
      state,
      action: PayloadAction<{ characterId: string }>
    ) => {
      const { characterId } = action.payload;
      const character = state.entities[characterId];
      if (!character || !character.spellcasting) {
        state.error = `Personagem com ID ${characterId} não encontrado ou não é conjurador`;
        return;
      }

      character.spellcasting.spellPoints.current = 0;
      character.updatedAt = new Date().toISOString();
      state.error = null;
    },

    /**
     * Lança feitiço por círculo — aplica custo de PF e PP
     * 1º Círculo: 0 PF mas exige PP ≥ 1
     */
    castSpell: (
      state,
      action: PayloadAction<{
        characterId: string;
        circle: SpellCircle;
      }>
    ) => {
      const { characterId, circle } = action.payload;
      const character = state.entities[characterId];
      if (!character || !character.spellcasting) {
        state.error = `Personagem com ID ${characterId} não encontrado ou não é conjurador`;
        return;
      }

      const pp = character.combat.pp;
      const pf = character.spellcasting.spellPoints;
      const cost = SPELL_CIRCLE_PF_COST[circle];

      // Verificações
      if (pp.current <= 0) {
        state.error = 'Esgotado — não pode conjurar com 0 PP';
        return;
      }

      if (cost > 0) {
        if (pf.current < cost) {
          state.error = `PF insuficiente para ${circle}º Círculo (atual: ${pf.current}, custo: ${cost})`;
          return;
        }
        if (pp.current < cost) {
          state.error = `PP insuficiente para ${circle}º Círculo (atual: ${pp.current}, custo: ${cost})`;
          return;
        }
        // Gastar PF e PP
        character.spellcasting.spellPoints.current = Math.max(
          0,
          pf.current - cost
        );
        character.combat.pp.current = Math.max(0, pp.current - cost);
      }
      // 1º Círculo: 0 PF cost, mas PP ≥ 1 já verificado acima

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
      action.payload.characters.forEach((character) => {
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
  levelUp,
  addCraft,
  updateCraft,
  removeCraft,
  toggleCaster,
  setCastingSkill,
  spendSpellPoints,
  generateSpellPoints,
  resetSpellPoints,
  castSpell,
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
