import React from 'react';
import { Box, Typography } from '@mui/material';
import { Sidebar, EditableNumber } from '@/components/shared';
import type { PowerPoints } from '@/types/combat';

export interface PPDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  pp: PowerPoints;
  onChange: (pp: PowerPoints) => void;
}

export function PPDetailSidebar({ open, onClose, pp, onChange }: PPDetailSidebarProps) {
  return (
    <Sidebar open={open} onClose={onClose} title="Detalhes de PP">
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">PP Máximo</Typography>
          <EditableNumber
            value={pp.max}
            onChange={(max) => onChange({ ...pp, max })}
            min={0}
            max={999}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">PP Temporário</Typography>
          <EditableNumber
            value={pp.temporary}
            onChange={(temporary) => onChange({ ...pp, temporary })}
            min={0}
            max={999}
          />
        </Box>
      </Box>
    </Sidebar>
  );
}

export default PPDetailSidebar;
