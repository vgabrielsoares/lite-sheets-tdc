'use client';

/**
 * NoteViewSidebar - Sidebar para Visualização e Edição de Notas
 *
 * Permite visualizar uma nota completa e opcionalmente editá-la.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar } from '@/components/shared/Sidebar';
import type { Note } from '@/types';

export interface NoteViewSidebarProps {
  /** Se a sidebar está aberta */
  open: boolean;
  /** Callback para fechar a sidebar */
  onClose: () => void;
  /** Nota sendo visualizada */
  note: Note | null;
  /** Callback para atualizar nota */
  onUpdate: (noteData: Partial<Note>) => void;
  /** Callback para fixar/desafixar nota */
  onTogglePin: (noteId: string) => void;
  /** Callback para excluir nota */
  onDelete: (noteId: string) => void;
  /** Categorias disponíveis */
  availableCategories?: string[];
}

/**
 * Formata data para exibição
 */
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Sidebar para Visualização de Nota
 */
export function NoteViewSidebar({
  open,
  onClose,
  note,
  onUpdate,
  onTogglePin,
  onDelete,
  availableCategories = [],
}: NoteViewSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Sincronizar com nota quando mudar
  useEffect(() => {
    if (note) {
      setLocalTitle(note.title);
      setLocalContent(note.content);
      setLocalCategory(note.category || '');
      setLocalTags(note.tags);
    }
  }, [note]);

  // Resetar modo de edição ao fechar
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  if (!note) {
    return null;
  }

  /**
   * Ativa modo de edição
   */
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  /**
   * Cancela edição
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalCategory(note.category || '');
    setLocalTags(note.tags);
    setTagInput('');
  };

  /**
   * Salva alterações
   */
  const handleSave = () => {
    if (!localTitle.trim()) {
      return;
    }

    onUpdate({
      id: note.id,
      title: localTitle.trim(),
      content: localContent.trim(),
      category: localCategory.trim() || undefined,
      tags: localTags,
    });

    setIsEditing(false);
  };

  /**
   * Adiciona tag ao pressionar Enter
   */
  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!localTags.includes(newTag)) {
        setLocalTags([...localTags, newTag]);
      }
      setTagInput('');
    }
  };

  /**
   * Remove tag
   */
  const handleDeleteTag = (tagToDelete: string) => {
    setLocalTags(localTags.filter((tag) => tag !== tagToDelete));
  };

  /**
   * Fixa/desafixa nota
   */
  const handleTogglePin = () => {
    onTogglePin(note.id);
  };

  /**
   * Exclui nota e fecha sidebar
   */
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editando Nota' : 'Visualizar Nota'}
      width="lg"
    >
      <Stack spacing={3}>
        {/* Ações do Header */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title={note.pinned ? 'Desafixar nota' : 'Fixar nota'}>
            <IconButton
              size="small"
              onClick={handleTogglePin}
              color={note.pinned ? 'warning' : 'default'}
            >
              {note.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </IconButton>
          </Tooltip>

          {!isEditing && (
            <Tooltip title="Editar nota">
              <IconButton
                size="small"
                onClick={handleStartEdit}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Excluir nota">
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Modo de Visualização */}
        {!isEditing && (
          <>
            {/* Título */}
            <Box>
              <Typography variant="h5" gutterBottom>
                {note.title}
              </Typography>
            </Box>

            {/* Categoria */}
            {note.category && (
              <Box>
                <Chip
                  label={note.category}
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ gap: 1 }}
              >
                {note.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            )}

            {/* Conteúdo */}
            <Box>
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {note.content || 'Sem conteúdo'}
              </Typography>
            </Box>

            <Divider />

            {/* Timestamps */}
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Criado em: {formatDate(note.createdAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Atualizado em: {formatDate(note.updatedAt)}
              </Typography>
            </Stack>
          </>
        )}

        {/* Modo de Edição */}
        {isEditing && (
          <>
            {/* Título */}
            <TextField
              label="Título"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              fullWidth
              required
              error={!localTitle.trim()}
              helperText={!localTitle.trim() ? 'Título é obrigatório' : ''}
              inputProps={{ maxLength: 100 }}
            />

            {/* Conteúdo */}
            <TextField
              label="Conteúdo"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              fullWidth
              multiline
              rows={12}
              placeholder="Escreva o conteúdo da nota..."
            />

            {/* Categoria */}
            <TextField
              label="Categoria"
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              fullWidth
              placeholder="Ex: Missão, NPC, Local..."
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

              {localTags.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 2, gap: 1 }}
                >
                  {localTags.map((tag) => (
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

            {/* Botões de Ação */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={handleCancelEdit}
                startIcon={<CancelIcon />}
                color="inherit"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!localTitle.trim()}
              >
                Salvar
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Sidebar>
  );
}
