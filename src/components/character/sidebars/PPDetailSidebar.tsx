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

export function PPDetailSidebar({
  open,
  onClose,
  pp,
  onChange,
}: PPDetailSidebarProps) {
  return (
    <Sidebar open={open} onClose={onClose} title="Detalhes de PP">
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PP Atual
          </Typography>
          <EditableNumber
            value={pp.current}
            onChange={(current) => onChange({ ...pp, current })}
            min={0}
            max={pp.max + pp.temporary}
            validate={(value) => {
              if (value < 0) return 'PP não pode ser negativo';
              if (value > pp.max + pp.temporary) {
                return `PP atual não pode exceder PP máximo + temporário (${pp.max + pp.temporary})`;
              }
              return null;
            }}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PP Máximo
          </Typography>
          <EditableNumber
            value={pp.max}
            onChange={(max) => onChange({ ...pp, max })}
            min={0}
            max={999}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PP Temporário
          </Typography>
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
