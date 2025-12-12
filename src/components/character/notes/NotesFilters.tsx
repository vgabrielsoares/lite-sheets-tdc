/**
 * NotesFilters Component - Filtros e ordenação para notas
 *
 * Componente responsável por permitir filtrar e ordenar notas
 * por categoria, tags, data e outros critérios.
 */

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
import type { NotesFilter, NotesSortField, SortOrder } from '@/types';

/**
 * Props do componente NotesFilters
 */
export interface NotesFiltersProps {
  /** Filtros atuais */
  filters: NotesFilter;
  /** Callback ao mudar filtros */
  onChange: (filters: NotesFilter) => void;
  /** Categorias disponíveis */
  availableCategories: string[];
  /** Tags disponíveis */
  availableTags: string[];
}

/**
 * Labels para campos de ordenação
 */
const SORT_FIELD_LABELS: Record<NotesSortField, string> = {
  createdAt: 'Data de Criação',
  updatedAt: 'Última Atualização',
  title: 'Título',
};

/**
 * Labels para direção de ordenação
 */
const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: 'Crescente',
  desc: 'Decrescente',
};

/**
 * Componente NotesFilters
 */
export const NotesFilters: React.FC<NotesFiltersProps> = ({
  filters,
  onChange,
  availableCategories,
  availableTags,
}) => {
  /**
   * Atualiza campo de ordenação
   */
  const handleSortByChange = (event: SelectChangeEvent<NotesSortField>) => {
    onChange({
      ...filters,
      sortBy: event.target.value as NotesSortField,
    });
  };

  /**
   * Atualiza direção de ordenação
   */
  const handleSortOrderChange = (event: SelectChangeEvent<SortOrder>) => {
    onChange({
      ...filters,
      sortOrder: event.target.value as SortOrder,
    });
  };

  /**
   * Atualiza categoria
   */
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      category: value === '' ? undefined : value,
    });
  };

  /**
   * Atualiza filtro de tags
   */
  const handleTagsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };

  /**
   * Remove tag do filtro
   */
  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...filters,
      tags: filters.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  /**
   * Atualiza filtro de notas fixadas
   */
  const handlePinnedOnlyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...filters,
      pinnedOnly: event.target.checked,
    });
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* Linha 1: Ordenação */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-by-label">Ordenar por</InputLabel>
            <Select
              labelId="sort-by-label"
              value={filters.sortBy}
              onChange={handleSortByChange}
              label="Ordenar por"
            >
              {Object.entries(SORT_FIELD_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-order-label">Direção</InputLabel>
            <Select
              labelId="sort-order-label"
              value={filters.sortOrder}
              onChange={handleSortOrderChange}
              label="Direção"
            >
              {Object.entries(SORT_ORDER_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={filters.pinnedOnly || false}
                onChange={handlePinnedOnlyChange}
              />
            }
            label="Apenas fixadas"
          />
        </Stack>

        {/* Linha 2: Categoria e Tags */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {availableCategories.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                value={filters.category || ''}
                onChange={handleCategoryChange}
                label="Categoria"
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {availableCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {availableTags.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel id="tags-label">Tags</InputLabel>
              <Select
                labelId="tags-label"
                multiple
                value={filters.tags || []}
                onChange={handleTagsChange}
                label="Tags"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        onDelete={() => handleRemoveTag(value)}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {availableTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotesFilters;
