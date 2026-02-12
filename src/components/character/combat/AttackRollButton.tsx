/**
 * AttackRollButton - Botão de rolagem de ataque
 *
 * Permite rolar pool de dados para ataques com contagem de ✶ (sucessos).
 *
 * Funcionalidades:
 * - Rolagem rápida com um clique
 * - Pool de dados baseada em atributo + proficiência
 * - Contagem de sucessos (✶) com cancelamentos
 * - Sem comparação com defesa (defensor rola separadamente)
 * - Integração com histórico global de rolagens
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import HistoryIcon from '@mui/icons-material/History';
import {
  rollDicePool,
  rollWithPenalty,
  globalDiceHistory,
} from '@/utils/diceRoller';
import type { DicePoolResult } from '@/types';
import {
  calculateAttackPool,
  type AttackPoolCalculation,
} from '@/utils/attackCalculations';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { Character, AttributeName } from '@/types';
import type { SkillName } from '@/types/skills';

export interface AttackRollButtonProps {
  /** Nome do ataque (para contexto) */
  attackName: string;
  /** Dados do personagem (para acessar atributos/habilidades) */
  character: Character;
  /** Nome da habilidade usada no ataque (para calcular pool) */
  attackSkill?: SkillName;
  /** ID do uso específico de habilidade (opcional) */
  attackSkillUseId?: string;
  /** Atributo alternativo para o ataque (opcional) */
  attackAttribute?: AttributeName;
  /** Modificador de dados adicional (+Xd / -Xd) */
  attackDiceModifier?: number;
  /** Callback quando rolar (opcional) */
  onRoll?: (result: DicePoolResult) => void;
  /** Tamanho do botão */
  size?: 'small' | 'medium' | 'large';
  /** Cor do botão */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /** Se desabilitado */
  disabled?: boolean;
  /** Texto de tooltip customizado */
  tooltipText?: string;
}

/**
 * Retorna cor e label baseado na quantidade de ✶
 */
function getSuccessDisplay(netSuccesses: number): {
  color: 'error' | 'warning' | 'success' | 'info';
  label: string;
} {
  if (netSuccesses === 0) return { color: 'error', label: '0✶ — Falha' };
  if (netSuccesses === 1) return { color: 'warning', label: '1✶ — Sucesso' };
  if (netSuccesses === 2)
    return { color: 'success', label: '2✶ — Sucesso Forte' };
  return { color: 'info', label: `${netSuccesses}✶ — Sucesso Excepcional` };
}

/**
 * Botão de rolagem para ataques usando pool de dados
 *
 * Exibe um botão de ícone que abre um diálogo de rolagem ao clicar.
 * A rolagem usa o sistema de pool com contagem de ✶.
 */
export const AttackRollButton: React.FC<AttackRollButtonProps> = ({
  attackName,
  character,
  attackSkill,
  attackSkillUseId,
  attackAttribute,
  attackDiceModifier = 0,
  onRoll,
  size = 'small',
  color = 'primary',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<DicePoolResult | null>(null);

  // Calcular pool de ataque dinamicamente
  const attackPoolCalc: AttackPoolCalculation = useMemo(() => {
    if (attackSkill) {
      return calculateAttackPool(
        character,
        attackSkill,
        attackSkillUseId,
        attackDiceModifier,
        attackAttribute
      );
    }
    return {
      diceCount: 1,
      dieSize: 'd6' as const,
      isPenaltyRoll: false,
      formula: '1d6',
      attribute: 'corpo' as const,
      skillName: 'luta' as const,
    };
  }, [
    character,
    attackSkill,
    attackSkillUseId,
    attackAttribute,
    attackDiceModifier,
  ]);

  /**
   * Abre o diálogo de rolagem
   */
  const handleOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(true);
    setResult(null);
  }, []);

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Executa a rolagem de ataque usando pool de dados
   */
  const handleRoll = useCallback(() => {
    let poolResult: DicePoolResult;

    if (attackPoolCalc.isPenaltyRoll) {
      poolResult = rollWithPenalty(
        attackPoolCalc.dieSize,
        `Ataque: ${attackName}`
      );
    } else {
      poolResult = rollDicePool(
        attackPoolCalc.diceCount,
        attackPoolCalc.dieSize,
        `Ataque: ${attackName}`
      );
    }

    // Adicionar ao histórico global
    globalDiceHistory.add(poolResult);

    setResult(poolResult);

    if (onRoll) {
      onRoll(poolResult);
    }
  }, [attackPoolCalc, attackName, onRoll]);

  /**
   * Rolagem rápida (sem abrir diálogo primeiro)
   */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      let poolResult: DicePoolResult;

      if (attackPoolCalc.isPenaltyRoll) {
        poolResult = rollWithPenalty(
          attackPoolCalc.dieSize,
          `Ataque: ${attackName}`
        );
      } else {
        poolResult = rollDicePool(
          attackPoolCalc.diceCount,
          attackPoolCalc.dieSize,
          `Ataque: ${attackName}`
        );
      }

      globalDiceHistory.add(poolResult);

      if (onRoll) {
        onRoll(poolResult);
      }

      setResult(poolResult);
      setOpen(true);

      // Fechar automaticamente após 3 segundos
      setTimeout(() => {
        setOpen(false);
        setResult(null);
      }, 3000);
    },
    [attackPoolCalc, attackName, onRoll]
  );

  // Informação de sucesso do resultado
  const successDisplay = result ? getSuccessDisplay(result.netSuccesses) : null;

  /**
   * Texto do tooltip
   */
  const tooltip = tooltipText || `Rolar ataque: ${attackPoolCalc.formula}`;

  return (
    <>
      {/* Botão de rolagem */}
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={handleOpen}
            onDoubleClick={handleQuickRoll}
            size={size}
            color={color}
            disabled={disabled}
            aria-label={`Rolar ataque ${attackName}`}
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <GpsFixedIcon />
          </IconButton>
        </span>
      </Tooltip>

      {/* Diálogo de rolagem */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GpsFixedIcon color="primary" />
              <Typography variant="h6">{attackName}</Typography>
            </Stack>
            <Tooltip title="Ver histórico de rolagens">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const fab = document.querySelector(
                    '[aria-label="Abrir histórico de rolagens"]'
                  ) as HTMLElement;
                  if (fab) {
                    fab.click();
                  }
                }}
                sx={{ ml: 'auto' }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Informações da pool */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pool de Ataque:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={attackPoolCalc.formula}
                  size="small"
                  color="primary"
                />
                {attackPoolCalc.isPenaltyRoll && (
                  <Chip
                    label="Penalidade (menor resultado)"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <DiceRollResult result={result} showBreakdown animate />

                {/* Resultado em ✶ */}
                {successDisplay && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(
                        theme.palette[successDisplay.color].main,
                        0.1
                      ),
                      border: 1,
                      borderColor: alpha(
                        theme.palette[successDisplay.color].main,
                        0.3
                      ),
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={`${successDisplay.color}.main`}
                    >
                      {result.netSuccesses}✶
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {successDisplay.label}
                      {result.cancellations > 0 &&
                        ` (${result.successes} sucessos - ${result.cancellations} cancelamentos)`}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Fechar
          </Button>
          <Button
            onClick={handleRoll}
            variant="contained"
            startIcon={<GpsFixedIcon />}
            disabled={disabled}
          >
            Rolar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttackRollButton;
