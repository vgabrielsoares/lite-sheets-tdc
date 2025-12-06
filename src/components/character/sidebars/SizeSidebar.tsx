'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { Sidebar } from '@/components/shared';
import type { CreatureSize } from '@/types/common';
import {
  SIZE_MODIFIERS,
  SIZE_LABELS,
  SIZE_DESCRIPTIONS,
  getSizeModifiers,
  CREATURE_SIZES,
} from '@/constants/lineage';

export interface SizeSidebarProps {
  /**
   * Controla se a sidebar está aberta
   */
  open: boolean;

  /**
   * Callback chamado ao fechar a sidebar
   */
  onClose: () => void;

  /**
   * Tamanho atual do personagem
   */
  currentSize: CreatureSize;
}

/**
 * Formata modificador com sinal (+/-)
 */
function formatModifier(value: number): string {
  if (value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
}

/**
 * Formata alcance em metros
 */
function formatReach(reach: number): string {
  if (reach === 0) return '0m (adjacente)';
  return `${reach}m`;
}

/**
 * Formata quadrados ocupados
 */
function formatSquares(squares: number): string {
  if (squares < 1) return `${squares} quadrado`;
  if (squares === 1) return '1 quadrado';
  return `${squares} quadrados`;
}

/**
 * Formata multiplicador de peso
 */
function formatCarryingCapacity(multiplier: number): string {
  if (multiplier === 1) return '×1 (normal)';
  if (multiplier < 1) return `×${multiplier} (reduzido)`;
  return `×${multiplier} (aumentado)`;
}

/**
 * Sidebar de Detalhes - Tamanho
 *
 * Exibe todos os modificadores aplicados pelo tamanho da criatura:
 * - Alcance
 * - Modificador de dano corpo-a-corpo
 * - Modificador de defesa
 * - Quadrados ocupados
 * - Modificador de peso carregável
 * - Modificador de manobras de combate
 * - Modificador de ND de rastreio
 * - Modificadores de habilidades (Acrobacia, Atletismo, Furtividade, Reflexos, Tenacidade)
 *
 * Também exibe uma tabela de referência com todos os tamanhos para comparação.
 *
 * **Importante**: Os modificadores são aplicados automaticamente quando o tamanho
 * é alterado na ficha do personagem.
 *
 * @component
 * @example
 * ```tsx
 * <SizeSidebar
 *   open={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   currentSize="medio"
 * />
 * ```
 */
export function SizeSidebar({ open, onClose, currentSize }: SizeSidebarProps) {
  const modifiers = getSizeModifiers(currentSize);

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title={`Tamanho: ${SIZE_LABELS[currentSize]}`}
    >
      <Stack spacing={3}>
        {/* Descrição do Tamanho Atual */}
        <Box>
          <Alert severity="info" icon={<InfoOutlinedIcon />}>
            <AlertTitle>
              <strong>{SIZE_LABELS[currentSize]}</strong>
            </AlertTitle>
            {SIZE_DESCRIPTIONS[currentSize]}
          </Alert>
        </Box>

        <Divider />

        {/* Modificadores do Tamanho Atual */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Modificadores Aplicados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Estes modificadores são aplicados automaticamente ao seu personagem.
          </Typography>

          <Stack spacing={2}>
            {/* Combate */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Combate
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Alcance</Typography>
                  <Chip
                    label={formatReach(modifiers.reach)}
                    size="small"
                    color="default"
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Dano Corpo-a-Corpo</Typography>
                  <Chip
                    label={formatModifier(modifiers.meleeDamage)}
                    size="small"
                    color={
                      modifiers.meleeDamage > 0
                        ? 'success'
                        : modifiers.meleeDamage < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Defesa</Typography>
                  <Chip
                    label={formatModifier(modifiers.defense)}
                    size="small"
                    color={
                      modifiers.defense > 0
                        ? 'success'
                        : modifiers.defense < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Manobras de Combate</Typography>
                  <Chip
                    label={formatModifier(modifiers.combatManeuvers)}
                    size="small"
                    color={
                      modifiers.combatManeuvers > 0
                        ? 'success'
                        : modifiers.combatManeuvers < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
              </Stack>
            </Box>

            {/* Espaço e Carga */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Espaço e Carga
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Quadrados Ocupados</Typography>
                  <Chip
                    label={formatSquares(modifiers.squaresOccupied)}
                    size="small"
                    color="default"
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Peso Carregável</Typography>
                  <Chip
                    label={formatCarryingCapacity(modifiers.carryingCapacity)}
                    size="small"
                    color={
                      modifiers.carryingCapacity > 1
                        ? 'success'
                        : modifiers.carryingCapacity < 1
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
              </Stack>
            </Box>

            {/* Rastreio */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Rastreio
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">ND de Rastreio</Typography>
                  <Chip
                    label={formatModifier(modifiers.trackingDC)}
                    size="small"
                    color={
                      modifiers.trackingDC > 0
                        ? 'success'
                        : modifiers.trackingDC < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
              </Stack>
            </Box>

            {/* Modificadores de Habilidades */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Modificadores de Habilidades
              </Typography>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Acrobacia</Typography>
                  <Chip
                    label={formatModifier(modifiers.skillModifiers.acrobacia)}
                    size="small"
                    color={
                      modifiers.skillModifiers.acrobacia > 0
                        ? 'success'
                        : modifiers.skillModifiers.acrobacia < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Atletismo</Typography>
                  <Chip
                    label={formatModifier(modifiers.skillModifiers.atletismo)}
                    size="small"
                    color={
                      modifiers.skillModifiers.atletismo > 0
                        ? 'success'
                        : modifiers.skillModifiers.atletismo < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Furtividade</Typography>
                  <Chip
                    label={formatModifier(modifiers.skillModifiers.furtividade)}
                    size="small"
                    color={
                      modifiers.skillModifiers.furtividade > 0
                        ? 'success'
                        : modifiers.skillModifiers.furtividade < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Reflexo</Typography>
                  <Chip
                    label={formatModifier(modifiers.skillModifiers.reflexo)}
                    size="small"
                    color={
                      modifiers.skillModifiers.reflexo > 0
                        ? 'success'
                        : modifiers.skillModifiers.reflexo < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2">Tenacidade</Typography>
                  <Chip
                    label={formatModifier(modifiers.skillModifiers.tenacidade)}
                    size="small"
                    color={
                      modifiers.skillModifiers.tenacidade > 0
                        ? 'success'
                        : modifiers.skillModifiers.tenacidade < 0
                          ? 'error'
                          : 'default'
                    }
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Tabela de Referência de Todos os Tamanhos */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Tabela de Referência
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comparação de modificadores entre todos os tamanhos disponíveis.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Tamanho</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Alcance</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Dano</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Defesa</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Carga</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Manobras</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CREATURE_SIZES.map((size) => {
                  const sizeModifiers = SIZE_MODIFIERS[size];
                  const isCurrent = size === currentSize;

                  return (
                    <TableRow
                      key={size}
                      sx={{
                        backgroundColor: isCurrent
                          ? 'action.selected'
                          : 'inherit',
                        '&:hover': {
                          backgroundColor: isCurrent
                            ? 'action.selected'
                            : 'action.hover',
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography
                          variant="body2"
                          fontWeight={isCurrent ? 'bold' : 'normal'}
                        >
                          {SIZE_LABELS[size]}
                          {isCurrent && ' (Atual)'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatReach(sizeModifiers.reach)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={
                            sizeModifiers.meleeDamage > 0
                              ? 'success.main'
                              : sizeModifiers.meleeDamage < 0
                                ? 'error.main'
                                : 'text.primary'
                          }
                        >
                          {formatModifier(sizeModifiers.meleeDamage)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={
                            sizeModifiers.defense > 0
                              ? 'success.main'
                              : sizeModifiers.defense < 0
                                ? 'error.main'
                                : 'text.primary'
                          }
                        >
                          {formatModifier(sizeModifiers.defense)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          ×{sizeModifiers.carryingCapacity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={
                            sizeModifiers.combatManeuvers > 0
                              ? 'success.main'
                              : sizeModifiers.combatManeuvers < 0
                                ? 'error.main'
                                : 'text.primary'
                          }
                        >
                          {formatModifier(sizeModifiers.combatManeuvers)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Legenda e Informações Adicionais */}
        <Box>
          <Alert severity="info" icon={<InfoOutlinedIcon />}>
            <AlertTitle>Como os modificadores funcionam?</AlertTitle>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Alcance:</strong> Distância que você pode atacar
                  corpo-a-corpo
                </li>
                <li>
                  <strong>Dano:</strong> Modificador aplicado a todos os seus
                  ataques corpo-a-corpo
                </li>
                <li>
                  <strong>Defesa:</strong> Modificador aplicado à sua Defesa
                  total
                </li>
                <li>
                  <strong>Carga:</strong> Multiplicador da sua capacidade de
                  carga base
                </li>
                <li>
                  <strong>Manobras:</strong> Modificador em testes de manobras
                  de combate
                </li>
                <li>
                  <strong>ND de Rastreio:</strong> Modificador na dificuldade de
                  rastrear você
                </li>
              </ul>
            </Typography>
          </Alert>
        </Box>
      </Stack>
    </Sidebar>
  );
}
