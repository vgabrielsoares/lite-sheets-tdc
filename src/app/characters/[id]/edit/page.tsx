'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Página de edição de personagem
 *
 * No MVP 1, a edição acontece direto na página de visualização.
 * Esta rota simplesmente redireciona para a página de visualização.
 */
export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de visualização
    router.replace(`/characters/${id}`);
  }, [id, router]);

  return null;
}
