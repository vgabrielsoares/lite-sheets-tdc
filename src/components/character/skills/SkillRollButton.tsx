/**
 * SkillRollButton - Botão de rolagem integrado com habilidades
 *
 * Permite rolar dados para testes de habilidade com configuração automática
 * baseada nos valores da habilidade (atributo, proficiência, modificadores).
 *
 * Funcionalidades:
 * - Rolagem rápida com um clique
 * - Pré-preenchimento automático de valores
 * - Feedback visual de sucesso/falha (se ND fornecido)
 * - Integração com histórico global de rolagens
 * - Suporte a vantagem/desvantagem
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
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { rollD20, globalDiceHistory } from '@/utils/diceRoller';
import type { DiceRollResult as RollResult } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';

export interface SkillRollButtonProps {
  /** Nome da habilidade (para contexto) */
  skillLabel: string;
  /** Número de dados (baseado no atributo-chave) */
  diceCount: number;
  /** Modificador total (proficiência + bônus + outros) */
  modifier: number;
  /** Nível de Dificuldade (opcional, para comparação) */
  nd?: number;
  /** Fórmula de rolagem (ex: "2d20+5") */
  formula?: string;
  /** Se deve usar menor resultado quando diceCount < 1 */
  takeLowest?: boolean;
  /** Callback quando rolar (opcional) */
  onRoll?: (result: RollResult) => void;
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
  diceCount,
  modifier,
  nd,
  formula,
  takeLowest = false,
  onRoll,
  size = 'small',
  color = 'primary',
  disabled = false,
  tooltipText,
}) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  /**
   * Abre o diálogo de rolagem
   */
  const handleOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar trigger de click na linha
    setOpen(true);
    setResult(null); // Limpar resultado anterior
  }, []);

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Executa a rolagem de dados
   */
  const handleRoll = useCallback(() => {
    // Executar rolagem simples (sem vantagem/desvantagem)
    const rollResult = rollD20(
      diceCount,
      modifier,
      'normal',
      `Teste de ${skillLabel}`
    );

    // Adicionar ao histórico global
    globalDiceHistory.add(rollResult);

    // Atualizar estado
    setResult(rollResult);

    // Callback externo
    if (onRoll) {
      onRoll(rollResult);
    }
  }, [diceCount, modifier, skillLabel, onRoll]);

  /**
   * Rolagem rápida (sem abrir diálogo)
   */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      // Executar rolagem normal diretamente
      const rollResult = rollD20(
        diceCount,
        modifier,
        'normal',
        `Teste de ${skillLabel}`
      );

      globalDiceHistory.add(rollResult);

      if (onRoll) {
        onRoll(rollResult);
      }

      // Mostrar resultado brevemente
      setResult(rollResult);
      setOpen(true);

      // Fechar automaticamente após 3 segundos
      setTimeout(() => {
        setOpen(false);
        setResult(null);
      }, 3000);
    },
    [diceCount, modifier, skillLabel, onRoll]
  );

  /**
   * Determina se a rolagem foi bem-sucedida
   */
  const isSuccess = result && nd ? result.finalResult >= nd : undefined;

  /**
   * Texto do tooltip
   */
  const tooltip =
    tooltipText ||
    (formula
      ? `Rolar ${formula}${nd ? ` (ND ${nd})` : ''}`
      : `Rolar teste de ${skillLabel}`);

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
        onClick={(e) => e.stopPropagation()} // Evitar propagação para linha
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CasinoIcon color="primary" />
            <Typography variant="h6">Teste de {skillLabel}</Typography>
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
                  label={`${diceCount}d20${modifier >= 0 ? '+' : ''}${modifier}`}
                  size="small"
                  color="primary"
                />
                {nd && (
                  <Chip label={`ND: ${nd}`} size="small" color="warning" />
                )}
                {takeLowest && diceCount >= 1 && (
                  <Chip
                    label="Atributo 0"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <DiceRollResult result={result} showBreakdown animate nd={nd} />

                {/* Feedback de sucesso/falha com ND */}
                {nd !== undefined && isSuccess !== undefined && (
                  <Alert
                    severity={isSuccess ? 'success' : 'error'}
                    icon={isSuccess ? <CheckCircleIcon /> : <CancelIcon />}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      {isSuccess ? (
                        <>
                          <strong>Sucesso!</strong> Resultado{' '}
                          {result.finalResult} ≥ ND {nd}
                        </>
                      ) : (
                        <>
                          <strong>Falha.</strong> Resultado {result.finalResult}{' '}
                          {'<'} ND {nd}
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
