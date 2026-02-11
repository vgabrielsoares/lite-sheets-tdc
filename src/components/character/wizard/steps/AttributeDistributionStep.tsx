/**
 * AttributeDistributionStep - Passo 4: Distribuição de Atributos
 *
 * Campos:
 * - Visualização de atributos base (1 em cada)
 * - Modificadores de origem e linhagem
 * - 2 pontos livres para distribuir (ou 3 com opção extra)
 * - Opção de reduzir um atributo a 0 para ganhar +1 ponto
 * - Limite máximo de 3 (ou 4 se linhagem deu +2)
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { AttributeName } from '@/types';
import {
  ATTRIBUTE_LIST,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ABBREVIATIONS,
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_DEFAULT,
  ATTRIBUTE_MAX_LEVEL_1,
} from '@/constants/attributes';

/** Pontos livres base disponíveis */
const BASE_FREE_POINTS = 2;

/** Pontos extras ganhos ao reduzir um atributo a 0 */
const EXTRA_POINT_FOR_ZERO = 1;

/**
 * Calcula o modificador total de um atributo vindo de origem ou linhagem
 */
function getModifierFromSource(
  attributeModifiers: { attribute: AttributeName; value: number }[],
  attr: AttributeName
): number {
  const modifier = attributeModifiers.find((m) => m.attribute === attr);
  return modifier?.value ?? 0;
}

/**
 * Formata um número como modificador (+X, -X, ou vazio para 0)
 */
function formatModifier(value: number): string {
  if (value === 0) return '—';
  return value > 0 ? `+${value}` : `${value}`;
}

/**
 * Determina a cor do chip baseado no valor total
 */
function getValueColor(
  total: number
): 'default' | 'warning' | 'error' | 'success' | 'info' {
  if (total < 0) return 'error';
  if (total === 0) return 'warning';
  if (total > 3) return 'info'; // Acima do normal (linhagem +2)
  return 'default';
}

export default function AttributeDistributionStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { attributes, origin, lineage } = state;

  // Calcular totais disponíveis para distribuir
  const totalFreePoints = useMemo(() => {
    return attributes.usingExtraPointOption
      ? BASE_FREE_POINTS + EXTRA_POINT_FOR_ZERO
      : BASE_FREE_POINTS;
  }, [attributes.usingExtraPointOption]);

  // Calcular pontos já gastos
  const usedFreePoints = useMemo(() => {
    return Object.values(attributes.freePoints).reduce(
      (sum, val) => sum + val,
      0
    );
  }, [attributes.freePoints]);

  // Pontos restantes
  const remainingPoints = totalFreePoints - usedFreePoints;

  // Calcular valores totais de cada atributo
  const attributeTotals = useMemo(() => {
    const totals: Record<AttributeName, number> = {} as Record<
      AttributeName,
      number
    >;

    ATTRIBUTE_LIST.forEach((attr) => {
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

      // Se este atributo foi reduzido a 0, ignora o base
      const effectiveBase = reducedToZero ? 0 : base;

      totals[attr] = effectiveBase + originMod + lineageMod + freePoints;
    });

    return totals;
  }, [attributes, origin.attributeModifiers, lineage.attributeModifiers]);

  // Calcular máximo permitido para cada atributo
  const attributeMaximums = useMemo(() => {
    const maxes: Record<AttributeName, number> = {} as Record<
      AttributeName,
      number
    >;

    ATTRIBUTE_LIST.forEach((attr) => {
      const lineageMod = getModifierFromSource(
        lineage.attributeModifiers,
        attr
      );
      // Máximo = 3, ou 4 se linhagem deu +2
      maxes[attr] =
        lineageMod >= 2 ? ATTRIBUTE_MAX_LEVEL_1 + 1 : ATTRIBUTE_MAX_LEVEL_1;
    });

    return maxes;
  }, [lineage.attributeModifiers]);

  // Verificar se há atributos no limite
  const hasMaxedAttribute = useMemo(() => {
    return ATTRIBUTE_LIST.some(
      (attr) => attributeTotals[attr] >= attributeMaximums[attr]
    );
  }, [attributeTotals, attributeMaximums]);

  // Verificar se há atributos zerados sem usar a opção
  const hasZeroWithoutOption = useMemo(() => {
    return ATTRIBUTE_LIST.some(
      (attr) =>
        attributeTotals[attr] === 0 &&
        !(
          attributes.usingExtraPointOption &&
          attributes.reducedAttribute === attr
        )
    );
  }, [
    attributeTotals,
    attributes.usingExtraPointOption,
    attributes.reducedAttribute,
  ]);

  // Handler para adicionar ponto a um atributo
  const handleAddPoint = useCallback(
    (attr: AttributeName) => {
      if (remainingPoints <= 0) return;
      if (attributeTotals[attr] >= attributeMaximums[attr]) return;

      const newFreePoints = {
        ...attributes.freePoints,
        [attr]: attributes.freePoints[attr] + 1,
      };
      updateNestedState('attributes', { freePoints: newFreePoints });
    },
    [
      remainingPoints,
      attributeTotals,
      attributeMaximums,
      attributes.freePoints,
      updateNestedState,
    ]
  );

  // Handler para remover ponto de um atributo
  const handleRemovePoint = useCallback(
    (attr: AttributeName) => {
      if (attributes.freePoints[attr] <= 0) return;

      const newFreePoints = {
        ...attributes.freePoints,
        [attr]: attributes.freePoints[attr] - 1,
      };
      updateNestedState('attributes', { freePoints: newFreePoints });
    },
    [attributes.freePoints, updateNestedState]
  );

  // Handler para toggle da opção de atributo reduzido
  const handleToggleExtraPoint = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;

      if (checked) {
        // Ativa a opção
        updateNestedState('attributes', { usingExtraPointOption: true });
        // Se já havia um atributo escolhido, mantém; senão deixa undefined
      } else {
        // Desativa a opção
        updateNestedState('attributes', {
          usingExtraPointOption: false,
          reducedAttribute: undefined,
        });
      }
    },
    [updateNestedState]
  );

  // Handler para escolher qual atributo reduzir a 0
  const handleReducedAttributeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const attr = event.target.value as AttributeName;

      // Reset os pontos livres desse atributo para evitar inconsistências
      const newFreePoints =
        attributes.freePoints[attr] > 0
          ? { ...attributes.freePoints, [attr]: 0 }
          : attributes.freePoints;

      updateNestedState('attributes', {
        reducedAttribute: attr,
        freePoints: newFreePoints,
      });
    },
    [updateNestedState, attributes.freePoints]
  );

  // Atributos elegíveis para reduzir a 0 (apenas os que têm base 1)
  const reducibleAttributes = useMemo(() => {
    return ATTRIBUTE_LIST.filter((attr) => {
      const originMod = getModifierFromSource(origin.attributeModifiers, attr);
      const lineageMod = getModifierFromSource(
        lineage.attributeModifiers,
        attr
      );
      // Só pode reduzir se o atributo tiver total >= 1 sem pontos livres
      return ATTRIBUTE_DEFAULT + originMod + lineageMod >= 1;
    });
  }, [origin.attributeModifiers, lineage.attributeModifiers]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho com contador de pontos */}
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
          flexWrap="wrap"
          gap={2}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">Distribuição de Atributos</Typography>
          </Box>

          <Chip
            label={`${remainingPoints}/${totalFreePoints} pontos restantes`}
            color={remainingPoints > 0 ? 'warning' : 'success'}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Todos os atributos começam com valor base 1. Distribua seus pontos
          livres e veja os modificadores da origem e linhagem.
        </Typography>
      </Paper>

      {/* Opção de atributo reduzido */}
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
        <FormControlLabel
          control={
            <Switch
              checked={attributes.usingExtraPointOption}
              onChange={handleToggleExtraPoint}
              color="warning"
            />
          }
          label={
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Reduzir um atributo para 0 (+1 ponto extra)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Atenção: Atributos em 0 rolam 2d6 e escolhem o MENOR resultado!
              </Typography>
            </Box>
          }
        />

        {attributes.usingExtraPointOption && (
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Atributo a reduzir para 0</InputLabel>
            <Select
              value={attributes.reducedAttribute ?? ''}
              onChange={handleReducedAttributeChange}
              label="Atributo a reduzir para 0"
            >
              {reducibleAttributes.map((attr) => (
                <MenuItem key={attr} value={attr}>
                  {ATTRIBUTE_LABELS[attr]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Tabela de atributos */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Atributo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Base
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Origem
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Linhagem
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Livre
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {ATTRIBUTE_LIST.map((attr) => {
              const originMod = getModifierFromSource(
                origin.attributeModifiers,
                attr
              );
              const lineageMod = getModifierFromSource(
                lineage.attributeModifiers,
                attr
              );
              const freePoints = attributes.freePoints[attr];
              const total = attributeTotals[attr];
              const max = attributeMaximums[attr];
              const isReducedToZero =
                attributes.usingExtraPointOption &&
                attributes.reducedAttribute === attr;
              const effectiveBase = isReducedToZero ? 0 : ATTRIBUTE_DEFAULT;

              const canAdd = remainingPoints > 0 && total < max;
              const canRemove = freePoints > 0;
              const hasZeroValue = total === 0 || isReducedToZero;

              return (
                <TableRow
                  key={attr}
                  sx={{
                    bgcolor: isReducedToZero
                      ? 'warning.light'
                      : total === 0
                        ? 'error.light'
                        : 'inherit',
                    '&:hover': {
                      bgcolor: isReducedToZero
                        ? 'warning.light'
                        : total === 0
                          ? 'error.light'
                          : 'action.hover',
                    },
                  }}
                >
                  {/* Nome do atributo */}
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography
                        fontWeight={500}
                        sx={{
                          color: hasZeroValue ? 'common.black' : 'text.primary',
                        }}
                      >
                        {ATTRIBUTE_LABELS[attr]}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 0.5,
                          color: hasZeroValue
                            ? 'rgba(0,0,0,0.7)'
                            : 'text.secondary',
                        }}
                      >
                        ({ATTRIBUTE_ABBREVIATIONS[attr]})
                      </Typography>
                      <Tooltip
                        title={ATTRIBUTE_DESCRIPTIONS[attr]}
                        arrow
                        placement="right"
                      >
                        <IconButton
                          size="small"
                          sx={{
                            ml: 0.5,
                            color: hasZeroValue
                              ? 'rgba(0,0,0,0.6)'
                              : 'action.active',
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {/* Base */}
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: hasZeroValue
                          ? 'common.black'
                          : isReducedToZero
                            ? 'warning.main'
                            : 'text.primary',
                        fontWeight: isReducedToZero ? 600 : 400,
                      }}
                    >
                      {isReducedToZero ? '0' : effectiveBase}
                    </Typography>
                  </TableCell>

                  {/* Origem */}
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: hasZeroValue
                          ? 'common.black'
                          : originMod > 0
                            ? 'success.main'
                            : originMod < 0
                              ? 'error.main'
                              : 'text.secondary',
                        fontWeight: originMod !== 0 ? 600 : 400,
                      }}
                    >
                      {formatModifier(originMod)}
                    </Typography>
                  </TableCell>

                  {/* Linhagem */}
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: hasZeroValue
                          ? 'common.black'
                          : lineageMod > 0
                            ? 'success.main'
                            : lineageMod < 0
                              ? 'error.main'
                              : 'text.secondary',
                        fontWeight: lineageMod !== 0 ? 600 : 400,
                      }}
                    >
                      {formatModifier(lineageMod)}
                    </Typography>
                  </TableCell>

                  {/* Livre */}
                  <TableCell align="center">
                    <Typography
                      sx={{
                        color: hasZeroValue
                          ? 'common.black'
                          : freePoints > 0
                            ? 'info.main'
                            : 'text.secondary',
                        fontWeight: freePoints > 0 ? 600 : 400,
                      }}
                    >
                      {formatModifier(freePoints)}
                    </Typography>
                  </TableCell>

                  {/* Total */}
                  <TableCell align="center">
                    <Chip
                      label={total}
                      size="small"
                      color={getValueColor(total)}
                      sx={{
                        fontWeight: 700,
                        minWidth: 32,
                      }}
                    />
                  </TableCell>

                  {/* Ações */}
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Remover ponto">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePoint(attr)}
                            disabled={!canRemove || isReducedToZero}
                            color="error"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Adicionar ponto">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleAddPoint(attr)}
                            disabled={!canAdd || isReducedToZero}
                            color="success"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Avisos e validações */}
      <Stack spacing={1}>
        {remainingPoints > 0 && (
          <Alert severity="info" icon={<InfoIcon />}>
            Você ainda tem <strong>{remainingPoints}</strong> ponto
            {remainingPoints > 1 ? 's' : ''} para distribuir. Pode continuar
            mesmo assim, mas recomendamos usar todos os pontos.
          </Alert>
        )}

        {hasZeroWithoutOption && (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            Um ou mais atributos estão com valor 0. Atributos zerados rolam 2d6
            e escolhem o MENOR resultado!
          </Alert>
        )}

        {attributes.usingExtraPointOption && !attributes.reducedAttribute && (
          <Alert severity="error">
            Você ativou a opção de ponto extra, mas não escolheu qual atributo
            reduzir para 0.
          </Alert>
        )}

        {hasMaxedAttribute && (
          <Alert severity="info">
            Alguns atributos estão no limite máximo ({ATTRIBUTE_MAX_LEVEL_1} ou{' '}
            {ATTRIBUTE_MAX_LEVEL_1 + 1} com bônus de linhagem).
          </Alert>
        )}
      </Stack>

      {/* Legenda */}
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
          Legenda
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="0" size="small" color="warning" />
            <Typography variant="caption">Zerado (penalidade)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="1-3" size="small" color="default" />
            <Typography variant="caption">Normal</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="4+" size="small" color="info" />
            <Typography variant="caption">Acima do normal</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
