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
 * @deprecated Substituído por ARCHETYPE_GA_ATTRIBUTE em v0.0.2.
 * GA por nível agora é baseado no atributo relevante do arquétipo.
 * PV por nível ganho para cada arquétipo
 * Fórmula: Base + Corpo
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
 * Atributo que determina GA ganho por nível de cada arquétipo
 * Fórmula: GA total = 15 (base) + Σ(valor_atributo × níveis_no_arquétipo)
 *
 * | Arquétipo   | Atributo para GA |
 * |-------------|------------------|
 * | Acadêmico   | Mente            |
 * | Acólito     | Influência       |
 * | Combatente  | Corpo            |
 * | Feiticeiro  | Essência         |
 * | Ladino      | Agilidade        |
 * | Natural     | Instinto         |
 */
export const ARCHETYPE_GA_ATTRIBUTE: Record<ArchetypeName, AttributeKey> = {
  academico: 'mente',
  acolito: 'influencia',
  combatente: 'corpo',
  feiticeiro: 'essencia',
  ladino: 'agilidade',
  natural: 'instinto',
};

/**
 * Base de PP ganho por nível de cada arquétipo (sem contar Essência)
 * Fórmula: PP total = 2 (base) + Σ((base_pp + Essência) × níveis_no_arquétipo)
 *
 * | Arquétipo   | PP base por nível |
 * |-------------|-------------------|
 * | Acadêmico   | +4                |
 * | Acólito     | +3                |
 * | Combatente  | +1                |
 * | Feiticeiro  | +5                |
 * | Ladino      | +2                |
 * | Natural     | +3                |
 */
export const ARCHETYPE_PP_BASE_PER_LEVEL: Record<ArchetypeName, number> = {
  academico: 4,
  acolito: 3,
  combatente: 1,
  feiticeiro: 5,
  ladino: 2,
  natural: 3,
};

/**
 * @deprecated Use ARCHETYPE_PP_BASE_PER_LEVEL + Essência.
 * PP por nível ganho para cada arquétipo
 * Fórmula: Base + Essência
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
 * Habilidades iniciais por arquétipo
 * Concedidas ao escolher o arquétipo no nível 1
 */
export const ARCHETYPE_INITIAL_SKILLS: Record<ArchetypeName, string[]> = {
  academico: ['Instrução', '1 à escolha'],
  acolito: ['Religião', 'Determinação'],
  combatente: ['Acerto ou Luta', 'Reflexo ou Vigor'],
  feiticeiro: ['Arcano', 'Determinação'],
  ladino: ['Destreza', 'Reflexo'],
  natural: ['Natureza', 'Sobrevivência'],
};

/**
 * Proficiências iniciais por arquétipo
 */
export const ARCHETYPE_INITIAL_PROFICIENCIES: Record<ArchetypeName, string[]> =
  {
    academico: ['2 Ferramentas'],
    acolito: ['Armadura Leve'],
    combatente: ['Armas Marciais', 'Armadura Leve', 'Maestria em 1 arma'],
    feiticeiro: [],
    ladino: ['Instrumentos de Destreza', 'Armadura Leve'],
    natural: ['Armadura Leve'],
  };

/**
 * Tipo para atributo
 */
type AttributeKey =
  | 'agilidade'
  | 'corpo'
  | 'influencia'
  | 'mente'
  | 'essencia'
  | 'instinto';

/**
 * Atributos relevantes por arquétipo
 * Alguns arquétipos usam múltiplos atributos, com opções alternativas (usando |)
 */
export const ARCHETYPE_RELEVANT_ATTRIBUTES: Record<
  ArchetypeName,
  AttributeKey[]
> = {
  academico: ['mente'],
  acolito: ['essencia', 'influencia'],
  combatente: ['agilidade', 'corpo'], // Agilidade OU Corpo
  feiticeiro: ['mente', 'essencia'],
  ladino: ['agilidade'],
  natural: ['instinto'],
};

/**
 * Descrição dos atributos relevantes para exibição
 */
export const ARCHETYPE_ATTRIBUTE_DESCRIPTION: Record<ArchetypeName, string> = {
  academico: 'Mente',
  acolito: 'Essência e Influência',
  combatente: 'Agilidade ou Corpo',
  feiticeiro: 'Mente e Essência',
  ladino: 'Agilidade',
  natural: 'Instinto',
};

/**
 * @deprecated Use ARCHETYPE_RELEVANT_ATTRIBUTES instead
 * Atributo primário sugerido para cada arquétipo (compatibilidade)
 */
export const ARCHETYPE_PRIMARY_ATTRIBUTE: Record<ArchetypeName, AttributeKey> =
  {
    academico: 'mente',
    acolito: 'essencia',
    combatente: 'corpo',
    feiticeiro: 'essencia',
    ladino: 'agilidade',
    natural: 'instinto',
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
 *
 * Simplificado para 3 tipos:
 * - caracteristica: Características de Arquétipo (níveis 1, 5, 10, 15)
 * - poder_ou_talento: Poder de Arquétipo ou Talento (todos os outros níveis: 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14)
 * - competencia: Competências (níveis múltiplos de 5 do arquétipo: 5, 10, 15)
 *
 * Nota: Aumento de Atributo e Grau de Habilidade são Talentos que o jogador
 * pode escolher em qualquer nível que conceda poder_ou_talento, não ganhos automáticos.
 */
export type ArchetypeLevelGainType =
  | 'caracteristica' // Características de Arquétipo (níveis 1, 5, 10, 15)
  | 'poder_ou_talento' // Poder de Arquétipo ou Talento (níveis 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14)
  | 'competencia'; // Competências (níveis 5, 10, 15 — junto com característica)

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
 * Mapeamento de ganhos por nível de arquétipo (1-15+)
 * Baseado nas regras do Tabuleiro do Caos RPG
 *
 * Tabela de ganhos:
 * | Nível | Ganho |
 * |-------|-------------------------------------------|
 * | 1     | Característica de Arquétipo                |
 * | 2     | Poder de Arquétipo ou Talento              |
 * | 3     | Poder de Arquétipo ou Talento              |
 * | 4     | Poder de Arquétipo ou Talento              |
 * | 5     | Competência + Característica de Arquétipo  |
 * | 6     | Poder de Arquétipo ou Talento              |
 * | 7     | Poder de Arquétipo ou Talento              |
 * | 8     | Poder de Arquétipo ou Talento              |
 * | 9     | Poder de Arquétipo ou Talento              |
 * | 10    | Competência + Característica de Arquétipo  |
 * | 11    | Poder de Arquétipo ou Talento              |
 * | 12    | Poder de Arquétipo ou Talento              |
 * | 13    | Poder de Arquétipo ou Talento              |
 * | 14    | Poder de Arquétipo ou Talento              |
 * | 15    | Competência + Característica de Arquétipo  |
 * | 16+   | Poder/Talento (Competência se múltiplo 5)  |
 */
export const ARCHETYPE_LEVEL_GAINS: ArchetypeLevelGain[] = [
  // Nível 1 - Característica de Arquétipo
  {
    level: 1,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha a característica inicial do arquétipo escolhido.',
  },
  // Nível 2 - Poder de Arquétipo ou Talento
  {
    level: 2,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 3 - Poder de Arquétipo ou Talento
  {
    level: 3,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 4 - Poder de Arquétipo ou Talento
  {
    level: 4,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 5 - Competência + Característica de Arquétipo
  {
    level: 5,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma competência poderosa.',
  },
  {
    level: 5,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha uma característica avançada do arquétipo.',
  },
  // Nível 6 - Poder de Arquétipo ou Talento
  {
    level: 6,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 7 - Poder de Arquétipo ou Talento
  {
    level: 7,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 8 - Poder de Arquétipo ou Talento
  {
    level: 8,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 9 - Poder de Arquétipo ou Talento
  {
    level: 9,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 10 - Competência + Característica de Arquétipo
  {
    level: 10,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma competência poderosa.',
  },
  {
    level: 10,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha uma característica poderosa do arquétipo.',
  },
  // Nível 11 - Poder de Arquétipo ou Talento
  {
    level: 11,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 12 - Poder de Arquétipo ou Talento
  {
    level: 12,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 13 - Poder de Arquétipo ou Talento
  {
    level: 13,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 14 - Poder de Arquétipo ou Talento
  {
    level: 14,
    type: 'poder_ou_talento',
    label: 'Poder de Arquétipo ou Talento',
    description: 'Escolha um poder do arquétipo ou um talento.',
  },
  // Nível 15 - Competência + Característica de Arquétipo
  {
    level: 15,
    type: 'competencia',
    label: 'Competência',
    description: 'Você ganha uma competência poderosa.',
  },
  {
    level: 15,
    type: 'caracteristica',
    label: 'Característica de Arquétipo',
    description: 'Você ganha a característica máxima do arquétipo.',
  },
];

/**
 * Níveis em que cada tipo de ganho ocorre
 */
export const ARCHETYPE_GAIN_LEVELS: Record<ArchetypeLevelGainType, number[]> = {
  caracteristica: [1, 5, 10, 15],
  poder_ou_talento: [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14],
  competencia: [5, 10, 15],
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
  poder_ou_talento: 'Poder / Talento',
  competencia: 'Competência',
};

/**
 * Cores para cada tipo de ganho (MUI color)
 */
export const GAIN_TYPE_COLORS: Record<
  ArchetypeLevelGainType,
  'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
> = {
  caracteristica: 'primary',
  poder_ou_talento: 'secondary',
  competencia: 'success',
};
