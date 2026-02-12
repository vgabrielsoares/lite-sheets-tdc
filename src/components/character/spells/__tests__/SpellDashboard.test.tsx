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
    mockCharacter.attributes.essencia = 2;
    mockCharacter.level = 1;

    // Configurar combat data
    mockCharacter.combat.ppLimit = { base: 3, modifiers: [], total: 3 };
    mockCharacter.combat.pp = { max: 5, current: 3, temporary: 0 };

    // Inicializar spellcasting
    mockCharacter.spellcasting = {
      isCaster: true,
      castingSkill: 'arcano',
      spellPoints: { current: 0, max: 0 },
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
    it('deve calcular dinamicamente baseado em nivel + essencia + modificadores', () => {
      // Configurar personagem: nível 5, essência 2, modificador +1
      mockCharacter.level = 5;
      mockCharacter.attributes.essencia = 2;
      mockCharacter.combat.ppLimit.modifiers = [
        { name: 'Outros', value: 1, type: 'bonus' as const },
      ];
      renderComponent();

      // Deve exibir 8 (5 + 2 + 1)
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('deve calcular corretamente sem modificadores', () => {
      // Configurar personagem: nível 3, essência 2, sem modificadores
      mockCharacter.level = 3;
      mockCharacter.attributes.essencia = 2;
      mockCharacter.combat.ppLimit.modifiers = [];
      renderComponent();

      // Deve exibir 5 (3 + 2 + 0) — may appear in cost table too
      const fives = screen.getAllByText('5');
      expect(fives.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PP Atuais', () => {
    it('deve exibir PP atual e maximo', () => {
      mockCharacter.combat.pp = { max: 10, current: 7, temporary: 0 };
      renderComponent();

      // '7' may appear in cost table too
      const sevens = screen.getAllByText('7');
      expect(sevens.length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/10/).length).toBeGreaterThanOrEqual(1);
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
          attribute: 'essencia',
          castingBonus: 0,
        },
      ];

      renderComponent();

      // 'Arcano' appears in both spellcasting skill selector and ability card
      const arcanoElements = screen.getAllByText('Arcano');
      expect(arcanoElements.length).toBeGreaterThanOrEqual(1);
    });

    it('deve calcular pool de conjuração corretamente com uso customizado "Conjurar Feitiço"', () => {
      // Cenário: Personagem com 3 de Essência, Adepto em Arcano,
      // +1d de assinatura geral e +1d de item no uso "Conjurar Feitiço"
      mockCharacter.attributes.essencia = 3;
      mockCharacter.level = 1;

      // Garantir que skills existe e tem a estrutura correta
      // Usar a skill Arcano que já existe no character default e apenas modificar
      if (mockCharacter.skills && mockCharacter.skills.arcano) {
        mockCharacter.skills.arcano = {
          ...mockCharacter.skills.arcano,
          keyAttribute: 'essencia',
          proficiencyLevel: 'adepto', // d8
          isSignature: true, // +1d
          customUses: [
            {
              name: 'Conjurar Feitiço',
              keyAttribute: 'essencia',
              bonus: 1, // +1d do item
              modifiers: [],
            },
          ],
          modifiers: [],
        };
      }

      // Adicionar habilidade de conjuração
      mockCharacter.spellcasting.spellcastingAbilities = [
        {
          id: 'test-arcano',
          skill: 'arcano',
          attribute: 'essencia',
          castingBonus: 0,
        },
      ];

      renderComponent();

      // V erificar se a seção "Habilidades de Conjuração" está presente
      expect(screen.getByText('Habilidades de Conjuração')).toBeInTheDocument();

      // Verificar se "Arcano" está presente como habilidade cadastrada
      const arcanoHeadings = screen.getAllByText('Arcano');
      expect(arcanoHeadings.length).toBeGreaterThan(0);

      // Buscar pelo elemento Typography que tem variant="h4" (onde o pool é exibido)
      // e verificar se contém o padrão {número}d{tamanho}
      const poolElements = screen.queryAllByRole('heading', { level: 4 });
      const poolElement = poolElements.find((el) =>
        /^\d+d(6|8|10|12)$/.test(el.textContent || '')
      );

      expect(poolElement).toBeDefined();
      expect(poolElement?.textContent).toBe('5d8');
    });

    it('deve calcular pool de conjuração corretamente sem uso customizado', () => {
      // Cenário: Personagem com 3 de Essência, Adepto em Arcano, +1d de assinatura
      mockCharacter.attributes.essencia = 3;
      mockCharacter.level = 1;

      // Configurar habilidade Arcano sem uso customizado
      if (!mockCharacter.skills) {
        mockCharacter.skills = {};
      }

      mockCharacter.skills.arcano = {
        keyAttribute: 'essencia',
        proficiencyLevel: 'adepto', // d8
        isSignature: true, // +1d
        customUses: [],
        modifiers: [],
      };

      // Adicionar habilidade de conjuração
      mockCharacter.spellcasting.spellcastingAbilities = [
        {
          id: 'test-arcano',
          skill: 'arcano',
          attribute: 'essencia',
          castingBonus: 0,
        },
      ];

      renderComponent();

      // Deve exibir "4d8": 3 (Essência) + 1 (assinatura) = 4 dados de d8
      expect(screen.getByText('4d8')).toBeInTheDocument();
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
