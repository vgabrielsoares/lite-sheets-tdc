'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GpsFixed as MeleeIcon,
  MyLocation as RangedIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material';
import type { Attack, AttackType } from '@/types/combat';
import type { DamageType } from '@/types/common';
import type { Character } from '@/types';
import { AttackRollButton } from './AttackRollButton';
import { DamageRollButton } from './DamageRollButton';
import { CombinedAttackButton } from './CombinedAttackButton';
import { calculateAttackRoll } from '@/utils/attackCalculations';

export interface AttackRowProps {
  /** Dados do ataque */
  attack: Attack;
  /** Callback para editar o ataque */
  onEdit: (attack: Attack) => void;
  /** Callback para remover o ataque */
  onDelete: (attackName: string) => void;
  /** Índice do ataque (para acessibilidade) */
  index: number;
  /** Dados do personagem (para acessar atributos/habilidades) */
  character: Character;
}

/** Labels para tipos de ataque */
const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  'corpo-a-corpo': 'Corpo a Corpo',
  distancia: 'Distância',
  magico: 'Mágico',
};

/** Labels para custo de ação (v0.0.2: actionCost numérico) */
function getActionCostLabel(cost: number): string {
  switch (cost) {
    case 0:
      return '∆ Livre / ↩ Reação';
    case 1:
      return '▶ Ação';
    case 2:
      return '▶▶ Ação Dupla';
    case 3:
      return '▶▶▶ Ação Tripla';
    default:
      return `▶×${cost}`;
  }
}

/** Labels amigáveis para tipos de dano */
const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  acido: 'Ácido',
  eletrico: 'Elétrico',
  fisico: 'Físico',
  corte: 'Corte',
  perfuracao: 'Perfuração',
  impacto: 'Impacto',
  fogo: 'Fogo',
  frio: 'Frio',
  interno: 'Interno',
  mental: 'Mental',
  mistico: 'Místico',
  profano: 'Profano',
  sagrado: 'Sagrado',
  sonoro: 'Sonoro',
  veneno: 'Veneno',
};

/**
 * Ícone do tipo de ataque
 */
function AttackTypeIcon({ type }: { type: AttackType }) {
  switch (type) {
    case 'corpo-a-corpo':
      return <MeleeIcon fontSize="small" />;
    case 'distancia':
      return <RangedIcon fontSize="small" />;
    case 'magico':
      return <MagicIcon fontSize="small" />;
  }
}

/**
 * Formata a rolagem de dados para exibição
 */
function formatDiceRoll(
  quantity: number,
  type: string,
  modifier: number
): string {
  const modStr =
    modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
  return `${quantity}${type}${modStr}`;
}

/**
 * Componente que exibe uma linha individual de ataque
 *
 * Mostra informações resumidas e permite expandir para ver detalhes completos.
 *
 * @example
 * ```tsx
 * <AttackRow
 *   attack={attack}
 *   onEdit={handleEditAttack}
 *   onDelete={handleDeleteAttack}
 *   index={0}
 * />
 * ```
 */
export function AttackRow({
  attack,
  onEdit,
  onDelete,
  index,
  character,
}: AttackRowProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Calcular fórmula de ataque dinâmica baseada na habilidade/uso
  const attackRollCalc = calculateAttackRoll(
    character,
    attack.attackSkill,
    attack.attackSkillUseId,
    attack.attackBonus ?? 0,
    attack.attackAttribute,
    attack.attackDiceModifier || 0
  );
  const attackRollStr = attackRollCalc.formula;

  // Calcular modificador de atributo para o dano
  const attackAttributeKey =
    attack.attackAttribute ||
    character.skills[attack.attackSkill]?.keyAttribute ||
    'forca';
  const attributeValue = character.attributes[attackAttributeKey] || 0;

  // Calcular bônus de atributo no dano
  const attributeDamageBonus =
    (attack.addAttributeToDamage ?? true)
      ? attack.doubleAttributeDamage
        ? attributeValue * 2
        : attributeValue
      : 0;

  // Modificador total de dano (inclui modificador base + atributo)
  const totalDamageModifier = attack.damageRoll.modifier + attributeDamageBonus;

  // Formatar rolagem de dano com modificador total
  const damageRollStr = formatDiceRoll(
    attack.damageRoll.quantity,
    attack.damageRoll.type,
    totalDamageModifier
  );

  // Número de ataques
  const numberOfAttacks = attack.numberOfAttacks ?? 1;

  // Rolagem de dano com modificador de atributo incluído
  const damageRollWithAttribute = {
    ...attack.damageRoll,
    modifier: totalDamageModifier,
  };

  // Dano crítico com modificador de atributo incluído
  const criticalDamageWithAttribute = attack.criticalDamage
    ? {
        ...attack.criticalDamage,
        modifier: attack.criticalDamage.modifier + attributeDamageBonus,
      }
    : { quantity: 1, type: 'd6' as const, modifier: attributeDamageBonus };

  // Cor baseada no tipo de ataque
  const typeColor =
    attack.type === 'magico'
      ? theme.palette.info.main
      : attack.type === 'distancia'
        ? theme.palette.success.main
        : theme.palette.warning.main;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      {/* Linha resumida */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          gap: 1.5,
          cursor: 'pointer',
          bgcolor: alpha(typeColor, 0.05),
        }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`Ataque ${attack.name}, clique para ${expanded ? 'recolher' : 'expandir'}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {/* Ícone do tipo */}
        <Box sx={{ color: typeColor }}>
          <AttackTypeIcon type={attack.type} />
        </Box>

        {/* Nome do ataque */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ flexGrow: 1, minWidth: 0 }}
          noWrap
        >
          {attack.name}
          {numberOfAttacks > 1 && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: 'text.secondary' }}
            >
              (×{numberOfAttacks})
            </Typography>
          )}
        </Typography>

        {/* Info rápida - Ataque */}
        <Tooltip title="Bônus de ataque">
          <Chip
            label={attackRollStr}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ minWidth: 60 }}
          />
        </Tooltip>

        {/* Botão de rolagem de ataque */}
        <AttackRollButton
          attackName={attack.name}
          attackBonus={attack.attackBonus ?? 0}
          character={character}
          attackSkill={attack.attackSkill}
          attackSkillUseId={attack.attackSkillUseId}
          attackAttribute={attack.attackAttribute}
          attackDiceModifier={attack.attackDiceModifier}
          size="small"
          color="primary"
        />

        {/* Info rápida - Dano */}
        <Tooltip title={`Dano (${DAMAGE_TYPE_LABELS[attack.damageType]})`}>
          <Chip
            label={damageRollStr}
            size="small"
            color="error"
            variant="outlined"
            sx={{ minWidth: 60 }}
          />
        </Tooltip>

        {/* Botão de rolagem de dano */}
        <DamageRollButton
          attackName={attack.name}
          damageRoll={damageRollWithAttribute}
          damageType={attack.damageType}
          criticalDamage={criticalDamageWithAttribute}
          size="small"
          color="error"
        />

        {/* Botão de rolagem combinada (ataque + dano) */}
        <CombinedAttackButton
          attackName={attack.name}
          attackBonus={attack.attackBonus ?? 0}
          damageRoll={damageRollWithAttribute}
          damageType={attack.damageType}
          criticalRange={attack.criticalRange ?? 20}
          criticalDamage={criticalDamageWithAttribute}
          character={character}
          attackSkill={attack.attackSkill}
          attackSkillUseId={attack.attackSkillUseId}
          attackAttribute={attack.attackAttribute}
          attackDiceModifier={attack.attackDiceModifier}
          size="small"
        />

        {/* Botão expandir */}
        <IconButton
          size="small"
          aria-label={expanded ? 'Recolher' : 'Expandir'}
          sx={{ ml: 'auto' }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Detalhes expandidos */}
      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.5}>
            {/* Tipo e Ação */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={ATTACK_TYPE_LABELS[attack.type]}
                size="small"
                sx={{ bgcolor: alpha(typeColor, 0.15), color: typeColor }}
              />
              <Chip
                label={getActionCostLabel(attack.actionCost)}
                size="small"
                variant="outlined"
              />
              {attack.ppCost && attack.ppCost > 0 && (
                <Chip
                  label={`Custo: ${attack.ppCost} PP`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Detalhes de ataque com botões de rolagem */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rolagem de Ataque
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    {attackRollStr} ({attack.attackSkill})
                  </Typography>
                  <AttackRollButton
                    attackName={attack.name}
                    attackBonus={attack.attackBonus ?? 0}
                    character={character}
                    attackSkill={attack.attackSkill}
                    attackSkillUseId={attack.attackSkillUseId}
                    attackAttribute={attack.attackAttribute}
                    attackDiceModifier={attack.attackDiceModifier}
                    size="small"
                    color="primary"
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dano
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    {damageRollStr} de {DAMAGE_TYPE_LABELS[attack.damageType]}
                  </Typography>
                  <DamageRollButton
                    attackName={attack.name}
                    damageRoll={damageRollWithAttribute}
                    damageType={attack.damageType}
                    criticalDamage={criticalDamageWithAttribute}
                    size="small"
                    color="error"
                  />
                </Stack>
              </Box>

              {attack.range && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Alcance
                  </Typography>
                  <Typography variant="body2">{attack.range}</Typography>
                </Box>
              )}
            </Box>

            {/* Seção de rolagem rápida */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Rolagem Rápida
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <CombinedAttackButton
                  attackName={attack.name}
                  attackBonus={attack.attackBonus ?? 0}
                  damageRoll={damageRollWithAttribute}
                  damageType={attack.damageType}
                  criticalRange={attack.criticalRange ?? 20}
                  criticalDamage={criticalDamageWithAttribute}
                  character={character}
                  attackSkill={attack.attackSkill}
                  attackSkillUseId={attack.attackSkillUseId}
                  attackAttribute={attack.attackAttribute}
                  attackDiceModifier={attack.attackDiceModifier}
                  size="medium"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ alignSelf: 'center' }}
                >
                  Ataque Completo (Ataque + Dano)
                </Typography>
              </Stack>
            </Box>

            {/* Descrição */}
            {attack.description && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {attack.description}
                </Typography>
              </Box>
            )}

            {/* Ações - Editar e Excluir */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'flex-end',
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
                mt: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(attack);
                }}
                aria-label={`Editar ${attack.name}`}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <Tooltip
                title={
                  attack.isDefaultAttack
                    ? 'Ataque padrão do sistema não pode ser removido'
                    : `Remover ${attack.name}`
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(attack.name);
                    }}
                    color="error"
                    aria-label={`Remover ${attack.name}`}
                    disabled={attack.isDefaultAttack}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}
