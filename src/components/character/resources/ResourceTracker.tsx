'use client';

import React, { useCallback, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CasinoIcon from '@mui/icons-material/Casino';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import type { ResourceDie, ResourceDieRollResult } from '@/types/resources';
import {
  RESOURCE_DIE_SCALE,
  RESOURCE_DIE_SIDES,
  processResourceUse,
  stepUpResourceDie,
  stepDownResourceDie,
} from '@/types/resources';
import {
  PRESET_RESOURCES,
  createResourceFromPreset,
  createCustomResource,
} from '@/constants/resources';
import type { DiceType } from '@/types/common';
import { uuidv4 } from '@/utils/uuid';

// ================================================================
// Constants
// ================================================================

/** Mapeamento de nomes de recursos para ícones */
const RESOURCE_ICON_MAP: Record<string, React.ElementType> = {
  Água: WaterDropIcon,
  Comida: RestaurantIcon,
  Tocha: LocalFireDepartmentIcon,
};

// ================================================================
// Sub-components
// ================================================================

interface ResourceCardProps {
  resource: ResourceDie;
  onUse: (id: string) => void;
  onStepUp: (id: string) => void;
  onStepDown: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onConfigure: (id: string) => void;
  lastRoll: ResourceDieRollResult | null;
}

/**
 * Card individual de um recurso exibindo dado atual, nome e ações.
 */
const ResourceCard = React.memo(function ResourceCard({
  resource,
  onUse,
  onStepUp,
  onStepDown,
  onReset,
  onRemove,
  onConfigure,
  lastRoll,
}: ResourceCardProps) {
  const isDepleted = resource.state === 'depleted' || !resource.currentDie;
  const IconComponent = RESOURCE_ICON_MAP[resource.name] ?? CasinoIcon;

  const dieLabel = resource.currentDie ?? '—';

  // Cor do dado baseada no estado do recurso
  const dieColor = useMemo(() => {
    if (isDepleted) return 'error.main';
    if (!resource.currentDie) return 'text.disabled';
    const idx = RESOURCE_DIE_SCALE.indexOf(resource.currentDie);
    const maxIdx = RESOURCE_DIE_SCALE.indexOf(resource.maxDie);
    const ratio = maxIdx > 0 ? idx / maxIdx : 1;
    if (ratio <= 0.25) return 'error.main';
    if (ratio <= 0.5) return 'warning.main';
    return 'success.main';
  }, [isDepleted, resource.currentDie, resource.maxDie]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isDepleted ? 'error.main' : 'divider',
        opacity: isDepleted ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Icon + Name + Die */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconComponent fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              {resource.name}
            </Typography>
            <Chip
              label={dieLabel}
              size="small"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                bgcolor: dieColor,
                minWidth: 48,
              }}
            />
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Usar recurso (rolar dado)">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onUse(resource.id)}
                  disabled={isDepleted}
                  aria-label={`Usar ${resource.name}`}
                >
                  <CasinoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Aumentar um passo">
              <span>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => onStepUp(resource.id)}
                  disabled={resource.currentDie === resource.maxDie}
                  aria-label={`Aumentar dado de ${resource.name}`}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Diminuir um passo">
              <span>
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => onStepDown(resource.id)}
                  disabled={isDepleted}
                  aria-label={`Diminuir dado de ${resource.name}`}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Resetar ao máximo">
              <span>
                <IconButton
                  size="small"
                  onClick={() => onReset(resource.id)}
                  aria-label={`Resetar ${resource.name}`}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Configurar dados mín/máx">
              <IconButton
                size="small"
                onClick={() => onConfigure(resource.id)}
                aria-label={`Configurar ${resource.name}`}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover recurso">
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(resource.id)}
                aria-label={`Remover ${resource.name}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Roll result feedback */}
        {lastRoll && lastRoll.resourceId === resource.id && (
          <Alert
            severity={lastRoll.isDepleted ? 'error' : 'info'}
            sx={{ mt: 1, py: 0 }}
            icon={<CasinoIcon fontSize="small" />}
          >
            <Typography variant="body2">
              Rolou <strong>{lastRoll.dieRolled}</strong>: obteve{' '}
              <strong>{lastRoll.value}</strong>
              {lastRoll.isDepleted
                ? ' — Recurso esgotado!'
                : lastRoll.isSteppedDown && lastRoll.newDie
                  ? ` — Dado diminuiu para ${lastRoll.newDie}`
                  : ''}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
});

// ================================================================
// Configure Dialog
// ================================================================

interface ConfigureDialogProps {
  open: boolean;
  resource: ResourceDie | null;
  onClose: () => void;
  onSave: (id: string, minDie: DiceType, maxDie: DiceType) => void;
}

function ConfigureResourceDialog({
  open,
  resource,
  onClose,
  onSave,
}: ConfigureDialogProps) {
  const [minDie, setMinDie] = useState<DiceType>('d2');
  const [maxDie, setMaxDie] = useState<DiceType>('d12');

  React.useEffect(() => {
    if (resource) {
      setMinDie(resource.minDie);
      setMaxDie(resource.maxDie);
    }
  }, [resource]);

  const handleSave = () => {
    if (!resource) return;
    // Validate: min must be <= max in the scale
    const minIdx = RESOURCE_DIE_SCALE.indexOf(minDie);
    const maxIdx = RESOURCE_DIE_SCALE.indexOf(maxDie);
    if (minIdx > maxIdx) {
      // Swap
      onSave(resource.id, maxDie, minDie);
    } else {
      onSave(resource.id, minDie, maxDie);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Configurar {resource?.name ?? 'Recurso'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Dado Mínimo</InputLabel>
            <Select
              value={minDie}
              label="Dado Mínimo"
              onChange={(e: SelectChangeEvent) =>
                setMinDie(e.target.value as DiceType)
              }
            >
              {RESOURCE_DIE_SCALE.map((die) => (
                <MenuItem key={die} value={die}>
                  {die} ({RESOURCE_DIE_SIDES[die]} lados)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Dado Máximo</InputLabel>
            <Select
              value={maxDie}
              label="Dado Máximo"
              onChange={(e: SelectChangeEvent) =>
                setMaxDie(e.target.value as DiceType)
              }
            >
              {RESOURCE_DIE_SCALE.map((die) => (
                <MenuItem key={die} value={die}>
                  {die} ({RESOURCE_DIE_SIDES[die]} lados)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ================================================================
// Add Resource Dialog
// ================================================================

interface AddResourceDialogProps {
  open: boolean;
  onClose: () => void;
  onAddPreset: (presetName: string) => void;
  onAddCustom: (name: string) => void;
  existingNames: string[];
}

function AddResourceDialog({
  open,
  onClose,
  onAddPreset,
  onAddCustom,
  existingNames,
}: AddResourceDialogProps) {
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const availablePresets = useMemo(
    () => PRESET_RESOURCES.filter((p) => !existingNames.includes(p.name)),
    [existingNames]
  );

  const handleAddPreset = (name: string) => {
    onAddPreset(name);
    onClose();
  };

  const handleAddCustom = () => {
    const trimmed = customName.trim();
    if (trimmed && !existingNames.includes(trimmed)) {
      onAddCustom(trimmed);
      setCustomName('');
      setShowCustomInput(false);
      onClose();
    }
  };

  const handleClose = () => {
    setCustomName('');
    setShowCustomInput(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Recurso</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {availablePresets.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                Recursos pré-definidos
              </Typography>
              {availablePresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outlined"
                  size="small"
                  onClick={() => handleAddPreset(preset.name)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span>{preset.name}</span>
                    <Chip
                      label={preset.defaultCurrentDie}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Button>
              ))}
            </>
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Recurso personalizado
          </Typography>
          {showCustomInput ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Nome do recurso"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                fullWidth
                autoFocus
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddCustom}
                disabled={
                  !customName.trim() ||
                  existingNames.includes(customName.trim())
                }
              >
                Adicionar
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowCustomInput(true)}
              sx={{ textTransform: 'none' }}
            >
              Criar recurso personalizado
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

// ================================================================
// Main ResourceTracker Component
// ================================================================

export interface ResourceTrackerProps {
  /** Lista de recursos do personagem */
  resources: ResourceDie[];
  /** Callback para atualizar a lista de recursos */
  onUpdateResources: (resources: ResourceDie[]) => void;
}

/**
 * ResourceTracker - Rastreador de dados de recurso
 *
 * Exibe e gerencia os dados de recurso do personagem (água, comida, tochas, etc.).
 * Cada recurso usa um dado que diminui ao ser utilizado:
 * - Resultado ≥ 2: dado diminui um passo
 * - Resultado = 1: recurso esgotado
 *
 * Funcionalidades:
 * - Exibir recursos com dado atual
 * - Usar recurso (rolar dado e aplicar resultado)
 * - Resetar dado ao máximo
 * - Configurar dado mínimo e máximo
 * - Adicionar recursos pré-definidos ou customizados
 * - Remover recursos
 */
export const ResourceTracker = React.memo(function ResourceTracker({
  resources,
  onUpdateResources,
}: ResourceTrackerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null
  );
  const [lastRoll, setLastRoll] = useState<ResourceDieRollResult | null>(null);

  const existingNames = useMemo(
    () => resources.map((r) => r.name),
    [resources]
  );

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === selectedResourceId) ?? null,
    [resources, selectedResourceId]
  );

  // ---- Handlers ----

  /** Rola o dado do recurso e aplica resultado */
  const handleUseResource = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (!resource || !resource.currentDie) return;

      // Rolar o dado
      const sides = RESOURCE_DIE_SIDES[resource.currentDie];
      const rollValue = Math.floor(Math.random() * sides) + 1;

      const result = processResourceUse(resource, rollValue);
      setLastRoll(result);

      // Aplicar resultado
      const updated = resources.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          currentDie: result.newDie,
          state: result.isDepleted
            ? ('depleted' as const)
            : ('active' as const),
        };
      });

      onUpdateResources(updated);
    },
    [resources, onUpdateResources]
  );

  /** Reseta o recurso ao dado máximo */
  const handleResetResource = useCallback(
    (id: string) => {
      const updated = resources.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          currentDie: r.maxDie,
          state: 'active' as const,
        };
      });
      onUpdateResources(updated);
      setLastRoll(null);
    },
    [resources, onUpdateResources]
  );

  /** Aumenta o dado do recurso em um passo */
  const handleStepUpResource = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (!resource) return;

      // Se esgotado (null), começa do minDie; senão, aumenta um passo
      const newDie = resource.currentDie
        ? stepUpResourceDie(resource.currentDie, resource.maxDie)
        : resource.minDie;

      const updated = resources.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          currentDie: newDie,
          state: 'active' as const,
        };
      });
      onUpdateResources(updated);
      setLastRoll(null);
    },
    [resources, onUpdateResources]
  );

  /** Diminui o dado do recurso em um passo */
  const handleStepDownResource = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (!resource || !resource.currentDie) return;

      const newDie = stepDownResourceDie(resource.currentDie, resource.minDie);
      const updated = resources.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          currentDie: newDie,
          state: newDie ? ('active' as const) : ('depleted' as const),
        };
      });
      onUpdateResources(updated);
      setLastRoll(null);
    },
    [resources, onUpdateResources]
  );

  /** Remove um recurso */
  const handleRemoveResource = useCallback(
    (id: string) => {
      const updated = resources.filter((r) => r.id !== id);
      onUpdateResources(updated);
      if (lastRoll?.resourceId === id) setLastRoll(null);
    },
    [resources, onUpdateResources, lastRoll]
  );

  /** Abre o dialog de configuração */
  const handleOpenConfigure = useCallback((id: string) => {
    setSelectedResourceId(id);
    setConfigDialogOpen(true);
  }, []);

  /** Salva a configuração de dado mín/máx */
  const handleSaveConfigure = useCallback(
    (id: string, minDie: DiceType, maxDie: DiceType) => {
      const updated = resources.map((r) => {
        if (r.id !== id) return r;
        // Se o dado atual é maior que o novo máximo, ajustar
        const currentIdx = r.currentDie
          ? RESOURCE_DIE_SCALE.indexOf(r.currentDie)
          : -1;
        const maxIdx = RESOURCE_DIE_SCALE.indexOf(maxDie);
        const newCurrentDie = currentIdx > maxIdx ? maxDie : r.currentDie;
        return {
          ...r,
          minDie,
          maxDie,
          currentDie: newCurrentDie,
        };
      });
      onUpdateResources(updated);
    },
    [resources, onUpdateResources]
  );

  /** Adiciona um recurso a partir de preset */
  const handleAddPreset = useCallback(
    (presetName: string) => {
      const preset = PRESET_RESOURCES.find((p) => p.name === presetName);
      if (!preset) return;
      const newResource = createResourceFromPreset(preset, uuidv4());
      onUpdateResources([...resources, newResource]);
    },
    [resources, onUpdateResources]
  );

  /** Adiciona um recurso customizado */
  const handleAddCustom = useCallback(
    (name: string) => {
      const newResource = createCustomResource(name, uuidv4());
      onUpdateResources([...resources, newResource]);
    },
    [resources, onUpdateResources]
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Dados de Recurso
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          aria-label="Adicionar recurso"
        >
          Adicionar
        </Button>
      </Box>

      {resources.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nenhum recurso adicionado. Clique em &quot;Adicionar&quot; para
          rastrear recursos como Água, Comida, Tochas etc.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onUse={handleUseResource}
              onStepUp={handleStepUpResource}
              onStepDown={handleStepDownResource}
              onReset={handleResetResource}
              onRemove={handleRemoveResource}
              onConfigure={handleOpenConfigure}
              lastRoll={lastRoll}
            />
          ))}
        </Stack>
      )}

      {/* Add Resource Dialog */}
      <AddResourceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddPreset={handleAddPreset}
        onAddCustom={handleAddCustom}
        existingNames={existingNames}
      />

      {/* Configure Resource Dialog */}
      <ConfigureResourceDialog
        open={configDialogOpen}
        resource={selectedResource}
        onClose={() => {
          setConfigDialogOpen(false);
          setSelectedResourceId(null);
        }}
        onSave={handleSaveConfigure}
      />
    </Box>
  );
});
