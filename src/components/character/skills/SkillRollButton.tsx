/**
 * SkillRollButton - Botão de rolagem integrado com habilidades (v0.0.2)
 *
 * Permite rolar dados para testes de habilidade usando o novo sistema de pool:
 * - Dados = valor do atributo + modificadores de dado
 * - Tamanho do dado = grau de proficiência (d6/d8/d10/d12)
 * - Conta sucessos (✶): resultados ≥ 6
 * - Resultado = 1 cancela 1 sucesso
 *
 * Funcionalidades:
 * - Rolagem rápida com um clique
 * - Pré-preenchimento automático de valores
 * - Feedback visual de sucessos/falhas
 * - Integração com histórico global de rolagens
 */

'use client';

import React, { useState, useCallback } from 'react';
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
  TextField,
  Alert,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import StarIcon from '@mui/icons-material/Star';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import { rollSkillTest, globalDiceHistory } from '@/utils/diceRoller';
import type { DicePoolResult } from '@/types';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import { getSkillDieSize } from '@/constants/skills';
import type { ProficiencyLevel, DieSize } from '@/types';

export interface SkillRollButtonProps {
  /** Nome da habilidade (para contexto) */
  skillLabel: string;
  /** Valor do atributo-chave */
  attributeValue: number;
  /** Nível de proficiência (determina o tamanho do dado) */
  proficiencyLevel: ProficiencyLevel;
  /** Modificador de dados (+Xd ou -Xd) */
  diceModifier?: number;
  /** Número de sucessos necessários (opcional, para feedback visual) */
  requiredSuccesses?: number;
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
 * Botão de rolagem para habilidades
 *
 * Exibe um botão de ícone que abre um diálogo de rolagem ao clicar.
 * A rolagem é pré-configurada com os valores da habilidade.
 */
export const SkillRollButton: React.FC<SkillRollButtonProps> = ({
  skillLabel,
  attributeValue,
  proficiencyLevel,
  diceModifier = 0,
  requiredSuccesses,
  onRoll,
  size = 'small',
  color = 'primary',
  disabled = false,
  tooltipText,
}) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<DicePoolResult | null>(null);
  const [tempDiceModifier, setTempDiceModifier] = useState(diceModifier);

  const dieSize = getSkillDieSize(proficiencyLevel);

  /** Abre o diálogo de rolagem */
  const handleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setOpen(true);
      setResult(null);
      setTempDiceModifier(diceModifier);
    },
    [diceModifier]
  );

  /** Fecha o diálogo */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /** Executa a rolagem de dados */
  const handleRoll = useCallback(() => {
    const rollResult = rollSkillTest(
      attributeValue,
      dieSize,
      tempDiceModifier,
      `Teste de ${skillLabel}`
    );

    globalDiceHistory.add(rollResult);
    setResult(rollResult);

    if (onRoll) {
      onRoll(rollResult);
    }
  }, [attributeValue, dieSize, tempDiceModifier, skillLabel, onRoll]);

  /** Rolagem rápida (sem abrir diálogo) */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      const rollResult = rollSkillTest(
        attributeValue,
        dieSize,
        diceModifier,
        `Teste de ${skillLabel}`
      );

      globalDiceHistory.add(rollResult);

      if (onRoll) {
        onRoll(rollResult);
      }

      setResult(rollResult);
      setOpen(true);

      // Fechar automaticamente após 3 segundos
      setTimeout(() => {
        setOpen(false);
        setResult(null);
      }, 3000);
    },
    [attributeValue, dieSize, diceModifier, skillLabel, onRoll]
  );

  /** Determina se a rolagem foi bem-sucedida */
  const isSuccess =
    result && requiredSuccesses !== undefined
      ? result.netSuccesses >= requiredSuccesses
      : result
        ? result.netSuccesses > 0
        : undefined;

  /** Total de dados a serem rolados */
  const totalDice = attributeValue + tempDiceModifier;
  const effectiveDice = totalDice <= 0 ? '2 (menor)' : Math.min(totalDice, 8);

  /** Texto do tooltip */
  const tooltip =
    tooltipText ||
    `Rolar ${attributeValue}${dieSize}${requiredSuccesses ? ` (precisa ${requiredSuccesses}✶)` : ''}`;

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
            aria-label={`Rolar ${skillLabel}`}
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <CasinoIcon />
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
              <CasinoIcon color="primary" />
              <Typography variant="h6">Teste de {skillLabel}</Typography>
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
            {/* Informações da rolagem */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configuração:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${effectiveDice}${dieSize}`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={
                    proficiencyLevel.charAt(0).toUpperCase() +
                    proficiencyLevel.slice(1)
                  }
                  size="small"
                  variant="outlined"
                />
                {requiredSuccesses !== undefined && (
                  <Chip
                    label={`Precisa: ${requiredSuccesses}✶`}
                    size="small"
                    color="warning"
                  />
                )}
                {totalDice <= 0 && (
                  <Chip
                    label="Penalidade"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* Modificador de dados temporário */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Modificador de Dados (bônus/penalidade temporário):
              </Typography>
              <TextField
                type="number"
                value={tempDiceModifier}
                onChange={(e) =>
                  setTempDiceModifier(parseInt(e.target.value) || 0)
                }
                inputProps={{ min: -10, max: 10, step: 1 }}
                size="small"
                sx={{ width: 100 }}
                label="+/- dados"
              />
            </Box>

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <DiceRollResult
                  result={result}
                  showBreakdown
                  animate
                  requiredSuccesses={requiredSuccesses}
                />

                {/* Feedback de sucesso/falha */}
                {requiredSuccesses !== undefined && isSuccess !== undefined && (
                  <Alert
                    severity={isSuccess ? 'success' : 'error'}
                    icon={isSuccess ? <StarIcon /> : <CancelIcon />}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      {isSuccess ? (
                        <>
                          <strong>Sucesso!</strong> {result.netSuccesses}✶ ≥{' '}
                          {requiredSuccesses}✶ necessários
                        </>
                      ) : (
                        <>
                          <strong>Falha.</strong> {result.netSuccesses}✶ {'<'}{' '}
                          {requiredSuccesses}✶ necessários
                        </>
                      )}
                    </Typography>
                  </Alert>
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
            startIcon={<CasinoIcon />}
            disabled={disabled}
          >
            Rolar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SkillRollButton;
