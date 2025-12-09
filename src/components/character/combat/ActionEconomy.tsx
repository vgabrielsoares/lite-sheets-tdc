'use client';

import React, { useCallback, useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  FlashOn as MajorActionIcon,
  Speed as MinorActionIcon,
  Shield as DefensiveReactionIcon,
  Reply as ReactionIcon,
  AllInclusive as FreeActionIcon,
  PlayArrow as StartTurnIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type {
  ActionEconomy as ActionEconomyType,
  ExtraAction,
} from '@/types/combat';

// Contador simples para IDs (evita hidratação mismatch)
let extraActionIdCounter = 0;

export interface ActionEconomyProps {
  /** Estado atual da economia de ações */
  actionEconomy: ActionEconomyType;
  /** Callback para atualizar economia de ações */
  onChange: (actionEconomy: ActionEconomyType) => void;
}

/** Tipos de ação extra disponíveis */
const EXTRA_ACTION_TYPES = [
  { value: 'maior', label: 'Ação Maior', icon: MajorActionIcon },
  { value: 'menor', label: 'Ação Menor', icon: MinorActionIcon },
  { value: 'reacao', label: 'Reação', icon: ReactionIcon },
  {
    value: 'reacao-defensiva',
    label: 'Reação Defensiva',
    icon: DefensiveReactionIcon,
  },
] as const;

/**
 * Componente que gerencia a Economia de Ações em combate
 *
 * O sistema Tabuleiro do Caos usa:
 * - 1 Ação Maior por turno
 * - 2 Ações Menores por turno
 * - 1 Reação por rodada
 * - 1 Reação Defensiva por rodada
 * - Ações Livres ilimitadas (apenas informativo)
 * - Ações extras podem ser adicionadas por habilidades especiais
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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newActionType, setNewActionType] =
    useState<ExtraAction['type']>('menor');
  const [newActionSource, setNewActionSource] = useState('');

  // Normalizar extraActions para garantir que é um array
  const extraActions = actionEconomy.extraActions ?? [];

  /**
   * Alterna o estado de uma ação específica
   */
  const toggleAction = useCallback(
    (actionKey: keyof Omit<ActionEconomyType, 'extraActions'>) => {
      onChange({
        ...actionEconomy,
        [actionKey]: !actionEconomy[actionKey],
      });
    },
    [actionEconomy, onChange]
  );

  /**
   * Alterna o estado de uma ação extra
   */
  const toggleExtraAction = useCallback(
    (actionId: string) => {
      const updatedExtras = extraActions.map((action) =>
        action.id === actionId
          ? { ...action, available: !action.available }
          : action
      );
      onChange({
        ...actionEconomy,
        extraActions: updatedExtras,
      });
    },
    [actionEconomy, extraActions, onChange]
  );

  /**
   * Adiciona uma nova ação extra
   */
  const addExtraAction = useCallback(() => {
    if (!newActionSource.trim()) return;

    const newAction: ExtraAction = {
      id: `extra-action-${++extraActionIdCounter}`,
      type: newActionType,
      available: true,
      source: newActionSource.trim(),
    };

    onChange({
      ...actionEconomy,
      extraActions: [...extraActions, newAction],
    });

    setNewActionSource('');
  }, [actionEconomy, extraActions, newActionType, newActionSource, onChange]);

  /**
   * Remove uma ação extra
   */
  const removeExtraAction = useCallback(
    (actionId: string) => {
      onChange({
        ...actionEconomy,
        extraActions: extraActions.filter((action) => action.id !== actionId),
      });
    },
    [actionEconomy, extraActions, onChange]
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
      extraActions: extraActions.map((action) => ({
        ...action,
        available: true,
      })),
    });
  }, [extraActions, onChange]);

  // Contagem de ações disponíveis
  const baseActionCount =
    (actionEconomy.majorAction ? 1 : 0) +
    (actionEconomy.minorAction1 ? 1 : 0) +
    (actionEconomy.minorAction2 ? 1 : 0);

  const extraTurnActionsAvailable = extraActions.filter(
    (a) => (a.type === 'maior' || a.type === 'menor') && a.available
  ).length;

  const extraTurnActionsTotal = extraActions.filter(
    (a) => a.type === 'maior' || a.type === 'menor'
  ).length;

  const baseReactionCount =
    (actionEconomy.reaction ? 1 : 0) +
    (actionEconomy.defensiveReaction ? 1 : 0);

  const extraReactionsAvailable = extraActions.filter(
    (a) => (a.type === 'reacao' || a.type === 'reacao-defensiva') && a.available
  ).length;

  const extraReactionsTotal = extraActions.filter(
    (a) => a.type === 'reacao' || a.type === 'reacao-defensiva'
  ).length;

  const totalTurnActions = baseActionCount + extraTurnActionsAvailable;
  const maxTurnActions = 3 + extraTurnActionsTotal;

  const totalReactions = baseReactionCount + extraReactionsAvailable;
  const maxReactions = 2 + extraReactionsTotal;

  // Filtrar ações extras por tipo
  const extraTurnActions = extraActions.filter(
    (a) => a.type === 'maior' || a.type === 'menor'
  );
  const extraReactionActions = extraActions.filter(
    (a) => a.type === 'reacao' || a.type === 'reacao-defensiva'
  );

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Economia de Ações
            </Typography>
            <Tooltip title="Configurar ações extras">
              <IconButton
                size="small"
                onClick={() => setConfigDialogOpen(true)}
                aria-label="Configurar ações extras"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${totalTurnActions}/${maxTurnActions} Turno`}
              size="small"
              color={totalTurnActions === 0 ? 'default' : 'success'}
              variant={totalTurnActions === 0 ? 'outlined' : 'filled'}
            />
            <Chip
              label={`${totalReactions}/${maxReactions} Reações`}
              size="small"
              color={totalReactions === 0 ? 'default' : 'info'}
              variant={totalReactions === 0 ? 'outlined' : 'filled'}
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

            {/* Ações extras de turno */}
            {extraTurnActions.map((action) => {
              const actionInfo = EXTRA_ACTION_TYPES.find(
                (t) => t.value === action.type
              );
              const ActionIcon = actionInfo?.icon ?? MajorActionIcon;
              const color =
                action.type === 'maior'
                  ? theme.palette.warning.main
                  : theme.palette.success.main;

              return (
                <ActionButton
                  key={action.id}
                  label={action.source}
                  available={action.available}
                  icon={<ActionIcon />}
                  color={color}
                  onClick={() => toggleExtraAction(action.id)}
                  tooltip={`${actionInfo?.label ?? 'Ação'} extra - ${action.source}`}
                  isExtra
                />
              );
            })}
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

            {/* Ações extras de reação */}
            {extraReactionActions.map((action) => {
              const actionInfo = EXTRA_ACTION_TYPES.find(
                (t) => t.value === action.type
              );
              const ActionIcon = actionInfo?.icon ?? ReactionIcon;
              const color =
                action.type === 'reacao'
                  ? theme.palette.info.main
                  : theme.palette.primary.main;

              return (
                <ActionButton
                  key={action.id}
                  label={action.source}
                  available={action.available}
                  icon={<ActionIcon />}
                  color={color}
                  onClick={() => toggleExtraAction(action.id)}
                  tooltip={`${actionInfo?.label ?? 'Reação'} extra - ${action.source}`}
                  isExtra
                />
              );
            })}
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

      {/* Dialog de Configuração de Ações Extras */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Configurar Ações Extras
          <IconButton
            onClick={() => setConfigDialogOpen(false)}
            sx={{ ml: 'auto' }}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Formulário para adicionar nova ação */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Adicionar Ação Extra
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="extra-action-type-label">Tipo</InputLabel>
                <Select
                  labelId="extra-action-type-label"
                  value={newActionType}
                  label="Tipo"
                  onChange={(e) =>
                    setNewActionType(e.target.value as ExtraAction['type'])
                  }
                >
                  {EXTRA_ACTION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <type.icon fontSize="small" />
                        <span>{type.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Origem"
                placeholder="Ex: Aceleração"
                value={newActionSource}
                onChange={(e) => setNewActionSource(e.target.value)}
                sx={{ flexGrow: 1 }}
                helperText="Nome da habilidade ou efeito"
              />
              <IconButton
                color="primary"
                onClick={addExtraAction}
                disabled={!newActionSource.trim()}
                sx={{ mt: 0.5 }}
                aria-label="Adicionar ação extra"
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Lista de ações extras existentes */}
          <Typography variant="subtitle2" gutterBottom>
            Ações Extras Configuradas
          </Typography>
          {extraActions.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              Nenhuma ação extra configurada
            </Typography>
          ) : (
            <List dense>
              {extraActions.map((action) => {
                const actionInfo = EXTRA_ACTION_TYPES.find(
                  (t) => t.value === action.type
                );
                const ActionIcon = actionInfo?.icon ?? MajorActionIcon;

                return (
                  <ListItem
                    key={action.id}
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <ActionIcon fontSize="small" color="action" />
                    </Box>
                    <ListItemText
                      primary={action.source}
                      secondary={actionInfo?.label}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeExtraAction(action.id)}
                        aria-label={`Remover ${action.source}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
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
  /** Se é uma ação extra (visual diferenciado) */
  isExtra?: boolean;
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
  isExtra = false,
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
          borderStyle: isExtra ? 'dashed' : 'solid',
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
        aria-label={`${label} - ${available ? 'Disponível' : 'Usado'}${isExtra ? ' (Extra)' : ''}`}
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
  extraActions: [],
};
