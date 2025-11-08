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
 */
export const SKILL_LIST = [
  'acerto',
  'acrobacia',
  'adestramento',
  'arcano',
  'atletismo',
  'atuacao',
  'blefe', // blefe
  'determinacao',
  'enganacao',
  'esquiva',
  'furtividade',
  'historia',
  'iniciativa',
  'intimidacao',
  'intuicao',
  'investigacao',
  'jogatina',
  'medicina',
  'natureza',
  'observar',
  'ouvir',
  'parry',
  'percepcao',
  'persuasao',
  'pilotagem',
  'pontaria',
  'reacao',
  'reflexo',
  'religiao',
  'resistencia',
  'sobrevivencia',
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
 */
export const SKILL_KEY_ATTRIBUTES: Record<SkillName, AttributeName> = {
  acerto: 'agilidade',
  acrobacia: 'agilidade',
  adestramento: 'influencia',
  arcano: 'mente',
  atletismo: 'forca',
  atuacao: 'influencia',
  blefe: 'influencia',
  determinacao: 'mente',
  enganacao: 'influencia',
  esquiva: 'agilidade',
  furtividade: 'agilidade',
  historia: 'mente',
  iniciativa: 'agilidade',
  intimidacao: 'influencia',
  intuicao: 'presenca',
  investigacao: 'mente',
  jogatina: 'influencia',
  medicina: 'mente',
  natureza: 'mente',
  observar: 'presenca',
  ouvir: 'presenca',
  parry: 'agilidade',
  percepcao: 'presenca',
  persuasao: 'influencia',
  pilotagem: 'agilidade',
  pontaria: 'agilidade',
  reacao: 'agilidade',
  reflexo: 'agilidade',
  religiao: 'mente',
  resistencia: 'constituicao',
  sobrevivencia: 'presenca',
  tenacidade: 'forca',
  vigor: 'constituicao',
} as const;

/**
 * Indica se uma habilidade é de combate
 * Habilidades de combate têm regras especiais para Habilidade de Assinatura
 */
export const COMBAT_SKILLS: SkillName[] = [
  'acerto',
  'esquiva',
  'iniciativa',
  'parry',
  'pontaria',
  'reacao',
  'reflexo',
];

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
  /** Modificadores adicionais aplicados à habilidade */
  modifiers: Modifier[];
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
  acerto: 'Capacidade de acertar ataques corpo a corpo.',
  acrobacia:
    'Capacidade de realizar manobras acrobáticas e manter o equilíbrio.',
  adestramento: 'Capacidade de treinar e controlar animais.',
  arcano: 'Conhecimento sobre magia arcana, feitiços e fenômenos mágicos.',
  atletismo: 'Capacidade física geral, incluindo corrida, natação e escalada.',
  atuacao: 'Capacidade de atuar, entreter e se passar por outra pessoa.',
  blefe: 'Capacidade de enganar e mentir de forma convincente.',
  determinacao: 'Resistência mental e capacidade de manter o foco.',
  enganacao: 'Capacidade de enganar através de truques e subterfúgios.',
  esquiva: 'Capacidade de evitar ataques e perigos.',
  furtividade: 'Capacidade de se mover silenciosamente e sem ser detectado.',
  historia: 'Conhecimento sobre eventos históricos e culturas antigas.',
  iniciativa: 'Velocidade de reação no início do combate.',
  intimidacao: 'Capacidade de ameaçar e intimidar outros.',
  intuicao: 'Capacidade de perceber intenções e sentimentos alheios.',
  investigacao: 'Capacidade de encontrar pistas e resolver mistérios.',
  jogatina: 'Conhecimento e habilidade em jogos de azar.',
  medicina: 'Conhecimento sobre cura, doenças e anatomia.',
  natureza: 'Conhecimento sobre o mundo natural, plantas e animais.',
  observar: 'Capacidade de notar detalhes visuais.',
  ouvir: 'Capacidade de detectar sons e conversas.',
  parry: 'Capacidade de aparar ataques.',
  percepcao: 'Capacidade geral de perceber o ambiente ao redor.',
  persuasao: 'Capacidade de convencer e influenciar outros.',
  pilotagem: 'Capacidade de pilotar veículos e montarias.',
  pontaria: 'Capacidade de acertar ataques à distância.',
  reacao: 'Velocidade de reação a eventos súbitos.',
  reflexo: 'Capacidade de reagir rapidamente a perigos.',
  religiao: 'Conhecimento sobre divindades, religiões e rituais.',
  resistencia: 'Capacidade de resistir a fadiga e esforço prolongado.',
  sobrevivencia: 'Capacidade de sobreviver em ambientes hostis.',
  tenacidade: 'Resistência física a dano e efeitos prejudiciais.',
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
