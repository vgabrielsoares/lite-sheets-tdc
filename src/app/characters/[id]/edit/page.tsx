'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Página de edição de personagem
 *
 * No MVP 1, a edição acontece direto na página de visualização.
 * Esta rota simplesmente redireciona para a página de visualização.
 */
export default function EditCharacterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      // Redirecionar para a página de visualização
      router.replace(`/characters/${id}`);
    }
  }, [id, router]);

  return null;
}
