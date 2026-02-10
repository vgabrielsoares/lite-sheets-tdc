'use client';

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Collapse,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Character } from '@/types';
import type {
  SpecialAbility,
  SpecialAbilitySource,
} from '@/types/specialAbilities';
import { SPECIAL_ABILITY_SOURCE_LABELS } from '@/types/specialAbilities';
import { uuidv4 } from '@/utils/uuid';

// ================================================================
// Constants
// ================================================================

const ALL_SOURCES: SpecialAbilitySource[] = [
  'origem',
  'linhagem',
  'arquetipo',
  'classe',
  'poder',
  'talento',
  'competencia',
  'outro',
];

/** Cores por fonte */
const SOURCE_COLORS: Record<SpecialAbilitySource, string> = {
  origem: 'info',
  linhagem: 'secondary',
  arquetipo: 'primary',
  classe: 'warning',
  poder: 'error',
  talento: 'success',
  competencia: 'default',
  outro: 'default',
};

// ================================================================
// Ability Dialog (Add/Edit)
// ================================================================

interface AbilityDialogProps {
  open: boolean;
  ability: SpecialAbility | null; // null = add mode
  onClose: () => void;
  onSave: (ability: SpecialAbility) => void;
}

function AbilityDialog({ open, ability, onClose, onSave }: AbilityDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effects, setEffects] = useState('');
  const [source, setSource] = useState<SpecialAbilitySource>('outro');
  const [sourceName, setSourceName] = useState('');
  const [levelGained, setLevelGained] = useState<number | ''>('');

  React.useEffect(() => {
    if (ability) {
      setName(ability.name);
      setDescription(ability.description);
      setEffects(ability.effects ?? '');
      setSource(ability.source);
      setSourceName(ability.sourceName ?? '');
      setLevelGained(ability.levelGained ?? '');
    } else {
      setName('');
      setDescription('');
      setEffects('');
      setSource('outro');
      setSourceName('');
      setLevelGained('');
    }
  }, [ability, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: ability?.id ?? uuidv4(),
      name: name.trim(),
      description: description.trim(),
      effects: effects.trim() || undefined,
      source,
      sourceName: sourceName.trim() || undefined,
      levelGained: levelGained !== '' ? Number(levelGained) : undefined,
    });
    onClose();
  };

  const isEdit = !!ability;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Editar Habilidade Especial' : 'Nova Habilidade Especial'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            size="small"
            autoFocus
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
          <TextField
            label="Efeitos mecânicos"
            value={effects}
            onChange={(e) => setEffects(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Bônus, penalidades, condições etc."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Fonte</InputLabel>
              <Select
                value={source}
                label="Fonte"
                onChange={(e: SelectChangeEvent) =>
                  setSource(e.target.value as SpecialAbilitySource)
                }
              >
                {ALL_SOURCES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {SPECIAL_ABILITY_SOURCE_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Nome da Fonte"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              size="small"
              placeholder="Ex: Combatente, Humano..."
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="Nível ganho"
            value={levelGained}
            onChange={(e) => {
              const v = e.target.value;
              setLevelGained(v === '' ? '' : Number(v));
            }}
            type="number"
            size="small"
            sx={{ maxWidth: 120 }}
            slotProps={{ htmlInput: { min: 1, max: 15 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          {isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ================================================================
// Ability Card
// ================================================================

interface AbilityCardProps {
  ability: SpecialAbility;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const AbilityCard = React.memo(function AbilityCard({
  ability,
  onEdit,
  onRemove,
}: AbilityCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {ability.name}
            </Typography>
            <Chip
              label={SPECIAL_ABILITY_SOURCE_LABELS[ability.source]}
              size="small"
              color={SOURCE_COLORS[ability.source] as any}
              variant="outlined"
            />
            {ability.levelGained && (
              <Chip
                label={`Nv. ${ability.levelGained}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ability.id);
                }}
                aria-label={`Editar ${ability.name}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(ability.id);
                }}
                aria-label={`Remover ${ability.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
              aria-label={expanded ? 'Recolher' : 'Expandir'}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Expanded details */}
        <Collapse in={expanded}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {ability.description && (
              <Typography variant="body2" color="text.secondary">
                {ability.description}
              </Typography>
            )}
            {ability.effects && (
              <Box>
                <Typography variant="caption" fontWeight="bold" color="primary">
                  Efeitos:
                </Typography>
                <Typography variant="body2">{ability.effects}</Typography>
              </Box>
            )}
            {ability.sourceName && (
              <Typography variant="caption" color="text.secondary">
                Fonte: {ability.sourceName}
              </Typography>
            )}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
});

// ================================================================
// Main Component
// ================================================================

export interface SpecialAbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Habilidades Especiais
 *
 * Exibe e gerencia habilidades especiais de todas as fontes:
 * Origem, Linhagem, Arquétipo, Classe, Poderes, Talentos, Competências, Outros.
 *
 * Funcionalidades:
 * - Listagem agrupada por fonte
 * - CRUD completo (criar, ler, atualizar, deletar)
 * - Busca por nome
 * - Filtro por fonte
 */
export const SpecialAbilitiesTab = React.memo(function SpecialAbilitiesTab({
  character,
  onUpdate,
}: SpecialAbilitiesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAbility, setEditingAbility] = useState<SpecialAbility | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<
    SpecialAbilitySource | 'all'
  >('all');

  const abilities = character.specialAbilities ?? [];

  // ---- Auto-sync ancestry traits & origin ability ----

  useEffect(() => {
    const currentAbilities = character.specialAbilities ?? [];
    let updated = [...currentAbilities];
    let hasChanges = false;

    // 1. Sync lineage ancestry traits
    const lineageTraits = character.lineage?.ancestryTraits ?? [];
    const lineageName = character.lineage?.name ?? '';

    for (const trait of lineageTraits) {
      const exists = updated.some(
        (a) => a.source === 'linhagem' && a.name === trait.name
      );
      if (!exists) {
        updated.push({
          id: uuidv4(),
          name: trait.name,
          description: trait.description,
          source: 'linhagem',
          sourceName: lineageName || undefined,
          levelGained: 1,
        });
        hasChanges = true;
      }
    }

    // 2. Sync origin special ability
    const originAbility = character.origin?.specialAbility;
    const originName = character.origin?.name ?? '';

    if (originAbility?.name) {
      const exists = updated.some(
        (a) => a.source === 'origem' && a.name === originAbility.name
      );
      if (!exists) {
        updated.push({
          id: uuidv4(),
          name: originAbility.name,
          description: originAbility.description,
          source: 'origem',
          sourceName: originName || undefined,
          levelGained: 1,
        });
        hasChanges = true;
      }
    }

    if (hasChanges) {
      onUpdate({ specialAbilities: updated });
    }
  }, [
    character.lineage?.ancestryTraits,
    character.lineage?.name,
    character.origin?.specialAbility,
    character.origin?.name,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Filtering & Search ----

  const filteredAbilities = useMemo(() => {
    let result = abilities;

    if (filterSource !== 'all') {
      result = result.filter((a) => a.source === filterSource);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          (a.sourceName?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [abilities, filterSource, searchQuery]);

  // Group by source for display
  const groupedAbilities = useMemo(() => {
    const groups: Record<string, SpecialAbility[]> = {};
    for (const ability of filteredAbilities) {
      const key = ability.source;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ability);
    }
    return groups;
  }, [filteredAbilities]);

  const sourcesWithAbilities = useMemo(
    () => ALL_SOURCES.filter((s) => groupedAbilities[s]?.length),
    [groupedAbilities]
  );

  // ---- Handlers ----

  const handleAddAbility = useCallback(() => {
    setEditingAbility(null);
    setDialogOpen(true);
  }, []);

  const handleEditAbility = useCallback(
    (id: string) => {
      const ability = abilities.find((a) => a.id === id);
      if (ability) {
        setEditingAbility(ability);
        setDialogOpen(true);
      }
    },
    [abilities]
  );

  const handleSaveAbility = useCallback(
    (ability: SpecialAbility) => {
      const existing = abilities.find((a) => a.id === ability.id);
      const updated = existing
        ? abilities.map((a) => (a.id === ability.id ? ability : a))
        : [...abilities, ability];
      onUpdate({ specialAbilities: updated });
    },
    [abilities, onUpdate]
  );

  const handleRemoveAbility = useCallback(
    (id: string) => {
      const updated = abilities.filter((a) => a.id !== id);
      onUpdate({ specialAbilities: updated });
    },
    [abilities, onUpdate]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlashOnIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Habilidades Especiais
            </Typography>
            <Chip
              label={abilities.length}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAbility}
            aria-label="Adicionar habilidade especial"
          >
            Adicionar
          </Button>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar habilidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>
              <FilterListIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: 'middle' }}
              />
              Fonte
            </InputLabel>
            <Select
              value={filterSource}
              label="Fonte"
              onChange={(e: SelectChangeEvent) =>
                setFilterSource(e.target.value as SpecialAbilitySource | 'all')
              }
            >
              <MenuItem value="all">Todas</MenuItem>
              {ALL_SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {SPECIAL_ABILITY_SOURCE_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Content */}
        {filteredAbilities.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 3, textAlign: 'center' }}
          >
            {abilities.length === 0
              ? 'Nenhuma habilidade especial adicionada. Clique em "Adicionar" para registrar habilidades de Origem, Linhagem, Arquétipo etc.'
              : 'Nenhuma habilidade encontrada com os filtros atuais.'}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {sourcesWithAbilities.map((source) => (
              <Box key={source}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  {SPECIAL_ABILITY_SOURCE_LABELS[source]} (
                  {groupedAbilities[source].length})
                </Typography>
                <Stack spacing={1}>
                  {groupedAbilities[source].map((ability) => (
                    <AbilityCard
                      key={ability.id}
                      ability={ability}
                      onEdit={handleEditAbility}
                      onRemove={handleRemoveAbility}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Add/Edit Dialog */}
      <AbilityDialog
        open={dialogOpen}
        ability={editingAbility}
        onClose={() => {
          setDialogOpen(false);
          setEditingAbility(null);
        }}
        onSave={handleSaveAbility}
      />
    </Box>
  );
});
