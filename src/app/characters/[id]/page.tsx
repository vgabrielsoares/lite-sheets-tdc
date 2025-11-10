'use client';

import { useRouter, useParams } from 'next/navigation';
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

  /**
   * Atualiza os dados do personagem
   */
  const handleUpdate = (updates: Partial<Character>) => {
    if (!character) return;

    dispatch(
      updateCharacter({
        id: character.id,
        updates: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  };

  // Loading state (caso o personagem ainda não esteja carregado)
  if (!character) {
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

  return (
    <AppLayout maxWidth={false}>
      <CharacterSheet character={character} onUpdate={handleUpdate} />
    </AppLayout>
  );
}
