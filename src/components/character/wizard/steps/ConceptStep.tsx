/**
 * ConceptStep - Passo 1: Conceito do Personagem
 *
 * Campos:
 * - Nome do personagem (obrigatório)
 * - Nome do jogador (opcional)
 * - "Você é/foi..." (opcional)
 * - "por/de/a..." (opcional)
 * - "Também é..." (opcional)
 * - "e quer..." (opcional)
 *
 * O sistema monta automaticamente o conceito como frase única.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import type { WizardStepProps } from '../CharacterCreationWizard';

/**
 * Monta a frase de conceito a partir das partes
 */
function buildConceptPhrase(
  youAre?: string,
  byFrom?: string,
  alsoIs?: string,
  andWants?: string
): string {
  const parts: string[] = [];

  if (youAre?.trim()) {
    parts.push(`Você é/foi ${youAre.trim()}`);
  }
  if (byFrom?.trim()) {
    // Se já tem "Você é/foi", adiciona como complemento
    if (parts.length > 0) {
      parts[parts.length - 1] += ` ${byFrom.trim()}`;
    } else {
      parts.push(byFrom.trim());
    }
  }
  if (alsoIs?.trim()) {
    parts.push(`Também é ${alsoIs.trim()}`);
  }
  if (andWants?.trim()) {
    parts.push(`e quer ${andWants.trim()}`);
  }

  return parts.join('. ').concat(parts.length > 0 ? '.' : '');
}

/**
 * Componente para o passo de conceito do personagem
 */
export default function ConceptStep({ wizard }: WizardStepProps) {
  const { state, updateNestedState } = wizard;
  const { concept } = state;

  // Verificar se nome está preenchido (validação visual)
  const isNameEmpty = !concept.characterName.trim();

  // Montar frase de conceito em tempo real
  const conceptPhrase = useMemo(
    () =>
      buildConceptPhrase(
        concept.youAre,
        concept.byFrom,
        concept.alsoIs,
        concept.andWants
      ),
    [concept.youAre, concept.byFrom, concept.alsoIs, concept.andWants]
  );

  // Handler genérico para atualizar campos do conceito
  const handleFieldChange = useCallback(
    (field: keyof typeof concept) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateNestedState('concept', { [field]: event.target.value });
      },
    [updateNestedState]
  );

  return (
    <Stack spacing={3}>
      {/* Seção: Identificação */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" color="text.primary">
            Identificação
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          {/* Nome do Personagem (obrigatório) */}
          <TextField
            label="Nome do Personagem"
            value={concept.characterName}
            onChange={handleFieldChange('characterName')}
            fullWidth
            required
            placeholder="Ex: Korvak, o Errante"
            error={isNameEmpty}
            helperText={
              isNameEmpty
                ? 'O nome do personagem é obrigatório para criar a ficha'
                : undefined
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'warning.main',
                },
              },
              '& .MuiFormHelperText-root.Mui-error': {
                color: 'warning.main',
              },
            }}
            inputProps={{
              'aria-label': 'Nome do personagem',
            }}
          />

          {/* Nome do Jogador (opcional) */}
          <TextField
            label="Nome do Jogador"
            value={concept.playerName || ''}
            onChange={handleFieldChange('playerName')}
            fullWidth
            placeholder="Seu nome (opcional)"
            inputProps={{
              'aria-label': 'Nome do jogador',
            }}
          />
        </Stack>
      </Paper>

      {/* Seção: Conceito */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FormatQuoteIcon color="secondary" />
          <Typography variant="h6" color="text.primary">
            Conceito do Personagem
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Descreva seu personagem em uma frase, preenchendo os campos abaixo.
          Todos são opcionais.
        </Typography>

        <Stack spacing={2}>
          {/* Linha 1: "Você é/foi..." */}
          <TextField
            label="Você é/foi..."
            value={concept.youAre || ''}
            onChange={handleFieldChange('youAre')}
            fullWidth
            placeholder="Ex: um explorador, um soldado desertor, um mago aprendiz"
            size="small"
            inputProps={{
              'aria-label': 'Você é ou foi',
            }}
          />

          {/* Linha 2: "por/a/de..." */}
          <TextField
            label="por/a/de..."
            value={concept.byFrom || ''}
            onChange={handleFieldChange('byFrom')}
            fullWidth
            placeholder="Ex: de terras distantes, por uma profecia, a um antigo mestre"
            size="small"
            inputProps={{
              'aria-label': 'por, a, ou de',
            }}
          />

          {/* Linha 3: "Também é..." */}
          <TextField
            label="Também é..."
            value={concept.alsoIs || ''}
            onChange={handleFieldChange('alsoIs')}
            fullWidth
            placeholder="Ex: curioso, cauteloso, honrado"
            size="small"
            inputProps={{
              'aria-label': 'Também é',
            }}
          />

          {/* Linha 4: "e quer..." */}
          <TextField
            label="e quer..."
            value={concept.andWants || ''}
            onChange={handleFieldChange('andWants')}
            fullWidth
            placeholder="Ex: encontrar sua família, dominar a magia antiga, vingar-se"
            size="small"
            inputProps={{
              'aria-label': 'e quer',
            }}
          />
        </Stack>
      </Paper>

      {/* Preview do Conceito */}
      {conceptPhrase && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'action.hover',
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            color="primary"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Preview do Conceito
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ fontStyle: 'italic' }}
          >
            &ldquo;{conceptPhrase}&rdquo;
          </Typography>
        </Paper>
      )}

      {/* Dica */}
      <Alert severity="info" variant="outlined">
        <Typography variant="body2">
          <strong>Dica:</strong> Não se preocupe em preencher tudo agora. Você
          pode editar o conceito a qualquer momento após criar o personagem.
        </Typography>
      </Alert>
    </Stack>
  );
}
