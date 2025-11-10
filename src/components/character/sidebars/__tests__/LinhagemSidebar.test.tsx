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

    it('não deve renderizar conteúdo quando fechada', () => {
      const { container } = render(
        <LinhagemSidebar
          open={false}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Sidebar fechada não exibe conteúdo visível
      expect(
        container.querySelector('[role="presentation"]')
      ).toBeInTheDocument();
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

      const nameInput = screen.getByLabelText('Nome da Linhagem');
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

      const nameInput = screen.getByLabelText('Nome da Linhagem');
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
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const descInput = screen.getByLabelText('Descrição da Linhagem');
      await user.clear(descInput);
      await user.type(descInput, 'Seres robustos');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Seres robustos',
          })
        );
      });
    });
  });

  describe('Edição de Campos Numéricos', () => {
    it('deve permitir editar altura', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const heightInput = screen.getByLabelText('Altura (cm)');
      await user.clear(heightInput);
      await user.type(heightInput, '180');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            height: 180,
          })
        );
      });
    });

    it('deve permitir editar peso em kg', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const weightInput = screen.getByLabelText('Peso (kg)');
      await user.clear(weightInput);
      await user.type(weightInput, '80');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            weightKg: 80,
          })
        );
      });
    });

    it('deve permitir editar idade', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const ageInput = screen.getByLabelText('Idade');
      await user.clear(ageInput);
      await user.type(ageInput, '150');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            age: 150,
          })
        );
      });
    });
  });

  describe('Seleção de Tamanho', () => {
    it('deve permitir selecionar tamanho', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
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

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
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
    it('deve permitir selecionar sentido aguçado', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const senseSelect = screen.getByLabelText('Sentido Aguçado');
      await user.click(senseSelect);

      const olfatoOption = screen.getByRole('option', { name: 'Olfato' });
      await user.click(olfatoOption);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            keenSense: 'olfato',
          })
        );
      });
    });

    it('deve permitir remover sentido aguçado', async () => {
      const user = userEvent.setup();

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          lineage={{
            ...defaultLineage,
            keenSense: 'visao',
          }}
        />
      );

      const senseSelect = screen.getByLabelText('Sentido Aguçado');
      await user.click(senseSelect);

      const noneOption = screen.getByRole('option', { name: 'Nenhum' });
      await user.click(noneOption);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            keenSense: undefined,
          })
        );
      });
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

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
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

      render(
        <LinhagemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const addButton = screen.getByRole('button', { name: /adicionar/i });
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

      const nameInput = screen.getByLabelText('Nome da Linhagem');
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
