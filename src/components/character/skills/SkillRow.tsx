'use client';

/**
 * SkillRow - Componente para exibir uma linha de habilidade
 *
 * Exibe informações de uma habilidade com opções de edição:
 * - Nome da habilidade (label amigável)
 * - Atributo-chave padrão (referência, não editável)
 * - Atributo-chave atual (editável via select)
 * - Grau de proficiência (editável via select)
 * - Modificador total (calculado automaticamente)
 * - Fórmula de rolagem (Xd20+Y)
 *
 * Funcionalidades:
 * - Clique na linha abre sidebar com detalhes e usos da habilidade
 * - Indicadores visuais para habilidades especiais (Assinatura, Combate, Carga)
 * - Destaque quando atributo-chave foi customizado
 * - Acessível por teclado (Tab, Enter, ESC)
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Star as StarIcon,
  SportsMartialArts as CombatIcon,
  Backpack as LoadIcon,
  Construction as InstrumentIcon,
  MenuBook as ProficiencyIcon,
  SwapHoriz as CustomIcon,
} from '@mui/icons-material';

import type {
  SkillName,
  ProficiencyLevel,
  AttributeName,
  Attributes,
  Skill,
  Modifier,
  Craft,
} from '@/types';
import {
  SKILL_LABELS,
  SKILL_METADATA,
  SKILL_PROFICIENCY_LABELS,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ABBREVIATIONS,
} from '@/constants';
import {
  calculateSkillRoll,
  getCraftMultiplier,
  calculateSignatureAbilityBonus,
} from '@/utils';
import {
  InlineModifiers,
  extractDiceModifier,
  extractNumericModifier,
  buildModifiersArray,
} from './ModifierManager';
import { SkillRollButton } from './SkillRollButton';

export interface SkillRowProps {
  /** Dados da habilidade */
  skill: Skill;
  /** Atributos do personagem (para cálculos) */
  attributes: Attributes;
  /** Nível do personagem (para bônus de assinatura) */
  characterLevel: number;
  /** Se personagem está sobrecarregado */
  isOverloaded: boolean;
  /** Callback quando modificadores são alterados */
  onModifiersChange?: (skillName: SkillName, modifiers: Modifier[]) => void;
  /** Callback quando linha é clicada (abre sidebar) */
  onClick: (skillName: SkillName) => void;
  /** Lista de ofícios (apenas para habilidade "oficio") */
  crafts?: Craft[];
  /** Callback quando ofício selecionado é alterado (apenas para habilidade "oficio") */
  onSelectedCraftChange?: (skillName: SkillName, craftId: string) => void;
  /** Dados de sorte do personagem (apenas para habilidade "sorte") */
  luck?: import('@/types').LuckLevel;
  /** Callback quando nível de sorte é alterado (apenas para habilidade "sorte") */
  onLuckLevelChange?: (level: number) => void;
  /** Callback quando modificadores de sorte são alterados (apenas para habilidade "sorte") */
  onLuckModifiersChange?: (
    diceModifier: number,
    numericModifier: number
  ) => void;
  /** Modificador de tamanho para esta habilidade específica (acrobacia, atletismo, furtividade, reflexos, tenacidade) */
  sizeSkillModifier?: number;
}

/**
 * Componente SkillRow - Exibe uma linha de habilidade com cálculos e edição
 * Memoizado para evitar re-renders desnecessários
 */
export const SkillRow: React.FC<SkillRowProps> = React.memo(
  ({
    skill,
    attributes,
    characterLevel,
    isOverloaded,
    onModifiersChange,
    onClick,
    crafts = [],
    onSelectedCraftChange,
    luck,
    onLuckLevelChange,
    onLuckModifiersChange,
    sizeSkillModifier,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const metadata = SKILL_METADATA[skill.name];

    // Detectar se é habilidade "oficio" ou "sorte"
    const isOficioSkill = skill.name === 'oficio';
    const isSorteSkill = skill.name === 'sorte';

    // Pegar o craft selecionado (se houver)
    const selectedCraft =
      isOficioSkill && skill.selectedCraftId
        ? crafts.find((c) => c.id === skill.selectedCraftId)
        : null;

    // Calcular modificador e rolagem
    // Para ofício, usar o craft selecionado se houver
    // Para sorte, usar os dados de luck
    let calculation, rollFormula;

    if (isSorteSkill && luck) {
      // Tabela de rolagens por Nível de sorte
      const LUCK_ROLL_TABLE: Record<number, { dice: number; bonus: number }> = {
        0: { dice: 1, bonus: 0 },
        1: { dice: 2, bonus: 0 },
        2: { dice: 2, bonus: 2 },
        3: { dice: 3, bonus: 3 },
        4: { dice: 3, bonus: 6 },
        5: { dice: 4, bonus: 8 },
        6: { dice: 4, bonus: 12 },
        7: { dice: 5, bonus: 15 },
      };

      // Obter dados do Nível de sorte ou calcular para níveis > 7
      const luckData = LUCK_ROLL_TABLE[luck.level] ?? {
        dice: luck.level,
        bonus: luck.level * 3,
      };

      // Calcular bônus de assinatura se aplicável
      const signatureBonus = skill.isSignature
        ? calculateSignatureAbilityBonus(characterLevel, metadata.isCombatSkill)
        : 0;

      // Calcular dados e modificadores totais
      const baseDice = luckData.dice;
      const baseBonus = luckData.bonus;
      const totalDice = baseDice + (luck.diceModifier || 0);
      const totalModifier =
        baseBonus + (luck.numericModifier || 0) + signatureBonus;

      // Criar cálculo customizado para sorte
      calculation = {
        attributeValue: luck.level,
        proficiencyMultiplier: 0, // Sorte não usa proficiência
        baseModifier: baseBonus,
        signatureBonus,
        otherModifiers: luck.numericModifier || 0,
        totalModifier,
      };

      // Calcular fórmula de rolagem
      // Quando dados < 1, converte: 0->2, -1->3, -2->4, etc.
      let diceCount = totalDice;
      let takeLowest = false;
      if (totalDice < 1) {
        diceCount = 2 - totalDice; // 0->2, -1->3, -2->4
        takeLowest = true;
      }
      // Se totalDice >= 1, não usa takeLowest mesmo se partiu de 0

      rollFormula = {
        diceCount,
        takeLowest,
        modifier: totalModifier,
        formula: `${diceCount}d20${totalModifier >= 0 ? '+' : ''}${totalModifier}`,
      };
    } else if (isOficioSkill && selectedCraft) {
      // Calcular usando o craft selecionado
      const craftAttributeValue = attributes[selectedCraft.attributeKey];
      const craftMultiplier = getCraftMultiplier(selectedCraft.level);
      const craftBaseModifier = craftAttributeValue * craftMultiplier;

      // Calcular bônus de assinatura se aplicável
      const signatureBonus = skill.isSignature
        ? calculateSignatureAbilityBonus(characterLevel, metadata.isCombatSkill)
        : 0;

      // Criar um cálculo customizado para o craft
      calculation = {
        attributeValue: craftAttributeValue,
        proficiencyMultiplier: craftMultiplier,
        baseModifier: craftBaseModifier,
        signatureBonus,
        otherModifiers: selectedCraft.numericModifier,
        totalModifier:
          craftBaseModifier + signatureBonus + selectedCraft.numericModifier,
      };

      // Calcular fórmula de rolagem
      const totalDice = 1 + (selectedCraft.diceModifier || 0);
      // Quando dados < 1, converte: 0->2, -1->3, -2->4, etc.
      let diceCount = totalDice;
      let takeLowest = false;
      if (totalDice < 1) {
        diceCount = 2 - totalDice;
        takeLowest = true;
      }
      // Se craft attribute é 0 mas totalDice >= 1, não usa takeLowest

      rollFormula = {
        diceCount,
        takeLowest,
        modifier: calculation.totalModifier,
        formula: `${diceCount}d20${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier}`,
      };
    } else {
      // Cálculo normal para habilidades não-ofício ou ofício sem craft selecionado
      // Incluir modificador de tamanho se existir
      const effectiveModifiers: Modifier[] =
        sizeSkillModifier && sizeSkillModifier !== 0
          ? [
              ...skill.modifiers,
              {
                name: 'Tamanho',
                value: sizeSkillModifier,
                type: sizeSkillModifier > 0 ? 'bonus' : 'penalidade',
                affectsDice: false,
              },
            ]
          : skill.modifiers;

      const result = calculateSkillRoll(
        skill.name,
        skill.keyAttribute,
        attributes,
        skill.proficiencyLevel,
        skill.isSignature,
        characterLevel,
        effectiveModifiers,
        isOverloaded
      );
      calculation = result.calculation;
      rollFormula = result.rollFormula;
    }

    // Verificar se atributo foi customizado
    const isCustomAttribute = skill.keyAttribute !== metadata.keyAttribute;

    // Handlers
    const handleModifiersChange = (
      diceModifier: number,
      numericModifier: number
    ) => {
      if (onModifiersChange) {
        const newModifiers = buildModifiersArray(diceModifier, numericModifier);
        onModifiersChange(skill.name, newModifiers);
      }
    };

    const handleLuckModifiersChange = (
      diceModifier: number,
      numericModifier: number
    ) => {
      if (onLuckModifiersChange) {
        onLuckModifiersChange(diceModifier, numericModifier);
      }
    };

    const handleRowClick = () => {
      onClick(skill.name);
    };

    // Indicadores visuais
    const indicators = [];
    if (skill.isSignature) {
      indicators.push(
        <Tooltip
          key="signature"
          title="Habilidade de Assinatura"
          enterDelay={150}
        >
          <StarIcon fontSize="small" color="warning" />
        </Tooltip>
      );
    }
    if (metadata.isCombatSkill) {
      indicators.push(
        <Tooltip key="combat" title="Habilidade de Combate" enterDelay={150}>
          <CombatIcon fontSize="small" color="error" />
        </Tooltip>
      );
    }
    if (metadata.hasCargaPenalty) {
      indicators.push(
        <Tooltip
          key="load"
          title="Sofre penalidade quando Sobrecarregado"
          enterDelay={150}
        >
          <LoadIcon
            fontSize="small"
            color={isOverloaded ? 'warning' : 'disabled'}
          />
        </Tooltip>
      );
    }
    if (metadata.requiresInstrument) {
      indicators.push(
        <Tooltip key="instrument" title="Requer instrumento" enterDelay={150}>
          <InstrumentIcon fontSize="small" color="action" />
        </Tooltip>
      );
    }
    if (metadata.requiresProficiency) {
      indicators.push(
        <Tooltip
          key="proficiency"
          title="Requer proficiência para uso efetivo"
          enterDelay={150}
        >
          <ProficiencyIcon fontSize="small" color="action" />
        </Tooltip>
      );
    }
    if (isCustomAttribute) {
      indicators.push(
        <Tooltip
          key="custom"
          title="Atributo-chave customizado"
          enterDelay={150}
        >
          <CustomIcon fontSize="small" color="primary" />
        </Tooltip>
      );
    }

    return (
      <Box
        onClick={handleRowClick}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr auto auto auto',
            sm: '1.8fr 100px 100px 160px 1.2fr',
          },
          gap: { xs: 0.5, sm: 1.2 },
          alignItems: 'center',
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          // Destaque visual para Habilidade de Assinatura
          ...(skill.isSignature && {
            borderColor: 'warning.main',
            borderWidth: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.05),
          }),
          cursor: 'pointer',
          // Otimização: apenas transições nas propriedades que mudam
          transition:
            'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',
          // Uso de will-change para otimizar rendering
          willChange: 'border-color, background-color',
          // Forçar compositing layer para evitar repaints
          transform: 'translateZ(0)',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
          // Destaque se é Habilidade de Assinatura
          ...(skill.isSignature && {
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
            borderColor: theme.palette.warning.main,
          }),
        }}
      >
        {/* Nome da habilidade + Indicadores */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              isCustomAttribute
                ? `${SKILL_LABELS[skill.name]} - Atributo padrão: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]} (customizado para ${ATTRIBUTE_LABELS[skill.keyAttribute]})`
                : `${SKILL_LABELS[skill.name]} - Atributo: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]}`
            }
            enterDelay={150}
          >
            <Typography
              variant="body1"
              fontWeight={skill.isSignature ? 600 : 500}
            >
              {SKILL_LABELS[skill.name]}
            </Typography>
          </Tooltip>
          <Box sx={{ display: 'flex', gap: 0.5 }}>{indicators}</Box>
        </Box>

        {/* Chips de configuração: Ofício, Sorte, ou Atributo+Proficiência */}
        {isOficioSkill ? (
          // Chip para ofício - ocupa 2 colunas em desktop
          <Tooltip
            title={
              selectedCraft
                ? `${selectedCraft.name} (${ATTRIBUTE_ABBREVIATIONS[selectedCraft.attributeKey]} Nv. ${selectedCraft.level})`
                : 'Nenhum ofício selecionado'
            }
            enterDelay={150}
            placement="top"
          >
            <Chip
              label={
                selectedCraft
                  ? isMobile
                    ? selectedCraft.name.substring(0, 8) +
                      (selectedCraft.name.length > 8 ? '…' : '')
                    : selectedCraft.name
                  : 'Ofício'
              }
              size="small"
              variant={selectedCraft ? 'filled' : 'outlined'}
              color={selectedCraft ? 'primary' : 'default'}
              sx={{
                maxWidth: { xs: 80, sm: 200 },
                gridColumn: { xs: 'auto', sm: 'span 2' },
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          </Tooltip>
        ) : isSorteSkill && luck ? (
          // Chip para Sorte - exibe nível, ocupa 2 colunas em desktop
          <Tooltip
            title={`Sorte Nível ${luck.level}`}
            enterDelay={150}
            placement="top"
          >
            <Chip
              label={isMobile ? `Nv.${luck.level}` : `Nível ${luck.level}`}
              size="small"
              variant="filled"
              color="secondary"
              sx={{
                gridColumn: { xs: 'auto', sm: 'span 2' },
              }}
            />
          </Tooltip>
        ) : (
          <>
            {/* Chip para atributo-chave */}
            <Tooltip
              title={`Atributo: ${ATTRIBUTE_LABELS[skill.keyAttribute]}${isCustomAttribute ? ` (padrão: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]})` : ''}`}
              enterDelay={150}
              placement="top"
            >
              <Chip
                label={ATTRIBUTE_ABBREVIATIONS[skill.keyAttribute]}
                size="small"
                variant={isCustomAttribute ? 'filled' : 'outlined'}
                color={isCustomAttribute ? 'primary' : 'default'}
              />
            </Tooltip>

            {/* Chip para proficiência - responsivo */}
            <Tooltip
              title={`Proficiência: ${SKILL_PROFICIENCY_LABELS[skill.proficiencyLevel]} (×${skill.proficiencyLevel === 'leigo' ? '0' : skill.proficiencyLevel === 'adepto' ? '1' : skill.proficiencyLevel === 'versado' ? '2' : '3'})`}
              enterDelay={150}
              placement="top"
            >
              <Chip
                label={
                  isMobile
                    ? skill.proficiencyLevel.charAt(0).toUpperCase()
                    : SKILL_PROFICIENCY_LABELS[skill.proficiencyLevel]
                }
                size="small"
                variant={
                  skill.proficiencyLevel !== 'leigo' ? 'filled' : 'outlined'
                }
                color={
                  skill.proficiencyLevel === 'mestre'
                    ? 'warning'
                    : skill.proficiencyLevel === 'versado'
                      ? 'success'
                      : skill.proficiencyLevel === 'adepto'
                        ? 'info'
                        : 'default'
                }
              />
            </Tooltip>
          </>
        )}

        {/* Modificadores (chips estáticos) - apenas desktop */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {(() => {
            const diceModifier =
              isSorteSkill && luck
                ? luck.diceModifier || 0
                : extractDiceModifier(skill.modifiers);
            const numericModifier =
              isSorteSkill && luck
                ? luck.numericModifier || 0
                : extractNumericModifier(skill.modifiers);

            return (
              <>
                {diceModifier !== 0 && (
                  <Tooltip title="Modificador de dados" enterDelay={150}>
                    <Chip
                      label={`${diceModifier > 0 ? '+' : ''}${diceModifier}d`}
                      size="small"
                      color={diceModifier > 0 ? 'success' : 'error'}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        minWidth: 36,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Tooltip>
                )}
                {numericModifier !== 0 && (
                  <Tooltip title="Modificador numérico" enterDelay={150}>
                    <Chip
                      label={
                        numericModifier > 0
                          ? `+${numericModifier}`
                          : numericModifier
                      }
                      size="small"
                      color={numericModifier > 0 ? 'success' : 'error'}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        minWidth: 36,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Tooltip>
                )}
                {diceModifier === 0 && numericModifier === 0 && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ px: 1 }}
                  >
                    —
                  </Typography>
                )}
              </>
            );
          })()}
        </Box>

        {/* Fórmula de rolagem */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip
            title={`Clique para rolar: ${rollFormula.formula}`}
            enterDelay={150}
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
                // Encontrar o botão SkillRollButton e clicar nele
                const button =
                  e.currentTarget.nextElementSibling?.querySelector('button');
                if (button) button.click();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 0.75, sm: 1.5 },
                py: { xs: 0.25, sm: 0.5 },
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              <Typography
                variant="body2"
                fontFamily="monospace"
                color={rollFormula.takeLowest ? 'error' : 'primary'}
                fontWeight={700}
                sx={{
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  letterSpacing: '0.02em',
                }}
              >
                {rollFormula.formula}
              </Typography>
            </Box>
          </Tooltip>

          {/* Botão de rolagem (invisível, controlado pela fórmula) */}
          <Box sx={{ display: 'none' }}>
            <SkillRollButton
              skillLabel={SKILL_LABELS[skill.name]}
              diceCount={rollFormula.diceCount}
              modifier={calculation.totalModifier}
              formula={rollFormula.formula}
              takeLowest={rollFormula.takeLowest}
              size="small"
              color="primary"
            />
          </Box>
        </Box>
      </Box>
    );
  }
);

// Display name para debugging
SkillRow.displayName = 'SkillRow';

export default SkillRow;
