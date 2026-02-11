/**
 * EquipmentStep - Passo 7: Equipamentos Iniciais
 *
 * Campos:
 * - Itens padrão (Mochila, Cartão do Banco, 10 PO$)
 * - Itens da origem
 * - Compra de itens adicionais (opcional)
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import BackpackIcon from '@mui/icons-material/Backpack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { WizardStepProps } from '../CharacterCreationWizard';
import type { WizardItem } from '@/types/wizard';

/** Orçamento inicial em PO$ */
const INITIAL_BUDGET = 10;

/** Itens padrão (sempre presentes) */
const DEFAULT_ITEMS: WizardItem[] = [
  { name: 'Mochila', quantity: 1, cost: 0 },
  { name: 'Cartão do Banco', quantity: 1, cost: 0 },
];

export default function EquipmentStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { equipment, origin } = state;

  // Estado local para novo item
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemCost, setNewItemCost] = useState(0);

  // Itens da origem
  const originItems = origin.items;

  // Itens comprados pelo jogador
  const purchasedItems = equipment.purchasedItems;

  // Calcular gasto total
  const totalSpent = useMemo(() => {
    return purchasedItems.reduce(
      (sum, item) => sum + (item.cost ?? 0) * item.quantity,
      0
    );
  }, [purchasedItems]);

  // Orçamento restante
  const remainingBudget = INITIAL_BUDGET - totalSpent;

  // Handler para adicionar novo item
  const handleAddItem = useCallback(() => {
    if (!newItemName.trim()) return;

    const totalCost = newItemCost * newItemQuantity;
    if (totalCost > remainingBudget) return;

    const newItem: WizardItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity,
      cost: newItemCost,
    };

    updateNestedState('equipment', {
      purchasedItems: [...purchasedItems, newItem],
    });

    // Reset form
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemCost(0);
  }, [
    newItemName,
    newItemQuantity,
    newItemCost,
    remainingBudget,
    purchasedItems,
    updateNestedState,
  ]);

  // Handler para remover item
  const handleRemoveItem = useCallback(
    (index: number) => {
      const newItems = purchasedItems.filter((_, i) => i !== index);
      updateNestedState('equipment', { purchasedItems: newItems });
    },
    [purchasedItems, updateNestedState]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho com orçamento */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <BackpackIcon color="primary" />
            <Typography variant="h6">Equipamentos Iniciais</Typography>
          </Stack>

          <Chip
            icon={<AttachMoneyIcon />}
            label={`${remainingBudget} / ${INITIAL_BUDGET} PO$ restantes`}
            color={
              remainingBudget < 0
                ? 'error'
                : remainingBudget === 0
                  ? 'success'
                  : 'warning'
            }
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Você começa com itens padrão e pode comprar equipamentos adicionais
          com seu orçamento inicial de {INITIAL_BUDGET} PO$.
        </Typography>
      </Paper>

      {/* Itens padrão */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Itens Padrão (incluídos automaticamente)
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {DEFAULT_ITEMS.map((item) => (
            <Chip
              key={item.name}
              icon={
                item.name === 'Mochila' ? <BackpackIcon /> : <CreditCardIcon />
              }
              label={`${item.name} x${item.quantity}`}
              size="small"
              color="default"
            />
          ))}
          <Chip
            icon={<AttachMoneyIcon />}
            label={`${INITIAL_BUDGET} PO$`}
            size="small"
            color="success"
          />
        </Stack>
      </Paper>

      {/* Itens da origem */}
      {originItems.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Itens da Origem
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {originItems.map((item, index) => (
              <Chip
                key={`origin-${index}`}
                icon={<InventoryIcon />}
                label={`${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`}
                size="small"
                color="primary"
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Itens comprados */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Itens Comprados
        </Typography>

        {purchasedItems.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Qtd</TableCell>
                  <TableCell align="center">Custo Unit.</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchasedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">{item.cost ?? 0} PO$</TableCell>
                    <TableCell align="center">
                      {(item.cost ?? 0) * item.quantity} PO$
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum item comprado. Adicione itens abaixo.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Formulário para adicionar item */}
        <Typography variant="subtitle2" gutterBottom>
          Adicionar Novo Item
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="flex-start"
        >
          <TextField
            label="Nome do Item"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
          />

          <TextField
            label="Quantidade"
            type="number"
            value={newItemQuantity}
            onChange={(e) =>
              setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            size="small"
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />

          <TextField
            label="Custo (PO$)"
            type="number"
            value={newItemCost}
            onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
            size="small"
            inputProps={{ step: 0.01 }}
            helperText="1 PO$ = 100 C$"
            sx={{ width: 120 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            disabled={
              !newItemName.trim() ||
              newItemCost * newItemQuantity > remainingBudget
            }
          >
            Adicionar
          </Button>
        </Stack>

        {newItemCost * newItemQuantity > remainingBudget && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Orçamento insuficiente! Você tem apenas {remainingBudget} PO$
            restantes.
          </Alert>
        )}
      </Paper>

      {/* Avisos e informações */}
      <Alert severity="info">
        Detalhes como <strong>espaço ocupado</strong>,{' '}
        <strong>durabilidade</strong> e <strong>descrição</strong> podem ser
        editados diretamente na ficha do personagem após a criação.
      </Alert>

      {totalSpent > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2">Total Gasto</Typography>
            <Typography variant="h6" color="success.main">
              {totalSpent} PO$
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
