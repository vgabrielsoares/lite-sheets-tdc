'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CharacterDetailClient from '@/components/character/CharacterDetailClient';
import EditCharacterClient from '@/components/character/EditCharacterClient';
import CharacterList from '@/components/character-list/CharacterList';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

/**
 * Página de Characters - Client-Side Router
 *
 * Esta página gerencia todas as rotas de personagens usando client-side routing.
 * Necessário porque output: export não suporta rotas dinâmicas verdadeiras.
 *
 * Rotas suportadas:
 * - /characters -> Lista de personagens
 * - /characters/[id] -> Visualização de personagem
 * - /characters/[id]/edit -> Edição de personagem
 * - /characters/new -> Criação de personagem
 */
export default function CharactersRouter() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dar tempo para o client-side router se estabilizar
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  // Extrair characterId dos query parameters
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const characterId = searchParams?.get('id') || null;
  const editParam = searchParams?.get('edit');
  const isEditRoute = editParam === 'true';

  console.log('CharactersRouter - Estado:', {
    pathname,
    characterId,
    isEditRoute,
    search: typeof window !== 'undefined' ? window.location.search : 'SSR',
  });

  // Verificar se é rota de novo personagem
  const isNewRoute = pathname.includes('/new');

  // Se for rota de novo personagem, redirecionar para a página de nova ficha
  if (isNewRoute || characterId === 'new') {
    // Esta rota já existe como /characters/new/page.tsx
    return null;
  }

  // Se tem ID e é rota de edição
  if (characterId && isEditRoute) {
    return <EditCharacterClient characterId={characterId} />;
  }

  // Se tem ID, mostrar detalhe do personagem
  if (characterId && characterId !== 'placeholder') {
    return <CharacterDetailClient characterId={characterId} />;
  }

  // Caso contrário, mostrar lista de personagens
  return (
    <AppLayout>
      <CharacterList />
    </AppLayout>
  );
}
