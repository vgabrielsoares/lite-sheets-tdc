'use client';

/**
 * ProficiencySelector - Interface para selecionar proficiências de habilidades
 *
 * Funcionalidades:
 * - Permite selecionar até (3 + Mente) habilidades como proficientes
 * - Indica visualmente quantas proficiências restam
 * - Aplica automaticamente grau "Adepto" às selecionadas
 * - Valida que não excede o limite permitido
 * - Atualiza retroativamente ao mudar Mente
 * - Permite "promover" proficiências existentes (Adepto → Versado → Mestre)
 *
 * Regras:
 * - Personagens começam com 3 + Mente proficiências disponíveis
 * - Ganhar proficiência = passar de Leigo para Adepto
 * - Aumentar Mente aumenta proficiências disponíveis (retroativo)
 * - Diminuir Mente não remove proficiências já adquiridas (mas impede novas)
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Chip,
  Stack,
  Tooltip,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import type { SkillName, Skills, ProficiencyLevel } from '@/types';
import { SKILL_LABELS, SKILL_LIST } from '@/constants';
import { getProficiencyInfo } from '@/utils/proficiencyCalculations';

export interface ProficiencySelectorProps {
  /** Todas as habilidades do personagem */
  skills: Skills;
  /** Valor do atributo Mente */
  menteValue: number;
  /** Callback quando proficiência é alterada */
  onProficiencyChange: (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => void;
  /** Modo compacto (sem labels extensos) */
  compact?: boolean;
}

/**
 * Componente ProficiencySelector
 *
 * Permite gerenciar quais habilidades têm proficiência (Adepto+)
 */
export const ProficiencySelector: React.FC<ProficiencySelectorProps> = ({
  skills,
  menteValue,
  onProficiencyChange,
  compact = false,
}) => {
  const theme = useTheme();

  // Calcular informações de proficiência
  const proficiencyInfo = useMemo(() => {
    return getProficiencyInfo(skills, menteValue);
  }, [skills, menteValue]);

  const { max, acquired, remaining, canAdd, isValid } = proficiencyInfo;

  // Handler para toggle de proficiência
  const handleToggleProficiency = (skillName: SkillName) => {
    const skill = skills[skillName];
    const isCurrentlyProficient = skill.proficiencyLevel !== 'leigo';

    if (isCurrentlyProficient) {
      // Remove proficiência (volta para Leigo)
      onProficiencyChange(skillName, 'leigo');
    } else {
      // Adiciona proficiência (passa para Adepto)
      if (canAdd || !isValid) {
        // Permite adicionar se há espaço OU se já está acima do limite
        // (no segundo caso, estamos apenas reorganizando)
        onProficiencyChange(skillName, 'adepto');
      }
    }
  };

  // Agrupar habilidades por status de proficiência
  const { proficientSkills, nonProficientSkills } = useMemo(() => {
    const proficient: SkillName[] = [];
    const nonProficient: SkillName[] = [];

    SKILL_LIST.forEach((skillName) => {
      const skill = skills[skillName];
      if (skill.proficiencyLevel !== 'leigo') {
        proficient.push(skillName);
      } else {
        nonProficient.push(skillName);
      }
    });

    return {
      proficientSkills: proficient,
      nonProficientSkills: nonProficient,
    };
  }, [skills]);

  return (
    <Box>
      {/* Indicador de Proficiências */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: isValid
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.error.main, 0.1),
          borderLeft: 4,
          borderColor: isValid ? 'success.main' : 'error.main',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {isValid ? (
            <CheckIcon color="success" />
          ) : (
            <WarningIcon color="error" />
          )}
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Proficiências de Habilidades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {acquired} de {max} proficiências usadas
              {remaining > 0 && ` • ${remaining} restantes`}
            </Typography>
          </Box>
          <Chip
            label={`${acquired}/${max}`}
            color={isValid ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.875rem' }}
          />
        </Stack>

        {!isValid && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Você excedeu o limite de proficiências! Remova {acquired - max}{' '}
            proficiência
            {acquired - max > 1 ? 's' : ''} para continuar.
          </Alert>
        )}

        {isValid && remaining === 0 && (
          <Alert severity="info" sx={{ mt: 2 }} icon={<InfoIcon />}>
            Todas as proficiências foram usadas. Aumente Mente para ter mais.
          </Alert>
        )}

        {isValid && remaining > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Você ainda pode escolher {remaining} habilidade
            {remaining > 1 ? 's' : ''} como proficiente
            {remaining > 1 ? 's' : ''}.
          </Alert>
        )}
      </Paper>

      {/* Lista de Habilidades Proficientes */}
      {proficientSkills.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Habilidades Proficientes ({proficientSkills.length})
          </Typography>
          <Stack spacing={0.5}>
            {proficientSkills.map((skillName) => {
              const skill = skills[skillName];
              return (
                <FormControlLabel
                  key={skillName}
                  control={
                    <Checkbox
                      checked={true}
                      onChange={() => handleToggleProficiency(skillName)}
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{SKILL_LABELS[skillName]}</Typography>
                      <Chip
                        label={
                          skill.proficiencyLevel === 'adepto'
                            ? 'Adepto'
                            : skill.proficiencyLevel === 'versado'
                              ? 'Versado'
                              : 'Mestre'
                        }
                        size="small"
                        color={
                          skill.proficiencyLevel === 'mestre'
                            ? 'warning'
                            : skill.proficiencyLevel === 'versado'
                              ? 'info'
                              : 'default'
                        }
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Stack>
                  }
                  sx={{
                    m: 0,
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Lista de Habilidades Não-Proficientes */}
      {nonProficientSkills.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Habilidades Não-Proficientes ({nonProficientSkills.length})
          </Typography>
          <Stack spacing={0.5}>
            {nonProficientSkills.map((skillName) => {
              const disabled = !canAdd && isValid; // Desabilita se não pode adicionar mais E está válido
              return (
                <Tooltip
                  key={skillName}
                  title={
                    disabled
                      ? 'Limite de proficiências atingido. Aumente Mente para ter mais.'
                      : 'Marcar como proficiente (Adepto)'
                  }
                  arrow
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={false}
                        onChange={() => handleToggleProficiency(skillName)}
                        disabled={disabled}
                        color="primary"
                      />
                    }
                    label={SKILL_LABELS[skillName]}
                    disabled={disabled}
                    sx={{
                      m: 0,
                      p: 1,
                      borderRadius: 1,
                      opacity: disabled ? 0.5 : 1,
                      '&:hover': {
                        bgcolor: disabled
                          ? 'transparent'
                          : alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Nota Informativa */}
      {!compact && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Como funcionam as proficiências:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>
              Você pode ter <strong>{max} habilidades proficientes</strong> (3 +
              Mente)
            </li>
            <li>
              Proficiência básica = <strong>Adepto</strong> (modificador x1)
            </li>
            <li>
              Você pode promover proficiências para Versado (x2) ou Mestre (x3)
              através da lista principal de habilidades
            </li>
            <li>
              Aumentar Mente aumenta proficiências disponíveis (
              <strong>retroativo</strong>)
            </li>
          </Typography>
        </Alert>
      )}
    </Box>
  );
};
