/**
 * Constantes relacionadas aos Atributos do personagem
 *
 * Os seis atributos principais do Tabuleiro do Caos RPG (livro v0.1.7):
 * - Agilidade (Agi)
 * - Corpo (Cor)
 * - Influência (Inf)
 * - Mente (Men)
 * - Essência (Ess)
 * - Instinto (Ins)
 */

import { AttributeName } from '@/types';

/**
 * Valor mínimo padrão para atributos
 * Atributos com valor 0 rolam 2d6 e escolhem o MENOR resultado
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
 * Descrições completas de cada atributo (conforme livro v0.1.7)
 */
export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeName, string> = {
  agilidade:
    'A agilidade mede a destreza manual e física, reflexos, coordenação motora, flexibilidade e rapidez de uma criatura.',
  corpo:
    'O corpo mede as capacidades físicas de uma criatura, sua saúde, força e resistência.',
  influencia:
    'A influência diz respeito às habilidades sociais de uma criatura e seu carisma.',
  mente:
    'A mente mede a capacidade intelectual, raciocínio lógico, memória e conhecimentos de uma criatura.',
  essencia:
    'A Essência diz respeito às capacidades mágicas e potencial energético de uma criatura.',
  instinto:
    'O Instinto diz respeito aos sentidos e instintos naturais de uma criatura.',
};

/**
 * Nomes amigáveis dos atributos para exibição
 */
export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  agilidade: 'Agilidade',
  corpo: 'Corpo',
  influencia: 'Influência',
  mente: 'Mente',
  essencia: 'Essência',
  instinto: 'Instinto',
};

/**
 * Abreviações dos atributos (para interfaces compactas)
 */
export const ATTRIBUTE_ABBREVIATIONS: Record<AttributeName, string> = {
  agilidade: 'AGI',
  corpo: 'COR',
  influencia: 'INF',
  mente: 'MEN',
  essencia: 'ESS',
  instinto: 'INS',
};

/**
 * Lista ordenada de atributos (para iteração)
 */
export const ATTRIBUTE_LIST: AttributeName[] = [
  'agilidade',
  'corpo',
  'influencia',
  'mente',
  'essencia',
  'instinto',
];

/**
 * Atributos físicos
 */
export const PHYSICAL_ATTRIBUTES: AttributeName[] = ['agilidade', 'corpo'];

/**
 * Atributos mentais
 */
export const MENTAL_ATTRIBUTES: AttributeName[] = ['influencia', 'mente'];

/**
 * Atributos espirituais
 */
export const SPIRITUAL_ATTRIBUTES: AttributeName[] = ['essencia', 'instinto'];

/**
 * Padrões de modificadores de atributos para Linhagem e Origem
 *
 * Segundo as regras básicas (MVP-1):
 * - Padrão 1: +2 em um atributo e -1 em outro atributo
 * - Padrão 2: +1 em dois atributos diferentes
 */
export type AttributeModifierPattern = 'plus2minus1' | 'plus1plus1';

/**
 * Labels para os padrões de modificadores
 */
export const ATTRIBUTE_MODIFIER_PATTERN_LABELS: Record<
  AttributeModifierPattern,
  string
> = {
  plus2minus1: '+2 em um atributo, -1 em outro',
  plus1plus1: '+1 em dois atributos',
};

/**
 * Descrições detalhadas dos padrões
 */
export const ATTRIBUTE_MODIFIER_PATTERN_DESCRIPTIONS: Record<
  AttributeModifierPattern,
  string
> = {
  plus2minus1:
    'Escolha um atributo para receber +2 e outro para receber -1. Representa uma linhagem/origem com um foco forte em uma característica específica.',
  plus1plus1:
    'Escolha dois atributos diferentes para receber +1 cada. Representa uma linhagem/origem balanceada com duas características fortes.',
};

/**
 * Lista de padrões disponíveis
 */
export const ATTRIBUTE_MODIFIER_PATTERNS: AttributeModifierPattern[] = [
  'plus2minus1',
  'plus1plus1',
];
