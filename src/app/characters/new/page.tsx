'use client';

import AppLayout from '@/components/layout/AppLayout';
import { CharacterCreationForm } from '@/components/character';

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
