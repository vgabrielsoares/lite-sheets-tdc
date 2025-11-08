/**
 * App Slice - Redux Toolkit
 *
 * Gerencia o estado global da aplicação, incluindo configurações,
 * tema, preferências do usuário, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Tipo de tema da aplicação
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Estado da slice de app
 */
interface AppState {
  /** Modo do tema (claro/escuro) */
  themeMode: ThemeMode;
  /** Indica se a sidebar está aberta */
  sidebarOpen: boolean;
  /** Largura da sidebar ('sm' | 'md' | 'lg') */
  sidebarWidth: 'sm' | 'md' | 'lg';
  /** Conteúdo atual da sidebar */
  sidebarContent: string | null;
  /** Indica se a aplicação está em modo offline */
  isOffline: boolean;
  /** Indica se a aplicação foi instalada como PWA */
  isPWAInstalled: boolean;
  /** Última sincronização com IndexedDB */
  lastSync: string | null;
}

/**
 * Estado inicial
 */
const initialState: AppState = {
  themeMode: 'dark',
  sidebarOpen: false,
  sidebarWidth: 'md',
  sidebarContent: null,
  isOffline: false,
  isPWAInstalled: false,
  lastSync: null,
};

/**
 * Slice de app
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Alterna entre tema claro e escuro
     */
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },

    /**
     * Define o modo do tema
     */
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },

    /**
     * Abre a sidebar com conteúdo específico
     */
    openSidebar: (
      state,
      action: PayloadAction<{
        content: string;
        width?: 'sm' | 'md' | 'lg';
      }>
    ) => {
      state.sidebarOpen = true;
      state.sidebarContent = action.payload.content;
      if (action.payload.width) {
        state.sidebarWidth = action.payload.width;
      }
    },

    /**
     * Fecha a sidebar
     */
    closeSidebar: (state) => {
      state.sidebarOpen = false;
      state.sidebarContent = null;
    },

    /**
     * Alterna a abertura da sidebar
     */
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      if (!state.sidebarOpen) {
        state.sidebarContent = null;
      }
    },

    /**
     * Define a largura da sidebar
     */
    setSidebarWidth: (state, action: PayloadAction<'sm' | 'md' | 'lg'>) => {
      state.sidebarWidth = action.payload;
    },

    /**
     * Define o status offline
     */
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },

    /**
     * Define o status de instalação PWA
     */
    setPWAInstalled: (state, action: PayloadAction<boolean>) => {
      state.isPWAInstalled = action.payload;
    },

    /**
     * Atualiza o timestamp da última sincronização
     */
    updateLastSync: (state) => {
      state.lastSync = new Date().toISOString();
    },

    /**
     * Reseta o estado da aplicação
     */
    resetAppState: () => initialState,
  },
});

/**
 * Actions exportadas
 */
export const {
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
} = appSlice.actions;

/**
 * Selectors
 * Nota: Os selectors recebem 'any' aqui e são re-exportados com tipos corretos no store
 */

/** Retorna o modo do tema */
export const selectThemeMode = (state: any) => state.app.themeMode;

/** Retorna se a sidebar está aberta */
export const selectSidebarOpen = (state: any) => state.app.sidebarOpen;

/** Retorna a largura da sidebar */
export const selectSidebarWidth = (state: any) => state.app.sidebarWidth;

/** Retorna o conteúdo da sidebar */
export const selectSidebarContent = (state: any) => state.app.sidebarContent;

/** Retorna o status offline */
export const selectIsOffline = (state: any) => state.app.isOffline;

/** Retorna o status de instalação PWA */
export const selectIsPWAInstalled = (state: any) => state.app.isPWAInstalled;

/** Retorna o timestamp da última sincronização */
export const selectLastSync = (state: any) => state.app.lastSync;

/**
 * Reducer exportado
 */
export default appSlice.reducer;
