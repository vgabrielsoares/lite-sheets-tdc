import {
  getTotalLanguageSlots,
  getLineageLanguages,
  getMaxAllowedLanguages,
  canAddLanguage,
  addLanguage,
  canRemoveLanguage,
  removeLanguage,
  getAvailableLanguages,
  validateLanguageSelection,
  ensureComumLanguage,
  getLanguageSummary,
} from '../languageUtils';
import { createDefaultCharacter } from '../characterFactory';
import type { Character, LanguageName } from '@/types';

describe('languageUtils', () => {
  let character: Character;

  beforeEach(() => {
    character = createDefaultCharacter({ name: 'Test Character' });
    character.attributes.mente = 2;
    character.languages = ['comum'];
  });

  describe('getTotalLanguageSlots', () => {
    it('deve calcular slots totais corretamente', () => {
      expect(getTotalLanguageSlots(character)).toBe(2); // 1 Comum + (2-1) adicional
    });

    it('deve retornar 1 quando Mente é 0', () => {
      character.attributes.mente = 0;
      expect(getTotalLanguageSlots(character)).toBe(1); // Apenas Comum
    });

    it('deve retornar 1 quando Mente é 1', () => {
      character.attributes.mente = 1;
      expect(getTotalLanguageSlots(character)).toBe(1); // 1 + (1-1) = 1
    });

    it('deve calcular corretamente para Mente alto', () => {
      character.attributes.mente = 5;
      expect(getTotalLanguageSlots(character)).toBe(5); // 1 + (5-1) = 5
    });
  });

  describe('getLineageLanguages', () => {
    it('deve retornar array vazio quando não há linhagem', () => {
      character.lineage = undefined;
      expect(getLineageLanguages(character)).toEqual([]);
    });

    it('deve retornar idiomas da linhagem', () => {
      character.lineage = {
        name: 'Elfo',
        attributes: {
          agilidade: 1,
          constituicao: 0,
          forca: 0,
          influencia: 0,
          mente: 0,
          presenca: 0,
        },
        size: 'médio',
        height: 180,
        weight: 70,
        weightMeasure: 10,
        age: 100,
        lifeExpectancy: 500,
        languages: ['elfico', 'silvestre'] as LanguageName[],
        movement: {
          andando: 9,
          voando: 0,
          escalando: 0,
          escavando: 0,
          nadando: 0,
        },
        vision: 'normal',
        ancestryTraits: [],
      };

      expect(getLineageLanguages(character)).toEqual(['elfico', 'silvestre']);
    });
  });

  describe('getMaxAllowedLanguages', () => {
    it('deve calcular máximo permitido sem linhagem', () => {
      expect(getMaxAllowedLanguages(character)).toBe(2);
    });

    it('deve incluir idiomas de linhagem no cálculo', () => {
      character.lineage = {
        name: 'Elfo',
        attributes: {
          agilidade: 1,
          constituicao: 0,
          forca: 0,
          influencia: 0,
          mente: 0,
          presenca: 0,
        },
        size: 'médio',
        height: 180,
        weight: 70,
        weightMeasure: 10,
        age: 100,
        lifeExpectancy: 500,
        languages: ['elfico'] as LanguageName[],
        movement: {
          andando: 9,
          voando: 0,
          escalando: 0,
          escavando: 0,
          nadando: 0,
        },
        vision: 'normal',
        ancestryTraits: [],
      };

      expect(getMaxAllowedLanguages(character)).toBe(3); // 2 de Mente + 1 de linhagem
    });
  });

  describe('canAddLanguage', () => {
    it('deve permitir adicionar quando há slots disponíveis', () => {
      const result = canAddLanguage(character, 'elfico');
      expect(result.canAdd).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('não deve permitir adicionar idioma já conhecido', () => {
      const result = canAddLanguage(character, 'comum');
      expect(result.canAdd).toBe(false);
      expect(result.reason).toBe('Este idioma já é conhecido pelo personagem.');
    });

    it('não deve permitir adicionar quando excede limite', () => {
      character.attributes.mente = 1; // Permite apenas Comum
      character.languages = ['comum'];

      const result = canAddLanguage(character, 'elfico');
      expect(result.canAdd).toBe(false);
      expect(result.reason).toContain('já atingiu o limite');
    });

    it('deve permitir adicionar múltiplos idiomas sequencialmente', () => {
      character.attributes.mente = 4; // Permite 4 slots

      expect(canAddLanguage(character, 'elfico').canAdd).toBe(true);
      character.languages.push('elfico');

      expect(canAddLanguage(character, 'anao').canAdd).toBe(true);
      character.languages.push('anao');

      expect(canAddLanguage(character, 'draconico').canAdd).toBe(true);
    });
  });

  describe('addLanguage', () => {
    it('deve adicionar idioma quando permitido', () => {
      const updated = addLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      expect(updated!.languages).toContain('elfico');
      expect(updated!.languages).toContain('comum');
    });

    it('deve retornar null quando não permitido', () => {
      character.attributes.mente = 1;
      character.languages = ['comum'];

      const updated = addLanguage(character, 'elfico');
      expect(updated).toBeNull();
    });

    it('não deve mutar objeto original', () => {
      const originalLanguages = [...character.languages];
      addLanguage(character, 'elfico');
      expect(character.languages).toEqual(originalLanguages);
    });
  });

  describe('canRemoveLanguage', () => {
    it('deve permitir remover idioma não-Comum', () => {
      character.languages = ['comum', 'elfico'];
      const result = canRemoveLanguage(character, 'elfico');
      expect(result.canRemove).toBe(true);
    });

    it('não deve permitir remover Comum', () => {
      const result = canRemoveLanguage(character, 'comum');
      expect(result.canRemove).toBe(false);
      expect(result.reason).toBe('O idioma Comum não pode ser removido.');
    });

    it('não deve permitir remover idioma desconhecido', () => {
      const result = canRemoveLanguage(character, 'elfico');
      expect(result.canRemove).toBe(false);
      expect(result.reason).toBe(
        'Este idioma não é conhecido pelo personagem.'
      );
    });
  });

  describe('removeLanguage', () => {
    it('deve remover idioma quando permitido', () => {
      character.languages = ['comum', 'elfico'];
      const updated = removeLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      expect(updated!.languages).toEqual(['comum']);
    });

    it('deve retornar null quando não permitido', () => {
      const updated = removeLanguage(character, 'comum');
      expect(updated).toBeNull();
    });

    it('não deve mutar objeto original', () => {
      character.languages = ['comum', 'elfico'];
      const originalLanguages = [...character.languages];
      removeLanguage(character, 'elfico');
      expect(character.languages).toEqual(originalLanguages);
    });
  });

  describe('getAvailableLanguages', () => {
    it('deve retornar idiomas não conhecidos', () => {
      const available = getAvailableLanguages(character);
      expect(available).not.toContain('comum');
      expect(available.length).toBeGreaterThan(0);
    });

    it('deve excluir todos os idiomas conhecidos', () => {
      character.languages = ['comum', 'elfico', 'anao'];
      const available = getAvailableLanguages(character);

      expect(available).not.toContain('comum');
      expect(available).not.toContain('elfico');
      expect(available).not.toContain('anao');
    });

    it('deve retornar todos os idiomas quando nenhum é conhecido exceto Comum', () => {
      character.languages = ['comum'];
      const available = getAvailableLanguages(character);

      // Deve ter 13 idiomas (14 total - 1 Comum)
      expect(available.length).toBe(13);
    });
  });

  describe('validateLanguageSelection', () => {
    it('deve validar seleção correta', () => {
      const result = validateLanguageSelection(character);
      expect(result.valid).toBe(true);
      expect(result.currentCount).toBe(1);
      expect(result.maxAllowed).toBe(2);
      expect(result.excess).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('deve detectar quando excede limite', () => {
      character.attributes.mente = 1;
      character.languages = ['comum', 'elfico', 'anao'];

      const result = validateLanguageSelection(character);
      expect(result.valid).toBe(false);
      expect(result.excess).toBe(2);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('deve detectar quando falta Comum', () => {
      character.languages = ['elfico'];

      const result = validateLanguageSelection(character);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain(
        'O idioma Comum deve sempre estar presente.'
      );
    });

    it('deve mostrar avisos múltiplos quando aplicável', () => {
      character.attributes.mente = 1;
      character.languages = ['elfico', 'anao']; // Falta Comum e excede limite

      const result = validateLanguageSelection(character);
      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBe(2);
    });
  });

  describe('ensureComumLanguage', () => {
    it('não deve alterar quando Comum já está presente', () => {
      const result = ensureComumLanguage(character);
      expect(result.languages).toEqual(['comum']);
    });

    it('deve adicionar Comum quando falta', () => {
      character.languages = ['elfico'];
      const result = ensureComumLanguage(character);
      expect(result.languages).toContain('comum');
      expect(result.languages[0]).toBe('comum'); // Comum deve ser o primeiro
    });

    it('não deve duplicar Comum', () => {
      const result = ensureComumLanguage(character);
      const comumCount = result.languages.filter(
        (lang) => lang === 'comum'
      ).length;
      expect(comumCount).toBe(1);
    });

    it('não deve mutar objeto original', () => {
      character.languages = ['elfico'];
      const originalLanguages = [...character.languages];
      ensureComumLanguage(character);
      expect(character.languages).toEqual(originalLanguages);
    });
  });

  describe('getLanguageSummary', () => {
    it('deve retornar resumo completo', () => {
      const summary = getLanguageSummary(character);

      expect(summary).toEqual({
        total: 1,
        fromMente: 2,
        fromLineage: 0,
        remaining: 1,
        maxAllowed: 2,
      });
    });

    it('deve incluir idiomas de linhagem no resumo', () => {
      character.lineage = {
        name: 'Elfo',
        attributes: {
          agilidade: 1,
          constituicao: 0,
          forca: 0,
          influencia: 0,
          mente: 0,
          presenca: 0,
        },
        size: 'médio',
        height: 180,
        weight: 70,
        weightMeasure: 10,
        age: 100,
        lifeExpectancy: 500,
        languages: ['elfico', 'silvestre'] as LanguageName[],
        movement: {
          andando: 9,
          voando: 0,
          escalando: 0,
          escavando: 0,
          nadando: 0,
        },
        vision: 'normal',
        ancestryTraits: [],
      };
      character.languages = ['comum', 'elfico', 'silvestre'];

      const summary = getLanguageSummary(character);

      expect(summary.fromLineage).toBe(2);
      expect(summary.maxAllowed).toBe(4); // 2 de Mente + 2 de linhagem
    });

    it('deve calcular restantes corretamente', () => {
      character.attributes.mente = 5; // Permite 5 slots
      character.languages = ['comum', 'elfico']; // Usa 2

      const summary = getLanguageSummary(character);
      expect(summary.remaining).toBe(3);
    });

    it('deve retornar 0 restantes quando no limite', () => {
      character.attributes.mente = 2;
      character.languages = ['comum', 'elfico'];

      const summary = getLanguageSummary(character);
      expect(summary.remaining).toBe(0);
    });

    it('deve retornar 0 restantes quando excede limite', () => {
      character.attributes.mente = 1;
      character.languages = ['comum', 'elfico', 'anao'];

      const summary = getLanguageSummary(character);
      expect(summary.remaining).toBe(0); // Não pode ser negativo
    });
  });

  describe('Integração entre funções', () => {
    it('deve permitir fluxo completo: adicionar, validar, remover', () => {
      // Estado inicial válido
      let validation = validateLanguageSelection(character);
      expect(validation.valid).toBe(true);

      // Adiciona idioma
      let updated = addLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      character = updated!;

      // Ainda válido
      validation = validateLanguageSelection(character);
      expect(validation.valid).toBe(true);

      // Remove idioma
      updated = removeLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      character = updated!;

      // Ainda válido
      validation = validateLanguageSelection(character);
      expect(validation.valid).toBe(true);
    });

    it('deve respeitar limites ao adicionar múltiplos idiomas', () => {
      character.attributes.mente = 3; // Permite 3 slots

      // Adiciona primeiro idioma
      let updated = addLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      character = updated!;

      // Adiciona segundo idioma
      updated = addLanguage(character, 'anao');
      expect(updated).not.toBeNull();
      character = updated!;

      // Deve estar no limite agora
      expect(character.languages).toHaveLength(3);

      // Não deve permitir adicionar mais
      const validation = canAddLanguage(character, 'draconico');
      expect(validation.canAdd).toBe(false);
    });

    it('deve manter Comum sempre presente durante operações', () => {
      // Aumenta Mente para permitir múltiplos idiomas
      character.attributes.mente = 4; // Permite 4 slots totais

      let updated = addLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      character = updated!;

      expect(character.languages).toContain('comum');

      updated = addLanguage(character, 'anao');
      expect(updated).not.toBeNull();
      character = updated!;

      expect(character.languages).toContain('comum');

      updated = removeLanguage(character, 'elfico');
      expect(updated).not.toBeNull();
      character = updated!;

      expect(character.languages).toContain('comum');
    });
  });
});
