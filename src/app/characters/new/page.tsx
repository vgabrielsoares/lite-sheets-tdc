'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  AutoFixHigh as WizardIcon,
} from '@mui/icons-material';

const AppLayout = dynamic(() => import('@/components/layout/AppLayout'), {
  ssr: false,
});

/**
 * Página de criação de nova ficha de personagem
 *
 * Oferece duas opções ao jogador:
 * 1. Ficha em Branco - Cria uma ficha vazia com valores padrão
 * 2. Passo a Passo - Wizard guiado de 9 passos para criar o personagem
 */
export default function NewCharacterPage() {
  const router = useRouter();

  const handleBlankSheet = () => {
    router.push('/characters/new/blank');
  };

  const handleWizard = () => {
    router.push('/characters/new/wizard');
  };

  const handleBack = () => {
    router.push('/characters');
  };

  return (
    <AppLayout maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Voltar
        </Button>

        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Criar Nova Ficha
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Escolha como você quer criar seu personagem:
        </Typography>

        <Grid container spacing={3}>
          {/* Opção 1: Passo a Passo (Recomendado) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                border: 2,
                borderColor: 'primary.main',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={handleWizard}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  p: 1,
                }}
              >
                <CardContent sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText',
                      }}
                    >
                      <WizardIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          Passo a Passo
                        </Typography>
                        <Chip
                          label="Recomendado"
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Criação guiada em 9 passos
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Um wizard interativo que te guia pela criação do personagem,
                    passo a passo. Ideal para quem quer garantir que não
                    esqueceu nada importante.
                  </Typography>

                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Define conceito, origem e linhagem
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Distribui atributos com visualização clara
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Escolhe arquétipo, habilidades e equipamentos
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Aplica ganhos de nível 1 automaticamente
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Salva progresso automaticamente
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Opção 2: Ficha em Branco */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={handleBlankSheet}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  p: 1,
                }}
              >
                <CardContent sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.600',
                      }}
                    >
                      <DescriptionIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Ficha em Branco
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Preencha como preferir
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Cria uma ficha com valores padrão de nível 1. Você preenche
                    os campos diretamente na ficha, do seu jeito.
                  </Typography>

                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Apenas nome do personagem necessário
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Valores padrão aplicados automaticamente
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Edite tudo diretamente na ficha
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Ideal para jogadores experientes
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
