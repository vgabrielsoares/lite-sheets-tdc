import AppLayout from '@/components/layout/AppLayout';
import CharacterList from '@/components/character-list/CharacterList';

/**
 * Página inicial do aplicativo - Lista de fichas de personagens
 *
 * Esta é a home page que exibe todas as fichas criadas pelo usuário.
 * Se não houver fichas, exibe um estado vazio com prompt para criar a primeira.
 */
export default function Home() {
  return (
    <AppLayout maxWidth="lg">
      <CharacterList />
    </AppLayout>
  );
}
