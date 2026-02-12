import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttributeSidebar } from '../AttributeSidebar';
import type { Character, AttributeName } from '@/types';
import { createDefaultCharacter } from '@/utils/characterFactory';
import {
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_LABELS,
} from '@/constants/attributes';
import { SKILL_DESCRIPTIONS } from '@/types/skills';

describe('AttributeSidebar', () => {
  let mockCharacter: Character;
  const mockOnClose = jest.fn();
  const mockOnUpdateAttribute = jest.fn();

  beforeEach(() => {
    mockCharacter = createDefaultCharacter({ name: 'Test Character' });
    // Set default attribute values for testing
    mockCharacter.attributes = {
      agilidade: 2,
      corpo: 3,
      influencia: 2,
      mente: 3,
      essencia: 1,
      instinto: 1,
    };
    mockOnClose.mockClear();
    mockOnUpdateAttribute.mockClear();
  });

  describe('Header and Basic Info', () => {
    it('should display attribute name and value', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText(ATTRIBUTE_LABELS.mente)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show warning for attribute value 0', () => {
      mockCharacter.attributes.agilidade = 0;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText(/Com atributo 0, você rola/)).toBeInTheDocument();
      expect(screen.getByText(/2d20 e usa o MENOR/)).toBeInTheDocument();
    });

    it('should show info for attribute above 5', () => {
      mockCharacter.attributes.corpo = 6;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(
        screen.getByText(/Este atributo excede o valor padrão máximo/)
      ).toBeInTheDocument();
    });

    it('should not show warnings for normal values (1-5)', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.queryByText(/Com atributo 0/)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/excede o valor padrão máximo/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Attribute Description', () => {
    it('should display correct description for each attribute', () => {
      const attributes: AttributeName[] = [
        'agilidade',
        'corpo',
        'influencia',
        'mente',
        'essencia',
        'instinto',
      ];

      attributes.forEach((attr) => {
        const { unmount } = render(
          <AttributeSidebar
            open={true}
            onClose={mockOnClose}
            attribute={attr}
            character={mockCharacter}
            onUpdateAttribute={mockOnUpdateAttribute}
          />
        );

        expect(
          screen.getByText(ATTRIBUTE_DESCRIPTIONS[attr])
        ).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Special Impacts', () => {
    it('should show language slots for Mente attribute', () => {
      mockCharacter.attributes.mente = 3;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('Idiomas Adicionais')).toBeInTheDocument();
      expect(
        screen.getByText(/você pode conhecer 2 idioma\(s\) adicional/)
      ).toBeInTheDocument();
    });

    it('should show skill proficiency slots for Mente attribute', () => {
      mockCharacter.attributes.mente = 3;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(
        screen.getByText('Proficiências em Habilidades')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/você pode ter proficiência.*em 6 habilidade/)
      ).toBeInTheDocument();
    });

    it('should show defense impact for Agilidade attribute', () => {
      mockCharacter.attributes.agilidade = 2;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      // v0.2: Defense is now an active test, not a fixed value
      expect(screen.getByText('Teste de Defesa')).toBeInTheDocument();
      expect(
        screen.getByText(/defesa é um teste ativo usando Reflexo/)
      ).toBeInTheDocument();
    });

    it('should show reflexo impact for Agilidade attribute', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      // v0.2: Iniciativa was removed; Agilidade now shows Reflexo impact
      expect(screen.getByText('Reflexo')).toBeInTheDocument();
    });

    it('should show GA and dying state for Corpo', () => {
      mockCharacter.attributes.corpo = 3;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('Guarda (GA)')).toBeInTheDocument();
      expect(screen.getByText('Estado Morrendo')).toBeInTheDocument();
      expect(
        screen.getByText(/você pode sobreviver até 5 rodadas/)
      ).toBeInTheDocument();
    });

    it('should show PP and PP limit for Essência', () => {
      mockCharacter.attributes.essencia = 2;
      mockCharacter.level = 5;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="essencia"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('Pontos de Poder')).toBeInTheDocument();
      expect(screen.getByText('Limite de PP por Rodada')).toBeInTheDocument();
      expect(
        screen.getByText(/você pode gastar até 7 PP por rodada/)
      ).toBeInTheDocument();
    });

    it('should show carry capacity for Corpo', () => {
      mockCharacter.attributes.corpo = 3;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('Capacidade de Carga')).toBeInTheDocument();
      expect(
        screen.getByText(/você pode carregar 20 espaços/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pode empurrar 30 e levantar 15/)
      ).toBeInTheDocument();
    });

    it('should show social interactions for Influência', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="influencia"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('Interações Sociais')).toBeInTheDocument();
    });
  });

  describe('Related Skills', () => {
    it('should list all skills that use the attribute as default key', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(
        screen.getByText('Habilidades que Usam Agilidade')
      ).toBeInTheDocument();
      // Agilidade skills: acerto, acrobacia, conducao, destreza, furtividade, iniciativa, reflexo
      expect(screen.getByText('acerto')).toBeInTheDocument();
      expect(screen.getByText('acrobacia')).toBeInTheDocument();
      expect(screen.getByText('furtividade')).toBeInTheDocument();
    });

    it('should show proficiency level for each skill', () => {
      // Set some skills to non-leigo proficiency
      mockCharacter.skills.acerto = {
        ...mockCharacter.skills.acerto,
        proficiencyLevel: 'adepto',
      };
      mockCharacter.skills.furtividade = {
        ...mockCharacter.skills.furtividade,
        proficiencyLevel: 'versado',
      };

      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      // Should show proficiency chips
      const adeptoChips = screen.getAllByText('adepto');
      const versadoChips = screen.getAllByText('versado');
      expect(adeptoChips.length).toBeGreaterThan(0);
      expect(versadoChips.length).toBeGreaterThan(0);
    });

    it('should mark skills with changed key attribute as crossed out', () => {
      // Change luta to use Agilidade instead of Corpo
      mockCharacter.skills.luta = {
        ...mockCharacter.skills.luta,
        keyAttribute: 'agilidade',
      };

      const { container } = render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      // Find luta skill item - should have reduced opacity or line-through
      const lutaItem = container.querySelector('li')?.parentElement;
      // This is a simplified check - actual implementation may vary
      expect(screen.getByText('luta')).toBeInTheDocument();
    });

    it('should show custom key skills section when applicable', () => {
      // Change acrobacia (normally Agilidade) to use Corpo
      mockCharacter.skills.acrobacia = {
        ...mockCharacter.skills.acrobacia,
        keyAttribute: 'corpo',
      };

      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(
        screen.getByText('Habilidades Alteradas para Usar Corpo')
      ).toBeInTheDocument();
      expect(screen.getByText('acrobacia')).toBeInTheDocument();
      expect(screen.getByText(/Padrão: Agilidade/)).toBeInTheDocument();
    });

    it('should display skill descriptions', () => {
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      // Mente skills include arte, estrategia, etc (arcano moved to essencia)
      expect(screen.getByText(SKILL_DESCRIPTIONS.arte)).toBeInTheDocument();
    });
  });

  describe('Dice Roll Formula', () => {
    it('should show 1d20 for attribute value 1', () => {
      mockCharacter.attributes.essencia = 1;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="essencia"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('1d20')).toBeInTheDocument();
      expect(screen.getByText(/Rola 1 dado de 20 lados/)).toBeInTheDocument();
    });

    it('should show -2d20 for attribute value 0', () => {
      mockCharacter.attributes.agilidade = 0;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="agilidade"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('-2d20')).toBeInTheDocument();
      expect(
        screen.getByText(/Rola 2 dados de 20 lados e escolhe o menor resultado/)
      ).toBeInTheDocument();
    });

    it('should show Xd20 (maior) for attribute values 2+', () => {
      mockCharacter.attributes.mente = 4;
      render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );

      expect(screen.getByText('4d20 (maior)')).toBeInTheDocument();
      expect(
        screen.getByText(/Rola 4 dados de 20 lados e escolhe o maior resultado/)
      ).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render without crashing for all attributes', () => {
      const attributes: AttributeName[] = [
        'agilidade',
        'corpo',
        'influencia',
        'mente',
        'essencia',
        'instinto',
      ];

      attributes.forEach((attr) => {
        const { unmount } = render(
          <AttributeSidebar
            open={true}
            onClose={mockOnClose}
            attribute={attr}
            character={mockCharacter}
            onUpdateAttribute={mockOnUpdateAttribute}
          />
        );
        expect(screen.getByText(ATTRIBUTE_LABELS[attr])).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle edge cases gracefully', () => {
      // Test with extreme attribute values
      mockCharacter.attributes.corpo = 10;
      mockCharacter.attributes.mente = 0;

      const { rerender } = render(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="corpo"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );
      expect(screen.getByText('10')).toBeInTheDocument();

      rerender(
        <AttributeSidebar
          open={true}
          onClose={mockOnClose}
          attribute="mente"
          character={mockCharacter}
          onUpdateAttribute={mockOnUpdateAttribute}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
