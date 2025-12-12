'use client';

import { Box } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import { CharacterList } from '@/components/character-list';

/**
 * Página principal - Lista de personagens
 *
 * Exibe todos os personagens salvos localmente no IndexedDB.
 * Se não houver personagens, mostra um estado vazio com
 * instruções para criar o primeiro personagem.
 */
export default function HomePage() {
  return (
    <AppLayout maxWidth="lg">
      <CharacterList />
    </AppLayout>
  );
}
