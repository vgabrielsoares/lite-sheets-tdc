'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import { CharacterSheet } from '@/components/character';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useNotifications } from '@/hooks/useNotifications';
import {
  selectCharacterById,
  updateCharacter,
  clearError,
} from '@/features/characters/charactersSlice';
import type { Character } from '@/types';

/**
 * Componente Client para visualização de ficha de personagem
 *
 * Exibe a ficha completa do personagem com sistema de abas,
 * permitindo visualização e edição de todos os dados.
 *
 * Implementa o layout base da ficha conforme Issue 3.1 da FASE 3.
 */
export default function CharacterDetailClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params?.id as string;
  const { showError, showSuccess } = useNotifications();

  const character = useAppSelector((state) => selectCharacterById(state, id));
  const loading = useAppSelector((state) => state.characters.loading);

  // Estado local para manter o personagem e evitar flash de loading
  const [loadedCharacter, setLoadedCharacter] = useState<Character | null>(
    null
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Atualiza o estado local quando o personagem muda APENAS se não estiver em loading
  // Isso previne re-renders durante updates
  useEffect(() => {
    if (character && !loading) {
      setLoadedCharacter(character);
      setIsInitialLoad(false);
    } else if (character && isInitialLoad) {
      // Primeira carga - sempre atualiza
      setLoadedCharacter(character);
      setIsInitialLoad(false);
    }
  }, [character, loading, isInitialLoad]);

  /**
   * Atualiza os dados do personagem
   * Memoizado para evitar re-criação em cada render
   */
  const handleUpdate = useCallback(
    async (updates: Partial<Character>) => {
      if (!loadedCharacter) return;

      console.log('🔄 handleUpdate CHAMADO com updates:', updates);

      try {
        // Limpa erros anteriores
        dispatch(clearError());

        console.log('⏳ Disparando updateCharacter thunk...');

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

        console.log('✅ updateCharacter concluído com sucesso!');

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

  // Loading state (apenas no carregamento inicial)
  if (isInitialLoad && !loadedCharacter) {
    return (
      <AppLayout maxWidth="xl">
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
      </AppLayout>
    );
  }

  // Se não encontrou o personagem após carregar
  if (!isInitialLoad && !loadedCharacter) {
    return (
      <AppLayout maxWidth="xl">
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
          <Typography variant="h5">Personagem não encontrado</Typography>
          <Typography color="text.secondary">
            O personagem que você está procurando não existe.
          </Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth={false}>
      <CharacterSheet character={loadedCharacter!} onUpdate={handleUpdate} />
    </AppLayout>
  );
}
