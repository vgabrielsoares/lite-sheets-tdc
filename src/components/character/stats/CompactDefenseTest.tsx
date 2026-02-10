/**
 * CompactDefenseTest - Exibição compacta do Teste de Defesa Ativo
 *
 * Versão compacta para uso na aba principal, ao lado de Deslocamento.
 * Mostra as duas opções de defesa (Reflexo e Vigor) com suas pools de dados.
 *
 * Para a versão completa, ver DefenseTest na pasta combat/.
 */
'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack, Chip, Tooltip } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { DieSize, Modifier } from '@/types/common';
import { getSkillDieSize } from '@/constants/skills';
import { SkillRollButton } from '@/components/character/skills/SkillRollButton';

export interface CompactDefenseTestProps {
  /** Atributos do personagem */
  attributes: Attributes;
  /** Habilidades do personagem */
  skills: Skills;
  /** Nível do personagem */
  characterLevel: number;
  /** Habilidade de assinatura */
  signatureSkill?: SkillName;
}

interface DefenseOption {
  skill: SkillName;
  attribute: keyof Attributes;
  label: string;
  icon: React.ReactNode;
}

const DEFENSE_OPTIONS: DefenseOption[] = [
  {
    skill: 'reflexo',
    attribute: 'agilidade',
    label: 'Reflexo',
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    skill: 'vigor',
    attribute: 'corpo',
    label: 'Vigor',
    icon: <FitnessCenterIcon fontSize="small" />,
  },
];

interface PoolInfo {
  formula: string;
  dieSize: DieSize;
  isPenalty: boolean;
  proficiency: string;
}

const PROFICIENCY_LABELS: Record<string, string> = {
  leigo: 'Leigo',
  adepto: 'Adepto',
  versado: 'Versado',
  mestre: 'Mestre',
};

/**
 * Componente compacto de Teste de Defesa para a aba principal.
 */
export const CompactDefenseTest = React.memo(function CompactDefenseTest({
  attributes,
  skills,
  characterLevel,
  signatureSkill,
}: CompactDefenseTestProps) {
  const options = useMemo(() => {
    return DEFENSE_OPTIONS.map((opt) => {
      const skill = skills[opt.skill];
      const attrValue = attributes[opt.attribute];
      const profLevel = skill?.proficiencyLevel ?? 'leigo';
      const dieSize = getSkillDieSize(profLevel);

      const isSignature = signatureSkill === opt.skill;
      const signatureBonus = isSignature
        ? Math.min(3, Math.ceil(characterLevel / 5))
        : 0;

      const diceMods = (skill?.modifiers || [])
        .filter((m: Modifier) => m.affectsDice)
        .reduce((sum: number, m: Modifier) => sum + m.value, 0);

      const baseDice = attrValue + signatureBonus + diceMods;

      let formula: string;
      let isPenalty = false;

      if (baseDice <= 0) {
        formula = `2${dieSize} (menor)`;
        isPenalty = true;
      } else {
        const finalDice = Math.min(8, baseDice);
        formula = `${finalDice}${dieSize}`;
      }

      return {
        ...opt,
        pool: {
          formula,
          dieSize,
          isPenalty,
          proficiency: PROFICIENCY_LABELS[profLevel] ?? profLevel,
        } as PoolInfo,
        isSignature,
        attrValue,
        profLevel,
        totalDiceMod: signatureBonus + diceMods,
      };
    });
  }, [attributes, skills, characterLevel, signatureSkill]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        cursor: 'default',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <ShieldIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600}>
          Teste de Defesa
        </Typography>
        <Chip
          label="∆ Ação Livre"
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.65rem', height: 20 }}
        />
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 1.5 }}
      >
        Defesa ativa — cada ✶ anula 1✶ do ataque
      </Typography>

      {/* Defense options */}
      <Stack spacing={1}>
        {options.map((opt) => (
          <Box
            key={opt.skill}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                {opt.icon}
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {opt.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({opt.pool.proficiency})
              </Typography>
              {opt.isSignature && (
                <Tooltip title="Habilidade de Assinatura">
                  <Chip
                    label="✦"
                    size="small"
                    color="primary"
                    sx={{ minWidth: 24, height: 20, fontSize: '0.7rem' }}
                  />
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                label={opt.pool.formula}
                size="small"
                color={opt.pool.isPenalty ? 'warning' : 'success'}
                variant="filled"
                sx={{ fontWeight: 700, minWidth: 60 }}
              />
              <SkillRollButton
                skillLabel={`Defesa: ${opt.label}`}
                attributeValue={opt.attrValue}
                proficiencyLevel={opt.profLevel}
                diceModifier={opt.totalDiceMod}
                size="small"
                tooltipText={`Rolar teste de defesa (${opt.label})`}
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
});

CompactDefenseTest.displayName = 'CompactDefenseTest';
