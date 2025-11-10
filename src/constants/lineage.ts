/**
 * Lineage Constants - Constantes relacionadas a linhagens
 *
 * Este arquivo contém todas as constantes e modificadores relacionados
 * às linhagens dos personagens, incluindo tamanhos, visão, deslocamento, etc.
 */

import type {
  CreatureSize,
  VisionType,
  SenseType,
  MovementType,
} from '@/types/common';

/**
 * Descrições dos tamanhos de criaturas
 */
export const SIZE_DESCRIPTIONS: Record<CreatureSize, string> = {
  minusculo:
    'Criaturas minúsculas são extremamente pequenas, como fadas ou sprites.',
  pequeno:
    'Criaturas pequenas incluem halflings, goblins e crianças humanoides.',
  medio: 'Tamanho padrão para a maioria dos humanoides adultos.',
  grande:
    'Criaturas grandes incluem ogros, cavalos e outras criaturas imponentes.',
  enorme: 'Criaturas enormes são massivas, como gigantes e dragões jovens.',
  colossal: 'Criaturas colossais são titânicas, preenchendo espaços imensos.',
} as const;

/**
 * Modificadores aplicados pelo tamanho da criatura
 */
export interface SizeModifiers {
  /** Alcance (em metros) */
  reach: number;
  /** Modificador de dano corpo-a-corpo */
  meleeDamage: number;
  /** Modificador de defesa */
  defense: number;
  /** Quadrados ocupados (em metros) */
  squaresOccupied: number;
  /** Modificador de peso carregável (multiplicador) */
  carryingCapacity: number;
  /** Modificador de manobras de combate */
  combatManeuvers: number;
  /** Modificador de ND de rastreio */
  trackingDC: number;
  /** Modificadores de habilidades específicas */
  skillModifiers: {
    acrobacia: number;
    atletismo: number;
    furtividade: number;
    reflexos: number;
    tenacidade: number;
  };
}

/**
 * Tabela completa de modificadores por tamanho
 * Baseado nas regras do sistema Tabuleiro do Caos RPG
 */
export const SIZE_MODIFIERS: Record<CreatureSize, SizeModifiers> = {
  minusculo: {
    reach: 0,
    meleeDamage: -4,
    defense: 4,
    squaresOccupied: 0.75,
    carryingCapacity: 0.25,
    combatManeuvers: -4,
    trackingDC: 8,
    skillModifiers: {
      acrobacia: 4,
      atletismo: -4,
      furtividade: 8,
      reflexos: 4,
      tenacidade: -4,
    },
  },
  pequeno: {
    reach: 1,
    meleeDamage: -2,
    defense: 2,
    squaresOccupied: 1,
    carryingCapacity: 0.5,
    combatManeuvers: -2,
    trackingDC: 4,
    skillModifiers: {
      acrobacia: 2,
      atletismo: -2,
      furtividade: 4,
      reflexos: 2,
      tenacidade: -2,
    },
  },
  medio: {
    reach: 1,
    meleeDamage: 0,
    defense: 0,
    squaresOccupied: 1,
    carryingCapacity: 1,
    combatManeuvers: 0,
    trackingDC: 0,
    skillModifiers: {
      acrobacia: 0,
      atletismo: 0,
      furtividade: 0,
      reflexos: 0,
      tenacidade: 0,
    },
  },
  grande: {
    reach: 2,
    meleeDamage: 2,
    defense: -2,
    squaresOccupied: 2,
    carryingCapacity: 2,
    combatManeuvers: 2,
    trackingDC: -4,
    skillModifiers: {
      acrobacia: -2,
      atletismo: 2,
      furtividade: -4,
      reflexos: -2,
      tenacidade: 2,
    },
  },
  enorme: {
    reach: 3,
    meleeDamage: 4,
    defense: -4,
    squaresOccupied: 3,
    carryingCapacity: 4,
    combatManeuvers: 4,
    trackingDC: -8,
    skillModifiers: {
      acrobacia: -4,
      atletismo: 4,
      furtividade: -8,
      reflexos: -4,
      tenacidade: 4,
    },
  },
  colossal: {
    reach: 6,
    meleeDamage: 8,
    defense: -8,
    squaresOccupied: 6,
    carryingCapacity: 8,
    combatManeuvers: 8,
    trackingDC: -16,
    skillModifiers: {
      acrobacia: -8,
      atletismo: 8,
      furtividade: -16,
      reflexos: -8,
      tenacidade: 8,
    },
  },
} as const;

/**
 * Descrições dos tipos de visão
 */
export const VISION_DESCRIPTIONS: Record<VisionType, string> = {
  normal: 'Visão normal, funciona apenas com luz adequada.',
  penumbra:
    'Visão na penumbra permite enxergar em condições de pouca luz como se fosse luz plena.',
  escuro:
    'Visão no escuro permite enxergar na escuridão total em preto e branco até certo alcance.',
} as const;

/**
 * Alcance padrão para cada tipo de visão (em metros)
 */
export const VISION_RANGES: Record<VisionType, number> = {
  normal: 0,
  penumbra: 18, // 18 metros é o padrão
  escuro: 18, // 18 metros é o padrão
} as const;

/**
 * Descrições dos sentidos aguçados
 */
export const KEEN_SENSE_DESCRIPTIONS: Record<SenseType, string> = {
  visao:
    'Visão aguçada concede vantagem em testes de Percepção que dependem da visão.',
  olfato:
    'Olfato aguçado concede vantagem em testes de Percepção que dependem do olfato (Farejar).',
  audicao:
    'Audição aguçada concede vantagem em testes de Percepção que dependem da audição (Ouvir).',
} as const;

/**
 * Modificadores de percepção para sentidos aguçados
 * Aplicados aos usos específicos da habilidade Percepção
 */
export const KEEN_SENSE_MODIFIERS: Record<SenseType, number> = {
  visao: 5, // +5 em testes de Observar
  olfato: 5, // +5 em testes de Farejar
  audicao: 5, // +5 em testes de Ouvir
} as const;

/**
 * Descrições dos tipos de deslocamento
 */
export const MOVEMENT_TYPE_DESCRIPTIONS: Record<MovementType, string> = {
  andando: 'Deslocamento padrão a pé.',
  voando: 'Capacidade de voar, seja por asas, magia ou outros meios.',
  escalando:
    'Velocidade de escalada, permite escalar superfícies sem penalidades.',
  escavando: 'Capacidade de escavar túneis através de terreno.',
  nadando: 'Velocidade de natação, permite nadar sem penalidades.',
} as const;

/**
 * Deslocamento padrão por tipo (em metros)
 * Usado quando uma linhagem não especifica um valor diferente
 */
export const DEFAULT_MOVEMENT_SPEEDS: Record<MovementType, number> = {
  andando: 9, // 9 metros é o padrão para humanoides médios
  voando: 0, // A maioria das criaturas não voa
  escalando: 0, // A maioria das criaturas não tem velocidade de escalada
  escavando: 0, // A maioria das criaturas não escava
  nadando: 0, // A maioria das criaturas não tem velocidade de natação especial
} as const;

/**
 * Lista de todos os tamanhos disponíveis
 */
export const CREATURE_SIZES: readonly CreatureSize[] = [
  'minusculo',
  'pequeno',
  'medio',
  'grande',
  'enorme',
  'colossal',
] as const;

/**
 * Lista de todos os tipos de visão disponíveis
 */
export const VISION_TYPES: readonly VisionType[] = [
  'normal',
  'penumbra',
  'escuro',
] as const;

/**
 * Lista de todos os tipos de sentido aguçado disponíveis
 */
export const SENSE_TYPES: readonly SenseType[] = [
  'visao',
  'olfato',
  'audicao',
] as const;

/**
 * Lista de todos os tipos de deslocamento disponíveis
 */
export const MOVEMENT_TYPES: readonly MovementType[] = [
  'andando',
  'voando',
  'escalando',
  'escavando',
  'nadando',
] as const;

/**
 * Labels em português para os tamanhos
 */
export const SIZE_LABELS: Record<CreatureSize, string> = {
  minusculo: 'Minúsculo',
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
  enorme: 'Enorme',
  colossal: 'Colossal',
} as const;

/**
 * Labels em português para os tipos de visão
 */
export const VISION_LABELS: Record<VisionType, string> = {
  normal: 'Normal',
  penumbra: 'Penumbra',
  escuro: 'Escuro',
} as const;

/**
 * Labels em português para os sentidos aguçados
 */
export const SENSE_LABELS: Record<SenseType, string> = {
  visao: 'Visão',
  olfato: 'Olfato',
  audicao: 'Audição',
} as const;

/**
 * Labels em português para os tipos de deslocamento
 */
export const MOVEMENT_LABELS: Record<MovementType, string> = {
  andando: 'Andando',
  voando: 'Voando',
  escalando: 'Escalando',
  escavando: 'Escavando',
  nadando: 'Nadando',
} as const;

/**
 * Helper para obter modificadores de tamanho
 */
export function getSizeModifiers(size: CreatureSize): SizeModifiers {
  return SIZE_MODIFIERS[size];
}

/**
 * Helper para obter descrição de tamanho
 */
export function getSizeDescription(size: CreatureSize): string {
  return SIZE_DESCRIPTIONS[size];
}

/**
 * Helper para obter label de tamanho
 */
export function getSizeLabel(size: CreatureSize): string {
  return SIZE_LABELS[size];
}
