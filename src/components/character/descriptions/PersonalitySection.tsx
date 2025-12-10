/**
 * PersonalitySection - Definidores do Personagem
 *
 * Exibe e permite editar características pessoais do personagem:
 * - Falhas
 * - Medos
 * - Ideais
 * - Traços
 * - Objetivos
 * - Aliados
 * - Organizações
 *
 * Permite múltiplas entradas em cada categoria usando chips editáveis.
 *
 * Fase 7 - Issue 7.6 - MVP 1
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  IconButton,
  Stack,
  Paper,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Face as FaceIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { CharacterDefiners } from '@/types';

/**
 * Categoria de definidor de personagem
 */
interface DefinerCategory {
  key: keyof CharacterDefiners;
  label: string;
  IconComponent: React.ComponentType<{
    color?:
      | 'warning'
      | 'error'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'action';
  }>;
  color: 'warning' | 'error' | 'primary' | 'secondary' | 'success' | 'info';
  placeholder: string;
  helpText: string;
}

/**
 * Categorias de definidores
 */
const DEFINER_CATEGORIES: DefinerCategory[] = [
  {
    key: 'flaws',
    label: 'Falhas',
    IconComponent: WarningIcon,
    color: 'warning',
    placeholder: 'Ex: Arrogante, Impulsivo, Desconfiado...',
    helpText: 'Defeitos ou fraquezas do personagem',
  },
  {
    key: 'fears',
    label: 'Medos',
    IconComponent: PsychologyIcon,
    color: 'error',
    placeholder: 'Ex: Altura, Escuridão, Traição...',
    helpText: 'O que assusta ou intimida o personagem',
  },
  {
    key: 'ideals',
    label: 'Ideais',
    IconComponent: StarIcon,
    color: 'primary',
    placeholder: 'Ex: Liberdade, Justiça, Conhecimento...',
    helpText: 'Valores e princípios que guiam o personagem',
  },
  {
    key: 'traits',
    label: 'Traços',
    IconComponent: FaceIcon,
    color: 'secondary',
    placeholder: 'Ex: Corajoso, Leal, Curioso...',
    helpText: 'Características marcantes da personalidade',
  },
  {
    key: 'goals',
    label: 'Objetivos',
    IconComponent: EmojiEventsIcon,
    color: 'success',
    placeholder: 'Ex: Vingar a família, Encontrar tesouro...',
    helpText: 'Metas e ambições do personagem',
  },
  {
    key: 'allies',
    label: 'Aliados',
    IconComponent: GroupIcon,
    color: 'info',
    placeholder: 'Ex: Mestre Eldrin, Guilda dos Ladrões...',
    helpText: 'Pessoas ou grupos que apoiam o personagem',
  },
  {
    key: 'organizations',
    label: 'Organizações',
    IconComponent: BusinessIcon,
    color: 'primary',
    placeholder: 'Ex: Academia Arcana, Ordem dos Cavaleiros...',
    helpText: 'Grupos, facções ou instituições relacionadas',
  },
];

export interface PersonalitySectionProps {
  definers: CharacterDefiners;
  onUpdate: (definers: CharacterDefiners) => void;
}

/**
 * Seção de Definidores do Personagem
 */
export function PersonalitySection({
  definers,
  onUpdate,
}: PersonalitySectionProps) {
  const theme = useTheme();

  // Estado local para novos valores sendo digitados
  const [newValues, setNewValues] = React.useState<
    Record<keyof CharacterDefiners, string>
  >({
    flaws: '',
    fears: '',
    ideals: '',
    traits: '',
    goals: '',
    allies: '',
    organizations: '',
  });

  // Estado para chip sendo editado
  const [editingChip, setEditingChip] = React.useState<{
    category: keyof CharacterDefiners;
    index: number;
    value: string;
  } | null>(null);

  /**
   * Adiciona novo valor à categoria
   */
  const handleAdd = (category: keyof CharacterDefiners) => {
    const value = newValues[category].trim();
    if (!value) return;

    const updatedDefiners = {
      ...definers,
      [category]: [...definers[category], value],
    };

    onUpdate(updatedDefiners);
    setNewValues((prev) => ({ ...prev, [category]: '' }));
  };

  /**
   * Remove valor da categoria
   */
  const handleRemove = (category: keyof CharacterDefiners, index: number) => {
    const updatedDefiners = {
      ...definers,
      [category]: definers[category].filter((_, i) => i !== index),
    };

    onUpdate(updatedDefiners);
  };

  /**
   * Inicia edição de chip
   */
  const handleStartEdit = (
    category: keyof CharacterDefiners,
    index: number,
    value: string
  ) => {
    setEditingChip({ category, index, value });
  };

  /**
   * Salva edição de chip
   */
  const handleSaveEdit = () => {
    if (!editingChip) return;

    const { category, index, value } = editingChip;
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      // Se vazio, remove
      handleRemove(category, index);
    } else {
      // Atualiza valor
      const updatedDefiners = {
        ...definers,
        [category]: definers[category].map((item, i) =>
          i === index ? trimmedValue : item
        ),
      };

      onUpdate(updatedDefiners);
    }

    setEditingChip(null);
  };

  /**
   * Cancela edição de chip
   */
  const handleCancelEdit = () => {
    setEditingChip(null);
  };

  /**
   * Renderiza categoria de definidor
   */
  const renderCategory = (categoryDef: DefinerCategory) => {
    const { key, label, IconComponent, color, placeholder, helpText } =
      categoryDef;
    const values = definers[key];
    const isEditing = editingChip !== null && editingChip.category === key;

    return (
      <Paper
        key={key}
        elevation={0}
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconComponent color={color} />
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ flexGrow: 1 }}
          >
            {label}
          </Typography>
          <Tooltip title={helpText} arrow>
            <IconButton size="small" sx={{ cursor: 'help' }}>
              <InfoIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Chips de valores existentes */}
        {values.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {values.map((value, index) => {
              const isThisChipEditing =
                isEditing && editingChip?.index === index;

              if (isThisChipEditing) {
                // Modo de edição inline
                return (
                  <TextField
                    key={`${key}-edit-${index}`}
                    size="small"
                    value={editingChip?.value || ''}
                    onChange={(e) =>
                      setEditingChip((prev) =>
                        prev ? { ...prev, value: e.target.value } : null
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    onBlur={handleSaveEdit}
                    autoFocus
                    sx={{
                      minWidth: 120,
                      '& .MuiInputBase-root': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                );
              }

              // Modo de visualização
              return (
                <Chip
                  key={`${key}-${index}`}
                  label={value}
                  onDelete={() => handleRemove(key, index)}
                  onClick={() => handleStartEdit(key, index, value)}
                  deleteIcon={<CloseIcon />}
                  icon={<EditIcon fontSize="small" />}
                  sx={{
                    '& .MuiChip-label': {
                      cursor: 'pointer',
                    },
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Input para adicionar novo */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            value={newValues[key]}
            onChange={(e) =>
              setNewValues((prev) => ({ ...prev, [key]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd(key);
              }
            }}
            disabled={isEditing}
          />
          <IconButton
            size="small"
            onClick={() => handleAdd(key)}
            disabled={!newValues[key].trim() || isEditing}
            color="primary"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Definidores do Personagem
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Características que definem quem é o personagem, suas motivações e
        relacionamentos. Clique em um chip para editar.
      </Typography>

      {DEFINER_CATEGORIES.map(renderCategory)}
    </Stack>
  );
}
