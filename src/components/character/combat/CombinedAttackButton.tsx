/**
 * CombinedAttackButton - Botão de rolagem combinada (Ataque + Dano)
 *
 * Permite rolar ataque e dano com um único clique,
 * automaticamente rolando dano apenas se o ataque acertar.
 *
 * Funcionalidades:
 * - Rolagem sequencial (ataque primeiro, depois dano se acertar)
 * - Detecção automática de crítico
 * - Cálculo automático de dano crítico
 * - Comparação com Defesa do alvo
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
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarsIcon from '@mui/icons-material/Stars';
import HistoryIcon from '@mui/icons-material/History';
import {
  rollD20,
  rollDamageWithCritical,
  globalDiceHistory,
  legacyRollToHistoryEntry,
} from '@/utils/diceRoller';
import { calculateAttackRoll } from '@/utils/attackCalculations';
import type {
  DiceRollResult as RollResult,
  DamageDiceRollResult,
} from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { DiceRoll, DamageType, Character, AttributeName } from '@/types';
import type { SkillName } from '@/types/skills';

export interface CombinedAttackButtonProps {
  /** Nome do ataque (para contexto) */
  attackName: string;
  /** Bônus de ataque total */
  attackBonus: number;
  /** Configuração da rolagem de dano */
  damageRoll: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Margem de crítico (ex: 20, 19, 18) */
  criticalRange: number;
  /** Dados extras de crítico verdadeiro */
  criticalDamage: DiceRoll;
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
  /** Defesa do alvo (opcional) */
  targetDefense?: number;
  /** Callback quando rolar (opcional) */
  onRoll?: (
    attackResult: RollResult,
    damageResult: DamageDiceRollResult | null,
    hit: boolean,
    critical: boolean
  ) => void;
  /** Tamanho do botão */
  size?: 'small' | 'medium' | 'large';
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
 * Botão de rolagem combinada para ataque + dano
 *
 * Exibe um botão que rola ataque e, se acertar, rola dano automaticamente.
 * Críticos são detectados e aplicados ao dano.
 */
export const CombinedAttackButton: React.FC<CombinedAttackButtonProps> = ({
  attackName,
  attackBonus,
  damageRoll,
  damageType,
  criticalRange,
  criticalDamage,
  character,
  attackSkill,
  attackSkillUseId,
  attackAttribute,
  attackDiceModifier = 0,
  targetDefense,
  onRoll,
  size = 'small',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [attackResult, setAttackResult] = useState<RollResult | null>(null);
  const [damageResult, setDamageResult] = useState<DamageDiceRollResult | null>(
    null
  );
  const [defenseInput, setDefenseInput] = useState<string>(
    targetDefense?.toString() || ''
  );

  // Calcular fórmula de ataque dinamicamente
  const attackFormula = useMemo(() => {
    if (attackSkill) {
      const calc = calculateAttackRoll(
        character,
        attackSkill,
        attackSkillUseId,
        attackBonus,
        attackAttribute,
        attackDiceModifier
      );
      return calc.formula;
    }
    return `1d20+${attackBonus}`;
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
      event.stopPropagation();
      setOpen(true);
      setAttackResult(null);
      setDamageResult(null);
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
   * Executa a rolagem combinada (ataque + dano)
   */
  const handleRoll = useCallback(() => {
    // Calcular quantidade de dados e modificador baseado na habilidade/uso
    const attackRollCalc = attackSkill
      ? calculateAttackRoll(
          character,
          attackSkill,
          attackSkillUseId,
          attackBonus,
          attackAttribute,
          attackDiceModifier
        )
      : { diceCount: 1, modifier: attackBonus, formula: `1d20+${attackBonus}` };

    // 1. Rolar ataque
    const attackRollResult = rollD20(
      attackRollCalc.diceCount,
      attackRollCalc.modifier,
      'normal',
      `Ataque: ${attackName}`
    );
    globalDiceHistory.add(legacyRollToHistoryEntry(attackRollResult));
    setAttackResult(attackRollResult);

    // 2. Verificar resultado do ataque
    const defense = defenseInput ? parseInt(defenseInput, 10) : undefined;
    const attackRoll = attackRollResult.finalResult;

    // Determinar tipo de resultado
    const isGraze = defense !== undefined && attackRoll === defense; // Raspão: igual à Defesa
    const hit = defense !== undefined ? attackRoll > defense : false; // Acerto: maior que Defesa
    const critical = attackRollResult.isCritical || false;

    let damageRollResult: DamageDiceRollResult | null = null;

    // 3. Rolar dano se acertou ou raspão (ou se não há defesa definida)
    if (hit || isGraze || defense === undefined) {
      const diceCount = damageRoll.quantity;
      const diceSides = parseInt(damageRoll.type.replace('d', ''), 10);
      const modifier = damageRoll.modifier;

      if (isGraze) {
        // Ataque de Raspão: dados maximizados / 2, SEM modificador
        const maxDamage = diceCount * diceSides;
        const grazeDamage = Math.max(1, Math.floor(maxDamage / 2));

        damageRollResult = {
          formula: `Raspão: ${diceCount}d${diceSides} ÷ 2 (sem mod)`,
          rolls: Array(diceCount).fill(diceSides),
          diceType: diceSides,
          diceCount,
          modifier: 0, // Raspão não usa modificador
          baseResult: grazeDamage,
          finalResult: grazeDamage,
          timestamp: new Date(),
          context: `Dano de Raspão (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`,
          isDamageRoll: true,
        };
      } else {
        // Acerto normal ou crítico
        damageRollResult = rollDamageWithCritical(
          diceCount,
          diceSides,
          modifier,
          critical,
          `Dano (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`
        );
      }

      globalDiceHistory.add(damageRollResult);
      setDamageResult(damageRollResult);
    } else {
      setDamageResult(null); // Limpar dano anterior se errou
    }

    // Callback externo
    if (onRoll) {
      onRoll(attackRollResult, damageRollResult, hit || isGraze, critical);
    }
  }, [
    attackBonus,
    attackName,
    defenseInput,
    damageRoll,
    damageType,
    onRoll,
    attackSkill,
    attackSkillUseId,
    attackAttribute,
    attackDiceModifier,
    character,
    criticalRange,
    criticalDamage,
  ]);

  /**
   * Rolagem rápida (sem abrir diálogo)
   */
  const handleQuickRoll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      // Calcular quantidade de dados e modificador baseado na habilidade/uso
      const attackRollCalc = attackSkill
        ? calculateAttackRoll(
            character,
            attackSkill,
            attackSkillUseId,
            attackBonus,
            attackAttribute,
            attackDiceModifier
          )
        : {
            diceCount: 1,
            modifier: attackBonus,
            formula: `1d20+${attackBonus}`,
          };

      // 1. Rolar ataque
      const attackRollResult = rollD20(
        attackRollCalc.diceCount,
        attackRollCalc.modifier,
        'normal',
        `Ataque: ${attackName}`
      );
      globalDiceHistory.add(legacyRollToHistoryEntry(attackRollResult));

      // 2. Verificar resultado do ataque
      const defense = targetDefense;
      const attackRoll = attackRollResult.finalResult;

      const isGraze = defense !== undefined && attackRoll === defense;
      const hit = defense !== undefined ? attackRoll > defense : false;
      const critical = attackRollResult.isCritical || false;

      let damageRollResult: DamageDiceRollResult | null = null;

      // 3. Rolar dano se acertou, raspão ou sem defesa
      if (hit || isGraze || defense === undefined) {
        const diceCount = damageRoll.quantity;
        const diceSides = parseInt(damageRoll.type.replace('d', ''), 10);
        const modifier = damageRoll.modifier;

        if (isGraze) {
          // Ataque de Raspão
          const maxDamage = diceCount * diceSides;
          const grazeDamage = Math.max(1, Math.floor(maxDamage / 2));

          damageRollResult = {
            formula: `Raspão: ${diceCount}d${diceSides} ÷ 2 (sem mod)`,
            rolls: Array(diceCount).fill(diceSides),
            diceType: diceSides,
            diceCount,
            modifier: 0,
            baseResult: grazeDamage,
            finalResult: grazeDamage,
            timestamp: new Date(),
            context: `Dano de Raspão (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`,
            isDamageRoll: true,
          };
        } else {
          damageRollResult = rollDamageWithCritical(
            diceCount,
            diceSides,
            modifier,
            critical,
            `Dano (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`
          );
        }

        globalDiceHistory.add(damageRollResult);
      }

      if (onRoll) {
        onRoll(attackRollResult, damageRollResult, hit || isGraze, critical);
      }

      // Mostrar resultado brevemente
      setAttackResult(attackRollResult);
      setDamageResult(damageRollResult);
      setOpen(true);

      // Fechar automaticamente após 4 segundos
      setTimeout(() => {
        setOpen(false);
        setAttackResult(null);
        setDamageResult(null);
      }, 4000);
    },
    [attackBonus, attackName, targetDefense, damageRoll, damageType, onRoll]
  );

  /**
   * Determina se o ataque acertou
   */
  const defense = defenseInput ? parseInt(defenseInput, 10) : undefined;
  const attackRoll = attackResult?.finalResult;
  const isGraze =
    attackResult && defense !== undefined && attackRoll === defense;
  const hit =
    attackResult && defense !== undefined ? attackRoll! > defense : undefined;
  const critical = attackResult?.isCritical || false;

  /**
   * Texto do tooltip
   */
  const tooltip =
    tooltipText ||
    `Rolar ataque completo (1d20+${attackBonus} → dano)${defense ? ` vs Defesa ${defense}` : ''}`;

  return (
    <>
      {/* Botão de rolagem */}
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={handleOpen}
            onDoubleClick={handleQuickRoll}
            size={size}
            color="secondary"
            disabled={disabled}
            aria-label={`Rolar ataque completo de ${attackName}`}
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <AutoModeIcon />
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
              <AutoModeIcon color="primary" />
              <Typography variant="h6">
                Ataque Completo: {attackName}
              </Typography>
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
                  label={`Ataque: ${attackFormula}`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`Dano: ${damageRoll.quantity}${damageRoll.type}+${damageRoll.modifier}`}
                  size="small"
                  color="error"
                />
                <Chip
                  label={DAMAGE_TYPE_LABELS[damageType]}
                  size="small"
                  variant="outlined"
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

            {/* Resultado do ataque */}
            {attackResult && (
              <>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Rolagem de Ataque
                  </Typography>
                  <DiceRollResult
                    result={legacyRollToHistoryEntry(attackResult)}
                    showBreakdown
                    animate
                  />

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
                        <strong>CRÍTICO!</strong> 20 natural - Dano será
                        MAXIMIZADO
                      </Typography>
                    </Alert>
                  )}

                  {/* Feedback de acerto/erro/raspão */}
                  {defense !== undefined && (hit !== undefined || isGraze) && (
                    <Alert
                      severity={isGraze ? 'info' : hit ? 'success' : 'error'}
                      icon={
                        isGraze ? (
                          <StarsIcon />
                        ) : hit ? (
                          <CheckCircleIcon />
                        ) : (
                          <CancelIcon />
                        )
                      }
                      sx={{ mt: critical ? 1 : 2 }}
                    >
                      <Typography variant="body2">
                        {isGraze ? (
                          <>
                            <strong>Ataque de Raspão!</strong>{' '}
                            {attackResult.finalResult} = Defesa {defense} → Dano
                            reduzido (dados ÷ 2, sem modificador)
                          </>
                        ) : hit ? (
                          <>
                            <strong>Acertou!</strong> {attackResult.finalResult}{' '}
                            {'>'} Defesa {defense}
                          </>
                        ) : (
                          <>
                            <strong>Errou.</strong> {attackResult.finalResult}{' '}
                            {'<'} Defesa {defense}
                          </>
                        )}
                      </Typography>
                    </Alert>
                  )}
                </Box>

                {/* Divider entre ataque e dano */}
                {damageResult && <Divider />}

                {/* Resultado do dano */}
                {damageResult && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Rolagem de Dano ({DAMAGE_TYPE_LABELS[damageType]})
                    </Typography>
                    <DiceRollResult
                      result={damageResult}
                      showBreakdown
                      animate
                    />

                    {critical && (
                      <Alert
                        severity="info"
                        sx={{
                          mt: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        <Typography variant="body2">
                          Dano crítico: {damageRoll.quantity} ×{' '}
                          {damageRoll.type} MAXIMIZADO ={' '}
                          {damageRoll.quantity *
                            parseInt(damageRoll.type.replace('d', ''))}
                          (+ modificador {damageRoll.modifier} mantido)
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Mensagem se errou (sem dano) - NÃO mostrar para raspão */}
                {hit === false && !isGraze && defense !== undefined && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      O ataque errou. Dano não foi rolado.
                    </Typography>
                  </Alert>
                )}
              </>
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
            startIcon={<AutoModeIcon />}
            disabled={disabled}
            color="secondary"
          >
            Rolar Ataque Completo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CombinedAttackButton;
