/**
 * GuardVitalityDisplay - Exibição combinada de Guarda (GA) e Vitalidade (PV)
 *
 * Sistema v0.0.2:
 * - GA (Guarda): Base 15 + bônus de arquétipo por nível. Ícone: Escudo. Cor: primary/dourado.
 * - PV (Vitalidade): floor(GA_max / 3). Ícone: Coração. Cor: error/vermelho.
 * - Dano aplicado à GA primeiro; overflow vai para PV.
 * - GA = 0 → GA_max reduzida pela metade enquanto PV ≤ 1.
 * - PV = 0 → Ferimento Crítico.
 * - Recuperação de PV: 5 pontos de recuperação = 1 PV.
 * - Botões "Sofrer" e "Recuperar" com input numérico (não mais +/-).
 *
 * Indicações Visuais:
 * - Ferimento Direto: PV < PV_max mas PV > 0
 * - Ferimento Crítico: PV = 0
 * - Avariado: GA_current ≤ GA_max / 2
 */
'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WarningIcon from '@mui/icons-material/Warning';
import type { GuardPoints, VitalityPoints } from '@/types/combat';
import { PV_RECOVERY_COST } from '@/types/combat';
import {
  applyDamageToGuardVitality,
  healGuard,
  healVitality,
  getEffectiveGAMax,
  determineCombatState,
} from '@/utils/calculations';

export interface GuardVitalityDisplayProps {
  /** Pontos de Guarda */
  guard: GuardPoints;
  /** Pontos de Vitalidade */
  vitality: VitalityPoints;
  /** Callback para atualizar GA e PV */
  onChange: (guard: GuardPoints, vitality: VitalityPoints) => void;
  /** Callback para abrir sidebar de detalhes (opcional) */
  onOpenDetails?: () => void;
}

/**
 * Labels de estado de combate para exibição
 */
const COMBAT_STATE_LABELS: Record<
  string,
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  normal: { label: 'Normal', color: 'success' },
  'ferimento-direto': { label: 'Ferimento Direto', color: 'warning' },
  'ferimento-critico': { label: 'Ferimento Crítico', color: 'error' },
};

/**
 * Sub-componente reutilizável para exibir um bloco de recurso (GA ou PV)
 * com barra de progresso e botões Sofrer/Recuperar
 */
interface ResourceBlockProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  effectiveMax?: number;
  progressColor: 'primary' | 'error';
  damageLabel: string;
  healLabel: string;
  healTooltip?: string;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  healDisabled?: boolean;
  healMinValue?: number;
  statusChip?: React.ReactNode;
}

const ResourceBlock = React.memo(function ResourceBlock({
  icon,
  label,
  current,
  max,
  effectiveMax,
  progressColor,
  damageLabel,
  healLabel,
  healTooltip,
  onDamage,
  onHeal,
  healDisabled = false,
  healMinValue = 1,
  statusChip,
}: ResourceBlockProps) {
  const [damageValue, setDamageValue] = useState('');
  const [healValue, setHealValue] = useState('');

  const handleDamage = useCallback(() => {
    const amount = parseInt(damageValue, 10);
    if (!isNaN(amount) && amount > 0) {
      onDamage(amount);
      setDamageValue('');
    }
  }, [damageValue, onDamage]);

  const handleHeal = useCallback(() => {
    const amount = parseInt(healValue, 10);
    if (!isNaN(amount) && amount >= healMinValue) {
      onHeal(amount);
      setHealValue('');
    }
  }, [healValue, healMinValue, onHeal]);

  const handleDamageKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleDamage();
    },
    [handleDamage]
  );

  const handleHealKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleHeal();
    },
    [handleHeal]
  );

  const displayMax = effectiveMax ?? max;
  const percent =
    displayMax > 0
      ? Math.min(100, Math.floor((current / displayMax) * 100))
      : 0;

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography variant="subtitle2" fontWeight="bold">
              {label}
            </Typography>
          </Stack>
          {statusChip}
        </Stack>

        {/* Current/Max display */}
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 0.5 }}
        >
          {current}
          <Typography component="span" variant="h6" color="text.secondary">
            {' '}
            / {displayMax}
          </Typography>
          {effectiveMax && effectiveMax < max && (
            <Tooltip title={`GA máxima original: ${max} (reduzida por PV ≤ 1)`}>
              <Typography
                component="span"
                variant="caption"
                color="warning.main"
                sx={{ ml: 0.5 }}
              >
                ({max})
              </Typography>
            </Tooltip>
          )}
        </Typography>

        {/* Progress bar */}
        <LinearProgress
          color={progressColor}
          variant="determinate"
          value={percent}
          sx={{ height: 8, borderRadius: 999, mb: 1.5 }}
        />

        {/* Sofrer / Recuperar controls */}
        <Stack spacing={1}>
          {/* Sofrer (damage) */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              placeholder="Qtd"
              value={damageValue}
              onChange={(e) => setDamageValue(e.target.value)}
              onKeyDown={handleDamageKeyDown}
              inputProps={{
                min: 1,
                style: { textAlign: 'center' },
                'aria-label': `Quantidade para ${damageLabel}`,
              }}
              sx={{ width: 80 }}
            />
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleDamage}
              disabled={!damageValue || parseInt(damageValue, 10) <= 0}
              sx={{ textTransform: 'none', flex: 1 }}
            >
              {damageLabel}
            </Button>
          </Stack>

          {/* Recuperar (heal) */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              placeholder="Qtd"
              value={healValue}
              onChange={(e) => setHealValue(e.target.value)}
              onKeyDown={handleHealKeyDown}
              inputProps={{
                min: healMinValue,
                style: { textAlign: 'center' },
                'aria-label': `Quantidade para ${healLabel}`,
              }}
              sx={{ width: 80 }}
            />
            <Tooltip title={healTooltip ?? ''} arrow>
              <span style={{ flex: 1, display: 'flex' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={handleHeal}
                  disabled={
                    healDisabled ||
                    !healValue ||
                    parseInt(healValue, 10) < healMinValue
                  }
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  {healLabel}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

/**
 * GuardVitalityDisplay - Componente combinado para GA + PV
 */
export const GuardVitalityDisplay = React.memo(function GuardVitalityDisplay({
  guard,
  vitality,
  onChange,
  onOpenDetails,
}: GuardVitalityDisplayProps) {
  const theme = useTheme();
  const combatState = determineCombatState(
    guard.current,
    guard.max,
    vitality.current,
    vitality.max
  );
  const stateInfo = COMBAT_STATE_LABELS[combatState];
  const effectiveGAMax = getEffectiveGAMax(guard.max, vitality.current);
  const isAvariado = guard.current <= guard.max / 2 && guard.current > 0;

  /**
   * Aplica dano — GA absorve primeiro, overflow vai para PV
   */
  const handleDamage = useCallback(
    (amount: number) => {
      const result = applyDamageToGuardVitality(guard, vitality, amount);
      onChange(result.guard, result.vitality);
    },
    [guard, vitality, onChange]
  );

  /**
   * Recupera GA diretamente
   */
  const handleHealGA = useCallback(
    (amount: number) => {
      const newGuard = healGuard(guard, amount);
      onChange(newGuard, vitality);
    },
    [guard, vitality, onChange]
  );

  /**
   * Aplica dano direto à PV (bypass GA)
   */
  const handleDamagePV = useCallback(
    (amount: number) => {
      const newVitality: VitalityPoints = {
        ...vitality,
        current: Math.max(0, vitality.current - amount),
      };
      onChange(guard, newVitality);
    },
    [guard, vitality, onChange]
  );

  /**
   * Recupera PV usando pontos de recuperação (5:1 ratio)
   */
  const handleHealPV = useCallback(
    (recoveryPoints: number) => {
      const result = healVitality(vitality, recoveryPoints);
      onChange(guard, result.vitality);
    },
    [guard, vitality, onChange]
  );

  const pvIsFull = vitality.current >= vitality.max;
  const pvRecoveryTooltip = pvIsFull
    ? 'PV está cheio'
    : `Cada ${PV_RECOVERY_COST} pontos de recuperação restaura 1 PV`;

  return (
    <Box
      onClick={onOpenDetails}
      sx={{
        cursor: onOpenDetails ? 'pointer' : 'default',
      }}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onOpenDetails) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails();
        }
      }}
    >
      {/* Estado de combate indicator */}
      {combatState !== 'normal' && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <WarningIcon color={stateInfo.color} fontSize="small" />
          <Chip
            label={stateInfo.label}
            color={stateInfo.color}
            size="small"
            variant="filled"
          />
          {isAvariado && (
            <Chip
              label="Avariado"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      )}

      {isAvariado && combatState === 'normal' && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Chip
            label="Avariado"
            color="warning"
            size="small"
            variant="outlined"
            icon={<WarningIcon />}
          />
          <Typography variant="caption" color="text.secondary">
            GA ≤ metade da GA máxima
          </Typography>
        </Stack>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Guarda (GA) */}
        <ResourceBlock
          icon={<ShieldIcon color="primary" />}
          label="Guarda (GA)"
          current={guard.current}
          max={guard.max}
          effectiveMax={
            effectiveGAMax !== guard.max ? effectiveGAMax : undefined
          }
          progressColor="primary"
          damageLabel="Sofrer"
          healLabel="Recuperar"
          onDamage={handleDamage}
          onHeal={handleHealGA}
          healDisabled={guard.current >= effectiveGAMax}
        />

        {/* Vitalidade (PV) */}
        <ResourceBlock
          icon={<FavoriteIcon color="error" />}
          label="Vitalidade (PV)"
          current={vitality.current}
          max={vitality.max}
          progressColor="error"
          damageLabel="Sofrer"
          healLabel="Recuperar"
          healTooltip={pvRecoveryTooltip}
          onDamage={handleDamagePV}
          onHeal={handleHealPV}
          healDisabled={pvIsFull}
          healMinValue={PV_RECOVERY_COST}
          statusChip={
            combatState === 'ferimento-critico' ? (
              <Chip
                label="PV = 0"
                color="error"
                size="small"
                variant="filled"
              />
            ) : combatState === 'ferimento-direto' ? (
              <Chip
                label="Ferido"
                color="warning"
                size="small"
                variant="outlined"
              />
            ) : undefined
          }
        />
      </Box>
    </Box>
  );
});

GuardVitalityDisplay.displayName = 'GuardVitalityDisplay';

export default GuardVitalityDisplay;
