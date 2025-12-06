'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  alpha,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { Attack } from '@/types/combat';
import { AttackRow } from './AttackRow';
import { AttackForm } from './AttackForm';
import { ConfirmDialog } from '@/components/shared';

export interface AttacksDisplayProps {
  /** Lista de ataques do personagem */
  attacks: Attack[];
  /** Callback para atualizar a lista de ataques */
  onChange: (attacks: Attack[]) => void;
}

/**
 * Componente que exibe e gerencia a lista de ataques do personagem
 *
 * Permite:
 * - Visualizar todos os ataques
 * - Adicionar novos ataques
 * - Editar ataques existentes
 * - Remover ataques
 *
 * @example
 * ```tsx
 * <AttacksDisplay
 *   attacks={character.combat.attacks}
 *   onChange={(attacks) => onUpdate({ combat: { ...combat, attacks } })}
 * />
 * ```
 */
export function AttacksDisplay({ attacks, onChange }: AttacksDisplayProps) {
  const theme = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAttack, setEditingAttack] = useState<Attack | undefined>(
    undefined
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attackToDelete, setAttackToDelete] = useState<string | null>(null);

  /**
   * Abre o formulário para novo ataque
   */
  const handleAddAttack = useCallback(() => {
    setEditingAttack(undefined);
    setFormOpen(true);
  }, []);

  /**
   * Abre o formulário para editar um ataque existente
   */
  const handleEditAttack = useCallback((attack: Attack) => {
    setEditingAttack(attack);
    setFormOpen(true);
  }, []);

  /**
   * Confirma remoção de um ataque
   */
  const handleDeleteClick = useCallback((attackName: string) => {
    setAttackToDelete(attackName);
    setDeleteConfirmOpen(true);
  }, []);

  /**
   * Remove um ataque após confirmação
   */
  const handleConfirmDelete = useCallback(() => {
    if (attackToDelete) {
      onChange(attacks.filter((a) => a.name !== attackToDelete));
    }
    setDeleteConfirmOpen(false);
    setAttackToDelete(null);
  }, [attackToDelete, attacks, onChange]);

  /**
   * Salva um ataque (novo ou editado)
   */
  const handleSaveAttack = useCallback(
    (attack: Attack) => {
      if (editingAttack) {
        // Editar ataque existente
        onChange(
          attacks.map((a) => (a.name === editingAttack.name ? attack : a))
        );
      } else {
        // Verificar se já existe um ataque com o mesmo nome
        const exists = attacks.some((a) => a.name === attack.name);
        if (exists) {
          // Adiciona sufixo numérico para evitar duplicatas
          let counter = 2;
          let newName = `${attack.name} (${counter})`;
          while (attacks.some((a) => a.name === newName)) {
            counter++;
            newName = `${attack.name} (${counter})`;
          }
          attack = { ...attack, name: newName };
        }
        // Adicionar novo ataque
        onChange([...attacks, attack]);
      }
      setFormOpen(false);
      setEditingAttack(undefined);
    },
    [attacks, editingAttack, onChange]
  );

  /**
   * Fecha o formulário
   */
  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingAttack(undefined);
  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Ataques
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddAttack}
            aria-label="Adicionar novo ataque"
          >
            Adicionar
          </Button>
        </Box>

        {/* Lista de ataques */}
        {attacks.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: alpha(theme.palette.text.secondary, 0.05),
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Nenhum ataque configurado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em &quot;Adicionar&quot; para criar um novo ataque.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {attacks.map((attack, index) => (
              <AttackRow
                key={`${attack.name}-${index}`}
                attack={attack}
                onEdit={handleEditAttack}
                onDelete={handleDeleteClick}
                index={index}
              />
            ))}
          </Stack>
        )}

        {/* Formulário de ataque */}
        <AttackForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={handleSaveAttack}
          editingAttack={editingAttack}
        />

        {/* Dialog de confirmação de exclusão */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          title="Remover Ataque"
          message={`Tem certeza que deseja remover o ataque "${attackToDelete}"?`}
          confirmText="Remover"
          cancelText="Cancelar"
          confirmColor="warning"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setAttackToDelete(null);
          }}
        />
      </CardContent>
    </Card>
  );
}
