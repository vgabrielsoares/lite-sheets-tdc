'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { SvgIconComponent } from '@mui/icons-material';

/**
 * Tipo genérico para recursos (PV, PP, etc.)
 */
export interface ResourcePoints {
  current: number;
  max: number;
  temporary: number;
}

/**
 * Configuração do recurso (PV ou PP)
 */
export interface ResourceConfig {
  /** Ícone do recurso */
  Icon: SvgIconComponent;
  /** Cor do ícone (theme color) */
  iconColor: 'error' | 'info' | 'warning' | 'success' | 'primary' | 'secondary';
  /** Label curto (ex: "PV", "PP") */
  label: string;
  /** Cor da barra de progresso */
  progressColor:
    | 'error'
    | 'info'
    | 'warning'
    | 'success'
    | 'primary'
    | 'secondary';
  /** Cor customizada para valores temporários (CSS color) */
  temporaryColor?: string;
  /** Valores de ajuste rápido */
  adjustValues: {
    /** Valor pequeno (ex: -1, +1) */
    small: number;
    /** Valor grande (ex: -5, +5) */
    large: number;
  };
  /** Labels para os botões */
  buttonLabels: {
    decreaseSmall: string;
    decreaseLarge: string;
    increaseSmall: string;
    increaseLarge: string;
  };
}

export interface CompactResourcePointsProps {
  /** Dados do recurso (current, max, temporary) */
  resource: ResourcePoints;
  /** Configuração do tipo de recurso */
  config: ResourceConfig;
  /** Callback quando o recurso é alterado */
  onChange: (resource: ResourcePoints) => void;
  /** Callback para abrir detalhes (opcional) */
  onOpenDetails?: () => void;
  /** Função customizada para aplicar delta (opcional) */
  applyDelta?: (resource: ResourcePoints, delta: number) => ResourcePoints;
}

/**
 * CompactResourcePoints - Componente genérico para exibir e gerenciar recursos (PV, PP, etc.)
 *
 * Este componente unifica a lógica de exibição de recursos com:
 * - Barra visual dupla (atual + temporário)
 * - Botões de ajuste rápido com tooltips explicativos
 * - Suporte a teclado e acessibilidade
 * - Configurável para diferentes tipos de recursos
 *
 * @example
 * ```tsx
 * // Para PV
 * <CompactResourcePoints
 *   resource={character.combat.hp}
 *   config={{
 *     Icon: FavoriteIcon,
 *     iconColor: 'error',
 *     label: 'PV',
 *     progressColor: 'error',
 *     adjustValues: { small: 1, large: 5 },
 *     buttonLabels: {
 *       decreaseSmall: 'Sofrer 1 de dano',
 *       decreaseLarge: 'Sofrer 5 de dano',
 *       increaseSmall: 'Curar 1 PV',
 *       increaseLarge: 'Curar 5 PV',
 *     },
 *   }}
 *   onChange={(hp) => updateHP(hp)}
 *   onOpenDetails={() => openHPSidebar()}
 *   applyDelta={applyDeltaToHP}
 * />
 * ```
 */
export function CompactResourcePoints({
  resource,
  config,
  onChange,
  onOpenDetails,
  applyDelta,
}: CompactResourcePointsProps) {
  const { Icon, iconColor, label, progressColor, adjustValues, buttonLabels } =
    config;

  /**
   * Aplica ajuste ao recurso
   */
  const handleAdjust = (delta: number) => {
    if (applyDelta) {
      // Usa função customizada se fornecida (ex: applyDeltaToHP que subtrai de temporários primeiro)
      const updated = applyDelta(resource, delta);
      onChange(updated);
    } else {
      // Lógica padrão simples
      if (delta < 0) {
        const decrease = Math.abs(delta);
        const newCurrent = Math.max(0, resource.current - decrease);
        onChange({ ...resource, current: newCurrent });
      } else if (delta > 0) {
        onChange({ ...resource, current: resource.current + delta });
      }
    }
  };

  // Calcula porcentagens para barras de progresso
  const maxTotal = Math.max(
    resource.max,
    resource.current + resource.temporary,
    1
  );
  const percentCurrent = Math.min(
    100,
    Math.floor((resource.current / maxTotal) * 100)
  );
  // Porcentagem total (atual + temporário)
  const percentTotal = Math.min(
    100,
    Math.floor(((resource.current + resource.temporary) / maxTotal) * 100)
  );

  return (
    <Card
      onClick={onOpenDetails}
      onKeyDown={(e) => {
        if (!onOpenDetails) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails();
        }
      }}
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      sx={(theme) => ({
        cursor: onOpenDetails ? 'pointer' : 'default',
        border: onOpenDetails
          ? `1px solid ${theme.palette.primary.main}`
          : undefined,
        '&:hover': onOpenDetails
          ? {
              borderColor: 'primary.dark',
              bgcolor: 'action.hover',
            }
          : {},
      })}
    >
      <CardContent>
        {/* Cabeçalho com ícone e label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Icon color={iconColor} />
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>

        {/* Controles de ajuste */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botão: Diminuir grande */}
          <Tooltip title={buttonLabels.decreaseLarge} arrow>
            <IconButton
              aria-label={buttonLabels.decreaseLarge}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(-adjustValues.large);
              }}
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>

          {/* Botão: Diminuir pequeno */}
          <Tooltip title={buttonLabels.decreaseSmall} arrow>
            <IconButton
              aria-label={buttonLabels.decreaseSmall}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(-adjustValues.small);
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Valor atual */}
          <Typography variant="h5" sx={{ minWidth: 56, textAlign: 'center' }}>
            {resource.current}
          </Typography>

          {/* Botão: Aumentar pequeno */}
          <Tooltip title={buttonLabels.increaseSmall} arrow>
            <IconButton
              aria-label={buttonLabels.increaseSmall}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(adjustValues.small);
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Botão: Aumentar grande */}
          <Tooltip title={buttonLabels.increaseLarge} arrow>
            <IconButton
              aria-label={buttonLabels.increaseLarge}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAdjust(adjustValues.large);
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Barra de progresso única com overlay para valores temporários */}
        <Tooltip
          title={`Atual: ${resource.current} | Temporários: ${resource.temporary} | Máximo: ${resource.max}`}
          arrow
        >
          <Box sx={{ position: 'relative', mt: 1 }}>
            {/* Barra base (valores atuais) */}
            <LinearProgress
              color={progressColor}
              variant="determinate"
              value={percentCurrent}
              sx={{ height: 8, borderRadius: 999 }}
            />
            {/* Overlay para valores temporários (mostra o total, mas com clip-path para começar após o atual) */}
            {resource.temporary > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: `${percentCurrent}%`,
                  width: `${percentTotal - percentCurrent}%`,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: config.temporaryColor || 'secondary.main',
                  opacity: 0.85,
                }}
              />
            )}
          </Box>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

export default CompactResourcePoints;
