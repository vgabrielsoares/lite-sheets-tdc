'use client';

/**
 * CharacterHistory - Seção de História/Background do Personagem
 *
 * Exibe editor de texto amplo para a história completa do personagem.
 * Inclui contador de palavras, auto-save com debounce e interface limpa.
 *
 * Características:
 * - Campo de texto multiline amplo
 * - Contador de palavras/caracteres
 * - Salvamento automático com debounce (1s)
 * - Formatação básica via markdown simples
 * - Interface responsiva
 *
 * Fase 7 - Issue 7.7 - MVP 1
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  useTheme,
  alpha,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  MenuBook as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as SavedIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useDebounce } from '@/hooks/useDebounce';

export interface CharacterHistoryProps {
  /** História/background atual */
  backstory: string;
  /** Callback para atualizar história */
  onUpdate: (backstory: string) => void;
}

/**
 * Calcula estatísticas do texto
 */
function calculateTextStats(text: string) {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;

  return { chars, words, lines };
}

/**
 * Seção de História do Personagem
 *
 * Editor de texto rico para background/história completa.
 */
export function CharacterHistory({
  backstory,
  onUpdate,
}: CharacterHistoryProps) {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(backstory || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounce do valor para auto-save
  const debouncedValue = useDebounce(localValue, 1000);

  // Sincronizar local com prop apenas na montagem inicial
  useEffect(() => {
    setLocalValue(backstory || '');
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  // Sincronizar local com prop quando backstory mudar externamente (reload, undo, etc)
  useEffect(() => {
    if (isInitialized && debouncedValue === backstory) {
      setIsSaving(false); // Limpar indicador de salvamento se valores forem iguais
      setLastSaved(new Date());
    }
  }, [backstory, debouncedValue, isInitialized]);

  // Auto-save quando o valor debouncado mudar
  useEffect(() => {
    // Não salvar na inicialização
    if (!isInitialized) return;

    // Não salvar se não houver mudança
    if (debouncedValue === backstory) return;

    // Salvar quando o valor mudar
    setIsSaving(true);
    onUpdate(debouncedValue);

    // Limpar indicador após delay
    const timer = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedValue, isInitialized, backstory, onUpdate]);

  const stats = calculateTextStats(localValue);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              História do Personagem
            </Typography>
          </Box>

          {/* Status de Salvamento */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSaving ? (
              <Chip
                label="Salvando..."
                size="small"
                color="info"
                variant="outlined"
              />
            ) : lastSaved ? (
              <Tooltip
                title={`Salvo em ${lastSaved.toLocaleTimeString()}`}
                arrow
              >
                <Chip
                  icon={<SavedIcon />}
                  label="Salvo"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
            ) : null}
          </Box>
        </Box>

        {/* Editor de Texto */}
        <TextField
          label="Background e História"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Escreva a história completa do seu personagem aqui...

Você pode incluir:
- Origem e infância
- Eventos marcantes
- Motivações e objetivos
- Relacionamentos importantes
- Como se tornou um aventureiro

Dica: Use linhas em branco para separar parágrafos e tornar a leitura mais agradável."
          fullWidth
          multiline
          minRows={12}
          maxRows={30}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: '1rem',
              lineHeight: 1.7,
            },
            '& .MuiInputBase-input': {
              '&::placeholder': {
                opacity: 0.6,
                fontStyle: 'italic',
              },
            },
          }}
        />

        {/* Estatísticas e Ajuda */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Contador de Palavras/Caracteres */}
          <Stack direction="row" spacing={2}>
            <Chip
              label={`${stats.words} palavra${stats.words !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${stats.chars} caractere${stats.chars !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${stats.lines} linha${stats.lines !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
          </Stack>

          {/* Dicas de Formatação */}
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" fontWeight={700} gutterBottom>
                  Dicas de Formatação:
                </Typography>
                <Typography variant="caption" component="div">
                  • Use linhas em branco para separar parágrafos
                </Typography>
                <Typography variant="caption" component="div">
                  • Mantenha parágrafos curtos para melhor leitura
                </Typography>
                <Typography variant="caption" component="div">
                  • Seja específico sobre momentos importantes
                </Typography>
                <Typography variant="caption" component="div">
                  • Conecte a história aos objetivos atuais
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <IconButton size="small" color="default">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Guia Rápido */}
        {stats.words === 0 && (
          <Paper
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: 1,
              borderColor: alpha(theme.palette.info.main, 0.2),
              borderRadius: 2,
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon color="info" fontSize="small" />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="info.main"
                >
                  Como escrever uma boa história:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                1. <strong>Onde nasceu?</strong> Descreva o local e ambiente da
                infância
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. <strong>Eventos marcantes:</strong> Momentos que moldaram
                quem é hoje
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. <strong>Por que aventura?</strong> O que motivou a sair pelo
                mundo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. <strong>Laços importantes:</strong> Família, amigos,
                mentores, inimigos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                5. <strong>Objetivos:</strong> O que busca alcançar ou descobrir
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
