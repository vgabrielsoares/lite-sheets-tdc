'use client';

/**
 * ConceptSidebar - Sidebar para Conceito Expandido
 *
 * Permite editar um conceito detalhado do personagem.
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Stack, Chip } from '@mui/material';
import { Sidebar } from '@/components/shared/Sidebar';

export interface ConceptSidebarProps {
  /** Se a sidebar está aberta */
  open: boolean;
  /** Callback para fechar a sidebar */
  onClose: () => void;
  /** Conceito expandido atual */
  conceptExpanded: string;
  /** Callback para atualizar conceito expandido */
  onUpdate: (conceptExpanded: string) => void;
}

/**
 * Sidebar para Conceito Expandido do Personagem
 */
export function ConceptSidebar({
  open,
  onClose,
  conceptExpanded,
  onUpdate,
}: ConceptSidebarProps) {
  const [localConcept, setLocalConcept] = useState(conceptExpanded || '');

  // Sincronizar com prop quando mudar
  useEffect(() => {
    setLocalConcept(conceptExpanded || '');
  }, [conceptExpanded]);

  // Salvar ao modificar (com debounce através do useState)
  const handleChange = (value: string) => {
    setLocalConcept(value);
  };

  // Salvar ao sair do campo
  const handleBlur = () => {
    if (localConcept !== conceptExpanded) {
      onUpdate(localConcept);
    }
  };

  // Contador de palavras
  const wordCount = localConcept
    ? localConcept.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <Sidebar open={open} onClose={onClose} title="Conceito Expandido">
      <Stack spacing={3}>
        {/* Descrição */}
        <Typography variant="body2" color="text.secondary">
          Escreva um conceito mais detalhado do seu personagem. Quem ele é? O
          que o motiva? Quais são seus objetivos e ambições?
        </Typography>

        {/* Contador de Palavras */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            label={`${wordCount} palavra${wordCount !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Campo de Texto */}
        <TextField
          label="Conceito Detalhado"
          value={localConcept}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Descreva seu personagem em detalhes..."
          fullWidth
          multiline
          rows={15}
          helperText="Escreva livremente sobre a essência e personalidade do seu personagem"
        />
      </Stack>
    </Sidebar>
  );
}
