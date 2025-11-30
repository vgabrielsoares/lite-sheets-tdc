'use client';

import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Sidebar } from '@/components/shared/Sidebar';
import type { Character } from '@/types/character';
import type { MovementType } from '@/types/common';

const MOVEMENT_TYPES: MovementType[] = [
  'andando',
  'voando',
  'escalando',
  'escavando',
  'nadando',
];

export interface MovementSidebarProps {
  open: boolean;
  character: Character;
  onClose: () => void;
  onUpdate: (character: Character) => void;
}

export default function MovementSidebar({
  open,
  character,
  onClose,
  onUpdate,
}: MovementSidebarProps) {
  const [speeds, setSpeeds] = React.useState<Record<MovementType, number>>(
    character.movement.speeds
  );

  const handleChange = (type: MovementType, value: number) => {
    setSpeeds((prev) => ({ ...prev, [type]: Math.max(0, value) }));
  };

  const handleSave = () => {
    const updated = { ...character };
    updated.movement = { ...updated.movement, speeds: { ...speeds } };
    onUpdate(updated);
    onClose();
  };

  return (
    <Sidebar open={open} onClose={onClose} title="Deslocamento">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Ajuste os deslocamentos por tipo. Valores em metros.
        </Typography>
        {MOVEMENT_TYPES.map((type) => (
          <TextField
            key={type}
            type="number"
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            value={speeds[type] ?? 0}
            onChange={(e) => handleChange(type, Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        ))}
        <Box
          sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}
        >
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </Box>
      </Box>
    </Sidebar>
  );
}
