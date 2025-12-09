/**
 * DiceRollResult - Exibição de Resultado de Rolagem
 *
 * Exibe o resultado de uma rolagem de dados com breakdown detalhado,
 * animações e feedback visual para críticos/falhas.
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
import type { DiceRollResult as DiceRollResultType } from '@/utils/diceRoller';

export interface DiceRollResultProps {
  /** Resultado da rolagem */
  result: DiceRollResultType;
  /** Se deve exibir animação de entrada */
  animate?: boolean;
  /** Se deve exibir breakdown detalhado */
  showBreakdown?: boolean;
}

/**
 * Animação de entrada com bounce
 */
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

/**
 * Animação de pulso para críticos
 */
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
`;

/**
 * Componente de exibição de resultado
 */
export function DiceRollResult({
  result,
  animate = true,
  showBreakdown = true,
}: DiceRollResultProps) {
  const theme = useTheme();

  /**
   * Determina a cor do resultado baseado em crítico/falha
   */
  const getResultColor = () => {
    if (result.isCritical) {
      return theme.palette.warning.main; // Dourado para crítico
    }
    if (result.isCriticalFailure) {
      return theme.palette.error.main; // Vermelho para falha crítica
    }
    return theme.palette.primary.main;
  };

  /**
   * Determina a cor de fundo do resultado
   */
  const getResultBackgroundColor = () => {
    if (result.isCritical) {
      return theme.palette.mode === 'dark'
        ? 'rgba(255, 215, 0, 0.1)'
        : 'rgba(255, 215, 0, 0.05)';
    }
    if (result.isCriticalFailure) {
      return theme.palette.mode === 'dark'
        ? 'rgba(211, 47, 47, 0.1)'
        : 'rgba(211, 47, 47, 0.05)';
    }
    return theme.palette.mode === 'dark'
      ? 'rgba(212, 175, 55, 0.05)'
      : 'rgba(94, 44, 4, 0.03)';
  };

  return (
    <Paper
      elevation={result.isCritical ? 8 : 2}
      sx={{
        p: 2,
        backgroundColor: getResultBackgroundColor(),
        borderRadius: 2,
        animation: animate ? `${bounceIn} 0.5s ease-out` : 'none',
        ...(result.isCritical && {
          animation: `${bounceIn} 0.5s ease-out, ${pulse} 2s infinite`,
          border: `2px solid ${theme.palette.warning.main}`,
        }),
        ...(result.isCriticalFailure && {
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

        {/* Resultado Final - Grande e Destacado */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Resultado Final
          </Typography>
          <Typography
            variant="h2"
            component="div"
            fontWeight="bold"
            sx={{
              color: getResultColor(),
              fontSize: { xs: '3rem', sm: '4rem' },
              lineHeight: 1,
              my: 1,
              textShadow: result.isCritical
                ? `0 0 20px ${theme.palette.warning.main}`
                : 'none',
            }}
            aria-label={`Resultado final: ${result.finalResult}`}
          >
            {result.finalResult}
          </Typography>

          {/* Tags de Crítico/Falha */}
          {result.isCritical && (
            <Chip
              label="CRÍTICO! 🎉"
              color="warning"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                animation: `${pulse} 2s infinite`,
              }}
            />
          )}
          {result.isCriticalFailure && (
            <Chip
              label="FALHA CRÍTICA!"
              color="error"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
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
                  Dados Rolados ({result.diceCount}d{result.diceType}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {result.rolls.map((roll, index) => {
                    // Destaca o dado escolhido
                    const isChosenDie =
                      (result.rollType === 'advantage' ||
                        result.rollType === 'normal' ||
                        result.diceCount > 0) &&
                      roll === result.baseResult;

                    const isChosenLowDie =
                      (result.rollType === 'disadvantage' ||
                        result.diceCount <= 0) &&
                      roll === result.baseResult;

                    return (
                      <Chip
                        key={index}
                        label={roll}
                        size="small"
                        sx={{
                          fontWeight:
                            isChosenDie || isChosenLowDie ? 'bold' : 'normal',
                          backgroundColor:
                            isChosenDie || isChosenLowDie
                              ? theme.palette.primary.main
                              : theme.palette.action.hover,
                          color:
                            isChosenDie || isChosenLowDie
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          fontSize: '0.875rem',
                          minWidth: '32px',
                          ...(roll === 20 && {
                            backgroundColor: theme.palette.warning.main,
                            color: theme.palette.warning.contrastText,
                          }),
                          ...(roll === 1 && {
                            backgroundColor: theme.palette.error.main,
                            color: theme.palette.error.contrastText,
                          }),
                        }}
                      />
                    );
                  })}
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
                  Valor Base: <strong>{result.baseResult}</strong>
                  {result.modifier !== 0 && (
                    <>
                      {' '}
                      {result.modifier > 0 ? '+' : ''}
                      {result.modifier} (modificador)
                    </>
                  )}
                  {' = '}
                  <strong style={{ color: getResultColor() }}>
                    {result.finalResult}
                  </strong>
                </Typography>
              </Box>

              {/* Tipo de Rolagem */}
              {result.rollType !== 'normal' && (
                <Box>
                  <Chip
                    label={
                      result.rollType === 'advantage'
                        ? 'Com Vantagem'
                        : 'Com Desvantagem'
                    }
                    size="small"
                    color={
                      result.rollType === 'advantage' ? 'success' : 'error'
                    }
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

export default DiceRollResult;
