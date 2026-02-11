import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CharacterList from '../CharacterList';
import charactersReducer from '@/features/characters/charactersSlice';
import type { Character } from '@/types';

/**
 * Mock do useRouter do Next.js
 */
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

/**
 * Helper para criar store de teste
 */
const createTestStore = (initialCharacters: Character[] = []) => {
  // Converter array de personagens para estrutura normalizada (entities + ids)
  const entities: Record<string, Character> = {};
  const ids: string[] = [];

  initialCharacters.forEach((character) => {
    entities[character.id] = character;
    ids.push(character.id);
  });

  return configureStore({
    reducer: {
      characters: charactersReducer,
    },
    preloadedState: {
      characters: {
        entities,
        ids,
        characters: initialCharacters,
        selectedCharacterId: null,
        loading: false,
        error: null,
      },
    },
  });
};

/**
 * Helper para criar mock de personagem
 */
const createMockCharacter = (id: string, name: string): Character => {
  return {
    id,
    name,
    level: 1,
    combat: {
      hp: { current: 15, max: 15, temporary: 0 },
      pp: { current: 2, max: 2, temporary: 0 },
    } as any,
  } as Character;
};

describe('CharacterList', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Estado vazio', () => {
    it('deve renderizar estado vazio quando não há personagens', () => {
      const store = createTestStore([]);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(
        screen.getByText('Nenhuma ficha criada ainda')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Criar Primeira Ficha' })
      ).toBeInTheDocument();
    });

    it('deve navegar para criação ao clicar em Criar Primeira Ficha', async () => {
      const user = userEvent.setup();
      const store = createTestStore([]);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      const button = screen.getByRole('button', {
        name: 'Criar Primeira Ficha',
      });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith('/characters/new');
    });
  });

  describe('Lista de personagens', () => {
    it('deve renderizar título "Minhas Fichas"', () => {
      const characters = [createMockCharacter('1', 'Aragorn')];
      const store = createTestStore(characters);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(screen.getByText('Minhas Fichas')).toBeInTheDocument();
    });

    it('deve renderizar botão "Nova Ficha"', () => {
      const characters = [createMockCharacter('1', 'Aragorn')];
      const store = createTestStore(characters);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(
        screen.getByRole('button', { name: /nova ficha/i })
      ).toBeInTheDocument();
    });

    it('deve renderizar todos os personagens', () => {
      const characters = [
        createMockCharacter('1', 'Aragorn'),
        createMockCharacter('2', 'Legolas'),
        createMockCharacter('3', 'Gimli'),
      ];
      const store = createTestStore(characters);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
      expect(screen.getByText('Gimli')).toBeInTheDocument();
    });

    it('deve navegar para criação ao clicar em Nova Ficha', async () => {
      const user = userEvent.setup();
      const characters = [createMockCharacter('1', 'Aragorn')];
      const store = createTestStore(characters);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      const button = screen.getByRole('button', { name: /nova ficha/i });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith('/characters/new');
    });

    it('deve navegar para visualização ao clicar em um card', async () => {
      const user = userEvent.setup();
      const characters = [createMockCharacter('test-id-123', 'Aragorn')];
      const store = createTestStore(characters);

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      const card = screen.getByRole('button', {
        name: 'Ficha do personagem Aragorn',
      });
      await user.click(card);

      expect(mockPush).toHaveBeenCalledWith('/characters?id=test-id-123');
    });
  });

  describe('Estado de carregamento', () => {
    it('deve renderizar loading spinner', () => {
      const store = configureStore({
        reducer: {
          characters: charactersReducer,
        },
        preloadedState: {
          characters: {
            entities: {},
            ids: [],
            characters: [],
            selectedCharacterId: null,
            loading: true,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Carregando fichas')).toBeInTheDocument();
    });
  });

  describe('Estado de erro', () => {
    it('deve renderizar mensagem de erro', () => {
      const store = configureStore({
        reducer: {
          characters: charactersReducer,
        },
        preloadedState: {
          characters: {
            entities: {},
            ids: [],
            characters: [],
            selectedCharacterId: null,
            loading: false,
            error: 'Erro ao carregar fichas do banco de dados',
          },
        },
      });

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(screen.getByText('Erro ao carregar fichas')).toBeInTheDocument();
      expect(
        screen.getByText('Erro ao carregar fichas do banco de dados')
      ).toBeInTheDocument();
    });

    it('deve ter botão "Tentar Novamente" em caso de erro', () => {
      const store = configureStore({
        reducer: {
          characters: charactersReducer,
        },
        preloadedState: {
          characters: {
            entities: {},
            ids: [],
            characters: [],
            selectedCharacterId: null,
            loading: false,
            error: 'Erro ao carregar fichas',
          },
        },
      });

      render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      expect(
        screen.getByRole('button', { name: 'Tentar Novamente' })
      ).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar grid com configuração responsiva', () => {
      const characters = [createMockCharacter('1', 'Aragorn')];
      const store = createTestStore(characters);

      const { container } = render(
        <Provider store={store}>
          <CharacterList />
        </Provider>
      );

      const grid = container.querySelector('.MuiGrid-root');
      expect(grid).toBeInTheDocument();
    });
  });
});
