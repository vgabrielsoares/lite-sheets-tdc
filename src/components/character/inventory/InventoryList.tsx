/**
 * InventoryList - Lista de Itens do Inventário
 *
 * Componente principal para gerenciar a lista de itens do inventário,
 * incluindo CRUD de itens, exibição de peso total e capacidade de carga.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory2';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { InventoryItem } from '@/types/inventory';
import { InventoryItemRow } from './InventoryItemRow';
import { AddItemDialog } from './AddItemDialog';
import { ConfirmDialog } from '@/components/shared';
import {
  calculateItemsWeight,
  getEncumbranceState,
  ENCUMBRANCE_STATE_COLORS,
} from '@/utils/carryCapacityCalculations';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export interface InventoryListProps {
  /** Lista de itens do inventário */
  items: InventoryItem[];
  /** Callback para atualizar a lista de itens */
  onUpdate: (items: InventoryItem[]) => void;
  /** Capacidade máxima de carga (para calcular estado de encumbrance) */
  maxCapacity?: number;
  /** Peso atual das moedas (para somar ao peso total) */
  coinsWeight?: number;
  /** Se a edição está desabilitada */
  disabled?: boolean;
  /** Callback para abrir a sidebar de detalhes do item */
  onOpenItem?: (item: InventoryItem) => void;
}

// ============================================================================
// Funções Utilitárias
// ============================================================================

// Nota: Usamos calculateItemsWeight do carryCapacityCalculations para cálculo correto
// que inclui a regra de 5 itens peso 0 = 1 de peso

/**
 * Conta itens por categoria
 */
function countItemsByCategory(items: InventoryItem[]): Map<string, number> {
  const categoryCount = new Map<string, number>();

  items.forEach((item) => {
    const current = categoryCount.get(item.category) ?? 0;
    categoryCount.set(item.category, current + item.quantity);
  });

  return categoryCount;
}

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Lista de itens do inventário
 */
export function InventoryList({
  items,
  onUpdate,
  maxCapacity = 10,
  coinsWeight = 0,
  disabled = false,
  onOpenItem,
}: InventoryListProps) {
  const theme = useTheme();

  // Estado do diálogo de adicionar/editar item
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(
    undefined
  );

  // Estado do diálogo de confirmação de remoção
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<InventoryItem | null>(null);

  // Estado de expansão da lista
  const [expanded, setExpanded] = useState(true);

  // Cálculos de peso (usa função correta que considera regra de peso 0)
  const itemsWeight = useMemo(() => calculateItemsWeight(items), [items]);
  const totalWeight = itemsWeight + coinsWeight;
  const encumbranceState = useMemo(
    () => getEncumbranceState(totalWeight, maxCapacity),
    [totalWeight, maxCapacity]
  );
  const stateColor = ENCUMBRANCE_STATE_COLORS[encumbranceState];

  // Contagem de itens
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Contagem total de itens de peso 0 (para tooltip de peso efetivo)
  const totalZeroWeightCount = useMemo(() => {
    return items.reduce((count, item) => {
      if (item.weight === 0) {
        return count + item.quantity;
      }
      return count;
    }, 0);
  }, [items]);

  // ========================================
  // Handlers de CRUD
  // ========================================

  // Abrir diálogo para adicionar novo item
  const handleAddItem = useCallback(() => {
    setEditingItem(undefined);
    setDialogOpen(true);
  }, []);

  // Abrir diálogo para editar item existente
  const handleEditItem = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  // Fechar diálogo
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(undefined);
  }, []);

  // Salvar item (adicionar ou atualizar)
  const handleSaveItem = useCallback(
    (item: InventoryItem) => {
      let updatedItems: InventoryItem[];

      if (editingItem) {
        // Atualizar item existente
        updatedItems = items.map((existingItem) =>
          existingItem.id === item.id ? item : existingItem
        );
      } else {
        // Adicionar novo item
        updatedItems = [...items, item];
      }

      onUpdate(updatedItems);
      setDialogOpen(false);
      setEditingItem(undefined);
    },
    [items, editingItem, onUpdate]
  );

  // Iniciar remoção de item (abre diálogo de confirmação)
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        setItemToRemove(item);
        setRemoveDialogOpen(true);
      }
    },
    [items]
  );

  // Confirmar remoção de item
  const handleConfirmRemove = useCallback(() => {
    if (itemToRemove) {
      const updatedItems = items.filter((item) => item.id !== itemToRemove.id);
      onUpdate(updatedItems);
      setItemToRemove(null);
      setRemoveDialogOpen(false);
    }
  }, [items, itemToRemove, onUpdate]);

  // Cancelar remoção de item
  const handleCancelRemove = useCallback(() => {
    setItemToRemove(null);
    setRemoveDialogOpen(false);
  }, []);

  // Toggle expansão
  const handleToggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderColor:
            stateColor === 'error'
              ? 'error.main'
              : stateColor === 'warning'
                ? 'warning.main'
                : 'divider',
          transition: 'border-color 0.3s ease-in-out',
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Cabeçalho */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <InventoryIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight="medium">
                Itens do Inventário
              </Typography>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Sistema de Peso do Inventário
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      <strong>Itens sem peso:</strong> Não contam para o peso
                      total (peso = null)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      <strong>Itens com peso 0:</strong> A cada 5 unidades = 1
                      de peso total
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      <strong>Itens com peso normal:</strong> Peso unitário x
                      quantidade
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Itens com peso negativo:</strong> Reduzem o peso
                      total do inventário
                    </Typography>
                  </Box>
                }
                arrow
                placement="right"
              >
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  <InfoOutlinedIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
              <Chip
                label={`${totalQuantity} itens`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Peso dos itens */}
              <Tooltip title="Peso total dos itens" arrow>
                <Chip
                  icon={<FitnessCenterIcon fontSize="small" />}
                  label={`${itemsWeight} peso`}
                  size="small"
                  color={stateColor}
                  variant="filled"
                />
              </Tooltip>

              {/* Botão expandir/recolher */}
              <IconButton
                size="small"
                onClick={handleToggleExpanded}
                aria-label={expanded ? 'Recolher lista' : 'Expandir lista'}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
          </Stack>

          <Collapse in={expanded}>
            {/* Alerta de sobrecarga */}
            {encumbranceState !== 'normal' && (
              <Alert
                severity={stateColor === 'error' ? 'error' : 'warning'}
                sx={{ mb: 2 }}
              >
                {encumbranceState === 'sobrecarregado'
                  ? 'Você está sobrecarregado! Deslocamento reduzido pela metade.'
                  : 'Você está imobilizado! Não pode se mover.'}
              </Alert>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Lista de itens */}
            {items.length === 0 ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <InventoryIcon
                  sx={{ fontSize: 48, mb: 1, color: 'action.disabled' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Nenhum item no inventário
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Clique em &quot;Adicionar Item&quot; para começar
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {items.map((item) => (
                  <InventoryItemRow
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onRemove={handleRemoveItem}
                    onClick={onOpenItem}
                    disabled={disabled}
                    totalZeroWeightCount={totalZeroWeightCount}
                  />
                ))}
              </Stack>
            )}

            {/* Botão adicionar item */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={disabled}
                fullWidth
                sx={{
                  borderStyle: 'dashed',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderStyle: 'solid',
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Adicionar Item
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Diálogo de adicionar/editar item */}
      <AddItemDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
        editItem={editingItem}
      />

      {/* Diálogo de confirmação de remoção */}
      <ConfirmDialog
        open={removeDialogOpen}
        title="Remover Item"
        message={`Tem certeza que deseja remover "${itemToRemove?.name}" do inventário?`}
        confirmText="Remover"
        confirmColor="error"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
}
