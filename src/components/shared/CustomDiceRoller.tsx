/**
 * CustomDiceRoller
 *
 * Componente para rolar dados livremente com configuração de:
 * - Tipo de dado (d2 a d100)
 * - Quantidade de dados
 * - Modificador numérico (+/-)
 * - Modo somado ou individual
 *
 * Integrado com o histórico global de rolagens (globalDiceHistory).
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  InputAdornment,
  Popover,
  Fab,
  Zoom,
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { rollCustomDice, globalDiceHistory } from '@/utils/diceRoller';
import type { CustomDiceResult } from '@/utils/diceRoller';

/** Dados rápidos disponíveis */
const QUICK_DICE = [
  { label: 'd4', sides: 4 },
  { label: 'd6', sides: 6 },
  { label: 'd8', sides: 8 },
  { label: 'd10', sides: 10 },
  { label: 'd12', sides: 12 },
  { label: 'd20', sides: 20 },
  { label: 'd100', sides: 100 },
] as const;

/** Dados menos comuns */
const EXTRA_DICE = [
  { label: 'd2', sides: 2 },
  { label: 'd3', sides: 3 },
] as const;

export interface CustomDiceRollerProps {
  /** Se deve exibir o FAB */
  show?: boolean;
}

/**
 * Componente de rolador de dados customizado com FAB
 */
export function CustomDiceRoller({ show = true }: CustomDiceRollerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [diceType, setDiceType] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [summed, setSummed] = useState(true);
  const [lastResult, setLastResult] = useState<CustomDiceResult | null>(null);

  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setLastResult(null);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  /**
   * Rola os dados com as configurações atuais
   */
  const handleRoll = useCallback(() => {
    const result = rollCustomDice(
      diceType,
      quantity,
      modifier,
      summed,
      `Rolagem Livre: ${quantity}d${diceType}`
    );
    globalDiceHistory.add(result);
    setLastResult(result);
  }, [diceType, quantity, modifier, summed]);

  /**
   * Rolagem rápida: 1 clique = 1 dado do tipo selecionado
   */
  const handleQuickRoll = useCallback((sides: number) => {
    const result = rollCustomDice(
      sides,
      1,
      0,
      true,
      `Rolagem Rápida: 1d${sides}`
    );
    globalDiceHistory.add(result);
    setLastResult(result);
    setDiceType(sides);
    setQuantity(1);
    setModifier(0);
  }, []);

  /**
   * Formata a fórmula atual
   */
  const formula = `${quantity}d${diceType}${modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : ''}`;

  if (!show) return null;

  return (
    <>
      {/* FAB do rolador */}
      <Zoom in={show} timeout={300}>
        <Tooltip title="Rolador de Dados" arrow>
          <Fab
            color="secondary"
            aria-label="Abrir rolador de dados"
            onClick={handleOpen}
            size="medium"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, md: 24 },
              right: { xs: 80, md: 96 },
              zIndex: (theme) => theme.zIndex.speedDial,
              boxShadow: 4,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 8,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <CasinoIcon />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Popover com o rolador */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: { xs: 320, sm: 360 },
              maxHeight: '80vh',
              overflow: 'auto',
              borderRadius: 3,
            },
          },
        }}
      >
        <Stack spacing={2}>
          {/* Título */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <CasinoIcon color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              Rolador de Dados
            </Typography>
          </Stack>

          {/* Dados rápidos */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              Rolagem Rápida (1 dado)
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {QUICK_DICE.map((d) => (
                <Chip
                  key={d.sides}
                  label={d.label}
                  onClick={() => handleQuickRoll(d.sides)}
                  color={diceType === d.sides ? 'secondary' : 'default'}
                  variant={diceType === d.sides ? 'filled' : 'outlined'}
                  clickable
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ))}
              {EXTRA_DICE.map((d) => (
                <Chip
                  key={d.sides}
                  label={d.label}
                  onClick={() => handleQuickRoll(d.sides)}
                  color={diceType === d.sides ? 'secondary' : 'default'}
                  variant={diceType === d.sides ? 'filled' : 'outlined'}
                  clickable
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Configuração customizada */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              gutterBottom
              display="block"
            >
              Configuração Avançada
            </Typography>

            {/* Quantidade e tipo */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                disabled={quantity <= 1}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                label="Qtd"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
                  )
                }
                inputProps={{ min: 1, max: 99, style: { textAlign: 'center' } }}
                size="small"
                sx={{ width: 70 }}
              />
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Aumentar quantidade"
                disabled={quantity >= 99}
              >
                <AddIcon fontSize="small" />
              </IconButton>

              <Typography variant="h6" sx={{ mx: 0.5 }}>
                d
              </Typography>

              <TextField
                label="Lados"
                type="number"
                value={diceType}
                onChange={(e) =>
                  setDiceType(
                    Math.max(2, Math.min(100, parseInt(e.target.value) || 6))
                  )
                }
                inputProps={{
                  min: 2,
                  max: 100,
                  style: { textAlign: 'center' },
                }}
                size="small"
                sx={{ width: 70 }}
              />
            </Stack>

            {/* Modificador */}
            <TextField
              label="Modificador"
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {modifier >= 0 ? '+' : ''}
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            {/* Modo soma/individual */}
            <ToggleButtonGroup
              value={summed ? 'sum' : 'individual'}
              exclusive
              onChange={(_e, val) => {
                if (val) setSummed(val === 'sum');
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="sum" aria-label="Somar dados">
                Somar
              </ToggleButton>
              <ToggleButton value="individual" aria-label="Dados individuais">
                Individual
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Botão de rolagem */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleRoll}
            startIcon={<CasinoIcon />}
            fullWidth
            size="large"
            sx={{ fontWeight: 700, fontSize: '1rem' }}
          >
            Rolar {formula}
          </Button>

          {/* Resultado */}
          {lastResult && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                border: 1,
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {lastResult.formula}
              </Typography>

              {/* Dados individuais */}
              {lastResult.rolls.length > 1 && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  useFlexGap
                  justifyContent="center"
                  sx={{ my: 1 }}
                >
                  {lastResult.rolls.map((roll, i) => (
                    <Chip
                      key={i}
                      label={roll}
                      size="small"
                      color={
                        roll === lastResult.diceType
                          ? 'success'
                          : roll === 1
                            ? 'error'
                            : 'default'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 600, minWidth: 32 }}
                    />
                  ))}
                </Stack>
              )}

              {/* Total */}
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                {lastResult.summed
                  ? lastResult.total
                  : lastResult.rolls.join(', ')}
              </Typography>

              {lastResult.modifier !== 0 && lastResult.summed && (
                <Typography variant="caption" color="text.secondary">
                  Dados: {lastResult.total - lastResult.modifier} | Mod:{' '}
                  {lastResult.modifier > 0 ? '+' : ''}
                  {lastResult.modifier}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Popover>
    </>
  );
}

export default CustomDiceRoller;
