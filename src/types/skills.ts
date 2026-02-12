/**
 * Skills - Tipos relacionados a habilidades (perícias) do personagem
 *
 * Este arquivo contém os tipos e interfaces relacionados às 33 habilidades
 * do sistema Tabuleiro do Caos RPG.
 */

import type { AttributeName } from './attributes';
import type { ProficiencyLevel, DieSize, Modifier } from './common';

/**
 * Lista completa das 33 habilidades do sistema
 * Baseada na tabela oficial das Regras Básicas
 */
export const SKILL_LIST = [
  'acerto',
  'acrobacia',
  'adestramento',
  'arcano',
  'arte',
  'atletismo',
  'conducao',
  'destreza',
  'determinacao',
  'enganacao',
  'estrategia',
  'furtividade',
  'historia',
  'instrucao',
  'intimidacao',
  'investigacao',
  'luta',
  'medicina',
  'natureza',
  'oficio',
  'percepcao',
  'performance',
  'perspicacia',
  'persuasao',
  'rastreamento',
  'reflexo',
  'religiao',
  'sobrevivencia',
  'sociedade',
  'sorte',
  'sintonia',
  'tenacidade',
  'vigor',
] as const;

/**
 * Nome de uma habilidade
 */
export type SkillName = (typeof SKILL_LIST)[number];

/**
 * Mapeamento de habilidades para seus atributos-chave padrão
 *
 * Nota: Jogadores podem alterar o atributo-chave em casos especiais
 * Baseado na tabela oficial das Regras Básicas
 */
export const SKILL_KEY_ATTRIBUTES: Record<
  SkillName,
  AttributeName | 'especial'
> = {
  acerto: 'agilidade',
  acrobacia: 'agilidade',
  adestramento: 'influencia',
  arcano: 'essencia',
  arte: 'mente',
  atletismo: 'corpo',
  conducao: 'agilidade',
  destreza: 'agilidade',
  determinacao: 'mente',
  enganacao: 'influencia',
  estrategia: 'mente',
  furtividade: 'agilidade',
  historia: 'mente',
  instrucao: 'mente',
  intimidacao: 'influencia',
  investigacao: 'mente',
  luta: 'corpo',
  medicina: 'mente',
  natureza: 'instinto',
  oficio: 'especial',
  percepcao: 'instinto',
  performance: 'influencia',
  perspicacia: 'instinto',
  persuasao: 'influencia',
  rastreamento: 'instinto',
  reflexo: 'agilidade',
  religiao: 'influencia',
  sobrevivencia: 'mente',
  sociedade: 'influencia',
  sorte: 'especial',
  sintonia: 'essencia',
  tenacidade: 'corpo',
  vigor: 'corpo',
} as const;

/**
 * Indica se uma habilidade é de combate
 * Habilidades de combate têm regras especiais para Habilidade de Assinatura
 * Baseado na tabela oficial das Regras Básicas
 */
export const COMBAT_SKILLS: SkillName[] = [
  'acerto',
  'arcano',
  'determinacao',
  'luta',
  'natureza',
  'reflexo',
  'religiao',
  'sintonia',
  'tenacidade',
  'vigor',
];

/**
 * Uso customizado de uma habilidade
 *
 * Permite criar variações de uma habilidade com diferentes atributos-chave
 * e bônus específicos para situações particulares.
 *
 * Exemplo: "Acrobacia para Equilíbrio em Combate" usando Agilidade + bônus de +2
 */
export interface SkillUse {
  /** ID único do uso */
  id: string;
  /** Nome do uso customizado */
  name: string;
  /** Habilidade base à qual este uso pertence */
  skillName: SkillName;
  /** Atributo-chave customizado para este uso */
  keyAttribute: AttributeName;
  /** Bônus específico deste uso */
  bonus: number;
  /** Descrição ou notas sobre este uso */
  description?: string;
  /** Modificadores específicos deste uso (numéricos e de dados) */
  modifiers?: Modifier[];
}

/**
 * Mapa de atributo-chave personalizado por nome de uso padrão
 * Permite que usos padrões usem atributos diferentes da habilidade base
 */
export type DefaultUseAttributeOverrides = Record<string, AttributeName>;

/**
 * Mapa de modificadores personalizados por nome de uso padrão
 * Permite que usos padrões tenham modificadores específicos
 */
export type DefaultUseModifierOverrides = Record<string, Modifier[]>;

/**
 * Interface para uma habilidade do personagem
 */
export interface Skill {
  /** Nome da habilidade */
  name: SkillName;
  /** Atributo-chave usado para esta habilidade */
  keyAttribute: AttributeName;
  /** Nível de proficiência */
  proficiencyLevel: ProficiencyLevel;
  /** Se esta é a Habilidade de Assinatura do personagem */
  isSignature: boolean;
  /** Atributos-chave personalizados para usos padrões */
  defaultUseAttributeOverrides?: DefaultUseAttributeOverrides;
  /** Modificadores personalizados para usos padrões */
  defaultUseModifierOverrides?: DefaultUseModifierOverrides;
  /** Modificadores adicionais aplicados à habilidade */
  modifiers: Modifier[];
  /** Usos customizados desta habilidade */
  customUses?: SkillUse[];
  /** ID do ofício selecionado para rolagem (apenas para habilidade "oficio") */
  selectedCraftId?: string;
}

/**
 * Coleção de todas as habilidades de um personagem
 */
export type Skills = Record<SkillName, Skill>;

/**
 * Resultado do cálculo de pool de dados de uma habilidade
 *
 * No sistema pool de dados:
 * - Proficiência determina o tamanho do dado (d6/d8/d10/d12)
 * - Atributo determina a quantidade base de dados na pool
 * - Todos os modificadores são em dados (+Xd / -Xd)
 * - Sem modificadores numéricos em testes de habilidade
 */
export interface SkillPoolCalculation {
  /** Valor do atributo-chave (quantidade base de dados) */
  attributeValue: number;
  /** Nível de proficiência do personagem na habilidade */
  proficiencyLevel: ProficiencyLevel;
  /** Tamanho do dado determinado pelo grau de proficiência */
  dieSize: DieSize;
  /** Bônus de Habilidade de Assinatura em dados (+Xd) */
  signatureDiceBonus: number;
  /** Outros modificadores de dados (+Xd / -Xd) de efeitos, bônus temporários, etc. */
  otherDiceModifiers: number;
  /** Penalidade de carga por excesso de peso (-2d). Negativo quando aplicada. */
  loadDicePenalty: number;
  /** Penalidade de armadura em dados (-1d média, -2d pesada). Negativo quando aplicada. */
  armorDicePenalty: number;
  /** Penalidade de proficiência em dados (-2d se Leigo em habilidade que requer proficiência). Negativo quando aplicada. */
  proficiencyDicePenalty: number;
  /** Penalidade de instrumento em dados (-2d se falta instrumento requerido). Negativo quando aplicada. */
  instrumentDicePenalty: number;
  /** Total de modificadores de dados (signatureDiceBonus + otherDiceModifiers + todas as penalidades) */
  totalDiceModifier: number;
  /** Total de dados na pool (attributeValue + totalDiceModifier) */
  totalDice: number;
  /** Se usa regra de penalidade extrema (2d, menor) — quando totalDice ≤ 0 */
  isPenaltyRoll: boolean;
}

/**
 * @deprecated Usar SkillPoolCalculation. Mantido para compatibilidade durante migração.
 */
export type SkillModifierCalculation = SkillPoolCalculation;

/**
 * Fórmula de rolagem de pool de dados de uma habilidade
 *
 * Formato: "Xd[tamanho]" (ex: "3d8", "2d6 (menor)")
 * Sem modificadores numéricos em testes de habilidade.
 */
export interface SkillPoolFormula {
  /** Quantidade de dados a rolar */
  diceCount: number;
  /** Tamanho do dado (d6/d8/d10/d12) */
  dieSize: DieSize;
  /** Se usa regra de penalidade extrema (2d, menor) */
  isPenaltyRoll: boolean;
  /** Fórmula legível (ex: "3d8", "2d6 (menor)") */
  formula: string;
}

/**
 * @deprecated Usar SkillPoolFormula. Mantido para compatibilidade durante migração.
 */
export type SkillRollFormula = SkillPoolFormula;

/**
 * Descrições das habilidades
 */
export const SKILL_DESCRIPTIONS: Record<SkillName, string> = {
  acerto: 'Capacidade de acertar ataques à distância e com armas de precisão.',
  acrobacia:
    'Capacidade de realizar manobras acrobáticas e manter o equilíbrio.',
  adestramento: 'Capacidade de treinar e controlar animais.',
  arcano: 'Conhecimento sobre magia arcana, feitiços e fenômenos mágicos.',
  arte: 'Habilidade artística e criativa em diversas formas de expressão.',
  atletismo: 'Capacidade física geral, incluindo corrida, natação e escalada.',
  conducao: 'Capacidade de conduzir veículos e montarias.',
  destreza: 'Habilidade manual fina para manipulação de objetos delicados.',
  determinacao: 'Resistência mental e capacidade de manter o foco sob pressão.',
  enganacao: 'Capacidade de enganar através de truques e manipulação.',
  estrategia: 'Capacidade de planejar e executar estratégias complexas.',
  furtividade: 'Capacidade de se mover silenciosamente e sem ser detectado.',
  historia: 'Conhecimento sobre eventos históricos e culturas antigas.',
  instrucao: 'Repertório de estudo e conhecimento acadêmico.',
  intimidacao: 'Capacidade de ameaçar e intimidar outros.',
  investigacao: 'Capacidade de encontrar pistas e resolver mistérios.',
  luta: 'Capacidade de combate corpo a corpo desarmado ou com armas.',
  medicina: 'Conhecimento sobre cura, doenças e anatomia.',
  natureza: 'Conhecimento sobre o mundo natural e sintonia com a natureza.',
  oficio: 'Habilidade em um ofício específico ou artesanato.',
  percepcao: 'Capacidade geral de perceber o ambiente ao redor.',
  performance: 'Capacidade de entreter, atuar e se apresentar.',
  perspicacia: 'Capacidade de perceber intenções e sentimentos alheios.',
  persuasao: 'Capacidade de convencer e influenciar outros.',
  rastreamento: 'Capacidade de seguir rastros e encontrar criaturas.',
  reflexo: 'Capacidade de reagir rapidamente a perigos.',
  religiao: 'Conhecimento sobre divindades, religiões e rituais.',
  sobrevivencia: 'Capacidade de sobreviver em ambientes selvagens.',
  sociedade: 'Conhecimento sobre etiqueta, política e estruturas sociais.',
  sorte: 'Favor do destino e capacidade de alterar probabilidades.',
  sintonia:
    'Resistência a efeitos mágicos e espirituais, conexão com o sobrenatural.',
  tenacidade:
    'Resistência física, usada recuperar equilíbrio ou manter a postura.',
  vigor: 'Resistência a doenças, venenos e efeitos físicos.',
} as const;

/**
 * Habilidades que podem ser usadas sem proficiência (leigo)
 * Todas as habilidades podem ser usadas como leigo, mas algumas têm penalidades
 */
export const UNTRAINED_USABLE_SKILLS: SkillName[] = [...SKILL_LIST];

/**
 * Número padrão de habilidades proficientes no nível 1
 * 3 + valor de Mente (retroativo)
 */
export const BASE_PROFICIENT_SKILLS = 3;
