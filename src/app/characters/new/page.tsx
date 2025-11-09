'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import AppLayout from '@/components/layout/AppLayout';
import { useAppDispatch } from '@/store/hooks';
import { addCharacter } from '@/features/characters/charactersSlice';
import { createDefaultCharacter } from '@/utils/characterFactory';

/**
 * Página de criação de nova ficha de personagem
 *
 * No MVP 1, apenas solicita o nome do personagem e cria a ficha
 * com valores padrão de nível 1 conforme as regras do RPG.
 *
 * Valores padrão aplicados automaticamente:
 * - 15 PV máximo e atual
 * - 2 PP máximo e atual
 * - Todos os atributos em 1
 * - Proficiência com Armas Simples
 * - Idioma Comum
 * - Inventário inicial: Mochila, Cartão do Banco, 10 PO$
 */
export default function NewCharacterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!characterName.trim()) {
      setError('O nome do personagem é obrigatório');
      return;
    }

    try {
      // Criar personagem com valores padrão de nível 1
      const newCharacter = createDefaultCharacter({
        name: characterName.trim(),
        playerName: playerName.trim() || undefined,
      });

      // Adicionar ao store
      dispatch(addCharacter(newCharacter));

      // Redirecionar para a ficha criada
      router.push(`/characters/${newCharacter.id}`);
    } catch (err) {
      console.error('Erro ao criar personagem:', err);
      setError('Erro ao criar personagem. Tente novamente.');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <AppLayout maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mb: 3 }}>
          Voltar
        </Button>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Criar Nova Ficha
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Informe o nome do personagem para criar uma ficha com os valores
            padrão de nível 1. Você poderá editar todos os campos depois.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              label="Nome do Personagem"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              fullWidth
              required
              autoFocus
              helperText="Nome do personagem que você vai interpretar"
            />

            <TextField
              label="Nome do Jogador (opcional)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              fullWidth
              helperText="Seu nome ou apelido"
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                fullWidth
              >
                Criar Ficha
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleCancel}
                sx={{ minWidth: 120 }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Valores padrão de nível 1:
            </Typography>
            <Typography variant="caption" component="div">
              • PV: 15 (máximo e atual)
              <br />
              • PP: 2 (máximo e atual)
              <br />
              • Atributos: todos em 1
              <br />
              • Proficiência: Armas Simples
              <br />
              • Idioma: Comum
              <br />• Inventário: Mochila, Cartão do Banco, 10 PO$
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </AppLayout>
  );
}
