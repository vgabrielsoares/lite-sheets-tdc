'use client';

/**
 * InlineModifiers - Componente simplificado para exibir e editar modificadores inline
 *
 * Exibe duas colunas simples: modificador de dados (+/-d20) e modificador numérico (+/-)
 * Interface minimalista em uma única linha, sem formulários complexos.
 */

import React from 'react';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import type { Modifier } from '@/types';

export interface InlineModifiersProps {
  /** Modificador de dados atual */
  diceModifier: number;
  /** Modificador numérico atual */
  numericModifier: number;
  /** Callback quando modificadores são atualizados */
  onUpdate: (diceModifier: number, numericModifier: number) => void;
  /** Se deve desabilitar edição */
  disabled?: boolean;
}

/**
 * Componente InlineModifiers
 */
export function InlineModifiers({
  diceModifier,
  numericModifier,
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
      {/* Modificador de Dados */}
      <Tooltip title="Modificador de Dados: adiciona ou remove d20s da rolagem">
        <TextField
          type="number"
          value={diceModifier}
          onChange={(e) => {
            const newDice = parseInt(e.target.value) || 0;
            onUpdate(newDice, numericModifier);
          }}
          disabled={disabled}
          size="small"
          sx={{
            width: 75,
            '& .MuiInputBase-root': {
              height: '40px', // Mesma altura dos Select
            },
            '& input': {
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 0.75, // Mesmo padding dos Select
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
                d20
              </Typography>
            ),
          }}
        />
      </Tooltip>

      {/* Modificador Numérico */}
      <Tooltip title="Modificador Numérico: adicionado ao total da rolagem">
        <TextField
          type="number"
          value={numericModifier}
          onChange={(e) => {
            const newNumeric = parseInt(e.target.value) || 0;
            onUpdate(diceModifier, newNumeric);
          }}
          disabled={disabled}
          size="small"
          sx={{
            width: 75,
            '& .MuiInputBase-root': {
              height: '40px', // Mesma altura dos Select
            },
            '& input': {
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 0.75, // Mesmo padding dos Select
              color:
                numericModifier > 0
                  ? 'success.main'
                  : numericModifier < 0
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
                +
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
  numericModifier: number
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
