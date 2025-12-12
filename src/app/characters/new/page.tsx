'use client';

import dynamic from 'next/dynamic';

// Importa o formulário de criação com SSR desabilitado
const CharacterCreationForm = dynamic(
  () =>
    import('@/components/character').then((mod) => ({
      default: mod.CharacterCreationForm,
    })),
  { ssr: false }
);

const AppLayout = dynamic(() => import('@/components/layout/AppLayout'), {
  ssr: false,
});

/**
 * Página de criação de nova ficha de personagem
 *
 * No MVP 1, apenas solicita o nome do personagem e cria a ficha
 * com valores padrão de nível 1 conforme as regras do RPG.
 *
 * Valores padrão aplicados automaticamente:
 * - 15 PV máximo e atual
 * - 2 PP máximo e atual
 * - Todos os atributos em 1
 * - Proficiência com Armas Simples
 * - Idioma Comum
 * - Inventário inicial: Mochila, Cartão do Banco, 10 PO$
 */
export default function NewCharacterPage() {
  return (
    <AppLayout maxWidth="md">
      <CharacterCreationForm />
    </AppLayout>
  );
}
