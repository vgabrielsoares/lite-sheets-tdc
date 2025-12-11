'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  FormHelperText,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export interface SelectOption<T = string> {
  /**
   * Valor da opção
   */
  value: T;

  /**
   * Label exibido
   */
  label: string;

  /**
   * Se a opção está desabilitada
   */
  disabled?: boolean;
}

export interface EditableSelectProps<T = string> {
  /**
   * Valor selecionado
   */
  value: T;

  /**
   * Callback quando o valor muda
   */
  onChange: (value: T) => void;

  /**
   * Opções disponíveis
   */
  options: SelectOption<T>[];

  /**
   * Label do campo
   */
  label?: string;

  /**
   * Placeholder quando não há valor
   */
  placeholder?: string;

  /**
   * Se o campo é obrigatório
   */
  required?: boolean;

  /**
   * Função de validação customizada
   */
  validate?: (value: T) => string | null;

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
   * Formato de exibição do valor no modo visualização
   */
  displayFormat?: (value: T, option?: SelectOption<T>) => string;

  /**
   * Props adicionais do Select
   */
  selectProps?: Partial<SelectProps>;

  /**
   * ID para testes
   */
  testId?: string;
}

/**
 * Componente de seleção editável inline
 *
 * Exibe o valor selecionado normalmente e permite edição ao clicar.
 * Pode funcionar com auto-save ou com botões de confirmar/cancelar.
 *
 * @example
 * ```tsx
 * <EditableSelect
 *   value={character.size}
 *   onChange={(size) => updateCharacter({ size })}
 *   options={[
 *     { value: 'small', label: 'Pequeno' },
 *     { value: 'medium', label: 'Médio' },
 *     { value: 'large', label: 'Grande' },
 *   ]}
 *   label="Tamanho"
 *   variant="body1"
 * />
 * ```
 */
export const EditableSelect = React.memo(function EditableSelect<
  T extends string | number = string,
>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Selecione',
  required = false,
  validate,
  variant = 'body1',
  autoSave = true,
  displayFormat,
  selectProps,
  testId = 'editable-select',
}: EditableSelectProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<T>(value);
  const [error, setError] = useState<string | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Sincronizar tempValue com value quando não está editando
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus quando entra em modo de edição
  useEffect(() => {
    if (isEditing && selectRef.current) {
      // Timeout para garantir que o Select está renderizado
      setTimeout(() => {
        selectRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);

  // Validar valor
  const validateValue = (val: T): boolean => {
    if (required && !val) {
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

  // Handler de mudança
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as T;
    setTempValue(newValue);

    if (autoSave) {
      if (validateValue(newValue)) {
        onChange(newValue);
        setIsEditing(false);
        setError(null);
      }
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
  };

  // Obter a opção selecionada
  const selectedOption = options.find((opt) => opt.value === value);

  // Formatar o valor para exibição
  const getDisplayValue = () => {
    if (!value && !selectedOption) {
      return placeholder;
    }

    if (displayFormat) {
      return displayFormat(value, selectedOption);
    }

    return selectedOption?.label || String(value);
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
        data-testid={testId}
      >
        <Box sx={{ flex: 1 }}>
          {label && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {label}
              {required && ' *'}
            </Typography>
          )}
          <Typography
            variant={variant}
            color={value ? 'text.primary' : 'text.disabled'}
          >
            {getDisplayValue()}
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
          data-testid={`${testId}-edit-icon`}
        />
      </Box>
    );
  }

  // Modo de edição
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
      data-testid={`${testId}-edit-mode`}
    >
      <FormControl fullWidth size="small" error={!!error} required={required}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          inputRef={selectRef}
          value={tempValue}
          onChange={handleChange}
          label={label}
          {...selectProps}
          data-testid={`${testId}-select`}
        >
          {!required && (
            <MenuItem value="" data-testid={`${testId}-option-empty`}>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
              data-testid={`${testId}-option-${option.value}`}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      {!autoSave && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={handleConfirm}
            data-testid={`${testId}-confirm`}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={handleCancel}
            data-testid={`${testId}-cancel`}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
});
