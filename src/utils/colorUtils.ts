/**
 * Utilitários para manipulação de cores e contraste
 */

/**
 * Calcula a luminância relativa de uma cor baseado no padrão WCAG
 *
 * @param hex Cor em formato hexadecimal (ex: "#FF5733" ou "FF5733")
 * @returns Luminância relativa entre 0 e 1
 *
 * @see https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getRelativeLuminance(hex: string): number {
  // Remove # se presente
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Aplica correção gamma
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calcula luminância
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Determina se uma cor de fundo requer texto preto ou branco para melhor contraste
 *
 * Baseado no padrão WCAG 2.0 para contraste de cores.
 * Threshold de 0.5 garante legibilidade em diversos contextos.
 *
 * @param backgroundColor Cor de fundo em formato hexadecimal
 * @returns '#000000' (preto) para fundos claros, '#FFFFFF' (branco) para fundos escuros
 *
 * @example
 * getContrastColor('#FFD700'); // '#000000' (amarelo claro precisa de texto preto)
 * getContrastColor('#2196F3'); // '#FFFFFF' (azul precisa de texto branco)
 */
export function getContrastColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);

  // Threshold de 0.5 é um bom equilíbrio para a maioria dos casos
  // Luminância > 0.5 = fundo claro = texto preto
  // Luminância <= 0.5 = fundo escuro = texto branco
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Calcula a razão de contraste entre duas cores segundo WCAG
 *
 * @param color1 Primeira cor em hex
 * @param color2 Segunda cor em hex
 * @returns Razão de contraste entre 1 e 21
 *
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}
