/**
 * NotesList Component - Lista de notas com filtros e busca
 *
 * Componente responsável por orquestrar a listagem de notas,
 * aplicando filtros, busca e ordenação.
 */

import React, { useMemo } from 'react';
import { Box, Grid, Typography, Stack } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import type { Note, NotesFilter } from '@/types';
import { NoteCard } from './NoteCard';

/**
 * Props do componente NotesList
 */
export interface NotesListProps {
  /** Notas a serem exibidas */
  notes: Note[];
  /** Filtros aplicados */
  filters: NotesFilter;
  /** Callback para fixar/desafixar nota */
  onTogglePin: (noteId: string) => void;
  /** Callback para editar nota */
  onEdit: (noteId: string) => void;
  /** Callback para excluir nota */
  onDelete: (noteId: string) => void;
  /** Callback para visualizar nota (abre sidebar) */
  onView?: (noteId: string) => void;
}

/**
 * Aplica filtros e ordenação às notas
 */
const filterAndSortNotes = (notes: Note[], filters: NotesFilter): Note[] => {
  let filteredNotes = [...notes];

  // Filtro de busca textual
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
    );
  }

  // Filtro de categoria
  if (filters.category) {
    filteredNotes = filteredNotes.filter(
      (note) => note.category === filters.category
    );
  }

  // Filtro de tags (OR - se a nota contém alguma das tags selecionadas)
  if (filters.tags && filters.tags.length > 0) {
    filteredNotes = filteredNotes.filter((note) =>
      filters.tags!.some((tag) => note.tags.includes(tag))
    );
  }

  // Filtro de notas fixadas
  if (filters.pinnedOnly) {
    filteredNotes = filteredNotes.filter((note) => note.pinned);
  }

  // Ordenação
  filteredNotes.sort((a, b) => {
    // Notas fixadas sempre no topo
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Ordenação pelo campo selecionado
    let comparison = 0;

    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title, 'pt-BR');
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredNotes;
};

/**
 * Componente NotesList
 */
export const NotesList: React.FC<NotesListProps> = ({
  notes,
  filters,
  onTogglePin,
  onEdit,
  onDelete,
  onView,
}) => {
  // Aplica filtros e ordenação
  const filteredNotes = useMemo(
    () => filterAndSortNotes(notes, filters),
    [notes, filters]
  );

  // Estado vazio
  if (filteredNotes.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        <NoteAddIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {notes.length === 0
            ? 'Nenhuma nota cadastrada'
            : 'Nenhuma nota encontrada'}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {notes.length === 0
            ? 'Clique no botão "Nova Nota" para começar'
            : 'Tente ajustar os filtros ou busca'}
        </Typography>
      </Box>
    );
  }

  // Separa notas fixadas das não fixadas para exibição
  const pinnedNotes = filteredNotes.filter((note) => note.pinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.pinned);

  return (
    <Stack spacing={3}>
      {/* Notas fixadas */}
      {pinnedNotes.length > 0 && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 2, fontWeight: 600 }}
          >
            Fixadas ({pinnedNotes.length})
          </Typography>
          <Grid container spacing={2}>
            {pinnedNotes.map((note) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                <NoteCard
                  note={note}
                  onTogglePin={onTogglePin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Notas não fixadas */}
      {unpinnedNotes.length > 0 && (
        <Box>
          {pinnedNotes.length > 0 && (
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 2, fontWeight: 600 }}
            >
              Outras ({unpinnedNotes.length})
            </Typography>
          )}
          <Grid container spacing={2}>
            {unpinnedNotes.map((note) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                <NoteCard
                  note={note}
                  onTogglePin={onTogglePin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  );
};

export default NotesList;
