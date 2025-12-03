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

export interface EditableNumberProps {
  /**
   * Valor do número
   */
  value: number;

  /**
   * Callback quando o valor muda
   */
  onChange: (value: number) => void;

  /**
   * Label do campo
   */
  label?: string;

  /**
   * Valor mínimo permitido
   */
  min?: number;

  /**
   * Valor máximo permitido
   */
  max?: number;

  /**
   * Passo do incremento
   */
  step?: number;

  /**
   * Função de validação customizada
   */
  validate?: (value: number) => string | null;

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
   * Exibir com sinal de + para valores positivos
   */
  showSign?: boolean;

  /**
   * Habilita edição com duplo clique (ao invés de clique simples)
   * @default false
   */
  enableDoubleClick?: boolean;

  /**
   * Props adicionais do TextField
   */
  textFieldProps?: Partial<TextFieldProps>;
}

/**
 * Componente de número editável inline
 *
 * Exibe o número normalmente e permite edição ao clicar.
 * Pode funcionar com auto-save (com debounce) ou com botões de confirmar/cancelar.
 *
 * @example
 * ```tsx
 * <EditableNumber
 *   value={character.level}
 *   onChange={(level) => updateCharacter({ level })}
 *   label="Nível"
 *   variant="h6"
 *   min={1}
 *   max={30}
 * />
 * ```
 */
export function EditableNumber({
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  validate,
  variant = 'body1',
  autoSave = true,
  debounceMs = 500,
  showSign = false,
  enableDoubleClick = false,
  textFieldProps,
}: EditableNumberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar tempValue com value quando não está editando
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value.toString());
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
  const validateValue = (val: string): number | null => {
    const num = parseFloat(val);

    if (isNaN(num)) {
      setError('Valor inválido');
      return null;
    }

    if (min !== undefined && num < min) {
      setError(`Valor mínimo: ${min}`);
      return null;
    }

    if (max !== undefined && num > max) {
      setError(`Valor máximo: ${max}`);
      return null;
    }

    if (validate) {
      const validationError = validate(num);
      setError(validationError);
      return validationError === null ? num : null;
    }

    setError(null);
    return num;
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
        const validatedValue = validateValue(newValue);
        if (validatedValue !== null) {
          onChange(validatedValue);
        }
      }, debounceMs);
    }
  };

  // Confirmar edição (sem autoSave)
  const handleConfirm = () => {
    const validatedValue = validateValue(tempValue);
    if (validatedValue !== null) {
      onChange(validatedValue);
      setIsEditing(false);
      setError(null);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setTempValue(value.toString());
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
    } else if (e.key === 'Enter' && !autoSave) {
      handleConfirm();
    }
  };

  // Formatar valor para exibição
  const formatValue = (val: number): string => {
    if (showSign && val > 0) {
      return `+${val}`;
    }
    return val.toString();
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
        onClick={enableDoubleClick ? undefined : () => setIsEditing(true)}
        onDoubleClick={enableDoubleClick ? () => setIsEditing(true) : undefined}
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
          <Typography variant={variant}>{formatValue(value)}</Typography>
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
        type="number"
        value={tempValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={autoSave ? handleCancel : undefined}
        label={label}
        error={!!error}
        helperText={error}
        inputProps={{
          min,
          max,
          step,
        }}
        fullWidth
        size="small"
        {...textFieldProps}
      />

      {!autoSave && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={handleConfirm}
            aria-label="Confirmar"
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={handleCancel}
            aria-label="Cancelar"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
