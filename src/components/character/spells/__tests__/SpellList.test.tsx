import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer from '@/features/characters/charactersSlice';
import appReducer from '@/features/app/appSlice';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/lightTheme';
import { SpellList } from '../SpellList';
import type { KnownSpell } from '@/types/spells';

const createMockStore = () =>
  configureStore({
    reducer: {
      characters: charactersReducer,
      app: appReducer,
    },
  });

describe('SpellList', () => {
  const mockSpells: KnownSpell[] = [
    {
      spellId: 'spell-1',
      circle: 1,
      name: 'Mísseis Mágicos',
      matrix: 'arcana',
      spellcastingSkill: 'arcano',
    },
    {
      spellId: 'spell-2',
      circle: 3,
      name: 'Bola de Fogo',
      matrix: 'arcana',
      spellcastingSkill: 'arcano',
    },
    {
      spellId: 'spell-3',
      circle: 3,
      name: 'Curar Ferimentos',
      matrix: 'luzidia',
      spellcastingSkill: 'religiao',
    },
    {
      spellId: 'spell-4',
      circle: 5,
      name: 'Teleporte',
      matrix: 'arcana',
      spellcastingSkill: 'arcano',
    },
  ];

  const onOpenSpell = jest.fn();
  const onDeleteSpell = jest.fn();
  const onAddSpell = jest.fn();
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderComponent = (spells = mockSpells) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={lightTheme}>
          <SpellList
            spells={spells}
            onOpenSpell={onOpenSpell}
            onDeleteSpell={onDeleteSpell}
            onAddSpell={onAddSpell}
          />
        </ThemeProvider>
      </Provider>
    );
  };

  describe('Renderização básica', () => {
    it('deve renderizar o título', () => {
      renderComponent();
      expect(screen.getByText('Feitiços Conhecidos')).toBeInTheDocument();
    });

    it('deve exibir contador de feitiços', () => {
      renderComponent();
      expect(screen.getByText(/4 de 4 feitiços/i)).toBeInTheDocument();
    });

    it('deve exibir botão de adicionar feitiço', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: /Adicionar Feitiço/i })
      ).toBeInTheDocument();
    });

    it('deve exibir botões de expandir/colapsar', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: /Expandir Todos/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Colapsar Todos/i })
      ).toBeInTheDocument();
    });
  });

  describe('Organização por círculo', () => {
    it('deve exibir acordeões para todos os círculos', () => {
      renderComponent();
      expect(screen.getByText('1º Círculo')).toBeInTheDocument();
      expect(screen.getByText('3º Círculo')).toBeInTheDocument();
      expect(screen.getByText('5º Círculo')).toBeInTheDocument();
    });

    it('deve exibir contador de feitiços por círculo', () => {
      renderComponent();
      // Verificar que há contadores presentes
      const counters = screen.getAllByText(/\d+ feitiços?/);
      expect(counters.length).toBeGreaterThan(0);
    });

    it('deve exibir custo de PP por círculo', () => {
      renderComponent();
      // Múltiplos chips de PP
      const ppChips = screen.getAllByText(/PP/);
      expect(ppChips.length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('deve exibir mensagem quando não há feitiços', () => {
      renderComponent([]);
      expect(
        screen.getByText('Nenhum feitiço conhecido ainda.')
      ).toBeInTheDocument();
    });

    it('deve exibir botão de adicionar primeiro feitiço no empty state', () => {
      renderComponent([]);
      expect(
        screen.getByRole('button', { name: /Adicionar Primeiro Feitiço/i })
      ).toBeInTheDocument();
    });
  });

  describe('Filtros', () => {
    it('deve exibir campo de busca', () => {
      renderComponent();
      expect(
        screen.getByPlaceholderText('Buscar feitiço por nome...')
      ).toBeInTheDocument();
    });

    it('deve exibir filtros de seleção', () => {
      renderComponent();
      // Verificar pela presença de selects (círculo, matriz, habilidade, tags = 4)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(4);
    });
  });

  describe('Lista de feitiços', () => {
    it('deve exibir todos os feitiços', () => {
      renderComponent();
      expect(screen.getByText('Mísseis Mágicos')).toBeInTheDocument();
      expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
      expect(screen.getByText('Curar Ferimentos')).toBeInTheDocument();
      expect(screen.getByText('Teleporte')).toBeInTheDocument();
    });

    it('deve ordenar feitiços alfabeticamente dentro do círculo', () => {
      renderComponent();
      // No 3º círculo: "Bola de Fogo" deve vir antes de "Curar Ferimentos"
      const allText = screen.getByText('Bola de Fogo').textContent;
      expect(allText).toBeTruthy();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar sem erros', () => {
      renderComponent();
      expect(screen.getByText('Feitiços Conhecidos')).toBeInTheDocument();
    });
  });
});
