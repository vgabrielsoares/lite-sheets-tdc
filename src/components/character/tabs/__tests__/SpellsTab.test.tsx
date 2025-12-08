import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import { SpellsTab } from '../SpellsTab';
import type { Character } from '@/types';
import type { KnownSpell } from '@/types/spells';

// Mock do hook useNotifications
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

// Mock do uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234',
}));

describe('SpellsTab', () => {
  const mockSpells: KnownSpell[] = [
    {
      spellId: '1',
      name: 'Bola de Fogo',
      circle: 3,
      matrix: 'arcana',
      spellcastingSkill: 'arcano',
      notes: 'Causa dano de fogo em área',
    },
    {
      spellId: '2',
      name: 'Cura Leve',
      circle: 1,
      matrix: 'natural',
      spellcastingSkill: 'religiao',
    },
  ];

  const mockCharacter: Character = {
    id: 'char-1',
    name: 'Gandalf',
    playerName: 'Player 1',
    level: 5,
    xp: { current: 0, forNextLevel: 1000 },
    linhagem: undefined,
    origem: undefined,
    attributes: {
      agilidade: 2,
      constituicao: 2,
      forca: 1,
      influencia: 3,
      mente: 4,
      presenca: 5,
    },
    pv: {
      max: 25,
      current: 25,
      temporary: 0,
    },
    pp: {
      max: 10,
      current: 10,
      temporary: 0,
    },
    combat: {
      defense: { base: 17, modifiers: 0 },
      initiative: { base: 2, modifiers: 0 },
      movement: { base: 9, modifiers: 0 },
      pvLimit: { total: 25, modifiers: 0 },
      ppLimit: { total: 10, modifiers: 0 },
      attacks: [],
      criticalRange: 20,
      criticalMultiplier: 2,
    },
    skills: {} as any,
    languages: ['comum'],
    proficiencies: {
      weapons: ['simples'],
      armors: [],
      shields: [],
      tools: [],
      skills: [],
    },
    inventory: {
      items: [],
      currency: { PO: 10 },
      encumbrance: { current: 0, max: 50 },
    },
    spellcasting: {
      knownSpells: mockSpells,
      maxKnownSpells: 10,
      knownSpellsModifiers: 0,
      spellcastingAbilities: [
        {
          abilityId: 'spell-1',
          skill: 'arcano',
          attribute: 'presenca',
          dcBonus: 2,
          attackBonus: 3,
        },
      ],
      masteredMatrices: ['arcana'],
    },
    crafts: [],
    senses: {
      perceptionBonus: 0,
      darkvision: 0,
    },
    size: 'medio',
    conditions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render SpellDashboard and SpellList', () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Verifica se o dashboard está presente
    expect(screen.getByText('Habilidades de Conjuração')).toBeInTheDocument();

    // Verifica se a lista de feitiços está presente (múltiplas ocorrências possíveis)
    const spellListHeadings = screen.getAllByText('Feitiços Conhecidos');
    expect(spellListHeadings.length).toBeGreaterThan(0);
  });

  it('should display known spells in the list', () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Verifica se os feitiços são exibidos
    expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    expect(screen.getByText('Cura Leve')).toBeInTheDocument();
  });

  it('should open add spell dialog when clicking add button', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Clica no botão adicionar
    const addButtons = screen.getAllByRole('button', {
      name: /adicionar feitiço/i,
    });
    // O primeiro botão é o da lista de feitiços
    fireEvent.click(addButtons[addButtons.length - 1]);

    // Verifica se o diálogo foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const dialogTitle = within(screen.getByRole('dialog')).getByText(
        'Adicionar Feitiço'
      );
      expect(dialogTitle).toBeInTheDocument();
    });
  });

  it('should add a new spell', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Abre o diálogo
    const addButtons = screen.getAllByRole('button', {
      name: /adicionar feitiço/i,
    });
    fireEvent.click(addButtons[addButtons.length - 1]);

    // Aguarda o diálogo abrir
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Preenche o formulário
    const nameInput = screen.getByLabelText(/nome do feitiço/i);
    fireEvent.change(nameInput, { target: { value: 'Raio Elétrico' } });

    // Clica em adicionar
    const submitButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      {
        name: /^adicionar$/i,
      }
    );
    fireEvent.click(submitButton);

    // Verifica se onUpdate foi chamado
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        spellcasting: expect.objectContaining({
          knownSpells: expect.arrayContaining([
            expect.objectContaining({
              spellId: 'mock-uuid-1234',
              name: 'Raio Elétrico',
              circle: 1,
              matrix: 'arcana',
              spellcastingSkill: 'arcano',
            }),
          ]),
        }),
      });
    });
  });

  it('should not add spell without name', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Abre o diálogo
    const addButtons = screen.getAllByRole('button', {
      name: /adicionar feitiço/i,
    });
    fireEvent.click(addButtons[addButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Tenta adicionar sem nome
    const submitButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      {
        name: /^adicionar$/i,
      }
    );
    fireEvent.click(submitButton);

    // Verifica que onUpdate não foi chamado
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  // TODO: Fix flaky test - button selection issues
  it.skip('should open view dialog when clicking view button', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Expande o acordeão do 3º círculo
    const thirdCircleAccordion = screen.getByText('3º Círculo');
    fireEvent.click(thirdCircleAccordion);

    // Aguarda o conteúdo aparecer
    await waitFor(() => {
      expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    });

    // Encontra todos os botões "Ver" e clica no primeiro
    const allButtons = screen.getAllByRole('button');
    const viewButton = allButtons.find(
      (btn) => btn.getAttribute('aria-label') === 'Ver detalhes'
    );
    expect(viewButton).toBeDefined();
    if (viewButton) fireEvent.click(viewButton);

    // Verifica se o diálogo foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // TODO: Fix flaky test - button selection issues
  it.skip('should open edit dialog when clicking edit button in view dialog', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Expande o acordeão
    const thirdCircleAccordion = screen.getByText('3º Círculo');
    fireEvent.click(thirdCircleAccordion);

    // Aguarda aparecer
    await waitFor(() => {
      expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    });

    // Encontra e clica no botão view
    const allButtons = screen.getAllByRole('button');
    const viewButton = allButtons.find(
      (btn) => btn.getAttribute('aria-label') === 'Ver detalhes'
    );
    if (viewButton) fireEvent.click(viewButton);

    // Aguarda o diálogo abrir
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Clica em editar dentro do diálogo
    const editButton = within(screen.getByRole('dialog')).getByRole('button', {
      name: /editar/i,
    });
    fireEvent.click(editButton);

    // Verifica se mudou para o diálogo de edição
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).queryByText('Editar Feitiço')).toBeInTheDocument();
    });
  });

  it('should edit an existing spell', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Expande o acordeão
    const thirdCircleAccordion = screen.getByText('3º Círculo');
    fireEvent.click(thirdCircleAccordion);

    // Aguarda aparecer
    await waitFor(() => {
      expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    });

    // Encontra e clica no botão edit
    const allButtons = screen.getAllByRole('button');
    const editButton = allButtons.find(
      (btn) => btn.getAttribute('aria-label') === 'Editar feitiço'
    );
    expect(editButton).toBeDefined();
    if (editButton) fireEvent.click(editButton);

    // Aguarda o diálogo abrir
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Edita o nome
    const nameInput = screen.getByLabelText(/nome do feitiço/i);
    fireEvent.change(nameInput, { target: { value: 'Bola de Fogo Maior' } });

    // Salva
    const submitButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      {
        name: /salvar/i,
      }
    );
    fireEvent.click(submitButton);

    // Verifica se onUpdate foi chamado
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should delete a spell', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Expande o acordeão do 3º círculo (onde está Bola de Fogo)
    const thirdCircleAccordion = screen.getByText('3º Círculo');
    fireEvent.click(thirdCircleAccordion);

    // Clica no botão deletar
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', {
        name: /remover feitiço/i,
      });
      fireEvent.click(deleteButtons[0]);
    });

    // Verifica se onUpdate foi chamado
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const lastCall =
        mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      // Verifica que um feitiço foi removido (de 2 para 1)
      expect(lastCall.spellcasting.knownSpells).toHaveLength(1);
    });
  });

  it('should handle empty spellcasting data gracefully', () => {
    const characterWithoutSpells: Character = {
      ...mockCharacter,
      spellcasting: {
        knownSpells: [],
        maxKnownSpells: 10,
        knownSpellsModifiers: 0,
        spellcastingAbilities: [],
        masteredMatrices: [],
      },
    };

    render(
      <SpellsTab character={characterWithoutSpells} onUpdate={mockOnUpdate} />
    );

    // Verifica que renderiza sem erros
    expect(screen.getByText('Habilidades de Conjuração')).toBeInTheDocument();

    const spellListHeadings = screen.getAllByText('Feitiços Conhecidos');
    expect(spellListHeadings.length).toBeGreaterThan(0);

    // Verifica empty state
    expect(
      screen.getByText(/nenhum feitiço conhecido ainda/i)
    ).toBeInTheDocument();
  });

  it('should close dialog when clicking cancel', async () => {
    render(<SpellsTab character={mockCharacter} onUpdate={mockOnUpdate} />);

    // Abre o diálogo
    const addButtons = screen.getAllByRole('button', {
      name: /adicionar feitiço/i,
    });
    fireEvent.click(addButtons[addButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Clica em cancelar
    const cancelButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      {
        name: /cancelar/i,
      }
    );
    fireEvent.click(cancelButton);

    // Verifica que o diálogo foi fechado
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
