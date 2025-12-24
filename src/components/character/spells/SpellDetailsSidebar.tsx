'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { AutoAwesome as MagicIcon } from '@mui/icons-material';
import { Sidebar } from '@/components/shared/Sidebar';
import type { KnownSpell, SpellCircle, SpellMatrix } from '@/types/spells';
import type { SkillName } from '@/types/skills';
import {
  SPELL_CIRCLES,
  SPELL_MATRICES,
  SPELL_MATRIX_LABELS,
  SPELL_CIRCLE_PP_COST,
  SPELLCASTING_SKILL_LABELS,
} from '@/constants/spells';
import { useDebounce } from '@/hooks/useDebounce';

export interface SpellDetailsSidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Feitiço sendo visualizado/editado
   */
  spell: KnownSpell | null;

  /**
   * Callback para salvar alterações no feitiço
   */
  onSave: (spell: KnownSpell) => void;

  /**
   * Modo inicial (sempre edit agora, mantido para compatibilidade)
   * @deprecated Sempre abre em modo edit
   */
  initialMode?: 'view' | 'edit';
}

/**
 * SpellDetailsSidebar - Sidebar de Detalhes de Feitiço
 *
 * Exibe informações completas sobre um feitiço conhecido:
 * - Nome, círculo, matriz, habilidade de conjuração
 * - Custo de PP (calculado automaticamente)
 * - Notas/descrição personalizadas
 * - Modo de visualização e edição
 * - Salvamento automático com debounce
 *
 * Features:
 * - Toggle entre modo visualização e edição
 * - Salvamento automático após 1 segundo de inatividade
 * - Validação de campos obrigatórios
 * - Exibição de custo de PP baseado no círculo
 *
 * @example
 * ```tsx
 * <SpellDetailsSidebar
 *   open={isOpen}
 *   onClose={handleClose}
 *   spell={selectedSpell}
 *   onSave={handleSaveSpell}
 * />
 * ```
 */
export function SpellDetailsSidebar({
  open,
  onClose,
  spell,
  onSave,
  initialMode = 'edit',
}: SpellDetailsSidebarProps): React.ReactElement | null {
  const [mode] = useState<'view' | 'edit'>('edit'); // Sempre em modo edit
  const [editedSpell, setEditedSpell] = useState<KnownSpell | null>(spell);

  // Reset state quando o feitiço muda
  useEffect(() => {
    setEditedSpell(spell);
  }, [spell]);

  // Debounce para salvamento automático
  const debouncedSpell = useDebounce(editedSpell, 1000);

  // Auto-save quando o feitiço debounced muda
  useEffect(() => {
    if (debouncedSpell && mode === 'edit' && spell) {
      // Só salva se houver mudanças
      const hasChanges =
        debouncedSpell.name !== spell.name ||
        debouncedSpell.circle !== spell.circle ||
        debouncedSpell.matrix !== spell.matrix ||
        debouncedSpell.spellcastingSkill !== spell.spellcastingSkill ||
        debouncedSpell.notes !== spell.notes;

      if (hasChanges && debouncedSpell.name.trim()) {
        onSave(debouncedSpell);
      }
    }
  }, [debouncedSpell, mode, spell, onSave]);

  // Handlers para mudanças nos campos
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedSpell((prev) =>
        prev ? { ...prev, name: e.target.value } : null
      );
    },
    []
  );

  const handleCircleChange = useCallback(
    (e: SelectChangeEvent<SpellCircle>) => {
      setEditedSpell((prev) =>
        prev ? { ...prev, circle: e.target.value as SpellCircle } : null
      );
    },
    []
  );

  const handleMatrixChange = useCallback(
    (e: SelectChangeEvent<SpellMatrix>) => {
      setEditedSpell((prev) =>
        prev ? { ...prev, matrix: e.target.value as SpellMatrix } : null
      );
    },
    []
  );

  const handleSkillChange = useCallback((e: SelectChangeEvent<SkillName>) => {
    setEditedSpell((prev) =>
      prev ? { ...prev, spellcastingSkill: e.target.value as SkillName } : null
    );
  }, []);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditedSpell((prev) =>
        prev ? { ...prev, notes: e.target.value } : null
      );
    },
    []
  );

  if (!spell || !editedSpell) {
    return null;
  }

  const ppCost = SPELL_CIRCLE_PP_COST[editedSpell.circle];

  // Função auxiliar para capitalizar habilidades
  const getSkillLabel = (skill: string): string => {
    return (
      SPELLCASTING_SKILL_LABELS[
        skill as keyof typeof SPELLCASTING_SKILL_LABELS
      ] || skill.charAt(0).toUpperCase() + skill.slice(1)
    );
  };

  return (
    <Sidebar open={open} onClose={onClose} title="Editar Feitiço">
      <Stack spacing={3}>
        {/* Nome do Feitiço */}
        <TextField
          label="Nome do Feitiço"
          value={editedSpell.name}
          onChange={handleNameChange}
          fullWidth
          required
          error={!editedSpell.name.trim()}
          helperText={!editedSpell.name.trim() ? 'Nome é obrigatório' : ''}
        />

        <Divider />

        {/* Informações Básicas */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informações Básicas
          </Typography>
          <Stack spacing={2}>
            {/* Círculo */}
            <FormControl fullWidth size="small">
              <InputLabel>Círculo</InputLabel>
              <Select
                value={editedSpell.circle}
                onChange={handleCircleChange}
                label="Círculo"
              >
                {SPELL_CIRCLES.map((circle) => (
                  <MenuItem key={circle} value={circle}>
                    {circle}º Círculo
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custo de PP */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Custo de PP
              </Typography>
              <Chip
                label={`${ppCost} PP`}
                color="info"
                size="small"
                sx={{ mt: 0.5 }}
                icon={<MagicIcon />}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.5 }}
              >
                Custo calculado automaticamente baseado no círculo
              </Typography>
            </Box>

            {/* Matriz */}
            <FormControl fullWidth size="small">
              <InputLabel>Matriz</InputLabel>
              <Select
                value={editedSpell.matrix}
                onChange={handleMatrixChange}
                label="Matriz"
              >
                {SPELL_MATRICES.map((matrix) => (
                  <MenuItem key={matrix} value={matrix}>
                    {SPELL_MATRIX_LABELS[matrix]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Habilidade de Conjuração */}
            <FormControl fullWidth size="small">
              <InputLabel>Habilidade de Conjuração</InputLabel>
              <Select
                value={editedSpell.spellcastingSkill}
                onChange={handleSkillChange}
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
          </Stack>
        </Box>

        <Divider />

        {/* Notas/Descrição */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Notas e Detalhes
          </Typography>
          <TextField
            label="Notas"
            value={editedSpell.notes || ''}
            onChange={handleNotesChange}
            fullWidth
            multiline
            rows={6}
            placeholder="Descrição do feitiço, efeitos, alcance, duração, componentes, etc."
            helperText="Adicione detalhes sobre o feitiço para consulta rápida"
          />
        </Box>
      </Stack>
    </Sidebar>
  );
}
