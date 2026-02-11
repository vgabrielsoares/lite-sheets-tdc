import React, { useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar, EditableNumber } from '@/components/shared';
import { PowerPointsDisplay } from '@/components/character/stats/PowerPointsDisplay';
import { SpellPointsDisplay } from '@/components/character/stats/SpellPointsDisplay';
import type { PowerPoints } from '@/types/combat';
import type { SpellPoints } from '@/types/spells';
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
  /** Se o personagem é conjurador */
  isCaster?: boolean;
  /** Pontos de Feitiço (PF) — apenas se conjurador */
  spellPoints?: SpellPoints;
  /** Callback para atualizar PF */
  onSpellPointsChange?: (spellPoints: SpellPoints) => void;
}

export function PPDetailSidebar({
  open,
  onClose,
  pp,
  onChange,
  archetypeBreakdown = [],
  basePP = 2,
  isCaster = false,
  spellPoints,
  onSpellPointsChange,
}: PPDetailSidebarProps) {
  const modifiers = pp.maxModifiers ?? [];
  const [tempPPInput, setTempPPInput] = useState('');

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

  /** Adicionar PP temporário */
  const handleAddTempPP = useCallback(() => {
    const amount = parseInt(tempPPInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onChange({ ...pp, temporary: (pp.temporary ?? 0) + amount });
      setTempPPInput('');
    }
  }, [tempPPInput, pp, onChange]);

  /** Remover todo PP temporário */
  const handleClearTempPP = useCallback(() => {
    onChange({ ...pp, temporary: 0 });
  }, [pp, onChange]);

  // Handlers para modificadores
  const handleAddModifier = useCallback(() => {
    const newModifier: Modifier = {
      name: 'Novo modificador',
      value: 0,
      type: 'bonus',
    };
    onChange({
      ...pp,
      maxModifiers: [...modifiers, newModifier],
    });
  }, [pp, modifiers, onChange]);

  const handleUpdateModifier = useCallback(
    (index: number, updates: Partial<Modifier>) => {
      const updatedModifiers = modifiers.map((mod, i) =>
        i === index ? { ...mod, ...updates } : mod
      );
      // Se o valor do modificador aumentou, recuperar PP atual automaticamente
      const oldValue = modifiers[index].value;
      const newValue = updates.value ?? oldValue;
      const difference = newValue - oldValue;
      const newCurrent = difference > 0 ? pp.current + difference : pp.current;
      onChange({
        ...pp,
        maxModifiers: updatedModifiers,
        current: newCurrent,
      });
    },
    [pp, modifiers, onChange]
  );

  const handleRemoveModifier = useCallback(
    (index: number) => {
      const updatedModifiers = modifiers.filter((_, i) => i !== index);
      onChange({
        ...pp,
        maxModifiers: updatedModifiers,
      });
    },
    [pp, modifiers, onChange]
  );

  // PF sincronizado com PP max (para o SpellPointsDisplay)
  const syncedSpellPoints: SpellPoints = useMemo(
    () => ({
      current: spellPoints?.current ?? 0,
      max: pp.max, // PF max = PP max sempre
    }),
    [spellPoints, pp.max]
  );

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title="Potencial Energético"
      width="lg"
    >
      <Stack spacing={3}>
        {/* Componente completo de PP com Gastar/Recuperar */}
        <PowerPointsDisplay pp={pp} onChange={onChange} />

        {/* PF para conjuradores */}
        {isCaster && spellPoints && onSpellPointsChange && (
          <SpellPointsDisplay
            spellPoints={syncedSpellPoints}
            pp={pp}
            onChange={(newPF) => onSpellPointsChange(newPF)}
            onPPChange={onChange}
          />
        )}

        <Divider />

        {/* PP Temporário */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <FlashOnIcon
              color="info"
              fontSize="small"
              sx={{ verticalAlign: 'middle', mr: 0.5 }}
            />
            PP Temporário
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            Absorvido antes do PP normal. Obtido por habilidades ou itens.
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={`${pp.temporary ?? 0} PP Temp`}
              color="info"
              variant={(pp.temporary ?? 0) > 0 ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            {(pp.temporary ?? 0) > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleClearTempPP}
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
              value={tempPPInput}
              onChange={(e) => setTempPPInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTempPP();
              }}
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
              sx={{ width: 80 }}
            />
            <Button
              size="small"
              variant="outlined"
              color="info"
              onClick={handleAddTempPP}
              disabled={!tempPPInput || parseInt(tempPPInput, 10) <= 0}
              sx={{ textTransform: 'none', flex: 1 }}
            >
              Adicionar PP Temp
            </Button>
          </Stack>
        </Box>

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

        <Divider />

        {/* Referência rápida de regras */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Referência de Regras
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <FlashOnIcon color="info" fontSize="small" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Pontos de Poder (PP)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Energia para habilidades e magias. Base 2 + bônus de arquétipo
                  por nível. Quando PP = 0, o personagem está Esgotado e não
                  pode conjurar.
                </Typography>
              </Box>
            </Stack>

            {isCaster && (
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AutoFixHighIcon
                  color="secondary"
                  fontSize="small"
                  sx={{ mt: 0.3 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Pontos de Feitiço (PF)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recurso adicional para conjuradores. PF Máximo = PP Máximo.
                    Gastar PF também gasta PP. Gerado via Canalizar Mana.
                  </Typography>
                </Box>
              </Stack>
            )}

            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
              <Typography variant="caption">
                <strong>Limite de PP por Rodada:</strong> Nível + Essência.
                Controla quantos PP podem ser gastos por turno.
              </Typography>
            </Alert>
          </Stack>
        </Box>
      </Stack>
    </Sidebar>
  );
}

export default PPDetailSidebar;
