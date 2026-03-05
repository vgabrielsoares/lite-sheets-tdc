/**
 * CompactDefenseTest - Exibição compacta do Teste de Defesa Ativo
 *
 * Versão compacta para uso na aba principal, ao lado de Deslocamento.
 * Mostra as duas opções de defesa (Agilidade e Corpo) com pools baseados
 * no nível do personagem (dado padronizado por nível).
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
import type { DieSize } from '@/types/common';
import { getAttackDefenseDieSize } from '@/constants/combatLevels';
import { SkillRollButton } from '@/components/character/skills/SkillRollButton';
import type { DicePenaltyMap } from '@/utils/conditionEffects';
import { getDicePenaltyForAttribute } from '@/utils/conditionEffects';

export interface CompactDefenseTestProps {
  /** Atributos do personagem */
  attributes: Attributes;
  /** Habilidades do personagem (para compatibilidade) */
  skills: Skills;
  /** Nível do personagem */
  characterLevel: number;
  /** Habilidade de assinatura */
  signatureSkill?: SkillName;
  /** Modificador permanente de dados de defesa */
  permanentDiceModifier?: number;
  /** Penalidades de dados de condições ativas */
  conditionPenalties?: DicePenaltyMap;
  /** Penalidade de defesa das condições ativas (-Xd no teste de defesa) */
  conditionDefensePenalty?: number;
}

interface DefenseOption {
  attribute: keyof Attributes;
  label: string;
  icon: React.ReactNode;
}

const DEFENSE_OPTIONS: DefenseOption[] = [
  {
    attribute: 'agilidade',
    label: 'Agilidade',
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    attribute: 'corpo',
    label: 'Corpo',
    icon: <FitnessCenterIcon fontSize="small" />,
  },
];

interface PoolInfo {
  formula: string;
  dieSize: DieSize;
  isPenalty: boolean;
  totalDice: number;
}

/**
 * Componente compacto de Teste de Defesa para a aba principal.
 *
 * Defesa é um teste padronizado por nível (não usa proficiência de habilidade).
 * Dado = nível do personagem. Quantidade = valor do atributo + modificadores.
 */
export const CompactDefenseTest = React.memo(function CompactDefenseTest({
  attributes,
  skills,
  characterLevel,
  signatureSkill,
  permanentDiceModifier = 0,
  conditionPenalties,
  conditionDefensePenalty = 0,
}: CompactDefenseTestProps) {
  const dieSize = useMemo(
    () => getAttackDefenseDieSize(characterLevel),
    [characterLevel]
  );

  const options = useMemo(() => {
    return DEFENSE_OPTIONS.map((opt) => {
      const attrValue = attributes[opt.attribute];

      // Penalidades de condições para este atributo
      const condPenalty = conditionPenalties
        ? getDicePenaltyForAttribute(conditionPenalties, opt.attribute)
        : 0;

      const totalDice =
        attrValue +
        permanentDiceModifier +
        condPenalty +
        conditionDefensePenalty;

      let formula: string;
      let isPenalty = false;

      if (totalDice <= 0) {
        formula = `2${dieSize} (menor)`;
        isPenalty = true;
      } else {
        const finalDice = Math.min(8, totalDice);
        formula = `${finalDice}${dieSize}`;
      }

      return {
        ...opt,
        pool: {
          formula,
          dieSize,
          isPenalty,
          totalDice,
        } as PoolInfo,
        attrValue,
        diceModifier:
          permanentDiceModifier + condPenalty + conditionDefensePenalty,
      };
    });
  }, [
    attributes,
    characterLevel,
    permanentDiceModifier,
    conditionPenalties,
    conditionDefensePenalty,
    dieSize,
  ]);

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
        Defesa ativa - cada ✶ anula 1✶ do ataque
      </Typography>

      {/* Defense options */}
      <Stack spacing={1}>
        {options.map((opt) => (
          <Box
            key={opt.attribute}
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
                ({opt.attrValue}d)
              </Typography>
              {permanentDiceModifier !== 0 && (
                <Tooltip
                  title={`Modificador permanente: ${permanentDiceModifier > 0 ? '+' : ''}${permanentDiceModifier}d`}
                >
                  <Chip
                    label={`${permanentDiceModifier > 0 ? '+' : ''}${permanentDiceModifier}d`}
                    size="small"
                    color={permanentDiceModifier > 0 ? 'success' : 'warning'}
                    sx={{ minWidth: 24, height: 20, fontSize: '0.65rem' }}
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
                proficiencyLevel="leigo"
                dieSizeOverride={dieSize}
                diceModifier={opt.diceModifier}
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
