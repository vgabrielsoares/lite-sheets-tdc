'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import type { Origin } from '@/types/character';
import type { SkillName } from '@/types/skills';
import type { AttributeName } from '@/types/attributes';
import { SKILL_LIST, SKILL_LABELS } from '@/constants/skills';
import {
  ATTRIBUTE_LIST,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_DESCRIPTIONS,
} from '@/constants/attributes';
import {
  ORIGIN_SKILL_PROFICIENCIES_COUNT,
  ORIGIN_VALIDATION,
  ORIGIN_ATTRIBUTE_MODIFIER_RULES,
} from '@/constants/origins';
import { createDefaultOrigin } from '@/utils/originUtils';
import { useDebounce } from '@/hooks/useDebounce';

export interface OrigemSidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Dados atuais da origem (pode ser undefined se ainda não definida)
   */
  origin?: Origin;

  /**
   * Callback chamado quando a origem é atualizada
   * @param origin - Nova origem
   */
  onUpdate: (origin: Origin) => void;

  /**
   * Se true, exibe informações de validação
   * @default true
   */
  showValidation?: boolean;
}

/**
 * Sidebar de Detalhes - Origem
 *
 * Sidebar completa para editar todos os aspectos da origem de um personagem:
 * - Nome e descrição
 * - Proficiências com habilidades (2)
 * - Modificadores de atributos (+1 em um, ou +1 em dois e -1 em um)
 * - Habilidade especial (nome e descrição)
 *
 * Os modificadores são aplicados automaticamente ao personagem quando salvos.
 */
export const OrigemSidebar: React.FC<OrigemSidebarProps> = ({
  open,
  onClose,
  origin,
  onUpdate,
  showValidation = true,
}) => {
  // Estado local da origem (edição não-commitada)
  const [localOrigin, setLocalOrigin] = useState<Origin>(
    origin || createDefaultOrigin()
  );

  // Flag para detectar se usuário já editou algo
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Ref para rastrear se a sidebar estava aberta anteriormente
  const wasOpenRef = useRef(false);

  // Ref para rastrear se já sincronizou ao abrir (evita auto-save do valor inicial)
  const hasSyncedRef = useRef(false);

  // Debounce do estado local para auto-save
  const debouncedOrigin = useDebounce(localOrigin, 500);

  /**
   * Sincroniza origem externa com estado local APENAS quando abre
   * (não quando origin muda enquanto já está aberta)
   */
  useEffect(() => {
    // Só sincroniza quando a sidebar ABRE (transição de fechado para aberto)
    if (open && !wasOpenRef.current) {
      setLocalOrigin(origin || createDefaultOrigin());
      setHasUserEdited(false);
      hasSyncedRef.current = false; // Resetar flag de sync
    }

    // Marcar como sincronizado após a sidebar abrir
    if (open && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
    }

    wasOpenRef.current = open;
    // Intencionalmente não incluímos 'origin' nas dependências
    // para evitar resetar o estado enquanto o usuário está editando
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * Auto-save: Atualiza origem externa quando debounced muda
   * (apenas se usuário já editou algo E já sincronizou ao abrir)
   */
  useEffect(() => {
    console.log('🔍 Auto-save check:', {
      hasUserEdited,
      open,
      hasSynced: hasSyncedRef.current,
      shouldSave: hasUserEdited && open && hasSyncedRef.current,
    });

    // Só salvar se:
    // 1. Usuário editou algo (hasUserEdited = true)
    // 2. Sidebar está aberta (open = true)
    // 3. Já sincronizou o valor inicial (hasSyncedRef.current = true)
    if (hasUserEdited && open && hasSyncedRef.current) {
      console.log('💾 Auto-save DISPARANDO agora:', debouncedOrigin);
      onUpdate(debouncedOrigin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOrigin, hasUserEdited, open]);

  /**
   * Atualiza campo de texto da origem
   */
  const handleTextChange =
    (field: keyof Origin) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      console.log('✏️ Campo editado:', field, '→', event.target.value);
      setHasUserEdited(true);
      setLocalOrigin((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  /**
   * Atualiza proficiências com habilidades (multiselect)
   */
  const handleSkillProficienciesChange = (
    event: SelectChangeEvent<string[]>
  ) => {
    setHasUserEdited(true);
    const value = event.target.value;
    const skills = (
      typeof value === 'string' ? value.split(',') : value
    ) as SkillName[];

    // Limita a exatamente 2 proficiências
    const limitedSkills = skills.slice(0, ORIGIN_SKILL_PROFICIENCIES_COUNT);

    setLocalOrigin((prev) => ({
      ...prev,
      skillProficiencies: limitedSkills,
    }));
  };

  /**
   * Adiciona modificador de atributo
   */
  const handleAddAttributeModifier = () => {
    setHasUserEdited(true);
    setLocalOrigin((prev) => ({
      ...prev,
      attributeModifiers: [
        ...prev.attributeModifiers,
        { attribute: 'agilidade', value: 1 },
      ],
    }));
  };

  /**
   * Remove modificador de atributo
   */
  const handleRemoveAttributeModifier = (index: number) => {
    setHasUserEdited(true);
    setLocalOrigin((prev) => ({
      ...prev,
      attributeModifiers: prev.attributeModifiers.filter((_, i) => i !== index),
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
    setLocalOrigin((prev) => ({
      ...prev,
      attributeModifiers: prev.attributeModifiers.map((mod, i) =>
        i === index ? { ...mod, attribute: newAttribute } : mod
      ),
    }));
  };

  /**
   * Atualiza valor do modificador (+1 ou -1)
   */
  const handleAttributeModifierValueChange = (
    index: number,
    event: SelectChangeEvent<number>
  ) => {
    setHasUserEdited(true);
    const newValue = Number(event.target.value);
    setLocalOrigin((prev) => ({
      ...prev,
      attributeModifiers: prev.attributeModifiers.map((mod, i) =>
        i === index ? { ...mod, value: newValue } : mod
      ),
    }));
  };

  /**
   * Atualiza campos da habilidade especial
   */
  const handleSpecialAbilityChange =
    (field: 'name' | 'description') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setHasUserEdited(true);
      setLocalOrigin((prev) => ({
        ...prev,
        specialAbility: {
          ...prev.specialAbility,
          name: prev.specialAbility?.name || '',
          description: prev.specialAbility?.description || '',
          [field]: event.target.value,
        },
      }));
    };

  /**
   * Valida modificadores de atributos
   */
  const attributeModifiersValidation =
    ORIGIN_VALIDATION.validateAttributeModifiers(
      localOrigin.attributeModifiers
    );

  /**
   * Valida proficiências
   */
  const skillProficienciesValidation =
    ORIGIN_VALIDATION.validateSkillProficiencies(
      localOrigin.skillProficiencies
    );

  /**
   * Verifica se há erros de validação
   */
  const hasValidationErrors =
    !attributeModifiersValidation.valid || !skillProficienciesValidation.valid;

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title="Origem do Personagem"
      width="md"
    >
      <Stack spacing={3}>
        {/* Header com informações */}
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            A origem indica de onde seu personagem veio, como ele viveu até
            agora e o que fazia.
          </Typography>
        </Alert>

        {/* Nome da Origem */}
        <TextField
          label="Nome da Origem"
          value={localOrigin.name}
          onChange={handleTextChange('name')}
          fullWidth
          required
          helperText="Ex: Nobre, Criminoso, Artista, Soldado, etc."
        />

        {/* Descrição */}
        <TextField
          label="Descrição"
          value={localOrigin.description || ''}
          onChange={handleTextChange('description')}
          fullWidth
          multiline
          rows={3}
          helperText="Descreva brevemente a origem do personagem"
        />

        <Divider />

        {/* Proficiências com Habilidades */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Proficiências com Habilidades</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  A origem concede proficiência em{' '}
                  <strong>
                    {ORIGIN_SKILL_PROFICIENCIES_COUNT} habilidades
                  </strong>
                  .
                </Typography>
              </Alert>

              <FormControl
                fullWidth
                error={showValidation && !skillProficienciesValidation.valid}
              >
                <InputLabel id="skill-proficiencies-label">
                  Habilidades Proficientes
                </InputLabel>
                <Select
                  labelId="skill-proficiencies-label"
                  id="skill-proficiencies"
                  multiple
                  value={localOrigin.skillProficiencies}
                  onChange={handleSkillProficienciesChange}
                  input={<OutlinedInput label="Habilidades Proficientes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((skill) => (
                        <Chip
                          key={skill}
                          label={SKILL_LABELS[skill]}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {SKILL_LIST.map((skill) => (
                    <MenuItem
                      key={skill}
                      value={skill}
                      disabled={
                        localOrigin.skillProficiencies.length >=
                          ORIGIN_SKILL_PROFICIENCIES_COUNT &&
                        !localOrigin.skillProficiencies.includes(skill)
                      }
                    >
                      {SKILL_LABELS[skill]}
                    </MenuItem>
                  ))}
                </Select>
                {showValidation && !skillProficienciesValidation.valid && (
                  <FormHelperText>
                    {skillProficienciesValidation.errors.join('; ')}
                  </FormHelperText>
                )}
                {!showValidation && (
                  <FormHelperText>
                    {localOrigin.skillProficiencies.length} /{' '}
                    {ORIGIN_SKILL_PROFICIENCIES_COUNT} selecionadas
                  </FormHelperText>
                )}
              </FormControl>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Modificadores de Atributos */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Modificadores de Atributos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2" gutterBottom>
                  A origem concede modificadores de atributos seguindo uma das
                  opções:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>
                    {ORIGIN_ATTRIBUTE_MODIFIER_RULES.SINGLE_BONUS.description}
                  </li>
                  <li>
                    {
                      ORIGIN_ATTRIBUTE_MODIFIER_RULES
                        .DOUBLE_BONUS_SINGLE_PENALTY.description
                    }
                  </li>
                </Typography>
              </Alert>

              {/* Lista de modificadores */}
              {localOrigin.attributeModifiers.map((modifier, index) => (
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
                disabled={localOrigin.attributeModifiers.length >= 3}
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

        {/* Habilidade Especial */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Habilidade Especial</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  Cada origem concede uma habilidade especial única que
                  representa conhecimentos, conexões ou capacidades adquiridas
                  pelo passado do personagem.
                </Typography>
              </Alert>

              <TextField
                label="Nome da Habilidade"
                value={localOrigin.specialAbility?.name || ''}
                onChange={handleSpecialAbilityChange('name')}
                fullWidth
                placeholder="Ex: Contatos Criminosos, Prestígio Nobre, etc."
              />

              <TextField
                label="Descrição"
                value={localOrigin.specialAbility?.description || ''}
                onChange={handleSpecialAbilityChange('description')}
                fullWidth
                multiline
                rows={4}
                placeholder="Descreva os benefícios mecânicos e narrativos desta habilidade..."
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Resumo de Validação */}
        {showValidation && hasValidationErrors && (
          <Alert severity="warning">
            <Typography variant="body2" fontWeight="bold">
              Atenção: Há erros de validação
            </Typography>
            <Typography variant="body2">
              Revise os campos marcados acima para garantir que a origem esteja
              completa e siga as regras do sistema.
            </Typography>
          </Alert>
        )}

        {showValidation && !hasValidationErrors && hasUserEdited && (
          <Alert severity="success">
            <Typography variant="body2">
              ✓ Origem válida! Os modificadores serão aplicados automaticamente.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Sidebar>
  );
};
