'use client';

import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Sidebar } from '@/components/shared/Sidebar';
import type { Character } from '@/types/character';

export interface DefenseSidebarProps {
  open: boolean;
  character: Character;
  onClose: () => void;
  onUpdate: (character: Character) => void;
}

export default function DefenseSidebar({
  open,
  character,
  onClose,
  onUpdate,
}: DefenseSidebarProps) {
  const [armorBonus, setArmorBonus] = React.useState<number>(
    character.combat.defense.armorBonus
  );
  const [shieldBonus, setShieldBonus] = React.useState<number>(
    character.combat.defense.shieldBonus
  );
  const [maxAgilityBonus, setMaxAgilityBonus] = React.useState<number | ''>(
    character.combat.defense.maxAgilityBonus ?? ''
  );

  const handleSave = () => {
    const updated = { ...character };
    updated.combat = {
      ...updated.combat,
      defense: { ...updated.combat.defense },
    };
    updated.combat.defense.armorBonus = armorBonus || 0;
    updated.combat.defense.shieldBonus = shieldBonus || 0;
    updated.combat.defense.maxAgilityBonus =
      maxAgilityBonus === '' ? undefined : Number(maxAgilityBonus);
    // total recalculado será feito por seletores/cálculos existentes no app
    onUpdate(updated);
    onClose();
  };

  return (
    <Sidebar open={open} onClose={onClose} title="Defesa">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Ajuste bônus de armadura, escudo e limite de Agilidade.
        </Typography>
        <TextField
          type="number"
          label="Bônus de Armadura"
          value={armorBonus}
          onChange={(e) => setArmorBonus(Number(e.target.value))}
          inputProps={{ min: 0 }}
        />
        <TextField
          type="number"
          label="Bônus de Escudo"
          value={shieldBonus}
          onChange={(e) => setShieldBonus(Number(e.target.value))}
          inputProps={{ min: 0 }}
        />
        <TextField
          type="number"
          label="Máximo de Bônus de Agilidade (opcional)"
          value={maxAgilityBonus}
          onChange={(e) =>
            setMaxAgilityBonus(
              e.target.value === '' ? '' : Number(e.target.value)
            )
          }
          placeholder="sem limite"
        />
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
