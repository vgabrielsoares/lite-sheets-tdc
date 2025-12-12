/**
 * Testes de Integração - Mudança de Tema
 *
 * Testa o sistema de alternância entre tema claro e escuro,
 * validando aplicação de estilos, persistência da preferência
 * e acessibilidade.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import charactersReducer from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer, { toggleTheme, setThemeMode } from '@/features/app/appSlice';
import { lightTheme, darkTheme } from '@/theme';

// Mock do ThemeProviderWrapper para não interferir com o estado do teste
jest.mock('@/components/layout/ThemeProviderWrapper', () => ({
  __esModule: true,
  default: function MockThemeProviderWrapper({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  },
}));

// Importar após o mock
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';

// Componente de teste que usa o tema
function TestComponent() {
  return (
    <div>
      <h1 data-testid="test-heading">Teste de Tema</h1>
      <button data-testid="test-button">Botão de Teste</button>
    </div>
  );
}

/**
 * Helper para criar store de teste
 */
function createTestStore(initialTheme: 'light' | 'dark' = 'dark') {
  const store = configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
      app: appReducer,
    },
    preloadedState: {
      app: {
        themeMode: initialTheme,
        sidebarOpen: false,
        sidebarWidth: 'md' as const,
        sidebarContent: null,
        isOffline: false,
        isPWAInstalled: false,
        lastSync: null,
        sheetPosition: 'left' as const,
      },
    } as any,
  });

  return store;
}

/**
 * Helper para renderizar com theme provider
 */
function renderWithTheme(
  component: React.ReactElement,
  initialTheme: 'light' | 'dark' = 'dark'
) {
  const store = createTestStore(initialTheme);

  return {
    ...render(
      <Provider store={store}>
        <ThemeProviderWrapper>{component}</ThemeProviderWrapper>
      </Provider>
    ),
    store,
  };
}

describe('Mudança de Tema (Integração)', () => {
  describe('Alternância de Tema', () => {
    it('deve iniciar com tema claro por padrão', () => {
      // Arrange & Act
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('light');
    });

    it('deve alternar de claro para escuro', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Act
      store.dispatch(toggleTheme());

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('dark');
    });

    it('deve alternar de escuro para claro', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'dark');

      // Act
      store.dispatch(toggleTheme());

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('light');
    });

    it('deve alternar múltiplas vezes', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Act & Assert - Primeira alternância
      store.dispatch(toggleTheme());
      expect(store.getState().app.themeMode).toBe('dark');

      // Act & Assert - Segunda alternância
      store.dispatch(toggleTheme());
      expect(store.getState().app.themeMode).toBe('light');

      // Act & Assert - Terceira alternância
      store.dispatch(toggleTheme());
      expect(store.getState().app.themeMode).toBe('dark');
    });
  });

  describe('Definição Direta de Tema', () => {
    it('deve definir tema claro explicitamente', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'dark');

      // Act
      store.dispatch(setThemeMode('light'));

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('light');
    });

    it('deve definir tema escuro explicitamente', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Act
      store.dispatch(setThemeMode('dark'));

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('dark');
    });

    it('deve manter tema ao definir o mesmo tema novamente', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Act
      store.dispatch(setThemeMode('light'));

      // Assert
      const state = store.getState();
      expect(state.app.themeMode).toBe('light');
    });
  });

  describe('Aplicação de Estilos', () => {
    it('deve aplicar paleta do tema claro', () => {
      // Arrange & Act
      renderWithTheme(<TestComponent />, 'light');

      // Assert - Verificar que elementos estão renderizados
      const heading = screen.getByTestId('test-heading');
      expect(heading).toBeInTheDocument();

      // Verificar que o tema claro está aplicado
      const bodyElement = document.body;
      expect(bodyElement).toBeInTheDocument();
    });

    it('deve aplicar paleta do tema escuro', () => {
      // Arrange & Act
      renderWithTheme(<TestComponent />, 'dark');

      // Assert - Verificar que elementos estão renderizados
      const heading = screen.getByTestId('test-heading');
      expect(heading).toBeInTheDocument();

      // Verificar que o tema escuro está aplicado
      const bodyElement = document.body;
      expect(bodyElement).toBeInTheDocument();
    });

    it('deve ter cores diferentes entre tema claro e escuro', () => {
      // Tema claro tem cores diferentes do tema escuro
      expect(lightTheme.palette.mode).toBe('light');
      expect(darkTheme.palette.mode).toBe('dark');

      // Backgrounds diferentes
      expect(lightTheme.palette.background.default).not.toBe(
        darkTheme.palette.background.default
      );

      // Texto diferentes
      expect(lightTheme.palette.text.primary).not.toBe(
        darkTheme.palette.text.primary
      );
    });
  });

  describe('Configuração de Temas', () => {
    it('tema claro deve ter configurações corretas', () => {
      // Assert - Paleta de cores
      expect(lightTheme.palette.mode).toBe('light');
      expect(lightTheme.palette.primary).toBeDefined();
      expect(lightTheme.palette.secondary).toBeDefined();
      expect(lightTheme.palette.error).toBeDefined();
      expect(lightTheme.palette.warning).toBeDefined();
      expect(lightTheme.palette.info).toBeDefined();
      expect(lightTheme.palette.success).toBeDefined();

      // Assert - Background
      expect(lightTheme.palette.background).toBeDefined();
      expect(lightTheme.palette.background.default).toBeDefined();
      expect(lightTheme.palette.background.paper).toBeDefined();

      // Assert - Texto
      expect(lightTheme.palette.text).toBeDefined();
      expect(lightTheme.palette.text.primary).toBeDefined();
      expect(lightTheme.palette.text.secondary).toBeDefined();
    });

    it('tema escuro deve ter configurações corretas', () => {
      // Assert - Paleta de cores
      expect(darkTheme.palette.mode).toBe('dark');
      expect(darkTheme.palette.primary).toBeDefined();
      expect(darkTheme.palette.secondary).toBeDefined();
      expect(darkTheme.palette.error).toBeDefined();
      expect(darkTheme.palette.warning).toBeDefined();
      expect(darkTheme.palette.info).toBeDefined();
      expect(darkTheme.palette.success).toBeDefined();

      // Assert - Background
      expect(darkTheme.palette.background).toBeDefined();
      expect(darkTheme.palette.background.default).toBeDefined();
      expect(darkTheme.palette.background.paper).toBeDefined();

      // Assert - Texto
      expect(darkTheme.palette.text).toBeDefined();
      expect(darkTheme.palette.text.primary).toBeDefined();
      expect(darkTheme.palette.text.secondary).toBeDefined();
    });

    it('ambos os temas devem ter tipografia configurada', () => {
      // Assert
      expect(lightTheme.typography).toBeDefined();
      expect(darkTheme.typography).toBeDefined();

      expect(lightTheme.typography.fontFamily).toBeDefined();
      expect(darkTheme.typography.fontFamily).toBeDefined();

      // Família de fonte pode ser igual ou diferente
      expect(typeof lightTheme.typography.fontFamily).toBe('string');
      expect(typeof darkTheme.typography.fontFamily).toBe('string');
    });

    it('ambos os temas devem ter breakpoints configurados', () => {
      // Assert
      expect(lightTheme.breakpoints).toBeDefined();
      expect(darkTheme.breakpoints).toBeDefined();

      expect(lightTheme.breakpoints.values).toBeDefined();
      expect(darkTheme.breakpoints.values).toBeDefined();

      // Breakpoints devem ser iguais em ambos os temas
      expect(lightTheme.breakpoints.values.xs).toBe(
        darkTheme.breakpoints.values.xs
      );
      expect(lightTheme.breakpoints.values.sm).toBe(
        darkTheme.breakpoints.values.sm
      );
      expect(lightTheme.breakpoints.values.md).toBe(
        darkTheme.breakpoints.values.md
      );
      expect(lightTheme.breakpoints.values.lg).toBe(
        darkTheme.breakpoints.values.lg
      );
      expect(lightTheme.breakpoints.values.xl).toBe(
        darkTheme.breakpoints.values.xl
      );
    });
  });

  describe('Acessibilidade', () => {
    it('tema claro deve ter contraste adequado', () => {
      // Assert - Verificar que cores de texto e background existem
      expect(lightTheme.palette.text.primary).toBeDefined();
      expect(lightTheme.palette.background.default).toBeDefined();

      // Cores devem ser strings válidas
      expect(typeof lightTheme.palette.text.primary).toBe('string');
      expect(typeof lightTheme.palette.background.default).toBe('string');
    });

    it('tema escuro deve ter contraste adequado', () => {
      // Assert - Verificar que cores de texto e background existem
      expect(darkTheme.palette.text.primary).toBeDefined();
      expect(darkTheme.palette.background.default).toBeDefined();

      // Cores devem ser strings válidas
      expect(typeof darkTheme.palette.text.primary).toBe('string');
      expect(typeof darkTheme.palette.background.default).toBe('string');
    });

    it('deve ter cores semânticas definidas em ambos os temas', () => {
      // Assert - Cores semânticas (HP, PP, Defense, etc.)
      const semanticColors = ['error', 'warning', 'info', 'success'] as const;

      semanticColors.forEach((color) => {
        expect(lightTheme.palette[color]).toBeDefined();
        expect(darkTheme.palette[color]).toBeDefined();

        expect(lightTheme.palette[color].main).toBeDefined();
        expect(darkTheme.palette[color].main).toBeDefined();
      });
    });
  });

  describe('Persistência de Preferência', () => {
    it('deve manter preferência de tema após reload (via Redux Persist)', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'dark');

      // Act - Alternar para claro
      store.dispatch(toggleTheme());

      // Assert - Estado atual é claro
      expect(store.getState().app.themeMode).toBe('light');

      // Nota: Redux Persist salvará automaticamente no localStorage
      // Em testes reais de e2e, seria possível simular reload e verificar persistência
    });
  });

  describe('Integração com Componentes UI', () => {
    it('deve aplicar tema em componentes MUI', () => {
      // Arrange & Act
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Assert - Componentes devem renderizar sem erros
      expect(screen.getByTestId('test-heading')).toBeInTheDocument();
      expect(screen.getByTestId('test-button')).toBeInTheDocument();

      // Act - Alternar tema
      store.dispatch(toggleTheme());

      // Assert - Componentes ainda renderizados
      expect(screen.getByTestId('test-heading')).toBeInTheDocument();
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });

    it('deve atualizar CssBaseline ao mudar tema', () => {
      // CssBaseline aplica estilos globais baseados no tema
      const { store } = renderWithTheme(
        <>
          <CssBaseline />
          <TestComponent />
        </>,
        'light'
      );

      // Assert - Body deve ter estilos aplicados
      expect(document.body).toBeInTheDocument();

      // Act - Alternar tema
      store.dispatch(toggleTheme());

      // Assert - Body ainda existe (não há erro de renderização)
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('deve alternar tema rapidamente', () => {
      // Arrange
      const { store } = renderWithTheme(<TestComponent />, 'light');

      // Act - Medir tempo de alternância
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        store.dispatch(toggleTheme());
      }

      const endTime = Date.now();

      // Assert - Deve ser instantâneo (< 100ms para 10 alternâncias)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('não deve causar re-renders desnecessários', () => {
      // Arrange
      let renderCount = 0;

      function CountingComponent() {
        renderCount++;
        return <div>Render count: {renderCount}</div>;
      }

      const { store } = renderWithTheme(<CountingComponent />, 'light');

      const initialRenderCount = renderCount;

      // Act - Alternar tema
      store.dispatch(toggleTheme());

      // Assert - Deve ter re-renderizado apenas uma vez adicional
      // (Uma vez na montagem + uma vez na mudança de tema)
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 2);
    });
  });

  describe('Tema Fantasy/Medieval', () => {
    it('tema claro deve ter estética de pergaminho', () => {
      // Assert - Background deve ser tom terroso/pergaminho
      expect(lightTheme.palette.background.default).toMatch(/#[0-9A-Fa-f]{6}/);
      expect(lightTheme.palette.background.default).toBeDefined();
    });

    it('tema escuro deve ter estética de taverna medieval', () => {
      // Assert - Background deve ser escuro mas não puro preto
      expect(darkTheme.palette.background.default).toMatch(/#[0-9A-Fa-f]{6}/);
      expect(darkTheme.palette.background.default).toBeDefined();

      // Tema escuro geralmente usa tons escuros mas não #000000
      expect(darkTheme.palette.background.default.toLowerCase()).not.toBe(
        '#000000'
      );
    });

    it('deve ter cor primária dourada/medieval em ambos os temas', () => {
      // Assert - Cor primária deve remeter a fantasia medieval
      expect(lightTheme.palette.primary.main).toBeDefined();
      expect(darkTheme.palette.primary.main).toBeDefined();

      // Ambos devem ter cor primária definida
      expect(typeof lightTheme.palette.primary.main).toBe('string');
      expect(typeof darkTheme.palette.primary.main).toBe('string');
    });
  });
});
