'use client';

import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { AttributeCard } from './AttributeCard';
import { PHYSICAL_ATTRIBUTES, MENTAL_ATTRIBUTES } from '@/constants';
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
 * Display de Atributos do Personagem
 *
 * Exibe os 6 atributos do personagem separados em duas categorias:
 * - Atributos Corporais (Agilidade, Constituição, Força)
 * - Atributos Mentais (Influência, Mente, Presença)
 *
 * Cada atributo é exibido em um card individual clicável (somente leitura).
 * A edição é feita através da sidebar de detalhes.
 *
 * @example
 * ```tsx
 * <AttributesDisplay
 *   attributes={character.attributes}
 *   onAttributeClick={(attr) => openAttributeSidebar(attr)}
 * />
 * ```
 */
export function AttributesDisplay({
  attributes,
  onAttributeClick,
}: AttributesDisplayProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      {/* Botão de informações no canto superior direito */}
      <Tooltip
        title={
          <Typography variant="body2">
            <strong>Importante:</strong> Atributos normalmente vão de 0 a 5, mas
            podem ser superados em casos especiais. Com atributo 0, você rola
            2d20 e escolhe o menor resultado. Com atributo 1-5, você rola aquela
            quantidade de d20 e escolhe o maior resultado. Clique em um atributo
            para abrir a sidebar e editar seu valor.
          </Typography>
        }
        arrow
        placement="left"
      >
        <IconButton
          size="small"
          aria-label="Informações sobre atributos"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 700, mb: 3 }}
      >
        Atributos
      </Typography>

      {/* Atributos Corporais */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            mb: 2,
          }}
        >
          Atributos Corporais
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {PHYSICAL_ATTRIBUTES.map((attr) => (
            <AttributeCard
              key={attr}
              name={attr}
              value={attributes[attr]}
              onClick={
                onAttributeClick ? () => onAttributeClick(attr) : undefined
              }
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Atributos Mentais */}
      <Box>
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            mb: 2,
          }}
        >
          Atributos Mentais
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {MENTAL_ATTRIBUTES.map((attr) => (
            <AttributeCard
              key={attr}
              name={attr}
              value={attributes[attr]}
              onClick={
                onAttributeClick ? () => onAttributeClick(attr) : undefined
              }
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
