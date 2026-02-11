'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  AutoFixHigh as SpellPointsIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import { uuidv4 } from '@/utils/uuid';
import type { Character, Modifier } from '@/types';
import type {
  SpellcastingSkillName,
  SpellcastingAbility,
} from '@/types/spells';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';
import { calculatePPPerRound } from '@/utils/calculations';
import { SPELL_CIRCLE_PF_COST, CHANNEL_MANA_LABELS } from '@/constants/spells';
import { EditableNumber } from '@/components/shared';

export interface SpellDashboardProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SPELLCASTING_SKILLS: SpellcastingSkillName[] = [
  'arcano',
  'arte',
  'natureza',
  'performance',
  'religiao',
  'vigor',
];

const SKILL_LABELS: Record<SpellcastingSkillName, string> = {
  arcano: 'Arcano',
  arte: 'Arte',
  natureza: 'Natureza',
  performance: 'Performance',
  religiao: 'Religião',
  vigor: 'Vigor',
};

const ATTRIBUTE_LABELS: Record<
  'corpo' | 'influencia' | 'essencia' | 'instinto',
  string
> = {
  corpo: 'Corpo',
  influencia: 'Influência',
  essencia: 'Essência',
  instinto: 'Instinto',
};

/**
 * Dashboard de Feitiços - FASE 6.7
 *
 * Sistema de cadastro de habilidades de conjuração com cálculos dinâmicos.
 *
 * Mudanças principais:
 * - Habilidades de conjuração cadastradas dinamicamente
 * - Atributo customizável (Presença, Influência ou Constituição)
 * - Modificadores extraídos do uso "Conjurar Feitiço" ou modificador geral
 * - PP por rodada e PP atuais puxados de combat
 * - Custos de PP em tooltip ao invés de tabela
 * - Interface centralizada e limpa
 */
export function SpellDashboard({ character, onUpdate }: SpellDashboardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAbility, setSelectedAbility] =
    useState<SpellcastingAbility | null>(null);

  // Form state
  const [formSkill, setFormSkill] = useState<SpellcastingSkillName>('arcano');
  const [formAttribute, setFormAttribute] = useState<
    'corpo' | 'influencia' | 'essencia' | 'instinto'
  >('essencia');
  const [formCastingBonus, setFormCastingBonus] = useState(0);

  // Dados de feitiços
  const spellcasting = character.spellcasting || {
    isCaster: false,
    castingSkill: undefined,
    spellPoints: { current: 0, max: 0 },
    knownSpells: [],
    maxKnownSpells: 0,
    knownSpellsModifiers: 0,
    spellcastingAbilities: [],
    masteredMatrices: [],
  };

  const isCaster = spellcasting.isCaster ?? false;

  // PP por rodada (calculado dinamicamente)
  // Fórmula: Nível + Presença + Modificadores
  const ppLimitBase = calculatePPPerRound(
    character.level,
    character.attributes.essencia,
    0
  );
  const ppLimitModifiers = (character.combat?.ppLimit?.modifiers || []).reduce(
    (sum, mod) => sum + (mod.value || 0),
    0
  );
  const ppPerRound = ppLimitBase + ppLimitModifiers;

  // PP atuais (incluindo temporários)
  const currentPP =
    (character.combat?.pp?.current || 0) +
    (character.combat?.pp?.temporary || 0);
  const maxPP = character.combat?.pp?.max || 0;

  // Feitiços conhecidos
  const currentKnownSpells = spellcasting.knownSpells.length;
  const maxKnownSpells =
    spellcasting.maxKnownSpells + spellcasting.knownSpellsModifiers;

  /**
   * Calcula o modificador de uma habilidade de conjuração
   * Prioriza o uso customizado "Conjurar Feitiço" se existir
   * Inclui modificadores gerais da habilidade + modificadores do uso customizado
   */
  const calculateSpellcastingModifier = useCallback(
    (skillName: SpellcastingSkillName): number => {
      const skill = character.skills?.[skillName];
      if (!skill) return 0;

      // Buscar uso customizado "Conjurar Feitiço" em customUses
      const conjurarFeiticoUse = skill.customUses?.find(
        (use) => use.name === 'Conjurar Feitiço'
      );

      if (conjurarFeiticoUse) {
        // Usar atributo e modificadores do uso customizado
        const attributeValue =
          character.attributes[conjurarFeiticoUse.keyAttribute];

        // Combinar:
        // 1. Modificadores gerais da habilidade
        // 2. Modificadores do uso customizado
        // 3. Bônus do uso customizado (convertido para modificador numérico)
        const allModifiers: Modifier[] = [
          ...(skill.modifiers || []),
          ...(conjurarFeiticoUse.modifiers || []),
        ];

        // Adicionar bônus do uso como modificador numérico
        if (conjurarFeiticoUse.bonus !== 0) {
          allModifiers.push({
            name: `Uso: ${conjurarFeiticoUse.name}`,
            value: conjurarFeiticoUse.bonus,
            type: conjurarFeiticoUse.bonus > 0 ? 'bonus' : 'penalidade',
          });
        }

        const calc = calculateSkillTotalModifier(
          skillName,
          conjurarFeiticoUse.keyAttribute,
          attributeValue,
          skill.proficiencyLevel,
          skill.isSignature,
          character.level,
          allModifiers,
          false
        );

        // TODO: [Phase 5] Rework spell DC/attack to use pool system instead of flat modifier
        return calc.totalDice;
      }

      // Caso contrário, usar modificador geral da habilidade
      const calc = calculateSkillTotalModifier(
        skillName,
        skill.keyAttribute,
        character.attributes[skill.keyAttribute],
        skill.proficiencyLevel,
        skill.isSignature,
        character.level,
        skill.modifiers || [],
        false
      );

      // TODO: [Phase 5] Rework spell DC/attack to use pool system instead of flat modifier
      return calc.totalDice;
    },
    [character]
  );

  /**
   * Calcula o pool de dados para um teste de conjuração.
   * Pool = Atributo + modificador da habilidade + bônus de teste de conjuração
   */
  const calculateCastingPool = useCallback(
    (ability: SpellcastingAbility) => {
      const attributeValue = character.attributes[ability.attribute];
      const skillModifier = calculateSpellcastingModifier(ability.skill);
      const totalDice = attributeValue + skillModifier + ability.castingBonus;

      const breakdown = [
        `${attributeValue}d (${ATTRIBUTE_LABELS[ability.attribute]})`,
        `${skillModifier >= 0 ? '+' : ''}${skillModifier}d (mod. ${SKILL_LABELS[ability.skill]})`,
        ability.castingBonus !== 0
          ? `${ability.castingBonus >= 0 ? '+' : ''}${ability.castingBonus}d (bônus)`
          : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        totalDice: Math.max(0, totalDice),
        skillModifier,
        breakdown,
      };
    },
    [character.attributes, calculateSpellcastingModifier]
  );

  // Handlers
  const handleOpenAddDialog = () => {
    setFormSkill('arcano');
    setFormAttribute('essencia');
    setFormCastingBonus(0);
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (ability: SpellcastingAbility) => {
    setSelectedAbility(ability);
    setFormSkill(ability.skill);
    setFormAttribute(ability.attribute);
    setFormCastingBonus(ability.castingBonus);
    setEditDialogOpen(true);
  };

  const handleAddAbility = () => {
    const newAbility: SpellcastingAbility = {
      id: uuidv4(),
      skill: formSkill,
      attribute: formAttribute,
      castingBonus: formCastingBonus,
    };

    onUpdate({
      spellcasting: {
        ...spellcasting,
        spellcastingAbilities: [
          ...spellcasting.spellcastingAbilities,
          newAbility,
        ],
      },
    });

    setAddDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!selectedAbility) return;

    onUpdate({
      spellcasting: {
        ...spellcasting,
        spellcastingAbilities: spellcasting.spellcastingAbilities.map((a) =>
          a.id === selectedAbility.id
            ? {
                ...a,
                skill: formSkill,
                attribute: formAttribute,
                castingBonus: formCastingBonus,
              }
            : a
        ),
      },
    });

    setEditDialogOpen(false);
    setSelectedAbility(null);
  };

  const handleDeleteAbility = (id: string) => {
    onUpdate({
      spellcasting: {
        ...spellcasting,
        spellcastingAbilities: spellcasting.spellcastingAbilities.filter(
          (a) => a.id !== id
        ),
      },
    });
  };

  const handleUpdateMaxSpells = useCallback(
    (value: number) => {
      onUpdate({
        spellcasting: {
          ...spellcasting,
          maxKnownSpells: Math.max(0, value),
        },
      });
    },
    [spellcasting, onUpdate]
  );

  const handleUpdateSpellsModifier = useCallback(
    (value: number) => {
      onUpdate({
        spellcasting: {
          ...spellcasting,
          knownSpellsModifiers: value,
        },
      });
    },
    [spellcasting, onUpdate]
  );

  // ─── Handlers de Conjurador / PF ─────────────────────────────

  /** Toggle de conjurador — habilita/desabilita o sistema de PF */
  const handleToggleCaster = useCallback(
    (checked: boolean) => {
      onUpdate({
        spellcasting: {
          ...spellcasting,
          isCaster: checked,
          spellPoints: checked
            ? { current: 0, max: 0 }
            : { current: 0, max: 0 },
        },
      });
    },
    [spellcasting, onUpdate]
  );

  /** Atualiza PF atual */
  const handleUpdateSpellPointsCurrent = useCallback(
    (value: number) => {
      const newValue = Math.max(0, value);
      onUpdate({
        spellcasting: {
          ...spellcasting,
          spellPoints: {
            ...spellcasting.spellPoints,
            current: newValue,
          },
        },
      });
    },
    [spellcasting, onUpdate]
  );

  /** Atualiza PF máximo */
  const handleUpdateSpellPointsMax = useCallback(
    (value: number) => {
      onUpdate({
        spellcasting: {
          ...spellcasting,
          spellPoints: {
            ...spellcasting.spellPoints,
            max: Math.max(0, value),
          },
        },
      });
    },
    [spellcasting, onUpdate]
  );

  // ─── Tooltips ─────────────────────────────────────────────────

  // Tooltip de PP por Rodada
  const ppPerRoundTooltip = useMemo(() => {
    const lines = [
      `Limite de PP por Rodada:`,
      `• Nível: +${character.level}`,
      `• Essência: +${character.attributes.essencia}`,
    ];

    if (ppLimitModifiers !== 0) {
      lines.push(
        `• Modificadores: ${ppLimitModifiers > 0 ? '+' : ''}${ppLimitModifiers}`
      );
    }

    lines.push(`━━━━━━━━━━━━━━━━━`);
    lines.push(`Total: ${ppPerRound} PP/rodada`);

    return lines.join('\n');
  }, [
    character.level,
    character.attributes.essencia,
    ppLimitModifiers,
    ppPerRound,
  ]);

  return (
    <Box>
      {/* Cabeçalho */}
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}
      >
        Dashboard de Feitiços
      </Typography>

      <Stack spacing={3}>
        {/* Toggle de Conjurador */}
        {!isCaster ? (
          /* Não-conjurador: card proeminente com explicação */
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              transition: 'border-color 0.3s ease-in-out',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={false}
                      onChange={(e) => handleToggleCaster(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Conjurador
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                >
                  Ative o toggle acima para habilitar o sistema de Pontos de
                  Feitiço (PF) e recursos de conjuração.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          /* Conjurador ativo: toggle discreto inline */
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={true}
                  onChange={(e) => handleToggleCaster(e.target.checked)}
                  color="secondary"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Conjurador
                </Typography>
              }
            />
          </Box>
        )}

        {/* PF Compacto — apenas para conjuradores */}
        {isCaster && (
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'secondary.main' }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1.5}>
                {/* Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SpellPointsIcon color="secondary" fontSize="small" />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'secondary.main' }}
                    >
                      Pontos de Feitiço (PF)
                    </Typography>
                  </Stack>
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          Custo de PF por Círculo:
                        </Typography>
                        {Object.entries(SPELL_CIRCLE_PF_COST).map(
                          ([circle, cost]) => (
                            <Typography
                              key={circle}
                              variant="caption"
                              sx={{ display: 'block' }}
                            >
                              {circle}º: <strong>{cost} PF</strong>
                            </Typography>
                          )
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          Canalizar Mana:
                        </Typography>
                        {Object.entries(CHANNEL_MANA_LABELS).map(
                          ([actions, label]) => (
                            <Typography
                              key={actions}
                              variant="caption"
                              sx={{ display: 'block' }}
                            >
                              {label}
                            </Typography>
                          )
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontStyle: 'italic',
                            color: 'warning.main',
                          }}
                        >
                          Gastar PF também gasta PP.
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <InfoIcon
                      sx={{
                        fontSize: 16,
                        color: 'text.secondary',
                        cursor: 'help',
                      }}
                    />
                  </Tooltip>
                </Stack>

                {/* PF Current / Max + Progress bar */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Atual
                    </Typography>
                    <EditableNumber
                      value={spellcasting.spellPoints?.current ?? 0}
                      onChange={handleUpdateSpellPointsCurrent}
                      label=""
                    />
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    /
                  </Typography>
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Máximo
                    </Typography>
                    <EditableNumber
                      value={spellcasting.spellPoints?.max ?? 0}
                      onChange={handleUpdateSpellPointsMax}
                      label=""
                    />
                  </Box>
                </Stack>

                <LinearProgress
                  color="secondary"
                  variant="determinate"
                  value={
                    (spellcasting.spellPoints?.max ?? 0) > 0
                      ? Math.min(
                          100,
                          Math.floor(
                            ((spellcasting.spellPoints?.current ?? 0) /
                              (spellcasting.spellPoints?.max ?? 1)) *
                              100
                          )
                        )
                      : 0
                  }
                  sx={{ height: 6, borderRadius: 999 }}
                />
              </Stack>
            </CardContent>
          </Card>
        )}
        {/* Cards informativos centralizados */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          {/* Feitiços Conhecidos */}
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 280 }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Feitiços Conhecidos
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 1,
                  gap: 1,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {currentKnownSpells}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  / {maxKnownSpells}
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ flex: 1, maxWidth: 100 }}>
                  <EditableNumber
                    value={spellcasting.maxKnownSpells}
                    onChange={handleUpdateMaxSpells}
                    label="Máx"
                  />
                </Box>
                <Box sx={{ flex: 1, maxWidth: 100 }}>
                  <EditableNumber
                    value={spellcasting.knownSpellsModifiers}
                    onChange={handleUpdateSpellsModifier}
                    label="Mod"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* PP por Rodada */}
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 200 }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Tooltip title={ppPerRoundTooltip} arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    PP por Rodada
                  </Typography>
                  <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </Box>
              </Tooltip>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {ppPerRound}
              </Typography>
            </CardContent>
          </Card>

          {/* PP Atuais */}
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 200 }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                PP Atuais
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 1,
                  gap: 1,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {currentPP}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  / {maxPP}
                </Typography>
              </Box>
              {character.combat?.pp?.temporary ? (
                <Chip
                  label={`+${character.combat.pp.temporary} temp`}
                  size="small"
                  color="info"
                  sx={{ mt: 1, fontSize: '0.65rem', height: 20 }}
                />
              ) : null}
            </CardContent>
          </Card>
        </Stack>

        {/* Habilidades de Conjuração Cadastradas */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Habilidades de Conjuração
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              variant="outlined"
              size="small"
            >
              Adicionar
            </Button>
          </Box>

          {spellcasting.spellcastingAbilities.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 2 }}
                >
                  Nenhuma habilidade de conjuração cadastrada
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  variant="contained"
                  size="small"
                >
                  Cadastrar Primeira Habilidade
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {spellcasting.spellcastingAbilities.map((ability) => {
                const pool = calculateCastingPool(ability);
                return (
                  <Card
                    key={ability.id}
                    elevation={0}
                    sx={{ border: '1px solid', borderColor: 'primary.main' }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: 'primary.main' }}
                          >
                            {SKILL_LABELS[ability.skill]}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            Atributo: {ATTRIBUTE_LABELS[ability.attribute]} (
                            {character.attributes[ability.attribute]})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(ability)}
                            aria-label="Editar habilidade de conjuração"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAbility(ability.id)}
                            color="error"
                            aria-label="Remover habilidade de conjuração"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Teste de Conjuração — pool de dados */}
                      <Tooltip title={pool.breakdown} arrow placement="top">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            cursor: 'help',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                          }}
                        >
                          <CasinoIcon color="primary" />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Teste de Conjuração
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              {pool.totalDice}d
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Dialog Adicionar */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adicionar Habilidade de Conjuração</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Habilidade</InputLabel>
              <Select
                value={formSkill}
                onChange={(e) =>
                  setFormSkill(e.target.value as SpellcastingSkillName)
                }
                label="Habilidade"
              >
                {SPELLCASTING_SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {SKILL_LABELS[skill]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Atributo Base</InputLabel>
              <Select
                value={formAttribute}
                onChange={(e) =>
                  setFormAttribute(
                    e.target.value as
                      | 'corpo'
                      | 'influencia'
                      | 'essencia'
                      | 'instinto'
                  )
                }
                label="Atributo Base"
              >
                <MenuItem value="corpo">Corpo</MenuItem>
                <MenuItem value="influencia">Influência</MenuItem>
                <MenuItem value="essencia">Essência</MenuItem>
                <MenuItem value="instinto">Instinto</MenuItem>
              </Select>
            </FormControl>

            <EditableNumber
              value={formCastingBonus}
              onChange={setFormCastingBonus}
              label="Bônus de Teste de Conjuração (+d)"
            />

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              O pool de dados será: Atributo + modificador da habilidade +
              bônus. O modificador usa "Conjurar Feitiço" (se existir) ou o
              modificador geral.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddAbility} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Habilidade de Conjuração</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Habilidade</InputLabel>
              <Select
                value={formSkill}
                onChange={(e) =>
                  setFormSkill(e.target.value as SpellcastingSkillName)
                }
                label="Habilidade"
              >
                {SPELLCASTING_SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {SKILL_LABELS[skill]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Atributo Base</InputLabel>
              <Select
                value={formAttribute}
                onChange={(e) =>
                  setFormAttribute(
                    e.target.value as
                      | 'corpo'
                      | 'influencia'
                      | 'essencia'
                      | 'instinto'
                  )
                }
                label="Atributo Base"
              >
                <MenuItem value="corpo">Corpo</MenuItem>
                <MenuItem value="influencia">Influência</MenuItem>
                <MenuItem value="essencia">Essência</MenuItem>
                <MenuItem value="instinto">Instinto</MenuItem>
              </Select>
            </FormControl>

            <EditableNumber
              value={formCastingBonus}
              onChange={setFormCastingBonus}
              label="Bônus de Teste de Conjuração (+d)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
