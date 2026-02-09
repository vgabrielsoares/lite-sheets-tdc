/**
 * Constantes relacionadas às Habilidades (Perícias) do personagem
 *
 * São 33 habilidades no total, cada uma com:
 * - Atributo-chave padrão
 * - Propriedades especiais (Carga, Instrumento, Proficiência, Combate)
 * - Graus de proficiência (Leigo, Adepto, Versado, Mestre)
 */

import {
  SkillName,
  AttributeName,
  ProficiencyLevel,
  DieSize,
  PROFICIENCY_DIE_MAP,
} from '@/types';
import { SKILL_LIST } from '@/types';

/**
 * @deprecated Usar PROFICIENCY_DIE_MAP do types no lugar.
 * Graus de proficiência em habilidades
 * No sistema antigo, o multiplicador era aplicado ao atributo-chave.
 * No sistema novo (v0.0.2), o grau determina o tamanho do dado.
 */
export const SKILL_PROFICIENCY_LEVELS: Record<ProficiencyLevel, number> = {
  leigo: 0,
  adepto: 1,
  versado: 2,
  mestre: 3,
};

/**
 * Mapeamento de graus de proficiência para tamanhos de dado
 * Re-exportado de @/types para conveniência
 */
export const PROFICIENCY_TO_DIE_SIZE = PROFICIENCY_DIE_MAP;

/**
 * Retorna o tamanho do dado para um nível de proficiência
 */
export function getSkillDieSize(proficiencyLevel: ProficiencyLevel): DieSize {
  return PROFICIENCY_DIE_MAP[proficiencyLevel];
}

/**
 * Nomes amigáveis dos graus de proficiência
 */
export const SKILL_PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  leigo: 'Leigo',
  adepto: 'Adepto',
  versado: 'Versado',
  mestre: 'Mestre',
};

/**
 * Nomes amigáveis das habilidades (para exibição)
 */
export const SKILL_LABELS: Record<SkillName, string> = {
  acerto: 'Acerto',
  acrobacia: 'Acrobacia',
  adestramento: 'Adestramento',
  arcano: 'Arcano',
  arte: 'Arte',
  atletismo: 'Atletismo',
  conducao: 'Condução',
  destreza: 'Destreza',
  determinacao: 'Determinação',
  enganacao: 'Enganação',
  estrategia: 'Estratégia',
  furtividade: 'Furtividade',
  historia: 'História',
  instrucao: 'Instrução',
  intimidacao: 'Intimidação',
  investigacao: 'Investigação',
  luta: 'Luta',
  medicina: 'Medicina',
  natureza: 'Natureza',
  oficio: 'Ofício',
  percepcao: 'Percepção',
  performance: 'Performance',
  perspicacia: 'Perspicácia',
  persuasao: 'Persuasão',
  rastreamento: 'Rastreamento',
  reflexo: 'Reflexo',
  religiao: 'Religião',
  sobrevivencia: 'Sobrevivência',
  sociedade: 'Sociedade',
  sorte: 'Sorte',
  sintonia: 'Sintonia',
  tenacidade: 'Tenacidade',
  vigor: 'Vigor',
};

/**
 * Metadados completos de cada habilidade
 */
export interface SkillMetadata {
  name: SkillName;
  /** Nome amigável para exibição */
  label: string;
  /** Atributo-chave padrão usado para testes desta habilidade */
  keyAttribute: AttributeName | 'especial';
  /** Se sofre penalidade quando personagem está Sobrecarregado */
  hasCargaPenalty: boolean;
  /** Se requer instrumento específico para uso */
  requiresInstrument: boolean;
  /** Se requer proficiência para uso efetivo */
  requiresProficiency: boolean;
  /** Se é uma habilidade de combate */
  isCombatSkill: boolean;
}

/**
 * Mapa completo de metadados de todas as habilidades
 * Baseado na tabela oficial das Regras Básicas do Tabuleiro do Caos RPG
 */
export const SKILL_METADATA: Record<SkillName, SkillMetadata> = {
  acerto: {
    name: 'acerto',
    label: 'Acerto',
    keyAttribute: 'agilidade',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  acrobacia: {
    name: 'acrobacia',
    label: 'Acrobacia',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  adestramento: {
    name: 'adestramento',
    label: 'Adestramento',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  arcano: {
    name: 'arcano',
    label: 'Arcano',
    keyAttribute: 'essencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: true,
  },
  arte: {
    name: 'arte',
    label: 'Arte',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  atletismo: {
    name: 'atletismo',
    label: 'Atletismo',
    keyAttribute: 'corpo',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  conducao: {
    name: 'conducao',
    label: 'Condução',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  destreza: {
    name: 'destreza',
    label: 'Destreza',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  determinacao: {
    name: 'determinacao',
    label: 'Determinação',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  enganacao: {
    name: 'enganacao',
    label: 'Enganação',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  estrategia: {
    name: 'estrategia',
    label: 'Estratégia',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  furtividade: {
    name: 'furtividade',
    label: 'Furtividade',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  historia: {
    name: 'historia',
    label: 'História',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  instrucao: {
    name: 'instrucao',
    label: 'Instrução',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  intimidacao: {
    name: 'intimidacao',
    label: 'Intimidação',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  investigacao: {
    name: 'investigacao',
    label: 'Investigação',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  luta: {
    name: 'luta',
    label: 'Luta',
    keyAttribute: 'corpo',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  medicina: {
    name: 'medicina',
    label: 'Medicina',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  natureza: {
    name: 'natureza',
    label: 'Natureza',
    keyAttribute: 'instinto',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  oficio: {
    name: 'oficio',
    label: 'Ofício',
    keyAttribute: 'especial',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  percepcao: {
    name: 'percepcao',
    label: 'Percepção',
    keyAttribute: 'instinto',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  performance: {
    name: 'performance',
    label: 'Performance',
    keyAttribute: 'influencia',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  perspicacia: {
    name: 'perspicacia',
    label: 'Perspicácia',
    keyAttribute: 'instinto',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  persuasao: {
    name: 'persuasao',
    label: 'Persuasão',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  rastreamento: {
    name: 'rastreamento',
    label: 'Rastreamento',
    keyAttribute: 'instinto',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  reflexo: {
    name: 'reflexo',
    label: 'Reflexo',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  religiao: {
    name: 'religiao',
    label: 'Religião',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: true,
  },
  sobrevivencia: {
    name: 'sobrevivencia',
    label: 'Sobrevivência',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  sociedade: {
    name: 'sociedade',
    label: 'Sociedade',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  sorte: {
    name: 'sorte',
    label: 'Sorte',
    keyAttribute: 'especial',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  sintonia: {
    name: 'sintonia',
    label: 'Sintonia',
    keyAttribute: 'essencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  tenacidade: {
    name: 'tenacidade',
    label: 'Tenacidade',
    keyAttribute: 'corpo',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  vigor: {
    name: 'vigor',
    label: 'Vigor',
    keyAttribute: 'corpo',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
};

/**
 * Habilidades de combate (usadas em combate)
 */
export const COMBAT_SKILLS: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].isCombatSkill
);

/**
 * Habilidades que sofrem penalidade de carga
 * Sofrem -2d quando o personagem está Sobrecarregado
 * Sofrem -1d com armadura média, -2d com armadura pesada
 * Penalidades são cumulativas entre si
 */
export const SKILLS_WITH_CARGA_PENALTY: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].hasCargaPenalty
);

/**
 * Habilidades que requerem proficiência para uso efetivo
 * Sofrem -2d quando personagem é Leigo
 */
export const SKILLS_REQUIRING_PROFICIENCY: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].requiresProficiency
);

/**
 * Habilidades que requerem instrumento
 * Sofrem -2d quando personagem não possui o instrumento necessário
 */
export const SKILLS_REQUIRING_INSTRUMENT: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].requiresInstrument
);

// --- Constantes de penalidade em dados (v0.0.2) ---

/** Penalidade de carga por excesso de peso: -2d */
export const OVERLOAD_DICE_PENALTY = -2;

/** Penalidade de carga com armadura média: -1d */
export const MEDIUM_ARMOR_DICE_PENALTY = -1;

/** Penalidade de carga com armadura pesada: -2d */
export const HEAVY_ARMOR_DICE_PENALTY = -2;

/** Penalidade por usar habilidade como Leigo quando requer proficiência: -2d */
export const PROFICIENCY_DICE_PENALTY = -2;

/** Penalidade por usar habilidade sem instrumento necessário: -2d */
export const INSTRUMENT_DICE_PENALTY = -2;

/**
 * @deprecated Usar OVERLOAD_DICE_PENALTY. Penalidades agora são em dados (-Xd), não numéricas.
 */
export const CARGA_PENALTY_VALUE = -2;

/**
 * Número inicial de proficiências com habilidades no nível 1
 * Fórmula: 3 + Mente (retroativo)
 */
export const BASE_SKILL_PROFICIENCIES = 3;

// ============================================================
// Sorte - Tabela de Níveis e Apostas
// ============================================================

/**
 * Interface para cada nível de Sorte
 */
export interface LuckLevelEntry {
  /** Quantidade de dados a rolar */
  dice: number;
  /** Tamanho do dado */
  dieSize: import('@/types').DieSize;
  /** Fórmula legível (ex: "2d8") */
  formula: string;
}

/**
 * Tabela de níveis de Sorte (0-7)
 *
 * Sorte é uma habilidade especial com 7 níveis de progressão,
 * independente do nível do personagem. Cada nível determina
 * a quantidade e tipo de dados a rolar.
 *
 * @see v0.0.2 rules - Sorte
 */
export const LUCK_LEVELS: Record<number, LuckLevelEntry> = {
  0: { dice: 1, dieSize: 'd6', formula: '1d6' },
  1: { dice: 2, dieSize: 'd6', formula: '2d6' },
  2: { dice: 2, dieSize: 'd8', formula: '2d8' },
  3: { dice: 3, dieSize: 'd8', formula: '3d8' },
  4: { dice: 3, dieSize: 'd10', formula: '3d10' },
  5: { dice: 4, dieSize: 'd10', formula: '4d10' },
  6: { dice: 4, dieSize: 'd12', formula: '4d12' },
  7: { dice: 5, dieSize: 'd12', formula: '5d12' },
} as const;

/** Nível mínimo de Sorte */
export const MIN_LUCK_LEVEL = 0;

/** Nível máximo de Sorte */
export const MAX_LUCK_LEVEL = 7;

/**
 * Interface para resultado de aposta
 */
export interface BettingResultEntry {
  /** Quantidade de sucessos (✶) necessários */
  successes: number;
  /** Descrição curta do resultado */
  result: string;
  /** Multiplicador do valor apostado (negativo = perda) */
  multiplier: number;
}

/**
 * Tabela de resultados de apostas com Sorte
 *
 * Define o que acontece conforme a quantidade de sucessos (✶)
 * obtidos em um teste de Sorte ao apostar.
 *
 * @see v0.0.2 rules - Apostar
 */
export const LUCK_BETTING_TABLE: BettingResultEntry[] = [
  { successes: 0, result: 'Perde tudo', multiplier: -1 },
  { successes: 1, result: 'Perde metade', multiplier: -0.5 },
  { successes: 2, result: 'Não ganha nada', multiplier: 0 },
  { successes: 3, result: 'Ganha metade', multiplier: 0.5 },
  { successes: 4, result: 'Ganha a aposta', multiplier: 1 },
  { successes: 5, result: 'Ganha o dobro', multiplier: 2 },
  { successes: 6, result: 'Ganha o quíntuplo', multiplier: 5 },
];

/**
 * Interface para nível de local de aposta
 */
export interface BetPlaceLevelEntry {
  /** Nome do tipo de local */
  place: string;
  /** Multiplicador do local */
  placeMultiplier: number;
  /** Nome do nível de aposta */
  betLevel: string;
  /** Multiplicador da aposta */
  betMultiplier: number;
}

/**
 * Níveis de local e aposta
 *
 * O lugar onde se aposta e o nível da aposta afetam o
 * valor base. Ganhos fracionados: decimais = C$ ×10.
 * Uso requer 1d6 horas.
 *
 * @see v0.0.2 rules - Apostar
 */
export const LUCK_BET_PLACE_LEVELS: BetPlaceLevelEntry[] = [
  {
    place: 'Lugarejo',
    placeMultiplier: 0.5,
    betLevel: 'Aposta Baixa',
    betMultiplier: 0.5,
  },
  {
    place: 'Aldeia',
    placeMultiplier: 1,
    betLevel: 'Aposta Média',
    betMultiplier: 1,
  },
  {
    place: 'Vila',
    placeMultiplier: 5,
    betLevel: 'Aposta Alta',
    betMultiplier: 5,
  },
  {
    place: 'Cidade',
    placeMultiplier: 10,
    betLevel: 'Aposta Muito Alta',
    betMultiplier: 10,
  },
  {
    place: 'Metrópole',
    placeMultiplier: 20,
    betLevel: 'Aposta Aristocrata',
    betMultiplier: 20,
  },
];

/**
 * Re-exporta SKILL_LIST para conveniência
 */
export { SKILL_LIST };
