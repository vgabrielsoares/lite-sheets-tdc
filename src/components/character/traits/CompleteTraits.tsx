/**
 * CompleteTraits - Gerenciamento de Características Completas
 *
 * Características já balanceadas que não afetam o sistema de pontos.
 */

'use client';

import React from 'react';
import { Box, Typography, Button, Alert, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TraitCard } from './TraitCard';
import type { CompleteTrait } from '@/types/character';

export interface CompleteTraitsProps {
  /** Características completas */
  traits: CompleteTrait[];
  /** Callback ao atualizar características */
  onUpdate: (traits: CompleteTrait[]) => void;
}

/**
 * Seção de Características Completas
 *
 * Características completas são features já balanceadas que não
 * afetam o sistema de pontos de características complementares.
 *
 * Exemplos:
 * - Características de background
 * - Features concedidas por origem/linhagem
 * - Habilidades narrativas sem impacto mecânico direto
 */
export function CompleteTraits({ traits, onUpdate }: CompleteTraitsProps) {
  const handleAdd = () => {
    const newTrait: CompleteTrait = {
      name: '',
      description: '',
    };
    onUpdate([...traits, newTrait]);
  };

  const handleUpdateTrait = (index: number, updated: CompleteTrait) => {
    const newTraits = [...traits];
    newTraits[index] = updated;
    onUpdate(newTraits);
  };

  const handleRemove = (index: number) => {
    onUpdate(traits.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Características Completas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Características já balanceadas que não afetam o sistema de pontos.
            Podem incluir backgrounds, peculiaridades narrativas ou features
            concedidas por origem/linhagem.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="small"
          sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
        >
          Adicionar
        </Button>
      </Stack>

      {traits.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhuma característica completa adicionada. Características completas
          são features já balanceadas, como peculiaridades de background ou
          traços narrativos.
        </Alert>
      ) : (
        <Box sx={{ mt: 2 }}>
          {traits.map((trait, index) => (
            <TraitCard
              key={`complete-${index}`}
              trait={trait}
              type="complete"
              onUpdate={(updated) =>
                handleUpdateTrait(index, updated as CompleteTrait)
              }
              onRemove={() => handleRemove(index)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
