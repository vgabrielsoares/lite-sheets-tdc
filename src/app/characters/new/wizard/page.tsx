'use client';

import dynamic from 'next/dynamic';

// Importa o componente wizard com SSR desabilitado
const CharacterCreationWizard = dynamic(
  () =>
    import('@/components/character/wizard').then((mod) => ({
      default: mod.CharacterCreationWizard,
    })),
  { ssr: false }
);

const AppLayout = dynamic(() => import('@/components/layout/AppLayout'), {
  ssr: false,
});

/**
 * Página do wizard de criação de personagem
 *
 * Exibe o wizard passo a passo para criar um personagem completo.
 * Guia o jogador por 9 passos:
 * 1. Conceito - Nome e conceito do personagem
 * 2. Origem - Background e história
 * 3. Linhagem - Ancestralidade e raça
 * 4. Atributos - Distribuição de pontos
 * 5. Arquétipo - Arquétipo inicial
 * 6. Habilidades - Proficiências e assinatura
 * 7. Equipamentos - Itens iniciais
 * 8. Proficiências - Compra de proficiências
 * 9. Revisão - Revisar e criar
 */
export default function WizardPage() {
  return (
    <AppLayout maxWidth="lg">
      <CharacterCreationWizard />
    </AppLayout>
  );
}
