'use client';

/**
 * ProficiencyPurchasePanel — Interface de compra de proficiências com pontos de atributo
 *
 * Regras (livro v0.1.7):
 * - Cada atributo dá pontos de compra = valor do atributo
 * - Proficiências custam pontos de um atributo específico
 * - Retroativo: ao aumentar atributo, ganha mais pontos
 * - Proficiências compradas são rastreadas separadamente
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Alert,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoIcon from '@mui/icons-material/Info';
import UndoIcon from '@mui/icons-material/Undo';
import type { Character } from '@/types';
import type { AttributeName } from '@/types/attributes';
import type { SkillName } from '@/types/skills';
import { SKILL_LIST } from '@/types';
import {
  PURCHASABLE_PROFICIENCIES,
  PROFICIENCY_PURCHASE_CATEGORY_LABELS,
  getRemainingPurchasePoints,
  getSpentPurchasePoints,
  canPurchaseProficiency,
  type PurchasableProficiency,
  type ProficiencyPurchaseRecord,
} from '@/constants/proficiencyPurchases';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { SKILL_LABELS } from '@/constants/skills';
import { LANGUAGE_LIST, LANGUAGE_LABELS } from '@/constants/languages';
import type { LanguageName } from '@/constants/languages';

// ─── Props ──────────────────────────────────────────────────

export interface ProficiencyPurchasePanelProps {
  /** Personagem com atributos e compras atuais */
  character: Character;
  /** Callback para atualizar as compras */
  onPurchasesChange: (purchases: ProficiencyPurchaseRecord[]) => void;
  /** Se edição está desabilitada */
  disabled?: boolean;
}

// ─── Component ──────────────────────────────────────────────

export function ProficiencyPurchasePanel({
  character,
  onPurchasesChange,
  disabled = false,
}: ProficiencyPurchasePanelProps) {
  const [selectedProficiency, setSelectedProficiency] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<
    AttributeName | ''
  >('');
  const [specificName, setSpecificName] = useState('');

  // Pontos disponíveis e gastos
  const purchases = character.proficiencyPurchases ?? [];
  const activePurchases = purchases.filter((p) => !p.refunded);

  const remaining = useMemo(
    () => getRemainingPurchasePoints(character.attributes, purchases),
    [character.attributes, purchases]
  );

  const spent = useMemo(() => getSpentPurchasePoints(purchases), [purchases]);

  // Proficiência selecionada
  const selectedProf = useMemo(
    () => PURCHASABLE_PROFICIENCIES.find((p) => p.id === selectedProficiency),
    [selectedProficiency]
  );

  // Opções de atributo disponíveis para a proficiência selecionada
  const attributeOptions = useMemo(() => {
    if (!selectedProf) return [];
    return (
      Object.entries(selectedProf.costOptions) as [AttributeName, number][]
    )
      .filter(([attr, cost]) => remaining[attr] >= cost)
      .map(([attr, cost]) => ({ attr, cost }));
  }, [selectedProf, remaining]);

  // Habilidades com grau Leigo (para compra de proficiência em habilidade)
  const leigoSkills = useMemo(() => {
    if (!character.skills) return [];
    return SKILL_LIST.filter(
      (skillName) => character.skills[skillName]?.proficiencyLevel === 'leigo'
    );
  }, [character.skills]);

  // Idiomas não conhecidos pelo personagem (para compra de idioma)
  const unknownLanguages = useMemo(() => {
    const known = character.languages ?? [];
    return LANGUAGE_LIST.filter((lang) => !known.includes(lang));
  }, [character.languages]);

  // Pode comprar?
  const canBuy = useMemo(() => {
    if (!selectedProf || !selectedAttribute) return false;
    if (!selectedProf.isGroupPurchase && !specificName.trim()) return false;
    return canPurchaseProficiency(
      selectedProf,
      selectedAttribute as AttributeName,
      character.attributes,
      purchases
    );
  }, [
    selectedProf,
    selectedAttribute,
    specificName,
    character.attributes,
    purchases,
  ]);

  // Handlers
  const handlePurchase = useCallback(() => {
    if (!selectedProf || !selectedAttribute || disabled) return;

    const cost = selectedProf.costOptions[selectedAttribute as AttributeName];
    if (cost === undefined) return;

    const newPurchase: ProficiencyPurchaseRecord = {
      id: crypto.randomUUID(),
      proficiencyId: selectedProf.id,
      name: selectedProf.label,
      specificName: selectedProf.isGroupPurchase
        ? undefined
        : specificName.trim() || undefined,
      paidWithAttribute: selectedAttribute as AttributeName,
      cost,
      refunded: false,
    };

    onPurchasesChange([...purchases, newPurchase]);
    setSelectedProficiency('');
    setSelectedAttribute('');
    setSpecificName('');
  }, [
    selectedProf,
    selectedAttribute,
    specificName,
    purchases,
    onPurchasesChange,
    disabled,
  ]);

  const handleRemovePurchase = useCallback(
    (purchaseId: string) => {
      if (disabled) return;
      onPurchasesChange(purchases.filter((p) => p.id !== purchaseId));
    },
    [purchases, onPurchasesChange, disabled]
  );

  // Agrupar proficiências por categoria
  const categorizedProficiencies = useMemo(() => {
    const categories: Record<string, PurchasableProficiency[]> = {};
    for (const prof of PURCHASABLE_PROFICIENCIES) {
      if (!categories[prof.category]) {
        categories[prof.category] = [];
      }
      categories[prof.category].push(prof);
    }
    return categories;
  }, []);

  return (
    <Box>
      {/* Pontos de Compra */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderRadius: 2 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Pontos de Compra por Atributo
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {(
            Object.entries(character.attributes) as [AttributeName, number][]
          ).map(([attr, value]) => (
            <Chip
              key={attr}
              label={`${ATTRIBUTE_LABELS[attr]}: ${remaining[attr]}/${value}`}
              size="small"
              color={
                remaining[attr] === 0
                  ? 'default'
                  : remaining[attr] < value
                    ? 'warning'
                    : 'success'
              }
              variant="outlined"
            />
          ))}
        </Stack>
      </Paper>

      {/* Formulário de compra */}
      {!disabled && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Comprar Nova Proficiência
          </Typography>

          <Stack spacing={2}>
            {/* Seletor de proficiência */}
            <FormControl size="small" fullWidth>
              <InputLabel>Proficiência</InputLabel>
              <Select
                value={selectedProficiency}
                onChange={(e) => {
                  setSelectedProficiency(e.target.value);
                  setSelectedAttribute('');
                  setSpecificName('');
                }}
                label="Proficiência"
              >
                {Object.entries(categorizedProficiencies).map(
                  ([category, profs]) => [
                    <MenuItem
                      key={`header-${category}`}
                      disabled
                      sx={{
                        fontWeight: 700,
                        opacity: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      {
                        PROFICIENCY_PURCHASE_CATEGORY_LABELS[
                          category as PurchasableProficiency['category']
                        ]
                      }
                    </MenuItem>,
                    ...profs.map((prof) => (
                      <MenuItem key={prof.id} value={prof.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{prof.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            (
                            {Object.entries(prof.costOptions)
                              .map(
                                ([attr, cost]) =>
                                  `${ATTRIBUTE_LABELS[attr as AttributeName]} ${cost}`
                              )
                              .join(' ou ')}
                            )
                          </Typography>
                        </Stack>
                      </MenuItem>
                    )),
                  ]
                )}
              </Select>
            </FormControl>

            {/* Seletor de atributo para pagar */}
            {selectedProf && (
              <FormControl size="small" fullWidth>
                <InputLabel>Pagar com</InputLabel>
                <Select
                  value={selectedAttribute}
                  onChange={(e) =>
                    setSelectedAttribute(e.target.value as AttributeName)
                  }
                  label="Pagar com"
                >
                  {(
                    Object.entries(selectedProf.costOptions) as [
                      AttributeName,
                      number,
                    ][]
                  ).map(([attr, cost]) => (
                    <MenuItem
                      key={attr}
                      value={attr}
                      disabled={remaining[attr] < cost}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {ATTRIBUTE_LABELS[attr]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (custo: {cost} | disponível: {remaining[attr]})
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Nome específico (para compra unitária) */}
            {selectedProf &&
              !selectedProf.isGroupPurchase &&
              selectedProf.category === 'skill' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Habilidade (Leigo → Adepto)</InputLabel>
                  <Select
                    value={specificName}
                    onChange={(e) => setSpecificName(e.target.value)}
                    label="Habilidade (Leigo → Adepto)"
                  >
                    {leigoSkills.map((skillName) => (
                      <MenuItem key={skillName} value={SKILL_LABELS[skillName]}>
                        {SKILL_LABELS[skillName]}
                      </MenuItem>
                    ))}
                    {leigoSkills.length === 0 && (
                      <MenuItem disabled>
                        Nenhuma habilidade com grau Leigo disponível
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}

            {selectedProf &&
              !selectedProf.isGroupPurchase &&
              selectedProf.category === 'language' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={specificName}
                    onChange={(e) => setSpecificName(e.target.value)}
                    label="Idioma"
                  >
                    {unknownLanguages.map((lang) => (
                      <MenuItem key={lang} value={LANGUAGE_LABELS[lang]}>
                        {LANGUAGE_LABELS[lang]}
                      </MenuItem>
                    ))}
                    {unknownLanguages.length === 0 && (
                      <MenuItem disabled>
                        Todos os idiomas já são conhecidos
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}

            {selectedProf &&
              !selectedProf.isGroupPurchase &&
              selectedProf.category !== 'skill' &&
              selectedProf.category !== 'language' && (
                <TextField
                  label="Especificar qual"
                  value={specificName}
                  onChange={(e) => setSpecificName(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder={`Ex: ${selectedProf.category === 'weapon' ? 'Espada Longa' : selectedProf.category === 'armor' ? 'Cota de Malha' : 'Nome específico'}`}
                  required
                />
              )}

            <Button
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={handlePurchase}
              disabled={!canBuy || disabled}
              size="small"
            >
              Comprar
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Lista de compras realizadas */}
      {activePurchases.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2" gutterBottom>
            Proficiências Compradas ({activePurchases.length})
          </Typography>
          {activePurchases.map((purchase) => (
            <Paper
              key={purchase.id}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                  {purchase.name}
                  {purchase.specificName && ` (${purchase.specificName})`}
                </Typography>
                <Chip
                  label={`${ATTRIBUTE_LABELS[purchase.paidWithAttribute]} -${purchase.cost}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Stack>
              {!disabled && (
                <Tooltip title="Remover (devolver pontos)">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemovePurchase(purchase.id)}
                    aria-label={`Remover proficiência ${purchase.name}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          ))}
        </Stack>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2">
            Nenhuma proficiência comprada ainda. Use seus pontos de atributo
            para adquirir proficiências adicionais!
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export default ProficiencyPurchasePanel;
