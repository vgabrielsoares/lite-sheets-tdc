'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadCharacters } from '@/features/characters/charactersSlice';

/**
 * CharacterLoader
 *
 * Componente que carrega os personagens do IndexedDB ao iniciar a aplicação.
 * Deve ser incluído uma vez no layout raiz.
 *
 * **Responsabilidades:**
 * - Carregar personagens do IndexedDB ao montar
 * - Sincronizar estado do Redux com IndexedDB
 *
 * **Nota:** Este componente não renderiza nada visualmente.
 */
export default function CharacterLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Carregar personagens do IndexedDB ao montar
    dispatch(loadCharacters());
  }, [dispatch]);

  return <>{children}</>;
}
