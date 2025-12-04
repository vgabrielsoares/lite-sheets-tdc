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
import type { Attack, AttackType, ActionType } from '@/types/combat';
import type { DamageType } from '@/types/common';

export interface AttackRowProps {
  /** Dados do ataque */
  attack: Attack;
  /** Callback para editar o ataque */
  onEdit: (attack: Attack) => void;
  /** Callback para remover o ataque */
  onDelete: (attackName: string) => void;
  /** Índice do ataque (para acessibilidade) */
  index: number;
}

/** Labels para tipos de ataque */
const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  'corpo-a-corpo': 'Corpo a Corpo',
  distancia: 'Distância',
  magico: 'Mágico',
};

/** Labels para tipos de ação */
const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  maior: 'Ação Maior',
  menor: 'Ação Menor',
  '2-menores': '2 Ações Menores',
  livre: 'Ação Livre',
  reacao: 'Reação',
  'reacao-defensiva': 'Reação Defensiva',
};

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
export function AttackRow({ attack, onEdit, onDelete, index }: AttackRowProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Formatar rolagem de ataque
  const attackRollStr = formatDiceRoll(1, 'd20', attack.attackBonus);

  // Formatar rolagem de dano
  const damageRollStr = formatDiceRoll(
    attack.damageRoll.quantity,
    attack.damageRoll.type,
    attack.damageRoll.modifier
  );

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

        {/* Ações */}
        <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(attack);
            }}
            aria-label={`Editar ${attack.name}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(attack.name);
            }}
            color="error"
            aria-label={`Remover ${attack.name}`}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={expanded ? 'Recolher' : 'Expandir'}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
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
                label={ACTION_TYPE_LABELS[attack.actionType]}
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

            {/* Detalhes de ataque */}
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
                <Typography variant="body2">
                  {attackRollStr} ({attack.attackSkill})
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dano
                </Typography>
                <Typography variant="body2">
                  {damageRollStr} de {DAMAGE_TYPE_LABELS[attack.damageType]}
                </Typography>
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
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}
