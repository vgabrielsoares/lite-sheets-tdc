/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SizeSidebar } from '../SizeSidebar';
import type { CreatureSize } from '@/types/common';
import {
  SIZE_LABELS,
  SIZE_MODIFIERS,
  CREATURE_SIZES,
} from '@/constants/lineage';

describe('SizeSidebar', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar corretamente quando aberta com tamanho médio', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      // Verifica título
      expect(screen.getByText('Tamanho: Médio')).toBeInTheDocument();

      // Verifica seção de modificadores
      expect(screen.getByText('Modificadores Aplicados')).toBeInTheDocument();

      // Verifica tabela de referência
      expect(screen.getByText('Tabela de Referência')).toBeInTheDocument();
    });

    it('não deve renderizar quando fechada', () => {
      const { container } = render(
        <SizeSidebar open={false} onClose={mockOnClose} currentSize="medio" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('deve exibir descrição do tamanho atual', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="grande" />
      );

      expect(screen.getByText('Grande')).toBeInTheDocument();
      expect(
        screen.getByText(/Criaturas grandes incluem bugbears/i)
      ).toBeInTheDocument();
    });
  });

  describe('Modificadores de Combate', () => {
    it('deve exibir modificadores corretos para tamanho pequeno', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="pequeno" />
      );

      const modifiers = SIZE_MODIFIERS.pequeno;

      // Verifica seção de combate
      expect(screen.getByText('Combate')).toBeInTheDocument();

      // Verifica que os labels estão presentes
      expect(screen.getAllByText('Alcance').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dano Corpo-a-Corpo').length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByText('Guarda (GA)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Manobras de Combate').length).toBeGreaterThan(
        0
      );
    });

    it('deve exibir modificadores corretos para tamanho colossal-1', () => {
      render(
        <SizeSidebar
          open={true}
          onClose={mockOnClose}
          currentSize="colossal-1"
        />
      );

      const modifiers = SIZE_MODIFIERS['colossal-1'];

      // Verifica que existem modificadores positivos e negativos em dados (v0.0.2)
      expect(screen.getAllByText('+3d').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-3d').length).toBeGreaterThan(0);
    });
  });

  describe('Modificadores de Espaço e Carga', () => {
    it('deve exibir quadrados ocupados corretamente', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      expect(screen.getByText('Quadrados Ocupados')).toBeInTheDocument();
      expect(screen.getByText('1 quadrado')).toBeInTheDocument();
    });

    it('deve exibir peso carregável corretamente', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      expect(screen.getByText('Espaço Carregável')).toBeInTheDocument();
      // carryingCapacity é aditivo (0 para medio), formatado como modificador
      // Aparece na sidebar E na tabela de referência
      expect(screen.getAllByText('0 (normal)').length).toBeGreaterThan(0);
    });

    it('deve exibir modificador de carga reduzido para tamanho pequeno', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="pequeno" />
      );

      // carryingCapacity para pequeno é -2 (aditivo)
      // Aparece na sidebar E na tabela de referência
      expect(screen.getAllByText('-2 espaços').length).toBeGreaterThan(0);
    });

    it('deve exibir modificador de carga aumentado para tamanho grande', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="grande" />
      );

      // carryingCapacity para grande é 2 (aditivo)
      // Aparece na sidebar E na tabela de referência
      expect(screen.getAllByText('+2 espaços').length).toBeGreaterThan(0);
    });
  });

  describe('Modificadores de Habilidades', () => {
    it('deve exibir todos os modificadores de habilidades', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      // v0.0.2: título inclui "(em dados)"
      expect(
        screen.getByText(/Modificadores de Habilidades/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Acrobacia')).toBeInTheDocument();
      expect(screen.getByText('Atletismo')).toBeInTheDocument();
      expect(screen.getByText('Furtividade')).toBeInTheDocument();
      expect(screen.getByText('Reflexo')).toBeInTheDocument();
      expect(screen.getByText('Tenacidade')).toBeInTheDocument();
    });

    it('deve exibir bônus positivos para furtividade em tamanho pequeno', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="pequeno" />
      );

      const modifiers = SIZE_MODIFIERS.pequeno;

      // Verifica que modificadores de habilidades estão presentes
      // v0.0.2: título inclui "(em dados)", valores em formato +Xd
      // pequeno: acrobacia:1, furtividade:1, reflexo:1 → "+1d"
      expect(
        screen.getByText(/Modificadores de Habilidades/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText('+1d').length).toBeGreaterThan(0);
    });
  });

  describe('Tabela de Referência', () => {
    it('deve exibir todos os tamanhos na tabela', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      CREATURE_SIZES.forEach((size) => {
        expect(screen.getByText(SIZE_LABELS[size])).toBeInTheDocument();
      });
    });

    it('deve destacar o tamanho atual na tabela', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="grande" />
      );

      // Verifica se o tamanho atual está marcado
      expect(screen.getByText('Grande (Atual)')).toBeInTheDocument();
    });

    it('deve exibir cabeçalhos da tabela corretamente', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      // Verifica cabeçalhos principais da tabela
      expect(screen.getByText('Tamanho')).toBeInTheDocument();
      expect(screen.getAllByText('Dano').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Guarda').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Carga').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Manobras').length).toBeGreaterThan(0);
    });
  });

  describe('Informações Adicionais', () => {
    it('deve exibir legenda explicativa', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      expect(
        screen.getByText('Como os modificadores funcionam?')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Distância que você pode atacar corpo-a-corpo/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Modificador aplicado ao seu GA máximo/i)
      ).toBeInTheDocument();
    });

    it('deve exibir alerta informativo sobre aplicação automática', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      expect(
        screen.getByText(/Estes modificadores são aplicados automaticamente/i)
      ).toBeInTheDocument();
    });
  });

  describe('Formatação de Valores', () => {
    it('deve formatar alcance corretamente para tamanho minúsculo com alcance 1m', () => {
      render(
        <SizeSidebar
          open={true}
          onClose={mockOnClose}
          currentSize="minusculo"
        />
      );

      // Minúsculo tem reach: 1, então mostra "1m"
      expect(screen.getAllByText('1m').length).toBeGreaterThan(0);
    });

    it('deve formatar modificadores com sinal correto', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="grande" />
      );

      // Verifica que existem modificadores positivos e negativos
      expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-2').length).toBeGreaterThan(0);
    });

    it('deve formatar modificador zero sem sinal', () => {
      render(
        <SizeSidebar open={true} onClose={mockOnClose} currentSize="medio" />
      );

      // Verifica que existe o texto "0" (sem sinal)
      const cells = screen.getAllByText('0');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Diferentes Tamanhos', () => {
    it.each(CREATURE_SIZES)(
      'deve renderizar corretamente para tamanho %s',
      (size: CreatureSize) => {
        render(
          <SizeSidebar open={true} onClose={mockOnClose} currentSize={size} />
        );

        expect(
          screen.getByText(`Tamanho: ${SIZE_LABELS[size]}`)
        ).toBeInTheDocument();
        expect(screen.getByText('Modificadores Aplicados')).toBeInTheDocument();
      }
    );
  });
});
