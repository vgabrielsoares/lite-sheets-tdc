/**
 * Testes para originUtils.ts
 *
 * Testa utilitários de validação e manipulação de origens
 */

import {
  createDefaultOrigin,
  validateOrigin,
  isOriginEmpty,
  getAttributeModifiersSummary,
  applyOriginAttributeModifiers,
  createExampleOrigin,
} from '../originUtils';
import type { Origin } from '@/types/character';

describe('originUtils', () => {
  describe('createDefaultOrigin', () => {
    it('deve criar origem padrão vazia', () => {
      const origin = createDefaultOrigin();

      expect(origin.name).toBe('');
      expect(origin.description).toBe('');
      expect(origin.attributeModifiers).toEqual([]);
      expect(origin.skillProficiencies).toEqual([]);
      expect(origin.specialAbility).toEqual({ name: '', description: '' });
    });
  });

  describe('validateOrigin', () => {
    it('deve validar origem completa', () => {
      const validOrigin: Origin = {
        name: 'Soldado',
        description: 'Um veterano de guerra',
        attributeModifiers: [
          { attribute: 'corpo', value: 1 },
          { attribute: 'agilidade', value: 1 },
          { attribute: 'mente', value: -1 },
        ],
        skillProficiencies: ['acerto', 'atletismo'],
        specialAbility: {
          name: 'Veterano',
          description: 'Bônus em combate',
        },
      };

      const result = validateOrigin(validOrigin);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve detectar nome ausente', () => {
      const origin: Origin = {
        name: '',
        description: 'Teste',
        attributeModifiers: [],
        skillProficiencies: [],
      };

      const result = validateOrigin(origin);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nome da origem é obrigatório');
    });

    it('deve validar proficiências de habilidades', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [
          { attribute: 'corpo', value: 1 },
          { attribute: 'agilidade', value: 1 },
          { attribute: 'mente', value: -1 },
        ],
        skillProficiencies: [], // Deve ter exatamente 2
      };

      const result = validateOrigin(origin);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve validar modificadores de atributos', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [], // Deve ter modificadores
        skillProficiencies: ['historia', 'persuasao'],
      };

      const result = validateOrigin(origin);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('isOriginEmpty', () => {
    it('deve identificar origem vazia', () => {
      const emptyOrigin = createDefaultOrigin();

      expect(isOriginEmpty(emptyOrigin)).toBe(true);
    });

    it('deve identificar origem indefinida como vazia', () => {
      expect(isOriginEmpty(undefined)).toBe(true);
    });

    it('deve identificar origem preenchida', () => {
      const origin: Origin = {
        name: 'Soldado',
        description: 'Descrição',
        attributeModifiers: [{ attribute: 'corpo', value: 1 }],
        skillProficiencies: ['acerto'],
      };

      expect(isOriginEmpty(origin)).toBe(false);
    });

    it('deve identificar origem com nome mas sem modificadores como vazia', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [],
        skillProficiencies: [],
      };

      expect(isOriginEmpty(origin)).toBe(true);
    });
  });

  describe('getAttributeModifiersSummary', () => {
    it('deve formatar modificadores positivos', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [
          { attribute: 'corpo', value: 2 },
          { attribute: 'agilidade', value: 1 },
        ],
        skillProficiencies: ['historia'],
      };

      const summary = getAttributeModifiersSummary(origin);

      expect(summary).toContain('+2 COR');
      expect(summary).toContain('+1 AGI');
    });

    it('deve formatar modificadores negativos', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [{ attribute: 'corpo', value: -1 }],
        skillProficiencies: [],
      };

      const summary = getAttributeModifiersSummary(origin);

      expect(summary).toContain('-1 COR');
    });

    it('deve retornar mensagem padrão sem modificadores', () => {
      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [],
        skillProficiencies: [],
      };

      const summary = getAttributeModifiersSummary(origin);

      expect(summary).toBe('Nenhum modificador');
    });
  });

  describe('applyOriginAttributeModifiers', () => {
    it('deve aplicar modificadores corretamente', () => {
      const baseAttributes = {
        agilidade: 2,
        corpo: 2,
        influencia: 2,
        mente: 2,
        essencia: 2,
        instinto: 1,
      };

      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [
          { attribute: 'corpo', value: 1 },
          { attribute: 'mente', value: -1 },
        ],
        skillProficiencies: [],
      };

      const modified = applyOriginAttributeModifiers(baseAttributes, origin);

      expect(modified.corpo).toBe(3); // 2 + 1
      expect(modified.mente).toBe(1); // 2 - 1
      expect(modified.agilidade).toBe(2); // Inalterado
    });

    it('deve preservar atributos não modificados', () => {
      const baseAttributes = {
        agilidade: 3,
        corpo: 3,
        influencia: 3,
        mente: 3,
        essencia: 3,
        instinto: 1,
      };

      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [{ attribute: 'corpo', value: 1 }],
        skillProficiencies: [],
      };

      const modified = applyOriginAttributeModifiers(baseAttributes, origin);

      expect(modified.agilidade).toBe(3);
      expect(modified.influencia).toBe(3);
      expect(modified.mente).toBe(3);
      expect(modified.essencia).toBe(3);
      expect(modified.instinto).toBe(1);
    });

    it('deve lidar com atributo base zero', () => {
      const baseAttributes = {
        agilidade: 0,
        corpo: 0,
        influencia: 0,
        mente: 0,
        essencia: 0,
        instinto: 1,
      };

      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [{ attribute: 'corpo', value: 2 }],
        skillProficiencies: [],
      };

      const modified = applyOriginAttributeModifiers(baseAttributes, origin);

      expect(modified.corpo).toBe(2); // 0 + 2
    });
  });

  describe('createExampleOrigin', () => {
    it('deve criar origem de exemplo válida', () => {
      const example = createExampleOrigin();

      expect(example.name).toBe('Nobre');
      expect(example.skillProficiencies).toHaveLength(2);
      expect(example.attributeModifiers).toHaveLength(3);
      expect(example.specialAbility).toBeDefined();
      expect(example.specialAbility?.name).toBe('Prestígio');
    });

    it('origem de exemplo deve passar na validação', () => {
      const example = createExampleOrigin();
      const result = validateOrigin(example);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com múltiplos modificadores no mesmo atributo', () => {
      const baseAttributes = {
        agilidade: 2,
        corpo: 2,
        influencia: 2,
        mente: 2,
        essencia: 2,
        instinto: 1,
      };

      const origin: Origin = {
        name: 'Teste',
        description: '',
        attributeModifiers: [
          { attribute: 'corpo', value: 1 },
          { attribute: 'corpo', value: 1 }, // Aplicado duas vezes
        ],
        skillProficiencies: [],
      };

      const modified = applyOriginAttributeModifiers(baseAttributes, origin);

      expect(modified.corpo).toBe(4); // 2 + 1 + 1
    });

    it('resumo deve lidar com todos os atributos', () => {
      const origin: Origin = {
        name: 'Teste Completo',
        description: '',
        attributeModifiers: [
          { attribute: 'agilidade', value: 1 },
          { attribute: 'corpo', value: 1 },
          { attribute: 'instinto', value: 1 },
          { attribute: 'influencia', value: -1 },
          { attribute: 'mente', value: -1 },
          { attribute: 'essencia', value: -1 },
        ],
        skillProficiencies: [],
      };

      const summary = getAttributeModifiersSummary(origin);

      expect(summary).toContain('AGI');
      expect(summary).toContain('COR');
      expect(summary).toContain('INS');
      expect(summary).toContain('INF');
      expect(summary).toContain('MEN');
      expect(summary).toContain('ESS');
    });
  });
});
