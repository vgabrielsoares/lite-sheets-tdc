/**
 * CombatConditions - Gerenciamento de condições de combate
 *
 * Permite visualizar, adicionar e remover condições que afetam o personagem.
 * Condições automáticas (Avariado, Machucado, Esgotado) são calculadas com base
 * nos recursos do personagem e não podem ser removidas manualmente.
 *
 * v0.0.2: 4 categorias (Corporal, Mental, Sensorial, Espiritual),
 * condições empilháveis, condições automáticas.
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import type { Condition, ConditionCategory } from '@/types/combat';
import {
  CONDITIONS,
  CONDITION_CATEGORY_LABELS,
  CONDITIONS_BY_CATEGORY,
  shouldConditionBeActive,
  type ConditionId,
  type ConditionInfo,
} from '@/constants/conditions';

export interface CombatConditionsProps {
  /** Condições ativas do personagem */
  conditions: Condition[];
  /** Callback para atualizar condições */
  onChange: (conditions: Condition[]) => void;
  /** GA atual (para auto-cálculo de Avariado) */
  gaCurrent: number;
  /** GA máximo (para auto-cálculo de Avariado) */
  gaMax: number;
  /** PV atual (para auto-cálculo de Machucado) */
  pvCurrent: number;
  /** PV máximo (para auto-cálculo de Machucado) */
  pvMax: number;
  /** PP atual (para auto-cálculo de Esgotado) */
  ppCurrent: number;
}

/** Auto-triggered condition IDs */
const AUTO_CONDITION_IDS: ConditionId[] = ['avariado', 'machucado', 'esgotado'];

/** Category colors for chips */
const CATEGORY_COLORS: Record<
  ConditionCategory,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  corporal: 'warning',
  mental: 'secondary',
  sensorial: 'info',
  espiritual: 'primary',
};

/**
 * Componente de gerenciamento de condições de combate
 */
export const CombatConditions = React.memo(function CombatConditions({
  conditions,
  onChange,
  gaCurrent,
  gaMax,
  pvCurrent,
  pvMax,
  ppCurrent,
}: CombatConditionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ConditionId | ''>(
    ''
  );
  const [expanded, setExpanded] = useState(false);

  /** Auto-condições baseadas no estado do personagem */
  const autoConditions = useMemo(() => {
    const state = { gaCurrent, gaMax, pvCurrent, pvMax, ppCurrent };
    return AUTO_CONDITION_IDS.filter((id) =>
      shouldConditionBeActive(id, state)
    );
  }, [gaCurrent, gaMax, pvCurrent, pvMax, ppCurrent]);

  /** Condições manuais (não auto-triggered) */
  const manualConditions = conditions.filter(
    (c) => !AUTO_CONDITION_IDS.includes(c.name as ConditionId)
  );

  /** Total de condições ativas */
  const totalActive = autoConditions.length + manualConditions.length;

  /** Obtém ConditionInfo pela ID */
  const getInfo = useCallback(
    (id: ConditionId): ConditionInfo | undefined =>
      CONDITIONS.find((c) => c.id === id),
    []
  );

  /** Adiciona condição */
  const handleAdd = useCallback(() => {
    if (!selectedCondition) return;

    const info = getInfo(selectedCondition);
    if (!info) return;

    // Se empilhável, verifica se já existe e incrementa
    const existingIndex = conditions.findIndex(
      (c) => c.name === selectedCondition
    );
    if (info.stackable && existingIndex >= 0) {
      const existing = conditions[existingIndex];
      const currentStacks =
        existing.modifiers.find((m) => m.name === 'stacks')?.value ?? 1;
      const maxStacks = info.maxStacks ?? 99;

      if (currentStacks < maxStacks) {
        const updated = [...conditions];
        const stackMod = existing.modifiers.find((m) => m.name === 'stacks');
        if (stackMod) {
          updated[existingIndex] = {
            ...existing,
            modifiers: existing.modifiers.map((m) =>
              m.name === 'stacks' ? { ...m, value: currentStacks + 1 } : m
            ),
          };
        } else {
          updated[existingIndex] = {
            ...existing,
            modifiers: [
              ...existing.modifiers,
              { name: 'stacks', value: 2, type: 'penalidade' },
            ],
          };
        }
        onChange(updated);
      }
    } else if (existingIndex < 0) {
      // Nova condição
      const newCondition: Condition = {
        name: info.id,
        description: info.description,
        category: info.category,
        duration: null,
        modifiers: info.stackable
          ? [{ name: 'stacks', value: 1, type: 'penalidade' }]
          : [],
      };

      // Adiciona condições implicadas
      const newConditions = [newCondition];
      if (info.impliedConditions) {
        for (const implied of info.impliedConditions) {
          if (!conditions.find((c) => c.name === implied)) {
            const impliedInfo = getInfo(implied);
            if (impliedInfo) {
              newConditions.push({
                name: impliedInfo.id,
                description: impliedInfo.description,
                category: impliedInfo.category,
                duration: null,
                modifiers: [],
                source: info.label,
              });
            }
          }
        }
      }

      onChange([...conditions, ...newConditions]);
    }

    setSelectedCondition('');
    setIsAdding(false);
  }, [selectedCondition, conditions, onChange, getInfo]);

  /** Remove condição (ou reduz pilha) */
  const handleRemove = useCallback(
    (conditionName: string) => {
      const info = getInfo(conditionName as ConditionId);
      const existing = conditions.find((c) => c.name === conditionName);

      if (info?.stackable && existing) {
        const currentStacks =
          existing.modifiers.find((m) => m.name === 'stacks')?.value ?? 1;
        if (currentStacks > 1) {
          onChange(
            conditions.map((c) =>
              c.name === conditionName
                ? {
                    ...c,
                    modifiers: c.modifiers.map((m) =>
                      m.name === 'stacks'
                        ? { ...m, value: currentStacks - 1 }
                        : m
                    ),
                  }
                : c
            )
          );
          return;
        }
      }

      onChange(conditions.filter((c) => c.name !== conditionName));
    },
    [conditions, onChange, getInfo]
  );

  /** Remove completamente (todas as pilhas) */
  const handleRemoveAll = useCallback(
    (conditionName: string) => {
      onChange(conditions.filter((c) => c.name !== conditionName));
    },
    [conditions, onChange]
  );

  /** Opções disponíveis para adicionar (excluindo auto-triggered) */
  const availableOptions = useMemo(() => {
    return CONDITIONS.filter((c) => !AUTO_CONDITION_IDS.includes(c.id));
  }, []);

  /** Agrupa opções por categoria */
  const groupedOptions = useMemo(() => {
    const groups: Record<ConditionCategory, ConditionInfo[]> = {
      corporal: [],
      mental: [],
      sensorial: [],
      espiritual: [],
    };
    for (const c of availableOptions) {
      groups[c.category].push(c);
    }
    return groups;
  }, [availableOptions]);

  /** Renderiza chip de condição */
  const renderConditionChip = (
    conditionId: ConditionId,
    isAuto: boolean,
    stacks?: number
  ) => {
    const info = getInfo(conditionId);
    if (!info) return null;

    const label =
      stacks && stacks > 1 ? `${info.label} ×${stacks}` : info.label;

    return (
      <Tooltip
        key={conditionId + (isAuto ? '-auto' : '')}
        title={
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {info.label}
              {isAuto && ' (Automática)'}
            </Typography>
            <Typography variant="caption">{info.description}</Typography>
            {info.dicePenalty && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 0.5, color: 'warning.light' }}
              >
                Penalidade: {info.dicePenalty.modifier}d em{' '}
                {info.dicePenalty.targets.join(', ')}
                {info.dicePenalty.scalesWithStacks && ' (por nível)'}
              </Typography>
            )}
          </Box>
        }
        arrow
      >
        <Chip
          label={label}
          size="small"
          color={CATEGORY_COLORS[info.category]}
          variant={isAuto ? 'filled' : 'outlined'}
          icon={isAuto ? <AutoFixHighIcon /> : undefined}
          onDelete={!isAuto ? () => handleRemove(conditionId) : undefined}
          sx={{
            fontWeight: 600,
            opacity: isAuto ? 0.9 : 1,
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReportProblemIcon color="warning" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              Condições
            </Typography>
            {totalActive > 0 && (
              <Chip
                label={totalActive}
                size="small"
                color="warning"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Adicionar condição">
              <IconButton
                size="small"
                onClick={() => setIsAdding(!isAdding)}
                color={isAdding ? 'primary' : 'default'}
              >
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {totalActive > 0 && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Condições ativas (resumo) */}
        {totalActive === 0 && !isAdding && (
          <Typography variant="caption" color="text.secondary">
            Nenhuma condição ativa.
          </Typography>
        )}

        {totalActive > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {/* Auto conditions */}
            {autoConditions.map((id) => renderConditionChip(id, true))}

            {/* Manual conditions */}
            {manualConditions.map((c) => {
              const stacks =
                c.modifiers.find((m) => m.name === 'stacks')?.value ??
                undefined;
              return renderConditionChip(c.name as ConditionId, false, stacks);
            })}
          </Box>
        )}

        {/* Detalhes expandidos */}
        <Collapse in={expanded && totalActive > 0}>
          <Box sx={{ mt: 1.5 }}>
            {/* Auto conditions detail */}
            {autoConditions.length > 0 && (
              <Alert
                severity="info"
                icon={<AutoFixHighIcon fontSize="small" />}
                sx={{ mb: 1, py: 0 }}
              >
                <Typography variant="caption">
                  Condições automáticas são calculadas com base nos seus
                  recursos atuais e não podem ser removidas manualmente.
                </Typography>
              </Alert>
            )}

            {/* Manual conditions with remove buttons */}
            {manualConditions.length > 0 && (
              <Stack spacing={0.5}>
                {manualConditions.map((c) => {
                  const info = getInfo(c.name as ConditionId);
                  const stacks =
                    c.modifiers.find((m) => m.name === 'stacks')?.value ?? 0;
                  return (
                    <Stack
                      key={c.name}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {info?.label ?? c.name}
                          {stacks > 1 && ` ×${stacks}`}
                        </Typography>
                        {c.source && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            Fonte: {c.source}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        {info?.stackable && stacks > 0 && (
                          <Tooltip title="Reduzir nível">
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(c.name)}
                            >
                              <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remover condição">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveAll(c.name)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Collapse>

        {/* Adicionar condição */}
        <Collapse in={isAdding}>
          <Box sx={{ mt: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Condição</InputLabel>
              <Select
                value={selectedCondition}
                onChange={(e) =>
                  setSelectedCondition(e.target.value as ConditionId)
                }
                label="Condição"
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {(
                  Object.entries(groupedOptions) as [
                    ConditionCategory,
                    ConditionInfo[],
                  ][]
                ).map(([category, items]) =>
                  items.length > 0
                    ? [
                        <MenuItem
                          key={`header-${category}`}
                          disabled
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                          }}
                        >
                          {CONDITION_CATEGORY_LABELS[category].toUpperCase()}
                        </MenuItem>,
                        ...items.map((c) => {
                          const isActive =
                            manualConditions.some((mc) => mc.name === c.id) ||
                            autoConditions.includes(c.id);
                          const canStack =
                            c.stackable &&
                            manualConditions.some((mc) => mc.name === c.id);
                          return (
                            <MenuItem
                              key={c.id}
                              value={c.id}
                              disabled={isActive && !canStack}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ width: '100%' }}
                              >
                                <Typography variant="body2">
                                  {c.label}
                                </Typography>
                                {c.stackable && (
                                  <Chip
                                    label="Empilhável"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.6rem',
                                    }}
                                  />
                                )}
                                {isActive && !canStack && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    (ativa)
                                  </Typography>
                                )}
                              </Stack>
                            </MenuItem>
                          );
                        }),
                      ]
                    : []
                )}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleAdd}
                disabled={!selectedCondition}
                sx={{ textTransform: 'none', flex: 1 }}
              >
                Adicionar
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedCondition('');
                }}
                sx={{ textTransform: 'none' }}
              >
                Cancelar
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
});

CombatConditions.displayName = 'CombatConditions';
