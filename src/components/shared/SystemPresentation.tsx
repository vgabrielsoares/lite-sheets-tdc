'use client';

import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExploreIcon from '@mui/icons-material/Explore';
import CasinoIcon from '@mui/icons-material/Casino';
import ShieldIcon from '@mui/icons-material/Shield';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';

import {
  SYSTEM_NAME,
  RULEBOOK_VERSION,
  APP_VERSION,
} from '@/constants/version';

/**
 * Palavras-chave do sistema
 */
const SYSTEM_KEYWORDS = [
  'Alta Fantasia',
  'Dungeonpunk',
  'Sandbox',
  'Tático',
  'Narrativo',
  'Customização',
  'Semi Letal',
  'Gestão de Recursos',
  'Magitech',
];

/**
 * Pilares do sistema
 */
const SYSTEM_PILLARS = [
  { label: 'Exploração', icon: ExploreIcon },
  { label: 'Combate', icon: ShieldIcon },
  { label: 'Investigação', icon: AutoAwesomeIcon },
  { label: 'Interação Social', icon: AutoAwesomeIcon },
  { label: 'Descanso', icon: AutoAwesomeIcon },
  { label: 'Intervalo', icon: AutoAwesomeIcon },
];

/**
 * Componente de apresentação do sistema Tabuleiro do Caos RPG (v0.2)
 *
 * Exibe contextualização do universo, pilares e resumo das mecânicas.
 * Usado na landing page (estado vazio) para novos usuários.
 *
 * Conteúdo baseado no livro de regras v0.1.7.
 */
export default function SystemPresentation() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CasinoIcon
          color="primary"
          sx={{ fontSize: 48, mb: 1, opacity: 0.9 }}
        />
        <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
          {SYSTEM_NAME}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Sistema de fichas para o {SYSTEM_NAME} — livro v{RULEBOOK_VERSION}
        </Typography>

        {/* Keywords */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          useFlexGap
          sx={{ gap: 1 }}
        >
          {SYSTEM_KEYWORDS.map((word) => (
            <Chip
              key={word}
              label={word}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Stack>
      </Box>

      {/* Contextualização do Universo */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          O Universo
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.8 }}
        >
          No universo de {SYSTEM_NAME}, dois mundos se convergiram após uma
          grande guerra entre deuses. Um deles, o dos humanos, era desprovido de
          magia. O outro, lar de criaturas mágicas, era repleto de forças
          inimagináveis. Após séculos de conflito, os planetas passaram a viver
          em simbiose.
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.8 }}
        >
          Os deuses andam entre os mortais, e os mortais muitas vezes buscam
          ascender à posição dos deuses. Em um mundo perigoso, onde tudo é
          possível e nada é longe demais, as mais bravas pessoas triunfam ao
          conseguir trabalhos — desde tesouros amaldiçoados até cidades inteiras
          ameaçadas por males terríveis.
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', lineHeight: 1.8 }}
        >
          É seu papel, como aventureiro, desbravar cada canto escondido, cada
          item secreto e poderoso, derrotar cada monstro terrível. É seu papel
          fazer o que ninguém mais pode: ser o protagonista dessa história.
        </Typography>
      </Paper>

      {/* Pilares do Jogo */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Pilares do Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O sistema é feito para que os jogadores possam explorar cada um desses
          pilares por múltiplas sessões, com apoio do livro para que o conteúdo
          não se repita.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 1 }}
        >
          {SYSTEM_PILLARS.map((pillar) => (
            <Chip
              key={pillar.label}
              label={pillar.label}
              size="small"
              color="primary"
              variant="filled"
            />
          ))}
        </Stack>
      </Paper>

      {/* Mecânicas Resumidas */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Mecânicas Principais
        </Typography>
        <Box
          component="ul"
          sx={{
            pl: 2,
            m: 0,
            '& li': { mb: 1 },
          }}
        >
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>6 Atributos</strong>: Agilidade, Corpo, Influência, Mente,
            Essência e Instinto (0-5)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Dados em Pool</strong>: Role Xd6+ (atributo +
            modificadores), resultados ≥ 6 = sucesso (✶), resultado 1 cancela 1
            sucesso
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Proficiências por Dado</strong>: Leigo (d6), Adepto (d8),
            Versado (d10), Mestre (d12)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Saúde Dupla</strong>: Guarda (GA) absorve dano primeiro,
            depois Vitalidade (PV)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Ações em Combate</strong>: Turno Rápido (2▶) ou Lento (3▶)
            + 1 Reação (↩) + Ações Livres (∆)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Progressão por Arquétipos</strong>: 6 arquétipos combinados
            em Classes para personalização profunda
          </Typography>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Links para navegação */}
      <Box sx={{ textAlign: 'center' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <Button
            component={Link}
            href="/characters"
            variant="contained"
            startIcon={<PersonIcon />}
          >
            Minhas Fichas
          </Button>
          <Button
            component={Link}
            href="/help"
            variant="outlined"
            startIcon={<HelpOutlineIcon />}
          >
            Central de Ajuda
          </Button>
        </Stack>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Lite Sheets TDC v{APP_VERSION} • Livro v{RULEBOOK_VERSION}
        </Typography>
      </Box>
    </Box>
  );
}
