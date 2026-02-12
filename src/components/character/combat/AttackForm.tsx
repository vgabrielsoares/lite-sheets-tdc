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
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Attack, AttackType } from '@/types/combat';
import type { SkillName } from '@/types/skills';
import type { DamageType } from '@/types/common';
import type { AttributeName, Character } from '@/types';
import {
  SKILL_LABELS,
  COMBAT_SKILLS,
  SKILL_METADATA,
} from '@/constants/skills';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { calculateAttackPool } from '@/utils/attackCalculations';
import { getAvailableDefaultUses } from '@/constants/skillUses';
import {
  parseDiceNotation,
  parseCriticalNotation,
  formatDiceNotation,
  formatAllDamagePreviews,
  DICE_NOTATION_REGEX,
  CRITICAL_DICE_REGEX,
} from '@/utils/diceRoller';

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

/** Opções de custo de ação (actionCost em número de ▶) */
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
  criticalDice: 1,
  damageType: 'fisico',
  range: 'Adjacente',
  description: '',
  ppCost: 0,
  actionCost: 1,
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

  // State for dice notation text fields
  const [baseDiceStr, setBaseDiceStr] = useState('1d6');
  const [criticalDiceStr, setCriticalDiceStr] = useState('+1d');
  const [bonusDiceStr, setBonusDiceStr] = useState('');
  const [damageModifier, setDamageModifier] = useState(0);

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
    return calculateAttackPool(
      character,
      attack.attackSkill,
      attack.attackSkillUseId,
      attack.attackDiceModifier || 0,
      attack.attackAttribute
    );
  }, [
    character,
    attack.attackSkill,
    attack.attackSkillUseId,
    attack.attackAttribute,
    attack.attackDiceModifier,
  ]);

  // Resetar form quando abrir/fechar ou mudar ataque editado
  useEffect(() => {
    if (open) {
      if (editingAttack) {
        // Garantir que campos novos existam (migração de ataques antigos)
        const migratedCriticalDice =
          editingAttack.criticalDice ??
          editingAttack.criticalDamage?.quantity ??
          1;
        const attackWithDefaults: Attack = {
          ...editingAttack,
          actionCost: editingAttack.actionCost ?? 1,
          attackDiceModifier: editingAttack.attackDiceModifier ?? 0,
          criticalDice: migratedCriticalDice,
        };
        setAttack(attackWithDefaults);
        // Populate text fields from model
        setBaseDiceStr(formatDiceNotation(attackWithDefaults.damageRoll));
        setCriticalDiceStr(`+${migratedCriticalDice}d`);
        setBonusDiceStr(
          attackWithDefaults.bonusDice
            ? formatDiceNotation(attackWithDefaults.bonusDice)
            : ''
        );
        setDamageModifier(attackWithDefaults.damageRoll.modifier);
        // Verificar se o alcance é customizado
        const isCustom =
          editingAttack.range && !RANGE_OPTIONS.includes(editingAttack.range);
        setUseCustomRange(Boolean(isCustom));
        if (isCustom) {
          setCustomRange(editingAttack.range || '');
        }
      } else {
        setAttack(DEFAULT_ATTACK);
        setBaseDiceStr('1d6');
        setCriticalDiceStr('+1d');
        setBonusDiceStr('');
        setDamageModifier(0);
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
   * Atualiza um campo da rolagem de dano via texto (base, bônus)
   * Sincroniza os campos de texto com o modelo Attack
   */
  const syncDamageToModel = useCallback(() => {
    const parsed = parseDiceNotation(baseDiceStr);
    if (parsed) {
      setAttack((prev) => ({
        ...prev,
        damageRoll: {
          quantity: parsed.quantity,
          type: parsed.type,
          modifier: damageModifier,
        },
      }));
    }
  }, [baseDiceStr, damageModifier]);

  // Sync text fields to model when they change
  useEffect(() => {
    syncDamageToModel();
  }, [syncDamageToModel]);

  // Sync criticalDice and bonusDice to model
  useEffect(() => {
    const critNum = parseCriticalNotation(criticalDiceStr);
    setAttack((prev) => ({
      ...prev,
      criticalDice: critNum ?? 1,
    }));
  }, [criticalDiceStr]);

  useEffect(() => {
    if (bonusDiceStr.trim() === '') {
      setAttack((prev) => ({ ...prev, bonusDice: undefined }));
    } else {
      const parsed = parseDiceNotation(bonusDiceStr);
      if (parsed) {
        setAttack((prev) => ({
          ...prev,
          bonusDice: {
            quantity: parsed.quantity,
            type: parsed.type,
            modifier: 0,
          },
        }));
      }
    }
  }, [bonusDiceStr]);

  // Damage formula previews
  const damagePreviews = useMemo(() => {
    const parsed = parseDiceNotation(baseDiceStr);
    if (!parsed) return null;
    const critNum = parseCriticalNotation(criticalDiceStr) ?? 1;
    const bonusParsed = bonusDiceStr.trim()
      ? parseDiceNotation(bonusDiceStr)
      : undefined;
    const baseDice = { ...parsed, modifier: damageModifier };
    const bonus = bonusParsed ? { ...bonusParsed, modifier: 0 } : undefined;
    return formatAllDamagePreviews(baseDice, critNum, bonus);
  }, [baseDiceStr, criticalDiceStr, bonusDiceStr, damageModifier]);

  // Validation helpers for text fields
  const isBaseDiceValid = useMemo(
    () => DICE_NOTATION_REGEX.test(baseDiceStr.trim()),
    [baseDiceStr]
  );
  const isCriticalDiceValid = useMemo(
    () => CRITICAL_DICE_REGEX.test(criticalDiceStr.trim()),
    [criticalDiceStr]
  );
  const isBonusDiceValid = useMemo(
    () =>
      bonusDiceStr.trim() === '' ||
      DICE_NOTATION_REGEX.test(bonusDiceStr.trim()),
    [bonusDiceStr]
  );

  /**
   * Valida se o ataque é válido para salvar
   */
  const isValid = useCallback(() => {
    return (
      attack.name.trim().length > 0 &&
      isBaseDiceValid &&
      isCriticalDiceValid &&
      isBonusDiceValid
    );
  }, [attack, isBaseDiceValid, isCriticalDiceValid, isBonusDiceValid]);

  /**
   * Salva o ataque
   */
  const handleSave = useCallback(() => {
    if (!isValid()) return;

    // Parse text fields into model
    const baseParsed = parseDiceNotation(baseDiceStr);
    const critNum = parseCriticalNotation(criticalDiceStr) ?? 1;
    const bonusParsed = bonusDiceStr.trim()
      ? parseDiceNotation(bonusDiceStr)
      : undefined;

    // Ajustar alcance customizado
    const finalAttack: Attack = {
      ...attack,
      name: attack.name.trim(),
      range: useCustomRange ? customRange.trim() : attack.range,
      description: attack.description?.trim() || undefined,
      damageRoll: baseParsed
        ? {
            quantity: baseParsed.quantity,
            type: baseParsed.type,
            modifier: damageModifier,
          }
        : attack.damageRoll,
      criticalDice: critNum,
      bonusDice: bonusParsed
        ? {
            quantity: bonusParsed.quantity,
            type: bonusParsed.type,
            modifier: 0,
          }
        : undefined,
      // Remove deprecated field
      criticalDamage: undefined,
    };

    onSave(finalAttack);
    onClose();
  }, [
    attack,
    customRange,
    useCustomRange,
    isValid,
    onSave,
    onClose,
    baseDiceStr,
    criticalDiceStr,
    bonusDiceStr,
    damageModifier,
  ]);

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

          {/* Habilidade e Uso de Habilidade */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
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
                  const formula = calculateAttackPool(
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
                  const formula = calculateAttackPool(
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
                  const useFormula = calculateAttackPool(
                    character,
                    attack.attackSkill,
                    use.id,
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
          </Box>

          {/* Atributo e Modificador de Dados */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
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
                    // Calcular fórmula usando este atributo
                    const attrFormula = calculateAttackPool(
                      character,
                      attack.attackSkill,
                      attack.attackSkillUseId,
                      0,
                      attr
                    ).formula;

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
              helperText="+1 = +1d, -1 = -1d"
              fullWidth
            />
          </Box>

          {/* Preview da Rolagem de Ataque */}
          <Alert severity="info" icon={false}>
            <Typography variant="body2" fontWeight="bold">
              Pool de Ataque: {attackPreview.formula}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {attackPreview.diceCount}
              {attackPreview.dieSize} (
              {attack.attackAttribute &&
              ATTRIBUTE_LABELS[attack.attackAttribute as AttributeName]
                ? ATTRIBUTE_LABELS[attack.attackAttribute as AttributeName]
                : ATTRIBUTE_LABELS[defaultAttribute]}
              {attackPreview.useName ? ` - ${attackPreview.useName}` : ''})
              {attackPreview.isPenaltyRoll &&
                ' — Penalidade: usa menor resultado'}
            </Typography>
          </Alert>

          <Divider>
            <Typography variant="caption" color="text.secondary">
              Rolagem de Dano
            </Typography>
          </Divider>

          {/* Dados de dano, campos de texto com regex */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              label="Dado Base"
              value={baseDiceStr}
              onChange={(e) => setBaseDiceStr(e.target.value)}
              placeholder="1d6"
              error={!isBaseDiceValid}
              helperText={!isBaseDiceValid ? 'Ex: d4, 1d6, 2d8' : undefined}
              fullWidth
              slotProps={{
                htmlInput: { autoComplete: 'off' },
              }}
            />

            <TextField
              label="Dado Crítico"
              value={criticalDiceStr}
              onChange={(e) => setCriticalDiceStr(e.target.value)}
              placeholder="+1d"
              error={!isCriticalDiceValid}
              helperText={
                !isCriticalDiceValid ? 'Ex: +1d, +2d' : 'Dados extras (3+✶)'
              }
              fullWidth
              slotProps={{
                htmlInput: { autoComplete: 'off' },
              }}
            />

            <TextField
              label="Dado Bônus"
              value={bonusDiceStr}
              onChange={(e) => setBonusDiceStr(e.target.value)}
              placeholder="Nenhum"
              error={!isBonusDiceValid}
              helperText={!isBonusDiceValid ? 'Ex: d4, 1d6' : 'Opcional'}
              fullWidth
              slotProps={{
                htmlInput: { autoComplete: 'off' },
              }}
            />

            <TextField
              label="Modificador"
              type="number"
              value={damageModifier}
              onChange={(e) => setDamageModifier(parseInt(e.target.value) || 0)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {damageModifier >= 0 ? '+' : ''}
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

          {/* Preview da Rolagem de Dano */}
          {damagePreviews && (
            <Alert severity="info" icon={false}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Fórmulas de Dano
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  0✶ Raspão: {damagePreviews.raspao}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  1✶ Normal: {damagePreviews.normal}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2✶ Em Cheio: {damagePreviews.emCheio}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  3+✶ Crítico: {damagePreviews.critico}
                </Typography>
              </Stack>
            </Alert>
          )}
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
