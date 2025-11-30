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
} from '@mui/icons-material';

import { Sidebar } from '@/components/shared/Sidebar';
import type {
  SkillName,
  SkillUse,
  Skill,
  Attributes,
  AttributeName,
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

  const customUses = skill.customUses || [];

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
   * Remove uso customizado
   */
  const handleDelete = (useId: string) => {
    const updatedUses = customUses.filter((use) => use.id !== useId);
    onUpdateCustomUses(skill.name, updatedUses);

    if (editingUse?.id === useId) {
      setEditingUse(null);
    }
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
            label="Bônus Específico"
            type="number"
            value={editingUse.bonus || 0}
            onChange={(e) =>
              setEditingUse({
                ...editingUse,
                bonus: parseInt(e.target.value) || 0,
              })
            }
            fullWidth
            size="small"
            helperText="Bônus adicional para este uso específico"
          />

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
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {use.description}
            </Typography>
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

    // Usa padrão com atributo personalizado ou padrão da habilidade
    const tempUse = {
      keyAttribute: useAttribute,
      bonus: 0,
      skillName: skill.name,
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
    </Sidebar>
  );
}
