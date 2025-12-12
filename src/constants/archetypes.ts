/**
 * Constantes relacionadas aos Arquétipos do personagem
 *
 * Os seis arquétipos são a principal forma de progresso de um personagem.
 * A cada novo nível ganho, um jogador pode escolher um dos seis arquétipos
 * para se avançar, combinando diferentes arquétipos para personalizar o personagem.
 */

/**
 * Lista dos 6 arquétipos do sistema
 */
export const ARCHETYPE_LIST = [
  'academico',
  'acolito',
  'combatente',
  'feiticeiro',
  'ladino',
  'natural',
] as const;

/**
 * Tipo para nome de arquétipo
 */
export type ArchetypeName = (typeof ARCHETYPE_LIST)[number];

/**
 * Nomes amigáveis dos arquétipos (para exibição)
 */
export const ARCHETYPE_LABELS: Record<ArchetypeName, string> = {
  academico: 'Acadêmico',
  acolito: 'Acólito',
  combatente: 'Combatente',
  feiticeiro: 'Feiticeiro',
  ladino: 'Ladino',
  natural: 'Natural',
};

/**
 * Descrições dos arquétipos
 */
export const ARCHETYPE_DESCRIPTIONS: Record<ArchetypeName, string> = {
  academico:
    'O Acadêmico é um intelectual que usa a inteligência para resolver problemas e se especializar. Também pode ser extremamente versátil em vários assuntos.',
  acolito:
    "O Acólito faz uso de poder divino, geralmente 'pegando emprestado' energia de alguma divindade, seja ela negativa ou positiva. Sua fé e devoção devem ser as principais fontes de suas habilidades.",
  combatente:
    'O Combatente, como o nome sugere, se especializa em combates. Eles brilham tanto na ofensiva quanto na defesa, mas não têm tantas ferramentas que ajudem fora disso.',
  feiticeiro:
    'O Feiticeiro usa magia em forma de feitiços. Seus feitiços podem ser muito versáteis para diversas situações, frequentemente vistos como canhões de vidro frágeis e muito poderosos.',
  ladino:
    'O Ladino é ágil e sagaz, utilizando sua destreza e agilidade para sair de encrencas e resolver problemas. Versátil, um ladino pode se dar bem em qualquer situação adversa.',
  natural:
    'O Natural explora seu contato com a natureza, às vezes voltando para seu lado primal e animalesco, virando um com o meio ambiente.',
};

/**
 * PV por nível ganho para cada arquétipo
 * Fórmula: Base + Constituição
 */
export const ARCHETYPE_HP_PER_LEVEL: Record<ArchetypeName, number> = {
  combatente: 5,
  ladino: 4,
  natural: 3,
  acolito: 3,
  academico: 2,
  feiticeiro: 1,
};

/**
 * PP por nível ganho para cada arquétipo
 * Fórmula: Base + Presença
 * Nota: Valores baseados no contexto do sistema (não especificados nas regras básicas)
 */
export const ARCHETYPE_PP_PER_LEVEL: Record<ArchetypeName, number> = {
  feiticeiro: 5,
  academico: 4,
  acolito: 3,
  natural: 3,
  ladino: 2,
  combatente: 1,
};

/**
 * Tipo para atributo
 */
type AttributeKey =
  | 'agilidade'
  | 'constituicao'
  | 'forca'
  | 'influencia'
  | 'mente'
  | 'presenca';

/**
 * Atributos relevantes por arquétipo
 * Alguns arquétipos usam múltiplos atributos, com opções alternativas (usando |)
 */
export const ARCHETYPE_RELEVANT_ATTRIBUTES: Record<
  ArchetypeName,
  AttributeKey[]
> = {
  academico: ['mente'],
  acolito: ['presenca', 'influencia'],
  combatente: ['agilidade', 'forca', 'constituicao'], // Agilidade OU Força, + Constituição
  feiticeiro: ['mente', 'presenca'],
  ladino: ['agilidade'],
  natural: ['presenca'],
};

/**
 * Descrição dos atributos relevantes para exibição
 */
export const ARCHETYPE_ATTRIBUTE_DESCRIPTION: Record<ArchetypeName, string> = {
  academico: 'Mente',
  acolito: 'Presença e Influência',
  combatente: 'Agilidade ou Força, Constituição',
  feiticeiro: 'Mente e Presença',
  ladino: 'Agilidade',
  natural: 'Presença',
};

/**
 * @deprecated Use ARCHETYPE_RELEVANT_ATTRIBUTES instead
 * Atributo primário sugerido para cada arquétipo (compatibilidade)
 */
export const ARCHETYPE_PRIMARY_ATTRIBUTE: Record<ArchetypeName, AttributeKey> =
  {
    academico: 'mente',
    acolito: 'presenca',
    combatente: 'constituicao',
    feiticeiro: 'presenca',
    ladino: 'agilidade',
    natural: 'presenca',
  };

/**
 * Indica se o arquétipo é focado em magia
 */
export const ARCHETYPE_IS_SPELLCASTER: Record<ArchetypeName, boolean> = {
  feiticeiro: true,
  acolito: false,
  natural: false,
  academico: false,
  ladino: false,
  combatente: false,
};

/**
 * Tipos de ganhos por nível de arquétipo
 */
export type ArchetypeLevelGainType =
  | 'caracteristica' // Características de Arquétipo (níveis 1, 5, 10, 15)
  | 'poder' // Poderes de Arquétipo (níveis 2, 4, 6, 8, 9, 11, 13, 14)
  | 'competencia' // Competências/Proficiências (níveis 3, 7, 12)
  | 'atributo' // Aumentos de Atributo (níveis 4, 8, 13)
  | 'grau_habilidade' // Grau de Habilidade (níveis 5, 9, 14)
  | 'defesa_etapa'; // Defesa por Etapa (níveis 5, 10, 15)

/**
 * Configuração de ganhos por nível
 */
export interface ArchetypeLevelGain {
  /** Nível em que o ganho ocorre */
  level: number;
  /** Tipo de ganho */
  type: ArchetypeLevelGainType;
  /** Label amigável */
  label: string;
  /** Descrição do ganho */
  description: string;
}

/**
 * Mapeamento de ganhos por nível (1-15)
 * Baseado nas regras do Tabuleiro do Caos RPG
 */
export const ARCHETYPE_LEVEL_GAINS: ArchetypeLevelGain[] = [
  // Nível 1 - Característica de Arquétipo
  {
    level: 1,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha a característica inicial do arquétipo escolhido.',
  },
  // Nível 2 - Poder de Arquétipo
  {
    level: 2,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  // Nível 3 - Competência
  {
    level: 3,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma habilidade especial completa e poderosa.',
  },
  // Nível 4 - Poder + Aumento de Atributo
  {
    level: 4,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  {
    level: 4,
    type: 'atributo',
    label: 'Aumento de Atributo',
    description: 'Você pode aumentar um atributo em +1.',
  },
  // Nível 5 - Característica de Arquétipo + Grau de Habilidade
  {
    level: 5,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha uma característica avançada do arquétipo.',
  },
  {
    level: 5,
    type: 'grau_habilidade',
    label: 'Grau de Habilidade',
    description:
      'Você pode melhorar uma habilidade para o próximo grau de proficiência.',
  },
  {
    level: 5,
    type: 'defesa_etapa',
    label: 'Defesa por Etapa',
    description: 'Você ganha um bônus de defesa por etapa do seu arquétipo.',
  },
  // Nível 6 - Poder de Arquétipo
  {
    level: 6,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  // Nível 7 - Competência
  {
    level: 7,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma habilidade especial completa e poderosa.',
  },
  // Nível 8 - Poder + Aumento de Atributo
  {
    level: 8,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  {
    level: 8,
    type: 'atributo',
    label: 'Aumento de Atributo',
    description: 'Você pode aumentar um atributo em +1.',
  },
  // Nível 9 - Poder de Arquétipo + Grau de Habilidade
  {
    level: 9,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  {
    level: 9,
    type: 'grau_habilidade',
    label: 'Grau de Habilidade',
    description:
      'Você pode melhorar uma habilidade para o próximo grau de proficiência.',
  },
  // Nível 10 - Característica de Arquétipo + Defesa por Etapa
  {
    level: 10,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha uma característica poderosa do arquétipo.',
  },
  {
    level: 10,
    type: 'defesa_etapa',
    label: 'Defesa por Etapa',
    description: 'Você ganha um bônus de defesa por etapa do seu arquétipo.',
  },
  // Nível 11 - Poder de Arquétipo
  {
    level: 11,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  // Nível 12 - Competência
  {
    level: 12,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma habilidade especial completa e poderosa.',
  },
  // Nível 13 - Poder + Aumento de Atributo
  {
    level: 13,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  {
    level: 13,
    type: 'atributo',
    label: 'Aumento de Atributo',
    description: 'Você pode aumentar um atributo em +1.',
  },
  // Nível 14 - Poder de Arquétipo + Grau de Habilidade
  {
    level: 14,
    type: 'poder',
    label: 'Poder de Arquétipo',
    description: 'Você ganha um poder especial do seu arquétipo.',
  },
  {
    level: 14,
    type: 'grau_habilidade',
    label: 'Grau de Habilidade',
    description:
      'Você pode melhorar uma habilidade para o próximo grau de proficiência.',
  },
  // Nível 15 - Característica de Arquétipo + Defesa por Etapa
  {
    level: 15,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha a característica máxima do arquétipo.',
  },
  {
    level: 15,
    type: 'defesa_etapa',
    label: 'Defesa por Etapa',
    description: 'Você ganha um bônus de defesa por etapa do seu arquétipo.',
  },
];

/**
 * Níveis em que cada tipo de ganho ocorre
 */
export const ARCHETYPE_GAIN_LEVELS: Record<ArchetypeLevelGainType, number[]> = {
  caracteristica: [1, 5, 10, 15],
  poder: [2, 4, 6, 8, 9, 11, 13, 14],
  competencia: [3, 7, 12],
  atributo: [4, 8, 13],
  grau_habilidade: [5, 9, 14],
  defesa_etapa: [5, 10, 15],
};

/**
 * Retorna os ganhos disponíveis para um determinado nível
 */
export function getGainsForLevel(level: number): ArchetypeLevelGain[] {
  return ARCHETYPE_LEVEL_GAINS.filter((gain) => gain.level === level);
}

/**
 * Retorna os ganhos disponíveis até um determinado nível (inclusive)
 */
export function getGainsUpToLevel(maxLevel: number): ArchetypeLevelGain[] {
  return ARCHETYPE_LEVEL_GAINS.filter((gain) => gain.level <= maxLevel);
}

/**
 * Labels amigáveis para tipos de ganho
 */
export const GAIN_TYPE_LABELS: Record<ArchetypeLevelGainType, string> = {
  caracteristica: 'Característica',
  poder: 'Poder',
  competencia: 'Competência',
  atributo: 'Aumento de Atributo',
  grau_habilidade: 'Grau de Habilidade',
  defesa_etapa: 'Defesa por Etapa',
};

/**
 * Cores para cada tipo de ganho (MUI color)
 */
export const GAIN_TYPE_COLORS: Record<
  ArchetypeLevelGainType,
  'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
> = {
  caracteristica: 'primary',
  poder: 'secondary',
  competencia: 'success',
  atributo: 'warning',
  grau_habilidade: 'info',
  defesa_etapa: 'error',
};
