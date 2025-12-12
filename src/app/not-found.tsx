'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página 404 - Fallback para rotas dinâmicas
 *
 * Com output: export no GitHub Pages, rotas dinâmicas não são pré-geradas.
 * Esta página captura tentativas de acessar rotas dinâmicas e faz
 * client-side routing para a rota correta dentro da SPA.
 *
 * Especialmente importante para links diretos como /characters/abc123
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Capturar o caminho atual da URL
    const path = window.location.pathname;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // Remover basePath se presente
    const cleanPath =
      basePath && path.startsWith(basePath)
        ? path.slice(basePath.length)
        : path;

    console.log('404 interceptado:', { path, basePath, cleanPath });

    // Se a rota parece ser de personagem, redirecionar com query params
    const characterMatch = cleanPath.match(/^\/characters\/([^/]+)\/?$/);
    const editMatch = cleanPath.match(/^\/characters\/([^/]+)\/edit\/?$/);

    if (characterMatch) {
      const characterId = characterMatch[1];
      console.log('Rota de personagem detectada, redirecionando:', characterId);
      router.replace(`/characters?id=${characterId}`);
    } else if (editMatch) {
      const characterId = editMatch[1];
      console.log('Rota de edição detectada, redirecionando:', characterId);
      router.replace(`/characters?id=${characterId}&edit=true`);
    } else {
      // Para outras rotas 404, redirecionar para home após 2 segundos
      console.log('Rota não encontrada, redirecionando para home em 2s');
      const timeout = setTimeout(() => {
        router.replace('/');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        Página não encontrada
      </p>
      <p style={{ fontSize: '14px', color: '#666' }}>Redirecionando...</p>
    </div>
  );
}
