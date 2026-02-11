/**
 * Attributes - Tipos relacionados a atributos do personagem
 *
 * Este arquivo contém os tipos e interfaces relacionados aos seis atributos base
 * do sistema Tabuleiro do Caos RPG (v0.1.7): Agilidade, Corpo, Influência, Mente, Essência e Instinto.
 */

/**
 * Nomes dos atributos disponíveis no sistema
 * - Agilidade (Agi): Destreza manual/física, reflexos, coordenação motora, flexibilidade e rapidez
 * - Corpo (Cor): Capacidades físicas, saúde, força e resistência
 * - Influência (Inf): Habilidades sociais e carisma
 * - Mente (Men): Inteligência, raciocínio lógico, conhecimentos
 * - Essência (Ess): Capacidades mágicas e potencial energético
 * - Instinto (Ins): Sentidos e instintos naturais
 */
export type AttributeName =
  | 'agilidade'
  | 'corpo'
  | 'influencia'
  | 'mente'
  | 'essencia'
  | 'instinto';

/**
 * Categoria do atributo (físico, mental ou espiritual)
 */
export type AttributeCategory = 'fisico' | 'mental' | 'espiritual';

/**
 * Mapeamento de atributos para suas categorias
 */
export const ATTRIBUTE_CATEGORIES: Record<AttributeName, AttributeCategory> = {
  agilidade: 'fisico',
  corpo: 'fisico',
  influencia: 'mental',
  mente: 'mental',
  essencia: 'espiritual',
  instinto: 'espiritual',
} as const;

/**
 * Interface para os seis atributos base do personagem
 *
 * Valores padrão vão de 0 a 5, mas podem ser superados em casos especiais (linhagem, máximo 6).
 * - Valor 0: Rola 2d6 e escolhe o menor resultado
 * - Valores 1-5: Rola quantidade de dados igual ao valor do atributo
 */
export interface Attributes {
  /** Agilidade (Agi) - Destreza manual/física, reflexos, coordenação motora, flexibilidade e rapidez */
  agilidade: number;
  /** Corpo (Cor) - Capacidades físicas, saúde, força e resistência */
  corpo: number;
  /** Influência (Inf) - Habilidades sociais e carisma */
  influencia: number;
  /** Mente (Men) - Inteligência, raciocínio lógico, conhecimentos */
  mente: number;
  /** Essência (Ess) - Capacidades mágicas e potencial energético */
  essencia: number;
  /** Instinto (Ins) - Sentidos e instintos naturais */
  instinto: number;
}

/**
 * Valores padrão dos atributos
 */
export const ATTRIBUTE_DEFAULT = 1;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX_DEFAULT = 5; // Pode ser superado em casos especiais

/**
 * Descrições dos atributos (conforme livro v0.1.7)
 */
export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeName, string> = {
  agilidade:
    'A agilidade mede a destreza manual e física, reflexos, coordenação motora, flexibilidade e rapidez. Foco: esquiva, ataques à distância, armas com propriedades ideais, destreza, acrobacia, furtividade.',
  corpo:
    'O corpo mede as capacidades físicas de uma criatura, sua saúde, força e resistência. Foco: combate corpo a corpo, vigor, atletismo, luta, testes de resistência.',
  influencia:
    'A influência diz respeito às habilidades sociais de uma criatura e seu carisma. Foco: persuasão, enganação, intimidação.',
  mente:
    'A mente diz respeito à inteligência, raciocínio lógico, capacidade de armazenar informações e conhecimentos. Foco: quantidade de habilidades proficientes, aprendizado de feitiços.',
  essencia:
    'A Essência diz respeito às capacidades mágicas e potencial energético. Foco: PP, poder mágico, conjuração, testes de Sintonia.',
  instinto:
    'O Instinto diz respeito aos sentidos e instintos naturais. Foco: percepção, rastreamento, perspicácia, natureza.',
} as const;

/**
 * Modificador de atributo aplicado a testes
 */
export interface AttributeModifier {
  /** Nome do atributo modificado */
  attribute: AttributeName;
  /** Valor do modificador */
  value: number;
  /** Fonte do modificador (origem, linhagem, equipamento, etc.) */
  source: string;
}

/**
 * Informações completas de um atributo incluindo modificadores
 */
export interface AttributeDetails {
  /** Valor base do atributo */
  base: number;
  /** Modificadores aplicados */
  modifiers: AttributeModifier[];
  /** Valor final (base + soma dos modificadores) */
  total: number;
}

/**
 * Conjunto completo de atributos com detalhes
 */
export type AttributesWithDetails = Record<AttributeName, AttributeDetails>;
