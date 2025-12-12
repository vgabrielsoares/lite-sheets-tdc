'use client';

import React, { memo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  PHYSICAL_ATTRIBUTES,
  MENTAL_ATTRIBUTES,
  ATTRIBUTE_ABBREVIATIONS,
} from '@/constants';
import type { Attributes, AttributeName } from '@/types';

export interface AttributesDisplayProps {
  /**
   * Atributos do personagem
   */
  attributes: Attributes;

  /**
   * Callback quando um atributo é clicado (para abrir sidebar)
   */
  onAttributeClick?: (attribute: AttributeName) => void;
}

/**
 * CompactAttributeCard - Card de atributo compacto para layout horizontal
 */
interface CompactAttributeCardProps {
  name: AttributeName;
  value: number;
  onClick?: () => void;
}

function CompactAttributeCard({
  name,
  value,
  onClick,
}: CompactAttributeCardProps) {
  const isZero = value === 0;
  const isAboveDefault = value > 5;

  // Determine tooltip text based on value
  const tooltipText = isZero
    ? 'Rola 2d20, usa menor'
    : `Rola ${value}d20, usa maior`;

  return (
    <Tooltip title={tooltipText} arrow enterDelay={150}>
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.15s ease-in-out',
          borderColor: onClick ? 'primary.main' : 'divider',
          borderWidth: 1,
          borderStyle: 'solid',
          minWidth: 70,
          flex: 1,
          '&:hover': onClick
            ? {
                boxShadow: 4,
                transform: 'translateY(-1px)',
              }
            : {},
        }}
        onClick={onClick}
      >
        <CardContent
          sx={{ p: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}
        >
          {/* Abbreviation */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500, display: 'block', mb: 0.25 }}
          >
            {ATTRIBUTE_ABBREVIATIONS[name]}
          </Typography>

          {/* Value with indicators */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
            }}
          >
            {isZero && (
              <WarningIcon sx={{ color: 'warning.main', fontSize: '0.8rem' }} />
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {isAboveDefault && (
              <TrendingUpIcon
                sx={{ color: 'success.main', fontSize: '0.8rem' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}

// Atributos corporais (primeiros 3) e mentais (últimos 3)
const CORPORAIS_ATTRIBUTES: AttributeName[] = PHYSICAL_ATTRIBUTES;
const MENTAIS_ATTRIBUTES: AttributeName[] = MENTAL_ATTRIBUTES;

/**
 * Display de Atributos do Personagem (Versão Compacta)
 *
 * Exibe os 6 atributos do personagem em uma linha horizontal:
 * AGI | CON | FOR | INF | MEN | PRE
 * Com labels "CORPORAIS" e "MENTAIS" abaixo dos grupos.
 *
 * Cada atributo é exibido em um card compacto clicável.
 *
 * @example
 * ```tsx
 * <AttributesDisplay
 *   attributes={character.attributes}
 *   onAttributeClick={(attr) => openAttributeSidebar(attr)}
 * />
 * ```
 */
export const AttributesDisplay = React.memo(function AttributesDisplay({
  attributes,
  onAttributeClick,
}: AttributesDisplayProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Atributos
        </Typography>

        <Tooltip
          title={
            <Typography variant="body2">
              <strong>Dica:</strong> Atributos vão de 0-5 (podem ser superados).
              Com 0, rola 2d20 e usa o menor. Com 1-5, rola essa quantidade de
              d20 e usa o maior. Clique em um atributo para editar.
            </Typography>
          }
          arrow
          placement="left"
        >
          <IconButton
            size="small"
            aria-label="Informações sobre atributos"
            sx={{ color: 'text.secondary' }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Todos os 6 atributos - mobile: 2 linhas, desktop: 1 linha */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: '100%',
        }}
      >
        {/* Grupo Corporais (AGI, CON, FOR) */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {CORPORAIS_ATTRIBUTES.map((attr) => (
              <CompactAttributeCard
                key={attr}
                name={attr}
                value={attributes[attr]}
                onClick={
                  onAttributeClick ? () => onAttributeClick(attr) : undefined
                }
              />
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            Corporais
          </Typography>
        </Box>

        {/* Grupo Mentais (INF, MEN, PRE) */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {MENTAIS_ATTRIBUTES.map((attr) => (
              <CompactAttributeCard
                key={attr}
                name={attr}
                value={attributes[attr]}
                onClick={
                  onAttributeClick ? () => onAttributeClick(attr) : undefined
                }
              />
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            Mentais
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
});

// Display name para debugging
AttributesDisplay.displayName = 'AttributesDisplay';
