/**
 * DescriptionTab - Aba de Descrição e Detalhes
 *
 * Exibe informações descritivas do personagem:
 * - Campos básicos sincronizados (nome, gênero, pronomes, idade, altura, peso, tamanho, fé)
 * - Descrição de aparência (pele, olhos, cabelo, outros)
 * - Conceito de personagem (curto e expandido via sidebar)
 *
 * Sincronizações automáticas:
 * - Nome ↔ character.name
 * - Idade ↔ character.lineage.age
 * - Altura ↔ character.lineage.height
 * - Peso (kg) ↔ character.lineage.weightKg
 * - Peso (RPG) ↔ character.lineage.weightRPG
 * - Tamanho ↔ character.lineage.size
 *
 * Fase 7 - MVP 1
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Grid,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import type {
  Character,
  CreatureSize,
  Lineage,
  CharacterDefiners,
} from '@/types';
import {
  AppearanceSection,
  ConceptSection,
  PersonalitySection,
} from '../descriptions';
import { createDefaultLineage } from '@/utils/lineageUtils';

/**
 * Tamanhos de criatura disponíveis
 */
const SIZE_OPTIONS: Array<{ value: CreatureSize; label: string }> = [
  { value: 'minusculo', label: 'Minúsculo' },
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
  { value: 'enorme', label: 'Enorme' },
  { value: 'colossal', label: 'Colossal' },
];

export interface DescriptionTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onUpdateLineageField?: (field: keyof Lineage, value: any) => void;
  onOpenConceptSidebar?: () => void;
}

/**
 * Aba de Descrição e Detalhes
 *
 * Exibe e permite editar:
 * - Campos básicos de descrição (sincronizados)
 * - Descrição de aparência
 * - Conceito do personagem
 */
export function DescriptionTab({
  character,
  onUpdate,
  onUpdateLineageField,
  onOpenConceptSidebar,
}: DescriptionTabProps) {
  const theme = useTheme();

  /**
   * Atualiza nome do personagem (sincronizado com character.name)
   */
  const handleNameChange = (name: string) => {
    onUpdate({ name });
  };

  /**
   * Atualiza gênero
   */
  const handleGenderChange = (gender: string) => {
    onUpdate({ gender });
  };

  /**
   * Atualiza pronomes (campo novo)
   */
  const handlePronounsChange = (pronouns: string) => {
    onUpdate({
      physicalDescription: {
        ...character.physicalDescription,
        pronouns,
      },
    });
  };

  /**
   * Atualiza idade (sincronizado com lineage.age)
   * Usa onUpdateLineageField para garantir sincronização correta
   */
  const handleAgeChange = (age: number) => {
    // Ignora NaN ou valores inválidos
    if (isNaN(age)) return;

    if (onUpdateLineageField) {
      onUpdateLineageField('age', age);
    } else {
      // Fallback: cria linhagem padrão se não existir, ou atualiza existente
      const lineage = character.lineage || createDefaultLineage();
      onUpdate({
        lineage: {
          ...lineage,
          age,
        },
      });
    }
  };

  /**
   * Atualiza altura em cm (sincronizado com lineage.height)
   * Usa onUpdateLineageField para garantir sincronização correta
   */
  const handleHeightChange = (height: number) => {
    // Ignora NaN ou valores inválidos
    if (isNaN(height)) return;

    if (onUpdateLineageField) {
      onUpdateLineageField('height', height);
    } else {
      // Fallback: cria linhagem padrão se não existir, ou atualiza existente
      const lineage = character.lineage || createDefaultLineage();
      onUpdate({
        lineage: {
          ...lineage,
          height,
        },
      });
    }
  };

  /**
   * Atualiza peso em kg (sincronizado com lineage.weightKg)
   * Usa onUpdateLineageField para garantir sincronização correta
   */
  const handleWeightKgChange = (weightKg: number) => {
    // Ignora NaN ou valores inválidos
    if (isNaN(weightKg)) return;

    if (onUpdateLineageField) {
      onUpdateLineageField('weightKg', weightKg);
    } else {
      // Fallback: cria linhagem padrão se não existir, ou atualiza existente
      const lineage = character.lineage || createDefaultLineage();
      onUpdate({
        lineage: {
          ...lineage,
          weightKg,
        },
      });
    }
  };

  /**
   * Atualiza peso RPG (sincronizado com lineage.weightRPG)
   * Usa onUpdateLineageField para garantir sincronização correta
   */
  const handleWeightRPGChange = (weightRPG: number) => {
    // Ignora NaN ou valores inválidos
    if (isNaN(weightRPG)) return;

    if (onUpdateLineageField) {
      onUpdateLineageField('weightRPG', weightRPG);
    } else {
      // Fallback: cria linhagem padrão se não existir, ou atualiza existente
      const lineage = character.lineage || createDefaultLineage();
      onUpdate({
        lineage: {
          ...lineage,
          weightRPG,
        },
      });
    }
  };

  /**
   * Atualiza tamanho (sincronizado com lineage.size)
   * Usa onUpdateLineageField para garantir sincronização correta
   */
  const handleSizeChange = (size: CreatureSize) => {
    if (onUpdateLineageField) {
      onUpdateLineageField('size', size);
    } else {
      // Fallback: cria linhagem padrão se não existir, ou atualiza existente
      const lineage = character.lineage || createDefaultLineage();
      onUpdate({
        lineage: {
          ...lineage,
          size,
        },
      });
    }
  };

  /**
   * Atualiza fé/religião
   */
  const handleFaithChange = (faith: string) => {
    onUpdate({ faith });
  };

  const handlePhysicalDescriptionChange = (
    updates: Partial<Character['physicalDescription']>
  ) => {
    onUpdate({
      physicalDescription: {
        ...character.physicalDescription,
        ...updates,
      },
    });
  };

  const handleConceptChange = (concept: string) => {
    onUpdate({ concept });
  };

  /**
   * Atualiza definidores do personagem
   */
  const handleDefinersChange = (definers: CharacterDefiners) => {
    onUpdate({ definers });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight={700}>
            Descrição e Detalhes
          </Typography>
        </Box>

        {/* Seção: Informações Básicas (Retrátil) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            '&:before': { display: 'none' },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Informações Básicas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Nome */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nome"
                  value={character.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome do personagem"
                  fullWidth
                  helperText="Sincronizado com nome principal"
                />
              </Grid>

              {/* Gênero */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Gênero"
                  value={character.gender || ''}
                  onChange={(e) => handleGenderChange(e.target.value)}
                  placeholder="Ex: Masculino, Feminino, Não-binário..."
                  fullWidth
                  helperText="Identidade de gênero do personagem"
                />
              </Grid>

              {/* Pronomes */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Pronomes"
                  value={character.physicalDescription.pronouns || ''}
                  onChange={(e) => handlePronounsChange(e.target.value)}
                  placeholder="Ex: ele/dele, ela/dela, elu/delu..."
                  fullWidth
                  helperText="Pronomes preferidos"
                />
              </Grid>

              {/* Idade */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Idade"
                  type="number"
                  value={character.lineage?.age ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      handleAgeChange(0);
                    } else {
                      handleAgeChange(Number(val));
                    }
                  }}
                  placeholder="Idade em anos"
                  fullWidth
                  helperText="Sincronizado com linhagem"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Altura */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Altura (cm)"
                  type="number"
                  value={character.lineage?.height ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      handleHeightChange(0);
                    } else {
                      handleHeightChange(Number(val));
                    }
                  }}
                  placeholder="Altura em centímetros"
                  fullWidth
                  helperText="Sincronizado com linhagem"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Peso (kg) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peso (kg)"
                  type="number"
                  value={character.lineage?.weightKg ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      handleWeightKgChange(0);
                    } else {
                      handleWeightKgChange(Number(val));
                    }
                  }}
                  placeholder="Peso em quilogramas"
                  fullWidth
                  helperText="Sincronizado com linhagem"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Peso (Medida RPG) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peso (Medida RPG)"
                  type="number"
                  value={character.lineage?.weightRPG ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      handleWeightRPGChange(0);
                    } else {
                      handleWeightRPGChange(Number(val));
                    }
                  }}
                  placeholder="10"
                  fullWidth
                  helperText="Sincronizado com linhagem (medida 'Peso' do RPG)"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Tamanho */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Tamanho"
                  value={character.lineage?.size || 'medio'}
                  onChange={(e) =>
                    handleSizeChange(e.target.value as CreatureSize)
                  }
                  fullWidth
                  helperText="Sincronizado com linhagem"
                >
                  {SIZE_OPTIONS.map((size) => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Fé */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fé/Religião"
                  value={character.faith || ''}
                  onChange={(e) => handleFaithChange(e.target.value)}
                  placeholder="Ex: Adorador de Solaris, Ateu..."
                  fullWidth
                  helperText="Divindade ou crença do personagem"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Seção: Conceito do Personagem (Retrátil) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            '&:before': { display: 'none' },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Conceito do Personagem
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ConceptSection
              concept={character.concept || ''}
              onUpdate={handleConceptChange}
              onOpenSidebar={onOpenConceptSidebar || (() => {})}
            />
          </AccordionDetails>
        </Accordion>

        {/* Seção: Descrição de Aparência (Retrátil) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            '&:before': { display: 'none' },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Descrição de Aparência
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AppearanceSection
              physicalDescription={character.physicalDescription}
              onUpdate={handlePhysicalDescriptionChange}
            />
          </AccordionDetails>
        </Accordion>

        {/* Seção: Definidores do Personagem (Retrátil) */}
        <Accordion
          defaultExpanded={false}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            '&:before': { display: 'none' },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Definidores do Personagem
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PersonalitySection
              definers={character.definers}
              onUpdate={handleDefinersChange}
            />
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
}
