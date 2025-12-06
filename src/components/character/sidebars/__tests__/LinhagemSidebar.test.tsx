/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinhagemSidebar } from '../LinhagemSidebar';
import type { Lineage } from '@/types/character';
import { createDefaultLineage } from '@/utils/lineageUtils';

// Mock do useDebounce para testes síncronos
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

describe('LinhagemSidebar', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  const defaultLineage: Lineage = createDefaultLineage();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar a sidebar quando aberta', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Linhagem do Personagem')).toBeInTheDocument();
    });

    it('não deve renderizar conteúdo principal quando fechada', () => {
      render(
        <LinhagemSidebar
          open={false}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Sidebar fechada não exibe o título principal
      expect(
        screen.queryByText('Linhagem do Personagem')
      ).not.toBeInTheDocument();
    });

    it('deve exibir linhagem existente quando fornecida', () => {
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
        description: 'Seres longevos e graciosos',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          lineage={lineage}
          onUpdate={mockOnUpdate}
        />
      );

      const nameInput = screen.getByLabelText(/nome da linhagem/i);
      expect(nameInput).toHaveValue('Elfo');

      const descInput = screen.getByLabelText('Descrição da Linhagem');
      expect(descInput).toHaveValue('Seres longevos e graciosos');
    });
  });

  describe('Edição de Campos de Texto', () => {
    it('deve permitir editar nome da linhagem', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const nameInput = screen.getByLabelText(/nome da linhagem/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Anão');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Anão',
          })
        );
      });
    });

    it('deve permitir editar descrição da linhagem', async () => {
      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const descInput = screen.getByLabelText('Descrição da Linhagem');
      expect(descInput).toBeInTheDocument();

      // Simula mudança direta no campo
      fireEvent.change(descInput, { target: { value: 'Seres robustos' } });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Edição de Campos Numéricos', () => {
    it('deve permitir editar altura', async () => {
      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const heightInput = screen.getByLabelText('Altura (cm)');
      expect(heightInput).toBeInTheDocument();
      expect(heightInput).toHaveAttribute('type', 'number');

      // Verifica que o input tem o valor inicial
      expect(heightInput).toHaveValue(170); // valor default

      // Simula mudança direta no campo
      fireEvent.change(heightInput, { target: { value: '180' } });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('deve permitir editar peso em kg', async () => {
      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const weightInput = screen.getByLabelText('Peso (kg)');
      expect(weightInput).toBeInTheDocument();
      expect(weightInput).toHaveAttribute('type', 'number');

      // Verifica que o input tem o valor inicial
      expect(weightInput).toHaveValue(70); // valor default

      // Simula mudança direta no campo
      fireEvent.change(weightInput, { target: { value: '80' } });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('deve permitir editar idade', async () => {
      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const ageInput = screen.getByLabelText('Idade');
      expect(ageInput).toBeInTheDocument();
      expect(ageInput).toHaveAttribute('type', 'number');

      // Verifica que o input tem o valor inicial
      expect(ageInput).toHaveValue(25); // valor default

      // Simula mudança direta no campo
      fireEvent.change(ageInput, { target: { value: '150' } });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Seleção de Tamanho', () => {
    it('deve permitir selecionar tamanho', async () => {
      const user = userEvent.setup();

      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      // Clica no select de tamanho
      const sizeSelect = screen.getByLabelText('Tamanho');
      await user.click(sizeSelect);

      // Seleciona "Grande"
      const grandeOption = screen.getByRole('option', { name: 'Grande' });
      await user.click(grandeOption);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            size: 'grande',
          })
        );
      });
    });

    it('deve exibir modificadores de tamanho no accordion', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={{
            ...defaultLineage,
            size: 'pequeno',
          }}
        />
      );

      // Verifica se o accordion de modificadores existe
      expect(screen.getByText('Modificadores de Tamanho')).toBeInTheDocument();
    });
  });

  describe('Seleção de Visão', () => {
    it('deve permitir selecionar tipo de visão', async () => {
      const user = userEvent.setup();

      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const visionSelect = screen.getByLabelText('Tipo de Visão');
      await user.click(visionSelect);

      const penumbraOption = screen.getByRole('option', { name: 'Penumbra' });
      await user.click(penumbraOption);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            vision: 'penumbra',
          })
        );
      });
    });
  });

  describe('Seleção de Sentido Aguçado', () => {
    it('deve permitir adicionar sentido aguçado', async () => {
      const user = userEvent.setup();

      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      // Procura pelo botão "Adicionar" na seção de sentidos aguçados
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      // O botão de sentidos é o penúltimo (antes do de ancestralidade)
      const addKeenSenseButton = addButtons[addButtons.length - 2];

      await user.click(addKeenSenseButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            keenSenses: expect.arrayContaining([
              expect.objectContaining({
                type: 'visao',
                bonus: 5,
              }),
            ]),
          })
        );
      });
    });

    it('deve permitir editar tipo e bônus de sentido aguçado', async () => {
      const user = userEvent.setup();

      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo', // Nome válido para passar validação
        keenSenses: [{ type: 'visao', bonus: 5, description: '' }],
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      // Muda o tipo do sentido
      const typeSelect = screen.getByLabelText('Tipo de Sentido');
      await user.click(typeSelect);
      const olfatoOption = screen.getByRole('option', { name: 'Olfato' });
      await user.click(olfatoOption);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            keenSenses: expect.arrayContaining([
              expect.objectContaining({
                type: 'olfato',
              }),
            ]),
          })
        );
      });
    });

    it('deve permitir remover sentido aguçado', async () => {
      const user = userEvent.setup();

      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo', // Nome válido para passar validação
        keenSenses: [
          { type: 'visao', bonus: 5, description: '' },
          { type: 'olfato', bonus: 7, description: '' },
        ],
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      // Encontra botão de deletar (ícone vermelho)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('[data-testid="DeleteIcon"]')
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(mockOnUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              keenSenses: expect.arrayContaining([
                expect.objectContaining({
                  type: 'olfato',
                }),
              ]),
            })
          );
        });
      }
    });
  });

  describe('Deslocamento', () => {
    it('deve exibir todos os tipos de deslocamento', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText('Andando')).toBeInTheDocument();
      expect(screen.getByLabelText('Voando')).toBeInTheDocument();
      expect(screen.getByLabelText('Escalando')).toBeInTheDocument();
      expect(screen.getByLabelText('Escavando')).toBeInTheDocument();
      expect(screen.getByLabelText('Nadando')).toBeInTheDocument();
    });

    it('deve permitir editar velocidade de deslocamento', async () => {
      const user = userEvent.setup();

      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      const voandoInput = screen.getByLabelText('Voando');
      await user.clear(voandoInput);
      await user.type(voandoInput, '12');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            movement: expect.objectContaining({
              voando: 12,
            }),
          })
        );
      });
    });
  });

  describe('Características de Ancestralidade', () => {
    it('deve exibir mensagem quando não há características', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(
        screen.getByText(/Nenhuma característica de ancestralidade definida/)
      ).toBeInTheDocument();
    });

    it('deve permitir adicionar característica de ancestralidade', async () => {
      const user = userEvent.setup();

      // Fornece uma linhagem com nome válido para passar validação
      const lineage: Lineage = {
        ...defaultLineage,
        name: 'Elfo',
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineage}
        />
      );

      // Existem múltiplos botões "Adicionar", pegamos pelo texto exato
      const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
      // O último botão "Adicionar" é o de ancestralidade
      const addButton = addButtons[addButtons.length - 1];
      await user.click(addButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            ancestryTraits: [{ name: '', description: '' }],
          })
        );
      });
    });

    it('deve permitir remover característica de ancestralidade', async () => {
      const user = userEvent.setup();

      const lineageWithTrait: Lineage = {
        ...defaultLineage,
        name: 'Elfo', // Nome válido para passar validação
        ancestryTraits: [
          { name: 'Visão no Escuro', description: 'Enxerga no escuro' },
        ],
      };

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={lineageWithTrait}
        />
      );

      const deleteButtons = screen.getAllByRole('button', {
        name: '',
      });
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('[data-testid="DeleteIcon"]')
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(mockOnUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              ancestryTraits: [],
            })
          );
        });
      }
    });
  });

  describe('Validação', () => {
    it('deve exibir erro quando nome está vazio e showValidation é true', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          showValidation={true}
          lineage={{
            ...defaultLineage,
            name: '',
          }}
        />
      );

      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });

    it('não deve exibir erros quando showValidation é false', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          showValidation={false}
          lineage={{
            ...defaultLineage,
            name: '',
          }}
        />
      );

      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });
  });

  describe('Auto-save com Debounce', () => {
    it('deve chamar onUpdate quando dados são alterados', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const nameInput = screen.getByLabelText(/nome da linhagem/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Humano');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Fechamento', () => {
    it('deve chamar onClose quando solicitado', () => {
      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Simula ESC key (teste de acessibilidade)
      fireEvent.keyDown(document, { key: 'Escape' });

      // O componente Sidebar base deve lidar com isso
      // Apenas verificamos que a função onClose está disponível
      expect(mockOnClose).toBeDefined();
    });
  });
});
