'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';

import { Sidebar } from '@/components/shared';
import type { Lineage, LanguageName, AncestryTrait } from '@/types/character';
import type { AttributeName } from '@/types/attributes';
import type {
  CreatureSize,
  VisionType,
  SenseType,
  KeenSense,
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
  LINEAGE_ATTRIBUTE_MODIFIER_RULES,
  LINEAGE_VALIDATION,
} from '@/constants/lineage';
import {
  ATTRIBUTE_LIST,
  ATTRIBUTE_LABELS,
} from '@/constants/attributes';
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
 * - Modificadores de atributos (4 opções: +1 em um, +1 em dois e -1 em um, +2 em um e -1 em outro, ou +1 em dois)
 * - Tamanho (com visualização de modificadores)
 * - Altura, peso (kg e medida RPG)
 * - Idade, maioridade e expectativa de vida
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

  // Flag para controlar se o usuário já editou algo
  const [hasUserEdited, setHasUserEdited] = useState(false);

  /**
   * Sincroniza estado local com props quando a linhagem externa muda
   * Apenas sincroniza se a sidebar acabou de abrir ou se houve mudança externa significativa
   */
  useEffect(() => {
    if (open) {
      // Quando a sidebar abre, carrega a linhagem mais recente
      const currentLineage = lineage || createDefaultLineage();
      setLocalLineage(currentLineage);
      setHasUserEdited(false); // Reset flag quando abre
      setValidationErrors([]); // Limpa erros ao abrir
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
    if (debouncedLineage && open && hasUserEdited) {
      // Valida antes de salvar
      const isValid = validateLineage(debouncedLineage);
      if (isValid) {
        onUpdate(debouncedLineage);
        setValidationErrors([]);
      } else {
        // Coleta erros de validação apenas se usuário já editou
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
      setHasUserEdited(true); // Marca que usuário editou
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
      setHasUserEdited(true); // Marca que usuário editou
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
    setHasUserEdited(true); // Marca que usuário editou
    setLocalLineage((prev) => ({
      ...prev,
      size: event.target.value as CreatureSize,
    }));
  };

  /**
   * Atualiza tipo de visão
   */
  const handleVisionChange = (event: SelectChangeEvent<VisionType>) => {
    setHasUserEdited(true); // Marca que usuário editou
    setLocalLineage((prev) => ({
      ...prev,
      vision: event.target.value as VisionType,
    }));
  };

  /**
   * Adiciona novo sentido aguçado
   */
  const handleAddKeenSense = () => {
    setHasUserEdited(true);
    setLocalLineage((prev) => ({
      ...prev,
      keenSenses: [
        ...(prev.keenSenses || []),
        { type: 'visao', bonus: 5, description: '' },
      ],
    }));
  };

  /**
   * Remove sentido aguçado
   */
  const handleRemoveKeenSense = (index: number) => {
    setHasUserEdited(true);
    setLocalLineage((prev) => ({
      ...prev,
      keenSenses: (prev.keenSenses || []).filter((_, i) => i !== index),
    }));
  };

  /**
   * Atualiza tipo de sentido aguçado
   */
  const handleKeenSenseTypeChange =
    (index: number) => (event: SelectChangeEvent<SenseType>) => {
      setHasUserEdited(true);
      setLocalLineage((prev) => ({
        ...prev,
        keenSenses: (prev.keenSenses || []).map((sense, i) =>
          i === index
            ? { ...sense, type: event.target.value as SenseType }
            : sense
        ),
      }));
    };

  /**
   * Atualiza bônus de sentido aguçado
   */
  const handleKeenSenseBonusChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setHasUserEdited(true);
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        setLocalLineage((prev) => ({
          ...prev,
          keenSenses: (prev.keenSenses || []).map((sense, i) =>
            i === index ? { ...sense, bonus: value } : sense
          ),
        }));
      }
    };

  /**
   * Atualiza descrição de sentido aguçado
   */
  const handleKeenSenseDescriptionChange =
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setHasUserEdited(true);
      setLocalLineage((prev) => ({
        ...prev,
        keenSenses: (prev.keenSenses || []).map((sense, i) =>
          i === index ? { ...sense, description: event.target.value } : sense
        ),
      }));
    };

  /**
   * Adiciona novo modificador de atributo
   */
  const handleAddAttributeModifier = () => {
    setHasUserEdited(true);
    setLocalLineage((prev) => ({
      ...prev,
      attributeModifiers: [
        ...(prev.attributeModifiers ?? []),
        { attribute: 'agilidade', value: 1 },
      ],
    }));
  };

  /**
   * Remove modificador de atributo
   */
  const handleRemoveAttributeModifier = (index: number) => {
    setHasUserEdited(true);
    setLocalLineage((prev) => ({
      ...prev,
      attributeModifiers: (prev.attributeModifiers ?? []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  /**
   * Atualiza atributo do modificador
   */
  const handleAttributeModifierAttributeChange = (
    index: number,
    event: SelectChangeEvent<AttributeName>
  ) => {
    setHasUserEdited(true);
    const newAttribute = event.target.value as AttributeName;
    setLocalLineage((prev) => ({
      ...prev,
      attributeModifiers: (prev.attributeModifiers ?? []).map((mod, i) =>
        i === index ? { ...mod, attribute: newAttribute } : mod
      ),
    }));
  };

  /**
   * Atualiza valor do modificador (+2, +1 ou -1)
   */
  const handleAttributeModifierValueChange = (
    index: number,
    event: SelectChangeEvent<number>
  ) => {
    setHasUserEdited(true);
    const newValue = Number(event.target.value);
    setLocalLineage((prev) => ({
      ...prev,
      attributeModifiers: (prev.attributeModifiers ?? []).map((mod, i) =>
        i === index ? { ...mod, value: newValue } : mod
      ),
    }));
  };

  /**
   * Atualiza idiomas selecionados
   */
  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    setHasUserEdited(true); // Marca que usuário editou
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
      setHasUserEdited(true); // Marca que usuário editou
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
    setHasUserEdited(true); // Marca que usuário editou
    setLocalLineage((prev) => ({
      ...prev,
      ancestryTraits: [...prev.ancestryTraits, { name: '', description: '' }],
    }));
  };

  /**
   * Remove característica de ancestralidade
   */
  const handleRemoveAncestryTrait = (index: number) => {
    setHasUserEdited(true); // Marca que usuário editou
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
      setHasUserEdited(true); // Marca que usuário editou
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

  /**
   * Valida modificadores de atributos
   */
  const attributeModifiersValidation =
    LINEAGE_VALIDATION.validateAttributeModifiers(
      localLineage.attributeModifiers ?? []
    );

  return (
    <Sidebar open={open} onClose={onClose} title="Linhagem do Personagem">
      <Stack spacing={3}>
        {/* Validação - apenas exibe se usuário já editou */}
        {showValidation && hasUserEdited && validationErrors.length > 0 && (
          <Box
            sx={{
              p: 2,
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

        {/* Modificadores de Atributos */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Modificadores de Atributos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2" gutterBottom>
                  A linhagem concede modificadores de atributos seguindo uma
                  das opções:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>
                    {LINEAGE_ATTRIBUTE_MODIFIER_RULES.SINGLE_BONUS.description}
                  </li>
                  <li>
                    {
                      LINEAGE_ATTRIBUTE_MODIFIER_RULES
                        .DOUBLE_BONUS_SINGLE_PENALTY.description
                    }
                  </li>
                  <li>
                    {
                      LINEAGE_ATTRIBUTE_MODIFIER_RULES
                        .MAJOR_BONUS_SINGLE_PENALTY.description
                    }
                  </li>
                  <li>
                    {LINEAGE_ATTRIBUTE_MODIFIER_RULES.DOUBLE_BONUS.description}
                  </li>
                </Typography>
              </Alert>

              {/* Lista de modificadores */}
              {(localLineage.attributeModifiers ?? []).map((modifier, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-start',
                  }}
                >
                  <FormControl sx={{ flex: 2 }}>
                    <InputLabel>Atributo</InputLabel>
                    <Select
                      value={modifier.attribute}
                      onChange={(e) =>
                        handleAttributeModifierAttributeChange(
                          index,
                          e as SelectChangeEvent<AttributeName>
                        )
                      }
                      label="Atributo"
                    >
                      {ATTRIBUTE_LIST.map((attr) => (
                        <MenuItem key={attr} value={attr}>
                          {ATTRIBUTE_LABELS[attr]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Valor</InputLabel>
                    <Select
                      value={modifier.value}
                      onChange={(e) =>
                        handleAttributeModifierValueChange(
                          index,
                          e as SelectChangeEvent<number>
                        )
                      }
                      label="Valor"
                    >
                      <MenuItem value={2}>+2</MenuItem>
                      <MenuItem value={1}>+1</MenuItem>
                      <MenuItem value={-1}>-1</MenuItem>
                    </Select>
                  </FormControl>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveAttributeModifier(index)}
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
                onClick={handleAddAttributeModifier}
                disabled={(localLineage.attributeModifiers ?? []).length >= 3}
              >
                Adicionar Modificador
              </Button>

              {/* Mensagens de validação */}
              {showValidation && !attributeModifiersValidation.valid && (
                <Alert severity="error">
                  {attributeModifiersValidation.errors.map((error, idx) => (
                    <Typography key={idx} variant="body2">
                      • {error}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Tamanho */}
        <Box>
          <FormControl fullWidth>
            <InputLabel id="size-label">Tamanho</InputLabel>
            <Select
              labelId="size-label"
              id="size-select"
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
              label='Peso'
              type="number"
              value={localLineage.weightRPG}
              onChange={handleNumberChange('weightRPG')}
              fullWidth
              helperText="Medida do RPG"
              inputProps={{ min: 1, max: 10000 }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Idade"
              type="number"
              value={localLineage.age}
              onChange={handleNumberChange('age')}
              fullWidth
              inputProps={{ min: 0, max: 10000 }}
            />
            <TextField
              label="Maioridade"
              type="number"
              value={localLineage.adulthood ?? ''}
              onChange={handleNumberChange('adulthood')}
              fullWidth
              helperText="Idade em que atinge a maioridade"
              inputProps={{ min: 0, max: 10000 }}
            />
            <TextField
              label="Expectativa de Vida"
              type="number"
              value={localLineage.lifeExpectancy ?? ''}
              onChange={handleNumberChange('lifeExpectancy')}
              fullWidth
              helperText="Anos de vida esperados"
              inputProps={{ min: 0, max: 10000 }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Idiomas */}
        <FormControl fullWidth>
          <InputLabel id="languages-label">
            Idiomas Ganhos pela Linhagem
          </InputLabel>
          <Select
            labelId="languages-label"
            id="languages-select"
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
              <InputLabel id="vision-type-label">Tipo de Visão</InputLabel>
              <Select
                labelId="vision-type-label"
                id="vision-type-select"
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
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Sentidos Aguçados
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddKeenSense}
                  size="small"
                  variant="outlined"
                >
                  Adicionar
                </Button>
              </Box>

              {!localLineage.keenSenses ||
              localLineage.keenSenses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum sentido aguçado definido. Clique em "Adicionar" para
                  criar um.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {localLineage.keenSenses.map((sense, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        pr: 6,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      <IconButton
                        onClick={() => handleRemoveKeenSense(index)}
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>

                      <Stack spacing={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`keen-sense-type-${index}`}>
                            Tipo de Sentido
                          </InputLabel>
                          <Select
                            labelId={`keen-sense-type-${index}`}
                            value={sense.type}
                            onChange={handleKeenSenseTypeChange(index)}
                            label="Tipo de Sentido"
                          >
                            {SENSE_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {SENSE_LABELS[type]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {KEEN_SENSE_DESCRIPTIONS[sense.type]}
                          </FormHelperText>
                        </FormControl>

                        <TextField
                          label="Bônus"
                          type="number"
                          value={sense.bonus}
                          onChange={handleKeenSenseBonusChange(index)}
                          fullWidth
                          size="small"
                          inputProps={{ min: 2, max: 10, step: 1 }}
                          helperText="Bônus de +2 a +10"
                        />

                        <TextField
                          label="Descrição (opcional)"
                          value={sense.description || ''}
                          onChange={handleKeenSenseDescriptionChange(index)}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          helperText="Detalhes específicos deste sentido aguçado"
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
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
                    pr: 6,
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
                      onChange={handleAncestryTraitChange(index, 'description')}
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
    </Sidebar>
  );
}
