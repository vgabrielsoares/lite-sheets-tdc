'use client';

import { Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import CharacterCard from './CharacterCard';
import EmptyState from './EmptyState';

/**
 * Componente principal de listagem de fichas de personagens
 *
 * Responsabilidades:
 * - Exibir estado vazio quando não há fichas
 * - Exibir grid de cards com informações básicas de cada ficha
 * - Prover navegação para criação e visualização de fichas
 *
 * Seguindo requisitos do MVP 1 (mvp-um.md):
 * - Lista de fichas na tela inicial
 * - Estado vazio com prompt de criação
 * - Informações básicas: nome, nível, linhagem, origem
 * - Cards clicáveis para navegação
 * - Grid responsivo (1 col mobile, 2-3 desktop)
 *
 * Seguindo princípios de boas práticas:
 * - DRY: Componentes reutilizáveis (CharacterCard, EmptyState)
 * - Modularização: Lógica separada em componentes específicos
 * - Acessibilidade: Feedback de loading, estados claros
 * - Responsividade: Grid adaptativo
 *
 * NOTA: O carregamento inicial de personagens deve ser feito na camada superior
 * (layout ou página), não neste componente de apresentação.
 */
export default function CharacterList() {
  const router = useRouter();
  const { characters, loading, error } = useAppSelector(
    (state) => state.characters
  );

  // Carregar personagens ao montar componente
  // REMOVIDO: useEffect(() => { dispatch(loadCharacters()); }, [dispatch]);
  // O carregamento será feito na camada de página/layout

  /**
   * Navega para página de criação de nova ficha
   */
  const handleCreateCharacter = () => {
    router.push('/characters/new');
  };

  /**
   * Navega para visualização de ficha específica
   */
  const handleViewCharacter = (characterId: string) => {
    router.push(`/characters/${characterId}`);
  };

  // Estado de carregamento
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
        role="status"
        aria-live="polite"
        aria-label="Carregando fichas"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 2,
          px: 2,
        }}
        role="alert"
      >
        <Typography variant="h5" color="error" gutterBottom>
          Erro ao carregar fichas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  // Estado vazio - nenhuma ficha criada ainda
  if (characters.length === 0) {
    return (
      <EmptyState
        title="Nenhuma ficha criada ainda"
        description="Comece sua jornada criando seu primeiro personagem para o Tabuleiro do Caos RPG"
        actionLabel="Criar Primeira Ficha"
        onAction={handleCreateCharacter}
      />
    );
  }

  // Lista de fichas existentes
  return (
    <Box sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header com título e botão de nova ficha */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, sm: 4 },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 600,
          }}
        >
          Minhas Fichas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCharacter}
          size="large"
          aria-label="Criar nova ficha"
        >
          Nova Ficha
        </Button>
      </Box>

      {/* Grid de cards de personagens */}
      <Grid
        container
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          // Garantir que cards tenham mesma altura
          '& .MuiGrid-item': {
            display: 'flex',
          },
        }}
      >
        {characters.map((character) => (
          <Grid key={character.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CharacterCard
              character={character}
              onClick={handleViewCharacter}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
