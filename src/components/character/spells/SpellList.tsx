'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { SpellCard } from './SpellCard';
import { SpellFilters, SpellFiltersState } from './SpellFilters';
import type { KnownSpell, SpellCircle } from '@/types/spells';
import { SPELL_CIRCLES, SPELL_CIRCLE_PP_COST } from '@/constants/spells';

export interface SpellListProps {
  spells: KnownSpell[];
  onViewSpell?: (spell: KnownSpell) => void;
  onEditSpell?: (spell: KnownSpell) => void;
  onDeleteSpell?: (spellId: string) => void;
  onAddSpell?: () => void;
}

/**
 * SpellList - Lista de feitiços organizados por círculo
 *
 * Features:
 * - Organização por círculo (1º ao 8º)
 * - Filtros por círculo, matriz e habilidade
 * - Busca por nome
 * - Acordeões colapsáveis por círculo
 * - Contadores de feitiços por círculo
 * - Empty state quando não há feitiços
 */
export function SpellList({
  spells,
  onViewSpell,
  onEditSpell,
  onDeleteSpell,
  onAddSpell,
}: SpellListProps) {
  const [filters, setFilters] = useState<SpellFiltersState>({
    searchQuery: '',
    selectedCircles: [],
    selectedMatrices: [],
    selectedSkills: [],
  });

  const [expandedCircles, setExpandedCircles] = useState<Set<SpellCircle>>(
    new Set(SPELL_CIRCLES)
  );

  /**
   * Filtra e organiza feitiços
   */
  const filteredAndGroupedSpells = useMemo(() => {
    let filtered = [...spells];

    // Filtro por busca (nome)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((spell) =>
        spell.name.toLowerCase().includes(query)
      );
    }

    // Filtro por círculo
    if (filters.selectedCircles.length > 0) {
      filtered = filtered.filter((spell) =>
        filters.selectedCircles.includes(spell.circle)
      );
    }

    // Filtro por matriz
    if (filters.selectedMatrices.length > 0) {
      filtered = filtered.filter((spell) =>
        filters.selectedMatrices.includes(spell.matrix)
      );
    }

    // Filtro por habilidade
    if (filters.selectedSkills.length > 0) {
      filtered = filtered.filter((spell) =>
        filters.selectedSkills.includes(spell.spellcastingSkill)
      );
    }

    // Agrupar por círculo
    const grouped = new Map<SpellCircle, KnownSpell[]>();

    SPELL_CIRCLES.forEach((circle) => {
      grouped.set(circle, []);
    });

    filtered.forEach((spell) => {
      const circleSpells = grouped.get(spell.circle);
      if (circleSpells) {
        circleSpells.push(spell);
      }
    });

    // Ordenar alfabeticamente dentro de cada círculo
    grouped.forEach((circleSpells) => {
      circleSpells.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [spells, filters]);

  /**
   * Toggle de expansão de círculo
   */
  const handleCircleToggle = (circle: SpellCircle) => {
    const newExpanded = new Set(expandedCircles);
    if (newExpanded.has(circle)) {
      newExpanded.delete(circle);
    } else {
      newExpanded.add(circle);
    }
    setExpandedCircles(newExpanded);
  };

  /**
   * Expande ou colapsa todos os círculos
   */
  const handleExpandAll = () => {
    setExpandedCircles(new Set(SPELL_CIRCLES));
  };

  const handleCollapseAll = () => {
    setExpandedCircles(new Set());
  };

  const totalSpells = spells.length;
  const filteredCount = Array.from(filteredAndGroupedSpells.values()).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <Box>
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Feitiços Conhecidos
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {filteredCount} de {totalSpells} feitiços
              {filteredCount !== totalSpells && ' (filtrado)'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" onClick={handleExpandAll} variant="outlined">
              Expandir Todos
            </Button>
            <Button size="small" onClick={handleCollapseAll} variant="outlined">
              Colapsar Todos
            </Button>
            {onAddSpell && (
              <Button
                startIcon={<AddIcon />}
                onClick={onAddSpell}
                variant="contained"
                size="small"
              >
                Adicionar Feitiço
              </Button>
            )}
          </Box>
        </Box>

        {/* Filtros */}
        <SpellFilters
          spells={spells}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Empty state */}
        {totalSpells === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Nenhum feitiço conhecido ainda.
            </Typography>
            {onAddSpell && (
              <Button
                startIcon={<AddIcon />}
                onClick={onAddSpell}
                size="small"
                sx={{ mt: 1 }}
              >
                Adicionar Primeiro Feitiço
              </Button>
            )}
          </Alert>
        ) : filteredCount === 0 ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Nenhum feitiço encontrado com os filtros aplicados.
          </Alert>
        ) : (
          /* Lista de feitiços por círculo */
          <Stack spacing={2}>
            {SPELL_CIRCLES.map((circle) => {
              const circleSpells = filteredAndGroupedSpells.get(circle) || [];
              const hasSpells = circleSpells.length > 0;

              // Não exibir círculos vazios (nunca mostrar círculos sem feitiços)
              if (!hasSpells) {
                return null;
              }

              return (
                <Accordion
                  key={circle}
                  expanded={expandedCircles.has(circle)}
                  onChange={() => handleCircleToggle(circle)}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                        pr: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {circle}º Círculo
                      </Typography>
                      <Chip
                        label={`${SPELL_CIRCLE_PP_COST[circle]} PP`}
                        size="small"
                        color="info"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={`${circleSpells.length} feitiço${circleSpells.length !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2 }}>
                    {hasSpells ? (
                      <Stack spacing={1.5}>
                        {circleSpells.map((spell) => (
                          <SpellCard
                            key={spell.spellId}
                            spell={spell}
                            onView={onViewSpell}
                            onEdit={onEditSpell}
                            onDelete={onDeleteSpell}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          textAlign: 'center',
                          py: 2,
                        }}
                      >
                        Nenhum feitiço deste círculo conhecido.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
