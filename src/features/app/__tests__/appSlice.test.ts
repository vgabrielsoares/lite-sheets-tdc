/**
 * Testes para o appSlice
 */

import appReducer, {
  toggleTheme,
  setThemeMode,
  openSidebar,
  closeSidebar,
  toggleSidebar,
  setSidebarWidth,
  setOfflineStatus,
  setPWAInstalled,
  updateLastSync,
  resetAppState,
  selectThemeMode,
  selectSidebarOpen,
  selectSidebarWidth,
  selectSidebarContent,
  selectIsOffline,
  selectIsPWAInstalled,
  selectLastSync,
} from '../appSlice';

describe('appSlice', () => {
  describe('reducers', () => {
    it('deve retornar o estado inicial', () => {
      expect(appReducer(undefined, { type: 'unknown' })).toEqual({
        themeMode: 'dark',
        sidebarOpen: false,
        sidebarWidth: 'md',
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      });
    });

    it('deve alternar entre tema claro e escuro', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      let actual = appReducer(initialState, toggleTheme());
      expect(actual.themeMode).toBe('light');

      actual = appReducer(actual, toggleTheme());
      expect(actual.themeMode).toBe('dark');
    });

    it('deve definir o modo do tema', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, setThemeMode('light'));
      expect(actual.themeMode).toBe('light');
    });

    it('deve abrir a sidebar com conteúdo', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(
        initialState,
        openSidebar({ content: 'attribute-details' })
      );

      expect(actual.sidebarOpen).toBe(true);
      expect(actual.sidebarContent).toBe('attribute-details');
    });

    it('deve abrir a sidebar com conteúdo e largura específica', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(
        initialState,
        openSidebar({ content: 'skill-details', width: 'lg' })
      );

      expect(actual.sidebarOpen).toBe(true);
      expect(actual.sidebarContent).toBe('skill-details');
      expect(actual.sidebarWidth).toBe('lg');
    });

    it('deve fechar a sidebar e limpar conteúdo', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: true,
        sidebarWidth: 'md' as const,
        sidebarContent: 'some-content',
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, closeSidebar());

      expect(actual.sidebarOpen).toBe(false);
      expect(actual.sidebarContent).toBeNull();
    });

    it('deve alternar abertura da sidebar', () => {
      let initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      let actual = appReducer(initialState, toggleSidebar());
      expect(actual.sidebarOpen).toBe(true);

      actual = appReducer(actual, toggleSidebar());
      expect(actual.sidebarOpen).toBe(false);
      expect(actual.sidebarContent).toBeNull();
    });

    it('deve definir a largura da sidebar', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, setSidebarWidth('sm'));
      expect(actual.sidebarWidth).toBe('sm');
    });

    it('deve definir o status offline', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, setOfflineStatus(true));
      expect(actual.isOffline).toBe(true);
    });

    it('deve definir o status de instalação PWA', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, setPWAInstalled(true));
      expect(actual.isPWAInstalled).toBe(true);
    });

    it('deve atualizar o timestamp da última sincronização', () => {
      const initialState = {
        themeMode: 'dark' as const,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      };

      const actual = appReducer(initialState, updateLastSync());

      expect(actual.lastSync).not.toBeNull();
      expect(actual.lastSync!).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      // Verifica se é uma data válida
      expect(new Date(actual.lastSync!).toString()).not.toBe('Invalid Date');
    });

    it('deve resetar o estado da aplicação', () => {
      const modifiedState = {
        themeMode: 'light' as const,
        sidebarOpen: true,
        sidebarWidth: 'lg' as const,
        sidebarContent: 'some-content',
        isOffline: true,
        isPWAInstalled: true,
        lastSync: '2024-01-01T00:00:00.000Z',
      };

      const actual = appReducer(modifiedState, resetAppState());

      expect(actual).toEqual({
        themeMode: 'dark',
        sidebarOpen: false,
        sidebarWidth: 'md',
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
      });
    });
  });

  describe('selectors', () => {
    const mockState = {
      app: {
        themeMode: 'dark' as const,
        sidebarOpen: true,
        sidebarWidth: 'lg' as const,
        sidebarContent: 'test-content',
        isOffline: true,
        isPWAInstalled: true,
        lastSync: '2024-01-01T00:00:00.000Z',
      },
    };

    it('selectThemeMode deve retornar o modo do tema', () => {
      expect(selectThemeMode(mockState)).toBe('dark');
    });

    it('selectSidebarOpen deve retornar se sidebar está aberta', () => {
      expect(selectSidebarOpen(mockState)).toBe(true);
    });

    it('selectSidebarWidth deve retornar a largura da sidebar', () => {
      expect(selectSidebarWidth(mockState)).toBe('lg');
    });

    it('selectSidebarContent deve retornar o conteúdo da sidebar', () => {
      expect(selectSidebarContent(mockState)).toBe('test-content');
    });

    it('selectIsOffline deve retornar o status offline', () => {
      expect(selectIsOffline(mockState)).toBe(true);
    });

    it('selectIsPWAInstalled deve retornar o status de instalação PWA', () => {
      expect(selectIsPWAInstalled(mockState)).toBe(true);
    });

    it('selectLastSync deve retornar o timestamp da última sincronização', () => {
      expect(selectLastSync(mockState)).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
