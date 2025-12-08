import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer from '@/features/characters/charactersSlice';
import appReducer from '@/features/app/appSlice';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/lightTheme';
import { SpellCard } from '../SpellCard';
import type { KnownSpell } from '@/types/spells';

const createMockStore = () =>
  configureStore({
    reducer: {
      characters: charactersReducer,
      app: appReducer,
    },
  });

describe('SpellCard', () => {
  const mockSpell: KnownSpell = {
    spellId: 'spell-1',
    circle: 3,
    name: 'Bola de Fogo',
    matrix: 'arcana',
    spellcastingSkill: 'arcano',
    notes: 'Ótimo para grupos de inimigos',
  };

  const onView = jest.fn();
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderComponent = (spell = mockSpell) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={lightTheme}>
          <SpellCard
            spell={spell}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </ThemeProvider>
      </Provider>
    );
  };

  describe('Renderização básica', () => {
    it('deve renderizar o nome do feitiço', () => {
      renderComponent();
      expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    });

    it('deve exibir o círculo do feitiço', () => {
      renderComponent();
      expect(screen.getByText('3º círculo')).toBeInTheDocument();
    });

    it('deve exibir o custo em PP correto', () => {
      renderComponent();
      expect(screen.getByText('3 PP')).toBeInTheDocument();
    });

    it('deve exibir a matriz', () => {
      renderComponent();
      expect(screen.getByText('Arcana')).toBeInTheDocument();
    });

    it('deve exibir a habilidade de conjuração', () => {
      renderComponent();
      expect(screen.getByText('arcano')).toBeInTheDocument();
    });

    it('deve exibir as anotações quando presentes', () => {
      renderComponent();
      expect(
        screen.getByText('Ótimo para grupos de inimigos')
      ).toBeInTheDocument();
    });

    it('não deve exibir anotações quando ausentes', () => {
      const spellWithoutNotes = { ...mockSpell, notes: undefined };
      renderComponent(spellWithoutNotes);
      expect(
        screen.queryByText('Ótimo para grupos de inimigos')
      ).not.toBeInTheDocument();
    });
  });

  describe('Botões de ação', () => {
    it('deve exibir todos os botões quando callbacks são fornecidos', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: /Visualizar feitiço/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Editar feitiço/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Remover feitiço/i })
      ).toBeInTheDocument();
    });
  });

  describe('Custos de PP por círculo', () => {
    it('deve exibir 0 PP para 1º círculo', () => {
      const spell = { ...mockSpell, circle: 1 as const };
      renderComponent(spell);
      expect(screen.getByText('0 PP')).toBeInTheDocument();
    });

    it('deve exibir 7 PP para 5º círculo', () => {
      const spell = { ...mockSpell, circle: 5 as const };
      renderComponent(spell);
      expect(screen.getByText('7 PP')).toBeInTheDocument();
    });

    it('deve exibir 15 PP para 8º círculo', () => {
      const spell = { ...mockSpell, circle: 8 as const };
      renderComponent(spell);
      expect(screen.getByText('15 PP')).toBeInTheDocument();
    });
  });

  describe('Diferentes matrizes', () => {
    it('deve exibir matriz Natural', () => {
      const spell = { ...mockSpell, matrix: 'natural' as const };
      renderComponent(spell);
      expect(screen.getByText('Natural')).toBeInTheDocument();
    });

    it('deve exibir matriz Infernal', () => {
      const spell = { ...mockSpell, matrix: 'infernal' as const };
      renderComponent(spell);
      expect(screen.getByText('Infernal')).toBeInTheDocument();
    });
  });
});
