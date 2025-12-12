/**
 * Testes para attackCalculations.ts
 *
 * Testa cálculos de ataque, críticos, raspão e dano
 */

import {
  calculateAttackOutcome,
  calculateAttackDamage,
  formatAttackOutcome,
  getAttackOutcomeColor,
} from '../attackCalculations';
import type { CriticalDamageConfig } from '../attackCalculations';

describe('attackCalculations', () => {
  describe('calculateAttackOutcome', () => {
    it('deve identificar acerto normal', () => {
      const result = calculateAttackOutcome(18, 15, 15, 20);

      expect(result.outcome).toBe('hit');
      expect(result.isCritical).toBe(false);
      expect(result.isTrueCritical).toBe(false);
      expect(result.isGraze).toBe(false);
      expect(result.margin).toBe(3); // 18 - 15
    });

    it('deve identificar raspão (ataque = defesa)', () => {
      const result = calculateAttackOutcome(15, 14, 15, 20);

      expect(result.outcome).toBe('graze');
      expect(result.isGraze).toBe(true);
      expect(result.margin).toBe(0); // 15 - 15
    });

    it('deve identificar erro', () => {
      const result = calculateAttackOutcome(10, 8, 15, 20);

      expect(result.outcome).toBe('miss');
      expect(result.isCritical).toBe(false);
      expect(result.margin).toBe(-5); // 10 - 15
    });

    it('deve identificar crítico (natural >= margem)', () => {
      const result = calculateAttackOutcome(18, 20, 15, 20);

      expect(result.isCritical).toBe(true);
      expect(result.outcome).toBe('critical');
      expect(result.margin).toBe(3); // 18 - 15 (< 5, então não é true-critical)
    });

    it('deve identificar crítico verdadeiro (crítico E supera defesa +5)', () => {
      const result = calculateAttackOutcome(25, 20, 15, 20);

      expect(result.isCritical).toBe(true);
      expect(result.isTrueCritical).toBe(true);
      expect(result.outcome).toBe('true-critical');
      expect(result.margin).toBe(10); // 25 - 15, margem >= 5
    });

    it('deve respeitar margem de crítico customizada', () => {
      const result = calculateAttackOutcome(18, 18, 15, 18); // Margem de crítico 18

      expect(result.isCritical).toBe(true);
      expect(result.outcome).toBe('critical'); // Margem 3 (< 5)
    });

    it('natural 20 sempre acerta', () => {
      const result = calculateAttackOutcome(5, 20, 15, 20); // Roll < defesa mas nat 20

      expect(result.outcome).not.toBe('miss');
      expect(result.isCritical).toBe(true);
    });
  });

  describe('calculateAttackDamage', () => {
    it('deve calcular dano normal sem crítico', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.totalDamage).toBeGreaterThanOrEqual(5); // 2 + 3 mínimo
      expect(result.totalDamage).toBeLessThanOrEqual(15); // 12 + 3 máximo
      expect(result.baseDamageMaximized).toBeUndefined();
      expect(result.trueCriticalDamage).toBeUndefined();
      expect(result.breakdown).toBeTruthy();
    });

    it('deve maximizar dano base em crítico', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: true,
        isTrueCritical: false,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.baseDamageMaximized).toBe(12); // 2d6 maximizado
      expect(result.totalDamage).toBeGreaterThanOrEqual(15); // 12 + 3
      expect(result.breakdown).toContain('Crítico');
    });

    it('deve adicionar dados extras em crítico verdadeiro', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 2, type: 'd6', modifier: 0 },
        isCritical: true,
        isTrueCritical: true,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.baseDamageMaximized).toBe(12);
      expect(result.trueCriticalDamage).toBeGreaterThanOrEqual(2); // 2d6 mínimo
      expect(result.trueCriticalDamage).toBeLessThanOrEqual(12); // 2d6 máximo
      expect(result.totalDamage).toBeGreaterThanOrEqual(17); // 12 + 2 + 3
    });

    it('deve aplicar metade do dano em raspão', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 4 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      // Dano deve ser metade (arredondado para baixo)
      expect(result.totalDamage).toBeLessThanOrEqual(8); // (12 + 4) / 2 = 8 máximo
      expect(result.totalDamage).toBeGreaterThanOrEqual(1); // Mínimo 1
      expect(result.breakdown).toContain('Raspão');
    });

    it('deve calcular dano mínimo 0 após processamento', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 1, type: 'd4', modifier: 0 },
        criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      expect(result.totalDamage).toBeGreaterThanOrEqual(0); // Nunca negativo
    });
  });

  describe('formatAttackOutcome', () => {
    it('deve formatar resultado de ataque corretamente', () => {
      expect(formatAttackOutcome({ outcome: 'miss' } as any)).toBe('ERROU');
      expect(formatAttackOutcome({ outcome: 'graze' } as any)).toBe(
        'ATAQUE DE RASPÃO'
      );
      expect(formatAttackOutcome({ outcome: 'hit' } as any)).toBe('ACERTOU');
      expect(formatAttackOutcome({ outcome: 'critical' } as any)).toBe(
        'CRÍTICO!'
      );
      expect(formatAttackOutcome({ outcome: 'true-critical' } as any)).toBe(
        'CRÍTICO VERDADEIRO!!'
      );
    });
  });

  describe('getAttackOutcomeColor', () => {
    it('deve retornar cores semânticas corretas', () => {
      expect(getAttackOutcomeColor('miss')).toBe('error');
      expect(getAttackOutcomeColor('graze')).toBe('info');
      expect(getAttackOutcomeColor('hit')).toBe('success');
      expect(getAttackOutcomeColor('critical')).toBe('warning');
      expect(getAttackOutcomeColor('true-critical')).toBe('warning');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com margem de crítico 1 (sempre crítico em natural >= 1)', () => {
      const result = calculateAttackOutcome(20, 15, 15, 1);

      expect(result.isCritical).toBe(true);
    });

    it('deve calcular dano 0 em caso extremo de raspão', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 1, type: 'd2', modifier: 0 },
        criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      // 1d2 max = 2, /2 = 1
      expect(result.totalDamage).toBeGreaterThanOrEqual(0);
      expect(result.totalDamage).toBeLessThanOrEqual(1);
    });

    it('deve maximizar corretamente dados diferentes (d4, d8, d10, d12)', () => {
      const testCases = [
        { type: 'd4' as const, max: 4 },
        { type: 'd8' as const, max: 8 },
        { type: 'd10' as const, max: 10 },
        { type: 'd12' as const, max: 12 },
      ];

      testCases.forEach(({ type, max }) => {
        const config: CriticalDamageConfig = {
          baseDamageRoll: { quantity: 1, type, modifier: 0 },
          criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
          isCritical: true,
          isTrueCritical: false,
          isGraze: false,
        };

        const result = calculateAttackDamage(config);

        expect(result.baseDamageMaximized).toBe(max);
        expect(result.totalDamage).toBe(max);
      });
    });
  });
});
