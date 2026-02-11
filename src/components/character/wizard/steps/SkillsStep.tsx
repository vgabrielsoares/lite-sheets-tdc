/**
 * SkillsStep - Passo 6: Habilidades e Proficiências
 *
 * Campos:
 * - Habilidades já proficientes (origem + arquétipo)
 * - Slots para escolher habilidades livremente (3 + Mente - já escolhidas)
 * - Escolha de habilidade de assinatura
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { SkillName, AttributeName } from '@/types';
import { SKILL_LIST, SKILL_LABELS, SKILL_METADATA } from '@/constants/skills';
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_DEFAULT,
  ATTRIBUTE_ABBREVIATIONS,
} from '@/constants/attributes';

/** Base de proficiências no nível 1 */
const BASE_PROFICIENCIES = 3;

/**
 * Calcula o valor total de um atributo
 */
function calculateAttributeValue(
  attr: AttributeName,
  origin: { attributeModifiers: { attribute: AttributeName; value: number }[] },
  lineage: {
    attributeModifiers: { attribute: AttributeName; value: number }[];
  },
  attributes: {
    freePoints: Record<AttributeName, number>;
    usingExtraPointOption: boolean;
    reducedAttribute?: AttributeName;
  }
): number {
  const base =
    attributes.usingExtraPointOption && attributes.reducedAttribute === attr
      ? 0
      : ATTRIBUTE_DEFAULT;

  const originMod =
    origin.attributeModifiers.find((m) => m.attribute === attr)?.value ?? 0;
  const lineageMod =
    lineage.attributeModifiers.find((m) => m.attribute === attr)?.value ?? 0;
  const freePoints = attributes.freePoints[attr] ?? 0;

  return base + originMod + lineageMod + freePoints;
}

export default function SkillsStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { skills, origin, archetype, attributes, lineage } = state;

  // Valor de Mente calculado
  const menteValue = useMemo(
    () => calculateAttributeValue('mente', origin, lineage, attributes),
    [origin, lineage, attributes]
  );

  // Proficiências da origem (2 habilidades)
  const originProficiencies = useMemo(
    () => origin.skillProficiencies,
    [origin.skillProficiencies]
  );

  // Proficiências do arquétipo (habilidades iniciais)
  const archetypeProficiencies = useMemo(
    () => archetype.initialSkills as SkillName[],
    [archetype.initialSkills]
  );

  // Todas as proficiências fixas (origem + arquétipo)
  const fixedProficiencies = useMemo(() => {
    const combined = new Set<SkillName>([
      ...originProficiencies,
      ...archetypeProficiencies,
    ]);
    return Array.from(combined);
  }, [originProficiencies, archetypeProficiencies]);

  // Total de slots LIVRES disponíveis (3 + Mente, ALÉM de origem/arquétipo)
  const freeSlots = BASE_PROFICIENCIES + menteValue;

  // Proficiências escolhidas livremente pelo jogador
  const chosenProficiencies = skills.chosenProficiencies as SkillName[];

  // Total de proficiências escolhidas
  const chosenCount = chosenProficiencies.length;

  // Slots livres restantes disponíveis
  const remainingFreeSlots = freeSlots - chosenCount;

  // Handler para toggle de habilidade
  const handleSkillToggle = useCallback(
    (skill: SkillName, checked: boolean) => {
      if (checked) {
        // Adicionar se tiver slots
        if (remainingFreeSlots > 0) {
          updateNestedState('skills', {
            chosenProficiencies: [...chosenProficiencies, skill],
          });
        }
      } else {
        // Remover
        updateNestedState('skills', {
          chosenProficiencies: chosenProficiencies.filter((s) => s !== skill),
        });
      }
    },
    [remainingFreeSlots, chosenProficiencies, updateNestedState]
  );

  // Handler para habilidade de assinatura
  const handleSignatureChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value as SkillName | '';
      updateNestedState('skills', {
        signatureSkill: value ? value : null,
      });
    },
    [updateNestedState]
  );

  // Agrupar habilidades por atributo
  const skillsByAttribute = useMemo(() => {
    const grouped: Record<string, SkillName[]> = {};

    SKILL_LIST.forEach((skill) => {
      const attr = SKILL_METADATA[skill].keyAttribute;
      if (!grouped[attr]) grouped[attr] = [];
      grouped[attr].push(skill);
    });

    return grouped;
  }, []);

  // Ordenar atributos para exibição
  const attributeOrder: (AttributeName | 'especial')[] = [
    'agilidade',
    'corpo',
    'influencia',
    'mente',
    'essencia',
    'instinto',
    'especial',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho com resumo de slots */}
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
          <BuildIcon color="primary" />
          <Typography variant="h6">Habilidades e Proficiências</Typography>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Proficiências livres: <strong>{freeSlots}</strong> (3 base +{' '}
            {menteValue} Mente) — além das ganhas por Origem e Arquétipo
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={`Bônus de Origem/Arquétipo: ${fixedProficiencies.length}`}
              size="small"
              color="default"
            />
            <Chip
              label={`Livres: ${remainingFreeSlots}/${freeSlots}`}
              size="small"
              color={remainingFreeSlots > 0 ? 'warning' : 'success'}
            />
          </Stack>
        </Box>
      </Paper>

      {/* Proficiências fixas */}
      {fixedProficiencies.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Bônus de Poderes/Arquétipos/Classes:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {originProficiencies.map((skill) => (
              <Chip
                key={skill}
                label={SKILL_LABELS[skill]}
                size="small"
                color="primary"
                icon={<InfoIcon />}
                title="Origem"
              />
            ))}
            {archetypeProficiencies.map((skill) =>
              !originProficiencies.includes(skill) ? (
                <Chip
                  key={skill}
                  label={SKILL_LABELS[skill]}
                  size="small"
                  color="secondary"
                  title="Arquétipo"
                />
              ) : null
            )}
          </Box>
        </Paper>
      )}

      {/* Seleção de habilidades livres */}
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="subtitle2">
            Escolha {freeSlots} habilidade{freeSlots !== 1 ? 's' : ''} adicional
            {freeSlots !== 1 ? 'is' : ''}
          </Typography>
          <Chip
            label={`${chosenCount}/${freeSlots}`}
            size="small"
            color={chosenCount >= freeSlots ? 'success' : 'warning'}
          />
        </Stack>

        {freeSlots === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Você não tem slots livres para proficiências (3 + Mente = 0). As
            proficiências de Origem e Arquétipo ainda se aplicam.
          </Alert>
        )}

        {freeSlots > 0 && (
          <>
            {attributeOrder.map((attr) => {
              const skillsInGroup = skillsByAttribute[attr];
              if (!skillsInGroup?.length) return null;

              const attrLabel =
                attr === 'especial'
                  ? 'Especial'
                  : ATTRIBUTE_LABELS[attr as AttributeName];
              const attrAbbr =
                attr === 'especial'
                  ? 'ESP'
                  : ATTRIBUTE_ABBREVIATIONS[attr as AttributeName];

              return (
                <Box key={attr} sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {attrLabel} ({attrAbbr})
                  </Typography>
                  <Grid container spacing={0}>
                    {skillsInGroup.map((skill) => {
                      const isFixed = fixedProficiencies.includes(skill);
                      const isChosen = chosenProficiencies.includes(skill);
                      const isDisabled =
                        isFixed || (!isChosen && remainingFreeSlots <= 0);

                      return (
                        <Grid key={skill} size={{ xs: 6, sm: 4, md: 3 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isFixed || isChosen}
                                onChange={(e) =>
                                  handleSkillToggle(skill, e.target.checked)
                                }
                                disabled={isFixed || isDisabled}
                                size="small"
                              />
                            }
                            label={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textDecoration: isFixed
                                      ? 'none'
                                      : 'inherit',
                                    color: isFixed
                                      ? 'text.secondary'
                                      : 'inherit',
                                  }}
                                >
                                  {SKILL_LABELS[skill]}
                                </Typography>
                                {isFixed && (
                                  <Tooltip
                                    title={
                                      originProficiencies.includes(skill)
                                        ? 'Origem'
                                        : 'Arquétipo'
                                    }
                                  >
                                    <InfoIcon
                                      fontSize="small"
                                      sx={{
                                        fontSize: 14,
                                        color: 'action.active',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                            sx={{ m: 0 }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })}
          </>
        )}
      </Paper>

      {/* Habilidade de Assinatura */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <StarIcon color="warning" />
          <Typography variant="subtitle2">Habilidade de Assinatura</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escolha uma habilidade para ser sua assinatura. Você ganha{' '}
          <strong>+1d</strong> em testes dessa habilidade nos níveis 1-5,{' '}
          <strong>+2d</strong> nos níveis 6-10 e <strong>+3d</strong> nos níveis
          11-15.
        </Typography>

        <FormControl fullWidth size="small">
          <InputLabel>Habilidade de Assinatura</InputLabel>
          <Select
            value={skills.signatureSkill ?? ''}
            onChange={handleSignatureChange}
            label="Habilidade de Assinatura"
          >
            <MenuItem value="">
              <em>Nenhuma (escolha uma)</em>
            </MenuItem>
            {SKILL_LIST.map((skill) => (
              <MenuItem key={skill} value={skill}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>{SKILL_LABELS[skill]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    (
                    {SKILL_METADATA[skill].keyAttribute === 'especial'
                      ? 'Especial'
                      : ATTRIBUTE_ABBREVIATIONS[
                          SKILL_METADATA[skill].keyAttribute as AttributeName
                        ]}
                    )
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {skills.signatureSkill && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <strong>{SKILL_LABELS[skills.signatureSkill as SkillName]}</strong>{' '}
            será sua habilidade de assinatura (+1d no nível 1).
          </Alert>
        )}
      </Paper>

      {/* Avisos */}
      <Stack spacing={1}>
        {remainingFreeSlots > 0 && (
          <Alert severity="info">
            Você ainda pode escolher mais <strong>{remainingFreeSlots}</strong>{' '}
            habilidade
            {remainingFreeSlots !== 1 ? 's' : ''}.
          </Alert>
        )}

        {!skills.signatureSkill && (
          <Alert severity="warning">
            Escolha uma habilidade de assinatura para receber bônus de dados.
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
