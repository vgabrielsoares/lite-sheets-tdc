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
 * Cálculo de ND (Nível de Dificuldade) de feitiços
 * Fórmula base: 12 + Presença + Habilidade de Conjuração + Bônus de ND
 */
export const SPELL_BASE_DC = 12;

/**
 * Cálculo de Bônus de Ataque de feitiços
 * Fórmula: Presença + Habilidade de Conjuração + Bônus de Ataque
 */
export const calculateSpellDC = (
  presencaValue: number,
  skillModifier: number,
  dcBonus: number = 0
): number => {
  return SPELL_BASE_DC + presencaValue + skillModifier + dcBonus;
};

/**
 * Calcula o bônus de ataque de feitiços
 */
export const calculateSpellAttackBonus = (
  presencaValue: number,
  skillModifier: number,
  attackBonus: number = 0
): number => {
  return presencaValue + skillModifier + attackBonus;
};

/**
 * Calcula a chance de aprendizado de um feitiço
 *
 * @param menteValue - Valor do atributo Mente
 * @param skillModifier - Modificador total da habilidade de conjuração
 * @param circle - Círculo do feitiço
 * @param isFirstSpell - Se é o primeiro feitiço (afeta bônus do 1º círculo)
 * @param knownSpellsModifier - Modificador pelo número de feitiços conhecidos
 * @param matrixModifier - Modificador por matriz (opcional)
 * @param otherModifiers - Outros modificadores
 * @returns Chance de aprendizado (1-99%)
 */
export const calculateSpellLearningChance = (
  menteValue: number,
  skillModifier: number,
  circle: SpellCircle,
  isFirstSpell: boolean = false,
  knownSpellsModifier: number = 0,
  matrixModifier: number = 0,
  otherModifiers: number = 0
): number => {
  // Valor base: Mente × 5
  const baseValue = menteValue * 5;

  // Modificador do círculo (1º círculo é +0 se for o primeiro feitiço)
  const circleModifier =
    circle === 1 && isFirstSpell ? 0 : SPELL_LEARNING_CIRCLE_MODIFIER[circle];

  // Soma total
  const totalChance =
    baseValue +
    skillModifier +
    circleModifier +
    knownSpellsModifier +
    matrixModifier +
    otherModifiers;

  // Limita entre 1% e 99%
  return Math.max(
    SPELL_LEARNING_MIN_CHANCE,
    Math.min(SPELL_LEARNING_MAX_CHANCE, totalChance)
  );
};
