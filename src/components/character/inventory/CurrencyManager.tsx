'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CircleIcon from '@mui/icons-material/Circle';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ScaleIcon from '@mui/icons-material/Scale';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type {
  Currency,
  CurrencyType,
  CurrencyDenomination,
} from '@/types/currency';
import { EditableNumber } from '@/components/shared';
import {
  calculateCoinWeight,
  calculateTotalWealth,
  formatCurrency,
} from '@/utils/currencyCalculations';
import {
  CURRENCY_NAMES,
  CURRENCY_SYMBOLS,
  COINS_PER_WEIGHT_UNIT,
} from '@/constants/currency';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export interface CurrencyManagerProps {
  /**
   * Dados de moedas do personagem
   */
  currency: Currency;

  /**
   * Callback para atualizar moedas
   */
  onUpdate: (currency: Currency) => void;

  /**
   * Se deve exibir detalhes expandidos
   * @default true
   */
  showDetails?: boolean;

  /**
   * Se deve exibir o peso das moedas
   * @default true
   */
  showWeight?: boolean;

  /**
   * Se deve exibir os totais convertidos
   * @default true
   */
  showTotals?: boolean;

  /**
   * Se a edição está desabilitada
   * @default false
   */
  disabled?: boolean;
}

// ============================================================================
// Subcomponentes
// ============================================================================

interface CurrencyIconProps {
  type: CurrencyType;
  size?: 'small' | 'medium';
}

/**
 * Ícone correspondente ao tipo de moeda
 */
function CurrencyIcon({ type, size = 'medium' }: CurrencyIconProps) {
  const iconSize = size === 'small' ? 16 : 20;

  const iconProps = {
    sx: { fontSize: iconSize },
  };

  switch (type) {
    case 'cobre':
      return <LocalFireDepartmentIcon {...iconProps} color="warning" />;
    case 'ouro':
      return (
        <CircleIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FFD700' }} />
      );
    case 'platina':
      return (
        <StarIcon {...iconProps} sx={{ ...iconProps.sx, color: '#E5E4E2' }} />
      );
    default:
      return null;
  }
}

interface CurrencyRowProps {
  type: CurrencyType;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /**
   * Se permite valores decimais (apenas para cobre)
   * @default false
   */
  allowDecimal?: boolean;
}

/**
 * Linha de edição de uma moeda específica
 */
function CurrencyRow({
  type,
  value,
  onChange,
  disabled,
  allowDecimal = false,
}: CurrencyRowProps) {
  const theme = useTheme();

  const handleIncrement = useCallback(() => {
    onChange(value + 1);
  }, [value, onChange]);

  const handleDecrement = useCallback(() => {
    if (value > 0) {
      onChange(value - 1);
    }
  }, [value, onChange]);

  // Handler para garantir valores inteiros quando não permite decimal
  const handleChange = useCallback(
    (newValue: number) => {
      onChange(allowDecimal ? newValue : Math.floor(newValue));
    },
    [onChange, allowDecimal]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
      }}
    >
      <Tooltip title={CURRENCY_NAMES[type]} placement="left">
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 24 }}>
          <CurrencyIcon type={type} />
        </Box>
      </Tooltip>

      <Typography
        variant="body2"
        sx={{ minWidth: 40, color: 'text.secondary' }}
      >
        {CURRENCY_SYMBOLS[type]}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          aria-label={`Diminuir ${CURRENCY_NAMES[type]}`}
          sx={{ p: 0.25 }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <EditableNumber
          value={value}
          onChange={handleChange}
          min={0}
          step={allowDecimal ? 0.1 : 1}
          variant="body1"
          autoSave
          debounceMs={500}
          textFieldProps={{
            size: 'small',
            sx: { width: 80 },
          }}
        />

        <IconButton
          size="small"
          onClick={handleIncrement}
          disabled={disabled}
          aria-label={`Aumentar ${CURRENCY_NAMES[type]}`}
          sx={{ p: 0.25 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

interface CurrencySectionProps {
  title: string;
  icon: React.ReactNode;
  denomination: CurrencyDenomination;
  onChange: (type: CurrencyType, value: number) => void;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Seção de moedas (físico ou banco)
 */
function CurrencySection({
  title,
  icon,
  denomination,
  onChange,
  disabled,
  tooltip,
}: CurrencySectionProps) {
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        {icon}
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} placement="top">
            <InfoOutlinedIcon
              sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }}
            />
          </Tooltip>
        )}
      </Box>

      <Stack spacing={0.5}>
        <CurrencyRow
          type="platina"
          value={denomination.platina}
          onChange={(v) => onChange('platina', v)}
          disabled={disabled}
        />
        <CurrencyRow
          type="ouro"
          value={denomination.ouro}
          onChange={(v) => onChange('ouro', v)}
          disabled={disabled}
        />
        <CurrencyRow
          type="cobre"
          value={denomination.cobre}
          onChange={(v) => onChange('cobre', v)}
          disabled={disabled}
          allowDecimal
        />
      </Stack>
    </Box>
  );
}

// ============================================================================
// Componente Principal
// ============================================================================

/**
 * Gerenciador de Moedas e Riquezas
 *
 * Exibe e permite edição de:
 * - Moedas físicas (contam para peso)
 * - Moedas no banco (não contam para peso)
 * - Peso total das moedas físicas
 * - Totais convertidos em cada denominação
 *
 * @example
 * ```tsx
 * <CurrencyManager
 *   currency={character.inventory.currency}
 *   onUpdate={(currency) => updateCharacter({
 *     inventory: { ...inventory, currency }
 *   })}
 * />
 * ```
 */
export function CurrencyManager({
  currency,
  onUpdate,
  showDetails = true,
  showWeight = true,
  showTotals = true,
  disabled = false,
}: CurrencyManagerProps) {
  const theme = useTheme();

  // Calcular peso das moedas físicas
  const coinWeight = useMemo(
    () => calculateCoinWeight(currency.physical),
    [currency.physical]
  );

  // Calcular totais em cada denominação
  const totals = useMemo(() => calculateTotalWealth(currency), [currency]);

  // Handler para atualizar moedas físicas
  // Nota: cobre permite decimais, outras moedas são arredondadas
  const handlePhysicalChange = useCallback(
    (type: CurrencyType, value: number) => {
      const processedValue =
        type === 'cobre' ? Math.max(0, value) : Math.max(0, Math.floor(value));
      onUpdate({
        ...currency,
        physical: {
          ...currency.physical,
          [type]: processedValue,
        },
      });
    },
    [currency, onUpdate]
  );

  // Handler para atualizar moedas do banco
  // Nota: cobre permite decimais, outras moedas são arredondadas
  const handleBankChange = useCallback(
    (type: CurrencyType, value: number) => {
      const processedValue =
        type === 'cobre' ? Math.max(0, value) : Math.max(0, Math.floor(value));
      onUpdate({
        ...currency,
        bank: {
          ...currency.bank,
          [type]: processedValue,
        },
      });
    },
    [currency, onUpdate]
  );

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AccountBalanceWalletIcon color="primary" />
          Cunhagem
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* Moedas Físicas */}
          <CurrencySection
            title="Físico"
            icon={
              <AccountBalanceWalletIcon
                sx={{ fontSize: 18, color: 'text.secondary' }}
              />
            }
            denomination={currency.physical}
            onChange={handlePhysicalChange}
            disabled={disabled}
            tooltip="Moedas que você carrega fisicamente. Contam para o espaço."
          />

          {/* Moedas no Banco */}
          <CurrencySection
            title="Banco"
            icon={
              <AccountBalanceIcon
                sx={{ fontSize: 18, color: 'text.secondary' }}
              />
            }
            denomination={currency.bank}
            onChange={handleBankChange}
            disabled={disabled}
            tooltip="Moedas guardadas no banco. Não contam para o espaço."
          />
        </Box>

        {/* Peso das Moedas */}
        {showWeight && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScaleIcon sx={{ fontSize: 18, color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Espaço em Moedas
                </Typography>
                <Tooltip
                  title={`${COINS_PER_WEIGHT_UNIT} moedas físicas = 1 de espaço`}
                  placement="top"
                >
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 14,
                      color: 'text.secondary',
                      cursor: 'help',
                    }}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${coinWeight.totalCoins} moedas`}
                  size="small"
                  variant="outlined"
                />
                <Typography variant="body1" fontWeight={600} color="info.main">
                  {coinWeight.weight} espaço
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {/* Totais Convertidos */}
        {showTotals && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Riqueza Total
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                }}
              >
                <CurrencyIcon type="platina" size="small" />
                <Typography variant="body2" fontWeight={600}>
                  {totals.totalPlatina.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PP$
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                }}
              >
                <CurrencyIcon type="ouro" size="small" />
                <Typography variant="body2" fontWeight={600}>
                  {totals.totalOuro.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PO$
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                }}
              >
                <CurrencyIcon type="cobre" size="small" />
                <Typography variant="body2" fontWeight={600}>
                  {totals.totalCobre.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  C$
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
