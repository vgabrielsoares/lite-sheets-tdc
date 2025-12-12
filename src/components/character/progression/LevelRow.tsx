'use client';

/**
 * LevelRow - Linha individual da tabela de progressão
 *
 * Exibe os ganhos de um nível específico, incluindo:
 * - Ganhos de arquétipo
 * - Ganhos de classe
 * - PV/PP ganhos
 * - Características desbloqueadas
 */

import React, { useState } from 'react';
import {
  Box,
  Collapse,
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Shield as ShieldIcon,
  Favorite as FavoriteIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';
import {
  ARCHETYPE_LEVEL_GAINS,
  type ArchetypeLevelGainType,
} from '@/constants/archetypes';
import { CLASS_LEVEL_GAINS, type ClassGainType } from '@/constants/classes';

/**
 * Props do componente LevelRow
 */
interface LevelRowProps {
  /** Nível a ser exibido */
  level: number;
  /** Se é o nível atual do personagem */
  isCurrentLevel: boolean;
  /** Função para destacar o nível atual */
  onLevelClick?: (level: number) => void;
}

/**
 * Cores para cada tipo de ganho de arquétipo
 */
const ARCHETYPE_GAIN_COLORS: Record<
  ArchetypeLevelGainType,
  'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
> = {
  caracteristica: 'primary',
  poder: 'secondary',
  competencia: 'success',
  atributo: 'warning',
  grau_habilidade: 'info',
  defesa_etapa: 'error',
};

/**
 * Cores para cada tipo de ganho de classe
 */
const CLASS_GAIN_COLORS: Record<
  ClassGainType,
  'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
> = {
  habilidade: 'info',
  melhoria: 'secondary',
  defesa: 'warning',
  proficiencia: 'success',
};

/**
 * Labels curtos para tipos de ganho de arquétipo
 */
const ARCHETYPE_GAIN_SHORT_LABELS: Record<ArchetypeLevelGainType, string> = {
  caracteristica: 'Característica',
  poder: 'Poder',
  competencia: 'Competência',
  atributo: '+1 Atributo',
  grau_habilidade: 'Grau Habilidade',
  defesa_etapa: 'Defesa p/ Etapa',
};

/**
 * Labels curtos para tipos de ganho de classe
 */
const CLASS_GAIN_SHORT_LABELS: Record<ClassGainType, string> = {
  habilidade: 'Habilidade',
  melhoria: 'Melhoria',
  defesa: 'Defesa p/ Etapa',
  proficiencia: 'Proficiência',
};

/**
 * Componente LevelRow
 */
export default function LevelRow({
  level,
  isCurrentLevel,
  onLevelClick,
}: LevelRowProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Obtém ganhos de arquétipo para este nível
  const archetypeGains = ARCHETYPE_LEVEL_GAINS.filter(
    (gain) => gain.level === level
  );

  // Obtém ganhos de classe para este nível
  const classGains = CLASS_LEVEL_GAINS.filter((gain) => gain.level === level);

  // Verifica se há algum ganho neste nível
  const hasGains = archetypeGains.length > 0 || classGains.length > 0;

  // Estilo para nível atual
  const currentLevelStyle = isCurrentLevel
    ? {
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(212, 175, 55, 0.15)'
            : 'rgba(94, 44, 4, 0.08)',
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      }
    : {};

  return (
    <>
      <TableRow
        sx={{
          ...currentLevelStyle,
          cursor: hasGains ? 'pointer' : 'default',
          '&:hover': hasGains
            ? {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
              }
            : {},
        }}
        onClick={() => hasGains && setExpanded(!expanded)}
      >
        {/* Nível */}
        <TableCell
          sx={{
            fontWeight: isCurrentLevel ? 700 : 500,
            color: isCurrentLevel
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {isCurrentLevel && (
              <StarIcon
                fontSize="small"
                sx={{ color: theme.palette.primary.main }}
              />
            )}
            <Typography variant="body1" fontWeight={isCurrentLevel ? 700 : 500}>
              {level}
            </Typography>
          </Stack>
        </TableCell>

        {/* Ganhos de Arquétipo */}
        <TableCell>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {archetypeGains.length > 0 ? (
              archetypeGains.map((gain, idx) => (
                <Chip
                  key={`arch-${gain.type}-${idx}`}
                  label={ARCHETYPE_GAIN_SHORT_LABELS[gain.type]}
                  size="small"
                  color={ARCHETYPE_GAIN_COLORS[gain.type]}
                  variant="outlined"
                  icon={<AutoAwesomeIcon fontSize="small" />}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}
          </Stack>
        </TableCell>

        {/* Ganhos de Classe */}
        <TableCell>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {classGains.length > 0 ? (
              classGains.map((gain, idx) => (
                <Chip
                  key={`class-${gain.type}-${idx}`}
                  label={CLASS_GAIN_SHORT_LABELS[gain.type]}
                  size="small"
                  color={CLASS_GAIN_COLORS[gain.type]}
                  variant="outlined"
                  icon={<ShieldIcon fontSize="small" />}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}
          </Stack>
        </TableCell>

        {/* PV/PP (mostrado apenas como indicador - valores reais dependem do arquétipo) */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<FavoriteIcon fontSize="small" />}
              label="+PV"
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip
              icon={<FlashOnIcon fontSize="small" />}
              label="+PP"
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        </TableCell>

        {/* Botão expandir */}
        <TableCell align="right" sx={{ width: 48 }}>
          {hasGains && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {/* Linha expandida com detalhes */}
      {hasGains && (
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              py: 0,
              borderBottom: expanded ? undefined : 'none',
            }}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, px: 1 }}>
                {/* Detalhes de Arquétipo */}
                {archetypeGains.length > 0 && (
                  <Box sx={{ mb: classGains.length > 0 ? 2 : 0 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      sx={{
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <AutoAwesomeIcon fontSize="small" />
                      Ganhos de Arquétipo
                    </Typography>
                    <Stack spacing={1}>
                      {archetypeGains.map((gain, idx) => (
                        <Box
                          key={`detail-arch-${idx}`}
                          sx={{
                            pl: 2,
                            borderLeft: `3px solid ${theme.palette[ARCHETYPE_GAIN_COLORS[gain.type]].main}`,
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {gain.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gain.description}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Detalhes de Classe */}
                {classGains.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="info.main"
                      sx={{
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <ShieldIcon fontSize="small" />
                      Ganhos de Classe
                    </Typography>
                    <Stack spacing={1}>
                      {classGains.map((gain, idx) => (
                        <Box
                          key={`detail-class-${idx}`}
                          sx={{
                            pl: 2,
                            borderLeft: `3px solid ${theme.palette[CLASS_GAIN_COLORS[gain.type]].main}`,
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {gain.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gain.description}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Nota sobre PV/PP */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    💡 <strong>PV ganho:</strong> Base do arquétipo +
                    Constituição | <strong>PP ganho:</strong> Base do arquétipo
                    + Presença
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
