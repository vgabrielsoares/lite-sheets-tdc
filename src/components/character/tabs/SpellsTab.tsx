'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type { Character, SkillName } from '@/types';
import type { KnownSpell, SpellCircle, SpellMatrix } from '@/types/spells';
import { SpellDashboard, SpellList } from '../spells';
import {
  SPELL_CIRCLES,
  SPELL_MATRICES,
  SPELL_CIRCLE_PP_COST,
} from '@/constants/spells';
import { useNotifications } from '@/hooks/useNotifications';

export interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

type SpellDialogMode = 'add' | 'edit' | 'view' | null;

/**
 * Aba de Feitiços
 *
 * Exibe informações de conjuração:
 * - Dashboard de feitiços (FASE 6.7)
 * - Listagem de feitiços conhecidos (FASE 6.8)
 *
 * Features:
 * - Dashboard com habilidades de conjuração e estatísticas
 * - Lista organizada por círculo com filtros
 * - CRUD completo de feitiços conhecidos
 */
export function SpellsTab({ character, onUpdate }: SpellsTabProps) {
  const { showSuccess, showError } = useNotifications();
  const [dialogMode, setDialogMode] = useState<SpellDialogMode>(null);
  const [selectedSpell, setSelectedSpell] = useState<KnownSpell | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCircle, setFormCircle] = useState<SpellCircle>(1);
  const [formMatrix, setFormMatrix] = useState<SpellMatrix>('arcana');
  const [formSkill, setFormSkill] = useState<SkillName>('arcano');
  const [formNotes, setFormNotes] = useState('');

  // Reset form
  const resetForm = useCallback(() => {
    setFormName('');
    setFormCircle(1);
    setFormMatrix('arcana');
    setFormSkill('arcano');
    setFormNotes('');
  }, []);

  // Open add dialog
  const handleOpenAddDialog = useCallback(() => {
    resetForm();
    setDialogMode('add');
  }, [resetForm]);

  // Open edit dialog
  const handleOpenEditDialog = useCallback((spell: KnownSpell) => {
    setSelectedSpell(spell);
    setFormName(spell.name);
    setFormCircle(spell.circle);
    setFormMatrix(spell.matrix);
    setFormSkill(spell.spellcastingSkill);
    setFormNotes(spell.notes || '');
    setDialogMode('edit');
  }, []);

  // Open view dialog
  const handleOpenViewDialog = useCallback((spell: KnownSpell) => {
    setSelectedSpell(spell);
    setDialogMode('view');
  }, []);

  // Close dialog
  const handleCloseDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedSpell(null);
    resetForm();
  }, [resetForm]);

  // Add spell
  const handleAddSpell = useCallback(() => {
    if (!formName.trim()) {
      showError('Nome do feitiço é obrigatório');
      return;
    }

    if (!character.spellcasting) {
      showError('Dados de conjuração não disponíveis');
      return;
    }

    // Validação de círculos: não pode adicionar círculo N sem ter círculo N-1
    // Exceção: círculo 1 sempre pode ser adicionado
    if (formCircle > 1) {
      const previousCircle = (formCircle - 1) as SpellCircle;
      const hasPreviousCircleSpell = character.spellcasting.knownSpells.some(
        (spell) => spell.circle === previousCircle
      );

      if (!hasPreviousCircleSpell) {
        showError(
          `Você precisa conhecer ao menos um feitiço de ${previousCircle}º círculo antes de aprender feitiços de ${formCircle}º círculo.`
        );
        return;
      }
    }

    const newSpell: KnownSpell = {
      spellId: uuidv4(),
      circle: formCircle,
      name: formName.trim(),
      matrix: formMatrix,
      spellcastingSkill: formSkill,
      notes: formNotes.trim() || undefined,
    };

    const updatedSpells = [...character.spellcasting.knownSpells, newSpell];

    onUpdate({
      spellcasting: {
        maxKnownSpells: character.spellcasting.maxKnownSpells,
        knownSpellsModifiers: character.spellcasting.knownSpellsModifiers,
        spellcastingAbilities: character.spellcasting.spellcastingAbilities,
        masteredMatrices: character.spellcasting.masteredMatrices,
        knownSpells: updatedSpells,
      },
    });

    showSuccess(`Feitiço "${newSpell.name}" adicionado com sucesso`);
    handleCloseDialog();
  }, [
    formName,
    formCircle,
    formMatrix,
    formSkill,
    formNotes,
    character,
    onUpdate,
    showSuccess,
    showError,
    handleCloseDialog,
  ]);

  // Edit spell
  const handleEditSpell = useCallback(() => {
    if (!selectedSpell || !formName.trim()) {
      showError('Nome do feitiço é obrigatório');
      return;
    }

    if (!character.spellcasting) {
      showError('Dados de conjuração não disponíveis');
      return;
    }

    // Validar pré-requisito de círculo (se o círculo mudou)
    if (formCircle !== selectedSpell.circle && formCircle > 1) {
      const previousCircle = (formCircle - 1) as SpellCircle;
      const hasPreviousCircleSpell = character.spellcasting.knownSpells.some(
        (spell) =>
          spell.circle === previousCircle &&
          spell.spellId !== selectedSpell.spellId
      );

      if (!hasPreviousCircleSpell) {
        showError(
          `Você precisa conhecer ao menos um feitiço de ${previousCircle}º círculo antes de ter feitiços de ${formCircle}º círculo.`
        );
        return;
      }
    }

    const updatedSpells = character.spellcasting.knownSpells.map((spell) =>
      spell.spellId === selectedSpell.spellId
        ? {
            ...spell,
            name: formName.trim(),
            circle: formCircle,
            matrix: formMatrix,
            spellcastingSkill: formSkill,
            notes: formNotes.trim() || undefined,
          }
        : spell
    );

    onUpdate({
      spellcasting: {
        maxKnownSpells: character.spellcasting.maxKnownSpells,
        knownSpellsModifiers: character.spellcasting.knownSpellsModifiers,
        spellcastingAbilities: character.spellcasting.spellcastingAbilities,
        masteredMatrices: character.spellcasting.masteredMatrices,
        knownSpells: updatedSpells,
      },
    });

    showSuccess(`Feitiço "${formName}" atualizado com sucesso`);
    handleCloseDialog();
  }, [
    selectedSpell,
    formName,
    formCircle,
    formMatrix,
    formSkill,
    formNotes,
    character,
    onUpdate,
    showSuccess,
    showError,
    handleCloseDialog,
  ]);

  // Delete spell
  const handleDeleteSpell = useCallback(
    (spellId: string) => {
      if (!character.spellcasting) {
        showError('Dados de conjuração não disponíveis');
        return;
      }

      const spellToDelete = character.spellcasting.knownSpells.find(
        (s) => s.spellId === spellId
      );

      if (!spellToDelete) return;

      const updatedSpells = character.spellcasting.knownSpells.filter(
        (spell) => spell.spellId !== spellId
      );

      onUpdate({
        spellcasting: {
          maxKnownSpells: character.spellcasting.maxKnownSpells,
          knownSpellsModifiers: character.spellcasting.knownSpellsModifiers,
          spellcastingAbilities: character.spellcasting.spellcastingAbilities,
          masteredMatrices: character.spellcasting.masteredMatrices,
          knownSpells: updatedSpells,
        },
      });

      showSuccess(`Feitiço "${spellToDelete.name}" removido com sucesso`);
    },
    [character, onUpdate, showSuccess, showError]
  );

  // Get spell by circle label
  const getCircleLabel = (circle: SpellCircle) => {
    const circleLabels: Record<SpellCircle, string> = {
      1: '1º Círculo',
      2: '2º Círculo',
      3: '3º Círculo',
      4: '4º Círculo',
      5: '5º Círculo',
      6: '6º Círculo',
      7: '7º Círculo',
      8: '8º Círculo',
    };
    return circleLabels[circle];
  };

  // Get matrix label
  const getMatrixLabel = (matrix: SpellMatrix) => {
    const matrixLabels: Record<SpellMatrix, string> = {
      arcana: 'Arcana',
      adiafana: 'Adiáfana',
      gnomica: 'Gnômica',
      mundana: 'Mundana',
      natural: 'Natural',
      elfica: 'Élfica',
      ana: 'Ana',
      primordial: 'Primordial',
      luzidia: 'Luzídia',
      infernal: 'Infernal',
    };
    return matrixLabels[matrix];
  };

  // Get skill label
  const getSkillLabel = (skill: string) => {
    const skillLabels: Record<string, string> = {
      arcano: 'Arcano',
      arte: 'Arte',
      natureza: 'Natureza',
      performance: 'Performance',
      religiao: 'Religião',
      vigor: 'Vigor',
    };
    return skillLabels[skill] || skill.charAt(0).toUpperCase() + skill.slice(1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Dashboard de Conjuração */}
      <SpellDashboard character={character} onUpdate={onUpdate} />

      {/* Lista de Feitiços Conhecidos */}
      <SpellList
        spells={character.spellcasting?.knownSpells || []}
        onViewSpell={handleOpenViewDialog}
        onEditSpell={handleOpenEditDialog}
        onDeleteSpell={handleDeleteSpell}
        onAddSpell={handleOpenAddDialog}
      />

      {/* Dialog: Add/Edit Spell */}
      <Dialog
        open={dialogMode === 'add' || dialogMode === 'edit'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Feitiço' : 'Editar Feitiço'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nome do Feitiço"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Círculo</InputLabel>
              <Select
                value={formCircle}
                onChange={(e) => setFormCircle(e.target.value as SpellCircle)}
                label="Círculo"
              >
                {SPELL_CIRCLES.map((circle) => (
                  <MenuItem key={circle} value={circle}>
                    {getCircleLabel(circle)} - {SPELL_CIRCLE_PP_COST[circle]} PP
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Matriz</InputLabel>
              <Select
                value={formMatrix}
                onChange={(e) => setFormMatrix(e.target.value as SpellMatrix)}
                label="Matriz"
              >
                {SPELL_MATRICES.map((matrix) => (
                  <MenuItem key={matrix} value={matrix}>
                    {getMatrixLabel(matrix)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Habilidade de Conjuração</InputLabel>
              <Select
                value={formSkill}
                onChange={(e) => setFormSkill(e.target.value as SkillName)}
                label="Habilidade de Conjuração"
              >
                {[
                  'arcano',
                  'arte',
                  'natureza',
                  'performance',
                  'religiao',
                  'vigor',
                ].map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {getSkillLabel(skill)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notas"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Descrição, efeitos, alcance, duração..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={dialogMode === 'add' ? handleAddSpell : handleEditSpell}
            variant="contained"
            disabled={!formName.trim()}
          >
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: View Spell */}
      <Dialog
        open={dialogMode === 'view'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedSpell?.name}</DialogTitle>
        <DialogContent>
          {selectedSpell && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Círculo
                </Typography>
                <Chip
                  label={getCircleLabel(selectedSpell.circle)}
                  color="primary"
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Custo de PP
                </Typography>
                <Chip
                  label={`${SPELL_CIRCLE_PP_COST[selectedSpell.circle]} PP`}
                  color="info"
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Matriz
                </Typography>
                <Chip
                  label={getMatrixLabel(selectedSpell.matrix)}
                  color="secondary"
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Habilidade de Conjuração
                </Typography>
                <Chip
                  label={getSkillLabel(selectedSpell.spellcastingSkill)}
                  color="warning"
                  size="small"
                />
              </Box>

              {selectedSpell.notes && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Notas
                  </Typography>
                  <Typography variant="body2">{selectedSpell.notes}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
          <Button
            onClick={() => {
              if (selectedSpell) {
                handleCloseDialog();
                handleOpenEditDialog(selectedSpell);
              }
            }}
            variant="contained"
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
