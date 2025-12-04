'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Button,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  FlashOn as MajorActionIcon,
  Speed as MinorActionIcon,
  Shield as DefensiveReactionIcon,
  Reply as ReactionIcon,
  AllInclusive as FreeActionIcon,
  PlayArrow as StartTurnIcon,
} from '@mui/icons-material';
import type { ActionEconomy as ActionEconomyType } from '@/types/combat';

export interface ActionEconomyProps {
  /** Estado atual da economia de ações */
  actionEconomy: ActionEconomyType;
  /** Callback para atualizar economia de ações */
  onChange: (actionEconomy: ActionEconomyType) => void;
}

/**
 * Componente que gerencia a Economia de Ações em combate
 *
 * O sistema Tabuleiro do Caos usa:
 * - 1 Ação Maior por turno
 * - 2 Ações Menores por turno
 * - 1 Reação por rodada
 * - 1 Reação Defensiva por rodada
 * - Ações Livres ilimitadas (apenas informativo)
 *
 * @example
 * ```tsx
 * <ActionEconomy
 *   actionEconomy={character.combat.actionEconomy}
 *   onChange={handleActionEconomyChange}
 * />
 * ```
 */
export function ActionEconomy({ actionEconomy, onChange }: ActionEconomyProps) {
  const theme = useTheme();

  /**
   * Alterna o estado de uma ação específica
   */
  const toggleAction = useCallback(
    (actionKey: keyof ActionEconomyType) => {
      onChange({
        ...actionEconomy,
        [actionKey]: !actionEconomy[actionKey],
      });
    },
    [actionEconomy, onChange]
  );

  /**
   * Reseta todas as ações para o início do turno
   * Cada personagem tem 1 turno por rodada, então reseta tudo
   */
  const resetTurn = useCallback(() => {
    onChange({
      majorAction: true,
      minorAction1: true,
      minorAction2: true,
      reaction: true,
      defensiveReaction: true,
    });
  }, [onChange]);

  /**
   * Conta quantas ações de turno estão disponíveis
   */
  const availableTurnActions =
    (actionEconomy.majorAction ? 1 : 0) +
    (actionEconomy.minorAction1 ? 1 : 0) +
    (actionEconomy.minorAction2 ? 1 : 0);

  /**
   * Conta quantas reações estão disponíveis
   */
  const availableReactions =
    (actionEconomy.reaction ? 1 : 0) +
    (actionEconomy.defensiveReaction ? 1 : 0);

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Economia de Ações
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${availableTurnActions}/3 Turno`}
              size="small"
              color={availableTurnActions === 0 ? 'default' : 'success'}
              variant={availableTurnActions === 0 ? 'outlined' : 'filled'}
            />
            <Chip
              label={`${availableReactions}/2 Reações`}
              size="small"
              color={availableReactions === 0 ? 'default' : 'info'}
              variant={availableReactions === 0 ? 'outlined' : 'filled'}
            />
          </Stack>
        </Box>

        {/* Ações de Turno */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Ações de Turno
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Ação Maior */}
            <ActionButton
              label="Ação Maior"
              available={actionEconomy.majorAction}
              icon={<MajorActionIcon />}
              color={theme.palette.warning.main}
              onClick={() => toggleAction('majorAction')}
              tooltip="Ação Maior - Principal ação do turno"
            />

            {/* Ações Menores */}
            <ActionButton
              label="Menor 1"
              available={actionEconomy.minorAction1}
              icon={<MinorActionIcon />}
              color={theme.palette.success.main}
              onClick={() => toggleAction('minorAction1')}
              tooltip="Ação Menor 1 - Ação rápida"
            />
            <ActionButton
              label="Menor 2"
              available={actionEconomy.minorAction2}
              icon={<MinorActionIcon />}
              color={theme.palette.success.main}
              onClick={() => toggleAction('minorAction2')}
              tooltip="Ação Menor 2 - Ação rápida"
            />
          </Stack>
        </Box>

        {/* Reações */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Reações (por Rodada)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Reação */}
            <ActionButton
              label="Reação"
              available={actionEconomy.reaction}
              icon={<ReactionIcon />}
              color={theme.palette.info.main}
              onClick={() => toggleAction('reaction')}
              tooltip="Reação - Resposta a eventos"
            />

            {/* Reação Defensiva */}
            <ActionButton
              label="Defensiva"
              available={actionEconomy.defensiveReaction}
              icon={<DefensiveReactionIcon />}
              color={theme.palette.primary.main}
              onClick={() => toggleAction('defensiveReaction')}
              tooltip="Reação Defensiva - Resposta defensiva"
            />
          </Stack>
        </Box>

        {/* Ações Livres - Informativo */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Ações Livres
          </Typography>
          <Chip
            icon={<FreeActionIcon fontSize="small" />}
            label="Ilimitadas"
            size="small"
            variant="outlined"
            sx={{ opacity: 0.7 }}
          />
        </Box>

        {/* Botão de Reset */}
        <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<StartTurnIcon />}
            onClick={resetTurn}
            fullWidth
          >
            Novo Turno
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Props para o botão de ação individual
 */
interface ActionButtonProps {
  /** Label da ação */
  label: string;
  /** Se a ação está disponível */
  available: boolean;
  /** Ícone da ação */
  icon: React.ReactNode;
  /** Cor da ação quando disponível */
  color: string;
  /** Callback ao clicar */
  onClick: () => void;
  /** Tooltip com descrição */
  tooltip: string;
}

/**
 * Botão de ação individual com estado visual
 */
function ActionButton({
  label,
  available,
  icon,
  color,
  onClick,
  tooltip,
}: ActionButtonProps) {
  const theme = useTheme();

  return (
    <Tooltip
      title={`${tooltip} - Clique para ${available ? 'usar' : 'recuperar'}`}
    >
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: available
            ? alpha(color, 0.15)
            : alpha(theme.palette.grey[500], 0.1),
          border: 2,
          borderColor: available ? color : 'transparent',
          opacity: available ? 1 : 0.5,
          '&:hover': {
            transform: 'scale(1.02)',
            backgroundColor: available
              ? alpha(color, 0.25)
              : alpha(theme.palette.grey[500], 0.2),
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
        role="button"
        aria-pressed={!available}
        aria-label={`${label} - ${available ? 'Disponível' : 'Usado'}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: available ? color : theme.palette.text.disabled,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="body2"
          fontWeight={available ? 'bold' : 'normal'}
          sx={{
            color: available ? color : theme.palette.text.disabled,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

/**
 * Valores padrão para economia de ações
 * Todas as ações disponíveis no início
 */
export const DEFAULT_ACTION_ECONOMY: ActionEconomyType = {
  majorAction: true,
  minorAction1: true,
  minorAction2: true,
  reaction: true,
  defensiveReaction: true,
};
