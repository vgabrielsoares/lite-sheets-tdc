'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
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
  // Estado local para edição do modificador
  const [isEditingModifier, setIsEditingModifier] = useState(false);
  const [modifierInput, setModifierInput] = useState('');

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

  /**
   * Inicia edição do modificador
   */
  const handleStartEditModifier = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Evitar abrir sidebar
      setModifierInput(String(modifiersTotal));
      setIsEditingModifier(true);
    },
    [modifiersTotal]
  );

  /**
   * Confirma edição do modificador
   */
  const handleConfirmModifier = useCallback(() => {
    const value = parseInt(modifierInput, 10);
    if (!isNaN(value) && onChange) {
      // Atualizar modificadores - usar um único modificador "Outros"
      const newModifiers: Modifier[] =
        value !== 0
          ? [
              {
                name: 'Outros',
                value,
                type: value >= 0 ? 'bonus' : 'penalidade',
              },
            ]
          : [];

      onChange({
        ...ppLimit,
        modifiers: newModifiers,
        total: baseLimit + value,
      });
    }
    setIsEditingModifier(false);
  }, [modifierInput, baseLimit, ppLimit, onChange]);

  /**
   * Cancela edição do modificador
   */
  const handleCancelModifier = useCallback(() => {
    setIsEditingModifier(false);
    setModifierInput('');
  }, []);

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
            color={isAtLimit ? 'error.main' : 'info.main'}
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
        </Box>

        {/* Campo de modificador adicional */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mt: 2,
          }}
        >
          {isEditingModifier ? (
            <TextField
              size="small"
              type="number"
              value={modifierInput}
              onChange={(e) => setModifierInput(e.target.value)}
              onBlur={handleConfirmModifier}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmModifier();
                if (e.key === 'Escape') handleCancelModifier();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">Mod:</InputAdornment>
                  ),
                },
                htmlInput: {
                  style: { width: 60, textAlign: 'center' },
                },
              }}
              sx={{ maxWidth: 120 }}
            />
          ) : (
            <Tooltip
              title="Clique para editar modificadores adicionais (habilidades, itens, etc.)"
              arrow
              enterDelay={150}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                onClick={handleStartEditModifier}
                sx={{
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                Mod. adicional:{' '}
                <strong>
                  {modifiersTotal >= 0 ? '+' : ''}
                  {modifiersTotal}
                </strong>
              </Typography>
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
              color={isAtLimit ? 'error.main' : 'text.primary'}
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
