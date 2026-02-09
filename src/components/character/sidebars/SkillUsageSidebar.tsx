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

import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  useTheme,
  Collapse,
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
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { Sidebar } from '@/components/shared/Sidebar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { SkillRollButton } from '@/components/character/skills/SkillRollButton';
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
  ProficiencyLevel,
} from '@/types';
import {
  SKILL_LABELS,
  ATTRIBUTE_LABELS,
  SKILL_METADATA,
  SKILL_PROFICIENCY_LABELS,
} from '@/constants';
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
import {
  getKeenSenseBonus,
  PERCEPTION_USE_TO_SENSE,
} from '@/utils/senseCalculations';
import { calculateSignatureAbilityBonus, getCraftMultiplier } from '@/utils';
import { COMBAT_SKILLS } from '@/constants/skills';

/** Lista ordenada de níveis de proficiência para selects */
const PROFICIENCY_LEVEL_LIST: ProficiencyLevel[] = [
  'leigo',
  'adepto',
  'versado',
  'mestre',
];
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
  /** Lista de ofícios (apenas para habilidade "oficio") */
  crafts?: import('@/types').Craft[];
  /** Callback quando ofício é atualizado */
  onUpdateCraft?: (
    craftId: string,
    updates: Partial<import('@/types').Craft>
  ) => void;
  /** Sentidos aguçados da linhagem (para usos de Percepção: Farejar, Observar, Ouvir) */
  keenSenses?: import('@/types').KeenSense[];
  /** Callback quando atributo-chave principal da habilidade é alterado */
  onUpdateKeyAttribute?: (
    skillName: SkillName,
    keyAttribute: AttributeName
  ) => void;
  /** Callback quando nível de proficiência da habilidade é alterado */
  onUpdateProficiency?: (
    skillName: SkillName,
    proficiencyLevel: import('@/types').ProficiencyLevel
  ) => void;
  /** Dados de sorte do personagem (apenas para habilidade "sorte") */
  luck?: import('@/types').LuckLevel;
  /** Callback quando nível de sorte é alterado */
  onLuckLevelChange?: (level: number) => void;
  /** Callback quando modificadores de sorte são alterados */
  onLuckModifiersChange?: (
    diceModifier: number,
    numericModifier: number
  ) => void;
  /** Callback quando o ofício ativo é alterado */
  onSelectedCraftChange?: (skillName: SkillName, craftId: string) => void;
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
  crafts = [],
  onUpdateCraft,
  keenSenses = [],
  onUpdateKeyAttribute,
  onUpdateProficiency,
  luck,
  onLuckLevelChange,
  onLuckModifiersChange,
  onSelectedCraftChange,
}: SkillUsageSidebarProps) {
  const [editingUse, setEditingUse] = useState<EditingUse | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Detectar telas pequenas (menor que xl breakpoint - 1920px)
  // Isso inclui 1080p (1920x1080) que precisa de expansão
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  // Estado para controlar quais usos customizados estão expandidos (em telas pequenas)
  const [expandedCustomUses, setExpandedCustomUses] = useState<Set<string>>(
    new Set()
  );

  // Estado para controlar quais usos padrões estão expandidos (em telas pequenas)
  const [expandedDefaultUses, setExpandedDefaultUses] = useState<Set<string>>(
    new Set()
  );

  // Detectar se é habilidade "oficio"
  const isOficioSkill = skill.name === 'oficio';

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

  // Sincronizar estados locais quando skill mudar (ex: após reload)
  useEffect(() => {
    setLocalDefaultOverrides(skill.defaultUseAttributeOverrides || {});
    setLocalDefaultModifiers(skill.defaultUseModifierOverrides || {});
  }, [skill.defaultUseAttributeOverrides, skill.defaultUseModifierOverrides]);

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
      modifiers: editingUse.modifiers || [],
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
            modifiers: editingUse.modifiers || [],
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
  /**
   * Alterna expansão de um uso customizado (em telas pequenas)
   */
  const toggleCustomUseExpansion = (useId: string) => {
    setExpandedCustomUses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(useId)) {
        newSet.delete(useId);
      } else {
        newSet.add(useId);
      }
      return newSet;
    });
  };

  /**
   * Alterna expansão de um uso padrão (em telas pequenas)
   */
  const toggleDefaultUseExpansion = (useName: string) => {
    setExpandedDefaultUses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(useName)) {
        newSet.delete(useName);
      } else {
        newSet.add(useName);
      }
      return newSet;
    });
  };

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
   * - Em telas pequenas (<1920px), permite expansão vertical
   * - Quando expandido, elementos são empilhados verticalmente
   */
  const renderUseRow = (use: SkillUse) => {
    const isEditing = editingUse?.id === use.id;
    const isExpanded = expandedCustomUses.has(use.id);

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

    // Calcular diceCount e takeLowest para o botão de rolagem
    const attributeValue = attributes[use.keyAttribute];

    const allModifiers = [...(skill.modifiers || []), ...(use.modifiers || [])];

    const diceModifiers = allModifiers
      .filter((mod) => mod.affectsDice === true)
      .reduce((sum, mod) => sum + mod.value, 0);

    // Para atributo 0, rollD20 espera 0 e trata internamente como 2d20 (pega menor)
    // Para outros atributos, passa o valor direto
    const finalDiceCount = attributeValue + diceModifiers;
    const takeLowest = attributeValue === 0;

    const isCustomAttribute = use.keyAttribute !== skill.keyAttribute;

    return (
      <Box
        key={use.id}
        sx={{
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
        {/* Linha principal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isSmallScreen && isExpanded ? 'column' : 'row',
            alignItems: isSmallScreen && isExpanded ? 'stretch' : 'center',
            gap: 1,
            p: 1,
          }}
        >
          {/* Primeira linha: Botão de expansão + Nome */}
          <Box
            onClick={() => isSmallScreen && toggleCustomUseExpansion(use.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: isSmallScreen && isExpanded ? 'none' : 1,
              minWidth: 0,
              cursor: isSmallScreen ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {/* Botão de expansão (apenas em telas pequenas) */}
            {isSmallScreen && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Evita duplo toggle
                  toggleCustomUseExpansion(use.id);
                }}
                sx={{
                  minWidth: 'fit-content',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}

            {/* Nome e Descrição */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={use.name} placement="top" arrow>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'help',
                  }}
                >
                  {use.name}
                </Typography>
              </Tooltip>
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
          </Box>

          {/* Conteúdo visível sempre em telas grandes, ou quando expandido em telas pequenas */}
          {(!isSmallScreen || isExpanded) && (
            <>
              {/* Container para elementos do meio - empilhados verticalmente quando expandido */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isSmallScreen && isExpanded ? 'column' : 'row',
                  gap: isSmallScreen && isExpanded ? 1.5 : 1,
                  alignItems:
                    isSmallScreen && isExpanded ? 'flex-start' : 'center',
                  flex: isSmallScreen && isExpanded ? 'none' : 0,
                  flexWrap: isSmallScreen && !isExpanded ? 'wrap' : 'nowrap',
                }}
              >
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
                  <Box
                    sx={{ display: 'flex', gap: 0.5, minWidth: 'fit-content' }}
                  >
                    {extractDiceModifier(use.modifiers) !== 0 && (
                      <Chip
                        label={`${extractDiceModifier(use.modifiers) >= 0 ? '+' : ''}${extractDiceModifier(use.modifiers)}d20`}
                        size="small"
                        variant="outlined"
                        color={
                          extractDiceModifier(use.modifiers) > 0
                            ? 'success'
                            : 'error'
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
              </Box>

              {/* Ações - sempre na mesma linha */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  minWidth: 'fit-content',
                  alignSelf:
                    isSmallScreen && isExpanded ? 'flex-end' : 'center',
                  ml: isSmallScreen && isExpanded ? 'auto' : 0,
                }}
              >
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

                {/* Botão de Rolagem (mais à direita) */}
                <SkillRollButton
                  skillLabel={`${SKILL_LABELS[skill.name]}: ${use.name}`}
                  attributeValue={attributeValue}
                  proficiencyLevel={skill.proficiencyLevel}
                  diceModifier={diceModifiers}
                  size="small"
                  tooltipText={`Rolar ${use.name}`}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  };

  /**
   * Renderiza linha compacta de uso padrão (similar aos usos customizados)
   * - Em telas pequenas (<1920px), permite expansão vertical
   * - Modificadores só são editáveis ao clicar em "Editar"
   */
  const renderDefaultUseRow = (defaultUse: DefaultSkillUse) => {
    // Verifica se há personalização de atributo para este uso
    const customAttribute = localDefaultOverrides[defaultUse.name];
    const useAttribute = customAttribute || skill.keyAttribute;
    const isEditing = editingDefaultUse === defaultUse.name;
    const isExpanded = expandedDefaultUses.has(defaultUse.name);

    // Verifica se há modificadores personalizados para este uso
    const customModifiers = localDefaultModifiers[defaultUse.name] || [];

    // Para usos de Percepção, adicionar bônus de sentido aguçado
    const effectiveModifiers: Modifier[] = [...customModifiers];
    if (skill.name === 'percepcao') {
      const senseType = PERCEPTION_USE_TO_SENSE[defaultUse.name];
      if (senseType) {
        const keenSenseBonus = getKeenSenseBonus(keenSenses, senseType);
        if (keenSenseBonus !== 0) {
          effectiveModifiers.push({
            name: 'Sentido Aguçado',
            value: keenSenseBonus,
            type: keenSenseBonus > 0 ? 'bonus' : 'penalidade',
            affectsDice: false,
          });
        }
      }
    }

    // Usa padrão com atributo personalizado ou padrão da habilidade
    const tempUse = {
      keyAttribute: useAttribute,
      bonus: 0,
      skillName: skill.name,
      modifiers: effectiveModifiers,
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

    // Calcular diceCount e takeLowest para o botão de rolagem
    const attributeValue = attributes[useAttribute];

    // Combinar modificadores: habilidade base + uso específico (effectiveModifiers)
    const allModifiers = [...(skill.modifiers || []), ...effectiveModifiers];

    const diceModifiers = allModifiers
      .filter((mod) => mod.affectsDice === true)
      .reduce((sum, mod) => sum + mod.value, 0);

    // Para atributo 0, rollD20 espera 0 e trata internamente como 2d20 (pega menor)
    // Para outros atributos, passa o valor direto
    const finalDiceCount = attributeValue + diceModifiers;
    const takeLowest = attributeValue === 0;

    const isAvailable = isDefaultUseAvailable(
      defaultUse,
      skill.proficiencyLevel
    );

    const isCustomAttribute = customAttribute !== undefined;
    const hasCustomModifiers =
      extractDiceModifier(customModifiers) !== 0 ||
      extractNumericModifier(customModifiers) !== 0;

    return (
      <Box
        key={defaultUse.name}
        sx={{
          borderRadius: 1,
          border: 1,
          borderColor: isEditing ? 'primary.main' : 'divider',
          bgcolor: isEditing ? 'action.selected' : 'transparent',
          opacity: isAvailable ? 1 : 0.4,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Linha principal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isSmallScreen && isExpanded ? 'column' : 'row',
            alignItems: isSmallScreen && isExpanded ? 'stretch' : 'center',
            gap: 1,
            p: 1,
            '&:hover': {
              bgcolor: isAvailable ? 'action.hover' : 'transparent',
            },
          }}
        >
          {/* Primeira linha: Botão de expansão + Nome */}
          <Box
            onClick={() =>
              isSmallScreen &&
              isAvailable &&
              toggleDefaultUseExpansion(defaultUse.name)
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: isSmallScreen && isExpanded ? 'none' : 1,
              minWidth: 0,
              cursor: isSmallScreen && isAvailable ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {/* Botão de expansão (apenas em telas pequenas) */}
            {isSmallScreen && isAvailable && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Evita duplo toggle
                  toggleDefaultUseExpansion(defaultUse.name);
                }}
                sx={{
                  minWidth: 'fit-content',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}

            {/* Nome */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={defaultUse.name} placement="top" arrow>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'help',
                  }}
                >
                  {defaultUse.name}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          {/* Conteúdo visível sempre em telas grandes, ou quando expandido em telas pequenas */}
          {(!isSmallScreen || isExpanded) && isAvailable && (
            <>
              {/* Container para elementos do meio - empilhados verticalmente quando expandido */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isSmallScreen && isExpanded ? 'column' : 'row',
                  gap: isSmallScreen && isExpanded ? 1.5 : 1,
                  alignItems:
                    isSmallScreen && isExpanded ? 'flex-start' : 'center',
                  flex: isSmallScreen && isExpanded ? 'none' : 0,
                  flexWrap: isSmallScreen && !isExpanded ? 'wrap' : 'nowrap',
                }}
              >
                {/* Atributo */}
                <Chip
                  label={ATTRIBUTE_LABELS[useAttribute]}
                  size="small"
                  variant={isCustomAttribute ? 'filled' : 'outlined'}
                  color={isCustomAttribute ? 'primary' : 'default'}
                  sx={{ minWidth: 'fit-content' }}
                />

                {/* Modificadores (apenas exibição, não editáveis aqui) */}
                {hasCustomModifiers && !isEditing && (
                  <Box
                    sx={{ display: 'flex', gap: 0.5, minWidth: 'fit-content' }}
                  >
                    {extractDiceModifier(customModifiers) !== 0 && (
                      <Chip
                        label={`${extractDiceModifier(customModifiers) >= 0 ? '+' : ''}${extractDiceModifier(customModifiers)}d20`}
                        size="small"
                        variant="outlined"
                        color={
                          extractDiceModifier(customModifiers) > 0
                            ? 'success'
                            : 'error'
                        }
                      />
                    )}
                    {extractNumericModifier(customModifiers) !== 0 && (
                      <Chip
                        label={`${extractNumericModifier(customModifiers) >= 0 ? '+' : ''}${extractNumericModifier(customModifiers)}`}
                        size="small"
                        variant="outlined"
                        color={
                          extractNumericModifier(customModifiers) > 0
                            ? 'success'
                            : 'error'
                        }
                      />
                    )}
                  </Box>
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
                    color="default"
                    sx={{ minWidth: 'fit-content' }}
                  />
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
              </Box>

              {/* Ações - sempre juntas */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  minWidth: 'fit-content',
                  alignSelf:
                    isSmallScreen && isExpanded ? 'flex-end' : 'center',
                  ml: isSmallScreen && isExpanded ? 'auto' : 0,
                }}
              >
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => handleStartEditDefaultUse(defaultUse.name)}
                    aria-label={`Editar ${defaultUse.name}`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Botão de Rolagem (mais à direita) */}
                <SkillRollButton
                  skillLabel={`${SKILL_LABELS[skill.name]}: ${defaultUse.name}`}
                  attributeValue={attributeValue}
                  proficiencyLevel={skill.proficiencyLevel}
                  diceModifier={diceModifiers}
                  size="small"
                  tooltipText={`Rolar ${defaultUse.name}`}
                />
              </Box>
            </>
          )}

          {/* Indisponível (sem expansão) */}
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

        {/* Área de edição (expandida quando isEditing) */}
        {isAvailable && (
          <Collapse in={isEditing} timeout={300}>
            <Box
              sx={{
                p: 2,
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'action.selected',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Editar Uso Padrão
                </Typography>

                {/* Seletor de Atributo */}
                <FormControl fullWidth size="small">
                  <InputLabel>Atributo-Chave</InputLabel>
                  <Select
                    value={customAttribute || skill.keyAttribute}
                    onChange={(e) =>
                      handleUpdateDefaultUseAttribute(
                        defaultUse.name,
                        e.target.value as AttributeName
                      )
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

                {/* Modificadores editáveis */}
                <Box>
                  <Typography variant="caption" color="text.secondary" mb={1}>
                    Modificadores
                  </Typography>
                  <InlineModifiers
                    diceModifier={extractDiceModifier(customModifiers)}
                    numericModifier={extractNumericModifier(customModifiers)}
                    onUpdate={(dice, numeric) =>
                      handleUpdateDefaultUseModifiers(
                        defaultUse.name,
                        dice,
                        numeric
                      )
                    }
                    disabled={false}
                  />
                </Box>

                {/* Botões de ação */}
                <Box
                  sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                >
                  {customAttribute && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleResetDefaultUseAttribute(defaultUse.name)
                      }
                    >
                      Resetar Atributo
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setEditingDefaultUse(null)}
                  >
                    Concluir
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Collapse>
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
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {SKILL_LABELS[skill.name]}
            </Typography>
            <Tooltip
              title="Usos customizados permitem criar variações desta habilidade com atributos-chave e bônus diferentes para situações específicas."
              enterDelay={150}
            >
              <IconButton size="small" sx={{ color: 'info.main' }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            {SKILL_DESCRIPTIONS[skill.name]}
          </Typography>
        </Box>

        <Divider />

        {/* Configuração da Habilidade - Adaptada por tipo */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Configuração da Habilidade
          </Typography>

          {/* Configuração especial para SORTE */}
          {skill.name === 'sorte' && (
            <>
              <Typography variant="caption" color="text.secondary" paragraph>
                Sorte é uma habilidade especial que usa níveis ao invés de
                proficiência. Cada nível determina quantos dados são rolados e
                qual bônus é aplicado.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Nível de Sorte</InputLabel>
                <Select
                  value={luck?.level ?? 0}
                  onChange={(e) => {
                    if (onLuckLevelChange) {
                      onLuckLevelChange(Number(e.target.value));
                    }
                  }}
                  label="Nível de Sorte"
                  disabled={!onLuckLevelChange}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
                    const formulas: Record<number, string> = {
                      0: '1d20',
                      1: '2d20',
                      2: '2d20+2',
                      3: '3d20+3',
                      4: '3d20+6',
                      5: '4d20+8',
                      6: '4d20+12',
                      7: '5d20+15',
                    };
                    return (
                      <MenuItem key={level} value={level}>
                        Nível {level} ({formulas[level]})
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </>
          )}

          {/* Configuração especial para OFÍCIO */}
          {skill.name === 'oficio' && (
            <>
              <Typography variant="caption" color="text.secondary" paragraph>
                Ofício é uma habilidade especial que usa seus ofícios
                cadastrados. Selecione o ofício ativo para calcular a rolagem.
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Ofício Ativo</InputLabel>
                <Select
                  value={skill.selectedCraftId || ''}
                  onChange={(e) => {
                    if (onSelectedCraftChange) {
                      onSelectedCraftChange(skill.name, e.target.value);
                    }
                  }}
                  label="Ofício Ativo"
                  disabled={!onSelectedCraftChange || crafts.length === 0}
                >
                  <MenuItem value="">
                    <em>Nenhum selecionado</em>
                  </MenuItem>
                  {crafts.map((craft) => (
                    <MenuItem key={craft.id} value={craft.id}>
                      {craft.name} ({ATTRIBUTE_LABELS[craft.attributeKey]}, Nv.
                      {craft.level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {crafts.length === 0 && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Nenhum ofício cadastrado. Adicione ofícios na seção de
                  Competências.
                </Typography>
              )}
            </>
          )}

          {/* Configuração padrão para outras habilidades */}
          {skill.name !== 'sorte' && skill.name !== 'oficio' && (
            <>
              <Typography variant="caption" color="text.secondary" paragraph>
                Atributo-chave e nível de proficiência usados para cálculos
                gerais.
              </Typography>

              <Stack spacing={2}>
                {/* Atributo-Chave Principal */}
                <FormControl fullWidth size="small">
                  <InputLabel>Atributo-Chave</InputLabel>
                  <Select
                    value={skill.keyAttribute}
                    onChange={(e) => {
                      if (onUpdateKeyAttribute) {
                        onUpdateKeyAttribute(
                          skill.name,
                          e.target.value as AttributeName
                        );
                      }
                    }}
                    label="Atributo-Chave"
                    disabled={!onUpdateKeyAttribute}
                  >
                    {ATTRIBUTE_LIST.map((attr: AttributeName) => (
                      <MenuItem key={attr} value={attr}>
                        {ATTRIBUTE_LABELS[attr]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Nível de Proficiência */}
                <FormControl fullWidth size="small">
                  <InputLabel>Proficiência</InputLabel>
                  <Select
                    value={skill.proficiencyLevel}
                    onChange={(e) => {
                      if (onUpdateProficiency) {
                        onUpdateProficiency(
                          skill.name,
                          e.target.value as ProficiencyLevel
                        );
                      }
                    }}
                    label="Proficiência"
                    disabled={!onUpdateProficiency}
                  >
                    {PROFICIENCY_LEVEL_LIST.map((level) => (
                      <MenuItem key={level} value={level}>
                        {SKILL_PROFICIENCY_LABELS[level]} (×
                        {level === 'leigo'
                          ? '0'
                          : level === 'adepto'
                            ? '1'
                            : level === 'versado'
                              ? '2'
                              : '3'}
                        )
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          )}
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
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<StarIcon />}
                  onClick={handleSetSignature}
                  fullWidth
                >
                  Tornar Habilidade de Assinatura
                </Button>
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

        {/* Lista de Usos Customizados ou Ofícios */}
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
              {isOficioSkill
                ? `Ofícios Cadastrados (${crafts.length})`
                : `Usos Customizados (${customUses.length})`}
            </Typography>

            {!isOficioSkill && !isAdding && !editingUse && (
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

          {isOficioSkill ? (
            // Renderizar ofícios para habilidade "oficio"
            <>
              {crafts.length === 0 ? (
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
                    Nenhum ofício cadastrado ainda.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cadastre ofícios na seção "Ofícios (Competências)" abaixo
                    para usá-los aqui.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {crafts.map((craft) => {
                    const attributeValue = attributes[craft.attributeKey];
                    const multiplier = getCraftMultiplier(craft.level);
                    const baseModifier = attributeValue * multiplier;

                    // Calcular bônus de assinatura se aplicável
                    const signatureBonus = skill.isSignature
                      ? calculateSignatureAbilityBonus(
                          characterLevel,
                          SKILL_METADATA[skill.name].isCombatSkill
                        )
                      : 0;

                    const totalModifier =
                      baseModifier + signatureBonus + craft.numericModifier;

                    // Calcular fórmula de rolagem
                    const totalDice = 1 + (craft.diceModifier || 0);
                    const diceCount = Math.abs(totalDice) || 1;
                    const takeLowest = totalDice < 1 || attributeValue === 0;
                    const formula = `${takeLowest ? '-' : ''}${diceCount}d20${totalModifier >= 0 ? '+' : ''}${totalModifier}`;

                    return (
                      <Paper
                        key={craft.id}
                        elevation={1}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Cabeçalho do ofício */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {craft.name}
                              </Typography>
                              {craft.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {craft.description}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={`Nível ${craft.level}`}
                              size="small"
                              color={
                                craft.level === 0
                                  ? 'default'
                                  : craft.level < 3
                                    ? 'primary'
                                    : craft.level < 5
                                      ? 'secondary'
                                      : 'success'
                              }
                            />
                          </Box>

                          {/* Informações do ofício */}
                          <Box
                            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Atributo:{' '}
                              <strong>
                                {ATTRIBUTE_LABELS[craft.attributeKey]}
                              </strong>{' '}
                              ({attributeValue})
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Multiplicador: <strong>×{multiplier}</strong>
                            </Typography>
                            <Typography
                              variant="caption"
                              color="primary"
                              fontWeight={600}
                            >
                              Base: <strong>+{baseModifier}</strong>
                            </Typography>
                            {signatureBonus > 0 && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                                fontWeight={600}
                              >
                                Assinatura: <strong>+{signatureBonus}</strong>
                              </Typography>
                            )}
                          </Box>

                          {/* Modificadores inline */}
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.5, display: 'block' }}
                            >
                              Modificadores Adicionais:
                            </Typography>
                            {onUpdateCraft && (
                              <InlineModifiers
                                diceModifier={craft.diceModifier}
                                numericModifier={craft.numericModifier}
                                onUpdate={(dice, numeric) => {
                                  onUpdateCraft(craft.id, {
                                    diceModifier: dice,
                                    numericModifier: numeric,
                                  });
                                }}
                              />
                            )}
                          </Box>

                          {/* Resultado final */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              pt: 1,
                              borderTop: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1.5,
                                alignItems: 'center',
                              }}
                            >
                              <Chip
                                label={
                                  totalModifier >= 0
                                    ? `+${totalModifier}`
                                    : totalModifier
                                }
                                size="small"
                                color={totalModifier >= 0 ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography
                                variant="body2"
                                fontFamily="monospace"
                                color="primary"
                                fontWeight={700}
                                sx={{ fontSize: '1.1rem' }}
                              >
                                {formula}
                              </Typography>
                            </Box>
                            <SkillRollButton
                              skillLabel={`${SKILL_LABELS[skill.name]}: ${craft.name}`}
                              attributeValue={attributeValue}
                              proficiencyLevel={skill.proficiencyLevel}
                              diceModifier={craft.diceModifier || 0}
                              size="small"
                              tooltipText={`Rolar ${craft.name}`}
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </>
          ) : (
            // Renderizar usos customizados normais
            <>
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
            </>
          )}
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
