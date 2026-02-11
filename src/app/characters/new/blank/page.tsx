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
 * Página de criação de ficha em branco
 *
 * Apenas solicita o nome do personagem e cria a ficha
 * com valores padrão de nível 1 conforme as regras do RPG.
 *
 * Valores padrão aplicados automaticamente:
 * - 15 GA (Guarda) máximo e atual
 * - 5 PV (Vitalidade) máximo e atual
 * - 2 PP (Pontos de Poder) máximo e atual
 * - Todos os atributos em 1
 * - Proficiência com Armas Simples
 * - Idioma Comum
 * - Inventário inicial: Mochila, Cartão do Banco, 10 PO$
 */
export default function BlankCharacterPage() {
  return (
    <AppLayout maxWidth="md">
      <CharacterCreationForm />
    </AppLayout>
  );
}
