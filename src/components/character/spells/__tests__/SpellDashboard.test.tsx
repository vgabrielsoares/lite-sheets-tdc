import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import charactersReducer from '@/features/characters/charactersSlice';
import appReducer from '@/features/app/appSlice';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/lightTheme';
import { SpellDashboard } from '../SpellDashboard';
import { createDefaultCharacter } from '@/utils/characterFactory';

// Mock store
const createMockStore = () =>
  configureStore({
    reducer: {
      characters: charactersReducer,
      app: appReducer,
    },
  });

describe('SpellDashboard - Refatorado', () => {
  const onUpdate = jest.fn();
  let mockCharacter: any;
  let store: any;

  beforeEach(() => {
    mockCharacter = createDefaultCharacter({ name: 'Test Character' });
    mockCharacter.attributes.presenca = 2;
    mockCharacter.level = 1;

    // Configurar combat data
    mockCharacter.combat.ppLimit = { base: 3, modifiers: [], total: 3 };
    mockCharacter.combat.pp = { max: 5, current: 3, temporary: 0 };

    // Inicializar spellcasting
    mockCharacter.spellcasting = {
      knownSpells: [],
      maxKnownSpells: 0,
      knownSpellsModifiers: 0,
      spellcastingAbilities: [],
      masteredMatrices: [],
    };

    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderComponent = (character = mockCharacter) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={lightTheme}>
          <SpellDashboard character={character} onUpdate={onUpdate} />
        </ThemeProvider>
      </Provider>
    );
  };

  describe('Renderizacao basica', () => {
    it('deve renderizar o titulo do dashboard', () => {
      renderComponent();
      expect(
        screen.getByRole('heading', { name: /Dashboard de Feitiços/ })
      ).toBeInTheDocument();
    });

    it('deve exibir cards de informacoes centralizadas', () => {
      renderComponent();
      expect(screen.getByText(/Feitiços Conhecidos/i)).toBeInTheDocument();
      expect(screen.getByText(/PP por Rodada/i)).toBeInTheDocument();
      expect(screen.getByText(/PP Atuais/i)).toBeInTheDocument();
    });

    it('deve exibir botao de adicionar habilidade', () => {
      renderComponent();
      expect(
        screen.getAllByRole('button', { name: /Adicionar/i })[0]
      ).toBeInTheDocument();
    });
  });

  describe('PP por Rodada', () => {
    it('deve calcular dinamicamente baseado em nivel + presenca + modificadores', () => {
      // Configurar personagem: nível 5, presença 2, modificador +1
      mockCharacter.level = 5;
      mockCharacter.attributes.presenca = 2;
      mockCharacter.combat.ppLimit.modifiers = [
        { name: 'Outros', value: 1, type: 'bonus' as const },
      ];
      renderComponent();

      // Deve exibir 8 (5 + 2 + 1)
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('deve calcular corretamente sem modificadores', () => {
      // Configurar personagem: nível 3, presença 2, sem modificadores
      mockCharacter.level = 3;
      mockCharacter.attributes.presenca = 2;
      mockCharacter.combat.ppLimit.modifiers = [];
      renderComponent();

      // Deve exibir 5 (3 + 2 + 0)
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('PP Atuais', () => {
    it('deve exibir PP atual e maximo', () => {
      mockCharacter.combat.pp = { max: 10, current: 7, temporary: 0 };
      renderComponent();

      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('deve incluir PP temporarios no total exibido', () => {
      mockCharacter.combat.pp = { max: 10, current: 5, temporary: 3 };
      renderComponent();

      // 5 + 3 = 8 deve ser exibido
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('deve exibir chip de PP temporarios quando presente', () => {
      mockCharacter.combat.pp = { max: 10, current: 5, temporary: 2 };
      renderComponent();

      expect(screen.getByText(/\+2 temp/i)).toBeInTheDocument();
    });
  });

  describe('Estado vazio', () => {
    it('deve exibir mensagem quando nao ha habilidades cadastradas', () => {
      renderComponent();

      expect(
        screen.getByText(/Nenhuma habilidade de conjuração cadastrada/i)
      ).toBeInTheDocument();
    });

    it('deve exibir botao de cadastrar primeira habilidade', () => {
      renderComponent();

      expect(
        screen.getByRole('button', { name: /Cadastrar Primeira Habilidade/i })
      ).toBeInTheDocument();
    });
  });

  describe('Dialog de adicionar habilidade', () => {
    it('deve ter botao de adicionar habilidade', () => {
      renderComponent();

      const addButton = screen.getAllByRole('button', {
        name: /Adicionar/i,
      })[0];
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Habilidades de conjuracao cadastradas', () => {
    it('deve exibir habilidade cadastrada com calculos corretos', () => {
      mockCharacter.spellcasting.spellcastingAbilities = [
        {
          id: 'test-1',
          skill: 'arcano',
          attribute: 'presenca',
          dcBonus: 0,
          attackBonus: 0,
        },
      ];

      renderComponent();

      expect(screen.getByText('Arcano')).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar sem erros', () => {
      const { container } = renderComponent();
      expect(container).toBeTruthy();
      expect(container.firstChild).toBeTruthy();
    });
  });
});
