'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  Psychology as MindIcon,
  Speed as ReflexIcon,
  FitnessCenter as StrengthIcon,
  Favorite as VigorIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { ProficiencyLevel, Modifier, DieSize } from '@/types/common';
import type { SavingThrowType, CombatPenalties } from '@/types/combat';
import { getSkillDieSize } from '@/constants/skills';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { calculateSkillTotalModifier } from '@/utils/skillCalculations';

export interface SavingThrowsProps {
  /** Atributos do personagem */
  attributes: Attributes;
  /** Habilidades do personagem */
  skills: Skills;
  /** Nível do personagem */
  characterLevel: number;
  /** Habilidade de assinatura do personagem */
  signatureSkill?: SkillName;
  /** Penalidades de combate (opcional, para aplicar -Xd por sucesso) */
  penalties?: CombatPenalties;
}

/**
 * Informações dos testes de resistência
 */
interface SavingThrowInfo {
  type: SavingThrowType;
  skill: SkillName;
  attribute: keyof Attributes;
  label: string;
  /** Nome do uso padrão para resistência */
  resistUse: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

/**
 * Resultado do cálculo de um teste de resistência (pool de dados v0.0.2)
 */
interface SavingThrowCalculation {
  /** Quantidade de dados a rolar */
  diceCount: number;
  /** Tamanho do dado (d6/d8/d10/d12) */
  dieSize: DieSize;
  /** Se deve escolher o menor (rolagem com penalidade extrema) */
  isPenaltyRoll: boolean;
  /** Fórmula legível (ex: "3d8", "2d6 (menor)") */
  formula: string;
}

/**
 * Configuração dos 4 testes de resistência
 */
const SAVING_THROWS: SavingThrowInfo[] = [
  {
    type: 'determinacao',
    skill: 'determinacao',
    attribute: 'mente',
    resistUse: 'Resistir Mentalmente',
    label: 'Determinação',
    icon: <MindIcon />,
    color: '#9C27B0', // roxo
    description:
      'A Determinação é testada contra efeitos que afetam a mente do personagem, usando a força de vontade e resiliência mental para isso.',
  },
  {
    type: 'reflexo',
    skill: 'reflexo',
    attribute: 'agilidade',
    resistUse: 'Resistir',
    label: 'Reflexo',
    icon: <ReflexIcon />,
    color: '#4CAF50', // verde
    description:
      'O Reflexo é testado contra efeitos que requerem velocidade, equilíbrio ágil e rápido tempo de reação.',
  },
  {
    type: 'sintonia',
    skill: 'sintonia',
    attribute: 'essencia',
    resistUse: 'Resistir',
    label: 'Sintonia',
    icon: <AutoFixHighIcon />,
    color: '#2196F3', // azul
    description:
      'A Sintonia é testada contra efeitos que interferem na energia do personagem, evitando corrupções e distorções da alma.',
  },
  {
    type: 'tenacidade',
    skill: 'tenacidade',
    attribute: 'corpo',
    resistUse: 'Resistir',
    label: 'Tenacidade',
    icon: <StrengthIcon />,
    color: '#afac00ff', // amarelo
    description:
      'A Tenacidade é testada contra efeitos que requerem força do corpo, de equilíbrio e de resistência.',
  },
  {
    type: 'vigor',
    skill: 'vigor',
    attribute: 'corpo',
    resistUse: 'Resistir',
    label: 'Vigor',
    icon: <VigorIcon />,
    color: '#F44336', // vermelho
    description:
      'O Vigor é testado contra efeitos que afetam a saúde e integridade física do personagem, utilizando o bom estado de seu corpo para isso.',
  },
];

/**
 * Labels amigáveis para níveis de proficiência
 */
const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  leigo: 'Leigo',
  adepto: 'Adepto',
  versado: 'Versado',
  mestre: 'Mestre',
};

/**
 * Componente que exibe os 5 testes de resistência do personagem
 *
 * Os testes de resistência são:
 * - Determinação (Mente) - Resistência mental, força de vontade
 * - Reflexo (Agilidade) - Velocidade, equilíbrio ágil, reação
 * - Sintonia (Essência) - Interferência energética, corrupção
 * - Tenacidade (Corpo) - Força muscular, equilíbrio, resistência
 * - Vigor (Corpo) - Saúde, integridade física
 *
 * Cada teste usa o sistema de pool de dados v0.0.2.
 *
 * @example
 * ```tsx
 * <SavingThrows
 *   attributes={character.attributes}
 *   skills={character.skills}
 *   characterLevel={character.level}
 *   signatureSkill={character.signatureSkill}
 * />
 * ```
 */
export function SavingThrows({
  attributes,
  skills,
  characterLevel,
  signatureSkill,
  penalties,
}: SavingThrowsProps) {
  /**
   * Calcula o modificador total de um teste de resistência usando o uso específico
   * (ex: "Resistir" ou "Resistir Mentalmente")
   *
   * Separamos modificadores de dados (affectsDice: true) dos modificadores numéricos
   * e aplicamos penalidades de combate se existirem
   */
  const calculateSavingThrow = (
    info: SavingThrowInfo
  ): SavingThrowCalculation => {
    const skill = skills[info.skill];
    if (!skill) {
      const dieSize = 'd6' as DieSize;
      return {
        diceCount: 2,
        dieSize,
        isPenaltyRoll: true,
        formula: `2${dieSize} (menor)`,
      };
    }

    const attributeValue = attributes[info.attribute];
    const isSignature = signatureSkill === info.skill;

    // Obtém modificadores específicos do uso "Resistir" ou "Resistir Mentalmente"
    const useModifiers =
      skill.defaultUseModifierOverrides?.[info.resistUse] || [];

    // Combina modificadores base da habilidade com os do uso
    const allModifiers: Modifier[] = [
      ...(skill.modifiers || []),
      ...useModifiers,
    ];

    // Calcula a pool de dados usando o sistema v0.0.2
    const calculation = calculateSkillTotalModifier(
      info.skill,
      info.attribute,
      attributeValue,
      skill.proficiencyLevel,
      isSignature,
      characterLevel,
      allModifiers
    );

    // Aplica penalidade de combate se existir (-Xd por sucesso do oponente)
    const combatPenalty = penalties?.savingThrowPenalties[info.type] ?? 0;
    const effectiveTotalDice = calculation.totalDice + combatPenalty;

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

  /**
   * Obtém a descrição da rolagem (pool de dados v0.0.2)
   */
  const getRollDescription = (calc: SavingThrowCalculation): string => {
    return calc.formula;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          color="text.secondary"
        >
          Testes de Resistência
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {SAVING_THROWS.map((info) => {
            const skill = skills[info.skill];
            const calc = calculateSavingThrow(info);
            const proficiency = skill?.proficiencyLevel || 'leigo';
            const attributeValue = attributes[info.attribute];
            const isSignature = signatureSkill === info.skill;

            return (
              <Tooltip
                key={info.type}
                title={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {info.label}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {info.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Atributo: {ATTRIBUTE_LABELS[info.attribute]} (
                      {attributeValue})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Proficiência: {PROFICIENCY_LABELS[proficiency]} (
                      {getSkillDieSize(proficiency)})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Uso: {info.resistUse}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Rolagem: {getRollDescription(calc)}
                    </Typography>
                    {isSignature && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="warning.main"
                      >
                        ⭐ Habilidade de Assinatura
                      </Typography>
                    )}
                  </Box>
                }
                arrow
                placement="top"
              >
                <Card
                  variant="outlined"
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    cursor: 'help',
                    borderColor: info.color,
                    borderWidth: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${info.color}40`,
                    },
                  }}
                >
                  {/* Ícone */}
                  <Box
                    sx={{
                      color: info.color,
                      mb: 0.5,
                      '& svg': { fontSize: '1.5rem' },
                    }}
                  >
                    {info.icon}
                  </Box>

                  {/* Nome */}
                  <Typography
                    variant="caption"
                    component="div"
                    fontWeight="medium"
                    sx={{ mb: 0.5 }}
                  >
                    {info.label}
                  </Typography>

                  {/* Fórmula da pool de dados */}
                  <Typography
                    variant="h5"
                    component="div"
                    fontWeight="bold"
                    sx={{ color: info.color }}
                  >
                    {calc.diceCount}
                    {calc.dieSize}
                  </Typography>

                  {/* Indicador de penalidade */}
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      color: calc.isPenaltyRoll
                        ? 'error.main'
                        : 'text.secondary',
                      fontWeight: calc.isPenaltyRoll ? 'bold' : 'normal',
                    }}
                  >
                    {calc.isPenaltyRoll ? '(menor)' : getRollDescription(calc)}
                  </Typography>

                  {/* Badges */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    sx={{ mt: 0.5 }}
                  >
                    {/* Proficiência */}
                    <Chip
                      label={PROFICIENCY_LABELS[proficiency][0]}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor:
                          proficiency === 'leigo'
                            ? 'action.disabledBackground'
                            : 'primary.main',
                        color:
                          proficiency === 'leigo'
                            ? 'text.disabled'
                            : 'primary.contrastText',
                      }}
                    />
                    {/* Assinatura */}
                    {isSignature && (
                      <Chip
                        label="⭐"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          bgcolor: 'warning.main',
                          color: 'warning.contrastText',
                        }}
                      />
                    )}
                  </Stack>
                </Card>
              </Tooltip>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
