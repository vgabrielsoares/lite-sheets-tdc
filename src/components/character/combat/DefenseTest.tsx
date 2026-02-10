/**
 * DefenseTest - Componente para Teste de Defesa Ativo (v0.0.2)
 *
 * Sistema v0.0.2:
 * - Defesa agora é um teste ATIVO usando Reflexo (Agilidade) ou Vigor (Corpo)
 * - É uma Ação Livre (∆) para rolar teste de defesa
 * - Cada ✶ no teste reduz ✶ do atacante
 * - NÃO existe mais defesa fixa (15 + Agi + bônus)
 *
 * Substitui o antigo display de defesa fixa e seção de MissPenalties (defesa).
 */
'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Speed as ReflexIcon,
  FitnessCenter as VigorIcon,
} from '@mui/icons-material';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { DieSize, Modifier } from '@/types/common';
import { getSkillDieSize } from '@/constants/skills';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';
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
    description: 'Esquivar, desviar, reação rápida. Usa Agilidade.',
  },
  {
    skill: 'vigor',
    attribute: 'corpo',
    label: 'Vigor',
    icon: <VigorIcon />,
    color: '#F44336',
    description: 'Resistir pelo corpo, aguentar o impacto. Usa Corpo.',
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
 * v0.0.2: Defesa é um teste ativo, não um valor fixo.
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
  /**
   * Calcula o pool de dados para um teste de defesa
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
    const dieSize = getSkillDieSize(skill.proficiencyLevel);

    // Calcula bônus de assinatura
    const signatureBonus = isSignature
      ? Math.min(3, Math.ceil(characterLevel / 5))
      : 0;

    // Coleta modificadores de dados (affectsDice: true)
    const diceModifiers = (skill.modifiers || [])
      .filter((m: Modifier) => m.affectsDice)
      .reduce((sum: number, m: Modifier) => sum + m.value, 0);

    // Aplica penalidades de condições ativas
    const conditionPenalty = conditionPenalties
      ? getDicePenaltyForAttribute(conditionPenalties, option.attribute)
      : 0;

    const baseDice =
      attributeValue + signatureBonus + diceModifiers + conditionPenalty;

    // Se 0 ou menos dados, usa regra de penalidade: rola 2d e pega o menor
    if (baseDice <= 0) {
      return {
        diceCount: 2,
        dieSize,
        isPenaltyRoll: true,
        formula: `2${dieSize} (menor)`,
      };
    }

    // Máximo 8 dados por teste
    const finalDice = Math.min(8, baseDice);

    return {
      diceCount: finalDice,
      dieSize,
      isPenaltyRoll: false,
      formula: `${finalDice}${dieSize}`,
    };
  };

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
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ShieldIcon color="primary" />
        <Typography variant="h6" component="h3" color="text.secondary">
          Teste de Defesa
        </Typography>
        <Chip label="∆ Ação Livre" size="small" variant="outlined" />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Defesa é um teste ativo. Cada ✶ obtido anula 1✶ do atacante.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {defenseOptions.map((option) => (
          <Card key={option.skill} variant="outlined">
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
                    PROFICIENCY_LABELS[option.proficiency] ?? option.proficiency
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

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {option.description}
              </Typography>

              {/* Pool display */}
              <Tooltip
                title={`Atributo: ${attributes[option.attribute]} | Dado: ${option.pool.dieSize}`}
                arrow
              >
                <Chip
                  label={option.pool.formula}
                  color={option.pool.isPenaltyRoll ? 'warning' : 'success'}
                  variant="filled"
                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
              </Tooltip>

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
        ))}
      </Box>
    </Box>
  );
});

DefenseTest.displayName = 'DefenseTest';

export default DefenseTest;
