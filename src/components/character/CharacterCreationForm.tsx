'use client';

import { useState, FormEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack } from '@mui/icons-material';
import {
  useCharacterCreation,
  type CharacterFormData,
} from '@/hooks/useCharacterCreation';

/**
 * Props do componente CharacterCreationForm
 */
export interface CharacterCreationFormProps {
  /** Se deve exibir o botão de voltar */
  showBackButton?: boolean;
  /** Callback ao clicar no botão voltar (se não fornecido, usa cancel do hook) */
  onBack?: () => void;
  /** Se deve exibir informações sobre os valores padrão */
  showDefaultValuesInfo?: boolean;
}

/**
 * Componente de formulário para criação de personagem
 *
 * Formulário reutilizável que permite criar uma nova ficha de personagem
 * solicitando apenas informações básicas (nome do personagem e jogador).
 *
 * O personagem é criado com todos os valores padrão de nível 0 conforme
 * as regras do RPG Tabuleiro do Caos.
 *
 * **Funcionalidades:**
 * - Validação de entrada (nome obrigatório)
 * - Feedback visual de erro
 * - Estado de loading durante criação
 * - Redirecionamento automático após sucesso
 * - Integração com IndexedDB via Redux
 *
 * **Valores padrão aplicados automaticamente:**
 * - 15 PV (pontos de vida) máximo e atual
 * - 2 PP (pontos de poder) máximo e atual
 * - Todos os atributos em 1
 * - Proficiência com Armas Simples
 * - Idioma Comum
 * - Inventário inicial: Mochila, Cartão do Banco, 10 PO$
 *
 * @example
 * ```tsx
 * // Uso básico
 * <CharacterCreationForm />
 *
 * // Com customizações
 * <CharacterCreationForm
 *   showBackButton={false}
 *   showDefaultValuesInfo={false}
 * />
 * ```
 */
export default function CharacterCreationForm({
  showBackButton = true,
  onBack,
  showDefaultValuesInfo = true,
}: CharacterCreationFormProps) {
  // Estado local do formulário
  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');

  // Hook de criação de personagem
  const { createCharacter, isLoading, error, clearError, cancel } =
    useCharacterCreation();

  /**
   * Handler de submissão do formulário
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData: CharacterFormData = {
      name: characterName,
      playerName: playerName || undefined,
    };

    await createCharacter(formData);
  };

  /**
   * Handler do botão de voltar
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      cancel();
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {showBackButton && (
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 3 }}
          disabled={isLoading}
        >
          Voltar
        </Button>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Criar Nova Ficha
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Informe o nome do personagem para criar uma ficha com os valores
          padrão de nível 0 com XP suficiente para subir ao nível 1. Você poderá
          editar todos os campos depois.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
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
            disabled={isLoading}
            helperText="Nome do personagem que você vai interpretar"
            inputProps={{
              minLength: 2,
              maxLength: 100,
              'aria-label': 'Nome do Personagem',
            }}
          />

          <TextField
            label="Nome do Jogador (opcional)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            fullWidth
            disabled={isLoading}
            helperText="Seu nome ou apelido"
            inputProps={{
              maxLength: 100,
              'aria-label': 'Nome do Jogador',
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Ficha'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={handleBack}
              sx={{ minWidth: 120 }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </Box>
        </Box>

        {showDefaultValuesInfo && (
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Valores padrão de nível 0:
            </Typography>
            <Typography variant="caption" component="div">
              • GA: 15 | PV: 5 (máximo e atual)
              <br />
              • PP: 2 (máximo e atual)
              <br />
              • XP: 15 (pronto para subir ao nível 1)
              <br />
              • Atributos: todos em 1
              <br />
              • Proficiência: Armas Simples
              <br />
              • Idioma: Comum
              <br />• Inventário: Mochila, Cartão do Banco, 10 PO$
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
