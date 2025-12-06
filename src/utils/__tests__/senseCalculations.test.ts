/**
 * Tests for senseCalculations utility functions
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
      constituicao: 1,
      forca: 1,
      influencia: 1,
      mente: 1,
      presenca: 2,
    };

    const defaultPerceptionSkill: Skill = {
      name: 'percepcao',
      keyAttribute: 'presenca',
      proficiencyLevel: 'leigo',
      isSignature: false,
      modifiers: [],
    };

    it('should calculate base modifier without keen sense', () => {
      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Presença 2 × Leigo 0 = 0
      expect(result.baseModifier).toBe(0);
      expect(result.keenSenseBonus).toBe(0);
      expect(result.totalModifier).toBe(0);
    });

    it('should add keen sense bonus to total modifier', () => {
      const keenSenses: KeenSense[] = [{ type: 'visao', bonus: 5 }];

      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        keenSenses,
        false
      );

      expect(result.keenSenseBonus).toBe(5);
      expect(result.totalModifier).toBe(5); // 0 base + 5 keen sense
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

      expect(observarResult.keenSenseBonus).toBe(5); // visao
      expect(farejarResult.keenSenseBonus).toBe(3); // olfato
      expect(ouvirResult.keenSenseBonus).toBe(0); // audicao not in keenSenses
    });

    it('should calculate correct dice count', () => {
      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Presença 2 = 2d20
      expect(result.diceCount).toBe(2);
      expect(result.takeLowest).toBe(false);
    });

    it('should handle attribute 0 (disadvantage)', () => {
      const zeroPresencaAttributes: Attributes = {
        ...defaultAttributes,
        presenca: 0,
      };

      const result = calculateSenseModifier(
        'Observar',
        defaultPerceptionSkill,
        zeroPresencaAttributes,
        1,
        undefined,
        false
      );

      // Presença 0 = 2d20 take lowest
      expect(result.diceCount).toBe(2);
      expect(result.takeLowest).toBe(true);
    });

    it('should include proficiency in base modifier', () => {
      const adeptoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'adepto', // x1
      };

      const result = calculateSenseModifier(
        'Observar',
        adeptoPerception,
        defaultAttributes,
        1,
        undefined,
        false
      );

      // Presença 2 × Adepto 1 = 2
      expect(result.baseModifier).toBe(2);
    });

    it('should combine base modifier and keen sense bonus', () => {
      const versadoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'versado', // x2
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

      // Presença 2 × Versado 2 = 4 base
      // + 5 keen sense = 9 total
      expect(result.baseModifier).toBe(4);
      expect(result.keenSenseBonus).toBe(5);
      expect(result.totalModifier).toBe(9);
    });

    it('should generate correct formula', () => {
      const adeptoPerception: Skill = {
        ...defaultPerceptionSkill,
        proficiencyLevel: 'adepto',
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

      // Presença 2 = 2d20
      // Modifier: 2 (base) + 5 (keen) = 7
      expect(result.formula).toBe('2d20+7');
    });

    it('should handle negative total modifier in formula', () => {
      const modifiersPerception: Skill = {
        ...defaultPerceptionSkill,
        modifiers: [{ name: 'Penalidade', value: -3, type: 'penalidade' }],
      };

      const result = calculateSenseModifier(
        'Observar',
        modifiersPerception,
        defaultAttributes,
        1,
        undefined,
        false
      );

      expect(result.formula).toBe('2d20-3');
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

      expect(farejar?.keenSenseBonus).toBe(3);
      expect(observar?.keenSenseBonus).toBe(5);
      expect(ouvir?.keenSenseBonus).toBe(0);
    });

    it('should pass overloaded state to calculations', () => {
      const character = createDefaultCharacter({ name: 'Test' });

      // Percepção has hasCargaPenalty = false, so overloaded shouldn't affect it
      // But we test that the parameter is passed through
      const normalResults = calculateAllSenses(character, false);
      const overloadedResults = calculateAllSenses(character, true);

      // Since Percepção doesn't have load penalty, results should be same
      expect(normalResults[0].totalModifier).toBe(
        overloadedResults[0].totalModifier
      );
    });
  });
});
