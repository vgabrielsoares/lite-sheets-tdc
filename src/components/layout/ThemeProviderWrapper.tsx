/**
 * ThemeProviderWrapper Component
 *
 * Wrapper que gerencia o tema da aplicação integrando
 * Material UI ThemeProvider com Redux.
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectThemeMode, setThemeMode } from '@/features/app/appSlice';
import {
  getTheme,
  loadThemePreference,
  saveThemePreference,
  getSystemThemePreference,
} from '@/theme';

/**
 * Props do ThemeProviderWrapper
 */
interface ThemeProviderWrapperProps {
  /** Componentes filhos */
  children: ReactNode;
}

/**
 * Wrapper do ThemeProvider com integração Redux
 *
 * Gerencia o tema da aplicação:
 * - Carrega preferência salva do localStorage
 * - Sincroniza tema com Redux
 * - Salva mudanças de tema
 * - Aplica CssBaseline para reset de estilos
 *
 * @example
 * ```tsx
 * // Em layout.tsx
 * <ThemeProviderWrapper>
 *   <App />
 * </ThemeProviderWrapper>
 * ```
 */
export default function ThemeProviderWrapper({
  children,
}: ThemeProviderWrapperProps) {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const theme = getTheme(themeMode);

  /**
   * Carrega preferência de tema ao montar
   */
  useEffect(() => {
    const savedTheme = loadThemePreference();
    const initialTheme = savedTheme || getSystemThemePreference();

    // Se o tema inicial for diferente do Redux, atualiza
    if (initialTheme !== themeMode) {
      dispatch(setThemeMode(initialTheme));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar

  /**
   * Salva preferência quando tema muda
   */
  useEffect(() => {
    saveThemePreference(themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline: Reset de estilos globais e baseline do Material UI */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
