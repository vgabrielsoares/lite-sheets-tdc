/**
 * DefenseTest - Componente para Teste de Defesa Ativo
 *
 * Defesa é um teste padronizado por nível, como ataques físicos.
 * - Dado de defesa = nível do personagem (d6/d8/d10/d12)
 * - Quantidade de dados = Corpo ou Agilidade (escolha do jogador)
 * - É uma Ação Livre (∆) para rolar teste de defesa
 * - Cada ✶ no teste reduz ✶ do atacante
 * - NÃO usa mais Reflexo/Vigor como habilidades de defesa
 */
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Speed as ReflexIcon,
  FitnessCenter as VigorIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName } from '@/types/skills';
import type { DieSize, Modifier } from '@/types/common';
import type { DicePoolResult } from '@/types';
import { ATTRIBUTE_LABELS } from '@/constants/attributes';
import { getAttackDefenseDieSize } from '@/constants/combatLevels';
import { rollSkillTest, globalDiceHistory } from '@/utils/diceRoller';
import { DiceRollResult } from '@/components/shared/DiceRollResult';
import type { DicePenaltyMap } from '@/utils/conditionEffects';
import { getDicePenaltyForAttribute } from '@/utils/conditionEffects';

export interface DefenseTestProps {
  /** Atributos do personagem */
  attributes: Attributes;
  /** Habilidades do personagem */
  skills: Skills;
  /** Nível do personagem */
  characterLevel: number;
  /** Habilidade de assinatura */
  signatureSkill?: SkillName;
  /** Penalidades de dados de condições ativas (opcional) */
  conditionPenalties?: DicePenaltyMap;
  /** Penalidade de defesa das condições ativas (-Xd no teste de defesa) */
  conditionDefensePenalty?: number;
  /** Modificador permanente de dados de defesa (+Xd/-Xd) */
  permanentDiceModifier?: number;
  /** Callback para alterar o modificador permanente */
  onPermanentDiceModifierChange?: (value: number) => void;
}

/**
 * Informações de uma opção de teste de defesa
 */
interface DefenseOptionInfo {
  attribute: keyof Attributes;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

/**
 * Resultado do cálculo do pool de defesa
 */
interface DefensePoolResult {
  diceCount: number;
  dieSize: DieSize;
  isPenaltyRoll: boolean;
  formula: string;
}

/**
 * As duas opções de teste de defesa ativo (baseado em atributo + nível)
 */
const DEFENSE_OPTIONS: DefenseOptionInfo[] = [
  {
    attribute: 'agilidade',
    label: 'Agilidade',
    icon: <ReflexIcon />,
    color: '#4CAF50',
    description: 'Esquivar, aparar, reação rápida. Usa Agilidade.',
  },
  {
    attribute: 'corpo',
    label: 'Corpo',
    icon: <VigorIcon />,
    color: '#F44336',
    description: 'Resistir, bloquear, aguentar o impacto. Usa Corpo.',
  },
];

/**
 * Componente que exibe as opções de teste de defesa ativo
 *
 * Defesa é um teste padronizado por nível (não usa proficiência).
 * O jogador pode defender com Corpo ou Agilidade.
 * Dado = nível do personagem. Quantidade = valor do atributo.
 * Cada ✶ obtido reduz 1✶ do ataque inimigo.
 */
export const DefenseTest = React.memo(function DefenseTest({
  attributes,
  skills,
  characterLevel,
  signatureSkill,
  conditionPenalties,
  conditionDefensePenalty = 0,
  permanentDiceModifier = 0,
  onPermanentDiceModifierChange,
}: DefenseTestProps) {
  // Estado do diálogo de rolagem
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DefenseOptionInfo | null>(null);
  const [rollResult, setRollResult] = useState<DicePoolResult | null>(null);
  // Modificadores temporários preservados por atributo de defesa
  const [tempModifiers, setTempModifiers] = useState<Record<string, number>>(
    {}
  );

  const tempDiceModifier = selectedOption
    ? (tempModifiers[selectedOption.attribute] ?? 0)
    : 0;

  const setTempDiceModifier = useCallback(
    (value: number) => {
      if (!selectedOption) return;
      setTempModifiers((prev) => ({
        ...prev,
        [selectedOption.attribute]: value,
      }));
    },
    [selectedOption]
  );

  /** Abre o diálogo de rolagem */
  const handleCardClick = useCallback((option: DefenseOptionInfo) => {
    setSelectedOption(option);
    setRollResult(null);
    setDialogOpen(true);
  }, []);

  /** Fecha o diálogo */
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  /**
   * Calcula o pool de dados para um teste de defesa
   * Dado = nível do personagem, quantidade = valor do atributo + modificadores
   */
  const calculateDefensePool = (
    option: DefenseOptionInfo
  ): DefensePoolResult => {
    const attributeValue = attributes[option.attribute];
    const dieSize = getAttackDefenseDieSize(characterLevel);

    // Aplica penalidades de condições ativas
    const conditionPenalty = conditionPenalties
      ? getDicePenaltyForAttribute(conditionPenalties, option.attribute)
      : 0;
    const effectiveTotalDice =
      attributeValue +
      conditionPenalty +
      conditionDefensePenalty +
      permanentDiceModifier;

    // Se effectiveTotalDice <= 0, rola 2d e usa o menor
    if (effectiveTotalDice <= 0) {
      return {
        diceCount: 2,
        dieSize,
        isPenaltyRoll: true,
        formula: `2${dieSize} (menor)`,
      };
    }

    const diceCount = Math.min(effectiveTotalDice, 8);
    return {
      diceCount,
      dieSize,
      isPenaltyRoll: false,
      formula: `${diceCount}${dieSize}`,
    };
  };

  /** Executa a rolagem de defesa */
  const handleRoll = useCallback(() => {
    if (!selectedOption) return;
    const pool = calculateDefensePool(selectedOption);
    const baseDice = pool.isPenaltyRoll ? 0 : pool.diceCount;
    const result = rollSkillTest(
      baseDice,
      pool.dieSize,
      tempDiceModifier,
      `Teste de Defesa (${selectedOption.label})`
    );
    globalDiceHistory.add(result);
    setRollResult(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, tempDiceModifier]);

  const defenseOptions = useMemo(
    () =>
      DEFENSE_OPTIONS.map((option) => ({
        ...option,
        pool: calculateDefensePool(option),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      attributes,
      characterLevel,
      conditionPenalties,
      conditionDefensePenalty,
      permanentDiceModifier,
    ]
  );

  return (
    <>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ShieldIcon color="primary" />
          <Typography variant="h6" component="h3" color="text.secondary">
            Teste de Defesa
          </Typography>
          <Chip label="∆ Ação Livre" size="small" variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defesa é um teste ativo. Cada ✶ obtido anula 1✶ do atacante. Clique
          para rolar.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {defenseOptions.map((option) => (
            <Tooltip
              key={option.attribute}
              title={`Clique para rolar Defesa (${option.label})`}
              arrow
              placement="top"
            >
              <Card
                variant="outlined"
                onClick={() => handleCardClick(option)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(option);
                  }
                }}
                aria-label={`Rolar teste de defesa com ${option.label}: ${option.pool.formula}`}
                sx={{
                  cursor: 'pointer',
                  borderColor: option.color,
                  borderWidth: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${option.color}40`,
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Box sx={{ color: option.color }}>{option.icon}</Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {option.label}
                    </Typography>
                    <Chip
                      label={getAttackDefenseDieSize(characterLevel)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {option.description}
                  </Typography>

                  {/* Pool display + dice icon */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={option.pool.formula}
                      color={option.pool.isPenaltyRoll ? 'warning' : 'success'}
                      variant="filled"
                      sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                    />
                    <CasinoIcon
                      fontSize="small"
                      sx={{ color: 'text.secondary' }}
                    />
                  </Stack>

                  {option.pool.isPenaltyRoll && (
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Penalidade: rola 2 dados e usa o menor resultado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Diálogo de Rolagem de Teste de Defesa */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        {selectedOption &&
          (() => {
            const pool = calculateDefensePool(selectedOption);
            const attributeValue = attributes[selectedOption.attribute];
            const dieSize = getAttackDefenseDieSize(characterLevel);

            return (
              <>
                <DialogTitle>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShieldIcon color="primary" />
                    <Typography variant="h6">
                      Teste de Defesa ({selectedOption.label})
                    </Typography>
                  </Stack>
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={2}>
                    {/* Descrição */}
                    <Typography variant="body2" color="text.secondary">
                      {selectedOption.description}
                    </Typography>

                    {/* Configuração da rolagem */}
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        label={`${ATTRIBUTE_LABELS[selectedOption.attribute]}: ${attributeValue}d`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Nível ${characterLevel} (${dieSize})`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {permanentDiceModifier !== 0 && (
                        <Chip
                          label={`Mod. permanente: ${permanentDiceModifier > 0 ? '+' : ''}${permanentDiceModifier}d`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      {(() => {
                        const attrCondPenalty = conditionPenalties
                          ? getDicePenaltyForAttribute(
                              conditionPenalties,
                              selectedOption.attribute
                            )
                          : 0;
                        return attrCondPenalty !== 0 ? (
                          <Chip
                            label={`Condição (${ATTRIBUTE_LABELS[selectedOption.attribute]}): ${attrCondPenalty > 0 ? '+' : ''}${attrCondPenalty}d`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        ) : null;
                      })()}
                      {conditionDefensePenalty !== 0 && (
                        <Chip
                          label={`Condição (defesa): ${conditionDefensePenalty > 0 ? '+' : ''}${conditionDefensePenalty}d`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {tempDiceModifier !== 0 && (
                        <Chip
                          label={`Mod. temporário: ${tempDiceModifier > 0 ? '+' : ''}${tempDiceModifier}d`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    {/* Resumo do pool final */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Pool final:
                      </Typography>
                      <Chip
                        label={pool.formula}
                        size="small"
                        color={pool.isPenaltyRoll ? 'warning' : 'success'}
                        variant="filled"
                        sx={{ fontWeight: 700 }}
                      />
                      {pool.isPenaltyRoll && (
                        <Chip
                          label="menor resultado"
                          size="small"
                          color="error"
                          variant="filled"
                        />
                      )}
                    </Stack>

                    {/* Modificador permanente */}
                    {onPermanentDiceModifierChange && (
                      <TextField
                        label="Modificador permanente (±d)"
                        type="number"
                        size="small"
                        value={permanentDiceModifier}
                        onChange={(e) =>
                          onPermanentDiceModifierChange(
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        inputProps={{
                          'aria-label':
                            'Modificador permanente de dados de defesa',
                        }}
                        helperText="Bônus ou penalidade permanente (ex: escudo, item)"
                        fullWidth
                      />
                    )}

                    {/* Modificador temporário */}
                    <TextField
                      label="Modificador temporário (±d)"
                      type="number"
                      size="small"
                      value={tempDiceModifier}
                      onChange={(e) =>
                        setTempDiceModifier(parseInt(e.target.value, 10) || 0)
                      }
                      inputProps={{
                        'aria-label': 'Modificador temporário de dados',
                      }}
                      helperText="Adicione ou remova dados temporariamente"
                      fullWidth
                    />

                    {/* Botão de rolagem */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRoll}
                      startIcon={<CasinoIcon />}
                      fullWidth
                      size="large"
                    >
                      Rolar {pool.formula}
                      {tempDiceModifier !== 0 &&
                        ` (${tempDiceModifier > 0 ? '+' : ''}${tempDiceModifier}d)`}
                    </Button>

                    {/* Resultado */}
                    {rollResult && (
                      <DiceRollResult
                        result={rollResult}
                        animate
                        showBreakdown
                      />
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog}>Fechar</Button>
                </DialogActions>
              </>
            );
          })()}
      </Dialog>
    </>
  );
});

DefenseTest.displayName = 'DefenseTest';

export default DefenseTest;
