'use client';

import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { HealthPoints } from '@/types/combat';
import { applyDeltaToHP } from '@/utils/calculations';
import { CompactResourcePoints } from './CompactResourcePoints';
import type { ResourceConfig } from './CompactResourcePoints';

export interface CompactHealthPointsProps {
  hp: HealthPoints;
  onChange: (hp: HealthPoints) => void;
  onOpenDetails?: () => void;
}

/**
 * Configuração específica para PV (Pontos de Vida)
 */
const HP_CONFIG: ResourceConfig = {
  Icon: FavoriteIcon,
  iconColor: 'error',
  label: 'PV',
  progressColor: 'error',
  temporaryColor: '#ff6b6bdd', // Vermelho médio e saturado para PV temporários (visível em tema claro)
  adjustValues: {
    small: 1,
    large: 5,
  },
  buttonLabels: {
    decreaseSmall: 'Sofrer 1 de dano',
    decreaseLarge: 'Sofrer 5 de dano',
    increaseSmall: 'Curar 1 PV',
    increaseLarge: 'Curar 5 PV',
  },
};

/**
 * CompactHealthPoints - Exibição compacta de Pontos de Vida
 *
 * Componente especializado para PV que usa o CompactResourcePoints genérico.
 * Características específicas de PV:
 * - Dano subtrai primeiro de PV temporários, depois de PV atuais
 * - Cura adiciona apenas aos PV atuais
 * - Valores de ajuste: ±1 e ±5
 *
 * @example
 * ```tsx
 * <CompactHealthPoints
 *   hp={character.combat.hp}
 *   onChange={(hp) => updateCharacter({ combat: { ...combat, hp } })}
 *   onOpenDetails={() => openHPSidebar()}
 * />
 * ```
 */
export function CompactHealthPoints({
  hp,
  onChange,
  onOpenDetails,
}: CompactHealthPointsProps) {
  return (
    <CompactResourcePoints
      resource={hp}
      config={HP_CONFIG}
      onChange={onChange}
      onOpenDetails={onOpenDetails}
      applyDelta={applyDeltaToHP}
    />
  );
}

export default CompactHealthPoints;
