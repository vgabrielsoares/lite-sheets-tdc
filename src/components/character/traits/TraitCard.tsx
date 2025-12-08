/**
 * TraitCard - Componente de Card para Características
 *
 * Componente reutilizável para exibir características (complementares ou completas)
 * com opções de edição e remoção.
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  TextField,
  Button,
  Stack,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ComplementaryTrait, CompleteTrait } from '@/types/character';

export interface TraitCardProps {
  /** Característica a ser exibida */
  trait: ComplementaryTrait | CompleteTrait;
  /** Tipo da característica */
  type: 'complementary' | 'complete';
  /** Callback ao atualizar a característica */
  onUpdate: (trait: ComplementaryTrait | CompleteTrait) => void;
  /** Callback ao remover a característica */
  onRemove: () => void;
  /** Cor do chip de pontos (para características complementares) */
  pointsColor?: 'error' | 'success';
}

/**
 * Card para exibir e editar características do personagem
 *
 * Features:
 * - Exibição compacta do nome e pontos
 * - Expansão para ver descrição completa
 * - Modo de edição inline
 * - Suporte a características complementares e completas
 */
export function TraitCard({
  trait,
  type,
  onUpdate,
  onRemove,
  pointsColor,
}: TraitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrait, setEditedTrait] = useState(trait);

  const isComplementary = type === 'complementary';
  const complementaryTrait = isComplementary
    ? (trait as ComplementaryTrait)
    : null;

  const handleToggleExpand = () => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleStartEdit = () => {
    setEditedTrait(trait);
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleCancelEdit = () => {
    setEditedTrait(trait);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedTrait.name.trim()) {
      onUpdate(editedTrait);
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setEditedTrait({ ...editedTrait, [field]: value });
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: isExpanded ? 2 : 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              cursor: isEditing ? 'default' : 'pointer',
            }}
            onClick={handleToggleExpand}
          >
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                label="Nome da Característica"
                value={editedTrait.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ mb: 1 }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {trait.name || '(Sem nome)'}
                </Typography>
                {isComplementary && complementaryTrait && (
                  <Chip
                    label={`${complementaryTrait.points > 0 ? '+' : ''}${complementaryTrait.points}`}
                    color={pointsColor}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isEditing ? (
              <>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleSaveEdit}
                  aria-label="Salvar"
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancelEdit}
                  aria-label="Cancelar"
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={handleStartEdit}
                  aria-label="Editar"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={onRemove}
                  aria-label="Remover"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleToggleExpand}
                  aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                  sx={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Expanded Content */}
        <Collapse in={isExpanded}>
          <Stack spacing={2}>
            {/* Points field for complementary traits */}
            {isComplementary && isEditing && (
              <TextField
                type="number"
                size="small"
                label="Pontos"
                value={(editedTrait as ComplementaryTrait).points}
                onChange={(e) =>
                  handleFieldChange('points', parseInt(e.target.value) || 0)
                }
                inputProps={{ step: 1 }}
                helperText="Negativo para desvantagens, positivo para vantagens"
              />
            )}

            {/* Description */}
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Descrição"
                value={editedTrait.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                placeholder="Descreva os efeitos e mecânicas desta característica..."
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {trait.description || '(Sem descrição)'}
              </Typography>
            )}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}
