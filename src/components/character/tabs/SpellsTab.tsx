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
import { uuidv4 } from '@/utils/uuid';
import type { Character, SkillName } from '@/types';
import type { KnownSpell, SpellCircle, SpellMatrix } from '@/types/spells';
import { SpellDashboard, SpellList, SpellLearningCalculator } from '../spells';
import {
  SPELL_CIRCLES,
  SPELL_MATRICES,
  SPELL_CIRCLE_PF_COST,
} from '@/constants/spells';
import { useNotifications } from '@/hooks/useNotifications';

export interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  /** Callback para abrir sidebar de detalhes de feitiço */
  onOpenSpell?: (spell: KnownSpell) => void;
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
 *
 * Memoizado para evitar re-renders desnecessários.
 */
export const SpellsTab = React.memo(function SpellsTab({
  character,
  onUpdate,
  onOpenSpell,
}: SpellsTabProps) {
  const { showSuccess, showError } = useNotifications();
  const [dialogMode, setDialogMode] = useState<SpellDialogMode>(null);
  const [selectedSpellForDialog, setSelectedSpellForDialog] =
    useState<KnownSpell | null>(null);

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
    setSelectedSpellForDialog(spell);
    setFormName(spell.name);
    setFormCircle(spell.circle);
    setFormMatrix(spell.matrix);
    setFormSkill(spell.spellcastingSkill);
    setFormNotes(spell.notes || '');
    setDialogMode('edit');
  }, []);

  // Close dialog
  const handleCloseDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedSpellForDialog(null);
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
        ...character.spellcasting,
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
    if (!selectedSpellForDialog || !formName.trim()) {
      showError('Nome do feitiço é obrigatório');
      return;
    }

    if (!character.spellcasting) {
      showError('Dados de conjuração não disponíveis');
      return;
    }

    // Validar pré-requisito de círculo (se o círculo mudou)
    if (formCircle !== selectedSpellForDialog.circle && formCircle > 1) {
      const previousCircle = (formCircle - 1) as SpellCircle;
      const hasPreviousCircleSpell = character.spellcasting.knownSpells.some(
        (spell) =>
          spell.circle === previousCircle &&
          spell.spellId !== selectedSpellForDialog.spellId
      );

      if (!hasPreviousCircleSpell) {
        showError(
          `Você precisa conhecer ao menos um feitiço de ${previousCircle}º círculo antes de ter feitiços de ${formCircle}º círculo.`
        );
        return;
      }
    }

    const updatedSpells = character.spellcasting.knownSpells.map((spell) =>
      spell.spellId === selectedSpellForDialog.spellId
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
        ...character.spellcasting,
        knownSpells: updatedSpells,
      },
    });

    showSuccess(`Feitiço "${formName}" atualizado com sucesso`);
    handleCloseDialog();
  }, [
    selectedSpellForDialog,
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
          ...character.spellcasting,
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
      <Box id="section-spell-dashboard">
        <SpellDashboard character={character} onUpdate={onUpdate} />
      </Box>

      {/* Lista de Feitiços Conhecidos */}
      <Box id="section-spell-list">
        <SpellList
          spells={character.spellcasting?.knownSpells || []}
          onOpenSpell={onOpenSpell}
          onDeleteSpell={handleDeleteSpell}
          onAddSpell={handleOpenAddDialog}
        />
      </Box>

      {/* Calculadora de Aprendizado de Feitiços (FASE 6.10) */}
      <Box id="section-spell-learning">
        <SpellLearningCalculator character={character} />
      </Box>

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
                    {getCircleLabel(circle)} - {SPELL_CIRCLE_PF_COST[circle]} PF
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
    </Box>
  );
});
