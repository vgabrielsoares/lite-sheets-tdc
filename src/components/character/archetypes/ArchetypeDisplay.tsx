'use client';

import { useMemo } from 'react';
import { Alert, Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArchetypeCard from './ArchetypeCard';
import { Archetype, ArchetypeName } from '@/types/character';
import { Attributes } from '@/types/attributes';
import {
  ARCHETYPE_LIST,
  ARCHETYPE_LABELS,
  ARCHETYPE_HP_PER_LEVEL,
  ARCHETYPE_PP_PER_LEVEL,
} from '@/constants/archetypes';

/**
 * Breakdown de PV/PP por arquétipo
 */
export interface ArchetypeResourceBreakdown {
  /** Nome do arquétipo */
  name: ArchetypeName;
  /** Label amigável */
  label: string;
  /** Nível no arquétipo */
  level: number;
  /** Valor base por nível */
  basePerLevel: number;
  /** Bônus de atributo por nível */
  attributeBonus: number;
  /** Total para este arquétipo */
  total: number;
}

interface ArchetypeDisplayProps {
  /** Arquétipos do personagem */
  archetypes: Archetype[];
  /** Nível total do personagem */
  characterLevel: number;
  /** Atributos do personagem (para calcular PV/PP) */
  attributes: Attributes;
  /** Callback quando um arquétipo é alterado */
  onArchetypeChange: (archetypes: Archetype[]) => void;
  /** Se a edição está desabilitada */
  disabled?: boolean;
}

/**
 * Calcula o PV total ganho por arquétipos
 *
 * PV = Σ(nível_arquétipo × (PV_base_arquétipo + Constituição))
 */
export function calculateArchetypeHP(
  archetypes: Archetype[],
  constituicao: number
): number {
  return archetypes.reduce((total, arch) => {
    const baseHP = ARCHETYPE_HP_PER_LEVEL[arch.name] ?? 0;
    return total + arch.level * (baseHP + constituicao);
  }, 0);
}

/**
 * Calcula o PP total ganho por arquétipos
 *
 * PP = Σ(nível_arquétipo × (PP_base_arquétipo + Presença))
 */
export function calculateArchetypePP(
  archetypes: Archetype[],
  presenca: number
): number {
  return archetypes.reduce((total, arch) => {
    const basePP = ARCHETYPE_PP_PER_LEVEL[arch.name] ?? 0;
    return total + arch.level * (basePP + presenca);
  }, 0);
}

/**
 * Calcula o breakdown detalhado de PV por arquétipo
 */
export function calculateArchetypeHPBreakdown(
  archetypes: Archetype[],
  constituicao: number
): ArchetypeResourceBreakdown[] {
  return archetypes
    .filter((arch) => arch.level > 0)
    .map((arch) => {
      const basePerLevel = ARCHETYPE_HP_PER_LEVEL[arch.name] ?? 0;
      const total = arch.level * (basePerLevel + constituicao);
      return {
        name: arch.name,
        label: ARCHETYPE_LABELS[arch.name],
        level: arch.level,
        basePerLevel,
        attributeBonus: constituicao,
        total,
      };
    });
}

/**
 * Calcula o breakdown detalhado de PP por arquétipo
 */
export function calculateArchetypePPBreakdown(
  archetypes: Archetype[],
  presenca: number
): ArchetypeResourceBreakdown[] {
  return archetypes
    .filter((arch) => arch.level > 0)
    .map((arch) => {
      const basePerLevel = ARCHETYPE_PP_PER_LEVEL[arch.name] ?? 0;
      const total = arch.level * (basePerLevel + presenca);
      return {
        name: arch.name,
        label: ARCHETYPE_LABELS[arch.name],
        level: arch.level,
        basePerLevel,
        attributeBonus: presenca,
        total,
      };
    });
}

/**
 * ArchetypeDisplay - Exibe todos os arquétipos e permite distribuir níveis
 */
export default function ArchetypeDisplay({
  archetypes,
  characterLevel,
  attributes,
  onArchetypeChange,
  disabled = false,
}: ArchetypeDisplayProps) {
  const theme = useTheme();

  // Criar mapa de níveis por arquétipo
  const archetypeLevels = useMemo(() => {
    const map: Record<ArchetypeName, number> = {
      academico: 0,
      acolito: 0,
      combatente: 0,
      feiticeiro: 0,
      ladino: 0,
      natural: 0,
    };
    archetypes.forEach((arch) => {
      map[arch.name] = arch.level;
    });
    return map;
  }, [archetypes]);

  // Calcular níveis totais distribuídos
  const totalDistributedLevels = useMemo(() => {
    return Object.values(archetypeLevels).reduce(
      (sum, level) => sum + level,
      0
    );
  }, [archetypeLevels]);

  // Níveis disponíveis para distribuir
  const availableLevels = characterLevel - totalDistributedLevels;

  // Calcular PV e PP totais baseados nos arquétipos
  const totalHP = useMemo(
    () => calculateArchetypeHP(archetypes, attributes.constituicao),
    [archetypes, attributes.constituicao]
  );

  const totalPP = useMemo(
    () => calculateArchetypePP(archetypes, attributes.presenca),
    [archetypes, attributes.presenca]
  );

  // Handler para mudança de nível em um arquétipo
  const handleLevelChange = (name: ArchetypeName, newLevel: number) => {
    const updatedArchetypes = ARCHETYPE_LIST.map((archName) => {
      const currentArch = archetypes.find((a) => a.name === archName);
      if (archName === name) {
        return {
          name: archName,
          level: newLevel,
          features: currentArch?.features ?? [],
        };
      }
      return currentArch ?? { name: archName, level: 0, features: [] };
    }).filter((arch) => arch.level > 0);

    // Se o novo nível for 0, não incluir o arquétipo
    if (newLevel === 0) {
      onArchetypeChange(updatedArchetypes);
    } else {
      // Verificar se já existe, senão adicionar
      const existingIndex = updatedArchetypes.findIndex((a) => a.name === name);
      if (existingIndex === -1) {
        updatedArchetypes.push({ name, level: newLevel, features: [] });
      }
      onArchetypeChange(updatedArchetypes);
    }
  };

  return (
    <Box>
      {/* Cabeçalho com resumo */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          {/* Nível total e níveis disponíveis */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <EmojiEventsIcon sx={{ color: 'warning.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Nível {characterLevel}
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              color={availableLevels > 0 ? 'success.main' : 'text.secondary'}
              fontWeight="medium"
            >
              {availableLevels > 0
                ? `${availableLevels} nível(is) para distribuir`
                : 'Todos os níveis distribuídos'}
            </Typography>
          </Stack>

          {/* PV e PP calculados */}
          <Stack direction="row" spacing={3}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FavoriteIcon sx={{ color: 'error.main' }} />
              <Typography variant="body1" fontWeight="medium">
                +{totalHP} PV
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (base + CON)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FlashOnIcon sx={{ color: 'info.main' }} />
              <Typography variant="body1" fontWeight="medium">
                +{totalPP} PP
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (base + PRE)
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Alerta se houver níveis para distribuir */}
      {availableLevels > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Você tem <strong>{availableLevels}</strong> nível(is) para distribuir
          entre os arquétipos. Clique nos botões + para adicionar níveis.
        </Alert>
      )}

      {/* Alerta se houver níveis em excesso */}
      {availableLevels < 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Você distribuiu <strong>{Math.abs(availableLevels)}</strong> nível(is)
          a mais do que o permitido! Remova níveis dos arquétipos.
        </Alert>
      )}

      {/* Grid de arquétipos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {ARCHETYPE_LIST.map((name) => (
          <ArchetypeCard
            key={name}
            name={name}
            level={archetypeLevels[name]}
            availableLevels={availableLevels}
            onLevelChange={handleLevelChange}
            disabled={disabled}
          />
        ))}
      </Box>

      {/* Resumo dos arquétipos ativos */}
      {archetypes.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Arquétipos Ativos
          </Typography>
          <Typography variant="body2">
            {archetypes
              .filter((a) => a.level > 0)
              .map((a) => `${ARCHETYPE_LABELS[a.name]} ${a.level}`)
              .join(' / ')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
