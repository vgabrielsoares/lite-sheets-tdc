'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import type { LanguageName } from '@/types';
import { LANGUAGE_LABELS } from '@/constants';

export interface LanguageSelectorProps {
  /**
   * Idiomas atualmente selecionados
   */
  selectedLanguages: LanguageName[];

  /**
   * Idiomas disponíveis para seleção
   */
  availableLanguages: LanguageName[];

  /**
   * Callback quando a seleção muda
   */
  onChange: (languages: LanguageName[]) => void;

  /**
   * Se o seletor está desabilitado
   * @default false
   */
  disabled?: boolean;

  /**
   * Label do campo
   * @default "Idiomas"
   */
  label?: string;

  /**
   * Texto de ajuda abaixo do campo
   */
  helperText?: string;

  /**
   * Se deve mostrar apenas idiomas disponíveis ou todos
   * @default true - mostra apenas disponíveis
   */
  showOnlyAvailable?: boolean;
}

/**
 * Componente reutilizável para seleção de idiomas
 *
 * Permite seleção múltipla de idiomas com chips visuais.
 * Filtra automaticamente idiomas já selecionados.
 *
 * @example
 * ```tsx
 * <LanguageSelector
 *   selectedLanguages={character.languages}
 *   availableLanguages={getAvailableLanguages(character)}
 *   onChange={(languages) => onUpdate({ languages })}
 *   label="Idiomas Conhecidos"
 * />
 * ```
 */
export function LanguageSelector({
  selectedLanguages,
  availableLanguages,
  onChange,
  disabled = false,
  label = 'Idiomas',
  helperText,
  showOnlyAvailable = true,
}: LanguageSelectorProps): React.ReactElement {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const languages = (
      typeof value === 'string' ? value.split(',') : value
    ) as LanguageName[];
    onChange(languages);
  };

  // Define which languages to show in the dropdown
  const displayLanguages = showOnlyAvailable
    ? availableLanguages
    : [...new Set([...selectedLanguages, ...availableLanguages])];

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="language-selector-label">{label}</InputLabel>
      <Select
        labelId="language-selector-label"
        id="language-selector"
        multiple
        value={selectedLanguages}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as LanguageName[]).map((value) => (
              <Chip
                key={value}
                label={LANGUAGE_LABELS[value]}
                size="small"
                color={value === 'comum' ? 'primary' : 'default'}
              />
            ))}
          </Box>
        )}
      >
        {displayLanguages.map((lang) => (
          <MenuItem key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Box
          component="p"
          sx={{
            mt: 0.5,
            mx: 1.75,
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {helperText}
        </Box>
      )}
    </FormControl>
  );
}
