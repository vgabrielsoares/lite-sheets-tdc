/**
 * GuardVitalitySidebar - Sidebar de detalhes de Guarda (GA) e Vitalidade (PV)
 *
 * v0.0.2: Substitui a antiga HPDetailSidebar.
 * Embed o GuardVitalityDisplay completo dentro de uma Sidebar.
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Alert,
  TextField,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar } from '@/components/shared';
import { GuardVitalityDisplay } from '@/components/character/stats/GuardVitalityDisplay';
import type { GuardPoints, VitalityPoints } from '@/types/combat';
import { PV_RECOVERY_COST } from '@/types/combat';
import type { Modifier } from '@/types/common';

export interface GuardVitalitySidebarProps {
  /** Se a sidebar está aberta */
  open: boolean;
  /** Callback para fechar a sidebar */
  onClose: () => void;
  /** Pontos de Guarda */
  guard: GuardPoints;
  /** Pontos de Vitalidade */
  vitality: VitalityPoints;
  /** Callback para atualizar GA e PV */
  onChange: (guard: GuardPoints, vitality: VitalityPoints) => void;
}

/**
 * Sidebar que exibe e permite editar os valores de Guarda e Vitalidade.
 */
/**
 * Sub-componente para edição de um modificador individual de GA máximo
 */
function GAModifierRow({
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

  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const modifierIdRef = React.useRef(modifier);

  React.useEffect(() => {
    if (modifierIdRef.current !== modifier) {
      setLocalName(modifier.name);
      setLocalValue(modifier.value);
      modifierIdRef.current = modifier;
    }
  }, [modifier]);

  const propagateUpdate = useCallback(
    (value: number) => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        onUpdate({ value, type: value < 0 ? 'penalidade' : 'bonus' });
      }, 150);
    },
    [onUpdate]
  );

  const handleNameBlur = useCallback(() => {
    if (localName !== modifier.name) onUpdate({ name: localName });
  }, [localName, modifier.name, onUpdate]);

  const handleValueBlur = useCallback(() => {
    if (localValue !== modifier.value) {
      onUpdate({
        value: localValue,
        type: localValue < 0 ? 'penalidade' : 'bonus',
      });
    }
  }, [localValue, modifier.value, onUpdate]);

  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1 }}>
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
        <IconButton
          size="small"
          onClick={() =>
            setLocalValue((prev) => {
              const v = prev - 1;
              propagateUpdate(v);
              return v;
            })
          }
        >
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
        <TextField
          size="small"
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(parseInt(e.target.value, 10) || 0)}
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
        <IconButton
          size="small"
          onClick={() =>
            setLocalValue((prev) => {
              const v = prev + 1;
              propagateUpdate(v);
              return v;
            })
          }
        >
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export const GuardVitalitySidebar: React.FC<GuardVitalitySidebarProps> =
  React.memo(function GuardVitalitySidebar({
    open,
    onClose,
    guard,
    vitality,
    onChange,
  }) {
    const [tempGAInput, setTempGAInput] = useState('');

    const modifiers = guard.maxModifiers ?? [];
    const totalFromModifiers = useMemo(
      () => modifiers.reduce((sum, mod) => sum + mod.value, 0),
      [modifiers]
    );

    /** Adicionar GA temporária */
    const handleAddTempGA = useCallback(() => {
      const amount = parseInt(tempGAInput, 10);
      if (!isNaN(amount) && amount > 0) {
        onChange(
          { ...guard, temporary: (guard.temporary ?? 0) + amount },
          vitality
        );
        setTempGAInput('');
      }
    }, [tempGAInput, guard, vitality, onChange]);

    /** Remover toda GA temporária */
    const handleClearTempGA = useCallback(() => {
      onChange({ ...guard, temporary: 0 }, vitality);
    }, [guard, vitality, onChange]);

    /** Adicionar modificador de GA max */
    const handleAddModifier = useCallback(() => {
      const newMod: Modifier = {
        name: 'Novo modificador',
        value: 0,
        type: 'bonus',
      };
      onChange({ ...guard, maxModifiers: [...modifiers, newMod] }, vitality);
    }, [guard, modifiers, vitality, onChange]);

    /** Atualizar um modificador de GA max */
    const handleUpdateModifier = useCallback(
      (index: number, updates: Partial<Modifier>) => {
        const updated = modifiers.map((m, i) =>
          i === index ? { ...m, ...updates } : m
        );
        // Se o valor do modificador aumentou, recuperar a GA atual automaticamente
        const oldValue = modifiers[index].value;
        const newValue = updates.value ?? oldValue;
        const difference = newValue - oldValue;
        const newCurrent =
          difference > 0 ? guard.current + difference : guard.current;
        onChange(
          { ...guard, maxModifiers: updated, current: newCurrent },
          vitality
        );
      },
      [guard, modifiers, vitality, onChange]
    );

    /** Remover modificador de GA max */
    const handleRemoveModifier = useCallback(
      (index: number) => {
        const updated = modifiers.filter((_, i) => i !== index);
        onChange({ ...guard, maxModifiers: updated }, vitality);
      },
      [guard, modifiers, vitality, onChange]
    );

    return (
      <Sidebar
        open={open}
        onClose={onClose}
        title="Guarda & Vitalidade"
        width="lg"
      >
        <Stack spacing={3}>
          {/* Componente completo de GA/PV com Sofrer/Recuperar */}
          <GuardVitalityDisplay
            guard={guard}
            vitality={vitality}
            onChange={onChange}
          />

          <Divider />

          {/* GA Temporária */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              <ShieldIcon
                color="info"
                fontSize="small"
                sx={{ verticalAlign: 'middle', mr: 0.5 }}
              />
              GA Temporária
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Absorvida antes da GA normal. Não conta para o cálculo de PV.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Chip
                label={`${guard.temporary ?? 0} GA Temp`}
                color="info"
                variant={(guard.temporary ?? 0) > 0 ? 'filled' : 'outlined'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              {(guard.temporary ?? 0) > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleClearTempGA}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Limpar
                </Button>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                type="number"
                placeholder="Qtd"
                value={tempGAInput}
                onChange={(e) => setTempGAInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTempGA();
                }}
                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                sx={{ width: 80 }}
              />
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={handleAddTempGA}
                disabled={!tempGAInput || parseInt(tempGAInput, 10) <= 0}
                sx={{ textTransform: 'none', flex: 1 }}
              >
                Adicionar GA Temp
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Modificadores de GA Máximo */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              <ShieldIcon
                color="primary"
                fontSize="small"
                sx={{ verticalAlign: 'middle', mr: 0.5 }}
              />
              Modificadores de GA Máximo
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Bônus ou penalidades permanentes (armaduras, itens, habilidades).
            </Typography>

            {modifiers.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                <Stack spacing={1}>
                  {modifiers.map((mod, index) => (
                    <GAModifierRow
                      key={index}
                      modifier={mod}
                      onUpdate={(updates) =>
                        handleUpdateModifier(index, updates)
                      }
                      onRemove={() => handleRemoveModifier(index)}
                    />
                  ))}
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="text.secondary">
                    Total dos modificadores:
                  </Typography>
                  <Chip
                    label={
                      totalFromModifiers >= 0
                        ? `+${totalFromModifiers}`
                        : totalFromModifiers
                    }
                    size="small"
                    color={totalFromModifiers >= 0 ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </Paper>
            )}

            <Button
              size="small"
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddModifier}
              sx={{
                textTransform: 'none',
                width: '100%',
                borderStyle: 'dashed',
              }}
            >
              Adicionar Modificador
            </Button>
          </Box>

          <Divider />

          {/* Referência rápida de regras */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Referência de Regras
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <ShieldIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Guarda (GA)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Proteção ativa. Base 15 + bônus de arquétipo por nível. Dano
                    atinge GA primeiro. Quando GA = 0, GA máx é reduzida pela
                    metade enquanto PV ≤ 1.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <FavoriteIcon color="error" fontSize="small" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Vitalidade (PV)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saúde real. Calculado como ⌊GA_max ÷ 3⌋. Quando dano excede
                    GA, o excedente vai para PV. PV = 0 causa Ferimento Crítico.
                  </Typography>
                </Box>
              </Stack>

              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
                <Typography variant="caption">
                  <strong>Recuperação de PV:</strong> A cada {PV_RECOVERY_COST}{' '}
                  pontos de recuperação gastos, 1 PV é restaurado. GA se
                  recupera normalmente com descanso.
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </Sidebar>
    );
  });

export default GuardVitalitySidebar;
