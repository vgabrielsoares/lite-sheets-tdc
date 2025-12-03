/**
 * CraftsDisplay - Componente para exibir e gerenciar ofícios (competências)
 *
 * Permite adicionar, editar e remover ofícios customizados do personagem.
 * Cada ofício tem: nome, nível (0-5), atributo-chave, modificadores de dados e numéricos.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { Craft, AttributeName } from '@/types';
import { ConfirmDialog } from '@/components/shared';
import { CraftForm } from './CraftForm';
import { getCraftMultiplier } from '@/utils/calculations';

interface CraftsDisplayProps {
  /** Lista de ofícios do personagem */
  crafts: Craft[];
  /** Atributos do personagem (para cálculo de modificador) */
  attributes: Record<AttributeName, number>;
  /** Callback ao adicionar um ofício */
  onAdd: (craft: Omit<Craft, 'id'>) => void;
  /** Callback ao atualizar um ofício */
  onUpdate: (craftId: string, updates: Partial<Craft>) => void;
  /** Callback ao remover um ofício */
  onRemove: (craftId: string) => void;
}

/**
 * Retorna rótulo de nível do ofício
 */
function getCraftLevelLabel(level: 0 | 1 | 2 | 3 | 4 | 5): string {
  if (level === 0) return 'Leigo';
  if (level <= 2) return `Nível ${level}`;
  if (level <= 4) return `Nível ${level}`;
  return 'Mestre';
}

/**
 * Retorna cor semântica por nível
 */
function getCraftLevelColor(
  level: 0 | 1 | 2 | 3 | 4 | 5
): 'default' | 'primary' | 'secondary' | 'success' {
  if (level === 0) return 'default';
  if (level <= 2) return 'primary';
  if (level <= 4) return 'secondary';
  return 'success';
}

export function CraftsDisplay({
  crafts,
  attributes,
  onAdd,
  onUpdate,
  onRemove,
}: CraftsDisplayProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCraft, setEditingCraft] = useState<Craft | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [craftToDelete, setCraftToDelete] = useState<string | null>(null);

  const handleAdd = (craft: Omit<Craft, 'id'>) => {
    onAdd(craft);
    setIsFormOpen(false);
  };

  const handleEdit = (craft: Craft) => {
    setEditingCraft(craft);
    setIsFormOpen(true);
  };

  const handleUpdate = (updates: Omit<Craft, 'id'>) => {
    if (editingCraft) {
      onUpdate(editingCraft.id, updates);
      setIsFormOpen(false);
      setEditingCraft(null);
    }
  };

  const handleDeleteClick = (craftId: string) => {
    setCraftToDelete(craftId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (craftToDelete) {
      onRemove(craftToDelete);
      setDeleteConfirmOpen(false);
      setCraftToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCraft(null);
  };

  /**
   * Calcula o modificador base de um ofício (atributo × multiplicador de nível)
   */
  const calculateBaseModifier = (craft: Craft): number => {
    const attributeValue = attributes[craft.attributeKey];
    const multiplier = getCraftMultiplier(craft.level);
    return attributeValue * multiplier;
  };

  /**
   * Calcula o modificador total (base + numérico)
   */
  const calculateTotalModifier = (craft: Craft): number => {
    return calculateBaseModifier(craft) + (craft.numericModifier || 0);
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" component="h3">
          Ofícios (Competências)
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          Adicionar Ofício
        </Button>
      </Stack>

      {crafts.length === 0 ? (
        <Card
          sx={{
            bgcolor: 'background.default',
            border: '2px dashed',
            borderColor: 'divider',
            textAlign: 'center',
            py: 4,
          }}
        >
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Nenhum ofício cadastrado. Adicione ofícios customizados para seu
              personagem.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {crafts.map((craft) => (
            <Card
              key={craft.id}
              sx={{
                borderRadius: 2,
                transition:
                  'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[6],
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" component="h4">
                      {craft.name}
                    </Typography>
                    <Chip
                      label={getCraftLevelLabel(craft.level)}
                      color={getCraftLevelColor(craft.level)}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Editar ofício">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(craft)}
                        aria-label={`Editar ${craft.name}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remover ofício">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(craft.id)}
                        aria-label={`Remover ${craft.name}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Atributo:{' '}
                      <strong style={{ textTransform: 'capitalize' }}>
                        {craft.attributeKey}
                      </strong>{' '}
                      ({attributes[craft.attributeKey]})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="bold"
                    >
                      Modificador: +{calculateTotalModifier(craft)}
                    </Typography>
                  </Stack>

                  {(craft.diceModifier !== 0 ||
                    craft.numericModifier !== 0) && (
                    <Typography variant="caption" color="text.secondary">
                      Modificadores adicionais:
                      {craft.diceModifier !== 0 &&
                        ` ${craft.diceModifier > 0 ? '+' : ''}${craft.diceModifier}d20`}
                      {craft.numericModifier !== 0 &&
                        ` ${craft.numericModifier > 0 ? '+' : ''}${craft.numericModifier}`}
                    </Typography>
                  )}

                  {craft.description && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {craft.description}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Form Dialog */}
      <CraftForm
        open={isFormOpen}
        craft={editingCraft}
        attributes={attributes}
        onSave={editingCraft ? handleUpdate : handleAdd}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remover Ofício"
        message="Tem certeza que deseja remover este ofício? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCraftToDelete(null);
        }}
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </Box>
  );
}
