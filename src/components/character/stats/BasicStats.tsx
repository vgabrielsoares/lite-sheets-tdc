'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import type { Character, ArchetypeName } from '@/types';
import { EditableText, EditableNumber } from '@/components/shared';
import { ARCHETYPE_LABELS } from '@/constants/archetypes';
import { canLevelUp, getXPForNextLevel } from '@/constants/progression';
import LevelUpModal from '@/components/character/LevelUpModal';
import type { LevelUpSpecialGain } from '@/utils/levelUpCalculations';
import { LevelUpIndicator } from '@/components/character/LevelUpIndicator';

/**
 * Cor do chip baseada no arquétipo (mesmo padrão da aba de arquétipos)
 */
const getArchetypeColor = (name: ArchetypeName): string => {
  switch (name) {
    case 'academico':
      return '#5C6BC0'; // Indigo
    case 'acolito':
      return '#AB47BC'; // Purple
    case 'combatente':
      return '#EF5350'; // Red
    case 'feiticeiro':
      return '#42A5F5'; // Blue
    case 'ladino':
      return '#66BB6A'; // Green
    case 'natural':
      return '#8D6E63'; // Brown
    default:
      return '#78909C'; // Grey
  }
};

export interface BasicStatsProps {
  /**
   * Dados do personagem
   */
  character: Character;

  /**
   * Callback para atualizar o personagem
   */
  onUpdate: (updates: Partial<Character>) => void;

  /**
   * Callback para abrir sidebar de linhagem
   */
  onOpenLineage?: () => void;

  /**
   * Callback para abrir sidebar de origem
   */
  onOpenOrigin?: () => void;

  /**
   * Callback para abrir sidebar de tamanho
   */
  onOpenSize?: () => void;

  /**
   * Callback para confirmar level up (arquétipo + ganhos especiais)
   */
  onLevelUp?: (
    archetypeName: ArchetypeName,
    specialGains: LevelUpSpecialGain[]
  ) => void;
}

/**
 * Componente de Stats Básicos do Personagem
 *
 * Exibe e permite edição de:
 * - Nome do personagem
 * - Nome do jogador
 * - Linhagem (clicável para sidebar)
 * - Origem (clicável para sidebar)
 * - Nível
 * - XP
 *
 * Layout: 3 colunas x 2 linhas
 * - Linha 1: Nome do Personagem | Linhagem | Origem
 * - Linha 2: Nome do Jogador | Nível | XP
 *
 * @example
 * ```tsx
 * <BasicStats
 *   character={character}
 *   onUpdate={handleUpdate}
 *   onOpenLineage={() => setSidebarOpen('lineage')}
 *   onOpenOrigin={() => setSidebarOpen('origin')}
 *   onOpenSize={() => setSidebarOpen('size')}
 * />
 * ```
 */
export const BasicStats = React.memo(function BasicStats({
  character,
  onUpdate,
  onOpenLineage,
  onOpenOrigin,
  onOpenSize,
  onLevelUp,
}: BasicStatsProps) {
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);

  // Total de níveis distribuídos em arquétipos
  const totalArchetypeLevels = useMemo(
    () =>
      (character.archetypes ?? []).reduce(
        (sum, arch) => sum + (arch.level ?? 0),
        0
      ),
    [character.archetypes]
  );

  // Nível mínimo = max(0, total de níveis de arquétipos)
  const minLevel = useMemo(
    () => Math.max(0, totalArchetypeLevels),
    [totalArchetypeLevels]
  );

  // Verifica se o personagem pode subir de nível
  const isReadyToLevelUp = useMemo(
    () => canLevelUp(character.experience.current, character.level),
    [character.experience.current, character.level]
  );

  // XP necessário para o próximo nível (auto-calculado)
  const xpForNextLevel = useMemo(
    () => getXPForNextLevel(character.level),
    [character.level]
  );

  /**
   * Handler para mudança manual de nível.
   * Se o nível aumenta e onLevelUp existe, abre o LevelUpModal.
   * Se o nível diminui, aplica diretamente (respeitando o mínimo).
   */
  const handleLevelChange = useCallback(
    (newLevel: number) => {
      if (newLevel > character.level && onLevelUp) {
        // Abre o modal de level up ao invés de mudar diretamente
        setLevelUpModalOpen(true);
      } else if (newLevel < character.level) {
        // Permite reduzir se não violar mínimo de arquétipos
        onUpdate({ level: Math.max(newLevel, minLevel) });
      }
      // Se newLevel === character.level, não faz nada
    },
    [character.level, onLevelUp, onUpdate, minLevel]
  );

  const handleOpenLevelUp = useCallback(() => {
    setLevelUpModalOpen(true);
  }, []);

  const handleCloseLevelUp = useCallback(() => {
    setLevelUpModalOpen(false);
  }, []);

  const handleConfirmLevelUp = useCallback(
    (archetypeName: ArchetypeName, specialGains: LevelUpSpecialGain[]) => {
      onLevelUp?.(archetypeName, specialGains);
      setLevelUpModalOpen(false);
    },
    [onLevelUp]
  );

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PersonIcon />
          Informações Básicas
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Grid 3x2: Linha 1 - Nome, Linhagem, Origem */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Nome do Personagem */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <EditableText
              value={character.name}
              onChange={(name) => onUpdate({ name })}
              label="Nome do Personagem"
              placeholder="Digite o nome do personagem"
              variant="h5"
              required
              validate={(value) => {
                if (!value.trim()) return 'Nome obrigatório';
                if (value.length > 100)
                  return 'Nome muito longo (máx. 100 caracteres)';
                return null;
              }}
            />
          </Box>

          {/* Linhagem */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: onOpenLineage ? 'primary.main' : 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              cursor: onOpenLineage ? 'pointer' : 'default',
              transition: 'all 0.15s ease-in-out',
              '&:hover': onOpenLineage
                ? {
                    borderColor: 'primary.dark',
                    bgcolor: 'action.hover',
                  }
                : {},
            }}
            onClick={onOpenLineage}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="caption" color="text.secondary">
                Linhagem
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color={character.lineage?.name ? 'text.primary' : 'text.disabled'}
            >
              {character.lineage?.name || 'Nenhuma'}
            </Typography>
          </Box>

          {/* Origem */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: onOpenOrigin ? 'primary.main' : 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              cursor: onOpenOrigin ? 'pointer' : 'default',
              transition: 'all 0.15s ease-in-out',
              '&:hover': onOpenOrigin
                ? {
                    borderColor: 'primary.dark',
                    bgcolor: 'action.hover',
                  }
                : {},
            }}
            onClick={onOpenOrigin}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HomeIcon color="primary" />
              <Typography variant="caption" color="text.secondary">
                Origem
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color={character.origin?.name ? 'text.primary' : 'text.disabled'}
            >
              {character.origin?.name || 'Nenhuma'}
            </Typography>
          </Box>
        </Box>

        {/* Grid 3x2: Linha 2 - Jogador, Nível, XP */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Nome do Jogador */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <EditableText
              value={character.playerName || ''}
              onChange={(playerName) => onUpdate({ playerName })}
              label="Nome do Jogador"
              placeholder="Digite o nome do jogador"
              variant="h6"
              validate={(value) => {
                if (value.length > 100)
                  return 'Nome muito longo (máx. 100 caracteres)';
                return null;
              }}
            />
          </Box>

          {/* Nível */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="caption" color="text.secondary">
                Nível do Personagem
              </Typography>
            </Box>
            <EditableNumber
              value={character.level}
              onChange={handleLevelChange}
              variant="h4"
              min={minLevel}
              max={30}
              validate={(value) => {
                if (value < minLevel) return `Nível mínimo: ${minLevel}`;
                if (value > 30) return 'Nível máximo: 30';
                return null;
              }}
            />
            {/* Botão de Level Up com pulso/brilho */}
            {isReadyToLevelUp && onLevelUp && (
              <LevelUpIndicator
                currentXP={character.experience.current}
                level={character.level}
                onLevelUp={handleOpenLevelUp}
                compact
              />
            )}
          </Box>

          {/* Experiência (XP) */}
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StarIcon color="warning" />
              <Typography variant="caption" color="text.secondary">
                Experiência (XP)
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}
            >
              <EditableNumber
                value={character.experience.current}
                onChange={(current) =>
                  onUpdate({
                    experience: {
                      ...character.experience,
                      current,
                      toNextLevel: xpForNextLevel,
                    },
                  })
                }
                variant="h4"
                min={0}
              />
              <Typography variant="body2" color="text.secondary">
                /
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                title="XP necessário para o próximo nível (calculado automaticamente)"
              >
                {xpForNextLevel}
              </Typography>
            </Box>
            {/* XP Progress Bar + Level Up Indicator */}
            <LevelUpIndicator
              currentXP={character.experience.current}
              level={character.level}
              onLevelUp={onLevelUp ? handleOpenLevelUp : undefined}
            />
          </Box>
        </Box>

        {/* Arquétipos do Personagem */}
        {character.archetypes.filter((a) => a.level > 0).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
            >
              <CategoryIcon color="primary" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Arquétipos
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {character.archetypes
                .filter((archetype) => archetype.level > 0)
                .map((archetype) => (
                  <Chip
                    key={archetype.name}
                    label={`${ARCHETYPE_LABELS[archetype.name]} ${archetype.level}`}
                    size="small"
                    sx={{
                      bgcolor: getArchetypeColor(archetype.name),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        px: 1.5,
                      },
                    }}
                  />
                ))}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Modal de Level Up */}
      <LevelUpModal
        open={levelUpModalOpen}
        onClose={handleCloseLevelUp}
        character={character}
        onConfirm={handleConfirmLevelUp}
      />
    </Card>
  );
});

// Display name para debugging
BasicStats.displayName = 'BasicStats';
