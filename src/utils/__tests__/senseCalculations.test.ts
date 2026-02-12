/**
 * Tests for senseCalculations utility functions (v0.2 pool-based dice system)
 *
 * Sistema de pool de dados:
 * - baseDice = valor do atributo + modificadores de dados
 * - keenSenseDiceBonus = bônus de sentido aguçado (adiciona dados)
 * - totalDice = baseDice + keenSenseDiceBonus (cap: MAX_SKILL_DICE=8)
 * - dieSize = proficiência (leigo=d6, adepto=d8, versado=d10, mestre=d12)
 * - isPenaltyRoll = true quando pool efetiva ≤ 0 (rola 2d pega menor)
 */

import {
  calculateSenseModifier,
  calculateAllSenses,
  getKeenSenseBonus,
  PERCEPTION_USE_TO_SENSE,
  SENSE_TO_PERCEPTION_USE,
} from '../senseCalculations';
import { createDefaultCharacter } from '../characterFactory';
import type { Skill, Attributes, KeenSense } from '@/types';

describe('senseCalculations', () => {
  describe('PERCEPTION_USE_TO_SENSE mapping', () => {
    it('should map Farejar to olfato', () => {
      expect(PERCEPTION_USE_TO_SENSE['Farejar']).toBe('olfato');
    });

    it('should map Observar to visao', () => {
      expect(PERCEPTION_USE_TO_SENSE['Observar']).toBe('visao');
    });

    it('should map Ouvir to audicao', () => {
      expect(PERCEPTION_USE_TO_SENSE['Ouvir']).toBe('audicao');
    });
  });

  describe('SENSE_TO_PERCEPTION_USE mapping', () => {
    it('should map olfato to Farejar', () => {
      expect(SENSE_TO_PERCEPTION_USE['olfato']).toBe('Farejar');
    });

    it('should map visao to Observar', () => {
      expect(SENSE_TO_PERCEPTION_USE['visao']).toBe('Observar');
    });

    it('should map audicao to Ouvir', () => {
      expect(SENSE_TO_PERCEPTION_USE['audicao']).toBe('Ouvir');
    });
  });

  describe('getKeenSenseBonus', () => {
    it('should return 0 when keenSenses is undefined', () => {
      expect(getKeenSenseBonus(undefined, 'visao')).toBe(0);
    });

    it('should return 0 when keenSenses is empty', () => {
      expect(getKeenSenseBonus([], 'visao')).toBe(0);
    });

    it('should return 0 when sense type not found', () => {
      const keenSenses: KeenSense[] = [{ type: 'olfato', bonus: 5 }];
      expect(getKeenSenseBonus(keenSenses, 'visao')).toBe(0);
    });

    it('should return correct bonus when sense type found', () => {
      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 5 }];
      expect(getKeenSenseBonus(keenSenses, 'visao')).toBe(5);
    });

    it('should return correct bonus from multiple keen senses', () => {
      const keenSenses: KeenSense[] = [
        { type: 'visao', bonus: 5 },
        { type: 'olfato', bonus: 3 },
        { type: 'audicao', bonus: 2 },
      ];
      expect(getKeenSenseBonus(keenSenses, 'olfato')).toBe(3);
      expect(getKeenSenseBonus(keenSenses, 'audicao')).toBe(2);
    });
  });

  describe('calculateSenseModifier', () => {
    const defaultAttributes: Attributes = {
      agilidade: 1,
      corpo: 1,
      influencia: 1,
      mente: 1,
      essencia: 1,
      instinto: 2,
    };

    const defaultPerceptionSkill: Skill = {
      name: 'percepcao',
      keyAttribute: 'instinto',
      proficiencyLevel: 'leigo',
      isSignature: false,
      modifiers: [],
    };

    it('should calculate base dice without keen sense', () => {
      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Instinto 2, Leigo → baseDice = 2 (attribute value), dieSize = d6
      expect(result.baseDice).toBe(2);
      expect(result.keenSenseDiceBonus).toBe(0);
      expect(result.totalDice).toBe(2);
      expect(result.dieSize).toBe('d6');
      expect(result.isPenaltyRoll).toBe(false);
      expect(result.formula).toBe('2d6');
    });

    it('should add keen sense dice bonus to total dice', () => {
      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 5 }];

      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      // baseDice=2, keenSenseDiceBonus=5, totalDice=7
      expect(result.baseDice).toBe(2);
      expect(result.keenSenseDiceBonus).toBe(5);
      expect(result.totalDice).toBe(7);
      expect(result.dieSize).toBe('d6');
      expect(result.isPenaltyRoll).toBe(false);
      expect(result.formula).toBe('7d6');
    });

    it('should apply correct keen sense to correct perception use', () => {
      const keenSenses: KeenSense[] = [
        { type: 'visao', bonus: 5 },
        { type: 'olfato', bonus: 3 },
      ];

      const observarResult = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      const farejarResult = calculateSenseModifier(
        'Farejar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      const ouvirResult = calculateSenseModifier(
        'Ouvir',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      expect(observarResult.keenSenseDiceBonus).toBe(5); // visao
      expect(farejarResult.keenSenseDiceBonus).toBe(3); // olfato
      expect(ouvirResult.keenSenseDiceBonus).toBe(0); // audicao not in keenSenses
    });

    it('should calculate correct total dice from pool', () => {
      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Instinto 2 → pool of 2 dice, no penalty
      expect(result.totalDice).toBe(2);
      expect(result.isPenaltyRoll).toBe(false);
    });

    it('should handle attribute 0 (penalty roll)', () => {
      const zeroInstintoAttributes: Attributes = {
        ...defaultAttributes,
        instinto: 0,
      };

      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        zeroInstintoAttributes,
        1,
        undefined,
        false
      );

      // Instinto 0 → pool ≤ 0 → penalty roll: 2d take lowest
      expect(result.baseDice).toBe(0);
      expect(result.totalDice).toBe(2);
      expect(result.isPenaltyRoll).toBe(true);
      expect(result.formula).toBe('2d6 (menor)');
    });

    it('should use correct die size for proficiency level', () => {
      const adeptoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'adepto', // d8
      };

      const result = calculateSenseModifier(
        'Observar',
        adeptoPerception,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Instinto 2, Adepto → baseDice=2, dieSize=d8
      expect(result.baseDice).toBe(2);
      expect(result.dieSize).toBe('d8');
      expect(result.formula).toBe('2d8');
    });

    it('should combine base dice and keen sense dice bonus', () => {
      const versadoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'versado', // d10
      };

      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 5 }];

      const result = calculateSenseModifier(
        'Observar',
        versadoPerception,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      // Instinto 2 → baseDice=2, keenSenseDiceBonus=5, totalDice=7, dieSize=d10
      expect(result.baseDice).toBe(2);
      expect(result.keenSenseDiceBonus).toBe(5);
      expect(result.totalDice).toBe(7);
      expect(result.dieSize).toBe('d10');
      expect(result.formula).toBe('7d10');
    });

    it('should generate correct pool formula', () => {
      const adeptoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'adepto', // d8
      };

      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 5 }];

      const result = calculateSenseModifier(
        'Observar',
        adeptoPerception,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      // baseDice=2 + keenSenseDiceBonus=5 = totalDice=7, dieSize=d8
      expect(result.formula).toBe('7d8');
    });

    it('should handle negative total dice as penalty roll in formula', () => {
      const modifiersPerception: Skill = {
        ...defaultPerceptionSkill,
        modifiers: [
          {
            name: 'Penalidade',
            value: -3,
            type: 'penalidade',
            affectsDice: true,
          },
        ],
      };

      const result = calculateSenseModifier(
        'Observar',
        modifiersPerception,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Instinto 2 + modifier -3d = baseDice=-1 → penalty roll
      expect(result.baseDice).toBe(-1);
      expect(result.isPenaltyRoll).toBe(true);
      expect(result.totalDice).toBe(2);
      expect(result.formula).toBe('2d6 (menor)');
    });

    it('should cap total dice at MAX_SKILL_DICE (8)', () => {
      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 10 }];

      const highInstintoAttributes: Attributes = {
        ...defaultAttributes,
        instinto: 5,
      };

      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        highInstintoAttributes,
        1,
        keenSenses,
        false
      );

      // baseDice=5 + keenSenseDiceBonus=10 = 15, capped at 8
      expect(result.baseDice).toBe(5);
      expect(result.keenSenseDiceBonus).toBe(10);
      expect(result.totalDice).toBe(8);
      expect(result.formula).toBe('8d6');
    });

    it('should include signature dice bonus in base dice', () => {
      const signaturePerception: Skill = {
        ...defaultPerceptionSkill,
        isSignature: true,
      };

      const result = calculateSenseModifier(
        'Observar',
        signaturePerception,
        defaultAttributes,
        1, // level 1 → signature bonus = +1d
        undefined,
        false
      );

      // Instinto 2 + signature +1d = baseDice=3
      expect(result.baseDice).toBe(3);
      expect(result.totalDice).toBe(3);
      expect(result.formula).toBe('3d6');
    });

    it('should set correct senseType and useName', () => {
      const farejar = calculateSenseModifier(
        'Farejar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      const observar = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      const ouvir = calculateSenseModifier(
        'Ouvir',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      expect(farejar.useName).toBe('Farejar');
      expect(farejar.senseType).toBe('olfato');
      expect(observar.useName).toBe('Observar');
      expect(observar.senseType).toBe('visao');
      expect(ouvir.useName).toBe('Ouvir');
      expect(ouvir.senseType).toBe('audicao');
    });

    it('should use mestre die size (d12)', () => {
      const mestrePerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'mestre', // d12
      };

      const result = calculateSenseModifier(
        'Observar',
        mestrePerception,
        defaultAttributes,
        1,
        undefined,
        false
      );

      expect(result.dieSize).toBe('d12');
      expect(result.formula).toBe('2d12');
    });
  });

  describe('calculateAllSenses', () => {
    it('should calculate all three senses', () => {
      const character = createDefaultCharacter({ name: 'Test' });

      const results = calculateAllSenses(character, false);

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.useName)).toEqual([
        'Farejar',
        'Observar',
        'Ouvir',
      ]);
    });

    it('should apply keen senses to all calculations', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      character.senses = {
        vision: 'normal',
        keenSenses: [
          { type: 'visao', bonus: 5 },
          { type: 'olfato', bonus: 3 },
        ],
        perceptionModifiers: { visao: 5, olfato: 3, audicao: 0 },
      };

      const results = calculateAllSenses(character, false);

      const farejar = results.find((r) => r.useName === 'Farejar');
      const observar = results.find((r) => r.useName === 'Observar');
      const ouvir = results.find((r) => r.useName === 'Ouvir');

      expect(farejar?.keenSenseDiceBonus).toBe(3);
      expect(observar?.keenSenseDiceBonus).toBe(5);
      expect(ouvir?.keenSenseDiceBonus).toBe(0);
    });

    it('should pass overloaded state to calculations', () => {
      const character = createDefaultCharacter({ name: 'Test' });

      // Percepção has hasCargaPenalty = false, so overloaded shouldn't affect it
      const normalResults = calculateAllSenses(character, false);
      const overloadedResults = calculateAllSenses(character, true);

      // Since Percepção doesn't have load penalty, results should be same
      expect(normalResults[0].totalDice).toBe(overloadedResults[0].totalDice);
    });

    it('should return correct pool properties for default character', () => {
      const character = createDefaultCharacter({ name: 'Test' });
      // Default character has instinto=1, leigo perception

      const results = calculateAllSenses(character, false);

      results.forEach((result) => {
        expect(result.baseDice).toBe(1); // instinto=1
        expect(result.keenSenseDiceBonus).toBe(0);
        expect(result.totalDice).toBe(1);
        expect(result.dieSize).toBe('d6'); // leigo
        expect(result.isPenaltyRoll).toBe(false);
        expect(result.formula).toBe('1d6');
      });
    });
  });
});
