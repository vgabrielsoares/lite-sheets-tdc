'use client';

/**
 * SkillUsageSidebar - Sidebar de detalhes de usos de habilidade
 *
 * Permite criar, editar e remover usos customizados de uma habilidade,
 * cada um com seu próprio atributo-chave e bônus específico.
 *
 * Funcionalidades:
 * - Listar todos os usos customizados da habilidade
 * - Adicionar novo uso customizado
 * - Editar nome, atributo-chave e bônus de cada uso
 * - Remover usos customizados
 * - Exibir cálculos automáticos para cada uso
 * - Botão de rolagem para cada uso (preparação para Fase 7)
 *
 * Exemplo de uso: "Acrobacia para Equilíbrio em Combate" usando Força ao invés de Agilidade,
 * com um bônus de +2 específico para situações de combate em superfícies estreitas.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Casino as DiceIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from '@mui/icons-material';

import { Sidebar } from '@/components/shared/Sidebar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  InlineModifiers,
  extractDiceModifier,
  extractNumericModifier,
  buildModifiersArray,
} from '@/components/character/skills/ModifierManager';
import type {
  SkillName,
  SkillUse,
  Skill,
  Attributes,
  AttributeName,
  Modifier,
} from '@/types';
import { SKILL_LABELS, ATTRIBUTE_LABELS } from '@/constants';
import { SKILL_DESCRIPTIONS } from '@/types/skills';
import { ATTRIBUTE_LIST } from '@/constants/attributes';
import {
  getDefaultSkillUses,
  isDefaultUseAvailable,
  type DefaultSkillUse,
} from '@/constants/skillUses';
import {
  calculateSkillUseModifier,
  calculateSkillUseRollFormula,
} from '@/utils/skillCalculations';
import { calculateSignatureAbilityBonus } from '@/utils';
import { COMBAT_SKILLS } from '@/constants/skills';

export interface SkillUsageSidebarProps {
  /** Controla se a sidebar está aberta */
  open: boolean;
  /** Callback chamado ao fechar a sidebar */
  onClose: () => void;
  /** Habilidade selecionada */
  skill: Skill;
  /** Atributos do personagem */
  attributes: Attributes;
  /** Nível do personagem (para bônus de assinatura) */
  characterLevel: number;
  /** Se personagem está sobrecarregado */
  isOverloaded: boolean;
  /** Callback quando usos customizados são atualizados */
  onUpdateCustomUses: (skillName: SkillName, customUses: SkillUse[]) => void;
  /** Callback quando atributos de usos padrões são atualizados */
  onUpdateDefaultUseAttributes?: (
    skillName: SkillName,
    overrides: Record<string, AttributeName>
  ) => void;
  /** Callback quando modificadores de usos padrões são atualizados */
  onUpdateDefaultUseModifiers?: (
    skillName: SkillName,
    overrides: Record<string, Modifier[]>
  ) => void;
  /** Callback quando modificadores da habilidade geral são atualizados */
  onUpdateSkillModifiers?: (
    skillName: SkillName,
    modifiers: Modifier[]
  ) => void;
  /** Callback quando habilidade de assinatura é alterada */
  onSignatureAbilityChange?: (skillName: SkillName | null) => void;
  /** Nome da habilidade que é atualmente a assinatura (se houver) */
  currentSignatureSkill?: SkillName | null;
}

interface EditingUse extends Partial<SkillUse> {
  tempId?: string;
}

/**
 * Componente SkillUsageSidebar
 */
export function SkillUsageSidebar({
  open,
  onClose,
  skill,
  attributes,
  characterLevel,
  isOverloaded,
  onUpdateCustomUses,
  onUpdateDefaultUseAttributes,
  onUpdateDefaultUseModifiers,
  onUpdateSkillModifiers,
  onSignatureAbilityChange,
  currentSignatureSkill,
}: SkillUsageSidebarProps) {
  const [editingUse, setEditingUse] = useState<EditingUse | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Estado para editar atributo de uso padrão
  const [editingDefaultUse, setEditingDefaultUse] = useState<string | null>(
    null
  );
  const [localDefaultOverrides, setLocalDefaultOverrides] = useState<
    Record<string, AttributeName>
  >(skill.defaultUseAttributeOverrides || {});

  // Estado para modificadores de uso padrão
  const [localDefaultModifiers, setLocalDefaultModifiers] = useState<
    Record<string, Modifier[]>
  >(skill.defaultUseModifierOverrides || {});

  // Estado para confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [useToDelete, setUseToDelete] = useState<string | null>(null);

  // Estado para confirmação de habilidade de assinatura
  const [signatureConfirmOpen, setSignatureConfirmOpen] = useState(false);
  const [signatureAction, setSignatureAction] = useState<'set' | 'unset'>(
    'set'
  );

  const customUses = skill.customUses || [];
  const isCurrentSignature = currentSignatureSkill === skill.name;

  /**
   * Inicia adição de novo uso customizado
   */
  const handleStartAdd = () => {
    setEditingUse({
      tempId: `temp-${Date.now()}`,
      name: '',
      skillName: skill.name,
      keyAttribute: skill.keyAttribute, // Default: mesmo atributo da habilidade
      bonus: 0,
      description: '',
    });
    setIsAdding(true);
  };

  /**
   * Cancela adição/edição
   */
  const handleCancelEdit = () => {
    setEditingUse(null);
    setIsAdding(false);
  };

  /**
   * Salva novo uso customizado
   */
  const handleSaveNew = () => {
    if (!editingUse || !editingUse.name?.trim()) {
      return;
    }

    const newUse: SkillUse = {
      id: `use-${skill.name}-${Date.now()}`,
      name: editingUse.name.trim(),
      skillName: skill.name,
      keyAttribute: editingUse.keyAttribute || skill.keyAttribute,
      bonus: editingUse.bonus || 0,
      description: editingUse.description?.trim(),
    };

    const updatedUses = [...customUses, newUse];
    onUpdateCustomUses(skill.name, updatedUses);

    setEditingUse(null);
    setIsAdding(false);
  };

  /**
   * Inicia edição de uso existente
   */
  const handleStartEdit = (use: SkillUse) => {
    setEditingUse({ ...use });
    setIsAdding(false);
  };

  /**
   * Salva edição de uso existente
   */
  const handleSaveEdit = () => {
    if (!editingUse || !editingUse.id || !editingUse.name?.trim()) {
      return;
    }

    const updatedUses = customUses.map((use) =>
      use.id === editingUse.id
        ? {
            ...use,
            name: editingUse.name!.trim(),
            keyAttribute: editingUse.keyAttribute || use.keyAttribute,
            bonus: editingUse.bonus || 0,
            description: editingUse.description?.trim(),
          }
        : use
    );

    onUpdateCustomUses(skill.name, updatedUses);

    setEditingUse(null);
  };

  /**
   * Abre diálogo de confirmação para remover uso customizado
   */
  const handleDelete = (useId: string) => {
    setUseToDelete(useId);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirma e remove uso customizado
   */
  const handleConfirmDelete = () => {
    if (!useToDelete) return;

    const updatedUses = customUses.filter((use) => use.id !== useToDelete);
    onUpdateCustomUses(skill.name, updatedUses);

    if (editingUse?.id === useToDelete) {
      setEditingUse(null);
    }

    setDeleteConfirmOpen(false);
    setUseToDelete(null);
  };

  /**
   * Inicia processo de tornar esta habilidade a assinatura
   */
  const handleSetSignature = () => {
    if (currentSignatureSkill && currentSignatureSkill !== skill.name) {
      // Já existe outra habilidade como assinatura
      setSignatureAction('set');
      setSignatureConfirmOpen(true);
    } else {
      // Não há assinatura ou é esta mesma
      if (onSignatureAbilityChange) {
        onSignatureAbilityChange(skill.name);
      }
    }
  };

  /**
   * Inicia processo de remover esta habilidade como assinatura
   */
  const handleUnsetSignature = () => {
    setSignatureAction('unset');
    setSignatureConfirmOpen(true);
  };

  /**
   * Confirma mudança de habilidade de assinatura
   */
  const handleConfirmSignature = () => {
    if (!onSignatureAbilityChange) return;

    if (signatureAction === 'set') {
      onSignatureAbilityChange(skill.name);
    } else {
      onSignatureAbilityChange(null);
    }

    setSignatureConfirmOpen(false);
  };

  /**
   * Cancela exclusão
   */
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUseToDelete(null);
  };

  /**
   * Inicia edição de atributo de uso padrão
   */
  const handleStartEditDefaultUse = (useName: string) => {
    setEditingDefaultUse(useName);
  };

  /**
   * Atualiza atributo personalizado de uso padrão
   */
  const handleUpdateDefaultUseAttribute = (
    useName: string,
    newAttribute: AttributeName
  ) => {
    const newOverrides = {
      ...localDefaultOverrides,
      [useName]: newAttribute,
    };

    setLocalDefaultOverrides(newOverrides);

    if (onUpdateDefaultUseAttributes) {
      onUpdateDefaultUseAttributes(skill.name, newOverrides);
    }

    setEditingDefaultUse(null);
  };

  /**
   * Remove personalização de atributo de uso padrão (volta ao padrão)
   */
  const handleResetDefaultUseAttribute = (useName: string) => {
    const newOverrides = { ...localDefaultOverrides };
    delete newOverrides[useName];

    setLocalDefaultOverrides(newOverrides);

    if (onUpdateDefaultUseAttributes) {
      onUpdateDefaultUseAttributes(skill.name, newOverrides);
    }

    setEditingDefaultUse(null);
  };

  /**
   * Atualiza modificadores de uso padrão
   */
  const handleUpdateDefaultUseModifiers = (
    useName: string,
    diceModifier: number,
    numericModifier: number
  ) => {
    const newModifiers = buildModifiersArray(diceModifier, numericModifier);
    const newOverrides = {
      ...localDefaultModifiers,
      [useName]: newModifiers,
    };

    setLocalDefaultModifiers(newOverrides);

    if (onUpdateDefaultUseModifiers) {
      onUpdateDefaultUseModifiers(skill.name, newOverrides);
    }
  };

  /**
   * Renderiza formulário de edição/adição
   */
  const renderEditForm = () => {
    if (!editingUse) return null;

    const isValid = editingUse.name && editingUse.name.trim().length > 0;

    return (
      <Paper elevation={2} sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600}>
            {isAdding ? 'Novo Uso Customizado' : 'Editar Uso'}
          </Typography>

          <TextField
            label="Nome do Uso"
            value={editingUse.name || ''}
            onChange={(e) =>
              setEditingUse({ ...editingUse, name: e.target.value })
            }
            placeholder="Ex: Acrobacia em Combate"
            fullWidth
            required
            autoFocus
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Atributo-Chave</InputLabel>
            <Select
              value={editingUse.keyAttribute || skill.keyAttribute}
              onChange={(e) =>
                setEditingUse({
                  ...editingUse,
                  keyAttribute: e.target.value as AttributeName,
                })
              }
              label="Atributo-Chave"
            >
              {ATTRIBUTE_LIST.map((attr: AttributeName) => (
                <MenuItem key={attr} value={attr}>
                  {ATTRIBUTE_LABELS[attr]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Descrição (opcional)"
            value={editingUse.description || ''}
            onChange={(e) =>
              setEditingUse({ ...editingUse, description: e.target.value })
            }
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Notas sobre quando usar..."
          />

          {/* Modificadores Inline */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Modificadores
            </Typography>
            <InlineModifiers
              diceModifier={extractDiceModifier(editingUse.modifiers || [])}
              numericModifier={extractNumericModifier(
                editingUse.modifiers || []
              )}
              onUpdate={(dice, numeric) => {
                const newModifiers = buildModifiersArray(dice, numeric);
                setEditingUse({ ...editingUse, modifiers: newModifiers });
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelEdit}
              startIcon={<CloseIcon />}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={isAdding ? handleSaveNew : handleSaveEdit}
              startIcon={<SaveIcon />}
              disabled={!isValid}
            >
              Salvar
            </Button>
          </Box>
        </Stack>
      </Paper>
    );
  };

  /**
   * Renderiza linha compacta de uso customizado
   */
  const renderUseRow = (use: SkillUse) => {
    const isEditing = editingUse?.id === use.id;

    // Calcula modificador e fórmula
    const modifier = calculateSkillUseModifier(
      use,
      skill,
      attributes,
      characterLevel,
      isOverloaded
    );

    const rollFormula = calculateSkillUseRollFormula(
      use,
      skill,
      attributes,
      characterLevel,
      isOverloaded
    );

    const isCustomAttribute = use.keyAttribute !== skill.keyAttribute;

    return (
      <Box
        key={use.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          border: 1,
          borderColor: isEditing ? 'primary.main' : 'divider',
          bgcolor: isEditing ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Nome e Descrição */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {use.name}
          </Typography>
          {use.description && (
            <Tooltip title={use.description} placement="top" arrow>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'help',
                }}
              >
                {use.description}
              </Typography>
            </Tooltip>
          )}
        </Box>

        {/* Atributo */}
        <Chip
          label={ATTRIBUTE_LABELS[use.keyAttribute]}
          size="small"
          variant={isCustomAttribute ? 'filled' : 'outlined'}
          color={isCustomAttribute ? 'primary' : 'default'}
          sx={{ minWidth: 'fit-content' }}
        />

        {/* Bônus (se houver) */}
        {use.bonus !== 0 && (
          <Chip
            label={`${use.bonus >= 0 ? '+' : ''}${use.bonus}`}
            size="small"
            color={use.bonus > 0 ? 'success' : 'error'}
            sx={{ minWidth: 'fit-content' }}
          />
        )}

        {/* Modificadores inline - exibição compacta */}
        {(extractDiceModifier(use.modifiers) !== 0 ||
          extractNumericModifier(use.modifiers) !== 0) && (
          <Box sx={{ display: 'flex', gap: 0.5, minWidth: 'fit-content' }}>
            {extractDiceModifier(use.modifiers) !== 0 && (
              <Chip
                label={`${extractDiceModifier(use.modifiers) >= 0 ? '+' : ''}${extractDiceModifier(use.modifiers)}d20`}
                size="small"
                variant="outlined"
                color={
                  extractDiceModifier(use.modifiers) > 0 ? 'success' : 'error'
                }
              />
            )}
            {extractNumericModifier(use.modifiers) !== 0 && (
              <Chip
                label={`${extractNumericModifier(use.modifiers) >= 0 ? '+' : ''}${extractNumericModifier(use.modifiers)}`}
                size="small"
                variant="outlined"
                color={
                  extractNumericModifier(use.modifiers) > 0
                    ? 'success'
                    : 'error'
                }
              />
            )}
          </Box>
        )}

        {/* Modificador Total */}
        <Tooltip title="Modificador Total">
          <Chip
            label={`${modifier >= 0 ? '+' : ''}${modifier}`}
            size="small"
            sx={{
              minWidth: 'fit-content',
              fontWeight: 600,
              bgcolor: 'action.hover',
            }}
          />
        </Tooltip>

        {/* Fórmula de Rolagem */}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            minWidth: 'fit-content',
            color: 'text.secondary',
          }}
        >
          {rollFormula}
        </Typography>

        {/* Botão de Rolagem */}
        <Tooltip title="Rolar Dados (Em Breve)">
          <span>
            <IconButton
              size="small"
              disabled
              aria-label={`Rolar ${use.name}`}
              sx={{ minWidth: 'fit-content' }}
            >
              <DiceIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Ações */}
        <Box sx={{ display: 'flex', gap: 0.5, minWidth: 'fit-content' }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleStartEdit(use)}
              aria-label={`Editar ${use.name}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(use.id)}
              aria-label={`Remover ${use.name}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  /**
   * Renderiza linha compacta de uso padrão com possibilidade de editar atributo
   */
  const renderDefaultUseRow = (defaultUse: DefaultSkillUse) => {
    // Verifica se há personalização de atributo para este uso
    const customAttribute = localDefaultOverrides[defaultUse.name];
    const useAttribute = customAttribute || skill.keyAttribute;
    const isEditing = editingDefaultUse === defaultUse.name;

    // Verifica se há modificadores personalizados para este uso
    const customModifiers = localDefaultModifiers[defaultUse.name] || [];

    // Usa padrão com atributo personalizado ou padrão da habilidade
    const tempUse = {
      keyAttribute: useAttribute,
      bonus: 0,
      skillName: skill.name,
      modifiers: customModifiers,
    };

    const modifier = calculateSkillUseModifier(
      tempUse,
      skill,
      attributes,
      characterLevel,
      isOverloaded
    );

    const rollFormula = calculateSkillUseRollFormula(
      tempUse,
      skill,
      attributes,
      characterLevel,
      isOverloaded
    );

    const isAvailable = isDefaultUseAvailable(
      defaultUse,
      skill.proficiencyLevel
    );

    return (
      <Box
        key={defaultUse.name}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'transparent',
          opacity: isAvailable ? 1 : 0.4,
          '&:hover': {
            bgcolor: isAvailable ? 'action.hover' : 'transparent',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Nome */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {defaultUse.name}
          </Typography>
        </Box>

        {/* Atributo-Chave (editável se disponível) */}
        {isAvailable && (
          <>
            {isEditing ? (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={customAttribute || skill.keyAttribute}
                  onChange={(e) =>
                    handleUpdateDefaultUseAttribute(
                      defaultUse.name,
                      e.target.value as AttributeName
                    )
                  }
                  autoFocus
                  onBlur={() => setEditingDefaultUse(null)}
                >
                  {ATTRIBUTE_LIST.map((attr: AttributeName) => (
                    <MenuItem key={attr} value={attr}>
                      {ATTRIBUTE_LABELS[attr]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Tooltip
                title={
                  customAttribute
                    ? `Atributo personalizado (padrão: ${ATTRIBUTE_LABELS[skill.keyAttribute]}). Clique para editar.`
                    : 'Atributo-chave. Clique para personalizar.'
                }
              >
                <Chip
                  label={ATTRIBUTE_LABELS[useAttribute]}
                  size="small"
                  color={customAttribute ? 'primary' : 'default'}
                  variant={customAttribute ? 'filled' : 'outlined'}
                  onClick={() =>
                    isAvailable && handleStartEditDefaultUse(defaultUse.name)
                  }
                  sx={{
                    minWidth: 'fit-content',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: customAttribute
                        ? 'primary.dark'
                        : 'action.hover',
                    },
                  }}
                />
              </Tooltip>
            )}

            {/* Botão de reset (se tem personalização) */}
            {customAttribute && !isEditing && (
              <Tooltip title="Resetar para atributo padrão">
                <IconButton
                  size="small"
                  onClick={() =>
                    handleResetDefaultUseAttribute(defaultUse.name)
                  }
                  sx={{ minWidth: 'fit-content' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Modificadores inline */}
            <InlineModifiers
              diceModifier={extractDiceModifier(customModifiers)}
              numericModifier={extractNumericModifier(customModifiers)}
              onUpdate={(dice, numeric) =>
                handleUpdateDefaultUseModifiers(defaultUse.name, dice, numeric)
              }
              disabled={!isAvailable}
            />
          </>
        )}

        {/* Requisito de Proficiência */}
        {defaultUse.requiredProficiency && (
          <Chip
            label={`${
              defaultUse.requiredProficiency.charAt(0).toUpperCase() +
              defaultUse.requiredProficiency.slice(1)
            }+`}
            size="small"
            variant="outlined"
            color={isAvailable ? 'default' : 'error'}
            sx={{ minWidth: 'fit-content' }}
          />
        )}

        {/* Modificador Total */}
        {isAvailable && (
          <>
            <Tooltip title="Modificador Total">
              <Chip
                label={`${modifier >= 0 ? '+' : ''}${modifier}`}
                size="small"
                sx={{
                  minWidth: 'fit-content',
                  fontWeight: 600,
                  bgcolor: 'action.hover',
                }}
              />
            </Tooltip>

            {/* Fórmula de Rolagem */}
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                minWidth: 'fit-content',
                color: 'text.secondary',
              }}
            >
              {rollFormula}
            </Typography>

            {/* Botão de Rolagem */}
            <Tooltip title="Rolar Dados (Em Breve)">
              <span>
                <IconButton
                  size="small"
                  disabled
                  aria-label={`Rolar ${defaultUse.name}`}
                  sx={{ minWidth: 'fit-content' }}
                >
                  <DiceIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {!isAvailable && (
          <Typography
            variant="caption"
            color="error"
            sx={{ minWidth: 'fit-content' }}
          >
            Indisponível
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title={`Usos de ${SKILL_LABELS[skill.name]}`}
      width="lg"
    >
      <Stack spacing={3}>
        {/* Informações da Habilidade Base */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {SKILL_LABELS[skill.name]}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {SKILL_DESCRIPTIONS[skill.name]}
          </Typography>

          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="caption">
              Usos customizados permitem criar variações desta habilidade com
              atributos-chave e bônus diferentes para situações específicas.
            </Typography>
          </Alert>
        </Box>

        <Divider />

        {/* Habilidade de Assinatura */}
        {onSignatureAbilityChange && (
          <>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Habilidade de Assinatura
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Escolha UMA habilidade especial que recebe bônus adicional igual
                ao seu nível
                {COMBAT_SKILLS.includes(skill.name) &&
                  ' (÷3 para habilidades de combate)'}
                .
              </Typography>

              {isCurrentSignature ? (
                <Alert
                  severity="success"
                  icon={<StarIcon />}
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      onClick={handleUnsetSignature}
                    >
                      Remover
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    <strong>{SKILL_LABELS[skill.name]}</strong> é sua Habilidade
                    de Assinatura e recebe{' '}
                    <strong>
                      +
                      {calculateSignatureAbilityBonus(
                        characterLevel,
                        COMBAT_SKILLS.includes(skill.name)
                      )}
                    </strong>{' '}
                    de bônus
                    {COMBAT_SKILLS.includes(skill.name) &&
                      ` (nível ${characterLevel} ÷ 3 = ${Math.floor(characterLevel / 3) || 1})`}
                    .
                  </Typography>
                </Alert>
              ) : (
                <Box>
                  {currentSignatureSkill && (
                    <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>{SKILL_LABELS[currentSignatureSkill]}</strong> é
                        atualmente sua Habilidade de Assinatura. Tornar{' '}
                        <strong>{SKILL_LABELS[skill.name]}</strong> sua
                        assinatura irá substituí-la.
                      </Typography>
                    </Alert>
                  )}
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<StarIcon />}
                    onClick={handleSetSignature}
                    fullWidth
                  >
                    Tornar Habilidade de Assinatura
                  </Button>
                </Box>
              )}
            </Box>

            <Divider />
          </>
        )}

        {/* Modificadores da Habilidade Geral */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Modificadores da Habilidade
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Modificadores aplicados a todos os usos desta habilidade (geral,
            padrões e customizados).
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <InlineModifiers
              diceModifier={extractDiceModifier(skill.modifiers)}
              numericModifier={extractNumericModifier(skill.modifiers)}
              onUpdate={(dice, numeric) => {
                const newModifiers = buildModifiersArray(dice, numeric);
                if (onUpdateSkillModifiers) {
                  onUpdateSkillModifiers(skill.name, newModifiers);
                }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {extractDiceModifier(skill.modifiers) !== 0 && (
                <>
                  {extractDiceModifier(skill.modifiers) > 0 ? '+' : ''}
                  {extractDiceModifier(skill.modifiers)}d20
                  {extractNumericModifier(skill.modifiers) !== 0 ? ', ' : ''}
                </>
              )}
              {extractNumericModifier(skill.modifiers) !== 0 && (
                <>
                  {extractNumericModifier(skill.modifiers) > 0 ? '+' : ''}
                  {extractNumericModifier(skill.modifiers)} numérico
                </>
              )}
              {extractDiceModifier(skill.modifiers) === 0 &&
                extractNumericModifier(skill.modifiers) === 0 &&
                'Nenhum modificador aplicado'}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Formulário de Edição/Adição */}
        {(isAdding || (editingUse && !isAdding)) && (
          <>
            {renderEditForm()}
            <Divider />
          </>
        )}

        {/* Usos Padrões */}
        {(() => {
          const defaultUses = getDefaultSkillUses(skill.name);
          const availableCount = defaultUses.filter((use) =>
            isDefaultUseAvailable(use, skill.proficiencyLevel)
          ).length;

          if (defaultUses.length === 0) return null;

          return (
            <>
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Usos Padrões ({availableCount}/{defaultUses.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Usos predefinidos pelo sistema RPG. Alguns requerem
                    proficiência mínima.
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  {defaultUses.map((use) => renderDefaultUseRow(use))}
                </Stack>
              </Box>

              <Divider />
            </>
          );
        })()}

        {/* Lista de Usos Customizados */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Usos Customizados ({customUses.length})
            </Typography>

            {!isAdding && !editingUse && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleStartAdd}
              >
                Adicionar Uso
              </Button>
            )}
          </Box>

          {customUses.length === 0 && !isAdding && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Nenhum uso customizado criado ainda.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clique em "Adicionar Uso" para criar um novo uso específico
                desta habilidade.
              </Typography>
            </Paper>
          )}

          <Stack spacing={1}>
            {customUses.map((use) => renderUseRow(use))}
          </Stack>
        </Box>
      </Stack>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remover Uso Customizado"
        message="Tem certeza que deseja remover este uso customizado? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Remover"
        cancelText="Cancelar"
      />

      {/* Diálogo de Confirmação de Habilidade de Assinatura */}
      <ConfirmDialog
        open={signatureConfirmOpen}
        title={
          signatureAction === 'set'
            ? 'Tornar Habilidade de Assinatura'
            : 'Remover Habilidade de Assinatura'
        }
        message={
          signatureAction === 'set'
            ? currentSignatureSkill
              ? `Tem certeza que deseja tornar "${SKILL_LABELS[skill.name]}" sua Habilidade de Assinatura? Isso irá remover "${SKILL_LABELS[currentSignatureSkill]}" como sua habilidade especial.`
              : `Tem certeza que deseja tornar "${SKILL_LABELS[skill.name]}" sua Habilidade de Assinatura? Esta habilidade receberá bônus especial igual ao seu nível.`
            : `Tem certeza que deseja remover "${SKILL_LABELS[skill.name]}" como sua Habilidade de Assinatura? Você perderá o bônus especial desta habilidade.`
        }
        onConfirm={handleConfirmSignature}
        onCancel={() => setSignatureConfirmOpen(false)}
        confirmText={
          signatureAction === 'set' ? 'Tornar Assinatura' : 'Remover'
        }
        cancelText="Cancelar"
      />
    </Sidebar>
  );
}
