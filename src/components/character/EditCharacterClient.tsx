'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EditCharacterClientProps {
  characterId: string;
}

/**
 * Componente Client para edição de personagem
 *
 * No MVP 1, a edição acontece direto na página de visualização.
 * Esta rota simplesmente redireciona para a página de visualização.
 */
export default function EditCharacterClient({
  characterId,
}: EditCharacterClientProps) {
  const router = useRouter();
  const id = characterId;

  useEffect(() => {
    if (id) {
      // Redirecionar para a página de visualização
      router.replace(`/characters?id=${id}`);
    }
  }, [id, router]);

  return null;
}
