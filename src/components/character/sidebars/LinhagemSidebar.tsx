'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Divider,
  IconButton,
  Button,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';

import { Sidebar } from '@/components/shared';
import type { Lineage, LanguageName, AncestryTrait } from '@/types/character';
import type {
  CreatureSize,
  VisionType,
  SenseType,
  MovementType,
} from '@/types/common';
import {
  CREATURE_SIZES,
  VISION_TYPES,
  SENSE_TYPES,
  MOVEMENT_TYPES,
  SIZE_LABELS,
  VISION_LABELS,
  SENSE_LABELS,
  MOVEMENT_LABELS,
  SIZE_DESCRIPTIONS,
  VISION_DESCRIPTIONS,
  KEEN_SENSE_DESCRIPTIONS,
  SIZE_MODIFIERS,
  getSizeModifiers,
} from '@/constants/lineage';
import { LANGUAGE_LIST, LANGUAGE_LABELS } from '@/constants/languages';
import { createDefaultLineage, validateLineage } from '@/utils/lineageUtils';
import { useDebounce } from '@/hooks/useDebounce';

export interface LinhagemSidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Dados atuais da linhagem (pode ser undefined se ainda não definida)
   */
  lineage?: Lineage;

  /**
   * Callback chamado quando a linhagem é atualizada
   * @param lineage - Nova linhagem
   */
  onUpdate: (lineage: Lineage) => void;

  /**
   * Se true, exibe informações de validação
   * @default true
   */
  showValidation?: boolean;
}

/**
 * Sidebar de Detalhes - Linhagem
 *
 * Sidebar completa para editar todos os aspectos da linhagem de um personagem:
 * - Nome e descrição
 * - Modificadores de atributos (+1 em um, ou +1 em dois e -1 em um)
 * - Tamanho (com visualização de modificadores)
 * - Altura, peso (kg e medida RPG)
 * - Idade
 * - Idiomas ganhos
 * - Deslocamento por tipo
 * - Sentido aguçado
 * - Tipo de visão
 * - Características de ancestralidade
 *
 * Os modificadores são aplicados automaticamente ao personagem quando salvos.
 *
 * @example
 * ```tsx
 * <LinhagemSidebar
 *   open={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   lineage={character.lineage}
 *   onUpdate={(lineage) => updateCharacterLineage(character.id, lineage)}
 * />
 * ```
 */
export function LinhagemSidebar({
  open,
  onClose,
  lineage,
  onUpdate,
  showValidation = true,
}: LinhagemSidebarProps) {
  // Estado local da linhagem sendo editada
  const [localLineage, setLocalLineage] = useState<Lineage>(
    () => lineage || createDefaultLineage()
  );

  // Debounce para auto-save
  const debouncedLineage = useDebounce(localLineage, 500);

  // Estado de validação
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Sincroniza estado local com props quando a linhagem externa muda
   * Apenas sincroniza se a sidebar acabou de abrir ou se houve mudança externa significativa
   */
  useEffect(() => {
    if (open) {
      // Quando a sidebar abre, carrega a linhagem mais recente
      const currentLineage = lineage || createDefaultLineage();
      setLocalLineage(currentLineage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * Sincroniza quando a linhagem externa muda significativamente
   */
  useEffect(() => {
    if (lineage && open) {
      // Apenas atualiza se for significativamente diferente (evita loops de sincronização)
      if (JSON.stringify(lineage) !== JSON.stringify(localLineage)) {
        setLocalLineage(lineage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineage]);

  /**
   * Auto-save com debounce
   */
  useEffect(() => {
    if (debouncedLineage && open) {
      // Valida antes de salvar
      const isValid = validateLineage(debouncedLineage);
      if (isValid) {
        onUpdate(debouncedLineage);
        setValidationErrors([]);
      } else {
        // Coleta erros de validação
        const errors: string[] = [];
        if (!debouncedLineage.name || debouncedLineage.name.trim() === '') {
          errors.push('Nome da linhagem é obrigatório');
        }
        setValidationErrors(errors);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLineage]);

  /**
   * Atualiza campo de texto da linhagem
   */
  const handleTextChange =
    (field: keyof Lineage) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalLineage((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  /**
   * Atualiza campo numérico da linhagem
   */
  const handleNumberChange =
    (field: keyof Lineage) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        setLocalLineage((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  /**
   * Atualiza tamanho
   */
  const handleSizeChange = (event: SelectChangeEvent<CreatureSize>) => {
    setLocalLineage((prev) => ({
      ...prev,
      size: event.target.value as CreatureSize,
    }));
  };

  /**
   * Atualiza tipo de visão
   */
  const handleVisionChange = (event: SelectChangeEvent<VisionType>) => {
    setLocalLineage((prev) => ({
      ...prev,
      vision: event.target.value as VisionType,
    }));
  };

  /**
   * Atualiza sentidos aguçados (multiselect)
   */
  const handleKeenSensesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const senses = (
      typeof value === 'string' ? value.split(',') : value
    ) as SenseType[];
    setLocalLineage((prev) => ({
      ...prev,
      keenSenses: senses,
    }));
  };

  /**
   * Atualiza idiomas selecionados
   */
  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const languages = (
      typeof value === 'string' ? value.split(',') : value
    ) as LanguageName[];
    setLocalLineage((prev) => ({
      ...prev,
      languages,
    }));
  };

  /**
   * Atualiza velocidade de deslocamento
   */
  const handleMovementChange =
    (movementType: MovementType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10) || 0;
      setLocalLineage((prev) => ({
        ...prev,
        movement: {
          ...prev.movement,
          [movementType]: value,
        },
      }));
    };

  /**
   * Adiciona nova característica de ancestralidade
   */
  const handleAddAncestryTrait = () => {
    setLocalLineage((prev) => ({
      ...prev,
      ancestryTraits: [...prev.ancestryTraits, { name: '', description: '' }],
    }));
  };

  /**
   * Remove característica de ancestralidade
   */
  const handleRemoveAncestryTrait = (index: number) => {
    setLocalLineage((prev) => ({
      ...prev,
      ancestryTraits: prev.ancestryTraits.filter((_, i) => i !== index),
    }));
  };

  /**
   * Atualiza característica de ancestralidade
   */
  const handleAncestryTraitChange =
    (index: number, field: keyof AncestryTrait) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalLineage((prev) => ({
        ...prev,
        ancestryTraits: prev.ancestryTraits.map((trait, i) =>
          i === index ? { ...trait, [field]: event.target.value } : trait
        ),
      }));
    };

  /**
   * Obtém modificadores do tamanho atual
   */
  const sizeModifiers = getSizeModifiers(localLineage.size);

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title="Linhagem do Personagem"
      width="lg"
      anchor="right"
      showOverlay={false}
      closeOnOverlayClick={false}
    >
      <Box sx={{ p: 3 }}>
        {/* Validação */}
        {showValidation && validationErrors.length > 0 && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'error.light',
              borderRadius: 1,
              color: 'error.contrastText',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Erros de validação:
            </Typography>
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Box>
        )}

        <Stack spacing={3}>
          {/* Nome da Linhagem */}
          <TextField
            label="Nome da Linhagem"
            value={localLineage.name}
            onChange={handleTextChange('name')}
            fullWidth
            required
            error={
              showValidation &&
              (!localLineage.name || localLineage.name.trim() === '')
            }
            helperText={
              showValidation &&
              (!localLineage.name || localLineage.name.trim() === '')
                ? 'Nome é obrigatório'
                : 'Ex: Humano, Elfo, Anão, etc.'
            }
          />

          {/* Descrição */}
          <TextField
            label="Descrição da Linhagem"
            value={localLineage.description || ''}
            onChange={handleTextChange('description')}
            fullWidth
            multiline
            rows={3}
            helperText="Descrição geral da linhagem e suas características"
          />

          <Divider />

          {/* Tamanho */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>Tamanho</InputLabel>
              <Select
                value={localLineage.size}
                onChange={handleSizeChange}
                label="Tamanho"
              >
                {CREATURE_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {SIZE_LABELS[size]}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {SIZE_DESCRIPTIONS[localLineage.size]}
              </FormHelperText>
            </FormControl>

            {/* Modificadores de Tamanho (Info) */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon fontSize="small" color="primary" />
                  <Typography>Modificadores de Tamanho</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Alcance:</strong> {sizeModifiers.reach}m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dano Corpo-a-corpo:</strong>{' '}
                    {sizeModifiers.meleeDamage >= 0 ? '+' : ''}
                    {sizeModifiers.meleeDamage}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Defesa:</strong>{' '}
                    {sizeModifiers.defense >= 0 ? '+' : ''}
                    {sizeModifiers.defense}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Quadrados Ocupados:</strong>{' '}
                    {sizeModifiers.squaresOccupied}m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Capacidade de Carga:</strong> ×
                    {sizeModifiers.carryingCapacity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Manobras de Combate:</strong>{' '}
                    {sizeModifiers.combatManeuvers >= 0 ? '+' : ''}
                    {sizeModifiers.combatManeuvers}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ND de Rastreio:</strong>{' '}
                    {sizeModifiers.trackingDC >= 0 ? '+' : ''}
                    {sizeModifiers.trackingDC}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Modificadores de Habilidades:
                  </Typography>
                  {Object.entries(sizeModifiers.skillModifiers).map(
                    ([skill, mod]) => (
                      <Typography key={skill} variant="body2">
                        <strong style={{ textTransform: 'capitalize' }}>
                          {skill}:
                        </strong>{' '}
                        {mod >= 0 ? '+' : ''}
                        {mod}
                      </Typography>
                    )
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider />

          {/* Altura, Peso e Idade */}
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Altura (cm)"
                type="number"
                value={localLineage.height}
                onChange={handleNumberChange('height')}
                fullWidth
                inputProps={{ min: 10, max: 1000 }}
              />
              <TextField
                label="Peso (kg)"
                type="number"
                value={localLineage.weightKg}
                onChange={handleNumberChange('weightKg')}
                fullWidth
                inputProps={{ min: 1, max: 10000 }}
              />
              <TextField
                label='Peso (medida "Peso")'
                type="number"
                value={localLineage.weightRPG}
                onChange={handleNumberChange('weightRPG')}
                fullWidth
                helperText="Medida do RPG"
                inputProps={{ min: 1, max: 10000 }}
              />
            </Stack>
            <TextField
              label="Idade"
              type="number"
              value={localLineage.age}
              onChange={handleNumberChange('age')}
              fullWidth
              sx={{ mt: 2 }}
              inputProps={{ min: 0, max: 10000 }}
            />
          </Box>

          <Divider />

          {/* Idiomas */}
          <FormControl fullWidth>
            <InputLabel>Idiomas Ganhos pela Linhagem</InputLabel>
            <Select
              multiple
              value={localLineage.languages}
              onChange={handleLanguagesChange}
              input={<OutlinedInput label="Idiomas Ganhos pela Linhagem" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as LanguageName[]).map((value) => (
                    <Chip
                      key={value}
                      label={LANGUAGE_LABELS[value]}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {LANGUAGE_LIST.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Idiomas automaticamente conhecidos por esta linhagem
            </FormHelperText>
          </FormControl>

          <Divider />

          {/* Deslocamento */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Deslocamento
            </Typography>
            <Stack spacing={2}>
              {MOVEMENT_TYPES.map((movementType) => (
                <TextField
                  key={movementType}
                  label={MOVEMENT_LABELS[movementType]}
                  type="number"
                  value={localLineage.movement[movementType]}
                  onChange={handleMovementChange(movementType)}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                  helperText="metros"
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Sentidos */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Sentidos
            </Typography>

            <Stack spacing={2}>
              {/* Tipo de Visão */}
              <FormControl fullWidth>
                <InputLabel>Tipo de Visão</InputLabel>
                <Select
                  value={localLineage.vision}
                  onChange={handleVisionChange}
                  label="Tipo de Visão"
                >
                  {VISION_TYPES.map((vision) => (
                    <MenuItem key={vision} value={vision}>
                      {VISION_LABELS[vision]}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {VISION_DESCRIPTIONS[localLineage.vision]}
                </FormHelperText>
              </FormControl>

              {/* Sentidos Aguçados */}
              <FormControl fullWidth>
                <InputLabel>Sentidos Aguçados</InputLabel>
                <Select
                  multiple
                  value={localLineage.keenSenses || []}
                  onChange={handleKeenSensesChange}
                  label="Sentidos Aguçados"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((sense) => (
                        <Chip
                          key={sense}
                          label={SENSE_LABELS[sense]}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {SENSE_TYPES.map((sense) => (
                    <MenuItem key={sense} value={sense}>
                      {SENSE_LABELS[sense]}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {localLineage.keenSenses && localLineage.keenSenses.length > 0
                    ? `${localLineage.keenSenses.length} sentido(s) selecionado(s): ${localLineage.keenSenses.map((s) => SENSE_LABELS[s]).join(', ')}`
                    : 'Nenhum sentido aguçado selecionado'}
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Divider />

          {/* Características de Ancestralidade */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Características de Ancestralidade
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAncestryTrait}
                size="small"
                variant="outlined"
              >
                Adicionar
              </Button>
            </Box>

            {localLineage.ancestryTraits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma característica de ancestralidade definida. Clique em
                "Adicionar" para criar uma.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {localLineage.ancestryTraits.map((trait, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <IconButton
                      onClick={() => handleRemoveAncestryTrait(index)}
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <Stack spacing={2}>
                      <TextField
                        label="Nome da Característica"
                        value={trait.name}
                        onChange={handleAncestryTraitChange(index, 'name')}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Descrição"
                        value={trait.description}
                        onChange={handleAncestryTraitChange(
                          index,
                          'description'
                        )}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Sidebar>
  );
}
