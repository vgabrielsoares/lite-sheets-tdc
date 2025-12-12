'use client';

import React, { useState, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { Character, LanguageName } from '@/types';
import {
  getLanguageSummary,
  validateLanguageSelection,
  getAvailableLanguages,
  canRemoveLanguage,
} from '@/utils';
import {
  LANGUAGE_LABELS,
  LANGUAGE_DESCRIPTIONS,
  LANGUAGE_ALPHABETS,
} from '@/constants';
import { LanguageSelector } from './LanguageSelector';

export interface LanguagesDisplayProps {
  /**
   * Dados do personagem
   */
  character: Character;

  /**
   * Callback para atualizar idiomas do personagem
   */
  onUpdate: (languages: LanguageName[]) => void;

  /**
   * Se deve mostrar detalhes expandidos por padrão
   * @default false
   */
  defaultExpanded?: boolean;

  /**
   * Se o componente está em modo somente leitura
   * @default false
   */
  readOnly?: boolean;
}

/**
 * Componente para exibição e gerenciamento de idiomas conhecidos
 *
 * Funcionalidades:
 * - Exibe todos os idiomas conhecidos do personagem
 * - Mostra contador de slots baseado em Mente
 * - Mostra idiomas da linhagem separadamente
 * - Permite adicionar/remover idiomas (respeitando regras)
 * - Valida que Comum está sempre presente
 * - Mostra avisos se exceder limite
 * - Interface expansível para economizar espaço
 *
 * Regras:
 * - Comum é sempre conhecido (não pode ser removido)
 * - Idiomas adicionais = Mente - 1 (mínimo 0)
 * - Idiomas da linhagem somam ao total
 * - Retroativo: se Mente aumenta, pode adicionar mais idiomas
 *
 * @example
 * ```tsx
 * <LanguagesDisplay
 *   character={character}
 *   onUpdate={(languages) => dispatch(updateCharacter({ id, languages }))}
 * />
 * ```
 */
export const LanguagesDisplay = memo(function LanguagesDisplay({
  character,
  onUpdate,
  defaultExpanded = false,
  readOnly = false,
}: LanguagesDisplayProps): React.ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [addingLanguage, setAddingLanguage] = useState(false);

  // Get summary and validation
  const summary = getLanguageSummary(character);
  const validation = validateLanguageSelection(character);
  const availableLanguages = getAvailableLanguages(character);

  // Separate lineage languages from others
  const lineageLanguages = character.lineage?.languages || [];
  const characterLanguages = character.languages.filter(
    (lang) => !lineageLanguages.includes(lang)
  );

  const handleAddLanguages = (newLanguages: LanguageName[]) => {
    onUpdate([...character.languages, ...newLanguages]);
    setAddingLanguage(false);
  };

  const handleRemoveLanguage = (language: LanguageName) => {
    const validation = canRemoveLanguage(character, language);
    if (validation.canRemove) {
      onUpdate(character.languages.filter((lang) => lang !== language));
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon color="primary" />
            <Typography variant="h6" component="h3">
              Idiomas Conhecidos
            </Typography>
            <Tooltip title="Idiomas que o personagem conhece. Comum é sempre conhecido. Idiomas adicionais = Mente - 1.">
              <InfoIcon fontSize="small" color="action" />
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {summary.total} / {summary.maxAllowed}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Recolher' : 'Expandir'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Stack spacing={0.5}>
              {validation.warnings.map((warning, index) => (
                <Typography key={index} variant="body2">
                  {warning}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Summary Info - Always Visible */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 1,
            mb: expanded ? 2 : 0,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              De Mente
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {summary.fromMente}
            </Typography>
          </Box>

          {summary.fromLineage > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                De Linhagem
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {summary.fromLineage}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Restantes
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={summary.remaining === 0 ? 'text.disabled' : 'success.main'}
            >
              {summary.remaining}
            </Typography>
          </Box>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Stack spacing={2}>
            {/* Character Languages */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Idiomas do Personagem
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {characterLanguages.length > 0 ? (
                  characterLanguages.map((lang) => (
                    <Chip
                      key={lang}
                      label={LANGUAGE_LABELS[lang]}
                      color={lang === 'comum' ? 'primary' : 'default'}
                      onDelete={
                        !readOnly && lang !== 'comum'
                          ? () => handleRemoveLanguage(lang)
                          : undefined
                      }
                      deleteIcon={
                        <Tooltip title="Remover idioma">
                          <DeleteIcon />
                        </Tooltip>
                      }
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum idioma além de Comum
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Lineage Languages */}
            {lineageLanguages.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Idiomas da Linhagem
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {lineageLanguages.map((lang) => (
                    <Chip
                      key={lang}
                      label={LANGUAGE_LABELS[lang]}
                      color="secondary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Add Language Section */}
            {!readOnly && (
              <Box>
                {!addingLanguage ? (
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setAddingLanguage(true)}
                    disabled={summary.remaining === 0}
                  >
                    Adicionar Idioma
                  </Button>
                ) : (
                  <Stack spacing={2}>
                    <LanguageSelector
                      selectedLanguages={[]}
                      availableLanguages={availableLanguages}
                      onChange={handleAddLanguages}
                      label="Selecione os idiomas"
                      helperText={`Você pode adicionar até ${summary.remaining} idioma(s)`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setAddingLanguage(false)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Stack>
                )}
              </Box>
            )}

            {/* Language Details */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Detalhes dos Idiomas
              </Typography>
              <Stack spacing={1}>
                {character.languages.map((lang) => (
                  <Box
                    key={lang}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {LANGUAGE_LABELS[lang]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Alfabeto: {LANGUAGE_ALPHABETS[lang]}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {LANGUAGE_DESCRIPTIONS[lang]}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
});

LanguagesDisplay.displayName = 'LanguagesDisplay';
