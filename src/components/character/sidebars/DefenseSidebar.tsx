'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Tooltip,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar } from '@/components/shared/Sidebar';
import { useDebounce } from '@/hooks/useDebounce';
import type { Character } from '@/types/character';
import type { Modifier } from '@/types/common';

/**
 * Interface para armadura cadastrada
 */
interface RegisteredArmor {
  id: string;
  name: string;
  armorBonus: number;
  maxAgilityBonus: number | null; // null = sem limite
  isActive: boolean;
}

// Chave para armazenar armaduras no localStorage (por personagem)
const getArmorsStorageKey = (characterId: string) => `armors_${characterId}`;

// Funções para persistir armaduras
const loadArmors = (
  characterId: string,
  defaultArmorBonus: number,
  defaultMaxAgility?: number
): RegisteredArmor[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(getArmorsStorageKey(characterId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading armors:', e);
  }

  // Se não há dados salvos mas há armadura no personagem, cria uma entrada
  if (defaultArmorBonus > 0 || defaultMaxAgility !== undefined) {
    return [
      {
        id: '1',
        name: 'Armadura Atual',
        armorBonus: defaultArmorBonus,
        maxAgilityBonus: defaultMaxAgility ?? null,
        isActive: true,
      },
    ];
  }

  return [];
};

const saveArmors = (characterId: string, armors: RegisteredArmor[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      getArmorsStorageKey(characterId),
      JSON.stringify(armors)
    );
  } catch (e) {
    console.error('Error saving armors:', e);
  }
};

export interface DefenseSidebarProps {
  open: boolean;
  character: Character;
  onClose: () => void;
  onUpdate: (updates: Partial<Character>) => void;
}

export default function DefenseSidebar({
  open,
  character,
  onClose,
  onUpdate,
}: DefenseSidebarProps) {
  // Estado local para edição - carrega armaduras persistidas
  const [armors, setArmors] = React.useState<RegisteredArmor[]>(() =>
    loadArmors(
      character.id,
      character.combat.defense.armorBonus,
      character.combat.defense.maxAgilityBonus
    )
  );

  // Recarrega armaduras quando a sidebar abre ou personagem muda
  React.useEffect(() => {
    if (open) {
      const loadedArmors = loadArmors(
        character.id,
        character.combat.defense.armorBonus,
        character.combat.defense.maxAgilityBonus
      );
      setArmors(loadedArmors);
    }
  }, [open, character.id]);

  // Persiste armaduras quando mudam
  React.useEffect(() => {
    saveArmors(character.id, armors);
  }, [armors, character.id]);

  const [shieldBonus, setShieldBonus] = React.useState<number>(
    character.combat.defense.shieldBonus || 0
  );

  const [otherBonuses, setOtherBonuses] = React.useState<Modifier[]>(
    character.combat.defense.otherBonuses || []
  );

  // Estado para nova armadura
  const [showArmorForm, setShowArmorForm] = React.useState(false);
  const [newArmorName, setNewArmorName] = React.useState('');
  const [newArmorBonus, setNewArmorBonus] = React.useState(0);
  const [newArmorMaxAgility, setNewArmorMaxAgility] = React.useState<
    number | ''
  >('');

  // Calcula defesa total para preview
  const activeArmor = armors.find((a) => a.isActive);
  const agilityValue = character.attributes.agilidade;
  const effectiveAgility =
    activeArmor?.maxAgilityBonus !== null &&
    activeArmor?.maxAgilityBonus !== undefined
      ? Math.min(agilityValue, activeArmor.maxAgilityBonus)
      : agilityValue;
  const armorBonusValue = activeArmor?.armorBonus || 0;
  const otherBonusesTotal = otherBonuses.reduce((sum, m) => sum + m.value, 0);
  const totalDefense =
    15 + effectiveAgility + armorBonusValue + shieldBonus + otherBonusesTotal;

  // Estado combinado para debounce
  const defenseState = React.useMemo(
    () => ({
      armors,
      shieldBonus,
      otherBonuses,
      totalDefense,
    }),
    [armors, shieldBonus, otherBonuses, totalDefense]
  );

  // Debounce para auto-save
  const debouncedDefenseState = useDebounce(defenseState, 100);

  // Auto-save quando o estado muda
  React.useEffect(() => {
    if (!open) return;

    const active = debouncedDefenseState.armors.find((a) => a.isActive);

    onUpdate({
      combat: {
        ...character.combat,
        defense: {
          ...character.combat.defense,
          armorBonus: active?.armorBonus || 0,
          maxAgilityBonus: active?.maxAgilityBonus ?? undefined,
          shieldBonus: debouncedDefenseState.shieldBonus,
          otherBonuses: debouncedDefenseState.otherBonuses,
          total: debouncedDefenseState.totalDefense,
        },
      },
    });
  }, [debouncedDefenseState, open]);

  const handleAddArmor = () => {
    if (!newArmorName.trim()) return;

    const newArmor: RegisteredArmor = {
      id: Date.now().toString(),
      name: newArmorName.trim(),
      armorBonus: newArmorBonus,
      maxAgilityBonus: newArmorMaxAgility === '' ? null : newArmorMaxAgility,
      isActive: armors.length === 0, // Primeira armadura é ativa automaticamente
    };

    setArmors([...armors, newArmor]);
    setNewArmorName('');
    setNewArmorBonus(0);
    setNewArmorMaxAgility('');
    setShowArmorForm(false); // Fecha o formulário após adicionar
  };

  const handleRemoveArmor = (id: string) => {
    setArmors(armors.filter((a) => a.id !== id));
  };

  const handleToggleArmor = (id: string) => {
    setArmors(
      armors.map((a) => ({
        ...a,
        isActive: a.id === id, // Apenas uma ativa por vez (Radio behavior)
      }))
    );
  };

  const handleAddOtherBonus = () => {
    setOtherBonuses([
      ...otherBonuses,
      { name: 'Novo Bônus', value: 1, type: 'bonus' },
    ]);
  };

  const handleRemoveOtherBonus = (index: number) => {
    setOtherBonuses(otherBonuses.filter((_, i) => i !== index));
  };

  const handleUpdateOtherBonus = (
    index: number,
    updates: Partial<Modifier>
  ) => {
    setOtherBonuses(
      otherBonuses.map((bonus, i) =>
        i === index ? { ...bonus, ...updates } : bonus
      )
    );
  };

  return (
    <Sidebar open={open} onClose={onClose} title="Defesa">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Preview da Defesa Total */}
        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Defesa Total
          </Typography>
          <Typography variant="h3" color="primary.main" fontWeight="bold">
            {totalDefense}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            15 (base) + {effectiveAgility} (agilidade
            {activeArmor?.maxAgilityBonus !== null
              ? `, máx ${activeArmor?.maxAgilityBonus}`
              : ''}
            ) + {armorBonusValue} (armadura) + {shieldBonus} (escudo) +{' '}
            {otherBonusesTotal} (outros)
          </Typography>
        </Paper>

        <Divider />

        {/* Seção de Armaduras */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Armaduras Cadastradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Marque a armadura que está sendo vestida. Apenas uma pode estar
            ativa.
          </Typography>

          {armors.length > 0 ? (
            <RadioGroup
              value={armors.find((a) => a.isActive)?.id || ''}
              onChange={(e) => handleToggleArmor(e.target.value)}
            >
              <List dense sx={{ mb: 2 }}>
                {armors.map((armor) => (
                  <ListItem
                    key={armor.id}
                    sx={{
                      bgcolor: armor.isActive
                        ? 'action.selected'
                        : 'transparent',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <FormControlLabel
                      value={armor.id}
                      control={<Radio size="small" />}
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <ListItemText
                      primary={armor.name}
                      secondary={`+${armor.armorBonus} defesa${armor.maxAgilityBonus !== null ? `, máx agilidade: ${armor.maxAgilityBonus}` : ', sem limite de agilidade'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveArmor(armor.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </RadioGroup>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: 'italic' }}
            >
              Nenhuma armadura cadastrada
            </Typography>
          )}

          {/* Botão para mostrar formulário de nova armadura */}
          {!showArmorForm ? (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowArmorForm(true)}
              size="small"
              fullWidth
            >
              Adicionar Armadura
            </Button>
          ) : (
            /* Formulário para nova armadura */
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Adicionar Nova Armadura
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  size="small"
                  label="Nome da Armadura"
                  value={newArmorName}
                  onChange={(e) => setNewArmorName(e.target.value)}
                  placeholder="Ex: Cota de Malha"
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  <TextField
                    size="small"
                    type="number"
                    label="Bônus de Defesa"
                    value={newArmorBonus}
                    onChange={(e) => setNewArmorBonus(Number(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                  <Tooltip title="Deixe vazio para sem limite" arrow>
                    <TextField
                      size="small"
                      type="number"
                      label="Máx. Agilidade"
                      value={newArmorMaxAgility}
                      onChange={(e) =>
                        setNewArmorMaxAgility(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Sem limite"
                      inputProps={{ min: 0 }}
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowArmorForm(false);
                      setNewArmorName('');
                      setNewArmorBonus(0);
                      setNewArmorMaxAgility('');
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddArmor}
                    disabled={!newArmorName.trim()}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        <Divider />

        {/* Bônus de Escudo */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Escudo
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Bônus de Escudo"
            value={shieldBonus}
            onChange={(e) => setShieldBonus(Number(e.target.value))}
            inputProps={{ min: 0 }}
            size="small"
          />
        </Box>

        <Divider />

        {/* Outros Bônus */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Outros Bônus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bônus de feitiços, habilidades, itens mágicos, etc.
          </Typography>

          {otherBonuses.length > 0 && (
            <List dense sx={{ mb: 2 }}>
              {otherBonuses.map((bonus, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      size="small"
                      value={bonus.name}
                      onChange={(e) =>
                        handleUpdateOtherBonus(index, { name: e.target.value })
                      }
                      placeholder="Nome do bônus"
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={bonus.value}
                      onChange={(e) =>
                        handleUpdateOtherBonus(index, {
                          value: Number(e.target.value),
                        })
                      }
                      sx={{ width: 80 }}
                      inputProps={{ min: -10, max: 20 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOtherBonus(index)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddOtherBonus}
            size="small"
            fullWidth
          >
            Adicionar Bônus
          </Button>
        </Box>
      </Box>
    </Sidebar>
  );
}
