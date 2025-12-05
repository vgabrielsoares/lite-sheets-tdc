'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Stack,
  Button,
  Collapse,
  Tooltip,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  FlashOn as PowerIcon,
  School as CompetenceIcon,
  TrendingUp as AttributeIcon,
} from '@mui/icons-material';
import type { Archetype, ArchetypeFeature, ArchetypeName } from '@/types';
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_LEVEL_GAINS,
  GAIN_TYPE_COLORS,
  GAIN_TYPE_LABELS,
  type ArchetypeLevelGainType,
} from '@/constants/archetypes';
import { ConfirmDialog } from '@/components/shared';
import FeatureForm from './FeatureForm';

interface ArchetypeFeaturesProps {
  /** Arquétipos do personagem */
  archetypes: Archetype[];
  /** Nível total do personagem */
  characterLevel: number;
  /** Callback quando características são alteradas */
  onFeaturesChange: (archetypes: Archetype[]) => void;
  /** Se edição está desabilitada */
  disabled?: boolean;
}

/**
 * Ícone para cada tipo de ganho
 */
function GainTypeIcon({ type }: { type: ArchetypeLevelGainType }) {
  switch (type) {
    case 'caracteristica':
      return <StarIcon fontSize="small" />;
    case 'poder':
      return <PowerIcon fontSize="small" />;
    case 'competencia':
      return <CompetenceIcon fontSize="small" />;
    case 'atributo':
      return <AttributeIcon fontSize="small" />;
    default:
      return null;
  }
}

/**
 * Card individual de uma característica/poder/competência
 */
interface FeatureCardProps {
  feature: ArchetypeFeature;
  archetypeName: ArchetypeName;
  archetypeLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function FeatureCard({
  feature,
  archetypeLabel,
  onEdit,
  onDelete,
  disabled,
}: FeatureCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Determinar tipo de feature baseado no nível
  const gainType = useMemo((): ArchetypeLevelGainType => {
    const gains = ARCHETYPE_LEVEL_GAINS.filter(
      (g) => g.level === feature.acquiredAtLevel
    );
    // Se há múltiplos ganhos no nível, tentar inferir pelo nome
    if (gains.length > 1) {
      const lowerName = feature.name.toLowerCase();
      if (lowerName.includes('poder')) return 'poder';
      if (
        lowerName.includes('competência') ||
        lowerName.includes('proficiência')
      )
        return 'competencia';
      if (lowerName.includes('atributo')) return 'atributo';
      return 'caracteristica';
    }
    return gains[0]?.type ?? 'caracteristica';
  }, [feature.acquiredAtLevel, feature.name]);

  const hasChoices =
    (feature.permanentChoices &&
      Object.keys(feature.permanentChoices).length > 0) ||
    (feature.temporaryChoices &&
      Object.keys(feature.temporaryChoices).length > 0);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: `${GAIN_TYPE_COLORS[gainType]}.main`,
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      }}
    >
      <Stack spacing={1}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <GainTypeIcon type={gainType} />
            <Typography variant="subtitle1" fontWeight="bold">
              {feature.name}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Chip
              size="small"
              label={`Nv. ${feature.acquiredAtLevel}`}
              color={GAIN_TYPE_COLORS[gainType]}
              variant="outlined"
            />
            <Chip
              size="small"
              label={archetypeLabel}
              variant="filled"
              sx={{ bgcolor: 'action.selected' }}
            />
            {!disabled && (
              <>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={onEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {/* Descrição */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'none' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {feature.description || 'Sem descrição'}
        </Typography>

        {/* Expandir para ver escolhas */}
        {(hasChoices || feature.description?.length > 100) && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </Button>
        )}

        {/* Escolhas permanentes e temporárias */}
        <Collapse in={expanded}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {feature.permanentChoices &&
              Object.keys(feature.permanentChoices).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Escolhas Permanentes:
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    {Object.entries(feature.permanentChoices).map(
                      ([key, value]) => (
                        <Typography key={key} variant="body2">
                          <strong>{key}:</strong>{' '}
                          {typeof value === 'string'
                            ? value
                            : JSON.stringify(value)}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}

            {feature.temporaryChoices &&
              Object.keys(feature.temporaryChoices).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Escolhas Temporárias:
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    {Object.entries(feature.temporaryChoices).map(
                      ([key, value]) => (
                        <Typography key={key} variant="body2">
                          <strong>{key}:</strong>{' '}
                          {typeof value === 'string'
                            ? value
                            : JSON.stringify(value)}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}

/**
 * Agrupa features por nível para exibição organizada
 */
function groupFeaturesByLevel(
  archetypes: Archetype[]
): Map<number, { feature: ArchetypeFeature; archetype: Archetype }[]> {
  const grouped = new Map<
    number,
    { feature: ArchetypeFeature; archetype: Archetype }[]
  >();

  archetypes.forEach((archetype) => {
    archetype.features?.forEach((feature) => {
      const level = feature.acquiredAtLevel;
      if (!grouped.has(level)) {
        grouped.set(level, []);
      }
      grouped.get(level)!.push({ feature, archetype });
    });
  });

  // Ordenar por nível
  return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
}

/**
 * ArchetypeFeatures - Exibe e gerencia características de arquétipos
 */
export default function ArchetypeFeatures({
  archetypes,
  characterLevel,
  onFeaturesChange,
  disabled = false,
}: ArchetypeFeaturesProps) {
  const theme = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<{
    archetype: Archetype;
    feature: ArchetypeFeature;
    index: number;
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<{
    archetype: Archetype;
    featureIndex: number;
  } | null>(null);

  // Agrupar features por nível
  const groupedFeatures = useMemo(
    () => groupFeaturesByLevel(archetypes),
    [archetypes]
  );

  // Arquétipos com pelo menos 1 nível (podem ter features)
  const activeArchetypes = useMemo(
    () => archetypes.filter((a) => a.level > 0),
    [archetypes]
  );

  // Handler para adicionar nova feature
  const handleAddFeature = useCallback(
    (
      archetypeName: ArchetypeName,
      feature: Omit<ArchetypeFeature, 'acquiredAtLevel'>,
      level: number
    ) => {
      const newFeature: ArchetypeFeature = {
        ...feature,
        acquiredAtLevel: level,
      };

      const updatedArchetypes = archetypes.map((arch) => {
        if (arch.name === archetypeName) {
          return {
            ...arch,
            features: [...(arch.features ?? []), newFeature],
          };
        }
        return arch;
      });

      onFeaturesChange(updatedArchetypes);
      setFormOpen(false);
    },
    [archetypes, onFeaturesChange]
  );

  // Handler para editar feature existente
  const handleEditFeature = useCallback(
    (
      archetypeName: ArchetypeName,
      featureIndex: number,
      updatedFeature: ArchetypeFeature
    ) => {
      const updatedArchetypes = archetypes.map((arch) => {
        if (arch.name === archetypeName) {
          const newFeatures = [...(arch.features ?? [])];
          newFeatures[featureIndex] = updatedFeature;
          return {
            ...arch,
            features: newFeatures,
          };
        }
        return arch;
      });

      onFeaturesChange(updatedArchetypes);
      setEditingFeature(null);
    },
    [archetypes, onFeaturesChange]
  );

  // Handler para remover feature
  const handleDeleteFeature = useCallback(() => {
    if (!featureToDelete) return;

    const { archetype, featureIndex } = featureToDelete;

    const updatedArchetypes = archetypes.map((arch) => {
      if (arch.name === archetype.name) {
        const newFeatures = [...(arch.features ?? [])];
        newFeatures.splice(featureIndex, 1);
        return {
          ...arch,
          features: newFeatures,
        };
      }
      return arch;
    });

    onFeaturesChange(updatedArchetypes);
    setDeleteConfirmOpen(false);
    setFeatureToDelete(null);
  }, [archetypes, featureToDelete, onFeaturesChange]);

  // Abrir confirmação de delete
  const handleDeleteClick = useCallback(
    (archetype: Archetype, featureIndex: number) => {
      setFeatureToDelete({ archetype, featureIndex });
      setDeleteConfirmOpen(true);
    },
    []
  );

  // Abrir form de edição
  const handleEditClick = useCallback(
    (archetype: Archetype, feature: ArchetypeFeature, index: number) => {
      setEditingFeature({ archetype, feature, index });
    },
    []
  );

  // Contagem total de features
  const totalFeatures = useMemo(() => {
    return archetypes.reduce(
      (sum, arch) => sum + (arch.features?.length ?? 0),
      0
    );
  }, [archetypes]);

  // Níveis máximos de cada arquétipo ativo
  const maxLevelByArchetype = useMemo(() => {
    const map: Record<ArchetypeName, number> = {} as Record<
      ArchetypeName,
      number
    >;
    activeArchetypes.forEach((arch) => {
      map[arch.name] = arch.level;
    });
    return map;
  }, [activeArchetypes]);

  if (activeArchetypes.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Distribua níveis nos arquétipos acima para desbloquear características
          e poderes.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6">Características e Poderes</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalFeatures} característica(s) registrada(s)
          </Typography>
        </Box>
        {!disabled && activeArchetypes.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            size="small"
          >
            Adicionar
          </Button>
        )}
      </Stack>

      {/* Legenda de tipos */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        {(['caracteristica', 'poder', 'competencia', 'atributo'] as const).map(
          (type) => (
            <Chip
              key={type}
              icon={<GainTypeIcon type={type} />}
              label={GAIN_TYPE_LABELS[type]}
              size="small"
              color={GAIN_TYPE_COLORS[type]}
              variant="outlined"
            />
          )
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Lista de features agrupadas por nível */}
      {groupedFeatures.size === 0 ? (
        <Alert severity="info">
          <Typography variant="body2">
            Nenhuma característica adicionada ainda. Clique em
            &quot;Adicionar&quot; para registrar as características e poderes
            ganhos pelos seus arquétipos.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={2}>
          {Array.from(groupedFeatures.entries()).map(([level, features]) => (
            <Box key={level}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                Nível {level}
              </Typography>
              <Stack spacing={1}>
                {features.map(({ feature, archetype }, idx) => {
                  const featureIndex =
                    archetype.features?.findIndex((f) => f === feature) ?? -1;
                  return (
                    <FeatureCard
                      key={`${archetype.name}-${feature.name}-${idx}`}
                      feature={feature}
                      archetypeName={archetype.name}
                      archetypeLabel={ARCHETYPE_LABELS[archetype.name]}
                      onEdit={() =>
                        handleEditClick(archetype, feature, featureIndex)
                      }
                      onDelete={() =>
                        handleDeleteClick(archetype, featureIndex)
                      }
                      disabled={disabled}
                    />
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Form para adicionar nova feature */}
      <FeatureForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleAddFeature}
        archetypes={activeArchetypes}
        maxLevelByArchetype={maxLevelByArchetype}
      />

      {/* Form para editar feature existente */}
      {editingFeature && (
        <FeatureForm
          open={true}
          onClose={() => setEditingFeature(null)}
          onSave={(archetypeName, feature, level) => {
            handleEditFeature(archetypeName, editingFeature.index, {
              ...feature,
              acquiredAtLevel: level,
            });
          }}
          archetypes={activeArchetypes}
          maxLevelByArchetype={maxLevelByArchetype}
          editingFeature={editingFeature.feature}
          editingArchetype={editingFeature.archetype.name}
        />
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remover Característica"
        message="Tem certeza que deseja remover esta característica? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteFeature}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setFeatureToDelete(null);
        }}
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </Box>
  );
}
