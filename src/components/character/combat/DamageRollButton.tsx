/**
 * DamageRollButton - Botão de rolagem de dano integrado
 *
 * Permite rolar dados de dano com seleção de tipo de resultado:
 * - Raspão (0✶): Dados sem modificadores ÷ 2 (mín 1)
 * - Normal (1✶): Dados + modificadores
 * - Em Cheio (2✶): Dano maximizado (sem rolar)
 * - Crítico (3+✶): Dano maximizado + dados de dano crítico extras
 *
 * Funcionalidades:
 * - Seleção do tipo de resultado via ToggleButtonGroup
 * - Cálculo automático de dano por tipo
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
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarsIcon from '@mui/icons-material/Stars';
import HistoryIcon from '@mui/icons-material/History';
import {
  rollDamageByHitType,
  globalDiceHistory,
  formatDiceNotation,
} from '@/utils/diceRoller';
import type { AttackDamageResult } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { DiceRoll, DamageType } from '@/types';
import type { AttackHitType } from '@/types/combat';
import {
  ATTACK_HIT_TYPE_LABELS,
  ATTACK_HIT_TYPE_DESCRIPTIONS,
  ATTACK_HIT_TYPE_COLORS,
} from '@/types/combat';

export interface DamageRollButtonProps {
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
  /** Callback quando rolar (opcional) */
  onRoll?: (result: AttackDamageResult, damageType: DamageType) => void;
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
  qualquer: 'Qualquer',
};

/**
 * Botão de rolagem para dano
 *
 * Exibe um botão de ícone que abre um diálogo onde o jogador
 * seleciona o tipo de resultado (Raspão/Normal/Em Cheio/Crítico)
 * e calcula o dano correspondente.
 */
export const DamageRollButton: React.FC<DamageRollButtonProps> = ({
  attackName,
  damageRoll,
  damageType,
  criticalDice = 1,
  bonusDice,
  onRoll,
  size = 'small',
  color = 'error',
  disabled = false,
  tooltipText,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<AttackDamageResult | null>(null);
  const [selectedHitType, setSelectedHitType] =
    useState<AttackHitType>('normal');

  /**
   * Abre o diálogo de rolagem
   */
  const handleOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(true);
    setResult(null);
    setSelectedHitType('normal');
  }, []);

  /**
   * Fecha o diálogo
   */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Executa a rolagem de dano com o tipo de resultado selecionado
   */
  const handleRoll = useCallback(() => {
    const damageResult = rollDamageByHitType(
      damageRoll,
      selectedHitType,
      criticalDice,
      bonusDice,
      `Dano (${DAMAGE_TYPE_LABELS[damageType]}): ${attackName}`
    );

    // Adicionar ao histórico global
    globalDiceHistory.add(damageResult.baseDamage);
    if (damageResult.bonusDamage) {
      globalDiceHistory.add(damageResult.bonusDamage);
    }
    if (damageResult.criticalExtraDamage) {
      globalDiceHistory.add(damageResult.criticalExtraDamage);
    }

    setResult(damageResult);

    if (onRoll) {
      onRoll(damageResult, damageType);
    }
  }, [
    damageRoll,
    criticalDice,
    bonusDice,
    selectedHitType,
    attackName,
    damageType,
    onRoll,
  ]);

  /**
   * Formata a rolagem de dano para exibição
   */
  const formatDamageFormula = useCallback(() => {
    const mod = damageRoll.modifier;
    return `${damageRoll.quantity}${damageRoll.type}${mod >= 0 ? '+' : ''}${mod}`;
  }, [damageRoll]);

  /**
   * Texto do tooltip
   */
  const tooltip =
    tooltipText ||
    `Rolar dano ${formatDamageFormula()} (${DAMAGE_TYPE_LABELS[damageType]})`;

  return (
    <>
      {/* Botão de rolagem */}
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={handleOpen}
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
              <FlashOnIcon color="error" />
              <Typography variant="h6">Dano: {attackName}</Typography>
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
                  label={formatDamageFormula()}
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

            {/* Seleção do tipo de resultado */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de Resultado
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Selecione o tipo baseado nas ✶ restantes após a defesa:
              </Typography>
              <ToggleButtonGroup
                value={selectedHitType}
                exclusive
                onChange={(_e, value) => {
                  if (value !== null) {
                    setSelectedHitType(value);
                    setResult(null);
                  }
                }}
                aria-label="Tipo de resultado do dano"
                fullWidth
                size="small"
              >
                {(
                  ['raspao', 'normal', 'em-cheio', 'critico'] as AttackHitType[]
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

            {/* Resultado da rolagem */}
            {result && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Resultado
                </Typography>

                {/* Dano base */}
                <DiceRollResult
                  result={result.baseDamage}
                  showBreakdown
                  animate
                />

                {/* Dano bônus */}
                {result.bonusDamage && (
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
                      result={result.bonusDamage}
                      showBreakdown
                      animate
                    />
                  </Box>
                )}

                {/* Dano crítico extra */}
                {result.criticalExtraDamage && (
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
                      result={result.criticalExtraDamage}
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
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {result.totalDamage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.description}
                  </Typography>
                </Box>
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
            {result ? 'Rolar Novamente' : 'Rolar Dano'} (
            {ATTACK_HIT_TYPE_LABELS[selectedHitType].split(' (')[0]})
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DamageRollButton;
