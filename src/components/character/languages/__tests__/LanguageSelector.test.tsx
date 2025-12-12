import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../LanguageSelector';
import type { LanguageName } from '@/types';

describe('LanguageSelector', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    selectedLanguages: ['comum'] as LanguageName[],
    availableLanguages: ['elfico', 'anao', 'draconico'] as LanguageName[],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar com label padrão', () => {
      render(<LanguageSelector {...defaultProps} />);
      expect(screen.getByLabelText('Idiomas')).toBeInTheDocument();
    });

    it('deve renderizar com label customizada', () => {
      render(<LanguageSelector {...defaultProps} label="Meus Idiomas" />);
      expect(screen.getByLabelText('Meus Idiomas')).toBeInTheDocument();
    });

    it('deve exibir idiomas selecionados como chips', () => {
      render(<LanguageSelector {...defaultProps} />);
      expect(screen.getByText('Comum')).toBeInTheDocument();
    });

    it('deve exibir múltiplos idiomas selecionados', () => {
      const props = {
        ...defaultProps,
        selectedLanguages: ['comum', 'elfico', 'anao'] as LanguageName[],
      };
      render(<LanguageSelector {...props} />);

      expect(screen.getByText('Comum')).toBeInTheDocument();
      expect(screen.getByText('Élfico (Aon-deug)')).toBeInTheDocument();
      expect(screen.getByText('Anão (Dvergur)')).toBeInTheDocument();
    });

    it('deve marcar chip de Comum com cor primária', () => {
      render(<LanguageSelector {...defaultProps} />);
      const comumChip = screen.getByText('Comum').closest('.MuiChip-root');
      expect(comumChip).toHaveClass('MuiChip-colorPrimary');
    });

    it('deve exibir helper text quando fornecido', () => {
      render(
        <LanguageSelector
          {...defaultProps}
          helperText="Você pode adicionar 2 idiomas"
        />
      );
      expect(
        screen.getByText('Você pode adicionar 2 idiomas')
      ).toBeInTheDocument();
    });
  });

  describe('Interação', () => {
    it('deve chamar onChange ao selecionar um idioma', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector {...defaultProps} />);

      // Clica no select para abrir
      const selectButton = screen.getByRole('combobox');
      await user.click(selectButton);

      // Seleciona um idioma
      const option = screen.getByRole('option', {
        name: 'Élfico (Aon-deug)',
      });
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('deve permitir seleção múltipla', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector {...defaultProps} />);

      const selectButton = screen.getByRole('combobox');
      await user.click(selectButton);

      // Seleciona primeiro idioma
      const elficoOption = screen.getByRole('option', {
        name: 'Élfico (Aon-deug)',
      });
      await user.click(elficoOption);

      // Abre novamente para selecionar outro
      await user.click(selectButton);

      // Seleciona segundo idioma
      const anaoOption = screen.getByRole('option', {
        name: 'Anão (Dvergur)',
      });
      await user.click(anaoOption);

      // Verifica que foi chamado duas vezes
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Estados', () => {
    it('deve estar desabilitado quando disabled=true', () => {
      render(<LanguageSelector {...defaultProps} disabled />);
      const selectButton = screen.getByRole('combobox');
      // MUI Select usa aria-disabled em vez de disabled HTML
      expect(selectButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('deve mostrar apenas idiomas disponíveis por padrão', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector {...defaultProps} />);

      const selectButton = screen.getByRole('combobox');
      await user.click(selectButton);

      // Deve mostrar apenas os idiomas disponíveis
      expect(
        screen.getByRole('option', { name: 'Élfico (Aon-deug)' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Anão (Dvergur)' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Dracônico (Nyelv)' })
      ).toBeInTheDocument();

      // Comum já está selecionado, não deve aparecer nas opções
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('deve mostrar todos os idiomas quando showOnlyAvailable=false', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        showOnlyAvailable: false,
      };
      render(<LanguageSelector {...props} />);

      const selectButton = screen.getByRole('combobox');
      await user.click(selectButton);

      // Deve mostrar os idiomas selecionados + disponíveis
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Validação Visual', () => {
    it('deve renderizar sem erros com lista vazia', () => {
      const props = {
        ...defaultProps,
        selectedLanguages: [] as LanguageName[],
      };
      render(<LanguageSelector {...props} />);
      expect(screen.getByLabelText('Idiomas')).toBeInTheDocument();
    });

    it('deve renderizar sem erros com nenhum idioma disponível', () => {
      const props = {
        ...defaultProps,
        availableLanguages: [] as LanguageName[],
      };
      render(<LanguageSelector {...props} />);
      expect(screen.getByLabelText('Idiomas')).toBeInTheDocument();
    });

    it('deve exibir chips corretamente quando há muitos idiomas', () => {
      const props = {
        ...defaultProps,
        selectedLanguages: [
          'comum',
          'elfico',
          'anao',
          'draconico',
          'infernal',
        ] as LanguageName[],
      };
      render(<LanguageSelector {...props} />);

      // Verifica que todos os chips são renderizados
      expect(screen.getByText('Comum')).toBeInTheDocument();
      expect(screen.getByText('Élfico (Aon-deug)')).toBeInTheDocument();
      expect(screen.getByText('Anão (Dvergur)')).toBeInTheDocument();
      expect(screen.getByText('Dracônico (Nyelv)')).toBeInTheDocument();
      expect(screen.getByText('Infernal (Jahanami)')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter label associado ao select', () => {
      render(<LanguageSelector {...defaultProps} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAccessibleName('Idiomas');
    });

    it('deve ter IDs únicos para elementos', () => {
      const { container } = render(<LanguageSelector {...defaultProps} />);
      const label = container.querySelector('#language-selector-label');
      const select = container.querySelector('#language-selector');

      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });
  });
});
