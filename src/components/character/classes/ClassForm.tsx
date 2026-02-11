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
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as FeatureIcon,
  Build as ImprovementIcon,
} from '@mui/icons-material';
import type {
  CharacterClass,
  ClassFeature,
  ClassImprovement,
  ArchetypeName,
} from '@/types';
import { ARCHETYPE_LIST, ARCHETYPE_LABELS } from '@/constants/archetypes';
import {
  MAX_CLASSES,
  CLASS_FEATURE_LEVELS,
  CLASS_IMPROVEMENT_LEVELS,
  IMPROVEMENT_LEVEL_LABELS,
  CLASS_GAIN_TYPE_COLORS,
  EXAMPLE_CLASS_COMBINATIONS,
  type ClassImprovementLevel,
} from '@/constants/classes';

interface ClassFormProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Callback para fechar */
  onClose: () => void;
  /** Callback para salvar */
  onSave: (characterClass: CharacterClass) => void;
  /** Nível máximo do personagem */
  characterLevel: number;
  /** Níveis já usados por outras classes */
  usedLevels: number;
  /** Classes existentes (para validação de limite) */
  existingClasses: CharacterClass[];
  /** Classe sendo editada (undefined para nova) */
  editingClass?: CharacterClass;
}

/**
 * Entrada de melhoria
 */
interface ImprovementEntry {
  level: ClassImprovementLevel;
  description: string;
}

/**
 * Entrada de feature
 */
interface FeatureEntry {
  acquiredAtLevel: number;
  name: string;
  description: string;
  improvements: ImprovementEntry[];
}

/**
 * ClassForm - Formulário para adicionar/editar classes do personagem
 */
export function ClassForm({
  open,
  onClose,
  onSave,
  characterLevel,
  usedLevels,
  existingClasses,
  editingClass,
}: ClassFormProps) {
  // Estado do formulário
  const [name, setName] = useState('');
  const [selectedArchetypes, setSelectedArchetypes] = useState<ArchetypeName[]>(
    []
  );
  const [level, setLevel] = useState(1);
  const [features, setFeatures] = useState<FeatureEntry[]>([]);

  // Modo de edição
  const isEditing = !!editingClass;

  // Nível máximo disponível para esta classe
  const maxAvailableLevel = useMemo(() => {
    // Se estamos editando, adicionar de volta o nível da classe sendo editada
    const adjustedUsedLevels = isEditing
      ? usedLevels - (editingClass?.level ?? 0)
      : usedLevels;
    return characterLevel - adjustedUsedLevels;
  }, [characterLevel, usedLevels, isEditing, editingClass]);

  // Resetar form quando abrir/fechar
  useEffect(() => {
    if (open) {
      if (editingClass) {
        setName(editingClass.name);
        setSelectedArchetypes(editingClass.archetypes);
        setLevel(editingClass.level);
        // Converter features para formato interno
        const featureEntries: FeatureEntry[] = editingClass.features.map(
          (f) => ({
            acquiredAtLevel: f.acquiredAtLevel,
            name: f.name,
            description: f.description,
            improvements:
              f.improvements?.map((imp) => ({
                level: imp.level,
                description: imp.description,
              })) ?? [],
          })
        );
        setFeatures(featureEntries);
      } else {
        // Nova classe
        setName('');
        setSelectedArchetypes([]);
        setLevel(Math.min(1, maxAvailableLevel));
        setFeatures([]);
      }
    }
  }, [open, editingClass, maxAvailableLevel]);

  // Níveis disponíveis para features baseado no nível da classe
  const availableFeatureLevels = useMemo(() => {
    return CLASS_FEATURE_LEVELS.filter((l) => l <= level);
  }, [level]);

  // Níveis disponíveis para melhorias baseado no nível da classe
  const availableImprovementLevels = useMemo(() => {
    return CLASS_IMPROVEMENT_LEVELS.filter((l) => l <= level);
  }, [level]);

  // Validação
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Nome da classe é obrigatório');
    }

    if (selectedArchetypes.length === 0) {
      errors.push('Selecione pelo menos um arquétipo');
    }

    if (selectedArchetypes.length > 2) {
      errors.push('Máximo de 2 arquétipos por classe');
    }

    if (level < 0) {
      errors.push('Nível não pode ser negativo');
    }

    if (level > maxAvailableLevel) {
      errors.push(`Nível máximo disponível: ${maxAvailableLevel}`);
    }

    if (!isEditing && existingClasses.length >= MAX_CLASSES) {
      errors.push(`Máximo de ${MAX_CLASSES} classes por personagem`);
    }

    return errors;
  }, [
    name,
    selectedArchetypes,
    level,
    maxAvailableLevel,
    isEditing,
    existingClasses,
  ]);

  const isValid = validationErrors.length === 0;

  // Handlers para features
  const handleAddFeature = useCallback(() => {
    const nextLevel = availableFeatureLevels.find(
      (l) => !features.some((f) => f.acquiredAtLevel === l)
    );
    if (nextLevel) {
      setFeatures([
        ...features,
        {
          acquiredAtLevel: nextLevel,
          name: '',
          description: '',
          improvements: [],
        },
      ]);
    }
  }, [features, availableFeatureLevels]);

  const handleRemoveFeature = useCallback((index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFeatureChange = useCallback(
    (index: number, field: keyof FeatureEntry, value: any) => {
      setFeatures((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  // Handlers para melhorias
  const handleAddImprovement = useCallback(
    (featureIndex: number) => {
      const feature = features[featureIndex];
      const usedLevels = feature.improvements.map((i) => i.level);
      const nextLevel = ([1, 2, 3] as ClassImprovementLevel[]).find(
        (l) => !usedLevels.includes(l) && IMPROVEMENT_LEVEL_LABELS[l]
      );

      if (nextLevel) {
        handleFeatureChange(featureIndex, 'improvements', [
          ...feature.improvements,
          { level: nextLevel, description: '' },
        ]);
      }
    },
    [features, handleFeatureChange]
  );

  const handleRemoveImprovement = useCallback(
    (featureIndex: number, improvementIndex: number) => {
      const feature = features[featureIndex];
      const newImprovements = feature.improvements.filter(
        (_, i) => i !== improvementIndex
      );
      handleFeatureChange(featureIndex, 'improvements', newImprovements);
    },
    [features, handleFeatureChange]
  );

  const handleImprovementChange = useCallback(
    (
      featureIndex: number,
      improvementIndex: number,
      field: keyof ImprovementEntry,
      value: any
    ) => {
      const feature = features[featureIndex];
      const newImprovements = [...feature.improvements];
      newImprovements[improvementIndex] = {
        ...newImprovements[improvementIndex],
        [field]: value,
      };
      handleFeatureChange(featureIndex, 'improvements', newImprovements);
    },
    [features, handleFeatureChange]
  );

  // Salvar
  const handleSave = useCallback(() => {
    if (!isValid) return;

    const classFeatures: ClassFeature[] = features.map((f) => ({
      name: f.name,
      acquiredAtLevel: f.acquiredAtLevel,
      description: f.description,
      improvements: f.improvements.map(
        (imp): ClassImprovement => ({
          level: imp.level,
          acquiredAtLevel: imp.level === 1 ? 7 : imp.level === 2 ? 9 : 14,
          description: imp.description,
        })
      ),
    }));

    const newClass: CharacterClass = {
      name: name.trim(),
      archetypes: selectedArchetypes,
      level,
      features: classFeatures,
    };

    onSave(newClass);
    onClose();
  }, [isValid, name, selectedArchetypes, level, features, onSave, onClose]);

  // Sugestões de classes baseadas nos arquétipos selecionados
  const classSuggestions = useMemo(() => {
    if (selectedArchetypes.length === 0) return EXAMPLE_CLASS_COMBINATIONS;
    return EXAMPLE_CLASS_COMBINATIONS.filter((combo) =>
      selectedArchetypes.every((arch) => combo.archetypes.includes(arch))
    );
  }, [selectedArchetypes]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' },
      }}
    >
      <DialogTitle>
        {isEditing ? 'Editar Classe' : 'Adicionar Classe'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Alerta de validação */}
          {validationErrors.length > 0 && (
            <Alert severity="warning">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Nome da classe */}
          <Autocomplete
            freeSolo
            options={classSuggestions.map((c) => c.name)}
            value={name}
            onInputChange={(_, value) => setName(value)}
            onChange={(_, value) => {
              if (value) {
                setName(value);
                // Se selecionou uma sugestão, preencher arquétipos
                const suggestion = EXAMPLE_CLASS_COMBINATIONS.find(
                  (c) => c.name === value
                );
                if (suggestion) {
                  setSelectedArchetypes(suggestion.archetypes);
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome da Classe"
                required
                helperText="Digite um nome ou selecione uma sugestão"
              />
            )}
          />

          {/* Arquétipos */}
          <FormControl fullWidth>
            <InputLabel>Arquétipos (1 ou 2)</InputLabel>
            <Select
              multiple
              value={selectedArchetypes}
              onChange={(e) => {
                const value = e.target.value;
                if (Array.isArray(value) && value.length <= 2) {
                  setSelectedArchetypes(value as ArchetypeName[]);
                }
              }}
              label="Arquétipos (1 ou 2)"
              renderValue={(selected) => (
                <Stack direction="row" spacing={1}>
                  {selected.map((arch) => (
                    <Chip
                      key={arch}
                      label={ARCHETYPE_LABELS[arch as ArchetypeName]}
                      size="small"
                    />
                  ))}
                </Stack>
              )}
            >
              {ARCHETYPE_LIST.map((arch) => (
                <MenuItem
                  key={arch}
                  value={arch}
                  disabled={
                    selectedArchetypes.length >= 2 &&
                    !selectedArchetypes.includes(arch)
                  }
                >
                  {ARCHETYPE_LABELS[arch]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Classes são compostas por 1 ou 2 arquétipos
            </FormHelperText>
          </FormControl>

          {/* Nível */}
          <FormControl fullWidth>
            <InputLabel>Nível na Classe</InputLabel>
            <Select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              label="Nível na Classe"
            >
              {Array.from({ length: maxAvailableLevel }, (_, i) => i + 1).map(
                (l) => (
                  <MenuItem key={l} value={l}>
                    Nível {l}
                  </MenuItem>
                )
              )}
            </Select>
            <FormHelperText>
              Níveis disponíveis: {maxAvailableLevel}. A soma dos níveis de
              classe não pode ultrapassar o nível do personagem (
              {characterLevel}).
            </FormHelperText>
          </FormControl>

          <Divider />

          {/* Habilidades de Classe */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Habilidades de Classe</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddFeature}
                disabled={features.length >= availableFeatureLevels.length}
              >
                Adicionar
              </Button>
            </Stack>

            {features.length === 0 && (
              <Alert severity="info">
                Adicione habilidades de classe nos níveis 1, 5, 10 e 15.
              </Alert>
            )}

            <Stack spacing={2}>
              {features.map((feature, featureIndex) => (
                <Box
                  key={featureIndex}
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    borderLeft: 3,
                    borderColor: `${CLASS_GAIN_TYPE_COLORS.habilidade}.main`,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <FeatureIcon color="primary" />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Nível</InputLabel>
                        <Select
                          value={feature.acquiredAtLevel}
                          onChange={(e) =>
                            handleFeatureChange(
                              featureIndex,
                              'acquiredAtLevel',
                              Number(e.target.value)
                            )
                          }
                          label="Nível"
                        >
                          {availableFeatureLevels.map((l) => (
                            <MenuItem
                              key={l}
                              value={l}
                              disabled={features.some(
                                (f, i) =>
                                  i !== featureIndex && f.acquiredAtLevel === l
                              )}
                            >
                              Nv. {l}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Nome da Habilidade"
                        value={feature.name}
                        onChange={(e) =>
                          handleFeatureChange(
                            featureIndex,
                            'name',
                            e.target.value
                          )
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFeature(featureIndex)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <TextField
                      size="small"
                      label="Descrição"
                      value={feature.description}
                      onChange={(e) =>
                        handleFeatureChange(
                          featureIndex,
                          'description',
                          e.target.value
                        )
                      }
                      multiline
                      rows={2}
                    />

                    {/* Melhorias */}
                    {availableImprovementLevels.length > 0 && (
                      <Box sx={{ pl: 2 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Melhorias (Níveis 7, 9, 14)
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddImprovement(featureIndex)}
                            disabled={feature.improvements.length >= 3}
                          >
                            Melhoria
                          </Button>
                        </Stack>

                        {feature.improvements.map((imp, impIndex) => (
                          <Box
                            key={impIndex}
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              borderLeft: 2,
                              borderColor: `${CLASS_GAIN_TYPE_COLORS.melhoria}.main`,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <ImprovementIcon fontSize="small" color="info" />
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                  value={imp.level}
                                  onChange={(e) =>
                                    handleImprovementChange(
                                      featureIndex,
                                      impIndex,
                                      'level',
                                      Number(e.target.value)
                                    )
                                  }
                                  size="small"
                                >
                                  {([1, 2, 3] as ClassImprovementLevel[]).map(
                                    (l) => (
                                      <MenuItem
                                        key={l}
                                        value={l}
                                        disabled={feature.improvements.some(
                                          (i, idx) =>
                                            idx !== impIndex && i.level === l
                                        )}
                                      >
                                        {IMPROVEMENT_LEVEL_LABELS[l]}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                              <TextField
                                size="small"
                                placeholder="Descrição da melhoria"
                                value={imp.description}
                                onChange={(e) =>
                                  handleImprovementChange(
                                    featureIndex,
                                    impIndex,
                                    'description',
                                    e.target.value
                                  )
                                }
                                sx={{ flexGrow: 1 }}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleRemoveImprovement(
                                    featureIndex,
                                    impIndex
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </Box>
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

export default ClassForm;
