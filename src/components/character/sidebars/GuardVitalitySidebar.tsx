/**
 * GuardVitalitySidebar - Sidebar de detalhes de Guarda (GA) e Vitalidade (PV)
 *
 * v0.0.2: Substitui a antiga HPDetailSidebar.
 * Embed o GuardVitalityDisplay completo dentro de uma Sidebar.
 */
'use client';

import React from 'react';
import { Box, Typography, Stack, Chip, Divider, Alert } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import { Sidebar } from '@/components/shared';
import { GuardVitalityDisplay } from '@/components/character/stats/GuardVitalityDisplay';
import type { GuardPoints, VitalityPoints } from '@/types/combat';
import { PV_RECOVERY_COST } from '@/types/combat';

export interface GuardVitalitySidebarProps {
  /** Se a sidebar está aberta */
  open: boolean;
  /** Callback para fechar a sidebar */
  onClose: () => void;
  /** Pontos de Guarda */
  guard: GuardPoints;
  /** Pontos de Vitalidade */
  vitality: VitalityPoints;
  /** Callback para atualizar GA e PV */
  onChange: (guard: GuardPoints, vitality: VitalityPoints) => void;
}

/**
 * Sidebar que exibe e permite editar os valores de Guarda e Vitalidade.
 */
export const GuardVitalitySidebar: React.FC<GuardVitalitySidebarProps> =
  React.memo(function GuardVitalitySidebar({
    open,
    onClose,
    guard,
    vitality,
    onChange,
  }) {
    return (
      <Sidebar
        open={open}
        onClose={onClose}
        title="Guarda & Vitalidade"
        width="lg"
      >
        <Stack spacing={3}>
          {/* Componente completo de GA/PV com Sofrer/Recuperar */}
          <GuardVitalityDisplay
            guard={guard}
            vitality={vitality}
            onChange={onChange}
          />

          <Divider />

          {/* Referência rápida de regras */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Referência de Regras
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <ShieldIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Guarda (GA)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Proteção ativa. Base 15 + bônus de arquétipo por nível. Dano
                    atinge GA primeiro. Quando GA = 0, GA máx é reduzida pela
                    metade enquanto PV ≤ 1.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <FavoriteIcon color="error" fontSize="small" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Vitalidade (PV)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saúde real. Calculado como ⌊GA_max ÷ 3⌋. Quando dano excede
                    GA, o excedente vai para PV. PV = 0 causa Ferimento Crítico.
                  </Typography>
                </Box>
              </Stack>

              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
                <Typography variant="caption">
                  <strong>Recuperação de PV:</strong> A cada {PV_RECOVERY_COST}{' '}
                  pontos de recuperação gastos, 1 PV é restaurado. GA se
                  recupera normalmente com descanso.
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </Sidebar>
    );
  });

export default GuardVitalitySidebar;
