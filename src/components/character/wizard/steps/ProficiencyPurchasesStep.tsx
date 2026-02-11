/**
 * ProficiencyPurchasesStep - Passo 8: Compra de Proficiências
 *
 * Campos:
 * - Visualização de pontos de atributo disponíveis para gastar
 * - Lista de proficiências compráveis
 * - Compras já realizadas
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { AttributeName } from '@/types';
import type { WizardProficiencyPurchase } from '@/types/wizard';
import {
  PURCHASABLE_PROFICIENCIES,
  PROFICIENCY_PURCHASE_CATEGORY_LABELS,
  getRemainingPurchasePoints,
} from '@/constants/proficiencyPurchases';
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ABBREVIATIONS,
  ATTRIBUTE_LIST,
  ATTRIBUTE_DEFAULT,
} from '@/constants/attributes';

/**
 * Calcula os valores totais dos atributos
 */
function calculateAttributes(
  origin: { attributeModifiers: { attribute: AttributeName; value: number }[] },
  lineage: {
    attributeModifiers: { attribute: AttributeName; value: number }[];
  },
  attributes: {
    freePoints: Record<AttributeName, number>;
    usingExtraPointOption: boolean;
    reducedAttribute?: AttributeName;
  }
): Record<AttributeName, number> {
  const result: Record<AttributeName, number> = {} as Record<
    AttributeName,
    number
  >;

  ATTRIBUTE_LIST.forEach((attr) => {
    const base =
      attributes.usingExtraPointOption && attributes.reducedAttribute === attr
        ? 0
        : ATTRIBUTE_DEFAULT;
    const originMod =
      origin.attributeModifiers.find((m) => m.attribute === attr)?.value ?? 0;
    const lineageMod =
      lineage.attributeModifiers.find((m) => m.attribute === attr)?.value ?? 0;
    const freePoints = attributes.freePoints[attr] ?? 0;

    result[attr] = base + originMod + lineageMod + freePoints;
  });

  return result;
}

/**
 * Gera ID único para compra
 */
function generatePurchaseId(): string {
  return `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ProficiencyPurchasesStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { proficiencies, origin, lineage, attributes } = state;

  // Estado local para seleção de compra
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(
    null
  );
  const [selectedAttribute, setSelectedAttribute] =
    useState<AttributeName | null>(null);
  const [specificName, setSpecificName] = useState('');

  // Valores dos atributos
  const attributeValues = useMemo(
    () => calculateAttributes(origin, lineage, attributes),
    [origin, lineage, attributes]
  );

  // Converter compras do wizard para o formato esperado
  const purchaseRecords = useMemo(() => {
    return proficiencies.purchases.map((p) => ({
      id: p.id,
      proficiencyId: p.type,
      name: p.specificName || p.type,
      specificName: p.specificName,
      paidWithAttribute: p.paidWithAttribute,
      cost: p.cost,
      refunded: false,
    }));
  }, [proficiencies.purchases]);

  // Pontos restantes por atributo
  const remainingPoints = useMemo(
    () => getRemainingPurchasePoints(attributeValues, purchaseRecords),
    [attributeValues, purchaseRecords]
  );

  // Proficiência selecionada (objeto completo)
  const selectedProf = useMemo(
    () => PURCHASABLE_PROFICIENCIES.find((p) => p.id === selectedProficiency),
    [selectedProficiency]
  );

  // Atributos válidos para pagar a proficiência selecionada
  const validPaymentAttributes = useMemo(() => {
    if (!selectedProf) return [];
    return (Object.keys(selectedProf.costOptions) as AttributeName[]).filter(
      (attr) => {
        const cost = selectedProf.costOptions[attr] ?? 0;
        return remainingPoints[attr] >= cost;
      }
    );
  }, [selectedProf, remainingPoints]);

  // Handler para mudar proficiência selecionada
  const handleProficiencyChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setSelectedProficiency(value || null);
      setSelectedAttribute(null);
      setSpecificName('');
    },
    []
  );

  // Handler para mudar atributo de pagamento
  const handleAttributeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value as AttributeName;
      setSelectedAttribute(value || null);
    },
    []
  );

  // Handler para comprar proficiência
  const handlePurchase = useCallback(() => {
    if (!selectedProf || !selectedAttribute) return;

    const cost = selectedProf.costOptions[selectedAttribute];
    if (cost === undefined) return;

    const newPurchase: WizardProficiencyPurchase = {
      id: generatePurchaseId(),
      type: selectedProf.id as WizardProficiencyPurchase['type'], // IDs match WizardProficiencyPurchase type values
      specificName: selectedProf.isGroupPurchase
        ? undefined
        : specificName || undefined,
      paidWithAttribute: selectedAttribute,
      cost,
    };

    updateNestedState('proficiencies', {
      purchases: [...proficiencies.purchases, newPurchase],
    });

    // Reset form
    setSelectedProficiency(null);
    setSelectedAttribute(null);
    setSpecificName('');
  }, [
    selectedProf,
    selectedAttribute,
    specificName,
    proficiencies.purchases,
    updateNestedState,
  ]);

  // Handler para remover compra
  const handleRemovePurchase = useCallback(
    (purchaseId: string) => {
      const newPurchases = proficiencies.purchases.filter(
        (p) => p.id !== purchaseId
      );
      updateNestedState('proficiencies', { purchases: newPurchases });
    },
    [proficiencies.purchases, updateNestedState]
  );

  // Agrupar proficiências por categoria
  const proficienciesByCategory = useMemo(() => {
    const grouped: Record<
      string,
      (typeof PURCHASABLE_PROFICIENCIES)[number][]
    > = {};
    PURCHASABLE_PROFICIENCIES.forEach((prof) => {
      if (!grouped[prof.category]) grouped[prof.category] = [];
      grouped[prof.category].push(prof);
    });
    return grouped;
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho com pontos disponíveis */}
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
          <ShieldIcon color="primary" />
          <Typography variant="h6">Compra de Proficiências</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Você pode gastar pontos de atributos para comprar proficiências
          adicionais. Cada atributo tem pontos iguais ao seu valor.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 2 }}
        >
          {ATTRIBUTE_LIST.map((attr) => (
            <Chip
              key={attr}
              label={`${ATTRIBUTE_ABBREVIATIONS[attr]}: ${remainingPoints[attr]}/${attributeValues[attr]}`}
              size="small"
              color={
                remainingPoints[attr] < attributeValues[attr]
                  ? 'warning'
                  : 'default'
              }
            />
          ))}
        </Stack>
      </Paper>

      {/* Lista de proficiências compradas */}
      {proficiencies.purchases.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Proficiências Compradas
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Proficiência</TableCell>
                  <TableCell align="center">Custo</TableCell>
                  <TableCell align="center">Atributo</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proficiencies.purchases.map((purchase) => {
                  const prof = PURCHASABLE_PROFICIENCIES.find(
                    (p) => p.id === purchase.type
                  );
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {prof?.label ?? purchase.type}
                          </Typography>
                          {purchase.specificName && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({purchase.specificName})
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{purchase.cost}</TableCell>
                      <TableCell align="center">
                        {ATTRIBUTE_ABBREVIATIONS[purchase.paidWithAttribute]}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePurchase(purchase.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Formulário de compra */}
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
          Comprar Nova Proficiência
        </Typography>

        <Stack spacing={2}>
          {/* Seleção de proficiência */}
          <FormControl fullWidth size="small">
            <InputLabel>Proficiência</InputLabel>
            <Select
              value={selectedProficiency ?? ''}
              onChange={handleProficiencyChange}
              label="Proficiência"
            >
              <MenuItem value="">
                <em>Selecione uma proficiência...</em>
              </MenuItem>
              {Object.entries(proficienciesByCategory).map(
                ([category, profs]) => [
                  <MenuItem
                    key={category}
                    disabled
                    sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                  >
                    {
                      PROFICIENCY_PURCHASE_CATEGORY_LABELS[
                        category as keyof typeof PROFICIENCY_PURCHASE_CATEGORY_LABELS
                      ]
                    }
                  </MenuItem>,
                  ...profs.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{prof.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Custo:{' '}
                          {Object.entries(prof.costOptions)
                            .map(
                              ([attr, cost]) =>
                                `${cost} ${ATTRIBUTE_ABBREVIATIONS[attr as AttributeName]}`
                            )
                            .join(' ou ')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>

          {/* Nome específico (para compras unitárias) */}
          {selectedProf && !selectedProf.isGroupPurchase && (
            <TextField
              label="Nome Específico (ex: Espada Longa)"
              value={specificName}
              onChange={(e) => setSpecificName(e.target.value)}
              size="small"
              fullWidth
              helperText="Opcional: especifique qual item ou habilidade"
            />
          )}

          {/* Seleção de atributo para pagar */}
          {selectedProf && (
            <FormControl fullWidth size="small">
              <InputLabel>Pagar com</InputLabel>
              <Select
                value={selectedAttribute ?? ''}
                onChange={handleAttributeChange}
                label="Pagar com"
              >
                <MenuItem value="">
                  <em>Escolha o atributo...</em>
                </MenuItem>
                {(Object.keys(selectedProf.costOptions) as AttributeName[]).map(
                  (attr) => {
                    const cost = selectedProf.costOptions[attr] ?? 0;
                    const canAfford = remainingPoints[attr] >= cost;
                    return (
                      <MenuItem key={attr} value={attr} disabled={!canAfford}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{ATTRIBUTE_LABELS[attr]}</Typography>
                          <Chip
                            label={`Custo: ${cost}`}
                            size="small"
                            color={canAfford ? 'success' : 'error'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            (Disponível: {remainingPoints[attr]})
                          </Typography>
                        </Stack>
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
          )}

          {/* Botão de compra */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePurchase}
            disabled={!selectedProf || !selectedAttribute}
            fullWidth
          >
            Comprar Proficiência
          </Button>
        </Stack>
      </Paper>

      {/* Referência de proficiências */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" gap={1}>
            <InfoIcon fontSize="small" />
            <Typography variant="subtitle2">Tabela de Referência</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(proficienciesByCategory).map(([category, profs]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {
                  PROFICIENCY_PURCHASE_CATEGORY_LABELS[
                    category as keyof typeof PROFICIENCY_PURCHASE_CATEGORY_LABELS
                  ]
                }
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {profs.map((prof) => (
                      <TableRow key={prof.id}>
                        <TableCell sx={{ py: 0.5 }}>{prof.label}</TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          {Object.entries(prof.costOptions)
                            .map(
                              ([attr, cost]) =>
                                `${cost} ${ATTRIBUTE_ABBREVIATIONS[attr as AttributeName]}`
                            )
                            .join(' ou ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Aviso */}
      <Alert severity="info">
        Pontos não gastos permanecem disponíveis. Se você aumentar seus
        atributos no futuro, seus pontos de compra também aumentarão (sistema
        retroativo).
      </Alert>
    </Box>
  );
}
