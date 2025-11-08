/**
 * Constantes relacionadas aos Atributos do personagem
 *
 * Os seis atributos principais do Tabuleiro do Caos RPG:
 * - Agilidade
 * - Constituição
 * - Força
 * - Influência
 * - Mente
 * - Presença
 */

import { AttributeName } from '@/types';

/**
 * Valor mínimo padrão para atributos
 * Atributos com valor 0 rolam 2d20 e escolhem o MENOR resultado
 */
export const ATTRIBUTE_MIN = 0;

/**
 * Valor máximo padrão para atributos no nível 1
 * Pode ser superado em casos especiais através de habilidades
 */
export const ATTRIBUTE_MAX = 5;

/**
 * Valor máximo de atributo no nível 1 de personagem
 */
export const ATTRIBUTE_MAX_LEVEL_1 = 3;

/**
 * Valor padrão inicial de todos os atributos no nível 1
 * Representa a média de uma criatura humanoide normal
 */
export const ATTRIBUTE_DEFAULT = 1;

/**
 * Descrições completas de cada atributo
 */
export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeName, string> = {
  agilidade:
    'A agilidade mede a destreza manual e física, reflexos, coordenação motora, flexibilidade e rapidez de uma criatura.',
  constituicao:
    'A constituição mede a composição física de uma criatura, sua saúde, vitalidade, resistência a venenos e doenças.',
  forca:
    'A força mede o poder muscular, capacidade de carga e força bruta de uma criatura.',
  influencia:
    'A influência diz respeito a capacidades sociais, carisma, persuasão e a presença social de uma criatura.',
  mente:
    'A mente mede a capacidade intelectual, raciocínio lógico, memória e conhecimentos de uma criatura.',
  presenca:
    'A presença diz respeito aos sentidos naturais, capacidades mágicas e resiliência mental de uma criatura.',
};

/**
 * Nomes amigáveis dos atributos para exibição
 */
export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  agilidade: 'Agilidade',
  constituicao: 'Constituição',
  forca: 'Força',
  influencia: 'Influência',
  mente: 'Mente',
  presenca: 'Presença',
};

/**
 * Abreviações dos atributos (para interfaces compactas)
 */
export const ATTRIBUTE_ABBREVIATIONS: Record<AttributeName, string> = {
  agilidade: 'AGI',
  constituicao: 'CON',
  forca: 'FOR',
  influencia: 'INF',
  mente: 'MEN',
  presenca: 'PRE',
};

/**
 * Lista ordenada de atributos (para iteração)
 */
export const ATTRIBUTE_LIST: AttributeName[] = [
  'agilidade',
  'constituicao',
  'forca',
  'influencia',
  'mente',
  'presenca',
];

/**
 * Atributos corporais (físicos)
 */
export const PHYSICAL_ATTRIBUTES: AttributeName[] = [
  'agilidade',
  'constituicao',
  'forca',
];

/**
 * Atributos mentais
 */
export const MENTAL_ATTRIBUTES: AttributeName[] = [
  'influencia',
  'mente',
  'presenca',
];
