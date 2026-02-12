/**
 * CombinedAttackButton - Botão de rolagem combinada (Ataque + Dano)
 *
 * Fluxo de 2 passos:
 * 1. Rola pool de dados para ataque (contagem de ✶)
 * 2. Jogador escolhe tipo de resultado (Raspão/Normal/Em Cheio/Crítico)
 *    baseado nas ✶ restantes após defesa do alvo
 * 3. Dano é calculado conforme o tipo de resultado escolhido
 *
 * Regras de dano por tipo de resultado:
 * - Raspão (0✶): Dados sem modificadores ÷ 2 (mín 1)
 * - Normal (1✶): Dados + modificadores
 * - Em Cheio (2✶): Dano maximizado (sem rolar)
 * - Crítico (3+✶): Dano maximizado + dados de dano crítico extras
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
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import HistoryIcon from '@mui/icons-material/History';
import ShieldIcon from '@mui/icons-material/Shield';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarsIcon from '@mui/icons-material/Stars';
import {
  rollDicePool,
  rollWithPenalty,
  rollDamageByHitType,
  globalDiceHistory,
} from '@/utils/diceRoller';
import type { AttackDamageResult } from '@/utils/diceRoller';
import {
  calculateAttackPool,
  type AttackPoolCalculation,
} from '@/utils/attackCalculations';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type {
  DiceRoll,
  DamageType,
  DicePoolResult,
  Character,
  AttributeName,
} from '@/types';
import { formatDiceNotation } from '@/utils/diceRoller';
import type { SkillName } from '@/types/skills';
import type { AttackHitType } from '@/types/combat';
import {
  ATTACK_HIT_TYPE_LABELS,
  ATTACK_HIT_TYPE_DESCRIPTIONS,
  ATTACK_HIT_TYPE_COLORS,
  suggestHitType,
} from '@/types/combat';

export interface CombinedAttackButtonProps {
  /** Nome do ataque (para contexto) */
  attackName: string;
  /** Configuração da rolagem de dano */
  damageRoll: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Número de dados extras de dano crítico (mesmo tipo do dado base). Default: 1 */
  criticalDice?: number;
  /** Dados de dano bônus opcionais */
  bonusDice?: DiceRoll;
  /** Dados do personagem (para acessar atributos/habilidades) */
  character: Character;
  /** Nome da habilidade usada no ataque */
  attackSkill?: SkillName;
  /** ID do uso específico de habilidade (opcional) */
  attackSkillUseId?: string;
  /** Atributo alternativo para o ataque (opcional) */
  attackAttribute?: AttributeName;
  /** Modificador de dados adicional (+Xd / -Xd) */
  attackDiceModifier?: number;
  /** Callback quando rolar (opcional) */
  onRoll?: (
    attackResult: DicePoolResult,
    damageResult: AttackDamageResult
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
 * Retorna cor e label baseado na quantidade de ✶ brutos (antes da defesa)
 */
function getSuccessDisplay(netSuccesses: number): {
  color: 'error' | 'warning' | 'success' | 'info';
  label: string;
} {
  if (netSuccesses === 0) return { color: 'error', label: '0✶' };
  if (netSuccesses === 1) return { color: 'warning', label: '1✶' };
  if (netSuccesses === 2) return { color: 'success', label: '2✶' };
  return { color: 'info', label: `${netSuccesses}✶` };
}

/**
 * Botão de rolagem combinada para ataque + dano (v0.2)
 *
 * Fluxo de 2 passos:
 * 1. Rola pool de ataque → mostra ✶
 * 2. Jogador seleciona resultado (Raspão/Normal/Em Cheio/Crítico) → calcula dano
 */
export const CombinedAttackButton: React.FC<CombinedAttackButtonProps> = ({
  attackName,
  damageRoll,
  damageType,
  criticalDice = 1,
  bonusDice,
  character,
  attackSkill,
  attackSkillUseId,
  attackAttribute,
  attackDiceModifier = 0,
  onRoll,
  size = 'small',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [attackResult, setAttackResult] = useState<DicePoolResult | null>(null);
  const [selectedHitType, setSelectedHitType] =
    useState<AttackHitType>('normal');
  const [damageResult, setDamageResult] = useState<AttackDamageResult | null>(
    null
  );

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
    setAttackResult(null);
    setDamageResult(null);
    setSelectedHitType('normal');
  }, []);

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Passo 1: Rola o pool de ataque
   */
  const handleRollAttack = useCallback(() => {
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
    setAttackResult(poolResult);

    // Sugerir tipo de resultado baseado nas ✶
    const suggested = suggestHitType(poolResult.netSuccesses);
    setSelectedHitType(suggested);

    // Limpar dano anterior
    setDamageResult(null);
  }, [attackPoolCalc, attackName]);

  /**
   * Passo 2: Calcula dano baseado no tipo de resultado selecionado
   */
  const handleCalculateDamage = useCallback(() => {
    const result = rollDamageByHitType(
      damageRoll,
      selectedHitType,
      criticalDice,
      bonusDice,
      `${DAMAGE_TYPE_LABELS[damageType]}: ${attackName}`
    );

    // Adicionar ao histórico
    globalDiceHistory.add(result.baseDamage);
    if (result.bonusDamage) {
      globalDiceHistory.add(result.bonusDamage);
    }
    if (result.criticalExtraDamage) {
      globalDiceHistory.add(result.criticalExtraDamage);
    }

    setDamageResult(result);

    // Callback externo
    if (onRoll && attackResult) {
      onRoll(attackResult, result);
    }
  }, [
    damageRoll,
    damageType,
    criticalDice,
    bonusDice,
    selectedHitType,
    attackName,
    attackResult,
    onRoll,
  ]);

  // Informação de sucesso do ataque
  const successDisplay = attackResult
    ? getSuccessDisplay(attackResult.netSuccesses)
    : null;

  /**
   * Texto do tooltip
   */
  const damageFormula = `${damageRoll.quantity}${damageRoll.type}${damageRoll.modifier >= 0 ? '+' : ''}${damageRoll.modifier}`;
  const tooltip =
    tooltipText ||
    `Rolar ataque completo (${attackPoolCalc.formula} → ${damageFormula})`;

  return (
    <>
      {/* Botão de rolagem */}
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={handleOpen}
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
              <Typography variant="h6">Ataque: {attackName}</Typography>
            </Stack>
            <Tooltip title="Ver histórico de rolagens">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const fab = document.querySelector(
                    '[aria-label="Abrir histórico de rolagens"]'
                  ) as HTMLElement;
                  if (fab) fab.click();
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
                  label={`Ataque: ${attackPoolCalc.formula}`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`Dano: ${damageFormula}`}
                  size="small"
                  color="error"
                />
                <Chip
                  label={DAMAGE_TYPE_LABELS[damageType]}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Crítico: +${criticalDice}d`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                {bonusDice && (
                  <Chip
                    label={`Bônus: ${formatDiceNotation(bonusDice)}`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* ═══════════════════════════════════════════════ */}
            {/* PASSO 1: Resultado do pool de ataque */}
            {/* ═══════════════════════════════════════════════ */}
            {attackResult && (
              <>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Pool de Ataque
                  </Typography>
                  <DiceRollResult result={attackResult} showBreakdown animate />

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
                        {attackResult.netSuccesses}✶
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {attackResult.successes} sucessos
                        {attackResult.cancellations > 0 &&
                          ` − ${attackResult.cancellations} cancelamentos`}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* ═══════════════════════════════════════════════ */}
                {/* PASSO 2: Seleção do tipo de resultado */}
                {/* ═══════════════════════════════════════════════ */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <ShieldIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2">
                      Resultado após defesa
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Selecione o tipo de resultado baseado nas ✶ restantes após a
                    defesa do alvo:
                  </Typography>

                  <ToggleButtonGroup
                    value={selectedHitType}
                    exclusive
                    onChange={(_e, value) => {
                      if (value !== null) {
                        setSelectedHitType(value);
                        setDamageResult(null);
                      }
                    }}
                    aria-label="Tipo de resultado do ataque"
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    {(
                      [
                        'raspao',
                        'normal',
                        'em-cheio',
                        'critico',
                      ] as AttackHitType[]
                    ).map((ht) => (
                      <ToggleButton
                        key={ht}
                        value={ht}
                        sx={{
                          px: 1,
                          py: 1,
                          flexDirection: 'column',
                          gap: 0.5,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          ...(ht === selectedHitType && {
                            borderColor: `${ATTACK_HIT_TYPE_COLORS[ht]}.main`,
                          }),
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={ht === selectedHitType ? 700 : 400}
                        >
                          {ATTACK_HIT_TYPE_LABELS[ht]}
                        </Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  {/* Descrição do tipo selecionado */}
                  <Alert
                    severity={
                      selectedHitType === 'raspao'
                        ? 'warning'
                        : selectedHitType === 'critico'
                          ? 'error'
                          : selectedHitType === 'em-cheio'
                            ? 'success'
                            : 'info'
                    }
                    icon={
                      selectedHitType === 'critico' ? (
                        <StarsIcon />
                      ) : selectedHitType === 'em-cheio' ? (
                        <FlashOnIcon />
                      ) : undefined
                    }
                    sx={{ mt: 1 }}
                  >
                    <Typography variant="body2">
                      {ATTACK_HIT_TYPE_DESCRIPTIONS[selectedHitType]}
                    </Typography>
                  </Alert>
                </Box>

                {/* ═══════════════════════════════════════════════ */}
                {/* RESULTADO DO DANO */}
                {/* ═══════════════════════════════════════════════ */}
                {damageResult && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Dano ({DAMAGE_TYPE_LABELS[damageType]})
                      </Typography>

                      {/* Dano base */}
                      <DiceRollResult
                        result={damageResult.baseDamage}
                        showBreakdown
                        animate
                      />

                      {/* Dano bônus */}
                      {damageResult.bonusDamage && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            color="info.main"
                            fontWeight="bold"
                            display="block"
                            gutterBottom
                          >
                            + Dano Bônus
                          </Typography>
                          <DiceRollResult
                            result={damageResult.bonusDamage}
                            showBreakdown
                            animate
                          />
                        </Box>
                      )}

                      {/* Dano crítico extra */}
                      {damageResult.criticalExtraDamage && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            color="warning.main"
                            fontWeight="bold"
                            display="block"
                            gutterBottom
                          >
                            + Dano Crítico Extra
                          </Typography>
                          <DiceRollResult
                            result={damageResult.criticalExtraDamage}
                            showBreakdown
                            animate
                          />
                        </Box>
                      )}

                      {/* Total */}
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          border: 1,
                          borderColor: alpha(theme.palette.error.main, 0.3),
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="error.main"
                        >
                          {damageResult.totalDamage}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {damageResult.description}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Fechar
          </Button>

          {/* Passo 1: Rolar ataque */}
          {!attackResult && (
            <Button
              onClick={handleRollAttack}
              variant="contained"
              startIcon={<AutoModeIcon />}
              disabled={disabled}
              color="primary"
            >
              Rolar Ataque ({attackPoolCalc.formula})
            </Button>
          )}

          {/* Passo 2: Calcular dano baseado no tipo selecionado */}
          {attackResult && !damageResult && (
            <Button
              onClick={handleCalculateDamage}
              variant="contained"
              startIcon={<FlashOnIcon />}
              color="error"
            >
              Calcular Dano (
              {ATTACK_HIT_TYPE_LABELS[selectedHitType].split(' (')[0]})
            </Button>
          )}

          {/* Após resultado: Re-rolar ataque */}
          {attackResult && damageResult && (
            <Button
              onClick={() => {
                setAttackResult(null);
                setDamageResult(null);
                setSelectedHitType('normal');
              }}
              variant="outlined"
              startIcon={<AutoModeIcon />}
              color="primary"
            >
              Rolar Novamente
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CombinedAttackButton;
