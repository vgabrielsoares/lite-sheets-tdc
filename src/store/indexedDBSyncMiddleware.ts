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
 * - `characters/addCharacter` - Cria novo personagem no IndexedDB
 * - `characters/updateCharacter` - Atualiza personagem existente
 * - `characters/removeCharacter` - Remove personagem do IndexedDB
 * - `characters/setCharacters` - Substitui todos os personagens (bulk)
 *
 * **Nota:** As oper ações assíncronas (thunks) já lidam com IndexedDB
 * diretamente, então não precisam de sincronização adicional.
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
        case 'characters/addCharacter': {
          // Adicionar personagem ao IndexedDB
          const character = action.payload as Character;
          await characterService.create(character);
          console.log(`✅ Personagem "${character.name}" salvo no IndexedDB`);
          break;
        }

        case 'characters/updateCharacter': {
          // Atualizar personagem no IndexedDB
          const character = action.payload as Character;
          await characterService.update(character.id, character);
          console.log(
            `✅ Personagem "${character.name}" atualizado no IndexedDB`
          );
          break;
        }

        case 'characters/removeCharacter': {
          // Remover personagem do IndexedDB
          const characterId = action.payload as string;
          await characterService.delete(characterId);
          console.log(`✅ Personagem removido do IndexedDB`);
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

          // Adicionar novos personagens
          await Promise.all(
            characters.map((char: Character) => characterService.create(char))
          );

          console.log(
            `✅ ${characters.length} personagens sincronizados com IndexedDB`
          );
          break;
        }

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
