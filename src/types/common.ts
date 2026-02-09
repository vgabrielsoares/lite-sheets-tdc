/**
 * Common Types - Tipos auxiliares e utilitários
 *
 * Este arquivo contém tipos e interfaces auxiliares utilizados em todo o sistema.
 */

/**
 * Identificador único universal
 */
export type UUID = string;

/**
 * Timestamp em ISO 8601 format
 */
export type Timestamp = string;

/**
 * Níveis de proficiência para habilidades
 * No sistema v0.0.2, o grau determina o tamanho do dado:
 * - Leigo: d6
 * - Adepto: d8
 * - Versado: d10
 * - Mestre: d12
 */
export type ProficiencyLevel = 'leigo' | 'adepto' | 'versado' | 'mestre';

/**
 * @deprecated Usar PROFICIENCY_DIE_MAP no lugar.
 * Mantido temporariamente para compatibilidade durante migração.
 * Mapeamento de níveis de proficiência para seus multiplicadores (sistema antigo d20).
 */
export const PROFICIENCY_MULTIPLIERS: Record<ProficiencyLevel, number> = {
  leigo: 0,
  adepto: 1,
  versado: 2,
  mestre: 3,
} as const;

/**
 * Tamanhos de dado de habilidade (determinados pelo grau de proficiência)
 * Usado no novo sistema de pool de dados com contagem de sucessos.
 */
export type DieSize = 'd6' | 'd8' | 'd10' | 'd12';

/**
 * Mapeamento de níveis de proficiência para tamanhos de dado
 * Leigo rola d6, Adepto d8, Versado d10, Mestre d12
 */
export const PROFICIENCY_DIE_MAP: Record<ProficiencyLevel, DieSize> = {
  leigo: 'd6',
  adepto: 'd8',
  versado: 'd10',
  mestre: 'd12',
} as const;

/**
 * Mapeamento de DieSize para número de lados
 */
export const DIE_SIZE_TO_SIDES: Record<DieSize, number> = {
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
} as const;

/**
 * Resultado individual de um dado na pool
 */
export interface DicePoolDie {
  /** Valor rolado no dado */
  value: number;
  /** Tamanho do dado usado (d6, d8, d10, d12) */
  dieSize: DieSize;
  /** Se este dado conta como sucesso (valor ≥ 6) */
  isSuccess: boolean;
  /** Se este dado cancela um sucesso (valor = 1) */
  isCancellation: boolean;
}

/**
 * Resultado de uma rolagem de pool de dados (sistema v0.0.2)
 *
 * Mecânica: Rola X dados do tamanho determinado pelo grau,
 * conta resultados ≥ 6 como sucessos (✶),
 * resultados = 1 cancelam 1 sucesso cada.
 * Mínimo de 0✶.
 */
export interface DicePoolResult {
  /** Fórmula da rolagem (ex: "3d8") */
  formula: string;
  /** Dados individuais com detalhes */
  dice: DicePoolDie[];
  /** Valores brutos rolados (para compatibilidade) */
  rolls: number[];
  /** Tamanho do dado usado */
  dieSize: DieSize;
  /** Quantidade de dados rolados */
  diceCount: number;
  /** Quantidade de sucessos brutos (resultados ≥ 6) */
  successes: number;
  /** Quantidade de cancelamentos (resultados = 1) */
  cancellations: number;
  /** Sucessos líquidos: max(0, successes - cancellations) */
  netSuccesses: number;
  /** Timestamp da rolagem */
  timestamp: Date;
  /** Descrição do contexto da rolagem */
  context?: string;
  /** Se a rolagem usou a regra de atributo 0 / penalidade extrema (2d, menor) */
  isPenaltyRoll: boolean;
  /** Bônus/penalidade em dados aplicados (+Xd / -Xd) */
  diceModifier: number;
}

/**
 * Tipos de deslocamento disponíveis
 */
export type MovementType =
  | 'andando'
  | 'voando'
  | 'escalando'
  | 'escavando'
  | 'nadando';

/**
 * Tipos de sentidos aguçados
 */
export type SenseType = 'visao' | 'olfato' | 'audicao';

/**
 * Sentido aguçado com bônus variável
 * Permite múltiplos sentidos com diferentes níveis de aprimoramento
 */
export interface KeenSense {
  /** Tipo do sentido aguçado */
  type: SenseType;
  /** Bônus concedido (+2 a +10) */
  bonus: number;
  /** Descrição opcional do sentido */
  description?: string;
}

/**
 * Tipos de visão
 */
export type VisionType = 'normal' | 'penumbra' | 'escuro';

/**
 * Tamanhos de criaturas no sistema
 * Tamanhos maiores (Enorme e Colossal) possuem subníveis (1, 2, 3)
 */
export type CreatureSize =
  | 'minusculo'
  | 'pequeno'
  | 'medio'
  | 'grande'
  | 'enorme-1'
  | 'enorme-2'
  | 'enorme-3'
  | 'colossal-1'
  | 'colossal-2'
  | 'colossal-3';

/**
 * Tipos de dados disponíveis
 */
export type DiceType =
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd6'
  | 'd8'
  | 'd10'
  | 'd12'
  | 'd20'
  | 'd100';

/**
 * Representação de uma rolagem de dados
 */
export interface DiceRoll {
  /** Quantidade de dados a rolar */
  quantity: number;
  /** Tipo de dado (d4, d6, d8, d10, d12, d20, d100) */
  type: DiceType;
  /** Modificador fixo a adicionar */
  modifier: number;
}

/**
 * Resultado de uma rolagem de dados
 */
export interface DiceRollResult {
  /** Valores individuais de cada dado rolado */
  rolls: number[];
  /** Modificador aplicado */
  modifier: number;
  /** Total da rolagem (soma dos dados + modificador) */
  total: number;
  /** Descrição da rolagem (ex: "2d20+4") */
  formula: string;
}

/**
 * Tipos de moeda do sistema
 */
export type CurrencyType = 'cobre' | 'ouro' | 'platina';

/**
 * Símbolos das moedas
 */
export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  cobre: 'C$',
  ouro: 'PO$',
  platina: 'PP$',
} as const;

/**
 * Taxas de conversão de moedas (baseado em Cobre como unidade base)
 */
export const CURRENCY_CONVERSION: Record<CurrencyType, number> = {
  cobre: 1,
  ouro: 100,
  platina: 100000,
} as const;

/**
 * Tipos de dano no sistema Tabuleiro do Caos RPG
 */
export type DamageType =
  | 'acido'
  | 'eletrico'
  | 'fisico'
  | 'corte'
  | 'perfuracao'
  | 'impacto'
  | 'fogo'
  | 'frio'
  | 'interno'
  | 'mental'
  | 'mistico'
  | 'profano'
  | 'sagrado'
  | 'sonoro'
  | 'veneno';

/**
 * Resistência a tipos de dano
 */
export interface DamageResistance {
  /** Tipo de dano */
  type: DamageType;
  /** Se é resistência (divide dano por 2) ou imunidade (anula dano) */
  level: 'resistencia' | 'imunidade';
}

/**
 * Vulnerabilidade a tipos de dano
 */
export interface DamageVulnerability {
  /** Tipo de dano */
  type: DamageType;
}

/**
 * Tipos de alcance
 */
export type RangeType =
  | 'pessoal'
  | 'toque'
  | 'curto'
  | 'medio'
  | 'longo'
  | 'muito longo'
  | 'ilimitado';

/**
 * Duração de efeitos
 */
export interface Duration {
  /** Quantidade de tempo */
  value: number;
  /** Unidade de tempo */
  unit: 'turno' | 'rodada' | 'minuto' | 'hora' | 'dia' | 'permanente';
}

/**
 * Estado de carga do personagem baseado no peso carregado
 */
export type EncumbranceState = 'normal' | 'sobrecarregado' | 'imobilizado';

/**
 * Nível de dificuldade de testes
 */
export type DifficultyLevel =
  | 'trivial' // ND 5
  | 'facil' // ND 10
  | 'medio' // ND 15
  | 'dificil' // ND 20
  | 'arduosa' // ND 25
  | 'epica' // ND 30
  | 'lendaria' // ND 40
  | 'divino'; // ND 50

/**
 * Mapeamento de níveis de dificuldade para valores de ND
 */
export const DIFFICULTY_VALUES: Record<DifficultyLevel, number> = {
  trivial: 5,
  facil: 10,
  medio: 15,
  dificil: 20,
  arduosa: 25,
  epica: 30,
  lendaria: 40,
  divino: 50,
} as const;

/**
 * Interface base para entidades com ID e timestamps
 */
export interface BaseEntity {
  /** Identificador único */
  id: UUID;
  /** Data de criação */
  createdAt: Timestamp;
  /** Data da última atualização */
  updatedAt: Timestamp;
}

/**
 * Modificador genérico aplicável a testes
 */
export interface Modifier {
  /** Nome/descrição do modificador */
  name: string;
  /** Valor do modificador (positivo ou negativo) */
  value: number;
  /** Tipo de modificador */
  type: 'bonus' | 'penalidade';
  /** Se afeta dados (adiciona/remove d20s) ou valor fixo */
  affectsDice?: boolean;
}

/**
 * Recurso com valores atual, máximo e temporário
 */
export interface Resource {
  /** Valor atual */
  current: number;
  /** Valor máximo */
  max: number;
  /** Valor temporário (bônus temporário) */
  temporary: number;
}

/**
 * Nota/anotação do personagem
 */
export interface Note extends BaseEntity {
  /** Título da anotação */
  title: string;
  /** Conteúdo da anotação */
  content: string;
  /** Tags para organização */
  tags: string[];
  /** Categoria da anotação */
  category?: string;
  /** Indica se a nota está fixada no topo */
  pinned: boolean;
}
