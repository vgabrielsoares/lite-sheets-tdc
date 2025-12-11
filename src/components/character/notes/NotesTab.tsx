/**
 * NotesTab Component - Tab principal do sistema de notas
 *
 * Componente responsável por orquestrar todo o sistema de notas,
 * incluindo listagem, busca, filtros e edição.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Note, NotesFilter } from '@/types';
import { DEFAULT_NOTES_FILTER } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { NotesSearch } from './NotesSearch';
import { NotesFilters } from './NotesFilters';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { uuidv4 } from '@/utils/uuid';

/**
 * Props do componente NotesTab
 */
export interface NotesTabProps {
  /** ID do personagem */
  characterId: string;
  /** Notas do personagem */
  notes: Note[];
  /** Callback ao atualizar notas */
  onUpdateNotes: (notes: Note[]) => void;
  /** Callback para abrir sidebar de visualização (opcional) */
  onViewNote?: (noteId: string) => void;
}

/**
 * Componente NotesTab
 */
export const NotesTab: React.FC<NotesTabProps> = ({
  characterId,
  notes,
  onUpdateNotes,
  onViewNote,
}) => {
  // Estado de busca
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Estado de filtros
  const [filters, setFilters] = useState<NotesFilter>(DEFAULT_NOTES_FILTER);

  // Estado do editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  // Estado de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  /**
   * Filtros completos com busca
   */
  const completeFilters: NotesFilter = useMemo(
    () => ({
      ...filters,
      searchTerm: debouncedSearchTerm,
    }),
    [filters, debouncedSearchTerm]
  );

  /**
   * Extrai categorias disponíveis das notas
   */
  const availableCategories = useMemo(() => {
    const categories = notes
      .map((note) => note.category)
      .filter((cat): cat is string => !!cat);
    return Array.from(new Set(categories)).sort();
  }, [notes]);

  /**
   * Extrai tags disponíveis das notas
   */
  const availableTags = useMemo(() => {
    const tags = notes.flatMap((note) => note.tags);
    return Array.from(new Set(tags)).sort();
  }, [notes]);

  /**
   * Abre editor para nova nota
   */
  const handleNewNote = () => {
    setEditingNote(undefined);
    setEditorOpen(true);
  };

  /**
   * Abre editor para editar nota existente
   */
  const handleEditNote = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setEditingNote(note);
        setEditorOpen(true);
      }
    },
    [notes]
  );

  /**
   * Salva nota (criar ou atualizar)
   */
  const handleSaveNote = useCallback(
    (noteData: Partial<Note>) => {
      const now = new Date().toISOString();

      if (noteData.id) {
        // Atualizar nota existente
        const updatedNotes = notes.map((note) =>
          note.id === noteData.id
            ? {
                ...note,
                ...noteData,
                updatedAt: now,
              }
            : note
        );
        onUpdateNotes(updatedNotes);
      } else {
        // Criar nova nota
        const newNote: Note = {
          id: uuidv4(),
          title: noteData.title || '',
          content: noteData.content || '',
          tags: noteData.tags || [],
          category: noteData.category,
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };
        onUpdateNotes([...notes, newNote]);
      }
    },
    [notes, onUpdateNotes]
  );

  /**
   * Fecha editor
   */
  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingNote(undefined);
  };

  /**
   * Fixa/desafixa nota
   */
  const handleTogglePin = useCallback(
    (noteId: string) => {
      const updatedNotes = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      );
      onUpdateNotes(updatedNotes);
    },
    [notes, onUpdateNotes]
  );

  /**
   * Abre dialog de confirmação de exclusão
   */
  const handleDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Confirma exclusão da nota
   */
  const handleConfirmDelete = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter((note) => note.id !== noteToDelete);
      onUpdateNotes(updatedNotes);
      setNoteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  /**
   * Cancela exclusão
   */
  const handleCancelDelete = () => {
    setNoteToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header com busca e botão de nova nota */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <NotesSearch value={searchTerm} onChange={setSearchTerm} />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewNote}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Nova Nota
          </Button>
        </Box>

        {/* Filtros */}
        {(availableCategories.length > 0 || availableTags.length > 0) && (
          <NotesFilters
            filters={filters}
            onChange={setFilters}
            availableCategories={availableCategories}
            availableTags={availableTags}
          />
        )}

        {/* Lista de notas */}
        <NotesList
          notes={notes}
          filters={completeFilters}
          onTogglePin={handleTogglePin}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onView={onViewNote}
        />
      </Stack>

      {/* Editor de nota */}
      <NoteEditor
        open={editorOpen}
        note={editingNote}
        availableCategories={availableCategories}
        availableTags={availableTags}
        onSave={handleSaveNote}
        onCancel={handleCloseEditor}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta nota? Esta ação não pode ser
            desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesTab;
