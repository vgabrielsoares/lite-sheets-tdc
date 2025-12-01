/**
 * SignatureAbility Component
 *
 * Permite ao jogador selecionar UMA habilidade como Habilidade de Assinatura.
 * A habilidade de assinatura recebe bônus especial baseado no nível do personagem:
 * - Habilidades não-combate: +Nível
 * - Habilidades de combate: +Nível÷3 (mínimo 1, arredondar para baixo)
 *
 * Regras do Sistema:
 * - Apenas uma habilidade pode ser assinatura
 * - Bônus aplicado automaticamente nos cálculos
 * - Identificação visual clara na lista de habilidades
 */

import React from 'react';
import {
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Star as StarIcon,
  Info as InfoIcon,
  SportsMartialArts as SwordsIcon,
} from '@mui/icons-material';
import { SkillName, Skills } from '@/types';
import { SKILL_LABELS, SKILL_METADATA, COMBAT_SKILLS } from '@/constants';
import { calculateSignatureAbilityBonus } from '@/utils';

interface SignatureAbilityProps {
  /** Habilidades do personagem */
  skills: Skills;
  /** Nível atual do personagem */
  characterLevel: number;
  /** Callback quando a habilidade de assinatura é alterada */
  onSignatureChange: (skillName: SkillName | null) => void;
  /** Modo compacto (opcional) */
  compact?: boolean;
}

/**
 * Componente de seleção de Habilidade de Assinatura
 */
export function SignatureAbility({
  skills,
  characterLevel,
  onSignatureChange,
  compact = false,
}: SignatureAbilityProps) {
  // Encontra a habilidade de assinatura atual
  const currentSignature = Object.entries(skills).find(
    ([, skill]) => skill.isSignature
  )?.[0] as SkillName | undefined;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onSignatureChange(value === '' ? null : (value as SkillName));
  };

  // Calcula o bônus atual
  const currentBonus = currentSignature
    ? calculateSignatureAbilityBonus(
        characterLevel,
        COMBAT_SKILLS.includes(currentSignature)
      )
    : 0;

  const isCombatSkill = currentSignature
    ? COMBAT_SKILLS.includes(currentSignature)
    : false;

  return (
    <Paper
      elevation={2}
      sx={{
        p: compact ? 2 : 3,
        borderLeft: 4,
        borderColor: 'warning.main',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <StarIcon color="warning" />
        <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight="bold">
          Habilidade de Assinatura
        </Typography>
        <Tooltip title="Uma habilidade escolhida que recebe bônus especial igual ao nível do personagem (ou nível÷3 para habilidades de combate)">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>

      {/* Informação sobre bônus */}
      {currentSignature && (
        <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{SKILL_LABELS[currentSignature]}</strong> recebe{' '}
            <strong>+{currentBonus}</strong> de bônus
            {isCombatSkill && (
              <>
                {' '}
                (habilidade de combate: {characterLevel}÷3 = {currentBonus})
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Seletor */}
      <FormControl fullWidth>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Escolha uma habilidade para receber bônus especial:
        </Typography>
        <Select
          value={currentSignature || ''}
          onChange={handleChange}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography color="text.secondary">
                  Selecione uma habilidade...
                </Typography>
              );
            }
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon fontSize="small" color="warning" />
                <Typography>{SKILL_LABELS[selected as SkillName]}</Typography>
                {COMBAT_SKILLS.includes(selected as SkillName) && (
                  <Chip
                    icon={<SwordsIcon />}
                    label="Combate"
                    size="small"
                    color="error"
                    sx={{ height: 20 }}
                  />
                )}
              </Box>
            );
          }}
        >
          <MenuItem value="">
            <em>Nenhuma selecionada</em>
          </MenuItem>
          {Object.keys(skills).map((skillName) => {
            const skill = skillName as SkillName;
            const isCombat = COMBAT_SKILLS.includes(skill);
            const bonus = calculateSignatureAbilityBonus(
              characterLevel,
              isCombat
            );

            return (
              <MenuItem key={skill} value={skill}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{SKILL_LABELS[skill]}</Typography>
                    {isCombat && (
                      <Chip
                        icon={<SwordsIcon />}
                        label="Combate"
                        size="small"
                        color="error"
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                  <Chip
                    label={`+${bonus}`}
                    size="small"
                    color="warning"
                    sx={{ height: 20 }}
                  />
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* Explicação */}
      {!compact && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2" paragraph>
              <strong>Bônus de Habilidade de Assinatura:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>Habilidades não-combate:</strong> Bônus = Nível do
                personagem
              </li>
              <li>
                <strong>Habilidades de combate</strong>{' '}
                <Chip
                  icon={<SwordsIcon />}
                  label="Combate"
                  size="small"
                  color="error"
                  sx={{ height: 16, ml: 0.5 }}
                />
                : Bônus = Nível ÷ 3 (mínimo 1, arredondar para baixo)
              </li>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Habilidades de Combate:</strong>{' '}
              {COMBAT_SKILLS.map((skill) => SKILL_LABELS[skill]).join(', ')}
            </Typography>
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
