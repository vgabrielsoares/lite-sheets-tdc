/**
 * Constantes relacionadas a Feitiços e Magia
 *
 * Informações sobre círculos de feitiços, custos em PP, matrizes,
 * classes de feitiços, componentes e sistema de aprendizado.
 */

/**
 * Círculos de feitiço (1º ao 8º)
 */
export const SPELL_CIRCLES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type SpellCircle = (typeof SPELL_CIRCLES)[number];

/**
 * Custo em PP por círculo de feitiço
 */
export const SPELL_CIRCLE_PP_COST: Record<SpellCircle, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 5,
  5: 7,
  6: 9,
  7: 12,
  8: 15,
};

/**
 * Habilidades de conjuração de feitiços
 */
export const SPELLCASTING_SKILLS = ['arcano', 'natureza', 'religiao'] as const;

export type SpellcastingSkill = (typeof SPELLCASTING_SKILLS)[number];

/**
 * Nomes amigáveis das habilidades de conjuração
 */
export const SPELLCASTING_SKILL_LABELS: Record<SpellcastingSkill, string> = {
  arcano: 'Arcano',
  natureza: 'Natureza',
  religiao: 'Religião',
};

/**
 * Matrizes de feitiço disponíveis
 */
export const SPELL_MATRICES = [
  'arcana',
  'adiafana',
  'gnomica',
  'mundana',
  'natural',
  'elfica',
  'ana',
  'primordial',
  'luzidia',
  'infernal',
] as const;

export type SpellMatrix = (typeof SPELL_MATRICES)[number];

/**
 * Nomes amigáveis das matrizes de feitiço
 */
export const SPELL_MATRIX_LABELS: Record<SpellMatrix, string> = {
  arcana: 'Arcana',
  adiafana: 'Adiáfana',
  gnomica: 'Gnômica',
  mundana: 'Mundana',
  natural: 'Natural',
  elfica: 'Élfica',
  ana: 'Anã',
  primordial: 'Primordial',
  luzidia: 'Luzidia',
  infernal: 'Infernal',
};

/**
 * Matrizes de feitiço por habilidade de conjuração
 */
export const SPELL_MATRICES_BY_SKILL: Record<SpellcastingSkill, SpellMatrix[]> =
  {
    arcano: ['arcana', 'adiafana', 'gnomica', 'mundana'],
    natureza: ['natural', 'elfica', 'ana', 'mundana'],
    religiao: ['primordial', 'luzidia', 'infernal', 'mundana'],
  };

/**
 * Classes de feitiço
 */
export const SPELL_CLASSES = [
  'abjuracao',
  'divinacao',
  'elemental',
  'encantamento',
  'evocacao',
  'ilusao',
  'invocacao',
  'manipulacao',
  'mistica',
  'natural',
  'necromancia',
  'profana',
  'sagrada',
  'translocacao',
  'transmutacao',
] as const;

export type SpellClass = (typeof SPELL_CLASSES)[number];

/**
 * Nomes amigáveis das classes de feitiço
 */
export const SPELL_CLASS_LABELS: Record<SpellClass, string> = {
  abjuracao: 'Abjuração',
  divinacao: 'Divinação',
  elemental: 'Elemental',
  encantamento: 'Encantamento',
  evocacao: 'Evocação',
  ilusao: 'Ilusão',
  invocacao: 'Invocação',
  manipulacao: 'Manipulação',
  mistica: 'Mística',
  natural: 'Natural',
  necromancia: 'Necromancia',
  profana: 'Profana',
  sagrada: 'Sagrada',
  translocacao: 'Translocação',
  transmutacao: 'Transmutação',
};

/**
 * Componentes de feitiço
 */
export const SPELL_COMPONENTS = [
  'somatico',
  'verbal',
  'material',
  'circular',
] as const;

export type SpellComponent = (typeof SPELL_COMPONENTS)[number];

/**
 * Nomes amigáveis dos componentes de feitiço
 */
export const SPELL_COMPONENT_LABELS: Record<SpellComponent, string> = {
  somatico: 'Somático',
  verbal: 'Verbal',
  material: 'Material',
  circular: 'Circular',
};

/**
 * Abreviações dos componentes de feitiço
 */
export const SPELL_COMPONENT_ABBREVIATIONS: Record<SpellComponent, string> = {
  somatico: 'S',
  verbal: 'V',
  material: 'M',
  circular: 'C',
};

/**
 * Modificador do círculo de feitiço para aprendizado
 * Afeta a chance de aprender um feitiço
 */
export const SPELL_LEARNING_CIRCLE_MODIFIER: Record<SpellCircle, number> = {
  1: 30, // +30 (ou +0 se for o primeiro feitiço)
  2: 10,
  3: 0,
  4: -10,
  5: -20,
  6: -30,
  7: -50,
  8: -70,
};

/**
 * Chance mínima de aprendizado de feitiço
 */
export const SPELL_LEARNING_MIN_CHANCE = 1;

/**
 * Chance máxima de aprendizado de feitiço
 */
export const SPELL_LEARNING_MAX_CHANCE = 99;

/**
 * ND base de feitiços (constante do sistema)
 * Usado na fórmula: 12 + Essência + Habilidade + Bônus
 */
export const SPELL_BASE_DC = 12;

/**
 * Cores para as Habilidades de Conjuração
 */
export const SPELLCASTING_SKILL_COLORS: Record<SpellcastingSkill, string> = {
  arcano: '#2196F3', // Azul
  natureza: '#4CAF50', // Verde
  religiao: '#FFD700', // Amarelo/Dourado
};

/**
 * Cores para as Matrizes de Feitiço
 */
export const SPELL_MATRIX_COLORS: Record<SpellMatrix, string> = {
  arcana: '#2196F3', // Azul
  adiafana: '#424242', // Cinza Escuro
  gnomica: '#9C27B0', // Roxo
  mundana: '#9E9E9E', // Cinza
  natural: '#81C784', // Verde claro
  elfica: '#2E7D32', // Verde escuro
  ana: '#FF9800', // Laranja
  primordial: '#FFF59D', // Amarelo claro
  luzidia: '#FFD700', // Amarelo dourado
  infernal: '#FF6B6B', // Vermelho goiaba
};
