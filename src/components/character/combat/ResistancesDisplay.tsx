'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { Resistances, DamageReductionEntry, DamageType } from '@/types';
import {
  DAMAGE_TYPES,
  getDamageTypeLabel,
  CONDITIONS,
  getConditionLabel,
  type ConditionId,
} from '@/constants';

export interface ResistancesDisplayProps {
  /** Resistências atuais do personagem */
  resistances: Resistances;
  /** Callback para atualizar as resistências */
  onChange: (resistances: Resistances) => void;
  /** Se está em modo compacto (menos espaçamento) */
  compact?: boolean;
}

/** Categorias de resistência disponíveis */
type ResistanceCategory =
  | 'damageReduction'
  | 'damageResistances'
  | 'damageImmunities'
  | 'damageVulnerabilities'
  | 'conditionImmunities';

interface CategoryInfo {
  key: ResistanceCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  chipColor:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  isCondition?: boolean;
  needsValue?: boolean;
}

const CATEGORY_INFO: CategoryInfo[] = [
  {
    key: 'damageReduction',
    label: 'Redução de Dano (RD)',
    description: 'Reduz o dano recebido por um valor fixo',
    icon: <RemoveCircleOutlineIcon fontSize="small" />,
    color: 'info',
    chipColor: 'info',
    needsValue: true,
  },
  {
    key: 'damageResistances',
    label: 'Resistência Aprimorada',
    description: 'Divide o dano recebido pela metade',
    icon: <ShieldIcon fontSize="small" />,
    color: 'primary',
    chipColor: 'primary',
  },
  {
    key: 'damageImmunities',
    label: 'Imunidade a Dano',
    description: 'Anula todo o dano do tipo',
    icon: <SecurityIcon fontSize="small" />,
    color: 'success',
    chipColor: 'success',
  },
  {
    key: 'damageVulnerabilities',
    label: 'Vulnerabilidade',
    description: 'Multiplica o dano recebido por 1.5x',
    icon: <WarningAmberIcon fontSize="small" />,
    color: 'error',
    chipColor: 'error',
  },
  {
    key: 'conditionImmunities',
    label: 'Imunidade a Condições',
    description: 'Imune aos efeitos da condição',
    icon: <BlockIcon fontSize="small" />,
    color: 'secondary',
    chipColor: 'secondary',
    isCondition: true,
  },
];

/**
 * ResistancesDisplay - Sistema de Gerenciamento de Resistências
 *
 * Permite gerenciar todas as categorias de resistência do personagem:
 * - RD (Redução de Dano): Reduz dano por valor fixo
 * - Resistência Aprimorada: Divide dano por 2
 * - Imunidade a Dano: Anula todo o dano
 * - Vulnerabilidade: Dobra o dano
 * - Imunidade a Condições: Imune aos efeitos
 *
 * Cada categoria permite adicionar/remover tipos de dano ou condições.
 * A interface é intuitiva com chips coloridos e menus de seleção.
 *
 * @example
 * ```tsx
 * <ResistancesDisplay
 *   resistances={character.combat.resistances}
 *   onChange={(resistances) => updateCharacter({ combat: { ...character.combat, resistances } })}
 * />
 * ```
 */
export function ResistancesDisplay({
  resistances: rawResistances,
  onChange,
  compact = false,
}: ResistancesDisplayProps) {
  // Normaliza resistências para garantir que todos os campos existam
  // (necessário para compatibilidade com personagens criados antes da atualização)
  const resistances: Resistances = {
    damageReduction: rawResistances?.damageReduction ?? [],
    damageResistances: rawResistances?.damageResistances ?? [],
    damageImmunities: rawResistances?.damageImmunities ?? [],
    damageVulnerabilities: rawResistances?.damageVulnerabilities ?? [],
    conditionImmunities: rawResistances?.conditionImmunities ?? [],
  };

  // Estado para o menu de adicionar
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCategory, setActiveCategory] =
    useState<ResistanceCategory | null>(null);

  // Estado para o diálogo de RD (precisa de valor)
  const [rdDialogOpen, setRdDialogOpen] = useState(false);
  const [rdType, setRdType] = useState<DamageType | ''>('');
  const [rdValue, setRdValue] = useState<number>(5);

  /**
   * Abre o menu para adicionar item em uma categoria
   */
  const handleOpenMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, category: ResistanceCategory) => {
      // Se for RD, abre o diálogo especial
      if (category === 'damageReduction') {
        setRdDialogOpen(true);
        setRdType('');
        setRdValue(5);
        return;
      }
      setAnchorEl(event.currentTarget);
      setActiveCategory(category);
    },
    []
  );

  /**
   * Fecha o menu
   */
  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setActiveCategory(null);
  }, []);

  /**
   * Adiciona um tipo de dano a uma categoria
   */
  const handleAddDamageType = useCallback(
    (type: DamageType) => {
      if (!activeCategory || activeCategory === 'conditionImmunities') return;

      const key = activeCategory as keyof Pick<
        Resistances,
        'damageResistances' | 'damageImmunities' | 'damageVulnerabilities'
      >;
      const currentList = resistances[key] as DamageType[];

      // Evita duplicatas
      if (currentList.includes(type)) {
        handleCloseMenu();
        return;
      }

      onChange({
        ...resistances,
        [key]: [...currentList, type],
      });
      handleCloseMenu();
    },
    [activeCategory, resistances, onChange, handleCloseMenu]
  );

  /**
   * Adiciona uma condição a imunidades
   */
  const handleAddCondition = useCallback(
    (conditionId: string) => {
      // Evita duplicatas
      if (resistances.conditionImmunities.includes(conditionId)) {
        handleCloseMenu();
        return;
      }

      onChange({
        ...resistances,
        conditionImmunities: [...resistances.conditionImmunities, conditionId],
      });
      handleCloseMenu();
    },
    [resistances, onChange, handleCloseMenu]
  );

  /**
   * Adiciona uma RD com valor
   */
  const handleAddRD = useCallback(() => {
    if (!rdType || rdValue <= 0) return;

    // Verifica se já existe RD para esse tipo
    const existingIndex = resistances.damageReduction.findIndex(
      (rd) => rd.type === rdType
    );

    let newDamageReduction: DamageReductionEntry[];
    if (existingIndex >= 0) {
      // Atualiza o valor existente
      newDamageReduction = [...resistances.damageReduction];
      newDamageReduction[existingIndex] = {
        ...newDamageReduction[existingIndex],
        value: rdValue,
      };
    } else {
      // Adiciona novo
      newDamageReduction = [
        ...resistances.damageReduction,
        { type: rdType, value: rdValue },
      ];
    }

    onChange({
      ...resistances,
      damageReduction: newDamageReduction,
    });
    setRdDialogOpen(false);
  }, [rdType, rdValue, resistances, onChange]);

  /**
   * Remove um tipo de dano de uma categoria
   */
  const handleRemoveDamageType = useCallback(
    (category: ResistanceCategory, type: DamageType) => {
      if (category === 'damageReduction') {
        onChange({
          ...resistances,
          damageReduction: resistances.damageReduction.filter(
            (rd) => rd.type !== type
          ),
        });
      } else if (category !== 'conditionImmunities') {
        const key = category as keyof Pick<
          Resistances,
          'damageResistances' | 'damageImmunities' | 'damageVulnerabilities'
        >;
        onChange({
          ...resistances,
          [key]: (resistances[key] as DamageType[]).filter((t) => t !== type),
        });
      }
    },
    [resistances, onChange]
  );

  /**
   * Remove uma condição de imunidades
   */
  const handleRemoveCondition = useCallback(
    (conditionId: string) => {
      onChange({
        ...resistances,
        conditionImmunities: resistances.conditionImmunities.filter(
          (c) => c !== conditionId
        ),
      });
    },
    [resistances, onChange]
  );

  /**
   * Obtém os itens disponíveis para adicionar (excluindo já adicionados)
   */
  const getAvailableDamageTypes = useCallback(
    (category: ResistanceCategory): DamageType[] => {
      if (category === 'conditionImmunities' || category === 'damageReduction')
        return [];

      const currentList = resistances[
        category as keyof Pick<
          Resistances,
          'damageResistances' | 'damageImmunities' | 'damageVulnerabilities'
        >
      ] as DamageType[];

      return DAMAGE_TYPES.filter((dt) => !currentList.includes(dt.id)).map(
        (dt) => dt.id
      );
    },
    [resistances]
  );

  /**
   * Obtém as condições disponíveis para adicionar
   */
  const getAvailableConditions = useCallback((): ConditionId[] => {
    return CONDITIONS.filter(
      (c) => !resistances.conditionImmunities.includes(c.id)
    ).map((c) => c.id);
  }, [resistances]);

  /**
   * Conta total de itens em todas as categorias
   */
  const totalItems =
    resistances.damageReduction.length +
    resistances.damageResistances.length +
    resistances.damageImmunities.length +
    resistances.damageVulnerabilities.length +
    resistances.conditionImmunities.length;

  /**
   * Renderiza os chips de uma categoria de dano
   */
  const renderDamageChips = (
    category: ResistanceCategory,
    info: CategoryInfo
  ) => {
    if (category === 'conditionImmunities') return null;

    if (category === 'damageReduction') {
      return resistances.damageReduction.map((rd) => (
        <Chip
          key={`rd-${rd.type}`}
          label={`${getDamageTypeLabel(rd.type)} (RD ${rd.value})`}
          color={info.chipColor}
          size="small"
          variant="outlined"
          onDelete={() => handleRemoveDamageType(category, rd.type)}
          deleteIcon={
            <Tooltip title="Remover" arrow enterDelay={150}>
              <DeleteOutlineIcon fontSize="small" />
            </Tooltip>
          }
          sx={{ m: 0.5 }}
        />
      ));
    }

    const list = resistances[
      category as keyof Pick<
        Resistances,
        'damageResistances' | 'damageImmunities' | 'damageVulnerabilities'
      >
    ] as DamageType[];

    return list.map((type) => (
      <Chip
        key={`${category}-${type}`}
        label={getDamageTypeLabel(type)}
        color={info.chipColor}
        size="small"
        variant="outlined"
        onDelete={() => handleRemoveDamageType(category, type)}
        deleteIcon={
          <Tooltip title="Remover" arrow enterDelay={150}>
            <DeleteOutlineIcon fontSize="small" />
          </Tooltip>
        }
        sx={{ m: 0.5 }}
      />
    ));
  };

  /**
   * Renderiza os chips de condições
   */
  const renderConditionChips = (info: CategoryInfo) => {
    return resistances.conditionImmunities.map((conditionId) => (
      <Chip
        key={`condition-${conditionId}`}
        label={getConditionLabel(conditionId as ConditionId)}
        color={info.chipColor}
        size="small"
        variant="outlined"
        onDelete={() => handleRemoveCondition(conditionId)}
        deleteIcon={
          <Tooltip title="Remover" arrow enterDelay={150}>
            <DeleteOutlineIcon fontSize="small" />
          </Tooltip>
        }
        sx={{ m: 0.5 }}
      />
    ));
  };

  /**
   * Obtém o count de itens em uma categoria
   */
  const getCategoryCount = (category: ResistanceCategory): number => {
    switch (category) {
      case 'damageReduction':
        return resistances.damageReduction.length;
      case 'damageResistances':
        return resistances.damageResistances.length;
      case 'damageImmunities':
        return resistances.damageImmunities.length;
      case 'damageVulnerabilities':
        return resistances.damageVulnerabilities.length;
      case 'conditionImmunities':
        return resistances.conditionImmunities.length;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ShieldIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Resistências
          </Typography>
          {totalItems > 0 && (
            <Chip
              size="small"
              label={`${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
              color="default"
              variant="outlined"
            />
          )}
        </Box>

        {totalItems === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}
          >
            Nenhuma resistência, imunidade ou vulnerabilidade configurada.
            <br />
            Use os botões abaixo para adicionar.
          </Typography>
        ) : null}

        {/* Categorias */}
        <Stack spacing={2} divider={<Divider flexItem />}>
          {CATEGORY_INFO.map((info) => {
            const count = getCategoryCount(info.key);
            const hasItems = count > 0;

            return (
              <Box key={info.key}>
                {/* Header da categoria */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: hasItems ? 1 : 0,
                  }}
                >
                  <Tooltip title={info.description} arrow enterDelay={150}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: `${info.color}.main`,
                      }}
                    >
                      {info.icon}
                      <Typography variant="subtitle2" fontWeight="medium">
                        {info.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <IconButton
                    size="small"
                    color={info.color}
                    onClick={(e) => handleOpenMenu(e, info.key)}
                    aria-label={`Adicionar ${info.label}`}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Chips */}
                {hasItems && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: -0.5 }}>
                    {info.isCondition
                      ? renderConditionChips(info)
                      : renderDamageChips(info.key, info)}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Menu de Tipos de Dano */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && activeCategory !== 'conditionImmunities'}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: { maxHeight: 300, width: 220 },
            },
          }}
        >
          {activeCategory &&
            activeCategory !== 'conditionImmunities' &&
            activeCategory !== 'damageReduction' && (
              <>
                {getAvailableDamageTypes(activeCategory).length === 0 ? (
                  <MenuItem disabled>
                    <ListItemText
                      primary="Todos os tipos já adicionados"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </MenuItem>
                ) : (
                  getAvailableDamageTypes(activeCategory).map((type) => (
                    <MenuItem
                      key={type}
                      onClick={() => handleAddDamageType(type)}
                    >
                      <ListItemText primary={getDamageTypeLabel(type)} />
                    </MenuItem>
                  ))
                )}
              </>
            )}
        </Menu>

        {/* Menu de Condições */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && activeCategory === 'conditionImmunities'}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: { maxHeight: 300, width: 220 },
            },
          }}
        >
          {getAvailableConditions().length === 0 ? (
            <MenuItem disabled>
              <ListItemText
                primary="Todas as condições já adicionadas"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </MenuItem>
          ) : (
            getAvailableConditions().map((conditionId) => (
              <MenuItem
                key={conditionId}
                onClick={() => handleAddCondition(conditionId)}
              >
                <ListItemText primary={getConditionLabel(conditionId)} />
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Diálogo para adicionar RD */}
        <Dialog
          open={rdDialogOpen}
          onClose={() => setRdDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Adicionar Redução de Dano</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="rd-type-label">Tipo de Dano</InputLabel>
                <Select
                  labelId="rd-type-label"
                  value={rdType}
                  label="Tipo de Dano"
                  onChange={(e: SelectChangeEvent) =>
                    setRdType(e.target.value as DamageType)
                  }
                >
                  {DAMAGE_TYPES.map((dt) => (
                    <MenuItem key={dt.id} value={dt.id}>
                      {dt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Valor da RD"
                type="number"
                value={rdValue}
                onChange={(e) =>
                  setRdValue(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
                helperText="Quantidade de dano reduzido (mínimo 1)"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRdDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddRD}
              variant="contained"
              disabled={!rdType || rdValue <= 0}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ResistancesDisplay;
