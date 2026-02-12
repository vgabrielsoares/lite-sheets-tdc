/**
 * Combat - Tipos relacionados a combate
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de combate,
 * incluindo Guarda/Vitalidade, dado de vulnerabilidade, economia de ações e ataques.
 *
 * Mudanças:
 * - HP único → Guarda (GA) + Vitalidade (PV) separados
 * - Defesa fixa → Teste de defesa ativo (removida interface Defense)
 * - Ação Maior/Menor → Turno Rápido (▶▶) ou Lento (▶▶▶)
 * - Dado de Vulnerabilidade (d20 → d4)
 */

import type { DiceRoll, DamageType, Resource, Modifier } from './common';
import type { SkillName } from './skills';
import type { AttributeName } from './attributes';

// ─── Guarda & Vitalidade ────────────────────────────────────

/**
 * Pontos de Guarda (GA) — primeira camada de proteção
 *
 * GA mede a capacidade de se defender e evitar ataques.
 * Receber dano na GA não significa ser ferido, mas ter as defesas desgastadas.
 * Base: 15 no nível 1 + bônus de arquétipo por nível.
 * Ícone: Escudo (ShieldIcon)
 */
export interface GuardPoints {
  /** GA atual */
  current: number;
  /** GA máximo (calculado: 15 + bônus de arquétipo por nível + modificadores) */
  max: number;
  /** GA temporária (absorvida primeiro; não conta para cálculo de PV) */
  temporary?: number;
  /** Modificadores adicionais ao GA máximo (habilidades especiais, itens, etc.) */
  maxModifiers?: Modifier[];
}

/**
 * Pontos de Vitalidade (PV) — saúde real do personagem
 *
 * PV = floor(GA_max / 3).
 * Quando PV = 0, o personagem sofre Ferimento Crítico.
 * Quando PV ≤ 1, GA máxima é reduzida à metade.
 * Ícone: Coração (FavoriteIcon)
 */
export interface VitalityPoints {
  /** PV atual */
  current: number;
  /** PV máximo (calculado: floor(GA_max / 3)) */
  max: number;
  /** Modificadores adicionais ao PV máximo (habilidades especiais, itens, etc.) */
  maxModifiers?: Modifier[];
}

/**
 * @deprecated Substituído por GuardPoints + VitalityPoints em.
 * Mantido para compatibilidade com dados salvos e migração.
 */
export interface HealthPoints extends Resource {
  current: number;
  max: number;
  temporary: number;
  maxModifiers?: Modifier[];
}

/**
 * Pontos de Poder (PP)
 */
export interface PowerPoints extends Resource {
  /** PP atual */
  current: number;
  /** PP máximo (calculado: 2 + arquétipos + modificadores) */
  max: number;
  /** PP temporário */
  temporary: number;
  /** Modificadores adicionais ao PP máximo (habilidades especiais, itens, etc.) */
  maxModifiers?: Modifier[];
}

// ─── Estado de Combate ───────────────────────────────────────────────

/**
 * Estado do personagem em combate
 */
export type CombatState =
  | 'normal'
  | 'ferimento-direto' // PV < PV_max mas PV > 0
  | 'ferimento-critico' // PV = 0
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
  /** Rodadas máximas antes da morte (2 + Corpo + modificadores) */
  maxRounds: number;
  /** Modificadores adicionais para rodadas máximas (de habilidades, itens, etc.) */
  otherModifiers?: number;
}

// ─── Dado de Vulnerabilidade ────────────────────────────────

/**
 * Tamanhos possíveis do dado de vulnerabilidade
 * Sequência: d20 → d12 → d10 → d8 → d6 → d4
 */
export type VulnerabilityDieSize = 'd20' | 'd12' | 'd10' | 'd8' | 'd6' | 'd4';

/**
 * Escala de dados de vulnerabilidade (do maior ao menor)
 */
export const VULNERABILITY_DIE_STEPS: readonly VulnerabilityDieSize[] = [
  'd20',
  'd12',
  'd10',
  'd8',
  'd6',
  'd4',
] as const;

/**
 * Estado do dado de vulnerabilidade de uma criatura
 *
 * Toda criatura começa com d20. A cada Ataque Crítico recebido:
 * - Rola o dado de vulnerabilidade
 * - Resultado = 1: Ferimento Crítico (PV → 0)
 * - Resultado ≥ 2: Dado diminui um passo (d20 → d12 → ... → d4)
 * Reseta para d20 ao fim do combate ou ao sofrer Ferimento Crítico.
 */
export interface VulnerabilityDie {
  /** Tamanho atual do dado de vulnerabilidade */
  currentDie: VulnerabilityDieSize;
  /** Se o dado está ativo (em combate) */
  isActive: boolean;
}

// ─── Economia de Ações ─────────────────────────────────────

/**
 * Tipo de turno escolhido em combate
 *
 * - Rápido: 2 ações (▶▶) — age primeiro
 * - Lento: 3 ações (▶▶▶) — age depois de inimigos rápidos
 */
export type TurnType = 'rapido' | 'lento';

/**
 * Economia de ações em combate
 *
 * O sistema Tabuleiro do Caos usa:
 * - Turno Rápido (▶▶) ou Turno Lento (▶▶▶)
 * - 1 Reação (↩) por rodada
 * - Ações Livres (∆) ilimitadas
 */
export interface ActionEconomy {
  /** Tipo de turno escolhido (Rápido ou Lento) */
  turnType: TurnType;
  /** Ações (▶) disponíveis — array de booleanos (2 para rápido, 3 para lento) */
  actions: boolean[];
  /** Reação (↩) disponível (1 por rodada) */
  reaction: boolean;
  /** Ações extras concedidas por habilidades especiais */
  extraActions?: ExtraAction[];
}

/**
 * Ação extra concedida por habilidade especial
 */
export interface ExtraAction {
  /** ID único da ação extra */
  id: string;
  /** Tipo da ação extra */
  type: 'acao' | 'reacao';
  /** Se a ação está disponível */
  available: boolean;
  /** Fonte da ação extra (nome da habilidade) */
  source: string;
}

/**
 * Tipos de ação em combate
 *
 * Ações são medidas em ▶ (1, 2 ou 3), ↩ (reação) ou ∆ (ação livre)
 */
export type ActionType =
  | 'acao' // ▶
  | 'acao-dupla' // ▶▶
  | 'acao-tripla' // ▶▶▶
  | 'reacao' // ↩
  | 'livre'; // ∆

/**
 * @deprecated Defesa fixa não existe mais em.
 * Defesa agora é um teste ativo com Reflexo ou Vigor.
 * Mantido para compatibilidade com dados salvos.
 */
export interface Defense {
  base: number;
  armorBonus: number;
  shieldBonus: number;
  maxAgilityBonus?: number;
  otherBonuses: Modifier[];
  total: number;
}

// ─── Ataques ─────────────────────────────────────────────────────────

/**
 * Tipo de ataque
 */
export type AttackType = 'corpo-a-corpo' | 'distancia' | 'magico';

/**
 * Tipo de resultado de ataque baseado em ✶ após defesa
 *
 * 0✶: Raspão — dano dos dados sem modificadores, dividido por 2 (mín 1)
 * 1✶: Normal — rolagem de dano padrão
 * 2✶: Em Cheio — dano maximizado (sem rolar)
 * 3+✶: Crítico — dano maximizado + dados de dano crítico extras
 */
export type AttackHitType = 'raspao' | 'normal' | 'em-cheio' | 'critico';

/** Labels para tipos de resultado de ataque */
export const ATTACK_HIT_TYPE_LABELS: Record<AttackHitType, string> = {
  raspao: 'Ataque de Raspão (0✶)',
  normal: 'Ataque Normal (1✶)',
  'em-cheio': 'Ataque em Cheio (2✶)',
  critico: 'Ataque Crítico (3+✶)',
};

/** Descrições curtas para tipos de resultado de ataque */
export const ATTACK_HIT_TYPE_DESCRIPTIONS: Record<AttackHitType, string> = {
  raspao: 'Dano dos dados ÷ 2 (sem modificadores, mín 1)',
  normal: 'Dano normal (dados + modificadores)',
  'em-cheio': 'Dano maximizado (sem rolar)',
  critico: 'Dano maximizado + dados de dano crítico',
};

/** Cores para tipos de resultado de ataque */
export const ATTACK_HIT_TYPE_COLORS: Record<
  AttackHitType,
  'default' | 'warning' | 'success' | 'error'
> = {
  raspao: 'default',
  normal: 'warning',
  'em-cheio': 'success',
  critico: 'error',
};

/**
 * Sugere o tipo de resultado de ataque baseado nos ✶ líquidos
 */
export function suggestHitType(netSuccesses: number): AttackHitType {
  if (netSuccesses <= 0) return 'raspao';
  if (netSuccesses === 1) return 'normal';
  if (netSuccesses === 2) return 'em-cheio';
  return 'critico'; // 3+
}

/**
 * Informações de um ataque
 *
 * No, ataques usam pool de dados com contagem de ✶.
 * O resultado é número de sucessos. Dano continua como soma de dados.
 */
export interface Attack {
  /** Nome do ataque */
  name: string;
  /** Tipo de ataque */
  type: AttackType;
  /** Habilidade usada para acertar (Luta para CaC, Acerto para distância) */
  attackSkill: SkillName;
  /** ID do uso de habilidade específico (opcional) */
  attackSkillUseId?: string;
  /** Atributo alternativo para o ataque (opcional) */
  attackAttribute?: AttributeName;
  /** Modificador de dados adicional (+Xd / -Xd) */
  attackDiceModifier?: number;
  /** Rolagem de dano (soma de dados — separado do sistema de ✶) */
  damageRoll: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Alcance do ataque */
  range?: string;
  /** Descrição do ataque */
  description?: string;
  /** Custo em PP (se aplicável) */
  ppCost?: number;
  /** Custo em ações (▶) */
  actionCost: number;
  /** Se adiciona o modificador de atributo ao dano (padrão: true) */
  addAttributeToDamage?: boolean;
  /** Se adiciona o dobro do atributo ao dano (padrão: false) */
  doubleAttributeDamage?: boolean;
  /** Se é um ataque padrão do sistema (como Ataque Desarmado) - não pode ser deletado */
  isDefaultAttack?: boolean;
  /**
   * Número de dados extras de dano crítico.
   * Usa o MESMO tipo de dado base (damageRoll.type).
   * Ex: criticalDice=1 com damageRoll 1d6 → +1d6 em Ataque Crítico (3+✶).
   * Default: 1 ("+1d" — mínimo obrigatório).
   */
  criticalDice?: number;
  /**
   * Dados de dano bônus (ex: dano elemental de encantamento).
   * Adicionados ao dano em Normal (1✶), Em Cheio (2✶) e Crítico (3+✶).
   * NÃO são aplicados em Raspão (0✶).
   */
  bonusDice?: DiceRoll;

  // ─── Campos deprecados (mantidos para compatibilidade) ────────────
  /** @deprecated Usar criticalDice. Mantido para migração de dados antigos. */
  criticalDamage?: DiceRoll;

  // ─── Campos deprecados (mantidos para compatibilidade) ────────────
  /** @deprecated Não existe mais defesa fixa para "acertar". Manter para migração. */
  attackBonus?: number;
  /** @deprecated Removido em. Manter para migração. */
  criticalRange?: number;
  /** @deprecated Usar actionCost. Manter para migração. */
  actionType?: string;
  /** @deprecated Removido em. */
  numberOfAttacks?: number;
}

/**
 * Resultado de um ataque
 * No novo sistema, resultado é número de ✶ (sucessos)
 */
export interface AttackResult {
  /** Número de ✶ (sucessos líquidos) */
  successes: number;
  /** Dano causado (rola dados de dano separadamente) */
  damage: number;
  /** Se foi acerto crítico (baseado em mecânica de vulnerabilidade, não mais margem) */
  critical: boolean;

  // Campos deprecados mantidos para compatibilidade
  /** @deprecated Usar successes */
  hit?: boolean;
  /** @deprecated Não existe mais */
  attackRoll?: number;
  /** @deprecated Não existe mais defesa fixa */
  targetDefense?: number;
}

/**
 * Limite de PP por rodada
 */
export interface PPLimit {
  /** Limite base (Nível + Essência) */
  base: number;
  /** Modificadores ao limite */
  modifiers: Modifier[];
  /** Limite total */
  total: number;
}

// ─── Testes de Resistência ───────────────────────────────────────────

/**
 * Tipos de teste de resistência
 *
 * | Habilidade    | Atributo  | Uso                                     |
 * |---------------|-----------|-----------------------------------------|
 * | Determinação  | Mente     | Efeitos mentais, força de vontade       |
 * | Reflexo       | Agilidade | Velocidade, equilíbrio ágil, reação     |
 * | Sintonia      | Essência  | Interferência energética, corrupção     |
 * | Tenacidade    | Corpo     | Força muscular, equilíbrio, resistência |
 * | Vigor         | Corpo     | Saúde, integridade física               |
 */
export type SavingThrowType =
  | 'determinacao' // Mente
  | 'reflexo' // Agilidade
  | 'sintonia' // Essência
  | 'tenacidade' // Corpo
  | 'vigor'; // Corpo

/**
 * Mapeamento de testes de resistência para seus atributos base
 */
export const SAVING_THROW_ATTRIBUTES: Record<SavingThrowType, AttributeName> = {
  determinacao: 'mente',
  reflexo: 'agilidade',
  sintonia: 'essencia',
  tenacidade: 'corpo',
  vigor: 'corpo',
} as const;

/**
 * Mapeamento de testes de resistência para nomes de habilidades
 */
export const SAVING_THROW_SKILLS: Record<SavingThrowType, SkillName> = {
  determinacao: 'determinacao',
  reflexo: 'reflexo',
  sintonia: 'sintonia',
  tenacidade: 'tenacidade',
  vigor: 'vigor',
} as const;

/**
 * Informações de teste de resistência
 */
export interface SavingThrow {
  /** Tipo de teste */
  type: SavingThrowType;
  /** Habilidade associada */
  skill: SkillName;
  /** Modificador de dados adicional (+Xd / -Xd) */
  diceModifier: number;

  /** @deprecated Usar diceModifier em */
  modifier?: number;
}

// ─── Resistências e Condições ────────────────────────────────────────

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
 * Categoria de condições
 */
export type ConditionCategory =
  | 'corporal'
  | 'mental'
  | 'sensorial'
  | 'espiritual';

/**
 * Condição aplicada ao personagem
 */
export interface Condition {
  /** Nome da condição */
  name: string;
  /** Descrição dos efeitos */
  description: string;
  /** Categoria da condição */
  category?: ConditionCategory;
  /** Duração em rodadas (null para permanente) */
  duration: number | null;
  /** Modificadores aplicados pela condição */
  modifiers: Modifier[];
  /** Fonte da condição */
  source?: string;
}

// ─── Compatibilidade ─────────────────────────────────────────────────

/**
 * @deprecated Iniciativa não existe mais como habilidade em.
 * Em, a ordem de turno é voluntária (Turno Rápido ou Turno Lento).
 * Mantido para compatibilidade com dados salvos.
 */
export interface Initiative {
  /** Modificador de iniciativa */
  modifier: number;
  /** Valor rolado de iniciativa no combate atual */
  currentRoll?: number;
}

/**
 * Estado das penalidades de combate
 * Rastreia penalidades em testes de resistência
 */
export interface CombatPenalties {
  /** @deprecated Defesa fixa não existe mais em */
  defensePenalty: number;
  /** Penalidades nos testes de resistência (-Xd por sucesso, rastreado por tipo) */
  savingThrowPenalties: Record<SavingThrowType, number>;
}

// ─── CombatData Principal ────────────────────────────────────────────

/**
 * Dados completos de combate do personagem
 */
export interface CombatData {
  /** Pontos de Guarda (GA) — proteção */
  guard: GuardPoints;
  /** Pontos de Vitalidade (PV) — saúde real */
  vitality: VitalityPoints;
  /** Pontos de Poder */
  pp: PowerPoints;
  /** Estado atual */
  state: CombatState;
  /** Informações do estado morrendo */
  dyingState: DyingState;
  /** Dado de vulnerabilidade */
  vulnerabilityDie: VulnerabilityDie;
  /** Economia de ações */
  actionEconomy: ActionEconomy;
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
  /** Penalidades de combate */
  penalties: CombatPenalties;

  // ─── Campos deprecados (mantidos para compatibilidade/migração) ───
  /** @deprecated Substituído por guard + vitality em */
  hp?: HealthPoints;
  /** @deprecated Defesa agora é teste ativo em */
  defense?: Defense;
  /** @deprecated Iniciativa não existe mais em */
  initiative?: Initiative;
}

// ─── Constantes ──────────────────────────────────────────────────────

/**
 * Guarda (GA) base no nível 1
 */
export const DEFAULT_GA_LEVEL_1 = 15;

/**
 * Pontos de Poder (PP) base no nível 1
 */
export const DEFAULT_PP_LEVEL_1 = 2;

/**
 * @deprecated Defesa não existe mais como valor fixo em. Usar teste de defesa ativo.
 */
export const BASE_DEFENSE = 15;

/**
 * @deprecated Substituído por DEFAULT_GA_LEVEL_1
 */
export const DEFAULT_HP_LEVEL_1 = 15;

/**
 * Rodadas base no estado morrendo
 */
export const BASE_DYING_ROUNDS = 2;

/**
 * Custo em pontos de recuperação para restaurar 1 PV
 */
export const PV_RECOVERY_COST = 5;
