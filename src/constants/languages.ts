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
  'primordial',
  'runico',
  'anao',
  'aquatico',
  'draconico',
  'elfico',
  'gigante',
  'gnomico',
  'infernal',
  'glasnee',
  'orc',
  'silvestre',
  'goblinoide',
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
  primordial: 'Primordial',
  runico: 'Rúnico',
  anao: 'Anão (Dvergur)',
  aquatico: 'Aquático (Lang)',
  draconico: 'Dracônico (Nyelv)',
  elfico: 'Élfico (Aon-deug)',
  gigante: 'Gigante (Yoksa)',
  gnomico: 'Gnômico (Tgegh)',
  infernal: 'Infernal (Jahanami)',
  glasnee: "Oopar'neela (Glasnee)",
  orc: 'Orc (Meehun)',
  silvestre: 'Silvestre (Zerleg)',
  goblinoide: 'Ururimi (Goblinóide)',
};

/**
 * Descrições dos idiomas
 */
export const LANGUAGE_DESCRIPTIONS: Record<LanguageName, string> = {
  comum:
    'Idioma universal falado pela maioria das raças civilizadas. Todos os personagens conhecem este idioma.',
  primordial:
    'Idioma primordial, usado por criaturas mais antigas que o próprio tempo.',
  runico:
    'Idioma rúnico usado em inscrições antigas, magias e textos de poder. Não é falado, mas sinalizado e/ou escrito.',
  anao: 'Dvergur - Idioma dos anões, áspero e gutural, usado em suas fortalezas montanhosas.',
  aquatico:
    'Lang - Idioma das criaturas aquáticas e habitantes dos oceanos profundos, repletos de sinais, vibrações e feições que substituem sons que não correm bem pela água.',
  draconico:
    'Nyelv - Idioma antigo dos dragões, poderoso, complexo e elegante.',
  elfico:
    'Aon-deug - Idioma élfico, fluido, usado pelos elfos e aqueles que seguem sua cultura.',
  gigante: 'Yoksa - Idioma dos gigantes, com som forte e curto.',
  gnomico: 'Tgegh - Idioma dos gnomos, técnico, cheio de nuances e precisão.',
  infernal:
    'Jahanami - Idioma dos habitantes dos planos infernais, cheio de particularidades.',
  glasnee:
    "Oopar'neela - Idioma da raça Glasnee, perfeito para diplomacia, textos e assuntos acadêmicos.",
  orc: 'Meehun - Idioma dos orcs, direto e simples.',
  silvestre:
    'Zerleg - Idioma das criaturas das florestas selvagens, muito conhecido e disseminado.',
  goblinoide:
    'Ururimi - Idioma dos goblins, hobgoblins e raças goblinóides relacionadas, podendo haver diferentes refinações.',
};

/**
 * Alfabetos associados aos idiomas
 * Alguns idiomas compartilham alfabetos
 */
export const LANGUAGE_ALPHABETS: Record<LanguageName, string> = {
  comum: 'Comum',
  primordial: 'Primordial',
  runico: 'Rúnico',
  anao: 'Gnômico',
  aquatico: 'Let (Aquático)',
  draconico: 'Irott (Dracônico)',
  elfico: 'Litreachadh (Élfico)',
  gigante: 'Aksaar (Gigante)',
  gnomico: 'Gnômico',
  infernal: 'Primordial',
  glasnee: 'Vartanee (Glasnee)',
  orc: 'Useg (Silvestre)',
  silvestre: 'Useg (Silvestre)',
  goblinoide: 'Useg (Silvestre)',
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
