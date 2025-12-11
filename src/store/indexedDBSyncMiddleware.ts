/**
 * IndexedDB Sync Middleware
 *
 * Middleware que sincroniza automaticamente mudanças do Redux store
 * com o IndexedDB através do characterService.
 *
 * Este middleware intercepta as actions de modificação de personagens
 * e garante que as mudanças sejam persistidas no IndexedDB.
 */

import type { Middleware } from '@reduxjs/toolkit';
import { characterService } from '@/services/characterService';
import { db } from '@/services/db';
import type { Character } from '@/types';
import type { RootState } from './index';

/**
 * Type guard para verificar se a action tem type e payload
 */
function isActionWithPayload<T = any>(
  action: unknown
): action is { type: string; payload: T } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    'payload' in action
  );
}

/**
 * Middleware de sincronização com IndexedDB
 *
 * Intercepta actions de modificação de personagens e persiste
 * automaticamente as mudanças no IndexedDB.
 *
 * **Actions sincronizadas:**
 * - `characters/removeCharacter` - Remove personagem do IndexedDB (síncrona)
 * - `characters/setCharacters` - Substitui todos os personagens (bulk)
 *
 * **Nota:** Os thunks assíncronos (addCharacter, updateCharacter, deleteCharacter)
 * já lidam com IndexedDB diretamente, então não precisam de sincronização adicional.
 */
export const indexedDBSyncMiddleware: Middleware<{}, RootState> =
  (store) => (next) => async (action) => {
    // Passa a action adiante primeiro (atualiza o state)
    const result = next(action);

    // Verificar se é uma action com payload
    if (!isActionWithPayload(action)) {
      return result;
    }

    // Depois sincroniza com IndexedDB (fire-and-forget)
    try {
      switch (action.type) {
        case 'characters/removeCharacter': {
          // Remover personagem do IndexedDB (ação síncrona)
          const characterId = action.payload as string;
          await characterService.delete(characterId);
          console.log(`✅ Personagem removido do IndexedDB (sync)`);
          break;
        }

        case 'characters/setCharacters': {
          // Substituir todos os personagens (útil para importação)
          const characters = action.payload as Character[];

          // Limpar todos os personagens existentes
          const existing = await characterService.getAll();
          await Promise.all(
            existing.map((char) => characterService.delete(char.id))
          );

          // Adicionar novos personagens preservando IDs originais
          // Usamos bulkPut ao invés de create para preservar os IDs
          await db.characters.bulkPut(characters);

          console.log(
            `✅ ${characters.length} personagens sincronizados com IndexedDB`
          );
          break;
        }

        // As ações fulfilled dos thunks NÃO precisam de sync, pois
        // os thunks já salvaram no IndexedDB antes de retornar
        case 'characters/addCharacter/fulfilled':
        case 'characters/updateCharacter/fulfilled':
        case 'characters/deleteCharacter/fulfilled':
          console.log(`ℹ️ ${action.type} - Já sincronizado pelo thunk`);
          break;

        default:
          // Outras actions não precisam de sincronização
          break;
      }
    } catch (error) {
      // Logar erro mas não bloquear o fluxo
      console.error('❌ Erro ao sincronizar com IndexedDB:', error);
      // TODO: Considerar adicionar uma notification de erro ao usuário
    }

    return result;
  };
