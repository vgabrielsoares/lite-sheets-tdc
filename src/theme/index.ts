/**
 * Theme Configuration - Configuração de Temas
 *
 * Exporta os temas claro e escuro e funções auxiliares
 * para gerenciamento de tema na aplicação.
 */

import { Theme } from '@mui/material/styles';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

/**
 * Tipo de modo de tema
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Obtém o tema baseado no modo
 *
 * @param mode - Modo do tema ('light' ou 'dark')
 * @returns Tema Material UI correspondente
 *
 * @example
 * ```typescript
 * const currentTheme = getTheme('dark');
 * ```
 */
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

/**
 * Detecta preferência de tema do sistema operacional
 *
 * @returns 'light' ou 'dark' baseado na preferência do sistema
 *
 * @example
 * ```typescript
 * const systemPreference = getSystemThemePreference();
 * // 'dark' se o sistema estiver em modo escuro
 * ```
 */
export const getSystemThemePreference = (): ThemeMode => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Default no SSR ou quando matchMedia não está disponível
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

/**
 * Salva preferência de tema no localStorage
 *
 * @param mode - Modo do tema a ser salvo
 *
 * @example
 * ```typescript
 * saveThemePreference('dark');
 * ```
 */
export const saveThemePreference = (mode: ThemeMode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-mode', mode);
  }
};

/**
 * Carrega preferência de tema do localStorage
 *
 * @returns Modo do tema salvo ou null se não houver
 *
 * @example
 * ```typescript
 * const savedTheme = loadThemePreference();
 * // 'dark' se o usuário salvou essa preferência
 * ```
 */
export const loadThemePreference = (): ThemeMode | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const saved = localStorage.getItem('theme-mode');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return null;
};

/**
 * Obtém o tema inicial baseado em preferência salva ou sistema
 *
 * @returns Modo do tema inicial
 *
 * @example
 * ```typescript
 * const initialTheme = getInitialTheme();
 * // Usa preferência salva, depois sistema, depois padrão 'dark'
 * ```
 */
export const getInitialTheme = (): ThemeMode => {
  const saved = loadThemePreference();
  if (saved) {
    return saved;
  }

  return getSystemThemePreference();
};

/**
 * Exportações nomeadas dos temas
 */
export { lightTheme, darkTheme };

/**
 * Exportação padrão
 */
export default {
  lightTheme,
  darkTheme,
  getTheme,
  getSystemThemePreference,
  saveThemePreference,
  loadThemePreference,
  getInitialTheme,
};
