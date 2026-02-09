/**
 * Spells - Tipos relacionados a feitiços e magia
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de feitiços
 * e conjuração do Tabuleiro do Caos RPG.
 */

import type { UUID } from './common';
import type { SkillName } from './skills';

/**
 * Círculo de feitiço (1º ao 8º)
 */
export type SpellCircle = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Tipo de feitiço (baseado na habilidade de conjuração)
 */
export type SpellType = 'arcano' | 'natureza' | 'religiao';

/**
 * Matriz de feitiço
 */
export type SpellMatrix =
  | 'arcana'
  | 'adiafana'
  | 'gnomica'
  | 'mundana'
  | 'natural'
  | 'elfica'
  | 'ana'
  | 'primordial'
  | 'luzidia'
  | 'infernal';

/**
 * Classes de feitiço (15 tipos)
 */
export type SpellClass =
  | 'abjuracao'
  | 'divinacao'
  | 'elemental'
  | 'encantamento'
  | 'evocacao'
  | 'ilusao'
  | 'invocacao'
  | 'manipulacao'
  | 'mistica'
  | 'natural'
  | 'necromancia'
  | 'profana'
  | 'sagrada'
  | 'translocacao'
  | 'transmutacao';

/**
 * Componente de feitiço
 */
export type SpellComponent = 'somatico' | 'verbal' | 'material' | 'circular';

/**
 * Feitiço completo
 */
export interface Spell {
  /** ID único do feitiço */
  id: UUID;
  /** Nome do feitiço */
  name: string;
  /** Círculo do feitiço (1º ao 8º) */
  circle: SpellCircle;
  /** Tipo de feitiço (arcano, natureza ou religião) */
  type: SpellType;
  /** Matriz do feitiço */
  matrix: SpellMatrix;
  /** Resistência permitida (se houver, ex: "Reflexo") */
  resistance?: string;
  /** Tempo de conjuração (ex: "1 ação", "1 turno") */
  castingTime: string;
  /** Alcance (ex: "Toque", "Curto", "30m") */
  range: string;
  /** Alvo/Área (ex: "1 criatura", "Esfera 6m") */
  target: string;
  /** Componentes necessários */
  components: SpellComponent[];
  /** Duração (ex: "Instantâneo", "1 rodada", "Concentração, até 1 minuto") */
  duration: string;
  /** Classes de feitiço */
  classes: SpellClass[];
  /** Descrição completa do feitiço */
  description: string;
  /** Aprimoramentos do feitiço (texto descritivo) */
  enhancements?: string;
  /** Elevação do feitiço (texto descritivo) */
  escalation?: string;
  /** Anotações personalizadas */
  notes?: string;
}

/**
 * Feitiço conhecido pelo personagem
 */
export interface KnownSpell {
  /** Referência ao feitiço (pode ser ID ou objeto completo) */
  spellId: UUID;
  /** Círculo do feitiço (para facilitar agrupamento) */
  circle: SpellCircle;
  /** Nome do feitiço (para exibição rápida) */
  name: string;
  /** Matriz do feitiço */
  matrix: SpellMatrix;
  /** Habilidade de conjuração usada */
  spellcastingSkill: SkillName;
  /** Anotações personalizadas do jogador */
  notes?: string;
  /** Tags para organização */
  tags?: string[];
}

/**
 * Habilidades que podem ser usadas para conjuração
 * Expandido além do trio clássico (Arcano, Natureza, Religião)
 */
export type SpellcastingSkillName =
  | 'arcano'
  | 'arte'
  | 'natureza'
  | 'performance'
  | 'religiao'
  | 'vigor';

/**
 * Habilidade de conjuração cadastrada do personagem
 */
export interface SpellcastingAbility {
  /** ID único da habilidade de conjuração */
  id: string;
  /** Habilidade usada para conjuração */
  skill: SpellcastingSkillName;
  /** Atributo usado para cálculos (padrão: Essência) */
  attribute: 'essencia' | 'influencia' | 'corpo' | 'instinto';
  /** Modificador especial adicional ao ND */
  dcBonus: number;
  /** Modificador especial adicional ao bônus de ataque */
  attackBonus: number;
}

/**
 * Dados completos de conjuração do personagem
 */
export interface SpellcastingData {
  /** Feitiços conhecidos */
  knownSpells: KnownSpell[];
  /** Número máximo de feitiços conhecidos (base) */
  maxKnownSpells: number;
  /** Modificadores ao número de feitiços conhecidos */
  knownSpellsModifiers: number;
  /** Habilidades de conjuração cadastradas */
  spellcastingAbilities: SpellcastingAbility[];
  /** Matrizes dominadas pelo personagem */
  masteredMatrices: SpellMatrix[];
}

/**
 * ND base de feitiços (constante do sistema)
 */
export const BASE_SPELL_DC = 12;

/**
 * Habilidades padrão de conjuração por tipo de feitiço
 */
export const DEFAULT_SPELLCASTING_SKILLS: Record<SpellType, SkillName> = {
  arcano: 'arcano',
  natureza: 'natureza',
  religiao: 'religiao',
} as const;
