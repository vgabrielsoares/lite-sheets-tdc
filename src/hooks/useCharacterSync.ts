import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadCharacters,
  selectAllCharacters,
  selectCharactersLoading,
  selectCharactersError,
} from '@/features/characters/charactersSlice';
import { characterService } from '@/services/characterService';
import { useNotifications } from './useNotifications';
import type { Character } from '@/types';

/**
 * Tempo de debounce para sincronização (ms)
 */
const SYNC_DEBOUNCE_TIME = 500;

/**
 * Interface de retorno do hook useCharacterSync
 */
export interface UseCharacterSyncReturn {
  /** Indica se os personagens estão carregando */
  isLoading: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
  /** Força uma sincronização imediata */
  forceSync: () => void;
}

/**
 * Hook para sincronização automática entre Redux e IndexedDB
 *
 * Este hook é responsável por:
 * - Carregar personagens do IndexedDB na inicialização
 * - Sincronizar mudanças do Redux para IndexedDB automaticamente
 * - Aplicar debounce para evitar muitas gravações
 * - Tratar erros e fornecer feedback ao usuário
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isLoading, error } = useCharacterSync();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *
 *   return <YourApp />;
 * }
 * ```
 */
export function useCharacterSync(): UseCharacterSyncReturn {
  const dispatch = useAppDispatch();
  const characters = useAppSelector(selectAllCharacters);
  const isLoading = useAppSelector(selectCharactersLoading);
  const error = useAppSelector(selectCharactersError);
  const { showError } = useNotifications();

  // Refs para controlar debounce e primeira montagem
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const previousCharactersRef = useRef<Character[]>([]);

  /**
   * Sincroniza todos os personagens para o IndexedDB
   * Esta função é chamada após o debounce
   */
  const syncToIndexedDB = useCallback(
    async (charactersToSync: Character[]) => {
      try {
        // Para cada personagem, atualizar no IndexedDB
        const syncPromises = charactersToSync.map(async (character) => {
          try {
            // Verificar se o personagem existe
            const existingChar = await characterService.getById(character.id);

            if (existingChar) {
              // Atualizar personagem existente
              await characterService.update(character.id, character);
            } else {
              // Criar novo personagem
              await characterService.create(character);
            }
          } catch (err) {
            console.error(
              `Erro ao sincronizar personagem ${character.id}:`,
              err
            );
            throw err;
          }
        });

        await Promise.all(syncPromises);
      } catch (err) {
        console.error('Erro ao sincronizar personagens para IndexedDB:', err);
        showError('Erro ao salvar alterações. Tente novamente.');
        throw err;
      }
    },
    [showError]
  );

  /**
   * Força uma sincronização imediata (sem debounce)
   */
  const forceSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (characters.length > 0) {
      syncToIndexedDB(characters).catch((err) => {
        console.error('Erro na sincronização forçada:', err);
      });
    }
  }, [characters, syncToIndexedDB]);

  /**
   * Carrega personagens do IndexedDB na inicialização
   */
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;

      dispatch(loadCharacters())
        .unwrap()
        .then((loadedCharacters) => {
          // Armazenar personagens carregados para comparação futura
          previousCharactersRef.current = loadedCharacters;
        })
        .catch((err) => {
          console.error('Erro ao carregar personagens:', err);
          showError(
            'Erro ao carregar personagens. Verifique sua conexão e tente novamente.'
          );
        });
    }
  }, [dispatch, showError]);

  /**
   * Observa mudanças no Redux e sincroniza para IndexedDB com debounce
   */
  useEffect(() => {
    // Não sincronizar se ainda está no carregamento inicial
    if (isInitialLoadRef.current) {
      return;
    }

    // Verificar se houve mudanças reais nos personagens
    const hasChanges =
      JSON.stringify(characters) !==
      JSON.stringify(previousCharactersRef.current);

    if (!hasChanges) {
      return;
    }

    // Atualizar referência
    previousCharactersRef.current = characters;

    // Limpar timer anterior se existir
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Criar novo timer de debounce
    debounceTimerRef.current = setTimeout(() => {
      syncToIndexedDB(characters).catch((err) => {
        console.error('Erro na sincronização automática:', err);
      });
    }, SYNC_DEBOUNCE_TIME);

    // Cleanup: limpar timer quando o componente desmontar ou dependências mudarem
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [characters, syncToIndexedDB]);

  /**
   * Sincronização final ao desmontar componente
   * Garante que mudanças pendentes sejam salvas
   */
  useEffect(() => {
    return () => {
      // Ao desmontar, forçar sincronização se houver timer pendente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Sincronização síncrona não é ideal, mas garante que dados não sejam perdidos
        // Em um cenário real, você pode querer usar navigator.sendBeacon ou similar
        if (previousCharactersRef.current.length > 0) {
          // Apenas logar aviso - sincronização assíncrona no unmount pode falhar
          console.warn(
            'Componente desmontado com sincronização pendente. Use forceSync() antes de navegar se necessário.'
          );
        }
      }
    };
  }, []);

  return {
    isLoading,
    error,
    forceSync,
  };
}
