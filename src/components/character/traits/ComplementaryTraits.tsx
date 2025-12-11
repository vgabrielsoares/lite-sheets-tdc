/**
 * ComplementaryTraits - Gerenciamento de Características Complementares
 *
 * Características com pontos positivos (vantagens) e negativos (desvantagens).
 * O balanço total deve ser sempre 0 para o personagem estar equilibrado.
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { uuidv4 } from '@/utils/uuid';
import { TraitCard } from './TraitCard';
import { calculateTraitBalance } from '@/types/traits';
import type { ComplementaryTrait } from '@/types/character';

export interface ComplementaryTraitsProps {
  /** Características negativas (desvantagens) */
  negativeTraits: ComplementaryTrait[];
  /** Características positivas (vantagens) */
  positiveTraits: ComplementaryTrait[];
  /** Callback ao atualizar características negativas */
  onUpdateNegative: (traits: ComplementaryTrait[]) => void;
  /** Callback ao atualizar características positivas */
  onUpdatePositive: (traits: ComplementaryTrait[]) => void;
}

/**
 * Seção de Características Complementares
 *
 * Permite ao jogador adicionar características negativas (desvantagens)
 * e equilibrá-las com características positivas (vantagens).
 *
 * Regras:
 * - Características negativas têm pontos negativos
 * - Características positivas têm pontos positivos
 * - O balanço total deve ser 0 para o personagem estar equilibrado
 */
export function ComplementaryTraits({
  negativeTraits,
  positiveTraits,
  onUpdateNegative,
  onUpdatePositive,
}: ComplementaryTraitsProps) {
  // Cálculo do balanço
  const balance = useMemo(
    () => calculateTraitBalance(negativeTraits, positiveTraits),
    [negativeTraits, positiveTraits]
  );

  const isBalanced = balance === 0;
  const needsMorePositive = balance < 0;
  const needsMoreNegative = balance > 0;

  // Somatórios
  const negativeSum = useMemo(
    () => negativeTraits.reduce((sum, t) => sum + t.points, 0),
    [negativeTraits]
  );
  const positiveSum = useMemo(
    () => positiveTraits.reduce((sum, t) => sum + t.points, 0),
    [positiveTraits]
  );

  // Handlers para características negativas
  const handleAddNegative = () => {
    const newTrait: ComplementaryTrait = {
      name: '',
      description: '',
      points: -1,
    };
    onUpdateNegative([...negativeTraits, newTrait]);
  };

  const handleUpdateNegative = (index: number, updated: ComplementaryTrait) => {
    // Garante que os pontos sejam negativos
    const normalized = { ...updated, points: Math.abs(updated.points) * -1 };
    const newTraits = [...negativeTraits];
    newTraits[index] = normalized;
    onUpdateNegative(newTraits);
  };

  const handleRemoveNegative = (index: number) => {
    onUpdateNegative(negativeTraits.filter((_, i) => i !== index));
  };

  // Handlers para características positivas
  const handleAddPositive = () => {
    const newTrait: ComplementaryTrait = {
      name: '',
      description: '',
      points: 1,
    };
    onUpdatePositive([...positiveTraits, newTrait]);
  };

  const handleUpdatePositive = (index: number, updated: ComplementaryTrait) => {
    // Garante que os pontos sejam positivos
    const normalized = { ...updated, points: Math.abs(updated.points) };
    const newTraits = [...positiveTraits];
    newTraits[index] = normalized;
    onUpdatePositive(newTraits);
  };

  const handleRemovePositive = (index: number) => {
    onUpdatePositive(positiveTraits.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Características Complementares
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Características com pontos positivos e negativos. O personagem deve
        sempre ter o equilíbrio de 0 pontos. Adicione desvantagens
        (características negativas) e equilibre com vantagens (características
        positivas).
      </Typography>

      {/* Balance Indicator */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderColor: isBalanced
            ? 'success.main'
            : needsMorePositive
              ? 'error.main'
              : 'warning.main',
          borderWidth: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isBalanced ? (
                <CheckCircleIcon color="success" fontSize="large" />
              ) : (
                <WarningIcon color="warning" fontSize="large" />
              )}
              <Box>
                <Typography variant="h6">
                  Balanço: {balance > 0 ? '+' : ''}
                  {balance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isBalanced && 'Características equilibradas ✓'}
                  {needsMorePositive &&
                    `Adicione ${Math.abs(balance)} ponto(s) em características positivas`}
                  {needsMoreNegative &&
                    `Adicione ${Math.abs(balance)} ponto(s) em características negativas ou remova positivas`}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                label={`Negativas: ${negativeSum}`}
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Positivas: +${positiveSum}`}
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Alert de balanço */}
      {!isBalanced && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Atenção:</strong> As características não estão equilibradas.
            O balanço total deve ser 0.
          </Typography>
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Negative Traits Section */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="error">
              Características Negativas (Desvantagens)
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<AddIcon />}
              onClick={handleAddNegative}
              size="small"
            >
              Adicionar Desvantagem
            </Button>
          </Box>

          {negativeTraits.length === 0 ? (
            <Alert severity="info">
              Nenhuma característica negativa adicionada. Características
              negativas concedem desvantagens, mas permitem que você adicione
              vantagens.
            </Alert>
          ) : (
            <Box>
              {negativeTraits.map((trait, index) => (
                <TraitCard
                  key={`negative-${index}`}
                  trait={trait}
                  type="complementary"
                  pointsColor="error"
                  onUpdate={(updated) =>
                    handleUpdateNegative(index, updated as ComplementaryTrait)
                  }
                  onRemove={() => handleRemoveNegative(index)}
                />
              ))}
            </Box>
          )}
        </Box>

        <Divider />

        {/* Positive Traits Section */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="success">
              Características Positivas (Vantagens)
            </Typography>
            <Button
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleAddPositive}
              size="small"
            >
              Adicionar Vantagem
            </Button>
          </Box>

          {positiveTraits.length === 0 ? (
            <Alert severity="info">
              Nenhuma característica positiva adicionada. Use os pontos das
              características negativas para adicionar vantagens.
            </Alert>
          ) : (
            <Box>
              {positiveTraits.map((trait, index) => (
                <TraitCard
                  key={`positive-${index}`}
                  trait={trait}
                  type="complementary"
                  pointsColor="success"
                  onUpdate={(updated) =>
                    handleUpdatePositive(index, updated as ComplementaryTrait)
                  }
                  onRemove={() => handleRemovePositive(index)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
