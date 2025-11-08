'use client';

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Add as AddIcon, PersonOutline } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

/**
 * Componente principal de listagem de fichas de personagens
 *
 * Exibe:
 * - Estado vazio com prompt para criar primeira ficha (se não houver fichas)
 * - Grid de cards com informações básicas de cada ficha
 * - Botão de ação flutuante para criar nova ficha
 */
export default function CharacterList() {
  const router = useRouter();
  const characters = useAppSelector((state) => state.characters.characters);

  const handleCreateCharacter = () => {
    router.push('/characters/new');
  };

  const handleViewCharacter = (id: string) => {
    router.push(`/characters/${id}`);
  };

  // Estado vazio - nenhuma ficha criada ainda
  if (characters.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <PersonOutline
          sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }}
        />

        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Nenhuma ficha criada ainda
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comece sua jornada criando seu primeiro personagem para o Tabuleiro
            do Caos RPG
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCreateCharacter}
          sx={{ px: 4, py: 1.5 }}
        >
          Criar Primeira Ficha
        </Button>
      </Box>
    );
  }

  // Lista de fichas existentes
  return (
    <Box sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Minhas Fichas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCharacter}
        >
          Nova Ficha
        </Button>
      </Box>

      <Grid container spacing={3}>
        {characters.map((character) => (
          <Grid key={character.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleViewCharacter(character.id)}
            >
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom noWrap>
                  {character.name || 'Sem nome'}
                </Typography>

                {character.playerName && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    noWrap
                  >
                    Jogador: {character.playerName}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Nível ${character.level}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {character.lineage?.name && (
                    <Chip
                      label={character.lineage.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {character.origin?.name && (
                    <Chip
                      label={character.origin.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    PV: {character.combat.hp.current}/{character.combat.hp.max}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PP: {character.combat.pp.current}/{character.combat.pp.max}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
