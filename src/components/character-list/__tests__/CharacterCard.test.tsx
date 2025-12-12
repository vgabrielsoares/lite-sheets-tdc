import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterCard from '../CharacterCard';
import type { Character } from '@/types';

/**
 * Testes do componente CharacterCard
 *
 * Testa:
 * - Renderização de informações básicas
 * - Exibição condicional de campos opcionais
 * - Interação de clique
 * - Acessibilidade
 */

// Helper para criar mock mínimo de personagem (apenas campos usados pelo card)
const createMockCharacter = (overrides: Partial<Character> = {}): Character => {
  return {
    id: 'test-id-123',
    name: 'Aragorn',
    playerName: 'João Silva',
    level: 5,
    lineage: {
      name: 'Humano',
    } as any,
    origin: {
      name: 'Soldado',
    } as any,
    combat: {
      hp: { current: 45, max: 50, temporary: 0 },
      pp: { current: 8, max: 10, temporary: 0 },
    } as any,
    ...overrides,
  } as Character;
};

describe('CharacterCard', () => {
  it('deve renderizar nome do personagem', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText('Aragorn')).toBeInTheDocument();
  });

  it('deve renderizar nome do jogador quando preenchido', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText(/Jogador: João Silva/)).toBeInTheDocument();
  });

  it('não deve renderizar nome do jogador quando vazio', () => {
    const character = createMockCharacter({ playerName: undefined });
    render(<CharacterCard character={character} />);
    expect(screen.queryByText(/Jogador:/)).not.toBeInTheDocument();
  });

  it('deve renderizar nível do personagem', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
  });

  it('deve renderizar linhagem quando preenchida', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText('Humano')).toBeInTheDocument();
  });

  it('deve renderizar origem quando preenchida', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText('Soldado')).toBeInTheDocument();
  });

  it('não deve renderizar linhagem quando não preenchida', () => {
    const character = createMockCharacter({ lineage: undefined });
    render(<CharacterCard character={character} />);
    // Apenas Nível deve estar presente
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
    expect(screen.queryByText('Humano')).not.toBeInTheDocument();
  });

  it('não deve renderizar origem quando não preenchida', () => {
    const character = createMockCharacter({ origin: undefined });
    render(<CharacterCard character={character} />);
    expect(screen.queryByText('Soldado')).not.toBeInTheDocument();
  });

  it('deve renderizar PV atual/máximo', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText(/PV:/)).toBeInTheDocument();
    expect(screen.getByText(/45\/50/)).toBeInTheDocument();
  });

  it('deve renderizar PP atual/máximo', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} />);
    expect(screen.getByText(/PP:/)).toBeInTheDocument();
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const character = createMockCharacter();

    render(<CharacterCard character={character} onClick={handleClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('test-id-123');
  });

  it('deve permitir navegação por teclado (Enter)', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const character = createMockCharacter();

    render(<CharacterCard character={character} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve permitir navegação por teclado (Space)', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const character = createMockCharacter();

    render(<CharacterCard character={character} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve ter role button quando onClick não está definido', () => {
    const character = createMockCharacter();
    const { container } = render(<CharacterCard character={character} />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).not.toHaveAttribute('role', 'button');
  });

  it('deve exibir "Sem nome" quando nome não está preenchido', () => {
    const character = createMockCharacter({ name: '' });
    render(<CharacterCard character={character} />);
    expect(screen.getByText('Sem nome')).toBeInTheDocument();
  });

  it('deve ter aria-label apropriado', () => {
    const character = createMockCharacter();
    render(<CharacterCard character={character} onClick={jest.fn()} />);
    expect(
      screen.getByLabelText('Ficha do personagem Aragorn')
    ).toBeInTheDocument();
  });

  it('deve ter aria-label correto quando personagem não tem nome', () => {
    const character = createMockCharacter({ name: '' });
    render(<CharacterCard character={character} onClick={jest.fn()} />);
    expect(
      screen.getByLabelText('Ficha do personagem Sem nome')
    ).toBeInTheDocument();
  });

  // Testes para funcionalidade de delete (Issue 2.5)
  describe('Delete functionality', () => {
    it('deve exibir botão de delete quando onDelete é fornecido', () => {
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      render(<CharacterCard character={character} onDelete={handleDelete} />);

      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      expect(deleteButton).toBeInTheDocument();
    });

    it('não deve exibir botão de delete quando onDelete não é fornecido', () => {
      const character = createMockCharacter();

      render(<CharacterCard character={character} />);

      const deleteButton = screen.queryByLabelText(/deletar personagem/i);
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('deve abrir dialog de confirmação ao clicar no botão de delete', async () => {
      const user = userEvent.setup();
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      render(<CharacterCard character={character} onDelete={handleDelete} />);

      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      await user.click(deleteButton);

      expect(screen.getByText('Deletar Personagem')).toBeInTheDocument();
      expect(
        screen.getByText(
          /tem certeza que deseja deletar o personagem "Aragorn"/i
        )
      ).toBeInTheDocument();
    });

    it('não deve propagar clique do botão delete para o card', async () => {
      const user = userEvent.setup();
      const character = createMockCharacter();
      const handleClick = jest.fn();
      const handleDelete = jest.fn();

      render(
        <CharacterCard
          character={character}
          onClick={handleClick}
          onDelete={handleDelete}
        />
      );

      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      await user.click(deleteButton);

      // onClick do card não deve ter sido chamado
      expect(handleClick).not.toHaveBeenCalled();
      // Dialog deve estar aberto
      expect(screen.getByText('Deletar Personagem')).toBeInTheDocument();
    });

    it('deve chamar onDelete ao confirmar exclusão', async () => {
      const user = userEvent.setup();
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      render(<CharacterCard character={character} onDelete={handleDelete} />);

      // Abre o dialog
      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      await user.click(deleteButton);

      // Confirma a exclusão
      const confirmButton = screen.getByRole('button', { name: /deletar/i });
      await user.click(confirmButton);

      expect(handleDelete).toHaveBeenCalledTimes(1);
      expect(handleDelete).toHaveBeenCalledWith('test-id-123');
    });

    it('não deve chamar onDelete ao cancelar exclusão', async () => {
      const user = userEvent.setup();
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      render(<CharacterCard character={character} onDelete={handleDelete} />);

      // Abre o dialog
      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      await user.click(deleteButton);

      // Cancela a exclusão
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(handleDelete).not.toHaveBeenCalled();
    });

    it('deve desabilitar botão de delete quando isDeleting é true', () => {
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      render(
        <CharacterCard
          character={character}
          onDelete={handleDelete}
          isDeleting={true}
        />
      );

      const deleteButton = screen.getByLabelText(/deletar personagem aragorn/i);
      expect(deleteButton).toBeDisabled();
    });

    it('deve aplicar opacidade reduzida ao card quando isDeleting é true', () => {
      const character = createMockCharacter();
      const handleDelete = jest.fn();

      const { container } = render(
        <CharacterCard
          character={character}
          onDelete={handleDelete}
          isDeleting={true}
        />
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).toHaveStyle({ opacity: 0.6 });
    });
  });
});
