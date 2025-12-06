'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Attack, AttackType, ActionType } from '@/types/combat';
import type { SkillName } from '@/types/skills';
import type { DamageType, DiceType } from '@/types/common';
import {
  SKILL_LABELS,
  COMBAT_SKILLS,
  SKILL_METADATA,
} from '@/constants/skills';

export interface AttackFormProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Callback para fechar o dialog */
  onClose: () => void;
  /** Callback para salvar o ataque */
  onSave: (attack: Attack) => void;
  /** Ataque existente para edição (undefined = novo ataque) */
  editingAttack?: Attack;
}

/** Tipos de ataque disponíveis */
const ATTACK_TYPES: { value: AttackType; label: string }[] = [
  { value: 'corpo-a-corpo', label: 'Corpo a Corpo' },
  { value: 'distancia', label: 'Distância' },
  { value: 'magico', label: 'Mágico' },
];

/** Tipos de ação disponíveis */
const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'maior', label: 'Ação Maior' },
  { value: 'menor', label: 'Ação Menor' },
  { value: '2-menores', label: '2 Ações Menores' },
  { value: 'livre', label: 'Ação Livre' },
  { value: 'reacao', label: 'Reação' },
  { value: 'reacao-defensiva', label: 'Reação Defensiva' },
];

/** Tipos de dano disponíveis */
const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: 'acido', label: 'Ácido' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'fisico', label: 'Físico' },
  { value: 'corte', label: 'Corte' },
  { value: 'perfuracao', label: 'Perfuração' },
  { value: 'impacto', label: 'Impacto' },
  { value: 'fogo', label: 'Fogo' },
  { value: 'frio', label: 'Frio' },
  { value: 'interno', label: 'Interno' },
  { value: 'mental', label: 'Mental' },
  { value: 'mistico', label: 'Místico' },
  { value: 'profano', label: 'Profano' },
  { value: 'sagrado', label: 'Sagrado' },
  { value: 'sonoro', label: 'Sonoro' },
  { value: 'veneno', label: 'Veneno' },
];

/** Tipos de dados disponíveis */
const DICE_TYPES: DiceType[] = [
  'd2',
  'd3',
  'd4',
  'd6',
  'd8',
  'd10',
  'd12',
  'd20',
];

/** Alcances predefinidos */
const RANGE_OPTIONS = [
  'Pessoal',
  'Adjacente/Toque (1m)',
  'Curto (5m)',
  'Médio (10m)',
  'Longo (30m)',
  'Muito Longo (60m)',
  'Ilimitado',
];

/** Habilidades de ataque principais */
const ATTACK_SKILLS: SkillName[] = [
  'acerto',
  'luta',
  'arcano',
  'natureza',
  'religiao',
  'arte',
  'performance',
  'sorte',
  'vigor',
];

/** Ataque padrão para novo ataque */
const DEFAULT_ATTACK: Attack = {
  name: '',
  type: 'corpo-a-corpo',
  attackSkill: 'acerto',
  attackBonus: 0,
  damageRoll: {
    quantity: 1,
    type: 'd6',
    modifier: 0,
  },
  damageType: 'fisico',
  range: 'Adjacente',
  description: '',
  ppCost: 0,
  actionType: 'maior',
};

/**
 * Formulário para criar/editar ataques
 *
 * Permite configurar:
 * - Nome do ataque
 * - Tipo de ataque (corpo a corpo, distância, mágico)
 * - Habilidade usada (Acerto, Luta, Arcano, etc.)
 * - Bônus de ataque
 * - Rolagem de dano (quantidade, tipo de dado, modificador)
 * - Tipo de dano
 * - Alcance
 * - Custo em PP
 * - Tipo de ação
 * - Descrição
 *
 * @example
 * ```tsx
 * <AttackForm
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSave={handleSaveAttack}
 *   editingAttack={selectedAttack}
 * />
 * ```
 */
export function AttackForm({
  open,
  onClose,
  onSave,
  editingAttack,
}: AttackFormProps) {
  const [attack, setAttack] = useState<Attack>(DEFAULT_ATTACK);
  const [customRange, setCustomRange] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Resetar form quando abrir/fechar ou mudar ataque editado
  useEffect(() => {
    if (open) {
      if (editingAttack) {
        setAttack(editingAttack);
        // Verificar se o alcance é customizado
        const isCustom =
          editingAttack.range && !RANGE_OPTIONS.includes(editingAttack.range);
        setUseCustomRange(Boolean(isCustom));
        if (isCustom) {
          setCustomRange(editingAttack.range || '');
        }
      } else {
        setAttack(DEFAULT_ATTACK);
        setCustomRange('');
        setUseCustomRange(false);
      }
    }
  }, [open, editingAttack]);

  /**
   * Atualiza um campo do ataque
   */
  const updateField = useCallback(
    <K extends keyof Attack>(field: K, value: Attack[K]) => {
      setAttack((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Atualiza um campo da rolagem de dano
   */
  const updateDamageRoll = useCallback(
    (field: 'quantity' | 'type' | 'modifier', value: number | DiceType) => {
      setAttack((prev) => ({
        ...prev,
        damageRoll: {
          ...prev.damageRoll,
          [field]: value,
        },
      }));
    },
    []
  );

  /**
   * Valida se o ataque é válido para salvar
   */
  const isValid = useCallback(() => {
    return attack.name.trim().length > 0 && attack.damageRoll.quantity > 0;
  }, [attack]);

  /**
   * Salva o ataque
   */
  const handleSave = useCallback(() => {
    if (!isValid()) return;

    // Ajustar alcance customizado
    const finalAttack: Attack = {
      ...attack,
      name: attack.name.trim(),
      range: useCustomRange ? customRange.trim() : attack.range,
      description: attack.description?.trim() || undefined,
    };

    onSave(finalAttack);
    onClose();
  }, [attack, customRange, useCustomRange, isValid, onSave, onClose]);

  const isEditing = !!editingAttack;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="attack-form-title"
    >
      <DialogTitle
        id="attack-form-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {isEditing ? <SaveIcon /> : <AddIcon />}
        {isEditing ? 'Editar Ataque' : 'Novo Ataque'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Nome do ataque */}
          <TextField
            label="Nome do Ataque"
            value={attack.name}
            onChange={(e) => updateField('name', e.target.value)}
            fullWidth
            required
            placeholder="Ex: Espada Longa, Bola de Fogo, Arco Longo"
            error={attack.name.trim().length === 0}
            helperText={
              attack.name.trim().length === 0 ? 'Nome é obrigatório' : undefined
            }
          />

          {/* Tipo de ataque e Tipo de ação */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="attack-type-label">Tipo de Ataque</InputLabel>
              <Select
                labelId="attack-type-label"
                value={attack.type}
                label="Tipo de Ataque"
                onChange={(e) =>
                  updateField('type', e.target.value as AttackType)
                }
              >
                {ATTACK_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="action-type-label">Tipo de Ação</InputLabel>
              <Select
                labelId="action-type-label"
                value={attack.actionType}
                label="Tipo de Ação"
                onChange={(e) =>
                  updateField('actionType', e.target.value as ActionType)
                }
              >
                {ACTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Rolagem de Ataque
            </Typography>
          </Divider>

          {/* Habilidade e Bônus de ataque */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="attack-skill-label">Habilidade Usada</InputLabel>
              <Select
                labelId="attack-skill-label"
                value={attack.attackSkill}
                label="Habilidade Usada"
                onChange={(e) =>
                  updateField('attackSkill', e.target.value as SkillName)
                }
              >
                {/* Habilidades de ataque principais primeiro */}
                {ATTACK_SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {SKILL_LABELS[skill]}
                  </MenuItem>
                ))}
                <Divider />
                {/* Outras habilidades de combate */}
                {COMBAT_SKILLS.filter(
                  (skill) => !ATTACK_SKILLS.includes(skill)
                ).map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {SKILL_LABELS[skill]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Bônus de Ataque"
              type="number"
              value={attack.attackBonus}
              onChange={(e) =>
                updateField('attackBonus', parseInt(e.target.value) || 0)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {attack.attackBonus >= 0 ? '+' : ''}
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Rolagem de Dano
            </Typography>
          </Divider>

          {/* Dados de dano */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              label="Quantidade"
              type="number"
              value={attack.damageRoll.quantity}
              onChange={(e) =>
                updateDamageRoll(
                  'quantity',
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              inputProps={{ min: 1 }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="dice-type-label">Dado</InputLabel>
              <Select
                labelId="dice-type-label"
                value={attack.damageRoll.type}
                label="Dado"
                onChange={(e) =>
                  updateDamageRoll('type', e.target.value as DiceType)
                }
              >
                {DICE_TYPES.map((dice) => (
                  <MenuItem key={dice} value={dice}>
                    {dice}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Modificador"
              type="number"
              value={attack.damageRoll.modifier}
              onChange={(e) =>
                updateDamageRoll('modifier', parseInt(e.target.value) || 0)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {attack.damageRoll.modifier >= 0 ? '+' : ''}
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>

          {/* Tipo de dano */}
          <FormControl fullWidth>
            <InputLabel id="damage-type-label">Tipo de Dano</InputLabel>
            <Select
              labelId="damage-type-label"
              value={attack.damageType}
              label="Tipo de Dano"
              onChange={(e) =>
                updateField('damageType', e.target.value as DamageType)
              }
            >
              {DAMAGE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Detalhes Adicionais
            </Typography>
          </Divider>

          {/* Alcance */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {!useCustomRange ? (
              <FormControl fullWidth>
                <InputLabel id="range-label">Alcance</InputLabel>
                <Select
                  labelId="range-label"
                  value={attack.range || 'Adjacente'}
                  label="Alcance"
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setUseCustomRange(true);
                      setCustomRange('');
                    } else {
                      updateField('range', e.target.value);
                    }
                  }}
                >
                  {RANGE_OPTIONS.map((range) => (
                    <MenuItem key={range} value={range}>
                      {range}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem value="__custom__">Personalizado...</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Alcance Personalizado"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="Ex: 15m, Área de 6m"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setUseCustomRange(false);
                        updateField('range', 'Adjacente');
                      }}
                      aria-label="Usar alcance padrão"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            )}

            <TextField
              label="Custo em PP"
              type="number"
              value={attack.ppCost || 0}
              onChange={(e) =>
                updateField(
                  'ppCost',
                  Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              inputProps={{ min: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">PP</InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>

          {/* Descrição */}
          <TextField
            label="Descrição (opcional)"
            value={attack.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            multiline
            rows={3}
            placeholder="Descreva efeitos especiais, condições, etc."
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid()}
          startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
        >
          {isEditing ? 'Salvar Alterações' : 'Adicionar Ataque'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
