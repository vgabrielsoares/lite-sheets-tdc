/**
 * Skills - Tipos relacionados a habilidades (perícias) do personagem
 *
 * Este arquivo contém os tipos e interfaces relacionados às 33 habilidades
 * do sistema Tabuleiro do Caos RPG.
 */

import type { AttributeName } from './attributes';
import type { ProficiencyLevel, Modifier } from './common';

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
  'iniciativa',
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
  arcano: 'mente',
  arte: 'mente',
  atletismo: 'constituicao',
  conducao: 'agilidade',
  destreza: 'agilidade',
  determinacao: 'mente',
  enganacao: 'influencia',
  estrategia: 'mente',
  furtividade: 'agilidade',
  historia: 'mente',
  iniciativa: 'agilidade',
  instrucao: 'mente',
  intimidacao: 'influencia',
  investigacao: 'mente',
  luta: 'forca',
  medicina: 'mente',
  natureza: 'presenca',
  oficio: 'especial',
  percepcao: 'presenca',
  performance: 'influencia',
  perspicacia: 'presenca',
  persuasao: 'influencia',
  rastreamento: 'presenca',
  reflexo: 'agilidade',
  religiao: 'presenca',
  sobrevivencia: 'mente',
  sociedade: 'influencia',
  sorte: 'especial',
  tenacidade: 'forca',
  vigor: 'constituicao',
} as const;

/**
 * Indica se uma habilidade é de combate
 * Habilidades de combate têm regras especiais para Habilidade de Assinatura
 * Baseado na tabela oficial das Regras Básicas
 */
export const COMBAT_SKILLS: SkillName[] = [
  'acerto',
  'determinacao',
  'iniciativa',
  'luta',
  'natureza',
  'reflexo',
  'religiao',
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
 * Resultado do cálculo de modificador de uma habilidade
 */
export interface SkillModifierCalculation {
  /** Valor do atributo-chave */
  attributeValue: number;
  /** Multiplicador da proficiência (0, 1, 2 ou 3) */
  proficiencyMultiplier: number;
  /** Modificador base (atributo × proficiência) */
  baseModifier: number;
  /** Bônus de Habilidade de Assinatura (se aplicável) */
  signatureBonus: number;
  /** Outros modificadores */
  otherModifiers: number;
  /** Modificador total */
  totalModifier: number;
}

/**
 * Fórmula de rolagem de uma habilidade
 */
export interface SkillRollFormula {
  /** Quantidade de d20 a rolar */
  diceCount: number;
  /** Se deve escolher o menor resultado (quando atributo = 0) */
  takeLowest: boolean;
  /** Modificador total a adicionar */
  modifier: number;
  /** Descrição da fórmula (ex: "2d20+4") */
  formula: string;
}

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
  iniciativa: 'Velocidade de reação no início do combate.',
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
  tenacidade: 'Resistência física, usada recuperar equilíbrio ou manter a postura.',
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
