'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Alert,
  Switch,
  FormControlLabel,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Attack, AttackType } from '@/types/combat';
import type { SkillName } from '@/types/skills';
import type { DamageType, DiceType } from '@/types/common';
import type { AttributeName, Character } from '@/types';
import {
  SKILL_LABELS,
  COMBAT_SKILLS,
  SKILL_METADATA,
} from '@/constants/skills';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { calculateAttackRoll } from '@/utils/attackCalculations';
import { getAvailableDefaultUses } from '@/constants/skillUses';

export interface AttackFormProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Callback para fechar o dialog */
  onClose: () => void;
  /** Callback para salvar o ataque */
  onSave: (attack: Attack) => void;
  /** Ataque existente para edição (undefined = novo ataque) */
  editingAttack?: Attack;
  /** Dados do personagem (para acessar habilidades e usos) */
  character: Character;
}

/** Tipos de ataque disponíveis */
const ATTACK_TYPES: { value: AttackType; label: string }[] = [
  { value: 'corpo-a-corpo', label: 'Corpo a Corpo' },
  { value: 'distancia', label: 'Distância' },
  { value: 'magico', label: 'Mágico' },
];

/** Opções de custo de ação (v0.0.2: actionCost em número de ▶) */
const ACTION_COST_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '▶ Ação (1)' },
  { value: 2, label: '▶▶ Ação Dupla (2)' },
  { value: 3, label: '▶▶▶ Ação Tripla (3)' },
  { value: 0, label: '∆ Ação Livre / ↩ Reação (0)' },
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
];

/** Habilidades de ataque secundárias */
const SECONDARY_ATTACK_SKILLS: SkillName[] = [
  'arte',
  'performance',
  'sorte',
  'vigor',
  'determinacao',
  'reflexo',
];

/** Ataque padrão para novo ataque */
const DEFAULT_ATTACK: Attack = {
  name: '',
  type: 'corpo-a-corpo',
  attackSkill: 'acerto',
  attackDiceModifier: 0,
  damageRoll: {
    quantity: 1,
    type: 'd6',
    modifier: 0,
  },
  damageType: 'fisico',
  range: 'Adjacente',
  description: '',
  ppCost: 0,
  actionCost: 1,
  addAttributeToDamage: true,
  doubleAttributeDamage: false,
  isDefaultAttack: false,
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
  character,
}: AttackFormProps) {
  const [attack, setAttack] = useState<Attack>(DEFAULT_ATTACK);
  const [customRange, setCustomRange] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Obter habilidade atual
  const currentSkill = useMemo(() => {
    return character.skills[attack.attackSkill];
  }, [character.skills, attack.attackSkill]);

  // Obter usos padrões disponíveis baseado na proficiência
  const availableDefaultUses = useMemo(() => {
    if (!currentSkill) return [];
    return getAvailableDefaultUses(
      attack.attackSkill,
      currentSkill.proficiencyLevel
    );
  }, [attack.attackSkill, currentSkill]);

  // Obter usos customizados da habilidade selecionada
  const availableCustomUses = useMemo(() => {
    return currentSkill?.customUses || [];
  }, [currentSkill]);

  // Combinar usos padrões e customizados
  const allAvailableUses = useMemo(() => {
    const defaultUsesList = availableDefaultUses.map((use) => ({
      id: `default-${use.name}`,
      name: use.name,
      isDefault: true,
    }));
    const customUsesList = availableCustomUses.map((use) => ({
      id: use.id,
      name: use.name,
      isDefault: false,
    }));
    return [...defaultUsesList, ...customUsesList];
  }, [availableDefaultUses, availableCustomUses]);

  // Obter atributo padrão da habilidade/uso selecionado
  const defaultAttribute = useMemo(() => {
    if (!currentSkill) return 'agilidade' as AttributeName;

    // Se um uso está selecionado, usa o atributo do uso
    if (attack.attackSkillUseId && currentSkill.customUses) {
      const use = currentSkill.customUses.find(
        (u) => u.id === attack.attackSkillUseId
      );
      if (use) return use.keyAttribute;
    }

    // Senão, usa o atributo da habilidade
    return currentSkill.keyAttribute;
  }, [currentSkill, attack.attackSkillUseId]);

  // Calcular preview da fórmula de ataque
  const attackPreview = useMemo(() => {
    return calculateAttackRoll(
      character,
      attack.attackSkill,
      attack.attackSkillUseId,
      attack.attackBonus ?? 0,
      attack.attackAttribute,
      attack.attackDiceModifier || 0
    );
  }, [
    character,
    attack.attackSkill,
    attack.attackSkillUseId,
    attack.attackBonus,
    attack.attackAttribute,
    attack.attackDiceModifier,
  ]);

  // Resetar form quando abrir/fechar ou mudar ataque editado
  useEffect(() => {
    if (open) {
      if (editingAttack) {
        // Garantir que campos novos existam (migração de ataques antigos)
        const attackWithDefaults: Attack = {
          ...editingAttack,
          actionCost: editingAttack.actionCost ?? 1,
          attackDiceModifier: editingAttack.attackDiceModifier ?? 0,
        };
        setAttack(attackWithDefaults);
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
   * Atualiza um campo do dano crítico
   */
  const updateCriticalDamage = useCallback(
    (field: 'quantity' | 'type' | 'modifier', value: number | DiceType) => {
      setAttack((prev) => ({
        ...prev,
        criticalDamage: {
          quantity: prev.criticalDamage?.quantity ?? 0,
          type: prev.criticalDamage?.type ?? 'd6',
          modifier: prev.criticalDamage?.modifier ?? 0,
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
              attack.isDefaultAttack
                ? 'Ataque padrão do sistema - nome não pode ser alterado'
                : attack.name.trim().length === 0
                  ? 'Nome é obrigatório'
                  : undefined
            }
            disabled={attack.isDefaultAttack}
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
              <InputLabel id="action-cost-label">Custo de Ação</InputLabel>
              <Select
                labelId="action-cost-label"
                value={attack.actionCost}
                label="Custo de Ação"
                onChange={(e) =>
                  updateField('actionCost', Number(e.target.value))
                }
              >
                {ACTION_COST_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
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
                onChange={(e) => {
                  updateField('attackSkill', e.target.value as SkillName);
                  // Reset skill use quando mudar a habilidade
                  updateField('attackSkillUseId', undefined);
                  updateField('attackAttribute', undefined);
                }}
              >
                {/* Habilidades de ataque principais primeiro */}
                {ATTACK_SKILLS.map((skill) => {
                  const skillData = character.skills[skill];
                  const formula = calculateAttackRoll(
                    character,
                    skill,
                    undefined,
                    0
                  ).formula;
                  return (
                    <MenuItem key={skill} value={skill}>
                      {SKILL_LABELS[skill]} ({formula})
                    </MenuItem>
                  );
                })}
                <Divider />
                {/* Habilidades secundárias */}
                {SECONDARY_ATTACK_SKILLS.map((skill) => {
                  const formula = calculateAttackRoll(
                    character,
                    skill,
                    undefined,
                    0
                  ).formula;
                  return (
                    <MenuItem key={skill} value={skill}>
                      {SKILL_LABELS[skill]} ({formula})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Bônus Adicional"
              type="number"
              value={attack.attackBonus ?? 0}
              onChange={(e) =>
                updateField('attackBonus', parseInt(e.target.value) || 0)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {(attack.attackBonus ?? 0) >= 0 ? '+' : ''}
                  </InputAdornment>
                ),
              }}
              helperText="Somado aos modificadores da habilidade/uso"
              fullWidth
            />
          </Box>

          {/* Uso de Habilidade e Atributo */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="skill-use-label">Uso de Habilidade</InputLabel>
              <Select
                labelId="skill-use-label"
                value={attack.attackSkillUseId || ''}
                label="Uso de Habilidade"
                onChange={(e) => {
                  updateField('attackSkillUseId', e.target.value || undefined);
                  updateField('attackAttribute', undefined);
                }}
              >
                <MenuItem value="">
                  <em>Usar Habilidade Padrão</em>
                </MenuItem>
                {allAvailableUses.map((use) => {
                  // Calcular fórmula do uso
                  const useFormula = calculateAttackRoll(
                    character,
                    attack.attackSkill,
                    use.id, // Usar o ID correto (inclusive para usos padrões)
                    0
                  ).formula;
                  return (
                    <MenuItem key={use.id} value={use.id}>
                      {use.name} ({useFormula})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="attack-attribute-label">
                Atributo (padrão: {ATTRIBUTE_LABELS[defaultAttribute]})
              </InputLabel>
              <Select
                labelId="attack-attribute-label"
                value={attack.attackAttribute || ''}
                label={`Atributo (padrão: ${ATTRIBUTE_LABELS[defaultAttribute]})`}
                onChange={(e) =>
                  updateField(
                    'attackAttribute',
                    e.target.value
                      ? (e.target.value as AttributeName)
                      : undefined
                  )
                }
              >
                <MenuItem value="">
                  <em>
                    Usar Atributo Padrão ({ATTRIBUTE_LABELS[defaultAttribute]})
                  </em>
                </MenuItem>
                {(Object.keys(ATTRIBUTE_LABELS) as AttributeName[]).map(
                  (attr) => {
                    // Calcular diferença de fórmula usando este atributo
                    const attrFormula = calculateAttackRoll(
                      character,
                      attack.attackSkill,
                      attack.attackSkillUseId,
                      0,
                      attr
                    ).formula;
                    const defaultFormula = calculateAttackRoll(
                      character,
                      attack.attackSkill,
                      attack.attackSkillUseId,
                      0
                    ).formula;
                    const isDefaultAttr = attr === defaultAttribute;

                    return (
                      <MenuItem key={attr} value={attr}>
                        {ATTRIBUTE_LABELS[attr]}
                        {' ('}
                        {attrFormula}
                        {')'}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Modificador de Dados */}
          <TextField
            label="Modificador de Dados"
            type="number"
            value={attack.attackDiceModifier || 0}
            onChange={(e) =>
              updateField('attackDiceModifier', parseInt(e.target.value) || 0)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {(attack.attackDiceModifier || 0) >= 0 ? '+' : ''}
                </InputAdornment>
              ),
            }}
            helperText="Dados adicionais de ataque (+1 = +1d20, -1 = -1d20)"
            fullWidth
          />

          {/* Preview da Rolagem de Ataque */}
          <Alert severity="info" icon={false}>
            <Typography variant="body2" fontWeight="bold">
              Rolagem de Ataque: {attackPreview.formula}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {attackPreview.diceCount}d20 (
              {attack.attackAttribute &&
              ATTRIBUTE_LABELS[attack.attackAttribute as AttributeName]
                ? ATTRIBUTE_LABELS[attack.attackAttribute as AttributeName]
                : ATTRIBUTE_LABELS[defaultAttribute]}
              {attackPreview.useName ? ` - ${attackPreview.useName}` : ''})
              {attackPreview.modifier !== 0 &&
                ` ${attackPreview.modifier >= 0 ? '+' : ''}${attackPreview.modifier}`}
            </Typography>
          </Alert>

          {/* Seção de crítico deprecada em v0.0.2 — mostrar apenas se ataque legado tiver dados */}
          {(attack.criticalRange != null || attack.criticalDamage != null) && (
            <>
              <Divider>
                <Typography variant="caption" color="text.secondary">
                  Crítico (legado)
                </Typography>
              </Divider>

              <Alert severity="warning" sx={{ mb: 1 }}>
                <Typography variant="caption">
                  Em v0.0.2, críticos são determinados pelo Dado de
                  Vulnerabilidade. Estes campos são mantidos apenas para
                  compatibilidade.
                </Typography>
              </Alert>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 3fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Margem de Crítico"
                  type="number"
                  value={attack.criticalRange ?? 20}
                  onChange={(e) =>
                    updateField(
                      'criticalRange',
                      Math.min(20, Math.max(1, parseInt(e.target.value) || 20))
                    )
                  }
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                  helperText="Ex: 20, 19, 18"
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Quantidade"
                    type="number"
                    value={attack.criticalDamage?.quantity ?? 0}
                    onChange={(e) =>
                      updateCriticalDamage(
                        'quantity',
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    inputProps={{ min: 0 }}
                    fullWidth
                    helperText="Dados extras (Crítico Verdadeiro)"
                  />

                  <FormControl fullWidth>
                    <InputLabel id="critical-dice-type-label">
                      Tipo de Dado
                    </InputLabel>
                    <Select
                      labelId="critical-dice-type-label"
                      value={attack.criticalDamage?.type ?? 'd6'}
                      label="Tipo de Dado"
                      onChange={(e) =>
                        updateCriticalDamage('type', e.target.value as DiceType)
                      }
                    >
                      {DICE_TYPES.map((dice) => (
                        <MenuItem key={dice} value={dice}>
                          {dice}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </>
          )}

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

          {/* Número de ataques (legado/opcional) */}
          <TextField
            label="Número de Ataques"
            type="number"
            value={attack.numberOfAttacks ?? 1}
            onChange={(e) =>
              updateField(
                'numberOfAttacks',
                Math.max(1, parseInt(e.target.value) || 1)
              )
            }
            inputProps={{ min: 1 }}
            fullWidth
            helperText="Quantidade de ataques realizados com esta ação (opcional)"
          />

          {/* Switch: Adicionar modificador de atributo ao dano */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={attack.addAttributeToDamage ?? true}
                  onChange={(e) =>
                    updateField('addAttributeToDamage', e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Adicionar modificador de atributo ao dano"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', ml: 7 }}
            >
              Soma o valor do atributo usado no ataque ao dano
            </Typography>

            {/* Switch secundário: Dobrar atributo no dano (só aparece se o primeiro estiver ativo) */}
            <Collapse in={attack.addAttributeToDamage ?? true}>
              <Box sx={{ ml: 4, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={attack.doubleAttributeDamage ?? false}
                      onChange={(e) =>
                        updateField('doubleAttributeDamage', e.target.checked)
                      }
                      color="secondary"
                    />
                  }
                  label="Adicionar o dobro do atributo"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', ml: 7 }}
                >
                  Soma o dobro do valor do atributo ao dano (ao invés de 1x)
                </Typography>
              </Box>
            </Collapse>
          </Box>

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
