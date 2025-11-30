'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { EditableNumber } from '@/components/shared';
import { ATTRIBUTE_LABELS, ATTRIBUTE_ABBREVIATIONS } from '@/constants';
import type { AttributeName } from '@/types';

export interface AttributeCardProps {
  /**
   * Nome do atributo
   */
  name: AttributeName;

  /**
   * Valor atual do atributo
   */
  value: number;

  /**
   * Callback quando o valor muda
   */
  onChange: (value: number) => void;

  /**
   * Callback quando o card é clicado (para abrir sidebar)
   */
  onClick?: () => void;

  /**
   * Valor mínimo permitido (padrão: 0)
   */
  min?: number;

  /**
   * Valor máximo padrão (padrão: 5, mas pode ser superado)
   */
  maxDefault?: number;
}

/**
 * Card de Atributo Individual
 *
 * Exibe um atributo com seu valor, permitindo edição inline.
 * Fornece indicadores visuais para casos especiais:
 * - Valor 0: Ícone de aviso (rola 2d20 e escolhe o menor)
 * - Valor > 5: Ícone de destaque (superou o limite padrão)
 *
 * Ao clicar no card (fora do campo de edição), abre sidebar com detalhes.
 *
 * @example
 * ```tsx
 * <AttributeCard
 *   name="agilidade"
 *   value={character.attributes.agilidade}
 *   onChange={(value) => updateAttribute('agilidade', value)}
 *   onClick={() => openAttributeSidebar('agilidade')}
 * />
 * ```
 */
export function AttributeCard({
  name,
  value,
  onChange,
  onClick,
  min = 0,
  maxDefault = 5,
}: AttributeCardProps) {
  const theme = useTheme();

  // Determinar status especial do atributo
  const isZero = value === 0;
  const isAboveDefault = value > maxDefault;

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        borderColor: onClick ? 'primary.main' : 'divider',
        borderWidth: 1,
        borderStyle: 'solid',
        '&:hover': onClick
          ? {
              boxShadow: 6,
              transform: 'translateY(-2px)',
            }
          : {},
      }}
      onClick={(e) => {
        // Não abrir sidebar se clicar no campo de edição
        const target = e.target as HTMLElement;
        if (
          !target.closest('input') &&
          !target.closest('button') &&
          !target.closest('.MuiIconButton-root')
        ) {
          onClick?.();
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Header: Nome e abreviação */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {ATTRIBUTE_LABELS[name]}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {ATTRIBUTE_ABBREVIATIONS[name]}
            </Typography>
          </Box>

          {/* Valor editável com indicadores */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'center',
            }}
          >
            {/* Indicador de valor 0 */}
            {isZero && (
              <Tooltip
                title="Atenção: Com atributo 0, você rola 2d20 e escolhe o menor resultado"
                arrow
              >
                <WarningIcon
                  sx={{
                    color: 'warning.main',
                    fontSize: '1.2rem',
                  }}
                />
              </Tooltip>
            )}

            {/* Campo de valor */}
            <Box
              sx={{ flex: 1, textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <EditableNumber
                value={value}
                onChange={onChange}
                min={min}
                variant="h4"
                autoSave={true}
                debounceMs={300}
                textFieldProps={{
                  sx: { textAlign: 'center' },
                }}
              />
            </Box>

            {/* Indicador de valor acima do padrão */}
            {isAboveDefault && (
              <Tooltip
                title={`Este atributo superou o limite padrão de ${maxDefault}`}
                arrow
              >
                <TrendingUpIcon
                  sx={{
                    color: 'success.main',
                    fontSize: '1.2rem',
                  }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Rodapé: Informação de status */}
          <Box sx={{ textAlign: 'center', minHeight: '20px' }}>
            {isZero && (
              <Typography variant="caption" color="warning.main">
                Rola 2d20, usa menor
              </Typography>
            )}
            {isAboveDefault && !isZero && (
              <Typography variant="caption" color="success.main">
                Acima do padrão
              </Typography>
            )}
            {!isZero && !isAboveDefault && (
              <Typography variant="caption" color="text.secondary">
                Rola {value}d20, usa maior
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
