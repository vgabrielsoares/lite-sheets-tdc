/**
 * Ações de Combate — Referência rápida
 *
 * Lista completa de ações de combate com custos em ações.
 * Símbolos: ▶ (ação), ↩ (reação), ∆ (ação livre)
 *
 * Baseado nas regras v0.1.7 do Tabuleiro do Caos RPG.
 */

/**
 * Tipo de custo da ação
 */
export type CombatActionCostType = 'acao' | 'reacao' | 'livre';

/**
 * Definição de uma ação de combate
 */
export interface CombatAction {
  /** Nome da ação */
  name: string;
  /** Tipo de custo (ação, reação, livre) */
  costType: CombatActionCostType;
  /** Quantidade de ações consumidas (ex: 1 = ▶, 2 = ▶▶) */
  costAmount: number;
  /** Se o custo pode variar (▶*) */
  variableCost: boolean;
  /** Descrição curta e resumida */
  description: string;
}

/**
 * Símbolo visual para cada tipo de custo
 */
export const COST_TYPE_SYMBOLS: Record<CombatActionCostType, string> = {
  acao: '▶',
  reacao: '↩',
  livre: '∆',
};

/**
 * Labels para tipos de custo
 */
export const COST_TYPE_LABELS: Record<CombatActionCostType, string> = {
  acao: 'Ação',
  reacao: 'Reação',
  livre: 'Ação Livre',
};

/**
 * Formata o custo de uma ação para exibição
 * Ex: ▶, ▶▶, ▶*, ↩, ∆, ∆*
 */
export function formatActionCost(action: CombatAction): string {
  const symbol = COST_TYPE_SYMBOLS[action.costType];
  const repeated = symbol.repeat(action.costAmount);
  return action.variableCost ? `${repeated}*` : repeated;
}

/**
 * Ações — custos em ▶
 */
export const ACTION_COMBAT_ACTIONS: CombatAction[] = [
  {
    name: 'Atacar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Realizar um ataque corpo a corpo ou à distância.',
  },
  {
    name: 'Erguer Defesa',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Preparar defesa,  ganhando bônus no próximo teste de defesa.',
  },
  {
    name: 'Manobras de Combate',
    costType: 'acao',
    costAmount: 1,
    variableCost: true,
    description:
      'Empurrar, derrubar, agarrar ou outras manobras. Custo pode variar.',
  },
  {
    name: 'Preparar Ação',
    costType: 'acao',
    costAmount: 1,
    variableCost: true,
    description:
      'Preparar uma ação para ser executada como reação a um gatilho.',
  },
  {
    name: 'Fintar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description:
      'Teste de Enganação contra Percepção para deixar alvo Desprevenido.',
  },
  {
    name: 'Andar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Mover-se até a sua velocidade de movimento.',
  },
  {
    name: 'Apontar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Apontar para uma criatura, auxiliando aliados contra ela.',
  },
  {
    name: 'Entrar em Cobertura',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description:
      'Usar cobertura disponível para ganhar proteção contra ataques.',
  },
  {
    name: 'Interagir com Objeto',
    costType: 'acao',
    costAmount: 1,
    variableCost: true,
    description:
      'Pegar, guardar, usar ou manipular um objeto. Custo pode variar.',
  },
  {
    name: 'Levantar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Levantar-se da condição Caído.',
  },
  {
    name: 'Mirar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description:
      'Mirar em um alvo para ganhar bônus no próximo ataque à distância.',
  },
  {
    name: 'Montar',
    costType: 'acao',
    costAmount: 1,
    variableCost: false,
    description: 'Montar ou desmontar de uma montaria.',
  },
  {
    name: 'Usar Habilidade',
    costType: 'acao',
    costAmount: 1,
    variableCost: true,
    description:
      'Usar uma habilidade ativa que requer ação. Custo pode variar.',
  },
];

/**
 * Reações — custos em ↩
 */
export const REACTION_COMBAT_ACTIONS: CombatAction[] = [
  {
    name: 'Ação Livre',
    costType: 'reacao',
    costAmount: 1,
    variableCost: false,
    description: 'Reação genérica ativada por um gatilho.',
  },
  {
    name: 'Voo Contra-Queda',
    costType: 'reacao',
    costAmount: 1,
    variableCost: false,
    description: 'Usar voo para evitar queda quando derrubado.',
  },
  {
    name: 'Suportar Resistências',
    costType: 'reacao',
    costAmount: 1,
    variableCost: false,
    description: 'Manter concentração ou resistir efeitos contínuos.',
  },
];

/**
 * Ações Livres — custos em ∆
 */
export const FREE_COMBAT_ACTIONS: CombatAction[] = [
  {
    name: 'Defender',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description:
      'Rolar teste de defesa ativo (Reflexo ou Vigor) ao ser atacado.',
  },
  {
    name: 'Resistir',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Rolar teste de resistência contra um efeito.',
  },
  {
    name: 'Cair',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Deixar-se cair voluntariamente (ficar Caído).',
  },
  {
    name: 'Estabilizar Voo',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Estabilizar o voo quando desestabilizado.',
  },
  {
    name: 'Falar',
    costType: 'livre',
    costAmount: 1,
    variableCost: true,
    description: 'Dizer algo breve. Frases longas podem custar mais.',
  },
  {
    name: 'Largar Item',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Soltar um item que está segurando.',
  },
  {
    name: 'Passo de Ajuste',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Mover-se 1 quadrado sem provocar ataques de oportunidade.',
  },
  {
    name: 'Segurar com Duas Mãos',
    costType: 'livre',
    costAmount: 1,
    variableCost: false,
    description: 'Mudar para empunhadura de duas mãos em uma arma.',
  },
];

/**
 * Todas as ações agrupadas por tipo
 */
export const COMBAT_ACTIONS = {
  acoes: ACTION_COMBAT_ACTIONS,
  reacoes: REACTION_COMBAT_ACTIONS,
  livres: FREE_COMBAT_ACTIONS,
} as const;

/**
 * Todas as ações em uma lista flat
 */
export const ALL_COMBAT_ACTIONS: CombatAction[] = [
  ...ACTION_COMBAT_ACTIONS,
  ...REACTION_COMBAT_ACTIONS,
  ...FREE_COMBAT_ACTIONS,
];
