/**
 * NoteCard Component - Cartão de exibição de uma nota
 *
 * Componente responsável por exibir uma nota individual com suas informações,
 * permitindo ações como fixar/desafixar, editar e excluir.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Stack,
  Tooltip,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Note } from '@/types';

/**
 * Props do componente NoteCard
 */
export interface NoteCardProps {
  /** Nota a ser exibida */
  note: Note;
  /** Callback para fixar/desafixar a nota */
  onTogglePin: (noteId: string) => void;
  /** Callback para editar a nota */
  onEdit: (noteId: string) => void;
  /** Callback para excluir a nota */
  onDelete: (noteId: string) => void;
  /** Callback para visualizar nota (abre sidebar) */
  onView?: (noteId: string) => void;
}

/**
 * Formata data para exibição
 */
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    return diffInMinutes <= 1
      ? 'agora há pouco'
      : `há ${diffInMinutes} minutos`;
  }

  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Componente NoteCard
 */
export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onTogglePin,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <Card
      onClick={() => onView?.(note.id)}
      sx={{
        position: 'relative',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        cursor: onView ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
        ...(note.pinned && {
          borderLeft: 4,
          borderColor: 'warning.main',
        }),
      }}
    >
      <CardContent>
        {/* Header com título e botão de pin */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              flex: 1,
              wordBreak: 'break-word',
              pr: 1,
            }}
          >
            {note.title}
          </Typography>

          <Tooltip title={note.pinned ? 'Desafixar nota' : 'Fixar nota'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              aria-label={note.pinned ? 'Desafixar nota' : 'Fixar nota'}
              sx={{
                color: note.pinned ? 'warning.main' : 'text.secondary',
                '&:hover': {
                  color: 'warning.main',
                },
              }}
            >
              {note.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Conteúdo da nota */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {note.content || 'Sem conteúdo'}
        </Typography>

        {/* Tags */}
        {note.tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Stack>
        )}

        {/* Categoria */}
        {note.category && (
          <Box sx={{ mt: note.tags.length > 0 ? 1 : 0 }}>
            <Chip
              label={note.category}
              size="small"
              color="primary"
              variant="filled"
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
              }}
            />
          </Box>
        )}

        {/* Timestamp */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', mt: 2 }}
        >
          {formatDate(note.updatedAt)}
        </Typography>
      </CardContent>

      {/* Ações */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Editar nota">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note.id);
            }}
            aria-label="Editar nota"
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Excluir nota">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            aria-label="Excluir nota"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default NoteCard;
