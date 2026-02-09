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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { uuidv4 } from '@/utils/uuid';
import type { Character, AttributeName, Modifier } from '@/types';
import type {
  SpellcastingSkillName,
  SpellcastingAbility,
} from '@/types/spells';
import { DEFAULT_SKILL_USES } from '@/constants/skillUses';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';
import { calculatePPPerRound } from '@/utils/calculations';
import { SPELL_CIRCLE_PP_COST } from '@/constants/spells';
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
  const [formDcBonus, setFormDcBonus] = useState(0);
  const [formAttackBonus, setFormAttackBonus] = useState(0);

  // Dados de feitiços
  const spellcasting = character.spellcasting || {
    knownSpells: [],
    maxKnownSpells: 0,
    knownSpellsModifiers: 0,
    spellcastingAbilities: [],
    masteredMatrices: [],
  };

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
   * Calcula ND e Bônus de Ataque para uma habilidade de conjuração
   */
  const calculateSpellStats = useCallback(
    (ability: SpellcastingAbility) => {
      const attributeValue = character.attributes[ability.attribute];
      const skillModifier = calculateSpellcastingModifier(ability.skill);

      const spellDC = 12 + attributeValue + skillModifier + ability.dcBonus;
      const spellAttackBonus =
        attributeValue + skillModifier + ability.attackBonus;

      // Criar tooltips explicativos
      const dcBreakdown = [
        `ND = 12 (base) + ${attributeValue} (${ATTRIBUTE_LABELS[ability.attribute]}) + ${skillModifier} (mod. ${SKILL_LABELS[ability.skill]})`,
        ability.dcBonus !== 0 ? ` + ${ability.dcBonus} (bônus adicional)` : '',
      ]
        .filter(Boolean)
        .join('');

      const attackBreakdown = [
        `Ataque = ${attributeValue} (${ATTRIBUTE_LABELS[ability.attribute]}) + ${skillModifier} (mod. ${SKILL_LABELS[ability.skill]})`,
        ability.attackBonus !== 0
          ? ` + ${ability.attackBonus} (bônus adicional)`
          : '',
      ]
        .filter(Boolean)
        .join('');

      return {
        spellDC,
        spellAttackBonus,
        skillModifier,
        dcBreakdown,
        attackBreakdown,
      };
    },
    [character.attributes, calculateSpellcastingModifier]
  );

  // Handlers
  const handleOpenAddDialog = () => {
    setFormSkill('arcano');
    setFormAttribute('essencia');
    setFormDcBonus(0);
    setFormAttackBonus(0);
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (ability: SpellcastingAbility) => {
    setSelectedAbility(ability);
    setFormSkill(ability.skill);
    setFormAttribute(ability.attribute);
    setFormDcBonus(ability.dcBonus);
    setFormAttackBonus(ability.attackBonus);
    setEditDialogOpen(true);
  };

  const handleAddAbility = () => {
    const newAbility: SpellcastingAbility = {
      id: uuidv4(),
      skill: formSkill,
      attribute: formAttribute,
      dcBonus: formDcBonus,
      attackBonus: formAttackBonus,
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
                dcBonus: formDcBonus,
                attackBonus: formAttackBonus,
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

  // Tooltip de custos de PP
  const ppCostTooltip = useMemo(() => {
    return (
      <Box sx={{ p: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
        >
          Custo de PP por Círculo:
        </Typography>
        {Object.entries(SPELL_CIRCLE_PP_COST).map(([circle, cost]) => (
          <Typography key={circle} variant="caption" sx={{ display: 'block' }}>
            {circle}º círculo: <strong>{cost} PP</strong>
          </Typography>
        ))}
      </Box>
    );
  }, []);

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
              <Tooltip title={ppCostTooltip} arrow>
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
                    PP Atuais
                  </Typography>
                  <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </Box>
              </Tooltip>
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
                const stats = calculateSpellStats(ability);
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
                          mb: 2,
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
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAbility(ability.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="center"
                      >
                        <Tooltip
                          title={stats.dcBreakdown}
                          arrow
                          placement="top"
                        >
                          <Box sx={{ textAlign: 'center', cursor: 'help' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              ND (Nível de Dificuldade)
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              {stats.spellDC}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              12 + {character.attributes[ability.attribute]} +{' '}
                              {stats.skillModifier}
                              {ability.dcBonus !== 0 && ` + ${ability.dcBonus}`}
                            </Typography>
                          </Box>
                        </Tooltip>

                        <Tooltip
                          title={stats.attackBreakdown}
                          arrow
                          placement="top"
                        >
                          <Box sx={{ textAlign: 'center', cursor: 'help' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Bônus de Ataque
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 700, color: 'success.main' }}
                            >
                              +{stats.spellAttackBonus}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {character.attributes[ability.attribute]} +{' '}
                              {stats.skillModifier}
                              {ability.attackBonus !== 0 &&
                                ` + ${ability.attackBonus}`}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Stack>
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={formDcBonus}
                  onChange={setFormDcBonus}
                  label="Bônus ND"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={formAttackBonus}
                  onChange={setFormAttackBonus}
                  label="Bônus Ataque"
                />
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              O modificador da habilidade será calculado automaticamente usando
              o modificador do uso "Conjurar Feitiço" (se existir) ou o
              modificador geral da habilidade.
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={formDcBonus}
                  onChange={setFormDcBonus}
                  label="Bônus ND"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <EditableNumber
                  value={formAttackBonus}
                  onChange={setFormAttackBonus}
                  label="Bônus Ataque"
                />
              </Box>
            </Box>
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
