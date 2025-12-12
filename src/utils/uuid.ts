/**
 * UUID Generator - Geração de UUIDs usando API nativa do navegador
 *
 * Utiliza crypto.randomUUID() (nativo em navegadores modernos) com
 * fallback para a biblioteca uuid em navegadores antigos.
 *
 * Benefícios:
 * - Reduz bundle size em ~50KB quando suportado nativamente
 * - Melhora performance (API nativa é mais rápida)
 * - Mantém compatibilidade com navegadores antigos
 *
 * Suporte:
 * - Chrome 92+ (Set 2021)
 * - Firefox 95+ (Dez 2021)
 * - Safari 15.4+ (Mar 2022)
 * - Edge 92+ (Set 2021)
 * - Opera 78+ (Set 2021)
 *
 * @example
 * import { uuidv4 } from '@/utils/uuid';
 *
 * const id = uuidv4(); // "550e8400-e29b-41d4-a716-446655440000"
 */

/**
 * Gera um UUID v4 usando a API nativa do navegador quando disponível,
 * com fallback para a biblioteca uuid.
 *
 * @returns UUID v4 string
 *
 * @example
 * const characterId = uuidv4();
 * console.log(characterId); // "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
 */
export function uuidv4(): string {
  // Verificar se crypto.randomUUID() está disponível
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // Fallback para uuid library (apenas se necessário)
  // Lazy import para evitar bundle bloat em navegadores modernos
  const { v4 } = require('uuid');
  return v4();
}

/**
 * Verifica se a API nativa de UUID está disponível
 *
 * @returns true se crypto.randomUUID() está disponível
 *
 * @example
 * if (isNativeUUIDAvailable()) {
 *   console.log('Usando API nativa - bundle otimizado!');
 * } else {
 *   console.log('Usando fallback - considere atualizar navegador');
 * }
 */
export function isNativeUUIDAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  );
}

/**
 * Valida se uma string é um UUID válido (v4)
 *
 * @param uuid - String para validar
 * @returns true se é um UUID v4 válido
 *
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 * isValidUUID('invalid'); // false
 * isValidUUID(''); // false
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Gera múltiplos UUIDs de uma vez
 *
 * @param count - Número de UUIDs para gerar
 * @returns Array de UUIDs
 *
 * @example
 * const ids = generateBulkUUIDs(5);
 * console.log(ids.length); // 5
 * console.log(isValidUUID(ids[0])); // true
 */
export function generateBulkUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => uuidv4());
}
