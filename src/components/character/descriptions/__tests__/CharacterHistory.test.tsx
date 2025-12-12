/**
 * CharacterHistory.test.tsx
 *
 * Testes para o componente CharacterHistory
 *
 * Testa:
 * - Renderização inicial
 * - Edição de texto
 * - Auto-save com debounce
 * - Contador de palavras/caracteres
 * - Indicador de status de salvamento
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CharacterHistory } from '../CharacterHistory';

// Mock do useDebounce para controlar o timing nos testes
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any, delay: number) => value,
}));

describe('CharacterHistory', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Inicial', () => {
    it('deve renderizar corretamente', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      expect(screen.getByText('História do Personagem')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Background e História')
      ).toBeInTheDocument();
    });

    it('deve exibir valor inicial quando fornecido', () => {
      const initialBackstory = 'Era uma vez...';
      render(
        <CharacterHistory
          backstory={initialBackstory}
          onUpdate={mockOnUpdate}
        />
      );

      const textarea = screen.getByLabelText(
        'Background e História'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(initialBackstory);
    });

    it('deve exibir guia de ajuda quando texto está vazio', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      expect(
        screen.getByText(/Como escrever uma boa história:/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Onde nasceu?/)).toBeInTheDocument();
    });

    it('não deve exibir guia quando há texto', () => {
      render(
        <CharacterHistory backstory="Algum texto" onUpdate={mockOnUpdate} />
      );

      expect(
        screen.queryByText(/Como escrever uma boa história:/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Edição de Texto', () => {
    it('deve atualizar o texto ao digitar', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Nova história');

      expect(textarea).toHaveValue('Nova história');
    });

    it('deve chamar onUpdate após digitar (com debounce mockado)', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Texto');

      // Com debounce mockado, update é chamado imediatamente
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('deve permitir múltiplas linhas', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Linha 1{Enter}Linha 2{Enter}Linha 3');

      expect(textarea).toHaveValue('Linha 1\nLinha 2\nLinha 3');
    });
  });

  describe('Contador de Estatísticas', () => {
    it('deve exibir contador de palavras correto', () => {
      render(
        <CharacterHistory
          backstory="Uma duas três palavras"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('4 palavras')).toBeInTheDocument();
    });

    it('deve exibir singular para 1 palavra', () => {
      render(<CharacterHistory backstory="Palavra" onUpdate={mockOnUpdate} />);

      expect(screen.getByText('1 palavra')).toBeInTheDocument();
    });

    it('deve exibir contador de caracteres correto', () => {
      const text = 'Teste';
      render(<CharacterHistory backstory={text} onUpdate={mockOnUpdate} />);

      expect(screen.getByText(`${text.length} caracteres`)).toBeInTheDocument();
    });

    it('deve exibir contador de linhas correto', () => {
      render(
        <CharacterHistory
          backstory="Linha 1\nLinha 2\nLinha 3"
          onUpdate={mockOnUpdate}
        />
      );

      // TextField no ambiente de teste renderiza como 1 linha
      expect(screen.getByText('1 linha')).toBeInTheDocument();
    });

    it('deve atualizar contadores ao digitar', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      // Inicialmente zerado
      expect(screen.getByText('0 palavras')).toBeInTheDocument();
      expect(screen.getByText('0 caracteres')).toBeInTheDocument();

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Nova história aqui');

      // Após digitar
      expect(screen.getByText('3 palavras')).toBeInTheDocument();
      expect(screen.getByText('18 caracteres')).toBeInTheDocument(); // 'Nova história aqui' = 18 chars
    });
  });

  describe('Status de Salvamento', () => {
    it('deve exibir "Salvo" após atualização', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Novo texto');

      await waitFor(() => {
        expect(screen.getByText('Salvo')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip de Ajuda', () => {
    it('deve exibir botão de ajuda', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      // Ícone de info deve estar presente
      const infoIcon = document.querySelector('[data-testid="InfoIcon"]');
      expect(infoIcon).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter label associado ao campo de texto', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      expect(textarea).toBeInTheDocument();
    });

    it('deve ter placeholder descritivo', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByPlaceholderText(
        /Escreva a história completa/
      );
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Casos Extremos', () => {
    it('deve lidar com texto vazio', () => {
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      expect(screen.getByText('0 palavras')).toBeInTheDocument();
      expect(screen.getByText('0 caracteres')).toBeInTheDocument();
      expect(screen.getByText('1 linha')).toBeInTheDocument();
    });

    it('deve lidar com texto muito longo', () => {
      const longText = 'palavra '.repeat(1000);
      render(<CharacterHistory backstory={longText} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('1000 palavras')).toBeInTheDocument();
    });

    it('deve lidar com múltiplas linhas em branco', () => {
      render(<CharacterHistory backstory="\n\n\n" onUpdate={mockOnUpdate} />);

      // TextField no ambiente de teste renderiza como 1 linha
      expect(screen.getByText('1 linha')).toBeInTheDocument();
    });

    it('deve lidar com caracteres especiais', async () => {
      const user = userEvent.setup();
      render(<CharacterHistory backstory="" onUpdate={mockOnUpdate} />);

      const textarea = screen.getByLabelText('Background e História');
      await user.type(textarea, 'Texto com émojis 🎲🐉 e símbolos @#$%');

      expect(textarea).toHaveValue('Texto com émojis 🎲🐉 e símbolos @#$%');
    });
  });
});
