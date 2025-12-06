/**
 * ItemDetailsSidebar - Sidebar de Detalhes de Item
 *
 * Sidebar para visualizar e editar detalhes completos de um item do inventário.
 * Permite adicionar descrição extendida, propriedades mecânicas, notas e tags.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import LabelIcon from '@mui/icons-material/Label';

import { Sidebar } from '@/components/shared';
import type { InventoryItem, ItemCategory } from '@/types/inventory';
import { useDebounce } from '@/hooks/useDebounce';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export interface ItemDetailsSidebarProps {
  /** Controla se a sidebar está aberta */
  open: boolean;
  /** Callback chamado ao fechar a sidebar */
  onClose: () => void;
  /** Item sendo visualizado/editado */
  item: InventoryItem | null;
  /** Callback chamado quando o item é atualizado */
  onUpdate: (item: InventoryItem) => void;
}

/**
 * Labels para categorias de itens
 */
const CATEGORY_LABELS: Record<ItemCategory, string> = {
  arma: 'Arma',
  armadura: 'Armadura',
  escudo: 'Escudo',
  ferramenta: 'Ferramenta',
  consumivel: 'Consumível',
  material: 'Material',
  magico: 'Mágico',
  diversos: 'Diversos',
};

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Sidebar de Detalhes de Item
 *
 * Permite editar informações detalhadas de um item:
 * - Nome, descrição e categoria
 * - Quantidade e peso
 * - Valor e status de equipado
 * - Tags personalizadas
 * - Propriedades mecânicas customizadas
 * - Notas e observações
 *
 * @example
 * ```tsx
 * <ItemDetailsSidebar
 *   open={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   item={selectedItem}
 *   onUpdate={(item) => updateItem(item)}
 * />
 * ```
 */
export function ItemDetailsSidebar({
  open,
  onClose,
  item,
  onUpdate,
}: ItemDetailsSidebarProps) {
  // Estado local do item sendo editado
  const [localItem, setLocalItem] = useState<InventoryItem | null>(item);

  // Estado para tags customizadas
  const [newTag, setNewTag] = useState('');

  // Debounce para auto-save
  const debouncedItem = useDebounce(localItem, 500);

  /**
   * Sincroniza estado local com props quando o item externo muda
   */
  useEffect(() => {
    if (open && item) {
      setLocalItem(item);
    }
  }, [open, item]);

  /**
   * Auto-save quando o item debounced muda
   */
  useEffect(() => {
    if (debouncedItem && localItem && open) {
      // Só salva se houve mudança real
      if (JSON.stringify(debouncedItem) !== JSON.stringify(item)) {
        onUpdate(debouncedItem);
      }
    }
  }, [debouncedItem]);

  /**
   * Atualiza campo do item local
   */
  const updateField = <K extends keyof InventoryItem>(
    field: K,
    value: InventoryItem[K]
  ) => {
    if (!localItem) return;
    setLocalItem({ ...localItem, [field]: value });
  };

  /**
   * Atualiza propriedade customizada
   */
  const updateCustomProperty = (key: string, value: any) => {
    if (!localItem) return;
    const customProperties = {
      ...(localItem.customProperties || {}),
      [key]: value,
    };
    setLocalItem({ ...localItem, customProperties });
  };

  /**
   * Remove propriedade customizada
   */
  const removeCustomProperty = (key: string) => {
    if (!localItem || !localItem.customProperties) return;
    const customProperties = { ...localItem.customProperties };
    delete customProperties[key];
    setLocalItem({ ...localItem, customProperties });
  };

  /**
   * Adiciona tag
   */
  const addTag = () => {
    if (!localItem || !newTag.trim()) return;

    const tags = (localItem.customProperties?.tags as string[]) || [];
    if (!tags.includes(newTag.trim())) {
      updateCustomProperty('tags', [...tags, newTag.trim()]);
    }
    setNewTag('');
  };

  /**
   * Remove tag
   */
  const removeTag = (tag: string) => {
    if (!localItem) return;

    const tags = (localItem.customProperties?.tags as string[]) || [];
    updateCustomProperty(
      'tags',
      tags.filter((t) => t !== tag)
    );
  };

  /**
   * Renderiza campo de notas
   */
  const renderNotes = () => {
    if (!localItem) return null;

    const notes = (localItem.customProperties?.notes as string) || '';

    return (
      <TextField
        label="Notas e Observações"
        value={notes}
        onChange={(e) => updateCustomProperty('notes', e.target.value)}
        multiline
        rows={4}
        fullWidth
        placeholder="Adicione observações, história do item, ou detalhes adicionais..."
        helperText="Campo livre para anotações sobre o item"
      />
    );
  };

  /**
   * Renderiza propriedades mecânicas
   */
  const renderMechanicalProperties = () => {
    if (!localItem) return null;

    const mechanicalProps =
      (localItem.customProperties?.mechanical as Record<string, string>) || {};

    return (
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Propriedades Mecânicas
          </Typography>
          <Tooltip title="Adicionar propriedade mecânica">
            <IconButton
              size="small"
              onClick={() => {
                const key = prompt('Nome da propriedade:');
                if (key) {
                  const value = prompt('Valor da propriedade:');
                  if (value !== null) {
                    const mechanical = { ...mechanicalProps, [key]: value };
                    updateCustomProperty('mechanical', mechanical);
                  }
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {Object.entries(mechanicalProps).length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhuma propriedade mecânica definida. Clique em + para adicionar.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {Object.entries(mechanicalProps).map(([key, value]) => (
              <Stack key={key} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Propriedade"
                  value={key}
                  onChange={(e) => {
                    const mechanical = { ...mechanicalProps };
                    delete mechanical[key];
                    mechanical[e.target.value] = value;
                    updateCustomProperty('mechanical', mechanical);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Valor"
                  value={value}
                  onChange={(e) => {
                    const mechanical = {
                      ...mechanicalProps,
                      [key]: e.target.value,
                    };
                    updateCustomProperty('mechanical', mechanical);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const mechanical = { ...mechanicalProps };
                    delete mechanical[key];
                    updateCustomProperty('mechanical', mechanical);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  /**
   * Renderiza tags
   */
  const renderTags = () => {
    if (!localItem) return null;

    const tags = (localItem.customProperties?.tags as string[]) || [];

    return (
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Tags
          </Typography>
          <LabelIcon fontSize="small" color="action" />
        </Stack>

        {/* Input para adicionar tag */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            label="Nova tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            size="small"
            fullWidth
            placeholder="Ex: Importante, Raro, Quest..."
          />
          <IconButton
            size="small"
            onClick={addTag}
            disabled={!newTag.trim()}
            color="primary"
          >
            <AddIcon />
          </IconButton>
        </Stack>

        {/* Lista de tags */}
        {tags.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => removeTag(tag)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            Nenhuma tag adicionada. Use tags para organizar seus itens.
          </Alert>
        )}
      </Box>
    );
  };

  // Não renderiza se não há item
  if (!localItem) {
    return (
      <Sidebar
        open={open}
        onClose={onClose}
        title="Detalhes do Item"
        size="medium"
      >
        <Alert severity="warning">Nenhum item selecionado</Alert>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title="Detalhes do Item"
      size="medium"
    >
      <Stack spacing={3}>
        {/* Informações Básicas */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Informações Básicas
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            {/* Nome */}
            <TextField
              label="Nome do Item"
              value={localItem.name}
              onChange={(e) => updateField('name', e.target.value)}
              fullWidth
              required
            />

            {/* Categoria */}
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={localItem.category}
                onChange={(e: SelectChangeEvent) =>
                  updateField('category', e.target.value as ItemCategory)
                }
                label="Categoria"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Descrição Curta */}
            <TextField
              label="Descrição Curta"
              value={localItem.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              multiline
              rows={2}
              fullWidth
              placeholder="Breve descrição do item..."
              helperText="Aparece na lista de inventário"
            />

            {/* Equipado */}
            <FormControlLabel
              control={
                <Switch
                  checked={localItem.equipped}
                  onChange={(e) => updateField('equipped', e.target.checked)}
                />
              }
              label="Item Equipado"
            />
          </Stack>
        </Box>

        {/* Quantidade e Peso */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Quantidade e Peso
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            {/* Quantidade */}
            <TextField
              label="Quantidade"
              type="number"
              value={localItem.quantity}
              onChange={(e) =>
                updateField(
                  'quantity',
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />

            {/* Peso */}
            <TextField
              label="Peso Unitário"
              type="number"
              value={localItem.weight === null ? '' : localItem.weight}
              onChange={(e) => {
                const value = e.target.value;
                updateField('weight', value === '' ? null : parseFloat(value));
              }}
              fullWidth
              helperText="Deixe em branco para item sem peso. Peso 0: 5 itens = 1 peso total."
              inputProps={{ step: 1 }}
            />

            {/* Valor */}
            <TextField
              label="Valor (em PO$)"
              type="number"
              value={localItem.value}
              onChange={(e) =>
                updateField(
                  'value',
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Stack>
        </Box>

        {/* Tags */}
        {renderTags()}

        {/* Propriedades Mecânicas */}
        {renderMechanicalProperties()}

        {/* Notas */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Notas e Observações
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderNotes()}
        </Box>

        {/* Info de auto-save */}
        <Alert severity="info" icon={<InfoIcon />}>
          Alterações são salvas automaticamente
        </Alert>
      </Stack>
    </Sidebar>
  );
}
