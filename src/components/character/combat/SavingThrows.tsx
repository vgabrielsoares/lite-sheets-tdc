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
} from '@mui/icons-material';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { ProficiencyLevel, Modifier } from '@/types/common';
import type { SavingThrowType } from '@/types/combat';
import { SKILL_PROFICIENCY_LEVELS } from '@/constants/skills';
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
 * Resultado do cálculo de um teste de resistência
 */
interface SavingThrowCalculation {
  /** Modificador numérico total */
  modifier: number;
  /** Quantidade de dados a rolar */
  diceCount: number;
  /** Se deve escolher o menor (rolagem com penalidade de dados) */
  takeLowest: boolean;
}

/**
 * Configuração dos 4 testes de resistência
 */
const SAVING_THROWS: SavingThrowInfo[] = [
  {
    type: 'determinacao',
    skill: 'determinacao',
    attribute: 'presenca',
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
    type: 'tenacidade',
    skill: 'tenacidade',
    attribute: 'forca',
    resistUse: 'Resistir',
    label: 'Tenacidade',
    icon: <StrengthIcon />,
    color: '#afac00ff', // amarelo
    description:
      'A Tenacidade é testada contra efeitos que requerem força muscular, de equilíbrio e de resistência.',
  },
  {
    type: 'vigor',
    skill: 'vigor',
    attribute: 'constituicao',
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
 * Componente que exibe os 4 testes de resistência do personagem
 *
 * Os testes de resistência são:
 * - Determinação (Presença) - Resistência mental
 * - Reflexo (Agilidade) - Reação a perigos
 * - Tenacidade (Força) - Resistência física
 * - Vigor (Constituição) - Resistência a doenças/venenos
 *
 * Cada teste usa o sistema de habilidades existente para calcular o modificador.
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
}: SavingThrowsProps) {
  /**
   * Calcula o modificador total de um teste de resistência usando o uso específico
   * (ex: "Resistir" ou "Resistir Mentalmente")
   *
   * Separamos modificadores de dados (affectsDice: true) dos modificadores numéricos
   */
  const calculateSavingThrow = (
    info: SavingThrowInfo
  ): SavingThrowCalculation => {
    const skill = skills[info.skill];
    if (!skill) {
      return { modifier: 0, diceCount: 1, takeLowest: false };
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

    // Separa modificadores de dados dos numéricos
    const valueModifiers = allModifiers.filter((mod) => !mod.affectsDice);
    const diceModifiers = allModifiers.filter(
      (mod) => mod.affectsDice === true
    );

    // Calcula modificador numérico usando apenas valueModifiers
    const calculation = calculateSkillTotalModifier(
      info.skill,
      info.attribute,
      attributeValue,
      skill.proficiencyLevel,
      isSignature,
      characterLevel,
      valueModifiers
    );

    // Calcula quantidade de dados: atributo + modificadores de dados
    const diceModifiersTotal = diceModifiers.reduce(
      (sum, mod) => sum + (mod.value || 0),
      0
    );
    const effectiveDiceCount = attributeValue + diceModifiersTotal;

    // Se effectiveDiceCount <= 0, rola 2 - effectiveDiceCount dados e pega o menor
    let diceCount: number;
    let takeLowest: boolean;

    if (effectiveDiceCount <= 0) {
      diceCount = 2 - effectiveDiceCount; // 0 -> 2d20, -1 -> 3d20, etc
      takeLowest = true;
    } else {
      diceCount = effectiveDiceCount;
      takeLowest = false;
    }

    return {
      modifier: calculation.totalModifier,
      diceCount,
      takeLowest,
    };
  };

  /**
   * Formata o modificador com sinal
   */
  const formatModifier = (value: number): string => {
    if (value >= 0) return `+${value}`;
    return `${value}`;
  };

  /**
   * Obtém a descrição da rolagem
   */
  const getRollDescription = (calc: SavingThrowCalculation): string => {
    const modifierStr = formatModifier(calc.modifier);
    const suffix = calc.takeLowest ? ' (menor)' : '';
    return `${calc.diceCount}d20${modifierStr}${suffix}`;
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
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
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
                      Proficiência: {PROFICIENCY_LABELS[proficiency]} (×
                      {SKILL_PROFICIENCY_LEVELS[proficiency]})
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

                  {/* Modificador */}
                  <Typography
                    variant="h5"
                    component="div"
                    fontWeight="bold"
                    sx={{ color: info.color }}
                  >
                    {formatModifier(calc.modifier)}
                  </Typography>

                  {/* Dados - vermelho se takeLowest */}
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      color: calc.takeLowest ? 'error.main' : 'text.secondary',
                      fontWeight: calc.takeLowest ? 'bold' : 'normal',
                    }}
                  >
                    {calc.diceCount}d20{calc.takeLowest ? ' (menor)' : ''}
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
