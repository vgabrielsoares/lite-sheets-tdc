/**
 * Testes para funções utilitárias de Traits
 */

import {
  calculateTraitBalance,
  areTraitsBalanced,
  createEmptyComplementaryTrait,
  createEmptyCompleteTrait,
} from '../traits';
import type { ComplementaryTrait } from '@/types/character';

describe('Traits Utilities', () => {
  describe('calculateTraitBalance', () => {
    it('deve calcular o balanço correto com características equilibradas', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -2 },
        { name: 'Fraco', description: 'Força reduzida', points: -1 },
      ];

      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 2 },
        { name: 'Ágil', description: 'Movimento aumentado', points: 1 },
      ];

      const balance = calculateTraitBalance(negative, positive);
      expect(balance).toBe(0);
    });

    it('deve calcular balanço negativo quando há mais pontos negativos', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -5 },
      ];

      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 2 },
      ];

      const balance = calculateTraitBalance(negative, positive);
      expect(balance).toBe(-3);
    });

    it('deve calcular balanço positivo quando há mais pontos positivos', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -1 },
      ];

      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 5 },
      ];

      const balance = calculateTraitBalance(negative, positive);
      expect(balance).toBe(4);
    });

    it('deve retornar 0 com arrays vazios', () => {
      const balance = calculateTraitBalance([], []);
      expect(balance).toBe(0);
    });

    it('deve calcular apenas com características negativas', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -3 },
      ];

      const balance = calculateTraitBalance(negative, []);
      expect(balance).toBe(-3);
    });

    it('deve calcular apenas com características positivas', () => {
      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 3 },
      ];

      const balance = calculateTraitBalance([], positive);
      expect(balance).toBe(3);
    });
  });

  describe('areTraitsBalanced', () => {
    it('deve retornar true quando o balanço é 0', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -2 },
      ];

      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 2 },
      ];

      expect(areTraitsBalanced(negative, positive)).toBe(true);
    });

    it('deve retornar false quando o balanço não é 0', () => {
      const negative: ComplementaryTrait[] = [
        { name: 'Medo', description: 'Medo de altura', points: -3 },
      ];

      const positive: ComplementaryTrait[] = [
        { name: 'Corajoso', description: 'Bônus de coragem', points: 2 },
      ];

      expect(areTraitsBalanced(negative, positive)).toBe(false);
    });

    it('deve retornar true com arrays vazios', () => {
      expect(areTraitsBalanced([], [])).toBe(true);
    });
  });

  describe('createEmptyComplementaryTrait', () => {
    it('deve criar característica negativa com pontos -1', () => {
      const trait = createEmptyComplementaryTrait(true);

      expect(trait.name).toBe('');
      expect(trait.description).toBe('');
      expect(trait.points).toBe(-1);
    });

    it('deve criar característica positiva com pontos 1', () => {
      const trait = createEmptyComplementaryTrait(false);

      expect(trait.name).toBe('');
      expect(trait.description).toBe('');
      expect(trait.points).toBe(1);
    });

    it('deve criar característica positiva por padrão', () => {
      const trait = createEmptyComplementaryTrait();

      expect(trait.points).toBe(1);
    });
  });

  describe('createEmptyCompleteTrait', () => {
    it('deve criar característica completa vazia', () => {
      const trait = createEmptyCompleteTrait();

      expect(trait.name).toBe('');
      expect(trait.description).toBe('');
      expect(trait).not.toHaveProperty('points');
    });
  });
});
