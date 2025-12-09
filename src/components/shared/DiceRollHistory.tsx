/**
 * DiceRollHistory - Histórico de Rolagens
 *
 * Exibe o histórico de rolagens da sessão com possibilidade de
 * visualizar detalhes, limpar histórico e filtrar resultados.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  Button,
  Paper,
  Collapse,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { globalDiceHistory } from '@/utils/diceRoller';
import type { DiceRollResult } from '@/utils/diceRoller';
import { DiceRollResult as DiceRollResultComponent } from './DiceRollResult';

export interface DiceRollHistoryProps {
  /** Número máximo de entradas a exibir */
  maxEntries?: number;
  /** Se deve permitir expandir para ver detalhes */
  expandable?: boolean;
  /** Callback quando limpar histórico */
  onClear?: () => void;
}

/**
 * Componente de histórico de rolagens
 */
export function DiceRollHistory({
  maxEntries = 50,
  expandable = true,
  onClear,
}: DiceRollHistoryProps) {
  const theme = useTheme();
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  /**
   * Atualiza o histórico do estado local
   */
  const updateHistory = useCallback(() => {
    const allRolls = globalDiceHistory.getAll();
    const limitedRolls = allRolls.slice(0, maxEntries);
    setHistory(limitedRolls);
  }, [maxEntries]);

  /**
   * Carrega histórico ao montar e configura polling
   */
  useEffect(() => {
    updateHistory();

    // Polling para atualizar histórico a cada segundo
    const interval = setInterval(updateHistory, 1000);

    return () => clearInterval(interval);
  }, [updateHistory]);

  /**
   * Limpa todo o histórico
   */
  const handleClearAll = useCallback(() => {
    globalDiceHistory.clear();
    setHistory([]);
    setExpandedIndex(null);

    if (onClear) {
      onClear();
    }
  }, [onClear]);

  /**
   * Expande/colapsa detalhes de uma rolagem
   */
  const handleToggleExpand = useCallback(
    (index: number) => {
      setExpandedIndex(expandedIndex === index ? null : index);
    },
    [expandedIndex]
  );

  /**
   * Formata timestamp para exibição
   */
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Gera resumo compacto da rolagem
   */
  const getRollSummary = (result: DiceRollResult) => {
    const parts = [result.formula];

    if (result.context) {
      parts.push(`(${result.context})`);
    }

    return parts.join(' ');
  };

  if (history.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: theme.palette.action.hover,
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Nenhuma rolagem ainda. Role os dados para começar!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header com botão de limpar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Histórico ({history.length})
        </Typography>
        <Button
          size="small"
          startIcon={<ClearAllIcon />}
          onClick={handleClearAll}
          color="error"
          variant="outlined"
          aria-label="Limpar todo o histórico"
        >
          Limpar Tudo
        </Button>
      </Box>

      {/* Lista de rolagens */}
      <List
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {history.map((result, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <React.Fragment key={index}>
              <ListItem
                disablePadding
                secondaryAction={
                  expandable && (
                    <IconButton
                      edge="end"
                      onClick={() => handleToggleExpand(index)}
                      aria-label={
                        isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'
                      }
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )
                }
              >
                <ListItemButton
                  onClick={() => expandable && handleToggleExpand(index)}
                  sx={{
                    borderLeft: result.isCritical
                      ? `4px solid ${theme.palette.warning.main}`
                      : result.isCriticalFailure
                        ? `4px solid ${theme.palette.error.main}`
                        : 'none',
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography
                          variant="body1"
                          component="span"
                          fontWeight="medium"
                        >
                          {getRollSummary(result)}
                        </Typography>
                        <Chip
                          label={result.finalResult}
                          size="small"
                          color={
                            result.isCritical
                              ? 'warning'
                              : result.isCriticalFailure
                                ? 'error'
                                : 'default'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(result.timestamp)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>

              {/* Detalhes expandidos */}
              {expandable && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{ p: 2, backgroundColor: theme.palette.action.hover }}
                  >
                    <DiceRollResultComponent
                      result={result}
                      animate={false}
                      showBreakdown={true}
                    />
                  </Box>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Indicador de limite */}
      {globalDiceHistory.size() > maxEntries && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          Mostrando últimas {maxEntries} de {globalDiceHistory.size()} rolagens
        </Typography>
      )}
    </Box>
  );
}

export default DiceRollHistory;
