import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

/**
 * Testes do componente EmptyState
 *
 * Testa:
 * - Renderização de textos
 * - Comportamento do botão
 * - Customização via props
 * - Acessibilidade
 */

describe('EmptyState', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('deve renderizar título', () => {
    render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    expect(screen.getByText('Nenhuma ficha criada')).toBeInTheDocument();
  });

  it('deve renderizar descrição quando fornecida', () => {
    render(
      <EmptyState
        title="Nenhuma ficha criada"
        description="Comece criando sua primeira ficha"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    expect(
      screen.getByText('Comece criando sua primeira ficha')
    ).toBeInTheDocument();
  });

  it('não deve renderizar descrição quando não fornecida', () => {
    const { container } = render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    // Não deve existir elemento <p> para descrição
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('deve renderizar botão com label correto', () => {
    render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Primeira Ficha"
        onAction={mockOnAction}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Criar Primeira Ficha' })
    ).toBeInTheDocument();
  });

  it('deve chamar onAction quando botão é clicado', async () => {
    const user = userEvent.setup();

    render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar ícone padrão quando não fornecido', () => {
    const { container } = render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    // Ícone MUI deve estar presente
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('deve renderizar ícone customizado quando fornecido', () => {
    const CustomIcon = <div data-testid="custom-icon">Custom Icon</div>;

    render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
        icon={CustomIcon}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('deve ter role="status" para acessibilidade', () => {
    const { container } = render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('deve ter aria-live="polite" para acessibilidade', () => {
    const { container } = render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('deve renderizar botão com startIcon', () => {
    render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    // Verifica se o botão tem um ícone (AddIcon do MUI)
    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('deve aplicar responsividade nos estilos', () => {
    const { container } = render(
      <EmptyState
        title="Nenhuma ficha criada"
        actionLabel="Criar Ficha"
        onAction={mockOnAction}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ display: 'flex' });
  });
});
