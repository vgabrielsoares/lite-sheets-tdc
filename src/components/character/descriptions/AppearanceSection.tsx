'use client';

/**
 * AppearanceSection - Seção de Descrição de Aparência
 *
 * Permite editar:
 * - Pele
 * - Olhos
 * - Cabelo
 * - Outros detalhes
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  useTheme,
  alpha,
} from '@mui/material';
import { Face as FaceIcon } from '@mui/icons-material';
import type { PhysicalDescription } from '@/types';

export interface AppearanceSectionProps {
  /** Descrição física atual */
  physicalDescription: PhysicalDescription;
  /** Callback para atualizar descrição física */
  onUpdate: (updates: Partial<PhysicalDescription>) => void;
}

/**
 * Seção de Descrição de Aparência
 */
export function AppearanceSection({
  physicalDescription,
  onUpdate,
}: AppearanceSectionProps) {
  const theme = useTheme();

  const handleFieldChange = (
    field: keyof PhysicalDescription,
    value: string
  ) => {
    onUpdate({ [field]: value });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaceIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Descrição de Aparência
          </Typography>
        </Box>

        {/* Campos de Aparência */}
        <Stack spacing={2}>
          <TextField
            label="Pele"
            value={physicalDescription.skin || ''}
            onChange={(e) => handleFieldChange('skin', e.target.value)}
            placeholder="Ex: Pele bronzeada, cicatrizes visíveis..."
            fullWidth
            multiline
            rows={1}
            helperText="Cor, textura, marcas especiais"
          />

          <TextField
            label="Olhos"
            value={physicalDescription.eyes || ''}
            onChange={(e) => handleFieldChange('eyes', e.target.value)}
            placeholder="Ex: Olhos verdes profundos..."
            fullWidth
            multiline
            rows={1}
            helperText="Cor, formato, expressão"
          />

          <TextField
            label="Cabelos"
            value={physicalDescription.hair || ''}
            onChange={(e) => handleFieldChange('hair', e.target.value)}
            placeholder="Ex: Cabelos negros longos..."
            fullWidth
            multiline
            rows={1}
            helperText="Cor, comprimento, estilo"
          />

          <TextField
            label="Outros Detalhes"
            value={physicalDescription.other || ''}
            onChange={(e) => handleFieldChange('other', e.target.value)}
            placeholder="Ex: Tatuagens, piercings, estilo de vestimenta..."
            fullWidth
            multiline
            rows={3}
            helperText="Detalhes adicionais da aparência"
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
