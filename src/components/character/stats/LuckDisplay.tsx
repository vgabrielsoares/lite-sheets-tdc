'use client';

import React from 'react';
import { Box, Paper, Typography, Stack, Chip, useTheme } from '@mui/material';
import { Casino as LuckIcon } from '@mui/icons-material';
import { EditableNumber } from '@/components/shared';
import type { LuckLevel } from '@/types';

/**
 * Tabela de rolagens por nível de sorte
 * Conforme especificação do sistema
 */
const LUCK_ROLL_TABLE: Record<number, string> = {
  0: '1d20',
  1: '2d20',
  2: '2d20+2',
  3: '3d20+3',
  4: '3d20+6',
  5: '4d20+8',
  6: '4d20+12',
  7: '5d20+15',
};

export interface LuckDisplayProps {
  /**
   * Dados de sorte do personagem
   */
  luck: LuckLevel;

  /**
   * Callback para atualizar nível de sorte
   */
  onLevelChange: (level: number) => void;

  /**
   * Callback para atualizar valor total de sorte
   */
  onValueChange: (value: number) => void;

  /**
   * Se deve exibir em modo compacto
   * @default false
   */
  compact?: boolean;
}

/**
 * Componente para exibir e editar o Nível de Sorte
 *
 * A sorte funciona de forma diferente de outras habilidades:
 * - Não depende de atributos
 * - Tem níveis de 0 a 7+
 * - Cada nível tem uma rolagem específica
 * - Pode receber modificadores temporários e permanentes
 *
 * @example
 * ```tsx
 * <LuckDisplay
 *   luck={{ level: 2, value: 10 }}
 *   onLevelChange={(level) => onUpdate({ luck: { ...luck, level } })}
 *   onValueChange={(value) => onUpdate({ luck: { ...luck, value } })}
 * />
 * ```
 */
export function LuckDisplay({
  luck,
  onLevelChange,
  onValueChange,
  compact = false,
}: LuckDisplayProps): React.ReactElement {
  const theme = useTheme();

  /**
   * Obtém a rolagem correspondente ao nível de sorte
   */
  const getRollFormula = (level: number): string => {
    return LUCK_ROLL_TABLE[level] ?? `${level}d20+${level * 3}`;
  };

  const rollFormula = getRollFormula(luck.level);

  if (compact) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack spacing={1.5}>
          {/* Cabeçalho */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LuckIcon color="warning" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Sorte
            </Typography>
          </Box>

          {/* Nível e Valor */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Nível
              </Typography>
              <EditableNumber
                value={luck.level}
                onChange={onLevelChange}
                min={0}
                max={7}
                label="Nível de Sorte"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Valor Total
              </Typography>
              <EditableNumber
                value={luck.value}
                onChange={onValueChange}
                min={0}
                label="Valor Total de Sorte"
              />
            </Box>
          </Box>

          {/* Fórmula de Rolagem */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Rolagem
            </Typography>
            <Chip
              label={rollFormula}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600, fontFamily: 'monospace' }}
            />
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack spacing={2.5}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LuckIcon color="warning" sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="h3" fontWeight={600}>
            Nível de Sorte
          </Typography>
        </Box>

        {/* Descrição */}
        <Typography variant="body2" color="text.secondary">
          A sorte funciona de forma única, não dependendo de outros atributos.
          Cada nível possui uma rolagem específica que pode ser modificada.
        </Typography>

        {/* Grid de Nível e Valor */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* Nível de Sorte */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Nível de Sorte
            </Typography>
            <EditableNumber
              value={luck.level}
              onChange={onLevelChange}
              min={0}
              max={7}
              label="Nível de Sorte"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              Níveis disponíveis: 0 a 7
            </Typography>
          </Box>

          {/* Valor Total */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Valor Total
            </Typography>
            <EditableNumber
              value={luck.value}
              onChange={onValueChange}
              min={0}
              label="Valor Total de Sorte"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              Inclui modificadores temporários e permanentes
            </Typography>
          </Box>
        </Box>

        {/* Fórmula de Rolagem */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Fórmula de Rolagem (Nível {luck.level})
          </Typography>
          <Chip
            label={rollFormula}
            color="warning"
            variant="filled"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: 'monospace',
              px: 2,
              py: 2.5,
            }}
          />
        </Box>

        {/* Tabela de Referência */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Referência Rápida de Níveis
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {Object.entries(LUCK_ROLL_TABLE).map(([level, formula]) => (
              <Box
                key={level}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  opacity: luck.level === Number(level) ? 1 : 0.6,
                  fontWeight: luck.level === Number(level) ? 600 : 400,
                }}
              >
                <Typography variant="caption" fontFamily="monospace">
                  Nível {level}:
                </Typography>
                <Typography
                  variant="caption"
                  fontFamily="monospace"
                  color={
                    luck.level === Number(level)
                      ? 'warning.main'
                      : 'text.secondary'
                  }
                >
                  {formula}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
