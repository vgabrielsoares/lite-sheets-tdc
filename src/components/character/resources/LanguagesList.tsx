'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Tooltip,
  TextField,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslateIcon from '@mui/icons-material/Translate';
import {
  LANGUAGE_LIST,
  LANGUAGE_LABELS,
  type LanguageName,
} from '@/constants/languages';
import type { Character } from '@/types';

export interface LanguagesListProps {
  languages: LanguageName[];
  menteValue: number;
  lineageLanguages?: LanguageName[];
  onUpdate: (languages: LanguageName[]) => void;
}

/**
 * Componente para exibir e gerenciar idiomas conhecidos pelo personagem
 *
 * Regras:
 * - Todos conhecem Comum
 * - Idiomas adicionais = Mente - 1 (mínimo 0, retroativo)
 * - Idiomas da linhagem são exibidos separadamente
 * - Modificador de idiomas extras pode ser adicionado
 */
export function LanguagesList({
  languages,
  menteValue,
  lineageLanguages = [],
  onUpdate,
}: LanguagesListProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageName | ''>(
    ''
  );
  const [extraLanguagesModifier, setExtraLanguagesModifier] = useState(0);

  // Calcular limite de idiomas: Comum + (Mente - 1) + Modificador Extra
  const baseLimit = 1 + Math.max(0, menteValue - 1);
  const maxLanguages = baseLimit + extraLanguagesModifier;
  const currentCount = languages.length;
  const canAddMore = currentCount < maxLanguages;

  // Idiomas disponíveis para adicionar (excluindo já conhecidos e da linhagem)
  const allKnownLanguages = useMemo(
    () => [...new Set([...languages, ...lineageLanguages])],
    [languages, lineageLanguages]
  );
  const availableLanguages = LANGUAGE_LIST.filter(
    (lang) => !allKnownLanguages.includes(lang)
  );

  const handleAddLanguage = () => {
    if (!selectedLanguage || !canAddMore) return;

    onUpdate([...languages, selectedLanguage]);
    setSelectedLanguage('');
  };

  const handleRemoveLanguage = (language: LanguageName) => {
    // Não permitir remover Comum
    if (language === 'comum') return;

    onUpdate(languages.filter((lang) => lang !== language));
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <TranslateIcon /> Idiomas e Alfabetos
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {/* Informações */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Limite de Idiomas:</strong> {currentCount} /{' '}
              {maxLanguages}
              <br />
              <em>
                Base: Mente ({menteValue}) - 1 = {Math.max(0, menteValue - 1)}{' '}
                {extraLanguagesModifier !== 0 &&
                  `+ Modificador (${extraLanguagesModifier}) = ${baseLimit + extraLanguagesModifier - 1}`}
              </em>
            </Typography>
          </Alert>

          {/* Modificador de Idiomas Extras */}
          <Box sx={{ mb: 3 }}>
            <TextField
              type="number"
              size="small"
              fullWidth
              label="Modificador de Idiomas Extras"
              value={extraLanguagesModifier}
              onChange={(e) =>
                setExtraLanguagesModifier(Number(e.target.value))
              }
              helperText="Idiomas adicionais de linhagem, habilidades especiais, etc."
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Idiomas da Linhagem */}
          {lineageLanguages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Idiomas da Linhagem:
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
              >
                {lineageLanguages.map((language) => (
                  <Tooltip
                    key={language}
                    title="Idioma concedido pela linhagem"
                    arrow
                  >
                    <Chip
                      label={LANGUAGE_LABELS[language]}
                      color="secondary"
                      variant="filled"
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}

          {/* Lista de idiomas conhecidos */}
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Idiomas Conhecidos:
          </Typography>

          {languages.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic', mb: 2 }}
            >
              Nenhum idioma conhecido ainda. Adicione idiomas abaixo.
            </Typography>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
            >
              {languages.map((language) => {
                const isComum = language === 'comum';
                return (
                  <Tooltip
                    key={language}
                    title={
                      isComum
                        ? 'Idioma padrão - não pode ser removido'
                        : 'Clique na lixeira para remover'
                    }
                    arrow
                  >
                    <Chip
                      label={LANGUAGE_LABELS[language]}
                      color={isComum ? 'primary' : 'default'}
                      variant={isComum ? 'filled' : 'outlined'}
                      onDelete={
                        isComum
                          ? undefined
                          : () => handleRemoveLanguage(language)
                      }
                      deleteIcon={<DeleteIcon />}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          )}

          {/* Adicionar novo idioma */}
          {canAddMore && availableLanguages.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Adicionar idioma</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Adicionar idioma"
                  onChange={(e) =>
                    setSelectedLanguage(e.target.value as LanguageName)
                  }
                >
                  {availableLanguages.map((language) => (
                    <MenuItem key={language} value={language}>
                      {LANGUAGE_LABELS[language]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddLanguage}
                disabled={!selectedLanguage}
              >
                Adicionar
              </Button>
            </Box>
          )}

          {!canAddMore && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Você atingiu o limite de idiomas. Aumente o valor de Mente ou
                adicione modificadores extras.
              </Typography>
            </Alert>
          )}

          {availableLanguages.length === 0 && canAddMore && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Você conhece todos os idiomas disponíveis!
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
