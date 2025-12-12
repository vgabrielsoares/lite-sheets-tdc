'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CharacterDetailClient from '@/components/character/CharacterDetailClient';
import EditCharacterClient from '@/components/character/EditCharacterClient';
import CharacterList from '@/components/character-list/CharacterList';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

/**
 * Componente interno que usa useSearchParams (deve estar dentro de Suspense)
 */
function CharactersRouterContent() {
  const searchParams = useSearchParams();
  const characterId = searchParams.get('id');
  const isEditRoute = searchParams.get('edit') === 'true';

  // Se tem ID e é rota de edição
  if (characterId && isEditRoute) {
    return <EditCharacterClient characterId={characterId} />;
  }

  // Se tem ID, mostrar detalhe do personagem
  if (characterId) {
    return <CharacterDetailClient characterId={characterId} />;
  }

  // Caso contrário, mostrar lista de personagens
  return <CharacterList />;
}

/**
 * Página de Characters - Client-Side Router
 *
 * Esta página gerencia todas as rotas de personagens usando client-side routing.
 * Necessário porque output: export não suporta rotas dinâmicas verdadeiras.
 *
 * Rotas suportadas:
 * - /characters -> Lista de personagens
 * - /characters?id=xxx -> Visualização de personagem
 * - /characters?id=xxx&edit=true -> Edição de personagem
 *
 * IMPORTANTE: useSearchParams requer Suspense boundary para evitar erros de hidratação
 */
export default function CharactersRouter() {
  return (
    <AppLayout>
      <Suspense
        fallback={
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
        }
      >
        <CharactersRouterContent />
      </Suspense>
    </AppLayout>
  );
}
