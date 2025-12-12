'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * GitHub Pages Redirect Handler
 *
 * Componente que restaura a rota original após um redirect 404 do GitHub Pages.
 * Isso permite que links diretos (como /characters/abc123) funcionem corretamente
 * mesmo em um site estático.
 */
export default function GitHubPagesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se há uma rota salva de um redirect 404
    const redirectPath = sessionStorage.getItem('redirectPath');

    if (redirectPath) {
      console.log('GitHub Pages redirect detectado:', redirectPath);

      // Limpar o sessionStorage
      sessionStorage.removeItem('redirectPath');

      // Restaurar a rota original
      router.replace(redirectPath);
    }
  }, [router]);

  return null;
}
