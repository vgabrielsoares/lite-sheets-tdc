import { useState, useEffect } from 'react';

/**
 * Hook de debounce para atrasar a atualização de um valor
 *
 * Retorna o valor após um delay especificado, útil para otimizar
 * chamadas a APIs ou validações que não precisam acontecer a cada
 * tecla digitada.
 *
 * @param value - Valor a ser "debouncado"
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor após o delay
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // Esta função só será chamada 300ms após o usuário parar de digitar
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar timeout para atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancelar timeout se o valor mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
