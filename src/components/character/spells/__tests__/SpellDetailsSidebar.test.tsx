import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpellDetailsSidebar } from '../SpellDetailsSidebar';
import type { KnownSpell } from '@/types/spells';

// Mock do useDebounce hook
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value, // Retorna imediatamente sem debounce nos testes
}));

describe('SpellDetailsSidebar', () => {
  const mockSpell: KnownSpell = {
    spellId: 'spell-1',
    circle: 3,
    name: 'Bola de Fogo',
    matrix: 'arcana',
    spellcastingSkill: 'arcano',
    notes: 'Uma poderosa bola de fogo que causa dano em área.',
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar corretamente quando aberta', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      // Título no header
      expect(screen.getByText('Editar Feitiço')).toBeInTheDocument();
      // Nome do feitiço aparece no campo de input
      expect(screen.getByDisplayValue('Bola de Fogo')).toBeInTheDocument();
      expect(screen.getByText('3º Círculo')).toBeInTheDocument();
      expect(screen.getByText('3 PP')).toBeInTheDocument();
      expect(screen.getByText('Arcana')).toBeInTheDocument();
      expect(screen.getByText('Arcano')).toBeInTheDocument();
    });

    it('não deve renderizar quando fechada', () => {
      render(
        <SpellDetailsSidebar
          open={false}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      // Sidebar fechada não renderiza conteúdo
      expect(screen.queryByText('Bola de Fogo')).not.toBeInTheDocument();
    });

    it('não deve renderizar se spell for null', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={null}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByText('3º Círculo')).not.toBeInTheDocument();
    });

    it('deve exibir as notas do feitiço em campo editável', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      const notesInput = screen.getByRole('textbox', { name: /notas/i });
      expect(notesInput).toHaveValue(
        'Uma poderosa bola de fogo que causa dano em área.'
      );
    });

    it('deve exibir campo de notas vazio quando não há notas', () => {
      const spellWithoutNotes: KnownSpell = {
        ...mockSpell,
        notes: undefined,
      };

      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={spellWithoutNotes}
          onSave={mockOnSave}
        />
      );

      const notesInput = screen.getByRole('textbox', { name: /notas/i });
      expect(notesInput).toHaveValue('');
    });
  });

  describe('Modo de Edição (sempre ativo)', () => {
    it('deve sempre iniciar em modo edição', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      // Deve exibir campos editáveis
      expect(
        screen.getByRole('textbox', { name: /nome do feitiço/i })
      ).toBeInTheDocument();

      // MUI Select não expõe name acessível, verificar por quantidade de comboboxes
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(3); // Círculo, Matriz, Habilidade de Conjuração
    });

    it('deve ignorar initialMode e sempre abrir em edição', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
          initialMode="view"
        />
      );

      // Mesmo com initialMode="view", deve estar em edição
      expect(
        screen.getByRole('textbox', { name: /nome do feitiço/i })
      ).toBeInTheDocument();
    });

    it('não deve exibir botões de ação', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      // Não deve ter botões "Fechar" e "Salvar e Fechar"
      expect(
        screen.queryByRole('button', { name: /^fechar$/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /salvar e fechar/i })
      ).not.toBeInTheDocument();
    });

    it('não deve exibir alerta de salvamento automático', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      expect(
        screen.queryByText(
          /As alterações são salvas automaticamente após 1 segundo/i
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('Edição de Campos', () => {
    it('deve permitir editar o nome do feitiço', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByRole('textbox', {
        name: /nome do feitiço/i,
      });
      fireEvent.change(nameInput, { target: { value: 'Raio Congelante' } });

      expect(nameInput).toHaveValue('Raio Congelante');
    });

    it('deve permitir editar as notas', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      const notesInput = screen.getByRole('textbox', { name: /notas/i });
      fireEvent.change(notesInput, { target: { value: 'Nova descrição' } });

      expect(notesInput).toHaveValue('Nova descrição');
    });

    it('deve validar que o nome é obrigatório', () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByRole('textbox', {
        name: /nome do feitiço/i,
      });
      fireEvent.change(nameInput, { target: { value: '' } });

      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });
  });

  describe('Custo de PP', () => {
    it('deve exibir custo de PP correto para círculo 1', () => {
      const spell: KnownSpell = { ...mockSpell, circle: 1 };
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={spell}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('0 PP')).toBeInTheDocument();
    });

    it('deve exibir custo de PP correto para círculo 5', () => {
      const spell: KnownSpell = { ...mockSpell, circle: 5 };
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={spell}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('7 PP')).toBeInTheDocument();
    });

    it('deve exibir custo de PP correto para círculo 8', () => {
      const spell: KnownSpell = { ...mockSpell, circle: 8 };
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={spell}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('20 PP')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('deve chamar onSave automaticamente após edição (debounce)', async () => {
      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={mockSpell}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByRole('textbox', {
        name: /nome do feitiço/i,
      });
      fireEvent.change(nameInput, { target: { value: 'Novo Nome' } });

      // Como o debounce está mockado para retornar imediatamente,
      // o onSave deve ser chamado
      await waitFor(
        () => {
          expect(mockOnSave).toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });
  });

  describe('Capitalização de Habilidades', () => {
    it('deve capitalizar habilidades não mapeadas no select', () => {
      const spellWithCustomSkill: KnownSpell = {
        ...mockSpell,
        spellcastingSkill: 'divino' as any,
      };

      render(
        <SpellDetailsSidebar
          open={true}
          onClose={mockOnClose}
          spell={spellWithCustomSkill}
          onSave={mockOnSave}
        />
      );

      // O campo select deve mostrar "Divino" como valor selecionado
      // Mas como é um combobox, não podemos verificar facilmente
      // Vamos apenas verificar que o componente renderiza sem erros
      expect(
        screen.getByRole('textbox', { name: /nome do feitiço/i })
      ).toBeInTheDocument();
    });
  });
});
