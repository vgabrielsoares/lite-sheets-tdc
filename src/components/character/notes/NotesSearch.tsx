/**
 * NotesSearch Component - Campo de busca para notas
 *
 * Componente responsável por permitir busca textual em notas
 * com debounce para melhor performance.
 */

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

/**
 * Props do componente NotesSearch
 */
export interface NotesSearchProps {
  /** Valor atual da busca */
  value: string;
  /** Callback ao mudar o valor */
  onChange: (value: string) => void;
  /** Placeholder customizado */
  placeholder?: string;
  /** Se deve ocupar toda a largura */
  fullWidth?: boolean;
}

/**
 * Componente NotesSearch
 */
export const NotesSearch: React.FC<NotesSearchProps> = ({
  value,
  onChange,
  placeholder = 'Buscar notas...',
  fullWidth = true,
}) => {
  /**
   * Limpa o campo de busca
   */
  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              aria-label="Limpar busca"
              edge="end"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
  );
};

export default NotesSearch;
