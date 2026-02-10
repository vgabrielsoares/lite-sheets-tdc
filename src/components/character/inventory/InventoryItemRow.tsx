/**
 * InventoryItemRow - Linha de Item do Inventário
 *
 * Componente para exibir um item individual na lista de inventário,
 * com informações de nome, quantidade, peso e ações de edição/remoção.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CasinoIcon from '@mui/icons-material/Casino';
import BuildIcon from '@mui/icons-material/Build';
import type { InventoryItem } from '@/types/inventory';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants/inventory';
import {
  rollDurabilityDie,
  testDurability,
  applyDurabilityTestResult,
  repairItem,
  getDurabilityColor,
  getDurabilityLabel,
  getDurabilityPercent,
} from '@/utils/durabilityCalculations';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export interface InventoryItemRowProps {
  /** Item a ser exibido */
  item: InventoryItem;
  /** Callback para editar o item */
  onEdit: (item: InventoryItem) => void;
  /** Callback para remover o item */
  onRemove: (itemId: string) => void;
  /** Callback para atualizar o item (ex: após teste de durabilidade) */
  onUpdate?: (item: InventoryItem) => void;
  /** Callback quando o item é clicado (para abrir detalhes) */
  onClick?: (item: InventoryItem) => void;
  /** Se as ações estão desabilitadas */
  disabled?: boolean;
  /** Contagem total de itens de peso 0 no inventário (para cálculo de peso efetivo) */
  totalZeroWeightCount?: number;
}

// ============================================================================
// Constantes
// ============================================================================

// ============================================================================
// Funções Utilitárias
// ============================================================================

/**
 * Calcula o peso total de um item (peso unitário × quantidade)
 * Retorna null para itens sem peso
 */
function calculateTotalWeight(item: InventoryItem): number | null {
  if (item.weight === null) return null;
  return item.weight * item.quantity;
}

/**
 * Formata o peso para exibição
 */
function formatWeight(weight: number | null): string {
  if (weight === null) return '—';
  if (weight === 0) return '0';
  return weight.toString();
}

/**
 * Verifica se um item é "sem peso" (null)
 */
function isWeightless(weight: number | null): boolean {
  return weight === null;
}

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Linha de item do inventário
 */
export function InventoryItemRow({
  item,
  onEdit,
  onRemove,
  onUpdate,
  onClick,
  disabled = false,
  totalZeroWeightCount = 0,
}: InventoryItemRowProps) {
  const theme = useTheme();
  const totalWeight = calculateTotalWeight(item);

  // Estado do snackbar para resultado do teste de durabilidade
  const [durabilityResult, setDurabilityResult] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Handler de teste de durabilidade
  const handleDurabilityTest = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        disabled ||
        !item.durability ||
        item.durability.state === 'quebrado' ||
        !onUpdate
      )
        return;

      const rollValue = rollDurabilityDie(item.durability.currentDie);
      const result = testDurability(item.durability, rollValue);
      const newDurability = applyDurabilityTestResult(item.durability, result);

      onUpdate({ ...item, durability: newDurability });

      if (result.damaged) {
        if (result.newState === 'quebrado') {
          setDurabilityResult({
            open: true,
            message: `${item.name}: rolou ${rollValue} no ${result.previousDie} — QUEBROU!`,
            severity: 'error',
          });
        } else {
          setDurabilityResult({
            open: true,
            message: `${item.name}: rolou ${rollValue} no ${result.previousDie} — Danificado! (${result.previousDie} → ${result.newDie})`,
            severity: 'warning',
          });
        }
      } else {
        setDurabilityResult({
          open: true,
          message: `${item.name}: rolou ${rollValue} no ${result.previousDie} — Item resiste!`,
          severity: 'success',
        });
      }
    },
    [item, disabled, onUpdate]
  );

  // Handler de reparo
  const handleRepair = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || !item.durability || !onUpdate) return;

      const repairedDurability = repairItem(item.durability);
      onUpdate({ ...item, durability: repairedDurability });

      setDurabilityResult({
        open: true,
        message: `${item.name} reparado! Durabilidade restaurada para ${repairedDurability.maxDie}.`,
        severity: 'success',
      });
    },
    [item, disabled, onUpdate]
  );

  // Calcular peso efetivo para itens de peso 0
  // Se há 5 ou mais itens peso 0 no inventário, cada 5 conta como 1 de peso
  const effectiveWeight = React.useMemo(() => {
    if (item.weight !== 0 || totalZeroWeightCount < 5) {
      return totalWeight;
    }

    // Há pelo menos 5 itens peso 0 no total
    // Calcular contribuição deste item para o peso total
    const totalEffectiveWeight = Math.floor(totalZeroWeightCount / 5);
    const thisItemProportion = item.quantity / totalZeroWeightCount;
    const thisItemEffectiveWeight = thisItemProportion * totalEffectiveWeight;

    return thisItemEffectiveWeight;
  }, [item.weight, item.quantity, totalWeight, totalZeroWeightCount]);

  const handleEdit = () => {
    if (!disabled) {
      onEdit(item);
    }
  };

  const handleRemove = () => {
    if (!disabled) {
      onRemove(item.id);
    }
  };

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick(item);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleEdit();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleRemove();
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      {/* Nome e Categoria */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </Typography>

          {item.equipped && (
            <Tooltip title="Equipado" arrow>
              <CheckCircleIcon fontSize="small" color="success" />
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            label={CATEGORY_LABELS[item.category]}
            size="small"
            color={CATEGORY_COLORS[item.category]}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />

          {item.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {item.description}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Quantidade */}
      <Box sx={{ textAlign: 'center', minWidth: 60 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Qtd.
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {item.quantity}
        </Typography>
      </Box>

      {/* Peso */}
      <Tooltip
        title={
          isWeightless(item.weight)
            ? 'Item sem espaço - não conta para capacidade de carga'
            : item.weight === 0 && totalZeroWeightCount >= 5
              ? `Espaço unitário: 0 | Total: ${(effectiveWeight ?? 0).toFixed(1)}`
              : `Espaço unitário: ${formatWeight(item.weight)} | Total: ${formatWeight(totalWeight)}`
        }
        arrow
      >
        <Box sx={{ textAlign: 'center', minWidth: 70 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
          >
            <FitnessCenterIcon
              fontSize="small"
              color={isWeightless(item.weight) ? 'disabled' : 'action'}
            />
            <Typography
              variant="body2"
              fontWeight="medium"
              color={
                isWeightless(item.weight) ? 'text.disabled' : 'text.primary'
              }
            >
              {formatWeight(totalWeight)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {isWeightless(item.weight) ? 'sem espaço' : 'espaço'}
          </Typography>
        </Box>
      </Tooltip>

      {/* Durabilidade */}
      {item.durability && (
        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
          <Tooltip
            title={`Durabilidade: ${getDurabilityLabel(item.durability.state)} (${item.durability.currentDie}/${item.durability.maxDie})`}
            arrow
          >
            <Stack alignItems="center" spacing={0.25}>
              <Chip
                label={
                  item.durability.state === 'quebrado'
                    ? '✗'
                    : item.durability.currentDie
                }
                size="small"
                color={getDurabilityColor(item.durability.state)}
                variant={
                  item.durability.state === 'intacto' ? 'outlined' : 'filled'
                }
                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
              />
              <Stack direction="row" spacing={0.25}>
                <Tooltip title="Testar durabilidade" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleDurabilityTest}
                      disabled={
                        disabled ||
                        item.durability.state === 'quebrado' ||
                        !onUpdate
                      }
                      aria-label={`Testar durabilidade de ${item.name}`}
                      sx={{
                        p: 0.25,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: 'warning.main',
                          backgroundColor: alpha(
                            theme.palette.warning.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <CasinoIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                {item.durability.state !== 'intacto' && (
                  <Tooltip title="Reparar item" arrow>
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleRepair}
                        disabled={disabled || !onUpdate}
                        aria-label={`Reparar ${item.name}`}
                        sx={{
                          p: 0.25,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'success.main',
                            backgroundColor: alpha(
                              theme.palette.success.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <BuildIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Tooltip>
        </Box>
      )}

      {/* Ações */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Editar item" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleEditClick}
              disabled={disabled}
              aria-label={`Editar ${item.name}`}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Remover item" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleRemoveClick}
              disabled={disabled}
              aria-label={`Remover ${item.name}`}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Snackbar de resultado de teste de durabilidade */}
      <Snackbar
        open={durabilityResult.open}
        autoHideDuration={3000}
        onClose={() =>
          setDurabilityResult((prev) => ({ ...prev, open: false }))
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={durabilityResult.severity}
          onClose={() =>
            setDurabilityResult((prev) => ({ ...prev, open: false }))
          }
          variant="filled"
          sx={{ width: '100%' }}
        >
          {durabilityResult.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
