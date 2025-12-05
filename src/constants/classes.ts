/**
 * Constantes relacionadas às Classes do personagem
 *
 * As classes funcionam como especializações para os personagens.
 * Cada personagem pode ter até três classes, e cada classe é composta
 * por combinações de um ou dois arquétipos. A soma dos níveis de todas
 * as classes deve ser igual ou menor ao nível do personagem.
 */

import type { ArchetypeName } from './archetypes';

/**
 * Número máximo de classes que um personagem pode ter
 */
export const MAX_CLASSES = 3;

/**
 * Níveis em que habilidades de classe são adquiridas
 */
export const CLASS_FEATURE_LEVELS = [1, 5, 10, 15] as const;

/**
 * Níveis em que melhorias de habilidade de classe são adquiridas
 */
export const CLASS_IMPROVEMENT_LEVELS = [7, 9, 14] as const;

/**
 * Níveis em que Defesa por Etapa de classe substitui a de arquétipo
 */
export const CLASS_DEFENSE_STAGE_LEVELS = [5, 10, 15] as const;

/**
 * Tipo para níveis de melhoria
 */
export type ClassImprovementLevel = 1 | 2 | 3;

/**
 * Tipo para níveis de personagem em que melhorias são adquiridas
 */
export type ClassImprovementCharacterLevel = 7 | 9 | 14;

/**
 * Mapeamento de nível de melhoria para nível de personagem
 */
export const IMPROVEMENT_LEVEL_MAP: Record<
  ClassImprovementLevel,
  ClassImprovementCharacterLevel
> = {
  1: 7,
  2: 9,
  3: 14,
};

/**
 * Labels para níveis de melhoria
 */
export const IMPROVEMENT_LEVEL_LABELS: Record<ClassImprovementLevel, string> = {
  1: 'Melhoria 1 (Nível 7)',
  2: 'Melhoria 2 (Nível 9)',
  3: 'Melhoria 3 (Nível 14)',
};

/**
 * Tipo de ganho de classe
 */
export type ClassGainType =
  | 'habilidade' // Habilidades de Classe (níveis 1, 5, 10, 15)
  | 'melhoria' // Melhorias de Habilidade (níveis 7, 9, 14)
  | 'defesa' // Defesa por Etapa (níveis 5, 10, 15)
  | 'proficiencia'; // Ganhos gerais de proficiência

/**
 * Configuração de ganhos por nível de classe
 */
export interface ClassLevelGain {
  /** Nível em que o ganho ocorre */
  level: number;
  /** Tipo de ganho */
  type: ClassGainType;
  /** Label amigável */
  label: string;
  /** Descrição do ganho */
  description: string;
}

/**
 * Mapeamento de ganhos por nível de classe (1-15)
 */
export const CLASS_LEVEL_GAINS: ClassLevelGain[] = [
  // Nível 1 - Habilidade de Classe
  {
    level: 1,
    type: 'habilidade',
    label: 'Habilidade de Classe',
    description: 'Você ganha a habilidade inicial da classe escolhida.',
  },
  // Nível 5 - Habilidade de Classe + Defesa por Etapa
  {
    level: 5,
    type: 'habilidade',
    label: 'Habilidade de Classe',
    description: 'Você ganha uma habilidade avançada da classe.',
  },
  {
    level: 5,
    type: 'defesa',
    label: 'Defesa por Etapa',
    description:
      'Substitui a defesa por etapa padrão dos arquétipos por essa defesa.',
  },
  // Nível 7 - Melhoria de Habilidade 1
  {
    level: 7,
    type: 'melhoria',
    label: 'Melhoria de Habilidade 1',
    description: 'Você pode melhorar uma habilidade de classe.',
  },
  // Nível 9 - Melhoria de Habilidade 2
  {
    level: 9,
    type: 'melhoria',
    label: 'Melhoria de Habilidade 2',
    description: 'Você pode melhorar outra habilidade de classe.',
  },
  // Nível 10 - Habilidade de Classe + Defesa por Etapa
  {
    level: 10,
    type: 'habilidade',
    label: 'Habilidade de Classe',
    description: 'Você ganha uma habilidade poderosa da classe.',
  },
  {
    level: 10,
    type: 'defesa',
    label: 'Defesa por Etapa',
    description:
      'Substitui a defesa por etapa padrão dos arquétipos por essa defesa.',
  },
  // Nível 14 - Melhoria de Habilidade 3
  {
    level: 14,
    type: 'melhoria',
    label: 'Melhoria de Habilidade 3',
    description: 'Você pode melhorar mais uma habilidade de classe.',
  },
  // Nível 15 - Habilidade de Classe + Defesa por Etapa
  {
    level: 15,
    type: 'habilidade',
    label: 'Habilidade de Classe',
    description: 'Você ganha a habilidade máxima da classe.',
  },
  {
    level: 15,
    type: 'defesa',
    label: 'Defesa por Etapa',
    description:
      'Substitui a defesa por etapa padrão dos arquétipos por essa defesa.',
  },
];

/**
 * Níveis em que cada tipo de ganho de classe ocorre
 */
export const CLASS_GAIN_LEVELS: Record<ClassGainType, number[]> = {
  habilidade: [1, 5, 10, 15],
  melhoria: [7, 9, 14],
  defesa: [5, 10, 15],
  proficiencia: [], // Proficiências podem vir em qualquer nível, depende da classe
};

/**
 * Retorna os ganhos disponíveis para um determinado nível de classe
 */
export function getClassGainsForLevel(level: number): ClassLevelGain[] {
  return CLASS_LEVEL_GAINS.filter((gain) => gain.level === level);
}

/**
 * Retorna os ganhos disponíveis até um determinado nível de classe (inclusive)
 */
export function getClassGainsUpToLevel(maxLevel: number): ClassLevelGain[] {
  return CLASS_LEVEL_GAINS.filter((gain) => gain.level <= maxLevel);
}

/**
 * Labels amigáveis para tipos de ganho de classe
 */
export const CLASS_GAIN_TYPE_LABELS: Record<ClassGainType, string> = {
  habilidade: 'Habilidade',
  melhoria: 'Melhoria',
  defesa: 'Defesa por Etapa',
  proficiencia: 'Proficiência',
};

/**
 * Cores para cada tipo de ganho de classe (MUI color)
 */
export const CLASS_GAIN_TYPE_COLORS: Record<
  ClassGainType,
  'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
> = {
  habilidade: 'primary',
  melhoria: 'info',
  defesa: 'warning',
  proficiencia: 'success',
};

/**
 * Interface para definição de combinação de arquétipos de uma classe
 */
export interface ClassArchetypeCombination {
  /** Nome da classe */
  name: string;
  /** Arquétipos que compõem a classe (1 ou 2) */
  archetypes: ArchetypeName[];
  /** Descrição da classe */
  description?: string;
}

/**
 * Exemplo de classes predefinidas (para referência futura)
 * No MVP atual, o usuário pode criar classes customizadas
 */
export const EXAMPLE_CLASS_COMBINATIONS: ClassArchetypeCombination[] = [
  {
    name: 'Guerreiro',
    archetypes: ['combatente'],
    description: 'Especialista em combate corpo a corpo e táticas de batalha.',
  },
  {
    name: 'Mago',
    archetypes: ['feiticeiro'],
    description:
      'Estudioso das artes arcanas, combina conhecimento com poder mágico.',
  },
  {
    name: 'Clérigo',
    archetypes: ['acolito'],
    description:
      'Devoto de uma divindade, canaliza poder divino para curar e proteger.',
  },
  {
    name: 'Ladrão',
    archetypes: ['ladino'],
    description:
      'Ágil e furtivo, especialista em infiltração e prestidigitação.',
  },
  {
    name: 'Druida',
    archetypes: ['natural'],
    description:
      'Guardião da natureza, combina conexão espiritual com poder primal.',
  },
  {
    name: 'Paladino',
    archetypes: ['combatente', 'acolito'],
    description:
      'Guerreiro sagrado que combina proezas marciais com poderes divinos.',
  },
  {
    name: 'Patrulheiro',
    archetypes: ['natural', 'ladino'],
    description:
      'Caçador habilidoso que combina expertise com conhecimento da natureza.',
  },
  {
    name: 'Bardo',
    archetypes: ['academico', 'feiticeiro'],
    description:
      'Artista versátil que usa música e magia para apoiar aliados e atrapalhar inimigos.',
  },
];

/**
 * Valida se a soma dos níveis das classes não ultrapassa o nível do personagem
 */
export function validateClassLevels(
  classLevels: number[],
  characterLevel: number
): boolean {
  const totalClassLevels = classLevels.reduce((sum, level) => sum + level, 0);
  return totalClassLevels <= characterLevel;
}

/**
 * Calcula quantos níveis de classe ainda podem ser distribuídos
 */
export function getAvailableClassLevels(
  classLevels: number[],
  characterLevel: number
): number {
  const totalClassLevels = classLevels.reduce((sum, level) => sum + level, 0);
  return Math.max(0, characterLevel - totalClassLevels);
}
