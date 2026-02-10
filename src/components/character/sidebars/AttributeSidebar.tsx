'use client';

import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Language as LanguageIcon,
  Psychology as PsychologyIcon,
  Shield as ShieldIcon,
  DirectionsRun as DirectionsRunIcon,
  Favorite as FavoriteIcon,
  FlashOn as FlashOnIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Sidebar } from '@/components/shared/Sidebar';
import type { AttributeName, Character } from '@/types';
import type { SkillName } from '@/types/skills';
import {
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_LABELS,
} from '@/constants/attributes';
import {
  SKILL_KEY_ATTRIBUTES,
  SKILL_LIST,
  SKILL_DESCRIPTIONS,
} from '@/types/skills';
import {
  getAvailableLanguageSlots,
  getAvailableSkillProficiencySlots,
} from '@/utils/attributeUpdates';

export interface AttributeSidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Nome do atributo selecionado
   */
  attribute: AttributeName;

  /**
   * Dados do personagem (para calcular impactos)
   */
  character: Character;

  /**
   * Callback para atualizar o valor do atributo
   */
  onUpdateAttribute: (attribute: AttributeName, value: number) => void;
}

/**
 * AttributeSidebar - Sidebar com Detalhes do Atributo
 *
 * Exibe informações completas sobre um atributo específico:
 * - Descrição detalhada
 * - Habilidades que usam o atributo como chave
 * - Impactos especiais (idiomas, proficiências, defesa, etc.)
 * - Modificadores derivados
 *
 * @example
 * ```tsx
 * <AttributeSidebar
 *   open={isOpen}
 *   onClose={handleClose}
 *   attribute="mente"
 *   character={character}
 * />
 * ```
 */
export function AttributeSidebar({
  open,
  onClose,
  attribute,
  character,
  onUpdateAttribute,
}: AttributeSidebarProps): React.ReactElement | null {
  const attributeValue = character.attributes[attribute];
  const attributeLabel = ATTRIBUTE_LABELS[attribute];

  // Calcular modificadores de linhagem e origem para este atributo
  const lineageModifier = character.lineage?.attributeModifiers?.find(
    (mod) => mod.attribute === attribute
  );
  const originModifier = character.origin?.attributeModifiers?.find(
    (mod) => mod.attribute === attribute
  );

  // Calcular valor base (sem modificadores de linhagem/origem)
  const lineageValue = lineageModifier?.value || 0;
  const originValue = originModifier?.value || 0;
  const baseValue = attributeValue - lineageValue - originValue;

  // Filtrar habilidades que usam este atributo como chave padrão
  const relatedSkills = SKILL_LIST.filter((skillName) => {
    const defaultKey = SKILL_KEY_ATTRIBUTES[skillName];
    return defaultKey === attribute;
  });

  // Detectar habilidades que foram alteradas para usar este atributo
  const customKeySkills = Object.entries(character.skills)
    .filter(([skillName, skill]) => {
      const defaultKey = SKILL_KEY_ATTRIBUTES[skillName as SkillName];
      return skill.keyAttribute === attribute && defaultKey !== attribute;
    })
    .map(([skillName]) => skillName as SkillName);

  // Calcular impactos especiais baseados no atributo
  const impacts = getAttributeImpacts(attribute, character);

  const handleIncrement = () => {
    onUpdateAttribute(attribute, attributeValue + 1);
  };

  const handleDecrement = () => {
    if (attributeValue > 0) {
      onUpdateAttribute(attribute, attributeValue - 1);
    }
  };

  // Verifica se há modificadores de linhagem ou origem
  const hasModifiers = lineageModifier || originModifier;

  return (
    <Sidebar open={open} onClose={onClose} title={attributeLabel} width="lg">
      {/* Valor Atual do Atributo */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Tooltip title="Diminuir">
            <span>
              <IconButton
                onClick={handleDecrement}
                disabled={attributeValue === 0}
                color="primary"
                size="large"
              >
                <RemoveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Typography
            variant="h3"
            color="primary"
            sx={{ fontWeight: 'bold', minWidth: '60px' }}
          >
            {attributeValue}
          </Typography>
          <Tooltip title="Aumentar">
            <IconButton onClick={handleIncrement} color="primary" size="large">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {attributeValue === 0 && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
            Com atributo 0, você rola <strong>2d20 e usa o MENOR</strong>{' '}
            resultado nos testes.
          </Alert>
        )}
        {attributeValue > 5 && (
          <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
            Este atributo excede o valor padrão máximo (5), indicando
            habilidades especiais.
          </Alert>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Origem dos Modificadores */}
      {hasModifiers && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Origem do Valor
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Valor Base
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {baseValue}
                  </Typography>
                </Box>

                {lineageModifier && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Linhagem ({character.lineage?.name || 'Desconhecida'})
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={lineageValue > 0 ? 'success.main' : 'error.main'}
                    >
                      {lineageValue > 0 ? '+' : ''}
                      {lineageValue}
                    </Typography>
                  </Box>
                )}

                {originModifier && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Origem ({character.origin?.name || 'Desconhecida'})
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={originValue > 0 ? 'success.main' : 'error.main'}
                    >
                      {originValue > 0 ? '+' : ''}
                      {originValue}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    Valor Total
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {attributeValue}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Divider sx={{ mb: 3 }} />
        </>
      )}

      {/* Descrição do Atributo */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Descrição
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          {ATTRIBUTE_DESCRIPTIONS[attribute]}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Impactos Especiais */}
      {impacts.length > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Impactos no Personagem
            </Typography>
            <Stack spacing={2}>
              {impacts.map((impact, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderLeft: 4,
                    borderColor: impact.color,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {impact.icon}
                    <Typography variant="subtitle2" fontWeight="bold">
                      {impact.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {impact.description}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
          <Divider sx={{ mb: 3 }} />
        </>
      )}

      {/* Habilidades Relacionadas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Habilidades que Usam {attributeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          As seguintes habilidades usam {attributeLabel} como atributo-chave
          padrão:
        </Typography>
        <List dense>
          {relatedSkills.map((skillName) => {
            const skill = character.skills[skillName];
            const isCustomKey = skill.keyAttribute !== attribute;

            return (
              <ListItem
                key={skillName}
                sx={{
                  pl: 0,
                  opacity: isCustomKey ? 0.5 : 1,
                  textDecoration: isCustomKey ? 'line-through' : 'none',
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {skillName}
                      </Typography>
                      <Chip
                        label={skill.proficiencyLevel}
                        size="small"
                        color={
                          skill.proficiencyLevel === 'leigo'
                            ? 'default'
                            : 'primary'
                        }
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {isCustomKey && (
                        <Chip
                          label={`Usa ${ATTRIBUTE_LABELS[skill.keyAttribute]}`}
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      )}
                    </Box>
                  }
                  secondary={SKILL_DESCRIPTIONS[skillName]}
                />
              </ListItem>
            );
          })}
        </List>

        {/* Habilidades com atributo customizado para este */}
        {customKeySkills.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mt: 2, mb: 1 }}
              color="warning.main"
            >
              Habilidades Alteradas para Usar {attributeLabel}
            </Typography>
            <List dense>
              {customKeySkills.map((skillName) => {
                const skill = character.skills[skillName];
                const defaultKey = SKILL_KEY_ATTRIBUTES[skillName];

                return (
                  <ListItem key={skillName} sx={{ pl: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {skillName}
                          </Typography>
                          <Chip
                            label={skill.proficiencyLevel}
                            size="small"
                            color={
                              skill.proficiencyLevel === 'leigo'
                                ? 'default'
                                : 'primary'
                            }
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                          <Chip
                            label={`Padrão: ${ATTRIBUTE_LABELS[defaultKey as AttributeName]}`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={SKILL_DESCRIPTIONS[skillName]}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Fórmula de Rolagem */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Fórmula de Rolagem
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {attributeValue === 0
              ? '-2d20'
              : attributeValue === 1
                ? '1d20'
                : `${attributeValue}d20 (maior)`}
          </Typography>
          <Typography
            variant="caption"
            sx={{ mt: 1, display: 'block', opacity: 0.9 }}
          >
            {attributeValue === 0
              ? 'Rola 2 dados de 20 lados e escolhe o menor resultado'
              : attributeValue === 1
                ? 'Rola 1 dado de 20 lados'
                : `Rola ${attributeValue} dados de 20 lados e escolhe o maior resultado`}
          </Typography>
        </Paper>
      </Box>
    </Sidebar>
  );
}

/**
 * Calcula os impactos especiais de um atributo no personagem
 */
function getAttributeImpacts(
  attribute: AttributeName,
  character: Character
): Array<{
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}> {
  const impacts: Array<{
    title: string;
    description: string;
    icon: React.ReactElement;
    color: string;
  }> = [];

  const attributeValue = character.attributes[attribute];

  switch (attribute) {
    case 'mente':
      // Idiomas adicionais
      const languageSlots = getAvailableLanguageSlots(attributeValue);
      impacts.push({
        title: 'Idiomas Adicionais',
        description: `Com Mente ${attributeValue}, você pode conhecer ${languageSlots} idioma(s) adicional(is) além de Comum (${languageSlots} = Mente - 1, mínimo 0).`,
        icon: <LanguageIcon color="info" />,
        color: 'info.main',
      });

      // Proficiências em habilidades
      const proficiencySlots =
        getAvailableSkillProficiencySlots(attributeValue);
      impacts.push({
        title: 'Proficiências em Habilidades',
        description: `Com Mente ${attributeValue}, você pode ter proficiência (Adepto ou superior) em ${proficiencySlots} habilidade(s) (${proficiencySlots} = 3 + Mente).`,
        icon: <SchoolIcon color="primary" />,
        color: 'primary.main',
      });
      break;

    case 'agilidade':
      // Defesa (v0.0.2: teste ativo, não valor fixo)
      impacts.push({
        title: 'Teste de Defesa',
        description: `Em v0.0.2, a defesa é um teste ativo usando Reflexo (Agilidade). Sua Agilidade ${attributeValue} contribui para os dados rolados no teste de defesa.`,
        icon: <ShieldIcon color="warning" />,
        color: 'warning.main',
      });

      // Reflexo
      impacts.push({
        title: 'Reflexo',
        description: `A habilidade Reflexo usa Agilidade como atributo-chave, permitindo reagir rapidamente a perigos e esquivar de ataques.`,
        icon: <DirectionsRunIcon color="success" />,
        color: 'success.main',
      });
      break;

    case 'corpo':
      // GA (Guarda)
      impacts.push({
        title: 'Guarda (GA)',
        description: `Corpo afeta seus GA ganhos por nível e sua resistência física (Vigor e Tenacidade).`,
        icon: <FavoriteIcon color="error" />,
        color: 'error.main',
      });

      // Rodadas Morrendo
      const dyingRounds = 2 + attributeValue;
      impacts.push({
        title: 'Estado Morrendo',
        description: `Com Corpo ${attributeValue}, você pode sobreviver até ${dyingRounds} rodadas no estado Morrendo (2 + Corpo).`,
        icon: <WarningIcon color="error" />,
        color: 'error.main',
      });

      // Capacidade de Carga
      const carryCapacity = 5 + attributeValue * 5;
      impacts.push({
        title: 'Capacidade de Carga',
        description: `Com Corpo ${attributeValue}, você pode carregar ${carryCapacity} espaços (5 + Corpo × 5). Pode empurrar ${attributeValue * 10} e levantar ${attributeValue * 5}.`,
        icon: <PsychologyIcon color="primary" />,
        color: 'primary.main',
      });
      break;

    case 'essencia':
      // PP
      impacts.push({
        title: 'Pontos de Poder',
        description: `Essência afeta seus PP ganhos por nível e o limite de PP por rodada em combate.`,
        icon: <FlashOnIcon color="info" />,
        color: 'info.main',
      });

      // Limite PP por rodada
      const ppLimit = character.level + attributeValue;
      impacts.push({
        title: 'Limite de PP por Rodada',
        description: `Com Essência ${attributeValue} e nível ${character.level}, você pode gastar até ${ppLimit} PP por rodada (Nível + Essência).`,
        icon: <InfoIcon color="info" />,
        color: 'info.main',
      });
      break;

    case 'instinto':
      // Percepção e Sentidos
      impacts.push({
        title: 'Percepção e Sentidos',
        description: `Instinto é chave para habilidades como Percepção, Perspicácia, Rastreamento e Natureza.`,
        icon: <PsychologyIcon color="primary" />,
        color: 'primary.main',
      });
      break;

    case 'influencia':
      // Habilidades sociais
      impacts.push({
        title: 'Interações Sociais',
        description: `Influência é chave para habilidades sociais como Persuasão, Enganação, Intimidação e Performance.`,
        icon: <PsychologyIcon color="primary" />,
        color: 'primary.main',
      });
      break;
  }

  return impacts;
}

export default AttributeSidebar;
