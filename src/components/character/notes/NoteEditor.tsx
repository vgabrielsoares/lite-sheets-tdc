/**
 * NoteEditor Component - Editor de notas
 *
 * Componente responsável por criar e editar notas com auto-save.
 * Permite entrada de título, conteúdo, tags e categoria.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import type { Note } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Props do componente NoteEditor
 */
export interface NoteEditorProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Nota sendo editada (undefined para nova nota) */
  note?: Note;
  /** Categorias disponíveis para sugestão */
  availableCategories?: string[];
  /** Tags disponíveis para sugestão */
  availableTags?: string[];
  /** Callback ao salvar */
  onSave: (noteData: Partial<Note>) => void;
  /** Callback ao cancelar */
  onCancel: () => void;
}

/**
 * Componente NoteEditor
 */
export const NoteEditor: React.FC<NoteEditorProps> = ({
  open,
  note,
  availableCategories = [],
  availableTags = [],
  onSave,
  onCancel,
}) => {
  // Estado local do formulário
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Estado de salvamento
  const [isSaving, setIsSaving] = useState(false);

  // Debounce para auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedCategory = useDebounce(category, 1000);

  // Flag de inicialização para evitar auto-save no carregamento
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Inicializa o formulário com os dados da nota
   */
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category || null);
      setTags(note.tags);
    } else {
      setTitle('');
      setContent('');
      setCategory(null);
      setTags([]);
    }
    setIsInitialized(false);
  }, [note, open]);

  /**
   * Marca como inicializado após primeira renderização
   */
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsInitialized(true), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /**
   * Auto-save quando qualquer campo mudar (apenas para edição)
   */
  useEffect(() => {
    if (!note || !open || !isInitialized) return;

    const hasChanges =
      debouncedTitle !== note.title ||
      debouncedContent !== note.content ||
      debouncedCategory !== (note.category || null) ||
      JSON.stringify(tags.sort()) !== JSON.stringify([...note.tags].sort());

    if (hasChanges && debouncedTitle.trim()) {
      handleAutoSave();
    }
  }, [debouncedTitle, debouncedContent, debouncedCategory, tags]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Auto-save silencioso
   */
  const handleAutoSave = useCallback(() => {
    if (!note || !isInitialized) return;

    setIsSaving(true);

    onSave({
      id: note.id,
      title: title.trim(),
      content: content.trim(),
      category: category || undefined,
      tags,
    });

    // Simula delay de salvamento
    setTimeout(() => setIsSaving(false), 300);
  }, [note, title, content, category, tags, onSave, isInitialized]);

  /**
   * Salva a nota e fecha o dialog
   */
  const handleSaveAndClose = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      ...(note && { id: note.id }),
      title: title.trim(),
      content: content.trim(),
      category: category || undefined,
      tags,
    });

    handleCancel();
  };

  /**
   * Cancela e limpa o formulário
   */
  const handleCancel = () => {
    setTitle('');
    setContent('');
    setCategory(null);
    setTags([]);
    setTagInput('');
    onCancel();
  };

  /**
   * Adiciona tag ao pressionar Enter
   */
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  /**
   * Remove tag
   */
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="note-editor-title"
    >
      <DialogTitle id="note-editor-title">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">
            {note ? 'Editar Nota' : 'Nova Nota'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSaving && (
              <Typography variant="caption" color="text.secondary">
                Salvando...
              </Typography>
            )}
            <IconButton
              edge="end"
              onClick={handleCancel}
              aria-label="Fechar"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Título */}
          <TextField
            autoFocus
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            error={!title.trim() && title.length > 0}
            helperText={
              !title.trim() && title.length > 0 ? 'Título é obrigatório' : ''
            }
            inputProps={{
              maxLength: 100,
            }}
          />

          {/* Conteúdo */}
          <TextField
            label="Conteúdo"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={8}
            placeholder="Escreva o conteúdo da nota..."
          />

          {/* Categoria */}
          <Autocomplete
            freeSolo
            options={availableCategories}
            value={category}
            onChange={(_, newValue) => setCategory(newValue)}
            onInputChange={(_, newInputValue) => {
              // Captura texto digitado diretamente
              if (newInputValue !== category) {
                setCategory(newInputValue || null);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoria"
                placeholder="Ex: Missão, NPC, Local..."
              />
            )}
          />

          {/* Tags */}
          <Box>
            <TextField
              label="Adicionar Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              fullWidth
              placeholder="Digite e pressione Enter para adicionar"
              helperText="Pressione Enter para adicionar uma tag"
            />

            {tags.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ mt: 2, gap: 1 }}
              >
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSaveAndClose}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!title.trim()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteEditor;
