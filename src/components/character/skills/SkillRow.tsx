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
  SportsMartialArts as CombatIcon,
  Backpack as LoadIcon,
  Construction as InstrumentIcon,
  MenuBook as ProficiencyIcon,
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
  ATTRIBUTE_ABBREVIATIONS,
} from '@/constants';
import { calculateSkillRoll } from '@/utils';
import {
  InlineModifiers,
  extractDiceModifier,
  extractNumericModifier,
  buildModifiersArray,
} from './ModifierManager';

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
  /** Callback quando modificadores são alterados */
  onModifiersChange?: (skillName: SkillName, modifiers: Modifier[]) => void;
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
  onModifiersChange,
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

  const handleModifiersChange = (
    diceModifier: number,
    numericModifier: number
  ) => {
    if (onModifiersChange) {
      const newModifiers = buildModifiersArray(diceModifier, numericModifier);
      onModifiersChange(skill.name, newModifiers);
    }
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
          sm: '1.8fr 100px 100px 160px 1.2fr',
        },
        gap: { xs: 1, sm: 1.2 },
        alignItems: 'center',
        p: 1.5,
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip
          title={
            isCustomAttribute
              ? `${SKILL_LABELS[skill.name]} - Atributo padrão: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]} (customizado para ${ATTRIBUTE_LABELS[skill.keyAttribute]})`
              : `${SKILL_LABELS[skill.name]} - Atributo: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]}`
          }
        >
          <Typography
            variant="body1"
            fontWeight={skill.isSignature ? 600 : 500}
          >
            {SKILL_LABELS[skill.name]}
          </Typography>
        </Tooltip>
        <Box sx={{ display: 'flex', gap: 0.5 }}>{indicators}</Box>
      </Box>

      {/* Atributo-chave atual (editável) */}
      <FormControl
        size="small"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <Select
          value={skill.keyAttribute}
          onChange={handleKeyAttributeChange}
          aria-label={`Atributo-chave para ${SKILL_LABELS[skill.name]}`}
          sx={{
            '& .MuiSelect-select': {
              py: 0.75,
            },
            ...(isCustomAttribute && {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }),
          }}
        >
          <MenuItem value="agilidade">AGI</MenuItem>
          <MenuItem value="constituicao">CON</MenuItem>
          <MenuItem value="forca">FOR</MenuItem>
          <MenuItem value="influencia">INF</MenuItem>
          <MenuItem value="mente">MEN</MenuItem>
          <MenuItem value="presenca">PRE</MenuItem>
        </Select>
      </FormControl>

      {/* Grau de proficiência (editável) */}
      <FormControl
        size="small"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <Select
          value={skill.proficiencyLevel}
          onChange={handleProficiencyChange}
          aria-label={`Proficiência em ${SKILL_LABELS[skill.name]}`}
          sx={{
            '& .MuiSelect-select': {
              py: 0.75,
            },
          }}
        >
          <MenuItem value="leigo">Leigo</MenuItem>
          <MenuItem value="adepto">Adepto</MenuItem>
          <MenuItem value="versado">Versado</MenuItem>
          <MenuItem value="mestre">Mestre</MenuItem>
        </Select>
      </FormControl>

      {/* Modificadores inline */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <InlineModifiers
          diceModifier={extractDiceModifier(skill.modifiers)}
          numericModifier={extractNumericModifier(skill.modifiers)}
          onUpdate={handleModifiersChange}
        />
      </Box>

      {/* Resultado: Modificador + Fórmula (combinados) */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Tooltip
          title={`Modificador total: ${calculation.attributeValue} (atributo) × ${calculation.proficiencyMultiplier} (proficiência) = ${calculation.baseModifier} (base) ${calculation.signatureBonus > 0 ? `+ ${calculation.signatureBonus} (assinatura)` : ''} ${extractNumericModifier(skill.modifiers) !== 0 ? `+ ${extractNumericModifier(skill.modifiers)} (modificadores)` : ''} ${calculation.otherModifiers !== 0 ? `+ ${calculation.otherModifiers} (outros)` : ''}`}
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
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip
          title={`Fórmula de rolagem: ${rollFormula.formula} (${rollFormula.diceCount} dado${rollFormula.diceCount > 1 ? 's' : ''} + modificador de ${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier})`}
        >
          <Typography
            variant="body1"
            fontFamily="monospace"
            color="primary"
            fontWeight={700}
            sx={{
              minWidth: 'fit-content',
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
            }}
          >
            {rollFormula.formula}
          </Typography>
        </Tooltip>
      </Box>

      {/* Mobile: Modificador + Rolagem */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Tooltip
          title={`Modificador total: ${calculation.attributeValue} (atributo) × ${calculation.proficiencyMultiplier} (proficiência) = ${calculation.baseModifier} (base) ${calculation.signatureBonus > 0 ? `+ ${calculation.signatureBonus} (assinatura)` : ''} ${extractNumericModifier(skill.modifiers) !== 0 ? `+ ${extractNumericModifier(skill.modifiers)} (modificadores)` : ''} ${calculation.otherModifiers !== 0 ? `+ ${calculation.otherModifiers} (outros)` : ''}`}
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
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>
        <Tooltip
          title={`Fórmula de rolagem: ${rollFormula.formula} (${rollFormula.diceCount} dado${rollFormula.diceCount > 1 ? 's' : ''} + modificador de ${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier})`}
        >
          <Typography
            variant="body2"
            fontFamily="monospace"
            color="primary"
            fontWeight={600}
          >
            {rollFormula.formula}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SkillRow;
