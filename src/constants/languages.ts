/**
 * Constantes relacionadas a Idiomas e Alfabetos
 *
 * Todos os personagens conhecem o idioma Comum.
 * Personagens começam com idiomas adicionais igual a Mente - 1 (mínimo 0, retroativo)
 */

/**
 * Lista completa de idiomas disponíveis no sistema
 * Baseado nas Regras Básicas do Tabuleiro do Caos RPG
 */
export const LANGUAGE_LIST = [
  'comum',
  'anao',
  'elfico',
  'goblinoide',
  'draconico',
  'infernal',
  'primordial',
  'runico',
  'aquatico',
  'gigante',
  'gnomico',
  'glasnee',
  'orc',
  'silvestre',
] as const;

/**
 * Tipo para nome de idioma
 */
export type LanguageName = (typeof LANGUAGE_LIST)[number];

/**
 * Nomes amigáveis dos idiomas (para exibição)
 */
export const LANGUAGE_LABELS: Record<LanguageName, string> = {
  comum: 'Comum',
  anao: 'Anão',
  elfico: 'Élfico',
  goblinoide: 'Goblinoide',
  draconico: 'Dracônico',
  infernal: 'Infernal',
  primordial: 'Primordial',
  runico: 'Rúnico',
  aquatico: 'Aquático',
  gigante: 'Gigante',
  gnomico: 'Gnômico',
  glasnee: 'Glasnee',
  orc: 'Orc',
  silvestre: 'Silvestre',
};

/**
 * Descrições dos idiomas
 */
export const LANGUAGE_DESCRIPTIONS: Record<LanguageName, string> = {
  comum: 'Idioma universal falado pela maioria das raças civilizadas.',
  anao: 'Idioma dos anões, áspero e gutural, usado em suas fortalezas montanhosas.',
  elfico: 'Idioma élfico, melódico e fluido, usado pelos elfos.',
  goblinoide: 'Idioma dos goblins, hobgoblins e raças relacionadas.',
  draconico: 'Idioma antigo dos dragões, poderoso e complexo.',
  infernal: 'Idioma dos diabos e habitantes dos planos infernais.',
  primordial: 'Idioma elemental, usado por criaturas dos planos elementais.',
  runico: 'Idioma rúnico usado em inscrições e magias antigas.',
  aquatico: 'Idioma das criaturas aquáticas e habitantes dos mares.',
  gigante: 'Idioma dos gigantes e criaturas de grande porte.',
  gnomico: 'Idioma dos gnomos, técnico e cheio de nuances.',
  glasnee: 'Idioma da raça Glasnee, específico de sua cultura.',
  orc: 'Idioma dos orcs, primitivo e agressivo.',
  silvestre: 'Idioma das fadas e criaturas das florestas.',
};

/**
 * Alfabetos associados aos idiomas
 * Alguns idiomas compartilham alfabetos
 */
export const LANGUAGE_ALPHABETS: Record<LanguageName, string> = {
  comum: 'Comum',
  anao: 'Rúnico',
  elfico: 'Élfico',
  goblinoide: 'Comum',
  draconico: 'Dracônico',
  infernal: 'Infernal',
  primordial: 'Primordial',
  runico: 'Rúnico',
  aquatico: 'Primordial',
  gigante: 'Rúnico',
  gnomico: 'Rúnico',
  glasnee: 'Comum',
  orc: 'Comum',
  silvestre: 'Élfico',
};

/**
 * Idioma padrão que todos os personagens conhecem
 */
export const DEFAULT_LANGUAGE: LanguageName = 'comum';

/**
 * Número base de idiomas adicionais além do Comum
 * Fórmula: Mente - 1 (mínimo 0, retroativo)
 */
export const BASE_ADDITIONAL_LANGUAGES_FORMULA = (
  menteValue: number
): number => {
  return Math.max(0, menteValue - 1);
};
