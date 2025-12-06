import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguagesDisplay } from '../LanguagesDisplay';
import { createDefaultCharacter } from '@/utils';
import type { Character, LanguageName } from '@/types';

describe('LanguagesDisplay', () => {
  const mockOnUpdate = jest.fn();

  let defaultCharacter: Character;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultCharacter = createDefaultCharacter('Test Character');
    defaultCharacter.attributes.mente = 2; // Permite 1 idioma adicional
    defaultCharacter.languages = ['comum'];
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com título correto', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );
      expect(screen.getByText('Idiomas Conhecidos')).toBeInTheDocument();
    });

    it('deve exibir contador de slots corretamente', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );
      // Mente 2 = 2 slots totais (1 Comum + 1 adicional)
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('deve exibir informações de slots de Mente', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      // Expande para ver detalhes
      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      expect(screen.getByText('De Mente')).toBeInTheDocument();
      // Mente 2 = 2 slots de mente (o valor aparece na seção De Mente)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('deve exibir slots restantes', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      expect(screen.getByText('Restantes')).toBeInTheDocument();
      // 1 slot restante (comum usado, 1 disponível)
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  describe('Exibição de Idiomas', () => {
    it('deve exibir Comum como idioma padrão', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Comum aparece em múltiplos lugares, verificamos se existe pelo menos um chip
      const comunChips = screen.getAllByText('Comum');
      expect(comunChips.length).toBeGreaterThan(0);
    });

    it('deve exibir múltiplos idiomas do personagem', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        attributes: { ...defaultCharacter.attributes, mente: 3 },
        languages: ['comum', 'elfico', 'anao'] as LanguageName[],
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Verificar que os idiomas existem (podem aparecer em múltiplos lugares)
      expect(screen.getAllByText('Comum').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Élfico (Aon-deug)').length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByText('Anão (Dvergur)').length).toBeGreaterThan(0);
    });

    it('deve separar idiomas de linhagem', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        lineage: {
          name: 'Elfo',
          attributes: {
            agilidade: 1,
            constituicao: 0,
            forca: 0,
            influencia: 0,
            mente: 0,
            presenca: 0,
          },
          size: 'médio' as const,
          height: 180,
          weight: 70,
          weightMeasure: 10,
          age: 100,
          lifeExpectancy: 500,
          languages: ['elfico'] as LanguageName[],
          movement: {
            andando: 9,
            voando: 0,
            escalando: 0,
            escavando: 0,
            nadando: 0,
          },
          vision: 'normal' as const,
          ancestryTraits: [],
        },
        languages: ['comum', 'elfico'] as LanguageName[],
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Deve ter seção de idiomas da linhagem
      expect(screen.getByText('Idiomas da Linhagem')).toBeInTheDocument();
      const lineageSection = screen
        .getByText('Idiomas da Linhagem')
        .closest('div');
      expect(
        within(lineageSection!).getByText('Élfico (Aon-deug)')
      ).toBeInTheDocument();
    });

    it('deve exibir detalhes dos idiomas', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Verifica que mostra alfabeto e descrição
      expect(screen.getByText(/Alfabeto: Comum/)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Idioma universal falado pela maioria das raças civilizadas/
        )
      ).toBeInTheDocument();
    });
  });

  describe('Validação e Avisos', () => {
    it('deve mostrar aviso quando excede limite de idiomas', () => {
      const character = {
        ...defaultCharacter,
        attributes: { ...defaultCharacter.attributes, mente: 1 }, // Permite apenas Comum
        languages: ['comum', 'elfico', 'anao'] as LanguageName[], // 3 idiomas, mas só pode 1
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      expect(
        screen.getByText(/Você tem 2 idioma\(s\) a mais do que o permitido/)
      ).toBeInTheDocument();
    });

    it('não deve mostrar aviso quando dentro do limite', () => {
      const character = {
        ...defaultCharacter,
        attributes: { ...defaultCharacter.attributes, mente: 3 },
        languages: ['comum', 'elfico'] as LanguageName[],
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      expect(
        screen.queryByText(/a mais do que o permitido/)
      ).not.toBeInTheDocument();
    });

    it('deve mostrar aviso se Comum não está presente', () => {
      const character = {
        ...defaultCharacter,
        languages: ['elfico'] as LanguageName[], // Falta Comum
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      expect(
        screen.getByText(/O idioma Comum deve sempre estar presente/)
      ).toBeInTheDocument();
    });
  });

  describe('Adição de Idiomas', () => {
    it('deve mostrar botão para adicionar idioma quando há slots', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      expect(screen.getByText('Adicionar Idioma')).toBeInTheDocument();
    });

    it('não deve permitir adicionar idioma quando não há slots', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        attributes: { ...defaultCharacter.attributes, mente: 1 },
        languages: ['comum'] as LanguageName[], // Já no limite
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      const addButton = screen.getByText('Adicionar Idioma');
      expect(addButton).toBeDisabled();
    });

    it('deve abrir seletor ao clicar em adicionar', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      const addButton = screen.getByText('Adicionar Idioma');
      await user.click(addButton);

      expect(screen.getByLabelText('Selecione os idiomas')).toBeInTheDocument();
    });

    it('deve permitir cancelar adição', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      const addButton = screen.getByText('Adicionar Idioma');
      await user.click(addButton);

      const cancelButton = screen.getByText('Cancelar');
      await user.click(cancelButton);

      expect(
        screen.queryByLabelText('Selecione os idiomas')
      ).not.toBeInTheDocument();
    });
  });

  describe('Remoção de Idiomas', () => {
    it('deve permitir remover idioma (exceto Comum)', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        languages: ['comum', 'elfico'] as LanguageName[],
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Élfico deve ter botão de deletar - encontra todos e pega o que está em chip
      const elficoElements = screen.getAllByText('Élfico (Aon-deug)');
      const elficoChip = elficoElements
        .find((el) => el.closest('.MuiChip-root'))
        ?.closest('.MuiChip-root');

      expect(elficoChip).toBeTruthy();
      const deleteButton = within(elficoChip!).getByTestId('DeleteIcon');

      await user.click(deleteButton);

      expect(mockOnUpdate).toHaveBeenCalledWith(['comum']);
    });

    it('não deve permitir remover Comum', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Comum não deve ter botão de deletar - encontra todos e pega o que está em chip
      const comumElements = screen.getAllByText('Comum');
      const comumChip = comumElements
        .find((el) => el.closest('.MuiChip-root'))
        ?.closest('.MuiChip-root');

      expect(comumChip).toBeTruthy();
      expect(
        within(comumChip!).queryByTestId('DeleteIcon')
      ).not.toBeInTheDocument();
    });
  });

  describe('Modo Somente Leitura', () => {
    it('não deve mostrar botão de adicionar em modo readOnly', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
          readOnly
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      expect(screen.queryByText('Adicionar Idioma')).not.toBeInTheDocument();
    });

    it('não deve permitir remover idiomas em modo readOnly', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        languages: ['comum', 'elfico'] as LanguageName[],
      };

      render(
        <LanguagesDisplay
          character={character}
          onUpdate={mockOnUpdate}
          readOnly
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      // Nenhum chip deve ter botão de deletar em modo readOnly
      // Busca todos os elementos Élfico e verifica se nenhum chip tem delete
      const elficoElements = screen.getAllByText('Élfico (Aon-deug)');
      const elficoChip = elficoElements
        .find((el) => el.closest('.MuiChip-root'))
        ?.closest('.MuiChip-root');

      expect(elficoChip).toBeTruthy();
      expect(
        within(elficoChip!).queryByTestId('DeleteIcon')
      ).not.toBeInTheDocument();
    });
  });

  describe('Expansão/Colapso', () => {
    it('deve começar colapsado por padrão', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      // O conteúdo expandido pode existir no DOM mas não visível
      // Verificamos se o botão "Expandir" está presente (não "Recolher")
      expect(screen.getByLabelText('Expandir')).toBeInTheDocument();
      expect(screen.queryByLabelText('Recolher')).not.toBeInTheDocument();
    });

    it('deve começar expandido quando defaultExpanded=true', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
          defaultExpanded
        />
      );

      expect(screen.getByText('Idiomas do Personagem')).toBeInTheDocument();
    });

    it('deve alternar entre expandido e colapsado', async () => {
      const user = userEvent.setup();
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');

      // Expande
      await user.click(expandButton);
      expect(screen.getByText('Idiomas do Personagem')).toBeInTheDocument();
      expect(screen.getByLabelText('Recolher')).toBeInTheDocument();

      // Colapsa
      const collapseButton = screen.getByLabelText('Recolher');
      await user.click(collapseButton);

      // Após colapsar, o botão volta a ser "Expandir"
      expect(screen.getByLabelText('Expandir')).toBeInTheDocument();
      expect(screen.queryByLabelText('Recolher')).not.toBeInTheDocument();
    });
  });

  describe('Integração com Mente', () => {
    it('deve atualizar slots quando Mente muda', () => {
      const { rerender } = render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('1 / 2')).toBeInTheDocument();

      // Aumenta Mente para 4
      const updatedCharacter = {
        ...defaultCharacter,
        attributes: { ...defaultCharacter.attributes, mente: 4 },
      };

      rerender(
        <LanguagesDisplay
          character={updatedCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('1 / 4')).toBeInTheDocument(); // 1 Comum + 3 adicionais
    });

    it('deve mostrar slots de linhagem separadamente', async () => {
      const user = userEvent.setup();
      const character = {
        ...defaultCharacter,
        lineage: {
          name: 'Elfo',
          attributes: {
            agilidade: 1,
            constituicao: 0,
            forca: 0,
            influencia: 0,
            mente: 0,
            presenca: 0,
          },
          size: 'médio' as const,
          height: 180,
          weight: 70,
          weightMeasure: 10,
          age: 100,
          lifeExpectancy: 500,
          languages: ['elfico', 'silvestre'] as LanguageName[], // 2 idiomas de linhagem
          movement: {
            andando: 9,
            voando: 0,
            escalando: 0,
            escavando: 0,
            nadando: 0,
          },
          vision: 'normal' as const,
          ancestryTraits: [],
        },
        languages: ['comum', 'elfico', 'silvestre'] as LanguageName[],
      };

      render(
        <LanguagesDisplay character={character} onUpdate={mockOnUpdate} />
      );

      const expandButton = screen.getByLabelText('Expandir');
      await user.click(expandButton);

      expect(screen.getByText('De Linhagem')).toBeInTheDocument();
      // 2 idiomas de linhagem - pode aparecer múltiplas vezes
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter ícone informativo com tooltip', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const infoIcon = screen.getByTestId('InfoIcon');
      expect(infoIcon).toBeInTheDocument();
    });

    it('deve ter botão de expansão com aria-label adequado', () => {
      render(
        <LanguagesDisplay
          character={defaultCharacter}
          onUpdate={mockOnUpdate}
        />
      );

      const expandButton = screen.getByLabelText('Expandir');
      expect(expandButton).toBeInTheDocument();
    });
  });
});
