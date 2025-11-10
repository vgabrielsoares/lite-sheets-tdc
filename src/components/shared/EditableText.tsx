'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  type TextFieldProps,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export interface EditableTextProps {
  /**
   * Valor do texto
   */
  value: string;

  /**
   * Callback quando o valor muda
   */
  onChange: (value: string) => void;

  /**
   * Label do campo
   */
  label?: string;

  /**
   * Placeholder
   */
  placeholder?: string;

  /**
   * Se o campo é obrigatório
   */
  required?: boolean;

  /**
   * Função de validação customizada
   */
  validate?: (value: string) => string | null;

  /**
   * Variant da tipografia (quando não está editando)
   */
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body1'
    | 'body2'
    | 'caption';

  /**
   * Se deve auto-salvar (sem botões de confirmar/cancelar)
   */
  autoSave?: boolean;

  /**
   * Delay do debounce em ms (apenas para autoSave)
   */
  debounceMs?: number;

  /**
   * Multiline
   */
  multiline?: boolean;

  /**
   * Número de linhas (se multiline)
   */
  rows?: number;

  /**
   * Props adicionais do TextField
   */
  textFieldProps?: Partial<TextFieldProps>;
}

/**
 * Componente de texto editável inline
 *
 * Exibe o texto normalmente e permite edição ao clicar.
 * Pode funcionar com auto-save (com debounce) ou com botões de confirmar/cancelar.
 *
 * @example
 * ```tsx
 * <EditableText
 *   value={character.name}
 *   onChange={(name) => updateCharacter({ name })}
 *   label="Nome do Personagem"
 *   variant="h5"
 *   required
 * />
 * ```
 */
export function EditableText({
  value,
  onChange,
  label,
  placeholder = 'Clique para editar',
  required = false,
  validate,
  variant = 'body1',
  autoSave = true,
  debounceMs = 500,
  multiline = false,
  rows = 1,
  textFieldProps,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar tempValue com value quando não está editando
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus quando entra em modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Validar valor
  const validateValue = (val: string): boolean => {
    if (required && !val.trim()) {
      setError('Este campo é obrigatório');
      return false;
    }

    if (validate) {
      const validationError = validate(val);
      setError(validationError);
      return validationError === null;
    }

    setError(null);
    return true;
  };

  // Handler de mudança com debounce (para autoSave)
  const handleChange = (newValue: string) => {
    setTempValue(newValue);

    if (autoSave) {
      // Limpar timeout anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Criar novo timeout
      debounceRef.current = setTimeout(() => {
        if (validateValue(newValue)) {
          onChange(newValue);
        }
      }, debounceMs);
    }
  };

  // Confirmar edição (sem autoSave)
  const handleConfirm = () => {
    if (validateValue(tempValue)) {
      onChange(tempValue);
      setIsEditing(false);
      setError(null);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setError(null);

    // Limpar debounce pendente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  // Handler de teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline && !autoSave) {
      handleConfirm();
    }
  };

  // Modo de visualização
  if (!isEditing) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          '&:hover .edit-icon': {
            opacity: 1,
          },
        }}
        onClick={() => setIsEditing(true)}
      >
        <Box sx={{ flex: 1 }}>
          {label && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {label}
            </Typography>
          )}
          <Typography
            variant={variant}
            color={value ? 'text.primary' : 'text.disabled'}
          >
            {value || placeholder}
          </Typography>
        </Box>
        <EditIcon
          className="edit-icon"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
            color: 'text.secondary',
            fontSize: '1.2rem',
          }}
        />
      </Box>
    );
  }

  // Modo de edição
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <TextField
        inputRef={inputRef}
        value={tempValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={autoSave ? handleCancel : undefined}
        label={label}
        placeholder={placeholder}
        error={!!error}
        helperText={error}
        required={required}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        fullWidth
        size="small"
        {...textFieldProps}
      />

      {!autoSave && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <IconButton size="small" color="primary" onClick={handleConfirm}>
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
