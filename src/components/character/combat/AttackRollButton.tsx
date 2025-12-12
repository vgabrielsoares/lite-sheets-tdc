/**
 * AttackRollButton - Botão de rolagem de ataque integrado
 *
 * Permite rolar dados para ataques com configuração automática
 * baseada nos valores do ataque (habilidade, bônus de ataque).
 *
 * Funcionalidades:
 * - Rolagem rápida com um clique
 * - Pré-preenchimento automático de valores
 * - Comparação com Defesa do alvo
 * - Detecção de crítico (20 natural)
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
  TextField,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarsIcon from '@mui/icons-material/Stars';
import HistoryIcon from '@mui/icons-material/History';
import { rollD20, globalDiceHistory } from '@/utils/diceRoller';
import { calculateAttackRoll } from '@/utils/attackCalculations';
import type { DiceRollResult as RollResult } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { Character, AttributeName } from '@/types';
import type { SkillName } from '@/types/skills';

export interface AttackRollButtonProps {
  /** Nome do ataque (para contexto) */
  attackName: string;
  /** Bônus de ataque total (já calculado) */
  attackBonus: number;
  /** Dados do personagem (para acessar atributos/habilidades) */
  character: Character;
  /** Nome da habilidade usada no ataque (para calcular quantidade de dados) */
  attackSkill?: SkillName;
  /** ID do uso específico de habilidade (opcional) */
  attackSkillUseId?: string;
  /** Atributo alternativo para o ataque (opcional) */
  attackAttribute?: AttributeName;
  /** Modificador de dados adicional (ex: +1 = +1d20) */
  attackDiceModifier?: number;
  /** Defesa do alvo (opcional, para comparação) */
  targetDefense?: number;
  /** Callback quando rolar (opcional) */
  onRoll?: (result: RollResult, hit: boolean, critical: boolean) => void;
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
 * Botão de rolagem para ataques
 *
 * Exibe um botão de ícone que abre um diálogo de rolagem ao clicar.
 * A rolagem é pré-configurada com os valores do ataque.
 */
export const AttackRollButton: React.FC<AttackRollButtonProps> = ({
  attackName,
  attackBonus,
  character,
  attackSkill,
  attackSkillUseId,
  attackAttribute,
  attackDiceModifier = 0,
  targetDefense,
  onRoll,
  size = 'small',
  color = 'primary',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [defenseInput, setDefenseInput] = useState<string>(
    targetDefense?.toString() || ''
  );

  // Calcular f\u00f3rmula de ataque dinamicamente
  const attackRollCalc = useMemo(() => {
    if (attackSkill) {
      return calculateAttackRoll(
        character,
        attackSkill,
        attackSkillUseId,
        attackBonus,
        attackAttribute,
        attackDiceModifier
      );
    }
    return {
      diceCount: 1,
      modifier: attackBonus,
      formula: `1d20+${attackBonus}`,
      attribute: 'agilidade' as const,
      skillName: 'acerto' as const,
    };
  }, [
    character,
    attackSkill,
    attackSkillUseId,
    attackBonus,
    attackAttribute,
    attackDiceModifier,
  ]);

  /**
   * Abre o diálogo de rolagem
   */
  const handleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation(); // Evitar trigger de click na linha
      setOpen(true);
      setResult(null); // Limpar resultado anterior
      // Resetar defesa para valor padrão se fornecido
      if (targetDefense !== undefined) {
        setDefenseInput(targetDefense.toString());
      }
    },
    [targetDefense]
  );

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Executa a rolagem de ataque
   */
  const handleRoll = useCallback(() => {
    // Executar rolagem de ataque usando o cálculo dinâmico
    const rollResult = rollD20(
      attackRollCalc.diceCount,
      attackRollCalc.modifier,
      'normal',
      `Ataque: ${attackName}`
    );

    // Adicionar ao histórico global
    globalDiceHistory.add(rollResult);

    // Determinar se acertou
    const defense = defenseInput ? parseInt(defenseInput, 10) : undefined;
    const hit =
      defense !== undefined ? rollResult.finalResult >= defense : false;
    const critical = rollResult.isCritical || false;

    // Atualizar estado
    setResult(rollResult);

    // Callback externo
    if (onRoll) {
      onRoll(rollResult, hit, critical);
    }
  }, [attackRollCalc, attackName, defenseInput, onRoll]); /**
   * Rolagem rápida (sem abrir diálogo)
   */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      // Executar rolagem diretamente usando o cálculo dinâmico
      const rollResult = rollD20(
        attackRollCalc.diceCount,
        attackRollCalc.modifier,
        'normal',
        `Ataque: ${attackName}`
      );

      globalDiceHistory.add(rollResult);

      const defense = targetDefense;
      const hit =
        defense !== undefined ? rollResult.finalResult >= defense : false;
      const critical = rollResult.isCritical || false;

      if (onRoll) {
        onRoll(rollResult, hit, critical);
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
    [attackRollCalc, attackName, targetDefense, onRoll]
  );

  /**
   * Determina se o ataque acertou
   */
  const defense = defenseInput ? parseInt(defenseInput, 10) : undefined;
  const hit =
    result && defense !== undefined ? result.finalResult >= defense : undefined;
  const critical = result?.isCritical || false;

  /**
   * Texto do tooltip
   */
  const tooltip =
    tooltipText ||
    `Rolar ataque ${attackRollCalc.formula}${defense ? ` (vs Defesa ${defense})` : ''}`;

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
        onClick={(e) => e.stopPropagation()} // Evitar propagação para linha
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
                  // Scroll até o FAB e simular clique
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
                  label={`1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`}
                  size="small"
                  color="primary"
                />
              </Stack>
            </Box>

            {/* Campo de entrada da Defesa */}
            <TextField
              label="Defesa do Alvo"
              type="number"
              value={defenseInput}
              onChange={(e) => setDefenseInput(e.target.value)}
              size="small"
              fullWidth
              helperText="Digite a Defesa do alvo para verificar se acertou"
              InputProps={{
                inputProps: { min: 0 },
              }}
            />

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <DiceRollResult result={result} showBreakdown animate />

                {/* Indicador de crítico */}
                {critical && (
                  <Alert
                    severity="warning"
                    icon={<StarsIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                    }}
                  >
                    <Typography variant="body2">
                      <strong>CRÍTICO!</strong> 20 natural - Dobre os dados de
                      dano
                    </Typography>
                  </Alert>
                )}

                {/* Feedback de acerto/erro com Defesa */}
                {defense !== undefined && hit !== undefined && (
                  <Alert
                    severity={hit ? 'success' : 'error'}
                    icon={hit ? <CheckCircleIcon /> : <CancelIcon />}
                    sx={{ mt: critical ? 1 : 2 }}
                  >
                    <Typography variant="body2">
                      {hit ? (
                        <>
                          <strong>Acertou!</strong> Resultado{' '}
                          {result.finalResult} ≥ Defesa {defense}
                        </>
                      ) : (
                        <>
                          <strong>Errou.</strong> Resultado {result.finalResult}{' '}
                          {'<'} Defesa {defense}
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
