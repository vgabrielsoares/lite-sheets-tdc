import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadCharacters,
  selectCharactersLoading,
  selectCharactersError,
} from '@/features/characters/charactersSlice';
import { useNotifications } from './useNotifications';

/**
 * Tempo de debounce para sincronização (ms)
 * @deprecated Não mais utilizado - thunks fazem sincronização direta
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
 * - **NÃO sincroniza mudanças** (os thunks já fazem isso)
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
  const isLoading = useAppSelector(selectCharactersLoading);
  const error = useAppSelector(selectCharactersError);
  const { showError } = useNotifications();

  // Ref para controlar primeira montagem
  const isInitialLoadRef = useRef(true);

  /**
   * Força uma sincronização imediata (não faz nada, mantido para compatibilidade)
   * @deprecated Os thunks já fazem a sincronização automaticamente
   */
  const forceSync = useCallback(() => {
    console.warn(
      'forceSync() está deprecated - os thunks já fazem a sincronização'
    );
  }, []);

  /**
   * Carrega personagens do IndexedDB na inicialização
   */
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;

      dispatch(loadCharacters())
        .unwrap()
        .catch((err) => {
          console.error('Erro ao carregar personagens:', err);
          showError(
            'Erro ao carregar personagens. Verifique sua conexão e tente novamente.'
          );
        });
    }
  }, [dispatch, showError]);

  return {
    isLoading,
    error,
    forceSync,
  };
}
