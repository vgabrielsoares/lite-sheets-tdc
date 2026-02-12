'use client';

/**
 * InlineModifiers - Componente simplificado para exibir e editar modificadores inline
 *
 * Exibe um campo simples para o modificador de dados (+Xd / -Xd).
 * No sistema não existem modificadores numéricos, apenas modificadores de dados.
 */

import React from 'react';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import type { Modifier } from '@/types';

export interface InlineModifiersProps {
  /** Modificador de dados atual */
  diceModifier: number;
  /** Callback quando modificador é atualizado */
  onUpdate: (diceModifier: number) => void;
  /** Se deve desabilitar edição */
  disabled?: boolean;
}

/**
 * Componente InlineModifiers
 */
export function InlineModifiers({
  diceModifier,
  onUpdate,
  disabled = false,
}: InlineModifiersProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        minWidth: 'fit-content',
      }}
    >
      {/* Modificador de Dados (+Xd / -Xd) */}
      <Tooltip title="Modificador de Dados: adiciona ou remove dados da rolagem (+1d, +2d, -1d, etc.)">
        <TextField
          type="number"
          value={diceModifier}
          onChange={(e) => {
            const newDice = parseInt(e.target.value) || 0;
            onUpdate(newDice);
          }}
          disabled={disabled}
          size="small"
          sx={{
            width: 75,
            '& .MuiInputBase-root': {
              height: '40px',
            },
            '& input': {
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 0.75,
              color:
                diceModifier > 0
                  ? 'success.main'
                  : diceModifier < 0
                    ? 'error.main'
                    : 'text.primary',
            },
          }}
          InputProps={{
            startAdornment: (
              <Typography
                variant="caption"
                sx={{ mr: 0.3, color: 'text.secondary', fontSize: '0.65rem' }}
              >
                d
              </Typography>
            ),
          }}
        />
      </Tooltip>
    </Box>
  );
}

/**
 * Utilitários para converter entre array de Modifier e valores simples
 */

/**
 * Extrai modificador de dados de um array de Modifier
 */
export function extractDiceModifier(modifiers: Modifier[] = []): number {
  return modifiers
    .filter((mod) => mod.affectsDice === true)
    .reduce((sum, mod) => sum + mod.value, 0);
}

/**
 * Extrai modificador numérico de um array de Modifier
 */
export function extractNumericModifier(modifiers: Modifier[] = []): number {
  return modifiers
    .filter((mod) => !mod.affectsDice)
    .reduce((sum, mod) => sum + mod.value, 0);
}

/**
 * Converte valores simples de volta para array de Modifier
 */
export function buildModifiersArray(
  diceModifier: number,
  numericModifier: number = 0
): Modifier[] {
  const modifiers: Modifier[] = [];

  if (diceModifier !== 0) {
    modifiers.push({
      name: 'Modificador de Dados',
      value: diceModifier,
      type: diceModifier > 0 ? 'bonus' : 'penalidade',
      affectsDice: true,
    });
  }

  if (numericModifier !== 0) {
    modifiers.push({
      name: 'Modificador Numérico',
      value: numericModifier,
      type: numericModifier > 0 ? 'bonus' : 'penalidade',
      affectsDice: false,
    });
  }

  return modifiers;
}
