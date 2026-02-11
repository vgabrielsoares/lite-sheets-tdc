'use client';

/**
 * LevelUpModal — Modal de subida de nível do personagem
 *
 * Permite ao jogador:
 * 1. Escolher o arquétipo para progredir
 * 2. Ver os ganhos automáticos (GA, PP, PV)
 * 3. Preencher ganhos especiais (poder/talento, competência, característica)
 * 4. Confirmar o level up
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import type { Character, ArchetypeName } from '@/types';
import { ARCHETYPE_LABELS } from '@/constants/archetypes';
import { canLevelUp } from '@/constants/progression';
import {
  previewLevelUpGains,
  type LevelUpSpecialGain,
  type LevelUpGainType,
} from '@/utils/levelUpCalculations';

// ─── Types ──────────────────────────────────────────────────

interface LevelUpModalProps {
  /** Se o modal está aberto */
  open: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Dados do personagem */
  character: Character;
  /** Callback para confirmar o level up */
  onConfirm: (
    archetypeName: ArchetypeName,
    specialGains: LevelUpSpecialGain[]
  ) => void;
}

/**
 * Todos os arquétipos disponíveis
 */
const ALL_ARCHETYPES: ArchetypeName[] = [
  'academico',
  'acolito',
  'combatente',
  'feiticeiro',
  'ladino',
  'natural',
];

/**
 * Cor de cada arquétipo para os chips
 */
const ARCHETYPE_CHIP_COLORS: Record<ArchetypeName, string> = {
  academico: '#5C6BC0',
  acolito: '#AB47BC',
  combatente: '#EF5350',
  feiticeiro: '#42A5F5',
  ladino: '#66BB6A',
  natural: '#8D6E63',
};

// ─── Component ──────────────────────────────────────────────

export default function LevelUpModal({
  open,
  onClose,
  character,
  onConfirm,
}: LevelUpModalProps) {
  const theme = useTheme();

  // State
  const [selectedArchetype, setSelectedArchetype] =
    useState<ArchetypeName | null>(null);
  const [specialGains, setSpecialGains] = useState<LevelUpSpecialGain[]>([]);

  // Preview dos ganhos
  const gains = useMemo(() => {
    if (!selectedArchetype) return null;
    return previewLevelUpGains(character, selectedArchetype);
  }, [character, selectedArchetype]);

  // Determinar quais ganhos especiais são necessários
  const requiredGainTypes = useMemo<LevelUpGainType[]>(() => {
    if (!gains) return [];
    const types: LevelUpGainType[] = [];
    if (gains.grantsArchetypeFeature) types.push('caracteristica');
    if (gains.grantsCompetence) types.push('competencia');
    if (gains.grantsPowerOrTalent) types.push('poder_ou_talento');
    return types;
  }, [gains]);

  // Inicializar ganhos especiais quando os tipos mudam
  React.useEffect(() => {
    setSpecialGains(
      requiredGainTypes.map((type) => ({
        type,
        name: '',
        description: '',
        effects: '',
      }))
    );
  }, [requiredGainTypes]);

  // Handlers
  const handleSelectArchetype = useCallback((archetype: ArchetypeName) => {
    setSelectedArchetype(archetype);
  }, []);

  const handleUpdateSpecialGain = useCallback(
    (index: number, field: keyof LevelUpSpecialGain, value: string) => {
      setSpecialGains((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!selectedArchetype) return;

    // Filtrar ganhos especiais com nome preenchido
    const filledGains = specialGains.filter(
      (gain) => gain.name.trim().length > 0
    );

    onConfirm(selectedArchetype, filledGains);
    handleReset();
  }, [selectedArchetype, specialGains, onConfirm]);

  const handleReset = useCallback(() => {
    setSelectedArchetype(null);
    setSpecialGains([]);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  // Validação: pode confirmar?
  const canConfirm = useMemo(() => {
    if (!selectedArchetype || !gains) return false;
    // Precisa ter XP suficiente
    if (!canLevelUp(character.experience.current, character.level))
      return false;
    // Todos os ganhos especiais obrigatórios devem ter pelo menos nome
    return specialGains.every((g) => g.name.trim().length > 0);
  }, [
    selectedArchetype,
    gains,
    specialGains,
    character.experience.current,
    character.level,
  ]);

  // Nível atual de cada arquétipo
  const archetypeLevels = useMemo(() => {
    const levels: Partial<Record<ArchetypeName, number>> = {};
    for (const a of character.archetypes) {
      levels[a.name] = a.level;
    }
    return levels;
  }, [character.archetypes]);

  // Labels para tipos de ganho
  const gainTypeLabels: Record<LevelUpGainType, string> = {
    poder_ou_talento: 'Poder de Arquétipo ou Talento',
    competencia: 'Competência',
    caracteristica: 'Característica de Arquétipo',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `2px solid ${theme.palette.warning.main}`,
        },
      }}
    >
      {/* Título */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 167, 38, 0.08)'
              : 'rgba(255, 167, 38, 0.04)',
        }}
      >
        <TrendingUpIcon color="warning" />
        <Typography variant="h6" component="span" fontWeight={700}>
          Subir de Nível
        </Typography>
        <Chip
          label={`Nível ${character.level} → ${character.level + 1}`}
          color="warning"
          size="small"
          sx={{ ml: 'auto', fontWeight: 700 }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Step 1: Escolher Arquétipo */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CategoryIcon fontSize="small" color="primary" />
              Escolha o Arquétipo para Progredir
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecione em qual arquétipo seu personagem irá ganhar um nível.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                gap: 1,
              }}
            >
              {ALL_ARCHETYPES.map((archetype) => {
                const level = archetypeLevels[archetype] ?? 0;
                const isSelected = selectedArchetype === archetype;
                return (
                  <Paper
                    key={archetype}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderColor: isSelected
                        ? ARCHETYPE_CHIP_COLORS[archetype]
                        : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      bgcolor: isSelected
                        ? `${ARCHETYPE_CHIP_COLORS[archetype]}15`
                        : 'transparent',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: ARCHETYPE_CHIP_COLORS[archetype],
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => handleSelectArchetype(archetype)}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 700 : 500}
                    >
                      {ARCHETYPE_LABELS[archetype]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nível {level} → {level + 1}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* Step 2: Preview dos Ganhos */}
          {gains && selectedArchetype && (
            <>
              <Divider />

              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <EmojiEventsIcon fontSize="small" color="warning" />
                  Ganhos Automáticos
                </Typography>

                <Stack spacing={1.5}>
                  {/* GA */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <ShieldIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Guarda (GA):</strong> {character.combat.guard.max}{' '}
                      → {gains.newGAMax} (+{gains.gaGained})
                    </Typography>
                  </Box>

                  {/* PP */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <FlashOnIcon color="info" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Pontos de Poder (PP):</strong>{' '}
                      {character.combat.pp.max} → {gains.newPPMax} (+
                      {gains.ppGained})
                    </Typography>
                  </Box>

                  {/* PV */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <FavoriteIcon color="error" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Vitalidade (PV):</strong>{' '}
                      {character.combat.vitality.max} → {gains.newPVMax}
                    </Typography>
                  </Box>

                  {/* XP */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="body2">
                      <strong>XP restante:</strong> {gains.remainingXP}
                    </Typography>
                  </Box>
                </Stack>

                {/* Alerta de Classes */}
                {gains.unlocksClasses && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Classes desbloqueadas!</strong> A partir do nível
                      3, seu personagem pode escolher uma Classe (combinação de
                      arquétipos).
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Step 3: Ganhos especiais (se houver) */}
              {requiredGainTypes.length > 0 && (
                <>
                  <Divider />

                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <AutoAwesomeIcon fontSize="small" color="secondary" />
                      Ganhos Especiais
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Preencha os ganhos especiais obtidos neste nível de
                      arquétipo.
                    </Typography>

                    <Stack spacing={3}>
                      {specialGains.map((gain, index) => (
                        <Paper
                          key={`${gain.type}-${index}`}
                          variant="outlined"
                          sx={{ p: 2 }}
                        >
                          <Chip
                            label={gainTypeLabels[gain.type]}
                            size="small"
                            color={
                              gain.type === 'competencia'
                                ? 'success'
                                : gain.type === 'caracteristica'
                                  ? 'primary'
                                  : 'secondary'
                            }
                            sx={{ mb: 2 }}
                          />

                          {/* Atalhos rápidos para talentos comuns */}
                          {gain.type === 'poder_ou_talento' && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mb: 0.5, display: 'block' }}
                              >
                                Atalhos rápidos:
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  label="Aumento de Atributo"
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  clickable
                                  onClick={() => {
                                    handleUpdateSpecialGain(
                                      index,
                                      'name',
                                      'Aumento de Atributo'
                                    );
                                    handleUpdateSpecialGain(
                                      index,
                                      'description',
                                      'Você pode aumentar dois atributos à sua escolha em 1, até o máximo de 5.'
                                    );
                                    handleUpdateSpecialGain(
                                      index,
                                      'effects',
                                      '+1 em dois atributos à escolha.'
                                    );
                                  }}
                                />
                                <Chip
                                  label="Proficiência com Habilidade"
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  clickable
                                  onClick={() => {
                                    handleUpdateSpecialGain(
                                      index,
                                      'name',
                                      'Proficiência com Habilidade'
                                    );
                                    handleUpdateSpecialGain(
                                      index,
                                      'description',
                                      'O personagem pode progredir o Grau de Habilidade de um número de habilidades igual a 5 + Mente. A partir do nível 4 é possível progredir de Adepto para Versado. A partir do nível 11, é possível progredir de Versado para Mestre.'
                                    );
                                    handleUpdateSpecialGain(
                                      index,
                                      'effects',
                                      'Aumenta o grau de proficiência em 5 + Mente habilidades.'
                                    );
                                  }}
                                />
                              </Stack>
                            </Box>
                          )}

                          <Stack spacing={2}>
                            <TextField
                              label="Nome"
                              value={gain.name}
                              onChange={(e) =>
                                handleUpdateSpecialGain(
                                  index,
                                  'name',
                                  e.target.value
                                )
                              }
                              size="small"
                              fullWidth
                              required
                              placeholder={`Nome do(a) ${gainTypeLabels[gain.type].toLowerCase()}`}
                            />

                            <TextField
                              label="Descrição"
                              value={gain.description}
                              onChange={(e) =>
                                handleUpdateSpecialGain(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Descreva o efeito"
                            />

                            <TextField
                              label="Efeitos Mecânicos (opcional)"
                              value={gain.effects || ''}
                              onChange={(e) =>
                                handleUpdateSpecialGain(
                                  index,
                                  'effects',
                                  e.target.value
                                )
                              }
                              size="small"
                              fullWidth
                              placeholder="Ex: +1d em testes de Percepção"
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

              {/* Info box */}
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  O XP excedente (<strong>{gains.remainingXP} XP</strong>) será
                  mantido após subir de nível.
                </Typography>
              </Alert>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={!canConfirm}
          startIcon={<TrendingUpIcon />}
        >
          Confirmar Level Up
        </Button>
      </DialogActions>
    </Dialog>
  );
}
