'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkullIcon from '@mui/icons-material/Dangerous';
import type { DyingState } from '@/types/combat';
import { calculateMaxDyingRounds } from '@/utils';

export interface DyingRoundsProps {
  /** Estado de morte do personagem */
  dyingState: DyingState;
  /** Valor do atributo Constituição */
  constituicao: number;
  /** Modificadores adicionais de rodadas morrendo */
  otherModifiers?: number;
  /** Callback quando o estado de morrendo muda */
  onChange: (dyingState: DyingState) => void;
}

/**
 * DyingRounds - Componente para gerenciar rodadas no estado morrendo
 *
 * Exibe:
 * - Rodadas atuais vs máximas no estado morrendo
 * - Barra de progresso visual
 * - Controles +/- para ajustar rodadas
 * - Botão de reset
 *
 * Fórmula: 2 + Constituição + Outros Modificadores
 *
 * Conforme regras do Tabuleiro do Caos RPG:
 * - Quando PV chega a 0, personagem entra em estado "Morrendo"
 * - Personagem tem X rodadas antes de morrer
 * - Pode ser estabilizado ou curado antes disso
 *
 * @example
 * ```tsx
 * <DyingRounds
 *   dyingState={character.combat.dyingState}
 *   constituicao={character.attributes.constituicao}
 *   onChange={(dyingState) => updateCombat({ dyingState })}
 * />
 * ```
 */
export function DyingRounds({
  dyingState,
  constituicao,
  otherModifiers = 0,
  onChange,
}: DyingRoundsProps) {
  // Calcular rodadas máximas usando a fórmula centralizada
  const calculatedMaxRounds = calculateMaxDyingRounds(
    constituicao,
    otherModifiers
  );

  // Atualiza maxRounds se diferente do calculado
  const effectiveMaxRounds = calculatedMaxRounds;
  const currentRounds = dyingState.currentRounds;

  // Determinar estado visual
  const isDying = dyingState.isDying;
  const percentUsed = Math.min(
    100,
    Math.floor((currentRounds / effectiveMaxRounds) * 100)
  );
  const roundsRemaining = effectiveMaxRounds - currentRounds;
  const isCritical = roundsRemaining <= 1 && isDying;
  const isWarning = roundsRemaining === 2 && isDying;

  // Cores baseadas no estado
  const getProgressColor = () => {
    if (!isDying) return 'primary';
    if (isCritical) return 'error';
    if (isWarning) return 'warning';
    return 'info';
  };

  /**
   * Incrementa rodadas morrendo
   */
  const handleIncrement = () => {
    const newRounds = Math.min(currentRounds + 1, effectiveMaxRounds);
    onChange({
      ...dyingState,
      isDying: true,
      currentRounds: newRounds,
      maxRounds: effectiveMaxRounds,
    });
  };

  /**
   * Decrementa rodadas morrendo
   */
  const handleDecrement = () => {
    const newRounds = Math.max(currentRounds - 1, 0);
    onChange({
      ...dyingState,
      isDying: newRounds > 0,
      currentRounds: newRounds,
      maxRounds: effectiveMaxRounds,
    });
  };

  /**
   * Reseta o estado morrendo (estabilizado/curado)
   */
  const handleReset = () => {
    onChange({
      isDying: false,
      currentRounds: 0,
      maxRounds: effectiveMaxRounds,
    });
  };

  /**
   * Entra em estado morrendo
   */
  const handleStartDying = () => {
    onChange({
      isDying: true,
      currentRounds: 1,
      maxRounds: effectiveMaxRounds,
    });
  };

  // Tooltip com breakdown do cálculo
  const tooltipLines = [
    'Rodadas Máximas no Estado Morrendo:',
    '• Base: 2',
    `• Constituição: +${constituicao}`,
  ];
  if (otherModifiers !== 0) {
    tooltipLines.push(
      `• Outros: ${otherModifiers > 0 ? '+' : ''}${otherModifiers}`
    );
  }
  tooltipLines.push('━━━━━━━━━━━━━━━━━');
  tooltipLines.push(`Total: ${effectiveMaxRounds} rodadas`);
  const tooltipText = tooltipLines.join('\n');

  return (
    <Card
      sx={{
        borderColor: isDying ? 'error.main' : 'divider',
        borderWidth: isDying ? 2 : 1,
        borderStyle: 'solid',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SkullIcon color={isDying ? 'error' : 'disabled'} />
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
              Rodadas Morrendo
            </Typography>
          </Tooltip>
        </Box>

        {/* Estado atual */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {/* Botão decrementar */}
          <Tooltip title="Remover 1 rodada" arrow enterDelay={150}>
            <span>
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={!isDying || currentRounds === 0}
                aria-label="Remover 1 rodada morrendo"
              >
                <RemoveIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* Contador central */}
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography
              variant="h4"
              color={
                isCritical
                  ? 'error.main'
                  : isWarning
                    ? 'warning.main'
                    : 'text.primary'
              }
              fontWeight="bold"
            >
              {currentRounds} / {effectiveMaxRounds}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isDying
                ? isCritical
                  ? 'CRÍTICO!'
                  : `${roundsRemaining} restantes`
                : 'Estável'}
            </Typography>
          </Box>

          {/* Botão incrementar */}
          <Tooltip title="Adicionar 1 rodada" arrow enterDelay={150}>
            <span>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={isDying && currentRounds >= effectiveMaxRounds}
                aria-label="Adicionar 1 rodada morrendo"
              >
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Barra de progresso */}
        {isDying && (
          <Tooltip
            title={`${currentRounds} de ${effectiveMaxRounds} rodadas usadas`}
            arrow
            enterDelay={150}
          >
            <LinearProgress
              variant="determinate"
              value={percentUsed}
              color={getProgressColor()}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
          </Tooltip>
        )}

        {/* Botões de ação */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {!isDying ? (
            <Tooltip
              title="Entrar no estado morrendo (PV chegou a 0)"
              arrow
              enterDelay={150}
            >
              <IconButton
                color="error"
                onClick={handleStartDying}
                aria-label="Iniciar estado morrendo"
                sx={{
                  border: 1,
                  borderColor: 'error.main',
                  borderRadius: 1,
                  px: 2,
                }}
              >
                <SkullIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="button" fontSize="small">
                  Iniciar Morrendo
                </Typography>
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              title="Estabilizar/Curar - Resetar contador"
              arrow
              enterDelay={150}
            >
              <IconButton
                color="success"
                onClick={handleReset}
                aria-label="Resetar estado morrendo"
                sx={{
                  border: 1,
                  borderColor: 'success.main',
                  borderRadius: 1,
                  px: 2,
                }}
              >
                <RestartAltIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="button" fontSize="small">
                  Estabilizar
                </Typography>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default DyingRounds;
