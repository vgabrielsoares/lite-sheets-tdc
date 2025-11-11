'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import { CharacterSheet } from '@/components/character';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCharacterById,
  updateCharacter,
} from '@/features/characters/charactersSlice';
import type { Character } from '@/types';

/**
 * Página de visualização de ficha de personagem
 *
 * Exibe a ficha completa do personagem com sistema de abas,
 * permitindo visualização e edição de todos os dados.
 *
 * Implementa o layout base da ficha conforme Issue 3.1 da FASE 3.
 */
export default function CharacterDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params?.id as string;

  const character = useAppSelector((state) => selectCharacterById(state, id));

  // Estado local para manter o personagem e evitar flash de loading
  const [loadedCharacter, setLoadedCharacter] = useState<Character | null>(
    null
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Atualiza o estado local quando o personagem muda
  useEffect(() => {
    if (character) {
      setLoadedCharacter(character);
      setIsInitialLoad(false);
    }
  }, [character]);

  /**
   * Atualiza os dados do personagem
   */
  const handleUpdate = (updates: Partial<Character>) => {
    if (!loadedCharacter) return;

    dispatch(
      updateCharacter({
        id: loadedCharacter.id,
        updates: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  };

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
