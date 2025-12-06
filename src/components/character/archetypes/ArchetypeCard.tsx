'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import ChurchIcon from '@mui/icons-material/Church';
import ShieldIcon from '@mui/icons-material/Shield';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import NatureIcon from '@mui/icons-material/Nature';
import { ArchetypeName } from '@/types/character';
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_HP_PER_LEVEL,
  ARCHETYPE_PP_PER_LEVEL,
  ARCHETYPE_IS_SPELLCASTER,
  ARCHETYPE_ATTRIBUTE_DESCRIPTION,
} from '@/constants/archetypes';

interface ArchetypeCardProps {
  /** Nome do arquétipo */
  name: ArchetypeName;
  /** Nível atual no arquétipo */
  level: number;
  /** Níveis ainda disponíveis para distribuir */
  availableLevels: number;
  /** Callback quando o nível é alterado */
  onLevelChange: (name: ArchetypeName, newLevel: number) => void;
  /** Se a edição está desabilitada */
  disabled?: boolean;
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
 * ArchetypeCard - Componente para exibir um arquétipo individual
 *
 * Exibe o nome, descrição, PV/PP por nível e permite ajustar o nível.
 */
export default function ArchetypeCard({
  name,
  level,
  availableLevels,
  onLevelChange,
  disabled = false,
}: ArchetypeCardProps) {
  const theme = useTheme();
  const label = ARCHETYPE_LABELS[name];
  const description = ARCHETYPE_DESCRIPTIONS[name];
  const hpPerLevel = ARCHETYPE_HP_PER_LEVEL[name];
  const ppPerLevel = ARCHETYPE_PP_PER_LEVEL[name];
  const isSpellcaster = ARCHETYPE_IS_SPELLCASTER[name];
  const attributeDescription = ARCHETYPE_ATTRIBUTE_DESCRIPTION[name];
  const archetypeColor = getArchetypeColor(name);

  const canIncrease = availableLevels > 0 && !disabled;
  const canDecrease = level > 0 && !disabled;

  const handleIncrease = () => {
    if (canIncrease) {
      onLevelChange(name, level + 1);
    }
  };

  const handleDecrease = () => {
    if (canDecrease) {
      onLevelChange(name, level - 1);
    }
  };

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
        '&:hover': {
          transform: level > 0 || canIncrease ? 'translateY(-2px)' : 'none',
          boxShadow:
            level > 0 || canIncrease ? theme.shadows[4] : theme.shadows[1],
        },
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

        {/* PV e PP por nível - Centralizado */}
        <Stack
          direction="row"
          spacing={3}
          mb={2}
          justifyContent="center"
          alignItems="center"
        >
          <Tooltip title="PV ganho por nível (+Constituição)">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FavoriteIcon sx={{ fontSize: 18, color: 'error.main' }} />
              <Typography variant="body1" fontWeight="bold">
                +{hpPerLevel}
              </Typography>
            </Stack>
          </Tooltip>
          <Tooltip title="PP ganho por nível (+Presença)">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FlashOnIcon sx={{ fontSize: 18, color: 'info.main' }} />
              <Typography variant="body1" fontWeight="bold">
                +{ppPerLevel}
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>

        {/* Controles de nível */}
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
          <IconButton
            size="small"
            onClick={handleDecrease}
            disabled={!canDecrease}
            aria-label={`Remover nível de ${label}`}
            sx={{ color: canDecrease ? 'error.main' : 'grey.400' }}
          >
            <RemoveCircleIcon />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ minWidth: 40, textAlign: 'center' }}
          >
            {level}
          </Typography>
          <IconButton
            size="small"
            onClick={handleIncrease}
            disabled={!canIncrease}
            aria-label={`Adicionar nível de ${label}`}
            sx={{ color: canIncrease ? 'success.main' : 'grey.400' }}
          >
            <AddCircleIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
