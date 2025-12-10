'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import FlightIcon from '@mui/icons-material/Flight';
import TerrainIcon from '@mui/icons-material/Terrain';
import WavesIcon from '@mui/icons-material/Waves';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Sidebar } from '@/components/shared/Sidebar';
import { useDebounce } from '@/hooks/useDebounce';
import type { Character, MovementSpeed } from '@/types/character';
import type { MovementType } from '@/types/common';

const MOVEMENT_TYPES: MovementType[] = [
  'andando',
  'voando',
  'escalando',
  'escavando',
  'nadando',
];

// Labels for each movement type
const MOVEMENT_LABELS: Record<MovementType, string> = {
  andando: 'Andando',
  voando: 'Voando',
  escalando: 'Escalando',
  escavando: 'Escavando',
  nadando: 'Nadando',
};

// Icons for each movement type
const MOVEMENT_ICONS: Record<MovementType, React.ReactNode> = {
  andando: <DirectionsWalkIcon fontSize="small" />,
  voando: <FlightIcon fontSize="small" />,
  escalando: <TerrainIcon fontSize="small" />,
  escavando: (
    <TerrainIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
  ),
  nadando: <WavesIcon fontSize="small" />,
};

// Descriptions for each movement type
const MOVEMENT_DESCRIPTIONS: Record<MovementType, string> = {
  andando: 'Deslocamento padrão ao caminhar ou correr no solo',
  voando: 'Deslocamento ao voar, requer habilidade especial ou magia',
  escalando: 'Deslocamento ao escalar superfícies verticais',
  escavando: 'Deslocamento ao cavar através do solo ou areia',
  nadando: 'Deslocamento ao nadar na água',
};

export interface MovementSidebarProps {
  open: boolean;
  character: Character;
  onClose: () => void;
  onUpdate: (character: Character) => void;
}

// Helper para obter MovementSpeed de forma segura (suporta estrutura antiga e nova)
function getMovementSpeed(
  speed: MovementSpeed | number | undefined
): MovementSpeed {
  if (typeof speed === 'number') {
    // Estrutura antiga: converter para nova
    return { base: speed, bonus: 0 };
  }
  if (speed && typeof speed === 'object') {
    return speed;
  }
  return { base: 0, bonus: 0 };
}

export default function MovementSidebar({
  open,
  character,
  onClose,
  onUpdate,
}: MovementSidebarProps) {
  // Initialize with values from character speeds (supports old and new structure)
  const [movementValues, setMovementValues] = React.useState<
    Record<MovementType, MovementSpeed>
  >(() => {
    const values: Record<MovementType, MovementSpeed> = {} as Record<
      MovementType,
      MovementSpeed
    >;
    MOVEMENT_TYPES.forEach((type) => {
      values[type] = getMovementSpeed(character.movement.speeds[type]);
    });
    return values;
  });

  // Refs para rastrear estado da sidebar e prevenir loops
  const wasOpenRef = React.useRef(false);
  const hasSyncedRef = React.useRef(false);
  const [hasUserEdited, setHasUserEdited] = React.useState(false);

  // Reset values SOMENTE quando sidebar abre (transição de fechado → aberto)
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      const values: Record<MovementType, MovementSpeed> = {} as Record<
        MovementType,
        MovementSpeed
      >;
      MOVEMENT_TYPES.forEach((type) => {
        values[type] = getMovementSpeed(character.movement.speeds[type]);
      });
      setMovementValues(values);
      hasSyncedRef.current = true;
      setHasUserEdited(false);
    }
    wasOpenRef.current = open;
  }, [open, character.id]);

  const handleBaseChange = (type: MovementType, value: number) => {
    setMovementValues((prev) => ({
      ...prev,
      [type]: { ...prev[type], base: Math.max(0, value) },
    }));
    setHasUserEdited(true);
  };

  const handleBonusChange = (type: MovementType, value: number) => {
    setMovementValues((prev) => ({
      ...prev,
      [type]: { ...prev[type], bonus: value },
    }));
    setHasUserEdited(true);
  };

  const getTotalSpeed = (type: MovementType): number => {
    const values = movementValues[type];
    return Math.max(0, values.base + values.bonus);
  };

  // Debounce do estado para auto-save (aumentado para 300ms para melhor performance)
  const debouncedMovementValues = useDebounce(movementValues, 300);

  // Auto-save: somente se usuário editou e sidebar está aberta e já sincronizou
  React.useEffect(() => {
    if (!hasUserEdited || !open || !hasSyncedRef.current) return;

    const newSpeeds: Record<MovementType, MovementSpeed> = {} as Record<
      MovementType,
      MovementSpeed
    >;
    MOVEMENT_TYPES.forEach((type) => {
      newSpeeds[type] = {
        base: debouncedMovementValues[type].base,
        bonus: debouncedMovementValues[type].bonus,
      };
    });

    const updated = { ...character };
    updated.movement = { ...updated.movement, speeds: newSpeeds };
    onUpdate(updated);
  }, [debouncedMovementValues, hasUserEdited, open]);

  return (
    <Sidebar open={open} onClose={onClose} title="Deslocamento">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Configure o deslocamento base e bônus para cada tipo de movimento. O
          valor total é a soma de base + bônus.
        </Typography>

        {MOVEMENT_TYPES.map((type) => (
          <Paper
            key={type}
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            {/* Movement Type Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {MOVEMENT_ICONS[type]}
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ flexGrow: 1 }}
              >
                {MOVEMENT_LABELS[type]}
              </Typography>
              <Tooltip
                title={MOVEMENT_DESCRIPTIONS[type]}
                arrow
                enterDelay={150}
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Base and Bonus Fields */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="number"
                label="Base"
                value={movementValues[type]?.base ?? 0}
                onChange={(e) => handleBaseChange(type, Number(e.target.value))}
                inputProps={{ min: 0, step: 1.5 }}
                size="small"
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                +
              </Typography>
              <TextField
                type="number"
                label="Bônus"
                value={movementValues[type]?.bonus ?? 0}
                onChange={(e) =>
                  handleBonusChange(type, Number(e.target.value))
                }
                inputProps={{ step: 1.5 }}
                size="small"
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                =
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  minWidth: 50,
                  textAlign: 'center',
                  color:
                    getTotalSpeed(type) > 0 ? 'success.main' : 'text.disabled',
                }}
              >
                {getTotalSpeed(type)}m
              </Typography>
            </Box>
          </Paper>
        ))}

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Alterações são salvas automaticamente. Base e bônus são armazenados
          separadamente.
        </Typography>
      </Box>
    </Sidebar>
  );
}
