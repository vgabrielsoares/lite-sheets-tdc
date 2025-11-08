/**
 * Spells - Tipos relacionados a feitiços e magia
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de feitiços
 * e conjuração do Tabuleiro do Caos RPG.
 */

import type { UUID, DiceRoll, DamageType, Duration, RangeType } from './common';
import type { SkillName } from './skills';

/**
 * Tipo de feitiço
 */
export type SpellType = 'arcano' | 'divino' | 'religioso';

/**
 * Matriz de feitiço
 */
export type SpellMatrix =
  | 'fogo'
  | 'agua'
  | 'terra'
  | 'ar'
  | 'luz'
  | 'trevas'
  | 'vida'
  | 'morte'
  | 'ordem'
  | 'caos'
  | 'tempo'
  | 'espaco';

/**
 * Escola de magia
 */
export type MagicSchool =
  | 'abjuracao'
  | 'adivinhacao'
  | 'conjuracao'
  | 'encantamento'
  | 'evocacao'
  | 'ilusao'
  | 'necromancia'
  | 'transmutacao';

/**
 * Componentes de feitiço
 */
export interface SpellComponents {
  /** Componente verbal (palavras) */
  verbal: boolean;
  /** Componente somático (gestos) */
  somatic: boolean;
  /** Componente material */
  material?: {
    /** Descrição do material */
    description: string;
    /** Se o material é consumido */
    consumed: boolean;
    /** Custo do material (em PO$) */
    cost?: number;
  };
}

/**
 * Área de efeito do feitiço
 */
export interface SpellArea {
  /** Tipo de área */
  type: 'cone' | 'cubo' | 'cilindro' | 'esfera' | 'linha' | 'unico';
  /** Tamanho/raio da área */
  size?: number;
  /** Descrição da área */
  description?: string;
}

/**
 * Feitiço
 */
export interface Spell {
  /** ID único do feitiço */
  id: UUID;
  /** Nome do feitiço */
  name: string;
  /** Descrição completa */
  description: string;
  /** Tipo de feitiço */
  type: SpellType;
  /** Escola de magia */
  school: MagicSchool;
  /** Matrizes associadas */
  matrices: SpellMatrix[];
  /** Custo em PP */
  ppCost: number;
  /** Alcance */
  range: RangeType;
  /** Área de efeito */
  area: SpellArea;
  /** Componentes necessários */
  components: SpellComponents;
  /** Duração */
  duration: Duration;
  /** Tempo de conjuração */
  castingTime: {
    /** Quantidade de ações/tempo */
    value: number;
    /** Unidade (ação, turno, minuto, etc.) */
    unit: 'acao' | 'reacao' | 'turno' | 'minuto' | 'hora';
  };
  /** Teste de resistência permitido */
  savingThrow?: {
    /** Tipo de teste */
    type: 'determinacao' | 'reflexo' | 'tenacidade' | 'vigor';
    /** Efeito em caso de sucesso */
    onSuccess: 'negates' | 'half' | 'partial';
  };
  /** Dano causado (se aplicável) */
  damage?: {
    /** Rolagem de dano */
    roll: DiceRoll;
    /** Tipo de dano */
    type: DamageType;
  };
  /** Cura fornecida (se aplicável) */
  healing?: DiceRoll;
  /** Se pode ser conjurado em nível superior */
  upcastable: boolean;
  /** Efeitos ao conjurar em nível superior */
  upcastEffect?: string;
  /** Se requer concentração */
  concentration: boolean;
  /** Se é um ritual */
  ritual: boolean;
}

/**
 * Feitiço conhecido pelo personagem
 */
export interface KnownSpell {
  /** Referência ao feitiço */
  spellId: UUID;
  /** Se o feitiço está preparado */
  prepared: boolean;
  /** Anotações do jogador sobre o feitiço */
  notes?: string;
}

/**
 * Habilidade de conjuração
 */
export interface SpellcastingAbility {
  /** Tipo de feitiço */
  spellType: SpellType;
  /** Habilidade usada para conjuração */
  skill: SkillName;
  /** ND dos feitiços (12 + Presença + Habilidade + Bônus) */
  spellDC: number;
  /** Bônus de ataque (Presença + Habilidade + Bônus) */
  spellAttackBonus: number;
  /** Modificadores adicionais ao ND */
  dcModifiers: number;
  /** Modificadores adicionais ao ataque */
  attackModifiers: number;
}

/**
 * Dados completos de conjuração do personagem
 */
export interface SpellcastingData {
  /** Feitiços conhecidos */
  knownSpells: KnownSpell[];
  /** Número máximo de feitiços conhecidos */
  maxKnownSpells: number;
  /** Modificadores ao número de feitiços conhecidos */
  knownSpellsModifiers: number;
  /** Habilidades de conjuração por tipo */
  spellcastingAbilities: SpellcastingAbility[];
  /** Matrizes dominadas */
  masteredMatrices: SpellMatrix[];
  /** Feitiços atualmente concentrando */
  concentratingOn: UUID[];
}

/**
 * ND base de feitiços
 */
export const BASE_SPELL_DC = 12;

/**
 * Habilidades padrão de conjuração por tipo
 */
export const DEFAULT_SPELLCASTING_SKILLS: Record<SpellType, SkillName> = {
  arcano: 'arcano',
  divino: 'religiao',
  religioso: 'religiao',
} as const;

/**
 * Custos base de PP por matriz de feitiço
 */
export const SPELL_MATRIX_BASE_COSTS: Record<SpellMatrix, number> = {
  fogo: 1,
  agua: 1,
  terra: 1,
  ar: 1,
  luz: 2,
  trevas: 2,
  vida: 3,
  morte: 3,
  ordem: 4,
  caos: 4,
  tempo: 5,
  espaco: 5,
} as const;
