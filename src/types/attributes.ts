/**
 * Attributes - Tipos relacionados a atributos do personagem
 *
 * Este arquivo contém os tipos e interfaces relacionados aos seis atributos base
 * do sistema Tabuleiro do Caos RPG: Agilidade, Constituição, Força, Influência, Mente e Presença.
 */

/**
 * Nomes dos atributos disponíveis no sistema
 * - Agilidade: Reflexos, coordenação motora e destreza
 * - Constituição: Saúde, resistência física e vigor
 * - Força: Poder muscular e capacidade física
 * - Influência: Carisma, persuasão e liderança
 * - Mente: Inteligência, raciocínio e conhecimento
 * - Presença: Percepção, capacidades mágicas e resiliência mental
 */
export type AttributeName =
  | 'agilidade'
  | 'constituicao'
  | 'forca'
  | 'influencia'
  | 'mente'
  | 'presenca';

/**
 * Categoria do atributo (corporal ou mental)
 */
export type AttributeCategory = 'corporal' | 'mental';

/**
 * Mapeamento de atributos para suas categorias
 */
export const ATTRIBUTE_CATEGORIES: Record<AttributeName, AttributeCategory> = {
  agilidade: 'corporal',
  constituicao: 'corporal',
  forca: 'corporal',
  influencia: 'mental',
  mente: 'mental',
  presenca: 'mental',
} as const;

/**
 * Interface para os seis atributos base do personagem
 *
 * Valores padrão vão de 0 a 5, mas podem ser superados em casos especiais.
 * - Valor 0: Rola 2d20 e escolhe o menor resultado
 * - Valores 1-5: Rola quantidade de d20 igual ao valor e escolhe o maior
 */
export interface Attributes {
  /** Agilidade - Reflexos e coordenação motora */
  agilidade: number;
  /** Constituição - Saúde e resistência física */
  constituicao: number;
  /** Força - Poder muscular */
  forca: number;
  /** Influência - Carisma e persuasão */
  influencia: number;
  /** Mente - Inteligência e raciocínio */
  mente: number;
  /** Presença - Percepção e capacidades mágicas */
  presenca: number;
}

/**
 * Valores padrão dos atributos
 */
export const ATTRIBUTE_DEFAULT = 1;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX_DEFAULT = 5; // Pode ser superado em casos especiais

/**
 * Descrições dos atributos
 */
export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeName, string> = {
  agilidade:
    'A agilidade diz respeito a seus reflexos e coordenação motora, utilizadas em ações rápidas e precisas.',
  constituicao:
    'A constituição diz respeito a sua saúde e resistência física, utilizadas para resistir a fadiga, doença e dano.',
  forca:
    'A força diz respeito ao seu poder muscular e capacidade física, utilizadas em ações de força bruta e atletismo.',
  influencia:
    'A influência diz respeito ao seu carisma e capacidade de persuasão, utilizadas para influenciar outros e liderar.',
  mente:
    'A mente diz respeito à sua inteligência e capacidade de raciocínio, utilizadas para lembrar, aprender e deduzir.',
  presenca:
    'A presença diz respeito aos sentidos naturais, capacidades mágicas e resiliência mental, utilizadas para perceber, conjurar e resistir magias.',
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
