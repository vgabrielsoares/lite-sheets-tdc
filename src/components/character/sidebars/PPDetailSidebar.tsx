import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar, EditableNumber } from '@/components/shared';
import type { PowerPoints } from '@/types/combat';
import type { Modifier } from '@/types/common';
import type { ArchetypeResourceBreakdown } from '@/components/character/archetypes';

/**
 * Componente para edição de um modificador individual
 * Usa estado local como fonte de verdade para evitar race conditions
 */
function ModifierRow({
  modifier,
  onUpdate,
  onRemove,
}: {
  modifier: Modifier;
  onUpdate: (updates: Partial<Modifier>) => void;
  onRemove: () => void;
}) {
  const [localName, setLocalName] = useState(modifier.name);
  const [localValue, setLocalValue] = useState(modifier.value);

  // Ref para debounce do onUpdate
  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sincroniza apenas na montagem ou quando o modificador é substituído
  const modifierIdRef = React.useRef(modifier);
  React.useEffect(() => {
    // Só sincroniza se o modificador mudou externamente (não por nossas ações)
    if (modifierIdRef.current !== modifier) {
      setLocalName(modifier.name);
      setLocalValue(modifier.value);
      modifierIdRef.current = modifier;
    }
  }, [modifier]);

  // Função para propagar mudanças com debounce
  const propagateUpdate = useCallback(
    (value: number) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        onUpdate({
          value,
          type: value < 0 ? 'penalidade' : 'bonus',
        });
      }, 150); // Pequeno debounce para agrupar cliques rápidos
    },
    [onUpdate]
  );

  const handleNameBlur = useCallback(() => {
    if (localName !== modifier.name) {
      onUpdate({ name: localName });
    }
  }, [localName, modifier.name, onUpdate]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10) || 0;
      setLocalValue(newValue);
    },
    []
  );

  const handleValueBlur = useCallback(() => {
    if (localValue !== modifier.value) {
      onUpdate({
        value: localValue,
        type: localValue < 0 ? 'penalidade' : 'bonus',
      });
    }
  }, [localValue, modifier.value, onUpdate]);

  const handleIncrement = useCallback(() => {
    setLocalValue((prev) => {
      const newValue = prev + 1;
      propagateUpdate(newValue);
      return newValue;
    });
  }, [propagateUpdate]);

  const handleDecrement = useCallback(() => {
    setLocalValue((prev) => {
      const newValue = prev - 1;
      propagateUpdate(newValue);
      return newValue;
    });
  }, [propagateUpdate]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      sx={{ pl: 1 }}
    >
      <TextField
        size="small"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        onBlur={handleNameBlur}
        variant="standard"
        sx={{ flex: 1 }}
        inputProps={{ style: { fontSize: '0.875rem' } }}
      />
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={handleDecrement}>
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
        <TextField
          size="small"
          type="number"
          value={localValue}
          onChange={handleValueChange}
          onBlur={handleValueBlur}
          variant="outlined"
          sx={{ width: 70 }}
          inputProps={{
            style: {
              textAlign: 'center',
              fontSize: '0.875rem',
              padding: '4px 8px',
            },
          }}
        />
        <IconButton size="small" onClick={handleIncrement}>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export interface PPDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  pp: PowerPoints;
  onChange: (pp: PowerPoints) => void;
  /** Breakdown de PP por arquétipo */
  archetypeBreakdown?: ArchetypeResourceBreakdown[];
  /** PP base inicial (ex: 2 para nível 1) */
  basePP?: number;
}

export function PPDetailSidebar({
  open,
  onClose,
  pp,
  onChange,
  archetypeBreakdown = [],
  basePP = 2,
}: PPDetailSidebarProps) {
  const modifiers = pp.maxModifiers ?? [];

  // Calcular totais
  const totalFromArchetypes = useMemo(
    () => archetypeBreakdown.reduce((sum, item) => sum + item.total, 0),
    [archetypeBreakdown]
  );

  const totalFromModifiers = useMemo(
    () => modifiers.reduce((sum, mod) => sum + mod.value, 0),
    [modifiers]
  );

  const calculatedMax = basePP + totalFromArchetypes + totalFromModifiers;

  // Atualizar o max quando os valores mudam
  React.useEffect(() => {
    if (pp.max !== calculatedMax) {
      onChange({ ...pp, max: calculatedMax });
    }
  }, [calculatedMax, pp, onChange]);

  // Handlers para modificadores
  const handleAddModifier = () => {
    const newModifier: Modifier = {
      name: 'Novo modificador',
      value: 0,
      type: 'bonus',
    };
    onChange({
      ...pp,
      maxModifiers: [...modifiers, newModifier],
    });
  };

  const handleUpdateModifier = (index: number, updates: Partial<Modifier>) => {
    const updatedModifiers = modifiers.map((mod, i) =>
      i === index ? { ...mod, ...updates } : mod
    );
    onChange({
      ...pp,
      maxModifiers: updatedModifiers,
    });
  };

  const handleRemoveModifier = (index: number) => {
    const updatedModifiers = modifiers.filter((_, i) => i !== index);
    onChange({
      ...pp,
      maxModifiers: updatedModifiers,
    });
  };

  return (
    <Sidebar open={open} onClose={onClose} title="Pontos de Poder">
      <Stack spacing={3}>
        {/* PP Atual e Temporário */}
        <Paper
          variant="outlined"
          sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                PP Atual
              </Typography>
              <EditableNumber
                value={pp.current}
                onChange={(current) => onChange({ ...pp, current })}
                min={0}
                max={pp.max + pp.temporary}
                validate={(value) => {
                  if (value < 0) return 'PP não pode ser negativo';
                  return null;
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                PP Temporário
              </Typography>
              <EditableNumber
                value={pp.temporary}
                onChange={(temporary) => onChange({ ...pp, temporary })}
                min={0}
                max={999}
              />
            </Box>
          </Stack>
        </Paper>

        <Divider />

        {/* Cálculo do PP Máximo */}
        <Box>
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}
          >
            <FlashOnIcon sx={{ fontSize: 18, color: 'info.main' }} />
            Cálculo do PP Máximo
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}
          >
            <Stack spacing={1.5}>
              {/* PP Base */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">PP Base</Typography>
                <Chip
                  label={basePP}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </Stack>

              {/* Arquétipos */}
              {archetypeBreakdown.length > 0 && (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Arquétipos:
                  </Typography>
                  {archetypeBreakdown.map((item) => (
                    <Stack
                      key={item.name}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ pl: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {item.label}{' '}
                        <Typography component="span" variant="caption">
                          (nv.{item.level} × [{item.basePerLevel}+PRE])
                        </Typography>
                      </Typography>
                      <Chip
                        label={`+${item.total}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Stack>
                  ))}
                </>
              )}

              {/* Modificadores */}
              {modifiers.length > 0 && (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Modificadores:
                  </Typography>
                  {modifiers.map((mod, index) => (
                    <ModifierRow
                      key={index}
                      modifier={mod}
                      onUpdate={(updates) =>
                        handleUpdateModifier(index, updates)
                      }
                      onRemove={() => handleRemoveModifier(index)}
                    />
                  ))}
                </>
              )}

              <Divider sx={{ my: 1 }} />

              {/* Total */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" fontWeight="bold">
                  PP Máximo
                </Typography>
                <Chip
                  label={calculatedMax}
                  size="medium"
                  color="info"
                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {/* Botão para adicionar modificador */}
        <Tooltip title="Adicionar modificador (habilidades especiais, itens, etc.)">
          <Box
            onClick={handleAddModifier}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <AddCircleOutlineIcon color="primary" />
            <Typography variant="body2" color="primary">
              Adicionar Modificador
            </Typography>
          </Box>
        </Tooltip>

        {/* Fórmula explicativa */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          PP Máximo = {basePP} (base) + {totalFromArchetypes} (arquétipos)
          {totalFromModifiers !== 0 &&
            ` ${totalFromModifiers >= 0 ? '+' : ''} ${totalFromModifiers} (mods)`}{' '}
          = {calculatedMax}
        </Typography>
      </Stack>
    </Sidebar>
  );
}

export default PPDetailSidebar;
