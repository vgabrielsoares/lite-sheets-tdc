'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Casino as DiceIcon,
} from '@mui/icons-material';
import { calculateSpellLearningChance } from '@/utils/spellCalculations';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';
import type { SpellCircle } from '@/constants/spells';
import type { Character, SkillName, Modifier } from '@/types';

export interface SpellLearningCalculatorProps {
  /**
   * Personagem completo para cálculos
   */
  character: Character;
  /**
   * Callback opcional quando calcular chance
   */
  onCalculate?: (chance: number) => void;
}

/**
 * SpellLearningCalculator - Calculadora de Chance de Aprendizado de Feitiços
 *
 * Componente que calcula e exibe a chance de um personagem aprender um novo feitiço,
 * mostrando o breakdown de todos os modificadores aplicados conforme as regras do RPG.
 *
 * Regras implementadas:
 * - Valor base: Mente × 5
 * - Modificador da habilidade de conjuração (selecionável):
 *   • Prioriza o uso "Aprender Feitiço" se existir na habilidade
 *   • Caso contrário, usa o modificador geral da habilidade
 *   • Inclui TODOS os modificadores numéricos (via calculateSkillTotalModifier)
 *   • Inclui bônus de Habilidade de Assinatura se aplicável
 * - Modificador por círculo (1º: +30 ou +0 se primeiro, 2º: +10, 3º: 0, 4º: -10, etc.)
 * - Modificador por número de feitiços conhecidos
 * - Modificadores opcionais (matriz, outros)
 * - Limites: mínimo 1%, máximo 99%
 *
 * @example
 * ```tsx
 * <SpellLearningCalculator character={character} />
 * ```
 */
export function SpellLearningCalculator({
  character,
  onCalculate,
}: SpellLearningCalculatorProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillName>('arcano');
  const [circle, setCircle] = useState<SpellCircle>(1);
  const [isFirstSpell, setIsFirstSpell] = useState<boolean>(
    (character.spellcasting?.knownSpells.length || 0) === 0
  );
  const [matrixModifier, setMatrixModifier] = useState<number>(0);
  const [otherModifiers, setOtherModifiers] = useState<number>(0);

  const menteValue = character.attributes.mente;
  const knownSpellsCount = character.spellcasting?.knownSpells.length || 0;

  /**
   * Calcula modificador da habilidade selecionada para aprendizado de feitiços
   * Prioriza o uso customizado "Aprender Feitiço" se existir, caso contrário usa modificador geral
   * Inclui TODOS os modificadores numéricos da habilidade + modificadores do uso customizado
   */
  const calculateSkillModifier = (skillName: SkillName): number => {
    const skill = character.skills[skillName];
    if (!skill) return 0;

    // Buscar uso customizado "Aprender Feitiço" em customUses
    const aprenderFeiticoUse = skill.customUses?.find(
      (use) => use.name === 'Aprender Feitiço'
    );

    if (aprenderFeiticoUse) {
      // Usar atributo e modificadores do uso customizado
      const attributeValue =
        character.attributes[aprenderFeiticoUse.keyAttribute];

      // Combinar:
      // 1. Modificadores gerais da habilidade
      // 2. Modificadores do uso customizado
      // 3. Bônus do uso customizado (convertido para modificador numérico)
      const allModifiers: Modifier[] = [
        ...(skill.modifiers || []),
        ...(aprenderFeiticoUse.modifiers || []),
      ];

      // Adicionar bônus do uso como modificador numérico
      if (aprenderFeiticoUse.bonus !== 0) {
        allModifiers.push({
          name: `Uso: ${aprenderFeiticoUse.name}`,
          value: aprenderFeiticoUse.bonus,
          type: aprenderFeiticoUse.bonus > 0 ? 'bonus' : 'penalidade',
        });
      }

      const calc = calculateSkillTotalModifier(
        skillName,
        aprenderFeiticoUse.keyAttribute,
        attributeValue,
        skill.proficiencyLevel,
        skill.isSignature,
        character.level,
        allModifiers,
        false
      );

      // TODO: [Phase 5] Rework spell learning to use pool system instead of flat modifier
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

    // TODO: [Phase 5] Rework spell learning to use pool system instead of flat modifier
    return calc.totalDice;
  };

  const skillModifier = calculateSkillModifier(selectedSkill);

  // Modificador baseado no número de feitiços conhecidos
  // Pode ser implementado futuramente conforme regras específicas
  const knownSpellsModifier = 0; // TODO: implementar lógica se houver regra específica

  // Calcula a chance de aprendizado
  const learningChance = useMemo(() => {
    const chance = calculateSpellLearningChance(
      menteValue,
      skillModifier,
      circle,
      isFirstSpell,
      knownSpellsModifier,
      matrixModifier,
      otherModifiers
    );

    if (onCalculate) {
      onCalculate(chance);
    }

    return chance;
  }, [
    menteValue,
    skillModifier,
    circle,
    isFirstSpell,
    knownSpellsModifier,
    matrixModifier,
    otherModifiers,
    selectedSkill,
    onCalculate,
  ]);

  // Breakdown dos modificadores para exibição
  const breakdown = useMemo(() => {
    const baseValue = menteValue * 5;
    const circleModifier = getCircleModifier(circle, isFirstSpell);

    return {
      base: { label: 'Valor Base (Mente × 5)', value: baseValue },
      skill: { label: 'Habilidade de Conjuração', value: skillModifier },
      circle: { label: `Círculo ${circle}º`, value: circleModifier },
      known: { label: 'Feitiços Conhecidos', value: knownSpellsModifier },
      matrix: { label: 'Domínio de Matriz', value: matrixModifier },
      other: { label: 'Outros Modificadores', value: otherModifiers },
    };
  }, [
    menteValue,
    skillModifier,
    circle,
    isFirstSpell,
    knownSpellsModifier,
    matrixModifier,
    otherModifiers,
    selectedSkill,
  ]);

  return (
    <Card
      elevation={2}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header - Always Visible */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <DiceIcon color="warning" fontSize="small" />
          <Typography variant="subtitle1" component="h3" sx={{ flexGrow: 1 }}>
            Aprendizado de Feitiços
          </Typography>
          <Tooltip
            title={expanded ? 'Recolher calculadora' : 'Expandir calculadora'}
          >
            <IconButton
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
              aria-label={expanded ? 'Recolher' : 'Expandir'}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Conteúdo Expansível */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Informações do Personagem */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Atributo Mente"
                  value={menteValue}
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Valor base do atributo"
                />
                <FormControl size="small" fullWidth>
                  <InputLabel id="skill-select-label">
                    Habilidade de Conjuração
                  </InputLabel>
                  <Select
                    labelId="skill-select-label"
                    value={selectedSkill}
                    label="Habilidade de Conjuração"
                    onChange={(e) =>
                      setSelectedSkill(e.target.value as SkillName)
                    }
                  >
                    <MenuItem value="arcano">
                      Arcano ({calculateSkillModifier('arcano') >= 0 ? '+' : ''}
                      {calculateSkillModifier('arcano')})
                    </MenuItem>
                    <MenuItem value="arte">
                      Arte ({calculateSkillModifier('arte') >= 0 ? '+' : ''}
                      {calculateSkillModifier('arte')})
                    </MenuItem>
                    <MenuItem value="natureza">
                      Natureza (
                      {calculateSkillModifier('natureza') >= 0 ? '+' : ''}
                      {calculateSkillModifier('natureza')})
                    </MenuItem>
                    <MenuItem value="performance">
                      Performance (
                      {calculateSkillModifier('performance') >= 0 ? '+' : ''}
                      {calculateSkillModifier('performance')})
                    </MenuItem>
                    <MenuItem value="religiao">
                      Religião (
                      {calculateSkillModifier('religiao') >= 0 ? '+' : ''}
                      {calculateSkillModifier('religiao')})
                    </MenuItem>
                    <MenuItem value="vigor">
                      Vigor ({calculateSkillModifier('vigor') >= 0 ? '+' : ''}
                      {calculateSkillModifier('vigor')})
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Campos Editáveis */}
              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel id="circle-select-label">
                    Círculo do Feitiço
                  </InputLabel>
                  <Select
                    labelId="circle-select-label"
                    value={circle}
                    label="Círculo do Feitiço"
                    onChange={(e) =>
                      setCircle(Number(e.target.value) as SpellCircle)
                    }
                  >
                    {([1, 2, 3, 4, 5, 6, 7, 8] as SpellCircle[]).map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}º Círculo
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel id="first-spell-label">
                    Primeiro Feitiço?
                  </InputLabel>
                  <Select
                    labelId="first-spell-label"
                    value={isFirstSpell ? 'sim' : 'nao'}
                    label="Primeiro Feitiço?"
                    onChange={(e) => setIsFirstSpell(e.target.value === 'sim')}
                  >
                    <MenuItem value="sim">Sim</MenuItem>
                    <MenuItem value="nao">Não</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Mod. Matriz"
                  type="number"
                  value={matrixModifier}
                  onChange={(e) => setMatrixModifier(Number(e.target.value))}
                  size="small"
                  helperText="Bônus por domínio de matriz"
                  inputProps={{ min: -50, max: 50 }}
                />
                <TextField
                  label="Outros Modificadores"
                  type="number"
                  value={otherModifiers}
                  onChange={(e) => setOtherModifiers(Number(e.target.value))}
                  size="small"
                  helperText="Modificadores diversos"
                  inputProps={{ min: -50, max: 50 }}
                />
              </Box>
            </Stack>

            {/* Resultado Principal */}
            <Box
              sx={{
                textAlign: 'center',
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Chance de Aprendizado
              </Typography>
              <Typography
                variant="h2"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: getChanceColor(learningChance),
                }}
              >
                {learningChance}%
              </Typography>
              <Chip
                label={getChanceLabel(learningChance)}
                size="small"
                color={getChanceChipColor(learningChance)}
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Detalhamento dos Modificadores */}
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Breakdown dos Modificadores
            </Typography>

            {knownSpellsCount === 0 && isFirstSpell && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Este será seu primeiro feitiço! No 1º círculo, não há bônus
                adicional para o primeiro feitiço aprendido.
              </Alert>
            )}

            <Stack spacing={1}>
              {Object.entries(breakdown).map(([key, { label, value }]) => {
                if (value === 0 && key !== 'base') return null;

                return (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      bgcolor:
                        key === 'base' ? 'action.hover' : 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{label}</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        value > 0
                          ? 'success.main'
                          : value < 0
                            ? 'error.main'
                            : 'text.primary'
                      }
                    >
                      {value > 0 ? '+' : ''}
                      {value}
                    </Typography>
                  </Box>
                );
              })}

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'action.selected',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  Total (limitado 1-99%)
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {learningChance}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

/**
 * Retorna o modificador do círculo conforme as regras
 */
function getCircleModifier(circle: SpellCircle, isFirstSpell: boolean): number {
  if (circle === 1) return isFirstSpell ? 0 : 30;

  const modifiers: Record<SpellCircle, number> = {
    1: 30, // já tratado acima
    2: 10,
    3: 0,
    4: -10,
    5: -20,
    6: -30,
    7: -50,
    8: -70,
  };

  return modifiers[circle] || 0;
}

/**
 * Retorna cor baseada na chance de sucesso
 */
function getChanceColor(chance: number): string {
  if (chance >= 75) return 'success.main';
  if (chance >= 50) return 'info.main';
  if (chance >= 25) return 'warning.main';
  return 'error.main';
}

/**
 * Retorna label descritivo da chance
 */
function getChanceLabel(chance: number): string {
  if (chance >= 75) return 'Excelente';
  if (chance >= 50) return 'Bom';
  if (chance >= 25) return 'Moderado';
  if (chance >= 10) return 'Difícil';
  return 'Muito Difícil';
}

/**
 * Retorna cor do chip baseada na chance
 */
function getChanceChipColor(
  chance: number
): 'success' | 'info' | 'warning' | 'error' {
  if (chance >= 75) return 'success';
  if (chance >= 50) return 'info';
  if (chance >= 25) return 'warning';
  return 'error';
}
