'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import type { Character } from '@/types';
import { EditableText, EditableNumber } from '@/components/shared';

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
 * @example
 * ```tsx
 * <BasicStats
 *   character={character}
 *   onUpdate={handleUpdate}
 *   onOpenLineage={() => setSidebarOpen('lineage')}
 *   onOpenOrigin={() => setSidebarOpen('origin')}
 * />
 * ```
 */
export function BasicStats({
  character,
  onUpdate,
  onOpenLineage,
  onOpenOrigin,
}: BasicStatsProps) {
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

        <Stack spacing={3}>
          {/* Nome do Personagem e Jogador */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
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
          </Box>

          {/* Linhagem e Origem */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: onOpenLineage ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                cursor: onOpenLineage ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': onOpenLineage
                  ? {
                      borderColor: 'primary.dark',
                      bgcolor: 'action.hover',
                    }
                  : {},
              }}
              onClick={onOpenLineage}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <AutoAwesomeIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Linhagem
                  {onOpenLineage && ' (clique para detalhes)'}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                color={
                  character.lineage?.name ? 'text.primary' : 'text.disabled'
                }
              >
                {character.lineage?.name || 'Nenhuma linhagem definida'}
              </Typography>
              {character.lineage?.size && (
                <Chip
                  label={`Tamanho: ${character.lineage.size}`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: onOpenOrigin ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                cursor: onOpenOrigin ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': onOpenOrigin
                  ? {
                      borderColor: 'primary.dark',
                      bgcolor: 'action.hover',
                    }
                  : {},
              }}
              onClick={onOpenOrigin}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <HomeIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Origem
                  {onOpenOrigin && ' (clique para detalhes)'}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                color={
                  character.origin?.name ? 'text.primary' : 'text.disabled'
                }
              >
                {character.origin?.name || 'Nenhuma origem definida'}
              </Typography>
            </Box>
          </Box>

          {/* Nível e XP */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <TrendingUpIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Nível do Personagem
                </Typography>
              </Box>
              <EditableNumber
                value={character.level}
                onChange={(level) => onUpdate({ level })}
                variant="h4"
                min={1}
                max={30}
                validate={(value) => {
                  if (value < 1) return 'Nível mínimo: 1';
                  if (value > 30) return 'Nível máximo: 30';
                  return null;
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <StarIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Experiência (XP)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <EditableNumber
                  value={character.experience.current}
                  onChange={(current) =>
                    onUpdate({
                      experience: {
                        ...character.experience,
                        current,
                      },
                    })
                  }
                  variant="h4"
                  min={0}
                />
                <Typography variant="body2" color="text.secondary">
                  / {character.experience.toNextLevel || '—'} XP
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
