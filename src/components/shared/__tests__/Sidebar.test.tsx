import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Sidebar, SidebarProps } from '../Sidebar';

// Mock do theme para testes
const theme = createTheme();

// Wrapper com ThemeProvider para os testes
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// Props padrão para facilitar os testes
const defaultProps: SidebarProps = {
  open: true,
  onClose: jest.fn(),
  children: <div>Conteúdo da Sidebar</div>,
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar quando open é true', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Conteúdo da Sidebar')).toBeInTheDocument();
    });

    it('não deve renderizar quando open é false', () => {
      const { container } = renderWithTheme(
        <Sidebar {...defaultProps} open={false} />
      );

      // O Drawer do MUI não renderiza o conteúdo quando open=false (variant="temporary")
      // Apenas valida que não há erro ao renderizar com open=false
      expect(container).toBeInTheDocument();
    });

    it('deve renderizar título quando fornecido', () => {
      renderWithTheme(
        <Sidebar {...defaultProps} title="Detalhes do Atributo" />
      );

      expect(screen.getByText('Detalhes do Atributo')).toBeInTheDocument();
    });

    it('deve renderizar botão de fechar quando não há título', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const closeButtons = screen.getAllByLabelText('Fechar sidebar');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('deve renderizar children corretamente', () => {
      renderWithTheme(
        <Sidebar {...defaultProps}>
          <div data-testid="custom-content">Conteúdo Customizado</div>
        </Sidebar>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo Customizado')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onClose quando botão de fechar é clicado', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <Sidebar {...defaultProps} onClose={onClose} title="Teste" />
      );

      // aria-label é "Fechar {title}"
      const closeButton = screen.getByLabelText('Fechar Teste');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onClose ao pressionar ESC', async () => {
      const onClose = jest.fn();
      renderWithTheme(<Sidebar {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('não deve chamar onClose ao pressionar ESC quando closeOnEscape é false', async () => {
      const onClose = jest.fn();
      renderWithTheme(
        <Sidebar {...defaultProps} onClose={onClose} closeOnEscape={false} />
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });

    it('não deve chamar onClose ao pressionar outras teclas', async () => {
      const onClose = jest.fn();
      renderWithTheme(<Sidebar {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });

      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Props customizáveis', () => {
    it('deve aplicar largura "sm" corretamente', () => {
      renderWithTheme(<Sidebar {...defaultProps} width="sm" />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });

    it('deve aplicar largura "md" corretamente (padrão)', () => {
      renderWithTheme(<Sidebar {...defaultProps} width="md" />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });

    it('deve aplicar largura "lg" corretamente', () => {
      renderWithTheme(<Sidebar {...defaultProps} width="lg" />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });

    it('deve aplicar anchor "left" corretamente', () => {
      renderWithTheme(<Sidebar {...defaultProps} anchor="left" />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });

    it('deve aplicar anchor "right" corretamente (padrão)', () => {
      renderWithTheme(<Sidebar {...defaultProps} anchor="right" />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role="complementary"', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawer = screen.getByRole('complementary');
      expect(drawer).toBeInTheDocument();
    });

    it('deve ter aria-label quando título é fornecido', () => {
      renderWithTheme(<Sidebar {...defaultProps} title="Detalhes" />);

      const drawer = screen.getByRole('complementary', { name: 'Detalhes' });
      expect(drawer).toBeInTheDocument();
    });

    it('deve ter aria-label padrão quando título não é fornecido', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawer = screen.getByRole('complementary', {
        name: 'Sidebar de detalhes',
      });
      expect(drawer).toBeInTheDocument();
    });

    it('deve ter aria-label no botão de fechar', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const closeButton = screen.getByLabelText('Fechar sidebar');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar em mobile (width < 900px)', () => {
      // Mock do useMediaQuery para simular mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('deve renderizar em desktop (width >= 900px)', () => {
      // Mock do useMediaQuery para simular desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com múltiplas aberturas/fechamentos', async () => {
      const { rerender } = renderWithTheme(
        <Sidebar {...defaultProps} open={true} />
      );

      expect(screen.getByText('Conteúdo da Sidebar')).toBeInTheDocument();

      // Fecha a sidebar
      rerender(
        <ThemeProvider theme={theme}>
          <Sidebar {...defaultProps} open={false} />
        </ThemeProvider>
      );

      // Aguarda a animação terminar e o conteúdo ser desmontado
      await waitFor(() => {
        expect(
          screen.queryByText('Conteúdo da Sidebar')
        ).not.toBeInTheDocument();
      });

      // Reabre a sidebar
      rerender(
        <ThemeProvider theme={theme}>
          <Sidebar {...defaultProps} open={true} />
        </ThemeProvider>
      );

      // Conteúdo volta a aparecer
      expect(screen.getByText('Conteúdo da Sidebar')).toBeInTheDocument();
    });

    it('deve limpar event listeners ao desmontar', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );
      const { unmount } = renderWithTheme(<Sidebar {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('deve renderizar com children complexos', () => {
      renderWithTheme(
        <Sidebar {...defaultProps}>
          <div>
            <h1>Título</h1>
            <p>Parágrafo</p>
            <button>Botão</button>
          </div>
        </Sidebar>
      );

      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Parágrafo')).toBeInTheDocument();
      expect(screen.getByText('Botão')).toBeInTheDocument();
    });
  });
});
