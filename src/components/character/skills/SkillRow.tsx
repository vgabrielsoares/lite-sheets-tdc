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
  DieSize,
  SkillPoolCalculation,
  SkillPoolFormula,
  ArmorType,
} from '@/types';
import type { DicePenaltyMap } from '@/utils/conditionEffects';
import { getDicePenaltyForAttribute } from '@/utils/conditionEffects';
import {
  SKILL_LABELS,
  SKILL_METADATA,
  SKILL_PROFICIENCY_LABELS,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ABBREVIATIONS,
  getSkillDieSize,
  LUCK_LEVELS,
  MAX_LUCK_LEVEL,
} from '@/constants';
import { calculateSkillRoll, calculateSignatureAbilityBonus } from '@/utils';
import {
  InlineModifiers,
  extractDiceModifier,
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
  /** Tipo de armadura equipada (para penalidade de carga). null = sem armadura ou armadura leve */
  equippedArmorType?: ArmorType | null;
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
  /** Penalidades de dados de condições ativas */
  conditionPenalties?: DicePenaltyMap;
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
    equippedArmorType = null,
    onModifiersChange,
    onClick,
    crafts = [],
    onSelectedCraftChange,
    luck,
    onLuckLevelChange,
    onLuckModifiersChange,
    sizeSkillModifier,
    conditionPenalties,
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

    // Calcular pool de dados e fórmula de rolagem
    // Para ofício, usar o craft selecionado se houver
    // Para sorte, usar os dados de luck
    let calculation: SkillPoolCalculation;
    let rollFormula: SkillPoolFormula;

    if (isSorteSkill && luck) {
      // Obter dados do nível de sorte da tabela centralizada (v0.0.2)
      const luckData = LUCK_LEVELS[luck.level] ?? LUCK_LEVELS[MAX_LUCK_LEVEL];

      // Calcular bônus de assinatura se aplicável (+Xd)
      const signatureDiceBonus = skill.isSignature
        ? calculateSignatureAbilityBonus(characterLevel)
        : 0;

      // Calcular total de dados
      const baseDice = luckData.dice;
      const otherDiceModifiers = luck.diceModifier || 0;
      const totalDiceModifier = signatureDiceBonus + otherDiceModifiers;
      const totalDice = baseDice + totalDiceModifier;
      const isPenaltyRoll = totalDice <= 0;

      // Criar cálculo customizado para sorte (sem penalidades de carga/proficiência)
      calculation = {
        attributeValue: baseDice,
        proficiencyLevel: 'leigo' as ProficiencyLevel,
        dieSize: luckData.dieSize,
        signatureDiceBonus,
        otherDiceModifiers,
        loadDicePenalty: 0,
        armorDicePenalty: 0,
        proficiencyDicePenalty: 0,
        instrumentDicePenalty: 0,
        totalDiceModifier,
        totalDice,
        isPenaltyRoll,
      };

      // Calcular fórmula de rolagem
      const diceCount = isPenaltyRoll ? 2 : Math.min(totalDice, 8);
      rollFormula = {
        diceCount,
        dieSize: luckData.dieSize,
        isPenaltyRoll,
        formula: isPenaltyRoll
          ? `2${luckData.dieSize} (menor)`
          : `${diceCount}${luckData.dieSize}`,
      };
    } else if (isOficioSkill && selectedCraft) {
      // Calcular usando o craft selecionado
      // Ofício usa o atributo-chave do craft e o nível do craft determina os dados
      const craftAttributeValue = attributes[selectedCraft.attributeKey];
      const craftDieSize = getSkillDieSize(skill.proficiencyLevel);

      // Calcular bônus de assinatura se aplicável (+Xd)
      const signatureDiceBonus = skill.isSignature
        ? calculateSignatureAbilityBonus(characterLevel)
        : 0;

      // Modificadores de dados do craft
      const otherDiceModifiers = selectedCraft.diceModifier || 0;
      const totalDiceModifier = signatureDiceBonus + otherDiceModifiers;
      const totalDice = craftAttributeValue + totalDiceModifier;
      const isPenaltyRoll = totalDice <= 0;

      calculation = {
        attributeValue: craftAttributeValue,
        proficiencyLevel: skill.proficiencyLevel,
        dieSize: craftDieSize,
        signatureDiceBonus,
        otherDiceModifiers,
        loadDicePenalty: 0,
        armorDicePenalty: 0,
        proficiencyDicePenalty: 0,
        instrumentDicePenalty: 0,
        totalDiceModifier,
        totalDice,
        isPenaltyRoll,
      };

      const diceCount = isPenaltyRoll ? 2 : Math.min(totalDice, 8);
      rollFormula = {
        diceCount,
        dieSize: craftDieSize,
        isPenaltyRoll,
        formula: isPenaltyRoll
          ? `2${craftDieSize} (menor)`
          : `${diceCount}${craftDieSize}`,
      };
    } else {
      // Cálculo normal para habilidades padrão
      // Incluir modificador de tamanho como modificador de dados se existir
      const effectiveModifiers: Modifier[] = [...skill.modifiers];

      if (sizeSkillModifier && sizeSkillModifier !== 0) {
        effectiveModifiers.push({
          name: 'Tamanho',
          value: sizeSkillModifier,
          type: sizeSkillModifier > 0 ? 'bonus' : 'penalidade',
          affectsDice: true,
        });
      }

      // Incluir penalidade de condições se existir
      if (conditionPenalties) {
        const penalty = getDicePenaltyForAttribute(
          conditionPenalties,
          skill.keyAttribute
        );
        if (penalty !== 0) {
          effectiveModifiers.push({
            name: 'Condições',
            value: penalty,
            type: 'penalidade',
            affectsDice: true,
          });
        }
      }

      const result = calculateSkillRoll(
        skill.name,
        skill.keyAttribute,
        attributes,
        skill.proficiencyLevel,
        skill.isSignature,
        characterLevel,
        effectiveModifiers,
        {
          isOverloaded,
          equippedArmorType: equippedArmorType ?? null,
          hasRequiredInstrument: true, // TODO: check inventory for instruments
        }
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
      // Mostrar penalidade ativa de carga (sobrepeso + armadura)
      const hasLoadPenalty = calculation.loadDicePenalty < 0;
      const hasArmorPenalty = calculation.armorDicePenalty < 0;
      const isActive = hasLoadPenalty || hasArmorPenalty;

      const penaltyParts: string[] = [];
      if (hasLoadPenalty)
        penaltyParts.push(`Sobrecarga: ${calculation.loadDicePenalty}d`);
      if (hasArmorPenalty)
        penaltyParts.push(`Armadura: ${calculation.armorDicePenalty}d`);

      const tooltipText = isActive
        ? `Penalidade de Carga ativa: ${penaltyParts.join(', ')}`
        : 'Penalidade de Carga (inativa)';

      indicators.push(
        <Tooltip key="load" title={tooltipText} enterDelay={150}>
          <LoadIcon
            fontSize="small"
            color={isActive ? 'warning' : 'disabled'}
          />
        </Tooltip>
      );
    }
    if (metadata.requiresInstrument) {
      const isActive = calculation.instrumentDicePenalty < 0;
      indicators.push(
        <Tooltip
          key="instrument"
          title={
            isActive
              ? `Sem instrumento: ${calculation.instrumentDicePenalty}d`
              : 'Requer instrumento'
          }
          enterDelay={150}
        >
          <InstrumentIcon
            fontSize="small"
            color={isActive ? 'error' : 'action'}
          />
        </Tooltip>
      );
    }
    if (metadata.requiresProficiency) {
      const isActive = calculation.proficiencyDicePenalty < 0;
      indicators.push(
        <Tooltip
          key="proficiency"
          title={
            isActive
              ? `Sem proficiência: ${calculation.proficiencyDicePenalty}d`
              : 'Requer proficiência para uso efetivo'
          }
          enterDelay={150}
        >
          <ProficiencyIcon
            fontSize="small"
            color={isActive ? 'error' : 'action'}
          />
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
              title={`Proficiência: ${SKILL_PROFICIENCY_LABELS[skill.proficiencyLevel]} (${getSkillDieSize(skill.proficiencyLevel)})`}
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
                {diceModifier === 0 && (
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
                color={rollFormula.isPenaltyRoll ? 'error' : 'primary'}
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
              attributeValue={calculation.attributeValue}
              proficiencyLevel={skill.proficiencyLevel}
              diceModifier={calculation.totalDiceModifier}
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
