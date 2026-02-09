import {
  calculateRestRecovery,
  getQualityMultiplier,
  validateRestInputs,
  REST_QUALITY_LABELS,
  type RestQuality,
} from '../restCalculations';

describe('restCalculations', () => {
  describe('getQualityMultiplier', () => {
    it('deve retornar multiplicador correto para cada qualidade', () => {
      expect(getQualityMultiplier('precario')).toBe(0.5);
      expect(getQualityMultiplier('normal')).toBe(1);
      expect(getQualityMultiplier('confortavel')).toBe(1.5);
      expect(getQualityMultiplier('abastado1')).toBe(2.5);
      expect(getQualityMultiplier('abastado2')).toBe(3);
      expect(getQualityMultiplier('abastado3')).toBe(3.5);
      expect(getQualityMultiplier('abastado4')).toBe(4);
      expect(getQualityMultiplier('abastado5')).toBe(4.5);
    });
  });

  describe('calculateRestRecovery', () => {
    it('deve calcular recuperação de dormir (PV) e relaxar (PP) separadamente', () => {
      const result = calculateRestRecovery(
        3, // level
        2, // constitution
        1, // presenca
        'normal',
        true, // useSleep
        true // useMeditate
      );

      expect(result.sleepBase).toBe(6); // 3 * 2
      expect(result.meditateBase).toBe(3); // 3 * 1
      expect(result.multiplier).toBe(1);
      expect(result.pvRecovery).toBe(6); // 6 * 1 (dormir recupera PV)
      expect(result.ppRecovery).toBe(3); // 3 * 1 (relaxar recupera PP)
    });

    it('deve calcular recuperação apenas de dormir (PV)', () => {
      const result = calculateRestRecovery(
        5, // level
        3, // constitution
        2, // presenca
        'normal',
        true, // useSleep
        false // useMeditate
      );

      expect(result.sleepBase).toBe(15); // 5 * 3
      expect(result.meditateBase).toBe(0);
      expect(result.pvRecovery).toBe(15); // dormir recupera PV
      expect(result.ppRecovery).toBe(0); // não relaxou
    });

    it('deve calcular recuperação apenas de relaxar (PP)', () => {
      const result = calculateRestRecovery(
        4, // level
        2, // constitution
        3, // presenca
        'normal',
        false, // useSleep
        true // useMeditate
      );

      expect(result.sleepBase).toBe(0);
      expect(result.meditateBase).toBe(12); // 4 * 3
      expect(result.pvRecovery).toBe(0); // não dormiu
      expect(result.ppRecovery).toBe(12); // relaxar recupera PP
    });

    it('deve aplicar multiplicador de qualidade precário (0.5x)', () => {
      const result = calculateRestRecovery(
        2, // level
        3, // constitution
        2, // presenca
        'precario',
        true,
        true
      );

      expect(result.sleepBase).toBe(6); // 2 * 3
      expect(result.meditateBase).toBe(4); // 2 * 2
      expect(result.multiplier).toBe(0.5);
      expect(result.pvRecovery).toBe(3); // floor(6 * 0.5)
      expect(result.ppRecovery).toBe(2); // floor(4 * 0.5)
    });

    it('deve aplicar multiplicador de qualidade confortável (1.5x)', () => {
      const result = calculateRestRecovery(
        3, // level
        2, // constitution
        2, // presenca
        'confortavel',
        true,
        true
      );

      expect(result.sleepBase).toBe(6); // 3 * 2
      expect(result.meditateBase).toBe(6); // 3 * 2
      expect(result.multiplier).toBe(1.5);
      expect(result.pvRecovery).toBe(9); // floor(6 * 1.5)
      expect(result.ppRecovery).toBe(9); // floor(6 * 1.5)
    });

    it('deve aplicar multiplicador de qualidade abastado5 (4.5x)', () => {
      const result = calculateRestRecovery(
        2, // level
        2, // constitution
        1, // presenca
        'abastado5',
        true,
        true
      );

      expect(result.sleepBase).toBe(4); // 2 * 2
      expect(result.meditateBase).toBe(2); // 2 * 1
      expect(result.multiplier).toBe(4.5);
      expect(result.pvRecovery).toBe(18); // floor(4 * 4.5)
      expect(result.ppRecovery).toBe(9); // floor(2 * 4.5)
    });

    it('deve arredondar para baixo valores fracionados', () => {
      const result = calculateRestRecovery(
        3, // level
        1, // constitution
        1, // presenca
        'precario', // 0.5x
        true,
        true
      );

      expect(result.sleepBase).toBe(3); // 3 * 1
      expect(result.meditateBase).toBe(3); // 3 * 1
      expect(result.pvRecovery).toBe(1); // floor(3 * 0.5) = floor(1.5) = 1
      expect(result.ppRecovery).toBe(1); // floor(3 * 0.5) = floor(1.5) = 1
    });

    it('deve adicionar modificadores de dormir', () => {
      const result = calculateRestRecovery(
        2, // level
        2, // constitution
        1, // presenca
        'normal',
        true,
        true,
        5 // sleepModifiers
      );

      expect(result.sleepBase).toBe(9); // (2 * 2) + 5
      expect(result.meditateBase).toBe(2); // 2 * 1
      expect(result.pvRecovery).toBe(9); // 9 * 1
      expect(result.ppRecovery).toBe(2); // 2 * 1
    });

    it('deve adicionar modificadores de relaxar', () => {
      const result = calculateRestRecovery(
        2, // level
        2, // constitution
        1, // presenca
        'normal',
        true,
        true,
        0, // sleepModifiers
        3 // meditateModifiers
      );

      expect(result.sleepBase).toBe(4); // 2 * 2
      expect(result.meditateBase).toBe(5); // (2 * 1) + 3
      expect(result.pvRecovery).toBe(4); // 4 * 1
      expect(result.ppRecovery).toBe(5); // 5 * 1
    });

    it('deve adicionar ambos modificadores', () => {
      const result = calculateRestRecovery(
        1, // level
        2, // constitution
        2, // presenca
        'normal',
        true,
        true,
        2, // sleepModifiers
        3 // meditateModifiers
      );

      expect(result.sleepBase).toBe(4); // (1 * 2) + 2
      expect(result.meditateBase).toBe(5); // (1 * 2) + 3
      expect(result.pvRecovery).toBe(4); // 4 * 1
      expect(result.ppRecovery).toBe(5); // 5 * 1
    });

    it('deve retornar zero se não usar dormir nem relaxar', () => {
      const result = calculateRestRecovery(
        5,
        3,
        2,
        'normal',
        false, // useSleep
        false // useMeditate
      );

      expect(result.sleepBase).toBe(0);
      expect(result.meditateBase).toBe(0);
      expect(result.pvRecovery).toBe(0);
      expect(result.ppRecovery).toBe(0);
    });

    it('deve lidar com atributo 0', () => {
      const result = calculateRestRecovery(
        2,
        0, // constitution = 0
        2,
        'normal',
        true,
        true
      );

      expect(result.sleepBase).toBe(0); // 2 * 0
      expect(result.meditateBase).toBe(4); // 2 * 2
      expect(result.pvRecovery).toBe(0);
      expect(result.ppRecovery).toBe(4);
    });
  });

  describe('validateRestInputs', () => {
    it('deve validar entradas corretas', () => {
      const result = validateRestInputs(1, 2, 3);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar nível menor que 1', () => {
      const result = validateRestInputs(0, 2, 3);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Nível deve ser maior que 0');
    });

    it('deve rejeitar corpo negativo', () => {
      const result = validateRestInputs(1, -1, 3);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Corpo não pode ser negativo');
    });

    it('deve rejeitar essência negativa', () => {
      const result = validateRestInputs(1, 2, -1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Essência não pode ser negativa');
    });

    it('deve aceitar atributos zero', () => {
      const result = validateRestInputs(1, 0, 0);
      expect(result.valid).toBe(true);
    });
  });

  describe('REST_QUALITY_LABELS', () => {
    it('deve ter labels para todas as qualidades', () => {
      const qualities: RestQuality[] = [
        'precario',
        'normal',
        'confortavel',
        'abastado1',
        'abastado2',
        'abastado3',
        'abastado4',
        'abastado5',
      ];

      qualities.forEach((quality) => {
        expect(REST_QUALITY_LABELS[quality]).toBeDefined();
        expect(typeof REST_QUALITY_LABELS[quality]).toBe('string');
        expect(REST_QUALITY_LABELS[quality].length).toBeGreaterThan(0);
      });
    });
  });
});
