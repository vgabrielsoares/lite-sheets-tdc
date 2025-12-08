/**
 * Types relacionados a Particularidades (Traits)
 *
 * Este arquivo define tipos e funções utilitárias para trabalhar com
 * características complementares e completas do personagem.
 */

/**
 * Característica complementar (positiva ou negativa)
 *
 * Características complementares têm pontos que devem ser balanceados.
 * Características negativas dão desvantagens (pontos negativos) e
 * características positivas dão vantagens (pontos positivos).
 * O balanço total deve ser 0.
 */
export interface ComplementaryTrait {
  /** Nome da característica */
  name: string;
  /** Descrição detalhada */
  description: string;
  /** Valor de pontos (positivo ou negativo) */
  points: number;
}

/**
 * Característica completa (já balanceada)
 *
 * Características completas são features já balanceadas que não
 * afetam o sistema de pontos de características complementares.
 */
export interface CompleteTrait {
  /** Nome da característica */
  name: string;
  /** Descrição detalhada */
  description: string;
}

/**
 * Calcula o balanço total das características complementares
 *
 * @param negativeTraits - Array de características negativas
 * @param positiveTraits - Array de características positivas
 * @returns Soma total dos pontos (deve ser 0 para estar balanceado)
 *
 * @example
 * ```ts
 * const negative = [{ name: 'Medo', description: '...', points: -2 }];
 * const positive = [{ name: 'Corajoso', description: '...', points: 2 }];
 * const balance = calculateTraitBalance(negative, positive); // 0
 * ```
 */
export function calculateTraitBalance(
  negativeTraits: ComplementaryTrait[],
  positiveTraits: ComplementaryTrait[]
): number {
  const negativeSum = negativeTraits.reduce(
    (sum, trait) => sum + trait.points,
    0
  );
  const positiveSum = positiveTraits.reduce(
    (sum, trait) => sum + trait.points,
    0
  );
  return negativeSum + positiveSum;
}

/**
 * Verifica se as características estão balanceadas
 *
 * @param negativeTraits - Array de características negativas
 * @param positiveTraits - Array de características positivas
 * @returns true se o balanço é 0, false caso contrário
 */
export function areTraitsBalanced(
  negativeTraits: ComplementaryTrait[],
  positiveTraits: ComplementaryTrait[]
): boolean {
  return calculateTraitBalance(negativeTraits, positiveTraits) === 0;
}

/**
 * Cria uma característica complementar vazia
 *
 * @param isNegative - Se verdadeiro, cria com pontos negativos padrão
 * @returns Característica vazia para edição
 */
export function createEmptyComplementaryTrait(
  isNegative: boolean = false
): ComplementaryTrait {
  return {
    name: '',
    description: '',
    points: isNegative ? -1 : 1,
  };
}

/**
 * Cria uma característica completa vazia
 *
 * @returns Característica vazia para edição
 */
export function createEmptyCompleteTrait(): CompleteTrait {
  return {
    name: '',
    description: '',
  };
}
