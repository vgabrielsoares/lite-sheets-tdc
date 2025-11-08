/**
 * Character - Tipo principal do personagem
 *
 * Este arquivo contém a interface principal do Character, agregando todos os
 * outros tipos do sistema para formar a ficha completa do personagem.
 */

import type {
  UUID,
  Timestamp,
  MovementType,
  SenseType,
  VisionType,
  CreatureSize,
  Note,
  BaseEntity,
} from './common';
import type { Attributes } from './attributes';
import type { Skills, SkillName } from './skills';
import type { CombatData } from './combat';
import type { Inventory } from './inventory';
import type { SpellcastingData } from './spells';

/**
 * Arquétipos disponíveis no sistema
 */
export type ArchetypeName =
  | 'academico'
  | 'acolito'
  | 'combatente'
  | 'feiticeiro'
  | 'ladino'
  | 'natural';

/**
 * Informações de um arquétipo
 */
export interface Archetype {
  /** Nome do arquétipo */
  name: ArchetypeName;
  /** Nível neste arquétipo */
  level: number;
  /** Características de arquétipo adquiridas */
  features: ArchetypeFeature[];
}

/**
 * Característica de arquétipo
 */
export interface ArchetypeFeature {
  /** Nome da característica */
  name: string;
  /** Nível em que foi adquirida */
  acquiredAtLevel: number;
  /** Descrição da característica */
  description: string;
  /** Escolhas permanentes feitas */
  permanentChoices?: Record<string, any>;
  /** Escolhas temporárias (podem ser alteradas) */
  temporaryChoices?: Record<string, any>;
}

/**
 * Informações de uma classe
 */
export interface CharacterClass {
  /** Nome da classe */
  name: string;
  /** Arquétipos que compõem a classe */
  archetypes: ArchetypeName[];
  /** Nível na classe */
  level: number;
  /** Habilidades de classe adquiridas */
  features: ClassFeature[];
}

/**
 * Característica de classe
 */
export interface ClassFeature {
  /** Nome da característica */
  name: string;
  /** Nível em que foi adquirida */
  acquiredAtLevel: number;
  /** Descrição da característica */
  description: string;
  /** Melhorias aplicadas (níveis 7, 9, 14) */
  improvements?: ClassImprovement[];
}

/**
 * Melhoria de habilidade de classe
 */
export interface ClassImprovement {
  /** Nível da melhoria (1, 2 ou 3) */
  level: 1 | 2 | 3;
  /** Nível do personagem quando adquirida */
  acquiredAtLevel: 7 | 9 | 14;
  /** Descrição da melhoria */
  description: string;
}

/**
 * Idiomas conhecidos
 */
export type LanguageName =
  | 'comum'
  | 'anao'
  | 'elfico'
  | 'goblinoide'
  | 'draconico'
  | 'infernal'
  | 'primordial'
  | 'runico'
  | 'aquatico'
  | 'gigante'
  | 'gnomico'
  | 'glasnee'
  | 'orc'
  | 'silvestre';

/**
 * Proficiências do personagem
 */
export interface Proficiencies {
  /** Proficiências com armas */
  weapons: string[];
  /** Proficiências com armaduras */
  armor: string[];
  /** Proficiências com ferramentas */
  tools: string[];
  /** Outras proficiências */
  other: string[];
}

/**
 * Informações de origem do personagem
 */
export interface Origin {
  /** Nome da origem */
  name: string;
  /** Descrição da origem */
  description?: string;
  /** Proficiências com habilidades ganhas (2) */
  skillProficiencies: SkillName[];
  /** Habilidade especial da origem */
  specialAbility?: {
    name: string;
    description: string;
  };
}

/**
 * Características de ancestralidade da linhagem
 */
export interface AncestryTrait {
  /** Nome da característica */
  name: string;
  /** Descrição da característica */
  description: string;
}

/**
 * Informações de linhagem do personagem
 */
export interface Lineage {
  /** Nome da linhagem */
  name: string;
  /** Descrição da linhagem */
  description?: string;
  /** Tamanho */
  size: CreatureSize;
  /** Altura em centímetros */
  height: number;
  /** Peso em kg */
  weightKg: number;
  /** Peso na medida do RPG */
  weightRPG: number;
  /** Idade */
  age: number;
  /** Idiomas ganhos pela linhagem */
  languages: LanguageName[];
  /** Deslocamento */
  movement: Record<MovementType, number>;
  /** Sentido aguçado (se aplicável) */
  keenSense?: SenseType;
  /** Tipo de visão */
  vision: VisionType;
  /** Características de ancestralidade */
  ancestryTraits: AncestryTrait[];
}

/**
 * Deslocamento do personagem
 */
export interface Movement {
  /** Deslocamento base por tipo */
  speeds: Record<MovementType, number>;
  /** Modificadores de deslocamento */
  modifiers: number;
}

/**
 * Sentidos do personagem
 */
export interface Senses {
  /** Tipo de visão */
  vision: VisionType;
  /** Sentidos aguçados */
  keenSenses: SenseType[];
  /** Modificadores de percepção por tipo de sentido */
  perceptionModifiers: Record<SenseType, number>;
}

/**
 * Nível de sorte
 */
export interface LuckLevel {
  /** Nível atual de sorte */
  level: number;
  /** Valor total de sorte disponível */
  value: number;
}

/**
 * Ofício (Competência)
 */
export interface Craft {
  /** Nome do ofício */
  name: string;
  /** Nível no ofício (1-5) */
  level: 1 | 2 | 3 | 4 | 5;
  /** Modificador total do ofício */
  modifier: number;
}

/**
 * Característica complementar (positiva ou negativa)
 */
export interface ComplementaryTrait {
  /** Nome da característica */
  name: string;
  /** Descrição */
  description: string;
  /** Valor de pontos (positivo ou negativo) */
  points: number;
}

/**
 * Característica completa (já balanceada)
 */
export interface CompleteTrait {
  /** Nome da característica */
  name: string;
  /** Descrição */
  description: string;
}

/**
 * Particularidades do personagem
 */
export interface Particularities {
  /** Características complementares negativas */
  negativeTraits: ComplementaryTrait[];
  /** Características complementares positivas */
  positiveTraits: ComplementaryTrait[];
  /** Características completas */
  completeTraits: CompleteTrait[];
  /** Balanço total (deve ser 0) */
  balance: number;
}

/**
 * Descrição física do personagem
 */
export interface PhysicalDescription {
  /** Cor da pele */
  skin?: string;
  /** Cor dos olhos */
  eyes?: string;
  /** Cor do cabelo */
  hair?: string;
  /** Outros detalhes */
  other?: string;
}

/**
 * Definidores do personagem
 */
export interface CharacterDefiners {
  /** Falhas */
  flaws: string[];
  /** Medos */
  fears: string[];
  /** Ideais */
  ideals: string[];
  /** Traços de personalidade */
  traits: string[];
  /** Objetivos */
  goals: string[];
  /** Aliados */
  allies: string[];
  /** Organizações */
  organizations: string[];
}

/**
 * Progressão do personagem por nível
 */
export interface LevelProgression {
  /** Nível */
  level: number;
  /** Ganhos neste nível */
  gains: string[];
  /** Se este nível já foi alcançado */
  achieved: boolean;
}

/**
 * Experiência (XP)
 */
export interface Experience {
  /** XP atual */
  current: number;
  /** XP necessário para próximo nível */
  toNextLevel: number;
}

/**
 * Interface principal do Character
 */
export interface Character extends BaseEntity {
  // Informações Básicas
  /** Nome do personagem */
  name: string;
  /** Nome do jogador */
  playerName?: string;
  /** Conceito do personagem (resumo curto) */
  concept?: string;
  /** Conceito expandido (texto longo) */
  conceptExpanded?: string;

  // Nível e Experiência
  /** Nível total do personagem */
  level: number;
  /** Experiência */
  experience: Experience;

  // Origem e Linhagem
  /** Origem do personagem */
  origin?: Origin;
  /** Linhagem do personagem */
  lineage?: Lineage;

  // Atributos
  /** Atributos base */
  attributes: Attributes;

  // Arquétipos e Classes
  /** Arquétipos do personagem */
  archetypes: Archetype[];
  /** Classes do personagem */
  classes: CharacterClass[];

  // Habilidades
  /** Habilidades do personagem */
  skills: Skills;
  /** Habilidade de assinatura */
  signatureSkill: SkillName;

  // Combate
  /** Dados de combate */
  combat: CombatData;

  // Deslocamento e Sentidos
  /** Deslocamento */
  movement: Movement;
  /** Sentidos */
  senses: Senses;
  /** Tamanho */
  size: CreatureSize;

  // Idiomas e Proficiências
  /** Idiomas conhecidos */
  languages: LanguageName[];
  /** Proficiências */
  proficiencies: Proficiencies;

  // Sorte e Ofícios
  /** Nível de sorte */
  luck: LuckLevel;
  /** Ofícios */
  crafts: Craft[];

  // Inventário
  /** Inventário completo */
  inventory: Inventory;

  // Feitiços
  /** Dados de conjuração */
  spellcasting?: SpellcastingData;

  // Particularidades
  /** Particularidades do personagem */
  particularities: Particularities;

  // Descrição e História
  /** Descrição física */
  physicalDescription: PhysicalDescription;
  /** Gênero */
  gender?: string;
  /** Alinhamento */
  alignment?: string;
  /** Fé/Religião */
  faith?: string;
  /** Definidores do personagem */
  definers: CharacterDefiners;
  /** História/Background */
  backstory?: string;

  // Progressão
  /** Progressão por nível */
  levelProgression: LevelProgression[];

  // Anotações
  /** Anotações do jogador */
  notes: Note[];
}

/**
 * Valores padrão para um personagem de nível 1
 */
export const DEFAULT_LEVEL_1_CHARACTER: Partial<Character> = {
  level: 1,
  attributes: {
    agilidade: 1,
    constituicao: 1,
    forca: 1,
    influencia: 1,
    mente: 1,
    presenca: 1,
  },
  combat: {
    hp: {
      current: 15,
      max: 15,
      temporary: 0,
    },
    pp: {
      current: 2,
      max: 2,
      temporary: 0,
    },
  } as any,
  languages: ['comum'],
  proficiencies: {
    weapons: ['armas-simples'],
    armor: [],
    tools: [],
    other: [],
  },
  inventory: {
    items: [
      {
        id: 'default-backpack',
        name: 'Mochila',
        category: 'diversos',
        quantity: 1,
        weight: 0,
        value: 0,
        equipped: true,
      },
      {
        id: 'default-bank-card',
        name: 'Cartão do Banco',
        category: 'diversos',
        quantity: 1,
        weight: 0,
        value: 0,
        equipped: true,
      },
    ],
    currency: {
      physical: {
        cobre: 0,
        ouro: 10,
        platina: 0,
      },
      bank: {
        cobre: 0,
        ouro: 0,
        platina: 0,
      },
    },
  } as any,
} as const;
