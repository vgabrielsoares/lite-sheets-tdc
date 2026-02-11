/**
 * OriginStep - Passo 2: Origem do Personagem
 *
 * Campos:
 * - Nome da origem (obrigatório)
 * - Descrição (opcional)
 * - Proficiências de skill (exatamente 2)
 * - Modificadores de atributo (Opção 1 ou 2)
 * - Itens de origem (lista dinâmica)
 * - Habilidade especial (nome + descrição)
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  Chip,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Button,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { WizardItem } from '@/types/wizard';
import type { SkillName } from '@/types/skills';
import { SKILL_LIST } from '@/types/skills';
import { SKILL_LABELS } from '@/constants/skills';
import { ATTRIBUTE_LABELS, ATTRIBUTE_LIST } from '@/constants/attributes';
import type { AttributeName } from '@/types/attributes';

/** Número máximo de proficiências de skill pela origem */
const MAX_SKILL_PROFICIENCIES = 2;

/**
 * Componente para o passo de origem do personagem
 */
export default function OriginStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { origin } = state;

  // Estado local para novo item sendo adicionado
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  // Verificações de validação
  const isNameEmpty = !origin.name.trim();
  const skillCount = origin.skillProficiencies.length;
  const hasEnoughSkills = skillCount === MAX_SKILL_PROFICIENCIES;

  // Handler para atualizar nome da origem
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNestedState('origin', { name: event.target.value });
    },
    [updateNestedState]
  );

  // Handler para atualizar descrição
  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNestedState('origin', { description: event.target.value });
    },
    [updateNestedState]
  );

  // Handler para alterar proficiências de skill
  const handleSkillChange = useCallback(
    (event: SelectChangeEvent<SkillName[]>) => {
      const {
        target: { value },
      } = event;
      const skills = (
        typeof value === 'string' ? value.split(',') : value
      ) as SkillName[];
      // Limitar a 2 seleções
      if (skills.length <= MAX_SKILL_PROFICIENCIES) {
        updateNestedState('origin', { skillProficiencies: skills });
      }
    },
    [updateNestedState]
  );

  // Handler para alternar opção de modificador - NOT NEEDED ANYMORE, using free-form

  // Handler para alterar atributo de um modificador
  const handleModifierAttributeChange = useCallback(
    (index: number, attr: AttributeName | '') => {
      const currentMods = [...origin.attributeModifiers];

      if (attr === '') {
        // Remove this modifier
        currentMods.splice(index, 1);
      } else if (index < currentMods.length) {
        currentMods[index] = { ...currentMods[index], attribute: attr };
      }

      updateNestedState('origin', { attributeModifiers: currentMods });
    },
    [origin.attributeModifiers, updateNestedState]
  );

  // Handler para alterar valor de um modificador
  const handleModifierValueChange = useCallback(
    (index: number, value: number) => {
      const currentMods = [...origin.attributeModifiers];
      if (index < currentMods.length) {
        currentMods[index] = { ...currentMods[index], value };
      }
      updateNestedState('origin', { attributeModifiers: currentMods });
    },
    [origin.attributeModifiers, updateNestedState]
  );

  // Handler para adicionar modificador
  const handleAddModifier = useCallback(() => {
    if (origin.attributeModifiers.length >= 3) return;
    const usedAttrs = origin.attributeModifiers.map((m) => m.attribute);
    const availableAttr = ATTRIBUTE_LIST.find((a) => !usedAttrs.includes(a));
    if (availableAttr) {
      updateNestedState('origin', {
        attributeModifiers: [
          ...origin.attributeModifiers,
          { attribute: availableAttr, value: 1 },
        ],
      });
    }
  }, [origin.attributeModifiers, updateNestedState]);

  // Handler para remover modificador
  const handleRemoveModifier = useCallback(
    (index: number) => {
      const currentMods = origin.attributeModifiers.filter(
        (_, i) => i !== index
      );
      updateNestedState('origin', { attributeModifiers: currentMods });
    },
    [origin.attributeModifiers, updateNestedState]
  );

  // Handler para adicionar item
  const handleAddItem = useCallback(() => {
    if (newItemName.trim()) {
      const newItem: WizardItem = {
        name: newItemName.trim(),
        quantity: newItemQuantity,
      };
      updateNestedState('origin', {
        items: [...origin.items, newItem],
      });
      setNewItemName('');
      setNewItemQuantity(1);
    }
  }, [newItemName, newItemQuantity, origin.items, updateNestedState]);

  // Handler para remover item
  const handleRemoveItem = useCallback(
    (index: number) => {
      const newItems = origin.items.filter((_, i) => i !== index);
      updateNestedState('origin', { items: newItems });
    },
    [origin.items, updateNestedState]
  );

  // Handler para atualizar habilidade especial
  const handleSpecialAbilityChange = useCallback(
    (field: 'name' | 'description') =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const current = origin.specialAbility || { name: '', description: '' };
        const updated = { ...current, [field]: event.target.value };

        // Se ambos os campos estiverem vazios, remover a habilidade
        if (!updated.name.trim() && !updated.description.trim()) {
          updateNestedState('origin', { specialAbility: undefined });
        } else {
          updateNestedState('origin', { specialAbility: updated });
        }
      },
    [origin.specialAbility, updateNestedState]
  );

  // Atributos já usados nos modificadores (para evitar duplicatas)
  const usedAttributes = useMemo(
    () => origin.attributeModifiers.map((m) => m.attribute),
    [origin.attributeModifiers]
  );

  return (
    <Stack spacing={3}>
      {/* Seção: Identificação da Origem */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HomeIcon color="primary" />
          <Typography variant="h6" color="text.primary">
            Origem
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          {/* Nome da Origem */}
          <TextField
            label="Nome da Origem"
            value={origin.name}
            onChange={handleNameChange}
            fullWidth
            required
            placeholder="Ex: Soldado, Nobre, Criminoso, Eremita"
            error={isNameEmpty}
            helperText={
              isNameEmpty ? 'O nome da origem é obrigatório' : undefined
            }
            sx={{
              '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'warning.main',
                },
              '& .MuiFormHelperText-root.Mui-error': {
                color: 'warning.main',
              },
            }}
          />

          {/* Descrição */}
          <TextField
            label="Descrição"
            value={origin.description || ''}
            onChange={handleDescriptionChange}
            fullWidth
            multiline
            rows={2}
            placeholder="Descreva brevemente a origem do seu personagem (opcional)"
          />
        </Stack>
      </Paper>

      {/* Seção: Proficiências de Habilidade */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <SchoolIcon color="secondary" />
          <Typography variant="h6" color="text.primary">
            Proficiências de Habilidade
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escolha exatamente 2 habilidades em que seu personagem ganha
          proficiência pela origem.
        </Typography>

        <FormControl fullWidth error={!hasEnoughSkills}>
          <InputLabel id="origin-skills-label">
            Proficiências ({skillCount}/2)
          </InputLabel>
          <Select
            labelId="origin-skills-label"
            multiple
            value={origin.skillProficiencies}
            onChange={handleSkillChange}
            input={<OutlinedInput label={`Proficiências (${skillCount}/2)`} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((skillName) => (
                  <Chip
                    key={skillName}
                    label={SKILL_LABELS[skillName]}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          >
            {SKILL_LIST.map((skillName) => (
              <MenuItem
                key={skillName}
                value={skillName}
                disabled={
                  !origin.skillProficiencies.includes(skillName) &&
                  origin.skillProficiencies.length >= MAX_SKILL_PROFICIENCIES
                }
              >
                <Checkbox
                  checked={origin.skillProficiencies.includes(skillName)}
                />
                <ListItemText primary={SKILL_LABELS[skillName]} />
              </MenuItem>
            ))}
          </Select>
          {!hasEnoughSkills && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
              Selecione exatamente 2 habilidades
            </Typography>
          )}
        </FormControl>
      </Paper>

      {/* Seção: Modificadores de Atributo */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Modificadores de Atributo
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A origem concede modificadores de atributos seguindo uma das opções:
        </Typography>

        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>+1 em 1 atributo</li>
            <li>+1 em 2 atributos e -1 em 1 atributo</li>
          </Typography>
        </Alert>

        {/* Lista de modificadores */}
        <Stack spacing={2}>
          {origin.attributeModifiers.map((modifier, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <FormControl sx={{ flex: 2 }} size="small">
                <InputLabel>Atributo</InputLabel>
                <Select
                  value={modifier.attribute}
                  onChange={(e) =>
                    handleModifierAttributeChange(
                      index,
                      e.target.value as AttributeName
                    )
                  }
                  label="Atributo"
                >
                  {ATTRIBUTE_LIST.map((attr) => (
                    <MenuItem
                      key={attr}
                      value={attr}
                      disabled={
                        usedAttributes.includes(attr) &&
                        modifier.attribute !== attr
                      }
                    >
                      {ATTRIBUTE_LABELS[attr]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }} size="small">
                <InputLabel>Valor</InputLabel>
                <Select
                  value={modifier.value}
                  onChange={(e) =>
                    handleModifierValueChange(index, e.target.value as number)
                  }
                  label="Valor"
                >
                  <MenuItem value={1}>+1</MenuItem>
                  <MenuItem value={-1}>-1</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                color="error"
                onClick={() => handleRemoveModifier(index)}
                aria-label="Remover modificador"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Botão para adicionar modificador */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddModifier}
            disabled={origin.attributeModifiers.length >= 3}
            size="small"
          >
            Adicionar Modificador
          </Button>
        </Stack>
      </Paper>

      {/* Seção: Itens de Origem */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <InventoryIcon color="info" />
          <Typography variant="h6" color="text.primary">
            Itens de Origem
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Adicione itens que o personagem recebe pela origem (opcional).
        </Typography>

        {/* Lista de itens existentes */}
        {origin.items.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {origin.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  aria-label={`Remover ${item.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {/* Formulário para adicionar novo item */}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            label="Nome do Item"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            placeholder="Ex: Espada, Escudo, Corda"
          />
          <TextField
            label="Qtd"
            type="number"
            value={newItemQuantity}
            onChange={(e) =>
              setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            size="small"
            sx={{ width: 80 }}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            disabled={!newItemName.trim()}
            size="small"
          >
            Adicionar
          </Button>
        </Stack>
      </Paper>

      {/* Seção: Habilidade Especial */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <AutoAwesomeIcon color="warning" />
          <Typography variant="h6" color="text.primary">
            Habilidade Especial da Origem
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Se a origem concede uma habilidade especial, preencha abaixo
          (opcional).
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Nome da Habilidade"
            value={origin.specialAbility?.name || ''}
            onChange={handleSpecialAbilityChange('name')}
            fullWidth
            size="small"
            placeholder="Ex: Sentido de Perigo, Dom da Mentira"
          />
          <TextField
            label="Descrição"
            value={origin.specialAbility?.description || ''}
            onChange={handleSpecialAbilityChange('description')}
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Descreva o efeito da habilidade"
          />
        </Stack>

        {origin.specialAbility?.name && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            Esta habilidade será adicionada automaticamente às Habilidades
            Especiais do personagem.
          </Alert>
        )}
      </Paper>

      {/* Dica */}
      <Alert severity="info" variant="outlined">
        <Typography variant="body2">
          <strong>Dica:</strong> A origem representa o passado do personagem
          antes de se tornar aventureiro. As proficiências e modificadores
          escolhidos aqui serão aplicados automaticamente.
        </Typography>
      </Alert>
    </Stack>
  );
}
