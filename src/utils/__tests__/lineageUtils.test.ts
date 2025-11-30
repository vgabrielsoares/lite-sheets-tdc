/**
 * Testes para lineageUtils
 *
 * Testa funções utilitárias para linhagens, incluindo
 * criação de linhagens padrão, validação e cálculos.
 */

import { createDefaultLineage, validateLineage } from '../lineageUtils';

describe('lineageUtils', () => {
  describe('createDefaultLineage', () => {
    it('deve criar uma linhagem com valores padrão', () => {
      const lineage = createDefaultLineage();

      expect(lineage).toMatchObject({
        name: '',
        description: '',
        attributeModifiers: [],
        size: 'medio',
        height: 170,
        weightKg: 70,
        weightRPG: 70,
        age: 25,
        adulthood: undefined,
        lifeExpectancy: undefined,
        languages: [],
        keenSenses: [],
        vision: 'normal',
        ancestryTraits: [],
      });
    });

    it('deve incluir movimento padrão', () => {
      const lineage = createDefaultLineage();

      expect(lineage.movement).toMatchObject({
        andando: 5,
        voando: 0,
        escalando: 0,
        escavando: 0,
        nadando: 0,
      });
    });

    it('deve ter attributeModifiers como array vazio', () => {
      const lineage = createDefaultLineage();

      expect(lineage.attributeModifiers).toEqual([]);
      expect(Array.isArray(lineage.attributeModifiers)).toBe(true);
    });
  });

  describe('validateLineage', () => {
    it('deve validar linhagem sem nome como inválida', () => {
      const lineage = { name: '' };

      expect(validateLineage(lineage)).toBe(false);
    });

    it('deve validar linhagem com nome como válida', () => {
      const lineage = { name: 'Humano' };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve validar altura fora dos limites como inválida', () => {
      const lineage = { name: 'Humano', height: 5 }; // Muito baixo

      expect(validateLineage(lineage)).toBe(false);
    });

    it('deve validar altura dentro dos limites como válida', () => {
      const lineage = { name: 'Humano', height: 170 };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve validar peso fora dos limites como inválido', () => {
      const lineage = { name: 'Humano', weightKg: 0 }; // Muito baixo

      expect(validateLineage(lineage)).toBe(false);
    });

    it('deve validar peso dentro dos limites como válido', () => {
      const lineage = { name: 'Humano', weightKg: 70 };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve validar idade negativa como inválida', () => {
      const lineage = { name: 'Humano', age: -1 };

      expect(validateLineage(lineage)).toBe(false);
    });

    it('deve validar idade zero ou positiva como válida', () => {
      const lineage = { name: 'Humano', age: 0 };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve aceitar maioridade indefinida', () => {
      const lineage = { name: 'Humano', adulthood: undefined };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve aceitar expectativa de vida indefinida', () => {
      const lineage = { name: 'Humano', lifeExpectancy: undefined };

      expect(validateLineage(lineage)).toBe(true);
    });

    it('deve aceitar maioridade e expectativa de vida definidas', () => {
      const lineage = {
        name: 'Elfo',
        age: 120,
        adulthood: 100,
        lifeExpectancy: 750,
      };

      expect(validateLineage(lineage)).toBe(true);
    });
  });

  describe('Modificadores de Atributos', () => {
    it('deve suportar padrão +2/-1', () => {
      const lineage = createDefaultLineage();
      lineage.name = 'Elfo';
      lineage.attributeModifiers = [
        { attribute: 'agilidade', value: 2 },
        { attribute: 'constituicao', value: -1 },
      ];

      expect(lineage.attributeModifiers).toHaveLength(2);
      expect(lineage.attributeModifiers[0]).toEqual({
        attribute: 'agilidade',
        value: 2,
      });
      expect(lineage.attributeModifiers[1]).toEqual({
        attribute: 'constituicao',
        value: -1,
      });
    });

    it('deve suportar padrão +1/+1', () => {
      const lineage = createDefaultLineage();
      lineage.name = 'Meio-Elfo';
      lineage.attributeModifiers = [
        { attribute: 'agilidade', value: 1 },
        { attribute: 'influencia', value: 1 },
      ];

      expect(lineage.attributeModifiers).toHaveLength(2);
      expect(lineage.attributeModifiers[0].value).toBe(1);
      expect(lineage.attributeModifiers[1].value).toBe(1);
    });
  });
});
