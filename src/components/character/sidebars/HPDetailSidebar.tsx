import React from 'react';
import { Box, Typography } from '@mui/material';
import { Sidebar, EditableNumber } from '@/components/shared';
import type { HealthPoints } from '@/types/combat';

export interface HPDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  hp: HealthPoints;
  onChange: (hp: HealthPoints) => void;
}

export function HPDetailSidebar({
  open,
  onClose,
  hp,
  onChange,
}: HPDetailSidebarProps) {
  return (
    <Sidebar open={open} onClose={onClose} title="Detalhes de PV">
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PV Atual
          </Typography>
          <EditableNumber
            value={hp.current}
            onChange={(current) => onChange({ ...hp, current })}
            min={0}
            max={hp.max}
            validate={(value) => {
              if (value < 0) return 'PV não pode ser negativo';
              if (value > hp.max)
                return `PV atual não pode exceder PV máximo (${hp.max})`;
              return null;
            }}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PV Máximo
          </Typography>
          <EditableNumber
            value={hp.max}
            onChange={(max) => onChange({ ...hp, max })}
            min={1}
            max={999}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            PV Temporário
          </Typography>
          <EditableNumber
            value={hp.temporary}
            onChange={(temporary) => onChange({ ...hp, temporary })}
            min={0}
            max={999}
          />
        </Box>
      </Box>
    </Sidebar>
  );
}

export default HPDetailSidebar;
