'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Button,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as FeatureIcon,
  Build as ImprovementIcon,
  Shield as DefenseIcon,
  School as ProficiencyIcon,
} from '@mui/icons-material';
import type { CharacterClass, ClassFeature, ClassImprovement } from '@/types';
import { ARCHETYPE_LABELS, type ArchetypeName } from '@/constants/archetypes';
import {
  CLASS_GAIN_TYPE_COLORS,
  CLASS_GAIN_TYPE_LABELS,
  type ClassGainType,
} from '@/constants/classes';

interface ClassCardProps {
  /** Classe do personagem */
  characterClass: CharacterClass;
  /** Callback para editar a classe */
  onEdit: () => void;
  /** Callback para remover a classe */
  onDelete: () => void;
  /** Se edição está desabilitada */
  disabled?: boolean;
}

/**
 * Ícone para cada tipo de ganho de classe
 */
function ClassGainIcon({ type }: { type: ClassGainType }) {
  switch (type) {
    case 'habilidade':
      return <FeatureIcon fontSize="small" />;
    case 'melhoria':
      return <ImprovementIcon fontSize="small" />;
    case 'defesa':
      return <DefenseIcon fontSize="small" />;
    case 'proficiencia':
      return <ProficiencyIcon fontSize="small" />;
    default:
      return null;
  }
}

/**
 * Card para exibir uma classe do personagem
 */
export function ClassCard({
  characterClass,
  onEdit,
  onDelete,
  disabled = false,
}: ClassCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Obter labels dos arquétipos
  const archetypeLabels = useMemo(() => {
    return characterClass.archetypes
      .map((arch) => ARCHETYPE_LABELS[arch as ArchetypeName])
      .join(' + ');
  }, [characterClass.archetypes]);

  // Verificar se há conteúdo expandível
  const hasExpandableContent = characterClass.features.length > 0;

  // Separar features por tipo
  const { abilities, improvements, defenses, proficiencies } = useMemo(() => {
    const abilities: ClassFeature[] = [];
    const improvements: ClassImprovement[] = [];
    const defenses: ClassFeature[] = [];
    const proficiencies: ClassFeature[] = [];

    characterClass.features.forEach((feature) => {
      // Detectar tipo pela descrição ou nível
      const level = feature.acquiredAtLevel;
      const hasImprovement =
        feature.improvements && feature.improvements.length > 0;

      // Níveis de habilidade de classe: 1, 5, 10, 15
      if ([1, 5, 10, 15].includes(level) && !hasImprovement) {
        abilities.push(feature);
      }

      // Coletar melhorias
      if (feature.improvements) {
        improvements.push(...feature.improvements);
      }
    });

    return { abilities, improvements, defenses, proficiencies };
  }, [characterClass.features]);

  return (
    <Card
      elevation={2}
      sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight="bold">
              {characterClass.name}
            </Typography>
            <Chip
              size="small"
              label={`Nv. ${characterClass.level}`}
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {!disabled && (
              <>
                <Tooltip title="Editar classe">
                  <IconButton size="small" onClick={onEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover classe">
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {/* Arquétipos da classe */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {characterClass.archetypes.map((arch) => (
            <Chip
              key={arch}
              size="small"
              label={ARCHETYPE_LABELS[arch as ArchetypeName]}
              variant="filled"
              sx={{
                bgcolor: 'action.selected',
              }}
            />
          ))}
        </Stack>

        {/* Resumo dos ganhos */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          {abilities.length > 0 && (
            <Chip
              size="small"
              icon={<FeatureIcon fontSize="small" />}
              label={`${abilities.length} Habilidade(s)`}
              color={CLASS_GAIN_TYPE_COLORS.habilidade}
              variant="outlined"
            />
          )}
          {improvements.length > 0 && (
            <Chip
              size="small"
              icon={<ImprovementIcon fontSize="small" />}
              label={`${improvements.length} Melhoria(s)`}
              color={CLASS_GAIN_TYPE_COLORS.melhoria}
              variant="outlined"
            />
          )}
        </Stack>

        {/* Botão de expandir */}
        {hasExpandableContent && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mt: 1 }}
          >
            {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </Button>
        )}

        {/* Conteúdo expandível */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Habilidades de Classe */}
            {abilities.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Habilidades de Classe
                </Typography>
                <Stack spacing={1}>
                  {abilities.map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        borderLeft: 3,
                        borderColor: `${CLASS_GAIN_TYPE_COLORS.habilidade}.main`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 0.5 }}
                      >
                        <ClassGainIcon type="habilidade" />
                        <Typography variant="body2" fontWeight="bold">
                          {feature.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={`Nv. ${feature.acquiredAtLevel}`}
                          color={CLASS_GAIN_TYPE_COLORS.habilidade}
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      </Stack>
                      {feature.description && (
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      )}
                      {/* Melhorias da habilidade */}
                      {feature.improvements &&
                        feature.improvements.length > 0 && (
                          <Box sx={{ pl: 2, mt: 1 }}>
                            {feature.improvements.map((imp, impIndex) => (
                              <Box
                                key={impIndex}
                                sx={{
                                  p: 0.5,
                                  mb: 0.5,
                                  borderLeft: 2,
                                  borderColor: `${CLASS_GAIN_TYPE_COLORS.melhoria}.main`,
                                  pl: 1,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.5}
                                >
                                  <ImprovementIcon
                                    fontSize="small"
                                    color="info"
                                  />
                                  <Typography variant="caption">
                                    <strong>Melhoria {imp.level}</strong> (Nv.{' '}
                                    {imp.acquiredAtLevel})
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {imp.description}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default ClassCard;
