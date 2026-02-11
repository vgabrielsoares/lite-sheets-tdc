/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { OrigemSidebar } from '../OrigemSidebar';
import type { Origin } from '@/types/character';
import { createDefaultOrigin, createExampleOrigin } from '@/utils/originUtils';

describe('OrigemSidebar', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar corretamente quando aberta', () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Origem do Personagem')).toBeInTheDocument();
      // Campo Nome está sempre visível (fora dos accordions)
      expect(
        screen.getByRole('textbox', { name: /nome da origem/i })
      ).toBeInTheDocument();
      // Títulos dos accordions
      expect(
        screen.getByText('Proficiências com Habilidades')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Modificadores de Atributos')
      ).toBeInTheDocument();
      expect(screen.getByText('Habilidade Especial')).toBeInTheDocument();
    });

    it('não deve renderizar quando fechada', () => {
      const { container } = render(
        <OrigemSidebar
          open={false}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('deve renderizar com origem existente', () => {
      const origin = createExampleOrigin();

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByDisplayValue('Nobre')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Prestígio')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onClose ao clicar no botão fechar', () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // O aria-label segue o padrão "Fechar {título}"
      const closeButton = screen.getByLabelText('Fechar Origem do Personagem');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('deve atualizar nome da origem', async () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const nameInput = screen.getByRole('textbox', {
        name: /nome da origem/i,
      });
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Artista');

      // Aguarda o debounce de 500ms + margem
      await waitFor(
        () => {
          expect(mockOnUpdate).toHaveBeenCalled();
          // Verifica se pelo menos UMA das chamadas tem o nome correto
          const calls = mockOnUpdate.mock.calls;
          const hasCorrectName = calls.some(
            (call) => call[0].name === 'Artista'
          );
          expect(hasCorrectName).toBe(true);
        },
        { timeout: 1500 }
      );
    });

    it('deve adicionar modificador de atributo', async () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Accordions estão expandidos por padrão (defaultExpanded)
      const addButton = screen.getByRole('button', {
        name: /adicionar modificador/i,
      });
      await userEvent.click(addButton);

      // Aguarda o debounce (500ms) + margem
      await waitFor(
        () => {
          expect(mockOnUpdate).toHaveBeenCalled();
          // Verifica se pelo menos UMA das chamadas tem 1 modificador
          const calls = mockOnUpdate.mock.calls;
          const hasModifier = calls.some(
            (call) =>
              call[0].attributeModifiers &&
              call[0].attributeModifiers.length === 1
          );
          expect(hasModifier).toBe(true);
        },
        { timeout: 1500 }
      );
    });

    it('deve limitar adição de modificadores a 3', () => {
      const origin: Origin = {
        ...createDefaultOrigin(),
        attributeModifiers: [
          { attribute: 'agilidade', value: 1 },
          { attribute: 'corpo', value: 1 },
          { attribute: 'corpo', value: -1 },
        ],
      };

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      const addButton = screen.getByRole('button', {
        name: /adicionar modificador/i,
      });
      expect(addButton).toBeDisabled();
    });

    it('deve remover modificador de atributo', async () => {
      const origin: Origin = {
        ...createDefaultOrigin(),
        attributeModifiers: [
          { attribute: 'agilidade', value: 1 },
          { attribute: 'corpo', value: 1 },
        ],
      };

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      const deleteButtons = screen.getAllByRole('button', {
        name: /remover modificador/i,
      });
      await userEvent.click(deleteButtons[0]);

      // Aguarda o debounce (500ms) + margem
      await waitFor(
        () => {
          expect(mockOnUpdate).toHaveBeenCalled();
          // Verifica se pelo menos UMA das chamadas tem 1 modificador (removeu 1 de 2)
          const calls = mockOnUpdate.mock.calls;
          const hasOnlyOne = calls.some(
            (call) =>
              call[0].attributeModifiers &&
              call[0].attributeModifiers.length === 1
          );
          expect(hasOnlyOne).toBe(true);
        },
        { timeout: 1500 }
      );
    });
  });

  describe('Validação', () => {
    it('deve exibir erros quando validação habilitada e dados inválidos', () => {
      const origin: Origin = {
        ...createDefaultOrigin(),
        skillProficiencies: ['acrobacia'], // Deveria ter 2
        attributeModifiers: [{ attribute: 'agilidade', value: 2 }], // Valor inválido
      };

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
          showValidation={true}
        />
      );

      expect(
        screen.getByText(/Atenção: Há erros de validação/i)
      ).toBeInTheDocument();
    });

    it('deve exibir sucesso quando validação habilitada e dados válidos', async () => {
      const origin = createExampleOrigin();

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
          showValidation={true}
        />
      );

      // Simula edição
      const nameInput = screen.getByRole('textbox', {
        name: /nome da origem/i,
      });
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Nobre Atualizado');

      await waitFor(
        () => {
          const successMessage = screen.queryByText(/Origem válida!/i);
          expect(successMessage).toBeInTheDocument();
        },
        { timeout: 8000 }
      );
    }, 10000);

    it('não deve exibir validação quando showValidation é false', () => {
      const origin: Origin = {
        ...createDefaultOrigin(),
        skillProficiencies: ['acrobacia'], // Inválido
      };

      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
          showValidation={false}
        />
      );

      expect(
        screen.queryByText(/Atenção: Há erros de validação/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Auto-save', () => {
    it('deve fazer auto-save após debounce quando editado', async () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Aguarda render inicial estabilizar
      await waitFor(() => {}, { timeout: 100 });

      // Reset dos mocks após render inicial
      mockOnUpdate.mockClear();

      // Pega o primeiro textbox "Descrição" (não a "Descrição da Habilidade Especial")
      const descriptionInputs = screen.getAllByRole('textbox', {
        name: /descrição/i,
      });
      const descriptionInput = descriptionInputs[0]; // Primeiro é "Descrição" da origem

      // Digita (isso irá triggerar hasUserEdited = true e iniciar debounce)
      await userEvent.type(descriptionInput, 'Nova descrição');

      // Após debounce (100ms do componente), deve chamar onUpdate com a descrição atualizada
      // userEvent.type é lento (digita caractere por caractere), então precisamos de timeout maior
      await waitFor(
        () => {
          expect(mockOnUpdate).toHaveBeenCalled();
          const calls = mockOnUpdate.mock.calls;
          const hasDescription = calls.some(
            (call) =>
              call[0].description &&
              call[0].description.includes('Nova descrição')
          );
          expect(hasDescription).toBe(true);
        },
        { timeout: 3000 }
      );
    }, 10000);

    it('não deve fazer auto-save se não editou', async () => {
      render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Aguarda um tempo para garantir que não há chamadas
      await waitFor(() => {}, { timeout: 600 });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Sincronização', () => {
    it('deve sincronizar estado local ao abrir', () => {
      const origin = createExampleOrigin();
      const { rerender } = render(
        <OrigemSidebar
          open={false}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      // Abre sidebar
      rerender(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByDisplayValue('Nobre')).toBeInTheDocument();
    });

    it('deve resetar flag hasUserEdited ao abrir', async () => {
      const origin = createDefaultOrigin();
      const { rerender } = render(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      // Edita
      const nameInput = screen.getByRole('textbox', {
        name: /nome da origem/i,
      });
      await userEvent.type(nameInput, 'Test');

      // Fecha
      rerender(
        <OrigemSidebar
          open={false}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      // Reabre
      rerender(
        <OrigemSidebar
          open={true}
          onClose={mockOnClose}
          origin={origin}
          onUpdate={mockOnUpdate}
        />
      );

      // Não deve chamar update automaticamente após reabrir
      await waitFor(() => {}, { timeout: 600 });
      const callsBeforeEdit = mockOnUpdate.mock.calls.length;

      // Edita novamente
      const nameInputAfterReopen = screen.getByRole('textbox', {
        name: /nome da origem/i,
      });
      await userEvent.type(nameInputAfterReopen, 'X');

      // Agora deve chamar
      await waitFor(
        () => {
          expect(mockOnUpdate.mock.calls.length).toBeGreaterThan(
            callsBeforeEdit
          );
        },
        { timeout: 1000 }
      );
    });
  });
});
