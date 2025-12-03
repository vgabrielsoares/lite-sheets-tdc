'use client';

/**
 * SkillRow - Componente para exibir uma linha de habilidade
 *
 * Exibe informaÃ§Ãµes de uma habilidade com opÃ§Ãµes de ediÃ§Ã£o:
 * - Nome da habilidade (label amigÃ¡vel)
 * - Atributo-chave padrÃ£o (referÃªncia, nÃ£o editÃ¡vel)
 * - Atributo-chave atual (editÃ¡vel via select)
 * - Grau de proficiÃªncia (editÃ¡vel via select)
 * - Modificador total (calculado automaticamente)
 * - FÃ³rmula de rolagem (Xd20+Y)
 *
 * Funcionalidades:
 * - Clique na linha abre sidebar com detalhes e usos da habilidade
 * - Indicadores visuais para habilidades especiais (Assinatura, Combate, Carga)
 * - Destaque quando atributo-chave foi customizado
 * - AcessÃ­vel por teclado (Tab, Enter, ESC)
 */

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  FormControl,
  SelectChangeEvent,
  alpha,
  useTheme,
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

export interface SkillRowProps {
  /** Dados da habilidade */
  skill: Skill;
  /** Atributos do personagem (para cÃ¡lculos) */
  attributes: Attributes;
  /** NÃ­vel do personagem (para bÃ´nus de assinatura) */
  characterLevel: number;
  /** Se personagem estÃ¡ sobrecarregado */
  isOverloaded: boolean;
  /** Callback quando atributo-chave Ã© alterado */
  onKeyAttributeChange: (
    skillName: SkillName,
    newAttribute: AttributeName
  ) => void;
  /** Callback quando proficiÃªncia Ã© alterada */
  onProficiencyChange: (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => void;
  /** Callback quando modificadores sÃ£o alterados */
  onModifiersChange?: (skillName: SkillName, modifiers: Modifier[]) => void;
  /** Callback quando linha Ã© clicada (abre sidebar) */
  onClick: (skillName: SkillName) => void;
  /** Lista de ofÃ­cios (apenas para habilidade "oficio") */
  crafts?: Craft[];
  /** Callback quando ofÃ­cio selecionado Ã© alterado (apenas para habilidade "oficio") */
  onSelectedCraftChange?: (skillName: SkillName, craftId: string) => void;
  /** Dados de sorte do personagem (apenas para habilidade "sorte") */
  luck?: import('@/types').LuckLevel;
  /** Callback quando nÃ­vel de sorte Ã© alterado (apenas para habilidade "sorte") */
  onLuckLevelChange?: (level: number) => void;
  /** Callback quando modificadores de sorte sÃ£o alterados (apenas para habilidade "sorte") */
  onLuckModifiersChange?: (
    diceModifier: number,
    numericModifier: number
  ) => void;
}

/**
 * Componente SkillRow - Exibe uma linha de habilidade com cÃ¡lculos e ediÃ§Ã£o
 */
export const SkillRow: React.FC<SkillRowProps> = ({
  skill,
  attributes,
  characterLevel,
  isOverloaded,
  onKeyAttributeChange,
  onProficiencyChange,
  onModifiersChange,
  onClick,
  crafts = [],
  onSelectedCraftChange,
  luck,
  onLuckLevelChange,
  onLuckModifiersChange,
}) => {
  const theme = useTheme();
  const metadata = SKILL_METADATA[skill.name];

  // Detectar se Ã© habilidade "oficio" ou "sorte"
  const isOficioSkill = skill.name === 'oficio';
  const isSorteSkill = skill.name === 'sorte';

  // Pegar o craft selecionado (se houver)
  const selectedCraft =
    isOficioSkill && skill.selectedCraftId
      ? crafts.find((c) => c.id === skill.selectedCraftId)
      : null;

  // Calcular modificador e rolagem
  // Para ofÃ­cio, usar o craft selecionado se houver
  // Para sorte, usar os dados de luck
  let calculation, rollFormula;

  if (isSorteSkill && luck) {
    // Tabela de rolagens por nÃ­vel de sorte
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

    // Obter dados do nÃ­vel de sorte ou calcular para nÃ­veis > 7
    const luckData = LUCK_ROLL_TABLE[luck.level] ?? {
      dice: luck.level,
      bonus: luck.level * 3,
    };

    // Calcular bÃ´nus de assinatura se aplicÃ¡vel
    const signatureBonus = skill.isSignature
      ? calculateSignatureAbilityBonus(characterLevel, metadata.isCombatSkill)
      : 0;

    // Calcular dados e modificadores totais
    const baseDice = luckData.dice;
    const baseBonus = luckData.bonus;
    const totalDice = baseDice + (luck.diceModifier || 0);
    const totalModifier =
      baseBonus + (luck.numericModifier || 0) + signatureBonus;

    // Criar cÃ¡lculo customizado para sorte
    calculation = {
      attributeValue: luck.level,
      proficiencyMultiplier: 0, // Sorte nÃ£o usa proficiÃªncia
      baseModifier: baseBonus,
      signatureBonus,
      otherModifiers: luck.numericModifier || 0,
      totalModifier,
    };

    // Calcular fÃ³rmula de rolagem
    // Quando dados < 1, converte: 0â†’2, -1â†’3, -2â†’4, etc.
    let diceCount = totalDice;
    let takeLowest = false;
    if (totalDice < 1) {
      diceCount = 2 - totalDice; // 0â†’2, -1â†’3, -2â†’4
      takeLowest = true;
    }
    // Se totalDice >= 1, nÃ£o usa takeLowest mesmo se partiu de 0

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

    // Calcular bÃ´nus de assinatura se aplicÃ¡vel
    const signatureBonus = skill.isSignature
      ? calculateSignatureAbilityBonus(characterLevel, metadata.isCombatSkill)
      : 0;

    // Criar um cÃ¡lculo customizado para o craft
    calculation = {
      attributeValue: craftAttributeValue,
      proficiencyMultiplier: craftMultiplier,
      baseModifier: craftBaseModifier,
      signatureBonus,
      otherModifiers: selectedCraft.numericModifier,
      totalModifier:
        craftBaseModifier + signatureBonus + selectedCraft.numericModifier,
    };

    // Calcular fÃ³rmula de rolagem
    const totalDice = 1 + (selectedCraft.diceModifier || 0);
    // Quando dados < 1, converte: 0â†’2, -1â†’3, -2â†’4, etc.
    let diceCount = totalDice;
    let takeLowest = false;
    if (totalDice < 1) {
      diceCount = 2 - totalDice;
      takeLowest = true;
    }
    // Se craft attribute Ã© 0 mas totalDice >= 1, nÃ£o usa takeLowest

    rollFormula = {
      diceCount,
      takeLowest,
      modifier: calculation.totalModifier,
      formula: `${diceCount}d20${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier}`,
    };
  } else {
    // CÃ¡lculo normal para habilidades nÃ£o-ofÃ­cio ou ofÃ­cio sem craft selecionado
    const result = calculateSkillRoll(
      skill.name,
      skill.keyAttribute,
      attributes,
      skill.proficiencyLevel,
      skill.isSignature,
      characterLevel,
      skill.modifiers,
      isOverloaded
    );
    calculation = result.calculation;
    rollFormula = result.rollFormula;
  }

  // Verificar se atributo foi customizado
  const isCustomAttribute = skill.keyAttribute !== metadata.keyAttribute;

  // Handlers
  const handleKeyAttributeChange = (
    event: SelectChangeEvent<AttributeName>
  ) => {
    event.stopPropagation(); // evitar trigger do onClick da linha
    onKeyAttributeChange(skill.name, event.target.value as AttributeName);
  };

  const handleProficiencyChange = (
    event: SelectChangeEvent<ProficiencyLevel>
  ) => {
    event.stopPropagation();
    onProficiencyChange(skill.name, event.target.value as ProficiencyLevel);
  };

  const handleModifiersChange = (
    diceModifier: number,
    numericModifier: number
  ) => {
    if (onModifiersChange) {
      const newModifiers = buildModifiersArray(diceModifier, numericModifier);
      onModifiersChange(skill.name, newModifiers);
    }
  };

  const handleSelectedCraftChange = (event: SelectChangeEvent<string>) => {
    event.stopPropagation();
    if (onSelectedCraftChange) {
      onSelectedCraftChange(skill.name, event.target.value);
    }
  };

  const handleLuckLevelChange = (event: SelectChangeEvent<number>) => {
    event.stopPropagation();
    if (onLuckLevelChange) {
      onLuckLevelChange(Number(event.target.value));
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
        title="Requer proficiÃªncia para uso efetivo"
        enterDelay={150}
      >
        <ProficiencyIcon fontSize="small" color="action" />
      </Tooltip>
    );
  }
  if (isCustomAttribute) {
    indicators.push(
      <Tooltip key="custom" title="Atributo-chave customizado" enterDelay={150}>
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
          xs: '1fr auto',
          sm: '1.8fr 100px 100px 160px 1.2fr',
        },
        gap: { xs: 1, sm: 1.2 },
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
        // OtimizaÃ§Ã£o: apenas transiÃ§Ãµes nas propriedades que mudam
        transition:
          'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',
        // Uso de will-change para otimizar rendering
        willChange: 'border-color, background-color',
        // ForÃ§ar compositing layer para evitar repaints
        transform: 'translateZ(0)',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        },
        // Destaque se Ã© Habilidade de Assinatura
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
              ? `${SKILL_LABELS[skill.name]} - Atributo padrÃ£o: ${metadata.keyAttribute === 'especial' ? 'Especial' : ATTRIBUTE_LABELS[metadata.keyAttribute]} (customizado para ${ATTRIBUTE_LABELS[skill.keyAttribute]})`
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

      {/* Atributo-chave atual (editÃ¡vel) OU Select de OfÃ­cio OU Select de NÃ­vel de Sorte */}
      {isOficioSkill ? (
        // Select de ofÃ­cio (apenas para habilidade "oficio")
        <FormControl
          size="small"
          fullWidth
          onClick={(e) => e.stopPropagation()}
          sx={{ display: { xs: 'none', sm: 'block' }, gridColumn: 'span 2' }}
        >
          <Tooltip
            title={
              selectedCraft
                ? `${selectedCraft.name} (${ATTRIBUTE_ABBREVIATIONS[selectedCraft.attributeKey]} Nv. ${selectedCraft.level})`
                : 'Selecione um ofÃ­cio...'
            }
            enterDelay={150}
            placement="top"
          >
            <Select
              value={skill.selectedCraftId || ''}
              onChange={handleSelectedCraftChange}
              displayEmpty
              aria-label="Selecionar ofÃ­cio"
              sx={{
                '& .MuiSelect-select': {
                  py: 0.75,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxWidth: '300px',
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Selecione um ofÃ­cio...</em>
              </MenuItem>
              {crafts.map((craft) => (
                <MenuItem
                  key={craft.id}
                  value={craft.id}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                  title={`${craft.name} (${ATTRIBUTE_ABBREVIATIONS[craft.attributeKey]} Nv. ${craft.level})`}
                >
                  {craft.name} ({ATTRIBUTE_ABBREVIATIONS[craft.attributeKey]}{' '}
                  Nv.
                  {craft.level})
                </MenuItem>
              ))}
            </Select>
          </Tooltip>
        </FormControl>
      ) : isSorteSkill && luck ? (
        // Select de nÃ­vel de sorte (apenas para habilidade "sorte")
        <FormControl
          size="small"
          fullWidth
          onClick={(e) => e.stopPropagation()}
          sx={{ display: { xs: 'none', sm: 'block' }, gridColumn: 'span 2' }}
        >
          <Select
            value={luck.level}
            onChange={handleLuckLevelChange}
            aria-label="NÃ­vel de sorte"
            sx={{
              '& .MuiSelect-select': {
                py: 0.75,
              },
            }}
          >
            <MenuItem value={0}>NÃ­vel 0 (1d20)</MenuItem>
            <MenuItem value={1}>NÃ­vel 1 (2d20)</MenuItem>
            <MenuItem value={2}>NÃ­vel 2 (2d20+2)</MenuItem>
            <MenuItem value={3}>NÃ­vel 3 (3d20+3)</MenuItem>
            <MenuItem value={4}>NÃ­vel 4 (3d20+6)</MenuItem>
            <MenuItem value={5}>NÃ­vel 5 (4d20+8)</MenuItem>
            <MenuItem value={6}>NÃ­vel 6 (4d20+12)</MenuItem>
            <MenuItem value={7}>NÃ­vel 7 (5d20+15)</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <>
          {/* Atributo-chave atual (editÃ¡vel) */}
          <FormControl
            size="small"
            fullWidth
            onClick={(e) => e.stopPropagation()}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Select
              value={skill.keyAttribute}
              onChange={handleKeyAttributeChange}
              aria-label={`Atributo-chave para ${SKILL_LABELS[skill.name]}`}
              sx={{
                '& .MuiSelect-select': {
                  py: 0.75,
                },
                ...(isCustomAttribute && {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }),
              }}
            >
              <MenuItem value="agilidade">AGI</MenuItem>
              <MenuItem value="constituicao">CON</MenuItem>
              <MenuItem value="forca">FOR</MenuItem>
              <MenuItem value="influencia">INF</MenuItem>
              <MenuItem value="mente">MEN</MenuItem>
              <MenuItem value="presenca">PRE</MenuItem>
            </Select>
          </FormControl>

          {/* Grau de proficiÃªncia (editÃ¡vel) */}
          <FormControl
            size="small"
            fullWidth
            onClick={(e) => e.stopPropagation()}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Select
              value={skill.proficiencyLevel}
              onChange={handleProficiencyChange}
              aria-label={`ProficiÃªncia em ${SKILL_LABELS[skill.name]}`}
              sx={{
                '& .MuiSelect-select': {
                  py: 0.75,
                },
              }}
            >
              <MenuItem value="leigo">Leigo</MenuItem>
              <MenuItem value="adepto">Adepto</MenuItem>
              <MenuItem value="versado">Versado</MenuItem>
              <MenuItem value="mestre">Mestre</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {/* Modificadores inline */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        {isSorteSkill && luck ? (
          <InlineModifiers
            diceModifier={luck.diceModifier || 0}
            numericModifier={luck.numericModifier || 0}
            onUpdate={handleLuckModifiersChange}
          />
        ) : (
          <InlineModifiers
            diceModifier={extractDiceModifier(skill.modifiers)}
            numericModifier={extractNumericModifier(skill.modifiers)}
            onUpdate={handleModifiersChange}
          />
        )}
      </Box>

      {/* Resultado: Modificador + FÃ³rmula (combinados) */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Tooltip
          title={`Modificador total: ${calculation.attributeValue} (atributo) Ã— ${calculation.proficiencyMultiplier} (proficiÃªncia) = ${calculation.baseModifier} (base) ${calculation.signatureBonus > 0 ? `+ ${calculation.signatureBonus} (assinatura)` : ''} ${extractNumericModifier(skill.modifiers) !== 0 ? `+ ${extractNumericModifier(skill.modifiers)} (modificadores)` : ''} ${calculation.otherModifiers !== 0 ? `+ ${calculation.otherModifiers} (outros)` : ''}`}
          enterDelay={150}
        >
          <Chip
            label={
              calculation.totalModifier >= 0
                ? `+${calculation.totalModifier}`
                : calculation.totalModifier
            }
            size="small"
            color={calculation.totalModifier >= 0 ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip
          title={`FÃ³rmula de rolagem: ${rollFormula.formula} (${rollFormula.diceCount} dado${rollFormula.diceCount > 1 ? 's' : ''} + modificador de ${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier})`}
          enterDelay={150}
        >
          <Typography
            variant="body1"
            fontFamily="monospace"
            color={rollFormula.takeLowest ? 'error' : 'primary'}
            fontWeight={700}
            sx={{
              minWidth: 'fit-content',
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
            }}
          >
            {rollFormula.formula}
          </Typography>
        </Tooltip>
      </Box>

      {/* Mobile: Modificador + Rolagem */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Tooltip
          title={`Modificador total: ${calculation.attributeValue} (atributo) Ã— ${calculation.proficiencyMultiplier} (proficiÃªncia) = ${calculation.baseModifier} (base) ${calculation.signatureBonus > 0 ? `+ ${calculation.signatureBonus} (assinatura)` : ''} ${extractNumericModifier(skill.modifiers) !== 0 ? `+ ${extractNumericModifier(skill.modifiers)} (modificadores)` : ''} ${calculation.otherModifiers !== 0 ? `+ ${calculation.otherModifiers} (outros)` : ''}`}
          enterDelay={150}
        >
          <Chip
            label={
              calculation.totalModifier >= 0
                ? `+${calculation.totalModifier}`
                : calculation.totalModifier
            }
            size="small"
            color={calculation.totalModifier >= 0 ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>
        <Tooltip
          title={`FÃ³rmula de rolagem: ${rollFormula.formula} (${rollFormula.diceCount} dado${rollFormula.diceCount > 1 ? 's' : ''} + modificador de ${calculation.totalModifier >= 0 ? '+' : ''}${calculation.totalModifier})`}
          enterDelay={150}
        >
          <Typography
            variant="body2"
            fontFamily="monospace"
            color={rollFormula.takeLowest ? 'error' : 'primary'}
            fontWeight={600}
          >
            {rollFormula.formula}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SkillRow;

