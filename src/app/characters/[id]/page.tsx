'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import AppLayout from '@/components/layout/AppLayout';
import { useAppSelector } from '@/store/hooks';

/**
 * Página de visualização de ficha de personagem
 *
 * Exibe todos os detalhes da ficha de um personagem específico.
 * No MVP 1, esta página será construída gradualmente conforme
 * os componentes de visualização forem desenvolvidos nas próximas fases.
 *
 * Por enquanto, exibe informações básicas do personagem.
 */
export default function CharacterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const character = useAppSelector((state) =>
    state.characters.characters.find((char) => char.id === id)
  );

  const handleBack = () => {
    router.push('/');
  };

  const handleEdit = () => {
    router.push(`/characters/${id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implementar confirmação e deleção
    console.log('Delete character:', id);
  };

  // Loading state (caso o personagem ainda não esteja carregado)
  if (!character) {
    return (
      <AppLayout maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Carregando personagem...</Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Button startIcon={<ArrowBack />} onClick={handleBack}>
            Voltar
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Deletar
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {character.name}
          </Typography>

          {character.playerName && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Jogador: {character.playerName}
            </Typography>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Informações Básicas
            </Typography>

            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nível
                </Typography>
                <Typography variant="h6">{character.level}</Typography>
              </Box>

              {character.lineage?.name && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Linhagem
                  </Typography>
                  <Typography variant="h6">{character.lineage.name}</Typography>
                </Box>
              )}

              {character.origin?.name && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Origem
                  </Typography>
                  <Typography variant="h6">{character.origin.name}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pontos de Vida (PV)
                </Typography>
                <Typography variant="h6">
                  {character.combat.hp.current} / {character.combat.hp.max}
                  {character.combat.hp.temporary > 0 &&
                    ` (+${character.combat.hp.temporary} temp)`}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pontos de Poder (PP)
                </Typography>
                <Typography variant="h6">
                  {character.combat.pp.current} / {character.combat.pp.max}
                  {character.combat.pp.temporary > 0 &&
                    ` (+${character.combat.pp.temporary} temp)`}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Em desenvolvimento:</strong> Esta página será expandida
              nas próximas fases com componentes para exibir atributos,
              habilidades, combate, inventário, feitiços e muito mais.
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </AppLayout>
  );
}
