/**
 * Testes para utilitários de cor e contraste
 */

import {
  getRelativeLuminance,
  getContrastColor,
  getContrastRatio,
} from '../colorUtils';

describe('colorUtils', () => {
  describe('getRelativeLuminance', () => {
    it('deve calcular luminância para preto puro', () => {
      expect(getRelativeLuminance('#000000')).toBe(0);
    });

    it('deve calcular luminância para branco puro', () => {
      expect(getRelativeLuminance('#FFFFFF')).toBe(1);
    });

    it('deve calcular luminância para cor sem #', () => {
      const withHash = getRelativeLuminance('#FF5733');
      const withoutHash = getRelativeLuminance('FF5733');
      expect(withHash).toBe(withoutHash);
    });

    it('deve calcular luminância para cinza médio', () => {
      const luminance = getRelativeLuminance('#808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    it('deve calcular luminância para cores do projeto', () => {
      // Amarelo claro - deve ter alta luminância
      expect(getRelativeLuminance('#FFF59D')).toBeGreaterThan(0.8);

      // Amarelo dourado - deve ter luminância média-alta
      expect(getRelativeLuminance('#FFD700')).toBeGreaterThan(0.5);

      // Azul - deve ter luminância baixa-média
      expect(getRelativeLuminance('#2196F3')).toBeLessThan(0.5);

      // Verde escuro - deve ter luminância baixa
      expect(getRelativeLuminance('#2E7D32')).toBeLessThan(0.3);
    });
  });

  describe('getContrastColor', () => {
    it('deve retornar preto para fundos claros', () => {
      // Amarelo claro
      expect(getContrastColor('#FFF59D')).toBe('#000000');

      // Amarelo dourado
      expect(getContrastColor('#FFD700')).toBe('#000000');

      // Branco
      expect(getContrastColor('#FFFFFF')).toBe('#000000');
    });

    it('deve retornar branco para fundos escuros', () => {
      // Azul
      expect(getContrastColor('#2196F3')).toBe('#FFFFFF');

      // Verde escuro
      expect(getContrastColor('#2E7D32')).toBe('#FFFFFF');

      // Preto
      expect(getContrastColor('#000000')).toBe('#FFFFFF');

      // Roxo
      expect(getContrastColor('#9C27B0')).toBe('#FFFFFF');

      // Vermelho
      expect(getContrastColor('#FF6B6B')).toBe('#FFFFFF');
    });

    it('deve funcionar com cores sem #', () => {
      expect(getContrastColor('FFD700')).toBe('#000000');
      expect(getContrastColor('2196F3')).toBe('#FFFFFF');
    });

    it('deve determinar contraste correto para todas as cores de matriz', () => {
      const matrixColors = {
        arcana: '#2196F3', // Azul - deve ter texto branco
        adiafana: '#424242', // Cinza escuro - deve ter texto branco
        gnomica: '#9C27B0', // Roxo - deve ter texto branco
        mundana: '#9E9E9E', // Cinza - provavelmente branco
        natural: '#81C784', // Verde claro - pode variar
        elfica: '#2E7D32', // Verde escuro - deve ter texto branco
        ana: '#FF9800', // Laranja - pode variar
        primordial: '#FFF59D', // Amarelo claro - deve ter texto preto
        luzidia: '#FFD700', // Amarelo dourado - deve ter texto preto
        infernal: '#FF6B6B', // Vermelho - deve ter texto branco
      };

      // Verificar que a função retorna uma cor válida para todas
      Object.entries(matrixColors).forEach(([key, color]) => {
        const contrast = getContrastColor(color);
        expect(['#000000', '#FFFFFF']).toContain(contrast);
      });

      // Verificar cores específicas que devem ter texto preto
      expect(getContrastColor(matrixColors.primordial)).toBe('#000000');
      expect(getContrastColor(matrixColors.luzidia)).toBe('#000000');

      // Verificar cores específicas que devem ter texto branco
      expect(getContrastColor(matrixColors.arcana)).toBe('#FFFFFF');
      expect(getContrastColor(matrixColors.adiafana)).toBe('#FFFFFF');
      expect(getContrastColor(matrixColors.gnomica)).toBe('#FFFFFF');
      expect(getContrastColor(matrixColors.elfica)).toBe('#FFFFFF');
    });

    it('deve determinar contraste correto para cores de habilidades', () => {
      const skillColors = {
        arcano: '#2196F3', // Azul - deve ter texto branco
        natureza: '#4CAF50', // Verde - deve ter texto branco
        religiao: '#FFD700', // Amarelo/Dourado - deve ter texto preto
      };

      expect(getContrastColor(skillColors.arcano)).toBe('#FFFFFF');
      expect(getContrastColor(skillColors.natureza)).toBe('#FFFFFF');
      expect(getContrastColor(skillColors.religiao)).toBe('#000000');
    });
  });

  describe('getContrastRatio', () => {
    it('deve calcular razão de contraste para preto e branco', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBe(21); // Máximo contraste
    });

    it('deve calcular razão de contraste para cores iguais', () => {
      const ratio = getContrastRatio('#2196F3', '#2196F3');
      expect(ratio).toBe(1); // Sem contraste
    });

    it('deve ser simétrico', () => {
      const ratio1 = getContrastRatio('#2196F3', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#2196F3');
      expect(ratio1).toBe(ratio2);
    });

    it('deve calcular contraste adequado para WCAG AA', () => {
      // WCAG AA requer pelo menos 4.5:1 para texto normal
      // e 3:1 para texto grande

      // Preto sobre amarelo dourado
      const blackOnGold = getContrastRatio('#000000', '#FFD700');
      expect(blackOnGold).toBeGreaterThanOrEqual(4.5);

      // Branco sobre azul
      const whiteOnBlue = getContrastRatio('#FFFFFF', '#2196F3');
      expect(whiteOnBlue).toBeGreaterThanOrEqual(3);
    });

    it('deve calcular razão de contraste para cinza médio', () => {
      const ratio = getContrastRatio('#808080', '#FFFFFF');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });
  });
});
