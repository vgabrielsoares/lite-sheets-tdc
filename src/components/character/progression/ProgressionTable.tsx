'use client';

/**
 * ProgressionTable - Tabela de progressão por nível
 *
 * Exibe uma tabela mostrando os ganhos por nível (1-15 padrão),
 * com possibilidade de expandir até nível 30 ou níveis customizados 31+.
 */

import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Divider,
  useTheme,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  InfoOutlined as InfoIcon,
  AutoAwesome as ArchetypeIcon,
  Shield as ClassIcon,
  Shield as ShieldIcon,
  FlashOn as PPIcon,
} from '@mui/icons-material';
import LevelRow from './LevelRow';

/**
 * Props do componente ProgressionTable
 */
interface ProgressionTableProps {
  /** Nível atual do personagem */
  currentLevel: number;
  /** Callback quando um nível é clicado */
  onLevelClick?: (level: number) => void;
}

/**
 * Nível máximo padrão
 */
const DEFAULT_MAX_LEVEL = 15;

/**
 * Componente ProgressionTable
 */
export default function ProgressionTable({
  currentLevel,
  onLevelClick,
}: ProgressionTableProps) {
  const theme = useTheme();

  // Mostrar apenas 15 níveis
  const levels = Array.from({ length: DEFAULT_MAX_LEVEL }, (_, i) => i + 1);

  return (
    <Box id="section-progression">
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" color="primary">
          Tabela de Progressão
        </Typography>
      </Stack>

      {/* Informação sobre o sistema */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          A cada nível, você ganha benefícios de <strong>Arquétipo</strong>{' '}
          (baseado no arquétipo escolhido) e, se tiver uma classe, benefícios de{' '}
          <strong>Classe</strong>. GA e PP são ganhos a cada nível baseados no
          arquétipo escolhido.
        </Typography>
      </Alert>

      {/* Tabela de progressão */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          maxHeight: 500,
          overflow: 'auto',
          borderColor:
            theme.palette.mode === 'dark'
              ? 'rgba(212, 175, 55, 0.3)'
              : 'rgba(94, 44, 4, 0.2)',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.grey[100],
                }}
              >
                Nível
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.grey[100],
                }}
              >
                Arquétipo
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.grey[100],
                }}
              >
                Classe
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.grey[100],
                }}
              >
                GA/PP
              </TableCell>
              <TableCell
                sx={{
                  width: 48,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : theme.palette.grey[100],
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {levels.map((level) => (
              <LevelRow
                key={level}
                level={level}
                isCurrentLevel={level === currentLevel}
                onLevelClick={onLevelClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legenda */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Legenda
        </Typography>

        <Stack spacing={2}>
          {/* Ganhos de Arquétipo */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ArchetypeIcon fontSize="small" color="primary" />
              Ganhos de Arquétipo
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>Característica</strong> (nív. 1, 5, 10, 15)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Poder / Talento</strong> (nív. 2, 3, 4, 6, 7, 8, 9, 11,
                12, 13, 14)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Competência</strong> (nív. 5, 10, 15)
              </Typography>
            </Stack>
          </Box>

          {/* Ganhos de Classe */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ClassIcon fontSize="small" color="info" />
              Ganhos de Classe
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>Habilidade</strong> (nív. 1, 5, 10, 15)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Melhoria</strong> (nív. 7, 9, 14)
              </Typography>
            </Stack>
          </Box>

          {/* GA/PP */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ShieldIcon fontSize="small" color="primary" />
              <PPIcon fontSize="small" color="info" />
              GA/PP por Nível
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>GA:</strong> Atributo relevante do arquétipo (Combatente
                = Corpo, Ladino = Agilidade, Acadêmico = Mente, Feiticeiro =
                Essência, Acólito = Influência, Natural = Instinto)
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                <strong>PP:</strong> Base do arquétipo + Essência (Feiticeiro
                +5, Acadêmico +4, Acólito/Natural +3, Ladino +2, Combatente +1)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
