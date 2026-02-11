/**
 * ArchetypeStep - Passo 5: Escolha de Arquétipo
 *
 * Campos:
 * - Seleção de arquétipo (6 opções)
 * - Visualização de ganhos do arquétipo nível 1
 * - Habilidades iniciais do arquétipo
 * - Proficiências ganhas
 * - Bônus de GA e PP
 * - Características de arquétipo (nome + descrição)
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import CategoryIcon from '@mui/icons-material/Category';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { ArchetypeName } from '@/types/character';
import type { SkillName } from '@/types';
import type { WizardSpecialAbility } from '@/types/wizard';
import {
  ARCHETYPE_LIST,
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_GA_ATTRIBUTE,
  ARCHETYPE_PP_BASE_PER_LEVEL,
  ARCHETYPE_INITIAL_SKILLS,
  ARCHETYPE_INITIAL_PROFICIENCIES,
  ARCHETYPE_ATTRIBUTE_DESCRIPTION,
} from '@/constants/archetypes';
import { ATTRIBUTE_LABELS, ATTRIBUTE_DEFAULT } from '@/constants/attributes';
import { SKILL_LIST, SKILL_LABELS } from '@/constants/skills';

/** GA base no nível 1 */
const BASE_GA = 15;

/** PP base no nível 1 */
const BASE_PP = 2;

/**
 * Calcula o modificador de um atributo baseado nos modificadores de origem/linhagem
 */
function getModifierFromSource(
  attributeModifiers: { attribute: string; value: number }[],
  attr: string
): number {
  const modifier = attributeModifiers.find((m) => m.attribute === attr);
  return modifier?.value ?? 0;
}

export default function ArchetypeStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { archetype, origin, lineage, attributes } = state;

  // Estado local para novo feature
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');

  // Calcular valores de atributos relevantes para cálculos
  const attributeValues = useMemo(() => {
    const values: Record<string, number> = {};

    (
      [
        'agilidade',
        'corpo',
        'influencia',
        'mente',
        'essencia',
        'instinto',
      ] as const
    ).forEach((attr) => {
      const base = ATTRIBUTE_DEFAULT;
      const originMod = getModifierFromSource(origin.attributeModifiers, attr);
      const lineageMod = getModifierFromSource(
        lineage.attributeModifiers,
        attr
      );
      const freePoints = attributes.freePoints[attr];
      const reducedToZero =
        attributes.usingExtraPointOption &&
        attributes.reducedAttribute === attr;

      values[attr] = reducedToZero
        ? 0 + originMod + lineageMod + freePoints
        : base + originMod + lineageMod + freePoints;
    });

    return values;
  }, [origin.attributeModifiers, lineage.attributeModifiers, attributes]);

  // Calcular GA e PP com base no arquétipo
  const resourceCalculations = useMemo(() => {
    if (!archetype.name) {
      return {
        ga: BASE_GA,
        pp: BASE_PP,
        pv: Math.floor(BASE_GA / 3),
        gaBonus: 0,
        ppBonus: 0,
      };
    }

    const archetypeName = archetype.name as ArchetypeName;
    const gaAttr = ARCHETYPE_GA_ATTRIBUTE[archetypeName];
    const gaBonus = attributeValues[gaAttr] ?? 0;
    const ga = BASE_GA + gaBonus;

    const ppBase = ARCHETYPE_PP_BASE_PER_LEVEL[archetypeName];
    const ppBonus = ppBase + (attributeValues.essencia ?? 0);
    const pp = BASE_PP + ppBonus;

    const pv = Math.floor(ga / 3);

    return { ga, pp, pv, gaBonus, ppBonus };
  }, [archetype.name, attributeValues]);

  // Handler para mudar arquétipo
  const handleArchetypeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const name = event.target.value as ArchetypeName | '';

      if (!name) {
        updateNestedState('archetype', {
          name: null,
          initialSkills: [],
          proficiencies: [],
          features: [],
        });
        return;
      }

      // Preencher com valores padrão do arquétipo
      const initialSkills = ARCHETYPE_INITIAL_SKILLS[name] ?? [];
      const proficiencies = ARCHETYPE_INITIAL_PROFICIENCIES[name] ?? [];

      updateNestedState('archetype', {
        name,
        initialSkills: [],
        proficiencies: [...proficiencies],
        features: [],
      });
    },
    [updateNestedState]
  );

  // Handler para mudar skills iniciais
  const handleInitialSkillsChange = useCallback(
    (_: unknown, newValue: SkillName[]) => {
      // Limite de 2 habilidades iniciais por arquétipo
      if (newValue.length <= 2) {
        updateNestedState('archetype', { initialSkills: newValue });
      }
    },
    [updateNestedState]
  );

  // Handler para proficiências (texto livre com chips)
  const handleProficiencyAdd = useCallback(
    (proficiency: string) => {
      if (
        proficiency.trim() &&
        !archetype.proficiencies.includes(proficiency.trim())
      ) {
        updateNestedState('archetype', {
          proficiencies: [...archetype.proficiencies, proficiency.trim()],
        });
      }
    },
    [archetype.proficiencies, updateNestedState]
  );

  const handleProficiencyRemove = useCallback(
    (proficiency: string) => {
      updateNestedState('archetype', {
        proficiencies: archetype.proficiencies.filter((p) => p !== proficiency),
      });
    },
    [archetype.proficiencies, updateNestedState]
  );

  // Handler para características de arquétipo
  const handleAddFeature = useCallback(() => {
    if (!newFeatureName.trim()) return;

    const newFeature: WizardSpecialAbility = {
      name: newFeatureName.trim(),
      description: newFeatureDescription.trim(),
      source: `Arquétipo: ${archetype.name ? ARCHETYPE_LABELS[archetype.name as ArchetypeName] : 'Desconhecido'}`,
    };

    updateNestedState('archetype', {
      features: [...archetype.features, newFeature],
    });

    setNewFeatureName('');
    setNewFeatureDescription('');
  }, [
    newFeatureName,
    newFeatureDescription,
    archetype.name,
    archetype.features,
    updateNestedState,
  ]);

  const handleRemoveFeature = useCallback(
    (index: number) => {
      const newFeatures = archetype.features.filter((_, i) => i !== index);
      updateNestedState('archetype', { features: newFeatures });
    },
    [archetype.features, updateNestedState]
  );

  // Skills sugeridas pelo arquétipo (texto livre do sistema)
  const suggestedSkills = useMemo(() => {
    if (!archetype.name) return [];
    return ARCHETYPE_INITIAL_SKILLS[archetype.name as ArchetypeName] ?? [];
  }, [archetype.name]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">Escolha de Arquétipo</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          O arquétipo define seu caminho de desenvolvimento. No nível 1, você
          ganha as características iniciais, proficiências e recursos do
          arquétipo escolhido.
        </Typography>
      </Paper>

      {/* Seleção de arquétipo */}
      <FormControl fullWidth>
        <InputLabel>Arquétipo</InputLabel>
        <Select
          value={archetype.name ?? ''}
          onChange={handleArchetypeChange}
          label="Arquétipo"
        >
          <MenuItem value="">
            <em>Selecione um arquétipo...</em>
          </MenuItem>
          {ARCHETYPE_LIST.map((arch) => (
            <MenuItem key={arch} value={arch}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography fontWeight={500}>
                  {ARCHETYPE_LABELS[arch]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ARCHETYPE_ATTRIBUTE_DESCRIPTION[arch]}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Descrição do arquétipo selecionado */}
      {archetype.name && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            {ARCHETYPE_LABELS[archetype.name as ArchetypeName]}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {ARCHETYPE_DESCRIPTIONS[archetype.name as ArchetypeName]}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Atributos relevantes:{' '}
            {ARCHETYPE_ATTRIBUTE_DESCRIPTION[archetype.name as ArchetypeName]}
          </Typography>
        </Paper>
      )}

      {/* Recursos calculados */}
      {archetype.name && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Recursos no Nível 1
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* GA */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 215, 0, 0.1)'
                      : 'rgba(255, 215, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <ShieldIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {resourceCalculations.ga}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  Guarda (GA)
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {BASE_GA} base + {resourceCalculations.gaBonus} (
                  {
                    ATTRIBUTE_LABELS[
                      ARCHETYPE_GA_ATTRIBUTE[archetype.name as ArchetypeName]
                    ]
                  }
                  )
                </Typography>
              </Paper>
            </Grid>

            {/* PV */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'rgba(244, 67, 54, 0.08)',
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <FavoriteIcon sx={{ fontSize: 32, color: 'error.main' }} />
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {resourceCalculations.pv}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  Vitalidade (PV)
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  floor({resourceCalculations.ga} ÷ 3)
                </Typography>
              </Paper>
            </Grid>

            {/* PP */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(33, 150, 243, 0.1)'
                      : 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid',
                  borderColor: 'info.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <FlashOnIcon sx={{ fontSize: 32, color: 'info.main' }} />
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {resourceCalculations.pp}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  Pontos de Poder (PP)
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {BASE_PP} base + {resourceCalculations.ppBonus} (
                  {ARCHETYPE_PP_BASE_PER_LEVEL[archetype.name as ArchetypeName]}{' '}
                  + Essência)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Habilidades iniciais */}
      {archetype.name && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="subtitle2">Habilidades Iniciais</Typography>
            <Tooltip
              title="Essas habilidades vão de Leigo para Adepto. O texto do arquétipo pode indicar opções."
              arrow
            >
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Stack>

          {suggestedSkills.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Sugestão do arquétipo:{' '}
              <strong>{suggestedSkills.join(', ')}</strong>
            </Alert>
          )}

          <Autocomplete
            multiple
            options={SKILL_LIST}
            value={archetype.initialSkills as SkillName[]}
            onChange={handleInitialSkillsChange}
            getOptionLabel={(option) => SKILL_LABELS[option]}
            getOptionDisabled={() =>
              (archetype.initialSkills as SkillName[]).length >= 2
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={SKILL_LABELS[option]}
                    size="small"
                    color="info"
                    {...rest}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Habilidades Iniciais (${(archetype.initialSkills as SkillName[]).length}/2)`}
                placeholder="Selecione..."
                helperText="Selecione exatamente 2 habilidades indicadas pelo texto do seu arquétipo"
              />
            )}
          />
        </Paper>
      )}

      {/* Proficiências */}
      {archetype.name && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Proficiências do Arquétipo
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {archetype.proficiencies.map((prof, index) => (
              <Chip
                key={`${prof}-${index}`}
                label={prof}
                size="small"
                onDelete={() => handleProficiencyRemove(prof)}
                color="default"
              />
            ))}
          </Box>

          <Stack direction="row" gap={1}>
            <TextField
              placeholder="Nova proficiência..."
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleProficiencyAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                const input = (
                  e.currentTarget.previousSibling as HTMLInputElement
                )?.querySelector?.('input');
                if (input) {
                  handleProficiencyAdd(input.value);
                  input.value = '';
                }
              }}
            >
              Adicionar
            </Button>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Pressione Enter ou clique em Adicionar para incluir uma
            proficiência.
          </Typography>
        </Paper>
      )}

      {/* Características de arquétipo */}
      {archetype.name && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <AutoFixHighIcon color="secondary" />
            <Typography variant="subtitle2">
              Características de Arquétipo
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adicione as características que seu personagem ganha no nível 1 com
            este arquétipo. Essas serão adicionadas às Habilidades Especiais do
            personagem.
          </Typography>

          {/* Lista de características existentes */}
          <Stack spacing={2} sx={{ mb: 2 }}>
            {archetype.features.map((feature, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(156, 39, 176, 0.12)'
                      : 'rgba(156, 39, 176, 0.06)',
                  border: '1px solid',
                  borderColor: 'secondary.main',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600} color="text.primary">
                    {feature.name}
                  </Typography>
                  {feature.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {feature.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFeature(index)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>

          {/* Formulário para adicionar nova característica */}
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Nome da característica"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Descrição (opcional)"
              value={newFeatureDescription}
              onChange={(e) => setNewFeatureDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddFeature}
              disabled={!newFeatureName.trim()}
            >
              Adicionar Característica
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Alerta se nenhum arquétipo selecionado */}
      {!archetype.name && (
        <Alert severity="warning">
          Selecione um arquétipo para continuar. O arquétipo define seus
          recursos iniciais, proficiências e habilidades.
        </Alert>
      )}
    </Box>
  );
}
