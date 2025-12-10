/**
 * DiceRoller - Componente de Rolador de Dados
 *
 * Interface visual para rolagem de dados com configurações avançadas,
 * exibição de resultados e histórico de rolagens.
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
  rollD20,
  rollDamage,
  RollType,
  globalDiceHistory,
} from '@/utils/diceRoller';
import { DiceRollResult } from './DiceRollResult';
import { DiceRollHistory } from './DiceRollHistory';

export interface DiceRollerProps {
  /** Pré-preencher número de dados */
  defaultDiceCount?: number;
  /** Pré-preencher modificador */
  defaultModifier?: number;
  /** Pré-preencher tipo de rolagem */
  defaultRollType?: RollType;
  /** Contexto da rolagem (ex: "Teste de Acrobacia") */
  context?: string;
  /** Callback quando rolar dados */
  onRoll?: (result: ReturnType<typeof rollD20>) => void;
  /** Se deve exibir histórico */
  showHistory?: boolean;
  /** Se deve exibir botões de preset */
  showPresets?: boolean;
}

/**
 * Componente principal do rolador de dados
 */
export function DiceRoller({
  defaultDiceCount = 1,
  defaultModifier = 0,
  defaultRollType = 'normal',
  context,
  onRoll,
  showHistory = true,
  showPresets = true,
}: DiceRollerProps) {
  // Estado do rolador
  const [diceCount, setDiceCount] = useState(defaultDiceCount);
  const [modifier, setModifier] = useState(defaultModifier);
  const [rollType, setRollType] = useState<RollType>(defaultRollType);
  const [lastResult, setLastResult] = useState<ReturnType<
    typeof rollD20
  > | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Estado para rolagem de dano
  const [isDamageMode, setIsDamageMode] = useState(false);
  const [diceSides, setDiceSides] = useState(6);

  /**
   * Executa a rolagem de dados
   */
  const handleRoll = useCallback(() => {
    let result: ReturnType<typeof rollD20>;

    if (isDamageMode) {
      // Rolagem de dano
      result = rollDamage(diceCount, diceSides, modifier, context) as any;
    } else {
      // Rolagem de teste (d20)
      result = rollD20(diceCount, modifier, rollType, context);
    }

    // Adicionar ao histórico global
    globalDiceHistory.add(result);

    // Atualizar estado local
    setLastResult(result);

    // Callback externo
    if (onRoll) {
      onRoll(result);
    }
  }, [diceCount, modifier, rollType, context, onRoll, isDamageMode, diceSides]);

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
  const handlePreset = useCallback((preset: 'attack' | 'damage' | 'save') => {
    if (preset === 'attack') {
      setDiceCount(1);
      setModifier(0);
      setRollType('normal');
      setIsDamageMode(false);
    } else if (preset === 'damage') {
      setDiceCount(1);
      setDiceSides(6);
      setModifier(0);
      setIsDamageMode(true);
    } else if (preset === 'save') {
      setDiceCount(1);
      setModifier(0);
      setRollType('normal');
      setIsDamageMode(false);
    }
  }, []);

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
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('attack')}
                aria-label="Preset de ataque"
              >
                Ataque (d20)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('damage')}
                aria-label="Preset de dano"
              >
                Dano (d6)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePreset('save')}
                aria-label="Preset de teste de resistência"
              >
                Teste de Resistência
              </Button>
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Modo: Teste ou Dano */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tipo de Rolagem:
          </Typography>
          <ToggleButtonGroup
            value={isDamageMode ? 'damage' : 'test'}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setIsDamageMode(newValue === 'damage');
              }
            }}
            fullWidth
            aria-label="Tipo de rolagem"
          >
            <ToggleButton value="test" aria-label="Teste (d20)">
              Teste (d20)
            </ToggleButton>
            <ToggleButton value="damage" aria-label="Dano (dXX)">
              Dano (dXX)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Configuração de Dados */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Número de Dados"
            type="number"
            value={diceCount}
            onChange={(e) => setDiceCount(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            inputProps={{ min: -10, max: 20, step: 1 }}
            fullWidth
            aria-label="Número de dados a rolar"
          />

          {isDamageMode && (
            <TextField
              label="Lados do Dado"
              type="number"
              value={diceSides}
              onChange={(e) => setDiceSides(parseInt(e.target.value) || 6)}
              onKeyPress={handleKeyPress}
              inputProps={{ min: 2, max: 100, step: 1 }}
              fullWidth
              aria-label="Número de lados do dado"
              select
              SelectProps={{ native: true }}
            >
              <option value={4}>d4</option>
              <option value={6}>d6</option>
              <option value={8}>d8</option>
              <option value={10}>d10</option>
              <option value={12}>d12</option>
              <option value={20}>d20</option>
              <option value={100}>d100</option>
            </TextField>
          )}

          <TextField
            label="Modificador"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            inputProps={{ min: -20, max: 20, step: 1 }}
            fullWidth
            aria-label="Modificador a adicionar"
          />
        </Stack>

        {/* Vantagem/Desvantagem (apenas para testes) */}
        {!isDamageMode && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Vantagem/Desvantagem:
            </Typography>
            <ToggleButtonGroup
              value={rollType}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  setRollType(newValue as RollType);
                }
              }}
              fullWidth
              aria-label="Tipo de vantagem"
            >
              <ToggleButton value="disadvantage" aria-label="Desvantagem">
                Desvantagem
              </ToggleButton>
              <ToggleButton value="normal" aria-label="Normal">
                Normal
              </ToggleButton>
              <ToggleButton value="advantage" aria-label="Vantagem">
                Vantagem
              </ToggleButton>
            </ToggleButtonGroup>
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
          Rolar Dados
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
              <DiceRollResult result={lastResult} />
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
