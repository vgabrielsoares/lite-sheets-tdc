'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import type { KnownSpell, SpellCircle, SpellMatrix } from '@/types/spells';
import {
  SPELL_MATRIX_LABELS,
  SPELLCASTING_SKILL_LABELS,
} from '@/constants/spells';

export interface SpellFiltersState {
  searchQuery: string;
  selectedCircles: SpellCircle[];
  selectedMatrices: SpellMatrix[];
  selectedSkills: string[];
}

export interface SpellFiltersProps {
  spells: KnownSpell[];
  filters: SpellFiltersState;
  onFiltersChange: (filters: SpellFiltersState) => void;
}

/**
 * SpellFilters - Filtros e busca para lista de feitiços
 *
 * Permite filtrar feitiços por:
 * - Busca por nome (texto livre)
 * - Círculo (1º ao 8º)
 * - Matriz
 * - Habilidade de conjuração
 *
 * IMPORTANTE: Mostra apenas opções que existem nos feitiços conhecidos,
 * com contadores entre parênteses.
 */
export function SpellFilters({
  spells,
  filters,
  onFiltersChange,
}: SpellFiltersProps) {
  // Calcula quais círculos, matrizes e habilidades estão presentes nos feitiços
  const availableOptions = useMemo(() => {
    const circles = new Map<SpellCircle, number>();
    const matrices = new Map<SpellMatrix, number>();
    const skills = new Map<string, number>();

    spells.forEach((spell) => {
      // Círculos
      circles.set(spell.circle, (circles.get(spell.circle) || 0) + 1);

      // Matrizes
      matrices.set(spell.matrix, (matrices.get(spell.matrix) || 0) + 1);

      // Habilidades
      skills.set(
        spell.spellcastingSkill,
        (skills.get(spell.spellcastingSkill) || 0) + 1
      );
    });

    return {
      circles: Array.from(circles.entries()).sort((a, b) => a[0] - b[0]),
      matrices: Array.from(matrices.entries()).sort((a, b) =>
        SPELL_MATRIX_LABELS[a[0]].localeCompare(SPELL_MATRIX_LABELS[b[0]])
      ),
      skills: Array.from(skills.entries()).sort((a, b) => {
        const labelA =
          SPELLCASTING_SKILL_LABELS[
            a[0] as keyof typeof SPELLCASTING_SKILL_LABELS
          ] || a[0];
        const labelB =
          SPELLCASTING_SKILL_LABELS[
            b[0] as keyof typeof SPELLCASTING_SKILL_LABELS
          ] || b[0];
        return labelA.localeCompare(labelB);
      }),
    };
  }, [spells]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value,
    });
  };

  const handleCircleChange = (event: SelectChangeEvent<SpellCircle[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      selectedCircles:
        typeof value === 'string' ? [] : (value as SpellCircle[]),
    });
  };

  const handleMatrixChange = (event: SelectChangeEvent<SpellMatrix[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      selectedMatrices:
        typeof value === 'string' ? [] : (value as SpellMatrix[]),
    });
  };

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      selectedSkills: typeof value === 'string' ? [] : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedCircles: [],
      selectedMatrices: [],
      selectedSkills: [],
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.selectedCircles.length > 0 ||
    filters.selectedMatrices.length > 0 ||
    filters.selectedSkills.length > 0;

  return (
    <Box>
      <Stack spacing={2}>
        {/* Busca por nome */}
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar feitiço por nome..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtros adicionais */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Filtro por círculo */}
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel id="circle-filter-label">Círculo</InputLabel>
            <Select
              labelId="circle-filter-label"
              multiple
              value={filters.selectedCircles}
              onChange={handleCircleChange}
              label="Círculo"
              disabled={availableOptions.circles.length === 0}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  <em>Todos</em>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={`${value}º`} size="small" />
                    ))}
                  </Box>
                )
              }
            >
              {availableOptions.circles.map(([circle, count]) => (
                <MenuItem key={circle} value={circle}>
                  {circle}º círculo ({count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro por matriz */}
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel id="matrix-filter-label">Matriz</InputLabel>
            <Select
              labelId="matrix-filter-label"
              multiple
              value={filters.selectedMatrices}
              onChange={handleMatrixChange}
              label="Matriz"
              disabled={availableOptions.matrices.length === 0}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  <em>Todas</em>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={SPELL_MATRIX_LABELS[value]}
                        size="small"
                      />
                    ))}
                  </Box>
                )
              }
            >
              {availableOptions.matrices.map(([matrix, count]) => (
                <MenuItem key={matrix} value={matrix}>
                  {SPELL_MATRIX_LABELS[matrix]} ({count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro por habilidade */}
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel id="skill-filter-label">Habilidade</InputLabel>
            <Select
              labelId="skill-filter-label"
              multiple
              value={filters.selectedSkills}
              onChange={handleSkillChange}
              label="Habilidade"
              renderValue={(selected) =>
                selected.length === 0 ? (
                  <em>Todas</em>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={
                          SPELLCASTING_SKILL_LABELS[
                            value as keyof typeof SPELLCASTING_SKILL_LABELS
                          ] || value.charAt(0).toUpperCase() + value.slice(1)
                        }
                        size="small"
                      />
                    ))}
                  </Box>
                )
              }
            >
              {availableOptions.skills.map(([skill, count]) => {
                const label =
                  SPELLCASTING_SKILL_LABELS[
                    skill as keyof typeof SPELLCASTING_SKILL_LABELS
                  ] || skill.charAt(0).toUpperCase() + skill.slice(1);
                return (
                  <MenuItem key={skill} value={skill}>
                    {label} ({count})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>

        {/* Indicador de filtros ativos */}
        {hasActiveFilters && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Chip
              icon={<FilterIcon />}
              label="Filtros ativos"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Limpar filtros"
              size="small"
              onClick={handleClearFilters}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
