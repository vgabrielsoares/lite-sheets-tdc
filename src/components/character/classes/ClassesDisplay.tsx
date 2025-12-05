'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Info as InfoIcon } from '@mui/icons-material';
import type { CharacterClass, ArchetypeName } from '@/types';
import { ConfirmDialog } from '@/components/shared';
import {
  MAX_CLASSES,
  validateClassLevels,
  getAvailableClassLevels,
} from '@/constants/classes';
import ClassCard from './ClassCard';
import ClassForm from './ClassForm';

interface ClassesDisplayProps {
  /** Classes do personagem */
  classes: CharacterClass[];
  /** Nível total do personagem */
  characterLevel: number;
  /** Callback quando classes são alteradas */
  onClassesChange: (classes: CharacterClass[]) => void;
  /** Se edição está desabilitada */
  disabled?: boolean;
}

/**
 * ClassesDisplay - Exibe e gerencia as classes do personagem
 *
 * Regras implementadas:
 * - Máximo de 3 classes por personagem
 * - Soma dos níveis das classes ≤ nível do personagem
 * - Cada classe é composta por 1 ou 2 arquétipos
 */
export function ClassesDisplay({
  classes,
  characterLevel,
  onClassesChange,
  disabled = false,
}: ClassesDisplayProps) {
  const theme = useTheme();

  // Estado do formulário
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<
    CharacterClass | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<CharacterClass | null>(
    null
  );

  // Calcular níveis usados e disponíveis
  const usedClassLevels = useMemo(() => {
    return classes.reduce((sum, c) => sum + c.level, 0);
  }, [classes]);

  const availableClassLevels = useMemo(() => {
    return getAvailableClassLevels(
      classes.map((c) => c.level),
      characterLevel
    );
  }, [classes, characterLevel]);

  // Verificar se pode adicionar mais classes
  const canAddClass = useMemo(() => {
    return classes.length < MAX_CLASSES && availableClassLevels > 0;
  }, [classes.length, availableClassLevels]);

  // Handler para adicionar nova classe
  const handleAddClick = useCallback(() => {
    setEditingClass(undefined);
    setFormOpen(true);
  }, []);

  // Handler para editar classe
  const handleEditClass = useCallback((characterClass: CharacterClass) => {
    setEditingClass(characterClass);
    setFormOpen(true);
  }, []);

  // Handler para confirmar deleção
  const handleDeleteClick = useCallback((characterClass: CharacterClass) => {
    setClassToDelete(characterClass);
    setDeleteConfirmOpen(true);
  }, []);

  // Handler para deletar classe
  const handleConfirmDelete = useCallback(() => {
    if (classToDelete) {
      const updatedClasses = classes.filter(
        (c) => c.name !== classToDelete.name
      );
      onClassesChange(updatedClasses);
    }
    setDeleteConfirmOpen(false);
    setClassToDelete(null);
  }, [classes, classToDelete, onClassesChange]);

  // Handler para salvar classe (adicionar ou editar)
  const handleSaveClass = useCallback(
    (characterClass: CharacterClass) => {
      if (editingClass) {
        // Atualizar classe existente
        const updatedClasses = classes.map((c) =>
          c.name === editingClass.name ? characterClass : c
        );
        onClassesChange(updatedClasses);
      } else {
        // Adicionar nova classe
        onClassesChange([...classes, characterClass]);
      }
      setFormOpen(false);
      setEditingClass(undefined);
    },
    [classes, editingClass, onClassesChange]
  );

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5">Classes</Typography>
          <Tooltip
            title={`As classes funcionam como especializações. Cada personagem pode ter até ${MAX_CLASSES} classes, compostas por 1 ou 2 arquétipos cada.`}
          >
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Stack>
        {!disabled && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            disabled={!canAddClass}
            size="small"
          >
            Adicionar Classe
          </Button>
        )}
      </Stack>

      {/* Resumo de níveis */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Chip
            label={`${classes.length}/${MAX_CLASSES} Classes`}
            color={classes.length >= MAX_CLASSES ? 'warning' : 'default'}
            variant="outlined"
          />
          <Chip
            label={`${usedClassLevels}/${characterLevel} Níveis Usados`}
            color={usedClassLevels > characterLevel ? 'error' : 'default'}
            variant="outlined"
          />
          <Chip
            label={`${availableClassLevels} Níveis Disponíveis`}
            color={availableClassLevels > 0 ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
      </Paper>

      {/* Informação sobre níveis */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A soma dos níveis de classe não pode ultrapassar o nível do personagem.
        Cada classe é composta por 1 ou 2 arquétipos.
      </Typography>

      {/* Lista de classes ou estado vazio */}
      {classes.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nenhuma classe adicionada.</strong> Classes são
            especializações que combinam arquétipos para criar funcionalidades
            únicas. Adicione sua primeira classe para começar!
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={2}>
          {classes.map((characterClass) => (
            <ClassCard
              key={characterClass.name}
              characterClass={characterClass}
              onEdit={() => handleEditClass(characterClass)}
              onDelete={() => handleDeleteClick(characterClass)}
              disabled={disabled}
            />
          ))}
        </Stack>
      )}

      {/* Alerta de limite */}
      {!canAddClass && classes.length >= MAX_CLASSES && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Você atingiu o limite máximo de {MAX_CLASSES} classes.
        </Alert>
      )}

      {!canAddClass &&
        availableClassLevels <= 0 &&
        classes.length < MAX_CLASSES && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Não há níveis disponíveis para adicionar novas classes. Aumente o
            nível do personagem ou reduza o nível de uma classe existente.
          </Alert>
        )}

      {/* Dialog de formulário */}
      <ClassForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingClass(undefined);
        }}
        onSave={handleSaveClass}
        characterLevel={characterLevel}
        usedLevels={usedClassLevels}
        existingClasses={classes}
        editingClass={editingClass}
      />

      {/* Dialog de confirmação de deleção */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remover Classe"
        message={`Tem certeza que deseja remover a classe "${classToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setClassToDelete(null);
        }}
      />
    </Box>
  );
}

export default ClassesDisplay;
