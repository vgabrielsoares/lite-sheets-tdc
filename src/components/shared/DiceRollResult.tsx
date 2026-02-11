/**
 * DiceRollResult - Exibição de Resultado de Rolagem
 *
 * Exibe o resultado de uma rolagem de dados no novo sistema de pool de dados:
 * - Pool de dados com contagem de sucessos (✶)
 * - Exibição de dados individuais com status de sucesso/cancelamento
 * - Sem triunfos/desastres (mecânicas removidas do sistema)
 *
 * Também suporta rolagens de dano (soma de dados).
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import { keyframes } from '@mui/system';
import StarIcon from '@mui/icons-material/Star';
import CancelIcon from '@mui/icons-material/Cancel';
import type { DicePoolResult } from '@/types';
import {
  isDicePoolResult,
  isDamageDiceRollResult,
  isCustomDiceResult,
  type DamageDiceRollResult,
  type CustomDiceResult,
  type HistoryEntry,
} from '@/utils/diceRoller';

export interface DiceRollResultProps {
  /** Resultado da rolagem (pool, dano ou customizado) */
  result: HistoryEntry;
  /** Se deve exibir animação de entrada */
  animate?: boolean;
  /** Se deve exibir breakdown detalhado */
  showBreakdown?: boolean;
  /** Número de sucessos necessários (opcional, para feedback visual) */
  requiredSuccesses?: number;
}

/** Animação de entrada com bounce */
const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

/** Animação de pulso para críticos */
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

/**
 * Exibe o resultado de uma pool de dados (novo sistema v0.0.2)
 */
function PoolResultDisplay({
  result,
  animate,
  showBreakdown,
  requiredSuccesses,
}: {
  result: DicePoolResult;
  animate: boolean;
  showBreakdown: boolean;
  requiredSuccesses?: number;
}) {
  const theme = useTheme();

  const isSuccess =
    requiredSuccesses !== undefined
      ? result.netSuccesses >= requiredSuccesses
      : result.netSuccesses > 0;

  const hasMultipleSuccesses = result.netSuccesses > 1;
  const isFailure = result.netSuccesses === 0;

  const getResultColor = () => {
    if (isFailure) return theme.palette.error.main;
    if (hasMultipleSuccesses) return theme.palette.success.main;
    return theme.palette.primary.main;
  };

  const getResultBackgroundColor = () => {
    if (isFailure) {
      return theme.palette.mode === 'dark'
        ? 'rgba(211, 47, 47, 0.1)'
        : 'rgba(211, 47, 47, 0.05)';
    }
    if (hasMultipleSuccesses) {
      return theme.palette.mode === 'dark'
        ? 'rgba(76, 175, 80, 0.1)'
        : 'rgba(76, 175, 80, 0.05)';
    }
    return theme.palette.mode === 'dark'
      ? 'rgba(212, 175, 55, 0.05)'
      : 'rgba(94, 44, 4, 0.03)';
  };

  return (
    <Paper
      elevation={hasMultipleSuccesses ? 8 : 2}
      sx={{
        p: 2,
        backgroundColor: getResultBackgroundColor(),
        borderRadius: 2,
        animation: animate
          ? hasMultipleSuccesses
            ? `${bounceIn} 0.5s ease-out, ${pulse} 2s infinite`
            : `${bounceIn} 0.5s ease-out`
          : 'none',
        ...(hasMultipleSuccesses && {
          border: `2px solid ${theme.palette.success.main}`,
        }),
        ...(isFailure && {
          border: `2px solid ${theme.palette.error.main}`,
        }),
      }}
    >
      <Stack spacing={2}>
        {/* Fórmula */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Fórmula:
          </Typography>
          <Typography variant="body1" fontFamily="monospace">
            {result.formula}
          </Typography>
        </Box>

        <Divider />

        {/* Resultado Final - Número de Sucessos */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Sucessos
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              my: 1,
            }}
          >
            <Typography
              variant="h2"
              component="div"
              fontWeight="bold"
              sx={{
                color: getResultColor(),
                fontSize: { xs: '3rem', sm: '4rem' },
                lineHeight: 1,
                textShadow: hasMultipleSuccesses
                  ? `0 0 20px ${theme.palette.success.main}`
                  : 'none',
              }}
              aria-label={`${result.netSuccesses} sucesso${result.netSuccesses !== 1 ? 's' : ''}`}
            >
              {result.netSuccesses}
            </Typography>
            <StarIcon
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem' },
                color: getResultColor(),
              }}
            />
          </Box>

          {/* Tags de resultado */}
          {isFailure && (
            <Chip
              label="0✶ FALHA"
              color="error"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            />
          )}
          {result.isPenaltyRoll && (
            <Chip
              label="2d (menor)"
              color="warning"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* Breakdown Detalhado */}
        {showBreakdown && (
          <>
            <Divider />

            <Stack spacing={1.5}>
              {/* Dados Rolados */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Dados Rolados ({result.diceCount}
                  {result.dieSize}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {result.dice.map((die, index) => {
                    let backgroundColor = theme.palette.action.hover;
                    let color = theme.palette.text.primary;

                    if (die.isSuccess) {
                      backgroundColor = theme.palette.success.main;
                      color = theme.palette.success.contrastText;
                    } else if (die.isCancellation) {
                      backgroundColor = theme.palette.error.main;
                      color = theme.palette.error.contrastText;
                    }

                    return (
                      <Chip
                        key={index}
                        label={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            {die.value}
                            {die.isSuccess && (
                              <StarIcon sx={{ fontSize: '0.8rem' }} />
                            )}
                            {die.isCancellation && (
                              <CancelIcon sx={{ fontSize: '0.8rem' }} />
                            )}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight:
                            die.isSuccess || die.isCancellation
                              ? 'bold'
                              : 'normal',
                          backgroundColor,
                          color,
                          fontSize: '0.875rem',
                          minWidth: '40px',
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Contagem */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Contagem:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  <span style={{ color: theme.palette.success.main }}>
                    {result.successes}✶
                  </span>
                  {result.cancellations > 0 && (
                    <>
                      {' - '}
                      <span style={{ color: theme.palette.error.main }}>
                        {result.cancellations} cancelado
                        {result.cancellations !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {' = '}
                  <strong style={{ color: getResultColor() }}>
                    {result.netSuccesses}✶
                  </strong>
                </Typography>
              </Box>

              {/* Modificador de dados */}
              {result.diceModifier !== 0 && (
                <Box>
                  <Chip
                    label={`${result.diceModifier > 0 ? '+' : ''}${result.diceModifier}d`}
                    size="small"
                    color={result.diceModifier > 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
              )}

              {/* Contexto */}
              {result.context && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Contexto:
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    {result.context}
                  </Typography>
                </Box>
              )}

              {/* Timestamp */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'right' }}
              >
                Rolado em:{' '}
                {new Date(result.timestamp).toLocaleTimeString('pt-BR')}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * Exibe o resultado de uma rolagem de dano (soma de dados)
 */
function DamageResultDisplay({
  result,
  animate,
  showBreakdown,
}: {
  result: DamageDiceRollResult;
  animate: boolean;
  showBreakdown: boolean;
}) {
  const theme = useTheme();

  const isCritical = result.isCritical ?? false;

  return (
    <Paper
      elevation={isCritical ? 8 : 2}
      sx={{
        p: 2,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(211, 47, 47, 0.05)'
            : 'rgba(211, 47, 47, 0.03)',
        borderRadius: 2,
        animation: animate ? `${bounceIn} 0.5s ease-out` : 'none',
        ...(isCritical && {
          border: `2px solid ${theme.palette.error.main}`,
          animation: `${bounceIn} 0.5s ease-out, ${pulse} 2s infinite`,
        }),
      }}
    >
      <Stack spacing={2}>
        {/* Fórmula */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Dano:
          </Typography>
          <Typography variant="body1" fontFamily="monospace">
            {result.formula}
          </Typography>
        </Box>

        <Divider />

        {/* Resultado Final */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Total de Dano
          </Typography>
          <Typography
            variant="h2"
            component="div"
            fontWeight="bold"
            sx={{
              color: theme.palette.error.main,
              fontSize: { xs: '3rem', sm: '4rem' },
              lineHeight: 1,
              my: 1,
            }}
            aria-label={`Dano: ${result.finalResult}`}
          >
            {result.finalResult}
          </Typography>

          {isCritical && (
            <Chip
              label="CRÍTICO!"
              color="error"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            />
          )}
        </Box>

        {/* Breakdown */}
        {showBreakdown && (
          <>
            <Divider />

            <Stack spacing={1.5}>
              {/* Dados Rolados */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Dados ({result.diceCount}d{result.diceType}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {result.rolls.map((roll, index) => (
                    <Chip
                      key={index}
                      label={roll}
                      size="small"
                      sx={{
                        fontWeight:
                          roll === result.diceType ? 'bold' : 'normal',
                        backgroundColor:
                          roll === result.diceType
                            ? theme.palette.error.main
                            : theme.palette.action.hover,
                        color:
                          roll === result.diceType
                            ? theme.palette.error.contrastText
                            : theme.palette.text.primary,
                        fontSize: '0.875rem',
                        minWidth: '32px',
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Cálculo */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Cálculo:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  Base: <strong>{result.baseResult}</strong>
                  {result.modifier !== 0 && (
                    <>
                      {' '}
                      {result.modifier > 0 ? '+' : ''}
                      {result.modifier}
                    </>
                  )}
                  {' = '}
                  <strong style={{ color: theme.palette.error.main }}>
                    {result.finalResult}
                  </strong>
                </Typography>
              </Box>

              {/* Contexto */}
              {result.context && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Contexto:
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    {result.context}
                  </Typography>
                </Box>
              )}

              {/* Timestamp */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'right' }}
              >
                Rolado em:{' '}
                {new Date(result.timestamp).toLocaleTimeString('pt-BR')}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * Exibe o resultado de uma rolagem customizada
 */
function CustomResultDisplay({
  result,
  animate,
  showBreakdown,
}: {
  result: CustomDiceResult;
  animate: boolean;
  showBreakdown: boolean;
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(212, 175, 55, 0.05)'
            : 'rgba(94, 44, 4, 0.03)',
        borderRadius: 2,
        animation: animate ? `${bounceIn} 0.5s ease-out` : 'none',
      }}
    >
      <Stack spacing={2}>
        {/* Fórmula */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Fórmula:
          </Typography>
          <Typography variant="body1" fontFamily="monospace">
            {result.formula}
          </Typography>
        </Box>

        <Divider />

        {/* Resultado */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {result.summed ? 'Total' : 'Resultado'}
          </Typography>
          <Typography
            variant="h2"
            component="div"
            fontWeight="bold"
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: '3rem', sm: '4rem' },
              lineHeight: 1,
              my: 1,
            }}
          >
            {result.total}
          </Typography>
        </Box>

        {/* Breakdown */}
        {showBreakdown && (
          <>
            <Divider />

            <Stack spacing={1.5}>
              {/* Dados */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Dados ({result.diceCount}d{result.diceType}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {result.rolls.map((roll, index) => (
                    <Chip
                      key={index}
                      label={roll}
                      size="small"
                      sx={{
                        fontSize: '0.875rem',
                        minWidth: '32px',
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Contexto */}
              {result.context && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Contexto:
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    {result.context}
                  </Typography>
                </Box>
              )}

              {/* Timestamp */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'right' }}
              >
                Rolado em:{' '}
                {new Date(result.timestamp).toLocaleTimeString('pt-BR')}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

/**
 * Componente principal de exibição de resultado
 *
 * Detecta automaticamente o tipo de resultado e exibe o componente apropriado.
 */
export function DiceRollResult({
  result,
  animate = true,
  showBreakdown = true,
  requiredSuccesses,
}: DiceRollResultProps) {
  if (isDicePoolResult(result)) {
    return (
      <PoolResultDisplay
        result={result}
        animate={animate}
        showBreakdown={showBreakdown}
        requiredSuccesses={requiredSuccesses}
      />
    );
  }

  if (isDamageDiceRollResult(result)) {
    return (
      <DamageResultDisplay
        result={result}
        animate={animate}
        showBreakdown={showBreakdown}
      />
    );
  }

  if (isCustomDiceResult(result)) {
    return (
      <CustomResultDisplay
        result={result}
        animate={animate}
        showBreakdown={showBreakdown}
      />
    );
  }

  // Fallback para tipo desconhecido
  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography color="error">Tipo de resultado desconhecido</Typography>
    </Paper>
  );
}

export default DiceRollResult;
