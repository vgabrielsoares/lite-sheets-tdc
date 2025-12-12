'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CharacterSheet } from '@/components/character';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useNotifications } from '@/hooks/useNotifications';
import {
  selectCharacterById,
  loadCharacterById,
  updateCharacter,
  clearError,
} from '@/features/characters/charactersSlice';
import type { Character } from '@/types';

interface CharacterDetailClientProps {
  characterId: string;
}

/**
 * Componente Client para visualização de ficha de personagem
 *
 * Exibe a ficha completa do personagem com sistema de abas,
 * permitindo visualização e edição de todos os dados.
 *
 * Implementa o layout base da ficha conforme Issue 3.1 da FASE 3.
 */
export default function CharacterDetailClient({
  characterId,
}: CharacterDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useNotifications();
  const id = characterId;

  const character = useAppSelector((state) => selectCharacterById(state, id));
  const loading = useAppSelector((state) => state.characters.loading);
  const error = useAppSelector((state) => state.characters.error);

  // Estado local para manter o personagem e evitar flash de loading
  const [loadedCharacter, setLoadedCharacter] = useState<Character | null>(
    null
  );
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Carregar personagem do IndexedDB se não estiver no Redux (APENAS UMA VEZ)
  useEffect(() => {
    // Se já temos o personagem no Redux, não precisa carregar
    if (character) {
      setLoadedCharacter(character);
      setLoadAttempted(true);
      return;
    }

    // Se já tentamos carregar ou está carregando, não tenta novamente
    if (loadAttempted || loading) {
      return;
    }

    // Carregar do IndexedDB
    setLoadAttempted(true);
    dispatch(loadCharacterById(id))
      .unwrap()
      .catch((err) => {
        console.error('❌ [CharacterDetail] Erro ao carregar:', err);
      });
  }, [character, id, dispatch, loadAttempted, loading]);

  // Atualiza o estado local quando o personagem muda
  useEffect(() => {
    if (character) {
      setLoadedCharacter(character);
    }
  }, [character]);

  // Se não encontrou o personagem após carregar, redirecionar para home
  useEffect(() => {
    if (!loadedCharacter && loadAttempted && !loading) {
      showError('Personagem não encontrado');
      // Redirecionar para a home após 1 segundo
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loadedCharacter, loadAttempted, loading, router, showError]);

  /**
   * Atualiza os dados do personagem
   * Memoizado para evitar re-criação em cada render
   */
  const handleUpdate = useCallback(
    async (updates: Partial<Character>) => {
      if (!loadedCharacter) return;

      try {
        // Limpa erros anteriores
        dispatch(clearError());

        // Atualiza o personagem
        await dispatch(
          updateCharacter({
            id: loadedCharacter.id,
            updates: {
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          })
        ).unwrap();

        // Sucesso (opcional - pode remover se muito verboso)
        // showSuccess('Personagem atualizado com sucesso!');
      } catch (error) {
        // Captura o erro e exibe notificação
        console.error('❌ ERRO ao atualizar personagem:', error);
        showError(
          'Erro ao salvar as alterações. Verifique os dados e tente novamente.'
        );

        // Limpa o erro do state para não bloquear a UI
        setTimeout(() => {
          dispatch(clearError());
        }, 100);
      }
    },
    [loadedCharacter, dispatch, showError]
  );

  // Loading state
  if (!loadedCharacter && (loading || !loadAttempted)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Carregando personagem...</Typography>
      </Box>
    );
  }

  // Se não encontrou o personagem após carregar
  if (!loadedCharacter && loadAttempted && !loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h5">Personagem não encontrado</Typography>
        <Typography color="text.secondary">
          Redirecionando para a página inicial...
        </Typography>
      </Box>
    );
  }

  return (
    <CharacterSheet character={loadedCharacter!} onUpdate={handleUpdate} />
  );
}
