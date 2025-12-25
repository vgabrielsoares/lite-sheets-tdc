/**
 * Constantes relacionadas às Proficiências do personagem
 *
 * Proficiências incluem armas, armaduras, habilidades, idiomas e instrumentos.
 * Personagens começam com Armas Simples por padrão.
 */

/**
 * Categorias de proficiência com armas
 */
export const WEAPON_PROFICIENCY_CATEGORIES = [
  'simples',
  'marcial',
  'complexa',
  'pesada',
] as const;

export type WeaponProficiencyCategory =
  (typeof WEAPON_PROFICIENCY_CATEGORIES)[number];

/**
 * Nomes amigáveis das categorias de armas
 */
export const WEAPON_CATEGORY_LABELS: Record<WeaponProficiencyCategory, string> =
  {
    simples: 'Armas Simples',
    marcial: 'Armas Marciais',
    complexa: 'Armas Complexas',
    pesada: 'Armas Pesadas',
  };

/**
 * Descrições das categorias de armas
 */
export const WEAPON_CATEGORY_DESCRIPTIONS: Record<
  WeaponProficiencyCategory,
  string
> = {
  simples:
    'Armas básicas e fáceis de usar, como adagas, clavas e lanças simples.',
  marcial:
    'Armas de combate que requerem treinamento, como espadas longas e machados de batalha.',
  complexa:
    'Armas técnicas e difíceis de dominar, como arcos compostos e bestas pesadas.',
  pesada:
    'Armas grandes e poderosas que requerem grande força, como montantes e martelos de guerra.',
};

/**
 * Categorias de proficiência com armaduras
 */
export const ARMOR_PROFICIENCY_CATEGORIES = [
  'leve',
  'media',
  'pesada',
] as const;

export type ArmorProficiencyCategory =
  (typeof ARMOR_PROFICIENCY_CATEGORIES)[number];

/**
 * Nomes amigáveis das categorias de armaduras
 */
export const ARMOR_CATEGORY_LABELS: Record<ArmorProficiencyCategory, string> = {
  leve: 'Armaduras Leves',
  media: 'Armaduras Médias',
  pesada: 'Armaduras Pesadas',
};

/**
 * Descrições das categorias de armaduras
 */
export const ARMOR_CATEGORY_DESCRIPTIONS: Record<
  ArmorProficiencyCategory,
  string
> = {
  leve: 'Armaduras leves como couro e couro batido, que não atrapalham a mobilidade.',
  media:
    'Armaduras médias como cota de malha e brunea, balanceando proteção e mobilidade.',
  pesada:
    'Armaduras pesadas como placas completas, oferecendo máxima proteção mas reduzindo mobilidade.',
};

/**
 * Proficiência padrão de todos os personagens no nível 1
 */
export const DEFAULT_WEAPON_PROFICIENCY: WeaponProficiencyCategory = 'simples';

/**
 * Custos de pontos de atributo para comprar proficiências
 * Sistema de "compra" de proficiências durante criação de personagem
 */
export const PROFICIENCY_COSTS = {
  weapon: {
    oneWeapon: {
      marcial: { agilidade: 1, forca: 1 }, // 1 Agi OU 1 For
      complexa: { agilidade: 2, mente: 1 }, // 2 Agi OU 1 Men
      pesada: { forca: 2 }, // 2 For
    },
    allWeapons: {
      marcial: { agilidade: 3, forca: 3 }, // 3 Agi OU 3 For
      complexa: { agilidade: 4, mente: 3 }, // 4 Agi OU 3 Men
      pesada: { forca: 4 }, // 4 For
    },
  },
  armor: {
    oneArmor: {
      leve: { agilidade: 1, constituicao: 1 }, // 1 Agi OU 1 Con
      media: { agilidade: 2, constituicao: 2, forca: 2 }, // 2 Agi, 2 Con OU 2 For
      pesada: { constituicao: 3, forca: 3 }, // 3 Con OU 3 For
    },
    allArmors: {
      leve: { agilidade: 3, constituicao: 3 }, // 3 Agi OU 3 Con
      media: { agilidade: 4, constituicao: 4, forca: 4 }, // 4 Agi, 4 Con OU 4 For
      pesada: { constituicao: 5, forca: 5 }, // 5 Con OU 5 For
    },
  },
  skill: 1, // 1 ponto de atributo relevante
  language: { influencia: 1, mente: 1 }, // 1 Inf OU 1 Men
  craftTool: 1, // 1 ponto de atributo relevante (Instrumento de Ofício)
  skillTool: 1, // 1 ponto de atributo relevante (Instrumento de Habilidade)
} as const;

/**
 * Tipos de instrumentos/ferramentas
 */
export const TOOL_CATEGORIES = [
  'oficio', // Instrumento de Ofício
  'habilidade', // Instrumento de Habilidade
  'musical', // Instrumento Musical (Performance)
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/**
 * Nomes amigáveis das categorias de instrumentos
 */
export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  oficio: 'Instrumentos de Ofício',
  habilidade: 'Instrumentos de Habilidade',
  musical: 'Instrumentos Musicais',
};

/**
 * Proficiências Padrão - Sistema de Adição Rápida
 *
 * Organiza todas as proficiências padrão do sistema por categoria,
 * permitindo que jogadores as adicionem rapidamente com um clique.
 */

/**
 * Proficiências com Armas (weapons)
 */
export const STANDARD_WEAPON_PROFICIENCIES = [
  'Armas Simples',
  'Armas Marciais',
  'Armas Complexas',
  'Armas Pesadas',
] as const;

/**
 * Proficiências com Proteções (armor)
 */
export const STANDARD_ARMOR_PROFICIENCIES = [
  'Armaduras Leves',
  'Armaduras Médias',
  'Armaduras Pesadas',
  'Escudos',
] as const;

/**
 * Proficiências com Veículos e Montarias (other)
 */
export const STANDARD_VEHICLE_PROFICIENCIES = [
  'Montarias',
  'Veículos Aéreos',
  'Veículos Aquáticos',
  'Veículos Terrestres',
] as const;

/**
 * Proficiências com Itens Mágicos (other)
 */
export const STANDARD_MAGICAL_ITEM_PROFICIENCIES = [
  'Artefatos Mágicos',
  'Pergaminhos de Feitiço',
] as const;

/**
 * Instrumentos de Habilidade (tools)
 */
export const STANDARD_SKILL_TOOLS = [
  'Instrumentos de Arte',
  'Instrumentos de Condução',
  'Instrumentos de Curandeiro',
  'Instrumentos de Destreza',
  'Instrumentos de Enganação',
  'Instrumentos de Escalada',
  'Instrumentos de Herbalismo',
  'Instrumentos de Jogatina',
  'Instrumentos de Navegação',
  'Instrumentos de Veneno',
] as const;

/**
 * Instrumentos de Ofício (tools)
 */
export const STANDARD_CRAFT_TOOLS = [
  'Instrumentos de Alquimia',
  'Instrumentos de Artífice',
  'Instrumentos de Caligrafia',
  'Instrumentos de Carpintaria',
  'Instrumentos de Cartografia',
  'Instrumentos de Cervejeiro',
  'Instrumentos de Costura',
  'Instrumentos de Coureiro',
  'Instrumentos de Cozinha',
  'Instrumentos de Escultura',
  'Instrumentos de Ferreiro',
  'Instrumentos de Funilaria',
  'Instrumentos de Joalheria',
  'Instrumentos de Olaria',
  'Instrumentos de Pedreiro',
  'Instrumentos de Pesca',
  'Instrumentos de Pintura',
  'Instrumentos de Sapataria',
  'Instrumentos de Vidraria',
] as const;

/**
 * Todas as proficiências padrão organizadas por categoria da interface
 */
export const STANDARD_PROFICIENCIES = {
  weapons: STANDARD_WEAPON_PROFICIENCIES,
  armor: STANDARD_ARMOR_PROFICIENCIES,
  tools: [...STANDARD_SKILL_TOOLS, ...STANDARD_CRAFT_TOOLS],
  other: [
    ...STANDARD_VEHICLE_PROFICIENCIES,
    ...STANDARD_MAGICAL_ITEM_PROFICIENCIES,
  ],
} as const;

/**
 * Subcategorias para organização visual no componente
 */
export const PROFICIENCY_SUBCATEGORIES = {
  tools: [
    { label: 'Ferramentas de Habilidade', items: STANDARD_SKILL_TOOLS },
    { label: 'Ferramentas de Ofício', items: STANDARD_CRAFT_TOOLS },
  ],
  other: [
    { label: 'Veículos e Montarias', items: STANDARD_VEHICLE_PROFICIENCIES },
    { label: 'Itens Mágicos', items: STANDARD_MAGICAL_ITEM_PROFICIENCIES },
  ],
} as const;
