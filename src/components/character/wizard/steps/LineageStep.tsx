/**
 * LineageStep - Passo 3: Linhagem do Personagem
 *
 * Campos:
 * - Nome da linhagem (obrigatório)
 * - Descrição (opcional)
 * - Modificadores de atributo (-2/+1 ou +1/+1)
 * - Tamanho, altura, peso, idade
 * - Idiomas
 * - Deslocamento (andando obrigatório, outros opcionais)
 * - Visão e sentidos aguçados
 * - Características de ancestralidade
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  Chip,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Button,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Grid,
  Slider,
  FormControlLabel,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TranslateIcon from '@mui/icons-material/Translate';
import HeightIcon from '@mui/icons-material/Height';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { WizardSpecialAbility } from '@/types/wizard';
import type { AttributeName } from '@/types/attributes';
import type {
  CreatureSize,
  MovementType,
  VisionType,
  SenseType,
  KeenSense,
} from '@/types/common';
import type { LanguageName } from '@/types/character';
import { ATTRIBUTE_LABELS, ATTRIBUTE_LIST } from '@/constants/attributes';
import {
  SIZE_LABELS,
  MOVEMENT_LABELS,
  MOVEMENT_TYPES,
  VISION_LABELS,
  VISION_TYPES,
} from '@/constants/lineage';
import { LANGUAGE_LIST, LANGUAGE_LABELS } from '@/constants/languages';

/** Lista de tamanhos disponíveis para jogadores (excluindo Enorme e Colossal) */
const PLAYER_SIZES: CreatureSize[] = [
  'minusculo',
  'pequeno',
  'medio',
  'grande',
];

/** Lista de tipos de sentido */
const SENSE_TYPES: SenseType[] = ['visao', 'olfato', 'audicao'];

/** Labels para sentidos */
const SENSE_LABELS: Record<SenseType, string> = {
  visao: 'Visão',
  olfato: 'Olfato',
  audicao: 'Audição',
};

/**
 * Componente para o passo de linhagem do personagem
 */
export default function LineageStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { lineage } = state;

  // Estado local para novo movimento
  const [newMovementType, setNewMovementType] = useState<MovementType | ''>('');
  const [newMovementValue, setNewMovementValue] = useState(5);

  // Estado local para nova característica
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitDescription, setNewTraitDescription] = useState('');

  // Handler para alterar atributo de um modificador
  const handleModifierAttributeChange = useCallback(
    (index: number, attr: AttributeName | '') => {
      const currentMods = [...lineage.attributeModifiers];
      if (attr === '') {
        currentMods.splice(index, 1);
      } else if (index < currentMods.length) {
        currentMods[index] = { ...currentMods[index], attribute: attr };
      }
      updateNestedState('lineage', { attributeModifiers: currentMods });
    },
    [lineage.attributeModifiers, updateNestedState]
  );

  // Handler para alterar valor de um modificador
  const handleModifierValueChange = useCallback(
    (index: number, value: number) => {
      const currentMods = [...lineage.attributeModifiers];
      if (index < currentMods.length) {
        currentMods[index] = { ...currentMods[index], value };
      }
      updateNestedState('lineage', { attributeModifiers: currentMods });
    },
    [lineage.attributeModifiers, updateNestedState]
  );

  // Handler para adicionar modificador
  const handleAddModifier = useCallback(() => {
    if (lineage.attributeModifiers.length >= 3) return;
    const usedAttrs = lineage.attributeModifiers.map((m) => m.attribute);
    const availableAttr = ATTRIBUTE_LIST.find((a) => !usedAttrs.includes(a));
    if (availableAttr) {
      updateNestedState('lineage', {
        attributeModifiers: [
          ...lineage.attributeModifiers,
          { attribute: availableAttr, value: 1 },
        ],
      });
    }
  }, [lineage.attributeModifiers, updateNestedState]);

  // Handler para remover modificador
  const handleRemoveModifier = useCallback(
    (index: number) => {
      const currentMods = lineage.attributeModifiers.filter(
        (_, i) => i !== index
      );
      updateNestedState('lineage', { attributeModifiers: currentMods });
    },
    [lineage.attributeModifiers, updateNestedState]
  );

  // Verificações de validação
  const isNameEmpty = !lineage.name.trim();
  const hasWalkingMovement = (lineage.movement.andando ?? 0) > 0;

  // Handler para atualizar nome
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNestedState('lineage', { name: event.target.value });
    },
    [updateNestedState]
  );

  // Handler para atualizar descrição
  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNestedState('lineage', { description: event.target.value });
    },
    [updateNestedState]
  );

  // Handler para tamanho
  const handleSizeChange = useCallback(
    (event: SelectChangeEvent<CreatureSize>) => {
      updateNestedState('lineage', {
        size: event.target.value as CreatureSize,
      });
    },
    [updateNestedState]
  );

  // Handler para campos numéricos
  const handleNumberChange = useCallback(
    (field: 'height' | 'weightKg' | 'weightRPG' | 'age') =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value) || undefined;
        updateNestedState('lineage', { [field]: value });
      },
    [updateNestedState]
  );

  // Handler para idiomas
  const handleLanguageChange = useCallback(
    (event: SelectChangeEvent<LanguageName[]>) => {
      const value = event.target.value;
      const languages = (
        typeof value === 'string' ? value.split(',') : value
      ) as LanguageName[];
      // Sempre incluir 'comum'
      if (!languages.includes('comum')) {
        languages.unshift('comum');
      }
      updateNestedState('lineage', { languages });
    },
    [updateNestedState]
  );

  // Handler para deslocamento andando
  const handleWalkingSpeedChange = useCallback(
    (_event: Event, value: number | number[]) => {
      const speed = Array.isArray(value) ? value[0] : value;
      updateNestedState('lineage', {
        movement: { ...lineage.movement, andando: speed },
      });
    },
    [lineage.movement, updateNestedState]
  );

  // Handler para adicionar movimento
  const handleAddMovement = useCallback(() => {
    if (newMovementType && newMovementValue > 0) {
      updateNestedState('lineage', {
        movement: {
          ...lineage.movement,
          [newMovementType]: newMovementValue,
        },
      });
      setNewMovementType('');
      setNewMovementValue(5);
    }
  }, [newMovementType, newMovementValue, lineage.movement, updateNestedState]);

  // Handler para remover movimento
  const handleRemoveMovement = useCallback(
    (type: MovementType) => {
      const newMovement = { ...lineage.movement };
      delete newMovement[type];
      updateNestedState('lineage', { movement: newMovement });
    },
    [lineage.movement, updateNestedState]
  );

  // Handler para visão
  const handleVisionChange = useCallback(
    (event: SelectChangeEvent<VisionType>) => {
      updateNestedState('lineage', {
        vision: event.target.value as VisionType,
      });
    },
    [updateNestedState]
  );

  // Handler para sentido aguçado
  const handleKeenSenseToggle = useCallback(
    (senseType: SenseType, checked: boolean, bonus: number = 1) => {
      const currentSenses = [...lineage.keenSenses];
      const existingIndex = currentSenses.findIndex(
        (s) => s.type === senseType
      );

      if (checked) {
        if (existingIndex >= 0) {
          currentSenses[existingIndex] = { type: senseType, bonus };
        } else {
          currentSenses.push({ type: senseType, bonus });
        }
      } else {
        if (existingIndex >= 0) {
          currentSenses.splice(existingIndex, 1);
        }
      }

      updateNestedState('lineage', { keenSenses: currentSenses });
    },
    [lineage.keenSenses, updateNestedState]
  );

  // Handler para adicionar característica
  const handleAddTrait = useCallback(() => {
    if (newTraitName.trim()) {
      const newTrait: WizardSpecialAbility = {
        name: newTraitName.trim(),
        description: newTraitDescription.trim(),
        source: 'linhagem',
      };
      updateNestedState('lineage', {
        ancestryTraits: [...lineage.ancestryTraits, newTrait],
      });
      setNewTraitName('');
      setNewTraitDescription('');
    }
  }, [
    newTraitName,
    newTraitDescription,
    lineage.ancestryTraits,
    updateNestedState,
  ]);

  // Handler para remover característica
  const handleRemoveTrait = useCallback(
    (index: number) => {
      const newTraits = lineage.ancestryTraits.filter((_, i) => i !== index);
      updateNestedState('lineage', { ancestryTraits: newTraits });
    },
    [lineage.ancestryTraits, updateNestedState]
  );

  // Atributos usados nos modificadores
  const usedAttributes = useMemo(
    () => lineage.attributeModifiers.map((m) => m.attribute),
    [lineage.attributeModifiers]
  );

  // Movimentos já adicionados (exceto andando)
  const addedMovements = useMemo(
    () =>
      Object.keys(lineage.movement).filter(
        (k) => k !== 'andando'
      ) as MovementType[],
    [lineage.movement]
  );

  return (
    <Stack spacing={3}>
      {/* Seção: Identificação */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" color="text.primary">
            Linhagem
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          <TextField
            label="Nome da Linhagem"
            value={lineage.name}
            onChange={handleNameChange}
            fullWidth
            required
            placeholder="Ex: Humano, Elfo, Anão, Meio-Orc"
            error={isNameEmpty}
            helperText={
              isNameEmpty ? 'O nome da linhagem é obrigatório' : undefined
            }
            sx={{
              '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'warning.main',
                },
              '& .MuiFormHelperText-root.Mui-error': {
                color: 'warning.main',
              },
            }}
          />

          <TextField
            label="Descrição"
            value={lineage.description || ''}
            onChange={handleDescriptionChange}
            fullWidth
            multiline
            rows={2}
            placeholder="Descreva a linhagem do personagem (opcional)"
          />
        </Stack>
      </Paper>

      {/* Seção: Modificadores de Atributo */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Modificadores de Atributo
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A linhagem concede modificadores de atributos seguindo uma das opções:
        </Typography>

        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>+1 em 1 atributo</li>
            <li>+1 em 2 atributos e -1 em 1 atributo</li>
            <li>+2 em 1 atributo e -1 em outro</li>
            <li>+1 em 2 atributos</li>
          </Typography>
        </Alert>

        {/* Lista de modificadores */}
        <Stack spacing={2}>
          {lineage.attributeModifiers.map((modifier, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <FormControl sx={{ flex: 2 }} size="small">
                <InputLabel>Atributo</InputLabel>
                <Select
                  value={modifier.attribute}
                  onChange={(e) =>
                    handleModifierAttributeChange(
                      index,
                      e.target.value as AttributeName
                    )
                  }
                  label="Atributo"
                >
                  {ATTRIBUTE_LIST.map((attr) => (
                    <MenuItem
                      key={attr}
                      value={attr}
                      disabled={
                        usedAttributes.includes(attr) &&
                        modifier.attribute !== attr
                      }
                    >
                      {ATTRIBUTE_LABELS[attr]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }} size="small">
                <InputLabel>Valor</InputLabel>
                <Select
                  value={modifier.value}
                  onChange={(e) =>
                    handleModifierValueChange(index, e.target.value as number)
                  }
                  label="Valor"
                >
                  <MenuItem value={2}>+2</MenuItem>
                  <MenuItem value={1}>+1</MenuItem>
                  <MenuItem value={-1}>-1</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                color="error"
                onClick={() => handleRemoveModifier(index)}
                aria-label="Remover modificador"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Botão para adicionar modificador */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddModifier}
            disabled={lineage.attributeModifiers.length >= 3}
            size="small"
          >
            Adicionar Modificador
          </Button>
        </Stack>
      </Paper>

      {/* Seção: Físico */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HeightIcon color="info" />
          <Typography variant="h6" color="text.primary">
            Características Físicas
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tamanho</InputLabel>
              <Select
                value={lineage.size}
                onChange={handleSizeChange}
                label="Tamanho"
              >
                {PLAYER_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {SIZE_LABELS[size]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Altura (cm)"
              type="number"
              value={lineage.height || ''}
              onChange={handleNumberChange('height')}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Idade"
              type="number"
              value={lineage.age || ''}
              onChange={handleNumberChange('age')}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 6 }}>
            <TextField
              label="Peso (kg)"
              type="number"
              value={lineage.weightKg || ''}
              onChange={handleNumberChange('weightKg')}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 6 }}>
            <TextField
              label="Espaço"
              type="number"
              value={lineage.weightRPG || ''}
              onChange={handleNumberChange('weightRPG')}
              fullWidth
              size="small"
              helperText="Medida do RPG"
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Seção: Idiomas */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <TranslateIcon color="secondary" />
          <Typography variant="h6" color="text.primary">
            Idiomas
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Comum está sempre incluído. Selecione idiomas adicionais concedidos
          pela linhagem.
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Idiomas</InputLabel>
          <Select
            multiple
            value={lineage.languages}
            onChange={handleLanguageChange}
            input={<OutlinedInput label="Idiomas" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((lang) => (
                  <Chip
                    key={lang}
                    label={LANGUAGE_LABELS[lang]}
                    size="small"
                    color={lang === 'comum' ? 'default' : 'primary'}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          >
            {LANGUAGE_LIST.map((lang) => (
              <MenuItem key={lang} value={lang} disabled={lang === 'comum'}>
                <Checkbox
                  checked={lineage.languages.includes(lang)}
                  disabled={lang === 'comum'}
                />
                <ListItemText primary={LANGUAGE_LABELS[lang]} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Seção: Deslocamento */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DirectionsWalkIcon color="success" />
          <Typography variant="h6" color="text.primary">
            Deslocamento
          </Typography>
        </Stack>

        {/* Deslocamento Andando */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Andando: {lineage.movement.andando || 5} m
          </Typography>
          <Slider
            value={lineage.movement.andando || 5}
            onChange={handleWalkingSpeedChange}
            min={1}
            max={15}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ maxWidth: 300 }}
          />
        </Box>

        {/* Outros deslocamentos */}
        {addedMovements.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {addedMovements.map((type) => (
              <Box
                key={type}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  {MOVEMENT_LABELS[type]}: {lineage.movement[type]}m
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveMovement(type)}
                  aria-label={`Remover ${MOVEMENT_LABELS[type]}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {/* Adicionar novo deslocamento */}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newMovementType}
              onChange={(e) =>
                setNewMovementType(e.target.value as MovementType)
              }
              label="Tipo"
            >
              <MenuItem value="">
                <em>Selecione...</em>
              </MenuItem>
              {MOVEMENT_TYPES.filter(
                (t) => t !== 'andando' && !addedMovements.includes(t)
              ).map((type) => (
                <MenuItem key={type} value={type}>
                  {MOVEMENT_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Metros"
            type="number"
            value={newMovementValue}
            onChange={(e) =>
              setNewMovementValue(Math.max(1, parseInt(e.target.value) || 1))
            }
            size="small"
            sx={{ width: 100 }}
            inputProps={{ min: 1 }}
          />

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMovement}
            disabled={!newMovementType}
            size="small"
          >
            Adicionar
          </Button>
        </Stack>
      </Paper>

      {/* Seção: Visão e Sentidos */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <VisibilityIcon color="warning" />
          <Typography variant="h6" color="text.primary">
            Visão e Sentidos
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Visão</InputLabel>
            <Select
              value={lineage.vision}
              onChange={handleVisionChange}
              label="Tipo de Visão"
            >
              {VISION_TYPES.map((vtype) => (
                <MenuItem key={vtype} value={vtype}>
                  {VISION_LABELS[vtype]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sentidos Aguçados
            </Typography>
            <Stack spacing={1}>
              {SENSE_TYPES.map((sense) => {
                const existing = lineage.keenSenses.find(
                  (s) => s.type === sense
                );
                return (
                  <Box
                    key={sense}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!existing}
                          onChange={(e) =>
                            handleKeenSenseToggle(
                              sense,
                              e.target.checked,
                              existing?.bonus || 1
                            )
                          }
                        />
                      }
                      label={SENSE_LABELS[sense]}
                      sx={{ minWidth: 120 }}
                    />
                    {existing && (
                      <TextField
                        label="Bônus (d)"
                        type="number"
                        value={existing.bonus}
                        onChange={(e) =>
                          handleKeenSenseToggle(
                            sense,
                            true,
                            Math.max(
                              1,
                              Math.min(5, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ min: 1, max: 5 }}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Seção: Características de Ancestralidade */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Características de Ancestralidade
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Adicione características especiais da linhagem (opcional). Serão
          adicionadas às Habilidades Especiais.
        </Typography>

        {lineage.ancestryTraits.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {lineage.ancestryTraits.map((trait, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="subtitle2">{trait.name}</Typography>
                  {trait.description && (
                    <Typography variant="body2" color="text.secondary">
                      {trait.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveTrait(index)}
                  aria-label={`Remover ${trait.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Stack spacing={1}>
          <TextField
            label="Nome da Característica"
            value={newTraitName}
            onChange={(e) => setNewTraitName(e.target.value)}
            size="small"
            fullWidth
            placeholder="Ex: Resistência a Veneno, Visão no Escuro"
          />
          <TextField
            label="Descrição"
            value={newTraitDescription}
            onChange={(e) => setNewTraitDescription(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Descreva o efeito da característica"
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddTrait}
            disabled={!newTraitName.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Adicionar Característica
          </Button>
        </Stack>
      </Paper>

      {/* Dica */}
      <Alert severity="info" variant="outlined">
        <Typography variant="body2">
          <strong>Dica:</strong> A linhagem representa a ancestralidade e
          herança biológica do personagem. Os modificadores e características
          escolhidos serão aplicados automaticamente.
        </Typography>
      </Alert>
    </Stack>
  );
}
