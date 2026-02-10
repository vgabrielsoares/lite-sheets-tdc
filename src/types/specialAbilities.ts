/**
 * Special Abilities - Tipos para habilidades especiais do personagem
 *
 * Habilidades especiais podem vir de diversas fontes:
 * - Origem
 * - Linhagem
 * - Arquétipo (Características de Arquétipo)
 * - Classe (Habilidades de Classe)
 * - Poderes de Arquétipo
 * - Talentos
 * - Competências
 * - Outros (customizados)
 */

import type { UUID } from './common';

/**
 * Fonte de uma habilidade especial
 */
export type SpecialAbilitySource =
  | 'origem'
  | 'linhagem'
  | 'arquetipo'
  | 'classe'
  | 'poder'
  | 'talento'
  | 'competencia'
  | 'outro';

/**
 * Labels em português para cada fonte
 */
export const SPECIAL_ABILITY_SOURCE_LABELS: Record<
  SpecialAbilitySource,
  string
> = {
  origem: 'Origem',
  linhagem: 'Linhagem',
  arquetipo: 'Arquétipo',
  classe: 'Classe',
  poder: 'Poder de Arquétipo',
  talento: 'Talento',
  competencia: 'Competência',
  outro: 'Outro',
} as const;

/**
 * Habilidade especial do personagem
 */
export interface SpecialAbility {
  /** ID único da habilidade */
  id: UUID;
  /** Nome da habilidade especial */
  name: string;
  /** Descrição detalhada */
  description: string;
  /** Efeitos mecânicos (opcional) */
  effects?: string;
  /** Fonte da habilidade */
  source: SpecialAbilitySource;
  /** Nome específico da fonte (ex: "Combatente", "Humano", "Soldado") */
  sourceName?: string;
  /** Nível em que foi ganha (se aplicável) */
  levelGained?: number;
}
