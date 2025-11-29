'use client';

import React from 'react';
import BoltIcon from '@mui/icons-material/Bolt';
import type { PowerPoints } from '@/types/combat';
import { CompactResourcePoints } from './CompactResourcePoints';
import type { ResourceConfig } from './CompactResourcePoints';
import { applyDeltaToPP } from '@/utils';

export interface CompactPowerPointsProps {
  pp: PowerPoints;
  onChange: (pp: PowerPoints) => void;
  onOpenDetails?: () => void;
}

/**
 * Configuração específica para PP (Pontos de Poder)
 */
const PP_CONFIG: ResourceConfig = {
  Icon: BoltIcon,
  iconColor: 'info',
  label: 'PP',
  progressColor: 'info',
  temporaryColor: '#4dabf7dd', // Azul médio e saturado para PP temporários (visível em tema claro)
  adjustValues: {
    small: 1,
    large: 2,
  },
  buttonLabels: {
    decreaseSmall: 'Gastar 1 PP',
    decreaseLarge: 'Gastar 2 PP',
    increaseSmall: 'Recuperar 1 PP',
    increaseLarge: 'Recuperar 2 PP',
  },
};

/**
 * CompactPowerPoints - Exibição compacta de Pontos de Poder
 *
 * Componente especializado para PP que usa o CompactResourcePoints genérico.
 * Características específicas de PP:
 * - Gasto subtrai de PP temporários primeiro, depois dos atuais (usa applyDeltaToPP)
 * - Recuperação adiciona aos PP atuais
 * - Valores de ajuste: ±1 e ±2
 *
 * @example
 * ```tsx
 * <CompactPowerPoints
 *   pp={character.combat.pp}
 *   onChange={(pp) => updateCharacter({ combat: { ...combat, pp } })}
 *   onOpenDetails={() => openPPSidebar()}
 * />
 * ```
 */
export function CompactPowerPoints({
  pp,
  onChange,
  onOpenDetails,
}: CompactPowerPointsProps) {
  return (
    <CompactResourcePoints
      resource={pp}
      config={PP_CONFIG}
      onChange={onChange}
      onOpenDetails={onOpenDetails}
      applyDelta={applyDeltaToPP} // PP usa mesma lógica de PV: subtrai de temporários primeiro
    />
  );
}

export default CompactPowerPoints;
