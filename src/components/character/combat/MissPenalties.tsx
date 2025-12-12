/**
 * MissPenalties - Componente para gerenciar penalidades de erros em combate
 *
 * Este componente implementa o sistema de penalidades do Tabuleiro do Caos RPG:
 *
 * 1. Penalidade de Defesa:
 *    - Quando um ataque erra, a Defesa diminui em -1 (mínimo 15)
 *    - Reseta quando um ataque acerta ou no início da próxima rodada
 *
 * 2. Penalidade de Testes de Resistência:
 *    - Quando passa em um teste que mitiga todo o efeito, sofre -1d20 naquele teste
 *    - Cada tipo é rastreado separadamente
 *    - Reseta quando falha no teste ou no início da próxima rodada
 *
 * @example
 * ```tsx
 * <MissPenalties
 *   baseDefense={18}
 *   penalties={combatPenalties}
 *   onChange={setCombatPenalties}
 * />
 * ```
 */
'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import {
  RemoveCircleOutline as MissIcon,
  CheckCircleOutline as HitIcon,
  RestartAlt as ResetIcon,
  Shield as DefenseIcon,
  Psychology as DeterminacaoIcon,
  Speed as ReflexoIcon,
  FitnessCenter as TenacidadeIcon,
  Favorite as VigorIcon,
} from '@mui/icons-material';
import type { SavingThrowType, CombatPenalties } from '@/types/combat';
import {
  applyDefensePenalty,
  resetDefensePenalty,
  applySavingThrowPenalty,
  resetSavingThrowPenalty,
  resetAllPenalties,
  calculateEffectiveDefense,
  hasAnyPenalty,
  MIN_DEFENSE,
  SAVING_THROW_LABELS,
  SAVING_THROW_COLORS,
} from '@/utils/combatPenalties';

/**
 * Props para o componente MissPenalties
 */
export interface MissPenaltiesProps {
  /** Defesa base do personagem (sem penalidades) */
  baseDefense: number;
  /** Estado atual das penalidades */
  penalties: CombatPenalties;
  /** Callback quando as penalidades mudam */
  onChange: (penalties: CombatPenalties) => void;
  /** Callback para abrir detalhes da defesa no sidebar */
  onOpenDetails?: () => void;
}

/**
 * Informações de um tipo de teste de resistência para exibição
 */
interface SavingThrowInfo {
  type: SavingThrowType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Configuração dos tipos de teste de resistência
 */
const SAVING_THROW_INFO: SavingThrowInfo[] = [
  {
    type: 'determinacao',
    label: SAVING_THROW_LABELS.determinacao,
    icon: <DeterminacaoIcon fontSize="small" />,
    color: SAVING_THROW_COLORS.determinacao,
  },
  {
    type: 'reflexo',
    label: SAVING_THROW_LABELS.reflexo,
    icon: <ReflexoIcon fontSize="small" />,
    color: SAVING_THROW_COLORS.reflexo,
  },
  {
    type: 'tenacidade',
    label: SAVING_THROW_LABELS.tenacidade,
    icon: <TenacidadeIcon fontSize="small" />,
    color: SAVING_THROW_COLORS.tenacidade,
  },
  {
    type: 'vigor',
    label: SAVING_THROW_LABELS.vigor,
    icon: <VigorIcon fontSize="small" />,
    color: SAVING_THROW_COLORS.vigor,
  },
];

/**
 * Componente para gerenciar penalidades de erros em combate
 */
export function MissPenalties({
  baseDefense,
  penalties,
  onChange,
  onOpenDetails,
}: MissPenaltiesProps) {
  /**
   * Aplica penalidade de defesa (ataque errou)
   */
  const handleDefenseMiss = useCallback(() => {
    const newDefensePenalty = applyDefensePenalty(
      penalties.defensePenalty,
      baseDefense
    );
    onChange({
      ...penalties,
      defensePenalty: newDefensePenalty,
    });
  }, [penalties, baseDefense, onChange]);

  /**
   * Reseta penalidade de defesa (ataque acertou)
   */
  const handleDefenseHit = useCallback(() => {
    onChange({
      ...penalties,
      defensePenalty: resetDefensePenalty(),
    });
  }, [penalties, onChange]);

  /**
   * Aplica penalidade em teste de resistência (passou no teste)
   */
  const handleSavingThrowSuccess = useCallback(
    (type: SavingThrowType) => {
      const newSavingThrowPenalties = applySavingThrowPenalty(
        penalties.savingThrowPenalties,
        type
      );
      onChange({
        ...penalties,
        savingThrowPenalties: newSavingThrowPenalties,
      });
    },
    [penalties, onChange]
  );

  /**
   * Reseta penalidade em teste de resistência (falhou no teste)
   */
  const handleSavingThrowFail = useCallback(
    (type: SavingThrowType) => {
      const newSavingThrowPenalties = resetSavingThrowPenalty(
        penalties.savingThrowPenalties,
        type
      );
      onChange({
        ...penalties,
        savingThrowPenalties: newSavingThrowPenalties,
      });
    },
    [penalties, onChange]
  );

  /**
   * Reseta todas as penalidades (início do turno)
   */
  const handleResetAll = useCallback(() => {
    onChange(resetAllPenalties());
  }, [onChange]);

  // Calcula defesa efetiva
  const effectiveDefense = calculateEffectiveDefense(
    baseDefense,
    penalties.defensePenalty
  );
  const hasDefensePenalty = penalties.defensePenalty !== 0;
  const hasPenalties = hasAnyPenalty(penalties);

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Header com título e botão de reset */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            color="text.secondary"
            onClick={onOpenDetails}
            sx={
              onOpenDetails
                ? {
                    cursor: 'pointer',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    '&:hover': { color: 'primary.main' },
                  }
                : undefined
            }
          >
            Defesa
          </Typography>

          <Tooltip title="Resetar todas as penalidades (início do turno)">
            <span>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<ResetIcon />}
                onClick={handleResetAll}
                disabled={!hasPenalties}
              >
                Nova Rodada
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Stack spacing={3}>
          {/* Seção de Defesa - Centralizada e Destacada */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: hasDefensePenalty ? 'error.dark' : 'action.hover',
              color: hasDefensePenalty ? 'error.contrastText' : 'inherit',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {/* Label */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <DefenseIcon
                sx={{
                  color: hasDefensePenalty ? 'inherit' : 'primary.main',
                }}
              />
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{ color: hasDefensePenalty ? 'inherit' : 'text.secondary' }}
              >
                Defesa
              </Typography>
            </Box>

            {/* Display de Defesa */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Typography
                variant="h3"
                component="span"
                fontWeight="bold"
                sx={{
                  color: hasDefensePenalty ? 'inherit' : 'text.primary',
                }}
              >
                {effectiveDefense}
              </Typography>
              {hasDefensePenalty && (
                <>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      textDecoration: 'line-through',
                      opacity: 0.7,
                    }}
                  >
                    {baseDefense}
                  </Typography>
                  <Chip
                    label={`${penalties.defensePenalty}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'inherit',
                      fontWeight: 'bold',
                    }}
                  />
                </>
              )}
            </Box>

            {/* Botões de controle - Maiores e Centralizados */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Ataque errou: -1 na Defesa">
                <span>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<MissIcon />}
                    onClick={handleDefenseMiss}
                    disabled={effectiveDefense <= MIN_DEFENSE}
                    sx={{ minWidth: 120 }}
                  >
                    Errou
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="Ataque acertou: reseta penalidade">
                <span>
                  <Button
                    variant={hasDefensePenalty ? 'contained' : 'outlined'}
                    color="success"
                    size="large"
                    startIcon={<HitIcon />}
                    onClick={handleDefenseHit}
                    disabled={!hasDefensePenalty}
                    sx={{ minWidth: 120 }}
                  >
                    Acertou
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {effectiveDefense <= MIN_DEFENSE && hasDefensePenalty && (
              <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
                Defesa no mínimo de {MIN_DEFENSE}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Seção de Testes de Resistência - Grid 2x2 */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              Testes de Resistência
            </Typography>

            <Grid container spacing={1.5}>
              {SAVING_THROW_INFO.map((info) => {
                const penalty = penalties.savingThrowPenalties[info.type];
                const hasPenalty = penalty !== 0;

                return (
                  <Grid size={{ xs: 6 }} key={info.type}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 0.5,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: hasPenalty ? 'error.main' : 'action.hover',
                        color: hasPenalty ? 'error.contrastText' : 'inherit',
                        transition: 'all 0.2s ease-in-out',
                        minHeight: 44,
                      }}
                    >
                      {/* Info do teste */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            color: hasPenalty ? 'inherit' : info.color,
                            display: 'flex',
                            flexShrink: 0,
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          noWrap
                          sx={{ flex: 1 }}
                        >
                          {info.label}
                        </Typography>
                        {hasPenalty && (
                          <Chip
                            label={`${penalty}d20`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'inherit',
                              height: 18,
                              fontSize: '0.65rem',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>

                      {/* Botões compactos */}
                      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                        <Tooltip title={`Passou: ${penalty - 1}d20`}>
                          <IconButton
                            size="small"
                            onClick={() => handleSavingThrowSuccess(info.type)}
                            sx={{
                              color: hasPenalty ? 'inherit' : 'error.main',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: hasPenalty
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'error.light',
                              },
                            }}
                          >
                            <MissIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Falhou: reseta">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleSavingThrowFail(info.type)}
                              disabled={!hasPenalty}
                              sx={{
                                color: hasPenalty ? 'inherit' : 'success.main',
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: hasPenalty
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'success.light',
                                },
                                '&.Mui-disabled': {
                                  color: hasPenalty
                                    ? 'rgba(255,255,255,0.3)'
                                    : 'action.disabled',
                                },
                              }}
                            >
                              <HitIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1.5, display: 'block' }}
            >
              Passar em um teste aplica -1d20 no próximo teste do mesmo tipo.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
