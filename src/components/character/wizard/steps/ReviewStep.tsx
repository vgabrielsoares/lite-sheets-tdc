/**
 * ReviewStep - Passo 9: Revisão Final
 *
 * Campos:
 * - Resumo completo do personagem
 * - Lista de erros de validação (se houver)
 * - Avisos importantes
 * - Botão de criar personagem
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import BackpackIcon from '@mui/icons-material/Backpack';
import ShieldIcon from '@mui/icons-material/Shield';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { WizardStep, WizardValidationError } from '@/types/wizard';
import type { AttributeName, SkillName } from '@/types';
import type { ArchetypeName } from '@/types/character';
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ABBREVIATIONS,
  ATTRIBUTE_LIST,
  ATTRIBUTE_DEFAULT,
} from '@/constants/attributes';
import { SKILL_LABELS } from '@/constants/skills';
import { ARCHETYPE_LABELS } from '@/constants/archetypes';
import { PURCHASABLE_PROFICIENCIES } from '@/constants/proficiencyPurchases';

/**
 * Calcula o valor de um atributo
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

/**
 * Ícone para cada step
 */
const STEP_ICONS: Record<WizardStep, React.ReactNode> = {
  concept: <PersonIcon />,
  origin: <HomeIcon />,
  lineage: <AutoAwesomeIcon />,
  attributes: <TrendingUpIcon />,
  archetype: <CategoryIcon />,
  skills: <BuildIcon />,
  equipment: <BackpackIcon />,
  proficiencies: <ShieldIcon />,
  review: <CheckCircleIcon />,
};

export default function ReviewStep({ wizard }: WizardStepProps) {
  const { state, getValidationErrors, goToStep, commitCharacter, isLoading } =
    wizard;
  const {
    concept,
    origin,
    lineage,
    attributes,
    archetype,
    skills,
    equipment,
    proficiencies,
  } = state;

  // Erros de validação
  const validationErrors = useMemo(
    () => getValidationErrors(),
    [getValidationErrors]
  );

  // Separar erros por severidade
  const errors = validationErrors.filter((e) => e.severity === 'error');
  const warnings = validationErrors.filter((e) => e.severity === 'warning');

  // Handler para navegar a um step
  const handleGoToStep = useCallback(
    (step: WizardStep) => {
      goToStep(step);
    },
    [goToStep]
  );

  // Handler para criar personagem
  const handleCreate = useCallback(() => {
    if (errors.length > 0) return;
    commitCharacter();
  }, [errors.length, commitCharacter]);

  // Calcular atributos finais
  const attributeValues = useMemo(() => {
    const values: Record<AttributeName, number> = {} as Record<
      AttributeName,
      number
    >;
    ATTRIBUTE_LIST.forEach((attr) => {
      values[attr] = calculateAttributeValue(attr, origin, lineage, attributes);
    });
    return values;
  }, [origin, lineage, attributes]);

  // Frase de conceito
  const conceptPhrase = useMemo(() => {
    const parts: string[] = [];
    if (concept.youAre) parts.push(`Você é ${concept.youAre}`);
    if (concept.byFrom) parts.push(concept.byFrom);
    if (concept.alsoIs) parts.push(`Também é ${concept.alsoIs}`);
    if (concept.andWants) parts.push(`e quer ${concept.andWants}`);
    return parts.join('. ') + (parts.length > 0 ? '.' : '');
  }, [concept]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: errors.length > 0 ? 'error.main' : 'success.main',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircleIcon color={errors.length > 0 ? 'error' : 'success'} />
          <Typography variant="h6">Revisão Final</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Revise todos os dados do seu personagem antes de criar.
        </Typography>
      </Paper>

      {/* Erros de validação */}
      {errors.length > 0 && (
        <Alert severity="error" icon={<ErrorIcon />}>
          <Typography variant="subtitle2" gutterBottom>
            Corrija os seguintes erros antes de criar:
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {errors.map((err, idx) => (
              <li key={idx}>
                <Typography variant="body2">
                  {err.message}{' '}
                  <Button size="small" onClick={() => handleGoToStep(err.step)}>
                    Ir para {err.step}
                  </Button>
                </Typography>
              </li>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Avisos */}
      {warnings.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />}>
          <Typography variant="subtitle2" gutterBottom>
            Avisos (não impedem criação):
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {warnings.map((warn, idx) => (
              <li key={idx}>
                <Typography variant="body2">{warn.message}</Typography>
              </li>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Seção 1: Conceito */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.concept}
            <Typography fontWeight={600}>Conceito</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('concept');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Nome
                  </TableCell>
                  <TableCell>
                    {concept.characterName || <em>Não definido</em>}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Jogador</TableCell>
                  <TableCell>{concept.playerName || <em>—</em>}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Conceito</TableCell>
                  <TableCell>{conceptPhrase || <em>—</em>}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Seção 2: Origem */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.origin}
            <Typography fontWeight={600}>Origem</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('origin');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Nome
                  </TableCell>
                  <TableCell>{origin.name || <em>Não definida</em>}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Proficiências</TableCell>
                  <TableCell>
                    {origin.skillProficiencies.length > 0 ? (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {origin.skillProficiencies.map((skill) => (
                          <Chip
                            key={skill}
                            label={SKILL_LABELS[skill]}
                            size="small"
                          />
                        ))}
                      </Stack>
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Modificadores</TableCell>
                  <TableCell>
                    {origin.attributeModifiers.length > 0 ? (
                      origin.attributeModifiers
                        .map(
                          (m) =>
                            `${m.value > 0 ? '+' : ''}${m.value} ${ATTRIBUTE_ABBREVIATIONS[m.attribute]}`
                        )
                        .join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Itens</TableCell>
                  <TableCell>
                    {origin.items.length > 0 ? (
                      origin.items.map((i) => i.name).join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Seção 3: Linhagem */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.lineage}
            <Typography fontWeight={600}>Linhagem</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('lineage');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Nome
                  </TableCell>
                  <TableCell>{lineage.name || <em>Não definida</em>}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tamanho</TableCell>
                  <TableCell>{lineage.size}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Modificadores</TableCell>
                  <TableCell>
                    {lineage.attributeModifiers.length > 0 ? (
                      lineage.attributeModifiers
                        .map(
                          (m) =>
                            `${m.value > 0 ? '+' : ''}${m.value} ${ATTRIBUTE_ABBREVIATIONS[m.attribute]}`
                        )
                        .join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Movimento</TableCell>
                  <TableCell>
                    Andando: {lineage.movement.andando ?? 5}m
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Seção 4: Atributos */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.attributes}
            <Typography fontWeight={600}>Atributos</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('attributes');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {ATTRIBUTE_LIST.map((attr) => (
              <Chip
                key={attr}
                label={`${ATTRIBUTE_LABELS[attr]}: ${attributeValues[attr]}`}
                color={attributeValues[attr] === 0 ? 'warning' : 'default'}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Seção 5: Arquétipo */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.archetype}
            <Typography fontWeight={600}>Arquétipo</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('archetype');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Arquétipo
                  </TableCell>
                  <TableCell>
                    {archetype.name ? (
                      ARCHETYPE_LABELS[archetype.name as ArchetypeName]
                    ) : (
                      <em>Não selecionado</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Habilidades</TableCell>
                  <TableCell>
                    {archetype.initialSkills.length > 0 ? (
                      archetype.initialSkills
                        .map((s) => SKILL_LABELS[s as SkillName])
                        .join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Proficiências</TableCell>
                  <TableCell>
                    {archetype.proficiencies.length > 0 ? (
                      archetype.proficiencies.join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Seção 6: Habilidades */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.skills}
            <Typography fontWeight={600}>Habilidades</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('skills');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 150 }}>
                    Proficientes
                  </TableCell>
                  <TableCell>
                    {skills.chosenProficiencies.length > 0 ? (
                      skills.chosenProficiencies
                        .map((s) => SKILL_LABELS[s as SkillName])
                        .join(', ')
                    ) : (
                      <em>—</em>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Assinatura</TableCell>
                  <TableCell>
                    {skills.signatureSkill ? (
                      <Chip
                        label={`${SKILL_LABELS[skills.signatureSkill as SkillName]} (+1d)`}
                        size="small"
                        color="warning"
                      />
                    ) : (
                      <em>Não escolhida</em>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Seção 7: Equipamentos */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.equipment}
            <Typography fontWeight={600}>Equipamentos</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('equipment');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip label="Mochila" size="small" />
            <Chip label="Cartão do Banco" size="small" />
            {origin.items.map((item, idx) => (
              <Chip
                key={`origin-${idx}`}
                label={item.name}
                size="small"
                color="primary"
              />
            ))}
            {equipment.purchasedItems.map((item, idx) => (
              <Chip
                key={`purchased-${idx}`}
                label={`${item.name} (${item.cost ?? 0} PO$)`}
                size="small"
                color="info"
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Seção 8: Proficiências Compradas */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            {STEP_ICONS.proficiencies}
            <Typography fontWeight={600}>Proficiências Compradas</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleGoToStep('proficiencies');
            }}
          >
            Editar
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          {proficiencies.purchases.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {proficiencies.purchases.map((p) => {
                const prof = PURCHASABLE_PROFICIENCIES.find(
                  (x) => x.id === p.type
                );
                return (
                  <Chip
                    key={p.id}
                    label={`${prof?.label ?? p.type}${p.specificName ? ` (${p.specificName})` : ''}`}
                    size="small"
                    color="default"
                  />
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma proficiência comprada.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {errors.length > 0 && (
        <Typography variant="caption" color="error" textAlign="center">
          Corrija os erros acima para habilitar a criação.
        </Typography>
      )}
    </Box>
  );
}
