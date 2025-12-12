'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Stack,
  TextField,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  calculateRestRecovery,
  getQualityMultiplier,
  REST_QUALITY_LABELS,
  REST_QUALITY_DESCRIPTIONS,
  type RestQuality,
} from '@/utils/restCalculations';
import type { Character } from '@/types';

export interface RestCalculatorProps {
  character: Character;
  onApplyRecovery: (pvRecovery: number, ppRecovery: number) => void;
}

/**
 * Calculadora de Descanso
 *
 * Calcula recuperação de PV e PP durante descanso:
 * - Dormir: Recupera PV = Nível × Constituição × Qualidade
 * - Relaxar: Recupera PP = Nível × Presença × Qualidade
 *
 * Multiplicadores por qualidade:
 * - Precário: 0.5x
 * - Normal: 1x
 * - Confortável: 1.5x
 * - Abastado 1-5: 2.5x, 3x, 3.5x, 4x, 4.5x
 */
export function RestCalculator({
  character,
  onApplyRecovery,
}: RestCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quality, setQuality] = useState<RestQuality>('normal');
  const [useSleep, setUseSleep] = useState(true);
  const [useMeditate, setUseMeditate] = useState(true);
  const [sleepModifiers, setSleepModifiers] = useState(0);
  const [meditateModifiers, setMeditateModifiers] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const level = character.level;
  const constitution = character.attributes.constituicao;
  const presenca = character.attributes.presenca;

  const recovery = useMemo(
    () =>
      calculateRestRecovery(
        level,
        constitution,
        presenca,
        quality,
        useSleep,
        useMeditate,
        sleepModifiers,
        meditateModifiers
      ),
    [
      level,
      constitution,
      presenca,
      quality,
      useSleep,
      useMeditate,
      sleepModifiers,
      meditateModifiers,
    ]
  );

  const handleApply = () => {
    onApplyRecovery(recovery.pvRecovery, recovery.ppRecovery);
  };

  const canRecover = useSleep || useMeditate;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <HotelIcon /> Descanso
        </Typography>
        <IconButton size="small">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Card variant="outlined">
          <CardContent>
            {/* Informações sobre o cálculo */}
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                startIcon={<InfoOutlinedIcon />}
                onClick={() => setShowInfo(!showInfo)}
                sx={{ mb: 1 }}
              >
                {showInfo ? 'Ocultar' : 'Mostrar'} Informações
              </Button>

              <Collapse in={showInfo}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Como funciona o descanso:</strong>
                  </Typography>
                  <Typography variant="body2" component="div">
                    <strong>Dormir (Recupera PV):</strong>
                    <br />• Cálculo: Nível × Constituição × Multiplicador
                    <br />• Exemplo atual: {level} × {constitution} ×{' '}
                    {recovery.multiplier} = {recovery.pvRecovery} PV
                    <br />
                    <br />
                    <strong>Relaxar (Recupera PP):</strong>
                    <br />• Cálculo: Nível × Presença × Multiplicador
                    <br />• Exemplo atual: {level} × {presenca} ×{' '}
                    {recovery.multiplier} = {recovery.ppRecovery} PP
                    <br />
                    <br />
                    <em>
                      Ambos os valores são arredondados para baixo. A qualidade
                      do descanso multiplica as recuperações.
                    </em>
                  </Typography>
                </Alert>
              </Collapse>
            </Box>

            <Stack spacing={3}>
              {/* Tipo de Descanso */}
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Tipo de Descanso
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useSleep}
                        onChange={(e) => setUseSleep(e.target.checked)}
                        icon={<HotelIcon />}
                        checkedIcon={<HotelIcon />}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          <strong>Dormir</strong> (Recupera PV)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Base: {level} × {constitution} ={' '}
                          {level * constitution}
                          {sleepModifiers !== 0 &&
                            ` (${sleepModifiers >= 0 ? '+' : ''}${sleepModifiers})`}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useMeditate}
                        onChange={(e) => setUseMeditate(e.target.checked)}
                        icon={<SelfImprovementIcon />}
                        checkedIcon={<SelfImprovementIcon />}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          <strong>Relaxar/Meditar</strong> (Recupera PP)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Base: {level} × {presenca} = {level * presenca}
                          {meditateModifiers !== 0 &&
                            ` (${meditateModifiers >= 0 ? '+' : ''}${meditateModifiers})`}
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Modificadores */}
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Modificadores Adicionais
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    type="number"
                    size="small"
                    label="Modificador de Dormir"
                    value={sleepModifiers}
                    onChange={(e) => setSleepModifiers(Number(e.target.value))}
                    disabled={!useSleep}
                    helperText="Bônus ou penalidades ao dormir"
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="Modificador de Relaxar"
                    value={meditateModifiers}
                    onChange={(e) =>
                      setMeditateModifiers(Number(e.target.value))
                    }
                    disabled={!useMeditate}
                    helperText="Bônus ou penalidades ao relaxar"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Qualidade do Descanso */}
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Qualidade do Descanso</InputLabel>
                  <Select
                    value={quality}
                    label="Qualidade do Descanso"
                    onChange={(e) => setQuality(e.target.value as RestQuality)}
                  >
                    {(Object.keys(REST_QUALITY_LABELS) as RestQuality[]).map(
                      (q) => (
                        <MenuItem key={q} value={q}>
                          <Box>
                            <Typography variant="body2">
                              {REST_QUALITY_LABELS[q]} (×
                              {getQualityMultiplier(q)})
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {REST_QUALITY_DESCRIPTIONS[q]}
                            </Typography>
                          </Box>
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              {/* Resultado */}
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderRadius: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Recuperação Calculada
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="error.main">
                      Recuperação de PV (Dormir):
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'error.main' }}
                    >
                      +{recovery.pvRecovery}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {recovery.sleepBase} × {recovery.multiplier} ={' '}
                    {recovery.pvRecovery}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="info.main">
                      Recuperação de PP (Relaxar):
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'info.main' }}
                    >
                      +{recovery.ppRecovery}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {recovery.meditateBase} × {recovery.multiplier} ={' '}
                    {recovery.ppRecovery}
                  </Typography>
                </Stack>
              </Box>

              {/* Botão de Aplicar */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleApply}
                disabled={
                  !canRecover ||
                  (recovery.pvRecovery === 0 && recovery.ppRecovery === 0)
                }
                startIcon={<RefreshIcon />}
              >
                Aplicar Recuperação
              </Button>

              {!canRecover && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    Selecione pelo menos um tipo de descanso (Dormir ou Relaxar)
                    para recuperar PV e PP.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}
