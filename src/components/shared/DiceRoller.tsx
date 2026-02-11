/**
 * DiceRoller - Componente de Rolador de Dados
 *
 * Interface visual para rolagem de dados usando o novo sistema de pool:
 * - Dados = configura quantidade manualmente ou baseado em atributo
 * - Tamanho do dado = d6/d8/d10/d12 (por proficiência) ou customizado
 * - Conta sucessos (✶): resultados ≥ 6
 * - Resultado = 1 cancela 1 sucesso
 * - Modo de dano para dados numéricos tradicionais
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import {
  rollDicePool,
  rollDamage,
  rollWithPenalty,
  globalDiceHistory,
  isDicePoolResult,
  isDamageDiceRollResult,
  type DamageDiceRollResult,
} from '@/utils/diceRoller';
import type { DicePoolResult, DieSize } from '@/types';
import { DiceRollResult } from './DiceRollResult';
import { DiceRollHistory } from './DiceRollHistory';

export interface DiceRollerProps {
  /** Pré-preencher número de dados */
  defaultDiceCount?: number;
  /** Tamanho do dado padrão */
  defaultDieSize?: DieSize;
  /** Contexto da rolagem (ex: "Teste de Acrobacia") */
  context?: string;
  /** Callback quando rolar dados */
  onRoll?: (result: DicePoolResult | DamageDiceRollResult) => void;
  /** Se deve exibir histórico */
  showHistory?: boolean;
  /** Se deve exibir botões de preset */
  showPresets?: boolean;
}

/** Tipo de rolagem: teste de pool ou dano */
type RollMode = 'pool' | 'damage';

/**
 * Componente principal do rolador de dados
 */
export function DiceRoller({
  defaultDiceCount = 2,
  defaultDieSize = 'd6',
  context,
  onRoll,
  showHistory = true,
  showPresets = true,
}: DiceRollerProps) {
  // Estado do rolador
  const [diceCount, setDiceCount] = useState(defaultDiceCount);
  const [dieSize, setDieSize] = useState<DieSize>(defaultDieSize);
  const [rollMode, setRollMode] = useState<RollMode>('pool');
  const [lastResult, setLastResult] = useState<
    DicePoolResult | DamageDiceRollResult | null
  >(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Estado para rolagem de dano
  const [damageDiceSides, setDamageDiceSides] = useState(6);
  const [damageModifier, setDamageModifier] = useState(0);

  /**
   * Executa a rolagem de dados
   */
  const handleRoll = useCallback(() => {
    let result: DicePoolResult | DamageDiceRollResult;

    if (rollMode === 'damage') {
      // Rolagem de dano (soma numérica)
      result = rollDamage(diceCount, damageDiceSides, damageModifier, context);
    } else {
      // Rolagem de pool com contagem de sucessos
      if (diceCount <= 0) {
        // Penalidade: rolar 2d e pegar o menor
        result = rollWithPenalty(dieSize, context);
      } else {
        result = rollDicePool(diceCount, dieSize, context);
      }
    }

    // Adicionar ao histórico global
    globalDiceHistory.add(result);

    // Atualizar estado local
    setLastResult(result);

    // Callback externo
    if (onRoll) {
      onRoll(result);
    }
  }, [
    diceCount,
    dieSize,
    rollMode,
    context,
    onRoll,
    damageDiceSides,
    damageModifier,
  ]);

  /**
   * Atalho de teclado: Enter para rolar
   */
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleRoll();
      }
    },
    [handleRoll]
  );

  /**
   * Limpa o último resultado
   */
  const handleClearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  /**
   * Presets comuns de rolagem
   */
  const handlePreset = useCallback(
    (preset: 'skillTest' | 'damage' | 'saveTest') => {
      if (preset === 'skillTest') {
        setDiceCount(2);
        setDieSize('d6');
        setRollMode('pool');
      } else if (preset === 'damage') {
        setDiceCount(1);
        setDamageDiceSides(6);
        setDamageModifier(0);
        setRollMode('damage');
      } else if (preset === 'saveTest') {
        setDiceCount(3);
        setDieSize('d6');
        setRollMode('pool');
      }
    },
    []
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CasinoIcon color="primary" fontSize="large" />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Rolador de Dados
            </Typography>
          </Box>

          {showHistory && (
            <Tooltip title="Histórico de Rolagens">
              <IconButton
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                color={showHistoryPanel ? 'primary' : 'default'}
                aria-label="Abrir histórico de rolagens"
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Contexto */}
        {context && (
          <Chip
            label={context}
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
        )}

        {/* Presets */}
        {showPresets && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Atalhos Rápidos:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('skillTest')}
                aria-label="Preset de teste de habilidade"
              >
                Teste (2d6)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('saveTest')}
                aria-label="Preset de teste de resistência"
              >
                Resistência (3d6)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('damage')}
                aria-label="Preset de dano"
              >
                Dano (1d6)
              </Button>
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Modo: Pool ou Dano */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tipo de Rolagem:
          </Typography>
          <ToggleButtonGroup
            value={rollMode}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setRollMode(newValue as RollMode);
              }
            }}
            fullWidth
            aria-label="Tipo de rolagem"
          >
            <ToggleButton
              value="pool"
              aria-label="Pool de dados (conta sucessos)"
            >
              Pool (Sucessos)
            </ToggleButton>
            <ToggleButton value="damage" aria-label="Dano (soma numérica)">
              Dano (Soma)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Configuração de Dados - Pool */}
        {rollMode === 'pool' && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Número de Dados"
              type="number"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              inputProps={{ min: -10, max: 20, step: 1 }}
              fullWidth
              helperText={
                diceCount <= 0
                  ? 'Penalidade: rola 2d e pega o menor'
                  : `Máximo efetivo: 8 dados`
              }
              error={diceCount <= 0}
              aria-label="Número de dados a rolar"
            />

            <TextField
              label="Tamanho do Dado"
              select
              value={dieSize}
              onChange={(e) => setDieSize(e.target.value as DieSize)}
              onKeyPress={handleKeyPress}
              fullWidth
              SelectProps={{ native: true }}
              aria-label="Tamanho do dado"
              helperText="Leigo=d6, Adepto=d8, Versado=d10, Mestre=d12"
            >
              <option value="d6">d6 (Leigo)</option>
              <option value="d8">d8 (Adepto)</option>
              <option value="d10">d10 (Versado)</option>
              <option value="d12">d12 (Mestre)</option>
            </TextField>
          </Stack>
        )}

        {/* Configuração de Dados - Dano */}
        {rollMode === 'damage' && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="Número de Dados"
              type="number"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              inputProps={{ min: 1, max: 20, step: 1 }}
              fullWidth
              aria-label="Número de dados a rolar"
            />

            <TextField
              label="Lados do Dado"
              select
              value={damageDiceSides}
              onChange={(e) =>
                setDamageDiceSides(parseInt(e.target.value) || 6)
              }
              onKeyPress={handleKeyPress}
              fullWidth
              SelectProps={{ native: true }}
              aria-label="Número de lados do dado"
            >
              <option value={4}>d4</option>
              <option value={6}>d6</option>
              <option value={8}>d8</option>
              <option value={10}>d10</option>
              <option value={12}>d12</option>
              <option value={20}>d20</option>
              <option value={100}>d100</option>
            </TextField>

            <TextField
              label="Modificador"
              type="number"
              value={damageModifier}
              onChange={(e) => setDamageModifier(parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              inputProps={{ min: -20, max: 20, step: 1 }}
              fullWidth
              aria-label="Modificador a adicionar"
            />
          </Stack>
        )}

        {/* Info sobre o sistema de pool */}
        {rollMode === 'pool' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Resultados ≥ 6 = Sucesso (✶) | Resultado = 1 cancela 1 sucesso
            </Typography>
          </Box>
        )}

        {/* Botão de Rolagem */}
        <Button
          variant="contained"
          size="large"
          onClick={handleRoll}
          startIcon={<CasinoIcon />}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          aria-label="Rolar dados"
        >
          Rolar{' '}
          {rollMode === 'pool'
            ? `${Math.min(Math.max(diceCount, 0), 8)}${dieSize}`
            : `${diceCount}d${damageDiceSides}${damageModifier !== 0 ? (damageModifier > 0 ? `+${damageModifier}` : damageModifier) : ''}`}
        </Button>

        {/* Resultado da Rolagem */}
        {lastResult && (
          <>
            <Divider />
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Resultado
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleClearResult}
                  aria-label="Limpar resultado"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <DiceRollResult result={lastResult} showBreakdown animate />
            </Box>
          </>
        )}

        {/* Histórico */}
        {showHistory && showHistoryPanel && (
          <>
            <Divider />
            <DiceRollHistory maxEntries={10} />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default DiceRoller;
