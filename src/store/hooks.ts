/**
 * Redux Typed Hooks
 *
 * Hooks tipados do Redux para uso em toda a aplicação.
 * Utilizar estes hooks ao invés de useDispatch e useSelector padrão
 * para garantir tipagem correta.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Hook useDispatch tipado
 *
 * Utilize este hook ao invés de useDispatch do react-redux
 * para garantir tipagem correta do dispatch.
 *
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * dispatch(addCharacter(newCharacter));
 * ```
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Hook useSelector tipado
 *
 * Utilize este hook ao invés de useSelector do react-redux
 * para garantir tipagem correta do estado.
 *
 * @example
 * ```tsx
 * const characters = useAppSelector(selectAllCharacters);
 * const themeMode = useAppSelector(selectThemeMode);
 * ```
 */
export const useAppSelector = useSelector.withTypes<RootState>();
