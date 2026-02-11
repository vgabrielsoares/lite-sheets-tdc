'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import ChurchIcon from '@mui/icons-material/Church';
import CombatShieldIcon from '@mui/icons-material/Shield';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import NatureIcon from '@mui/icons-material/Nature';
import { ArchetypeName } from '@/types/character';
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_PP_BASE_PER_LEVEL,
  ARCHETYPE_IS_SPELLCASTER,
  ARCHETYPE_ATTRIBUTE_DESCRIPTION,
  ARCHETYPE_GA_ATTRIBUTE,
} from '@/constants/archetypes';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';

interface ArchetypeCardProps {
  /** Nome do arquétipo */
  name: ArchetypeName;
  /** Nível atual no arquétipo */
  level: number;
}

/**
 * Ícone para cada arquétipo
 */
const getArchetypeIcon = (name: ArchetypeName) => {
  switch (name) {
    case 'academico':
      return <SchoolIcon />;
    case 'acolito':
      return <ChurchIcon />;
    case 'combatente':
      return <ShieldIcon />;
    case 'feiticeiro':
      return <AutoAwesomeIcon />;
    case 'ladino':
      return <DirectionsRunIcon />;
    case 'natural':
      return <NatureIcon />;
    default:
      return <PsychologyIcon />;
  }
};

/**
 * Cor do card baseada no arquétipo
 */
const getArchetypeColor = (name: ArchetypeName): string => {
  switch (name) {
    case 'academico':
      return '#5C6BC0'; // Indigo
    case 'acolito':
      return '#AB47BC'; // Purple
    case 'combatente':
      return '#EF5350'; // Red
    case 'feiticeiro':
      return '#42A5F5'; // Blue
    case 'ladino':
      return '#66BB6A'; // Green
    case 'natural':
      return '#8D6E63'; // Brown
    default:
      return '#78909C'; // Grey
  }
};

/**
 * ArchetypeCard - Componente para exibir um arquétipo individual (somente leitura)
 *
 * Exibe o nome, descrição, GA/PP por nível do arquétipo.
 * Níveis de arquétipo são alterados apenas via LevelUpModal.
 */
export default function ArchetypeCard({ name, level }: ArchetypeCardProps) {
  const theme = useTheme();
  const label = ARCHETYPE_LABELS[name];
  const description = ARCHETYPE_DESCRIPTIONS[name];
  const ppBasePerLevel = ARCHETYPE_PP_BASE_PER_LEVEL[name];
  const gaAttribute = ARCHETYPE_GA_ATTRIBUTE[name];
  const gaAttributeLabel = ATTRIBUTE_LABELS[gaAttribute];
  const isSpellcaster = ARCHETYPE_IS_SPELLCASTER[name];
  const attributeDescription = ARCHETYPE_ATTRIBUTE_DESCRIPTION[name];
  const archetypeColor = getArchetypeColor(name);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: `4px solid ${archetypeColor}`,
        opacity: level === 0 ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Badge de nível */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: level > 0 ? archetypeColor : 'grey.500',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        }}
      >
        {level}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Cabeçalho com ícone e nome */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Box sx={{ color: archetypeColor }}>{getArchetypeIcon(name)}</Box>
          <Typography variant="h6" fontWeight="bold">
            {label}
          </Typography>
        </Stack>

        {/* Descrição */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: 60,
            fontSize: '0.75rem',
          }}
        >
          {description}
        </Typography>

        {/* Atributos relevantes e magia */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={attributeDescription}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          {isSpellcaster && (
            <Chip
              size="small"
              icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
              label="Conjurador"
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Stack>

        {/* GA e PP por nível */}
        <Stack
          direction="row"
          spacing={3}
          mb={1}
          justifyContent="center"
          alignItems="center"
        >
          <Tooltip title={`GA ganho por nível = ${gaAttributeLabel}`}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ShieldIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" fontWeight="bold">
                +{gaAttributeLabel}
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={`PP ganho por nível = ${ppBasePerLevel} + Essência`}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FlashOnIcon sx={{ fontSize: 18, color: 'info.main' }} />
              <Typography variant="body2" fontWeight="bold">
                +{ppBasePerLevel} + ESS
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>

        {/* Nível (somente leitura) */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Nível
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ minWidth: 40, textAlign: 'center' }}
          >
            {level}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
