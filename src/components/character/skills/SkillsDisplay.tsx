'use client';

/**
 * SkillsDisplay - Componente para exibir lista completa das 33 habilidades
 *
 * Funcionalidades:
 * - Exibe todas as 33 habilidades do sistema
 * - Busca/filtro por nome de habilidade
 * - Organização alfabética
 * - Filtros por:
 *   - Proficiência (Leigo, Adepto, Versado, Mestre)
 *   - Tipo (Combate, Não-combate)
 *   - Atributo-chave
 * - Responsivo e acessível
 * - Integração com SkillRow
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Collapse,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import type {
  SkillName,
  ProficiencyLevel,
  AttributeName,
  Attributes,
  Skills,
  Modifier,
} from '@/types';
import {
  SKILL_LIST,
  SKILL_LABELS,
  ATTRIBUTE_LABELS,
  SKILL_METADATA,
} from '@/constants';
import { getProficiencyInfo } from '@/utils/proficiencyCalculations';
import { SkillRow } from './SkillRow';
import { SignatureAbility } from './SignatureAbility';

export interface SkillsDisplayProps {
  /** Todas as habilidades do personagem */
  skills: Skills;
  /** Atributos do personagem (para cálculos) */
  attributes: Attributes;
  /** Nível do personagem */
  characterLevel: number;
  /** Se personagem está sobrecarregado */
  isOverloaded: boolean;
  /** Callback quando atributo-chave é alterado */
  onKeyAttributeChange: (
    skillName: SkillName,
    newAttribute: AttributeName
  ) => void;
  /** Callback quando proficiência é alterada */
  onProficiencyChange: (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => void;
  /** Callback quando modificadores são alterados */
  onModifiersChange?: (skillName: SkillName, modifiers: Modifier[]) => void;
  /** Callback quando habilidade é clicada (abre sidebar) */
  onSkillClick: (skillName: SkillName) => void;
  /** Callback quando habilidade de assinatura é alterada */
  onSignatureAbilityChange?: (skillName: SkillName | null) => void;
}

/**
 * Componente SkillsDisplay - Lista completa de habilidades com busca e filtros
 */
export const SkillsDisplay: React.FC<SkillsDisplayProps> = ({
  skills,
  attributes,
  characterLevel,
  isOverloaded,
  onKeyAttributeChange,
  onProficiencyChange,
  onModifiersChange,
  onSkillClick,
  onSignatureAbilityChange,
}) => {
  // Estados locais
  const [searchQuery, setSearchQuery] = useState('');
  const [proficiencyFilter, setProficiencyFilter] = useState<
    ProficiencyLevel | 'all'
  >('all');
  const [attributeFilter, setAttributeFilter] = useState<AttributeName | 'all'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'combat' | 'load' | 'instrument' | 'proficiency'
  >('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calcular informações de proficiência usando utility
  const proficiencyInfo = useMemo(() => {
    return getProficiencyInfo(skills, attributes.mente);
  }, [skills, attributes.mente]);

  const { max: maxProficiencies, acquired: acquiredProficiencies } =
    proficiencyInfo;

  // Contar proficiências por nível
  const proficiencyCounts = useMemo(() => {
    const counts: Record<ProficiencyLevel, number> = {
      leigo: 0,
      adepto: 0,
      versado: 0,
      mestre: 0,
    };

    SKILL_LIST.forEach((skillName) => {
      const skill = skills[skillName];
      counts[skill.proficiencyLevel]++;
    });

    return counts;
  }, [skills]);

  // Filtrar habilidades
  const filteredSkills = useMemo(() => {
    return SKILL_LIST.filter((skillName) => {
      const skill = skills[skillName];
      const label = SKILL_LABELS[skillName].toLowerCase();

      // Filtro de busca
      if (searchQuery && !label.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtro de proficiência
      if (
        proficiencyFilter !== 'all' &&
        skill.proficiencyLevel !== proficiencyFilter
      ) {
        return false;
      }

      // Filtro de atributo-chave
      if (attributeFilter !== 'all' && skill.keyAttribute !== attributeFilter) {
        return false;
      }

      // Filtro de tipo/característica
      if (typeFilter !== 'all') {
        const metadata = SKILL_METADATA[skillName];
        if (typeFilter === 'combat' && !metadata.isCombatSkill) {
          return false;
        } else if (typeFilter === 'load' && !metadata.hasCargaPenalty) {
          return false;
        } else if (
          typeFilter === 'instrument' &&
          !metadata.requiresInstrument
        ) {
          return false;
        } else if (
          typeFilter === 'proficiency' &&
          !metadata.requiresProficiency
        ) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, proficiencyFilter, attributeFilter, typeFilter, skills]);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleProficiencyFilterChange = (event: SelectChangeEvent<string>) => {
    setProficiencyFilter(event.target.value as ProficiencyLevel | 'all');
  };

  const handleAttributeFilterChange = (event: SelectChangeEvent<string>) => {
    setAttributeFilter(event.target.value as AttributeName | 'all');
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(
      event.target.value as
        | 'all'
        | 'combat'
        | 'load'
        | 'instrument'
        | 'proficiency'
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setProficiencyFilter('all');
    setAttributeFilter('all');
    setTypeFilter('all');
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (proficiencyFilter !== 'all' ? 1 : 0) +
    (attributeFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0);

  return (
    <Box>
      {/* Header com título e estatísticas */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6">Habilidades</Typography>
          {isOverloaded && (
            <Tooltip title="Sobrecarregado: algumas habilidades sofrem penalidade de -5">
              <Chip label="Sobrecarregado" size="small" color="warning" />
            </Tooltip>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary">
          Proficiências adquiridas: {acquiredProficiencies} / {maxProficiencies}
          {acquiredProficiencies > maxProficiencies && (
            <Typography component="span" color="error" sx={{ ml: 1 }}>
              (Excede o limite!)
            </Typography>
          )}
        </Typography>

        {acquiredProficiencies > maxProficiencies && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              Você possui mais proficiências do que o permitido. Reduza para{' '}
              {maxProficiencies} ou aumente seu atributo Mente.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Habilidade de Assinatura */}
      {onSignatureAbilityChange && (
        <Box sx={{ mb: 3 }}>
          <SignatureAbility
            skills={skills}
            characterLevel={characterLevel}
            onSignatureChange={onSignatureAbilityChange}
          />
        </Box>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        {/* Toggle de filtros */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Mostrar filtros"
              aria-expanded={showFilters}
            >
              <FilterIcon />
              <ExpandMoreIcon
                sx={{
                  transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            </IconButton>
            <Typography variant="body2">Filtros</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} ativos`}
                size="small"
                color="primary"
              />
            )}
          </Box>

          {activeFiltersCount > 0 && (
            <Chip
              label="Limpar filtros"
              size="small"
              onClick={clearFilters}
              onDelete={clearFilters}
            />
          )}
        </Box>

        {/* Filtros expansíveis */}
        <Collapse in={showFilters}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            {/* Filtro de Proficiência */}
            <FormControl fullWidth size="small">
              <InputLabel>Proficiência</InputLabel>
              <Select
                value={proficiencyFilter}
                label="Proficiência"
                onChange={handleProficiencyFilterChange}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="leigo">
                  Leigo ({proficiencyCounts.leigo})
                </MenuItem>
                <MenuItem value="adepto">
                  Adepto ({proficiencyCounts.adepto})
                </MenuItem>
                <MenuItem value="versado">
                  Versado ({proficiencyCounts.versado})
                </MenuItem>
                <MenuItem value="mestre">
                  Mestre ({proficiencyCounts.mestre})
                </MenuItem>
              </Select>
            </FormControl>

            {/* Filtro de Atributo */}
            <FormControl fullWidth size="small">
              <InputLabel>Atributo-chave</InputLabel>
              <Select
                value={attributeFilter}
                label="Atributo-chave"
                onChange={handleAttributeFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filtro por Característica */}
            <FormControl fullWidth size="small">
              <InputLabel>Característica</InputLabel>
              <Select
                value={typeFilter}
                label="Característica"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="combat">Combate</MenuItem>
                <MenuItem value="load">Carga</MenuItem>
                <MenuItem value="instrument">Ferramentas</MenuItem>
                <MenuItem value="proficiency">Proficiência</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>
      </Paper>

      {/* Info sobre Habilidade de Assinatura */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Clique em qualquer habilidade para ver detalhes, usos específicos e
          definir como <strong>Habilidade de Assinatura</strong>.
        </Typography>
      </Alert>

      {/* Lista de habilidades */}
      {filteredSkills.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhuma habilidade encontrada com os filtros aplicados.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {filteredSkills.map((skillName) => (
            <SkillRow
              key={skillName}
              skill={skills[skillName]}
              attributes={attributes}
              characterLevel={characterLevel}
              isOverloaded={isOverloaded}
              onKeyAttributeChange={onKeyAttributeChange}
              onProficiencyChange={onProficiencyChange}
              onModifiersChange={onModifiersChange}
              onClick={onSkillClick}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SkillsDisplay;
