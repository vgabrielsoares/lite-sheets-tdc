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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  PlayArrow as ActionIcon,
  Reply as ReactionIcon,
  AllInclusive as FreeActionIcon,
  RestartAlt as ResetIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  BoltOutlined as FastTurnIcon,
  HourglassBottom as SlowTurnIcon,
} from '@mui/icons-material';
import type {
  ActionEconomy as ActionEconomyType,
  ExtraAction,
  TurnType,
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
  { value: 'acao' as const, label: 'Ação (▶)', icon: ActionIcon },
  { value: 'reacao' as const, label: 'Reação (↩)', icon: ReactionIcon },
];

/** Configuração do tipo de turno */
const TURN_TYPE_CONFIG: Record<
  TurnType,
  { label: string; actionCount: number; description: string; symbol: string }
> = {
  rapido: {
    label: 'Turno Rápido',
    actionCount: 2,
    description: 'Age primeiro — 2 ações (▶▶)',
    symbol: '▶▶',
  },
  lento: {
    label: 'Turno Lento',
    actionCount: 3,
    description: 'Age depois — 3 ações (▶▶▶)',
    symbol: '▶▶▶',
  },
};

/**
 * Componente que gerencia a Economia de Ações em combate
 *
 * - Turno Rápido (▶▶): 2 ações, age primeiro
 * - Turno Lento (▶▶▶): 3 ações, age depois de inimigos rápidos
 * - 1 Reação (↩) por rodada
 * - Ações Livres (∆) ilimitadas
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
    useState<ExtraAction['type']>('acao');
  const [newActionSource, setNewActionSource] = useState('');

  // Normalizar campos para garantir segurança contra dados parciais
  const extraActions = actionEconomy.extraActions ?? [];
  const turnType = actionEconomy.turnType ?? 'rapido';
  const turnConfig = TURN_TYPE_CONFIG[turnType];
  const actions =
    actionEconomy.actions ??
    Array.from({ length: turnConfig.actionCount }, () => true);
  const reaction = actionEconomy.reaction ?? true;

  /**
   * Altera o tipo de turno e ajusta o array de ações
   */
  const handleTurnTypeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newTurnType: TurnType | null) => {
      if (!newTurnType) return;
      const newActionCount = TURN_TYPE_CONFIG[newTurnType].actionCount;
      const newActions = Array.from({ length: newActionCount }, () => true);
      onChange({
        ...actionEconomy,
        turnType: newTurnType,
        actions: newActions,
      });
    },
    [actionEconomy, onChange]
  );

  /**
   * Alterna o estado de uma ação no index dado
   */
  const toggleAction = useCallback(
    (index: number) => {
      const newActions = [...actions];
      newActions[index] = !newActions[index];
      onChange({
        ...actionEconomy,
        actions: newActions,
      });
    },
    [actionEconomy, actions, onChange]
  );

  /**
   * Alterna o estado da reação
   */
  const toggleReaction = useCallback(() => {
    onChange({
      ...actionEconomy,
      reaction: !reaction,
    });
  }, [actionEconomy, reaction, onChange]);

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
   */
  const resetTurn = useCallback(() => {
    const actionCount = TURN_TYPE_CONFIG[turnType].actionCount;
    onChange({
      ...actionEconomy,
      actions: Array.from({ length: actionCount }, () => true),
      reaction: true,
      extraActions: extraActions.map((action) => ({
        ...action,
        available: true,
      })),
    });
  }, [actionEconomy, turnType, extraActions, onChange]);

  // Contagem de ações disponíveis
  const baseActionsAvailable = actions.filter(Boolean).length;
  const baseActionsTotal = actions.length;

  const extraTurnActionsAvailable = extraActions.filter(
    (a) => a.type === 'acao' && a.available
  ).length;
  const extraTurnActionsTotal = extraActions.filter(
    (a) => a.type === 'acao'
  ).length;

  const extraReactionsAvailable = extraActions.filter(
    (a) => a.type === 'reacao' && a.available
  ).length;
  const extraReactionsTotal = extraActions.filter(
    (a) => a.type === 'reacao'
  ).length;

  const totalActionsAvailable =
    baseActionsAvailable + extraTurnActionsAvailable;
  const totalActionsMax = baseActionsTotal + extraTurnActionsTotal;

  const totalReactionsAvailable = (reaction ? 1 : 0) + extraReactionsAvailable;
  const totalReactionsMax = 1 + extraReactionsTotal;

  // Filtrar ações extras por tipo
  const extraTurnActions = extraActions.filter((a) => a.type === 'acao');
  const extraReactionActions = extraActions.filter((a) => a.type === 'reacao');

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
        {/* Cabeçalho */}
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
              label={`${totalActionsAvailable}/${totalActionsMax} ▶`}
              size="small"
              color={totalActionsAvailable === 0 ? 'default' : 'success'}
              variant={totalActionsAvailable === 0 ? 'outlined' : 'filled'}
            />
            <Chip
              label={`${totalReactionsAvailable}/${totalReactionsMax} ↩`}
              size="small"
              color={totalReactionsAvailable === 0 ? 'default' : 'info'}
              variant={totalReactionsAvailable === 0 ? 'outlined' : 'filled'}
            />
          </Stack>
        </Box>

        {/* Seletor de Tipo de Turno */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Tipo de Turno
          </Typography>
          <ToggleButtonGroup
            value={turnType}
            exclusive
            onChange={handleTurnTypeChange}
            size="small"
            fullWidth
            aria-label="Tipo de turno"
          >
            <ToggleButton value="rapido" aria-label="Turno Rápido">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FastTurnIcon fontSize="small" />
                <Typography variant="body2" fontWeight="bold">
                  Rápido ▶▶
                </Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="lento" aria-label="Turno Lento">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <SlowTurnIcon fontSize="small" />
                <Typography variant="body2" fontWeight="bold">
                  Lento ▶▶▶
                </Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {turnConfig.description}
          </Typography>
        </Box>

        {/* Ações de Turno (▶) */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Ações (▶)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {actions.map((available, index) => (
              <ActionButton
                key={`action-${index}`}
                label={`${index + 1}`}
                available={available}
                icon={<ActionIcon />}
                color={theme.palette.warning.main}
                onClick={() => toggleAction(index)}
                tooltip={`Ação ${index + 1} — Clique para ${available ? 'usar' : 'recuperar'}`}
              />
            ))}

            {/* Ações extras de turno */}
            {extraTurnActions.map((action) => (
              <ActionButton
                key={action.id}
                label={action.source}
                available={action.available}
                icon={<ActionIcon />}
                color={theme.palette.warning.main}
                onClick={() => toggleExtraAction(action.id)}
                tooltip={`Ação extra (▶) — ${action.source}`}
                isExtra
              />
            ))}
          </Stack>
        </Box>

        {/* Reação (↩) */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Reação (↩) — 1 por rodada
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <ActionButton
              label="↩ Reação"
              available={reaction}
              icon={<ReactionIcon />}
              color={theme.palette.info.main}
              onClick={toggleReaction}
              tooltip={`Reação — Clique para ${reaction ? 'usar' : 'recuperar'}`}
            />

            {/* Ações extras de reação */}
            {extraReactionActions.map((action) => (
              <ActionButton
                key={action.id}
                label={action.source}
                available={action.available}
                icon={<ReactionIcon />}
                color={theme.palette.info.main}
                onClick={() => toggleExtraAction(action.id)}
                tooltip={`Reação extra (↩) — ${action.source}`}
                isExtra
              />
            ))}
          </Stack>
        </Box>

        {/* Ações Livres (∆) - Informativo */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Ações Livres (∆)
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
            startIcon={<ResetIcon />}
            onClick={resetTurn}
            fullWidth
          >
            Reset Turno
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
                const ExtraIcon = actionInfo?.icon ?? ActionIcon;

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
                      <ExtraIcon fontSize="small" color="action" />
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
    <Tooltip title={tooltip}>
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
 * Turno Rápido com todas as ações disponíveis
 */
export const DEFAULT_ACTION_ECONOMY: ActionEconomyType = {
  turnType: 'rapido',
  actions: [true, true],
  reaction: true,
  extraActions: [],
};
