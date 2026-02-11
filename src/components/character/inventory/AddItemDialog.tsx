/**
 * AddItemDialog - Diálogo de Adicionar/Editar Item
 *
 * Componente de diálogo para adicionar ou editar itens do inventário.
 * Suporta todos os campos do item: nome, descrição, categoria, quantidade, peso, valor.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
  Box,
} from '@mui/material';
import { uuidv4 } from '@/utils/uuid';
import type { InventoryItem, ItemCategory } from '@/types/inventory';
import type { DiceType } from '@/types/common';
import {
  DURABILITY_DIE_OPTIONS,
  createItemDurability,
} from '@/utils/durabilityCalculations';
import { ITEM_CATEGORIES, DEFAULT_ITEM_CATEGORY } from '@/constants/inventory';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export interface AddItemDialogProps {
  /** Se o diálogo está aberto */
  open: boolean;
  /** Callback para fechar o diálogo */
  onClose: () => void;
  /** Callback para salvar o item (novo ou editado) */
  onSave: (item: InventoryItem) => void;
  /** Item a ser editado (undefined para novo item) */
  editItem?: InventoryItem;
}

/**
 * Dados do formulário de item
 */
interface ItemFormData {
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  /**
   * Peso do item:
   * - null: Item sem peso (não conta para nada)
   * - 0: Peso zero (5 itens peso 0 = 1 de peso)
   * - negativo: Aumenta capacidade de carga
   * - positivo: Peso normal
   */
  weight: number | null;
  value: number;
  equipped: boolean;
  /** Flag para indicar item sem peso (peso null) */
  isWeightless: boolean;
  /** Habilitar durabilidade */
  hasDurability: boolean;
  /** Dado máximo de durabilidade */
  durabilityDie: DiceType;
}

// ============================================================================
// Constantes
// ============================================================================

/**
 * Dados iniciais do formulário (novo item)
 */
const INITIAL_FORM_DATA: ItemFormData = {
  name: '',
  description: '',
  category: DEFAULT_ITEM_CATEGORY,
  quantity: 1,
  weight: 0,
  value: 0,
  equipped: false,
  isWeightless: false,
  hasDurability: false,
  durabilityDie: 'd8',
};

// ============================================================================
// Funções Utilitárias
// ============================================================================

/**
 * Converte um item para dados do formulário
 */
function itemToFormData(item: InventoryItem): ItemFormData {
  const isWeightless = item.weight === null;
  return {
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    quantity: item.quantity,
    weight: isWeightless ? 0 : item.weight,
    value: item.value,
    equipped: item.equipped,
    isWeightless,
    hasDurability: !!item.durability,
    durabilityDie: item.durability?.maxDie ?? 'd8',
  };
}

/**
 * Converte dados do formulário para um item
 */
function formDataToItem(
  formData: ItemFormData,
  existingId?: string,
  existingDurability?: InventoryItem['durability']
): InventoryItem {
  // Determinar durabilidade
  let durability: InventoryItem['durability'] = undefined;
  if (formData.hasDurability) {
    if (
      existingDurability &&
      existingDurability.maxDie === formData.durabilityDie
    ) {
      // Preservar estado atual se o dado máximo não mudou
      durability = existingDurability;
    } else {
      // Criar nova durabilidade (reset)
      durability = createItemDurability(formData.durabilityDie);
    }
  }

  return {
    id: existingId ?? uuidv4(),
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    category: formData.category,
    quantity: Math.max(1, Math.floor(formData.quantity)),
    // Se é sem peso, salva null; senão, usa o valor inteiro
    weight: formData.isWeightless ? null : Math.floor(formData.weight ?? 0),
    value: Math.max(0, formData.value),
    equipped: formData.equipped,
    durability,
  };
}

/**
 * Valida os dados do formulário
 */
function validateFormData(formData: ItemFormData): string | null {
  if (!formData.name.trim()) {
    return 'Nome é obrigatório';
  }

  if (formData.quantity < 1) {
    return 'Quantidade deve ser pelo menos 1';
  }

  // Peso pode ser negativo (itens que aumentam capacidade de carga)
  // Não precisa validar peso se o item não tem peso

  if (formData.value < 0) {
    return 'Valor não pode ser negativo';
  }

  return null;
}

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Diálogo de adicionar/editar item
 */
export function AddItemDialog({
  open,
  onClose,
  onSave,
  editItem,
}: AddItemDialogProps) {
  const [formData, setFormData] = useState<ItemFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);

  // Preencher formulário quando editando um item existente
  useEffect(() => {
    if (editItem) {
      setFormData(itemToFormData(editItem));
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setError(null);
  }, [editItem, open]);

  // Handlers de campo
  const handleFieldChange = useCallback(
    (field: keyof ItemFormData) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          | {
              target: { value: unknown };
            }
      ) => {
        const value = event.target.value;
        setFormData((prev) => ({
          ...prev,
          [field]:
            field === 'quantity' || field === 'weight' || field === 'value'
              ? Number(value)
              : value,
        }));
        setError(null);
      },
    []
  );

  const handleEquippedChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        equipped: event.target.checked,
      }));
    },
    []
  );

  // Handler de salvamento
  const handleSave = useCallback(() => {
    const validationError = validateFormData(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    const item = formDataToItem(formData, editItem?.id, editItem?.durability);
    onSave(item);
    onClose();
  }, [formData, editItem, onSave, onClose]);

  // Handler de fechar
  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setError(null);
    onClose();
  }, [onClose]);

  // Título baseado no modo (novo/editar)
  const dialogTitle = editItem ? 'Editar Item' : 'Adicionar Item';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-item-dialog-title"
    >
      <DialogTitle id="add-item-dialog-title">{dialogTitle}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* Nome */}
          <TextField
            label="Nome do Item"
            value={formData.name}
            onChange={handleFieldChange('name')}
            fullWidth
            required
            autoFocus
            error={error === 'Nome é obrigatório'}
            helperText={error === 'Nome é obrigatório' ? error : undefined}
            inputProps={{
              'aria-label': 'Nome do item',
            }}
          />

          {/* Descrição */}
          <TextField
            label="Descrição"
            value={formData.description}
            onChange={handleFieldChange('description')}
            fullWidth
            multiline
            rows={2}
            inputProps={{
              'aria-label': 'Descrição do item',
            }}
          />

          {/* Categoria */}
          <FormControl fullWidth>
            <InputLabel id="item-category-label">Categoria</InputLabel>
            <Select
              labelId="item-category-label"
              value={formData.category}
              label="Categoria"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ItemCategory,
                }))
              }
              inputProps={{
                'aria-label': 'Categoria do item',
              }}
            >
              {ITEM_CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantidade e Peso */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Quantidade"
              type="number"
              value={formData.quantity}
              onChange={handleFieldChange('quantity')}
              fullWidth
              required
              error={error === 'Quantidade deve ser pelo menos 1'}
              helperText={
                error === 'Quantidade deve ser pelo menos 1' ? error : undefined
              }
              inputProps={{
                min: 1,
                step: 1,
                'aria-label': 'Quantidade do item',
              }}
            />

            <TextField
              label="Espaço Unitário"
              type="number"
              value={formData.weight ?? 0}
              onChange={handleFieldChange('weight')}
              fullWidth
              disabled={formData.isWeightless}
              helperText={
                formData.isWeightless
                  ? 'Item sem espaço'
                  : 'Valores negativos aumentam capacidade'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">espaço</InputAdornment>
                ),
              }}
              inputProps={{
                step: 1,
                'aria-label': 'Peso unitário do item',
              }}
            />
          </Stack>

          {/* Sem peso (checkbox) */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isWeightless}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isWeightless: e.target.checked,
                    weight: e.target.checked ? null : 0,
                  }))
                }
                color="info"
                inputProps={{
                  'aria-label': 'Item sem peso',
                }}
              />
            }
            label="Item Sem Espaço"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: -1 }}
          >
            Itens sem espaço não contam para capacidade de carga (ex: Mochila,
            Cartão do Banco)
          </Typography>

          {/* Valor */}
          <TextField
            label="Valor"
            type="number"
            value={formData.value}
            onChange={handleFieldChange('value')}
            fullWidth
            error={error === 'Valor não pode ser negativo'}
            helperText={
              error === 'Valor não pode ser negativo' ? error : undefined
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">PO$</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 1,
              'aria-label': 'Valor do item em moedas de ouro',
            }}
          />

          {/* Equipado */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.equipped}
                  onChange={handleEquippedChange}
                  color="success"
                  inputProps={{
                    'aria-label': 'Marcar item como equipado',
                  }}
                />
              }
              label="Item Equipado"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Itens equipados são marcados visualmente na lista
            </Typography>
          </Box>

          {/* Durabilidade */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.hasDurability}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasDurability: e.target.checked,
                    }))
                  }
                  color="warning"
                  inputProps={{
                    'aria-label': 'Habilitar durabilidade para este item',
                  }}
                />
              }
              label="Tem Durabilidade"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Itens com durabilidade usam um dado que pode diminuir com o uso
            </Typography>
          </Box>

          {formData.hasDurability && (
            <FormControl fullWidth>
              <InputLabel id="durability-die-label">
                Dado de Durabilidade
              </InputLabel>
              <Select
                labelId="durability-die-label"
                value={formData.durabilityDie}
                label="Dado de Durabilidade"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    durabilityDie: e.target.value as DiceType,
                  }))
                }
                inputProps={{
                  'aria-label': 'Dado máximo de durabilidade',
                }}
              >
                {DURABILITY_DIE_OPTIONS.map((die) => (
                  <MenuItem key={die} value={die}>
                    {die}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Erro geral */}
          {error &&
            ![
              'Nome é obrigatório',
              'Quantidade deve ser pelo menos 1',
              'Peso não pode ser negativo',
              'Valor não pode ser negativo',
            ].includes(error) && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {editItem ? 'Salvar Alterações' : 'Adicionar Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
