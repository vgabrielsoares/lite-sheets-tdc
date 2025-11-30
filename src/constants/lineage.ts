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
 * IMPORTANTE: Baseado na tabela oficial "Tamanho de Personagem" (Regras Básicas)
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
  /** Modificador de peso carregável */
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
 * Baseado na tabela oficial "Tamanho de Personagem" (Regras Básicas, página aproximada 224)
 *
 * IMPORTANTE: Todos os valores seguem a tabela oficial do livro
 * - Dano: -1d4 convertido para -4 (média de 1d4 = 2.5, arredondado para baixo = 2, então -2.5*2 = -5, aproximado para -4)
 * - Capacidade de Carga: ADITIVA (somada à fórmula base: 5 + Força × 5)
 */
export const SIZE_MODIFIERS: Record<CreatureSize, SizeModifiers> = {
  minusculo: {
    reach: 1,
    meleeDamage: -4, // -1d4 (média ~2.5, convertido)
    defense: 3,
    squaresOccupied: 0.5,
    carryingCapacity: -5, // ADITIVO
    combatManeuvers: -3,
    trackingDC: 5,
    skillModifiers: {
      acrobacia: 5,
      atletismo: -5,
      furtividade: 5,
      reflexos: 3,
      tenacidade: -3,
    },
  },
  pequeno: {
    reach: 1,
    meleeDamage: -1,
    defense: 1,
    squaresOccupied: 1,
    carryingCapacity: -2, // ADITIVO
    combatManeuvers: -1,
    trackingDC: 2,
    skillModifiers: {
      acrobacia: 2,
      atletismo: -2,
      furtividade: 2,
      reflexos: 1,
      tenacidade: -1,
    },
  },
  medio: {
    reach: 1,
    meleeDamage: 0,
    defense: 0,
    squaresOccupied: 1,
    carryingCapacity: 0, // ADITIVO
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
    meleeDamage: 1,
    defense: -1,
    squaresOccupied: 2,
    carryingCapacity: 2, // ADITIVO
    combatManeuvers: 1,
    trackingDC: -2,
    skillModifiers: {
      acrobacia: -2,
      atletismo: 2,
      furtividade: -2,
      reflexos: -1,
      tenacidade: 1,
    },
  },
  enorme: {
    reach: 3, // 3 a 5 (usando mínimo)
    meleeDamage: 4, // +1d4 (mínimo do range, média ~2.5, convertido para +4)
    defense: -2, // -2 a -4 (usando mínimo)
    squaresOccupied: 3, // 3 a 5 (usando mínimo)
    carryingCapacity: 5, // ADITIVO
    combatManeuvers: 2, // +2 a +4 (usando mínimo)
    trackingDC: -5, // -5 a -7 (usando mínimo)
    skillModifiers: {
      acrobacia: -5, // -5 a -7 (usando mínimo)
      atletismo: 5, // +5 a +7 (usando mínimo)
      furtividade: -5, // -5 a -7 (usando mínimo)
      reflexos: -2, // -2 a -4 (usando mínimo)
      tenacidade: 2, // +2 a +4 (usando mínimo)
    },
  },
  colossal: {
    reach: 6, // 6 ou mais
    meleeDamage: 8, // +1d10 ou mais (usando mínimo +1d10, média ~5.5, convertido para +8)
    defense: -5, // -5 ou mais
    squaresOccupied: 6, // 6 ou mais
    carryingCapacity: 10, // ADITIVO
    combatManeuvers: 5, // +5 ou mais
    trackingDC: -8, // -8 ou mais
    skillModifiers: {
      acrobacia: -8, // -8 ou mais
      atletismo: 8, // +8 ou mais
      furtividade: -8, // -8 ou mais
      reflexos: -5, // -5 ou mais
      tenacidade: 5, // +5 ou mais
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
  andando: 5, // 5 metros é o padrão
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

/**
 * Descrição de como os modificadores de atributos funcionam nas linhagens
 */
export const LINEAGE_ATTRIBUTE_MODIFIER_RULES = {
  /**
   * Opção 1: +1 em um único atributo
   */
  SINGLE_BONUS: {
    description: '+1 em um atributo à escolha',
    validation: (modifiers: { value: number }[]) =>
      modifiers.length === 1 && modifiers[0].value === 1,
  },
  /**
   * Opção 2: +1 em dois atributos e -1 em um atributo
   */
  DOUBLE_BONUS_SINGLE_PENALTY: {
    description: '+1 em dois atributos e -1 em um atributo',
    validation: (modifiers: { value: number }[]) => {
      const bonuses = modifiers.filter((m) => m.value === 1);
      const penalties = modifiers.filter((m) => m.value === -1);
      return bonuses.length === 2 && penalties.length === 1;
    },
  },
  /**
   * Opção 3: +2 em um atributo e -1 em outro atributo
   */
  MAJOR_BONUS_SINGLE_PENALTY: {
    description: '+2 em um atributo e -1 em outro atributo',
    validation: (modifiers: { value: number }[]) => {
      const majorBonuses = modifiers.filter((m) => m.value === 2);
      const penalties = modifiers.filter((m) => m.value === -1);
      return majorBonuses.length === 1 && penalties.length === 1;
    },
  },
  /**
   * Opção 4: +1 em dois atributos
   */
  DOUBLE_BONUS: {
    description: '+1 em dois atributos',
    validation: (modifiers: { value: number }[]) => {
      const bonuses = modifiers.filter((m) => m.value === 1);
      return bonuses.length === 2 && modifiers.length === 2;
    },
  },
} as const;

/**
 * Validações para linhagem
 */
export const LINEAGE_VALIDATION = {
  /**
   * Valida se os modificadores de atributos seguem as regras
   */
  validateAttributeModifiers: (
    modifiers: { attribute: string; value: number }[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Opção 1: +1 em um atributo
    const isSingleBonus =
      LINEAGE_ATTRIBUTE_MODIFIER_RULES.SINGLE_BONUS.validation(modifiers);

    // Opção 2: +1 em dois e -1 em um
    const isDoubleBonusSinglePenalty =
      LINEAGE_ATTRIBUTE_MODIFIER_RULES.DOUBLE_BONUS_SINGLE_PENALTY.validation(
        modifiers
      );

    // Opção 3: +2 em um e -1 em outro
    const isMajorBonusSinglePenalty =
      LINEAGE_ATTRIBUTE_MODIFIER_RULES.MAJOR_BONUS_SINGLE_PENALTY.validation(
        modifiers
      );

    // Opção 4: +1 em dois
    const isDoubleBonus =
      LINEAGE_ATTRIBUTE_MODIFIER_RULES.DOUBLE_BONUS.validation(modifiers);

    if (
      !isSingleBonus &&
      !isDoubleBonusSinglePenalty &&
      !isMajorBonusSinglePenalty &&
      !isDoubleBonus
    ) {
      errors.push(
        'Modificadores de atributos devem seguir uma das opções: ' +
          '(1) +1 em um atributo, ' +
          '(2) +1 em dois atributos e -1 em um, ' +
          '(3) +2 em um atributo e -1 em outro, ou ' +
          '(4) +1 em dois atributos'
      );
    }

    // Verificar valores permitidos
    const invalidValues = modifiers.filter(
      (m) => m.value !== 1 && m.value !== -1 && m.value !== 2
    );
    if (invalidValues.length > 0) {
      errors.push('Modificadores de atributos só podem ser +2, +1 ou -1');
    }

    // Verificar duplicatas de atributos
    const attributes = modifiers.map((m) => m.attribute);
    const uniqueAttributes = new Set(attributes);
    if (attributes.length !== uniqueAttributes.size) {
      errors.push(
        'Não pode haver modificadores duplicados para o mesmo atributo'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
