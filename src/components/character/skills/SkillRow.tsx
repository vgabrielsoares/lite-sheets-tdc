'use client';

/**
 * SkillRow - Componente para exibir uma linha de habilidade
 *
 * Exibe informações de uma habilidade com opções de edição:
 * - Nome da habilidade (label amigável)
 * - Atributo-chave padrão (referência, não editável)
 * - Atributo-chave atual (editável via select)
 * - Grau de proficiência (editável via select)
 * - Modificador total (calculado automaticamente)
 * - Fórmula de rolagem (Xd20+Y)
 *
 * Funcionalidades:
 * - Clique na linha abre sidebar com detalhes e usos da habilidade
 * - Indicadores visuais para habilidades especiais (Assinatura, Combate, Carga)
 * - Destaque quando atributo-chave foi customizado
 * - Acessível por teclado (Tab, Enter, ESC)
 */

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  FormControl,
  SelectChangeEvent,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Star as StarIcon,
  FitnessCenter as CombatIcon,
  ShoppingCart as LoadIcon,
  Build as InstrumentIcon,
  Lock as ProficiencyIcon,
  SwapHoriz as CustomIcon,
} from '@mui/icons-material';

import type {
  SkillName,
  ProficiencyLevel,
  AttributeName,
  Attributes,
  Skill,
  Modifier,
} from '@/types';
import {
  SKILL_LABELS,
  SKILL_METADATA,
  SKILL_PROFICIENCY_LABELS,
  ATTRIBUTE_LABELS,
} from '@/constants';
import { calculateSkillRoll } from '@/utils';

export interface SkillRowProps {
  /** Dados da habilidade */
  skill: Skill;
  /** Atributos do personagem (para cálculos) */
  attributes: Attributes;
  /** Nível do personagem (para bônus de assinatura) */
  characterLevel: number;
  /** Se personagem está sobrecarregado */
  isOverloaded: boolean;
  /** Callback quando atributo-chave é alterado */
  onKeyAttributeChange: (
    skillName: SkillName,
    newAttribute: AttributeName
  ) => void;
  /** Callback quando proficiência é alterada */
  onProficiencyChange: (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => void;
  /** Callback quando linha é clicada (abre sidebar) */
  onClick: (skillName: SkillName) => void;
}

/**
 * Componente SkillRow - Exibe uma linha de habilidade com cálculos e edição
 */
export const SkillRow: React.FC<SkillRowProps> = ({
  skill,
  attributes,
  characterLevel,
  isOverloaded,
  onKeyAttributeChange,
  onProficiencyChange,
  onClick,
}) => {
  const theme = useTheme();
  const metadata = SKILL_METADATA[skill.name];

  // Calcular modificador e rolagem
  const { calculation, rollFormula } = calculateSkillRoll(
    skill.name,
    skill.keyAttribute,
    attributes,
    skill.proficiencyLevel,
    skill.isSignature,
    characterLevel,
    skill.modifiers,
    isOverloaded
  );

  // Verificar se atributo foi customizado
  const isCustomAttribute = skill.keyAttribute !== metadata.keyAttribute;

  // Handlers
  const handleKeyAttributeChange = (
    event: SelectChangeEvent<AttributeName>
  ) => {
    event.stopPropagation(); // evitar trigger do onClick da linha
    onKeyAttributeChange(skill.name, event.target.value as AttributeName);
  };

  const handleProficiencyChange = (
    event: SelectChangeEvent<ProficiencyLevel>
  ) => {
    event.stopPropagation();
    onProficiencyChange(skill.name, event.target.value as ProficiencyLevel);
  };

  const handleRowClick = () => {
    onClick(skill.name);
  };

  // Indicadores visuais
  const indicators = [];
  if (skill.isSignature) {
    indicators.push(
      <Tooltip key="signature" title="Habilidade de Assinatura">
        <StarIcon fontSize="small" color="warning" />
      </Tooltip>
    );
  }
  if (metadata.isCombatSkill) {
    indicators.push(
      <Tooltip key="combat" title="Habilidade de Combate">
        <CombatIcon fontSize="small" color="error" />
      </Tooltip>
    );
  }
  if (metadata.hasCargaPenalty) {
    indicators.push(
      <Tooltip key="load" title="Sofre penalidade quando Sobrecarregado">
        <LoadIcon
          fontSize="small"
          color={isOverloaded ? 'warning' : 'disabled'}
        />
      </Tooltip>
    );
  }
  if (metadata.requiresInstrument) {
    indicators.push(
      <Tooltip key="instrument" title="Requer instrumento">
        <InstrumentIcon fontSize="small" color="action" />
      </Tooltip>
    );
  }
  if (metadata.requiresProficiency) {
    indicators.push(
      <Tooltip key="proficiency" title="Requer proficiência para uso efetivo">
        <ProficiencyIcon fontSize="small" color="action" />
      </Tooltip>
    );
  }
  if (isCustomAttribute) {
    indicators.push(
      <Tooltip key="custom" title="Atributo-chave customizado">
        <CustomIcon fontSize="small" color="primary" />
      </Tooltip>
    );
  }

  return (
    <Box
      onClick={handleRowClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr auto',
          sm: '2fr 1fr 1fr 1fr auto auto',
        },
        gap: { xs: 1, sm: 2 },
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          transform: 'translateX(4px)',
        },
        // Destaque se é Habilidade de Assinatura
        ...(skill.isSignature && {
          backgroundColor: alpha(theme.palette.warning.main, 0.05),
          borderColor: theme.palette.warning.main,
        }),
      }}
    >
      {/* Nome da habilidade + Indicadores */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body1" fontWeight={skill.isSignature ? 600 : 400}>
          {SKILL_LABELS[skill.name]}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>{indicators}</Box>
      </Box>

      {/* Atributo-chave padrão (referência) - Desktop only */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textDecoration: isCustomAttribute ? 'line-through' : 'none' }}
        >
          {metadata.keyAttribute === 'especial'
            ? 'Especial'
            : ATTRIBUTE_LABELS[metadata.keyAttribute]}
        </Typography>
      </Box>

      {/* Atributo-chave atual (editável) */}
      <FormControl
        size="small"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        sx={{ minWidth: { xs: 100, sm: 120 } }}
      >
        <Select
          value={skill.keyAttribute}
          onChange={handleKeyAttributeChange}
          aria-label={`Atributo-chave para ${SKILL_LABELS[skill.name]}`}
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
            },
            ...(isCustomAttribute && {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }),
          }}
        >
          <MenuItem value="agilidade">Agilidade</MenuItem>
          <MenuItem value="constituicao">Constituição</MenuItem>
          <MenuItem value="forca">Força</MenuItem>
          <MenuItem value="influencia">Influência</MenuItem>
          <MenuItem value="mente">Mente</MenuItem>
          <MenuItem value="presenca">Presença</MenuItem>
        </Select>
      </FormControl>

      {/* Grau de proficiência (editável) */}
      <FormControl
        size="small"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        sx={{ minWidth: { xs: 100, sm: 120 } }}
      >
        <Select
          value={skill.proficiencyLevel}
          onChange={handleProficiencyChange}
          aria-label={`Proficiência em ${SKILL_LABELS[skill.name]}`}
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
            },
          }}
        >
          <MenuItem value="leigo">Leigo</MenuItem>
          <MenuItem value="adepto">Adepto</MenuItem>
          <MenuItem value="versado">Versado</MenuItem>
          <MenuItem value="mestre">Mestre</MenuItem>
        </Select>
      </FormControl>

      {/* Modificador total */}
      <Box
        sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}
      >
        <Chip
          label={
            calculation.totalModifier >= 0
              ? `+${calculation.totalModifier}`
              : calculation.totalModifier
          }
          size="small"
          color={calculation.totalModifier >= 0 ? 'success' : 'error'}
          variant="outlined"
        />
      </Box>

      {/* Fórmula de rolagem */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
        <Typography variant="body2" fontFamily="monospace" color="primary">
          {rollFormula.formula}
        </Typography>
      </Box>

      {/* Mobile: Modificador + Rolagem */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Chip
          label={
            calculation.totalModifier >= 0
              ? `+${calculation.totalModifier}`
              : calculation.totalModifier
          }
          size="small"
          color={calculation.totalModifier >= 0 ? 'success' : 'error'}
          variant="outlined"
        />
        <Typography variant="body2" fontFamily="monospace" color="primary">
          {rollFormula.formula}
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillRow;
