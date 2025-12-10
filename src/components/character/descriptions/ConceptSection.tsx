'use client';

/**
 * ConceptSection - Seção de Conceito do Personagem
 *
 * Exibe o conceito curto do personagem com opção de expandir para texto longo via sidebar.
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandIcon,
} from '@mui/icons-material';

export interface ConceptSectionProps {
  /** Conceito curto atual */
  concept: string;
  /** Callback para atualizar conceito curto */
  onUpdate: (concept: string) => void;
  /** Callback para abrir sidebar de conceito expandido */
  onOpenSidebar: () => void;
}

/**
 * Seção de Conceito do Personagem
 */
export function ConceptSection({
  concept,
  onUpdate,
  onOpenSidebar,
}: ConceptSectionProps) {
  const theme = useTheme();

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
          <LightbulbIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Conceito do Personagem
          </Typography>
        </Box>

        {/* Campo de Conceito Curto */}
        <TextField
          label="Conceito"
          value={concept || ''}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Ex: Um mercenário honrado em busca de redenção..."
          fullWidth
          multiline
          rows={2}
          helperText="Resumo do personagem em uma ou duas frases"
        />

        {/* Botão para Expandir */}
        <Tooltip title="Clique para escrever um conceito mais detalhado" arrow>
          <Button
            variant="outlined"
            startIcon={<ExpandIcon />}
            onClick={onOpenSidebar}
            sx={{
              alignSelf: 'flex-start',
              borderColor: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Expandir Conceito
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
