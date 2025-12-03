/**
 * CraftForm - Formulário para criar/editar ofícios
 *
 * Permite configurar:
 * - Nome do ofício
 * - Nível (0-5)
 * - Atributo-chave
 * - Modificadores de dados e numéricos
 * - Descrição opcional
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type { Craft, AttributeName } from '@/types';
import { InlineModifiers } from './ModifierManager';

interface CraftFormProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Ofício sendo editado (null para novo) */
  craft: Craft | null;
  /** Atributos do personagem para cálculo */
  attributes: Record<AttributeName, number>;
  /** Callback ao salvar */
  onSave: (craft: Omit<Craft, 'id'>) => void;
  /** Callback ao fechar */
  onClose: () => void;
}

const ATTRIBUTE_OPTIONS: { value: AttributeName; label: string }[] = [
  { value: 'agilidade', label: 'Agilidade' },
  { value: 'constituicao', label: 'Constituição' },
  { value: 'forca', label: 'Força' },
  { value: 'influencia', label: 'Influência' },
  { value: 'mente', label: 'Mente' },
  { value: 'presenca', label: 'Presença' },
];

const LEVEL_OPTIONS: { value: 0 | 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 0, label: '0 - Leigo (×0)' },
  { value: 1, label: '1 - Iniciante (×1)' },
  { value: 2, label: '2 - Praticante (×1)' },
  { value: 3, label: '3 - Competente (×2)' },
  { value: 4, label: '4 - Proficiente (×2)' },
  { value: 5, label: '5 - Mestre (×3)' },
];

export function CraftForm({
  open,
  craft,
  attributes,
  onSave,
  onClose,
}: CraftFormProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [attributeKey, setAttributeKey] = useState<AttributeName>('mente');
  const [diceModifier, setDiceModifier] = useState(0);
  const [numericModifier, setNumericModifier] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Resetar form ao abrir/fechar ou ao mudar o ofício
  useEffect(() => {
    if (open) {
      if (craft) {
        // Edição
        setName(craft.name);
        setLevel(craft.level);
        setAttributeKey(craft.attributeKey);
        setDiceModifier(craft.diceModifier || 0);
        setNumericModifier(craft.numericModifier || 0);
        setDescription(craft.description || '');
      } else {
        // Novo
        setName('');
        setLevel(1);
        setAttributeKey('mente');
        setDiceModifier(0);
        setNumericModifier(0);
        setDescription('');
      }
      setError('');
    }
  }, [open, craft]);

  const handleSave = () => {
    // Validação
    if (!name.trim()) {
      setError('O nome do ofício é obrigatório');
      return;
    }

    const craftData: Omit<Craft, 'id'> = {
      name: name.trim(),
      level,
      attributeKey,
      diceModifier,
      numericModifier,
      description: description.trim() || undefined,
    };

    onSave(craftData);
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleModifiersUpdate = (dice: number, numeric: number) => {
    setDiceModifier(dice);
    setNumericModifier(numeric);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        {craft ? 'Editar Ofício' : 'Adicionar Novo Ofício'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nome do Ofício"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ferreiro, Carpinteiro, Alquimista..."
            fullWidth
            autoFocus
            error={!!error && !name.trim()}
            helperText={
              !!error && !name.trim() ? 'Nome é obrigatório' : undefined
            }
          />

          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Trabalha com metal, forja armas e armaduras..."
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth>
            <InputLabel>Atributo-Chave</InputLabel>
            <Select
              value={attributeKey}
              label="Atributo-Chave"
              onChange={(e) => setAttributeKey(e.target.value as AttributeName)}
            >
              {ATTRIBUTE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} ({attributes[option.value]})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Nível no Ofício</InputLabel>
            <Select
              value={level}
              label="Nível no Ofício"
              onChange={(e) =>
                setLevel(e.target.value as 0 | 1 | 2 | 3 | 4 | 5)
              }
            >
              {LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Modificadores */}
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Modificadores Adicionais
            </Typography>
            <InlineModifiers
              diceModifier={diceModifier}
              numericModifier={numericModifier}
              onUpdate={handleModifiersUpdate}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {craft ? 'Salvar Alterações' : 'Adicionar Ofício'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
