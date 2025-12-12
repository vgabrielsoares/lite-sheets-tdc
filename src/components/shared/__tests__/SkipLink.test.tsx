import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkipLink } from '../SkipLink';

describe('SkipLink', () => {
  describe('Renderização', () => {
    it('deve renderizar com label padrão', () => {
      render(<SkipLink />);
      expect(
        screen.getByText('Pular para o conteúdo principal')
      ).toBeInTheDocument();
    });

    it('deve renderizar com label customizado', () => {
      render(<SkipLink label="Ir para conteúdo" />);
      expect(screen.getByText('Ir para conteúdo')).toBeInTheDocument();
    });

    it('deve ter href correto com targetId padrão', () => {
      render(<SkipLink />);
      const link = screen.getByText('Pular para o conteúdo principal');
      expect(link).toHaveAttribute('href', '#main-content');
    });

    it('deve ter href correto com targetId customizado', () => {
      render(<SkipLink targetId="custom-content" />);
      const link = screen.getByText('Pular para o conteúdo principal');
      expect(link).toHaveAttribute('href', '#custom-content');
    });
  });

  describe('Comportamento', () => {
    it('deve focar no elemento alvo ao clicar', () => {
      // Criar elemento alvo no DOM
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      targetElement.tabIndex = -1;
      document.body.appendChild(targetElement);

      render(<SkipLink />);
      const link = screen.getByText('Pular para o conteúdo principal');

      // Mock do scrollIntoView
      const scrollIntoViewMock = jest.fn();
      targetElement.scrollIntoView = scrollIntoViewMock;

      fireEvent.click(link);

      expect(document.activeElement).toBe(targetElement);
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      // Limpar
      document.body.removeChild(targetElement);
    });

    it('não deve causar erro se elemento alvo não existir', () => {
      render(<SkipLink targetId="non-existent" />);
      const link = screen.getByText('Pular para o conteúdo principal');

      // Não deve lançar erro
      expect(() => fireEvent.click(link)).not.toThrow();
    });

    it('deve prevenir comportamento padrão do link', () => {
      render(<SkipLink />);
      const link = screen.getByText('Pular para o conteúdo principal');

      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true,
      });

      link.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role de link', () => {
      render(<SkipLink />);
      const link = screen.getByRole('link', {
        name: 'Pular para o conteúdo principal',
      });
      expect(link).toBeInTheDocument();
    });

    it('deve ser acessível via teclado', () => {
      render(<SkipLink />);
      const link = screen.getByText('Pular para o conteúdo principal');

      // O foco é aplicado automaticamente, apenas verificar se é focável
      expect(link).toBeInTheDocument();
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('deve ter estrutura acessível', () => {
      render(<SkipLink />);
      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href');
      expect(link).toHaveAccessibleName();
    });
  });

  describe('Estilo visual', () => {
    it('deve estar oculto por padrão (posicionamento off-screen)', () => {
      const { container } = render(<SkipLink />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveStyle({
        position: 'absolute',
        left: '-9999px',
      });
    });
  });
});
