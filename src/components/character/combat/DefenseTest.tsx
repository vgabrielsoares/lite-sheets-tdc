/**
 * DefenseTest - Componente para Teste de Defesa Ativo
 *
 * - Defesa agora é um teste ATIVO usando Reflexo (Agilidade) ou Vigor (Corpo)
 * - É uma Ação Livre (∆) para rolar teste de defesa
 * - Cada ✶ no teste reduz ✶ do atacante
 * - NÃO existe mais defesa fixa (15 + Agi + bônus)
 *
 * Substitui o antigo display de defesa fixa e seção de MissPenalties (defesa).
 */
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Speed as ReflexIcon,
  FitnessCenter as VigorIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { DieSize, Modifier } from '@/types/common';
import type { DicePoolResult } from '@/types';
import { getSkillDieSize } from '@/constants/skills';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';
import { rollSkillTest, globalDiceHistory } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { DicePenaltyMap } from '@/utils/conditionEffects';
import { getDicePenaltyForAttribute } from '@/utils/conditionEffects';

export interface DefenseTestProps {
  /** Atributos do personagem */
  attributes: Attributes;
  /** Habilidades do personagem */
  skills: Skills;
  /** Nível do personagem */
  characterLevel: number;
  /** Habilidade de assinatura */
  signatureSkill?: SkillName;
  /** Penalidades de dados de condições ativas (opcional) */
  conditionPenalties?: DicePenaltyMap;
}

/**
 * Informações de uma opção de teste de defesa
 */
interface DefenseOptionInfo {
  skill: SkillName;
  attribute: keyof Attributes;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

/**
 * Resultado do cálculo do pool de defesa
 */
interface DefensePoolResult {
  diceCount: number;
  dieSize: DieSize;
  isPenaltyRoll: boolean;
  formula: string;
}

/**
 * As duas opções de teste de defesa ativo
 */
const DEFENSE_OPTIONS: DefenseOptionInfo[] = [
  {
    skill: 'reflexo',
    attribute: 'agilidade',
    label: 'Reflexo',
    icon: <ReflexIcon />,
    color: '#4CAF50',
    description: 'Esquivar, aparar, reação rápida. Usa Agilidade.',
  },
  {
    skill: 'vigor',
    attribute: 'corpo',
    label: 'Vigor',
    icon: <VigorIcon />,
    color: '#F44336',
    description: 'Resistir, bloquear, aguentar o impacto. Usa Corpo.',
  },
];

/**
 * Labels amigáveis para níveis de proficiência
 */
const PROFICIENCY_LABELS: Record<string, string> = {
  leigo: 'Leigo',
  adepto: 'Adepto',
  versado: 'Versado',
  mestre: 'Mestre',
};

/**
 * Componente que exibe as opções de teste de defesa ativo
 *
 * Defesa é um teste ativo, não um valor fixo.
 * O jogador pode defender com Reflexo (Agi) ou Vigor (Corpo).
 * Cada ✶ obtido reduz 1✶ do ataque inimigo.
 */
export const DefenseTest = React.memo(function DefenseTest({
  attributes,
  skills,
  characterLevel,
  signatureSkill,
  conditionPenalties,
}: DefenseTestProps) {
  // Estado do diálogo de rolagem
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DefenseOptionInfo | null>(null);
  const [rollResult, setRollResult] = useState<DicePoolResult | null>(null);
  const [tempDiceModifier, setTempDiceModifier] = useState(0);

  /** Abre o diálogo de rolagem */
  const handleCardClick = useCallback((option: DefenseOptionInfo) => {
    setSelectedOption(option);
    setRollResult(null);
    setTempDiceModifier(0);
    setDialogOpen(true);
  }, []);

  /** Fecha o diálogo */
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  /**
   * Calcula o pool de dados para um teste de defesa
   * Usa calculateSkillTotalModifier para consistência com SavingThrows
   */
  const calculateDefensePool = (
    option: DefenseOptionInfo
  ): DefensePoolResult => {
    const skill = skills[option.skill];
    const attributeValue = attributes[option.attribute];

    if (!skill) {
      return {
        diceCount: 2,
        dieSize: 'd6' as DieSize,
        isPenaltyRoll: true,
        formula: '2d6 (menor)',
      };
    }

    const isSignature = signatureSkill === option.skill;

    // Obtém modificadores específicos do uso "Defender"
    const useModifiers = skill.defaultUseModifierOverrides?.['Defender'] || [];

    // Combina modificadores base da habilidade com os do uso
    const allModifiers: Modifier[] = [
      ...(skill.modifiers || []),
      ...useModifiers,
    ];

    // Usa calculateSkillTotalModifier para consistência com SavingThrows
    const calculation = calculateSkillTotalModifier(
      option.skill,
      option.attribute,
      attributeValue,
      skill.proficiencyLevel,
      isSignature,
      characterLevel,
      allModifiers
    );

    // Aplica penalidades de condições ativas
    const conditionPenalty = conditionPenalties
      ? getDicePenaltyForAttribute(conditionPenalties, option.attribute)
      : 0;
    const effectiveTotalDice = calculation.totalDice + conditionPenalty;

    const dieSize = calculation.dieSize;

    // Se effectiveTotalDice <= 0, rola 2d e usa o menor
    if (effectiveTotalDice <= 0) {
      return {
        diceCount: 2,
        dieSize,
        isPenaltyRoll: true,
        formula: `2${dieSize} (menor)`,
      };
    }

    const diceCount = Math.min(effectiveTotalDice, 8);
    return {
      diceCount,
      dieSize,
      isPenaltyRoll: false,
      formula: `${diceCount}${dieSize}`,
    };
  };

  /** Executa a rolagem de defesa */
  const handleRoll = useCallback(() => {
    if (!selectedOption) return;
    const pool = calculateDefensePool(selectedOption);
    const baseDice = pool.isPenaltyRoll ? 0 : pool.diceCount;
    const result = rollSkillTest(
      baseDice,
      pool.dieSize,
      tempDiceModifier,
      `Teste de Defesa (${selectedOption.label})`
    );
    globalDiceHistory.add(result);
    setRollResult(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, tempDiceModifier]);

  const defenseOptions = useMemo(
    () =>
      DEFENSE_OPTIONS.map((option) => ({
        ...option,
        pool: calculateDefensePool(option),
        proficiency: skills[option.skill]?.proficiencyLevel ?? 'leigo',
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attributes, skills, characterLevel, signatureSkill, conditionPenalties]
  );

  return (
    <>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ShieldIcon color="primary" />
          <Typography variant="h6" component="h3" color="text.secondary">
            Teste de Defesa
          </Typography>
          <Chip label="∆ Ação Livre" size="small" variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defesa é um teste ativo. Cada ✶ obtido anula 1✶ do atacante. Clique
          para rolar.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {defenseOptions.map((option) => (
            <Tooltip
              key={option.skill}
              title={`Clique para rolar Defesa (${option.label})`}
              arrow
              placement="top"
            >
              <Card
                variant="outlined"
                onClick={() => handleCardClick(option)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(option);
                  }
                }}
                aria-label={`Rolar teste de defesa com ${option.label}: ${option.pool.formula}`}
                sx={{
                  cursor: 'pointer',
                  borderColor: option.color,
                  borderWidth: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${option.color}40`,
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Box sx={{ color: option.color }}>{option.icon}</Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {option.label}
                    </Typography>
                    <Chip
                      label={
                        PROFICIENCY_LABELS[option.proficiency] ??
                        option.proficiency
                      }
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {signatureSkill === option.skill && (
                      <Tooltip title="Habilidade de Assinatura">
                        <Chip
                          label="✦"
                          size="small"
                          color="primary"
                          sx={{ minWidth: 28 }}
                        />
                      </Tooltip>
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {option.description}
                  </Typography>

                  {/* Pool display + dice icon */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={option.pool.formula}
                      color={option.pool.isPenaltyRoll ? 'warning' : 'success'}
                      variant="filled"
                      sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                    />
                    <CasinoIcon
                      fontSize="small"
                      sx={{ color: 'text.secondary' }}
                    />
                  </Stack>

                  {option.pool.isPenaltyRoll && (
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Penalidade: rola 2 dados e usa o menor resultado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Diálogo de Rolagem de Teste de Defesa */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        {selectedOption &&
          (() => {
            const pool = calculateDefensePool(selectedOption);
            const skill = skills[selectedOption.skill];
            const proficiency = skill?.proficiencyLevel || 'leigo';
            const attributeValue = attributes[selectedOption.attribute];
            const isSignature = signatureSkill === selectedOption.skill;

            return (
              <>
                <DialogTitle>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShieldIcon color="primary" />
                    <Typography variant="h6">
                      Teste de Defesa ({selectedOption.label})
                    </Typography>
                  </Stack>
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={2}>
                    {/* Descrição */}
                    <Typography variant="body2" color="text.secondary">
                      {selectedOption.description}
                    </Typography>

                    {/* Configuração da rolagem */}
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        label={`${ATTRIBUTE_LABELS[selectedOption.attribute]}: ${attributeValue}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${PROFICIENCY_LABELS[proficiency]} (${getSkillDieSize(proficiency)})`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Pool: ${pool.formula}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                      {isSignature && (
                        <Chip
                          label="⭐ Assinatura"
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      )}
                      {pool.isPenaltyRoll && (
                        <Chip
                          label="Penalidade: menor resultado"
                          size="small"
                          color="error"
                          variant="filled"
                        />
                      )}
                    </Stack>

                    {/* Modificador temporário */}
                    <TextField
                      label="Modificador temporário (±d)"
                      type="number"
                      size="small"
                      value={tempDiceModifier}
                      onChange={(e) =>
                        setTempDiceModifier(parseInt(e.target.value, 10) || 0)
                      }
                      inputProps={{
                        'aria-label': 'Modificador temporário de dados',
                      }}
                      helperText="Adicione ou remova dados temporariamente"
                      fullWidth
                    />

                    {/* Botão de rolagem */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRoll}
                      startIcon={<CasinoIcon />}
                      fullWidth
                      size="large"
                    >
                      Rolar {pool.formula}
                      {tempDiceModifier !== 0 &&
                        ` (${tempDiceModifier > 0 ? '+' : ''}${tempDiceModifier}d)`}
                    </Button>

                    {/* Resultado */}
                    {rollResult && (
                      <DiceRollResult
                        result={rollResult}
                        animate
                        showBreakdown
                      />
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog}>Fechar</Button>
                </DialogActions>
              </>
            );
          })()}
      </Dialog>
    </>
  );
});

DefenseTest.displayName = 'DefenseTest';

export default DefenseTest;
