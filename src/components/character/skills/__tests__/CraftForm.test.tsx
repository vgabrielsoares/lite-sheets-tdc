/**
 * Testes para CraftForm
 *
 * Testa:
 * - Renderização do formulário
 * - Criação de novo ofício
 * - Edição de ofício existente
 * - Validação de campos obrigatórios
 * - Mudança de valores
 * - Fechamento do dialog
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CraftForm } from '../CraftForm';
import type { Craft, AttributeName } from '@/types';

// Mock de atributos para testes
const mockAttributes: Record<AttributeName, number> = {
  agilidade: 2,
  constituicao: 3,
  forca: 1,
  influencia: 2,
  mente: 4,
  presenca: 3,
};

// Mock de ofício para edição
const mockCraft: Craft = {
  id: 'craft-123',
  name: 'Carpintaria',
  level: 3,
  attributeKey: 'forca',
  diceModifier: 1,
  numericModifier: 2,
  description: 'Trabalho em madeira',
};

describe('CraftForm', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar formulário para novo ofício', () => {
      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Adicionar Novo Ofício')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome do Ofício/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Adicionar Ofício/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Cancelar/i })
      ).toBeInTheDocument();
    });

    it('deve renderizar formulário para edição de ofício', () => {
      render(
        <CraftForm
          open={true}
          craft={mockCraft}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Editar Ofício')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Carpintaria')).toBeInTheDocument();
    });

    it('não deve renderizar quando open for false', () => {
      const { container } = render(
        <CraftForm
          open={false}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Dialog do MUI não renderiza conteúdo quando fechado
      expect(
        container.querySelector('[role="dialog"]')
      ).not.toBeInTheDocument();
    });
  });

  describe('Criação de Ofício', () => {
    it('deve permitir preencher todos os campos', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Ferraria');

      expect(screen.getByDisplayValue('Ferraria')).toBeInTheDocument();
    });

    it('deve validar campo nome obrigatório', async () => {
      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByRole('button', {
        name: /Adicionar Ofício/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/nome do ofício é obrigatório/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('deve chamar onSave com dados corretos ao salvar novo ofício', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Alquimia');

      const saveButton = screen.getByRole('button', {
        name: /Adicionar Ofício/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Alquimia',
            level: expect.any(Number),
            attributeKey: expect.any(String),
          })
        );
      });
    });
  });

  describe('Edição de Ofício', () => {
    it('deve preencher campos com dados do ofício ao editar', () => {
      render(
        <CraftForm
          open={true}
          craft={mockCraft}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByDisplayValue('Carpintaria')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Trabalho em madeira')
      ).toBeInTheDocument();
    });

    it('deve permitir alterar nome do ofício', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={mockCraft}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Marcenaria');

      expect(screen.getByDisplayValue('Marcenaria')).toBeInTheDocument();
    });

    it('deve chamar onSave com dados atualizados ao editar', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={mockCraft}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Marcenaria Avançada');

      const saveButton = screen.getByRole('button', {
        name: /Salvar Alterações/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Marcenaria Avançada',
          })
        );
      });
    });
  });

  describe('Interações', () => {
    it('deve chamar onClose ao clicar em Cancelar', () => {
      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('deve limpar erro ao fechar e reabrir', async () => {
      const { rerender } = render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Tentar salvar sem nome para gerar erro
      const saveButton = screen.getByRole('button', {
        name: /Adicionar Ofício/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/nome do ofício é obrigatório/i)
        ).toBeInTheDocument();
      });

      // Fechar
      rerender(
        <CraftForm
          open={false}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Reabrir
      rerender(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Erro não deve mais aparecer
      expect(
        screen.queryByText(/nome do ofício é obrigatório/i)
      ).not.toBeInTheDocument();
    });

    it('deve permitir alterar descrição', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const descriptionInput = screen.getByLabelText(/Descrição/i);
      await user.type(descriptionInput, 'Trabalho especializado em metais');

      expect(
        screen.getByDisplayValue('Trabalho especializado em metais')
      ).toBeInTheDocument();
    }, 10000);
  });

  describe('Validação', () => {
    it('não deve salvar ofício com nome apenas com espaços', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.type(nameInput, '   ');

      const saveButton = screen.getByRole('button', {
        name: /Adicionar Ofício/i,
      });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/O nome do ofício é obrigatório/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('deve remover espaços em branco do nome ao salvar', async () => {
      const user = userEvent.setup();

      render(
        <CraftForm
          open={true}
          craft={null}
          attributes={mockAttributes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/Nome do Ofício/i);
      await user.type(nameInput, '  Ferraria  ');

      const saveButton = screen.getByRole('button', {
        name: /Adicionar Ofício/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Ferraria',
          })
        );
      });
    });
  });
});
