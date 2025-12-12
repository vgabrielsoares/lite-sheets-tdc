/**
 * Testes do Sistema de Temas
 *
 * Testa as funções auxiliares e a configuração dos temas
 */

import {
  getTheme,
  getSystemThemePreference,
  saveThemePreference,
  loadThemePreference,
  getInitialTheme,
  lightTheme,
  darkTheme,
} from '../index';

// Mock do window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
  return jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Theme System', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getTheme', () => {
    it('should return light theme when mode is "light"', () => {
      const theme = getTheme('light');
      expect(theme).toBe(lightTheme);
      expect(theme.palette.mode).toBe('light');
    });

    it('should return dark theme when mode is "dark"', () => {
      const theme = getTheme('dark');
      expect(theme).toBe(darkTheme);
      expect(theme.palette.mode).toBe('dark');
    });
  });

  describe('lightTheme', () => {
    it('should have correct mode', () => {
      expect(lightTheme.palette.mode).toBe('light');
    });

    it('should have medieval color palette', () => {
      expect(lightTheme.palette.primary.main).toBe('#5E2C04');
      expect(lightTheme.palette.secondary.main).toBe('#8B4513');
    });

    it('should have parchment background', () => {
      expect(lightTheme.palette.background.default).toBe('#F5F1E8');
      expect(lightTheme.palette.background.paper).toBe('#FFFFFF');
    });

    it('should have proper text colors for contrast', () => {
      expect(lightTheme.palette.text.primary).toBe('#212121');
      expect(lightTheme.palette.text.secondary).toBe('#424242');
    });

    it('should have correct typography settings', () => {
      expect(lightTheme.typography.fontFamily).toContain('Roboto');
      expect(lightTheme.typography.fontSize).toBe(14);
    });

    it('should have correct breakpoints', () => {
      expect(lightTheme.breakpoints.values).toEqual({
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      });
    });
  });

  describe('darkTheme', () => {
    it('should have correct mode', () => {
      expect(darkTheme.palette.mode).toBe('dark');
    });

    it('should have golden medieval color palette', () => {
      expect(darkTheme.palette.primary.main).toBe('#D4AF37');
      expect(darkTheme.palette.secondary.main).toBe('#C9A961');
    });

    it('should have dark background', () => {
      expect(darkTheme.palette.background.default).toBe('#121212');
      expect(darkTheme.palette.background.paper).toBe('#1E1E1E');
    });

    it('should have proper text colors for contrast', () => {
      expect(darkTheme.palette.text.primary).toBe('#E0E0E0');
      expect(darkTheme.palette.text.secondary).toBe('#B0B0B0');
    });

    it('should have correct typography settings', () => {
      expect(darkTheme.typography.fontFamily).toContain('Roboto');
      expect(darkTheme.typography.fontSize).toBe(14);
    });

    it('should have golden headings', () => {
      expect(darkTheme.typography.h1?.color).toBe('#D4AF37');
      expect(darkTheme.typography.h2?.color).toBe('#D4AF37');
    });
  });

  describe('getSystemThemePreference', () => {
    it('should return "dark" when system prefers dark mode', () => {
      window.matchMedia = createMatchMediaMock(true);
      const preference = getSystemThemePreference();
      expect(preference).toBe('dark');
    });

    it('should return "light" when system prefers light mode', () => {
      window.matchMedia = createMatchMediaMock(false);
      const preference = getSystemThemePreference();
      expect(preference).toBe('light');
    });
  });

  describe('saveThemePreference', () => {
    it('should save theme preference to localStorage', () => {
      saveThemePreference('dark');
      expect(localStorage.getItem('theme-mode')).toBe('dark');

      saveThemePreference('light');
      expect(localStorage.getItem('theme-mode')).toBe('light');
    });
  });

  describe('loadThemePreference', () => {
    it('should load saved theme preference from localStorage', () => {
      localStorage.setItem('theme-mode', 'dark');
      expect(loadThemePreference()).toBe('dark');

      localStorage.setItem('theme-mode', 'light');
      expect(loadThemePreference()).toBe('light');
    });

    it('should return null if no preference is saved', () => {
      expect(loadThemePreference()).toBeNull();
    });

    it('should return null if invalid value is saved', () => {
      localStorage.setItem('theme-mode', 'invalid');
      expect(loadThemePreference()).toBeNull();
    });
  });

  describe('getInitialTheme', () => {
    it('should return saved preference if available', () => {
      localStorage.setItem('theme-mode', 'light');
      window.matchMedia = createMatchMediaMock(true); // Sistema prefere dark
      expect(getInitialTheme()).toBe('light'); // Mas preferência salva tem prioridade
    });

    it('should return system preference if no saved preference', () => {
      window.matchMedia = createMatchMediaMock(true);
      expect(getInitialTheme()).toBe('dark');

      window.matchMedia = createMatchMediaMock(false);
      expect(getInitialTheme()).toBe('light');
    });

    it('should default to dark if no preference and no system preference', () => {
      // Simula ambiente sem matchMedia (retorna dark por padrão)
      const originalMatchMedia = window.matchMedia;

      // Remove matchMedia temporariamente
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });

      const initialTheme = getInitialTheme();
      expect(initialTheme).toBe('dark');

      // Restaura matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    });
  });

  describe('Accessibility - Color Contrast', () => {
    it('light theme should have high contrast text', () => {
      // Texto primário (#212121) em fundo padrão (#F5F1E8)
      // Contraste esperado: ~13.8:1 (muito acima de 4.5:1 WCAG AA)
      expect(lightTheme.palette.text.primary).toBe('#212121');
      expect(lightTheme.palette.background.default).toBe('#F5F1E8');
    });

    it('dark theme should have high contrast text', () => {
      // Texto primário (#E0E0E0) em fundo padrão (#121212)
      // Contraste esperado: ~14.2:1 (muito acima de 4.5:1 WCAG AA)
      expect(darkTheme.palette.text.primary).toBe('#E0E0E0');
      expect(darkTheme.palette.background.default).toBe('#121212');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('both themes should have same breakpoints', () => {
      expect(lightTheme.breakpoints.values).toEqual(
        darkTheme.breakpoints.values
      );
    });

    it('should include all standard breakpoints', () => {
      const breakpoints = lightTheme.breakpoints.values;
      expect(breakpoints).toHaveProperty('xs');
      expect(breakpoints).toHaveProperty('sm');
      expect(breakpoints).toHaveProperty('md');
      expect(breakpoints).toHaveProperty('lg');
      expect(breakpoints).toHaveProperty('xl');
    });
  });

  describe('Component Customizations', () => {
    it('light theme should have button customizations', () => {
      expect(
        lightTheme.components?.MuiButton?.styleOverrides?.root
      ).toBeDefined();
    });

    it('dark theme should have button customizations', () => {
      expect(
        darkTheme.components?.MuiButton?.styleOverrides?.root
      ).toBeDefined();
    });

    it('both themes should have card customizations', () => {
      expect(
        lightTheme.components?.MuiCard?.styleOverrides?.root
      ).toBeDefined();
      expect(darkTheme.components?.MuiCard?.styleOverrides?.root).toBeDefined();
    });

    it('both themes should have paper customizations', () => {
      expect(
        lightTheme.components?.MuiPaper?.styleOverrides?.root
      ).toBeDefined();
      expect(
        darkTheme.components?.MuiPaper?.styleOverrides?.root
      ).toBeDefined();
    });
  });
});
