'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { calculatePPPerRound } from '@/utils';
import type { PPLimit as PPLimitType, Modifier } from '@/types';

export interface PPLimitProps {
  /** Nível do personagem */
  characterLevel: number;
  /** Valor do atributo Presença */
  presenca: number;
  /** Limite de PP (base, modificadores, total) */
  ppLimit: PPLimitType;
  /** PP atuais gastos nesta rodada */
  ppSpentThisRound?: number;
  /** Callback para atualizar o limite de PP */
  onChange?: (ppLimit: PPLimitType) => void;
  /** Callback para abrir sidebar de detalhes */
  onOpenDetails?: () => void;
}

/**
 * PPLimit - Componente para exibir limite de PP por rodada
 *
 * Fórmula: Nível do Personagem + Presença + Outros Modificadores
 *
 * Exibe:
 * - Limite calculado automaticamente
 * - PP gastos na rodada atual (se fornecido)
 * - Indicador visual quando próximo do limite
 * - Tooltip com breakdown do cálculo
 *
 * Conforme regras do Tabuleiro do Caos RPG:
 * - Personagens têm um limite de quantos PP podem gastar por rodada
 * - Este limite ajuda a balancear o uso de magias e habilidades
 *
 * @example
 * ```tsx
 * <PPLimit
 *   characterLevel={5}
 *   presenca={3}
 *   ppLimit={character.combat.ppLimit}
 *   ppSpentThisRound={2}
 *   onOpenDetails={() => openPPLimitSidebar()}
 * />
 * ```
 */
export function PPLimit({
  characterLevel,
  presenca,
  ppLimit,
  ppSpentThisRound = 0,
  onChange,
  onOpenDetails,
}: PPLimitProps) {
  // Calcular limite total usando a fórmula centralizada
  const baseLimit = calculatePPPerRound(characterLevel, presenca, 0);

  // Somar modificadores adicionais
  const modifiersTotal = ppLimit.modifiers.reduce(
    (sum, mod: Modifier) => sum + mod.value,
    0
  );

  const totalLimit = baseLimit + modifiersTotal;

  // Estado visual
  const ppRemaining = totalLimit - ppSpentThisRound;
  const isAtLimit = ppRemaining <= 0;
  const isNearLimit = ppRemaining <= 2 && ppRemaining > 0;

  // Tooltip com breakdown
  const tooltipLines = [
    'Limite de PP por Rodada:',
    `• Nível: +${characterLevel}`,
    `• Presença: +${presenca}`,
  ];

  if (ppLimit.modifiers.length > 0) {
    ppLimit.modifiers.forEach((mod: Modifier) => {
      tooltipLines.push(
        `• ${mod.name}: ${mod.value > 0 ? '+' : ''}${mod.value}`
      );
    });
  }

  tooltipLines.push('━━━━━━━━━━━━━━━━━');
  tooltipLines.push(`Total: ${totalLimit} PP/rodada`);

  if (ppSpentThisRound > 0) {
    tooltipLines.push('');
    tooltipLines.push(`Gastos nesta rodada: ${ppSpentThisRound}`);
    tooltipLines.push(`Disponível: ${ppRemaining}`);
  }

  const tooltipText = tooltipLines.join('\n');

  return (
    <Card
      onClick={onOpenDetails}
      onKeyDown={(e) => {
        if (!onOpenDetails) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails();
        }
      }}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      sx={(theme) => ({
        cursor: onOpenDetails ? 'pointer' : 'default',
        border: onOpenDetails
          ? `1px solid ${theme.palette.primary.main}`
          : isAtLimit
            ? `2px solid ${theme.palette.error.main}`
            : `1px solid ${theme.palette.divider}`,
        transition: 'all 0.15s ease-in-out',
        '&:hover': onOpenDetails
          ? {
              borderColor: 'primary.dark',
              bgcolor: 'action.hover',
            }
          : {},
      })}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BoltIcon color="info" />
          <Tooltip
            title={
              <Typography sx={{ whiteSpace: 'pre-line' }}>
                {tooltipText}
              </Typography>
            }
            arrow
            enterDelay={150}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ flexGrow: 1 }}
            >
              Limite de PP/Rodada
            </Typography>
          </Tooltip>
          {isAtLimit && (
            <Tooltip title="Limite atingido!" arrow enterDelay={150}>
              <WarningAmberIcon color="error" />
            </Tooltip>
          )}
          {isNearLimit && !isAtLimit && (
            <Tooltip title="Próximo do limite" arrow enterDelay={150}>
              <WarningAmberIcon color="warning" />
            </Tooltip>
          )}
        </Box>

        {/* Valor principal */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 1,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            color={
              isAtLimit
                ? 'error.main'
                : isNearLimit
                  ? 'warning.main'
                  : 'info.main'
            }
          >
            {totalLimit}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PP máx/rodada
          </Typography>
        </Box>

        {/* Chips de breakdown rápido */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 1,
          }}
        >
          <Tooltip title="Bônus do nível do personagem" arrow enterDelay={150}>
            <Chip
              size="small"
              label={`Nível +${characterLevel}`}
              color="default"
              variant="outlined"
            />
          </Tooltip>
          <Tooltip title="Bônus do atributo Presença" arrow enterDelay={150}>
            <Chip
              size="small"
              label={`Presença +${presenca}`}
              color="default"
              variant="outlined"
            />
          </Tooltip>
          {modifiersTotal !== 0 && (
            <Tooltip title="Bônus de outras fontes" arrow enterDelay={150}>
              <Chip
                size="small"
                label={`Outros ${modifiersTotal > 0 ? '+' : ''}${modifiersTotal}`}
                color={modifiersTotal > 0 ? 'success' : 'error'}
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>

        {/* PP gastos nesta rodada (se rastreando) */}
        {ppSpentThisRound !== undefined && ppSpentThisRound > 0 && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Gastos nesta rodada:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              color={
                isAtLimit
                  ? 'error.main'
                  : isNearLimit
                    ? 'warning.main'
                    : 'text.primary'
              }
            >
              {ppSpentThisRound} / {totalLimit}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PPLimit;
