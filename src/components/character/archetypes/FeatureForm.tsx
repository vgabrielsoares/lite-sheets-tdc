'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
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
  Box,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Archetype, ArchetypeFeature, ArchetypeName } from '@/types';
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_LEVEL_GAINS,
  GAIN_TYPE_COLORS,
  GAIN_TYPE_LABELS,
  type ArchetypeLevelGainType,
} from '@/constants/archetypes';

interface FeatureFormProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Callback para fechar */
  onClose: () => void;
  /** Callback para salvar */
  onSave: (
    archetypeName: ArchetypeName,
    feature: Omit<ArchetypeFeature, 'acquiredAtLevel'>,
    level: number
  ) => void;
  /** Arquétipos ativos do personagem */
  archetypes: Archetype[];
  /** Nível máximo de cada arquétipo */
  maxLevelByArchetype: Record<ArchetypeName, number>;
  /** Feature sendo editada (undefined para nova) */
  editingFeature?: ArchetypeFeature;
  /** Arquétipo da feature sendo editada */
  editingArchetype?: ArchetypeName;
}

/**
 * Entrada de escolha (chave-valor)
 */
interface ChoiceEntry {
  key: string;
  value: string;
}

/**
 * FeatureForm - Formulário para adicionar/editar características de arquétipo
 */
export default function FeatureForm({
  open,
  onClose,
  onSave,
  archetypes,
  maxLevelByArchetype,
  editingFeature,
  editingArchetype,
}: FeatureFormProps) {
  // Estado do formulário
  const [selectedArchetype, setSelectedArchetype] = useState<
    ArchetypeName | ''
  >(editingArchetype ?? '');
  const [selectedLevel, setSelectedLevel] = useState<number>(
    editingFeature?.acquiredAtLevel ?? 1
  );
  const [name, setName] = useState(editingFeature?.name ?? '');
  const [description, setDescription] = useState(
    editingFeature?.description ?? ''
  );
  const [permanentChoices, setPermanentChoices] = useState<ChoiceEntry[]>([]);
  const [temporaryChoices, setTemporaryChoices] = useState<ChoiceEntry[]>([]);

  // Modo de edição
  const isEditing = !!editingFeature;

  // Resetar form quando abrir/fechar
  useEffect(() => {
    if (open) {
      if (editingFeature) {
        setSelectedArchetype(editingArchetype ?? '');
        setSelectedLevel(editingFeature.acquiredAtLevel);
        setName(editingFeature.name);
        setDescription(editingFeature.description);

        // Converter escolhas para array
        const permEntries = editingFeature.permanentChoices
          ? Object.entries(editingFeature.permanentChoices).map(
              ([key, value]) => ({
                key,
                value:
                  typeof value === 'string' ? value : JSON.stringify(value),
              })
            )
          : [];
        setPermanentChoices(permEntries);

        const tempEntries = editingFeature.temporaryChoices
          ? Object.entries(editingFeature.temporaryChoices).map(
              ([key, value]) => ({
                key,
                value:
                  typeof value === 'string' ? value : JSON.stringify(value),
              })
            )
          : [];
        setTemporaryChoices(tempEntries);
      } else {
        // Novo - resetar tudo
        setSelectedArchetype(archetypes.length === 1 ? archetypes[0].name : '');
        setSelectedLevel(1);
        setName('');
        setDescription('');
        setPermanentChoices([]);
        setTemporaryChoices([]);
      }
    }
  }, [open, editingFeature, editingArchetype, archetypes]);

  // Níveis disponíveis para o arquétipo selecionado
  const availableLevels = useMemo(() => {
    if (!selectedArchetype) return [];
    const maxLevel = maxLevelByArchetype[selectedArchetype] ?? 0;
    return Array.from({ length: maxLevel }, (_, i) => i + 1);
  }, [selectedArchetype, maxLevelByArchetype]);

  // Ganhos do nível selecionado
  const levelGains = useMemo(() => {
    return ARCHETYPE_LEVEL_GAINS.filter((g) => g.level === selectedLevel);
  }, [selectedLevel]);

  // Validação
  const isValid = useMemo(() => {
    return (
      selectedArchetype !== '' && selectedLevel > 0 && name.trim().length > 0
    );
  }, [selectedArchetype, selectedLevel, name]);

  // Handlers para escolhas permanentes
  const handleAddPermanentChoice = useCallback(() => {
    setPermanentChoices((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const handleRemovePermanentChoice = useCallback((index: number) => {
    setPermanentChoices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePermanentChoiceChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      setPermanentChoices((prev) =>
        prev.map((entry, i) =>
          i === index ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  // Handlers para escolhas temporárias
  const handleAddTemporaryChoice = useCallback(() => {
    setTemporaryChoices((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const handleRemoveTemporaryChoice = useCallback((index: number) => {
    setTemporaryChoices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTemporaryChoiceChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      setTemporaryChoices((prev) =>
        prev.map((entry, i) =>
          i === index ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  // Handler de save
  const handleSave = useCallback(() => {
    if (!isValid || !selectedArchetype) return;

    // Converter arrays de volta para objetos
    const permObj: Record<string, string> = {};
    permanentChoices
      .filter((e) => e.key.trim())
      .forEach((e) => {
        permObj[e.key] = e.value;
      });

    const tempObj: Record<string, string> = {};
    temporaryChoices
      .filter((e) => e.key.trim())
      .forEach((e) => {
        tempObj[e.key] = e.value;
      });

    const feature: Omit<ArchetypeFeature, 'acquiredAtLevel'> = {
      name: name.trim(),
      description: description.trim(),
      permanentChoices: Object.keys(permObj).length > 0 ? permObj : undefined,
      temporaryChoices: Object.keys(tempObj).length > 0 ? tempObj : undefined,
    };

    onSave(selectedArchetype, feature, selectedLevel);
  }, [
    isValid,
    selectedArchetype,
    selectedLevel,
    name,
    description,
    permanentChoices,
    temporaryChoices,
    onSave,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Característica' : 'Adicionar Característica'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Seleção de arquétipo */}
          <FormControl fullWidth required>
            <InputLabel>Arquétipo</InputLabel>
            <Select
              value={selectedArchetype}
              onChange={(e) => {
                setSelectedArchetype(e.target.value as ArchetypeName);
                setSelectedLevel(1); // Resetar nível ao trocar arquétipo
              }}
              label="Arquétipo"
              disabled={isEditing}
            >
              {archetypes.map((arch) => (
                <MenuItem key={arch.name} value={arch.name}>
                  {ARCHETYPE_LABELS[arch.name]} (Nv. {arch.level})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Seleção de nível */}
          <FormControl fullWidth required disabled={!selectedArchetype}>
            <InputLabel>Nível Adquirido</InputLabel>
            <Select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              label="Nível Adquirido"
            >
              {availableLevels.map((level) => {
                const gains = ARCHETYPE_LEVEL_GAINS.filter(
                  (g) => g.level === level
                );
                return (
                  <MenuItem key={level} value={level}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Nível {level}</span>
                      {gains.map((g) => (
                        <Chip
                          key={`${level}-${g.type}`}
                          label={GAIN_TYPE_LABELS[g.type]}
                          size="small"
                          color={GAIN_TYPE_COLORS[g.type]}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Ganhos do nível selecionado */}
          {levelGains.length > 0 && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <Typography variant="body2">
                <strong>Ganhos do Nível {selectedLevel}:</strong>{' '}
                {levelGains.map((g) => g.label).join(', ')}
              </Typography>
            </Alert>
          )}

          {/* Nome da característica */}
          <TextField
            label="Nome da Característica"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder="Ex: Ataque Furtivo, Magia Arcana, Resistência..."
          />

          {/* Descrição */}
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Descreva o que essa característica faz..."
          />

          <Divider />

          {/* Escolhas Permanentes */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Escolhas Permanentes</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddPermanentChoice}
              >
                Adicionar
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Escolhas que não podem ser alteradas depois de feitas.
            </Typography>
            <Stack spacing={1}>
              {permanentChoices.map((entry, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    size="small"
                    placeholder="Nome"
                    value={entry.key}
                    onChange={(e) =>
                      handlePermanentChoiceChange(index, 'key', e.target.value)
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="Valor"
                    value={entry.value}
                    onChange={(e) =>
                      handlePermanentChoiceChange(
                        index,
                        'value',
                        e.target.value
                      )
                    }
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemovePermanentChoice(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Escolhas Temporárias */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Escolhas Temporárias</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddTemporaryChoice}
              >
                Adicionar
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Escolhas que podem ser alteradas (ex: diariamente, por descanso).
            </Typography>
            <Stack spacing={1}>
              {temporaryChoices.map((entry, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    size="small"
                    placeholder="Nome"
                    value={entry.key}
                    onChange={(e) =>
                      handleTemporaryChoiceChange(index, 'key', e.target.value)
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="Valor"
                    value={entry.value}
                    onChange={(e) =>
                      handleTemporaryChoiceChange(
                        index,
                        'value',
                        e.target.value
                      )
                    }
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveTemporaryChoice(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
