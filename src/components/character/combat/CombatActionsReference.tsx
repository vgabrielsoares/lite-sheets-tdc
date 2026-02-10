/**
 * CombatActionsReference - Lista de referência rápida de ações de combate
 *
 * Componente colapsável que exibe todas as ações de combate disponíveis,
 * organizadas por tipo: Ações (▶), Reações (↩), Ações Livres (∆).
 */
'use client';

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type {
  CombatAction,
  CombatActionCostType,
} from '@/constants/combatActions';
import {
  COMBAT_ACTIONS,
  COST_TYPE_LABELS,
  COST_TYPE_SYMBOLS,
  formatActionCost,
} from '@/constants/combatActions';

/**
 * Cores para cada tipo de custo
 */
const COST_COLORS: Record<
  CombatActionCostType,
  'primary' | 'warning' | 'success'
> = {
  acao: 'primary',
  reacao: 'warning',
  livre: 'success',
};

/**
 * Seção de lista de ações de um tipo
 */
interface ActionSectionProps {
  title: string;
  actions: CombatAction[];
  costType: CombatActionCostType;
}

const ActionSection = React.memo(function ActionSection({
  title,
  actions,
  costType,
}: ActionSectionProps) {
  const color = COST_COLORS[costType];

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Chip
          label={`${COST_TYPE_SYMBOLS[costType]} ${title}`}
          color={color}
          size="small"
          variant="filled"
        />
        <Typography variant="caption" color="text.secondary">
          ({actions.length} ações)
        </Typography>
      </Stack>
      <List dense disablePadding>
        {actions.map((action) => (
          <ListItem key={action.name} sx={{ py: 0.25, px: 1 }} disableGutters>
            <Tooltip title={action.description} arrow placement="left">
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontFamily: 'monospace', minWidth: 32 }}
                    >
                      {formatActionCost(action)}
                    </Typography>
                    <Typography variant="body2" component="span">
                      {action.name}
                    </Typography>
                    {action.variableCost && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        (custo variável)
                      </Typography>
                    )}
                  </Stack>
                }
              />
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

/**
 * Componente colapsável com lista de referência de ações de combate
 */
export const CombatActionsReference = React.memo(
  function CombatActionsReference() {
    return (
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          '&::before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="combat-actions-content"
          id="combat-actions-header"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <MenuBookIcon color="info" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              Referência de Ações
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <ActionSection
            title={COST_TYPE_LABELS.acao}
            actions={COMBAT_ACTIONS.acoes}
            costType="acao"
          />
          <ActionSection
            title={COST_TYPE_LABELS.reacao}
            actions={COMBAT_ACTIONS.reacoes}
            costType="reacao"
          />
          <ActionSection
            title={COST_TYPE_LABELS.livre}
            actions={COMBAT_ACTIONS.livres}
            costType="livre"
          />
        </AccordionDetails>
      </Accordion>
    );
  }
);

CombatActionsReference.displayName = 'CombatActionsReference';

export default CombatActionsReference;
