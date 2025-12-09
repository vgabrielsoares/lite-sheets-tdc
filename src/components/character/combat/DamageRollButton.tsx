/**
 * DamageRollButton - Botão de rolagem de dano integrado
 *
 * Permite rolar dados de dano com configuração automática
 * baseada nos valores do ataque.
 *
 * Funcionalidades:
 * - Rolagem rápida com um clique
 * - Pré-preenchimento automático de valores
 * - Cálculo automático de crítico (maximiza dados base, não dobra)
 * - Opção de forçar crítico manualmente
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
  FormControlLabel,
  Switch,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarsIcon from '@mui/icons-material/Stars';
import { rollDamageWithCritical, globalDiceHistory } from '@/utils/diceRoller';
import type { DiceRollResult as RollResult } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { DiceRoll, DamageType } from '@/types';

export interface DamageRollButtonProps {
  /** Nome do ataque (para contexto) */
  attackName: string;
  /** Configuração da rolagem de dano */
  damageRoll: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Se é um crítico (automático) */
  isCritical?: boolean;
  /** Dados extras de crítico verdadeiro */
  criticalDamage?: DiceRoll;
  /** Callback quando rolar (opcional) */
  onRoll?: (result: RollResult, damageType: DamageType) => void;
  /** Tamanho do botão */
  size?: 'small' | 'medium' | 'large';
  /** Cor do botão */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /** Se desabilitado */
  disabled?: boolean;
  /** Texto de tooltip customizado */
  tooltipText?: string;
}

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
 * Botão de rolagem para dano
 *
 * Exibe um botão de ícone que abre um diálogo de rolagem ao clicar.
 * A rolagem é pré-configurada com os valores do ataque.
 */
export const DamageRollButton: React.FC<DamageRollButtonProps> = ({
  attackName,
  damageRoll,
  damageType,
  isCritical: isCriticalProp = false,
  criticalDamage,
  onRoll,
  size = 'small',
  color = 'error',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [forceCritical, setForceCritical] = useState(isCriticalProp);
  const [forceTrueCritical, setForceTrueCritical] = useState(false);

  // Atualizar forceCritical quando isCriticalProp mudar
  React.useEffect(() => {
    setForceCritical(isCriticalProp);
  }, [isCriticalProp]);

  /**
   * Abre o diálogo de rolagem
   */
  const handleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation(); // Evitar trigger de click na linha
      setOpen(true);
      setResult(null); // Limpar resultado anterior
      setForceCritical(isCriticalProp); // Resetar crítico
    },
    [isCriticalProp]
  );

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Executa a rolagem de dano
   */
  const handleRoll = useCallback(() => {
    // Extrair dados da rolagem
    const diceCount = damageRoll.quantity;
    const diceSides = parseInt(damageRoll.type.replace('d', ''), 10);
    const modifier = damageRoll.modifier;

    // Executar rolagem de dano base (crítico maximiza)
    let rollResult = rollDamageWithCritical(
      diceCount,
      diceSides,
      modifier,
      forceCritical,
      `Dano (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`
    );

    // Se crítico verdadeiro, adicionar dados extras
    if (forceCritical && forceTrueCritical && criticalDamage) {
      const extraDiceCount = criticalDamage.quantity;
      const extraDiceSides = parseInt(criticalDamage.type.replace('d', ''), 10);

      // Rolar dados extras (ROLADOS, não maximizados)
      const extraRolls = Array.from(
        { length: extraDiceCount },
        () => Math.floor(Math.random() * extraDiceSides) + 1
      );
      const extraDamage = extraRolls.reduce((sum, roll) => sum + roll, 0);

      // Combinar com dano base
      rollResult = {
        ...rollResult,
        formula: `${rollResult.formula} + ${extraDiceCount}d${extraDiceSides} (Crítico Verdadeiro)`,
        rolls: [...rollResult.rolls, ...extraRolls],
        baseResult: rollResult.baseResult + extraDamage,
        finalResult: rollResult.finalResult + extraDamage,
        context: `Dano Crítico Verdadeiro (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`,
      };
    }

    // Adicionar ao histórico global
    globalDiceHistory.add(rollResult);

    // Atualizar estado
    setResult(rollResult);

    // Callback externo
    if (onRoll) {
      onRoll(rollResult, damageType);
    }
  }, [
    damageRoll,
    forceCritical,
    forceTrueCritical,
    criticalDamage,
    attackName,
    damageType,
    onRoll,
  ]);

  /**
   * Rolagem rápida (sem abrir diálogo)
   */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      const diceCount = damageRoll.quantity;
      const diceSides = parseInt(damageRoll.type.replace('d', ''), 10);
      const modifier = damageRoll.modifier;

      // Executar rolagem diretamente (com crítico se fornecido)
      const rollResult = rollDamageWithCritical(
        diceCount,
        diceSides,
        modifier,
        isCriticalProp,
        `Dano (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`
      );

      globalDiceHistory.add(rollResult);

      if (onRoll) {
        onRoll(rollResult, damageType);
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
    [damageRoll, isCriticalProp, attackName, damageType, onRoll]
  );

  /**
   * Formata a rolagem de dano para exibição
   */
  const formatDamageFormula = useCallback(
    (critical: boolean = false) => {
      if (critical) {
        // Crítico: mostra valor maximizado
        const maxDamage =
          damageRoll.quantity * parseInt(damageRoll.type.replace('d', ''));
        const mod = damageRoll.modifier;
        return `${damageRoll.quantity}${damageRoll.type} MAX (${maxDamage})${mod >= 0 ? '+' : ''}${mod}`;
      }
      // Normal: mostra fórmula normal
      const mod = damageRoll.modifier;
      return `${damageRoll.quantity}${damageRoll.type}${mod >= 0 ? '+' : ''}${mod}`;
    },
    [damageRoll]
  );

  /**
   * Texto do tooltip
   */
  const tooltip =
    tooltipText ||
    `Rolar dano ${formatDamageFormula(isCriticalProp)} (${DAMAGE_TYPE_LABELS[damageType]})`;

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
            aria-label={`Rolar dano de ${attackName}`}
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <FlashOnIcon />
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
            <FlashOnIcon color="error" />
            <Typography variant="h6">Dano: {attackName}</Typography>
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
                  label={formatDamageFormula(forceCritical)}
                  size="small"
                  color="error"
                />
                <Chip
                  label={DAMAGE_TYPE_LABELS[damageType]}
                  size="small"
                  variant="outlined"
                />
                {forceCritical && (
                  <Chip
                    label="CRÍTICO"
                    size="small"
                    color="warning"
                    icon={<StarsIcon />}
                  />
                )}
              </Stack>
            </Box>

            {/* Toggle de crítico */}
            <FormControlLabel
              control={
                <Switch
                  checked={forceCritical}
                  onChange={(e) => setForceCritical(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="body2">
                  Acerto Crítico (maximiza dano base)
                </Typography>
              }
            />

            {/* Toggle de crítico verdadeiro (apenas se crítico estiver ativo E houver dados extras) */}
            {forceCritical && criticalDamage && criticalDamage.quantity > 0 && (
              <FormControlLabel
                control={
                  <Switch
                    checked={forceTrueCritical}
                    onChange={(e) => setForceTrueCritical(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Typography variant="body2">
                    Crítico Verdadeiro (+{criticalDamage.quantity}
                    {criticalDamage.type} extras rolados)
                  </Typography>
                }
              />
            )}

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <DiceRollResult result={result} showBreakdown animate />

                {/* Explicação de crítico */}
                {forceCritical && (
                  <Alert
                    severity="warning"
                    icon={<StarsIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Dano Crítico:</strong> Dados MAXIMIZADOS (
                      {damageRoll.quantity} × d
                      {damageRoll.type.replace('d', '')} ={' '}
                      {damageRoll.quantity *
                        parseInt(damageRoll.type.replace('d', ''))}
                      ), modificador mantido (+{damageRoll.modifier})
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
            startIcon={<FlashOnIcon />}
            disabled={disabled}
            color="error"
          >
            Rolar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DamageRollButton;
