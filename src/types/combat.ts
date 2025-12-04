/**
 * Combat - Tipos relacionados a combate
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de combate,
 * incluindo ataques, defesa, iniciativa e economia de ações.
 */

import type { DiceRoll, DamageType, Resource, Modifier } from './common';
import type { SkillName } from './skills';

/**
 * Pontos de Vida (PV)
 */
export interface HealthPoints extends Resource {
  /** PV atual */
  current: number;
  /** PV máximo */
  max: number;
  /** PV temporário */
  temporary: number;
}

/**
 * Pontos de Poder (PP)
 */
export interface PowerPoints extends Resource {
  /** PP atual */
  current: number;
  /** PP máximo */
  max: number;
  /** PP temporário */
  temporary: number;
}

/**
 * Estado do personagem em combate
 */
export type CombatState =
  | 'normal'
  | 'morrendo'
  | 'morto'
  | 'inconsciente'
  | 'estabilizado';

/**
 * Informações sobre o estado "morrendo"
 */
export interface DyingState {
  /** Se o personagem está morrendo */
  isDying: boolean;
  /** Rodadas atuais no estado morrendo */
  currentRounds: number;
  /** Rodadas máximas antes da morte (2 + Constituição + modificadores) */
  maxRounds: number;
}

/**
 * Economia de ações em combate
 *
 * O sistema Tabuleiro do Caos usa:
 * - 1 Ação Maior por turno
 * - 2 Ações Menores por turno
 * - 1 Reação por rodada
 * - 1 Reação Defensiva por rodada
 * - Ações Livres ilimitadas
 */
export interface ActionEconomy {
  /** Ação Maior disponível (1 por turno) */
  majorAction: boolean;
  /** Primeira Ação Menor disponível (2 por turno) */
  minorAction1: boolean;
  /** Segunda Ação Menor disponível (2 por turno) */
  minorAction2: boolean;
  /** Reação disponível (1 por rodada) */
  reaction: boolean;
  /** Reação Defensiva disponível (1 por rodada) */
  defensiveReaction: boolean;
  /** Ações Livres são sempre infinitas - não precisa rastrear */
}

/**
 * Tipos de ação em combate
 */
export type ActionType =
  | 'maior'
  | 'menor'
  | 'livre'
  | 'reacao'
  | 'reacao-defensiva';

/**
 * Defesa do personagem
 */
export interface Defense {
  /** Valor base da defesa (15 + Agilidade) */
  base: number;
  /** Bônus de armadura */
  armorBonus: number;
  /** Bônus de escudo */
  shieldBonus: number;
  /** Limite máximo de bônus de Agilidade permitido pela armadura (undefined = sem limite) */
  maxAgilityBonus?: number;
  /** Outros bônus */
  otherBonuses: Modifier[];
  /** Defesa total */
  total: number;
}

/**
 * Tipo de ataque
 */
export type AttackType = 'corpo-a-corpo' | 'distancia' | 'magico';

/**
 * Informações de um ataque
 */
export interface Attack {
  /** Nome do ataque */
  name: string;
  /** Tipo de ataque */
  type: AttackType;
  /** Habilidade usada para acertar */
  attackSkill: SkillName;
  /** Bônus de ataque adicional */
  attackBonus: number;
  /** Rolagem de dano */
  damageRoll: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Alcance do ataque */
  range?: string;
  /** Descrição do ataque */
  description?: string;
  /** Custo em PP (se aplicável) */
  ppCost?: number;
  /** Tipo de ação necessária */
  actionType: ActionType;
}

/**
 * Resultado de um ataque
 */
export interface AttackResult {
  /** Se o ataque acertou */
  hit: boolean;
  /** Rolagem de ataque */
  attackRoll: number;
  /** Defesa do alvo */
  targetDefense: number;
  /** Dano causado (0 se errou) */
  damage: number;
  /** Se foi acerto crítico */
  critical: boolean;
}

/**
 * Limite de PP por rodada
 */
export interface PPLimit {
  /** Limite base (Nível + Presença) */
  base: number;
  /** Modificadores ao limite */
  modifiers: Modifier[];
  /** Limite total */
  total: number;
}

/**
 * Tipos de teste de resistência
 */
export type SavingThrowType =
  | 'determinacao' // Mente
  | 'reflexo' // Agilidade
  | 'tenacidade' // Força
  | 'vigor'; // Constituição

/**
 * Informações de teste de resistência
 */
export interface SavingThrow {
  /** Tipo de teste */
  type: SavingThrowType;
  /** Habilidade associada */
  skill: SkillName;
  /** Modificador total */
  modifier: number;
}

/**
 * Resistências do personagem
 */
export interface Resistances {
  /** Reduções de Dano (RD) - reduz dano recebido por valor fixo */
  damageReduction: DamageReductionEntry[];
  /** Resistências Aprimoradas a tipos de dano - divide dano por 2 */
  damageResistances: DamageType[];
  /** Imunidades a tipos de dano - anula todo o dano */
  damageImmunities: DamageType[];
  /** Vulnerabilidades a tipos de dano - dobra o dano */
  damageVulnerabilities: DamageType[];
  /** Imunidades a condições */
  conditionImmunities: string[];
}

/**
 * Entrada de Redução de Dano (RD)
 * Ex: RD 5 Fogo (reduz 5 pontos de dano de fogo)
 */
export interface DamageReductionEntry {
  /** Tipo de dano que é reduzido */
  type: DamageType;
  /** Valor da redução */
  value: number;
  /** Fonte da RD (opcional) */
  source?: string;
}

/**
 * Condição aplicada ao personagem
 */
export interface Condition {
  /** Nome da condição */
  name: string;
  /** Descrição dos efeitos */
  description: string;
  /** Duração em rodadas (null para permanente) */
  duration: number | null;
  /** Modificadores aplicados pela condição */
  modifiers: Modifier[];
  /** Fonte da condição */
  source?: string;
}

/**
 * Informações de iniciativa
 */
export interface Initiative {
  /** Modificador de iniciativa */
  modifier: number;
  /** Valor rolado de iniciativa no combate atual */
  currentRoll?: number;
}

/**
 * Dados completos de combate do personagem
 */
export interface CombatData {
  /** Pontos de Vida */
  hp: HealthPoints;
  /** Pontos de Poder */
  pp: PowerPoints;
  /** Estado atual */
  state: CombatState;
  /** Informações do estado morrendo */
  dyingState: DyingState;
  /** Economia de ações */
  actionEconomy: ActionEconomy;
  /** Defesa */
  defense: Defense;
  /** Limite de PP por rodada */
  ppLimit: PPLimit;
  /** Ataques disponíveis */
  attacks: Attack[];
  /** Testes de resistência */
  savingThrows: SavingThrow[];
  /** Resistências */
  resistances: Resistances;
  /** Condições ativas */
  conditions: Condition[];
  /** Iniciativa */
  initiative: Initiative;
}

/**
 * Valores padrão de PV e PP no nível 1
 */
export const DEFAULT_HP_LEVEL_1 = 15;
export const DEFAULT_PP_LEVEL_1 = 2;

/**
 * Valor base de defesa
 */
export const BASE_DEFENSE = 15;

/**
 * Rodadas base no estado morrendo
 */
export const BASE_DYING_ROUNDS = 2;
