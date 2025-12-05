'use client';

/**
 * ProgressionTable - Tabela de progressão por nível
 *
 * Exibe uma tabela mostrando os ganhos por nível (1-15 padrão),
 * com possibilidade de expandir até nível 30 ou níveis customizados 31+.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Collapse,
  Divider,
  useTheme,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  InfoOutlined as InfoIcon,
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
 * Nível máximo expandido
 */
const EXPANDED_MAX_LEVEL = 30;

/**
 * Componente ProgressionTable
 */
export default function ProgressionTable({
  currentLevel,
  onLevelClick,
}: ProgressionTableProps) {
  const theme = useTheme();
  const [showExtendedLevels, setShowExtendedLevels] = useState(false);
  const [showCustomLevels, setShowCustomLevels] = useState(false);

  // Determina quantos níveis mostrar
  const maxLevelToShow = showCustomLevels
    ? Math.max(EXPANDED_MAX_LEVEL, currentLevel + 5)
    : showExtendedLevels
      ? EXPANDED_MAX_LEVEL
      : DEFAULT_MAX_LEVEL;

  // Gera array de níveis
  const levels = Array.from({ length: maxLevelToShow }, (_, i) => i + 1);

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
          <strong>Classe</strong>. PV e PP são ganhos a cada nível baseados no
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
                PV/PP
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

      {/* Botões para expandir níveis */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        {!showExtendedLevels && !showCustomLevels && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExpandMoreIcon />}
            onClick={() => setShowExtendedLevels(true)}
          >
            Mostrar níveis 16-30
          </Button>
        )}

        {showExtendedLevels && !showCustomLevels && (
          <>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowExtendedLevels(false)}
            >
              Mostrar apenas 1-15
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExpandMoreIcon />}
              onClick={() => setShowCustomLevels(true)}
            >
              Mostrar níveis 31+
            </Button>
          </>
        )}

        {showCustomLevels && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setShowCustomLevels(false);
              setShowExtendedLevels(false);
            }}
          >
            Mostrar apenas 1-15
          </Button>
        )}
      </Stack>

      {/* Legenda */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Legenda
        </Typography>

        <Stack spacing={2}>
          {/* Ganhos de Arquétipo */}
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
              📜 Ganhos de Arquétipo
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>Característica</strong> (nív. 1, 5, 10, 15)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Poder</strong> (nív. 2, 4, 6, 8, 9, 11, 13, 14)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Competência</strong> (nív. 3, 7, 12)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>+1 Atributo</strong> (nív. 4, 8, 13)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Grau de Habilidade</strong> (nív. 5, 9, 14)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Defesa por Etapa</strong> (nív. 5, 10, 15)
              </Typography>
            </Stack>
          </Box>

          {/* Ganhos de Classe */}
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
              🛡️ Ganhos de Classe
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>Habilidade</strong> (nív. 1, 5, 10, 15)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Melhoria</strong> (nív. 7, 9, 14)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Defesa por Etapa</strong> (nív. 5, 10, 15)
              </Typography>
            </Stack>
          </Box>

          {/* PV/PP */}
          <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
              ❤️⚡ PV/PP por Nível
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">
                <strong>PV:</strong> Base do arquétipo + Constituição
                (Combatente +5, Ladino +4, Natural/Acólito +3, Acadêmico +2,
                Feiticeiro +1)
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
                <strong>PP:</strong> Base do arquétipo + Presença (Feiticeiro
                +5, Acadêmico +4, Acólito/Natural +3, Ladino +2, Combatente +1)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Nota sobre níveis altos */}
      {(showExtendedLevels || showCustomLevels) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Níveis 16+:</strong> Os ganhos seguem o mesmo padrão cíclico
            dos níveis 1-15. Consulte seu narrador para regras específicas de
            níveis elevados.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
