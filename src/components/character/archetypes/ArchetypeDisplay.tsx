'use client';

import { useMemo } from 'react';
import { Alert, Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArchetypeCard from './ArchetypeCard';
import { Archetype, ArchetypeName } from '@/types/character';
import { Attributes } from '@/types/attributes';
import {
  ARCHETYPE_LIST,
  ARCHETYPE_LABELS,
  ARCHETYPE_GA_ATTRIBUTE,
  ARCHETYPE_PP_BASE_PER_LEVEL,
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
  /** Atributos do personagem (para calcular GA/PP) */
  attributes: Attributes;
}

/**
 * Calcula o GA total ganho por arquétipos
 *
 * GA = Σ(nível_arquétipo × atributo_relevante_do_arquétipo)
 * Cada arquétipo usa um atributo diferente para calcular GA.
 */
export function calculateArchetypeGA(
  archetypes: Archetype[],
  attributes: Attributes
): number {
  return archetypes.reduce((total, arch) => {
    const attrKey = ARCHETYPE_GA_ATTRIBUTE[arch.name];
    const attrValue = attrKey ? attributes[attrKey] : 0;
    return total + arch.level * attrValue;
  }, 0);
}

/**
 * @deprecated Usar calculateArchetypeGA que usa o atributo correto por arquétipo
 */
export function calculateArchetypeHP(
  archetypes: Archetype[],
  constituicao: number
): number {
  return calculateArchetypeGA(archetypes, {
    agilidade: constituicao,
    corpo: constituicao,
    influencia: constituicao,
    mente: constituicao,
    essencia: constituicao,
    instinto: constituicao,
  } as Attributes);
}

/**
 * Calcula o PP total ganho por arquétipos
 *
 * PP = Σ(nível_arquétipo × (PP_base_arquétipo + Essência))
 */
export function calculateArchetypePP(
  archetypes: Archetype[],
  essencia: number
): number {
  return archetypes.reduce((total, arch) => {
    const basePP = ARCHETYPE_PP_BASE_PER_LEVEL[arch.name] ?? 0;
    return total + arch.level * (basePP + essencia);
  }, 0);
}

/**
 * Calcula o breakdown detalhado de GA por arquétipo
 */
export function calculateArchetypeGABreakdown(
  archetypes: Archetype[],
  attributes: Attributes
): ArchetypeResourceBreakdown[] {
  return archetypes
    .filter((arch) => arch.level > 0)
    .map((arch) => {
      const attrKey = ARCHETYPE_GA_ATTRIBUTE[arch.name];
      const attrValue = attrKey ? attributes[attrKey] : 0;
      const total = arch.level * attrValue;
      return {
        name: arch.name,
        label: ARCHETYPE_LABELS[arch.name],
        level: arch.level,
        basePerLevel: 0,
        attributeBonus: attrValue,
        total,
      };
    });
}

/**
 * @deprecated Usar calculateArchetypeGABreakdown
 */
export function calculateArchetypeHPBreakdown(
  archetypes: Archetype[],
  constituicao: number
): ArchetypeResourceBreakdown[] {
  return calculateArchetypeGABreakdown(archetypes, {
    agilidade: constituicao,
    corpo: constituicao,
    influencia: constituicao,
    mente: constituicao,
    essencia: constituicao,
    instinto: constituicao,
  } as Attributes);
}

/**
 * Calcula o breakdown detalhado de PP por arquétipo
 */
export function calculateArchetypePPBreakdown(
  archetypes: Archetype[],
  essencia: number
): ArchetypeResourceBreakdown[] {
  return archetypes
    .filter((arch) => arch.level > 0)
    .map((arch) => {
      const basePP = ARCHETYPE_PP_BASE_PER_LEVEL[arch.name] ?? 0;
      const total = arch.level * (basePP + essencia);
      return {
        name: arch.name,
        label: ARCHETYPE_LABELS[arch.name],
        level: arch.level,
        basePerLevel: basePP,
        attributeBonus: essencia,
        total,
      };
    });
}

/**
 * ArchetypeDisplay - Exibe todos os arquétipos (somente leitura)
 *
 * Níveis de arquétipo são gerenciados exclusivamente pelo LevelUpModal.
 */
export default function ArchetypeDisplay({
  archetypes,
  characterLevel,
  attributes,
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

  // Calcular GA e PP totais baseados nos arquétipos
  const totalGA = useMemo(
    () => calculateArchetypeGA(archetypes, attributes),
    [archetypes, attributes]
  );

  const totalPP = useMemo(
    () => calculateArchetypePP(archetypes, attributes.essencia),
    [archetypes, attributes.essencia]
  );

  // Handler removed — archetype levels are managed exclusively via LevelUpModal

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
              color={availableLevels > 0 ? 'warning.main' : 'text.secondary'}
              fontWeight="medium"
            >
              {availableLevels > 0
                ? `${availableLevels} nível(is) pendente(s)`
                : 'Todos os níveis distribuídos'}
            </Typography>
          </Stack>

          {/* GA e PP calculados */}
          <Stack direction="row" spacing={3}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ShieldIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body1" fontWeight="medium">
                +{totalGA} GA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (atributo)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FlashOnIcon sx={{ color: 'info.main' }} />
              <Typography variant="body1" fontWeight="medium">
                +{totalPP} PP
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (base + ESS)
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Alerta se houver níveis pendentes */}
      {availableLevels > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Você tem <strong>{availableLevels}</strong> nível(is) pendente(s).
          Suba de nível pela aba Principal para distribuir nos arquétipos.
        </Alert>
      )}

      {/* Alerta se houver níveis em excesso */}
      {availableLevels < 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Você distribuiu <strong>{Math.abs(availableLevels)}</strong> nível(is)
          a mais do que o permitido! Ajuste os arquétipos.
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
          <ArchetypeCard key={name} name={name} level={archetypeLevels[name]} />
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
