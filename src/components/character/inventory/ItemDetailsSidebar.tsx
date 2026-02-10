/**
 * ItemDetailsSidebar - Sidebar de Detalhes de Item
 *
 * Sidebar complementar para visualizar resumo do item e editar dados estendidos
 * (tags e notas). Informações básicas são exibidas em modo leitura —
 * para editá-las o jogador usa o dialog de edição na lista do inventário.
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
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import LabelIcon from '@mui/icons-material/Label';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Sidebar } from '@/components/shared';
import type { InventoryItem } from '@/types/inventory';
import { CATEGORY_LABELS } from '@/constants/inventory';
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

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Sidebar de Detalhes de Item
 *
 * Exibe resumo das informações básicas do item (somente leitura)
 * e permite editar dados complementares:
 * - Tags personalizadas
 * - Notas e observações
 *
 * Para editar informações básicas (nome, categoria, quantidade, espaço, valor,
 * equipado, durabilidade), utilize o dialog de edição na lista do inventário.
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
      <Sidebar open={open} onClose={onClose} title="Detalhes do Item">
        <Alert severity="warning">Nenhum item selecionado</Alert>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title={localItem.name || 'Detalhes do Item'}
    >
      <Stack spacing={3}>
        {/* Resumo do Item (somente leitura) */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Informações do Item
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            {/* Categoria */}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Categoria
              </Typography>
              <Chip
                label={
                  CATEGORY_LABELS[localItem.category] || localItem.category
                }
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* Descrição */}
            {localItem.description && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {localItem.description}
                </Typography>
              </Box>
            )}

            {/* Quantidade / Espaço / Valor */}
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Quantidade
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {localItem.quantity}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Espaço
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {localItem.weight === null || localItem.weight === undefined
                    ? '—'
                    : localItem.weight}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Valor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {localItem.value > 0 ? `${localItem.value} PO$` : '—'}
                </Typography>
              </Box>
            </Stack>

            {/* Estado */}
            <Stack direction="row" spacing={1}>
              {localItem.equipped && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Equipado"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {localItem.durability && (
                <Chip
                  label={`Durabilidade: ${localItem.durability.currentDie}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Tags */}
        {renderTags()}

        {/* Notas */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Notas e Observações
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderNotes()}
        </Box>

        {/* Info */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ fontSize: '0.8rem' }}>
          Para editar informações básicas, use o botão de edição na lista de
          itens. Tags e notas são salvas automaticamente.
        </Alert>
      </Stack>
    </Sidebar>
  );
}
